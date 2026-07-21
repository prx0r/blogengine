# Farm Franchise — Practical Implementation Spec

## The Model

A franchise is one content channel. The franchisor (you) owns the platform. Each franchisee (farm) is an independent operating unit that can be cloned, monitored, and eventually retired without affecting the others.

```
Franchisor (you)
├── Platform: Cloudflare (global infra)
│   ├── Control plane D1 (farm registry, approvals, health)
│   ├── Global R2 (shared art library, research corpus, genome patterns)
│   ├── Dashboard Worker (approval UI, cross-farm view)
│   └── Cloudflare Access (auth for you only)
│
├── VPS: Hetzner CX33 or similar
│   ├── Docker: hermes-tantra (farm container #1)
│   ├── Docker: hermes-frontier (farm container #2)
│   └── Docker: hermes-next-probe (farm container #3)
│
└── Each farm has:
    ├── D1 database (its own data)
    ├── R2 bucket (its own assets, scoped credentials)
    ├── Workers (its own API + cron)
    ├── Queues (its own pipeline + render)
    └── Hermes container (its own agent process)
```

This is not aspirational. You have all the pieces already. The only thing missing is the wiring between them.

---

## The VPS Setup

### Current Hardware

Hetzner CX33: 2 vCPU, 4 GB RAM, 75 GB disk, ~€5/month.

One container per farm. Each container gets:
- Its own resource limits (CPU shares, memory limit)
- Its own env vars (FARM_ID, API keys, R2 credentials)
- Its own mounted volume for temp/cache
- Its own Hermes agent process

### What Runs on the VPS

```
VPS
├── Docker Engine
│   ├── hermes-base (image, shared across all farm containers)
│   │   ├── Node.js runtime
│   │   ├── Python runtime
│   │   ├── FFmpeg
│   │   ├── edge-tts / Deepgram CLI
│   │   └── Hermes agent binary
│   │
│   ├── Container: farm-tantra
│   │   ├── --env FARM_ID=tantra
│   │   ├── --env YOUTUBE_API_KEY=...
│   │   ├── --env R2_BUCKET=farm-tantra-assets
│   │   ├── --volume /data/farms/tantra:/farm
│   │   ├── --memory 1g --cpus 0.5
│   │   └── hermes-base
│   │
│   ├── Container: farm-frontier
│   │   ├── --env FARM_ID=frontier
│   │   ├── --env R2_BUCKET=farm-frontier-assets
│   │   ├── --volume /data/farms/frontier:/farm
│   │   ├── --memory 1g --cpus 0.5
│   │   └── hermes-base
│   │
│   └── Container: farm-next-probe
│       └── (same pattern, different FARM_ID)
│
├── Docker Compose (/root/farms/docker-compose.yml)
└── Data directory (/data/farms/{farm_id}/)
    ├── config/    ← farm-manifest.yaml, env files
    ├── cache/     ← R2 warm cache, temp render files
    ├── logs/      ← container logs, Hermes session logs
    └── state/     ← local SQLite for Hermes memory
```

### Docker Compose

```yaml
# /root/farms/docker-compose.yml
version: "3.9"

x-hermes-base: &hermes-base
  image: hermes-factory:latest
  restart: unless-stopped
  networks:
    - farm-network
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

services:
  farm-tantra:
    <<: *hermes-base
    container_name: farm-tantra
    env_file: ./farm-tantra/.env
    volumes:
      - /data/farms/tantra:/farm
    mem_limit: 1g
    cpus: 0.5

  farm-frontier:
    <<: *hermes-base
    container_name: farm-frontier
    env_file: ./farm-frontier/.env
    volumes:
      - /data/farms/frontier:/farm
    mem_limit: 1g
    cpus: 0.5

networks:
  farm-network:
    driver: bridge
```

### Hermes Container Image

```dockerfile
# Dockerfile
FROM node:22-slim

RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg curl \
    && rm -rf /var/lib/apt/lists/*

# Hermes agent
COPY hermes-agent /usr/local/bin/hermes-agent

# Farm factory Workers (deployed separately, but code accessible)
COPY farm-factory /farm-factory

WORKDIR /farm
ENTRYPOINT ["hermes-agent", "--config", "/farm/config/farm-manifest.yaml"]
```

