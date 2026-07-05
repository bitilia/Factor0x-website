export function initMiniScrollbar(container) {
  if (!container || container.dataset.f0xScrollInit) return;
  container.dataset.f0xScrollInit = '1';

  const host = container.matches('.f0x-scroll-host')
    ? container
    : container.closest('.f0x-scroll-host');
  if (!host) return;

  container.classList.add('f0x-scrollable');

  let bar = host.querySelector(':scope > .f0x-scroll--mini');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'f0x-scroll f0x-scroll--mini';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<div class="f0x-scroll-track"><div class="f0x-scroll-thumb"></div></div>';
    host.appendChild(bar);
  }

  const thumb = bar.querySelector('.f0x-scroll-thumb');
  const track = bar.querySelector('.f0x-scroll-track');
  let hideTimer = null;

  function sync() {
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 1) {
      bar.hidden = true;
      bar.classList.remove('is-visible');
      return;
    }

    bar.hidden = false;
    const trackHeight = track.clientHeight;
    const ratio = container.clientHeight / container.scrollHeight;
    const thumbHeight = Math.max(16, trackHeight * ratio);
    const travel = trackHeight - thumbHeight;
    const top = (container.scrollTop / maxScroll) * travel;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${top}px`;
  }

  function showBar() {
    sync();
    if (bar.hidden) return;
    bar.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bar.classList.remove('is-visible'), 1400);
  }

  container.addEventListener('scroll', showBar, { passive: true });
  new ResizeObserver(sync).observe(container);
  new MutationObserver(sync).observe(container, { childList: true, subtree: true });
  sync();

  return sync;
}

export function initModalScrollbars(root = document) {
  root.querySelectorAll('[data-f0x-scroll]').forEach(el => initMiniScrollbar(el));
}
