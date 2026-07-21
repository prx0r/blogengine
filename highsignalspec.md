# High-Signal Intelligence Spec

> **Pipeline reference:** See `data/README.md` for standardized methodology, verification gates, API tracking, and output schema. Every data report produced by this pipeline follows the format specified there.
>
> **Quick start:** `npm run data:underserved-test` (Stage 1), then `python3 scripts/validate-data-report.py data/reports/<report>.json`

## Methodology — Within-Niche Breakout Analysis

### Thesis
English-language tantra/tantric-philosophy documentary channels exist on YouTube, but their content does not reach Western audiences despite measurable search demand. The gap can be measured and exploited via a structured feature pipeline.

### 1. Underserved-Claim Check (do this first, cheap)

**Question:** Is "not getting pushed to Western audiences" actually true?

**Proxies:**
- Compare video rank for identical English queries across `regionCode=US` and `regionCode=IN` with `relevanceLanguage=en`. A video ranking top-10 in IN but buried or absent in US for the same query is evidence of the gap.
- Google Trends: search interest for core topic terms split by US/UK vs India. High search volume in US/UK + low English supply = actual gap.
- Sample comments on breakout videos: rough-classify apparent geography/language of commenters via LLM. Sanity check.

Kills or confirms thesis in half a day.

### 2. Channel Selection

| Criteria | Detail |
|----------|--------|
| Language | English spoken or subtitled |
| Format | Documentary/teaching, not vlog/reaction/shorts |
| Source material | India-based or India-focused |
| Maturity | Min 20-30 videos (hits AND misses) |
| Total | 20-40 channels, all sizes |

Size is a feature in the model, not a split bucket. Running channel size as a continuous variable lets the model learn whether small channels need different things than large ones, rather than forcing an arbitrary tier boundary.

### 3. Breakout Metric

```
breakout_score = (views / days_since_published) / channel_median_views_per_day
```

Age-normalized. Top 25% = breakout, bottom 50% = baseline. Middle 25% discarded to create contrast.

### 4. Sampling

Pull every video per channel (full population). If a channel has 40 videos, use all 40. If a channel has 500, pull all via pagination — do not select on the outcome by taking "top 100."

### 5. Hook Extraction

YouTube captions API (timedtext, free quota not general pool):
- Pull auto-caption transcript for each video
- Extract opening ~150 words (first 15-20 seconds spoken)
- Classify hook type via LLM: bold claim, question, story frame, promise, curiosity gap, direct address, context setting

Descriptions are SEO/link boilerplate. The spoken hook is the signal that correlates with retention.

### 6. Tantra-Specific Topic Gap Map

Cluster topics within tantra content itself:

| Cluster | Example Queries |
|---------|----------------|
| Kundalini | kundalini awakening, kundalini science, kundalini dangers |
| Chakra systems | chakra explained, chakra science, chakra psychology |
| Tantric sexuality | tantra sex misconceptions, kaula ritual, five ms |
| Historical/textual | tantraloka analysis, abhinavagupta, specific tantras |
| Left vs right path | vamachara, dakshinachara, transgressive ritual |
| Deity-specific | kali, bhairava, chinnamasta, dhumatavi, bagalamukhi |
| Myth/story teaching | tantric parables, yogini stories, siddha tales |
| Death/cremation | cremation ground, aghori, kapalika, vetala |
| Black magic | marana, stambhana, abhicara, six acts |
| Philosophy | kashmir shaivism, spanda, pratyabhijna, tattvas |

For each cluster:
- Count of breakout videos in IN-region results
- Count of English-language equivalents in US/UK results
- Google Trends search volume for cluster terms in US/UK

Clusters with high IN breakout density + high US/UK search interest + near-zero US/UK supply = ranked content roadmap.

### 7. Feature Store Schema

Every video is one row. Feed this into a model later.

```
channel_id              TEXT
channel_subs            INTEGER
video_age_days          INTEGER
breakout_score          FLOAT
is_breakout             BOOLEAN
duration_seconds        INTEGER
title_length            INTEGER
title_has_question      BOOLEAN
title_has_colon         BOOLEAN
title_starts_number     BOOLEAN
title_power_words       INTEGER
title_curiosity_gap     BOOLEAN
title_direct_address    BOOLEAN
thumbnail_has_text      BOOLEAN
thumbnail_composition   TEXT     -- talking_head, text_overlay, illustration, etc
thumbnail_warmth        TEXT     -- warm, cool, neutral, high_contrast
thumbnail_has_face      BOOLEAN
thumbnail_expression    TEXT     -- urgent, curious, calm, serious, surprised
thumbnail_style         TEXT     -- photographic, 3d_render, 2d_illustration, text_only
thumbnail_brightness    TEXT     -- dark, medium, bright
hook_type               TEXT     -- bold_claim, question, story, promise, curiosity, address, context
topic_cluster           TEXT     -- embedding-clustered topic
tags                    TEXT[]   -- raw tags from API
region_visibility       TEXT     -- IN_only, both, US_only, neither
comment_region_signals  TEXT     -- rough geography from comment sample
```

Store in D1 from day one.

### 8. Order of Operations

