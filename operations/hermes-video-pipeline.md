# Hermes Video Pipeline — Gold-Standard-Guided

## Overview

Bridge between the 3-pass essay writing skill and the FableCut video pipeline. Every phase has deterministic validation gates derived from our exemplar analyses.

Reference:
- `operations/video-creation-spec.md` — validation levels Bronze/Silver/Gold
- `video-templates/style-rules.md` — per-channel style rules
- `video-templates/gold-standards/alan-watts-gold.json` — primary pacing template
- `video-templates/modules/README.md` — 11 modules, 10 Ken Burns styles
- `handovervideo.md` — pipeline architecture

---

## Phase 0: Source Resolution

Choose ONE path:

**Path A: Use a Blueprint** (recommended for first videos)
- Read the blueprint from `tantrafiles/blueprints/TBP-NNN.md`
- Extract: title, channel, beat structure, asset URLs
- Read scraped articles on the topic from `content/research/eternalised/` or `content/research/academy-of-ideas/` for style reference

**Path B: Use a Research Object**
- Read the RO from `content/research-objects/ro-<slug>/ro.json`
- Extract title, passages, concepts

---

## Phase 1: Write Script (3-Pass Essay Method)

**Use the existing `write` skill** — do NOT edit its process. The 3-pass method is:

### Pass 1: Extract Source Material
- Read the blueprint or RO thoroughly
- Read 2-3 scraped Eternalised or AOI articles on similar topics for style calibration
- Extract key claims, quotes, and narrative arc

### Pass 2: Write Narration
- Follow the beat structure from the blueprint
- Write per-beat narration in a conversational documentary voice
- Target **200-250 wpm** for biography style (Alan Watts)
- Target **150-170 wpm** for contemplative essay style (AOI)
- Mark attributed quotes with quotation marks for quote-card detection

### Pass 3: Structure into Segments
- Create a storyboard JSON in `content/publishing/storyboards/{slug}.json`
- Each segment has: `segment_id`, `label`, `rhetorical_role`, `narration`, `start_sec`, `end_sec`
- First segment role MUST be `"hook"`
- Last segment role MUST be `"closing"`

---

## Phase 2: Validation Gate — Script Quality

Before proceeding, validate the script against gold standards:

| Check | Rule | How |
|-------|------|-----|
| Duration per beat | 1-3 min each | Sum of segment durations matches blueprint target |
| Proper noun density | ≥30 per 10 min | Count proper nouns in narration text |
| Quote attribution | Marked with `"..."` | grep for quotation marks |
| Segment count | ≥5 | Storyboard has enough segments |
| Hook exists | First role == "hook" | Check JSON |
| Closing exists | Last role == "closing" | Check JSON |
| No AI slop | Each beat has specific claims not generic padding | Manual review |

If validation fails, loop back to Phase 1 with max 2 retries.

---

## Phase 3: Download & Match Art

### Step 3a: Download Assets from Blueprint URLs
```bash
python3 scripts/pipeline/build-from-blueprint.py {BP_ID} --skip-voiceover
```
This downloads all asset URLs from the blueprint into FableCut's media directory.

### Step 3b: Search Art Library
For beats without specific asset URLs, search the art gallery:
```bash
# Find art matching narration concepts
ls content/glossary/art/ | grep -i <concept>
```
Art library at `content/glossary/art/` has 1,146 metadata JSONs.

### Step 3c: Assign Art to Beats
Use the `match-images-to-storyboard.py` pipeline for deterministic matching:
```bash
python3 scripts/apply-template.py --storyboard {slug} --template biography
python3 scripts/match-images-to-storyboard.py --storyboard {slug} --beat-plan {slug} --project
```

### Step 3d: Manual Override Points
- If match is poor, manually assign from the downloaded assets
- Prefer: proper noun exact match (25x score) > concept match (3-5x) > vision label (2x)

---

## Phase 4: Apply Ken Burns Zooms

Use the animation pool from `video-templates/modules/README.md` — cycle with 3-clip memory:

| Style | Scale | Pan | Use Case |
|-------|-------|-----|----------|
| `zoom_in` | 1.0→1.10 | — | Wide landscapes, establishing |
| `zoom_in_left` | 1.0→1.12 | +15px right | Portraits looking left |
| `zoom_in_right` | 1.0→1.12 | -15px left | Portraits looking right |
| `zoom_out` | 1.12→1.0 | — | Reveal shots, context |
| `drift_diagonal` | 1.05→1.12 | diagonal | Dynamic content |
| `gentle_float` | 1.02→1.06 | ±5px | Contemplative moments |
| `push_in_fast` | 1.0→1.20 | — | Emphasis, revelations |
| `static` | 1.0→1.0 | — | Quote cards, title cards only |
| `pan_across` | 1.08→1.08 | -30→30 | Wide paintings, panoramas |

