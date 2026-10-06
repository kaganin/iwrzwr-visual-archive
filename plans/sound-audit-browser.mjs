// Read-only browser audit. Source files and deployments are not changed.
import fs from 'node:fs/promises';
import path from 'node:path';
const out=process.env.AUDIT_OUTPUT||'/tmp/iwrzwr-sound-audit-20261006';
await fs.mkdir(out,{recursive:true});
const tab=await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),errors=[];
let next=0;
socket.addEventListener('message',event=>{const d=JSON.parse(event.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(a=>a.description||a.value).join(' '));});
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
async function ev(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Page.enable');await call('Page.bringToFront');
const init=`window.__audit={shots:{},frames:0};let last=0;const track=t=>{if(last)window.__audit.frames++;last=t;requestAnimationFrame(track)};requestAnimationFrame(track);`;
await call('Page.addScriptToEvaluateOnNewDocument',{source:init});
const results=[];
const viewports=process.env.AUDIT_VIEWPORTS?.split(',')||['desktop','mobile'];
for(const viewport of viewports){
 const width=viewport==='desktop'?1280:390;
 await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:viewport==='mobile'});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/'});await call('Page.bringToFront');
 let state;for(let k=0;k<60;k++){await wait(100);state=await ev(`({cards:document.querySelectorAll('.animation-card').length,hidden:document.hidden,engine:!!window.iwrSoundEngine})`);if(state.cards===155&&state.engine&&!state.hidden)break;}
 if(state.cards!==155||state.hidden||!state.engine)throw Error('Invalid page baseline '+JSON.stringify(state));
 const button=await ev(`(()=>{const r=document.querySelector('.sound-toggle').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...button});await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...button});
 await wait(500);
 const audio=await ev(`({...window.iwrSignal,hidden:document.hidden})`);if(!audio.active||audio.songTime===0||audio.hidden)throw Error('Audio did not start '+JSON.stringify(audio));
 console.log('AUDIO',viewport,JSON.stringify(audio));
 const collections=await ev(`Array.from(document.querySelectorAll('section.series')).filter(s=>!s.classList.contains('archive-intro')).map(s=>({title:s.querySelector('h2').textContent,series:s.querySelector('.animation-card').dataset.series,count:s.querySelectorAll('.animation-card').length}))`);
 for(const collection of collections.filter(c=>!process.env.AUDIT_SERIES||process.env.AUDIT_SERIES.split(',').includes(c.series))){
  const rows=viewport==='desktop'?Math.ceil(collection.count/2):collection.count;
  const height=Math.max(900,rows*310+260);
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:viewport==='mobile'});
  await ev(`document.querySelector('[data-series="${collection.series}"]').closest('section').scrollIntoView({block:'start'});`);
  let mounted=false;for(let k=0;k<200;k++){mounted=await ev(`Array.from(document.querySelectorAll('[data-series="${collection.series}"]')).every(h=>h.dataset.ready==='true')`);if(mounted)break;await wait(100);}
  if(!mounted)throw Error('Mount timed out: '+collection.series);
  await wait(200);
  const row=await ev(`(async()=>{
   const hosts=Array.from(document.querySelectorAll('[data-series="${collection.series}"]'));
   const data=hosts.map(h=>({name:h.getAttribute('aria-label'),item:h.dataset.item??null,series:h.dataset.series,frames:[],first:null,peak:null,quiet:null,peakLevel:-1,peakInk:-1,quietLevel:2}));
   const started=performance.now(),startFrames=window.__audit.frames;
   const signalFrames=[];
   const sample=()=>{
    const s=window.iwrSignal;if(document.hidden||!s.active)throw Error('Audio session stopped during audit');
    const stamp={time:s.songTime,loop:s.loopTime,level:s.level,hit:s.hit,low:s.low,mid:s.mid,high:s.high};signalFrames.push(stamp);
    hosts.forEach((h,i)=>{
     const c=h.shadowRoot.querySelector('.direct-surface canvas,.composition-square canvas');if(!c)throw Error('No visible canvas: '+data[i].name);
     const small=document.createElement('canvas');small.width=c.width===c.height?180:Math.min(360,c.width);small.height=c.width===c.height?180:44;
     const ctx=small.getContext('2d',{willReadFrequently:true});ctx.drawImage(c,0,0,small.width,small.height);
     const px=ctx.getImageData(0,0,small.width,small.height).data;let ink=0,sum=0,hash=2166136261;
     for(let j=0;j<px.length;j+=4){const v=(px[j]+px[j+1]+px[j+2])*px[j+3]/255;if(v>15)ink++;sum+=v;for(let ch=0;ch<4;ch++)hash=Math.imul(hash^px[j+ch],16777619);}
     const f={...stamp,ink,sum,hash:hash>>>0,width:c.width,height:c.height};data[i].frames.push(f);
     if(!data[i].first&&ink)data[i].first=c.toDataURL();
     if(((${process.env.AUDIT_SHAPE_PEAK==='1'}?ink>data[i].peakInk:s.level>data[i].peakLevel))&&ink){data[i].peakLevel=s.level;data[i].peakInk=ink;data[i].peak=c.toDataURL();}
     if(s.level<data[i].quietLevel&&ink){data[i].quietLevel=s.level;data[i].quiet=c.toDataURL();}
    });
   };
   while(performance.now()-started<9300){sample();await new Promise(r=>setTimeout(r,120));}
   data.forEach((d,i)=>{d.animated=new Set(d.frames.map(f=>f.hash)).size>1;d.visible=d.frames.some(f=>f.ink);d.minLevel=Math.min(...d.frames.map(f=>f.level));d.maxLevel=Math.max(...d.frames.map(f=>f.level));d.maxGap=Math.max(...d.frames.slice(1).map((f,k)=>f.time-d.frames[k].time));window.__audit.shots[d.series+'/'+d.item]=[d.first,d.peak,d.quiet];delete d.first;delete d.peak;delete d.quiet;});
   return {data,rafFps:(window.__audit.frames-startFrames)/((performance.now()-started)/1000),signalFrames};
  })()`);
  for(const d of row.data)results.push({...d,viewport});
  console.log('COLLECTION',viewport,collection.title,JSON.stringify({cards:row.data.length,animated:row.data.filter(d=>d.animated).length,blank:row.data.filter(d=>!d.visible).length,minLevel:Math.min(...row.signalFrames.map(f=>f.level)),maxLevel:Math.max(...row.signalFrames.map(f=>f.level)),rafFps:row.rafFps}));
  await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify({revision:process.env.AUDIT_REVISION||'1887709',results,errors,complete:false},null,2));
 }
 const keys=await ev('Object.keys(window.__audit.shots)');
 for(let start=0;start<keys.length;start+=10){
  const group=keys.slice(start,start+10);
  const png=await ev(`(async()=>{const keys=${JSON.stringify(group)},sheet=document.createElement('canvas');sheet.width=1140;sheet.height=keys.reduce((v,k)=>v+(k.endsWith('/null')?370:100),0);const ctx=sheet.getContext('2d');ctx.fillStyle='#080808';ctx.fillRect(0,0,sheet.width,sheet.height);let y=0;for(const key of keys){const host=Array.from(document.querySelectorAll('.animation-card')).find(h=>h.dataset.series+'/'+(h.dataset.item??null)===key);ctx.fillStyle='#eee';ctx.font='14px sans-serif';ctx.fillText(key+' · '+host.getAttribute('aria-label'),12,y+20);const sources=window.__audit.shots[key];for(let j=0;j<3;j++){if(!sources[j])continue;const img=await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.src=sources[j];});const h=img.width===img.height?330:44,w=h*img.width/img.height;ctx.drawImage(img,12+j*376+(360-w)/2,y+30,w,h);}y+=key.endsWith('/null')?370:100;}return sheet.toDataURL();})()`);
  await fs.writeFile(path.join(out,viewport+'-'+(start+1)+'-'+Math.min(start+10,keys.length)+'.png'),Buffer.from(png.split(',')[1],'base64'));
 }
 await ev('window.iwrSoundEngine.stop()');
}
await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify({revision:process.env.AUDIT_REVISION||'1887709',results,errors,complete:true},null,2));
console.log('DONE',JSON.stringify({cards:results.length,animated:results.filter(d=>d.animated).length,blank:results.filter(d=>!d.visible).length,errors,out}));
socket.close();
