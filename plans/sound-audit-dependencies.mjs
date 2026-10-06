// Probe play renderers at a fixed visual clock. No source file is changed.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const results=[];
const files=fs.readdirSync('sources').filter(f=>/^night-\d\d-.*\.html$/.test(f)).sort();
function run(file,style,t,heard){
 let code=fs.readFileSync('sources/'+file,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.replace('resize();sync();','').replace(/\}\)\(\);\s*$/,'globalThis.audit={renderers,names,state,setTime(v){t=v;}};})();');
 const trace=[],ctx=new Proxy({},{get(target,key){return key in target?target[key]:(...args)=>{trace.push([key,...args]);};},set(target,key,value){target[key]=value;trace.push(['set',key,value]);return true;}});
 const canvas={getContext(){return ctx;},setAttribute(){},getBoundingClientRect(){return {width:226};}};
 const element={addEventListener(){},setAttribute(){},getBoundingClientRect(){return {width:226};},isConnected:true,querySelectorAll(){return [];},querySelector(sel){return sel==='canvas'?canvas:element;}};
 const sandbox={document:{getElementById(){return element;},hidden:false,addEventListener(){}},window:{addEventListener(){}},matchMedia(){return {matches:false,addEventListener(){}};},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},devicePixelRatio:1,iwrSignal:{active:true,hit:.5,level:heard,low:heard,mid:heard,high:heard,pulse:heard,levelAt(){return heard;},hitAt(){return heard;}},ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},performance:{now(){return 0;}}};
 vm.createContext(sandbox);vm.runInContext(code,sandbox,{timeout:10000});
 const a=sandbox.audit;a.setTime(t);a.state.mode='play';trace.length=0;a.renderers[style](t);
 return crypto.createHash('sha256').update(JSON.stringify(trace)).digest('hex');
}
for(const file of files){
 const code=fs.readFileSync('sources/'+file,'utf8');
 const styles=code.match(/const renderers=\{([^}]+)\}/)[1].split(',').map(x=>x.trim());
 for(const [item,style] of styles.entries()){
  const comparisons=[.23,2.4,3.6,4.7,7.8].map(t=>({time:t,changed:run(file,style,t,0)!==run(file,style,t,1)}));
  const result={series:file.replace('.html',''),item,style,envelopeChangesDrawing:comparisons.some(c=>c.changed),comparisons};results.push(result);
 }
}
const output='/tmp/iwrzwr-sound-audit-20261006/dependencies.json';
fs.writeFileSync(output,JSON.stringify(results,null,2));
console.log(JSON.stringify({renderers:results.length,envelopeChangesDrawing:results.filter(r=>r.envelopeChangesDrawing).length,unchanged:results.filter(r=>!r.envelopeChangesDrawing).length,output}));
const first=[];
function frameProbe(file,style,heard,seconds){
 let code=fs.readFileSync('sources/'+file+'.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.replace(/\}\)\(\);\s*$/,'globalThis.audit={names,state,frame};})();');
 const trace=[],ctx=new Proxy({},{get(target,key){if(key==='createLinearGradient')return (...args)=>({addColorStop(...stops){trace.push(['gradient',...args,...stops]);}});return key in target?target[key]:(...args)=>{trace.push([key,...args]);};},set(target,key,value){target[key]=value;trace.push(['set',key,value]);return true;}});
 const canvas={getContext(){return ctx;},setAttribute(){},getBoundingClientRect(){return {width:226};}};
 const element={addEventListener(){},setAttribute(){},getBoundingClientRect(){return {width:226};},isConnected:true,querySelectorAll(){return [];},querySelector(sel){return sel==='canvas'?canvas:element;}};
 const sandbox={document:{getElementById(){return element;},hidden:false,addEventListener(){}},matchMedia(){return {matches:false,addEventListener(){}};},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},devicePixelRatio:1,iwrSignal:{active:true,hit:.2,level:heard,levelAt(age){return age<=160/30?heard:0;},hitAt(age){return age<=160/30?.2:0;}},ResizeObserver:class{observe(){} disconnect(){}},IntersectionObserver:class{observe(){} disconnect(){}},performance:{now(){return 0;}}};
 vm.createContext(sandbox);vm.runInContext(code,sandbox,{timeout:10000});const a=sandbox.audit;
 a.state.style=style;a.state.mode='play';a.state.phase='playback';
 for(let ms=40;ms<=seconds*1000;ms+=40){trace.length=0;a.frame(ms);}
 return crypto.createHash('sha256').update(JSON.stringify(trace)).digest('hex');
}
const keys={
 'soundwave-directions':['ribbon','mono','silk','liquid','spectrum'],
 'geek-soundwaves':['teletext','scope','wireframe','ascii','spectral'],
 'vector-soundwave-studies':['sweep','dust','braid','terminal','contour'],
 'sound-machines':['sand','motor','spring','pendulum','grains']
};
for(const [file,styles] of Object.entries(keys))for(const [item,style] of styles.entries()){
 const seconds=style==='contour'?[3,35]:[3];
 const checks=seconds.map(s=>({seconds:s,changed:frameProbe(file,style,0,s)!==frameProbe(file,style,1,s)}));
 first.push({series:file,item,style,checks});
}
fs.writeFileSync('/tmp/iwrzwr-sound-audit-20261006/first-twenty-dependencies.json',JSON.stringify(first,null,2));
console.log(JSON.stringify({firstTwenty:first.length,earlyChanged:first.filter(d=>d.checks[0].changed).length,contour:first.find(d=>d.style==='contour')}));
