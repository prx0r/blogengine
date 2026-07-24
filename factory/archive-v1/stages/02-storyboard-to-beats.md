# Stage 2: Storyboard → Beat Plan

**Script:** `02-storyboard-to-beats.py` (symlink → `scripts/apply-template.py`)

## Purpose

Expand a storyboard's coarse segments into a granular beat plan by applying a video template. Each segment splits into 2-5 sub-beats with specific visual treatments and durations.

## Input

- Storyboard JSON from `content/publishing/storyboards/` (has `segments[]` with narration)
- Template JSON from `factory/templates/` (has `segment_structure[].sub_beats[]`)

## Output

Beat plan JSON at `{storyboard_name}_beats.json` — timed sub-beats ready for rendering.

## How It Works

1. Loads a video template (e.g., `biography.json`: 12 segments × 3 sub-beats = 36 total)
2. For each storyboard segment, maps to the corresponding template segment
3. Splits the segment's narration text proportionally across the sub-beats by word count
4. Each sub-beat gets: narration_chunk, duration_sec, image_type, search_terms, sfx

## Template: `biography.json`

```
12 segments × 3 sub-beats = 36 beats, ~12 min target

Segment Structure:
  hook:          Mystery Question (15s) + The Figure (12s) + Why They Matter (15s)
  early-life:    Origins (18s) + Formative Events (15s) + Early Signs (12s)
  context:       Historical Setting (20s) + Intellectual Climate (15s) + Key Influences (12s)
  ... (9 more segments)
```

## Templates Available

| Template | File | Segments | Sub-beats | Total | Target Duration |
|----------|------|----------|-----------|-------|-----------------|
| Biography | `templates/biography.json` | 12 | 3 | 36 | ~12 min |
| Alan Watts Gold | `templates/alan-watts-gold.json` | — | — | 105 shots | 7.1s avg |

## Usage

```bash
cd /root/projects/blog/factory

# Expand a storyboard using biography template
python3 02-storyboard-to-beats.py --storyboard <name> --template biography

# Show available templates
python3 02-storyboard-to-beats.py --list

# Apply gold standard pacing
python3 ../scripts/gold-standard.py --apply alan-watts-gold --storyboard <name>
```

## What to Check

- All narration text from segments is distributed across sub-beats
- Each sub-beat has reasonable duration (4-12 seconds for shots)
- Image types make sense for the content (portrait for figures, atmospheric for concepts)
- Total duration aligns with target (15-20 min for biography format)
