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

1. **Discovery phase** — search seed queries OR use provided channel IDs/handles. This is the expensive step (100 quota per search). Best to reuse known channels after the first run.
2. **Harvest phase** — pull up to 1 year of uploads via playlistItems endpoint (1 quota/call, cheap). This gives us all video IDs for each channel.
3. **Stats phase** — batch video stats (views, likes, duration, publish date) at 50 per call (1 quota/call).
4. **Analysis phase** — compute outlier scores (views ÷ channel median), title features (length, question marks, colons, all-caps), and fetch transcripts for top outliers.
5. **Output** — structured data identifying what's overperforming and why.

## Quota Budget

| Operation | Cost | Budget for 10,000/day |
|-----------|------|----------------------|
| search.list | 100/call | ~90 searches |
| channels.list | 1/call (batch 50) | 10,000 batches |
| videos.list | 1/call (batch 50) | 10,000 batches |
| playlistItems.list | 1/call | 10,000 calls |

**Strategy:** Use searches sparingly. Harvest channel IDs from the first run, then hardcode them for future runs.

## File Locations

```
Script:        /root/projects/blog/scripts/market-landscape.ts
Client library: /root/projects/blog/src/lib/video-objects/youtube-data.ts
Env config:    /root/projects/blog/.env.local  (YOUTUBE_API_KEY)
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

Full report at `content/video-objects/market-landscape-report.md`.
Raw data at `content/video-objects/market-landscape.json`.

## Usage

### Quick scan with known channels (cheap — no search quota):

```
npm run video:landscape
```

This runs the standard 12-theme scan defined in `scripts/market-landscape.ts`. It searches 4 queries per theme (48 total searches = 4800 quota). For repeat runs, add channel IDs to the `CHANNEL_IDS` array to skip searches entirely.

### Custom region scan:

Uncomment region codes in `scripts/market-by-region.ts` and run:

```
npx tsx scripts/market-by-region.ts
```

Supported regions: ES, MX, AR, CO, CL, IN, US.

### Adding new channels:

Find a channel's ID via their YouTube page URL (the `UC...` part) and add it to `CHANNEL_IDS`. This skips search entirely and goes straight to harvest.

## Prompt Template

To run a targeted scan:

```
Run a YouTube market scan for [niche/topic]. 
Use queries: ["query 1", "query 2", "query 3"]
Also check channels: [@channelHandle1, @channelHandle2]
Region: [US/ES/IN]
Return the breakout videos, their outlier scores, and title patterns.
```
