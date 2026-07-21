# Farm Setup Guide

## What You'll Have After This Guide

A deployed Cloudflare Worker with:
- D1 database for research data and hypothesis tracking
- R2 buckets for assets (private) and access to the global content genome (read-only)
- Two Queues for pipeline decoupling
- Cron triggers for daily/weekly/monthly research
- A Workflow definition for video production
- All parameterized by a single FARM_ID

## Prerequisites

- Cloudflare account with Workers Paid plan ($5/mo)
- Wrangler CLI installed and authenticated
- YouTube Data API key
- AI Gateway ID (optional, for LLM caching)

## Step 1: Choose a FARM_ID and Niche

```bash
export FARM_ID="tantra"
export NICHE="religious-history/tantra"
```

FARM_ID must be a valid slug (lowercase, hyphens only). Used to name all Cloudflare resources.

## Step 2: Provision Cloudflare Resources

```bash
# Create D1 database
npx wrangler d1 create farm-${FARM_ID}-db

# Note the database ID output. Add it to wrangler.jsonc.

# Create R2 buckets
npx wrangler r2 bucket create farm-${FARM_ID}-assets

# Create Queues
npx wrangler queues create farm-${FARM_ID}-pipeline
npx wrangler queues create farm-${FARM_ID}-render
```

## Step 3: Configure wrangler.jsonc

Replace `{FARM_ID}` with your actual FARM_ID throughout wrangler.jsonc.
Add the D1 database ID from Step 2.
Add API keys as secrets:

```bash
echo "AIzaSy..." | npx wrangler secret put YOUTUBE_API_KEY
echo "sk-..." | npx wrangler secret put AI_GATEWAY_ID
echo "..." | npx wrangler secret put DEEPGRAM_API_KEY
```

## Step 4: Apply Schema and Deploy

```bash
# Apply database schema
npx wrangler d1 execute farm-${FARM_ID}-db --file=src/d1/schema.sql

# Deploy Worker
npx wrangler deploy
```

## Step 5: Add Channels

Insert the YouTube channels you want to track:

```sql
INSERT INTO channels (channel_id, farm_id, name, competitor_type)
VALUES ('UCxxx', 'tantra', 'Channel Name', 'direct');
```

## Step 6: Verify Research Pipeline Runs

```bash
# Trigger daily research manually
curl -X POST https://farm-${FARM_ID}.workers.dev/__cron/daily-research

# Check gap map
curl https://farm-${FARM_ID}.workers.dev/api/research/gap-map
```

## Step 7: Optional — Set Up Docker Container (for local Hermes agent)

```bash
# Build the Hermes base image
docker build -t hermes-base -f Dockerfile .

# Run the farm container
docker run -d \
  --name farm-${FARM_ID} \
  --env FARM_ID=${FARM_ID} \
  --env YOUTUBE_API_KEY=${YOUTUBE_API_KEY} \
  --volume /data/farms/${FARM_ID}:/farm \
  --memory 1g \
  hermes-base
```
