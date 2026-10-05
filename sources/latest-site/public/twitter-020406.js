(()=>{
'use strict';
const root=document.getElementById('twitter-020406');
if(!root)return;
const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const duration=20,tau=Math.PI*2,white='#FFFFFF',red='#FF0000';
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const mod=(x,n)=>(x%n+n)%n,fract=x=>x-Math.floor(x);
const grayAlpha=a=>a<=0?0:[.16,.32,.56,1].reduce((best,v)=>Math.abs(v-a)<Math.abs(best-a)?v:best);
let time=.7,paused=reduced.matches,visible=true,last=0,raf=0;
function ink(alpha=1,color=white){ctx.globalAlpha=color===white?grayAlpha(clamp(alpha)):clamp(alpha);ctx.fillStyle=color;ctx.strokeStyle=color;}
function rect(x,y,w,h,alpha=1,color=white){ink(alpha,color);ctx.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,w,h);}
function line(points,alpha=1,color=white){if(!points.length)return;ink(alpha,color);ctx.lineWidth=1;ctx.lineCap='butt';ctx.lineJoin='miter';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
function area(points,alpha=.12,color=white){if(points.length<3)return;ink(alpha,color);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
function marker(x,y,alpha=1,color=white,size=2){rect(x-size/2,y-size/2,size,size,alpha,color);}

function pulse(time,period=1.8,length=.95){const age=mod(time,period);return age>=length?0:Math.pow(Math.sin(Math.PI*age/length),2);}
function flare(time){
  const w=412,opening=1.2+pulse(time,2.4,1.65)*6,throat=w*.2,shoulder=w*.38,rim=w*.76;
  line([[4,22],[throat,22]],.85);
  line([[throat-3,18],[throat-3,26]],.36);
  for(let track=0;track<5;track++){
    const offset=track-2,endpoint=8+track*7,points=[[throat,22],[shoulder,22+offset*.7],[rim,22+offset*opening],[w-9,endpoint]];
    line(points,track===2?.8:.66,track===2?red:white);
    line([[w-7,endpoint],[w-3,endpoint]],.35,track===2?red:white);
  }
  line([[rim-3,22-opening*2-3],[rim,22-opening*2-3],[rim,22+opening*2+3],[rim-3,22+opening*2+3]],.48,red);
}

function strainPoint(u,v,locus,w){
  const pin=Math.sin(Math.PI*u)*Math.sin(Math.PI*v),a=(u-locus.u)/.2,b=(v-locus.v)/.42,influence=Math.exp(-(a*a+b*b))*.86*pin;
  return [5+(u+(locus.u-u)*.38*influence)*(w-10),5+(v+locus.pull*.32*influence)*34];
}
function strain(time){
  const w=412,motionTime=time*1.2*48/Math.max(24,(w-10)*.7),travel=fract(motionTime/2.4),locus={u:travel,v:.5,pull:Math.sin(travel*Math.PI*6)};
  ctx.save();ctx.beginPath();ctx.rect(5,5,w-10,34);ctx.clip();
  for(let row=1;row<4;row++){const points=[];for(let j=0;j<=42;j++)points.push(strainPoint(j/42,row/4,locus,w));line(points,row===2?1:.31);}
  for(let col=1;col<8;col++){const points=[];for(let j=0;j<=20;j++)points.push(strainPoint(col/8,j/20,locus,w));line(points,.32);}
  const p=strainPoint(locus.u,locus.v,locus,w),radius=3.86;
  line([[p[0]-radius,p[1]],[p[0]+radius,p[1]]],.95,red);line([[p[0],p[1]-radius],[p[0],p[1]+radius]],.95,red);
  ctx.restore();
}

function sectionCurve(x){return .48*Math.sin(x*5.5)+.06*Math.cos(x*2.1);}
function section(time){
  const w=412,project=(x,y,z)=>[10+x*(w-30)+z*10,26-y*10-z*12],cut=fract(time*.4675/2.4);
  const plane=[project(cut,-1,0),project(cut,-1,1),project(cut,1,1),project(cut,1,0),project(cut,-1,0)];
  if(cut<(w-40)/(w-30)){area(plane,.035);line(plane,.6);}
  const cross=[];
  for(let rail=0;rail<5;rail++){
    const z=rail/4,points=[],slice=[];
    for(let j=0;j<=40;j++){const x=j/40;points.push(project(x,sectionCurve(x),z));}
    line(points,.32);
    for(let j=0;j<=8;j++){const x=cut-.04+j*.08/8;if(x>=0&&x<=1)slice.push(project(x,sectionCurve(x),z));}
    line(slice,.9);
    const hit=project(cut,sectionCurve(cut),z);cross.push(hit);marker(hit[0],hit[1],1,red,2);
  }
  line(cross,.9,red);
}

function row(draw,x,y,width,phase){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,width,44);ctx.clip();draw(phase);ctx.restore();}
function paint(seconds=time){
  ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,540,540);
  row(flare,64,116,412,seconds);
  row(strain,64,248,412,seconds);
  row(section,64,380,412,seconds);
  ctx.globalAlpha=1;
}
function schedule(){if(!raf&&!paused&&visible&&!document.hidden&&root.isConnected){last=0;raf=requestAnimationFrame(frame);}}
function frame(now){raf=0;if(paused||!visible||document.hidden||!root.isConnected)return;if(last)time=mod(time+Math.min((now-last)/1000,.1),duration);last=now;paint();raf=requestAnimationFrame(frame);}
reduced.addEventListener('change',e=>{paused=e.matches;schedule();});
document.addEventListener('visibilitychange',()=>{last=0;schedule();});
new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;last=0;schedule();}).observe(root);
root.twitterPreview={duration,width:1080,height:1080,renderAt(seconds){paused=true;time=mod(seconds,duration);paint();},play(){paused=false;schedule();},pause(){paused=true;}};
paint();schedule();
})();