Build once, deploy many times with different env vars.

---

## The Franchise Seed

Creating a new farm creates these files:

```
/root/farms/{farm_id}/
├── .env                    ← Env vars for this container
├── config/
│   ├── farm-manifest.yaml  ← Identity + capabilities
│   └── channel-config.yaml ← Niche-specific settings
└── state/                  ← Created at runtime
    ├── hermes-memory.db    ← Hermes local SQLite
    └── cache/              ← Temp files
```

### farm-manifest.yaml

This is the single most important file. It declares everything a farm is and can do.

```yaml
# /root/farms/tantra/config/farm-manifest.yaml
farm:
  id: "tantra"
  name: "Ochema"
  niche: "religious-history/tantra"
  created: "2026-07-21"
  version: 1

identity:
  audience_promise: "Hidden history of Indian philosophy and consciousness"
  forbidden_framings:
    - "science proves tantra"
    - "shocking = common practice"
    - "nonduality erases ethics"
  evidence_standards:
    - "primary_text"
    - "academic_indology"
    - "museum_record"

resources:
  cloudflare:
    account_id: "954612afb5a97bb15dddcdc70176813d"
    d1: "farm-tantra-db"
    r2:
      private: "farm-tantra-assets"
      global_read: "farm-global-library"
    queues:
      pipeline: "farm-tantra-pipeline"
      render: "farm-tantra-render"
    workers:
      api: "https://farm-tantra.workers.dev"

  vps:
    container: "farm-tantra"
    memory_mb: 1024
    cpus: 0.5
    mount: "/data/farms/tantra"

pipeline:
  research_cadence: "daily_harvest_weekly_gap"
  max_concurrent_productions: 1
  default_video_duration_min: 15
  approval_required_for:
    - "treatment"
    - "publish"

channels:
  - channel_id: "UC0SL9zVE00Inywpip5dbnmQ"
    name: "Adhyatmiksutra-f9w"
    type: "source"
  - channel_id: "UC..."
    name: "..."
    type: "authority"
  - channel_id: "UC..."
    name: "..."
    type: "narrative"

topic_clusters:
  - name: "deity"
    terms: ["Kali", "Bhairava", "Chinnamasta", "Bagalamukhi", "Dhumavati"]
  - name: "practice"
    terms: ["cremation ground", "nyasa", "puja", "dhyana", "bija"]
  - name: "philosophy"
    terms: ["Abhinavagupta", "Pratyabhijna", "Spanda", "Trika", "Kaula"]
  - name: "history"
    terms: ["tantraloka", "kashmir shaivism", "kapalika", "siddha"]
  - name: "taboo"
    terms: ["marana", "abhicara", "pancha makara", "vamachara"]
```

### .env file

```bash
# /root/farms/tantra/.env
FARM_ID=tantra
HERMES_MODE=production

# YouTube
YOUTUBE_API_KEY=AIza...

# Cloudflare — scoped to farm-tantra only
CLOUDFLARE_ACCOUNT_ID=954612afb5a97bb15dddcdc70176813d
R2_ACCESS_KEY_ID=b31c...
R2_SECRET_ACCESS_KEY=cce...
D1_DATABASE_ID=...

# AI
VIDEO_LLM_API_KEY=sk-...
DEEPGRAM_API_KEY=...

# Control plane (where to report status)
CONTROL_PLANE_URL=https://dashboard.workers.dev
CONTROL_PLANE_TOKEN=...
```

---

## The Control Plane Connection

Each farm reports its status to the global D1 on every pipeline stage transition. The dashboard reads the global D1. The control plane sends signed commands back.

### Farm Reports Status

```typescript
// Inside the farm Worker, at every stage transition:
await fetch(env.CONTROL_PLANE_URL + "/api/farm/status", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.CONTROL_PLANE_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    farm_id: env.FARM_ID,
    workflow_id: workflowId,
    stage: currentStage,
    status: "waiting_approval",
    started_at: new Date().toISOString(),
    item_summary: `Treatment ready for: ${topic}`,
  })
});
```

### Control Plane Sends Commands