**Rules:**
- No back-to-back repeats of the same style
- Quote cards always use `static`
- Minimum clip duration: **8s**
- Maximum clip duration: **25s**
- Crossfade between clips: **0.5s**
- Crossfade between segments: **1.0s**

---

## Phase 5: Apply Gold Standard Pacing

```bash
# Apply Alan Watts gold standard pacing
python3 scripts/gold-standard.py --apply alan-watts-gold --storyboard {slug}
```

This adjusts per-beat durations to match the 7.1s average shot length, 112 BPM energy curve, and 12.4 min total duration profile of the Alan Watts exemplar.

If using essay style (AOI), skip this step — AOI doesn't have a gold standard template yet.

---

## Phase 6: Generate Voiceover

```bash
node scripts/generate-voiceover.mjs {slug}
```

- Female voice (`en-US-AriaNeural`) for main narration
- Male voice (`en-GB-RyanNeural`) for quoted passages

**Validation:**
- All MP3s exist and are non-zero
- Total audio duration within 20% of storyboard estimate

---

## Phase 7: Build FableCut Project

```bash
# Option A: From blueprint (if using Path A)
python3 scripts/pipeline/build-from-blueprint.py {BP_ID}

# Option B: From storyboard + gold standard
python3 scripts/apply-template.py --storyboard {slug} --template biography --build-fablecut
python3 scripts/match-images-to-storyboard.py --storyboard {slug} --beat-plan {slug} --project
python3 scripts/generate-quote-cards.py --storyboard {slug} --project
```

Then load into FableCut:
```bash
curl -s -X PUT http://localhost:7777/api/project \
  -H "Content-Type: application/json" \
  -d @{project_path}
```

---

## Phase 8: Validation Gate — Video Quality

Run the validation script:
```bash
node scripts/validate-video.mjs --json
```

Verify against Bronze/Silver/Gold levels from `video-creation-spec.md`.

**Start at Bronze (60%)** for first videos. Graduate to Silver (75%) after 3-4 videos.

### Bronze Checks (minimum viable)
| Check | Rule |
|-------|------|
| Has audio | ≥1 A1 clip |
| Has visuals | ≥1 V1 clip |
| Duration ≥5 min | Total ≥300s |
| Audio covers ≥50% | No silent gaps > half the video |
| No orphan clips | All clips in timeline |
| No duplicate clips | Unique media per track |
| Files exist on disk | All referenced paths exist |
| Not "Untitled" | Project has a name |

### Silver Checks (standard quality)
| Check | Rule |
|-------|------|
| Avg shot 6-20s | Pacing within exemplar range |
| Duration 8-30 min | Total timeline |
| Text overlay ≤60% | Not all text |
| Ken Burns ≥5% | Some motion in every segment |
| Voiceover per segment | Every beat has audio |
| Channel filter applied | Correct preset |
| No numbers in title | Title rule |
| ≤8 words in title | Title rule |

---

## Phase 9: Preview & Export

1. Open FableCut at `http://localhost:7777`
2. Play through the timeline
3. Check: image quality, timing, audio sync
4. Make manual tweaks in the UI if needed
5. Click Export

---

## Deterministic Decision Tree

When Hermes has to make a creative choice, use this priority:

```
1. Gold standard data (alan-watts-gold.json metrics)
2. Blueprint spec (beat structure, durations)
3. Exemplar analysis (shot mix averages from style-rules.md)
4. Module rules (animation pool from README.md)
5. Fallback: reasonable default (8s min clip, 0.5s crossfade)
```

No creative decisions should be arbitrary — every choice must reference one of these sources.

---

## Files Referenced

| File | Purpose |
|------|---------|
| `video-templates/gold-standards/alan-watts-gold.json` | Primary pacing template (7.1s avg, 112 BPM) |
| `video-templates/modules/README.md` | Animation pool, module selection logic |
| `video-templates/style-rules.md` | Per-channel style, shot mix targets |
| `operations/video-creation-spec.md` | Bronze/Silver/Gold validation levels |
| `scripts/validate-video.mjs` | 24-check validation runner |
| `scripts/match-images-to-storyboard.py` | Deterministic art matching |
| `scripts/pipeline/build-from-blueprint.py` | Asset download + FableCut build |
| `handovervideo.md` | Full pipeline reference |
