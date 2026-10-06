// Fixed-clock drawing tests: changing speed alone cannot pass this check.
// Silent previews are compared to the pre-fix source, in memory (no checkout).
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const baseline=process.env.SOUND_BASELINE||'1887709';
const before=file=>execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:4e6});
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const clamp=x=>Math.max(0,Math.min(1,x));
const fixtures=['quiet','bass','treble','onsets'];
const times=[.23,1.18,2.4,3.6,4.7,7.8,35];
const rows=[];
function heard(kind,t){
 const bands=kind==='bass'?[.91,.37,.09]:kind==='treble'?[.08,.48,.94]:[.02,.02,.02];
 const amp=kind==='quiet'||kind==='onsets'?.02:.72;
 const bandAt=(band,age=0)=>{const v=band==='amp'?amp:bands[['low','mid','high'].indexOf(band)]||0;return clamp(v*(.72+.28*Math.cos(age*3.1+(band==='high'?1:0))));};
 const eventAt=(event,age=0)=>({age:kind==='onsets'?.025+age:.17+age,n:kind==='onsets'?17:3});
 const levelAt=age=>amp*(.8+.2*Math.cos(age*2));
 return {active:true,source:'demo',mode:'play',songTime:t,loopTime:t%8.888875,beat:7,travel:2,lowPhase:1.2,midPhase:2.4,highPhase:3.6,level:amp,low:bands[0],mid:bands[1],high:bands[2],hit:.12,pulse:.12,kickAge:eventAt('kick').age,snareAge:eventAt('snare').age,hatAge:eventAt('hat').age,noteAge:eventAt('note').age,bandAt,eventAt,levelAt,hitAt:()=>.12,sampleAt:age=>Math.sin(age*1700)*amp,spectrumAt:(p,age=0)=>bandAt(p<.33?'low':p<.67?'mid':'high',age)};
}
function analysis(getSignal){
 return {rate:32000,N:284444,duration:8.888875,frameTime:.0125,signal(t){const s=getSignal();return {bins:Array.from({length:8},(_,i)=>s.spectrumAt(i/7)),amp:s.bandAt('amp'),low:s.bandAt('low'),mid:s.bandAt('mid'),high:s.bandAt('high'),balance:s.high-s.low,left:s.low,right:s.high,travel:s.travel};},hit(t,kind){return getSignal().eventAt(kind);},wave(t,u){return getSignal().sampleAt(u*.032);},softSignal(t){const s=getSignal(),f={bins:Array.from({length:8},(_,i)=>s.spectrumAt(i/7)),low:s.bandAt('low'),mid:s.bandAt('mid'),high:s.bandAt('high')};return {bins:f.bins,bands:[f.low,f.mid,f.high],phase:[s.lowPhase,s.midPhase,s.highPhase]};},copyToBuffer(){}};
}
function boot(file,raw,{signal=null,shared=null,kind}={}){
 const traces=[];
 function context(){
  const trace=[];traces.push(trace);
  const capture=(name,args)=>{assert(args.every(x=>typeof x!=='number'||Number.isFinite(x)),file+' non-finite '+name);trace.push([name,...args]);};
  return new Proxy({__trace:trace}, {get(o,k){if(k in o)return o[k];if(k==='createLinearGradient')return (...a)=>({addColorStop(...b){capture('gradient',[...a,...b]);}});return (...a)=>capture(k,a);},set(o,k,v){capture('set',[k,v]);o[k]=v;return true;}});
 }
 function element(tag='div'){
  const ctx=tag==='canvas'?context():null;
  const el={tagName:tag.toUpperCase(),isConnected:true,children:[],dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getBoundingClientRect(){return {width:226,height:44};},append(...kids){el.children.push(...kids);},querySelectorAll(){return [];},getContext(){return ctx;}};
  const selected=new Map();
  el.querySelector=selector=>{if(!selected.has(selector))selected.set(selector,element(selector==='canvas'?'canvas':'div'));return selected.get(selector);};return el;
 }
 const root=element();
 const sandbox=vm.createContext({document:{getElementById(){return root;},createElement:element,hidden:false,addEventListener(){}},window:{addEventListener(){},iwrSoundEngine:shared?{demoAnalysis:()=>shared}:undefined},iwrSignal:signal||{active:false},matchMedia(){return {matches:false,addEventListener(){}};},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},devicePixelRatio:1,ResizeObserver:class {observe(){}disconnect(){}},IntersectionObserver:class {observe(){}disconnect(){}},performance:{now(){return 0;}},console});
 let code=file.endsWith('.html')?raw.match(/<script>([\s\S]*?)<\/script>/)[1]:raw;
 const clockVar=file.includes('soundwave-directions')?'elapsed':file.includes('geek-soundwaves')?'t':file.includes('vector-soundwave-studies')?'elapsed':'time';
 const expose=kind==='night'?'renderers,names,state,setTime(v){t=v;}':kind==='first'?`names,state,frame,setTime(v){${clockVar}=v;last=v*1000-40;}`:kind==='panels'?'panels,render:typeof paint!=="undefined"?paint:draw,setTime(v){time=v;}':kind==='pcm'?'panels,drawPanel,demo:typeof demo!=="undefined"?demo:{signal,hit,wave,softSignal:typeof softSignal!=="undefined"?softSignal:undefined}':file.includes('orbital-memory')?'drawMatrixStudy,paint':'loupe:typeof loupe!=="undefined"?loupe:undefined,vernier:typeof vernier!=="undefined"?vernier:undefined,loom:typeof loom!=="undefined"?loom:undefined,flare:typeof flare!=="undefined"?flare:undefined,strain:typeof strain!=="undefined"?strain:undefined,section:typeof section!=="undefined"?section:undefined,paint';
 code=code.replace(/\}\)\(\);\s*$/,'globalThis.probe={'+expose+'};})();');
 vm.runInContext(code,sandbox,{timeout:10000,filename:file});
 return {a:sandbox.probe,traces,sandbox,clear(){traces.forEach(t=>t.length=0);}};
}
function traceRender(p,kind,index,time){
 const a=p.a;p.clear();
 if(kind==='night'){a.setTime(time);a.state.mode='play';Object.values(a.renderers)[index](time);return p.traces.flat();}
 if(kind==='first'){a.state.style=Object.keys(a.names)[index];a.state.mode='play';a.state.phase='playback';a.setTime(time);a.frame(time*1000);return p.traces.flat();}
 if(kind==='panels'){a.setTime(time);a.panels.forEach((panel,i)=>panel.visible=i===index);a.render();return a.panels[index].ctx.__trace;}
 if(kind==='pcm'){a.drawPanel(a.panels[index],time);return p.traces.flat();}
 if(p.a.drawMatrixStudy){a.drawMatrixStudy(412,['echo-orchard','orbit-register','parity-bloom'][index],time);return p.traces.flat();}
 a[p.names[index]](time);return p.traces.flat();
}
const first=['soundwave-directions','geek-soundwaves','vector-soundwave-studies','sound-machines'];
const nights=fs.readdirSync('sources').filter(f=>/^night-\d\d-.*\.html$/.test(f)).sort();
const fileRows=[...first.map(id=>({file:'sources/'+id+'.html',kind:'first',count:5})),...nights.map(f=>({file:'sources/'+f,kind:'night',count:5})),...['bloom-ten-studies','matrix-direction-studies','matrix-routes-ten'].map((id,i)=>({file:'sources/'+id+'.html',kind:'panels',count:[10,5,10][i]})),...['sound-motion-four-series','cell-memory-ten','fan-satellites-refined'].map((id,i)=>({file:'sources/'+id+'.html',kind:'pcm',count:[20,10,2][i]})),...['signal-assembly','phase-mechanics','orbital-memory'].map((id,i)=>({file:'sources/latest-site/public/'+id+'.js',kind:'composition',count:3,names:[['loupe','vernier','loom'],['flare','strain','section'],['echo-orchard','orbit-register','parity-bloom']][i]}))];
for(const spec of fileRows){
 const raw=fs.readFileSync(spec.file,'utf8'),old=before(spec.file);
 // PCM synthesis/analysis is deliberately run only once per file, like the gallery cache.
 const offOld=boot(spec.file,old,{kind:spec.kind}),offNew=boot(spec.file,raw,{kind:spec.kind});
 offOld.file=offNew.file=spec.file;offOld.names=offNew.names=spec.names;
 let sharedPCM=null;
 if(spec.kind==='pcm'){
  sharedPCM=offNew.a.demo;
  const channels=[];sharedPCM.copyToBuffer({copyToChannel(data,c){channels[c]=data.slice();}});
  const helper={window:{}};vm.createContext(helper);vm.runInContext(fs.readFileSync('dist/demo-analysis.js','utf8'),helper);
  sharedPCM=helper.window.iwrCreateDemoAnalysis(channels,32000,108,{kick:[0,6,8,16,22],snare:[4,12,20],hat:[2,3,6,10,11,14,18,19,22],note:[1,7,9,15,17,23]});
  for(const t of times)for(const fn of ['signal','hit','wave','softSignal']){
   if(!offNew.a.demo[fn])continue;
   const args=fn==='hit'?[t,'snare']:fn==='wave'?[t,.35]:[t];
   assert.equal(hash(sharedPCM[fn](...args)),hash(offNew.a.demo[fn](...args)),spec.file+' shared analysis '+fn);
  }
 }
 for(let item=0;item<spec.count;item++){
  const label=spec.kind==='night'||spec.kind==='first'?Object.values(offNew.a.names)[item]:spec.names?.[item]||'item '+item;
  const record={file:spec.file,item,label,silentIdentity:true,fixedClockResponse:false,sharedIdentity:spec.kind==='pcm'?true:undefined};
  for(const t of [1.18,3.6,7.8]){
   // Frame-based sketches carry state, so reset for each baseline comparison.
   let a=offOld,b=offNew;
   if(spec.kind==='first'){a=boot(spec.file,old,{kind:spec.kind});b=boot(spec.file,raw,{kind:spec.kind});}
   assert.equal(hash(traceRender(a,spec.kind,item,t)),hash(traceRender(b,spec.kind,item,t)),spec.file+' silent identity '+label+' t='+t);
   if(sharedPCM){const c=boot(spec.file,raw,{kind:spec.kind,shared:sharedPCM});assert.equal(hash(traceRender(c,spec.kind,item,t)),hash(traceRender(b,spec.kind,item,t)),spec.file+' shared drawing '+label);}
  }
  const comparisons=[];
  for(const t of times){
   const hashes=[];
   for(const fixture of fixtures){
    const s=heard(fixture,t),p=boot(spec.file,raw,{kind:spec.kind,signal:s,shared:spec.kind==='pcm'?analysis(()=>s):null});p.file=spec.file;p.names=spec.names;
    hashes.push(hash(traceRender(p,spec.kind,item,t)));
   }
   comparisons.push({time:t,changed:new Set(hashes).size>1});
  }
  record.fixedClockResponse=comparisons.some(c=>c.changed);record.comparisons=comparisons;rows.push(record);
 }
 console.log(JSON.stringify({file:spec.file,checked:spec.count,responsive:rows.slice(-spec.count).filter(r=>r.fixedClockResponse).length,silentIdentity:true}));
}
assert.equal(rows.length,161,'152 individual renderers + 9 composition rows');
const unchanged=rows.filter(r=>!r.fixedClockResponse);
const output=process.env.SOUND_RESPONSE_OUTPUT||'/tmp/iwrzwr-sound-fixes-qa-20261006/fixed-clock-responses.json';
fs.mkdirSync(new URL('.', 'file://'+output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({baseline,rows,unchanged},null,2));
assert.equal(unchanged.length,0,'every renderer must change at a fixed clock: '+JSON.stringify(unchanged));
console.log(JSON.stringify({renderers:rows.length,silentIdentity:'pass',fixedClockResponse:'pass',output}));
