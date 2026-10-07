// Real browser clicks verify both sound controls share the same audio session.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.env.GALLERY_URL||'http://127.0.0.1:8765/';
const output=process.env.HEADER_QA_OUTPUT||'/tmp/iwrzwr-sound-fixes-qa-20261006/header-controls';
await fs.mkdir(output,{recursive:true});
const tab=await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),errors=[];
let next=0;
socket.addEventListener('message',event=>{
 const d=JSON.parse(event.data);
 if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}
 if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);
 if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(x=>x.description||x.value));
});
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function click(selector){
 const point=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
 await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
}
const results=[];
try{
 await call('Runtime.enable');await call('Page.enable');
 for(const [width,reduced] of [[1280,false],[390,false],[320,false],[390,true]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<620});
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
  await call('Page.navigate',{url});await call('Page.bringToFront');await wait(900);
  assert(await evaluate(`!!window.iwrSoundEngine`),'engine loaded');
  assert(await evaluate(`document.querySelector('body>header').inert`),'hidden header is initially inert');
  await evaluate(`scrollTo(0,2000)`);await wait(500);
  const layout=await evaluate(`(()=>{const h=document.querySelector('body>header'),b=h.querySelector('.header-sound'),a=h.querySelector('.header-repo'),r=b.getBoundingClientRect(),q=a.getBoundingClientRect();b.focus();return {visible:h.hasAttribute('data-visible'),inert:h.inert,overflow:document.documentElement.scrollWidth>innerWidth,buttonInside:r.x>=0&&r.right<=innerWidth&&r.y>=0,repoInside:q.x>=0&&q.right<=innerWidth,focused:document.activeElement===b,labels:[...document.querySelectorAll('[data-sound-toggle]')].map(x=>x.textContent),buttonHeight:r.height};})()`);
  assert(layout.visible&&!layout.inert&&layout.focused,'scrolling header button is accessible');
  assert(!layout.overflow&&layout.buttonInside&&layout.repoInside,'header fits the viewport');
  assert.deepEqual(layout.labels,['play sound','play sound']);
  await click('.header-sound');await wait(700);
  const playing=await evaluate(`({active:iwrSignal.active,time:iwrSignal.songTime,labels:[...document.querySelectorAll('[data-sound-toggle]')].map(x=>({text:x.textContent,pressed:x.getAttribute('aria-pressed')}))})`);
  assert(playing.active&&playing.time>0,'trusted header click starts real audio');
  assert(playing.labels.every(x=>x.text==='stop sound'&&x.pressed==='true'),'both buttons show the same active state');
  const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await fs.writeFile(`${output}/${width}-${reduced?'reduced':'normal'}.png`,Buffer.from(screenshot.data,'base64'));
  await click('.header-sound');await wait(100);
  assert(await evaluate(`!iwrSignal.active&&[...document.querySelectorAll('[data-sound-toggle]')].every(x=>x.textContent==='play sound'&&x.getAttribute('aria-pressed')==='false')`),'header click stops sound and resets both buttons');
  await evaluate(`scrollTo(0,0)`);await wait(400);
  assert(await evaluate(`document.querySelector('body>header').inert`),'header becomes inert again above the scroll threshold');
  await click('.archive-intro .sound-toggle');await wait(250);
  assert(await evaluate(`iwrSignal.active&&document.querySelector('.header-sound').textContent==='stop sound'`),'intro click also updates header');
  await click('.archive-intro .sound-toggle');
  results.push({width,reduced,layout,headerPlayStop:'pass',introSync:'pass'});
 }
 assert.equal(errors.length,0,'no browser errors');
 await fs.writeFile(`${output}/results.json`,JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({results,errors,status:'pass',output}));
}finally{socket.close();await fetch('http://127.0.0.1:9224/json/close/'+tab.id);}
