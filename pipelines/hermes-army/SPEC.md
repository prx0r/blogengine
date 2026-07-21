# Hermes Army — Full Architecture Spec

Hermes becomes the **orchestrator**. Each capability becomes a specialist Worker that Hermes calls via API.

---

## 1. Available AI Models on Workers AI

### Vision (Thumbnail Analysis)

| Model | Type | Cost (neurons) | Use |
|-------|------|----------------|-----|
| LLaVA 1.5 7B | Image→Text | ~500/img | Classify thumbnail: composition, expression, text, style |
| UForm Gen2 | Image→Text | ~200/img | Faster alternative for simple classification |
| DETR ResNet-50 | Object Detection | ~100/img | Detect objects: face, skull, deity, text |
| ResNet-50 | Image Classification | ~50/img | Broad image category |

All run on Workers AI at $0.011/1k neurons, 10k free/day. LLaVA analysis of 900 thumbnails = ~450 neurons = ~$0.005.

### Image Generation (Thumbnails + Art)

| Model | Cost | Use |
|-------|------|-----|
| FLUX.1 Schnell | 4.8 neurons/512×512 tile | Generate custom thumbnails from title prompts |
| FLUX.2 Dev/Klein | Slightly more | Higher quality thumbnail generation |
| SDXL Base 1.0 | Variable | Art style presets for video backgrounds |
| Leonardo Lucid Phoenix | Variable | Photorealistic deity/ temple imagery |

Generate 3 thumbnail variants per video, A/B test them via YouTube native testing.

### Video Generation (FableCut Clips)

| Model | Type | Use |
|-------|------|-----|
| MiniMax Hailuo 2.3 | Text→Video | Generate 5-10s animated clips from script segments |
| Google Veo 3/3.1 | Text→Video | Higher quality clip generation |
| ByteDance Seedance 2.0 | Text→Video | Alternative |
| Alibaba HH1 I2V | Image→Video | Animate existing artwork into motion |

These are third-party models accessible via Workers AI gateway. Each 5s clip costs ~500-2000 neurons. For a 15-minute video with 30 clips = ~15k-60k neurons = ~$0.17-$0.66/video.

### Audio

| Model | Use | Replaces |
|-------|-----|----------|
| Deepgram Aura 1/2 | Text→Speech with emotional range | edge-tts for narration |
| MyShell MeloTTS | Text→Speech | Fallback |
| OpenAI Whisper | Speech→Text (transcription) | youtubetranscript.com fallback |
| Deepgram Nova 3 | Speech→Text (real-time) | Live captioning |

Deepgram Aura gives better voice quality than edge-tts with plural voices for source vs commentary.

---

## 2. AI Gateway — LLM Cost Control

Currently you call DeepSeek directly. AI Gateway sits in front and adds:

| Feature | Benefit |
|---------|---------|
| **Cache** | Identical prompts (recurring classification tasks) return cached response. 0 cost, 0 latency. |
| **Fallback** | If DeepSeek errors, route to Workers AI (Llama 4) without pipeline failure. |
| **Rate limiting** | Prevent accidental burst spending. |
| **Cost tracking** | Per-pipeline-stage cost attribution. "Thumbnail analysis cost $0.12 this week." |
| **BYOK** | Keep DeepSeek key in Secrets Store, not in .env. |

Cache TTL via `cf-aig-cache-ttl` header. Set to 30 days for invariant tasks (thumbnail classification prompts, hook taxonomy classification).

---

## 3. Workflows — Durable Video Pipeline

Each video becomes one Workflow instance. Workflows survive crashes, resume from last completed step, have built-in retries.

```
Workflow: produce_video(topic_id)

Step 1: research_gap(topic_id) → gap_data
  │  Query D1 for gap_score, language_lag, competitor analysis
  │  Cost: ~0 neurons (SQL only)
  ▼
Step 2: generate_treatment(gap_data) → treatment
  │  Workers AI (text) + AI Gateway (cacheable template)
  │  Output: title, hook, beat_sheet, source_list
  │  Cost: ~2000 neurons
  ▼
Step 3: create_thumbnail(treatment.title, style) → thumbnail_url
  │  Workers AI (FLUX.1 Schnell) → generate 3 variants
  │  Upload to R2
  │  Cost: ~15 neurons per variant
  ▼
Step 4: write_script(treatment) → script
  │  AI Gateway → DeepSeek (or fallback Llama 4)
  │  Validation: check gates (no NEG, no NARR, source ratio)
  │  Cost: ~5000 neurons
  ▼
Step 5: generate_audio(script) → audio_url
  │  Workers AI (Deepgram Aura 2) → TTS with dual voice
  │  Upload to R2 → Stream for delivery
  │  Cost: ~1000 neurons per minute
  ▼
Step 6: generate_clips(script.beats) → clip_urls[]
  │  For each beat: Workers AI (MiniMax/Veo) → 5-10s clip
  │  Upload to R2
  │  Cost: ~500 neurons per clip × 30 clips = ~15000 neurons
  ▼
Step 7: compile_video(audio_url, clip_urls, thumbnail) → video_url
  │  Browser Rendering → FableCut timeline → render → export to Stream
  │  Or: FFmpeg on Worker (work in progress)
  │  Cost: compute time only
  ▼
Step 8: publish(video_url, treatment.titles, thumbnail) → youtube_id
  │  YouTube Data API → upload, set title+description+tags
  │  Schedule native A/B test on titles
  │  Cost: YouTube quota (videos.insert bucket: 100/day)
  ▼
Step 9: post_release(video_id) → hypothesis_record
  │  Save to D1: expected_audience, traffic_source, hypothesis
  │  Start snapshot tracking (daily views, likes, comments)
```

