// ─── 404 fallback: swap missing media for the gold loading spinner ───
//
// When an <img> or <video> fails to load (e.g. the asset 404s), replace it in
// place with the same gold "f0x-loader" spinner used elsewhere on the site
// (invoice table, marketplace, TVL…). The spinner is pure CSS, so nothing is
// fetched over the network — we build one template node a single time and hand
// every broken element a cheap clone of it, rather than rebuilding the markup
// (or re-downloading anything) on each failure.

function buildLoaderTemplate() {
  const loader = document.createElement('div');
  loader.className = 'f0x-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Loading');
  for (let i = 0; i < 9; i += 1) {
    loader.appendChild(document.createElement('div')).className = 'square';
  }
  return loader;
}

// Constructed exactly once; reused via cloneNode for every broken element.
const LOADER_TEMPLATE = buildLoaderTemplate();

function makeLoader(small) {
  const loader = LOADER_TEMPLATE.cloneNode(true);
  if (small) loader.classList.add('f0x-loader--sm');
  return loader;
}

function applyFallback(node) {
  // Guard so a node is only ever swapped once (and never re-enters the handler).
  if (node.dataset.mediaFallback) return;
  node.dataset.mediaFallback = '1';

  // Measure the footprint before removing the element so the loader can hold
  // the same space and pick a size that fits (small variant for tiny slots).
  const rect  = node.getBoundingClientRect();
  const minSide = Math.min(rect.width || 0, rect.height || 0);

  const wrap = document.createElement('span');
  // Inherit the element's own classes so it keeps its CSS-driven box, plus a
  // hook class that centres the spinner.
  wrap.className = `${node.className} media-fallback`.trim();
  wrap.dataset.mediaFallback = '1';
  if (rect.width)  wrap.style.width  = `${rect.width}px`;
  if (rect.height) wrap.style.height = `${rect.height}px`;

  wrap.appendChild(makeLoader(minSide > 0 && minSide < 90));
  node.replaceWith(wrap);
}

// error events don't bubble, so catch them in the capture phase at the root.
document.addEventListener('error', e => {
  const node = e.target;
  if (node && (node.tagName === 'IMG' || node.tagName === 'VIDEO')) {
    applyFallback(node);
  }
}, true);

// Modules run after the document is parsed, so some assets may have already
// failed before this listener existed — sweep the DOM once to catch them.
document.querySelectorAll('img').forEach(img => {
  if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) {
    applyFallback(img);
  }
});
document.querySelectorAll('video').forEach(video => {
  // A MediaError (video.error) or "no usable source" means the load failed.
  if (video.error || (video.getAttribute('src') && video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
    applyFallback(video);
  }
});
