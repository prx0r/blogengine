# Cloudflare OS — Development Plan

## Architecture: One Platform, Many Farms

```
Cloudflare OS (shared platform)
│
├── Farm: tantra (your channel)
│   ├── D1: feature_store, gap_maps, metrics
│   ├── R2: assets, raw_datasets, outputs
│   ├── Queue: pipeline_stages
│   ├── Workflows: content_production
│   ├── Cron: daily_research, weekly_gap_map
│   └── Workers: api_endpoints
│
├── Farm: {next_niche} (cloned from template)
│   └── (same structure, different D1 + R2)
│
├── Hermes (orchestrator)
│   ├── Routes commands to correct farm
│   ├── Human approval gates
│   └── Cross-farm analytics
│
└── Shared Services
    ├── AI Gateway (LLM caching, fallback)
    ├── R2 SQL + Data Catalog (research datasets)
    └── Stream (video delivery)
```

---

## Phase 1: Foundation (Week 1)

### 1a: Project Template

Create `farm-template/` — a reusable Workers project skeleton:

```
farm-template/
├── wrangler.jsonc          ← D1, R2, Queue, AI bindings
├── src/
│   ├── index.ts             ← Request router
│   ├── cron/
│   │   ├── daily-research.ts    ← Channel harvest + gap scan
│   │   └── weekly-gap-map.ts    ← Update opportunity rankings
│   ├── workflows/
│   │   ├── produce-video.ts     ← Full video production Workflow
│   │   └── research-topic.ts    ← Gap-to-treatment Workflow
│   ├── workers/
│   │   ├── api.ts               ← REST API for Hermes
│   │   ├── thumbnails.ts        ← LLaVA analysis + FLUX generation
│   │   ├── scripts.ts           ← LLM script writing with gates
│   │   └── audio.ts             ← Deepgram TTS
│   ├── d1/
│   │   └── schema.sql           ← Feature store tables
│   └── lib/
│       ├── youtube.ts           ← YouTube API client
│       ├── models.ts            ← Data types
│       └── gates.ts             ← Verification gate checking
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Key:** Everything is parameterized by `FARM_ID` — farm name, D1 binding, R2 bucket, Queue name. Cloning a farm is one command.

### 1b: Worker Bindings (wrangler.jsonc)

```jsonc
{
  "name": "farm-{farm_id}",
  "main": "src/index.ts",
  "d1_databases": [
    { "binding": "FEATURE_STORE", "database_name": "farm-{farm_id}-fs", "database_id": "..." },
    { "binding": "GAP_MAP", "database_name": "farm-{farm_id}-gaps", "database_id": "..." }
  ],
  "r2_buckets": [
    { "binding": "ASSETS", "bucket_name": "farm-{farm_id}-assets" },
    { "binding": "OUTPUTS", "bucket_name": "farm-{farm_id}-outputs" }
  ],
  "queues": {
    "producers": [{ "binding": "QUEUE", "queue": "farm-{farm_id}-pipeline" }],
    "consumers": [{ "queue": "farm-{farm_id}-pipeline", "max_batch_size": 1 }]
  },
  "ai": { "binding": "AI" },
  "triggers": { "crons": ["0 6 * * *"] }
}
```

### 1c: D1 Schema (feature store)

```sql
-- Core tables, shared across all farms
CREATE TABLE channels (
  channel_id TEXT PRIMARY KEY,
  farm_id TEXT,
  name TEXT,
  subscriber_count INTEGER,
  video_count INTEGER,
  competitor_type TEXT,  -- direct, audience, format
  region_visibility TEXT,
  added_date DATE
);

CREATE TABLE videos (
  video_id TEXT,
  channel_id TEXT,
  farm_id TEXT,
  snapshot_date DATE,
  published_at DATE,
  title TEXT,
  duration_seconds INTEGER,
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  breakout_score FLOAT,
  is_breakout BOOLEAN,
  -- title features
  title_length INTEGER,
  has_question BOOLEAN,
  has_colon BOOLEAN,
  power_word_count INTEGER,
  -- thumbnail features (LLaVA classified)
  thumbnail_composition TEXT,
  thumbnail_warmth TEXT,
  thumbnail_has_face BOOLEAN,
  thumbnail_expression TEXT,
  -- market features
  gap_score FLOAT,
  language_lag_score FLOAT,
  PRIMARY KEY (video_id, snapshot_date)
);

CREATE TABLE gap_map (
  query TEXT,
  farm_id TEXT,
  snapshot_date DATE,
  topic_cluster TEXT,
  gap_score FLOAT,
  language_lag_score FLOAT,
  in_channel_count INTEGER,
  us_channel_count INTEGER,
  uk_channel_count INTEGER,
  PRIMARY KEY (query, snapshot_date)
);

