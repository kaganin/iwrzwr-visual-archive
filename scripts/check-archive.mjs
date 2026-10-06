import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const cards=[...html.matchAll(/class="animation-card[^"\n]*"[^>]*data-series="([^"]+)"[^>]*>/g)];
assert.equal(cards.length,155,'visible card count');
assert.equal(new Set(cards.map(c=>c[1])).size,28,'visible collections');
assert(!/<(?:iframe|video)\b/i.test(html),'main gallery must run code');
assert(html.includes('164 sound visualization experiments'),'editorial count');
assert(html.includes('class="header-repo repo-button"'),'persistent repository link');
const numberedHeadings=[...html.matchAll(/<h2>(\d{2}) — /g)];
assert.equal(numberedHeadings.length,28,'numbered collections');
numberedHeadings.forEach((heading,index)=>assert.equal(heading[1],String(index+1).padStart(2,'0'),'sequential collection numbers'));
assert(html.includes('<meta name="description"'),'search description');
assert(html.includes('<link rel="canonical" href="https://www.kagan.in/iwrzwr/visual-archive/">'),'canonical portfolio URL');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'one semantic page heading');
const structured=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(structured['@type'],'CollectionPage');
assert(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(structured.url),'sitemap canonical URL');
for(const match of html.matchAll(/<(?:h2|figcaption|title)>([^<]*)<\/[^>]+>|aria-label="([^"]+)"/g)){
 const text=match[1]??match[2];
 assert.equal(text,text.toLowerCase(),'gallery copy must be lowercase: '+text);
}
for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
 if(script[1].includes('application/ld+json'))JSON.parse(script[2]);
 else new vm.Script(script[2]);
}
let scripts=0,payloads=0;
let originalStudies=0;
function redAccents(text){return text.replace(/#([\da-f]{6})([\da-f]{2})?\b/gi,(hex,rgb,alpha='')=>{const r=parseInt(rgb.slice(0,2),16),g=parseInt(rgb.slice(2,4),16),b=parseInt(rgb.slice(4,6),16);return r>180&&g>=70&&g<220&&b<g*.8?'#FF0000'+alpha:hex;});}
for(const id of new Set(cards.map(c=>c[1]))){
 const data=JSON.parse(fs.readFileSync(path.join(root,'studies',id+'.json'),'utf8'));payloads++;
 const sourceFile=path.resolve('sources',id+'.html');
 if(fs.existsSync(sourceFile)){
  const sourceScripts=[...redAccents(fs.readFileSync(sourceFile,'utf8')).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const liveScripts=[...data.html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  assert.deepEqual(liveScripts,sourceScripts,'drawing source identity: '+id);
  originalStudies+=cards.filter(c=>c[1]===id).length;
 }
 for(const script of data.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  const src=script[1].match(/src="([^"]+)"/);
  const code=src?fs.readFileSync(path.resolve(root,'studies',src[1]),'utf8'):script[2];
  new vm.Script(code,{filename:id});scripts++;
 }
}
assert.equal(originalStudies,152,'all individual drawings match preserved source code');
// Every gallery series listed here reads the shared live sound signal (guarded, so sound off changes nothing).
const liveSeries=['soundwave-directions','geek-soundwaves','vector-soundwave-studies','sound-machines','cell-memory-ten','fan-satellites-refined','sound-motion-four-series','night-01-raster-protocol','night-02-causal-instruments','night-03-pocket-machines','night-04-calibration-desk','night-05-plotter-logic'];
for(const id of liveSeries){
 const source=fs.readFileSync(path.resolve('sources',id+'.html'),'utf8');
 assert(/typeof iwrSignal!=='undefined'&&iwrSignal\.active/.test(source),'live sound seam: '+id);
 assert(source.includes('Without it, or with sound off, nothing changes'),'seam keeps the sound-off path: '+id);
}
for(const id of ['signal-assembly','phase-mechanics','orbital-memory'])assert.equal(fs.readFileSync(path.join(root,id+'.js'),'utf8'),fs.readFileSync(path.join('sources/latest-site/public',id+'.js'),'utf8'),'composition source: '+id);
for(const name of ['inline-gallery.js','single-page.css','typography.css','sound.css','sound-engine.js','sound-controls.js'])assert(fs.existsSync(path.join(root,name)),name);
for(const name of ['sound-engine.js','sound-controls.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
assert(html.indexOf('sound-engine.js')>-1&&html.indexOf('sound-engine.js')<html.indexOf('inline-gallery.js'),'sound engine loads before the gallery');
assert(html.includes('data-sound-toggle')&&html.includes('>play sound<'),'sound toggle in the introduction');
assert(fs.readFileSync(path.join(root,'inline-gallery.js'),'utf8').includes("'iwrSignal'"),'gallery exposes the shared signal');
new vm.Script(fs.readFileSync(path.join(root,'inline-gallery.js'),'utf8'),{filename:'inline-gallery.js'});
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
assert.equal(config.outputDirectory,'dist');
assert(config.rewrites.some(r=>r.source==='/iwrzwr/visual-archive/:path*'),'subpath assets');
console.log(JSON.stringify({cards:cards.length,collections:payloads,compiledScripts:scripts,originalStudies,compositionSourceMatches:3,iframes:0,videos:0,status:'pass'}));
