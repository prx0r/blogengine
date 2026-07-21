# Title & Thumbnail Analysis — Findings Summary

**Dataset:** 94 channels, 14,030 videos
**Generated:** 2026-07-21

---

## Title Patterns

### Universal Rules (apply regardless of channel size)

| Rule | Signal | Confidence |
|------|--------|------------|
| **No numbers in titles** | #1 predictor, always negative | ★★★★★ |
| **Keep it short** (< 7 words) | Negative correlation with word count | ★★★★ |
| **"The [X] Of [Y]" formula** | Consistent positive across all sizes | ★★★★ |
| **Avoid exclamation marks** | Rarely used, rarely breakout | ★★★ |

### Channel-Size Dependent Rules

| Rule | Mega (1M+) | Large | Medium | Small (<10k) |
|------|-----------|-------|--------|-------------|
| **Questions** | +5.9% ✅ | +1.6% ✅ | +1.1% ✅ | -6.2% ❌ |
| **"Why" starts** | Best question word | Best question word | Best question word | Best question word |
| **"What" starts** | Second best | Second best | Second best | Second best |

### Question Word Power Ranking

1. **Why** — 1.4x lift (35% vs 25% baseline). Most powerful hook for docs.
2. **What** — Solid performer. "What is X?" format.
3. **How** — Moderate. Works for process/explanation content.

### Duration Sweet Spot

**15-20 minutes** — consistent across ALL channel sizes. Tighter than previously thought.

---

## Key Insights for a New Channel

1. **Title:** Start with "Why" or "The [X] Of [Y]". NO numbers. Under 7 words.
2. **Duration:** 15-20 min. Not longer, not shorter.
3. **Questions:** Don't use them until you hit 100k+ subs. They hurt small channels.
4. **Thumbnails:** Designed graphic (not photo). 1-3 punchy words. Good contrast.
5. **Faces:** Neutral — don't force, don't avoid. Let the topic decide.
6. **Output:** 3-4/month. Higher frequency doesn't correlate with higher views.

---

## CLIP Analysis

Title-thumbnail alignment score:
- High > 35: Very concrete/specific title. Thumbnail clearly illustrates the subject.
- 25-35: Moderate alignment.
- Low < 25: Abstract or metaphorical title. Thumbnail doesn't literally match.

Currently running on full 14k dataset.

---

## Headline Engine Status

**Old (Upworthy):** Correlation -0.088 (anti-predictive)
**New (YouTube):** Correlation +0.235 (moderately predictive)

Retrained with actual YouTube documentary coefficients. Positive signals: questions, "What" starts, "The" starts, imperatives. Negative: numbers, colons.
