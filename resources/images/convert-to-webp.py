from pathlib import Path
from PIL import Image

QUALITY = 85

def convert_image(input_path: Path, output_path: Path):
    with Image.open(input_path) as img:

        # Handle transparency correctly
        has_alpha = (
            img.mode in ("RGBA", "LA") or
            ("transparency" in img.info)
        )

        if has_alpha:
            img = img.convert("RGBA")
            img.save(output_path, "WEBP", lossless=False, quality=QUALITY, method=6)
        else:
            img = img.convert("RGB")
            img.save(output_path, "WEBP", quality=QUALITY, method=6)

def main():
    folder = Path(__file__).resolve().parent

    exts = {".png", ".jpg", ".jpeg"}
    converted = 0

    for file in folder.iterdir():
        if file.suffix.lower() not in exts:
            continue

        output_file = file.with_suffix(".webp")

        # skip existing output
        if output_file.exists():
            continue

        try:
            convert_image(file, output_file)
            print(f"{file.name} -> {output_file.name}")
            converted += 1
        except Exception as e:
            print(f"Failed: {file.name} ({e})")

    print(f"\nDone. Converted {converted} file(s).")

if __name__ == "__main__":
    main()