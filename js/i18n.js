import en from './locales/en.js';
import ru from './locales/ru.js';

/** @typedef {typeof en} LocaleMessages */

const LOCALES = { en, ru };
const SUPPORTED = Object.keys(LOCALES);

/**
 * Active locale from <html lang="…">. Falls back to English.
 * @returns {'en' | 'ru'}
 */
export function getLang() {
  const lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  return /** @type {'en' | 'ru'} */ (SUPPORTED.includes(lang) ? lang : 'en');
}

/**
 * Resolve a dot-separated key against the active locale dictionary.
 * Supports `{name}` interpolation via the optional `vars` map.
 *
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars = {}) {
  const dict = LOCALES[getLang()];
  const value = key.split('.').reduce((node, part) => node?.[part], dict);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

/** @returns {LocaleMessages} */
export function messages() {
  return LOCALES[getLang()];
}

/**
 * Localized deal copy keyed by invoice id (INV-041, …).
 * @param {string} id
 * @param {string} field
 */
export function dealField(id, field) {
  const localized = LOCALES[getLang()].deals?.[id]?.[field];
  if (localized) return localized;
  return LOCALES.en.deals?.[id]?.[field] ?? '';
}

/** Locale-aware number formatting for currency display in UI. */
export function formatMoney(n, { decimals = 0 } = {}) {
  const lang = getLang() === 'ru' ? 'ru-RU' : 'en-US';
  const formatted = Number(n).toLocaleString(lang, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return '$' + formatted;
}

/** TVL display: `$103 504 459,50 USD` style. */
export function formatTVL(n, currency) {
  const lang = getLang() === 'ru' ? 'ru-RU' : 'en-US';
  const formatted = Number(n).toLocaleString(lang, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted} ${currency}`;
}

/** Card amount: `$ 420 000` with thin space grouping. */
export function formatAmount(n) {
  const grouped = Math.round(n).toLocaleString(getLang() === 'ru' ? 'ru-RU' : 'fr-FR');
  return '$ ' + grouped.replace(/\u00a0/g, ' ').replace(/ /g, '\u00a0');
}