CREATE TABLE hypotheses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT,
  hypothesis TEXT,
  status TEXT,  -- pending, confirmed, rejected
  videos_tested INTEGER,
  evidence TEXT,
  created_date DATE,
  last_updated DATE
);

CREATE TABLE api_usage (
  date DATE,
  farm_id TEXT,
  endpoint TEXT,
  calls INTEGER,
  bucket TEXT,
  remaining INTEGER,
  PRIMARY KEY (date, endpoint)
);
```

---

## Phase 2: Daily Research Pipeline (Week 2)

### 2a: Channel Harvest Worker

```typescript
// src/cron/daily-research.ts
export default {
  async scheduled(event, env, ctx) {
    const farmId = env.FARM_ID;
    
    // 1. Pull new uploads from CHANNEL_IDS
    for (const channelId of CHANNEL_IDS) {
      const uploads = await fetchChannelUploads(channelId, env.YOUTUBE_API_KEY);
      await storeVideos(uploads, farmId, env.FEATURE_STORE);
    }
    
    // 2. Compute breakout scores (age-band normalized)
    await computeBreakoutScores(farmId, env.FEATURE_STORE);
    
    // 3. Classify thumbnails via Workers AI (LLaVA)
    const unclassified = await getUnclassifiedThumbnails(env.FEATURE_STORE);
    for (const video of unclassified) {
      const result = await env.AI.run("@cf/llava-hf/llava-1.5-7b", {
        image: [await fetch(video.thumbnail_url).then(r => r.arrayBuffer())],
        prompt: "Classify this thumbnail: composition type, color warmth, face expression, style, brightness"
      });
      await updateThumbnailFeatures(video.video_id, result, env.FEATURE_STORE);
    }
    
    // 4. Update gap map
    await updateGapMap(farmId, env.FEATURE_STORE, env.YOUTUBE_API_KEY);
    
    // 5. Push high-opportunity topics to pipeline queue
    const opportunities = await findHighOpportunityTopics(env.FEATURE_STORE);
    for (const topic of opportunities) {
      await env.QUEUE.send({ type: "new_topic", topic });
    }
  }
};
```

### 2b: Queue Consumer — Research Topic Workflow

```typescript
// src/workflows/research-topic.ts
export class ResearchTopicWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { topic } = event.payload;
    let gapData, treatment;
    
    // Step 1: Analyze gap
    gapData = await step.do("analyze gap", async () => {
      return await analyzeGap(topic, this.env);
    }, { retries: { limit: 3 } });
    
    // Step 2: Generate treatment
    treatment = await step.do("generate treatment", async () => {
      return await generateTreatment(gapData, this.env);
    }, { retries: { limit: 2 } });
    
    // Step 3: Human approval checkpoint
    await step.do("wait for approval", async () => {
      return await step.waitForApproval({
        email: "producer@farm",
        message: `Review treatment for: ${topic}`,
        data: treatment
      });
    });
    
    // Step 4: Push to production queue
    await step.do("queue production", async () => {
      await this.env.QUEUE.send({ type: "produce_treatment", treatment });
    });
  }
}
```

---

## Phase 3: Content Production (Week 3)

### 3a: Produce Video Workflow

```typescript
// src/workflows/produce-video.ts
export class ProduceVideoWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { treatment } = event.payload;
    let script, audio, thumbnails, clips;
    
    // Step 1: Write script
    script = await step.do("write script", async () => {
      return await writeScript(treatment, this.env);
    }, { retries: { limit: 3, backoff: "exponential" } });
    
    // Step 2: Validate script gates
    await step.do("validate script", async () => {
      const gates = checkScriptGates(script);
      if (!gates.allPass) throw new Error(`Script gate failed: ${gates.failures}`);
    });
    
    // Step 3: Generate audio
    audio = await step.do("generate audio", async () => {
      return await generateAudio(script, this.env);
    }, { timeout: "5 minutes" });
    
    // Step 4: Generate thumbnails (3 variants)
    thumbnails = await step.do("generate thumbnails", async () => {
      const results = [];
      for (const variant of treatment.thumbnailPrompts) {
        const image = await this.env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
          prompt: variant,
          steps: 4
        });
        const url = await uploadToR2(image, this.env.OUTPUTS);
        results.push(url);
      }
      return results;
    });
    
    // Step 5: Generate video clips
    clips = await step.do("generate clips", async () => {
      const results = [];
      for (const beat of treatment.beats.slice(0, 3)) {  // Start with 3 clips
        const video = await this.env.AI.run("@hf/thebloke/minimax-hailuo-2-3-gguf", {
          prompt: beat.visualPrompt,
          duration: 5
        });
        const url = await uploadToR2(video, this.env.OUTPUTS);
        results.push(url);
      }
      return results;
    });
    
    // Step 6: Compile final video
    const videoUrl = await step.do("compile video", async () => {
      return await compileVideo(audio, clips, thumbnails[0]);
    }, { timeout: "10 minutes" });
    
    // Step 7: Publish to YouTube
    await step.do("publish", async () => {
      return await publishToYouTube(videoUrl, treatment.title, this.env);
    });
    
    // Step 8: Post-release setup
    await step.do("post release", async () => {
      await saveHypothesis(treatment, this.env.FEATURE_STORE);
      await startSnapshotTracking(videoUrl, this.env.FEATURE_STORE);
    });
  }
}
```

### 3b: YouTube Upload Worker

```typescript
// src/workers/publish.ts
// Uses videos.insert endpoint (100/day bucket)
export async function publishToYouTube(videoUrl, title, env) {
  const form = new FormData();
  form.append("part", "snippet,status");
  form.append("snippet", JSON.stringify({
    title,
    description: generateDescription(title),
    tags: generateTags(title),
    categoryId: "27"  // Education
  }));
  form.append("status", JSON.stringify({
    privacyStatus: "public"
  }));
  
  // Stream video from R2 to YouTube
  const videoBlob = await env.OUTPUTS.get(videoUrl);
  form.append("video", videoBlob);
  
  const res = await fetch("https://www.googleapis.com/upload/youtube/v3/videos", {
    method: "POST",
    headers: { Authorization: `Bearer ${await getYouTubeAuthToken()}` },
    body: form
  });
  
  // Start native A/B test for titles
  await startABTest(res.id, treatment.titleVariants);
  
  // Log API usage
  await logAPIUsage("videos.insert", 1, env.FEATURE_STORE);
}
```

---

## Phase 4: Hermes Integration (Week 4)

### 4a: Hermes API Client

Hermes calls Workers via fetch(), not by running skills locally:

```typescript
// In Hermes: hermes/plugins/cloudflare-farm/client.ts
class CloudflareFarmClient {
  constructor(private readonly farmUrl: string) {}
  
