// Unit checks for dist/sound-engine.js with a fake Web Audio API (no browser needed).
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code = fs.readFileSync(new URL('../dist/sound-engine.js', import.meta.url), 'utf8');
const analysisCode = fs.readFileSync(new URL('../dist/demo-analysis.js', import.meta.url), 'utf8');

function boot({ audio = true, resumeTo = 'running', wave = 'silence', latency = 0 } = {}) {
  const listeners = {};
  const made = { contexts: [], wave };
  class FakeContext {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 48000; this.closed = false; this.onstatechange = null; this.outputLatency = latency; made.contexts.push(this); }
    resume() { this.state = resumeTo; return Promise.resolve(); }
    close() { this.closed = true; this.state = 'closed'; return Promise.resolve(); }
    createBuffer(channels, length) { return { length, copyToChannel(data, channel) { (made.channels ||= [])[channel] = data.slice(); } }; }
    createBufferSource() { return { connect() {}, disconnect() {}, start() {}, stop() {}, loop: false, buffer: null }; }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
    createAnalyser() {
      const analyser = {
        fftSize: 1024, frequencyBinCount: 512, smoothingTimeConstant: 0, connect() {}, disconnect() {},
        getFloatTimeDomainData(array) { for (let i = 0; i < array.length; i++) { const kind = made.wave; array[i] = kind === 'nan' ? NaN : kind === 'loud' ? (i % 2 ? 4 : -4) : kind === 'tone' ? Math.sin(i / 4) * .2 : 0; } },
        getByteFrequencyData(array) { for (let i = 0; i < array.length; i++) array[i] = made.wave === 'loud' ? 255 : made.wave === 'tone' ? (i < 40 ? 180 : 20) : 0; },
      };
      return analyser;
    }
  }
  const window = { AudioContext: audio ? FakeContext : undefined, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const document = { hidden: false, addEventListener: (name, fn) => { listeners['document:' + name] = fn; } };
  const sandbox = vm.createContext({ window, document, navigator: {}, console, Math, Number, Object, Set, Float32Array, Uint8Array, Promise, Error });
  vm.runInContext(analysisCode, sandbox, { filename: 'demo-analysis.js' });
  vm.runInContext(code, sandbox, { filename: 'sound-engine.js' });
  return { engine: window.iwrSoundEngine, signal: window.iwrSignal, made, listeners, window, document };
}
const everyFinite = signal => Object.entries(signal).every(([key, value]) => typeof value === 'string' || typeof value === 'boolean' || Number.isFinite(value));

// 1. shape before anything starts: frozen, finite, silent
{
  const { engine, signal } = boot();
  assert(Object.isFrozen(signal), 'facade is frozen');
  assert(everyFinite(signal), 'every field finite before start');
  assert.equal(signal.active, false); assert.equal(signal.source, 'off'); assert.equal(signal.mode, 'play');
  assert.equal(signal.kickAge, 30); assert.equal(engine.supported, true);
  assert.equal(signal.hit, 0); assert.equal(signal.songTime, 0); assert.equal(signal.noteAge, 30);
  assert.equal(signal.levelAt(1), 0); assert.equal(signal.hitAt(0), 0); assert.equal(Object.keys(signal).includes('levelAt'), false, 'methods are not enumerable fields');
  try { signal.level = 1; } catch (error) { /* strict mode may throw */ }
  assert.equal(signal.level, 0, 'facade cannot be written to');
  engine.update();                                   // inactive update is a no-op
  assert.equal(signal.level, 0);
}

// 2. start, update with silence, a tone, NaN input and clipped input; kick pulse
{
  const { engine, signal, made } = boot({ wave: 'tone' });
  assert.equal(await engine.start(), true);
  assert.equal(signal.active, true); assert.equal(signal.source, 'demo'); assert.equal(signal.status, 'on');
  made.contexts[0].currentTime = .02; engine.update();
  assert(signal.pulse > .8, 'pulse is high just after a kick, got ' + signal.pulse);
  assert(signal.hit >= signal.pulse - 1e-9 && signal.hit <= 1, 'hit covers the kick pulse');
  const song0 = signal.songTime;
  assert(signal.kickAge < .05 && signal.kickAge >= 0);
  made.contexts[0].currentTime = 3; engine.update();  // between events
  assert(signal.songTime > song0 && signal.songTime <= 3 + 1e-9, 'songTime follows the audio clock, got ' + signal.songTime);
  assert(signal.pulse < .5, 'pulse decays between events, got ' + signal.pulse);
  for (let t = 0; t < 40; t += .033) { made.contexts[0].currentTime = t; engine.update(); assert(everyFinite(signal), 'finite at t=' + t); assert(signal.level >= 0 && signal.level <= 1); assert(signal.kickAge <= 30 && signal.snareAge <= 30 && signal.hatAge <= 30); }
  assert(signal.beat >= 0 && signal.loopTime >= 0 && signal.loopTime < engine.loopSeconds + .001);
  // history: levelAt / hitAt stay finite in [0,1], look back in time, and are silent beyond what was heard
  assert.equal(signal.levelAt(0) >= 0 && signal.levelAt(0) <= 1, true);
  for (const age of [0, .1, 1, 3.9, 50, -5, NaN, Infinity, undefined]) { const v = signal.levelAt(age), h = signal.hitAt(age); assert(Number.isFinite(v) && v >= 0 && v <= 1 && Number.isFinite(h) && h >= 0 && h <= 1, 'history finite for age ' + age); }
  assert.equal(signal.levelAt(500), 0, 'older than history is silent');
  engine.stop();
  assert.equal(signal.active, false); assert.equal(signal.status, 'off'); assert.equal(signal.level, 0);
  assert.equal(made.contexts[0].closed, true, 'context released on stop');
}
for (const wave of ['nan', 'loud', 'silence']) {
  const { engine, signal, made } = boot({ wave });
  await engine.start();
  for (let t = 0; t < 12; t += .033) { made.contexts[0].currentTime = t; engine.update(); assert(everyFinite(signal), wave + ' finite at t=' + t); assert(signal.level <= 1 && signal.low <= 1 && signal.mid <= 1 && signal.high <= 1); }
}

