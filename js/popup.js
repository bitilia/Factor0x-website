import { t, dealField, formatMoney } from './i18n.js?v=demo1';

const DEALS = [
  {
    id: 'INV-041',
    company: 'Gulf Trade Logistics',
    apr: 6.2,
    filled: 64.0,
    investors: 18,
    totalAmount: 420000,
    dueDays: 58,
    minContribution: 1000,
    obligor: 'Gulf Trade LLC',
    image: '../resources/images/gulf-logistics-bg.webp?v=demo1',
  },
  {
    id: 'INV-088',
    company: 'Nordic Supply Co.',
    apr: 5.8,
    filled: 31.5,
    investors: 7,
    totalAmount: 285000,
    dueDays: 42,
    minContribution: 2500,
    obligor: 'Nordic Supply Co.',
    image: '../resources/images/business-briefcase.webp?v=demo1',
  },
  {
    id: 'INV-113',
    company: 'Asia Pacific Exports',
    apr: 7.1,
    filled: 89.2,
    investors: 31,
    totalAmount: 650000,
    dueDays: 75,
    minContribution: 500,
    obligor: 'AP Exports Ltd.',
    image: '../resources/images/asia-components-bg.webp?v=demo1',
  },
];

function localizedDeal(deal) {
  const id = deal.id;
  return {
    ...deal,
    ref: dealField(id, 'ref'),
    description: dealField(id, 'description'),
    sector: dealField(id, 'sector'),
    jurisdiction: dealField(id, 'jurisdiction'),
    maturityDate: dealField(id, 'maturityDate'),
  };
}

function fmt(n) {
  return formatMoney(n);
}

function buildModal() {
  const el = document.createElement('div');
  el.className = 'modal-backdrop';
  el.id = 'deal-modal';
  el.setAttribute('aria-hidden', 'true');

  el.innerHTML = `
    <div class="modal-wrap">
      <div class="modal-topbar">
        <button class="modal-close" id="m-close" aria-label="${t('modal.close')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="m-company">

      <div class="modal-left">
        <div class="modal-company-img" id="m-img" aria-hidden="true"></div>
        <span class="modal-deal-label">${t('modal.dealOverview')}</span>

        <div>
          <h2 class="modal-company" id="m-company"></h2>
          <p class="modal-ref" id="m-ref"></p>
        </div>

        <div class="modal-divider"></div>
        <p class="modal-desc" id="m-desc"></p>

        <div class="modal-apr-row">
          <span class="modal-apr-num" id="m-apr"></span>
          <span class="modal-apr-label">${t('modal.annualApr')}</span>
        </div>

        <div class="modal-progress-block">
          <div class="modal-progress-header">
            <span class="modal-progress-pct" id="m-filled"></span>
            <span class="modal-progress-investors" id="m-investors"></span>
          </div>
          <div class="modal-progress-track">
            <div class="modal-progress-fill" id="m-bar"></div>
          </div>
          <div class="modal-progress-amounts">
            <span id="m-raised"></span>
            <span id="m-total-amt"></span>
          </div>
        </div>

        <div class="modal-metrics">
          <div class="modal-metric">
            <span class="modal-metric-label">${t('modal.dueDate')}</span>
            <span class="modal-metric-value" id="m-due"></span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">${t('modal.minInvestment')}</span>
            <span class="modal-metric-value" id="m-min"></span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">${t('modal.riskLevel')}</span>
            <div class="modal-risk">
              <span class="modal-risk-pill modal-risk-active">${t('modal.riskLow')}</span>
              <span class="modal-risk-pill"></span>
              <span class="modal-risk-pill"></span>
            </div>
          </div>
        </div>

        <div class="modal-divider"></div>

        <div class="modal-verify-grid">
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8v4h8V3z"/><path d="M9 12h6"/></svg>
            </span>
            <span>${t('modal.kybCompleted')}</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span>${t('modal.obligorConfirmed')}</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </span>
            <span>${t('modal.invoiceVerified')}</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </span>
            <span>${t('modal.bankVerified')}</span>
          </div>
        </div>
      </div>

      <div class="modal-right">
        <table class="modal-meta-table" aria-label="${t('modal.dealDetails')}">
          <tbody>
            <tr><td class="m-meta-label">${t('modal.obligor')}</td><td class="m-meta-val" id="m-obligor"></td></tr>
            <tr><td class="m-meta-label">${t('modal.sector')}</td><td class="m-meta-val" id="m-sector"></td></tr>
            <tr><td class="m-meta-label">${t('modal.jurisdiction')}</td><td class="m-meta-val" id="m-jurisdiction"></td></tr>
            <tr><td class="m-meta-label">${t('modal.invoiceAmount')}</td><td class="m-meta-val" id="m-inv-amount"></td></tr>
            <tr><td class="m-meta-label">${t('modal.maturityDate')}</td><td class="m-meta-val" id="m-maturity"></td></tr>
          </tbody>
        </table>

        <div class="modal-invest-card">
          <label class="modal-invest-label" for="m-invest-input">${t('modal.yourInvestment')}</label>

          <div class="modal-input-wrap">
            <span class="modal-input-prefix">$</span>
            <input type="number" id="m-invest-input" class="modal-invest-input" min="0" step="100">
            <button class="modal-input-max" id="m-max-btn" type="button">${t('modal.max')}</button>
          </div>

          <input type="range" class="modal-slider" id="m-slider" min="0" max="100000" step="100" value="1000">
          <p class="modal-slider-hint" id="m-hint"></p>

          <div class="modal-divider-light"></div>

          <div class="modal-return-row">
            <div>
              <span class="modal-return-label">${t('modal.estimatedReturn')}</span>
              <span class="modal-return-apr" id="m-return-apr"></span>
            </div>
            <span class="modal-return-amount" id="m-return-val"></span>
          </div>

          <div class="modal-divider-light"></div>

          <div class="modal-receive-row">
            <span class="modal-receive-label">${t('modal.receiveAtMaturity')}</span>
            <span class="modal-receive-val" id="m-receive"></span>
          </div>

          <button class="GoldBtn modal-cta" id="m-cta" type="button">
            <span id="m-cta-text">${t('marketplace.contribute')}</span>
          </button>

          <p class="modal-footer-note">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            ${t('modal.escrowNote')}
          </p>
        </div>
      </div>

      </div>
    </div>
  `;

  document.body.appendChild(el);

  el.querySelector('#m-close').addEventListener('click', hideModal);
  el.addEventListener('click', e => { if (e.target === el) hideModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideModal(); });

  return el;
}