  async dailyResearch(): Promise<GapReport> {
    return fetch(`${this.farmUrl}/cron/daily-research`, { method: "POST" });
  }
  
  async proposeTopic(topic: string): Promise<Treatment> {
    return fetch(`${this.farmUrl}/api/propose`, {
      method: "POST",
      body: JSON.stringify({ topic })
    });
  }
  
  async getGapMap(): Promise<GapMapEntry[]> {
    return fetch(`${this.farmUrl}/api/gap-map`);
  }
  
  async getFeatureStore(query: string): Promise<any> {
    return fetch(`${this.farmUrl}/d1/query`, {
      method: "POST",
      body: JSON.stringify({ query })
    });
  }
  
  async approveTreatment(treatmentId: string): Promise<void> {
    return fetch(`${this.farmUrl}/api/approve/${treatmentId}`, { method: "POST" });
  }
}
```

### 4b: Hermes Orchestration Commands

```typescript
// Hermes routes commands to the correct farm
const farms = {
  tantra: new CloudflareFarmClient("https://farm-tantra.workers.dev"),
  // next_niche: new CloudflareFarmClient("https://farm-next.workers.dev"),
};

// Research
await farms.tantra.dailyResearch();
const gaps = await farms.tantra.getGapMap();

// Production
const treatment = await farms.tantra.proposeTopic("Chinnamasta goddess meaning");
// Hermes pauses here for human review
await farms.tantra.approveTreatment(treatment.id);
// Workflow kicks off automatically after approval

// Analytics
const results = await farms.tantra.getFeatureStore(
  "SELECT * FROM hypotheses WHERE status = 'confirmed'"
);
```

---

## Phase 5: Farm Cloning (Week 5)

### 5a: Farm Creation Script

```bash
# One command to create a new farm
./scripts/create-farm.sh tantra2

