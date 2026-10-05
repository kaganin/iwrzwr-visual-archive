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
assert(html.includes('164 alternatives · 28 collections'),'editorial count');
for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
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
for(const id of ['signal-assembly','phase-mechanics','orbital-memory'])assert.equal(fs.readFileSync(path.join(root,id+'.js'),'utf8'),fs.readFileSync(path.join('sources/latest-site/public',id+'.js'),'utf8'),'composition source: '+id);
for(const name of ['inline-gallery.js','single-page.css','typography.css'])assert(fs.existsSync(path.join(root,name)),name);
new vm.Script(fs.readFileSync(path.join(root,'inline-gallery.js'),'utf8'),{filename:'inline-gallery.js'});
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
assert.equal(config.outputDirectory,'dist');
assert(config.rewrites.some(r=>r.source==='/iwrzwr/visual-archive/:path*'),'subpath assets');
console.log(JSON.stringify({cards:cards.length,collections:payloads,compiledScripts:scripts,originalStudies,compositionSourceMatches:3,iframes:0,videos:0,status:'pass'}));
