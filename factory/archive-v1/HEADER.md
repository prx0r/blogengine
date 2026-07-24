# Video Factory

**Self-contained module for producing documentary videos from expansion essays.**
A new LLM can read this file and produce a finished video with zero prior context.

---

## Quick Start (5 min)

```bash
cd /root/projects/blog/factory

# Pick an essay (1-51)
export ESSAY=expansion-essay1

# Stage 1: Convert essay to storyboard
python3 01-essay-to-storyboard.py ../scripts/$ESSAY.md

# Stage 6: Validate the output
node 06-validate.mjs --json
```

Then open the **◆ Final** tab at `https://studio.tantrafiles.xyz` to review.

---

## Pipeline Overview

```
ESSAY (scripts/expansion-essay*.md)
  │
  ▼ Stage 1
STORYBOARD (content/publishing/storyboards/*.json)
  │  rhetorical beats → segments with narration
  │
  ▼ Stage 2
BEAT PLAN (content/publishing/scripts/*/beat-map.md)
  │  segments → timed sub-beats with visual treatment
  │
  ▼ Stage 3
PIL SCENES (scripts/renderer/*.py)
  │  each beat → PIL image sequence at 1280x720, 2fps
  │
  ▼ Stage 4
VOICEOVER (content/publishing/voiceover/*/)
  │  narration → MP3 segments via Edge TTS
  │
  ▼ Stage 5
FABLECUT PROJECT (content/publishing/scripts/*/fablecut.json)
  │  scenes + audio + art → timeline → export MP4
  │
  ▼ Stage 6
VALIDATION (validate-video.mjs — 24 checks)
  │  passes ≥85% → ready for review
  │
  ▼ Review
FINAL TAB (dashboard. ◆ Final)
  per-shot + episode feedback → regenerate → final
```

---

## File Index

### Core Scripts (in `factory/`)

| # | File | What It Does | Input → Output |
|---|------|-------------|----------------|
| 1 | `01-essay-to-storyboard.py` | Parses essay markdown → rhetorical beats → EDL JSON | `essay.md` → `storyboards/{name}.json` |
| 2 | `02-storyboard-to-beats.py` | Expands storyboard segments into sub-beats with timing | `storyboard.json` + template → `{name}_beats.json` |
| 3 | `03-renderer.py` | PIL render engine — 8 primitives, 9 colors, 11 fonts | SceneSpec → PNG sequence |
| 3 | `03-render-scenes.py` | Runs a list of scenes through the renderer | Scene list → MP4 |
| 4 | `04-generate-voiceover.mjs` | Edge TTS — female (AriaNeural) + male (RyanNeural) | Script → MP3 segments |
| 5 | `05-blueprint-to-fablecut.py` | Blueprint → beat-map + FableCut project.json | TBP-NNN.md → FableCut project |
| 5 | `05-build-from-blueprint.py` | Full pipeline: download assets → voiceover → FableCut | Blueprint → assembled project |
| 5 | `05-match-art.py` | Matches art to storyboard beats via proper noun extraction | Storyboard + art library → FableCut project |
| 6 | `06-gold-standard.py` | Capture/apply pacing templates from exemplars | `--capture`, `--apply`, `--publish` |
| 6 | `06-validate.mjs` | 24 quality checks (Bronze 60% / Silver 75% / Gold 85%) | FableCut project → score report |

### Templates (`factory/templates/`)

| File | Purpose |
|------|---------|
| `biography.json` | 12 segments × 3 sub-beats = 36 beats, ~12min target |
| `alan-watts-gold.json` | 105 shots, 7.1s avg, 112 BPM pacing profile |
| `modules/` | 11 reusable FableCut modules (quote-card, full-bleed-art, portrait-focus, etc.) |

### Supporting Files

| File | Location | Purpose |
|------|----------|---------|
| **Visual Language** | `operations/visuallanguage.md` | Full Visionary Engine spec (752 lines) |
| **Video Creation Spec** | `operations/video-creation-spec.md` | Bronze/Silver/Gold validation levels |
| **Visual Director** | `scripts/visual-director.py` | Rhetorical → visual treatment mapping |
| **Scene Catalog** | `scene-system/catalog/scenes.json` | 198 indexed scenes across 24 packs |
| **Visual Library** | `visual-library/` | 20 packs, 172 scene functions |
| **Renderer Packs** | `scripts/renderer/p*.py` | 9 packs, 67 PIL scene functions |
| **Dashboard Server** | `dashboard/server.py` | Flask backend, Final tab API |

