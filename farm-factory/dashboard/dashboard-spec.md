# Farm Dashboard — Control Plane Spec

## Architecture

```
[Your device] → Cloudflare Access (auth) → Dashboard Worker → Global D1 (metadata)
                                                              │
                                 ┌────────────────────────────┼────────────────────────────┐
                                 ▼                            ▼                            ▼
                              Farm A                       Farm B                       Farm C
                           (tantra)                   (frontier-science)            (next probe)
                         D1 + R2 + Workers           D1 + R2 + Workers           D1 + R2 + Workers
                         Hermes container            Hermes container            Hermes container
```

Three layers, strictly separated. Dashboard touches only the global D1 (metadata, control). NEVER reaches into a farm's D1 or R2 directly — farms report their status voluntarily.

## Global D1 Schema (Control Plane)

```sql
-- Farm registry
CREATE TABLE farms (
  farm_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  status TEXT DEFAULT 'active',  -- active, paused, error, archived
  created_at TEXT,
  last_status_at TEXT,          -- last time this farm reported in
  hermes_container_id TEXT,     -- Docker container ID on the VPS
  hermes_container_status TEXT, -- running, stopped, restarting
  r2_bucket TEXT,
  d1_database TEXT,
  workers_url TEXT
);

-- Pipeline stage tracking (reported by each farm on stage transitions)
CREATE TABLE pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT,              -- Workflow instance ID
  stage TEXT NOT NULL,           -- research_pack, treatment, script, audio, thumbnail, render, publish
  status TEXT DEFAULT 'running', -- running, waiting_approval, completed, failed
  started_at TEXT,
  completed_at TEXT,
  error TEXT,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

-- Approval queue (all WAIT_FOR_APPROVAL items across all farms)
CREATE TABLE approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  stage TEXT NOT NULL,           -- which stage needs approval
  item_type TEXT,                -- treatment, script, publish
  item_summary TEXT,             -- human-readable summary of what needs approval
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TEXT,
  decided_at TEXT,
  decided_by TEXT,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

-- Topic opportunity (each farm reports its top gap topics)
CREATE TABLE topic_opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  cluster TEXT,
  opportunity_score REAL,
  gap_score REAL,
  reported_at TEXT,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

-- Global cross-farm analytics
CREATE TABLE cross_farm_metrics (
  date TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  videos_produced INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  avg_breakout_score REAL,
  hypothesis_count INTEGER DEFAULT 0,
  confirmed_hypotheses INTEGER DEFAULT 0,
  PRIMARY KEY (date, farm_id)
);
```

## Dashboard Features

### 1. Farm Grid

```
┌─────────────────────────────────────────────────────────────────┐
│  FARMS                                              [+ New Farm] │
├────────────┬──────────┬──────────┬────────┬────────┬────────────┤
│  Farm      │ Niche    │ Status   │ Stage  │ Topics │ Last Seen  │
├────────────┼──────────┼──────────┼────────┼────────┼────────────┤
│  tantra    │ Tantra   │ ● active │ render │ 12     │ 2m ago     │
│  frontier  │ Frontier │ ○ paused │ ─      │ 8      │ 2d ago     │
│  next-probe│ ???      │ ◐ seed   │ ─      │ 0      │ never      │
└────────────┴──────────┴──────────┴────────┴────────┴────────────┘
```

### 2. Approval Inbox

```
┌───────────────────────────────────────────────────────────────┐
│  APPROVALS NEEDED (3)                              [View All] │
├──────┬───────────┬──────────────────────────┬────────┬───────┤
│ Farm │ Type      │ Summary                  │ Since  │       │
├──────┼───────────┼──────────────────────────┼────────┼───────┤
│ tant │ treatment │ Chinnamasta doc ready    │ 2h ago │ [✓] [✗]│
│ tant │ publish   │ Cremation ground ep. 3   │ 30m ago│ [✓] [✗]│
│ tant │ script    │ Bagalamukhi script done  │ 5m ago │ [✓] [✗]│
└──────┴───────────┴──────────────────────────┴────────┴───────┘
```

### 3. Per-Farm Drill-Down

