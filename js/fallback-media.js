// ─── Media loading state: gold spinner until the asset is ready ───
//
// Every <img> / <video> shows the site's gold "f0x-loader" spinner (the same
// one used in the invoice table, marketplace, TVL…) from the moment the page
// renders until the asset is actually available:
//   • while it loads  → a spinner overlays the element's slot
//   • on success      → the overlay is removed and the media is revealed
//   • on failure/404  → the element is swapped for a persistent in-flow spinner
//
// The spinner is pure CSS, so nothing is fetched over the network — we build one
// template node a single time and hand every element a cheap clone of it.

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

// Constructed exactly once; reused via cloneNode for every element.
const LOADER_TEMPLATE = buildLoaderTemplate();

function makeLoader(small) {
  const loader = LOADER_TEMPLATE.cloneNode(true);
  if (small) loader.classList.add('f0x-loader--sm');
  return loader;
}

// A spinner sized to `node`, overlaid inside its parent while the asset loads.
function overlayFor(node) {
  const parent = node.parentElement;
  if (!parent) return null;

  // The overlay is absolutely positioned, so the parent needs to establish a
  // positioning context. Only touch it when it's still static.
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

  const w = node.offsetWidth;
  const h = node.offsetHeight;
  const minSide = Math.min(w || 0, h || 0);

  const loader = makeLoader(minSide > 0 && minSide < 90);
  loader.classList.add('media-loading-overlay');
  loader.style.position = 'absolute';
  loader.style.left = `${node.offsetLeft}px`;
  loader.style.top = `${node.offsetTop}px`;
  if (w) loader.style.width = `${w}px`;
  if (h) loader.style.height = `${h}px`;

  parent.appendChild(loader);
  return loader;
}

// Permanent in-flow spinner that takes the place of a failed element.
function applyFallback(node) {
  if (node.dataset.mediaFallback) return; // only swap once
  node.dataset.mediaFallback = '1';

  const rect = node.getBoundingClientRect();
  const minSide = Math.min(rect.width || 0, rect.height || 0);

  const wrap = document.createElement('span');
  // Inherit the element's own classes so it keeps its CSS-driven box, plus a
  // hook class that centres the spinner.
  wrap.className = `${node.className} media-fallback`.trim();
  wrap.dataset.mediaFallback = '1';
  if (rect.width) wrap.style.width = `${rect.width}px`;
  if (rect.height) wrap.style.height = `${rect.height}px`;

  wrap.appendChild(makeLoader(minSide > 0 && minSide < 90));
  node.replaceWith(wrap);
}

function track(node) {
  if (node.dataset.mediaTracked) return;
  node.dataset.mediaTracked = '1';

  const isVideo = node.tagName === 'VIDEO';
  const src = node.getAttribute('src') || node.querySelector?.('source[src]');
  const ready = isVideo ? node.readyState >= 2 : (node.complete && node.naturalWidth > 0);
  const failed = isVideo
    ? !!node.error || (src && node.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)
    : (node.complete && node.naturalWidth === 0 && !!src);

  if (ready) return;            // already available — nothing to show
  if (failed) { applyFallback(node); return; } // already 404'd — persistent spinner

  // Still loading: overlay the spinner until we hear back.
  const overlay = overlayFor(node);
  const doneEvent = isVideo ? 'loadeddata' : 'load';

  const onLoad = () => { overlay?.remove(); node.removeEventListener('error', onError); };
  const onError = () => { overlay?.remove(); node.removeEventListener(doneEvent, onLoad); applyFallback(node); };

  node.addEventListener(doneEvent, onLoad, { once: true });
  node.addEventListener('error', onError, { once: true });
}

document.querySelectorAll('img, video').forEach(track);