### Workflow Configuration

```json
{
  "retries": { "limit": 3, "delay": "30s", "backoff": "exponential" },
  "timeout": "4 hours",
  "max_steps": 20
}
```

No step re-executes on restart. If Step 6 fails at 3am, it resumes at Step 6 when fixed.

### Pricing Per Video

| Step | Cost |
|------|------|
| Research gap | $0 (D1 query) |
| Treatment gen | ~$0.02 |
| Thumbnail gen | ~$0.0002 |
| Script writing | ~$0.05 |
| Audio generation | ~$0.01/min |
| Clip generation | ~$0.17 |
| Compilation | ~$0 (compute) |
| **Total per video** | **~$0.25 + YouTube quota** |

At 1 video/week = ~$1/month + Workers Paid ($5) = **~$6/month total**.

---

## 4. Queues — Pipeline Decoupling

Between each major pipeline stage, a Queue absorbs load spikes and enables independent scaling.

```
Queue: new_topics ← Research cron pushes gap topics here
  │
  ├─ Consumer: treatment_worker (Workflow, 1 instance per topic)
  │   → Produces treatment, pushes to queue: treatments_ready
  │
Queue: treatments_ready
  │
  ├─ Consumer: script_worker (Workflow)
  │   → Produces script, pushes to queue: scripts_ready
  │
Queue: scripts_ready
  │
  ├─ Consumer: production_worker (Workflow)  
  │   → Produces video, pushes to queue: videos_ready
  │
Queue: videos_ready
  │
  ├─ Consumer: publish_worker (Workflow)
  │   → Uploads to YouTube, updates D1, pushes to queue: released
  │
Queue: released
  │
  ├─ Consumer: analytics_worker (Cron, daily)
  │   → Snapshots metrics, updates hypothesis table
```

Each consumer runs independently. If production is slow (generating clips), research keeps finding topics. If YouTube quota is exhausted, publish holds without blocking earlier stages.

### Queue Configuration

- Retention: 4 days (default paid)
- Dead Letter Queue: failed messages after 3 retries go here for manual review
- Batch size: 1 (each video is independent)

---

## 5. R2 + Data Catalog + R2 SQL — Dataset Querying

The 40GB of research datasets (YouNiverse, Global Trending, YTCommentVerse) live in R2 as Iceberg tables. No local storage needed.

```bash
# Upload processed data to R2
npx wrangler r2 object put research-bucket/youniverse/channels.parquet --file=df_channels.parquet

# Enable Data Catalog on the bucket
# (one click in dashboard or via API)

# Query with R2 SQL
npx wrangler r2 sql query "catalog-id" \
  "SELECT channel_size, AVG(breakout_rate) 
   FROM default.youniverse_channels 
   WHERE category = 'Education'
   GROUP BY channel_size
   ORDER BY channel_size"
```

### What Gets Queried

| Dataset | Table | Key Queries |
|---------|-------|-------------|
| YouNiverse | `channels`, `time_series`, `videos` | Breakout metric validation, channel size effects |
| Global Trending | `trending_snapshots` | Cross-country diffusion, IN→US lag |
| YTCommentVerse | `comments` | Comment intent taxonomy, language distribution |

### What Gets Stored in D1 (Feature Store)

Processed outputs from the research pipelines:

```sql
-- Breakout metric validation results
CREATE TABLE validated_metrics (
  metric_name TEXT PRIMARY KEY,
  spearman_r FLOAT,
  precision_at_20 FLOAT,
  recommended BOOLEAN,
  validated_date DATE
);

-- Feature importance rankings  
CREATE TABLE feature_importance (
  feature_name TEXT,
  dataset TEXT,
  delta_r2 FLOAT,
  rank INTEGER,
  validated_date DATE
);

-- Cross-country diffusion matrix
CREATE TABLE diffusion_matrix (
  origin_country TEXT,
  target_country TEXT,
  category TEXT,
  diffusion_rate FLOAT,
  median_lag_days FLOAT,
  sample_size INTEGER
);

-- Comment intent taxonomy
CREATE TABLE comment_taxonomy (
  intent_type TEXT PRIMARY KEY,
  description TEXT,
  validated_agreement FLOAT,
  sample_size INTEGER
);
```

