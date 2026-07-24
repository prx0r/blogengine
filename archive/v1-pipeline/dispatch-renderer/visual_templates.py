"""12 visually distinct scene templates for Zeus-compliant rendering.
Each template produces a genuinely different visual using different
PIL primitives. Templates index is the primary source of visual variety
across shots — NOT a single parameterized function."""

import math
from PIL import Image, ImageDraw

W, H = 1280, 720
VOID = (13, 17, 23); GOLD = (212, 165, 116); CRIMSON = (141, 44, 57)
LAPIS = (42, 70, 110); INK = (230, 225, 220); MUTED = (145, 141, 132)
WHITE = (248, 246, 240); CHARCOAL = (40, 40, 40)
PARCHMENT = (235, 227, 203); VERDIGRIS = (72, 130, 109)

S = lambda x: 0.5 + 0.5 * math.sin(x)  # pulse shorthand

def canvas(bg=VOID):
    return Image.new("RGB", (W, H), bg)

# ── 1. CENTER RADIANCE ──────────────────────────────────────────────
# Primitives: ellipse (filled + outline)
# Feel: pulsing center, concentric stillness
def tmpl_center_radiance(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    breath = 1 + 0.03 * math.sin(t * 0.4 + idx * 0.7)
    for i in range(4):
        r = (25 + i * 45) * breath + 4 * math.sin(t * 0.3 + i * 1.2 + idx)
        alpha = max(0, 0.7 - i * 0.15)
        width = max(1, 3 - i)
        a = (cx - r, cy - r, cx + r, cy + r)
        d.ellipse(a, outline=GOLD + (int(alpha * 255),), width=width)
    r0 = 8 * breath
    d.ellipse((cx - r0, cy - r0, cx + r0, cy + r0), fill=GOLD)
    return im

# ── 2. SPOKE WHEEL ─────────────────────────────────────────────────
# Primitives: line, ellipse
# Feel: radiating energy, dynamic outward
def tmpl_spoke_wheel(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n = 8 + idx % 5
    r = 150 + 20 * math.sin(t * 0.3 + idx)
    reveal = min(1, t / 3.0)
    for i in range(n):
        a = i * 2 * math.pi / n + t * 0.15 + idx * 0.1
        x = cx + r * math.cos(a)
        y = cy + r * math.sin(a)
        alpha = int(reveal * 255)
        d.line((cx, cy, x, y), fill=GOLD + (alpha,), width=1 + idx % 2)
    d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=GOLD)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=GOLD + (180,), width=1)
    return im