### Essays (raw material)

| Set | Location | Count |
|-----|----------|-------|
| Expansion essays | `scripts/expansion-essay1.md` → `expansion-essay51.md` | 51 |
| Extended essays | `content/sources/*/notes/expansion-essay52-56.md` | 5 |
| Beat-maps ready | `content/publishing/scripts/01-k4/` → `10-hellenistic-tantra/` | 10 |

### Output Directories

| Path | Contents |
|------|----------|
| `content/publishing/storyboards/` | Storyboard JSONs + EDLs |
| `content/publishing/scripts/{slug}/beat-map.md` | Timed beat plans |
| `content/publishing/voiceover/{slug}/` | MP3 voiceover segments |
| `content/publishing/videos/{slug}/` | Published video packages |
| `content/publishing/renders/` | Rendered MP4 clips |
| `data/final/` | Final production index + feedback |
| `data/final/feedback-logs/` | Human-readable .md feedback history |

---

## Stage-by-Stage Instructions

### Stage 1: Essay → Storyboard

```bash
python3 01-essay-to-storyboard.py ../scripts/expansion-essay1.md
```

This runs `visual-director.py` which:
1. Parses the essay into rhetorical beats (hook, establish, define, analogy, quotation, chain, climax, closing)
2. Maps each beat to a visual treatment (abstract_diagram, manuscript_quote, diagram_unfold, etc.)
3. Assigns camera direction, art requirements, text style, duration, and transition
4. Outputs JSON + Markdown EDLs to `content/publishing/storyboards/`

**What to check:** The storyboard JSON has `scenes[]` with `rhetorical_function`, `duration_seconds`, `visual_treatment`, `camera`, `narration_excerpt`.

### Stage 2: Storyboard → Beat Plan

```bash
python3 02-storyboard-to-beats.py --storyboard <name> --template biography
```

This runs `apply-template.py` which:
1. Loads a video template (e.g. `biography.json`: 12 segments × 3 sub-beats)
2. Splits each segment's narration across sub-beats proportionally by word count
3. Assigns `image_type`, `duration_sec`, `search_terms`, `sfx` per sub-beat
4. Saves beat plan as `{name}_beats.json`

**What to check:** Beat plan has `beats[]` with `narration`, `duration`, `image_type`, `search_terms`.

### Stage 3: Render PIL Scenes

The renderer needs a scene manifest. For each beat you want to render visually:

```python
# In a scene script:
from renderer import Scene, render

scenes = [
    Scene("hook_emergence", 11.5, hook_scene_fn),
    Scene("establish_pulse", 16.0, establish_scene_fn),
    # ...
]
render(scenes, output_dir="renders/essay1/")
```

Each scene function receives `(t: float, u: float, idx: int) -> Image` where:
- `t` = seconds elapsed
- `u` = progress 0→1
- `idx` = scene index

**Available primitives:** `dot()`, `ring()`, `arrow()`, `silhouette()`, `flower()`, `wavy_line()`, `regular_polygon()`, text (`centered()`, `left()`)

**9 Colors:** `DARK`, `INK`, `GOLD`, `CRIMSON`, `MUTED`, `WHITE`, `PARCHMENT`, `BLUE`, `GREEN`

If you want to use existing scene functions, reference packs in `scripts/renderer/`:
- `p01_reflection.py` — 8 mirror/self-knowing scenes
- `p02_sound.py` — 8 mantra/vibration scenes
- `spanda_scenes.py` — 10 Spanda scenes (proven in final video)
- `vbt_magnum.py` — 20 VBT verse scenes

Or the `visual-library/` packs for 172 additional scene functions.

### Stage 4: Generate Voiceover

```bash
node 04-generate-voiceover.mjs --storyboard <name> --voice female
```

This runs edge-tts:
- Default: `en-US-AriaNeural` (female, main narrator)
- Quotes: `en-US-RyanNeural` (male, quote voice)
- Output: `content/publishing/voiceover/{slug}/seg-*.mp3`

### Stage 5: FableCut Assembly

Two paths:

