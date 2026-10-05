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
for(const id of new Set(cards.map(c=>c[1]))){
 const data=JSON.parse(fs.readFileSync(path.join(root,'studies',id+'.json'),'utf8'));payloads++;
 for(const script of data.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  const src=script[1].match(/src="([^"]+)"/);
  const code=src?fs.readFileSync(path.resolve(root,'studies',src[1]),'utf8'):script[2];
  new vm.Script(code,{filename:id});scripts++;
 }
}
for(const name of ['inline-gallery.js','single-page.css','typography.css'])assert(fs.existsSync(path.join(root,name)),name);
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
assert.equal(config.outputDirectory,'dist');
assert(config.rewrites.some(r=>r.source==='/iwrzwr/visual-archive/:path*'),'subpath assets');
console.log(JSON.stringify({cards:cards.length,collections:payloads,compiledScripts:scripts,iframes:0,videos:0,status:'pass'}));
