from PIL import Image, ImageDraw
import math

W, H = 1280, 720
PAPER = (247, 240, 227)
CRIMSON = (220, 20, 60)
LAPIS = (44, 62, 120)
DARK = (20, 18, 16)


def sc01(t, u, idx):
    """Point at center extends into a line — the pointer revealing."""
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)

    cx, cy = W // 2, H // 2

    # progress from point to full line: u goes 0→1 over the scene
    p = min(u * 1.8, 1.0)  # arrive earlier, hold

    # line half-length grows from 0 to 300
    half = int(300 * p)
    r = max(2, int(8 * (1 - p) + 2))  # dot shrinks as line extends

    # draw point first (fades as line appears)
    alpha_dot = max(0, int(255 * (1 - p * 1.2)))
    if alpha_dot > 0:
        dot_surf = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(dot_surf)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*CRIMSON, alpha_dot))
        img.paste(dot_surf, (0, 0), dot_surf)

    # line extends rightward from center
    lw = max(2, int(5 * p))
    draw.line([(cx, cy), (cx + half, cy)], fill=CRIMSON, width=lw)

    # subtle glow at the leading tip
    if half > 20:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        tip_x = cx + half
        for i in range(6, 0, -1):
            a = int(40 / (7 - i))
            r2 = i * 4
            gd.ellipse([tip_x - r2, cy - r2, tip_x + r2, cy + r2],
                       fill=(*CRIMSON, a))
        img.paste(glow, (0, 0), glow)

    return img


def sc02(t, u, idx):
    """Line splits into two directions — container vs pointer distinction."""
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)

    cx, cy = W // 2, H // 2

    # u: 0→1 — the fork unfolds
    p = min(u * 1.5, 1.0)

    spread = int(220 * p)  # how far each arm extends

    # left arm (container) — LAPIS, curves downward
    lw = max(2, int(5 * p))
    draw.line([(cx, cy), (cx - spread, cy + int(spread * 0.4))],
              fill=LAPIS, width=lw)

    # right arm (pointer) — CRIMSON, continues straight-right then arcs up
    draw.line([(cx, cy), (cx + spread, cy - int(spread * 0.3))],
              fill=CRIMSON, width=lw)

    # container label
    if p > 0.3:
        a = int(200 * ((p - 0.3) / 0.7))
        lbl_surf = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lbl_surf)
        ld.text((cx - spread - 60, cy + int(spread * 0.4) + 15),
                "container", fill=(*LAPIS, a), font_size=20)
        img.paste(lbl_surf, (0, 0), lbl_surf)

    # pointer label
    if p > 0.3:
        a = int(200 * ((p - 0.3) / 0.7))
        lbl_surf = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lbl_surf)
        ld.text((cx + spread + 10, cy - int(spread * 0.3) - 30),
                "pointer", fill=(*CRIMSON, a), font_size=20)
        img.paste(lbl_surf, (0, 0), lbl_surf)

    # origin dot
    draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=DARK)

    return img