**A) Blueprint-driven (if you have a TBP-NNN blueprint):**
```bash
python3 05-build-from-blueprint.py TBP-NNN
```
This: downloads art via Tor → generates voiceover → builds FableCut project → loads into editor

**B) Storyboard-driven (from essay):**
```bash
python3 05-match-art.py --storyboard <name> --beat-plan <name> --project
```
This: matches art to beats by proper noun → builds FableCut project.json

### Stage 6: Validation

```bash
node 06-validate.mjs --json
node 06-validate.mjs --blueprint=TBP-NNN --storyboard=<name>
```

24 checks across:
- Media integrity (files exist, non-zero)
- Track structure (V1 + A1, no orphans)
- Duration (≥5 min, 3-30 min)
- Asset diversity (unique audio/visual, varied clip durations)
- Image integrity + Vision API content check
- Channel treatment (correct filter preset)

**Pass thresholds:** Bronze 60% | Silver 75% | Gold 85%

---

## The Review Loop

### Register a Video in Final

Once you have an MP4 output, register it with the Final tab:

```bash
python3 << 'EOF'
import json, time
# Create or update entry in data/final/index.json
EOF
```

Or use the API:
```bash
curl -X POST http://localhost:8766/api/final/videos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "expansion-essay1-v2",
    "title": "The Engine of Consciousness — Spanda v2",
    "essay": "expansion-essay1.md",
    "channel": "Tantra Files",
    "mp4_path": "/path/to/video.mp4",
    "duration": 137,
    "shots": [
      {"id": "shot-01", "label": "hook", "duration": 11.5},
      {"id": "shot-02", "label": "establish", "duration": 16.0}
    ],
    "status": "review"
  }'
```

### Review in Dashboard

Open **◆ Final** tab at `https://studio.tantrafiles.xyz`:
1. Select a video from the left sidebar
2. Watch in the player
3. Click a shot in the shot timeline to select it
4. Leave per-shot feedback (dimension + rating + comment)
5. Leave episode-level feedback (right panel)
6. All feedback auto-saves to `data/final/feedback-logs/{id}.md`

### Feedback Dimensions

| Dimension | Applies To | Meaning |
|-----------|-----------|---------|
| `composition` | shot | Layout, balance, visual structure |
| `pacing` | shot/episode | Timing, rhythm, duration feels right |
| `clarity` | shot | Message is legible and understandable |
| `aesthetic` | shot | Visual quality, beauty, style |
| `accuracy` | shot/episode | Doctrinal/philosophical correctness |
| `narration` | episode | Voiceover quality, script flow |
| `visuals` | episode | Overall visual coherence |
| `overall` | episode | Holistic judgment |

### Status Lifecycle

```
draft → review → revision → final
```

- `draft`: First pass, needs human eyes
- `review`: Ready for feedback
- `revision`: Regenerating based on feedback
- `final`: Approved and published

### Feedback triggers regeneration

The pattern is:
1. I generate a first draft → register in Final
2. You review, leave per-shot feedback
3. I read `data/final/feedback-logs/{id}.md`
4. I adjust scene parameters, pacing, or composition
5. I re-render and bump version
6. Loop until status flips to `final`

---

## Visual Library Reference

### Render Primitives (`03-renderer.py`)

| Primitive | Function | Parameters |
|-----------|----------|------------|
| dot | `dot(d, x, y, r, color, alpha)` | Center + radius |
| ring | `ring(d, x, y, r, color, alpha, width)` | Center + radius + stroke |
| arrow | `arrow(d, p1, p2, color, alpha, width)` | Start/end points |
| silhouette | `silhouette(d, cx, cy, s, color, alpha)` | Scale + body outline |
| flower | `flower(d, cx, cy, r, petals, color, alpha, rotation)` | Petal count |
| wavy_line | `wavy_line(d, x0, x1, y, amp, phase, color, alpha, cycles)` | Amplitude + phase |
| regular_polygon | `regular_polygon(d, cx, cy, r, n, color, alpha, rot)` | Sides |
| text | `centered(d, text, y, font, color, alpha)` | Wrapping + alignment |

### Scene Packs (PIL)

