// iwrzwr sound engine: one shared, read-only signal for every card.
// Off until the visitor taps play. No microphone, no upload, nothing stored.
// Studies only ever see the frozen `iwrSignal` facade; every field is finite.
(() => {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  const finite = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, finite(v, a)));
  const AGE_CAP = 30;

  // The same original 108 BPM stereo loop the sound studies already contain
  // (same seed, same event table) so a later phase can share one clock.
  const BPM = 108, RATE = 32000, STEP = 60 / BPM / 2;
  const N = Math.round(STEP * 32 * RATE), LOOP = N / RATE, BEAT = 60 / BPM;
  const EVENTS = { kick: [0, 6, 8, 16, 22], snare: [4, 12, 20], hat: [2, 3, 6, 10, 11, 14, 18, 19, 22], note: [1, 7, 9, 15, 17, 23] };
  const NOTES = [146.83, 220, 196, 293.66, 164.81, 220];

  function synth() {
    const pcm = [new Float32Array(N), new Float32Array(N)];
    let seed = 17471;
    const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 2147483648 - 1; };
    function voice(type, at, index) {
      const length = type === 'note' ? .85 : type === 'kick' ? .6 : type === 'snare' ? .28 : .1;
      const first = Math.round(at * RATE), count = Math.round(length * RATE);
      const pan = type === 'note' ? (index % 2 ? .65 : -.65) : type === 'hat' ? (index % 2 ? .4 : -.4) : 0;
      const gainL = Math.sqrt((1 - pan) / 2), gainR = Math.sqrt((1 + pan) / 2);
      let previousNoise = 0;
      for (let j = 0; j < count && first + j < N; j++) {
        const t = j / RATE, rise = Math.min(1, t / .003);
        let value = 0;
        if (type === 'kick') value = Math.sin(2 * Math.PI * (48 * t + 120 / 32 * (1 - Math.exp(-32 * t)))) * Math.exp(-12 * t) * .8 * rise;
        if (type === 'snare') value = (noise() * .68 + Math.sin(2 * Math.PI * 185 * t) * .25) * Math.exp(-23 * t) * rise * .5;
        if (type === 'hat') { const n = noise(); value = (n - previousNoise) * Math.exp(-65 * t) * rise * .17; previousNoise = n; }
        if (type === 'note') { const f = NOTES[index % NOTES.length]; value = (Math.sin(2 * Math.PI * f * t) + .3 * Math.sin(2 * Math.PI * f * 2 * t) + .12 * Math.sin(2 * Math.PI * f * 4 * t)) * Math.exp(-6.8 * t) * rise * .35; }
        pcm[0][first + j] += value * gainL; pcm[1][first + j] += value * gainR;
      }
    }
    Object.entries(EVENTS).forEach(([kind, steps]) => steps.forEach((s, i) => voice(kind, s * STEP, i)));
    let peak = 0;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(pcm[0][i]), Math.abs(pcm[1][i]));
    // The loop peaks at 0.24 of full scale: a quiet, capped level by construction.
    const scale = peak > 0 ? .24 / peak : 0;
    for (let i = 0; i < N; i++) { pcm[0][i] *= scale; pcm[1][i] *= scale; }
    return pcm;
  }

  const state = {
    active: false, source: 'off', mode: 'play', status: 'off',
    level: 0, low: 0, mid: 0, high: 0, pulse: 0, hit: 0,
    kickAge: AGE_CAP, snareAge: AGE_CAP, hatAge: AGE_CAP, noteAge: AGE_CAP, beat: 0, loopTime: 0, songTime: 0,
  };
  // Short history so trail-style studies can read the recent past (about 4 s at the gallery's 30 fps).
  const HISTORY = 160, histTime = new Float64Array(HISTORY), histLevel = new Float64Array(HISTORY), histHit = new Float64Array(HISTORY);
  let histHead = -1, histCount = 0;
  function remember() {
    histHead = (histHead + 1) % HISTORY; histCount = Math.min(HISTORY, histCount + 1);
    histTime[histHead] = state.songTime; histLevel[histHead] = state.level; histHit[histHead] = state.hit;
  }
  function recall(values, age) {
    if (!state.active || histCount < 1) return 0;
    const target = state.songTime - Math.max(0, finite(age, 0));
    let newer = histHead;
    for (let i = 0; i < histCount; i++) {
      const at = (histHead - i + HISTORY) % HISTORY;
      if (histTime[at] <= target) {
        const next = i === 0 ? at : (at + 1) % HISTORY, span = histTime[next] - histTime[at];
        return clamp(span > 1e-6 ? values[at] + (values[next] - values[at]) * ((target - histTime[at]) / span) : values[at]);
      }
      newer = at;
    }
    return 0;                                         // older than the history: silence
  }
  const methods = {
    levelAt: { value: age => recall(histLevel, age) },
    hitAt: { value: age => recall(histHit, age) },
  };
  const facade = Object.freeze(Object.defineProperties({}, Object.assign(
    Object.fromEntries(Object.keys(state).map(key => [key, { enumerable: true, get: () => state[key] }])), methods)));

  let ctx = null, src = null, analyser = null, gain = null, startedAt = 0, pcm = null, starting = false;
  let freq = null, wave = null, peakRms = .0001, peakBand = [.0001, .0001, .0001];
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn(facade); } catch (error) { console.error('sound listener', error); } });

  function resetSignal() {
    Object.assign(state, { level: 0, low: 0, mid: 0, high: 0, pulse: 0, hit: 0, kickAge: AGE_CAP, snareAge: AGE_CAP, hatAge: AGE_CAP, noteAge: AGE_CAP, beat: 0, loopTime: 0, songTime: 0 });
    peakRms = .0001; peakBand = [.0001, .0001, .0001];
    histHead = -1; histCount = 0;
  }

  function teardown() {
    try { src && src.stop(); } catch (error) { /* already stopped */ }
    try { src && src.disconnect(); analyser && analyser.disconnect(); gain && gain.disconnect(); } catch (error) { /* detached */ }
    const closing = ctx;
    src = analyser = gain = ctx = null;
    if (closing) { closing.onstatechange = null; try { closing.close().catch(() => {}); } catch (error) { /* closed */ } }
    state.active = false; state.source = 'off';
    resetSignal();
  }

  async function start() {
    if (state.active || starting) return state.active;
    if (!AC) { state.status = 'unavailable'; emit(); return false; }
    starting = true; state.status = 'starting'; emit();
    try {
      // Created and resumed synchronously inside the tap, before any await.
      const context = ctx = new AC();
      const resumed = context.resume();
      if (!pcm) pcm = synth();
      await resumed;
      if (ctx !== context) return false;                 // stopped while starting
      if (context.state !== 'running') throw new Error('blocked');
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (error) { /* optional */ }
      const buffer = context.createBuffer(2, N, RATE);
      buffer.copyToChannel(pcm[0], 0); buffer.copyToChannel(pcm[1], 1);
      src = context.createBufferSource(); src.buffer = buffer; src.loop = true;
      analyser = context.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = .5;
      gain = context.createGain(); gain.gain.value = 1;
      src.connect(analyser); analyser.connect(gain); gain.connect(context.destination);
      freq = new Uint8Array(analyser.frequencyBinCount); wave = new Float32Array(analyser.fftSize);
      // An interruption (phone call, another app) ends the session instead of leaving a stale one.
      context.onstatechange = () => { if (context.state !== 'running' && ctx === context) stop(); };
      startedAt = context.currentTime; src.start(0);
      resetSignal();
      state.active = true; state.source = 'demo'; state.status = 'on';
      emit(); return true;
    } catch (error) {
      const blocked = error && error.message === 'blocked';
      teardown(); state.status = blocked ? 'blocked' : 'unavailable'; emit(); return false;
    } finally { starting = false; }
  }

  function stop() {
    const was = state.active || starting;
    teardown(); state.status = 'off';
    if (was) emit();
  }

  const toggle = () => (state.active ? (stop(), Promise.resolve(false)) : start());

  function ageOf(kind, t) {
    const sequence = EVENTS[kind];
    let index = -1;
    for (let i = 0; i < sequence.length; i++) if (sequence[i] * STEP <= t) index = i;
    return Math.min(AGE_CAP, index < 0 ? t + LOOP - sequence[sequence.length - 1] * STEP : t - sequence[index] * STEP);
  }
  const follow = (current, target) => current + (target - current) * (target > current ? .6 : .18);

  // Called once per gallery tick. Never throws: a throw inside a card would stop it for good.
  function update() {
    if (!state.active || !ctx || !analyser) return;
    try {
      const t = (((ctx.currentTime - startedAt) % LOOP) + LOOP) % LOOP;
      const kickAge = ageOf('kick', t), snareAge = ageOf('snare', t), hatAge = ageOf('hat', t), noteAge = ageOf('note', t);
      analyser.getFloatTimeDomainData(wave); analyser.getByteFrequencyData(freq);
      let sum = 0;
      for (let i = 0; i < wave.length; i++) sum += finite(wave[i]) ** 2;
      const rms = Math.sqrt(sum / wave.length);
      peakRms = Math.max(peakRms * .9995, rms, .0001);
      const hz = ctx.sampleRate / analyser.fftSize, edges = [20, 200, 2000, 10000], bands = [0, 0, 0], counts = [0, 0, 0];
      for (let i = 1; i < freq.length; i++) {
        const f = i * hz;
        for (let b = 0; b < 3; b++) if (f >= edges[b] && f < edges[b + 1]) { bands[b] += freq[i]; counts[b]++; }
      }
      const normalized = bands.map((v, b) => {
        const mean = counts[b] ? v / counts[b] / 255 : 0;
        peakBand[b] = Math.max(peakBand[b] * .9995, mean, .0001);
        return clamp(mean / (peakBand[b] * .9));
      });
      state.loopTime = finite(t); state.beat = Math.floor(finite(t) / BEAT);
      state.kickAge = finite(kickAge, AGE_CAP); state.snareAge = finite(snareAge, AGE_CAP); state.hatAge = finite(hatAge, AGE_CAP);
      state.level = clamp(follow(state.level, rms / (peakRms * .9)));
      state.low = clamp(follow(state.low, normalized[0])); state.mid = clamp(follow(state.mid, normalized[1])); state.high = clamp(follow(state.high, normalized[2]));
      state.noteAge = finite(noteAge, AGE_CAP);
      state.pulse = clamp(Math.max(Math.exp(-state.kickAge * 9), .8 * Math.exp(-state.snareAge * 10)));
      // Any event, decaying: the clock that makes time-driven studies move on the beat and rest between.
      state.hit = clamp(Math.max(state.pulse, .45 * Math.exp(-state.hatAge * 22), .3 * Math.exp(-state.noteAge * 7)));
      // Continuous position in the audible loop (seconds), shifted by the output latency so visuals meet the sound.
      state.songTime = Math.max(0, finite(ctx.currentTime - startedAt - finite(ctx.outputLatency || ctx.baseLatency || 0), 0));
      remember();
    } catch (error) { console.error('sound update', error); }
  }

  const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);

  window.iwrSignal = facade;
  window.iwrSoundEngine = Object.freeze({ signal: facade, supported: !!AC, start, stop, toggle, update, subscribe, loopSeconds: LOOP, bpm: BPM });
})();
