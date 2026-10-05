// Browser QA without npm dependencies. Start Chrome with --remote-debugging-port=9224.
import fs from 'node:fs/promises';
import path from 'node:path';
const url=process.env.GALLERY_URL || 'http://127.0.0.1:8765/';
const output=process.env.QA_OUTPUT || '/tmp/iwrzwr-gallery-qa-20261005/results';
await fs.mkdir(output,{recursive:true});
const tabs=await fetch('http://127.0.0.1:9224/json').then(r=>r.json());
const tab=tabs.find(t=>t.type==='page');
if(!tab)throw Error('No Chrome page on port 9224');
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),errors=[];
let next=0;
socket.addEventListener('message',event=>{
 const data=JSON.parse(event.data);
 if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(Error(JSON.stringify(data.error))):p.resolve(data.result);}
 if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);
 if(data.method==='Runtime.consoleAPICalled'&&data.params.type==='error')errors.push(data.params.args.map(a=>a.description||a.value).join(' '));
 if(data.method==='Network.loadingFailed'&&!data.params.canceled)errors.push(data.params);
});
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+': '+r.exceptionDetails.exception?.description);return r.result.value;}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
await call('Network.setCacheDisabled',{cacheDisabled:true});
const results=[];
const indices=process.env.QA_INDICES?.split(',').map(Number)||Array.from({length:155},(_,i)=>i);
const delays=(process.env.QA_FRAME_DELAYS||'200,500,500').split(',').map(Number);
for(const [label,width,height] of [['desktop',1280,900],['mobile',390,844]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:label==='mobile'});
 await call('Page.navigate',{url});await wait(1200);
 const baseline=await evaluate(`({title:document.title,cards:document.querySelectorAll('.animation-card').length,iframes:document.querySelectorAll('iframe').length,videos:document.querySelectorAll('video').length,header:document.querySelector('header')?.innerText,overflow:document.documentElement.scrollWidth>innerWidth})`);
 console.log(label,JSON.stringify(baseline));
 if(baseline.cards!==155||baseline.iframes||baseline.videos||baseline.overflow)throw Error('Gallery structure failed: '+JSON.stringify(baseline));
 await evaluate('window.__qaShots=[]');
 for(const index of indices){
  await evaluate(`document.querySelectorAll('.animation-card')[${index}].scrollIntoView({block:'center'})`);
  let ready=false;
  for(let attempt=0;attempt<100;attempt++){
   ready=await evaluate(`document.querySelectorAll('.animation-card')[${index}].dataset.ready==='true'`);
   if(ready)break;await wait(100);
  }
  if(!ready)throw Error('Card did not mount: '+index);
  const frames=[];
  for(let frame=0;frame<6;frame++){
   if(frame===3&&new Set(frames.map(f=>f.hash)).size>1&&frames.some(f=>f.ink>0))break;
   await wait(delays[frame]||1500);
   frames.push(await evaluate(`(()=>{const host=document.querySelectorAll('.animation-card')[${index}],canvas=host.shadowRoot.querySelector('.direct-surface canvas,.composition-square canvas');if(!canvas)return {error:'Missing visible canvas'};const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let ink=0,hash=2166136261;for(let i=0;i<pixels.length;i+=4){if(pixels[i]+pixels[i+1]+pixels[i+2]>0)ink++;for(let channel=0;channel<4;channel++)hash=Math.imul(hash^pixels[i+channel],16777619);}const png=canvas.toDataURL();window.__qaShots[${index}]=window.__qaShots[${index}]||{name:host.getAttribute('aria-label'),frames:[]};window.__qaShots[${index}].frames.push(png);return {name:host.getAttribute('aria-label'),series:host.dataset.series,item:host.dataset.item,width:canvas.width,height:canvas.height,ink,hash:hash>>>0};})()`));
  }
  await evaluate(`(()=>{const f=window.__qaShots[${index}].frames;window.__qaShots[${index}].frames=[f[0],f[Math.floor(f.length/2)],f[f.length-1]];})()`);
  const result={viewport:label,index,...frames[0],animated:new Set(frames.map(f=>f.hash)).size>1,visible:frames.some(f=>f.ink>0),frames:frames.map(({hash,ink})=>({hash,ink}))};results.push(result);
  if(!result.animated||!result.ink||result.error)console.log('CHECK',JSON.stringify(result));
  if((index+1)%20===0||index===154)console.log(`${label}: ${index+1}/155 sampled`);
 }
 // A focused retest keeps an inspectable frame for each requested card.
 if(indices.length!==155)for(const index of indices){
  const png=await evaluate(`window.__qaShots[${index}].frames[1]`);
  await fs.writeFile(path.join(output,`${label}-${index+1}.png`),Buffer.from(png.split(',')[1],'base64'));
 }
 // Three actual frames for every card: contact sheets for human visual review.
 for(let start=0;start<155;start+=20){
  if(indices.length!==155)continue;
  const end=Math.min(start+20,155),isLast=start===140;
  const png=await evaluate(`(async()=>{const shots=window.__qaShots.slice(${start},${end}),sheet=document.createElement('canvas');sheet.width=1160;sheet.height=shots.reduce((h,s,i)=>h+(${start}+i>=152?260:100),0);const ctx=sheet.getContext('2d');ctx.fillStyle='#080808';ctx.fillRect(0,0,sheet.width,sheet.height);let y=0;for(let i=0;i<shots.length;i++){const s=shots[i],images=await Promise.all(s.frames.map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.src=src;})));const square=images[0].width===images[0].height,row=square?260:100;ctx.fillStyle='#eee';ctx.font='15px sans-serif';ctx.fillText(String(${start}+i+1).padStart(3,'0')+' · '+s.name,12,y+22);images.forEach((img,j)=>{const h=square?220:50;ctx.drawImage(img,12+j*382,y+32,360,h)});y+=row;}return sheet.toDataURL();})()`);
  await fs.writeFile(path.join(output,`${label}-${start+1}-${end}.png`),Buffer.from(png.split(',')[1],'base64'));
 }
 await evaluate('scrollTo(0,0)');await wait(400);
 await fs.writeFile(path.join(output,`${label}-page.png`),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
}
await fs.writeFile(path.join(output,'results.json'),JSON.stringify({url,results,errors},null,2));
console.log(JSON.stringify({samples:results.length,animated:results.filter(r=>r.animated).length,blank:results.filter(r=>!r.visible).length,errors,output}));
socket.close();
if(errors.length||results.some(r=>!r.animated||!r.visible))process.exitCode=1;
