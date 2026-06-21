// ─── Header logo: reveal on any scroll ───────────
const logoImg = document.querySelector('.logo-text');
window.addEventListener('scroll', () => {
  logoImg.classList.toggle('logo-visible', window.scrollY > 0);
}, { passive: true });

// ─── Crypto icon rotator ──────────────────────────
const icons = document.querySelectorAll('.crypto-icon');
let current = 0;
setInterval(() => {
  icons[current].classList.remove('active');
  current = (current + 1) % icons.length;
  icons[current].classList.add('active');
}, 1100);

// ─── Button click sound (damped) ─────────────────
const _clickSfx = new Audio('../resources/sounds/mouse-click.mp3');
_clickSfx.volume = 0.18;
document.addEventListener('click', e => {
  if (e.target.closest('button, [role="button"], a, label, summary')) {
    const s = _clickSfx.cloneNode();
    s.volume = _clickSfx.volume;
    s.play().catch(() => {});
  }
}, { passive: true });

// ─── Lazy media fade-in ──────────────────────────
document.querySelectorAll('img[loading="lazy"], video').forEach(el => {
  const isVideo = el.tagName === 'VIDEO';
  if (isVideo ? el.readyState >= 2 : el.complete) {
    el.classList.add('media-loaded');
  } else {
    el.addEventListener(isVideo ? 'loadeddata' : 'load', () => {
      el.classList.add('media-loaded');
    }, { once: true });
  }
});

// ─── Wallet button aria-expanded sync ────────────
const walletBtn  = document.querySelector('.wallet-btn');
const walletWrap = document.querySelector('.wallet-wrap');
walletWrap.addEventListener('mouseenter', () => walletBtn.setAttribute('aria-expanded', 'true'));
walletWrap.addEventListener('mouseleave', () => walletBtn.setAttribute('aria-expanded', 'false'));
walletWrap.addEventListener('focusin',    () => walletBtn.setAttribute('aria-expanded', 'true'));
walletWrap.addEventListener('focusout',   () => walletBtn.setAttribute('aria-expanded', 'false'));
