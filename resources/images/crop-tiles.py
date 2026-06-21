"""
Crops the yield tile webps to their non-transparent content bounding box.
Run: python crop-tiles.py
Requires Pillow: pip install pillow
"""
from PIL import Image
import os

TILES = [
    "construction-earning.webp",
    "boat-earning.webp",
    "warehouse-earning.webp",
    "gold-platform-earning-normal.webp",
    "gold-platform-earning-hover.webp",
    "gold-platform-earning.webp",
]

here = os.path.dirname(os.path.abspath(__file__))

for fname in TILES:
    src = os.path.join(here, fname)
    if not os.path.exists(src):
        print(f"  skip  {fname}")
        continue
    img = Image.open(src).convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        print(f"  empty {fname}")
        continue
    cropped = img.crop(bbox)
    out = os.path.join(here, "cropped-" + fname)
    cropped.save(out, "WEBP", lossless=True)
    print(f"  {fname}: {img.size} -> {cropped.size}")

print("\nDone. Open dimensions-design.html in your browser.")