# What it does:
# 1. cp -r farm-template/ farms/tantra2/
# 2. Replace {farm_id} with tantra2 in wrangler.jsonc
# 3. Create D1 databases: tantra2-fs, tantra2-gaps
# 4. Create R2 buckets: tantra2-assets, tantra2-outputs
# 5. Create Queue: tantra2-pipeline
# 6. npm install
# 7. wrangler deploy
```

### 5b: Farm Config

```jsonc
// farms/tantra2/wrangler.jsonc
{
  "name": "farm-tantra2",
  "d1_databases": [
    { "binding": "FEATURE_STORE", "database_name": "farm-tantra2-fs" },
    { "binding": "GAP_MAP", "database_name": "farm-tantra2-gaps" }
  ],
  "r2_buckets": [
    { "binding": "ASSETS", "bucket_name": "farm-tantra2-assets" },
    { "binding": "OUTPUTS", "bucket_name": "farm-tantra2-outputs" }
  ],
  "queues": {
    "producers": [{ "binding": "QUEUE", "queue": "farm-tantra2-pipeline" }],
    "consumers": [{ "queue": "farm-tantra2-pipeline", "max_batch_size": 1 }]
  },
  "vars": {
    "FARM_ID": "tantra2",
    "YOUTUBE_API_KEY": "@youtube-api-key",
    "CHANNEL_IDS": "[]",
    "TOPIC_CLUSTERS": "[]"
  }
}
```

### 5c: Cross-Farm Analytics

```typescript
// Hermes can compare farms
async function compareFarms() {
  const results = {};
  for (const [name, farm] of Object.entries(farms)) {
    results[name] = await farm.getFeatureStore(`
      SELECT farm_id, COUNT(*) as total_videos,
             AVG(breakout_score) as avg_breakout,
             COUNT(CASE WHEN is_breakout THEN 1 END) as breakout_count
      FROM videos
      WHERE snapshot_date > date('now', '-30 days')
    `);
  }
  return results;
}
```

---

## Phase 6: Migration from Hetzner to Cloudflare (Ongoing)

### Migrate Storage

| Step | Task | Cloudflare Service | Status |
|------|------|-------------------|--------|
| 1 | Upload library/ PDFs to R2 | R2 bucket `assets/library/` | ⬜ |
| 2 | Upload content/sources/ to R2 | R2 bucket `assets/sources/` | ⬜ |
| 3 | Upload public/art/ to R2 + Images | R2 + Images | ⬜ |
| 4 | Upload public/audio/ to Stream | Stream | ⬜ |
| 5 | Migrate D1 from local SQLite | D1 (import schema + data) | ⬜ |
| 6 | Update Workers bindings | wrangler.jsonc | ⬜ |

### Migrate Pipes

| Step | Task | Cloudflare Service | Status |
|------|------|-------------------|--------|
| 1 | Daily research scan | Cron + Worker | ⬜ |
| 2 | Thumbnail analysis | Workers AI (LLaVA) | ⬜ |
| 3 | Hook classification | AI Gateway + DeepSeek | ⬜ |
| 4 | Video production | Workflows | ⬜ |
| 5 | Script writing with gates | AI Gateway + Workers | ⬜ |
| 6 | Audio generation | Workers AI (Deepgram) | ⬜ |
| 7 | Thumbnail generation | Workers AI (FLUX) | ⬜ |
| 8 | Clip generation | Workers AI (MiniMax/Veo) | ⬜ |
| 9 | YouTube upload | Workers + YouTube API | ⬜ |
| 10 | Post-release tracking | Cron + D1 | ⬜ |

---

## Cost Projection for 1 Farm

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| Workers Paid | 10M requests | $5.00 |
| D1 (feature store + gap map) | 5GB storage | $0 |
| R2 (assets + outputs) | 10GB storage | $0 (free tier) |
| Workers AI | 50k neurons/day | ~$1.50 |
| AI Gateway | Included with Workers | $0 |
| Queues | 10k messages/month | $0 |
| Workflows | 4 videos/month × 10 steps | ~$0 |
| Cron Triggers | 2/day | $0 |
| Stream | 2 videos/month | ~$0.10 |
| Browser Rendering | 1hr/month | ~$5.00 |
| **Total per farm** | | **~$11.60/month** |

Cost for N farms scales linearly on storage (R2 + D1) but compute (Workers) is shared — one Workers Paid plan covers all farms.

---

## File Structure After Migration

```
cloudflare-os/
├── farm-template/          ← Reusable farm skeleton
│   ├── src/
│   ├── wrangler.jsonc
│   └── package.json
├── farms/                  ← Deployed farm instances
│   ├── tantra/
│   │   ├── wrangler.jsonc  ← {farm_id} replaced
│   │   └── .env            ← Farm-specific secrets
│   └── {next_niche}/
├── hermes/                 ← Orchestrator (stays local)
│   ├── plugins/
│   │   └── cloudflare-farm/
│   └── skills/
│       └── manage-farms/
├── scripts/
│   ├── create-farm.sh      ← Clone farm-template
│   └── deploy-all.sh       ← Deploy all farms
└── docs/
    └── farm-operations.md
```

## Summary

The tantra channel is Farm 1. The template lets you spin up Farm 2 (next niche) in about an hour: set `CHANNEL_IDS`, `TOPIC_CLUSTERS`, and `FARM_ID`, then deploy. Hermes manages all farms from one interface, routing commands to the right Worker endpoints. Total infrastructure cost for the first farm is ~$12/month, and each additional farm adds ~$2/month for storage.
