# Video Creation Spec — Hermes Validation Levels

## Overview

Formal spec derived from exemplar analysis (Eternalised, Academy of Ideas), gold-standard pacing templates, and existing modules. Three validation levels — start at Bronze, graduate up.

---

## Level 0: Bronze (Minimum Viable Video)

Pass threshold: **60%**. Use for first videos, rapid experiments.

| Check | Rule | Weight |
|-------|------|--------|
| Has audio media | ≥1 audio clip on A1 | 15 |
| Has visual media | ≥1 image/video clip on V1 | 15 |
| Duration ≥5 min | Total timeline ≥300s | 15 |
| Audio covers ≥50% | Sum of audio clips ≥ half of total duration | 10 |
| No orphan clips | Every clip is in timeline (start+duration > 0) | 10 |
| No duplicate clips | No identical media used twice in same track | 10 |
| Files on disk & non-zero | Every referenced media path exists and size > 0 | 10 |
| Proper project name | Not "Untitled" | 5 |
| Unique visual assets | ≥3 unique images (not same file repeated) | 5 |
| Unique audio segments | ≥2 unique audio segments | 5 |

---

## Level 1: Silver (Standard Quality)

Pass threshold: **75%**. Includes all Bronze checks plus:

### Pacing

| Check | Rule | Weight |
|-------|------|--------|
| Avg shot duration | 6–20s (from alan-watts-gold: 7.1s, anandamayi-ma: 8.8s) | 10 |
| Duration 8–30 min | Total timeline | 10 |
| Clip kind matches type | Image clips have kind "image", video clips "video" | 8 |
| No back-to-back zoom repeats | Ken Burns style changes every clip (3-clip memory) | 8 |
| Varied clip durations | SD of clip durations ≥ 3.0 (not all same length) | 8 |

### Shot Mix

| Check | Rule | Weight |
|-------|------|--------|
| Text overlay ≤60% | No more than 60% of clips are text_overlay type | 8 |
| Video footage ≤50% | No more than 50% of clips are video_footage type | 5 |
| Ken Burns / still ≥5% | At least 5% of clips use Ken Burns animation | 5 |

### Content

| Check | Rule | Weight |
|-------|------|--------|
| Voiceover per segment | Each storyboard segment has a corresponding A1 clip | 10 |
| Blueprint beat match | Clip count within ±2 of blueprint beat count | 10 |
| Channel filter applied | Correct filter preset for channel | 8 |
| Proper noun image match | ≥2 images matched to narration proper nouns | 5 |
| No corrupt images | Every image loads without error (filesize ≥ 1KB) | 5 |

### Title Rules

| Check | Rule | Weight |
|-------|------|--------|
| No numbers in title | Title must not contain digits | 8 |
| Starts with "The" | Title begins with "The" (for biography format) | 5 |
| ≤8 words | Title word count | 5 |
| No question mark | No "?" in title (unless channel > 100k subs) | 3 |

---

## Level 2: Gold (High Quality — Match Eternalised/AOI)

Pass threshold: **85%**. Includes all Bronze + Silver checks plus:

### Pacing (Gold Standard)

| Check | Rule | Weight |
|-------|------|--------|
| Durations match gold template | Per-shot durations within 30% of gold-standard pacing | 15 |
| Energy curve follows exemplar | Energy highs/lows at similar points (±20%) | 10 |
| BPM within 20% of target | e.g. alan-watts-gold: 112 BPM | 10 |
| Cuts per second ≥ 0.10 | Minimum cut density (alan-watts: 0.14, anandamayi: 0.11) | 10 |

### Visual

| Check | Rule | Weight |
|-------|------|--------|
| Vision API label relevance | ≥50% of images have labels matching narration concepts | 10 |
| Image diversity | Mix of media types: art, photo, manuscript, diagram | 8 |
| No image repeated within 3 clips | Same image cannot appear within 3 consecutive clips | 8 |
| Lower thirds for introductions | Name/place text overlay for first mention of new figure | 5 |

### Audio

| Check | Rule | Weight |
|-------|------|--------|
| Ambient drone track | A2 track has ambient drone music | 8 |
| SFX at key moments | Bell/emphasis at segment transitions | 5 |
| Audio levels normalized | All audio clips within -3dB of each other | 5 |

### Narrative

| Check | Rule | Weight |
|-------|------|--------|
| Proper noun density | ≥30 proper nouns per 10 min of narration | 8 |
| Quote cards for attributed quotes | Every quoted passage has a quote-card module | 5 |
| Opening hook segment | First segment role is "hook" | 5 |

---

## Video Format Specification

### Duration & Structure

