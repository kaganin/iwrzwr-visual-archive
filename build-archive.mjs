import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const source=process.env.IWRZWR_VISUAL_SOURCE || path.resolve('sources');
const out=path.resolve('dist');
const basePath=process.env.IWRZWR_BASE_PATH || '/';
if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath))throw Error('IWRZWR_BASE_PATH must be an absolute, slash-terminated path');
fs.mkdirSync(path.join(out,'studies'),{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const theme=`:root{color-scheme:dark;--background:#000;--foreground:#eee;--muted-foreground:#999}*{box-sizing:border-box}body{margin:0;padding:24px;background:#000;color:#eee;font:16px/1.5 Arial,Helvetica,sans-serif}button{font:inherit;cursor:pointer}.viz-controls{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:24px}.btn{color:#bbb;background:#141414;border:1px solid #333;border-radius:6px;min-height:44px;padding:9px 14px;text-align:left}.btn[aria-pressed=true]{color:#fff;border-color:#ddd;background:#262626}.btn-block{width:100%}.text-small{font-size:14px}.text-muted{color:#999}:focus-visible{outline:2px solid #fff;outline-offset:3px}[hidden]{display:none!important}h3{font-size:18px;font-weight:500}figcaption{font-size:16px}canvas{max-width:100%}@media(max-width:520px){body{padding:16px}}`;
function wrap(title,body,css=''){return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · iwrzwr</title><style>${theme}${css}</style><link rel="stylesheet" href="../typography.css"><script src="../motion-runtime.js"></script></head><body>${body}</body></html>`;}
const sets=[];
const inlineSources={};
function redAccents(text){
 return text.replace(/#([\da-f]{6})([\da-f]{2})?\b/gi,(hex,rgb,alpha='')=>{
  const r=parseInt(rgb.slice(0,2),16),g=parseInt(rgb.slice(2,4),16),b=parseInt(rgb.slice(4,6),16);
  return r>180&&g>=70&&g<220&&b<g*.8?'#FF0000'+alpha:hex;
 });
}
function add(id,title,group,count,html,names=[],css=''){
 html=redAccents(html);css=redAccents(css);
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1],{filename:id});
 fs.writeFileSync(path.join(out,'studies',id+'.html'),wrap(title,html,css));
 sets.push({id,title,group,count,names,url:'studies/'+id+'.html'});
 inlineSources[id]={html,css:theme+css};
}
const latest=path.join(source,'latest-site');
let latestHTML=fs.readFileSync(path.join(latest,'app/page.tsx'),'utf8').match(/return (<main>[\s\S]*<\/main>)/)[1];
latestHTML=latestHTML.replace(/dangerouslySetInnerHTML=\{\{__html:("(?:\\.|[^"\\])*")\}\}\/>/g,(_,json)=>'>'+JSON.parse(json)+'</div>').replaceAll('className=','class=').replace(/<Script src="\/gallery.js" strategy="afterInteractive"\/>/,'<script src="../gallery.js"></script>').replace(/<(canvas|button)([^>]*?)\/>/g,'<$1$2></$1>');
const latestCSS=fs.readFileSync(path.join(latest,'app/globals.css'),'utf8').replace(/^@import[^;]+;\s*/gm,'');
fs.copyFileSync(path.join(latest,'public/gallery.js'),path.join(out,'gallery.js'));
add('latest','Son seçki · 11 çalışma','Seçkiler',11,latestHTML,['Slice Loupe','Flare Stem','Delay Vernier','Field Strain','Splice Loom','Section Gate','Figure Eight','Spiral Sink','Orbit Register','Echo Orchard','Parity Bloom'],latestCSS);
add('twenty','İlk 20 seçim','Seçkiler',20,fs.readFileSync(path.join(source,'selection/twenty-animations.html'),'utf8'));
const initial=[['soundwave-directions','Soundwave Directions'],['geek-soundwaves','Geek Soundwaves'],['vector-soundwave-studies','Vector Studies'],['sound-machines','Sound Machines']];
const later=[['bloom-ten-studies','Bloom · 10 alternatif',10],['matrix-direction-studies','Matrix · yönler',5],['matrix-routes-ten','Matrix · rotalar',10],['sound-motion-four-series','Ses ve hareket · 4 × 5',20],['cell-memory-ten','Hücre / iz / hafıza',10],['fan-satellites-refined','Spectral Fan & Band Satellites',2]];
function fragment(id,title,group,count){
 const html=fs.readFileSync(path.join(source,id+'.html'),'utf8');
 let names=Array.from(html.matchAll(/<button[^>]*data-style="[^"]+"[^>]*>([^<]+)<\/button>/g),m=>m[1].replace(/^\d+\s*[·.]\s*/,''));
 if(!names.length)names=Array.from(html.matchAll(/\[\s*'((?:\d+\s*·\s*)?[A-Z][^'\n]+)'\s*,/g),m=>m[1].replace(/^\d+\s*·\s*/,''));
 if(id==='bloom-ten-studies')names=Array.from(html.matchAll(/'\d+ · ([^']+)'/g),m=>m[1]);
 add(id,title,group,count,html,[...new Set(names)]);
}
function sourceStudy(id,title,group,names){
 const html=fs.readFileSync(path.join(source,id+'.html'),'utf8');
 add(id,title,group,names.length,html,names);
}
for(const [id,title]of initial)fragment(id,title,'İlk denemeler',5);
for(const file of fs.readdirSync(source).filter(x=>/^night-\d+.*\.html$/.test(x)).sort()){
 const id=file.slice(0,-5), title=id.replace(/^night-/,'').split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
 fragment(id,title,'Gece serileri',5);
}
for(const [id,title,count]of later)fragment(id,title,'Matrix ve ses',count);
sourceStudy('circle-tape-studies','Circle Tape · ilk seri','Kayıt arayüzleri',['Tape Head','Growing Take','Stereo Memory','Punch Window','Loop Overwrite']);
sourceStudy('circle-tape-studies-two','Circle Tape · ikinci seri','Kayıt arayüzleri',['Radial Take','Folded Tape','Spool Memory','Grain Shutter','Contour Stack']);
sourceStudy('voice-head-studies','Voice Head · 10 alternatif','Ses ve figür',['Signal Stem','Twin Folds','Reed Stack','Phoneme Prints','Formant Loom','Echo Chamber','Ear Aperture','Bone Relay','Breath Bellows','Duplex Organ']);
sourceStudy('signal-stem-profile','Signal Stem · profil','Ses ve figür',['Signal Stem']);
sourceStudy('playback-creature-lab','Playback Creature Lab','Ses ve figür',['Tape Goblin','Punch Clock','Tape Eater','Eight Arm Dub','Resonant Bird','Moonwalk Unit','Moth Choir','X-Ray Hound','Reel Rider','Ghost Conductor']);
sourceStudy('mixtape-monkeys','Mixtape Monkeys','Ses ve figür',['Sleep Tape','Window Seat','Deep Listener','Tail Reception','Shared Frequency']);
sourceStudy('pocket-listener-nod','Pocket Listener Nod','Ses ve figür',['Pocket Listener']);
sourceStudy('branch-choir','Branch Choir','Ses ve figür',['Branch Solo']);
sourceStudy('profile-reference','Profile Reference','Referans çizimler',['Profile Reference']);
for(const [id,title]of [['signal-assembly','01–03–05 · kare'],['phase-mechanics','02–04–06 · kare'],['orbital-memory','Echo · Orbit · Parity · kare']]){
 fs.copyFileSync(path.join(latest,'public',id+'.js'),path.join(out,id+'.js'));
 add(id,title,'Kare kompozisyonlar',3,`<main class="composition-export"><div class="composition-square" id="${id}"><canvas width="1080" height="1080" aria-label="${title}"></canvas></div></main><script src="../${id}.js"></script>`,[],latestCSS);
}
fragment('square-signal-assembly','Kare · ilk hız','Kare kompozisyonlar',3);
fragment('square-signal-assembly-slow','Kare · yavaş deneme','Kare kompozisyonlar',3);
fs.cpSync(path.join(source,'settings-svg'),path.join(out,'icons'),{recursive:true,filter:p=>path.basename(p)!=='.DS_Store'});
const iconFiles=['01-outline-cross.svg','02-filled-gear.svg','03-outline-ring.svg','04-hex-nut.svg'];
const iconHTML=['','circle-led/','circle-led/native-size/'].map((dir,i)=>`<h3>${['Matrix ikonlar','Circle · ilk deneme','Circle · normal ikon boyutu'][i]}</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:24px">${iconFiles.map((f,j)=>{const name=i===1?f.replace('.svg','-circle.svg'):f;return `<figure style="margin:0"><img style="width:100%;max-width:240px" src="../icons/${dir}${name}" alt="${f.slice(3,-4)}"><figcaption><a style="color:#aaa" href="../icons/${dir}${name}" download>${f.slice(3,-4)} · SVG</a></figcaption></figure>`}).join('')}</div>`).join('');
add('settings-icons','Settings · SVG denemeleri','İkonlar',12,iconHTML);
const originals=sets.filter(s=>['İlk denemeler','Gece serileri','Matrix ve ses'].includes(s.group));
const total=originals.reduce((n,s)=>n+s.names.length,0);
const allBody=originals.map(s=>'<section class="series"><h2>'+esc(s.title)+'</h2><div class="all-grid">'+s.names.map((name,index)=>'<figure><iframe title="'+esc(name)+'" data-src="'+s.id+'.html?item='+index+'" sandbox="allow-scripts allow-same-origin"></iframe><figcaption>'+esc(name)+'</figcaption></figure>').join('')+'</div></section>').join('');
fs.writeFileSync(path.join(out,'studies/all.html'),wrap('Tüm alternatifler',allBody+'<script src="../all.js"></script>', '.series{margin-bottom:48px}.series h2{font-size:16px;font-weight:400;color:#aaa;margin:8px 0 20px}.all-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0;min-width:0}iframe{display:block;width:100%;height:160px;border:1px solid #222;background:#000}figcaption{font-size:14px;color:#ccc;margin-top:10px}@media(max-width:620px){.all-grid{grid-template-columns:1fr}}'));
for(const s of originals){const p=path.join(out,s.url);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('</body>','<script src="../isolate.js"></script></body>'));}
sets.unshift({id:'all',title:'Tüm alternatifler',group:'Tüm çalışmalar',count:total,names:[],url:'studies/all.html'});
fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(sets,null,2));
const extra=sets.filter(s=>['signal-assembly','phase-mechanics','orbital-memory'].includes(s.id));
const extras=extra.map(s=>`<section class="series" id="${s.id}"><h2>${esc(s.title)}</h2><iframe class="collection-frame" title="${esc(s.title)}" data-src="${s.url}" sandbox="allow-scripts allow-same-origin allow-downloads" allow="autoplay"></iframe></section>`).join('');
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>iwrzwr / Visual Archive</title><link rel="stylesheet" href="single-page.css"><link rel="stylesheet" href="typography.css"></head><body><header><span class="brand">iwrzwr <span>/ visual archive</span></span><span>${total} alternatif · ${originals.length+extra.length} koleksiyon</span></header><main>${allBody.replaceAll('data-src="','data-src="studies/')}${extras}</main><script src="all.js"></script></body></html>`);
console.log(JSON.stringify({collections:sets.length,entriesIncludingVersions:sets.reduce((n,s)=>n+s.count,0),collectionsWithNames:sets.filter(s=>s.names.length).length}));
// The gallery mounts isolated DOM trees, never separate browser documents.
// Gallery labels are English; preserve the original source-study terminology separately.
const englishTitles={
 'bloom-ten-studies':'Bloom · 10 alternatives',
 'matrix-direction-studies':'Matrix · directions',
 'matrix-routes-ten':'Matrix · routes',
 'sound-motion-four-series':'Sound and motion · 4 × 5',
 'cell-memory-ten':'Cell / trace / memory',
 'signal-assembly':'Signal Assembly',
 'phase-mechanics':'Phase Mechanics',
 'orbital-memory':'Orbital Memory'
};
for(const s of [...originals,...extra])s.title=englishTitles[s.id]||s.title;
// Lowercase gallery copy without changing preserved drawing programs or names.
const label=text=>esc(text.toLowerCase());
const collectionHeading=(title,index)=>`${String(index+1).padStart(2,'0')} — ${label(title)}`;
const cards=originals.map((s,index)=>`<section class="series"><h2>${collectionHeading(s.title,index)}</h2><div class="all-grid">${s.names.map((name,i)=>`<figure><div class="animation-card" data-series="${s.id}" data-item="${i}" aria-label="${label(name)}"></div><figcaption>${label(name)}</figcaption></figure>`).join('')}</div></section>`).join('');
const extraCards=extra.map((s,index)=>`<section class="series"><h2>${collectionHeading(s.title,originals.length+index)}</h2><div class="animation-card collection-card" data-series="${s.id}" aria-label="${label(s.title)}"></div></section>`).join('');
for(const s of [...originals,...extra])fs.writeFileSync(path.join(out,'studies',s.id+'.json'),JSON.stringify(inlineSources[s.id]));
// Count the three compositions as 12 alternatives, following the archive's editorial convention.
const compositionAlternatives=12;
const canonical='https://www.kagan.in/iwrzwr/visual-archive/';
const pageTitle='sound & music visualizer experiments — iwrzwr/visual archive';
const description='explore 155 sound and music visualizer drafts in javascript: waveform animations, matrix displays and particle studies. explore the drawing code and live experiments.';
const structuredData=JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:pageTitle,url:canonical,description,inLanguage:'en',about:[{'@type':'Thing',name:'sound visualization'},{'@type':'Thing',name:'music visualization'},{'@type':'Thing',name:'creative coding'}]}).replaceAll('<','\\u003c');
const metadata=`<title>${esc(pageTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:title" content="${esc(pageTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="iwrzwr/visual archive"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(pageTitle)}"><meta name="twitter:description" content="${esc(description)}"><script type="application/ld+json">${structuredData}</script>`;
const repoLink='view github repo';
const socialLink='<a class="repo-button secondary-button" href="https://x.com/kaganin">follow me on x</a>';
const introduction=`<section class="series archive-intro" aria-label="about this archive"><h1 class="brand">iwrzwr<span>/visual archive</span></h1><p>164 sound visualization experiments built with javascript. explore waveform animations, spectrum-inspired patterns, matrix displays, particles, rhythm and memory.</p><p class="archive-actions"><a class="intro-repo repo-button" href="https://github.com/kaganin/iwrzwr-visual-archive">${repoLink}</a>${socialLink}</p></section>`;
const headerActions=`<div class="header-actions"><a class="header-repo repo-button" href="https://github.com/kaganin/iwrzwr-visual-archive">${repoLink}</a>${socialLink}</div>`;
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${basePath}">${metadata}<link rel="stylesheet" href="single-page.css"><link rel="stylesheet" href="typography.css"><link rel="stylesheet" href="sound.css"></head><body><header inert aria-hidden="true"><span class="brand">iwrzwr<span>/visual archive</span></span>${headerActions}</header><main>${introduction}${cards}${extraCards}</main><script src="archive-header.js"></script><script src="demo-analysis.js"></script><script src="sound-engine.js"></script><script src="inline-gallery.js"></script></body></html>`);
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${canonical}</loc></url></urlset>`);
