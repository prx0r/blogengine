# Hermes Knowledge Reference — Complete Guide

This is the single entry point for any agent to understand all available data, how to query it, and when to use each piece.

---

## Quick Start

```bash
# Full overview (start here)
python3 scripts/engines/hermes_knowledge.py --summarize

# Rules for content production
python3 scripts/engines/hermes_knowledge.py --rules
```

---

## 1. Topic Keyword Analysis

**What:** Breakout rate for any keyword across 15,735 videos, with channel-control.

**Query:**
```bash
python3 scripts/engines/hermes_knowledge.py --topic kundalini
```

**Returns:** occurrences, channels, breakout_rate, lift, avg_views

**Use when:** Deciding whether to include a specific term (deity, practice, concept) in a title.

**Example decision:** "kundalini" has 2.21x lift across 6 channels. Use it. "meditation" has 0.8x lift across 27 channels. Avoid it.

**Data source:** Live query across all `analysis_*.json` files.

---

## 2. Channel Data

**What:** Per-channel stats (subs, median views, breakout rate, duration).

**Query:**
```bash
python3 scripts/engines/hermes_knowledge.py --channel ESOTERICA
python3 scripts/engines/hermes_knowledge.py --channel "Let's Talk Religion"
```

**Returns:** subs, median_views, breakout_rate, videos_analyzed

**Use when:** Understanding competitor benchmarks, deciding what format/style to emulate.

**Raw data:** `data/research/layer2/analysis_{channel}.json` — full video list with titles, views, duration, breakout status.

---

## 3. Production Rules

**What:** Verified content production rules with evidence.

**Query:**
```bash
python3 scripts/engines/hermes_knowledge.py --rules
```

**Returns:** 8 rules with evidence and direction.

**Use when:** Generating any new content. These are the closest thing we have to validated guidelines.

---

## 4. Best Niche Opportunities

**What:** Highest breakout-rate sub-niches across 8 categories.

**Query:**
```bash
python3 scripts/engines/hermes_knowledge.py --best-niches 10
```

**Returns:** Niche name, breakout rate, category, video count.

**Use when:** Deciding which topic to produce next. Prioritize niches with high breakout AND low competition.

---

## 5. Framing Words

**What:** Emotional framing words ranked by breakout lift.

**Query:**
```bash
python3 scripts/engines/hermes_knowledge.py --framing-words
```

**Returns:** Word, lift, count, usage note.

**Use when:** Crafting title hooks. "bizarre" (2.6x) > "forgotten" (2.0x) > "forbidden" (1.9x) > "dark" (1.5x).

---

## 6. Title Pattern Scoring

**What:** Predict breakout pattern score for any title.

**Query:**
```bash
python3 scripts/engines/predict_views.py "Who was Abhinavagupta?"
python3 scripts/engines/predict_views.py --batch titles.txt
```

**Returns:** Pattern score (not validated probability), baseline rate, holdout AUC.

**Use when:** Comparing multiple candidate titles. Higher score = better fit with observed patterns.

**Limitation:** In-sample only. Not validated on held-out channels. See AUDIT-FLAWS.md.

---

## 7. Headline Engine v2

**What:** Title scoring recalibrated for YouTube documentary.

**Query:**
```bash
python3 scripts/engines/headline_score.py "Who was Abhinavagupta?"
```

**Returns:** Score, feature breakdown with YouTube coefficients.

**Use when:** Quick title quality check. Correlation +0.235 — directionally useful but not precise.

---

## 8. Niche Taxonomy

**What:** Classify any title into 22+ topic categories.

**Query:**
```bash
python3 scripts/engines/topic_taxonomy.py
```

**Returns:** Breakout rates per category, hidden niche discovery.

**Use when:** Understanding which broad topics to prioritize.

---

## 9. Niche Deep Dive

**What:** 80+ sub-niches with channel-control skew detection.

**Query:**
```bash
python3 scripts/engines/niche_deep_dive.py
```

**Returns:** Per-niche breakout rates, lift, dominant channel, skew warning.

**Use when:** Deep content planning. Avoid skewed niches where one channel inflates the numbers.

---

## 10. Raw Data Files

| File | Content | Best For |
|------|---------|----------|
| `data/hermes-knowledge.json` | All structured findings in one JSON | Programmatic access by Hermes |
| `data/research/layer2/analysis_*.json` | Per-channel video data | Custom queries, video mining |
| `data/research/layer2/thumbnails-data.json` | 1,879 Vision API thumbnails | Thumbnail analysis (13% coverage) |
| `data/research/layer2/niche-breakout-rates.json` | 80+ sub-niche breakout rates | Content planning |
| `data/research/layer2/channel-directory.json` | 149 channels with tiers | Competitive landscape |
| `data/research/layer2/findings-summary.md` | Human-readable findings | Quick reading |
| `data/research/layer2/AUDIT-FLAWS.md` | 12 known limitations | Understanding caveats |
| `operations/content-production-spec.md` | 4-channel brand architecture | Channel strategy |
| `operations/channel-profiles.md` | Color schemes, writing styles | Brand consistency |

---

## When to Use What

| Task | Tool |
|------|------|
| "Is this topic worth covering?" | `hermes_knowledge.py --topic [keyword]` |
| "What title should I use?" | `predict_views.py` + `headline_score.py` |
| "What framing word works best?" | `hermes_knowledge.py --framing-words` |
| "What niche has the most opportunity?" | `hermes_knowledge.py --best-niches` |
| "What's our production spec?" | `hermes_knowledge.py --rules` |
| "How does this channel compare?" | `hermes_knowledge.py --channel [name]` |
| "What's the competitive landscape?" | `channel-directory.json` |
| "I need video source material" | `analysis_tantra_*.json` (lecture channels) |
| "What are the known flaws?" | `AUDIT-FLAWS.md` |

---

## Status Summary

| Component | Status | ROC-AUC | Coverage |
|-----------|--------|---------|----------|
| Title pattern XGBoost | ✅ Trained | 0.747 | 15,735 videos |
| Headline Engine v2 | ✅ YouTube coeffs | +0.235 corr | 15,735 videos |
| Topic taxonomy | ✅ 22 categories | — | 15,735 videos |
| Niche deep dive | ✅ 80+ sub-niches, skew-corrected | — | 15,735 videos |
| Channel analysis | ✅ 149 channels | — | 19,290 videos |
| Hermes knowledge base | ✅ Structured JSON | — | All findings |
| Thumbnail Vision API | 🟡 Partial | — | 1,879 / 19,290 |
| CLIP alignment | 🟡 Sample only | — | 500 videos |
| Out-of-sample validation | ❌ Not done | — | — |
| Channel-controlled topic analysis | ✅ Done | — | Applied to all keywords |

**Bottom line for Hermes:** Read `data/hermes-knowledge.json` for the full structured picture. Query with `hermes_knowledge.py` for live data. Follow the rules from `--rules`. Check `AUDIT-FLAWS.md` before acting confidently on any finding.
