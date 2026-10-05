const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  const frame=entry.target;
  if(entry.isIntersecting){if(!frame.hasAttribute('src'))frame.src=frame.dataset.src;}
  frame.dataset.active=String(entry.isIntersecting);
  frame.contentWindow?.postMessage({type:'archive-visibility',active:entry.isIntersecting},location.origin);
 }
},{rootMargin:'160px'});
document.querySelectorAll('iframe[data-src]').forEach(frame=>{
 frame.style.opacity='0';
 frame.addEventListener('load',()=>{
  if(!frame.hasAttribute('src'))return;
  frame.contentWindow?.postMessage({type:'archive-visibility',active:frame.dataset.active==='true'},location.origin);
  frame.style.opacity='1';
 });
 observer.observe(frame);
});
