// Reveal the complete fixed header only after the introductory button exits above.
(() => {
  const previewFont = new URLSearchParams(location.search).get('font');
  if (previewFont === 'sf' || previewFont === 'fallback') {
    document.documentElement.dataset.fontPreview = previewFont;
    const style = document.createElement('style');
    style.textContent = previewFont === 'sf'
      ? ':root,.repo-button,.archive-intro a.repo-button{font-family:"SF Pro Text","SF Pro",system-ui,sans-serif!important}.brand,header .brand{font-family:"SF Pro Text Light","SF Pro Text","SF Pro",system-ui,sans-serif!important}'
      : ':root,.brand,header .brand,.repo-button,.archive-intro a.repo-button{font-family:system-ui,sans-serif!important}';
    document.head.append(style);
  }
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
