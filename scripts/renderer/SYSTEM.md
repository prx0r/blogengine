# Render System — Integration Guide

## Architecture

```
Essay (expansion-essay*.md)
    ↓
Visual Director (parse → scene_manifest.json)
    ↓
Scene functions (Python, one per scene)
    ↓
Shared renderer (renderer.py → Film class)
    ↓
Output pack (MP4 + manifest + stills + notes)
    ↓
Validation (validate_manifest.py → gold standard check)
```

## Output Pack Structure

Each essay produces a directory:

```
{key}_output_pack/
├── scene_manifest.json      # Scene index, titles, exact timing
├── {key}_animation.mp4       # H.264 video
├── contact_sheet.jpg         # 8-frame visual overview
├── {key}_stills/             # 8 keyframe stills (01.jpg-08.jpg)
│   ├── 01.jpg
│   └── ...
├── render_this_film.py      # 6-line wrapper: Film → manifest → render
├── SOURCE_NOTES.md           # Essay structure used
├── PROCESS_NOTES.md          # Rendering methodology
└── README.md                 # File manifest
```

## Shared Renderer

`renderer.py` — 713 lines, contains:

- `Film` class: `manifest()` + `render(out)`
- `Scene` dataclass: `(title, duration, fn, note)`
- Drawing primitives: `centered()`, `dot()`, `ring()`, `arrow()`, `label()`, `canvas()`
- Color palette: `INK`, `MUTED`, `GOLD`, `CRIMSON`, `DARK`, `WHITE`, `BLACK`
- Font system: `FONT["dev_xl"]` through `FONT["xs"]`
- Transcoding: H.264 via FFmpeg

## Scene Functions

Each scene is a Python function `(t, u, idx) → Image.Image`:
- `t` = seconds elapsed inside this scene
- `u` = normalized progress 0→1 across the scene
- `idx` = 1-based scene index

Animation uses: `smoothstep()`, `lerp()`, `math.sin()` for motion.

## Animation References

Silent procedural animations showing visual language possibilities.
See `video-templates/animation-references/INDEX.md` for full list.

These are NOT gold standards. They are renderer capability demonstrations.

## Gold Standards (Pacing Templates)

Real documentary pacing analyses in `video-templates/gold-standards/`:

| Template | Shots | Duration | Avg Shot | BPM |
|----------|-------|----------|----------|-----|
| Alan Watts | 105 | 745s | 7.1s | 112 |
| Anandamayi Ma | 139 | 1216s | 8.75s | 152 |
| Abhinavagupta v1 | — | 364s | — | — |

The gold standard pacing (7.1s avg shot) determines scene internal pacing.
Animation reference scene durations (28-36s) are NOT gold standards — they're renderer defaults for single-shot scenes.

## Validation

`validate_manifest.py scene_manifest.json` checks:
- Scene count within [8, 19]
- Each scene duration within [28, 45]s
- Total duration ≤ 660s
- No gaps/overlaps between scenes
- Manifest totals match computed totals

## Workflow for New Essay

1. Read expansion-essay, identify 8-12 rhetorical beats
2. Write scene_manifest.json with titles and durations
3. Write scene functions in `{key}_scenes.py`
4. Write `render_this_film.py` (import Film + scenes → render)
5. Run: `python render_this_film.py`
6. Validate: `python validate_manifest.py scene_manifest.json`
7. Generate stills + contact sheet
8. Write SOURCE_NOTES + PROCESS_NOTES

## Files

| Path | Purpose |
|------|---------|
| `renderer/renderer.py` | Shared renderer (Film class, primitives) |
| `renderer/validate_manifest.py` | Manifest validation |
| `renderer/spanda_scenes.py` | Spanda scene functions |
| `renderer/render_spanda.py` | Spanda render wrapper |
| `renderer/spanda_output_pack/` | Spanda output (manifest + MP4) |
| `renderer/SYSTEM.md` | This file |