// 3. blocked, unavailable, interruption, hidden tab, double start, stop while starting
{
  const { engine, signal } = boot({ resumeTo: 'suspended' });
  assert.equal(await engine.start(), false); assert.equal(signal.status, 'blocked'); assert.equal(signal.active, false);
}
{
  const { engine, signal } = boot({ audio: false });
  assert.equal(engine.supported, false); assert.equal(await engine.start(), false); assert.equal(signal.status, 'unavailable');
}
{
  const { engine, signal, made } = boot();
  await engine.start(); made.contexts[0].state = 'interrupted'; made.contexts[0].onstatechange();
  assert.equal(signal.active, false, 'interruption ends the session');
}
{
  const { engine, signal, listeners, document } = boot();
  await engine.start(); document.hidden = true; listeners['document:visibilitychange']();
  assert.equal(signal.active, false, 'hidden tab stops sound');
  await engine.start(); listeners.pagehide();
  assert.equal(signal.active, false, 'pagehide stops sound');
}
{
  const { engine, signal, made } = boot();
  const first = engine.start(); const second = engine.start();
  assert.equal(await second, false, 'a second tap while starting does nothing');
  assert.equal(await first, true); assert.equal(made.contexts.length, 1, 'one context only');
  const pending = engine.toggle(); assert.equal(await pending, false); assert.equal(signal.active, false);
  const racing = engine.start(); engine.stop(); await racing;
  assert.equal(signal.active, false, 'stop while starting wins'); assert.equal(signal.status, 'off');
}
// 4. history returns what was heard earlier, not what is heard now
{
  const { engine, signal, made } = boot({ wave: 'tone' });
  await engine.start();
  for (let t = .033; t < 1.5; t += .033) { made.contexts[0].currentTime = t; engine.update(); }
  const heardNow = signal.levelAt(0);
  made.wave = 'silence';
  for (let t = 1.5; t < 3; t += .033) { made.contexts[0].currentTime = t; engine.update(); }
  assert(signal.level < heardNow, 'level fell after the tone stopped');
  assert(signal.levelAt(1.4) > signal.levelAt(0) + .2, 'one second ago was louder than now: ' + signal.levelAt(1.4) + ' vs ' + signal.levelAt(0));
  assert(Math.abs(signal.levelAt(0) - signal.level) < .05, 'age 0 is the current level');
}
// 5. All demo consumers share one analysis, and event ages match audible time.
{
 const {engine,signal,made}=boot({wave:'tone',latency:.2});
 const first=engine.demoAnalysis();assert(Object.isFrozen(first));
 assert.equal(engine.demoAnalysis(),first,'one cached analysis');
 await engine.start();made.contexts[0].currentTime=.21;engine.update();
 assert(Math.abs(signal.songTime-.01)<1e-8,'output latency applied to transport');
 assert(Math.abs(signal.kickAge-signal.songTime)<1e-8,'kick and transport aligned');
 assert(Math.abs(signal.eventAt('kick').age-signal.kickAge)<1e-8,'event and facade aligned');
 assert(signal.pulse>.9,'the audible kick is still fresh');
 for(const key of ['bandAt','spectrumAt','sampleAt','eventAt'])assert(!Object.keys(signal).includes(key),'method is not a signal field');
 made.contexts[0].currentTime=4.3;engine.update();
 for(const age of [0,.1,1,-5,NaN,Infinity,500]){
  for(const band of ['amp','low','mid','high','unknown']){const v=signal.bandAt(band,age);assert(Number.isFinite(v)&&v>=0&&v<=1);}
  for(const position of [0,.2,1,-4,5,NaN,Infinity]){const v=signal.spectrumAt(position,age);assert(Number.isFinite(v)&&v>=0&&v<=1);}
  for(const channel of ['mono','left','right','unknown'])assert(Math.abs(signal.sampleAt(age,channel))<=1);
  for(const kind of ['kick','snare','hat','note','unknown']){const e=signal.eventAt(kind,age);assert(Object.isFrozen(e));assert(Number.isFinite(e.n)&&Number.isFinite(e.age)&&e.age>=0);}
 }
 for(const t of [0,.017,.5,3.6,8.88887,9,35]){
  const f=first.signal(t);
  for(const key of ['amp','low','mid','high'])assert.equal(first.value(key,t),f[key],'allocation-free feature equals original analysis');
  for(let i=0;i<8;i++)assert(Math.abs(first.spectrum(t,i/7)-f.bins[i])<1e-12);
  const copied=first.signal(t);copied.bins[0]=-100;assert(first.signal(t).bins[0]>=0,'returned bins cannot mutate cache');
 }
 const sample=first.sample(.05,'left');first.copyToBuffer({copyToChannel(data){data.fill(99);}});assert.equal(first.sample(.05,'left'),sample,'buffer copying cannot leak mutable PCM');
 for(const bad of [NaN,Infinity,undefined])assert(Number.isFinite(first.wave(bad,bad)));
 engine.stop();for(const method of ['bandAt','spectrumAt','sampleAt'])assert.equal(signal[method](0),0);
 await engine.start();assert.equal(engine.demoAnalysis(),first,'restart keeps cache');engine.stop();
}
console.log(JSON.stringify({ soundEngine: 'pass', sharedAnalysis: 'pass', latency: 'pass', featureAPI: 'pass' }));
