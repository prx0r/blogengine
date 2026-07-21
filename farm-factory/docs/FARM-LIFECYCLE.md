# Farm Lifecycle

## Creating a Farm

A farm represents one content niche (e.g., English tantra, Buddhist philosophy, alchemy). Each farm has its own D1 database, R2 buckets, Queues, and Workers.

### Prerequisites

- Cloudflare account with Workers Paid plan ($5/mo)
- Wrangler CLI installed and authenticated
- YouTube API key
- DeepSeek/opencode API key
- Channel list (20-40 channels in the niche)
- Topic cluster taxonomy

### Quick Start

```bash
# Clone the template and deploy
./scripts/create-farm.sh tantra2 "buddhist-philosophy" "UCxxx,UCyyy,UCzzz"

# This does:
# 1. cp -r farm-template/ farms/tantra2/
# 2. Replace {FARM_ID} with tantra2 in wrangler.jsonc
# 3. Create D1 database + apply schema
# 4. Create R2 buckets: tantra2-sources, tantra2-assets, tantra2-outputs
# 5. Create Queues: tantra2-pipeline, tantra2-render
# 6. Insert channels
# 7. npm install
# 8. wrangler deploy
```

### Manual Configuration

```bash
# 1. Create the farm directory
cp -r farm-template/ farms/my-niche

# 2. Edit wrangler.jsonc — set FARM_ID, API keys
vim farms/my-niche/wrangler.jsonc

# 3. Create infrastructure
npx wrangler d1 create farm-my-niche-db
npx wrangler r2 bucket create farm-my-niche-sources
npx wrangler r2 bucket create farm-my-niche-assets
npx wrangler r2 bucket create farm-my-niche-outputs
npx wrangler queues create farm-my-niche-pipeline
npx wrangler queues create farm-my-niche-render

# 4. Apply schema
npx wrangler d1 execute farm-my-niche-db --file=farm-template/src/d1/schema.sql

# 5. Update wrangler.jsonc with the D1 database ID
npx wrangler d1 info farm-my-niche-db

# 6. Deploy
cd farms/my-niche
npx wrangler deploy
```

### Register with Hermes Conductor

```bash
curl -X POST https://hermes-conductor.workers.dev/farms/create \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "my-niche",
    "name": "My Niche Channel",
    "niche": "buddhist-philosophy",
    "baseUrl": "https://farm-my-niche.workers.dev",
    "channelIds": ["UCxxx", "UCyyy"],
    "topicClusters": ["meditation", "emptiness", "madhyamaka"]
  }'
```

## Operating a Farm

### Daily Operations

```bash
# Trigger daily research scan (Cron runs at 6am automatically)
curl -X POST https://farm-my-niche.workers.dev/__cron/daily-research

# View gap map
curl https://farm-my-niche.workers.dev/api/research/gap-map

# Propose a topic
curl -X POST https://farm-my-niche.workers.dev/api/factory/produce \
  -H "Content-Type: application/json" \
  -d '{"query": "Chinnamasta goddess meaning", "cluster": "deity"}'

# Check production status
curl https://farm-my-niche.workers.dev/api/factory/status?id=<workflow-id>

# Approve treatment (after human review)
curl -X POST https://farm-my-niche.workers.dev/api/factory/approve-treatment \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "<id>"}'

# Approve publish (after QA)
curl -X POST https://farm-my-niche.workers.dev/api/factory/approve-publish \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "<id>"}'

# View hypothesis results
curl https://farm-my-niche.workers.dev/api/analytics/hypotheses
```

### Via Hermes Conductor

```bash
# Route command to specific farm
curl -X POST https://hermes-conductor.workers.dev/farms/my-niche/daily-research
curl -X POST https://hermes-conductor.workers.dev/farms/my-niche/gap-map

# Cross-farm analytics
curl https://hermes-conductor.workers.dev/analytics
```

## Pausing / Archiving

```bash
# Pause (stops daily research, keeps data)
curl -X POST https://hermes-conductor.workers.dev/farms/my-niche/pause

# Resume
curl -X POST https://hermes-conductor.workers.dev/farms/my-niche/resume

# Archive (keeps data but removes from active rotation)
curl -X POST https://hermes-conductor.workers.dev/farms/my-niche/archive
```

## Scaling

- **One Workers Paid plan ($5/mo)** covers unlimited farms
- Each farm adds ~$2/mo for D1 + R2 storage
- 20-40 channels per farm is optimal for breakout signal
- Multiple farms = different content verticals, same infrastructure

## Cost Per Farm

| Service | Monthly |
|---------|---------|
| Workers (shared across farms) | $5.00 |
| D1 (per farm, ~100MB) | ~$0.10 |
| R2 (per farm, ~5GB) | ~$0.08 |
| Workers AI (research) | ~$2.00 |
| **Per additional farm** | **~$2.18** |
| **First farm total** | **~$7.18** |
