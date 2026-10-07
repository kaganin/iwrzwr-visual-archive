// Intro and scrolling-header buttons share one audio session and state.
// All visible copy and aria-labels stay lowercase (scripts/check-archive.mjs).
(() => {
  const engine = window.iwrSoundEngine;
  const toggles = [...document.querySelectorAll('[data-sound-toggle]')];
  const statuses = [...document.querySelectorAll('[data-sound-status]')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  if (!engine || !engine.supported) { toggles.forEach(button => { button.hidden = true; }); return; }

  const copy = {
    starting: 'starting…',
    on: 'demo loop · ' + engine.bpm + ' bpm',
    blocked: 'sound is blocked here. tap again, or keep browsing in silence.',
    unavailable: 'audio is not available in this browser.',
    off: '',
  };

  function render(signal) {
    const on = signal.active;
    document.documentElement.dataset.sound = on ? 'on' : 'off';
    toggles.forEach(button => {
      button.setAttribute('aria-pressed', String(on));
      const label = button.querySelector('[data-sound-label]');
      const text = on ? 'stop sound' : 'play sound';
      if (label) label.textContent = text; else button.textContent = text;
      button.setAttribute('aria-label', text);
    });
    let message = copy[signal.status] ?? '';
    if (on && calm.matches) message += ' · reduced motion is on, cards stay calm';
    statuses.forEach(node => { node.textContent = message; });
  }

  toggles.forEach(button => button.addEventListener('click', () => { engine.toggle(); }));
  engine.subscribe(render);
  render(engine.signal);
})();