| Pack | File | Functions | Topics |
|------|------|-----------|--------|
| Reflection | `scripts/renderer/p01_reflection.py` | 8 | Mirroring, self-knowing |
| Sound | `scripts/renderer/p02_sound.py` | 8 | Mantra, vibration, spanda |
| Upayas | `scripts/renderer/p03_upayas.py` | 8 | Four means |
| Kalis | `scripts/renderer/p04_kalis.py` | 8 | Twelve Kālis |
| Spanda 2 | `scripts/renderer/p05_spanda2.py` | 8 | Pulse, expansion |
| Abhinavagupta | `scripts/renderer/p06_abhinavagupta.py` | 8 | Life, lineage |
| Mantra Breath | `scripts/renderer/p07_mantra_breath.py` | 8 | Breath, bija |
| Tantra | `scripts/renderer/p19_25_tantra.py` | 11 | 25 tattvas |
| VBT | `scripts/renderer/vbt_magnum.py` | 20 | Vijnana Bhairava |
| Spanda | `scripts/renderer/spanda_scenes.py` | 10 | Spanda video |

### Scene System (`scene-system/`)

- **263 concepts** in `scene-system/concepts/` — semantic tags
- **12 template families** in `scene-system/templates/` — concentric_center, radial_relation, bilateral_relation, body_axis, wave_field, vertical_sequence, aperture, grid_dissolution, vessel_reception, knot_release, quote_card
- **198 scenes** in `scene-system/catalog/scenes.json` — indexed with schemas

---

## Commands Cheat Sheet

```bash
# Essay → Storyboard
python3 factory/01-essay-to-storyboard.py scripts/expansion-essay5.md

# Storyboard → Beat Plan
python3 factory/02-storyboard-to-beats.py --storyboard <name> --template biography

# Render Scenes
python3 factory/03-render-scenes.py

# Voiceover
node factory/04-generate-voiceover.mjs --storyboard <name>

# Match Art + Build FableCut
python3 factory/05-match-art.py --storyboard <name> --beat-plan <name> --project

# Full Blueprint Pipeline
python3 factory/05-build-from-blueprint.py TBP-NNN

# Gold Standard (capture pacing from exemplar)
python3 factory/06-gold-standard.py --capture --name my-template

# Validate
node factory/06-validate.mjs --json

# Register in Final tab
curl -X POST http://localhost:8766/api/final/videos -H "Content-Type: application/json" -d @video-entry.json

# Restart Dashboard
systemctl restart operator-dashboard
```

---

## What a Good Video Looks Like

**Gold Standard benchmarks from exemplar analysis:**

| Metric | Alan Watts | Anandamayi Ma | Target |
|--------|-----------|---------------|--------|
| Duration | 12:26 | 20:02 | 15-20 min |
| Shots | 105 | 139 | 80-140 |
| Avg shot | 7.1s | 8.6s | 7-9s |
| BPM | 112 | 152 | 100-150 |

**Content formula (validated by XGBoost, 0.747 AUC):**
- Biography format: 1.5x lift
- 15-20 min sweet spot (consistent across all channel sizes)
- Numbers in titles HURT (#1 negative feature)
- Faces in thumbnails: NEUTRAL (0.000 importance)
- Designed graphics > photos (+7%)
- "What" starts outperform (0.118 importance)

---

## Dashboard Services

| Service | Port | Purpose |
|---------|------|---------|
| Dashboard Flask | 8766 | API backend + Final tab |
| FableCut Editor | 7777 | Video timeline assembly |
| Cloudflare Tunnel | → CF | Exposes dashboard at `studio.tantrafiles.xyz` |
| Tor Proxy | 9050 | SOCKS5 for asset downloads |

**Control:**
```bash
systemctl status operator-dashboard
systemctl restart operator-dashboard
journalctl -u operator-dashboard -f
```

## Domain

`https://studio.tantrafiles.xyz` — dashboard with Final tab
`https://dashboard.tantrafiles.xyz` — Cloudflare Pages (static frontend)

---

## Design Principles

1. **One essay → one video.** No splitting, no combining. Each expansion essay is a self-contained documentary.
2. **Shots are 4-12 seconds.** A beat (20-45s) contains 2-5 shots. Always vary pacing.
3. **PIL proves the idea.** Don't reach for Blender until the composition works in 2D.
4. **Feedback drives improvement.** Every review cycle is logged. The system gets better with use.
5. **Version everything.** Every render is immutable. Version number increases with each regeneration.
6. **The "◆ Final" tab is the source of truth.** If it's not in Final, it hasn't been reviewed yet.
