import { lockScroll, unlockScroll } from './scroll-lock.js?v=demo3';
import { formatAmount, t } from './i18n.js?v=demo3';
import { registerDeal } from './deals-store.js?v=demo3';
import { initModalScrollbars } from './modal-scrollbar.js?v=demo3';

const API_BASE = '../api/invoices';

const LOADER_HTML = `<div class="f0x-loader" role="status" aria-label="Loading">${'<div class="square"></div>'.repeat(9)}</div>`;

function riskBadge(risk) {
  const label = risk === 'medium' ? 'Medium Risk' : 'Low Risk';
  const cls = risk === 'medium' ? 'badge badge-blue badge--sm' : 'badge badge-emerald badge--sm';
  const span = document.createElement('span');
  span.className = cls;
  span.textContent = label;
  return span;
}

function bindMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-nav');
  const hamburger = document.querySelector('label[for="nav-toggle"]');
  if (!toggle || !drawer) return;

  const links = drawer.querySelectorAll('a');
  const close = () => {
    toggle.checked = false;
    document.body.classList.remove('mobile-nav-open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger?.setAttribute('aria-label', 'Open menu');
  };

  toggle.addEventListener('change', () => {
    const open = toggle.checked;
    document.body.classList.toggle('mobile-nav-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    hamburger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.forEach(link => link.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 560) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.checked) close();
  });
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** A single popup modal: fixed backdrop + card, matching the same
 * open/close conventions (fade, scale-in, ESC, click-outside, body
 * scroll lock) as the deal-details modal in js/popup.js. */
function bindSimpleModal(id, triggerButtons) {
  const backdrop = document.getElementById(id);
  if (!backdrop) return { open: () => {}, close: () => {} };

  let lastFocus = null;

  function getFocusable() {
    return [...backdrop.querySelectorAll(FOCUSABLE)].filter(el => !el.closest('[aria-hidden="true"]'));
  }

  function trapFocus(e) {
    if (!backdrop.classList.contains('open')) return;
    const items = getFocusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  function close() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('inert', '');
    unlockScroll();
    triggerButtons.forEach(btn => btn?.setAttribute('aria-expanded', 'false'));
    backdrop.removeEventListener('keydown', trapFocus);
    lastFocus?.focus();
  }

  function open() {
    lastFocus = document.activeElement;
    backdrop.removeAttribute('inert');
    backdrop.setAttribute('aria-hidden', 'false');
    lockScroll();
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      const first = getFocusable()[0];
      first?.focus();
    });
    triggerButtons.forEach(btn => btn?.setAttribute('aria-expanded', 'true'));
    backdrop.addEventListener('keydown', trapFocus);
  }

  backdrop.querySelector('.modal-close, .simple-modal-close')?.addEventListener('click', close);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
  });

  return { open, close };
}

function bindFormModals() {
  const applyBtn = document.getElementById('apply-toggle');
  const flowBtn = document.getElementById('flow-toggle');
  const heroApplyBtn = document.getElementById('hero-apply-btn');
  const footerApplyLink = document.getElementById('footer-apply-link');

  const applyModal = bindSimpleModal('apply-modal', [applyBtn]);
  const flowModal = bindSimpleModal('flow-modal', [flowBtn]);

  applyBtn?.addEventListener('click', applyModal.open);
  flowBtn?.addEventListener('click', flowModal.open);
  heroApplyBtn?.addEventListener('click', applyModal.open);
  footerApplyLink?.addEventListener('click', e => {
    e.preventDefault();
    applyModal.open();
  });

  document.getElementById('apply-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;

    // Native HTML5 constraint validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const contactInput = form.elements['contact'];
    if (contactInput && contactInput.type === 'email' && contactInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInput.value)) {
      contactInput.setCustomValidity('Please enter a valid email address.');
      contactInput.reportValidity();
      contactInput.setCustomValidity('');
      return;
    }

    const data = new FormData(form);
    try {
      await fetch('/api/apply', { method: 'POST', body: data });
    } catch {
      // placeholder endpoint
    }
    form.reset();
    form.querySelectorAll('.file-selected').forEach(el => { el.textContent = 'No files selected'; });
    applyModal.close();
  });

  // The file input sits inside a native <label class="file-field">, so
  // clicking anywhere in the label (including our styled span) already
  // opens the file picker — no extra click delegation needed here.
  document.querySelectorAll('.apply-form input[type="file"]').forEach(input => {
    const row = input.closest('.file-field');
    input.addEventListener('change', () => {
      const label = row?.querySelector('.file-selected');
      if (!label) return;
      const names = [...input.files].map(f => f.name);
      label.textContent = names.length ? names.join(', ') : 'No files selected';
    });
  });
}