# ── 3. LATTICE WEAVE ───────────────────────────────────────────────
# Primitives: line
# Feel: structure, order, interconnections
def tmpl_lattice_weave(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    spacing = 40 + idx * 3
    offset = t * 20
    alpha = int(min(1, t / 2.0) * 200)
    for x in range(int(cx - 300), int(cx + 300), spacing):
        d.line((x + offset % spacing, cy - 250, x + offset % spacing, cy + 250),
               fill=GOLD + (alpha,), width=1)
    for y in range(int(cy - 250), int(cy + 250), spacing):
        d.line((cx - 300, y + offset % spacing, cx + 300, y + offset % spacing),
               fill=GOLD + (alpha,), width=1)
    if t > 2:
        pulse = 0.5 + 0.5 * math.sin(t * 0.5 + idx)
        d.ellipse((cx - 8 * pulse, cy - 8 * pulse, cx + 8 * pulse, cy + 8 * pulse),
                  fill=CRIMSON)
    return im

# ── 4. WAVE FIELD ──────────────────────────────────────────────────
# Primitives: line (polyline via sampled points)
# Feel: flowing, aquatic, continuous
def tmpl_wave_field(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n_waves = 3 + idx % 3
    for w in range(n_waves):
        pts = []
        amp = 30 + w * 15 + 5 * math.sin(t * 0.2 + idx + w)
        phase = w * 1.5 + idx * 0.3
        y0 = cy - 80 + w * 60
        for x in range(-300, 301, 8):
            y = y0 + amp * math.sin(x * 0.015 + t * 0.5 + phase)
            pts.append((cx + x, y))
        a = max(50, 200 - w * 40)
        for i in range(1, len(pts)):
            d.line((pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]),
                   fill=GOLD + (a,), width=2 - w // 2)
    return im

# ── 5. BLOOM PETAL ────────────────────────────────────────────────
# Primitives: polygon, ellipse
# Feel: unfolding, organic growth
def tmpl_bloom_petal(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n = 5 + idx % 4
    r = 120 + 30 * math.sin(t * 0.2 + idx)
    reveal = min(1, t / 4.0)
    for i in range(n):
        a = i * 2 * math.pi / n + t * 0.05 + idx * 0.2
        px = cx + r * math.cos(a)
        py = cy + r * math.sin(a)
        # Petal: two bezier-like curves using short lines
        mid_a = a + 0.3
        mid_r = r * 0.6 * reveal
        mx = cx + mid_r * math.cos(mid_a + i * 0.1)
        my = cy + mid_r * math.sin(mid_a + i * 0.1)
        alpha = int(reveal * 180)
        # Triangle petal
        d.polygon([(cx, cy), (px, py), (mx, my)], fill=None,
                  outline=GOLD + (alpha,), width=1)
        # Inner point
        ir = 16 + 8 * math.sin(t * 0.6 + i)
        d.ellipse((px - ir, py - ir, px + ir, py + ir),
                  outline=GOLD + (alpha - 40,), width=1)
    d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=GOLD)
    return im

# ── 6. ARCHITECTURE ────────────────────────────────────────────────
# Primitives: line, rectangle (via polygon)
# Feel: structural, vertical, stable
def tmpl_architecture(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n = 4 + idx % 3
    base_w = 200
    reveal = min(1, t / 3.0)
    for i in range(n):
        col_x = cx - base_w // 2 + i * (base_w // (n - 1) if n > 1 else 0)
        col_h = (100 + i * 30) * reveal + 30 * math.sin(t * 0.3 + i + idx)
        top = cy + 120 - col_h
        alpha = int(reveal * 200)
        w = 8 + idx % 3
        d.line((col_x, cy + 120, col_x, top), fill=GOLD + (alpha,), width=w)
        d.line((col_x, top, col_x + w, top), fill=GOLD + (alpha,), width=1)
    # Arch connecting outer columns
    if n >= 2:
        a_alpha = int(reveal * 150)
        x1 = cx - base_w // 2
        x2 = cx + base_w // 2
        arch_y = cy + 120 - (100 + (n - 1) * 30) * reveal
        for step in range(20):
            u_ = step / 19
            ax = x1 + (x2 - x1) * u_
            ay = arch_y - 60 * math.sin(u_ * math.pi)
            d.ellipse((ax - 2, ay - 2, ax + 2, ay + 2), fill=GOLD + (a_alpha,))
    return im

# ── 7. NODE WEB ───────────────────────────────────────────────────
# Primitives: ellipse, line
# Feel: network, relation, interconnection
def tmpl_node_web(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n = 6 + idx % 4
    nodes = []
    spread = 180 + idx * 5
    for i in range(n):
        a = i * 2 * math.pi / n + t * 0.03 + idx * 0.15
        nx = cx + spread * math.cos(a) + 20 * math.sin(t * 0.2 + i)
        ny = cy + spread * math.sin(a) + 20 * math.cos(t * 0.25 + i * 0.7)
        nodes.append((nx, ny))
    reveal = min(1, t / 2.5)
    # Connections
    for i in range(n):
        for j in range(i + 1, n):
            if (i + j) % 3 == idx % 3:
                continue  # sparse connectivity varies by idx
            dx = nodes[j][0] - nodes[i][0]
            dy = nodes[j][1] - nodes[i][1]
            dist = math.hypot(dx, dy)
            if dist < 350:
                alpha = int(reveal * (1 - dist / 400) * 200)
                d.line((nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]),
                       fill=GOLD + (alpha,), width=1)
    # Nodes
    for i, (nx, ny) in enumerate(nodes):
        nr = 6 + 3 * math.sin(t * 0.5 + i + idx)
        d.ellipse((nx - nr, ny - nr, nx + nr, ny + nr), fill=CRIMSON if i == idx % n else GOLD)
    return im

# ── 8. CONTRACT EXPAND ────────────────────────────────────────────
# Primitives: rectangle (via polygon/line)
# Feel: boundary, threshold, breath containment
def tmpl_contract_expand(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    phase = t * 0.3 + idx * 0.5
    half_w = 80 + 100 * S(phase * 0.5)
    half_h = 50 + 70 * S(phase * 0.5)
    pulse = 0.5 + 0.5 * math.sin(t * 0.6 + idx)
    x1 = cx - half_w
    y1 = cy - half_h
    x2 = cx + half_w
    y2 = cy + half_h
    d.line((x1, y1, x2, y1, x2, y2, x1, y2, x1, y1),
           fill=GOLD + (180,), width=2)
    # Inner breath
    ir = 4 + 8 * pulse
    d.ellipse((cx - ir, cy - ir, cx + ir, cy + ir), fill=GOLD)
    if t > 3:
        # Cross hairs
        d.line((cx - half_w - 20, cy, x1 - 5, cy), fill=GOLD + (100,), width=1)
        d.line((x2 + 5, cy, cx + half_w + 20, cy), fill=GOLD + (100,), width=1)
        d.line((cx, y1 - 5, cx, y1 - 20), fill=GOLD + (100,), width=1)
        d.line((cx, y2 + 5, cx, y2 + 20), fill=GOLD + (100,), width=1)
    return im

# ── 9. SPIRAL PATH ────────────────────────────────────────────────
# Primitives: line (spiral polyline)
# Feel: journey, evolution, progressive unfolding
def tmpl_spiral_path(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    max_r = 250
    turns = 3 + idx % 3
    n_pts = int(150 + idx * 10)
    progress = min(1, t / max(1, 6.0))
    pts = []
    for i in range(n_pts):
        uu = i / n_pts * progress
        r = uu * max_r
        a = uu * turns * 2 * math.pi + idx * 0.3 + t * 0.05
        x = cx + r * math.cos(a)
        y = cy + r * math.sin(a)
        pts.append((x, y))
    for i in range(1, len(pts)):
        alpha = int((i / n_pts) * 255)
        d.line((pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]),
               fill=GOLD + (alpha,), width=1)
    if pts:
        d.ellipse((pts[-1][0] - 4, pts[-1][1] - 4, pts[-1][0] + 4, pts[-1][1] + 4),
                  fill=CRIMSON)
    return im

# ── 10. SCATTER FIELD ─────────────────────────────────────────────
# Primitives: ellipse, line
# Feel: dispersal, array, multiplicity
def tmpl_scatter_field(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n = 15 + idx * 2
    reveal = min(1, t / 3.0)
    for i in range(n):
        a = i * 2.4 + idx * 0.7
        r = 80 + i * 18 + 15 * math.sin(t * 0.3 + i * 0.5 + idx)
        x = cx + r * math.cos(a + t * 0.05)
        y = cy + r * math.sin(a + t * 0.05)
        size = 3 + 2 * math.sin(t * 0.4 + i + idx)
        alpha = int(reveal * (120 + 80 * S(t * 0.3 + i * 0.7)))
        d.ellipse((x - size, y - size, x + size, y + size),
                  fill=GOLD + (alpha,))
        # Connection to center
        if i % 3 == idx % 3:
            ca = int(reveal * 60 * S(t * 0.2 + i * 0.5))
            d.line((cx, cy, x, y), fill=GOLD + (ca,), width=1)
    d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=CRIMSON)
    return im

# ── 11. SILHOUETTE FORM ──────────────────────────────────────────
# Primitives: ellipse, line, polygon
# Feel: presence, being, witness
def tmpl_silhouette_form(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    reveal = min(1, t / 3.0)
    # Head
    head_r = 30
    head_y = cy - 60
    d.ellipse((cx - head_r, head_y - head_r, cx + head_r, head_y + head_r),
              fill=None, outline=GOLD + (int(reveal * 200),), width=2)
    # Body
    body_y1 = head_y + head_r
    body_y2 = cy + 80
    d.line((cx, body_y1, cx, body_y2), fill=GOLD + (int(reveal * 200),), width=2)
    # Arms
    arm_angle = 0.3 + 0.2 * math.sin(t * 0.3 + idx)
    arm_len = 70
    for side in (-1, 1):
        ax = cx + side * arm_len * math.cos(arm_angle)
        ay = body_y1 + 20 + arm_len * math.sin(arm_angle)
        d.line((cx, body_y1 + 20, ax, ay), fill=GOLD + (int(reveal * 180),), width=2)
    # Surrounding field ring
    fr = 140 + 20 * math.sin(t * 0.2 + idx)
    d.ellipse((cx - fr, cy - fr, cx + fr, cy + fr),
              outline=GOLD + (int(reveal * 60),), width=1)
    # Eye (inner dot)
    if reveal > 0.5:
        eye_r = 3 + 2 * S(t * 0.5 + idx)
        d.ellipse((cx - eye_r, head_y - eye_r, cx + eye_r, head_y + eye_r),
                  fill=GOLD)
    return im

# ── 12. POLYGON MANDALA ──────────────────────────────────────────
# Primitives: polygon (via line), ellipse
# Feel: geometric, sacred ordering
def tmpl_polygon_mandala(t, u, idx):
    im = canvas()
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    n_sides = 4 + idx % 5
    n_layers = 3 + idx % 3
    reveal = min(1, t / 4.0)
    for layer in range(n_layers):
        r = (40 + layer * 55) + 15 * math.sin(t * 0.2 + layer + idx)
        alpha = int(reveal * (200 - layer * 30))
        pts = []
        for i in range(n_sides):
            a = i * 2 * math.pi / n_sides + t * 0.02 * (layer + 1) + layer * 0.2
            x = cx + r * math.cos(a)
            y = cy + r * math.sin(a)
            pts.append((x, y))
        for i in range(n_sides):
            j = (i + 1) % n_sides
            d.line((pts[i][0], pts[i][1], pts[j][0], pts[j][1]),
                   fill=GOLD + (alpha,), width=2)
        # Star lines (connect every other vertex)
        if n_sides >= 5:
            for i in range(n_sides):
                k = (i + 2) % n_sides
                d.line((pts[i][0], pts[i][1], pts[k][0], pts[k][1]),
                       fill=GOLD + (alpha // 3,), width=1)
    d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=GOLD)
    return im

# ── DISPATCH ────────────────────────────────────────────────────────
TEMPLATES = {
    "center_radiance": tmpl_center_radiance,
    "spoke_wheel": tmpl_spoke_wheel,
    "lattice_weave": tmpl_lattice_weave,
    "wave_field": tmpl_wave_field,
    "bloom_petal": tmpl_bloom_petal,
    "architecture": tmpl_architecture,
    "node_web": tmpl_node_web,
    "contract_expand": tmpl_contract_expand,
    "spiral_path": tmpl_spiral_path,
    "scatter_field": tmpl_scatter_field,
    "silhouette_form": tmpl_silhouette_form,
    "polygon_mandala": tmpl_polygon_mandala,
}

MOTIF_TEMPLATE = {
    # Natural elements
    "stone_eye": "center_radiance", "earth_water": "wave_field",
    "crystal_lattice": "lattice_weave", "seed_flower": "bloom_petal",
    "star_map": "node_web", "flame_candle": "center_radiance",
    "river_path": "spiral_path", "ocean_wave": "wave_field",
    "mountain_peak": "architecture", "valley_floor": "scatter_field",
    # Living things
    "tree_root": "spiral_path", "leaf_vein": "node_web",
    "flower_petal": "bloom_petal", "bird_wing": "wave_field",
    "fish_scale": "polygon_mandala", "serpent_coil": "spiral_path",
    "spider_web": "lattice_weave", "bee_hive": "polygon_mandala",
    "ant_tunnel": "spiral_path", "eagle_eye": "center_radiance",
    # Animals
    "lion_paw": "silhouette_form", "wolf_teeth": "architecture",
    "bear_claw": "silhouette_form", "fox_track": "scatter_field",
    "deer_antler": "spoke_wheel",
    # Craft
    "bishop_codex": "contract_expand", "scribe_scroll": "spoke_wheel",
    "smith_forge": "center_radiance", "weaver_loom": "lattice_weave",
    "potter_wheel": "spoke_wheel", "mason_block": "architecture",
    "carpenter_plane": "polygon_mandala", "farmer_plow": "spiral_path",
    "hunter_bow": "architecture", "sailor_compass": "spoke_wheel",
    # Architecture
    "chamber_door": "contract_expand", "tower_window": "architecture",
    "bridge_arch": "architecture", "garden_wall": "lattice_weave",
    "ladder_rung": "spoke_wheel", "threshold_gate": "contract_expand",
    "spiral_stair": "spiral_path", "courtyard_well": "center_radiance",
    "market_stall": "scatter_field", "temple_column": "architecture",
    # Body
    "heart_drum": "center_radiance", "breath_bell": "contract_expand",
    "blood_river": "wave_field", "bone_frame": "lattice_weave",
    "skin_map": "node_web", "eye_lens": "center_radiance",
    "hand_loom": "lattice_weave", "foot_path": "spiral_path",
    "voice_string": "wave_field", "mind_mirror": "polygon_mandala",
    # Metals
    "iron_anvil": "architecture", "copper_bell": "contract_expand",
    "silver_mirror": "polygon_mandala", "gold_scale": "spoke_wheel",
    "salt_crust": "scatter_field",
}

def render_shot(motif, t, u, idx):
    key = MOTIF_TEMPLATE.get(motif, "center_radiance")
    fn = TEMPLATES.get(key, tmpl_center_radiance)
    return fn(t, u, idx)
