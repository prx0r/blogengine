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

---

## $300 Credit Backlog Sprint

Don't wait 30 days to build signals. Use the $300 for a massive initial data retrieval.

### Constraints
- **YouTube Data API**: 100 searches/day, 10,000 general units/day — quota resets daily, **cannot** be accelerated with credits. But over 90 days: 9,000 searches + 900,000 general units available.
- **GCP services**: $300 pays for all the below with room to spare.

### Week 1: Foundation

| Day | YouTube API (daily) | GCP Credits |
|-----|--------------------|-------------|
| 1-7 | Run full 100-search scan daily with varied queries to maximize niche coverage. Harvest ALL results into `data/raw/` daily. | **Natural Language API** (~$50): Batch-entity-extract all 1,795 existing essays + 108 source texts → build a topic map of YOUR content. Compare against what's trending externally. |

**Outcome:** You know exactly what topics you've covered vs. what's breaking out.

### Week 2: Language Bridge

| Day | YouTube API | GCP Credits |
|-----|------------|-------------|
| 8-14 | Dedicate 50 searches/day to IN region with varied Indian languages (hi, ta, te, bn, ml). Collect ALL channel descriptions + video titles. | **Translation API** (~$100): Translate every Indian-language title and description collected. Build a corpus of "what Indian creators are making in local languages that maps to English gaps." |

**Outcome:** You know every Indian channel making Tantra/Shaivism content regardless of language.

### Week 3: Visual Intelligence

| Day | YouTube API | GCP Credits |
|-----|------------|-------------|
| 15-21 | Harvest thumbnails from all breakout videos discovered so far. Pull their channel banners and avatar images too. | **Vision API** (~$75): Analyze 50,000 thumbnails for: text detected, color palette, composition type (talking head/text overlay/illustration), object detection. Also run thumbnail analysis on YOUR public/art/ collection for searchability. |

**Outcome:** Know exactly what thumbnail styles correlate with breakout by niche.

### Week 4: Infrastructure + Automation

| Day | YouTube API | GCP Credits |
|-----|------------|-------------|
| 22-28 | Daily scans continue. By now you have ~28 days of velocity data on each niche. | **BigQuery** (~$25): Set up the data warehouse, import all daily scan data from weeks 1-3. **Cloud Scheduler + Cloud Functions** (~$0): Automate the daily scan. **Looker Studio** ($0): Build a live dashboard. |

**Outcome:** Fully automated daily pipeline with dashboard.

### Remaining credits (~$50)
- Vertex AI training run: train a breakout prediction classifier
- Speech-to-Text: transcribe top 10 competitor videos for content analysis
- Document AI: parse a few rare PDFs

### Total Cost: ~$300 (exactly the trial)

| Service | Spend |
|---------|-------|
| Natural Language API | $50 |
| Translation API | $100 |
| Vision API | $75 |
| BigQuery | $25 |
| Cloud Functions + Scheduler | ~$0 |
| Looker Studio | $0 |
| Vertex AI / Speech-to-Text / Document AI | ~$50 |
| **Total** | **~$300** |

### What You Have After 28 Days

| Asset | Volume | Confidence |
|-------|--------|------------|
| Topic Lifecycles | 28 daily snapshots | Medium — can see 4-week trends |
| Channel Database | 5,000+ channels | High — every niche, every language |
| IN↔US Gap Map | 5,600+ query comparisons | High — know exactly what's missing |
| Title Pattern ML | 140,000+ titles | High — robust pattern detection |
| Thumbnail Intelligence | 50,000 images analyzed | High — know winning visual formulas |
| Comment Corpus | 1,400+ breakout threads | Medium — enough for entity mining |
| Language Bridge | All Indian-lang channels | High — know every player |

### Automation (Day 29+)

After week 4, the daily cost drops to ~$0:
- YouTube quota is free (always)
- Cloud Function for daily scan is under free tier
- BigQuery storage for 1 year of daily data is ~$10
- Natural Language API stay within free 5k units/month for ongoing analysis
