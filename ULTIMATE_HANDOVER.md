# Ultimate Handover — Re-Rendering Atlas

## Project Identity
A **research laboratory disguised as a media company**. Systematically identifies intellectually underserved topics (esoteric philosophy, Tantra, consciousness, Western esotericism) and produces documentaries. The bottleneck is human voiceover recording (~2 hrs/week).

---

## Quick Start for New Agents

Read in order:
1. `ULTIMATE_HANDOVER.md` — This file
2. `operations/agent-guide.md` — Unwritten rules, mistakes to avoid
3. `data/HERMES-KNOWLEDGE-REFERENCE.md` — Complete knowledge system guide
4. `HIGH-SIGNAL-RESULTS.md` — Verified findings with caveats
5. `data/research/layer2/AUDIT-FLAWS.md` — 12 known limitations
6. `operations/content-farm-infrastructure.md` — Production pipeline architecture
7. `operations/channel-profiles.md` — 5-channel brand architecture

---

## What's Been Built

### Data Layer
- **149 channels analyzed**, ~19,000 videos with video_id, title, views, duration, breakout status
- **22 tantra source channels**, 3,555 videos (lecture content for repurposing)
- **XGBoost breakout predictor** — 0.747 ROC-AUC on 15,735 videos
- **Headline Engine v2** — YouTube-calibrated (+0.235 correlation), Upworthy priors DON'T transfer
- **CLIP title-thumbnail alignment** — sample scored, measures title specificity
- **1,879 thumbnails** via Google Cloud Vision API (labels, colors, faces, text)
- **80+ sub-niches** with channel-control skew detection
- **Framing word analysis** — "bizarre" (2.6x), "forgotten" (2.0x), "forbidden" (1.9x)
- **Niche breakout rates** across 8 groups (grimoires, theurgy, neoplatonism, hermeticism, etc.)
- **Reddit translation gap clusters** — 129 clusters, fixed collapse (98.5% → 9.8%)

### Knowledge Systems
- `data/hermes-knowledge.json` — All findings in machine-readable JSON
- `scripts/engines/hermes_knowledge.py` — Query interface (--topic, --channel, --rules, --best-niches)
- `data/HERMES-KNOWLEDGE-REFERENCE.md` — Complete query guide
- `scripts/engines/predict_views.py` — Title pattern scorer (train/test split, reports holdout AUC)
- `scripts/engines/headline_score.py` — YouTube-recalibrated title scoring
- `scripts/engines/topic_taxonomy.py` — 22-category classifier + hidden niche finder
- `scripts/engines/niche_deep_dive.py` — 80+ sub-niches with channel-control

### Production Systems
- **Blueprint system** — Standardised production spec per video (TBP-NNN)
- **TBP-000-TEMPLATE.md** — Blueprint template with data-driven predictions
- **TBP-026: Yogini Temples** — Completed blueprint
- **TBP-033: Kumari (Living Goddess)** — Completed blueprint
- **5-channel architecture** with full brand profiles:
  - Tantra Files (saffron/gold, warm scholarly)
  - Ochema (dark/cyan, technical occult)
  - Angeliz (crimson/cream, poetic imaginal)
  - Pramāṇa (white/charcoal, minimal logic)
  - Intelligent Others (cosmic green, science frontier)
- `operations/content-farm-infrastructure.md` — Agnostic production pipeline spec
- `operations/channel-profiles.md` — Color schemes, writing styles, content filters

### Strategic Documents
- `HIGH-SIGNAL-RESULTS.md` — Verified findings with file references
- `data/research/layer2/AUDIT-FLAWS.md` — 12 known limitations
- `data/research/layer2/findings-summary.md` — Compiled findings
- `refinement.md` — Hypothesis → probe → validate → refine process

---

## Key Findings (Validated)