Click a farm → see:
- Current pipeline stage with progress
- Recent videos produced (title, stage, date)
- Topic gap map (top opportunities this farm has found)
- Hypothesis results (what's been tested)
- Links to R2 assets (thumbnails, scripts, audio)
- Container controls (restart, logs, resource usage)

### 4. Cross-Farm Opportunity View

```
┌──────────────────────────────────────────────────────────────────┐
│  UNCOVERED NICHES (what no farm is covering)                     │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ Topic    │ Demand   │ Supply   │ Gap      │ Could Be Farm For    │
├──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ Alchemy  │ 📈 high  │ 📉 low   │ ██████░  │ tantra (alchemy hist)│
│ Levin    │ 📈 high  │ ████░░  │ ████░░  │ frontier (new farm)  │
│ NDE      │ 📈 med   │ ██░░░░  │ ██████░  │ frontier or new      │
│ Gnostic  │ 📈 med   │ ███████ │ ░░░░░░  │ saturated, skip      │
└──────────┴──────────┴──────────┴──────────┴──────────────────────┘
```

### 5. Global Interrupt

```
┌──────────────────────────────────────────────────────────────────┐
│  [⏸ Pause All]  [▶ Resume All]  [🔄 Restart Failed]  [⚠ Emergency Stop] │
│                                                                  │
│  Per farm: [⏸] [▶] [🔄] [⚠]                                     │
│  Per workflow instance: [⏸] [▶] [🔄]                             │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation

### Dashboard Worker

A single Cloudflare Worker that:
1. Serves a HTML/JS UI (or a SPA from R2)
2. Reads from global D1 for all views
3. Writes to global D1 for approvals
4. Calls Workflows API for interrupt actions
5. Protected by Cloudflare Access (Zero Trust)

### How Each Farm Reports

Each farm's existing Workflow already has `WAIT_FOR_APPROVAL` steps. Add one line before each approval:

```typescript
// At every pipeline stage transition in the farm Worker:
await env.GLOBAL_D1.prepare(
  `INSERT INTO pipeline_stages (farm_id, workflow_id, stage, status) 
   VALUES (?, ?, ?, ?)`
).bind(env.FARM_ID, workflowId, currentStage, "waiting_approval").run();
```

That's it. One insert per stage transition. The dashboard reads these. Never pulls from farm DBs directly.

### Auth

Cloudflare Access in front of the dashboard Worker. Zero Trust rules:
- Only your email/GSuite/SSO group
- Session duration: 24h
- No auth code to maintain

### New Farm Creation Flow (The "Research Probe")

From the dashboard, one click:

```
1. Generate FARM_ID + scoped R2/D1 credentials
2. Provision D1 database + apply schema
3. Provision R2 bucket + scoped API token
4. Create Queue pair (pipeline + render)
5. Write farm config to global D1 registry
6. On the VPS: docker run hermes-agent --farm-id={FARM_ID} --env-file={config}
7. Worker deploys (manual: wrangler deploy)
```

The dashboard doesn't deploy Workers automatically (too risky) — it generates the config and prints the deploy command.

### The "Probe" Expansion Strategy

1. **Start tantra** (you're doing this)
2. **Add frontier-science** (Michael Levin, bioelectricity, active inference, consciousness science) — this is the second probe. It generates content that also feeds the tantra channel (science-adjacent tantra topics).
3. **Dashboard shows uncovered niches** — the cross-farm opportunity view compares what topics exist in the research corpus vs what each farm is producing. Where there's demand but no farm → that's the next probe.
4. **Seed a new farm** — click "Create Farm" from the dashboard, set FARM_ID + CHANNEL_IDS + niche config. The probe starts collecting data, finding gaps, producing content.
5. **Each farm is a research experiment** — a hypothesis about "this niche can sustain a documentary channel." Some probes will show strong signal (high gap scores, high replication, strong engagement). Some will show weak signal. The dashboard tracks this.

### Container Strategy

```
VPS (CX33 or larger)
├── Docker: hermes-tantra
│   ├── FARM_ID=tantra
│   ├── Mount: /data/tantra/ (R2 cache, temp files)
│   ├── Env: YOUTUBE_API_KEY, R2_TOKEN, D1_ID
│   └── Port: none (headless, API callbacks)
│
├── Docker: hermes-frontier-science
│   ├── FARM_ID=frontier-science
│   ├── Mount: /data/frontier-science/
│   ├── Env: ...
│   └── Port: none
│
└── Docker: hermes-next-probe
    └── ...
```

Each container is a full Hermes agent process with its own identity. Promoting to a dedicated VPS later = `docker stop` on shared → `docker start` on new box.

## Files Created

| File | Purpose |
|------|---------|
| `farm-factory/control-plane/src/index.ts` | Dashboard Worker |
| `farm-factory/control-plane/src/schema.sql` | Global D1 schema |
| `farm-factory/control-plane/wrangler.jsonc` | Dashboard bindings |
| `farm-factory/docker/hermes-container.Dockerfile` | Containerized Hermes |
| `farm-factory/docker/docker-compose.yml` | Multi-farm orchestration |
| `scripts/create-farm.sh` | Updated with probe flow |
