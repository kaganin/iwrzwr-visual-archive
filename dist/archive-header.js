// Show the sticky repository link once its introductory counterpart passes it.
(() => {
  const header = document.querySelector('body > header');
  const source = document.querySelector('.intro-repo');
  const target = document.querySelector('.header-repo');
  if (!header || !source || !target) return;
  let observer;
  const observe = () => {
    observer?.disconnect();
    const edge = header.getBoundingClientRect().height;
    observer = new IntersectionObserver(([entry]) => {
      target.toggleAttribute('data-visible', entry.boundingClientRect.bottom <= edge);
    }, { rootMargin: `-${edge}px 0px 0px 0px`, threshold: [0, 1] });
    observer.observe(source);
  };
  new ResizeObserver(observe).observe(header);
  observe();
})();
