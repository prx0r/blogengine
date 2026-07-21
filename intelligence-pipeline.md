# Daily YouTube Intelligence Pipeline

Maximizing free API quota for topic confidence signals over time.

## Quota Budget

| Bucket | Daily Limit | Cost | Max Throughput |
|--------|-------------|------|----------------|
| search.list | 100 calls | 1/call | 5,000 video refs |
| General pool | 10,000 units | 1/call | 10,000 API calls |
| videos.insert | 100 calls | 1/call | Not used |

Search and general pool are **independent** — both can be fully exhausted daily.

---

## Phase 1: Search (100 calls/day)

### A. Core Niche Pulse — 48 calls
12 themes × 4 queries, alternating region:
- Odd days: IN (relevanceLanguage=en)
- Even days: US

48/day covers full landscape every 2 days.

### B. Velocity Scan — 12 calls
1 query per theme, order=date, last 7 days. Catches fresh uploads before they decay.

### C. Gap Detection — 20 calls
10 high-signal queries × 2 regions (IN + US). Diff reveals topics hot in India that haven't crossed to US.

### D. Emerging Topics — 20 calls
Rotate fresh queries: spanda, vijnana bhairava, kashmir shaivism meditation, tantraloka consciousness, kali tantra, bhairava philosophy, iccha, and so on.

---

## Phase 2: General Pool (~2,500 of 10,000 units)

### 1. Harvest Search Results — ~200 units
- videos.list: 100 calls (5,000 IDs at 50/batch)
- channels.list: ~60 calls (unique channels)
- Store: video_id, title, tags, category, duration, audioLanguage, viewCount, likeCount, commentCount, publishedAt

### 2. Known Channel Brain Scan — ~400 units
For 200 tracked channels in CHANNEL_IDS:
- channels.list: 4 calls (subscriber growth, videoCount)
- playlistItems.list: 200 calls (latest 50 uploads each)
- videos.list: ~200 calls (stats on all new uploads)

### 3. Comment Mining — 50 units
commentThreads.list on top 50 breakout videos. Extract audience questions → content ideas.

### 4. Topic Intelligence — 0 units (local computation)
- Update patterns.json (title analysis, duration performance)
- Compare today's breakouts vs 7-day trailing → topic lifecycles
- Flag IN-EN channels growing >10% subscribers/week

### Remaining: ~7,500 units spare
For backfill, transcripts, deep-dive comment analysis, batch channel audits.

---

## What This Builds Over Time

After 30 days:

| Asset | Volume | Signal |
|-------|--------|--------|
| Topic Lifecycles | 3,600 videos/day tracked | Which niches rising/peaking/dying |
| Channel Growth | 200 channels × 30 snapshots | Who's growing, topic drift |
| Title Pattern DB | 108,000 titles analyzed | What title format predicts breakout |
| Comment Corpus | 1,500 breakout threads | What audiences actually ask |
| IN↔US Gap Map | 15 query pairs × 30 days | Topics that work in IN but not US yet |
| Duration Matrix | Per-niche performance | Ideal video length per topic |

The topic lifecycle signal alone is worth it — you'll see "Theurgy" trend 2-3 weeks before peak, giving time to produce.

---

## Google Cloud Free Trial — Useful Services

### Tier 1: Immediate Value (already wired or trivially additive)

| Service | Free Tier | Use Case |
|---------|-----------|----------|
| **Natural Language API** | 5,000 units/month | Analyze video titles, descriptions, comments for entities, sentiment, syntax. Feed into topic clustering. |
| **Translation API** | 500,000 chars/month | Translate Hindi/Tamil/Bengali channel titles and descriptions to find IN-EN channels we're missing. |
| **Vision API** | 1,000 images/month | Analyze thumbnail composition of breakout videos (text detection, object classification, color analysis). |
| **Cloud Storage** | 5 GB, 5,000 ops/month | Store daily scan snapshots as structured JSON (replace flat files). |

### Tier 2: Growth Infrastructure

| Service | Free Tier | Use Case |
|---------|-----------|----------|
| **BigQuery** | 10 GB storage, 1 TB queries/month | Data warehouse for all daily scans. Query across weeks: "show me all Tantra breakouts with >5x ratio that came from IN." |
| **Cloud Scheduler + Cloud Functions** | 2 million invocations/month | Run the daily scan automatically at midnight. No manual trigger. |
| **Cloud Run** | 2 million requests/month | Host scan scripts as containerized services. runs on free tier CPU. |
| **Vertex AI** | Custom model training free tier | Train a breakout prediction model on historical data. Features: title, tags, duration, channel subs, region. |

### Tier 3: Long-Term

| Service | Free Tier | Use Case |
|---------|-----------|----------|
| **Speech-to-Text** | 60 minutes/month | Transcribe audio from top breakout videos. Analyze content quality vs. metadata alone. |
| **Video Intelligence API** | 1,000 minutes/month | Detect scene labels, shot changes in competitor videos. Understand production patterns. |
| **Document AI** | 1,000 pages/month | Parse PDFs in library/ for structured extraction. |
| **Looker Studio** | Free | Dashboard showing daily breakout trends, channel growth, topic lifecycle visualizations. |

### First Steps (zero config, immediate)

1. Enable Natural Language API → run comment corpus through entity extraction weekly
2. Enable Translation API → batch-translate Indian channel descriptions to find hidden English content
3. Set up Cloud Scheduler + Function for daily scan automation