| Finding | Signal | File |
|---------|--------|------|
| Numbers in titles HURT | #1 XGBoost feature (0.169) | `findings-summary.md` |
| 15-20 min sweet spot | Consistent across ALL channel sizes | `findings-summary.md` |
| Biography format = 1.5x lift | 317 videos, 39% breakout | `topic_taxonomy.py` |
| Questions HELP (over 100k subs) | +5.9% mega, -6.2% small | `findings-summary.md` |
| "What starts outperform | XGBoost importance 0.118 | `niche_deep_dive.py` |
| Faces are NEUTRAL | XGBoost importance 0.000 | `thumbnail-analysis-crosschannel.json` |
| Designed graphics > photos | "Animation" +7%, "Graphics" +6% | `thumbnails-analysis-summary.json` |
| Headline Engine v2: +0.235 | Was -0.088 (Upworthy was wrong) | `headline_score.py` |
| Thumbnails: 6 words avg (breakout) vs 21 (normal) | Within-channel ESOTERICA | `analysis_esoterica.json` |

---

## Verified Content Formula

```
Topic: Biography of [Figure] from [Tradition]
Title: "Who was [Figure]? [Hook]" — OR — "The [Forgotten/Ancient] [Aspect] Of [Topic]"
Duration: 15-20 minutes
Thumbnail: Designed graphic, 1-3 word text overlay
Avoid: Numbers, generic practices (meditation/divination), "hidden" framing
```

---

## Channel Blueprints

| Channel | Vibe | First Video | Output |
|---------|------|-------------|--------|
| Tantra Files | Warm, scholarly awe | "Who was Abhinavagupta?" | 3-4/mo |
| Ochema | Technical occult | "The Key of Solomon" | 3-4/mo |
| Angeliz | Poetic, imaginal | "The Celestial Hierarchy" | 2-3/mo |
| Pramāṇa | Minimal logic | "Pramāṇa: Valid Knowledge" | 2/mo |
| Intelligent Others | Science frontier | "Michael Levin" | 2-3/mo |

---

## Critical Path

1. **Export YouTube cookies** → `/root/cookies.txt` — unlocks audio extraction from 687 lectures
2. **First video** — "Who was Abhinavagupta?" for Tantra Files
3. **FableCut bridge** — beat structure → project JSON automation
4. **HO registry** — track tested hypotheses

---

## Running Processes

| Process | Schedule | Status |
|---------|----------|--------|
| Hermes v0.18.2 gateway | systemd service | Running |
| FableCut MCP server | systemd service | Running |
| Market scan (75 channels) | Daily | Running |
| Thumbnail Vision API | Background batch | 🟡 1,879/19,000 done |

---

## Resource Constraints

- **RAM**: 4 GB total
- **CPU**: 2 cores
- **Disk**: 75 GB main (9.7 GB free), 22 GB volume (21 GB free, Docker + models)
- **YouTube API**: 10k units/day + 100 search calls/day
- **Vision API**: Pay-per-use (~$0.80 for 528 images)
- Keep operations resource-light: no parallel builds, no heavy inference

---

## Key File Index

| File | Purpose |
|------|---------|
| `data/HERMES-KNOWLEDGE-REFERENCE.md` | **START HERE** — complete query guide |
| `data/hermes-knowledge.json` | Machine-readable knowledge base |
| `scripts/engines/hermes_knowledge.py` | Query interface (--topic, --channel, --rules) |
| `data/research/layer2/` | 149+ channel analysis files |
| `data/research/layer2/thumbnails-data.json` | Vision API thumbnail data |
| `data/research/layer2/niche-breakout-rates.json` | 80+ sub-niche breakout rates |
| `data/research/layer2/AUDIT-FLAWS.md` | Known limitations |
| `tantrafiles/blueprints/` | Production blueprints (TBP-NNN) |
| `scripts/engines/` | All prediction and analysis scripts |
| `operations/channel-profiles.md` | 5-channel brand architecture |
| `operations/content-farm-infrastructure.md` | Production pipeline spec |
| `HIGH-SIGNAL-RESULTS.md` | Verified findings |
| `refinement.md` | Validation protocol |
| `AUDIT-FLAWS.md` in `data/research/layer2/` | Model and data limitations |

---

## Rules for Agents

- Put credentials in session env vars, NEVER in files
- Every claim needs a falsification condition
- Document null results — they're as valuable as positive ones
- When stuck, run an experiment (faster than architecture debates)
- Prefer finding over building; one clear finding > ten architecture documents
- Read `operations/agent-guide.md` for the full set of rules
- Check `AUDIT-FLAWS.md` before acting confidently on any finding

---

*This is a living document. Add to it as new context emerges.*
