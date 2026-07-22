# Video Templates

Reusable video structures with global animation rules, image pacing, and music/SFX.

## Architecture

```
Template (JSON)
  │
  ├── Segment Structure (12-15 segments, 3-4 sub-beats each)
  ├── Global Rules (Ken Burns, crossfades, music, filter)
  ├── Image Requirements (how many, pacing, variety)
  └── SFX Map (ambient, transitions, emphasis)
  │
  ▼
Hermes generates Storyboard (with specific image descriptions per sub-beat)
  │
  ▼
apply-template.py → FableCut project.json (with all clips, keyframes, effects)
```

## Biography Template (v1)

### Structure

```
Opening Title Card          [5s]    → channel logo + episode title
  └── Hook Beat                    [15s]   → mystery question

Main Body (12 segments)
  For each segment:
    ├── Beat 1: Context       [10-20s]  → image: setting/landscape/period
    ├── Beat 2: Action        [10-20s]  → image: figure/subject doing thing
    ├── Beat 3: Detail        [10-20s]  → image: close-up/manuscript/detail
    └── Beat 4: Reflection    [10-20s]  → image: symbolic/artistic response

Closing                        [30s]    → synthesis + channel outro
```

### Image Pacing

| Duration | Images needed | Source |
|----------|--------------|--------|
| 6 min | ~24-36 | Art library + museum APIs |
| 12 min | ~48-72 | Art library + museum APIs |
| 20 min | ~80-120 | Art library + museum APIs |

### Animation Rules (applied to every image clip)

| Rule | Value | Notes |
|------|-------|-------|
| Ken Burns | ✅ Always | Zoom 1.0→1.12 or reverse |
| Direction | Varied | Every 4th clip changes direction |
| Crossfade | 0.5s | Between all image clips |
| Filter | Channel preset | `cinematic` for Tantra Files |
| Text overlay | Optional | Lower-third for names/places |
| Duration floor | 8s | Minimum time per image |
| Duration ceiling | 25s | Maximum time per image |

### Music + SFX

| Layer | File | Volume | Where |
|-------|------|--------|-------|
| Ambient drone | `library/sfx/ambient-drone.mp3` | -18dB | Entire video (A2) |
| Bell transition | `library/sfx/bell.mp3` | -8dB | Start of each segment |
| Emphasis hit | `library/sfx/impact-soft.mp3` | -12dB | Key revelation moments |
| Nature ambience | Variable | -15dB | Scene-specific (water, fire, wind) |

### Image Assignment Rules

Each sub-beat needs an image that matches its narration. The matching pipeline:

1. Extract key nouns from narration text
2. Score each available artwork by keyword/concept overlap
3. Pick best match per sub-beat
4. Ensure no duplicates within a 3-clip window
5. Ensure diversity: not all sculptures, not all paintings, mix media types

### Video Clip Insertion

When available, insert LTX-generated video clips:
- Duration: 10-30s
- Placement: Every 4th-5th sub-beat replaces a still image
- Purpose: Break up visual rhythm, add motion
- Fallback: Ken Burns still image if no video available

---

## Using the Template

```bash
# Step 1: Hermes generates storyboard from RO
node scripts/generate-storyboard.mjs --ro ro:abhinavagupta-life --template biography

# Step 2: Apply template → expand into sub-beats with image descriptions
python scripts/apply-template.py --storyboard abhinavagupta-life --template biography

# Step 3: Match images from library
python scripts/match-images-to-storyboard.py --storyboard abhinavagupta-life --project

# Step 4: Build FableCut project (with all animations, transitions, music)
python scripts/apply-template.py --build-fablecut --storyboard abhinavagupta-life

# Result: FableCut project with:
#   - 36+ sub-beat clips (V1)
#   - Voiceover (A1)
#   - Music bed (A2)
#   - SFX (A3)
#   - All Ken Burns keyframes
#   - Crossfade transitions
#   - Text overlays where needed
```
