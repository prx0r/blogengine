---
name: market-scan
description: YouTube niche market analysis — finds breakout videos, analyzes title patterns, pulls transcripts. Use to discover underserved content gaps.
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [youtube, market, research, niche, breakout]

---

# Market Scan

YouTube niche analysis engine. Finds channels and videos in a given niche, scores outliers relative to each channel's own baseline, analyzes title/thumbnail patterns, pulls transcripts for top performers.

## When to Use
- "What's trending in Kashmir Shaivism on YouTube?"
- "Find underserved niches in alchemy content"
- "Analyze the esoteric philosophy YouTube landscape"
- "What titles work best for the daimon niche?"

## How It Works

1. **Discovery phase** — search seed queries OR use provided channel IDs/handles. Search is expensive (bottleneck). Channels as seeds is cheap.
2. **Harvest phase** — pull up to 50 recent uploads via playlistItems endpoint (1 quota/call, cheap). This gives us all video IDs for each channel.
3. **Stats phase** — batch video stats (views, likes, duration, publish date) at 50 per call (1 quota/call).
4. **Analysis phase** — compute outlier scores (views ÷ channel median), title features (length, question marks, colons, all-caps), and fetch transcripts for top outliers.
5. **Output** — structured data identifying what's overperforming and why.

## Quota Budget (YouTube Data API v3)

From [Google's docs](https://developers.google.com/youtube/v3/determine_quota_cost):

| Bucket | Limit | Operations |
|--------|-------|------------|
| **search.list** | **100 calls/day** (separate bucket) | Each search call costs 1 from this bucket |
| **General pool** | **10,000 units/day** | All other endpoints share this |
| **videos.insert** | **100 calls/day** (separate bucket) | Not used by scanner |

### Per-operation costs (from general pool):

| Operation | Cost | Batches |
|-----------|------|---------|
| `channels.list` | 1 unit | 50 IDs per call |
| `videos.list` | 1 unit | 50 IDs per call |
| `playlistItems.list` | 1 unit | 50 items per call |

### Strategy: Channels as Seeds (Cheap)

The bottleneck is **search.list** — only 100 calls/day. Strategy:

1. **First run** (or adding new niches): Use search queries. Each query = 1 search call.
2. **Subsequent runs**: Populate `CHANNEL_IDS` in `scripts/market-landscape.ts`. This bypasses search entirely — just 2 units per channel (1 `channels.list` + 1 `playlistItems.list`).

Known channels cost ~2 units each to harvest. With 10,000/day general pool, you can scan 5,000 channels daily without touching search quota.

## File Locations

```
Script:        /root/projects/blog/scripts/market-landscape.ts
Client library: /root/projects/blog/src/lib/video-objects/youtube-data.ts
Env config:    /root/projects/blog/.env.local  (YOUTUBE_API_KEY)
Raw data:      /root/projects/blog/content/video-objects/market-landscape.json
Report:        /root/projects/blog/content/video-objects/market-landscape-report.md
Market data:   /root/projects/blog/data/market/
```

## Existing Market Data

The most recent scan (19 Jul 2026) found:

### Tier 1: Underserved + In Demand
1. **Sufi & Illuminationist** — 8 breakouts, zero established English players
2. **Tantra & Kashmir Shaivism** — English content almost nil, Indian-language dominates
3. **Morphic Fields & Bioelectricity** — exploding topic, few explainers

### Tier 2: High Demand
4. **Literature as Initiation** — The Odyssey breaking out in English AND Spanish
5. **Daimon / HGA** — Christian angel wing saturated, philosophical daimon empty
6. **Neoplatonism & Theurgy** — Theurgy having a moment, one competitor

### Tier 3: Saturated
7. **Alchemy Philosophy** — self-help "alchemy" saturated, historical alchemy empty
8. **Buddhist Philosophy** — Nagarjuna strong in Hindi/Bengali, English academic
9. **Consciousness & Physics** — dominated by big channels

**Spanish market signal:** "Los Significados Sagrados en la Odisea" hit 106,986 views/day from a Spanish channel — highest velocity in the scan.

## Usage

### Quick scan (default 12 themes):

```
npm run video:landscape
```

Runs the standard 12-theme scan defined in `scripts/market-landscape.ts`. 
- With `CHANNEL_IDS` populated: ~0 search calls, ~2 units per channel
- Without `CHANNEL_IDS`: 48 search calls (4 per theme), ~1,800 quota

### Custom region scan:

```
npx tsx scripts/market-by-region.ts
```

Supported regions: ES, MX, AR, CO, CL, IN, US.

### Adding new channels:

1. Get the channel ID from YouTube (the `UC...` part in the About page)
2. Add it to `CHANNEL_IDS` array in `scripts/market-landscape.ts`
3. Next scan includes their recent 50 uploads in the breakout analysis
4. Cost: 2 units per channel (negligible)

### Targeting Indian creators making English content:

Many channels discovered in Tier 1 (Tantra, Buddhist Philosophy) are Indian-language dominant. To find Indian creators making similar content IN English:

1. Search queries already use `relevanceLanguage: "en"` + `regionCode: "US"`
2. For focused analysis, add specific Indian English-language channels to `CHANNEL_IDS`
3. Run `market-by-region.ts` with `regionCode: "IN"` to see what's trending in India

## Quota Tracking

| Date | Searches Used | General Used | Notes |
|------|--------------|--------------|-------|
| 2026-07-19 | 48 | ~1,800 | First full 12-theme scan |
| 2026-07-21 | 0 | ~2 | Added @Adhyatmiksutra-f9w as known channel |

## Prompt Template

To run a targeted scan:

```
Run a YouTube market scan for [niche/topic]. 
Use queries: ["query 1", "query 2", "query 3"]
Also check channels: [@channelHandle1, @channelHandle2]
Region: [US/ES/IN]
Return the breakout videos, their outlier scores, and title patterns.
```
