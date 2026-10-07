// Keep archive analytics isolated from the portfolio project hosting the domain.
(() => {
  if (location.protocol !== 'https:') return;
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const endpoint = new URL('analytics', document.baseURI).href;
  const script = document.createElement('script');
  script.defer = true;
  script.src = `${endpoint}/script.js`;
  script.dataset.endpoint = endpoint;
  document.head.append(script);
})();
