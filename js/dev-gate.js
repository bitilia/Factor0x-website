// While the platform backend isn't live, every button that would trigger a
// real action — apply for financing, submit the application, connect a wallet,
// or contribute to a deal — is routed to the "coming soon" dev page instead.
// Pure browsing (scroll links, the offers table, the deal / flow previews)
// stays interactive.

const DEV_URL = new URL('../dev.html', import.meta.url).href;

const ACTION_SELECTOR = [
  '#hero-apply-btn',        // Hero: Get Financing
  '#apply-toggle',          // Model tile: Apply
  '#footer-apply-link',     // Footer: Get Financing
  '.apply-submit',          // Apply modal: Submit application
  '.wallet-btn',            // Header: Connect Wallet
  '.drop-item',             // Header: Crypto / Bank
  '.offer-actions .BtnDark',// Offer card: Contribute
  '.modal-cta',             // Invest modal: Contribute
].join(', ');

// Capture phase so this runs before the site's own click handlers (which open
// modals or submit the form) and can cancel them cleanly.
document.addEventListener('click', e => {
  const trigger = e.target.closest(ACTION_SELECTOR);
  if (!trigger) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  window.location.assign(DEV_URL);
}, true);
