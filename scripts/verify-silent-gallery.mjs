// The public gallery has no playback control; retained audio experiments stay off.
import assert from 'node:assert/strict';
const tab=await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),errors=[];
let next=0;
socket.addEventListener('message',event=>{const d=JSON.parse(event.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);});
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const results=[];
try{
 await call('Runtime.enable');await call('Page.enable');
 for(const width of [1280,390]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<620});
  await call('Page.navigate',{url:process.env.GALLERY_URL||'http://127.0.0.1:8765/'});await call('Page.bringToFront');await wait(700);
  assert(await evaluate(`document.querySelectorAll('[data-sound-toggle],.sound-dock').length===0`),'no audio controls');
  assert(await evaluate(`![...document.scripts].some(s=>s.src.includes('sound-controls.js'))`),'no playback UI script');
  await evaluate(`document.querySelector('[data-series="sound-machines"][data-item="0"]').scrollIntoView({block:'center'})`);
  for(let i=0;i<70;i++){if(await evaluate(`document.querySelector('[data-series="sound-machines"][data-item="0"]').dataset.ready==='true'`))break;await wait(100);}
  await wait(400);
  const read=()=>evaluate(`(()=>{const h=document.querySelector('[data-series="sound-machines"][data-item="0"]');return h.shadowRoot.querySelector('.direct-surface canvas').toDataURL();})()`);
  const first=await read();await wait(600);const second=await read();
  assert.notEqual(first,second,'silent simulation keeps animating');
  const state=await evaluate(`({active:iwrSignal.active,source:iwrSignal.source,headerVisible:document.querySelector('body>header').hasAttribute('data-visible'),repoVisible:document.querySelector('.header-repo').getBoundingClientRect().top>=0,overflow:document.documentElement.scrollWidth>innerWidth,buttonCount:document.querySelectorAll('[data-sound-toggle]').length})`);
  assert(!state.active&&state.source==='off','audio stays off');
  assert(state.headerVisible&&state.repoVisible&&!state.overflow,'scrolling repository header remains usable');
  results.push({width,...state,animation:'pass'});
 }
 assert.equal(errors.length,0);console.log(JSON.stringify({results,errors,status:'pass'}));
}finally{socket.close();await fetch('http://127.0.0.1:9224/json/close/'+tab.id);}
