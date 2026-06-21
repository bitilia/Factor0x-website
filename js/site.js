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

// ─── Button click sound (deeper + damped via WebAudio) ──
const _clickUrl = '../resources/sounds/mouse-click.mp3';
let _audioCtx = null;
let _clickBuffer = null;
async function _initClickSfx() {
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const res = await fetch(_clickUrl);
    const ab = await res.arrayBuffer();
    _clickBuffer = await _audioCtx.decodeAudioData(ab);
  } catch (err) {
    _audioCtx = null;
    _clickBuffer = null;
  }
}
_initClickSfx();

document.addEventListener('click', e => {
  if (!e.target.closest('button, [role="button"], a, label, summary')) return;

  if (_audioCtx && _clickBuffer) {
    if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
    try {
      const src = _audioCtx.createBufferSource();
      src.buffer = _clickBuffer;
      src.playbackRate.value = 0.86; // slightly lower pitch => deeper

      const filter = _audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 4200; // remove some high end for warmth

      const gain = _audioCtx.createGain();
      gain.gain.value = 0.16; // overall level

      src.connect(filter);
      filter.connect(gain);
      gain.connect(_audioCtx.destination);
      src.start(0);
    } catch (err) {
      const s = new Audio(_clickUrl);
      s.volume = 0.18;
      s.play().catch(() => {});
    }
  } else {
    const s = new Audio(_clickUrl);
    s.volume = 0.18;
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
