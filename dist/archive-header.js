// Reveal the complete fixed header only after the introductory button exits above.
(() => {
  const header = document.querySelector('body > header');
  const source = document.querySelector('.intro-repo');
  const target = document.querySelector('.header-repo');
  if (!header || !source || !target) return;
  let observer;
  const observe = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(([entry]) => {
      const visible = entry.boundingClientRect.bottom <= 0;
      header.toggleAttribute('data-visible', visible);
      header.toggleAttribute('inert', !visible);
      header.setAttribute('aria-hidden', String(!visible));
    }, { threshold: [0, 1] });
    observer.observe(source);
  };
  new ResizeObserver(observe).observe(header);
  observe();
})();
