// Keep archive analytics isolated from the portfolio project hosting the domain.
(() => {
  if (location.protocol !== 'https:') return;
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const origin = 'https://iwrzwr-visual-archive.vercel.app';
  const script = document.createElement('script');
  script.defer = true;
  script.src = `${origin}/_vercel/insights/script.js`;
  script.dataset.endpoint = `${origin}/_vercel/insights`;
  document.head.append(script);
})();
