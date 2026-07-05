#!/usr/bin/env python3
"""Build locale-specific woff2 subsets for Factor0x self-hosted fonts.

Outputs:
  normal/latin/    — Space Grotesk (Latin + Latin-ext)
  normal/cyrillic/ — Manrope (Cyrillic + Cyrillic-ext), aliased as F0xSans
  mono/latin/      — DM Mono (Latin + Latin-ext)
  mono/cyrillic/   — JetBrains Mono (Cyrillic + Cyrillic-ext), aliased as F0xMono

Regenerate: python3 resources/fonts/build-fonts.py
"""

from __future__ import annotations

import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / '.sources'
UA = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
)

LATIN = (
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,'
    'U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,'
    'U+2212,U+2215,U+FEFF,U+FFFD,'
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,'
    'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,'
    'U+2113,U+2C60-2C7F,U+A720-A7FF'
)
CYRILLIC = (
    'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116,'
    'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F'
)

FACES = [
    ('normal', 'latin', 'Space+Grotesk', 300, 'normal-light', 'Space Grotesk'),
    ('normal', 'latin', 'Space+Grotesk', 400, 'normal-regular', 'Space Grotesk'),
    ('normal', 'latin', 'Space+Grotesk', 500, 'normal-medium', 'Space Grotesk'),
    ('normal', 'latin', 'Space+Grotesk', 600, 'normal-semibold', 'Space Grotesk'),
    ('normal', 'cyrillic', 'Manrope', 300, 'normal-light', 'Manrope'),
    ('normal', 'cyrillic', 'Manrope', 400, 'normal-regular', 'Manrope'),
    ('normal', 'cyrillic', 'Manrope', 500, 'normal-medium', 'Manrope'),
    ('normal', 'cyrillic', 'Manrope', 600, 'normal-semibold', 'Manrope'),
    ('mono', 'latin', 'DM+Mono', 300, 'mono-light', 'DM Mono'),
    ('mono', 'latin', 'DM+Mono', 400, 'mono-regular', 'DM Mono'),
    ('mono', 'latin', 'DM+Mono', 500, 'mono-medium', 'DM Mono'),
    ('mono', 'cyrillic', 'JetBrains+Mono', 300, 'mono-light', 'JetBrains Mono'),
    ('mono', 'cyrillic', 'JetBrains+Mono', 400, 'mono-regular', 'JetBrains Mono'),
    ('mono', 'cyrillic', 'JetBrains+Mono', 500, 'mono-medium', 'JetBrains Mono'),
]

BLOCK_RE = re.compile(r'@font-face\s*\{([^}]+)\}', re.DOTALL)


def parse_blocks(css: str) -> list[dict]:
    faces = []
    for block in BLOCK_RE.findall(css):
        weight = re.search(r'font-weight:\s*(\d+)', block)
        range_ = re.search(r'unicode-range:\s*([^;]+)', block)
        url = re.search(r'url\((https://[^)]+\.woff2)\)', block)
        if weight and range_ and url:
            faces.append({
                'weight': int(weight.group(1)),
                'range': range_.group(1),
                'url': url.group(1),
            })
    return faces


def fetch(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())


def google_css(family: str, weight: int) -> str:
    url = f'https://fonts.googleapis.com/css2?family={family}:wght@{weight}&display=swap'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return urllib.request.urlopen(req, timeout=60).read().decode('utf-8')


def latin_urls(css: str, weight: int) -> list[str]:
    urls = []
    for face in parse_blocks(css):
        if face['weight'] != weight:
            continue
        r = face['range']
        if '0400' in r or '0460' in r or '0370' in r:
            continue
        if '00FF' in r or '0100' in r or '1E00' in r:
            urls.append(face['url'])
    return _dedupe(urls)


def cyrillic_urls(css: str, weight: int) -> list[str]:
    urls = []
    for face in parse_blocks(css):
        if face['weight'] != weight:
            continue
        r = face['range']
        if '0400' in r or '0460' in r:
            urls.append(face['url'])
    return _dedupe(urls)


def _dedupe(urls: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def merge_woff2(urls: list[str], out: Path, unicodes: str) -> None:
    from fontTools.merge import Merger

    CACHE.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for url in urls:
        cached = CACHE / (re.sub(r'[^a-zA-Z0-9]+', '_', url) + '.woff2')
        if not cached.exists():
            print(f'  fetch {url}')
            fetch(url, cached)
        paths.append(cached)

    tmp = CACHE / f'_merge_{out.name}.ttf'
    if len(paths) > 1:
        Merger().merge([str(p) for p in paths]).save(tmp)
    else:
        from fontTools.ttLib import TTFont
        TTFont(paths[0]).save(tmp)

    subset(tmp, out, unicodes)
    tmp.unlink(missing_ok=True)


def subset(src: Path, out: Path, unicodes: str) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable, '-m', 'fontTools.subset',
        str(src),
        f'--output-file={out}',
        '--flavor=woff2',
        f'--unicodes={unicodes}',
        '--layout-features=*',
        '--glyph-names',
        '--symbol-cmap',
        '--legacy-cmap',
        '--notdef-glyph',
        '--notdef-outline',
        '--recommended-glyphs',
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def main() -> None:
    try:
        import fontTools  # noqa: F401
    except ImportError:
        print('Install fonttools: pip install fonttools brotli', file=sys.stderr)
        sys.exit(1)

    for group, locale, family, weight, stem, label in FACES:
        out = ROOT / group / locale / f'{stem}.woff2'
        print(f'Building {out.relative_to(ROOT)} ({label} {weight})')
        css = google_css(family, weight)
        unicodes = LATIN if locale == 'latin' else CYRILLIC
        urls = latin_urls(css, weight) if locale == 'latin' else cyrillic_urls(css, weight)
        if not urls:
            raise RuntimeError(f'No slices for {family} {weight} {locale}')
        merge_woff2(urls, out, unicodes)

    print('Done.')


if __name__ == '__main__':
    main()
