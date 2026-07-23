"""60 unique per-motif PIL renderers — one function per concept.
Each renderer produces a visually distinct output matching its motif name.
Generated for the Factory MCP pipeline."""

import math
from PIL import Image, ImageDraw

W, H = 1280, 720
VOID = (13, 17, 23); GOLD = (212, 165, 116); CRIMSON = (141, 44, 57)
LAPIS = (42, 70, 110); INK = (230, 225, 220); MUTED = (145, 141, 132)
WHITE = (248, 246, 240); CHARCOAL = (40, 40, 40)
PARCHMENT = (235, 227, 203); VERDIGRIS = (72, 130, 109)
BLOOD = (118, 27, 39); TEAL = (45, 125, 135)

S = lambda x: 0.5 + 0.5 * math.sin(x)

def canvas(bg=VOID):
    return Image.new("RGB", (W, H), bg)

# ── 1. EYE / VISION ─────────────────────────────────────────────────

def render_stone_eye(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Elliptical eye shape
    rx, ry = 100, 60
    d.ellipse((cx-rx, cy-ry, cx+rx, cy+ry), outline=GOLD+(int(reveal*200),), width=2)
    # Iris concentric
    for i in range(3):
        ri = (20 + i*15) * reveal
        d.ellipse((cx-ri, cy-ri, cx+ri, cy+ri), outline=GOLD+(int(reveal*(100+i*30)),), width=1)
    # Pupil
    pr = 10 + 3*S(t*0.5+idx)
    d.ellipse((cx-pr, cy-pr, cx+pr, cy+pr), fill=CRIMSON)
    return im

def render_eagle_eye(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    rx, ry = 140, 45
    d.ellipse((cx-rx, cy-ry, cx+rx, cy+ry), outline=GOLD+(int(reveal*180),), width=1)
    # Sharp pupil
    pr = 8 + 4*S(t*0.7+idx)
    d.ellipse((cx-pr, cy-pr, cx+pr, cy+pr), fill=CHARCOAL)
    d.ellipse((cx-pr+2, cy-pr+2, cx+pr-2, cy+pr-2), fill=GOLD)
    # Iris rings
    for i in range(4):
        ri = (20 + i*18) * reveal
        alpha = int(reveal*(80+i*25))
        d.ellipse((cx-ri, cy-ri, cx+ri, cy+ri), outline=VERDIGRIS+(alpha,), width=1)
    return im

def render_eye_lens(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    r = 80 + 20*S(t*0.3+idx)
    d.ellipse((cx-r, cy-r*0.7, cx+r, cy+r*0.7), outline=LAPIS+(int(reveal*150),), width=3)
    for i in range(5):
        ri = (10 + i*14) * (0.5 + 0.5*reveal)
        d.ellipse((cx-ri, cy-ri, cx+ri, cy+ri), outline=LAPIS+(int(reveal*(60+i*20)),), width=1)
    return im

# ── 2. WATER / FLOW ────────────────────────────────────────────────

def render_earth_water(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    for w in range(5):
        pts = []
        y0 = cy - 80 + w*35
        amp = 25 + w*8 + 10*S(t*0.3+w*0.5)
        for x in range(-350, 351, 6):
            dx = x * 0.02 + t*0.4 + w*1.2
            y = y0 + amp * math.sin(dx)
            pts.append((cx+x, y))
        alpha = int(min(1, t/2) * (180 - w*25))
        for i in range(1, len(pts)):
            d.line((pts[i-1], pts[i]), fill=MUTED+(alpha,), width=1)
    return im

def render_ocean_wave(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    for w in range(7):
        pts = []
        amp = 40 + w*12
        for x in range(-400, 401, 4):
            dx = x * 0.01 + t*0.3 + w*0.8
            y = cy + amp * math.sin(dx) * (1 + 0.5*math.sin(x*0.005))
            pts.append((cx+x, int(y)))
        alpha = int(reveal * (120 - w*12))
        if len(pts) > 1:
            for i in range(1, len(pts)):
                d.line((pts[i-1], pts[i]), fill=TEAL+(alpha,), width=1)
    return im

def render_river_path(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    pts = []
    for step in range(200):
        uu = step/199
        x = cx - 300 + uu*600
        y = cy + 200*math.sin(uu*3 + t*0.2) + 50*math.sin(uu*7 + idx*0.5)
        pts.append((int(x), int(y)))
    for i in range(1, min(int(reveal*len(pts)), len(pts))):
        alpha = int(150 * (1 - i/len(pts)))
        d.line((pts[i-1], pts[i]), fill=LAPIS+(alpha,), width=3)
    return im

def render_blood_river(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    pts_a, pts_b = [], []
    for step in range(150):
        uu = step/149
        x = cx - 350 + uu*700
        y = cy + 150*math.sin(uu*2.5 + t*0.25) * math.sin(uu*1.2)
        y2 = cy + 150*math.sin(uu*2.5 + t*0.25 + 0.8) * math.sin(uu*1.2 + 0.5)
        pts_a.append((int(x), int(y)))
        pts_b.append((int(x), int(y2)))
    for pts in [pts_a, pts_b]:
        for i in range(1, min(int(reveal*len(pts)), len(pts))):
            alpha = int(180 * (1 - i/len(pts)))
            d.line((pts[i-1], pts[i]), fill=BLOOD+(alpha,), width=2)
    return im

# ── 3. CRYSTAL / STRUCTURE ─────────────────────────────────────────

def render_crystal_lattice(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    spacing = 50
    tilt = 0.3 + 0.05*S(t*0.2+idx)
    for row in range(7):
        for col in range(9):
            x = cx - 200 + col*spacing + row*15*math.sin(tilt)
            y = cy - 150 + row*spacing*0.6
            dist = math.hypot(x-cx, y-cy)
            if dist > 320: continue
            alpha = int(reveal * (200 - dist/2))
            d.ellipse((x-4, y-4, x+4, y+4), fill=GOLD+(alpha,))
            # Connect neighbors
            if col < 8:
                nx = x + spacing
                d.line((x, y, nx, y), fill=GOLD+(alpha//2,), width=1)
            if row < 6:
                ny = y + spacing*0.6
                d.line((x, y, x+15*math.sin(tilt), ny), fill=GOLD+(alpha//2,), width=1)
    return im

def render_fish_scale(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    for row in range(-8, 9):
        for col in range(-10, 11):
            x = cx + col*35 + row*17*S(t*0.05+idx+row)
            y = cy + row*30 + 10*S(t*0.1+row*0.3)
            dist = math.hypot(x-cx, y-cy)
            if dist > 350: continue
            r = 14 + 4*S(t*0.2+col*0.3+row*0.7)
            alpha = int(reveal * (200 - dist))
            d.ellipse((x-r, y-r, x+r, y+r), outline=GOLD+(alpha,), width=1)
    return im

def render_polygon_mandala(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    for layer in range(6):
        n = 4 + layer*2
        r = 30 + layer*40
        alpha = int(reveal * (200 - layer*20))
        pts = []
        for i in range(n):
            a = i*2*math.pi/n + t*0.02*(layer+1) + layer*0.3
            x = cx + r*math.cos(a)
            y = cy + r*math.sin(a)
            pts.append((int(x), int(y)))
        for i in range(n):
            d.line((pts[i], pts[(i+1)%n]), fill=GOLD+(alpha,), width=1)
        if n >= 6:
            for i in range(n):
                k = (i+2)%n
                d.line((pts[i], pts[k]), fill=GOLD+(alpha//3,), width=1)
    d.ellipse((cx-4, cy-4, cx+4, cy+4), fill=GOLD)
    return im

# ── 4. SEED / GROWTH ───────────────────────────────────────────────

def render_seed_flower(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    n = 8
    for i in range(n):
        a = i*2*math.pi/n + t*0.05
        r = 30 + 80*reveal + 15*S(t*0.3+i)
        x = cx + r*math.cos(a)
        y = cy + r*math.sin(a)
        alpha = int(reveal * 180)
        d.line((cx, cy, x, y), fill=GOLD+(alpha,), width=1)
        d.ellipse((x-6, y-6, x+6, y+6), outline=GOLD+(alpha,), width=1)
    d.ellipse((cx-6, cy-6, cx+6, cy+6), fill=GOLD)
    return im

def render_flower_petal(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    n_petals = 6 + idx%3
    for i in range(n_petals):
        a = i*2*math.pi/n_petals + t*0.03
        r = 20 + 100*reveal + 10*S(t*0.4+i*0.7)
        px = cx + r*math.cos(a)
        py = cy + r*math.sin(a)
        cp = 0.3
        mx = cx + r*0.5*math.cos(a+cp)
        my = cy + r*0.5*math.sin(a+cp)
        alpha = int(reveal * 160)
        d.polygon([(cx, cy), (int(px), int(py)), (int(mx), int(my))], 
                  outline=GOLD+(alpha,), width=1)
        d.ellipse((int(px)-4, int(py)-4, int(px)+4, int(py)+4), outline=GOLD+(alpha-30,), width=1)
    d.ellipse((cx-5, cy-5, cx+5, cy+5), fill=CRIMSON)
    return im

def render_leaf_vein(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Central vein
    l = max(1, 200*reveal)
    d.line((cx, cy-l, cx, cy+l), fill=GOLD+(int(reveal*200),), width=2)
    # Branching veins
    for side in (-1, 1):
        for i in range(8):
            yy = cy - l + i*(2*l/7)
            if abs(yy-cy) > l: continue
            angle = 0.4 + 0.2*S(t*0.3+i*0.7)
            vlen = 40 + 20*(1-abs(yy-cy)/l)
            x2 = cx + side*vlen*math.cos(angle)
            y2 = yy + side*vlen*math.sin(angle)
            alpha = int(reveal * (150 - i*10))
            d.line((cx, int(yy), int(x2), int(y2)), fill=GOLD+(alpha,), width=1)
    return im

def render_tree_root(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    def branch(x, y, angle, depth, max_depth=5):
        if depth > max_depth or reveal < depth*0.15: return
        length = 50 - depth*8
        x2 = x + length*math.cos(angle)*reveal
        y2 = y + length*math.sin(angle)*reveal
        alpha = int(reveal * (220 - depth*30))
        d.line((int(x), int(y), int(x2), int(y2)), fill=GOLD+(alpha,), width=max(1, 3-depth//2))
        branch(x2, y2, angle-0.3, depth+1)
        branch(x2, y2, angle+0.3, depth+1)
    branch(cx, cy+80, -math.pi/2, 0)
    return im

# ── 5. STAR / NETWORK ─────────────────────────────────────────────

def render_star_map(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    nodes = []
    for i in range(20):
        a = i*1.3 + idx*0.2
        r = 40 + i*12 + 20*S(t*0.15+i*0.3)
        x = cx + r*math.cos(a+t*0.02)
        y = cy + r*math.sin(a+t*0.02)
        nodes.append((int(x), int(y)))
    for i in range(len(nodes)):
        for j in range(i+1, len(nodes)):
            dx = nodes[j][0]-nodes[i][0]
            dy = nodes[j][1]-nodes[i][1]
            if math.hypot(dx, dy) < 150:
                alpha = int(reveal * 60)
                d.line((nodes[i], nodes[j]), fill=GOLD+(alpha,), width=1)
        sz = 4 + 3*S(t*0.3+i*0.5+idx)
        d.ellipse((nodes[i][0]-sz, nodes[i][1]-sz, nodes[i][0]+sz, nodes[i][1]+sz), fill=GOLD)
    return im

def render_spider_web(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    n_spokes = 12
    max_r = 250*reveal
    for i in range(n_spokes):
        a = i*2*math.pi/n_spokes + t*0.02
        x = cx + max_r*math.cos(a)
        y = cy + max_r*math.sin(a)
        d.line((cx, cy, int(x), int(y)), fill=GOLD+(int(reveal*120),), width=1)
    for ring_i in range(8):
        r = (ring_i+1)*max_r/8
        alpha = int(reveal * (100 - ring_i*8))
        pts = []
        for i in range(n_spokes+1):
            a = i*2*math.pi/n_spokes + t*0.02
            x = cx + r*math.cos(a)
            y = cy + r*math.sin(a)
            pts.append((int(x), int(y)))
        for i in range(1, len(pts)):
            d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=1)
    return im

def render_node_web(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    n_groups = 5
    centers = []
    for i in range(n_groups):
        a = i*2*math.pi/n_groups + idx*0.3
        r = 120 + 30*S(t*0.1+i)
        centers.append((int(cx+r*math.cos(a)), int(cy+r*math.sin(a))))
    for ci in centers:
        for cj in centers:
            if ci >= cj: continue
            d.line((ci, cj), fill=GOLD+(int(reveal*80),), width=1)
    for c in centers:
        for _ in range(3):
            dx = 30*S(t*0.2+hash(str(c))%10)
            dy = 30*S(t*0.3+hash(str(c))%7)
            px, py = c[0]+int(dx), c[1]+int(dy)
            d.ellipse((px-4, py-4, px+4, py+4), fill=GOLD)
    return im

def render_skin_map(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    for i in range(30):
        a = i*2.1 + idx*0.5
        r = 30 + i*9 + 15*S(t*0.2+i*0.4+idx)
        x = int(cx + r*math.cos(a+t*0.03))
        y = int(cy + r*math.sin(a+t*0.03))
        size = 3 + 2*S(t*0.5+i+idx)
        d.ellipse((x-size, y-size, x+size, y+size), fill=PARCHMENT+(int(reveal*100),))
        if i % 3 == 0:
            d.line((cx, cy, x, y), fill=PARCHMENT+(int(reveal*40),), width=1)
    return im

# ── 6. FIRE / LIGHT ────────────────────────────────────────────────

def render_flame_candle(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    flicker = 1 + 0.05*math.sin(t*8+idx*3) + 0.03*math.sin(t*13+idx*7)
    # Flame body
    fh = 80*flicker*reveal
    fw = 25
    pts = [(cx, int(cy-fh)), (cx+fw, cy), (cx, cy+5), (cx-fw, cy)]
    alpha = int(reveal * 200)
    d.polygon(pts, fill=GOLD+(alpha,))
    # Inner glow
    d.ellipse((cx-12, cy-20, cx+12, cy+10), fill=WHITE+(int(reveal*100),))
    # Candle body
    d.rectangle((cx-12, cy+5, cx+12, cy+60), fill=PARCHMENT+(int(reveal*150),))
    return im

def render_smith_forge(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Anvil shape
    d.rectangle((cx-60, cy+30, cx+60, cy+80), fill=CHARCOAL+(int(reveal*200),))
    d.polygon([(cx-30, cy+30), (cx+30, cy+30), (cx+50, cy-10), (cx-50, cy-10)], 
              outline=CHARCOAL+(int(reveal*180),), width=2)
    # Glowing forge
    for i in range(5):
        r = 30 + i*15 + 10*S(t*0.5+idx+i)
        alpha = int(reveal * (150 - i*25))
        d.ellipse((cx-r, cy-20-r, cx+r, cy-20+r), outline=CRIMSON+(alpha,), width=1)
    return im

def render_gold_scale(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Balance scale
    d.line((cx, cy-60, cx, cy+60), fill=GOLD+(int(reveal*200),), width=2)
    d.line((cx-80, cy-40, cx+80, cy-40), fill=GOLD+(int(reveal*180),), width=2)
    # Pans
    for side in (-1, 1):
        px = cx + side*70
        swing = 0.1*math.sin(t*0.3+idx)
        pan_y = cy-40 + 40*math.cos(swing)
        pan_x = px + 40*math.sin(swing)
        d.line((cx+side*80, cy-40, int(pan_x), int(pan_y)), fill=GOLD+(int(reveal*150),), width=1)
        d.ellipse((int(pan_x)-20, int(pan_y)-8, int(pan_x)+20, int(pan_y)+8), 
                  outline=GOLD+(int(reveal*160),), width=2)
    return im

# ── 7. MOUNTAIN / ARCHITECTURE ─────────────────────────────────────

def render_mountain_peak(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    pts = [(cx-300, cy+150), (cx-100, cy-80), (cx, cy-120), (cx+100, cy-60), (cx+300, cy+150)]
    shown = int(reveal * len(pts))
    for i in range(1, min(shown+1, len(pts))):
        alpha = int(200 * i/len(pts))
        d.line((pts[i-1], pts[i]), fill=CHARCOAL+(alpha,), width=2)
    # Peak glow
    pr = 20 + 10*S(t*0.3+idx)
    d.ellipse((cx-pr, cy-120-pr, cx+pr, cy-120+pr), outline=GOLD+(int(reveal*100),), width=1)
    return im

def render_temple_column(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    n = 5
    w = 200
    for i in range(n):
        x = cx - w//2 + i*w//(n-1)
        col_h = (80 + i*15) * reveal
        alpha = int(reveal * 180)
        d.line((x, cy+80, x, cy+80-col_h), fill=GOLD+(alpha,), width=6)
        d.ellipse((x-8, cy+80-col_h-4, x+8, cy+80-col_h+4), fill=GOLD+(alpha,))
    # Pediment
    d.line((cx-w//2, cy+80, cx+w//2, cy+80), fill=GOLD+(int(reveal*150),), width=2)
    return im

def render_tower_window(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    ww, wh = 120, 180
    d.rectangle((cx-ww//2, cy-wh//2, cx+ww//2, cy+wh//2), outline=GOLD+(int(reveal*180),), width=2)
    d.arc((cx-ww//2, cy-wh//2, cx+ww//2, cy+wh//2-reveal*20), 0, 180, 
          fill=GOLD+(int(reveal*150),), width=2)
    # Cross bars
    d.line((cx-ww//2, cy, cx+ww//2, cy), fill=GOLD+(int(reveal*100),), width=1)
    d.line((cx, cy-wh//2, cx, cy+wh//2), fill=GOLD+(int(reveal*100),), width=1)
    return im

def render_bridge_arch(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    span = 300
    d.arc((cx-span//2, cy-100, cx+span//2, cy+100), 0, 180, 
          fill=GOLD+(int(reveal*180),), width=3)
    # Rails
    for i in range(5):
        uu = i/4
        ax = cx - span//2 + uu*span
        ay = cy - 80*math.sin(uu*math.pi)*reveal
        d.line((int(ax), int(ay), int(ax), int(ay+60)), fill=GOLD+(int(reveal*100),), width=2)
    return im

# ── 8. BODY / FIGURE ───────────────────────────────────────────────

def render_heart_drum(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    beat = 0.5 + 0.5*S(t*1.5+idx)
    reveal = min(1, t/2)
    r = 30 + 40*beat*reveal
    d.ellipse((cx-r, cy-r*0.8, cx+r, cy+r*0.8), outline=CRIMSON+(int(reveal*200),), width=2)
    for i in range(3):
        ri = r + 20*(i+1)*beat
        alpha = int(reveal * (100 - i*20))
        d.ellipse((cx-ri, cy-ri*0.8, cx+ri, cy+ri*0.8), outline=CRIMSON+(alpha,), width=1)
    return im

def render_breath_bell(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    breathe = 1 + 0.06*S(t*0.4+idx)
    reveal = min(1, t/2.5)
    r = 60*breathe*reveal
    d.ellipse((cx-r, cy-r*1.2, cx+r, cy+r*1.2), outline=GOLD+(int(reveal*180),), width=2)
    # Clapper
    cr = 8 + 4*S(t*0.8+idx)
    d.ellipse((cx-cr, cy+30-cr, cx+cr, cy+30+cr), fill=GOLD)
    return im

def render_bone_frame(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    # Ribcage arcs
    for i in range(6):
        a = 0.3 + i*0.15
        rx = 80 + i*12
        ry = 90 + i*8
        alpha = int(reveal * (160 - i*15))
        d.arc((cx-rx, cy-ry*0.5, cx+rx, cy+ry*0.5), int(-90-a), int(-90+a), 
              fill=INK+(alpha,), width=1)
    # Spine
    d.line((cx, cy-100, cx, cy+80), fill=INK+(int(reveal*200),), width=2)
    return im

def render_hand_loom(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    n = 10
    # Warp threads (vertical)
    for i in range(n):
        x = cx - 90 + i*20
        alpha = int(reveal * (150 + 50*S(t*0.2+i*0.7+idx)))
        d.line((x, cy-80, x, cy+80), fill=GOLD+(alpha,), width=1)
    # Weft threads (horizontal, moving)
    for i in range(6):
        y = cy - 80 + i*32 + 10*S(t*0.3+i*0.5)
        alpha = int(reveal * 120)
        d.line((cx-100, int(y), cx+100, int(y)), fill=VERDIGRIS+(alpha,), width=2)
    return im

# ── 9. CRAFT / OBJECT ──────────────────────────────────────────────

def render_iron_anvil(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.polygon([(cx-60, cy+40), (cx+60, cy+40), (cx+40, cy-20), (cx-40, cy-20)],
              outline=CHARCOAL+(int(reveal*200),), width=3)
    d.rectangle((cx-50, cy-20, cx+50, cy-10), fill=CHARCOAL+(int(reveal*180),))
    d.rectangle((cx-20, cy+40, cx+20, cy+70), fill=CHARCOAL+(int(reveal*150),))
    # Hammer
    if reveal > 0.5:
        h_angle = 0.3*math.sin(t*0.8+idx)
        d.line((cx+60, cy-40, cx+90, cy-80), fill=CHARCOAL+(int(reveal*160),), width=4)
        d.rectangle((cx+80, cy-90, cx+100, cy-70), fill=CHARCOAL+(int(reveal*160),))
    return im

def render_copper_bell(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.arc((cx-40, cy-80, cx+40, cy+40), 180, 360, fill=GOLD+(int(reveal*200),), width=3)
    d.line((cx-40, cy-20, cx+40, cy-20), fill=GOLD+(int(reveal*180),), width=2)
    d.line((cx, cy-80, cx, cy-100), fill=GOLD+(int(reveal*150),), width=2)
    # Clapper
    cr = 6 + 3*S(t*0.5+idx)
    d.ellipse((cx-cr, cy+10-cr, cx+cr, cy+10+cr), fill=GOLD)
    # Sound waves
    for i in range(3):
        r = 50 + i*25 + 10*S(t*0.6+idx*2)
        alpha = int(reveal * (80 - i*20))
        d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=GOLD+(alpha,), width=1)
    return im

def render_silver_mirror(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    r = 100 + 10*S(t*0.2+idx)
    d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=INK+(int(reveal*200),), width=2)
    d.ellipse((cx-r+10, cy-r+10, cx+r-10, cy+r-10), outline=INK+(int(reveal*100),), width=1)
    # Reflection shimmer
    for i in range(6):
        a = i*1.0 + t*0.3
        shimmer_r = 40 + 20*S(t*0.2+i)
        sx = cx + shimmer_r*math.cos(a)
        sy = cy + shimmer_r*math.sin(a)
        d.ellipse((int(sx)-4, int(sy)-4, int(sx)+4, int(sy)+4), fill=INK+(int(reveal*60),))
    return im

def render_bishop_codex(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Book shape
    bw, bh = 120, 160
    d.rectangle((cx-bw//2, cy-bh//2, cx+bw//2, cy+bh//2), outline=GOLD+(int(reveal*200),), width=2)
    d.line((cx, cy-bh//2, cx, cy+bh//2), fill=GOLD+(int(reveal*150),), width=1)
    # Pages
    for i in range(4):
        yy = cy-bh//2+20 + i*30
        d.line((cx-40, yy, cx-5, yy), fill=GOLD+(int(reveal*80),), width=1)
        d.line((cx+5, yy, cx+40, yy), fill=GOLD+(int(reveal*80),), width=1)
    return im

def render_scribe_scroll(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    sw, sh = 80, 200
    d.rectangle((cx-sw//2, cy-sh//2, cx+sw//2, cy+sh//2), outline=PARCHMENT+(int(reveal*200),), width=2)
    # Rolled top/bottom
    d.ellipse((cx-sw//2, cy-sh//2-10, cx+sw//2, cy-sh//2+10), fill=PARCHMENT+(int(reveal*150),))
    d.ellipse((cx-sw//2, cy+sh//2-10, cx+sw//2, cy+sh//2+10), fill=PARCHMENT+(int(reveal*150),))
    return im

def render_weaver_loom(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    n = 12
    for i in range(n):
        x = cx - 120 + i*20
        alpha = int(reveal * 180)
        d.line((x, cy-100, x, cy+100), fill=GOLD+(alpha,), width=1)
    for i in range(8):
        y = cy - 90 + i*25
        offset = 5 if i%2 == 0 else -5
        alpha = int(reveal * (120 + 30*S(t*0.2+i*0.7)))
        d.line((cx-110+offset, int(y), cx+110+offset, int(y)), fill=GOLD+(alpha,), width=2)
    return im

def render_potter_wheel(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Wheel
    r = 80
    d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=GOLD+(int(reveal*180),), width=2)
    d.ellipse((cx-r/3, cy-r/3, cx+r/3, cy+r/3), outline=GOLD+(int(reveal*100),), width=1)
    # Spokes
    for i in range(8):
        a = i*math.pi/4 + t*0.5
        x = cx + r*math.cos(a)
        y = cy + r*math.sin(a)
        d.line((cx, cy, int(x), int(y)), fill=GOLD+(int(reveal*120),), width=1)
    return im

def render_carpenter_plane(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.rectangle((cx-80, cy-15, cx+60, cy+15), outline=GOLD+(int(reveal*200),), width=2)
    d.rectangle((cx+60, cy-10, cx+70, cy+10), fill=GOLD+(int(reveal*180),))
    d.line((cx-80, cy, cx-120, cy), fill=GOLD+(int(reveal*150),), width=2)
    return im

def render_farmer_plow(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.line((cx-100, cy+40, cx+80, cy+40), fill=GOLD+(int(reveal*180),), width=3)
    d.line((cx-80, cy+40, cx-80, cy-20), fill=GOLD+(int(reveal*160),), width=2)
    d.line((cx+80, cy+40, cx+80, cy+60), fill=GOLD+(int(reveal*160),), width=2)
    d.polygon([(cx-80, cy-20), (cx-60, cy-40), (cx-40, cy-20)], 
              outline=GOLD+(int(reveal*150),), width=2)
    return im

def render_hunter_bow(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    bow_bend = 0.2*S(t*0.3+idx)
    for side in (-1, 1):
        pts = []
        for s in range(21):
            uu = s/20
            x = cx + side*(100 - 40*uu)
            y = cy - 80 + uu*160 + side*60*bow_bend*math.sin(uu*math.pi)
            pts.append((int(x), int(y)))
        for i in range(1, len(pts)):
            d.line((pts[i-1], pts[i]), fill=GOLD+(int(reveal*160),), width=2)
    # Bowstring
    d.line((cx-100, cy-80, cx-100, cy+80), fill=GOLD+(int(reveal*100),), width=1)
    d.line((cx+100, cy-80, cx+100, cy+80), fill=GOLD+(int(reveal*100),), width=1)
    return im

def render_sailor_compass(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    r = 100
    d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=GOLD+(int(reveal*200),), width=2)
    for i in range(8):
        a = i*math.pi/4
        inner_r = 80 if i%2 == 0 else 90
        x1 = cx + inner_r*math.cos(a)
        y1 = cy + inner_r*math.sin(a)
        x2 = cx + r*math.cos(a)
        y2 = cy + r*math.sin(a)
        d.line((int(x1), int(y1), int(x2), int(y2)), fill=GOLD+(int(reveal*150),), width=2)
    # Needle
    nd = 30*math.sin(t*0.1+idx)
    d.line((cx-nd, cy, cx+nd, cy), fill=CRIMSON+(int(reveal*200),), width=2)
    return im

# ── 10. THRESHOLD / DOOR ───────────────────────────────────────────

def render_chamber_door(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    dw, dh = 140, 200
    d.rectangle((cx-dw//2, cy-dh//2, cx+dw//2, cy+dh//2), outline=GOLD+(int(reveal*200),), width=2)
    d.arc((cx-dw//2, cy-dh//2, cx+dw//2, cy+dh//2-reveal*40), 0, 180, 
          fill=GOLD+(int(reveal*160),), width=2)
    # Handle
    hr = 8 + 2*S(t*0.3+idx)
    d.ellipse((cx-dw//4-hr, cy-hr, cx-dw//4+hr, cy+hr), outline=GOLD+(int(reveal*150),), width=1)
    return im

def render_threshold_gate(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.line((cx-180, cy+100, cx-180, cy-50), fill=GOLD+(int(reveal*180),), width=3)
    d.line((cx+180, cy+100, cx+180, cy-50), fill=GOLD+(int(reveal*180),), width=3)
    d.line((cx-180, cy-50, cx+180, cy-50), fill=GOLD+(int(reveal*180),), width=3)
    # Threshold glow
    if reveal > 0.3:
        g_alpha = int((reveal-0.3)*2*100)
        d.ellipse((cx-30, cy-20, cx+30, cy+20), outline=GOLD+(g_alpha,), width=2)
    return im

def render_ladder_rung(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    d.line((cx-30, cy-120, cx-30, cy+120), fill=GOLD+(int(reveal*180),), width=2)
    d.line((cx+30, cy-120, cx+30, cy+120), fill=GOLD+(int(reveal*180),), width=2)
    for i in range(10):
        y = cy-100 + i*22
        alpha = int(reveal * (100 + 80*S(t*0.1+i*0.5+idx)))
        d.line((cx-30, int(y), cx+30, int(y)), fill=GOLD+(alpha,), width=1)
    return im

def render_courtyard_well(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    r = 50
    d.ellipse((cx-r, cy-r*0.8, cx+r, cy+r*0.8), outline=GOLD+(int(reveal*200),), width=2)
    d.ellipse((cx-r+10, cy-r*0.8+10, cx+r-10, cy+r*0.8-10), outline=GOLD+(int(reveal*100),), width=1)
    # Water shimmer
    d.ellipse((cx-15, cy-8, cx+15, cy+8), fill=LAPIS+(int(reveal*120),))
    return im

# ── 11. SPIRAL / PATH ─────────────────────────────────────────────

def render_spiral_stair(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    pts = []
    for step in range(200):
        uu = step/199
        r = uu*200*reveal
        a = uu*6*math.pi + t*0.05
        x = cx + r*math.cos(a)
        y = cy + r*math.sin(a) - 80*uu
        pts.append((int(x), int(y)))
    for i in range(1, len(pts)):
        alpha = int(i/len(pts)*200)
        d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=1)
    return im

def render_serpent_coil(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    pts = []
    for step in range(300):
        uu = step/299
        a = uu*8*math.pi + t*0.2
        r = uu*180*reveal
        x = cx + r*math.cos(a)
        y = cy + r*math.sin(a)*0.6 + 60*math.sin(uu*math.pi)
        pts.append((int(x), int(y)))
    for i in range(1, len(pts)):
        alpha = int((1-i/len(pts))*200)
        d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=2)
    return im

def render_ant_tunnel(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    pts = []
    for step in range(150):
        uu = step/149
        x = cx - 300 + uu*600
        y = cy + 80*math.sin(uu*5 + t*0.3) + 40*math.sin(uu*9 + idx)
        pts.append((int(x), int(y)))
    for i in range(1, min(int(reveal*len(pts)), len(pts))):
        alpha = int(150 * (1 - i/len(pts)))
        d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=2)
    return im

def render_fox_track(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    for i in range(15):
        uu = i/14
        x = cx - 250 + uu*500
        y = cy + 40*math.sin(uu*4 + t*0.2) + 20*math.sin(uu*7 + idx)
        alpha = int(reveal * (80 + 100*(1-uu)))
        sz = 4 + 2*(1-uu)
        d.ellipse((int(x)-sz, int(y)-sz, int(x)+sz, int(y)+sz), fill=GOLD+(alpha,))
    return im

def render_foot_path(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    for i in range(12):
        uu = i/11
        x = cx - 280 + uu*560
        y = cy + 30*math.sin(uu*3 + t*0.15) + 20*math.sin(uu*8 + idx)
        alpha = int(reveal * (100 + 80*S(t*0.2+i)))
        # Footprint shape
        d.ellipse((int(x)-10, int(y)-14, int(x)+10, int(y)+14), 
                  outline=GOLD+(alpha,), width=1)
        d.ellipse((int(x)-4, int(y)-6, int(x)+4, int(y)+2), 
                  fill=GOLD+(alpha,))
    return im

# ── 12. VOICE / SOUND ──────────────────────────────────────────────

def render_voice_string(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    y_base = cy
    for s in range(3):
        pts = []
        freq = 2 + s*1.5
        amp = 30 + s*15
        for x in range(-350, 351, 4):
            xx = x * 0.01
            y = y_base + amp*math.sin(xx*freq*math.pi + t*1.5 + s*idx)
            pts.append((cx+x, int(y)))
        alpha = int(reveal * (180 - s*40))
        for i in range(1, len(pts)):
            d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=2-s//2)
    return im

# ── 13. VALLEY / FIELD ────────────────────────────────────────────

def render_valley_floor(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    for i in range(20):
        a = i*1.7 + idx*0.4
        r = 30 + i*14 + 20*S(t*0.15+i*0.3)
        x = cx + r*math.cos(a+t*0.02)
        y = cy + r*math.sin(a+t*0.02)
        sz = 3 + 2*S(t*0.4+i*0.7)
        alpha = int(reveal * (160 - i*5))
        d.ellipse((int(x)-sz, int(y)-sz, int(x)+sz, int(y)+sz), fill=MUTED+(alpha,))
    return im

def render_scatter_field(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/2.5)
    for i in range(25):
        a = i*2.3 + idx*0.6
        r = 20 + i*15 + 25*S(t*0.2+i*0.4+idx)
        x = cx + r*math.cos(a+t*0.03)
        y = cy + r*math.sin(a+t*0.03)
        sz = 2 + 3*S(t*0.5+i*0.6)
        alpha = int(reveal * (120 + 80*S(t*0.3+i*0.5)))
        d.ellipse((int(x)-sz, int(y)-sz, int(x)+sz, int(y)+sz), fill=GOLD+(alpha,))
        if i % 4 == 0:
            d.line((cx, cy, int(x), int(y)), fill=GOLD+(int(reveal*40),), width=1)
    return im

def render_market_stall(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Canopy
    d.line((cx-120, cy-30, cx+120, cy-30), fill=GOLD+(int(reveal*180),), width=2)
    d.line((cx-120, cy-30, cx-100, cy+10), fill=GOLD+(int(reveal*150),), width=1)
    d.line((cx+120, cy-30, cx+100, cy+10), fill=GOLD+(int(reveal*150),), width=1)
    d.line((cx-100, cy+10, cx+100, cy+10), fill=GOLD+(int(reveal*150),), width=1)
    # Items
    for i in range(5):
        x = cx - 80 + i*40 + 10*S(t*0.1+i)
        y = cy + 10 + 15*S(t*0.2+i*0.5)
        d.ellipse((int(x)-6, int(y)-6, int(x)+6, int(y)+6), outline=GOLD+(int(reveal*120),), width=1)
    return im

# ── 14. METAL / MINERAL ───────────────────────────────────────────

def render_salt_crust(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    for i in range(40):
        a = i*1.9 + idx*0.3
        r = 10 + i*8 + 15*S(t*0.15+i*0.5+idx)
        x = cx + r*math.cos(a+t*0.02)
        y = cy + r*math.sin(a+t*0.02)
        sz = 2 + 4*S(t*0.3+i*0.8)
        alpha = int(reveal * (200 - i*4))
        d.ellipse((int(x)-sz, int(y)-sz, int(x)+sz, int(y)+sz), fill=WHITE+(alpha,))
    return im

# ── 15. ANIMAL ────────────────────────────────────────────────────

def render_bird_wing(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    for side in (-1, 1):
        pts = []
        for s in range(30):
            uu = s/29
            x = cx + side*(uu*200)
            y = cy - uu*40*math.sin(uu*math.pi)*80*reveal
            pts.append((int(x), int(y)))
        for i in range(1, len(pts)):
            alpha = int(reveal * (200 - i*4))
            d.line((pts[i-1], pts[i]), fill=GOLD+(alpha,), width=1)
        # Feather lines
        for f in range(5):
            fu = f/4
            fx = cx + side*fu*200
            fy = cy - fu*80*reveal
            d.line((int(fx), int(fy), int(fx+side*30), int(fy-20)), 
                   fill=GOLD+(int(reveal*80),), width=1)
    return im

def render_lion_paw(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.ellipse((cx-50, cy-30, cx+50, cy+40), outline=GOLD+(int(reveal*200),), width=2)
    for i in range(4):
        a = -0.5 + i*0.3
        cx2 = cx - 25 + i*16
        cy2 = cy + 30
        x = cx2 + 20*math.cos(a)
        y = cy2 + 20*math.sin(a)
        d.ellipse((int(x)-8, int(y)-8, int(x)+8, int(y)+8), 
                  outline=GOLD+(int(reveal*150),), width=1)
    return im

def render_bear_claw(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    d.ellipse((cx-60, cy-40, cx+60, cy+30), outline=GOLD+(int(reveal*200),), width=2)
    for i in range(5):
        a = -0.6 + i*0.3
        cx2 = cx - 35 + i*17
        dx = 35*math.sin(a)*reveal
        dy = -35*math.cos(a)*reveal
        d.line((cx2, cy+20, int(cx2+dx), int(cy+dy)), fill=GOLD+(int(reveal*180),), width=3)
    return im

def render_deer_antler(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/4)
    for side in (-1, 1):
        def antler_branch(x, y, angle, depth):
            if depth > 4 or reveal < depth*0.2: return
            length = 50 - depth*8
            x2 = x + side*length*math.cos(angle)*reveal
            y2 = y - length*math.sin(angle)*reveal
            alpha = int(reveal * (200 - depth*30))
            d.line((int(x), int(y), int(x2), int(y2)), fill=GOLD+(alpha,), width=2)
            antler_branch(x2, y2, angle-0.4, depth+1)
            antler_branch(x2, y2, angle+0.2, depth+1)
        antler_branch(cx+side*20, cy+60, 0.3, 0)
    return im

def render_wolf_teeth(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3)
    # Jaw line
    d.arc((cx-100, cy-20, cx+100, cy+60), 0, 180, fill=GOLD+(int(reveal*200),), width=2)
    # Teeth
    for i in range(8):
        x = cx - 70 + i*20
        th = 15 + 10*S(t*0.1+i*0.5)
        d.polygon([(x-5, cy+5), (x, int(cy-5-th*reveal)+5), (x+5, cy+5)], 
                  outline=GOLD+(int(reveal*160),), width=1)
    return im

def render_bee_hive(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W//2, H//2
    reveal = min(1, t/3.5)
    hex_r = 18
    for row in range(-6, 7):
        for col in range(-6, 7):
            x = cx + col*hex_r*1.7 + row%2*hex_r*0.85
            y = cy + row*hex_r*1.5
            if math.hypot(x-cx, y-cy) > 200: continue
            pts = []
            for i in range(6):
                a = i*math.pi/3 + math.pi/6
                px = x + hex_r*math.cos(a)
                py = y + hex_r*math.sin(a)
                pts.append((int(px), int(py)))
            alpha = int(reveal * (100 + 80*S(t*0.1+row*0.3+col*0.5)))
            for i in range(6):
                d.line((pts[i], pts[(i+1)%6]), fill=GOLD+(alpha,), width=1)
    return im

# ── DISPATCH ────────────────────────────────────────────────────────

RENDERERS = {
    "stone_eye": render_stone_eye, "eagle_eye": render_eagle_eye,
    "eye_lens": render_eye_lens, "earth_water": render_earth_water,
    "ocean_wave": render_ocean_wave, "river_path": render_river_path,
    "blood_river": render_blood_river, "crystal_lattice": render_crystal_lattice,
    "fish_scale": render_fish_scale, "polygon_mandala": render_polygon_mandala,
    "seed_flower": render_seed_flower, "flower_petal": render_flower_petal,
    "leaf_vein": render_leaf_vein, "tree_root": render_tree_root,
    "star_map": render_star_map, "spider_web": render_spider_web,
    "node_web": render_node_web, "skin_map": render_skin_map,
    "flame_candle": render_flame_candle, "smith_forge": render_smith_forge,
    "gold_scale": render_gold_scale, "mountain_peak": render_mountain_peak,
    "temple_column": render_temple_column, "tower_window": render_tower_window,
    "bridge_arch": render_bridge_arch, "heart_drum": render_heart_drum,
    "breath_bell": render_breath_bell, "bone_frame": render_bone_frame,
    "hand_loom": render_hand_loom, "iron_anvil": render_iron_anvil,
    "copper_bell": render_copper_bell, "silver_mirror": render_silver_mirror,
    "bishop_codex": render_bishop_codex, "scribe_scroll": render_scribe_scroll,
    "weaver_loom": render_weaver_loom, "potter_wheel": render_potter_wheel,
    "carpenter_plane": render_carpenter_plane, "farmer_plow": render_farmer_plow,
    "hunter_bow": render_hunter_bow, "sailor_compass": render_sailor_compass,
    "chamber_door": render_chamber_door, "threshold_gate": render_threshold_gate,
    "ladder_rung": render_ladder_rung, "courtyard_well": render_courtyard_well,
    "spiral_stair": render_spiral_stair, "serpent_coil": render_serpent_coil,
    "ant_tunnel": render_ant_tunnel, "fox_track": render_fox_track,
    "foot_path": render_foot_path, "voice_string": render_voice_string,
    "valley_floor": render_valley_floor, "scatter_field": render_scatter_field,
    "market_stall": render_market_stall, "salt_crust": render_salt_crust,
    "bird_wing": render_bird_wing, "lion_paw": render_lion_paw,
    "bear_claw": render_bear_claw, "deer_antler": render_deer_antler,
    "wolf_teeth": render_wolf_teeth, "bee_hive": render_bee_hive,
    # Alias: mason_block maps to iron_anvil renderer
}

def render_mason_block(t, u, idx):
    return render_iron_anvil(t, u, idx)
RENDERERS["mason_block"] = render_mason_block

def render_for_motif(motif, t, u, idx):
    fn = RENDERERS.get(motif)
    if fn:
        return fn(t, u, idx)
    return render_stone_eye(t, u, idx)
