# Video Production Guide — Confirmed Direction

## Architecture

```
Essay (expansion-essay*.md)
    ↓
Visual Director (parse → scene manifest)
    ↓
PIL draft (2fps, fast iteration)
    ↓
Skia final (12fps, sharp, audio)
    ↓
Post touch-up (FableCut / grading)
    ↓
YouTube
```

## Pipeline

### 1. Scene Manifest

Each essay produces a `scene_manifest.json`:
- 8-12 scenes
- 28-36s per scene
- Exact start/end times from actual MP3 durations
- Scene title, note, renderer function reference

### 2. PIL Draft (Creative Phase)

Write scene functions in Python using the shared renderer:
- `scripts/renderer/renderer.py` — Film class, Scene dataclass, drawing primitives
- Scene function signature: `def scene(t, u, idx) → Image.Image`
  - `t` = seconds elapsed in scene
  - `u` = normalized progress 0→1
  - `idx` = 1-based scene index
- Animation via: `smoothstep()`, `lerp()`, `math.sin()`
- Palette: dark backgrounds (gold/crimson/ink) or white
- 2fps, 1280×720, silent (just the visual draft)
- Render time: seconds

### 3. Skia Final (Production Phase)

Port scene functions to `render-full.mjs`:
- 12fps (6× smoother than PIL draft)
- GPU-backed rendering via Skia Canvas
- Full Devanāgarī shaping via HarfBuzz
- Audio muxed from Edge TTS or CF Whisper transcript
- Render time: ~3 min for 6-min video at 23 fps render speed

### 4. Post Touch-up

- FableCut for final assembly (art inserts, quote cards, transitions)
- Optional color grading on H.264 base

## Visual Library

All scenes from reference packs cataloged at `visual-library/`:

| Path | Purpose |
|------|---------|
| `visual-library/catalog/scenes.json` | 80 scenes across 10 packs, searchable |
| `visual-library/instances/*.json` | Canonical scene.json per scene |
| `visual-library/templates/` | Reusable template families |
| `visual-library/primitives/` | Drawing primitives (ring, arrow, silhouette, etc.) |

### Scene Selection (for future Hermes integration)

```
scene_library → search(concepts, duration, preceding_visuals)
    → score by: 45% semantic match, 20% narrative function, 15% duration, 10% contrast, 10% novelty
    → select best → retime + relabel → rerender at 24fps
```

### Template Families

| Template | Used for |
|----------|----------|
| `concentric_center` | Bindu, stillness, breathing center |
| `radial_relation` | Names radiating, emanations, flowers |
| `bilateral_relation` | Mirror, recognition, subject-object |
| `vertical_sequence` | Tattva chain, ascent/descent, hierarchy |
| `body_axis` | Silhouette, bounded self, human figure |
| `wave_field` | Ocean, pulse, field, undulation |
| `mirror_reflection` | Symmetry, doubling, self-knowledge |
| `aperture` | Opening/closing, unmesa/nimesa, breath |
| `knot_release` | Contraction, binding, liberation |
| `quote_card` | Source text, citations, emphasis |

## Key Files

| File | Purpose |
|------|---------|
| `scripts/expansion-essay1.md` through `expansion-essay51.md` | 51 expanded essays (~1400 words each) |
| `scripts/renderer/renderer.py` | Shared PIL renderer (Film class, primitives) |
| `scripts/renderer/spanda_scenes.py` | Spanda PIL scene functions |
| `visionary-renderer/scripts/render-full.mjs` | Spanda Skia renderer (12fps, audio) |
| `scripts/renderer/spanda_output_pack/scene_manifest.json` | Spanda scene manifest |
| `visual-library/catalog/scenes.json` | 80 reusable scene instances |
| `visual-library/catalog/ingest_packs.py` | Catalog builder |
| `video-templates/gold-standards/alan-watts-gold.json` | Pacing template (7.1s avg shot) |
| `video-templates/animation-references/INDEX.md` | 12 reference packs |
| `content/publishing/storyboards/` | Storyboard JSONs |
| `content/publishing/voiceover/engine-of-consciousness/timing.json` | Actual MP3 durations |
| `content/ontology-engine/` | Ontology engine (12 tradition packs) |
| `content/glossary/art/` | 1,146 art metadata entries |

## Asset Pipeline

### Art
- 1,146 gallery entries at `content/glossary/art/` (JSON metadata)
- ~60K images at `/mnt/HC_Volume_106427611/sacred-art/` (not yet concept-tagged)
- Art matching via `scripts/match-images-to-storyboard.py`

### Voiceover
- Edge TTS via `scripts/generate-voiceover.mjs`
- Word-level timestamps via CF Whisper (`scripts/build-timed-video.py`)

### Validation
- `scripts/validate-video.mjs` — 24-check Bronze/Silver/Gold validation
- `scripts/renderer/validate_manifest.py` — scene manifest vs gold standard pacing

## Workflow for a New Essay

1. Read `scripts/expansion-essay{}.md`, identify 8-12 rhetorical beats
2. Write scene manifest with exact durations matching actual MP3s
3. Write PIL scene functions in `scripts/renderer/{key}_scenes.py`
4. Render PIL draft: `python render_this_film.py` (seconds)
5. Iterate on visuals in PIL (fast loop)
6. Port to Skia: add scene function to `render-full.mjs` style
7. Render Skia final: `node render-full.mjs` (minutes)
8. Mux audio from `generate-voiceover.mjs` output
9. Validate against gold standard pacing
10. Post-touch in FableCut
