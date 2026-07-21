# Formal Prompt Pipeline

## The Loop

```
1. GENERATE  →  batch of 5-10 clips from the 184 seed prompts
2. REVIEW    →  user rates each: Y / T / N  + notes
3. ANALYZE   →  after 20 ratings, patterns emerge
4. REFINE    →  update prompts based on patterns
5. VERSION   →  save as v02, v03... keep the lineage
```

---

## Step 1: Generate

```
./scripts/batch-submit.sh "Transformative Moments" 0 5
```

Worker renders 5 clips, saves MP4s, uploads to R2, returns URLs.

## Step 2: Review

Open the review page. For each clip:

```
┌─────────────────────────────────────┐
│  TR3_WASP_FRIEND_v01.mp4            │
│  ▶ [video]                          │
│                                     │
│  Rating:  ● Y  ○ T  ○ N            │
│  Notes:  [___________________]      │
│  Seed:   4242                       │
│  Prompt: A wasp transforms into...  │
│                                     │
│  [Submit]  [Skip]                   │
└─────────────────────────────────────┘
```

**Rating definitions:**
- **Y (Yes)** — works as-is, usable in videos
- **T (Tweak)** — close but needs prompt adjustment
- **N (No)** — concept doesn't work, scrap it

**Notes:** What went wrong? "Too fast, wrong colour, jittery, not clay-textured enough, camera moved too much" etc.

---

## Step 3: Analyze (After 20+ Ratings)

After 20+ rated clips, generate a pattern report:

```json
// auto-generated after 20 ratings
{
  "patterns": {
    "camera_movement": {
      "static": {"avg_rating": 2.8, "count": 12},   // static cameras work best
      "orbit":   {"avg_rating": 1.9, "count": 6},    // orbits are hit-or-miss  
      "push_in": {"avg_rating": 2.4, "count": 8}
    },
    "duration": {
      "15s": {"avg_rating": 2.6, "count": 14},      // 15s is the sweet spot
      "20s": {"avg_rating": 2.1, "count": 10},       // 20s sometimes gets jittery
      "25s": {"avg_rating": 1.5, "count": 4}         // 25s+ often degrades
    },
    "subject_type": {
      "geometric_figure": {"avg_rating": 2.7, "count": 18},
      "landscape":        {"avg_rating": 2.3, "count": 10},
      "abstract_light":   {"avg_rating": 2.5, "count": 14},
      "deity_figure":     {"avg_rating": 1.8, "count": 6}
    },
    "frequent_issues": {
      "too_fast":          7 mentions,
      "wrong_colour":      5 mentions,
      "not_clay_enough":   4 mentions,
      "jittery_motion":    4 mentions,
      "camera_too_close":  3 mentions
    }
  }
}
```

This tells us: static cameras at 15s with geometric figures score highest. 25s clips often fail. Deepen those patterns.

## Step 4: Refine

Based on patterns, update prompt templates:

```diff
- // Generic prompt:
- A figure sits in darkness. Light descends. 20s.
+
+ // Refined prompt based on feedback:
+ A small geometric clay figure sits in deep warm darkness.
+ A single stream of gold light descends from above, very slowly,
+ striking the crown of the figure's head. The figure does not move.
+ Static camera. 15s. Silence.
```

Save as the new version. The old prompt is retained for reference.

## Step 5: Version

Each clip ID tracks its lineage:

```
AC6_SPANDA_v01  →  seed 4242, rating Y
AC6_SPANDA_v02  →  seed 7891, rating T (too fast, halved pulse rate)
AC6_SPANDA_v03  →  seed 1012, rating Y (fixed)
```

When a concept reaches "Y" status, it goes into the **approved library** — ready for use in videos. "T" variants stay in iteration. "N" variants are archived.

---

## Pipeline Files

| File | Purpose |
|------|---------|
| `prompts-catalog.json` | All 184 prompts with metadata |
| `feedback-log.json` | User ratings + notes (created when you start reviewing) |
| `pattern-report.json` | Auto-generated analysis after 20+ ratings |
| `approved-library/` | Approved clips ready for video assembly |

---

## Getting Started

1. Generate the first batch: `./ltx-style-lab/scripts/batch-submit.sh "Transformative Moments" 0 5`
2. Open the review page and rate each clip
3. After 5 batches (~25 ratings), run the pattern analyzer
4. Adjust the worst-performing prompts
5. Generate v02 of those prompts
6. Repeat until 80%+ of clips land at Y
