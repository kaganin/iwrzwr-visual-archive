// One immutable analysis of the built-in loop. PCM stays private.
(() => {
 'use strict';
 window.iwrCreateDemoAnalysis = (pcm, rate, bpm, events) => {
  const N=pcm[0].length,step=60/bpm/2,duration=N/rate,mono=new Float32Array(N);
  for(let i=0;i<N;i++)mono[i]=(pcm[0][i]+pcm[1][i])*.5;
  const hop=400,frameCount=Math.ceil(N/hop),frameTime=hop/rate;
  const coeff=[100,220,480,1000,2200,4800,9600].map(f=>1-Math.exp(-2*Math.PI*f/rate));
  const filtered=new Float64Array(7),frames=[],maxima=new Float64Array(8);
  let peakRms=0;
  for(let start=0;start<N;start+=hop){
   const sums=new Float64Array(8);let all=0,l=0,r=0;
   for(let i=start;i<Math.min(start+hop,N);i++){
    const sample=mono[i];let previous=0;
    for(let b=0;b<7;b++){filtered[b]+=coeff[b]*(sample-filtered[b]);const band=filtered[b]-previous;sums[b]+=band*band;previous=filtered[b];}
    sums[7]+=(sample-previous)**2;all+=sample*sample;l+=pcm[0][i]**2;r+=pcm[1][i]**2;
   }
   const bins=Array.from(sums,v=>Math.sqrt(v/hop));bins.forEach((v,i)=>maxima[i]=Math.max(maxima[i],v));
   const rms=Math.sqrt(all/hop);peakRms=Math.max(peakRms,rms);frames.push({bins,rms,l:Math.sqrt(l/hop),r:Math.sqrt(r/hop),travel:0});
  }
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a)),mod=(v,n)=>(v%n+n)%n;
  let travel=0;
  frames.forEach(f=>{
   f.bins=f.bins.map((v,i)=>clamp(v/(maxima[i]*.8||1)));f.amp=clamp(f.rms/(peakRms*.8));
   f.low=(f.bins[0]+f.bins[1])/2;f.mid=(f.bins[2]+f.bins[3]+f.bins[4])/3;f.high=(f.bins[5]+f.bins[6]+f.bins[7])/3;
   f.balance=(f.r-f.l)/(f.l+f.r+.0001);f.left=clamp(f.l/(peakRms*.9));f.right=clamp(f.r/(peakRms*.9));
   travel+=Math.max(0,f.amp-.025)*frameTime;f.travel=travel;
  });
  const cycleTravel=travel;
  function signal(t){
   t=Number.isFinite(t)?t:0;
   const cycle=Math.floor(t/duration),pos=mod(t,duration)/frameTime,i=Math.min(frameCount-1,Math.floor(pos)),j=Math.min(frameCount-1,i+1),q=pos-i,a=frames[i],b=frames[j];
   const f={bins:a.bins.map((v,k)=>v+(b.bins[k]-v)*q)};
   for(const key of ['low','mid','high','amp','balance','left','right','travel'])f[key]=a[key]+(b[key]-a[key])*q;
   f.travel+=cycle*cycleTravel;return f;
  }
  function hit(t,kind){
   t=Number.isFinite(t)?t:0;
   const sequence=events[kind];if(!sequence)return {age:30,n:0};
   const local=mod(t,duration);let index=-1;
   for(let i=0;i<sequence.length;i++)if(sequence[i]*step<=local)index=i;
   return {age:index<0?local+duration-sequence[sequence.length-1]*step:local-sequence[index]*step,n:Math.floor(t/duration)*sequence.length+index+1};
  }
  function value(key,t){
   t=Number.isFinite(t)?t:0;
   const pos=mod(t,duration)/frameTime,i=Math.min(frameCount-1,Math.floor(pos)),j=Math.min(frameCount-1,i+1),q=pos-i;
   const a=frames[i][key],b=frames[j][key];return Number.isFinite(a)&&Number.isFinite(b)?a+(b-a)*q:0;
  }
  function spectrum(t,position){
   t=Number.isFinite(t)?t:0;
   const pos=mod(t,duration)/frameTime,i=Math.min(frameCount-1,Math.floor(pos)),j=Math.min(frameCount-1,i+1),q=pos-i,p=clamp(position)*7,k=Math.floor(p),next=Math.min(7,k+1),blend=p-k;
   const a=frames[i].bins,b=frames[j].bins,left=a[k]+(b[k]-a[k])*q,right=a[next]+(b[next]-a[next])*q;
   return left+(right-left)*blend;
  }
  function wave(t,u){t=Number.isFinite(t)?t:0;u=Number.isFinite(u)?u:0;const at=Math.floor(mod(t-.032+u*.032,duration)*rate);return mono[Math.min(N-1,at)]/(peakRms*3);}
  function sample(t,channel='mono'){
   const at=Math.min(N-1,Math.floor(mod(Number.isFinite(t)?t:0,duration)*rate));
   return clamp((channel==='left'?pcm[0][at]:channel==='right'?pcm[1][at]:mono[at])/.24,-1,1);
  }
  // Build the slow follower only when the refined fan first needs it.
  let softFrames=null,phaseTotal=null;
  function softSignal(t){
   if(!softFrames){
    softFrames=[];const follower=new Float64Array(8);
    for(let pass=0;pass<4;pass++)for(let i=0;i<frames.length;i++){
     const dt=Math.min(frameTime,duration-i*frameTime);
     if(pass===3)softFrames.push({bins:Array.from(follower)});
     frames[i].bins.forEach((target,k)=>{const seconds=target>follower[k]?.08:.28;follower[k]+=(target-follower[k])*(1-Math.exp(-dt/seconds));});
    }
    phaseTotal=[0,0,0];
    softFrames.forEach((f,i)=>{
     f.bands=[(f.bins[0]+f.bins[1])/2,(f.bins[2]+f.bins[3]+f.bins[4])/3,(f.bins[5]+f.bins[6]+f.bins[7])/3];f.phase=phaseTotal.slice();
     const dt=Math.min(frameTime,duration-i*frameTime);f.bands.forEach((level,k)=>{phaseTotal[k]+=Math.sqrt(level)*1.6*(.85+k*.15)*dt;});
    });
   }
   t=Number.isFinite(t)?t:0;
   const cycle=Math.floor(t/duration),local=mod(t,duration),i=Math.min(softFrames.length-1,Math.floor(local/frameTime));
   const last=i===softFrames.length-1,a=softFrames[i],b=softFrames[last?0:i+1],q=(local-i*frameTime)/(last?duration-i*frameTime:frameTime);
   return {bins:a.bins.map((v,k)=>v+(b.bins[k]-v)*q),bands:a.bands.map((v,k)=>v+(b.bands[k]-v)*q),phase:a.phase.map((v,k)=>cycle*phaseTotal[k]+v+((last?phaseTotal[k]:b.phase[k])-v)*q)};
  }
  return Object.freeze({rate,N,step,duration,frameTime,signal,value,spectrum,hit,wave,sample,softSignal,copyToBuffer(buffer){buffer.copyToChannel(pcm[0].slice(),0);buffer.copyToChannel(pcm[1].slice(),1);}});
 };
})();