let modalEl = null;
let activeDeal = null;

function updateCalc() {
  if (!activeDeal) return;
  const input = modalEl.querySelector('#m-invest-input');
  const slider = modalEl.querySelector('#m-slider');
  const amount = Math.max(0, parseFloat(input.value) || 0);
  const returnAmt = amount * (activeDeal.apr / 100) * (activeDeal.dueDays / 365);
  const receive = amount + returnAmt;

  slider.value = Math.min(amount, parseInt(slider.max));
  updateSliderFill(slider);

  modalEl.querySelector('#m-return-val').textContent = formatMoney(returnAmt, { decimals: 2 });
  modalEl.querySelector('#m-receive').textContent = formatMoney(receive, { decimals: 2 });
  modalEl.querySelector('#m-cta-text').textContent = t('modal.contribute', { amount: fmt(amount) });
}

function updateSliderFill(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #a87020 0%, #ffd277 ${pct}%, #e8e8e8 ${pct}%)`;
}

function showModal(dealIndex) {
  if (!modalEl) modalEl = buildModal();

  const d = localizedDeal(DEALS[dealIndex]);
  activeDeal = d;

  const raised = Math.round(d.totalAmount * d.filled / 100);
  const available = d.totalAmount - raised;
  const min = d.minContribution;

  const imgEl = modalEl.querySelector('#m-img');
  if (imgEl) {
    imgEl.style.backgroundImage = d.image ? `url(${d.image})` : 'none';
    imgEl.style.display = d.image ? '' : 'none';
  }

  modalEl.querySelector('#m-company').textContent = d.company;
  modalEl.querySelector('#m-ref').textContent = d.ref;
  modalEl.querySelector('#m-desc').textContent = d.description;
  modalEl.querySelector('#m-apr').textContent = d.apr + '%';
  modalEl.querySelector('#m-filled').textContent = t('modal.funded', { pct: d.filled.toFixed(1) });
  modalEl.querySelector('#m-investors').textContent = t('modal.investorsIn', { n: d.investors });
  modalEl.querySelector('#m-bar').style.width = d.filled + '%';
  modalEl.querySelector('#m-raised').textContent = fmt(raised);
  modalEl.querySelector('#m-total-amt').textContent = t('modal.ofTotal', { amount: fmt(d.totalAmount) });
  modalEl.querySelector('#m-due').textContent = t('marketplace.daysShort', { n: d.dueDays });
  modalEl.querySelector('#m-min').textContent = fmt(min);

  modalEl.querySelector('#m-obligor').textContent = d.obligor;
  modalEl.querySelector('#m-sector').textContent = d.sector;
  modalEl.querySelector('#m-jurisdiction').textContent = d.jurisdiction;
  modalEl.querySelector('#m-inv-amount').textContent = fmt(d.totalAmount);
  modalEl.querySelector('#m-maturity').textContent = d.maturityDate;

  const input = modalEl.querySelector('#m-invest-input');
  const slider = modalEl.querySelector('#m-slider');
  input.min = min;
  input.value = min;
  slider.min = min;
  slider.max = available;
  slider.value = min;
  modalEl.querySelector('#m-return-apr').textContent = t('modal.aprSuffix', { apr: d.apr });
  modalEl.querySelector('#m-hint').textContent = t('modal.availableMin', {
    available: fmt(available),
    min: fmt(min),
  });

  input.oninput = () => {
    slider.value = Math.min(parseFloat(input.value) || 0, available);
    updateSliderFill(slider);
    updateCalc();
  };
  slider.oninput = () => {
    input.value = slider.value;
    updateSliderFill(slider);
    updateCalc();
  };
  modalEl.querySelector('#m-max-btn').onclick = () => {
    input.value = available;
    slider.value = available;
    updateSliderFill(slider);
    updateCalc();
  };

  updateCalc();
  updateSliderFill(slider);

  document.body.classList.add('modal-open');
  modalEl.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    modalEl.classList.add('open');
  }));
}

function hideModal() {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  activeDeal = null;
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.offer-actions .LightBtn');
  if (!btn) return;
  const card = btn.closest('.offer-card');
  const grid = document.querySelector('.offers-grid');
  if (!card || !grid) return;
  const index = Array.from(grid.querySelectorAll('.offer-card')).indexOf(card);
  if (index !== -1) showModal(index);
});