1. Underserved-claim check (Trends + region rank comparison) — half a day
2. Channel list curation (20-40 channels via search + manual) — half a day
3. Pull full video population + captions + metadata via API — scripted
4. Compute age-normalized breakout score, split hi/lo
5. LLM passes (thumbnail, hook, topic clustering) — only if step 1 confirms thesis
6. Build feature table in D1
7. Fit simple model first (logistic regression or gradient boosted trees on breakout binary) before reaching for anything fancier

## Capabilities Reference

### YouTube Data API v3

Quota resets daily. search.list is a separate 100-call bucket. Everything else draws from the 10k general pool.

#### search.list — 100 calls/day (SEPARATE bucket)

| Parameter | Purpose | Example |
|-----------|---------|---------|
| q | Query string | "tantra philosophy explained" |
| regionCode | Geographic filter | US, IN, GB |
| relevanceLanguage | Content language filter | en |
| order | Sort method | viewCount, date, relevance |
| publishedAfter | Date window | ISO 8601 |
| maxResults | Per-page (max 50) | 50 |

Returns: videoId, channelId, title, description, thumbnails, publishedAt.

#### videos.list — 1 unit per 50 IDs

Parts available:
- `snippet` — title, description, tags, channelId, channelTitle, categoryId, defaultAudioLanguage, defaultLanguage, localized, publishedAt
- `contentDetails` — duration (ISO 8601), dimension, definition, caption, regionRestriction, projection, hasCustomThumbnail
- `statistics` — viewCount, likeCount, dislikeCount, favoriteCount, commentCount
- `status` — privacyStatus, license, embeddable, madeForKids, containsSyntheticMedia, publishAt
- `topicDetails` — topicIds, relevantTopicIds, topicCategories (Wikipedia-linked)
- `liveStreamingDetails` — scheduledStartTime, actualStartTime, concurrentViewers

#### channels.list — 1 unit per 50 IDs

Parts:
- `snippet` — title, description, publishedAt, country, defaultLanguage, thumbnails
- `statistics` — viewCount, subscriberCount, hiddenSubscriberCount, videoCount
- `contentDetails` — relatedPlaylists (uploads ID for video harvest)
- `topicDetails` — topicIds (channel-level)
- `status` — madeForKids, privacyStatus
- `brandingSettings` — channel banner, icon, watch page branding

#### playlistItems.list — 1 unit per 50 items

Get all uploads for a channel via its uploads playlist ID (from channels.list contentDetails.relatedPlaylists.uploads).

| Parameter | Purpose |
|-----------|---------|
| playlistId | Uploads playlist ID for the channel |
| maxResults | Per page (max 50) |
| pageToken | Pagination |

Returns: videoId, title, publishedAt, position, channelId.

#### commentThreads.list — 1 unit per 100 threads

| Parameter | Purpose |
|-----------|---------|
| videoId | Target video |
| maxResults | Per page (max 100) |
| order | time, relevance |
| pageToken | Pagination |

Returns: top-level comment text, author, likeCount, totalReplyCount, publishedAt, updatedAt.

#### captions.list — 50 units per video

Lists available caption tracks. Expensive — use only for targeted hook extraction on the curated sample.

Returns: id, language, kind (standard, ASR), isDraft, trackKind.

#### captions.download — cost not listed, requires OAuth for some tracks

Downloads the actual caption file in SRT or other format. The timedtext API (youtubetranscript.com alternative) may also work without quota cost.

#### activities.list — 1 unit

Returns recent channel activity. Partially deprecated (bulletins removed). Still useful for detecting new uploads.

### Free Third-Party Tools

| Tool | Use | Limit |
|------|-----|-------|
| youtubetranscript.com | Pull video transcripts without API key | Free, no auth, may rate-limit |
| yt-dlp | Download video/audio/thumbnails/captions | Free, OSS |
| pytrends (unofficial) | Google Trends data programmatically | Free, no API key, may cap |
| Google Trends web | Manual comparison tool | Free |

### Cloudflare Stack

| Service | Use | Free Tier |
|---------|-----|-----------|
| Workers | Compute for daily scan scripts | 100k requests/day |
| Cron Triggers | Schedule daily scans | Free with Workers |
| D1 | Feature store, daily snapshots | 5GB storage, 5M reads/month |
| R2 | Raw JSON snapshots, thumbnails | 10GB storage |
| Workers AI | LLM inference (if DeepSeek is down or for small tasks) | 10k neurons/day |
| Images | Thumbnail optimization | 1000 images/month |

### Existing Keys

- YouTube API key: from .env.local (AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I)
- DeepSeek key: from .env.local (VIDEO_LLM_API_KEY) — text + vision capable
- Cloudflare API token: from .env.local

### Capacity Math

Per day, fully utilized:
- 100 searches x 50 results = 5,000 video references discovered
- 10,000 general units = 250,000 video stat fetches (at 50/batch), or 10,000 channel detail fetches, or 5,000 playlist harvests + 5,000 video stat fetches

Practical daily scan budget:
- 48 searches (core niche pulse)
- 12 searches (velocity)
- 20 searches (gap detection)
- 20 searches (emerging topics)
- = 100 search calls consumed exactly
- ~550 general units for harvesting results + known channels + comments
- Remaining ~9,450 general units for backfill, deep dives, experiments

Over 90 days: 9,000 searches + 900,000 general units available without exhausting free tier.
