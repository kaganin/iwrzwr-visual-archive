(()=>{
'use strict';
const root=document.getElementById('orbital-memory');
if(!root)return;
const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const duration=20,tau=Math.PI*2,white='#FFFFFF',accent='#FF0000';
const frac=x=>x-Math.floor(x),mod=(x,n)=>(x%n+n)%n;
const grayAlpha=a=>a<=0?0:[.16,.32,.56,1].reduce((best,v)=>Math.abs(v-a)<Math.abs(best-a)?v:best);
let time=1.72,paused=reduced.matches,visible=true,last=0,raf=0;

// Three matrix studies on the same sharp 2px / 4px lattice as the gallery cards.
function drawMatrixStudy(w,style,t){
  const cols=Math.max(2,Math.floor((w-(style==='parity-bloom'?8:4))/4)),left=Math.round((w-cols*4)/2);
  const cell=(c,r,level=1,hot=false,y=3)=>{
    ctx.globalAlpha=hot?1:grayAlpha(level);
    ctx.fillStyle=hot?accent:white;
    ctx.fillRect(left+c*4,y+r*4,2,2);
  };
  ctx.clearRect(0,0,w,44);
  if(style==='echo-orchard'){
    // Snare events of the original 108 BPM sample, including its quiet tail.
    const step=60/108/2,span=Math.round(step*32*32000)/32000;
    const snare=[4,12,20].map(s=>s*step);
    const ageAt=u=>{
      const local=mod(u,span);
      for(let i=snare.length-1;i>=0;i--)if(local>=snare[i])return local-snare[i];
      return local+span-snare[snare.length-1];
    };
    const echoes=Array.from({length:5},(_,i)=>{
      const age=ageAt(t-i*.16);
      const settling=Math.min(1,Math.max(0,(age-.9)/.8));
      const travelAge=age<=.9?age:.9+.4*(2*settling-settling*settling);
      return {cx:(i-2)*.37,radius:.09+travelAge*.29,strength:Math.max(.16,Math.exp(-age*1.4)*(1-i*.11)),age};
    });
    for(let c=0;c<cols;c++)for(let r=0;r<10;r++){
      const u=c/(cols-1)*2-1,v=r/9*2-1,grain=mod(c*13+r*23+(c^r)*7,19)/19;
      if(grain<=.15)continue;
      let level=0,hot=false;
      echoes.forEach((echo,i)=>{
        const shell=Math.abs(Math.hypot((u-echo.cx)*1.7,v*.38)-echo.radius);
        if(shell<.07&&echo.strength>level){level=echo.strength;hot=i===0&&echo.age<1.3&&shell<.026;}
      });
      if(level)cell(c,r,level,hot);
    }
  }else if(style==='orbit-register'){
    const phase=t/5,angle=phase*6.28,ax=Math.cos(angle)*.7,ay=Math.sin(angle)*.75;
    const hash=(x,y)=>frac(Math.sin(x*127.1+y*311.7)*43758.5453);
    for(let c=0;c<cols;c++)for(let r=0;r<10;r++){
      const u=c/(cols-1)*2-1,v=r/9*2-1;
      const da=Math.hypot((u-ax)*1.5,v-ay),db=Math.hypot((u+ax)*1.5,v+ay);
      const ring=Math.hypot(u/.72,v/.78);
      const hot=da<.16||db<.16;
      const on=hot||(Math.abs(ring-1)<.11&&mod(c+r,3)===0)||((da<.48||db<.48)&&mod(c+r,2)===0);
      if(!on)continue;
      cell(c,r,hash(c,7+r)>.88?1:.32,hot);
    }
  }else if(style==='parity-bloom'){
    const half=Math.floor(cols/2),step=Math.floor(t/2.4);
    const gain=Math.sin(Math.PI*frac(t/2.4))**2;
    const radius=5+gain*half;
    for(let c=0;c<cols;c++)for(let r=0;r<9;r++){
      const x=Math.abs(c-half),y=Math.abs(r-4),band=x+y*2;
      if(((x^(y*3)^step)%7)>=3||band>=radius+6)continue;
      cell(c,r,.35+.4*(1-y/5),Math.abs(band-radius)<2,5);
    }
  }
  ctx.globalAlpha=1;
}

function row(style,x,y,width,t){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,width,44);ctx.clip();drawMatrixStudy(width,style,t);ctx.restore();}
function paint(seconds=time){
  ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,540,540);
  row('echo-orchard',64,116,412,seconds);
  row('orbit-register',64,248,412,seconds);
  row('parity-bloom',64,380,412,seconds);
  ctx.globalAlpha=1;
}
function schedule(){if(!raf&&!paused&&visible&&!document.hidden&&root.isConnected){last=0;raf=requestAnimationFrame(frame);}}
function frame(now){raf=0;if(paused||!visible||document.hidden||!root.isConnected)return;if(last)time+=Math.min((now-last)/1000,.1);last=now;paint();raf=requestAnimationFrame(frame);}
reduced.addEventListener('change',e=>{paused=e.matches;schedule();});
document.addEventListener('visibilitychange',()=>{last=0;schedule();});
new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;last=0;schedule();}).observe(root);
root.compositionPreview={duration,width:1080,height:1080,renderAt(seconds){paused=true;time=seconds;paint();},play(){paused=false;schedule();},pause(){paused=true;}};
paint();schedule();
})();
