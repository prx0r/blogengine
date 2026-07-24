# Stage 3: Render PIL Scenes

**Scripts:**
- `03-renderer.py` — core render engine (713 lines)
- `03-render-scenes.py` — runs scene lists through renderer
- `03-validate-manifest.py` — validates scene manifests

## Purpose

Generate visual footage for each beat. The PIL renderer produces 1280×720 image sequences at 2fps using 8 drawing primitives and 9 colors.

## Scene Format

Each scene is a function `fn(t: float, u: float, idx: int) -> Image`:

```python
from renderer import Scene, render, canvas, dot, ring, centered, GOLD, DARK, INK, W, H

def emergence(t, u, idx):
    c = canvas(DARK)
    # Dot grows from center
    r = 5 + u * 40
    dot(c, W//2, H//2, r, GOLD, min(1, u*2))
    # Rings pulse outward
    for i in range(3):
        rr = r + i * 60 + u * 30
        ring(c, W//2, H//2, rr, GOLD, max(0, 0.6 - u*0.3))
    return c

scenes = [
    Scene("emergence", 11.5, emergence),
    # ... more scenes
]
render(scenes, output_dir="renders/essay1/")
```

## Parameters

| Variable | Meaning | Range |
|----------|---------|-------|
| `t` | Seconds elapsed | `0` → `scene.duration` |
| `u` | Normalized progress | `0.0` → `1.0` |
| `idx` | Scene index | `0` → `n-1` |

## Primitives

| Function | What It Draws |
|----------|---------------|
| `dot(d, x, y, r, color, alpha)` | Filled circle |
| `ring(d, x, y, r, color, alpha, width)` | Outlined circle |
| `arrow(d, p1, p2, color, alpha, width)` | Line with arrowhead |
| `silhouette(d, cx, cy, s, color, alpha)` | Abstract body outline |
| `flower(d, cx, cy, r, petals, color, alpha, rotation)` | Symmetric petal form |
| `wavy_line(d, x0, x1, y, amp, phase, color, alpha, cycles)` | Sine wave |
| `regular_polygon(d, cx, cy, r, n, color, alpha, rot)` | N-sided polygon |
| `centered(d, text, y, font, color, alpha)` | Wrapped centered text |
| `left(d, text, x, y, font, color, alpha)` | Left-aligned text |

## Colors

| Name | Hex | Use |
|------|-----|-----|
| `DARK` | `#0C0C0F` | Background |
| `INK` | `#EBE7DC` | Primary text |
| `GOLD` | `#D0AC5B` | Accent, sacred elements |
| `CRIMSON` | `#8D2C39` | Power, intensity |
| `MUTED` | `#918D84` | Secondary text |
| `BLUE` | `#455E7C` | Calm, intellectual |
| `GREEN` | `#4E7060` | Growth, nature |
| `WHITE` | `#F8F6F0` | Bright text |
| `PARCHMENT` | `#F1EBD3` | Background variant |

## Using Existing Scene Packs

**Don't write scenes from scratch.** Use existing packs:

```python
# Import from scene packs
from p01_reflection import mirror_scene, self_knowing_scene
from p02_sound import mantra_pulse, vibration_field
from spanda_scenes import spanda_emergence, spanda_resolution

scenes = [
    Scene("hook", 11.5, spanda_emergence),
    Scene("establish", 16.0, mirror_scene),
    # ...
]
```

### Available Packs (`scripts/renderer/`)

| Import | Functions | Topics |
|--------|-----------|--------|
| `p01_reflection` | 8 | Mirror, self-knowing, recognition |
| `p02_sound` | 8 | Mantra, vibration, spanda pulse |
| `p03_upayas` | 8 | Four means, paths |
| `p04_kalis` | 8 | Twelve Kālis, time cycles |
| `p05_spanda2` | 8 | Expansion, contraction |
| `p06_abhinavagupta` | 8 | Life scenes, lineage |
| `p07_mantra_breath` | 8 | Breath visualization |
| `p19_25_tantra` | 11 | 25 tattvas emanation |
| `vbt_magnum` | 20 | VBT verse scenes |
| `spanda_scenes` | 10 | Proven Spanda video scenes |

### Visual Library (`visual-library/`)

20 packs with 172 additional scene functions. Browse them:

```bash
ls ../visual-library/*.py
```

Or search by concept in the dashboard Scene Library tab.

## Tips

- Keep scenes 4-12 seconds (shorter for quick cuts, longer for substantive content)
- Use `smoothstep(a, b, x)` for smooth reveals and transitions
- Use `lerp(a, b, u)` for linear interpolation
- Always export at 1280×720, 2fps — FableCut handles final timing
- PNG sequences can be assembled with FFmpeg: `ffmpeg -framerate 2 -i frame_%05d.png -c:v libx264 output.mp4`
