# YouTube Intelligence Pipeline — Structured Research

## Stack

| Need | Tool | Cost |
|------|------|------|
| Compute | Cloudflare Workers | Free tier |
| Cron | Workers Cron Triggers | Free |
| Database | D1 (already used) | Free tier |
| Storage | R2 | 10GB free |
| LLM analysis | DeepSeek (existing key) | ~$0.50/1M tokens |
| Thumbnail vision | DeepSeek vision or Workers AI | ~$0.50/1M tokens |
| YouTube API | quota only | Free |

**No GCP needed.** Translation API is irrelevant — YouTube API returns `defaultAudioLanguage` and `snippet.defaultLanguage` for free. Natural Language API is redundant with DeepSeek. BigQuery is overkill — D1 + R2 handles it.

---

## Research Experiment 1: Within-Channel Breakout Analysis

### Hypothesis
> Within a single channel, breakout videos differ from non-breakout videos in measurable ways across title, thumbnail, duration, and description hook. The pattern may differ by channel size.

### Why This Design
- **Control for channel**: comparing across channels is noisy (different audiences, different production). Within-channel isolates the content variables.
- **3 size tiers**: reveals whether the formula changes as a channel grows.

### Method

**Sample:**
- 3 small channels (<10k subs)
- 3 medium channels (10k-100k subs) 
- 3 large channels (>100k subs)
- All in our niche (Tantra, Kashmir Shaivism, spiritual philosophy)

**Per channel:**
- Pull latest 100 videos via `playlistItems.list` + `videos.list`
- Cost: 2 playlistItems + 2 videos.list = 4 units per channel = 36 units total

**Per video, collect:**

| Field | Source | Used For |
|-------|--------|----------|
| title | videos.list.snippet.title | Title pattern analysis |
| description (full) | videos.list.snippet.description | Hook extraction (first 200 chars) |
| tags | videos.list.snippet.tags | Topic keywords |
| duration | videos.list.contentDetails.duration | Length analysis |
| viewCount | videos.list.statistics | Breakout score computation |
| likeCount | videos.list.statistics | Engagement quality |
| commentCount | videos.list.statistics | Deep engagement |
| publishedAt | videos.list.snippet.publishedAt | Recency weighting |
| thumbnail url | videos.list.snippet.thumbnails.maxres | Vision analysis |
| channel subscriberCount | channels.list | Size tier classification |

### Computation

**Breakout score** per video within its channel:
```
breakout_ratio = viewCount / median(viewCount of channel's last 100 videos)
```

Split into two groups per channel:
- **Breakout** (top 25% by ratio)
- **Baseline** (bottom 50% by ratio)

**Title features** (local regex, 0 cost):
- Length (chars, words)
- Contains `?` (question title)
- Contains `:` (colon title)
- Starts with number
- Contains quotes
- Contains power words (secret, revealed, explained, truth, hidden)
- All-caps words count
- Emotional valence (positive/negative word list)
- First word POS (verb, question word, noun)

**Thumbnail features** (via LLM vision, ~$0.10 total for 900 thumbnails):
- Does it have text? What does it say?
- Composition type: talking head / text overlay / illustration / split
- Color palette: warm / cool / high contrast / muted
- Face present: yes/no, expression (urgent, calm, curious)
- Style: photo, illustration, 3D render, text-only
- Darkness level (dark academia vs bright)

**Description hook** (first 200 chars, via LLM, ~$0.05):
- Does it pose a question?
- Does it state a bold claim?
- Does it create curiosity gap?
- Does it use storytelling frame?

**Duration bin:**
- <5min, 5-10, 10-20, 20-40, 40+

### Output

For each channel, a comparison table:

| Variable | Breakout Avg | Baseline Avg | Diff | Signal |
|----------|-------------|--------------|------|--------|
| Title length | 54 chars | 42 chars | +12 | ? |
| Question title | 40% | 15% | +25% | strong |
| Duration | 14 min | 22 min | -8min | strong |
| Warm thumbnail | 60% | 30% | +30% | strong |
| Hook: question | 50% | 20% | +30% | strong |

**Then cross-size comparison:** do small channels need different formulas than large?

---

## Research Experiment 2: IN↔US Content Gap

### Hypothesis
> Topics that generate breakout videos in India (English language) have zero or minimal equivalent content in the US market, representing uncontested space.

### Method
1. Run same 24 queries (6 niches × 4 queries) in IN and US regions
2. Collect top 50 results per query
3. Compare: for each topic cluster, is there US content?
4. If a topic cluster shows IN breakouts but <2 US results → **gap confirmed**

**Cost:** 48 search calls (from 100/day bucket), ~100 general units for harvesting.

