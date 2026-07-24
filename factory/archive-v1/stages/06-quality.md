# Stage 6: Quality & Validation

**Scripts:**
- `06-validate.mjs` — 24 quality checks on FableCut project
- `06-gold-standard.py` — capture/apply pacing from exemplars

## Purpose

Ensure the video meets quality thresholds before human review.

## Validation (24 Checks)

```bash
cd /root/projects/blog/factory

# Validate current FableCut project
node 06-validate.mjs --json

# Validate against a specific blueprint
node 06-validate.mjs --blueprint=TBP-NNN

# Validate with storyboard
node 06-validate.mjs --storyboard=<name>
```

### Pass Thresholds

| Level | Score | Meaning |
|-------|-------|---------|
| Bronze | ≥60% | Minimum viable: audio+visual exist, ≥5min, no orphans |
| Silver | ≥75% | Standard: avg shot 6-20s, Ken Burns ≥5%, channel filter |
| Gold | ≥85% | Production: matches exemplar pacing, BPM within 20%, Vision API |

### Check Categories

```
Media (C1a-e):     audio exists, visual exists, files on disk, audio ≥5s
Tracks (C2a-c):    V1+A1 present, duration ≥5min, proper name
Diversity (C3a-d): unique audio, unique visual, meaningful names, clip kind
Pacing (C4a-e):    varied durations, audio covers 50%+, no orphans/duplicates, Ken Burns
Quality (C5a-c):   visual effects, channel treatment, 3-30min
Vision (V01-03):   image integrity, Vision API content, label relevance
```

## Gold Standard Pacing

```bash
cd /root/projects/blog/factory

# List available gold standards
python3 06-gold-standard.py --list

# Show a gold standard's structure
python3 06-gold-standard.py --show alan-watts-gold

# Apply gold standard pacing to a storyboard
python3 06-gold-standard.py --apply alan-watts-gold --storyboard <name>

# Capture a new gold standard from a finished video
python3 06-gold-standard.py --capture --name my-template

# Publish a packaged video
python3 06-gold-standard.py --publish=<slug>
```

### Gold Standards Available

| Name | Source | Shots | Avg Shot | BPM |
|------|--------|-------|----------|-----|
| `alan-watts-gold` | Alan Watts | 105 | 7.1s | 112 |
| `abhinavagupta-v1` | Abhinavagupta | — | — | — |

## Image Quality Checks

```bash
# Run Vision API content validation on all art
python3 ../scripts/video-vision-check.py --json --skip-vision

# Check image integrity only
python3 ../scripts/video-vision-check.py --json
```

## What to Check

- Video passes ≥75% before submitting for human review
- No orphan clips (clips referencing missing media)
- Audio covers ≥50% of timeline
- Channel filter preset is applied (mystical-dark, golden-imaginal, corbin-blue)
- Duration is 15-20 min for biography format
- Ken Burns animations applied to ≥5% of clips
