# YouTube Intelligence Pipeline — Hypothesis-Driven Research

## Stack

| Need | Tool | Cost |
|------|------|------|
| Compute | Cloudflare Workers | Free |
| Cron | Workers Cron Triggers | Free |
| Database | D1 | Free |
| Storage | R2 | 10GB free |
| LLM analysis | DeepSeek (existing key) | ~$0.50/1M tokens |
| Thumbnail vision | DeepSeek via same key | Same rate |
| Captions | youtubetranscript.com (third-party) | Free |
| YouTube API | Quota only | Free |

No GCP needed. YouTube API defaultAudioLanguage is free. DeepSeek replaces Natural Language API. D1 + R2 replaces BigQuery. youtubetranscript.com replaces Speech-to-Text at zero cost.

---

## Experiment 1: Within-Channel Breakout Analysis

### Critical Flaws in V1 and Fixes

| Problem | V1 Approach | Fixed |
|---------|-------------|-------|
| Time confound | views / channel median ignores video age | views_per_day within fixed 12-month window, age-bucket before ranking |
| Sample selection | last 100 or top 100 is biased | ALL uploads in last 12 months, ranked by views_per_day |
| Sample size | 3 per tier is noise | 10 channels per tier (30 total) or label as exploratory |
| Correlation vs causation | Claims formula | Frame as associations, acknowledge YouTube algorithm as mechanism |
| Hook proxy | Description first 200 chars is SEO boilerplate | Actual transcript first 15 seconds via captions API on subset (5 breakout + 5 baseline per channel = 300 total) |
| Ground truth | None | 50 hand-checked samples vs LLM output, report agreement rate |
| Cost estimate | Guessed | Run 10 real calls first, extrapolate |

### Design

**Sample:** 30 channels across 3 size tiers (10 each):
- Small: 1k-10k subs
- Medium: 10k-100k subs
- Large: 100k-1M subs
- All in Tantra / Kashmir Shaivism / spiritual philosophy

Channels curated from your recommendations + existing scan data. Not random — you hand-pick relevant channels.

**Per channel:** Pull ALL uploads from last 12 months via playlistItems.list + videos.list. The fixed 12-month window eliminates the age confound: every video in the pool has had the same maximum time to accumulate views. Ranking by views_per_day within this window is clean.

**Cost:** 30 channels x 2 calls = 60 units. One-time.

### Per-Video Variables Collected

| Variable | Source | Cost |
|----------|--------|------|
| Title | YouTube API snippet | Free |
| Description | YouTube API snippet | Free |
| Tags | YouTube API snippet | Free |
| Duration | YouTube API contentDetails | Free |
| viewCount, likeCount, commentCount | YouTube API statistics | Free |
| publishedAt | YouTube API snippet | Free |
| Thumbnail URL | YouTube API snippet | Free |
| defaultAudioLanguage | YouTube API snippet | Free (confirms English) |
| Transcript first 15s | youtubetranscript.com | Free (quota-free, third-party) |
| Thumbnail content analysis | DeepSeek vision call | ~$0.0005/image validated |

### Analysis

For each channel, split videos into quartiles by views_per_day:
- Breakout: top quartile
- Baseline: bottom half
- Discard middle 25% to create contrast

**Title features** (local code, zero cost):
- Length in chars and words
- Contains question mark
- Contains colon
- Starts with a digit
- Power word count (dictionary: secret, revealed, explained, hidden, truth, why, how, every, ultimate, essential)
- Emotional words (positive/negative lists)
- Curiosity gap indicator (starts with the, contains this is why, the reason)
- Direct address (contains you, your, youre)

**Thumbnail features** (DeepSeek vision, validate first):
- Has text and what does it say
- Composition type: talking head, text overlay, split, illustration, photo, mixed
- Color temperature: warm, cool, neutral, high contrast
- Face present and expression: urgent, curious, calm, serious, surprised, neutral
- Style: photographic, 3D render, 2D illustration, text-only, collage
- Brightness: dark, medium, bright

**Duration:** Buckets under 5, 5-10, 10-20, 20-40, 40+ minutes.

**Hook from transcript** (subset of 300 videos, via youtubetranscript.com then LLM):
Classify first 100 words into: bold claim, question, story frame, promise, curiosity gap, direct address, context setting.

### Required Validation Step

Before trusting any LLM output:
1. Have the LLM classify 50 random thumbnails and 50 random hook transcripts
2. Hand-classify the same 100 items
3. Compute agreement rate
4. If below 80%, refine prompts and retest
5. Report agreement rate in output alongside results

---

## Experiment 2: IN-GreaterThanUS Gap Map

### V1 Problems and Fixes

| Problem | Fix |
|---------|-----|
| Same English query in IN vs US measures search result differences, not content gaps | Two-step: (1) Find IN channels making English content. (2) Check if their TOPIC has US equivalents |
| Zero US results could mean no demand or non-transferable topic | Plausibility filter: topic must be a universal philosophical concept |
| 3 breakouts in IN, 0 in US is noisy | Require 5+ IN breakouts AND 0 US results, then manual review |

### Design

Step 1: Scan IN region with 12 themes x 4 queries (48 searches). For each result, read defaultAudioLanguage. Keep only videos where audio is English.

Step 2: For each English-language IN breakout, extract the core topic from tags plus title. Search for that exact topic in US region.

Step 3: Flag topics where 5+ IN English breakouts exist, 0 US breakouts exist, and the topic passes plausibility check.

**Cost:** 48 search calls (IN) + variable US searches = about 70 from daily 100 budget.

---

## Experiment 3: Title Association Ranking

### Design

Aggregate across all 30 channels. For each video, compute 15 title features. For each feature, compute Spearman rank correlation with views_per_day.

**Framing for every result:** X is associated with Y, controlling for channel. Not X causes Y. The association may be driven by YouTube's algorithm rewarding early CTR or session duration, which themselves correlate with these features.

---

## Experiment 4: Duration-Performance Per Niche

### Design

Take the same 3,000 videos. For each niche cluster (tantra, neoplatonism, sufi, etc.), compute mean breakout ratio per duration bucket. Report as:

```
Tantra: 10-20 min videos break out 2.1x more than 40+ min within same channel
Neoplatonism: 20-40 min videos break out 1.3x more than under 10
```

---

## Daily Scan (ongoing)

After initial experiments are done, the daily maintenance scan costs:

| Task | Calls | Notes |
|------|-------|-------|
| 48 niche queries (12 themes x 4, alternating IN/US) | 48 search | Core pulse |
| 12 velocity queries (1 per theme, last 7 days) | 12 search | Catching fresh uploads |
| 20 gap queries (10 x 2 regions) | 20 search | Updating gap map |
| 20 emerging topics | 20 search | Rotating fresh queries |
| Harvest results | ~100 general | videos.list on search results |
| Channel brain scan for 200 known channels | ~400 general | playlistItems + videos.list |
| Comment mining on top breakouts | ~50 general | commentThreads.list |
| **Total** | **100 search + 550 general** | |

---

## Cost Breakdown (Verified)

Run 10 actual LLM calls first to confirm. Estimated from DeepSeek current pricing:

| Task | Items | Tokens per Item | Total Tokens | Estimated Cost |
|------|-------|-----------------|-------------|----------------|
| Thumbnail classification | 3,000 | ~500 | 1.5M | ~$0.75 |
| Hook transcript classification | 300 | ~300 | 90k | ~$0.05 |
| Total one-time | | | | **~$0.80** |

Daily scan adds negligible LLM cost (only for new breakout analysis). The entire system runs on YouTube free quota plus pocket change for DeepSeek.
