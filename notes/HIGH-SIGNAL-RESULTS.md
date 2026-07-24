# High-Signal Results — 2026-07-21

94 channels analyzed, 14,030 videos, 1,879 thumbnails via Vision API.
CLIP + XGBoost models trained on full dataset.

---

## 1. Title Patterns

| Finding | Signal Strength | Method | Source |
|---------|----------------|--------|--------|
| **Numbers in titles HURT performance** | #1 predictor, -9% delta | XGBoost feature importance (0.162) | `predict_views.py`, `findings-summary.md` |
| **Questions HELP for channels >100k subs** | +5.9% for mega, -6.2% for small | Channel-size stratified analysis | `findings-summary.md` |
| **"Why" is the best question word** | 1.4x lift (35% vs 25% baseline) | Keyword breakout rate on 425 "Why" titles | `findings-summary.md` |
| **"The [X] Of [Y]" formula works** | +4-9% across all channel sizes | XGBoost importance 0.097 | `findings-summary.md` |
| **15-20 min duration sweet spot** | Consistent across ALL channel sizes | Duration bucket analysis | `findings-summary.md` |

**Key file:** `scripts/engines/predict_views.py` — title-only breakout predictor
**Key file:** `scripts/engines/headline_score.py` — retrained with YouTube coefficients

---

## 2. Thumbnail Patterns

| Finding | Signal | Method | Source |
|---------|--------|--------|--------|
| **Text on thumbnail → 1-3 designed words** | Breakout: 6 words avg (ESOTERICA within-channel) | Vision API text detection | `analysis_esoterica.json`, `thumbnail-analysis-crosschannel.json` |
| **Faces are NEUTRAL** | 0.000 XGBoost importance. Varies by channel style. | XGBoost, per-channel face analysis | `thumbnail-analysis-crosschannel.json` |
| **Designed graphics > photos** | "Animation" +7%, "Graphics" +6% on breakout | Vision API label comparison | `thumbnails-analysis-summary.json` |
| **Books/publications underperform** | -10% on thumbnail | Vision API label delta | `thumbnails-analysis-summary.json` |

**Key file:** `data/research/layer2/thumbnails-data.json` — 1,879 thumbnails with Vision labels
**Caveat:** Only 13% of dataset has thumbnail analysis (1,879/14,030). See `AUDIT-FLAWS.md`.

---

## 3. Topic Performance (What to Cover)

| Niche | Breakout Rate | Lift | Confidence | Source |
|-------|---------------|------|-----------|--------|
| **Biography / Life Story** | 36% | 1.5x 🔥 | High (410 videos) | `topic_taxonomy.py` |
| **Neoplatonism** | 31% | 1.3x 🔥 | High (517 videos) | `topic_taxonomy.py` |
| **Kashmir Shaivism** | 31% | 1.2x 🔥 | Medium (146 videos) | `topic_taxonomy.py` |
| **Chaos Magic** | 50-62% | 2.0x 🔥 | Low (13-38 videos, exploratory) | `topic_taxonomy.py` |
| **Theurgy** | 31-40% | 1.4x 🔥 | Low (30-39 videos) | `topic_taxonomy.py` |
| **Enochian** | 45-46% | 1.7x 🔥 | Low (22 videos) | `topic_taxonomy.py` |

**Key file:** `scripts/engines/topic_taxonomy.py` — reusable taxonomy + CLIP classification

---

## 4. Key Figures That Perform

| Figure | Breakout Rate | Sample | Source |
|--------|---------------|--------|--------|
| **Anandamayi Ma** | 62% | 21 videos | `topic_taxonomy.py` |
| **Abhinavagupta** | 43% | 7 videos | `topic_taxonomy.py` |
| **Crowley** | 47% | 30 videos | `topic_taxonomy.py` |
| **Nietzsche** | 38% | 174 videos | `topic_taxonomy.py` |
| **Ramana Maharshi** | 39% | 44 videos | `topic_taxonomy.py` |
| **Lakshmanjoo** | 36% | 14 videos | `topic_taxonomy.py` |

---

## 5. Headline Engine v2 — YouTube Recalibration

| Metric | Old (Upworthy) | New (YouTube) |
|--------|---------------|---------------|
| Correlation with breakout | -0.088 (anti-predictive) | **+0.235** (moderately predictive) |
| Questions | Said LOSE | Actually WIN for big channels |
| Numbers | Said WIN | Actually LOSE (strongest signal) |
| Training data | 32k Facebook headlines (2013) | 14k YouTube documentary titles |

**Key file:** `scripts/engines/headline_score.py`

---

## 6. Cross-Channel Benchmark (ESOTERICA vs Asangoham)

| | ESOTERICA | Asangoham |
|---|-----------|-----------|
| Subs | 1.1M | 355k |
| Winning title formula | "What/How questions" (+34% breakout) | "'The [X] Of [Y]'" (+24% breakout) |
| Duration | 38 min | 18 min |
| Output | 6.9/mo | 2.4/mo |
| Breakout rate | 32% | 30% |

**Key file:** `data/research/layer2/channel-deep-analysis.json`
**Key file:** `data/research/layer2/analysis_esoterica.json`, `analysis_asangoham.json`

---

## 7. Competitor Landscape — White Space

**No English documentary channel dedicated to:** Tantra, Kashmir Shaivism, Neoplatonism, or Western esotericism at production quality.

Closest: ESOTERICA (covers esotericism broadly but not tantra), Vimarsha Foundation (8.6k subs, only Kashmir Shaivism channel, 24% breakout rate).

**Key file:** `data/research/layer2/channel-directory.json`

---

## 8. Reddit — Translation Gap Opportunities

| Cluster | Size | Specialist → Mass Score |
|---------|------|------------------------|
| Kundalini/Chakras | 81 posts | 0.87 (highest opportunity) |
| Consciousness/Reality | 111 posts | 0.82 |
| Death/Soul | 107 posts | 0.78 |

**Key file:** `data/research/reddit/opportunity-analysis.json`
**Key file:** `data/research/reddit/clusters-v2.json` (129 clusters, collapse fixed)

---

## Recommended Content Formula

```
Topic: Biography of [Figure] from [Tradition]
Title: "Who was [Figure]? [Provocative Subtitle]"
  — OR — "The [Secret/Ancient/Unknown] [Aspect] Of [Topic]"
Duration: 15-20 minutes
Thumbnail: Designed graphic, 1-3 word text overlay, no faces unless channel style demands it
Output: 3-4 videos/month
Avoid: Numbers in titles, generic practices (meditation/divination), uncategorized topics
```

For a first video: **"Who was Abhinavagupta? The Forgotten Genius of Kashmir Shaivism"** hits biography (+1.5x), Kashmir Shaivism (+1.2x), figure (+43%), and has zero direct competition.
