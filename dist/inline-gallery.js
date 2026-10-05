(() => {
 const sources=new Map(),tasks=new Map();let next=0,last=0;
 function schedule(owner,callback){const id=++next;tasks.set(id,{owner,callback});return id;}
 function tick(now){
  requestAnimationFrame(tick);if(now-last<1000/30)return;last=now;
  for(const [id,t] of [...tasks])if(t.owner.active&&!document.hidden){tasks.delete(id);try{t.callback(now)}catch(e){console.error('Animation frame',t.owner.host.dataset.series,e)}}
 }
 requestAnimationFrame(tick);
 function source(id){if(!sources.has(id))sources.set(id,fetch('studies/'+id+'.json').then(r=>{if(!r.ok)throw Error(id);return r.json()}));return sources.get(id);}
 async function mount(owner){
  if(owner.loading||owner.mounted)return;owner.loading=true;
  try{
   const data=await source(owner.host.dataset.series),shadow=owner.host.attachShadow({mode:'open'});
   const template=document.createElement('template');template.innerHTML=data.html;
   const scripts=[...template.content.querySelectorAll('script')];scripts.forEach(s=>s.remove());
   const style=document.createElement('style');style.textContent=data.css;
   shadow.append(style,template.content);
   const scopedDocument=new Proxy(document,{get(target,key){
    if(key==='getElementById')return id=>shadow.querySelector('[id="'+CSS.escape(id)+'"]');
    if(key==='querySelector')return shadow.querySelector.bind(shadow);
    if(key==='querySelectorAll')return shadow.querySelectorAll.bind(shadow);
    if(key==='addEventListener'||key==='removeEventListener')return()=>{};
    const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
   }});
   const raf=fn=>schedule(owner,fn),cancel=id=>tasks.delete(id);
   const scopedWindow=new Proxy(window,{get(target,key){
    if(key==='requestAnimationFrame')return raf;if(key==='cancelAnimationFrame')return cancel;
    if(key==='addEventListener')return(name,fn)=>{if(name==='resize')owner.resize=fn};
    const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
   }});
   class CardIntersectionObserver{
    constructor(callback){this.callback=callback;this.targets=new Map()}
    observe(target){const observer=new IntersectionObserver(entries=>this.callback(entries.map(e=>{const selected=!owner.panel||target===owner.panel||target.contains(owner.panel);return {target,isIntersecting:e.isIntersecting&&selected,time:e.time,intersectionRatio:selected?e.intersectionRatio:0}})),{rootMargin:'240px'});this.targets.set(target,observer);observer.observe(owner.host)}
    unobserve(target){this.targets.get(target)?.disconnect();this.targets.delete(target)}
    disconnect(){for(const observer of this.targets.values())observer.disconnect();this.targets.clear()}
   }
   for(const script of scripts){const code=script.src?await fetch(new URL(script.getAttribute('src'),'https://local.invalid/studies/').pathname.slice(1)).then(r=>r.text()):script.textContent;
    new Function('document','window','requestAnimationFrame','cancelAnimationFrame','IntersectionObserver',code)(scopedDocument,scopedWindow,raf,cancel,CardIntersectionObserver);
   }
   const item=owner.host.dataset.item;
   if(item!==undefined){
    const options=[...shadow.querySelectorAll('button[data-style]')];options[Number(item)]?.click();
    const art=shadow.querySelectorAll('canvas')[options.length?0:Number(item)]||shadow.querySelector('svg');
    if(!art)throw Error('Missing artwork');
    // Preserve the source panel identity after moving its canvas. Hidden sibling
    // panels must not draw merely because their shared gallery host is visible.
    owner.panel=art.closest('figure');
    art.setAttribute('aria-label',owner.host.getAttribute('aria-label'));
    const surface=document.createElement('div');surface.className='direct-surface';surface.append(art);shadow.append(surface);
    const isolate=document.createElement('style');isolate.textContent=':host{display:block} :host> *{display:none!important} :host>.direct-surface{display:flex!important;align-items:center;justify-content:center;width:100%;height:240px;background:#000} .direct-surface canvas{display:block!important;width:70%!important;height:44px!important;max-width:360px!important;min-width:0!important}';shadow.append(isolate);
   }else{
    const chrome=document.createElement('style');chrome.textContent=':host{display:grid!important;place-items:center;padding:32px;min-height:0!important}button,[class*="controls"],.viz-controls{display:none!important} img{max-width:100%} .composition-export{display:block!important;width:min(70%,560px)!important;min-height:0!important;max-width:560px!important;height:auto!important;aspect-ratio:1;margin:0!important;padding:0!important;background:#000}.composition-square{display:block!important;width:100%!important;height:100%!important;aspect-ratio:1;margin:0!important}.composition-square canvas{display:block;width:100%!important;height:100%!important}canvas{max-width:100%}';shadow.append(chrome);
    shadow.querySelectorAll('img').forEach(img=>{img.src=img.getAttribute('src').replace(/^\.\.\//,'')});
   }
   owner.resize?.();owner.mounted=true;owner.host.dataset.ready='true';
   shadow.querySelectorAll('canvas').forEach(art=>art.setAttribute('aria-label',owner.host.getAttribute('aria-label')));
  }catch(error){owner.host.textContent='Preview could not load.';console.error(owner.host.dataset.series,error)}finally{owner.loading=false}
 }
 const owners=new Map();
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const owner=owners.get(e.target);owner.active=e.isIntersecting;if(owner.active)mount(owner);}},{rootMargin:'240px'});
 document.querySelectorAll('.animation-card').forEach(host=>{const owner={host,active:false,mounted:false};owners.set(host,owner);observer.observe(host)});
 window.addEventListener('resize',()=>{for(const owner of owners.values())if(owner.mounted)owner.resize?.()});
})();
