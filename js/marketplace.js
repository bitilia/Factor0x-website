import { t, formatAmount, formatTVL } from './i18n.js?v=demo1';

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function txt(tag, className, content) {
  const node = el(tag, className);
  node.textContent = content;
  return node;
}

function statPair(label, value) {
  const wrap = el('div', 'offer-stat');
  wrap.appendChild(txt('span', 'offer-stat-label', label));
  wrap.appendChild(txt('span', 'offer-stat-value', value));
  return wrap;
}

function externalLinkIcon() {
  const a = document.createElement('a');
  a.href = '#';
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'offer-newtab';
  a.setAttribute('aria-label', t('marketplace.openInNewTab'));
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true"><path d="M425.5 7c-6.9-6.9-17.2-8.9-26.2-5.2S384.5 14.3 384.5 24l0 56-48 0c-88.4 0-160 71.6-160 160 0 46.7 20.7 80.4 43.6 103.4 8.1 8.2 16.5 14.9 24.3 20.4 9.2 6.5 21.7 5.7 30.1-1.9s10.2-20 4.5-29.8c-3.6-6.3-6.5-14.9-6.5-26.7 0-36.2 29.3-65.5 65.5-65.5l46.5 0 0 56c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l136-136c9.4-9.4 9.4-24.6 0-33.9L425.5 7zm7 97l0-22.1 78.1 78.1-78.1 78.1 0-22.1c0-13.3-10.7-24-24-24L338 192c-50.9 0-93.9 33.5-108.3 79.6-3.3-9.4-5.2-19.8-5.2-31.6 0-61.9 50.1-112 112-112l72 0c13.3 0 24-10.7 24-24zm-320-8c-44.2 0-80 35.8-80 80l0 256c0 44.2 35.8 80 80 80l256 0c44.2 0 80-35.8 80-80l0-24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 24c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l24 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-24 0z"/></svg>';
  return a;
}

function createCard(inv) {
  const card = el('div', 'offer-card');
  card.dataset.id = inv.id;

  const header = el('div', 'offer-card-header');
  const meta   = el('div');
  meta.appendChild(txt('span', 'offer-company-name', inv.company));
  meta.appendChild(txt('span', 'offer-invoice-ref',  `#${inv.id} · ${inv.route}`));
  header.appendChild(meta);
  header.appendChild(externalLinkIcon());
  card.appendChild(header);

  const stats = el('div', 'offer-stats');
  const amountStat = statPair(t('marketplace.amount'), formatAmount(inv.amount));
  amountStat.classList.add('offer-amount');
  stats.appendChild(amountStat);
  stats.appendChild(statPair(t('marketplace.apr'), `${inv.apr.toFixed(1)}%`));
  stats.appendChild(statPair(t('marketplace.dueDate'), t('marketplace.days', { n: inv.dueDays })));
  card.appendChild(stats);

  const fill = el('div', 'offer-fill');
  const fillHeader = el('div', 'offer-fill-header');
  fillHeader.appendChild(txt('span', 'offer-stat-label', t('marketplace.filled')));
  fillHeader.appendChild(txt('span', 'offer-fill-pct',   `${inv.filledPct.toFixed(1)}%`));
  fill.appendChild(fillHeader);
  const bar  = el('div', 'offer-progress');
  const barFill = el('div', 'offer-progress-fill');
  barFill.style.width = `${inv.filledPct}%`;
  bar.appendChild(barFill);
  fill.appendChild(bar);
  card.appendChild(fill);

  card.appendChild(el('div', 'offer-divider'));

  const contribs = el('div', 'offer-contributors');
  contribs.appendChild(statPair(t('marketplace.contributors'), String(inv.contributors)));
  contribs.appendChild(statPair(t('marketplace.minContribution'), formatAmount(inv.minContribution)));
  card.appendChild(contribs);

  const actions = el('div', 'offer-actions');
  const btnContrib = el('button', 'BtnDark');
  btnContrib.appendChild(txt('span', null, t('marketplace.contribute')));
  const btnDetails = el('button', 'LightBtn');
  btnDetails.appendChild(txt('span', null, t('marketplace.viewDetails')));
  actions.appendChild(btnContrib);
  actions.appendChild(btnDetails);
  card.appendChild(actions);

  return card;
}

async function loadStats() {
  const tvlValueEl = document.getElementById('tvl-value');
  const tvlDateEl  = document.getElementById('tvl-date');
  if (!tvlValueEl) return;

  try {
    const res  = await fetch('../api/stats.json?v=demo1');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    tvlValueEl.textContent = formatTVL(data.tvl, data.currency);
    if (tvlDateEl) tvlDateEl.textContent = t('marketplace.tvlOn', { date: data.tvlDate });
  } catch {
    // leave placeholder text in place
  }
}

async function loadInvoices() {
  const grid = document.querySelector('.offers-grid');
  if (!grid) return;

  const loading = el('div', 'offers-loading');
  loading.setAttribute('aria-live', 'polite');
  loading.textContent = t('marketplace.loading');
  grid.replaceChildren(loading);

  try {
    const res  = await fetch('../api/invoices.json?v=demo1');
    if (!res.ok) throw new Error(res.status);
    const all  = await res.json();
    const top3 = all.filter(i => i.status === 'active').slice(0, 3);

    if (!top3.length) {
      const empty = el('p', 'offers-empty');
      empty.textContent = t('marketplace.empty');
      grid.replaceChildren(empty);
      return;
    }

    grid.replaceChildren(...top3.map(createCard));
  } catch {
    const err = el('p', 'offers-error');
    err.textContent = t('marketplace.error');
    grid.replaceChildren(err);
  }
}

loadStats();
loadInvoices();

(function () {
  const fill = document.querySelector('.offers-scrollbar-fill');
  const grid = document.querySelector('.offers-grid');
  if (!fill || !grid) return;

  function sync() {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    if (maxScroll <= 0) { fill.style.width = '100%'; return; }
    const pct = (grid.scrollLeft / maxScroll) * 100;
    const thumbPct = (grid.clientWidth / grid.scrollWidth) * 100;
    fill.style.width = `${(thumbPct + (pct / 100) * (100 - thumbPct)).toFixed(1)}%`;
  }

  grid.addEventListener('scroll', sync, { passive: true });
  new MutationObserver(sync).observe(grid, { childList: true });
})();
