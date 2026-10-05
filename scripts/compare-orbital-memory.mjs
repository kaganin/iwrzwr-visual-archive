// Compare the preserved local video reference with the code composition.
import fs from 'node:fs/promises';
import path from 'node:path';
const output=process.env.QA_REFERENCE_OUTPUT || '/tmp/iwrzwr-orbital-reference.png';
const url=process.env.COMPOSITION_URL || 'http://127.0.0.1:8765/studies/orbital-memory.html';
const tab=await fetch('http://127.0.0.1:9224/json/new?'+encodeURIComponent(url),{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map();let next=0;
socket.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
await call('Runtime.enable');await new Promise(r=>setTimeout(r,800));
const video='data:video/mp4;base64,'+(await fs.readFile('sources/echo-orbit-parity.mp4')).toString('base64');
await evaluate(`(async()=>{window.__ref=document.createElement('video');__ref.muted=true;__ref.src=${JSON.stringify(video)};await new Promise((resolve,reject)=>{__ref.onloadedmetadata=resolve;__ref.onerror=reject;});return {width:__ref.videoWidth,height:__ref.videoHeight,duration:__ref.duration};})()`);
const result=await evaluate(`(async()=>{const root=document.getElementById('orbital-memory'),code=root.querySelector('canvas'),sheet=document.createElement('canvas');sheet.width=1120;sheet.height=1180;const ctx=sheet.getContext('2d');ctx.fillStyle='#111';ctx.fillRect(0,0,1120,1180);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText('video reference',20,30);ctx.fillText('live code',580,30);for(const [i,t] of [1.72,5,10].entries()){await new Promise(resolve=>{__ref.onseeked=resolve;__ref.currentTime=t;});root.compositionPreview.renderAt(t);ctx.drawImage(__ref,20,45+i*375,520,360);ctx.drawImage(code,580,45+i*375,520,360);}return {png:sheet.toDataURL(),width:__ref.videoWidth,height:__ref.videoHeight,duration:__ref.duration};})()`);
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,Buffer.from(result.png.split(',')[1],'base64'));
console.log(JSON.stringify({output,width:result.width,height:result.height,duration:result.duration}));
socket.close();await fetch('http://127.0.0.1:9224/json/close/'+tab.id);
