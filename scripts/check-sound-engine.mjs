// Unit checks for dist/sound-engine.js with a fake Web Audio API (no browser needed).
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code = fs.readFileSync(new URL('../dist/sound-engine.js', import.meta.url), 'utf8');

function boot({ audio = true, resumeTo = 'running', wave = 'silence' } = {}) {
  const listeners = {};
  const made = { contexts: [] };
  class FakeContext {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 48000; this.closed = false; this.onstatechange = null; made.contexts.push(this); }
    resume() { this.state = resumeTo; return Promise.resolve(); }
    close() { this.closed = true; this.state = 'closed'; return Promise.resolve(); }
    createBuffer(channels, length) { return { length, copyToChannel() {} }; }
    createBufferSource() { return { connect() {}, disconnect() {}, start() {}, stop() {}, loop: false, buffer: null }; }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
    createAnalyser() {
      const analyser = {
        fftSize: 1024, frequencyBinCount: 512, smoothingTimeConstant: 0, connect() {}, disconnect() {},
        getFloatTimeDomainData(array) { for (let i = 0; i < array.length; i++) array[i] = wave === 'nan' ? NaN : wave === 'loud' ? (i % 2 ? 4 : -4) : wave === 'tone' ? Math.sin(i / 4) * .2 : 0; },
        getByteFrequencyData(array) { for (let i = 0; i < array.length; i++) array[i] = wave === 'loud' ? 255 : wave === 'tone' ? (i < 40 ? 180 : 20) : 0; },
      };
      return analyser;
    }
  }
  const window = { AudioContext: audio ? FakeContext : undefined, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const document = { hidden: false, addEventListener: (name, fn) => { listeners['document:' + name] = fn; } };
  vm.runInNewContext(code, { window, document, navigator: {}, console, Math, Number, Object, Set, Float32Array, Uint8Array, Promise, Error }, { filename: 'sound-engine.js' });
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
console.log(JSON.stringify({ soundEngine: 'pass' }));