### Output
```
Gap Report — 2026-07-21
─────────────────────
Tantra & Kashmir Shaivism
  ├─ "Kashmir Shaivism consciousness" → IN: 4 breakouts, US: 0 breakouts  ◆ GAP
  ├─ "36 tattvas explained" → IN: 2 breakouts, US: 1 breakout  ◆ GAP
  └─ "Abhinavagupta Tantra" → IN: 0 breakouts, US: 0 breakouts  ◆ UNCONTESTED

Sufi & Illuminationist
  └─ "Henry Corbin imaginal" → IN: 0, US: 1 breakout  ◆ SATURATED
```

---

## Research Experiment 3: Title Formula Efficacy

### Hypothesis
> Certain title patterns predict breakout independent of channel size. These can be learned and applied systematically.

### Method
Aggregate across ALL videos from Experiment 1 (900 videos). Train a simple logistic regression (or just rank correlation) on:
- Features: 15 title features (above)
- Target: breakout_ratio

**Implementation:** local Python or TypeScript with simple stats. No cloud services needed.

### Output
```
Title Formula Ranking (by breakout correlation)
───────────────────────────────────────────────
1. Question title          r=0.42  "What is Spanda?"
2. Power word + colon      r=0.38  "The Secret: X"
3. Number list             r=0.31  "5 Ways to X"
4. Negative framing        r=0.27  "Why You're Wrong About X"
5. Curiosity gap           r=0.24  "The One Thing X"
...
```

---

## Research Experiment 4: Hook Library

### Hypothesis
> The first 2 lines of a video description (the hook) follow reproducible patterns that predict watch time and breakout.

### Method
For all 900 videos, extract first 200 chars of `description`. Use an LLM to classify the hook into one of:

1. **Question** — "What if everything you know about consciousness is wrong?"
2. **Bold claim** — "Tantra is not what you think it is."
3. **Story frame** — "In 10th century Kashmir, a philosopher changed everything."
4. **Promise** — "By the end of this video, you'll understand the 36 tattvas."
5. **Curiosity gap** — "There's a concept in Kashmir Shaivism that explains why..."
6. **Challenge** — "Most spiritual teachers get this one thing wrong."
7. **Direct address** — "You've been meditating wrong."

**Cost:** 900 LLM classifications × ~200 tokens = 180k tokens ≈ $0.09

### Output
```
Hook Pattern        Breakout Rate
──────────────────────────────────
Bold claim          68%
Curiosity gap       62%
Question            58%
Story frame         45%
Promise             41%
Direct address      32%
Challenge           28%
```

---

## Running the Experiments

### Initial Setup (one-time)

| Step | API Cost | Time |
|------|----------|------|
| Select 9 channels manually (from recommendations + scan data) | 0 | 30min |
| Pull 100 videos per channel | 36 units | 2 min |
| Pull full video data (stats, descriptions) | 18 units | 1 min |
| Pull channel subscriber counts | 1 unit | 1 sec |
| Run title feature extraction (local) | 0 | 5 min |
| Run thumbnail analysis (via LLM) | ~$0.10 | 10 min |
| Run hook classification (via LLM) | ~$0.09 | 10 min |
| Compile results | 0 | 5 min |

### Daily Scan (ongoing, ~15 min/day)

| Step | API Cost |
|------|----------|
| 48 niche queries (12 themes × 4, alternating IN/US) | 48 search |
| 12 velocity queries | 12 search |
| 20 gap queries (10 × 2 regions) | 20 search |
| 20 emerging topics | 20 search |
| Harvest results → videos.list | ~100 units |
| Update channel brain scan | ~400 units |
| Comment mining on top breakouts | 50 units |
| **Total** | **100 search + ~550 general** |

### Weekly

- Re-run Experiment 1 with updated data (new videos from known channels)
- Update gap report
- Update title formula ranking
- Add any new channels to CHANNEL_IDS

---

## Cloudflare Stack Details

| Need | Instead of GCP | Why |
|------|---------------|-----|
| Computation | Workers (not Cloud Functions) | Already on Cloudflare, same free tier |
| Thumbnail vision | DeepSeek/Workers AI (not Vision API) | LLM can describe thumbnails with more nuance than Vision API labels |
| Entity extraction | DeepSeek (not Natural Language API) | More flexible, cheaper, LLM understands context |
| Language detection | YouTube API `defaultAudioLanguage` (not Translation API) | Free, no translation needed — we just need to know if it's English |
| Data warehouse | D1 + R2 (not BigQuery) | D1 handles the query load; R2 for raw snapshots |
| Hook transcription | YouTube description field (not Speech-to-Text) | First 200 chars of description IS the hook for most creators. No audio processing needed. |
| Scheduling | Workers Cron Triggers | Free, native to Cloudflare |
| Storage | R2 | 10GB free, S3-compatible |