| Parameter | Bronze | Silver | Gold |
|-----------|--------|--------|------|
| Duration | 5–30 min | 8–30 min | 12–25 min |
| Segments | ≥4 | ≥8 (biography: 12) | 12 |
| Sub-beats per segment | Any | 2–3 | 3 |
| Total shots | ≥20 | 36–80 | 80–140 |

### Shot Types (per video)

| Type | Min | Max | Target (Biography) | Target (Essay) |
|------|-----|-----|--------------------|----------------|
| text_overlay | 10% | 60% | 35% | 50% |
| video_footage | 5% | 50% | 35% | 25% |
| ken_burns_still | 5% | 30% | 20% | 15% |
| unknown/transitions | 0% | 10% | 10% | 10% |

### Ken Burns Cycle

Cycle through styles with 3-clip memory — no repeats within 3 consecutive clips:

1. `zoom_in` (1.0→1.10)
2. `zoom_in_left` (1.0→1.12, pan right)
3. `zoom_out` (1.12→1.0)
4. `drift_diagonal` (1.0→1.08, diagonal pan)
5. `zoom_in_right` (1.0→1.12, pan left)
6. `gentle_float` (1.02→1.06, slight float)
7. `push_in_fast` (1.0→1.20, emphasis)
8. `static` (1.0→1.0, quote cards only)
9. `pan_across` (1.08→1.08, pan -30→30)
10. `zoom_out_up` (1.12→1.0, pan up 8px)

### Durations

| Module | Duration |
|--------|----------|
| Quote card | 8–20s |
| Lower third | 6–12s |
| Full bleed art | 10–25s |
| Text on black | 8–15s |
| Portrait focus | 10–18s |
| Detail zoom | 8–15s |
| Map/diagram | 12–20s |

### Animation

| Parameter | Value |
|-----------|-------|
| Crossfade between clips | 0.5s |
| Crossfade between segments | 1.0s |
| Ken Burns min zoom | 1.0 |
| Ken Burns max zoom | 1.15 |
| Duration floor per clip | 8s |
| Duration ceiling per clip | 25s |

---

## Exemplar Reference Summary

| Video | Channel | Duration | Shots | Avg Shot | BPM | % Text | % Video | % Ken Burns | % Unknown | Style |
|-------|---------|----------|-------|----------|-----|--------|---------|-------------|-----------|---|
| Alan Watts (gold) | Eternalised | 12.4 min | 105 | 7.1s | 112 | 40% | 48% | 7% | 6% | Fast Biography |
| Anandamayi Ma | Eternalised | 20.3 min | 139 | 8.8s | 152 | 42% | 35% | 19% | 4% | Fast Biography |
| Nisargadatta | Eternalised | 19.8 min | 75 | 15.8s | — | 28% | 48% | 13% | 11% | Slow Biography |
| Jesus Himalayas | Eternalised | 25.7 min | 92 | 16.7s | — | 65% | 22% | 4% | 9% | Text-heavy Doc |
| AOI Pretend Less | Acad of Ideas | 11.7 min | 22 | 31.9s | — | 55% | 0% | 41% | 5% | Smooth Essay |
| AOI Western World | Acad of Ideas | 15.4 min | 59 | 15.7s | — | 32% | 8% | 17% | 42% | Smooth Essay |

### Template Assignments

| Content Type | Template | Gold Standard | Shot Count |
|-------------|----------|---------------|------------|
| Biography | `biography.json` | `alan-watts-gold` | 80-140 |
| Philosophical Essay | `biography.json` (modified) | — | 20-60 |
| Yogi Spotlight | `yogi-spotlight` | — | 60-100 |

---

## Pipeline Integration

### Hermes Check Command

```bash
node scripts/validate-video.mjs --level bronze
node scripts/validate-video.mjs --level silver
node scripts/validate-video.mjs --level gold
```

### Quick Creation Flow

```bash
# 1. Apply template to storyboard
python3 scripts/apply-template.py --storyboard <name> --template biography

# 2. Apply gold standard pacing
python3 scripts/gold-standard.py --apply alan-watts-gold --storyboard <name>

# 3. Match art and build FableCut project
python3 scripts/match-images-to-storyboard.py --storyboard <name> --beat-plan <name> --project

# 4. Generate quote cards
python3 scripts/generate-quote-cards.py --storyboard <name> --project

# 5. Validate at Silver level
node scripts/validate-video.mjs --level silver

# 6. Publish
python3 scripts/gold-standard.py --publish=<slug>
```

---

## When to use each threshold for analyze-exemplar.py

| Video Style | Threshold | Example |
|-------------|-----------|---------|
| Hard cuts, fast editing (Eternalised biography) | default (adaptive) | Alan Watts |
| Smooth fades, slow zooms (Academy of Ideas essay) | `--threshold=0.05` | AOI videos |
| Mixed (Anandamayi Ma) | default | Anandamayi Ma |