function revealStagger(items, staggerMs = 70) {
  items.forEach((el, i) => {
    el.classList.remove('is-revealing');
    el.style.animationDelay = '';
    void el.offsetWidth;
    el.style.animationDelay = `${i * staggerMs}ms`;
    el.classList.add('is-revealing');
    el.addEventListener('animationend', () => {
      el.classList.remove('is-revealing');
      el.style.animationDelay = '';
    }, { once: true });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class InvoiceTable {
  constructor(root) {
    this.root = root;
    this.tbody = root.querySelector('.invoice-table tbody');
    this.statusEl = root.querySelector('.invoice-page-status');
    this.liveEl = document.getElementById('invoice-status');
    this.pageSize = 10;
    this.currentPage = 1;
    this.totalPages = 1;
    this.sortKey = 'amount';
    this.sortDir = 'desc';
    this.pageCache = new Map();
    this.meta = null;
    this.isOpen = false;

    this.viewAllBtn = root.querySelector('#view-all-btn');
    this.offersBlock = root.querySelector('#offers-block');
    this.viewAllBtn?.addEventListener('click', () => this.toggle());

    root.querySelectorAll('.invoice-table-sort').forEach(btn => {
      btn.addEventListener('click', () => this.setSort(btn.dataset.sort));
    });

    this.prevBtn = root.querySelector('.invoice-page-prev');
    this.nextBtn = root.querySelector('.invoice-page-next');
    this.pageNav = root.querySelector('.invoice-page-nav');
    this.prevBtn?.addEventListener('click', () => this.goPage(this.currentPage - 1));
    this.nextBtn?.addEventListener('click', () => this.goPage(this.currentPage + 1));

    root.querySelectorAll('.invoice-page-size button').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.invoice-page-size button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.dataset.pageSize;
        this.pageSize = size === 'all' ? 999 : Number(size);
        this.pageCache.clear();
        this.currentPage = 1;
        this.loadPage(1);
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  updatePaginationUI() {
    const showNav = this.pageSize < 999;
    if (this.pageNav) this.pageNav.style.display = showNav ? '' : 'none';
    if (!showNav) return;
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage <= 1;
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= this.totalPages;
  }

  setOpen(open) {
    if (open === this.isOpen) return;
    if (open) this.openWithAnimation();
    else this.closeWithAnimation();
  }

  async openWithAnimation() {
    const panel = document.getElementById('invoice-table-panel');
    const cards = [...(this.offersBlock?.querySelectorAll('.offer-card') || [])];

    if (cards.length) {
      this.offersBlock?.classList.add('is-exiting-grid');
      cards.forEach((card, i) => { card.style.animationDelay = `${i * 60}ms`; });
      await wait(Math.min(cards.length * 60 + 220, 420));
      this.offersBlock?.classList.remove('is-exiting-grid');
      cards.forEach(card => { card.style.animationDelay = ''; });
    }

    panel.removeAttribute('inert');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    this.offersBlock?.classList.add('showing-table');
    this.isOpen = true;
    this.viewAllBtn?.setAttribute('aria-expanded', 'true');
    if (this.viewAllBtn) {
      this.viewAllBtn.querySelector('span').textContent = '← Top offers';
    }
    if (!this.meta) await this.init();
    else this.revealTableRows();
  }

  async closeWithAnimation() {
    const panel = document.getElementById('invoice-table-panel');
    const rows = [...(this.tbody?.querySelectorAll('tr') || [])];

    if (rows.length) {
      this.offersBlock?.classList.add('is-exiting-table');
      rows.forEach((row, i) => { row.style.animationDelay = `${i * 45}ms`; });
      await wait(Math.min(rows.length * 45 + 200, 380));
      this.offersBlock?.classList.remove('is-exiting-table');
      rows.forEach(row => { row.style.animationDelay = ''; });
    }

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');
    this.offersBlock?.classList.remove('showing-table');
    this.isOpen = false;
    this.viewAllBtn?.setAttribute('aria-expanded', 'false');
    if (this.viewAllBtn) {
      this.viewAllBtn.querySelector('span').textContent = 'View all →';
    }

    const cards = [...(this.offersBlock?.querySelectorAll('.offer-card') || [])];
    if (cards.length) revealStagger(cards, 90);
  }

  revealTableRows() {
    const rows = [...(this.tbody?.querySelectorAll('tr') || [])];
    if (rows.length) revealStagger(rows, 55);
  }

  toggle() {
    this.setOpen(!this.isOpen);
  }

  close() {
    this.setOpen(false);
  }

  announce(text) {
    if (!this.liveEl) return;
    this.liveEl.textContent = '';
    requestAnimationFrame(() => { this.liveEl.textContent = text; });
  }

  async init() {
    this.announce('Loading offers…');
    try {
      const res = await fetch(`${API_BASE}/meta.json?v=demo3`);
      if (!res.ok) throw new Error(res.status);
      this.meta = await res.json();
      this.totalPages = this.meta.totalPages;
      await this.loadPage(1);
    } catch {
      this.tbody.innerHTML = '<tr><td colspan="8" class="invoice-table-empty">Failed to load offers.</td></tr>';
      this.announce('Failed to load offers.');
    }
  }

  setSort(key) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc';
    }
    this.root.querySelectorAll('.invoice-table-sort').forEach(btn => {
      btn.classList.remove('asc', 'desc', 'active');
      const th = btn.closest('th');
      if (btn.dataset.sort === this.sortKey) {
        btn.classList.add('active', this.sortDir);
        th?.setAttribute('aria-sort', this.sortDir === 'asc' ? 'ascending' : 'descending');
      } else {
        th?.setAttribute('aria-sort', 'none');
      }
    });
    this.renderRows(this.getSortedItems(this.pageCache.get(this.currentPage) || []));
    if (this.isOpen) this.revealTableRows();
  }

  getSortedItems(items) {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }

  async loadPage(page) {
    if (this.pageSize >= 999) {
      await this.loadAllPages();
      return;
    }
    if (page < 1 || (this.meta && page > this.totalPages)) return;
    this.currentPage = page;
    this.tbody.innerHTML = `<tr><td colspan="8" class="invoice-table-loading">${LOADER_HTML}</td></tr>`;
    this.announce(`Loading page ${page}…`);

    try {
      let items = this.pageCache.get(page);
      if (!items) {
        const res = await fetch(`${API_BASE}/page-${page}.json?v=demo3`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        items = data.items;
        this.pageCache.set(page, items);
        if (data.totalPages) this.totalPages = data.totalPages;
      }
      this.renderRows(this.getSortedItems(items));
      if (this.isOpen) this.revealTableRows();
      const pageLabel = `Page ${page} of ${this.totalPages}`;
      if (this.statusEl) {
        this.statusEl.textContent = `Page ${page} / ${this.totalPages}`;
      }
      this.announce(`Showing ${pageLabel}`);
      this.updatePaginationUI();
    } catch {
      this.tbody.innerHTML = '<tr><td colspan="8" class="invoice-table-empty">Failed to load page.</td></tr>';
      this.announce('Failed to load page.');
    }
  }

  async loadAllPages() {
    this.tbody.innerHTML = `<tr><td colspan="8" class="invoice-table-loading">${LOADER_HTML}</td></tr>`;
    this.announce('Loading all offers…');
    try {
      const pages = [];
      for (let p = 1; p <= this.totalPages; p += 1) {
        if (!this.pageCache.has(p)) {
          const res = await fetch(`${API_BASE}/page-${p}.json?v=demo3`);
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          this.pageCache.set(p, data.items);
        }
        pages.push(...this.pageCache.get(p));
      }
      this.renderRows(this.getSortedItems(pages));
      if (this.isOpen) this.revealTableRows();
      if (this.statusEl) this.statusEl.textContent = `All ${pages.length} offers`;
      this.announce(`Showing all ${pages.length} offers`);
      this.updatePaginationUI();
    } catch {
      this.tbody.innerHTML = '<tr><td colspan="8" class="invoice-table-empty">Failed to load offers.</td></tr>';
      this.announce('Failed to load offers.');
    }
  }

  goPage(page) {
    if (this.pageSize >= 999) return;
    this.loadPage(page);
  }

  renderRows(items) {
    if (!items.length) {
      this.tbody.innerHTML = '<tr><td colspan="8" class="invoice-table-empty">No offers on this page.</td></tr>';
      return;
    }

    this.tbody.replaceChildren(...items.map(inv => {
      registerDeal(inv);

      const tr = document.createElement('tr');
      tr.dataset.id = inv.id;
      tr.innerHTML = `
        <td><span class="invoice-table-company">${inv.company}</span><br><span style="color:#aaa;font-size:11px">#${inv.id} · ${inv.route}</span></td>
        <td>${formatAmount(inv.amount)}</td>
        <td>${inv.apr.toFixed(1)}%</td>
        <td>${t('marketplace.days', { n: inv.dueDays })}</td>
        <td>${inv.filledPct.toFixed(1)}%</td>
        <td></td>
        <td>${formatAmount(inv.minContribution)}</td>
        <td><div class="invoice-table-actions"></div></td>
      `;
      tr.children[5].appendChild(riskBadge(inv.risk));
      const actions = tr.querySelector('.invoice-table-actions');
      const contrib = document.createElement('button');
      contrib.className = 'BtnDark';
      contrib.setAttribute('aria-label', `Contribute to ${inv.company} invoice #${inv.id}`);
      contrib.innerHTML = '<span>Contribute</span>';
      const details = document.createElement('button');
      details.className = 'LightBtn';
      details.setAttribute('aria-label', `View details for ${inv.company} invoice #${inv.id}`);
      details.innerHTML = '<span>View Details</span>';
      actions.append(contrib, details);
      return tr;
    }));
  }
}

function bindYieldVideo() {
  const btn = document.getElementById('yield-video-btn');
  const video = document.getElementById('yield-video');
  if (!btn || !video) return;

  btn.addEventListener('click', () => {
    const paused = video.paused;
    if (paused) {
      video.play().catch(() => {});
      btn.setAttribute('aria-label', 'Pause earning platform animation');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      video.pause();
      btn.setAttribute('aria-label', 'Play earning platform animation');
      btn.setAttribute('aria-pressed', 'true');
    }
  });
}

bindMobileNav();
bindFormModals();
bindYieldVideo();
initModalScrollbars();
new InvoiceTable(document.getElementById('invoice-cards'));
