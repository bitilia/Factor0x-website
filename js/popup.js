const DEALS = [
  {
    company: 'Gulf Trade Logistics',
    ref: '#INV-041 · Dubai → Singapore',
    description: 'Recurring trade finance receivable from a confirmed cross-border logistics contract. The invoice carries a low-risk profile due to verified service delivery, repeat payment history, and a diversified obligor base.',
    apr: 6.2,
    filled: 64.0,
    investors: 18,
    totalAmount: 420000,
    dueDays: 58,
    minContribution: 1000,
    obligor: 'Gulf Trade LLC',
    sector: 'Logistics & Trade',
    jurisdiction: 'UAE Free Zone',
    maturityDate: 'Aug 14, 2026',
    image: '../resources/images/gulf-logistics-bg.webp',
  },
  {
    company: 'Nordic Supply Co.',
    ref: '#INV-088 · Oslo → Rotterdam',
    description: 'Short-duration receivable backed by a confirmed European freight contract. Low counterparty risk with an established payment track record and institutional obligor.',
    apr: 5.8,
    filled: 31.5,
    investors: 7,
    totalAmount: 285000,
    dueDays: 42,
    minContribution: 2500,
    obligor: 'Nordic Supply Co.',
    sector: 'Freight & Shipping',
    jurisdiction: 'Norway (EEA)',
    maturityDate: 'Jul 31, 2026',
    image: '../resources/images/business-briefcase.webp',
  },
  {
    company: 'Asia Pacific Exports',
    ref: '#INV-113 · Hong Kong → London',
    description: 'High-value cross-border trade invoice from a verified export contract. Near-maturity deal offering accelerated yield with verified customs clearance and confirmed delivery.',
    apr: 7.1,
    filled: 89.2,
    investors: 31,
    totalAmount: 650000,
    dueDays: 75,
    minContribution: 500,
    obligor: 'AP Exports Ltd.',
    sector: 'Consumer Goods',
    jurisdiction: 'Hong Kong SAR',
    maturityDate: 'Sep 1, 2026',
    image: '../resources/images/asia-components-bg.webp',
  },
];

