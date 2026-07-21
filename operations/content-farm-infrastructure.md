# Content Farm Infrastructure — Agnostic Spec

## Core Loop

```
Blueprint → Video → Performance Data → Updated Blueprint → Better Video
```

Each video is an experiment. The blueprint defines the hypotheses. The video tests them. The analytics tell you what worked.

---

## Object Model

### Blueprint (TBP)
A complete production spec for one video. Contains:
- **Hypotheses** (HYP-01–05): competing claims tested by the video
- **Claims** (CLM-001+): individual evidence statements, each with verification status
- **Sources** (SRC-001+): research backing each claim
- **Beats** (BEAT-01–12): timed narrative structure with role labels
- **Assets** (AST-001+): required images, diagrams, footage
- **Performance prediction**: expected retention, estimated views, breakout probability

### Hypothesis Object (HO)
A reusable, testable proposition. Not tied to one video. Lives independently.

```json
{
  "ho_id": "ho:questions-boost-breakout",
  "claim": "Question marks in titles increase breakout probability for channels >100k subs",
  "status": "testing",
  "evidence": {
    "total_videos_tested": 15735,
    "breakout_lift": 0.089,
    "channel_size_threshold": 100000,
    "small_channel_effect": -0.062
  },
  "blueprints_tested_in": ["TBP-001", "TBP-012", "TBP-026"],
  "last_updated": "2026-07-21"
}
```

HOs connect to blueprints: a blueprint's HYP-01 might reference HO-014. When the video publishes, HO-014's evidence updates with actual performance data.

### Research Object (RO)
Compiled knowledge on a topic. Feeds CLAIMS in blueprints. Already exists (173 ROs).

### Comparison Object (CO)
Synthesis of multiple ROs. Feeds theoretical framing in blueprints.

---

## Performance Prediction Pipeline

For every video before publishing:

```
Blueprint TBP-033
  → Extract features: title framing, thumbnail type, duration, topic category
  → Run through XGBoost model (0.747 AUC)
  → Output predicted breakout probability
  → Output expected view range (P10, P50, P90)
  → Store prediction with blueprint_id
```

After publishing:

```
Actual views come in
  → Compare to prediction
  → Calculate prediction error
  → Flag for HO update if prediction was significantly wrong
  → Retrain model with new data point
```

This means every video you publish improves the prediction for the next one.

---

## Infrastructure Layers

### Layer 1: Knowledge Base (static, already built)

| Component | Content | Status |
|-----------|---------|--------|
| `data/hermes-knowledge.json` | All findings, models, rules | ✅ Done |
| `data/research/layer2/` | 149 channels, 19k videos | ✅ Done |
| `scripts/engines/predict_views.py` | Title pattern scorer (0.747 AUC) | ✅ Done |
| `scripts/engines/headline_score.py` | YouTube-calibrated headline engine | ✅ Done |
| `scripts/engines/niche_deep_dive.py` | 80+ niches with channel-control | ✅ Done |

### Layer 2: Blueprint System (in progress)

| Component | Content | Status |
|-----------|---------|--------|
| `tantrafiles/blueprints/TBP-026.md` | Yogini Temples | ✅ Saved |
| `tantrafiles/blueprints/TBP-033.md` | Kumari | ✅ Saved |
| Blueprint structure | Standardized with claims, sources, hypotheses | ✅ Designed |
| HO registry | Hypothesis Objects tracking what's been tested | ❌ Not built |

### Layer 3: Asset Pipeline

| Component | Content | Status |
|-----------|---------|--------|
| Wikimedia image download | `Special:FilePath/FILENAME?width=800` | ✅ Working |
| Met Museum Open Access | Collection search API → image URL | ✅ Working |
| YouTube audio/transcript | yt-dlp (requires cookies.txt) | 🟡 Blocked |
| Asset manifest per blueprint | AST-001–034 linked to source URLs | ✅ In blueprints |
| Asset licence checker | Verify CC/PD status before use | 🟡 Manual |

### Layer 4: Production Pipeline

| Component | Content | Status |
|-----------|---------|--------|
| Voiceover script | Generated from beat structure | ❌ Not built |
| FableCut timeline assembly | Project JSON from beats | ❌ Not built |
| Thumbnail generator | Title + framing word + image | ❌ Not built |
| Performance prediction | Pre-publish view/breakout estimate | ❌ Not built |

### Layer 5: Feedback Loop

| Component | Content | Status |
|-----------|---------|--------|
| Post-video analytics ingestion | YouTube API → update predictions | ❌ Not built |
| HO evidence update | Performance data → update HO registers | ❌ Not built |
| Model retraining | New data → improved XGBoost | ❌ Not built |
| Spin-off prioritization | Which TBP to produce next | ❌ Not built |

---

## HO Assessment (How to Know Which HOs Perform)

HOs can't be directly "right or wrong" from YouTube data alone — you can't prove Nāgārjuna's logic from audience retention. But you CAN measure:

| Signal | What It Tells You |
|--------|-------------------|
| **Beat-level retention** at the hypothesis test beat | How engaging the argument was |
| **Comment sentiment** on specific hypothesis sections | Which hypotheses provoked reaction |
| **Title click-through rate** per hypothesis framing | Which framing of the hypothesis was most appealing |
| **Spin-off request frequency** | Which hypotheses the audience wants to explore further |
| **Share rate** | Which hypotheses felt most surprising/valuable |

Each of these feeds into the HO as an "audience resonance score" — not truth, but engagement truth.

---

## Agent Execution Flow

```
User provides topic idea
  ↓
Hermes generates blueprint (TBP-NNN) from:
  - Existing ROs on the topic
  - HO registry (what's been tested nearby)
  - Competitor analysis (market gap)
  - Title/thumbnail prediction (expected performance)
  ↓
Blueprint saved to tantrafiles/blueprints/
  ↓
Research agent fills LOCATOR_REQUIRED claims
  ↓
Script agent writes beats per "Writing Mode by Beat"
  ↓
Asset agent downloads/locates AST-001+
  ↓
Voiceover generated from script
  ↓
FableCut timeline assembled from beats + audio + assets
  ↓
Human reviews and approves
  ↓
Video published
  ↓
Performance data collected → HO registry updated → model retrained
  ↓
Spin-off priority queue refreshed → next topic selected
```

---

## Current Bottlenecks

| Bottleneck | What's Needed | Priority |
|------------|--------------|----------|
| YouTube cookies | Export from browser → `/root/cookies.txt` | 🔴 Blocks audio pipeline |
| HO registry | Database of tested hypotheses with scores | 🟡 Not urgent |
| FableCut automation | Project JSON template from beat structure | 🟡 Not urgent |
| Post-video analytics | YouTube API queries after publishing | 🟢 Can't do until video exists |

The core insight: **the blueprint system turns production into a repeatable experiment.** Every video generates data that makes the next video better. Most channels treat each video as a standalone creative act. This system treats the whole channel as one accumulating research project.
