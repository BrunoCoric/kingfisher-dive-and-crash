#!/usr/bin/env python3
"""Remove background from a kingfisher PNG and tight-crop to the bird.

Usage:
  python3 scripts/cutout_kingfisher.py src/assets/kingfishers/yellow-billed-kingfisher.png
  python3 scripts/cutout_kingfisher.py src/assets/kingfishers/*.png
  python3 scripts/cutout_kingfisher.py src/assets/kingfishers/ --inplace
  python3 scripts/cutout_kingfisher.py src/assets/kingfishers/azure-kingfisher2.png --crop-only

First time (full cutout path):
  pip3 install rembg pillow onnxruntime

--crop-only only needs pillow (skips rembg when the PNG is already transparent).
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from PIL import Image


def content_bbox(
    alpha: Image.Image, *, alpha_threshold: int, min_opaque: int
) -> tuple[int, int, int, int] | None:
    """Bounding box of real content, ignoring thin alpha fringe strips.

    Generator leftovers sometimes leave a 1–2px semi-transparent streak along an
    edge that would otherwise stretch the crop to the canvas border.
    """
    w, h = alpha.size
    px = alpha.load()

    def row_count(y: int) -> int:
        return sum(1 for x in range(w) if px[x, y] >= alpha_threshold)

    def col_count(x: int) -> int:
        return sum(1 for y in range(h) if px[x, y] >= alpha_threshold)

    rows = [y for y in range(h) if row_count(y) >= min_opaque]
    cols = [x for x in range(w) if col_count(x) >= min_opaque]
    if not rows or not cols:
        # Fall back to any-pixel bbox if occupancy filter removes everything
        mask = alpha.point(lambda p: 255 if p >= alpha_threshold else 0)
        return mask.getbbox()
    return cols[0], rows[0], cols[-1] + 1, rows[-1] + 1


def tight_crop(
    img: Image.Image,
    padding: int = 8,
    *,
    alpha_threshold: int = 8,
    min_opaque: int = 8,
) -> Image.Image:
    """Crop to opaque content. Ignores faint alpha noise and thin fringe strips."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.getchannel("A")
    bbox = content_bbox(
        alpha, alpha_threshold=alpha_threshold, min_opaque=min_opaque
    )
    if bbox is None:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    cropped = img.crop((left, top, right, bottom))
    # Zero out residual fringe so later crops stay tight
    if alpha_threshold > 1:
        r, g, b, a = cropped.split()
        a = a.point(lambda p: p if p >= alpha_threshold else 0)
        cropped = Image.merge("RGBA", (r, g, b, a))
    return cropped


def process(
    path: Path,
    *,
    inplace: bool,
    suffix: str,
    padding: int,
    crop_only: bool,
    alpha_threshold: int,
    min_opaque: int,
) -> Path:
    if crop_only:
        img = Image.open(path).convert("RGBA")
    else:
        from rembg import remove

        cutout = remove(path.read_bytes())
        img = Image.open(io.BytesIO(cutout)).convert("RGBA")
    img = tight_crop(
        img,
        padding=padding,
        alpha_threshold=alpha_threshold,
        min_opaque=min_opaque,
    )

    out = path if inplace else path.with_name(f"{path.stem}{suffix}{path.suffix}")
    img.save(out, format="PNG", optimize=True)
    return out


def collect_paths(args: list[str]) -> list[Path]:
    paths: list[Path] = []
    for arg in args:
        p = Path(arg)
        if p.is_dir():
            paths.extend(sorted(p.glob("*.png")))
        elif p.is_file():
            paths.append(p)
        else:
            print(f"skip (not found): {p}", file=sys.stderr)
    return paths


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", help="PNG file(s) or a directory")
    parser.add_argument(
        "--inplace",
        action="store_true",
        help="overwrite the input file (default: write *-cutout.png)",
    )
    parser.add_argument(
        "--suffix",
        default="-cutout",
        help="suffix for output filename when not --inplace (default: -cutout)",
    )
    parser.add_argument(
        "--padding",
        type=int,
        default=8,
        help="transparent pixels kept around the bird (default: 8)",
    )
    parser.add_argument(
        "--crop-only",
        action="store_true",
        help="skip rembg; tight-crop alpha only (for already-transparent PNGs)",
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=8,
        help="ignore pixels with alpha below this when cropping (default: 8)",
    )
    parser.add_argument(
        "--min-opaque",
        type=int,
        default=8,
        help="min opaque pixels in a row/col for it to count toward the crop (default: 8)",
    )
    opts = parser.parse_args()

    paths = collect_paths(opts.inputs)
    if not paths:
        print("no PNG files found", file=sys.stderr)
        return 1

    for path in paths:
        out = process(
            path,
            inplace=opts.inplace,
            suffix=opts.suffix,
            padding=opts.padding,
            crop_only=opts.crop_only,
            alpha_threshold=opts.alpha_threshold,
            min_opaque=opts.min_opaque,
        )
        print(f"{path.name} -> {out.name} ({Image.open(out).size[0]}x{Image.open(out).size[1]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
