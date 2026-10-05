(() => {
 // Runs in the head, before any demo UI can be painted.
 if(new URLSearchParams(location.search).has('item')){
  const guard=document.createElement('style');
  guard.id='archive-initial-guard';
  guard.textContent='html{background:#000!important}body{visibility:hidden!important}';
  document.head.append(guard);
 }
 const nativeRAF = window.requestAnimationFrame.bind(window);
 const nativeCancel = window.cancelAnimationFrame.bind(window);
 const queued = new Map();
 let active=true,nextId=0;
 window.requestAnimationFrame = callback => {
  const id=++nextId,entry={callback,nativeId:null};queued.set(id,entry);
  if(active) entry.nativeId=nativeRAF(time=>{queued.delete(id);callback(time)});
  return id;
 };
 window.cancelAnimationFrame = id => {
  const entry=queued.get(id);if(!entry)return;
  if(entry.nativeId!==null)nativeCancel(entry.nativeId);queued.delete(id);
 };
 window.addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='archive-visibility')return;
  if(active===event.data.active)return;active=event.data.active;
  for(const [id,entry] of queued){
   if(!active){if(entry.nativeId!==null)nativeCancel(entry.nativeId);entry.nativeId=null;}
   else entry.nativeId=nativeRAF(time=>{queued.delete(id);entry.callback(time)});
  }
 });
})();
