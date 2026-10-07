import fs from 'node:fs';
const tab=await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map();let n=0;
ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){pending.get(d.id)?.(d.result);pending.delete(d.id);}};
await new Promise(r=>ws.onopen=r);
const call=(method,params={})=>new Promise(r=>{pending.set(++n,r);ws.send(JSON.stringify({id:n,method,params}));});
await call('Page.enable');await call('DOM.enable');await call('CSS.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
for(const font of ['sf','fallback']){
 await call('Page.navigate',{url:'http://127.0.0.1:8765/?font='+font});await new Promise(r=>setTimeout(r,1600));
 await call('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
 const metrics=await call('Runtime.evaluate',{expression:`JSON.stringify({preview:document.documentElement.dataset.fontPreview,padding:getComputedStyle(document.querySelector('main')).paddingTop,titleTop:document.querySelector('h1').getBoundingClientRect().top,family:getComputedStyle(document.querySelector('h1')).fontFamily})`,returnByValue:true});
 const doc=await call('DOM.getDocument');const node=await call('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'h1'});
 console.log(font,metrics.result.value,await call('CSS.getPlatformFontsForNode',{nodeId:node.nodeId}));
 const styles=await call('Runtime.evaluate',{expression:`JSON.stringify(['h1','.archive-intro p','.intro-repo','.secondary-button','.series h2','figcaption','header .brand'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return {selector,size:s.fontSize,tracking:s.letterSpacing,weight:s.fontWeight,lineHeight:s.lineHeight};}))`,returnByValue:true});
 console.log(font,styles.result.value);
 const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('/tmp/iwrzwr-font-'+font+'.png',Buffer.from(shot.data,'base64'));
}
ws.close();await fetch('http://127.0.0.1:9224/json/close/'+tab.id);
