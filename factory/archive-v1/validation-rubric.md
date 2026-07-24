# Platinum Validation Rubric

## Scoring (100 pts total)

### Shot Structure (40 pts)
| Criterion | Points | GOLD (full) | SILVER (half) | BRONZE (none) |
|-----------|--------|-------------|---------------|---------------|
| Shot count | 20 | 80+ shots | 50-79 shots | <50 shots |
| Avg shot duration | 10 | 5-10s | 3-12s | outside range |
| Shot duration variety | 10 | Std dev 2-4s | Std dev 1-5s | all same length |

### Runtime (20 pts)
| Criterion | Points | GOLD | SILVER | BRONZE |
|-----------|--------|------|-------|--------|
| Total duration | 10 | 8-25 min | 5-30 min | outside |
| Chapter structure | 10 | 8+ chapters | 4-7 chapters | <4 |

### Visual Quality (25 pts)
| Criterion | Points | GOLD | SILVER | BRONZE |
|-----------|--------|------|-------|--------|
| Visual mode variety | 10 | 15+ unique modes | 8-14 | <8 |
| Palette discipline | 5 | ≤5 colors, all used | 6-7 colors, mostly used | undefined/inconsistent |
| Continuity objects | 5 | 3+ objects persist | 1-2 objects | none |
| Transitions | 5 | continuous (preserve) | mix of cut/continuous | all hard cuts |

### Production (15 pts)
| Criterion | Points | GOLD | SILVER | BRONZE |
|-----------|--------|------|-------|--------|
| FPS | 5 | 8+ | 4-6 | 2 |
| Per-shot audio | 5 | 90%+ shots have audio | 50-89% | <50% |
| Render script | 5 | reusable, parameterized | ad-hoc | no script |

## Validation Modules (Prompt-Based Passes)

### Pass 1: Rubric Scorer
```
You are a video quality assessor. Score this output pack against the rubric above.
Read storyboard.json and analysis_report.json.
Return: score, grade, and top 3 specific gaps with suggested fixes.
Focus on what would move the score from current to GOLD.
```

### Pass 2: Subtitle Sync Checker
```
You are a subtitle timing validator. Read the storyboard JSON.
Each shot has a duration and the text that is spoken during it.
Check: does the text fit within the shot duration?
At 2 words per second, a 10-second shot holds ~20 words.
Flag any shot where text clearly overflows or drastically underfills.
Return: list of mismatched shots with suggested new duration.
```

### Pass 3: Visual-Narration Alignment
```
You are a visual concept validator. Read the storyboard.
For each shot, compare the 'mode' (visual treatment) with the 'text' (spoken content).
Does the visual mode serve the concept being discussed?
Examples of good alignment:
- "threshold_triad" mode + text about "three worlds" → matched
- "emanation_field" mode + text about "consciousness radiating" → matched
- "kancukas" mode + text about "coverings constricting" → matched

Flag mismatches. Suggest alternative modes from the available scene packs.
Scene packs available: p01_reflection, p02_sound, p03_upayas, p04_kalis,
p05_spanda2, p06_abhinavagupta, p07_mantra_breath, p19_25_tantra, vbt_magnum,
spanda_scenes, plus visual-library/ (20 packs, 172 functions).
```

### Pass 4: Continuity Check
```
You are a visual continuity inspector. Read the storyboard.
Track 'continuity_object' across consecutive shots.
In a platinum video, Shot N's visual elements should persist into Shot N+1.
Check: does each shot's opening reference what the previous shot established?
Look for: same geometry, same position, same color, same entity.
Flag breaks in continuity. Suggest how to bridge them.

The Corbin reference uses patterns like:
- "preserve three apertures" → next shot still shows the apertures
- "preserve the line of sight" → the gaze direction carries over
```

### Pass 5: Palette Audit
```
You are a color discipline auditor. Read the visual_program.json for the defined palette.
Scan all scene functions in the build script for color tuple values.
Every color used should be in the palette or a direct blend of palette colors.
Flag any foreign color. Suggest replacing with the nearest palette color.

Example palette:
- WHITE = (248, 246, 240) → #F8F6F0
- INK = (30, 25, 27) → #1E191B
- CRIMSON = (141, 44, 57) → #8D2C39
- GOLD = (208, 172, 91) → #D0AC5B
- MUTED = (145, 141, 132) → #918D84
```

## How to Run

```bash
# v1: Score current output
python3 factory/scripts/analyze-output.py content/publishing/renders/<slug>/
# → check score and grade

# For each pass, save feedback:
curl -X POST https://factory-worker.tradesprior.workers.dev/api/factory/jobs/<slug>/feedback \
  -H "Content-Type: application/json" \
  -d '{"author":"Hermes","dimension":"<pass>","comment":"<findings>"}'

# After all 5 passes pass → GOLD
# After 3 iterations without GOLD → escalate
```

## Platinum Reference (Corbin Pack)

```
shots: 102
avg_shot: 6.3s
runtime: 10.7 min
visual_modes: 43
palette: 5 colors (paper, ink, porphyry, lapis, gold)
continuity_objects: 4 (threshold, guide, relation_thread, inner_eye)
transitions: 101/102 continuous (preserving objects)
fps: 8
per_shot_audio: 102 WAVs
score: 115/100
```
