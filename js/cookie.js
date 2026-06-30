import { t } from './i18n.js';

// Cookie consent banner — remove this <script> tag to disable entirely.
// Language is read from <html lang="en|ru"> via i18n.js.

(function () {
  const KEY = 'f0x_cookie_consent';

  function getCookie(name) {
    const m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value)
      + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  if (getCookie(KEY)) return;

  const style = document.createElement('style');
  style.textContent = [
    '.f0x-cookie{position:fixed;bottom:24px;right:24px;z-index:9999;width:296px;',
    'background:#0d0d0d;border:1px solid rgba(255,255,255,0.1);border-radius:20px;',
    'padding:20px 20px 16px;display:flex;flex-direction:column;gap:10px;',
    'box-shadow:0 24px 64px rgba(0,0,0,0.55),inset 0 0 0 1px rgba(255,255,255,0.04);',
    'animation:f0xIn .46s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes f0xIn{from{transform:translateY(calc(100% + 36px));opacity:0}to{transform:translateY(0);opacity:1}}',
    '.f0x-cookie.f0x-out{animation:f0xOut .26s ease forwards}',
    '@keyframes f0xOut{to{transform:translateY(calc(100% + 36px));opacity:0}}',
    '.f0x-cookie-icon{width:28px;height:28px;color:rgba(220,162,60,.85);flex-shrink:0}',
    '.f0x-cookie-heading{font-family:"F0xSans",-apple-system,sans-serif;font-size:14px;font-weight:600;color:#fff;margin:0}',
    '.f0x-cookie-body{font-family:"F0xSans",-apple-system,sans-serif;font-size:12px;',
    'color:rgba(255,255,255,.48);line-height:1.65;margin:0}',
    '.f0x-cookie-actions{display:flex;gap:8px;margin-top:6px}',
    '.f0x-cookie-actions .GoldBtn,.f0x-cookie-actions .PlainBtn{flex:1;min-width:0;height:36px;font-size:13px;padding:0 8px;border-radius:8px}',
    '.f0x-cookie-actions .GoldBtn::before,.f0x-cookie-actions .PlainBtn::before{border-radius:6px}',
    '@media(max-width:380px){.f0x-cookie{left:12px;right:12px;width:auto;bottom:16px}}',
    '@media(prefers-reduced-motion:reduce){.f0x-cookie,.f0x-cookie.f0x-out{animation:none}}',
  ].join('');
  document.head.appendChild(style);

  const NS = 'http://www.w3.org/2000/svg';

  function svgAttr(el, attrs) {
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  const svg = svgAttr(document.createElementNS(NS, 'svg'), {
    class: 'f0x-cookie-icon', viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': '1.6',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  });

  [
    ['path',   { d: 'M12 2a10 10 0 1 0 10 10' }],
    ['path',   { d: 'M12 2a3 3 0 0 1 3 3 3 3 0 0 0 3 3 3 3 0 0 1 3 3' }],
    ['circle', { cx: '9.5', cy: '10.5', r: '1',   fill: 'currentColor', stroke: 'none' }],
    ['circle', { cx: '14',  cy: '15',   r: '1',   fill: 'currentColor', stroke: 'none' }],
    ['circle', { cx: '8.5', cy: '15',   r: '0.7', fill: 'currentColor', stroke: 'none' }],
    ['circle', { cx: '13',  cy: '9',    r: '0.6', fill: 'currentColor', stroke: 'none' }],
  ].forEach(([tag, attrs]) => svg.appendChild(svgAttr(document.createElementNS(NS, tag), attrs)));

  const banner = document.createElement('div');
  banner.className = 'f0x-cookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-label', t('cookie.heading'));

  const heading = document.createElement('p');
  heading.className = 'f0x-cookie-heading';
  heading.textContent = t('cookie.heading');

  const body = document.createElement('p');
  body.className = 'f0x-cookie-body';
  body.textContent = t('cookie.body');

  const actions = document.createElement('div');
  actions.className = 'f0x-cookie-actions';

  function dismiss(accepted) {
    setCookie(KEY, accepted ? 'accepted' : 'declined', 365);
    banner.classList.add('f0x-out');
    const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;
    setTimeout(() => banner.remove(), dur);
  }

  function makeBtn(cls, label, accepted) {
    const btn = document.createElement('button');
    btn.className = cls;
    btn.type = 'button';
    const span = document.createElement('span');
    span.textContent = label;
    btn.appendChild(span);
    btn.addEventListener('click', () => dismiss(accepted));
    return btn;
  }

  actions.appendChild(makeBtn('GoldBtn',  t('cookie.accept'),  true));
  actions.appendChild(makeBtn('PlainBtn', t('cookie.decline'), false));

  banner.appendChild(svg);
  banner.appendChild(heading);
  banner.appendChild(body);
  banner.appendChild(actions);
  document.body.appendChild(banner);
}());
