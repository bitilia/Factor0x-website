let lockCount = 0;
let scrollY = 0;
let scrollbarPad = 0;

function measureScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function setScrollbarPad(px) {
  const pad = px > 0 ? `${px}px` : '';
  document.body.style.paddingRight = pad;
  document.querySelector('.site-header')?.style.setProperty('padding-right', pad);
}

export function lockScroll() {
  if (lockCount++ > 0) return;
  scrollY = window.scrollY;
  scrollbarPad = measureScrollbarWidth();
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollY}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  setScrollbarPad(scrollbarPad);
}

export function unlockScroll() {
  if (--lockCount > 0) return;
  lockCount = 0;
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  document.body.style.position = '';
  document.body.style.width = '';
  setScrollbarPad(0);
  window.scrollTo(0, scrollY);
}
