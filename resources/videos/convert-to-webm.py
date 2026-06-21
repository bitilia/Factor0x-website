import subprocess
from pathlib import Path

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def convert_video(input_path: Path, output_path: Path):
    subprocess.run(
        [
            FFMPEG, "-i", str(input_path),
            "-c:v", "libvpx-vp9",
            "-lossless", "1",
            "-an",
            str(output_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

def main():
    folder = Path(__file__).resolve().parent

    converted = 0

    for file in folder.iterdir():
        if file.suffix.lower() != ".mp4":
            continue

        output_file = file.with_suffix(".webm")

        if output_file.exists():
            continue

        try:
            convert_video(file, output_file)
            print(f"{file.name} -> {output_file.name}")
            converted += 1
        except Exception as e:
            print(f"Failed: {file.name} ({e})")

    print(f"\nDone. Converted {converted} file(s).")

if __name__ == "__main__":
    main()