```typescript
// Dashboard Worker sends signed command to farm endpoint
const command = {
  command_id: crypto.randomUUID(),
  farm_id: "tantra",
  workflow_instance_id: "wf_abc123",
  action: "send_event",
  event_type: "approval_resolved",
  payload: { gate_id: "gate_xyz", resolution: "approved" },
  issued_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 600000).toISOString(),
};

// Sign with HMAC using shared secret
const signature = crypto.createHmac("sha256", SHARED_SECRET)
  .update(JSON.stringify(command))
  .digest("hex");

// Send to farm's Worker endpoint (not directly to Workflow API)
await fetch(`https://farm-tantra.workers.dev/api/control/command`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...command, signature }),
});
```

The farm Worker verifies the signature, checks expiry, checks command ID not reused, then executes the action against its own Workflow binding.

---

## Creating a New Farm

```bash
# One script. Run on the VPS.
./scripts/create-farm.sh frontier

# What it does:
# 1. Generates farm-manifest.yaml from template + prompts
# 2. Creates /root/farms/frontier/ with .env + config
# 3. Provisions Cloudflare resources:
#    - D1 database + apply schema
#    - R2 bucket + scoped API token
#    - Queues (pipeline + render)
#    - Workers (wrangler deploy with FARM_ID=frontier)
# 4. Registers farm in global D1 control plane
# 5. Adds service to docker-compose.yml
# 6. Starts container: docker compose up -d farm-frontier
```

The operator only supplies:
- `FARM_ID` (slug)
- Niche description
- Channel IDs (YouTube channels to track)
- Topic clusters

Everything else is generated or derived.

---

## The Expansion Strategy

```
2026 Q3: 1 farm (tantra)
  │
  ├── Tantra produces 10 videos
  ├── Dashboard shows frontier-science as uncovered gap
  │   (Levin, bioelectricity, consciousness — adjacent audience)
  │
  └── → Create farm-frontier
        │
        ├── Frontier produces 10 videos
        ├── Some topics also feed tantra (science-adjacent tantra)
        ├── Cross-farm opportunity view shows next gap
        │
        └── → Create next probe
              │
              ├── Each farm is an experiment
              ├── Dashboard tracks: gap_found → farm_created → content_produced → audience_response
              └── Some probes will show strong signal, some weak
```

Each farm is independent but the genome (global library of hooks, patterns, templates) makes them collectively smarter without becoming clones.

---

## File Structure

```
/root/
├── farms/                     ← All farm containers
│   ├── docker-compose.yml     ← Orchestrates all farm containers
│   ├── hermes-base/           ← Dockerfile for the base image
│   ├── farm-tantra/
│   │   ├── .env
│   │   └── config/
│   │       ├── farm-manifest.yaml
│   │       └── channel-config.yaml
│   ├── farm-frontier/
│   │   └── ... (same structure)
│   └── farm-next-probe/
│       └── ... (same structure)
│
├── projects/blog/             ← Your existing repo (source of truth for Workers)
│   ├── farm-factory/          ← Farm template (source for all Worker code)
│   ├── pipelines/             ← Research pipeline specs
│   ├── hermes/                ← Hermes skills and agent config
│   ├── scripts/               ← Layer 1-2 test scripts
│   ├── data/                  ← Research outputs, reports
│   └── docs/                  ← API references
│
└── .env.local                 ← Your personal Cloudflare credentials (never in git)
```

The repo stays the source of truth for code. The `/root/farms/` directory is the runtime — it's generated from the repo + farm-manifest.yaml.

---

## Summary

| Piece | Status | What's Missing |
|-------|--------|----------------|
| Farm template (Workers, D1, R2) | Done at `farm-factory/` | Deployment wiring, YouTube API client |
| Research pipeline (Layer 1) | Done — A1/A2 pass on YouNiverse | Layer 2 API tests |
| Hermes container image | Not started | Dockerfile + entrypoint |
| Farm manifest schema | Spec'd above | Needs to be written as JSON Schema |
| Create-farm script | Skeleton at `farm-factory/scripts/` | Needs full provisioning flow |
| Control plane D1 | Schema designed | Needs Worker implementation |
| Dashboard Worker | Spec'd | Needs implementation |
| Scoped R2 credentials | Not started | Needs API automation |
| Global R2 library | Not started | Art + patterns |

The critical path: **farm manifest → create-farm script → control plane → dashboard**. Everything else depends on the farm being a first-class declarative object.
