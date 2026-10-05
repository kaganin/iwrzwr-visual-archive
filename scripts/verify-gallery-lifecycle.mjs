// Exercise the gallery adapter in a separate Chrome debugging tab.
import assert from 'node:assert/strict';
const url=process.env.GALLERY_URL || 'http://127.0.0.1:8765/';
const tab=await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),errors=[];
let next=0;
socket.addEventListener('message',event=>{
 const d=JSON.parse(event.data);
 if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}
 if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);
});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 await call('Runtime.enable');await call('Page.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url});await wait(1000);
 await evaluate(`window.__card=document.querySelector('[data-series="sound-motion-four-series"][data-item="0"]');__card.scrollIntoView({block:'center'});`);
 for(let i=0;i<100;i++){if(await evaluate(`__card.dataset.ready==='true'`))break;await wait(100);}
 await wait(500);
 const desktop=await evaluate(`(()=>{window.__art=__card.shadowRoot.querySelector('.direct-surface canvas');window.__counts=new Map();const proto=CanvasRenderingContext2D.prototype,original=proto.clearRect;proto.clearRect=function(...args){__counts.set(this.canvas,(__counts.get(this.canvas)||0)+1);return original.apply(this,args)};return {width:__art.width,cssWidth:__art.getBoundingClientRect().width};})()`);
 await wait(600);
 const activity=await evaluate(`({selected:__counts.get(__art)||0,hidden:[...__counts].filter(([c])=>c!==__art&&__card.shadowRoot.contains(c)).reduce((n,[c,count])=>n+count,0)})`);
 assert(activity.selected>0,'selected study must draw');assert.equal(activity.hidden,0,'hidden sibling studies must not draw');
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(600);
 const mobile=await evaluate(`({width:__art.width,cssWidth:__art.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth})`);
 assert(mobile.width<desktop.width,'canvas must resize without navigation');assert(Math.abs(mobile.width-mobile.cssWidth)<1,'canvas backing width must match new layout');assert(!mobile.overflow,'no horizontal overflow');
 await evaluate(`scrollTo(0,0)`);await wait(400);await evaluate(`__counts.clear()`);await wait(600);
 const stopped=await evaluate(`__counts.get(__art)||0`);assert.equal(stopped,0,'offscreen study must stop drawing');
 await evaluate(`__card.scrollIntoView({block:'center'});__counts.clear()`);await wait(600);
 const resumed=await evaluate(`__counts.get(__art)||0`);assert(resumed>0,'returning study must resume');
 assert.equal(errors.length,0,'browser runtime errors');
 console.log(JSON.stringify({url,desktop,mobile,activity,offscreenDraws:stopped,resumedDraws:resumed,errors,status:'pass'}));
}finally{socket.close();await fetch('http://127.0.0.1:9224/json/close/'+tab.id);}