function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtReturn(amount, apr, days) {
  const r = amount * (apr / 100) * (days / 365);
  return '$' + r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildModal() {
  const el = document.createElement('div');
  el.className = 'modal-backdrop';
  el.id = 'deal-modal';
  el.setAttribute('aria-hidden', 'true');

  // Static template only — no user data interpolated here. All deal data is
  // written via textContent after the element is mounted, preventing XSS.
  el.innerHTML = `
    <div class="modal-wrap">
      <div class="modal-topbar">
        <button class="modal-close" id="m-close" aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="m-company">

      <!-- ── LEFT PANEL ── -->
      <div class="modal-left">
        <div class="modal-company-img" id="m-img" aria-hidden="true"></div>
        <span class="modal-deal-label">Deal Overview</span>

        <div>
          <h2 class="modal-company" id="m-company"></h2>
          <p class="modal-ref" id="m-ref"></p>
        </div>

        <div class="modal-divider"></div>
        <p class="modal-desc" id="m-desc"></p>

        <div class="modal-apr-row">
          <span class="modal-apr-num" id="m-apr"></span>
          <span class="modal-apr-label">Annual APR</span>
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
            <span class="modal-metric-label">Due Date</span>
            <span class="modal-metric-value" id="m-due"></span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">Min Investment</span>
            <span class="modal-metric-value" id="m-min"></span>
          </div>
          <div class="modal-metric">
            <span class="modal-metric-label">Risk Level</span>
            <div class="modal-risk">
              <span class="modal-risk-pill modal-risk-active">Low</span>
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
            <span>KYB Completed</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span>Obligor Confirmed</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </span>
            <span>Invoice Verified</span>
          </div>
          <div class="modal-verify-item">
            <span class="modal-verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </span>
            <span>Bank Verified</span>
          </div>
        </div>
      </div>

      <!-- ── RIGHT PANEL ── -->
      <div class="modal-right">
        <table class="modal-meta-table" aria-label="Deal details">
          <tbody>
            <tr><td class="m-meta-label">Obligor</td><td class="m-meta-val" id="m-obligor"></td></tr>
            <tr><td class="m-meta-label">Sector</td><td class="m-meta-val" id="m-sector"></td></tr>
            <tr><td class="m-meta-label">Jurisdiction</td><td class="m-meta-val" id="m-jurisdiction"></td></tr>
            <tr><td class="m-meta-label">Invoice Amount</td><td class="m-meta-val" id="m-inv-amount"></td></tr>
            <tr><td class="m-meta-label">Maturity Date</td><td class="m-meta-val" id="m-maturity"></td></tr>
          </tbody>
        </table>

        <div class="modal-invest-card">
          <label class="modal-invest-label" for="m-invest-input">Your Investment</label>

          <div class="modal-input-wrap">
            <span class="modal-input-prefix">$</span>
            <input type="number" id="m-invest-input" class="modal-invest-input" min="0" step="100">
            <button class="modal-input-max" id="m-max-btn" type="button">Max</button>
          </div>

          <input type="range" class="modal-slider" id="m-slider" min="0" max="100000" step="100" value="1000">
          <p class="modal-slider-hint" id="m-hint"></p>

          <div class="modal-divider-light"></div>

          <div class="modal-return-row">
            <div>
              <span class="modal-return-label">Estimated Return</span>
              <span class="modal-return-apr" id="m-return-apr"></span>
            </div>
            <span class="modal-return-amount" id="m-return-val"></span>
          </div>

          <div class="modal-divider-light"></div>

          <div class="modal-receive-row">
            <span class="modal-receive-label">You receive at maturity</span>
            <span class="modal-receive-val" id="m-receive"></span>
          </div>

          <button class="GoldBtn modal-cta" id="m-cta" type="button">
            <span id="m-cta-text">Contribute →</span>
          </button>

          <p class="modal-footer-note">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Funds held in escrow until maturity
          </p>
        </div>
      </div>

      </div>
    </div>
  `;

  document.body.appendChild(el);

  // Close handlers
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

  // Sync slider
  slider.value = Math.min(amount, parseInt(slider.max));
  updateSliderFill(slider);

  modalEl.querySelector('#m-return-val').textContent = '$' + returnAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  modalEl.querySelector('#m-receive').textContent = '$' + receive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  modalEl.querySelector('#m-cta-text').textContent = `Contribute ${fmt(amount)} →`;
}

function updateSliderFill(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #a87020 0%, #ffd277 ${pct}%, #e8e8e8 ${pct}%)`;
}

function showModal(dealIndex) {
  if (!modalEl) modalEl = buildModal();

  const d = DEALS[dealIndex];
  activeDeal = d;

  const raised = Math.round(d.totalAmount * d.filled / 100);
  const available = d.totalAmount - raised;
  const min = d.minContribution;

  // Company hero image (lazy-loaded from deal data)
  const imgEl = modalEl.querySelector('#m-img');
  if (imgEl) {
    imgEl.style.backgroundImage = d.image ? `url(${d.image})` : 'none';
    imgEl.style.display = d.image ? '' : 'none';
  }

  // Left panel
  modalEl.querySelector('#m-company').textContent = d.company;
  modalEl.querySelector('#m-ref').textContent = d.ref;
  modalEl.querySelector('#m-desc').textContent = d.description;
  modalEl.querySelector('#m-apr').textContent = d.apr + '%';
  modalEl.querySelector('#m-filled').textContent = d.filled.toFixed(1) + '% Funded';
  modalEl.querySelector('#m-investors').textContent = d.investors + ' investors already in';
  modalEl.querySelector('#m-bar').style.width = d.filled + '%';
  modalEl.querySelector('#m-raised').textContent = fmt(raised);
  modalEl.querySelector('#m-total-amt').textContent = 'of ' + fmt(d.totalAmount);
  modalEl.querySelector('#m-due').textContent = d.dueDays + 'd';
  modalEl.querySelector('#m-min').textContent = fmt(min);

  // Right panel
  modalEl.querySelector('#m-obligor').textContent = d.obligor;
  modalEl.querySelector('#m-sector').textContent = d.sector;
  modalEl.querySelector('#m-jurisdiction').textContent = d.jurisdiction;
  modalEl.querySelector('#m-inv-amount').textContent = fmt(d.totalAmount);
  modalEl.querySelector('#m-maturity').textContent = d.maturityDate;

  // Investment widget
  const input = modalEl.querySelector('#m-invest-input');
  const slider = modalEl.querySelector('#m-slider');
  input.min = min;
  input.value = min;
  slider.min = min;
  slider.max = available;
  slider.value = min;
  modalEl.querySelector('#m-return-apr').textContent = d.apr + '% APR';
  modalEl.querySelector('#m-hint').textContent = fmt(available) + ' available · Min ' + fmt(min);

  // Wire up input/slider sync
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
  // Double-RAF ensures the browser paints the initial opacity:0 state
  // before the transition to opacity:1 fires.
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

// Delegate clicks on dynamically-rendered "View Details" buttons
document.addEventListener('click', e => {
  const btn = e.target.closest('.offer-actions .LightBtn');
  if (!btn) return;
  const card = btn.closest('.offer-card');
  const grid = document.querySelector('.offers-grid');
  if (!card || !grid) return;
  const index = Array.from(grid.querySelectorAll('.offer-card')).indexOf(card);
  if (index !== -1) showModal(index);
});
