#!/usr/bin/env python3
"""Smoke test: 3 shots, 2fps, 6s each. Tests render pipeline end-to-end."""
import math, os, subprocess, sys
from PIL import Image, ImageDraw

W, H = 1280, 720
FPS = 2
SHOT_DURATION = 6.0
FRAMES_PER_SHOT = int(FPS * SHOT_DURATION)

OUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUT_DIR, exist_ok=True)

SCENES = []


def scene_01_red_circle(t, u):
    """Red circle moves left to right across frame."""
    im = Image.new("RGB", (W, H), (245, 242, 238))
    d = ImageDraw.Draw(im)
    x = int(100 + 1080 * u)
    y = 360
    r = 60
    d.ellipse([x - r, y - r, x + r, y + r], fill=(180, 50, 50), outline=(40, 40, 40), width=3)
    # Subtle border
    for i in range(4):
        d.rectangle([i, i, W - 1 - i, H - 1 - i], outline=(200, 195, 190), width=1)
    return im


def scene_02_gold_line_to_circle(t, u):
    """Gold line curves and becomes a circle."""
    im = Image.new("RGB", (W, H), (245, 242, 238))
    d = ImageDraw.Draw(im)
    cx, cy = 640, 360
    # Line extends from left, curls into circle
    progress = min(1.0, u * 1.5)
    if progress < 0.5:
        # Line phase
        p = progress / 0.5
        x_end = int(100 + 1080 * p)
        d.line([(100, cy), (x_end, cy)], fill=(180, 150, 60), width=4)
    else:
        # Circle phase
        p = (progress - 0.5) / 0.5
        r = int(50 + 150 * p)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(180, 150, 60), width=4)
    for i in range(4):
        d.rectangle([i, i, W - 1 - i, H - 1 - i], outline=(200, 195, 190), width=1)
    return im


def scene_03_split_field_recombine(t, u):
    """Black split field recombines into unity."""
    im = Image.new("RGB", (W, H), (245, 242, 238))
    d = ImageDraw.Draw(im)
    split = int(360 + 360 * math.cos(u * math.pi))
    # Left field darkens
    d.rectangle([0, 0, split, H], fill=(60, 60, 65))
    # Gold thread reconnects
    thread_y = int(360 + 100 * math.sin(t * 2))
    d.line([(0, thread_y), (W, thread_y)], fill=(180, 150, 60), width=3)
    for i in range(4):
        d.rectangle([i, i, W - 1 - i, H - 1 - i], outline=(200, 195, 190), width=1)
    return im


SCENES = [scene_01_red_circle, scene_02_gold_line_to_circle, scene_03_split_field_recombine]


def render():
    print(f"Rendering {len(SCENES)} shots at {W}x{H}, {FPS}fps, {SHOT_DURATION}s each...")
    for idx, scene_fn in enumerate(SCENES):
        sid = f"s{idx + 1:03d}"
        shot_dir = os.path.join(OUT_DIR, sid)
        os.makedirs(shot_dir, exist_ok=True)
        for fi in range(FRAMES_PER_SHOT):
            t_val = fi / FPS
            u_val = fi / FRAMES_PER_SHOT
            im = scene_fn(t_val, u_val)
            im.save(os.path.join(shot_dir, f"frame_{fi:05d}.png"))
        # Create clip
        mp4_path = os.path.join(OUT_DIR, f"{sid}.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(FPS), "-i",
            f"{shot_dir}/frame_%05d.png",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-preset", "ultrafast", "-crf", "28",
            "-t", str(SHOT_DURATION), mp4_path
        ], capture_output=True)
        print(f"  {sid}: {FRAMES_PER_SHOT} frames → {mp4_path}")

    # Concatenate
    concat_file = os.path.join(OUT_DIR, "concat.txt")
    with open(concat_file, "w") as f:
        for idx in range(len(SCENES)):
            f.write(f"file '{os.path.join(OUT_DIR, f's{idx+1:03d}.mp4')}'\n")

    final_path = os.path.join(OUT_DIR, "final.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_file, "-c", "copy", final_path
    ], capture_output=True)
    print(f"  Final: {final_path}")
    print("Render complete.")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "render"
    if mode == "render":
        render()
    else:
        print(f"Unknown mode: {mode}")