---

## 6. Workers + Cron — Daily Research Pipeline

```
Cron: "0 6 * * *" (daily at 6am)
  │
  Worker: daily_research
  │  1. Query CHANNEL_IDS → playlistItems.list → new videos
  │  2. Compute breakout scores (age-band normalized)
  │  3. Classify thumbnails (Workers AI: LLaVA, ~200 neurons/day)
  │  4. Classify hooks (AI Gateway: cached prompts, ~1000 neurons/day)
  │  5. Update gap map
  │  6. Push high-opportunity topics to queue: new_topics
  │
  Cost: ~1200 neurons/day = ~$0.013/day = ~$0.40/month
```

---

## 7. Browser Rendering — FableCut Automation

Browser Rendering runs full Chromium. Can:

1. **Load FableCut editor** (localhost:7777 or deployed)
2. **Set timeline**: inject script segments, audio track, image sequence
3. **Render preview**: take screenshots at key frames
4. **Export video**: trigger render, wait for completion, upload to Stream
5. **Compare to gold standard**: render reference video, compute similarity score via Workers AI vision

### Gold Standard Comparison

```javascript
// Browser Rendering + Workers AI pipeline
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Load gold standard reference
await page.goto("https://fablecut.app/view/GOLD_STANDARD_ID");
const goldFrames = await captureKeyframes(page, 10);

// Load produced video
await page.goto(`https://fablecut.app/view/${videoId}`);
const newFrames = await captureKeyframes(page, 10);

// Compare frames via Workers AI vision
for (let i = 0; i < goldFrames.length; i++) {
  const similarity = await ai.run("@cf/llava-hf/llava-1.5-7b", {
    image: [goldFrames[i], newFrames[i]],
    prompt: "Are these two video frames showing the same scene composition? Rate 0-10."
  });
  // Score < 6 → flag for human review
}
```

---

## 8. Stream — Video Delivery

- **Upload final videos** to Stream ($5/1000 min storage, ~$0.05 for a 10-min video)
- **Built-in player** with HLS adaptive streaming
- **Thumbnail generation** (automatic from Stream)
- **Animated GIF previews** for social sharing
- **Subtitle support** (upload generated VTT from captions)

Alternative: upload directly to YouTube via Data API (videos.insert, 100/day bucket).

---

## 9. Vectorize — Content Similarity

- Embed all produced video titles, descriptions, and transcript segments
- On new gap detection: query Vectorize for similar past content
- Avoid producing near-duplicate videos
- Find which past video's format most closely matches new topic

Cost: Free tier covers 30M queried dimensions/month (~30k queries at 1024 dimensions).

---

## 10. Hermes Integration

Hermes becomes the **orchestrator**. It doesn't execute skills directly — it calls Workers via API.

```
Hermes (orchestrator)
  │
  ├─ POST /api/research/scan         → Daily research Worker
  ├─ POST /api/research/gap-map      → Gap map Worker
  ├─ POST /api/pipeline/treatment    → Treatment generation Workflow
  ├─ POST /api/pipeline/produce      → Full production Workflow
  ├─ POST /api/pipeline/publish      → Publish Worker
  ├─ GET  /api/d1/feature-store/*    → D1 queries
  ├─ GET  /api/r2/datasets/*         → R2 dataset queries
  └─ POST /api/analytics/snapshot    → Metrics Worker
```

Each endpoint is a Worker that Hermes calls with `fetch()`. Hermes handles:
- **Which topics to prioritize** (from gap map)
- **Human approval gates** (before publishing, before billing large costs)
- **Error handling** (retry failed Workflows, notify on dead letter queues)
- **Learning loop** (update priors from post-release metrics)

---

## 11. Cost Summary

| Component | Monthly Cost |
|-----------|-------------|
| Workers Paid plan | $5.00 |
| R2 storage (40GB datasets) | $0.60 |
| Workers AI (research + production) | ~$3.00 |
| AI Gateway | Included in Workers |
| Queues | ~$0 |
| D1 | Included in Workers Paid |
| Stream (2 videos/month) | ~$0.10 |
| Browser Rendering | ~$5.00 |
| **Total** | **~$13.70/month** + YouTube quota (free) |

The $300 GCP credit is irrelevant. This entire system runs on Cloudflare for ~$14/month.
