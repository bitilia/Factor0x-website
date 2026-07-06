# Factor0x — English

This directory contains the English version of the Factor0x website.

## Contents

| Path | Description |
|------|-------------|
| `index.html` | Main landing page |
| `legal/` | Legal documents |
| `legal/index.html` | Legal section index |
| `legal/privacy/` | Privacy Policy |
| `legal/terms/` | Terms of Service |
| `legal/whitepaper/` | Whitepaper |

## Shared resources

CSS, JavaScript, fonts, images, and videos live in the parent directories:

- `../css/` — Stylesheets (`site.css`, `main.css`, `popup.css`)
- `../js/` — Scripts (`marketplace.js`, `en-features.js`, `site.js`, `popup.js`, `cookie.js`)
- `../resources/` — Fonts, images, icons, videos, logo

Font preloads on this page use the **latin** woff2 variants:
`../resources/fonts/normal/latin/normal-regular.woff2`
`../resources/fonts/normal/latin/normal-semibold.woff2`

## Language metadata

- `lang="en"`
- Canonical: `https://factor0x.bitilia.com/en/`
- hreflang alternates: `en`, `ru`, `x-default → en`

## Notes

- Asset version strings (`?v=demo3`) serve as cache-bust tokens.
- The i18n system (`js/i18n.js`) reads `<html lang>` at runtime and loads the matching locale from `js/locales/`.
- Legal pages override the dark site theme with a white background via an inline `<style>` block.
