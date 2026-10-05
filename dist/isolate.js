(() => {
 const value=new URLSearchParams(location.search).get('item');
 if(value===null)return;
 const index=Number(value);
 const options=[...document.querySelectorAll('button[data-style]')];
 options[index]?.click();
 const figures=[...document.querySelectorAll('figure')];
 const panel=figures.length>1?figures[index]:null;
 const art=panel?.querySelector('canvas,svg')||document.querySelectorAll('canvas')[options.length?0:index]||document.querySelector('svg');
 if(!art)return;
 const style=document.createElement('style');
 style.textContent='html,body{margin:0!important;padding:0!important;background:#000!important;height:100%!important;overflow:hidden!important}body *{visibility:hidden!important}canvas[data-isolated],svg[data-isolated],svg[data-isolated] *{visibility:visible!important}canvas[data-isolated],svg[data-isolated]{position:fixed!important;left:24px!important;top:50%!important;transform:translateY(-50%)!important;width:calc(100vw - 48px)!important;height:44px!important;max-width:none!important;max-height:none!important;z-index:9999!important}body[data-round-art] canvas[data-isolated],body[data-round-art] svg[data-isolated]{width:200px!important;height:200px!important;left:50%!important;transform:translate(-50%,-50%)!important;object-fit:contain!important}';
 document.head.append(style);
 art.dataset.isolated='';
 if(art.tagName.toLowerCase()==='svg'||art.width===art.height)document.body.dataset.roundArt='';
 window.dispatchEvent(new Event('resize'));
 // Selected art is already the only visible subtree; remove the early guard.
 document.getElementById('archive-initial-guard')?.remove();
})();
