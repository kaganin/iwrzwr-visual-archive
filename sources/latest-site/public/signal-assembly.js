(()=>{
'use strict';
const root=document.getElementById('signal-assembly');
if(!root)return;
const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const duration=20,tau=Math.PI*2,white='#FFFFFF',red='#FF0000';
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const fract=x=>x-Math.floor(x),mod=(x,n)=>(x%n+n)%n;
const hash=n=>fract(Math.sin(n*127.1+43.7)*43758.5453);
const grayAlpha=a=>a<=0?0:[.16,.32,.56,1].reduce((best,v)=>Math.abs(v-a)<Math.abs(best-a)?v:best);
let time=.7,paused=reduced.matches,visible=true,last=0,raf=0;
// Live sound seam: iwrSignal exists only inside the archive gallery. Without it, or with sound off, nothing changes.
const hearing=()=>typeof iwrSignal!=='undefined'&&iwrSignal.active?iwrSignal:null;
const charge=(band='amp',age=0)=>{const s=hearing();return s?Math.max(0,Math.min(1,s.bandAt?s.bandAt(band,age):(s[band]??s.level??0))):0;};
const strike=(kind='kick')=>{const s=hearing();return s?.eventAt?s.eventAt(kind):{n:Math.floor(s?.beat??0),age:s?.[kind+'Age']??30};};
// The composition moves on the beat and rests between hits; its own dt clamp still applies first.
const conduct=()=>{const s=hearing();return s?0.25+4.2*s.hit:1;};
function ink(alpha=1,color=white){ctx.globalAlpha=color===white?grayAlpha(alpha):clamp(alpha);ctx.fillStyle=color;ctx.strokeStyle=color;}
function rect(x,y,w,h,alpha=1,color=white){ink(alpha,color);ctx.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,w,h);}
function line(points,alpha=1,color=white){ink(alpha,color);ctx.lineWidth=1;ctx.lineCap='butt';ctx.lineJoin='miter';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
function box(x,y,w,h,alpha=1,color=white){line([[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]],alpha,color);}

function loupe(phase){
  const w=412,width=.24,writer=.5-.5*Math.cos(phase*tau),start=writer*(1-width),end=start+width,signalStart=start*.5,span=w-16;
  const overview=u=>8+u*span,detail=u=>8+(u-signalStart)/width*span,left=overview(start),right=overview(end);
  line([[8,16],[w-8,16]],.32);line([[8,38],[w-8,38]],.24);
  line([[8,28],[left,33]],.16);line([[w-8,28],[right,33]],.16);box(left,33,right-left,10,.7,red);
  for(let i=0;i<17;i++){
    const position=(i+.35+hash(i)*.25)/17,amplitude=hearing()?.1+charge('amp',(16-i)*.13)*.9:.35+hash(i*5)*.65,selected=position>=start&&position<=end;
    line([[overview(position),38-amplitude*2],[overview(position),38+amplitude*2]],selected?1:.4,selected?red:white);
    const x=detail(position),markWidth=Math.min(12,.018/width*span);
    ctx.save();ctx.beginPath();ctx.rect(8,4,span,24);ctx.clip();
    line([[x-markWidth,16],[x,16-amplitude*9],[x+markWidth*.4,16+amplitude*7],[x+markWidth,16]],1);ctx.restore();
  }
  line([[8,6],[8,26]],.32);line([[w-8,6],[w-8,26]],.32);
}

function vernier(phase){
  const w=400,center=w/2,pitch=8,lowerPitch=9,shift=hearing()?(charge('high')-charge('low'))*18:Math.sin(phase*tau)*18;
  line([[2,17],[w-2,17]],.3);line([[2,27],[w-2,27]],.3);
  for(let i=-Math.ceil(w/pitch);i<=Math.ceil(w/pitch);i++){
    const x=center+i*pitch;if(x<2||x>w-2)continue;
    const major=mod(i,5)===0,near=Math.abs(mod(x-center-shift+lowerPitch/2,lowerPitch)-lowerPitch/2)<1;
    rect(x,major?5:10,1,major?12:7,near?.95:.45,near?red:white);
  }
  for(let i=-Math.ceil(w/lowerPitch);i<=Math.ceil(w/lowerPitch);i++){
    const x=center+i*lowerPitch+shift;if(x<2||x>w-2)continue;
    const major=mod(i,5)===0,near=Math.abs(mod(x-center+pitch/2,pitch)-pitch/2)<1;
    rect(x,27,1,major?12:7,near?.95:.45,near?red:white);
  }
  line([[center-13,3],[center-13,1],[center+13,1],[center+13,3]],.65);
  line([[center-13,41],[center-13,43],[center+13,43],[center+13,41]],.65);
  const error=clamp(shift/18,-1,1)*11;line([[center,22],[center+error,22]],.95,red);rect(center+error-1.5,20.5,3,3,1,red);
}

function loom(phase){
  const w=396,middle=w*.52,ys=[10,22,34],travel=phase*120;
  for(let lane=0;lane<3;lane++){
    const y=ys[lane],next=ys[(lane+1)%3];line([[0,y],[middle-10,y],[middle+10,next],[w,next]],.16);
    for(let j=-1;j<Math.ceil(w/24)+7;j++){
      const raw=j*24-travel-lane*8,len=7+(hearing()?charge(['low','mid','high'][lane],Math.abs(j)*.06):hash(mod(j,5)+lane*9))*11;
      const mapY=x=>x<middle-10?y:x>middle+10?next:y+(next-y)*(x-(middle-10))/20,points=[];
      for(let k=0;k<=6;k++){const x=raw+k/6*len;points.push([x,mapY(x)]);}
      const live=raw<middle&&raw+len>middle;line(points,live?1:.75,live?red:white);line([[raw,mapY(raw)-2],[raw,mapY(raw)+2]],.45);
    }
  }
  line([[middle-6,2],[middle+6,2]],.6,red);line([[middle-6,42],[middle+6,42]],.6,red);
}

function row(draw,x,y,width,phase){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,width,44);ctx.clip();draw(phase);ctx.restore();}
function paint(seconds=time){
  const slowPhase=mod(seconds,duration)/duration,tenSecondPhase=mod(seconds,10)/10;
  ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,540,540);
  row(loupe,64,116,412,slowPhase);
  row(vernier,70,248,400,tenSecondPhase);
  row(loom,72,380,396,tenSecondPhase);
  ctx.globalAlpha=1;
}
function schedule(){if(!raf&&!paused&&visible&&!document.hidden&&root.isConnected){last=0;raf=requestAnimationFrame(frame);}}
function frame(now){raf=0;if(paused||!visible||document.hidden||!root.isConnected)return;const heard=hearing();if(heard?.source==='demo')time=heard.songTime;else if(last)time=mod(time+Math.min((now-last)/1000,.1)*conduct(),duration);last=now;paint();raf=requestAnimationFrame(frame);}
reduced.addEventListener('change',e=>{paused=e.matches;schedule();});
document.addEventListener('visibilitychange',()=>{last=0;schedule();});
new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;last=0;schedule();}).observe(root);
root.compositionPreview={duration,width:1080,height:1080,renderAt(seconds){paused=true;time=mod(seconds,duration);paint();},play(){paused=false;schedule();},pause(){paused=true;}};
paint();schedule();
})();
