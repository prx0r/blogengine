# Control Plane Design

## Architecture

The control plane is three things, not one:
1. A **Worker** that receives status reports from farms and exposes an API
2. A **D1 database** that stores pipeline state and pending approvals
3. A **dashboard UI** on Cloudflare Pages that reads from the API

Hermes doesn't change. It still calls HTTPS endpoints on farm Workers — same pattern as its existing astrology/journal API calls. The control plane is invisible to Hermes.

## Data Flow

```
1. HERMES proposes topic → POST /api/factory/produce on FARM WORKER
2. FARM WORKFLOW starts → on every stage transition → POST to CONTROL PLANE
3. FARM WORKFLOW hits WAIT_FOR_APPROVAL → POST to CONTROL PLANE (pending gate)
4. DASHBOARD shows pending gates → reads from CONTROL PLANE API
5. HUMAN clicks approve/reject → POST to CONTROL PLANE
6. CONTROL PLANE sends signed command to FARM WORKER's control endpoint
7. FARM WORKER verifies signature → executes against its own Workflow binding
8. FARM WORKFLOW continues or halts
```

No step requires Hermes to receive a callback. The flow is synchronous from the human's perspective: click approve, farm moves to next step.

## Hermes Integration Points

Hermes already calls HTTPS endpoints on Workers. The farm Worker exposes one new endpoint that Hermes calls:

| Endpoint | Method | What Hermes Does | Timeline |
|----------|--------|-------------------|----------|
| `/api/factory/produce` | POST | Hermes proposes a topic using its existing skill system | Now — same pattern as astrology API |
| `/api/factory/status` | GET | Hermes checks if a production is complete | After proposing |

Hermes doesn't need to know about the control plane at all. It talks to farms directly, same as today.

## D1 Schema (Control Plane)

```sql
CREATE TABLE farms (
  farm_id TEXT PRIMARY KEY,
  name TEXT,
  niche TEXT,
  status TEXT DEFAULT 'active',
  last_heartbeat TEXT,
  created_at TEXT
);

CREATE TABLE pipeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,        -- running, completed, failed, waiting_approval
  summary TEXT,                -- human-readable: "Treatment ready for: Chinnamasta"
  created_at TEXT NOT NULL,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE approval_gates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  gate_type TEXT NOT NULL,     -- treatment, script, publish
  summary TEXT,                -- human-readable: "Approve treatment for Chinnamasta"
  payload_json TEXT,           -- small metadata from the farm
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by TEXT,            -- "dashboard_user" or "hermes"
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE control_commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  command_type TEXT NOT NULL,  -- approve_gate, reject_gate, pause, resume, terminate
  payload_json TEXT,
  status TEXT DEFAULT 'pending', -- pending, delivered, failed
  created_at TEXT NOT NULL,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);
```

That's 4 tables. The `pipeline_events` table is append-only (immutable log). The `approval_gates` table is the operational table. The `control_commands` table is for auditing what commands were sent.

## Worker API Endpoints

```
POST /api/ingest/event          ← farms report stage transitions
POST /api/ingest/gate           ← farms report WAIT_FOR_APPROVAL
POST /api/ingest/heartbeat      ← farms report they're alive

GET  /api/farms                 ← list all farms with status
GET  /api/farms/:id             ← single farm drill-down
GET  /api/farms/:id/events      ← recent pipeline events for a farm

GET  /api/gates                 ← all pending gates across all farms
GET  /api/gates/:id             ← single gate detail
POST /api/gates/:id/resolve     ← approve or reject a gate

POST /api/control/:farm/:wf     ← send interrupt to a workflow instance
```

The ingest endpoints are POST from farm Workers. The GET endpoints are for the dashboard. The resolve endpoint is for the dashboard. The control endpoint sends signed commands to farm Workers.

## Dashboard Views

Three views, server-rendered HTML from the Worker (no SPA framework):

**View 1: Farm Grid** — table of all farms with last heartbeat, current stage, pending gates count, status indicator. Click a farm to see its detail.

**View 2: Approval Inbox** — table of all pending approval_gates across all farms. Each row: farm, gate_type, summary, time since created, approve/reject buttons. This is the primary operational view — it's where you spend your time.

**View 3: Farm Detail** — pipeline event history for a specific farm, current workflow state, interrupt buttons per running instance. Shows the farm's last 50 pipeline_events in reverse chronological order.

## Auth

Cloudflare Access in front of the dashboard Worker. Zero Trust rules — your email only. No auth code.

## Docker Compose

The VPS runs Hermes agents in Docker. Each farm gets one container:

```yaml
services:
  hermes-tantra:
    image: hermes-base
    container_name: hermes-tantra
    env_file: ./farms/tantra/.env
    volumes:
      - /data/farms/tantra:/farm
    mem_limit: 1g
    restart: unless-stopped

  hermes-frontier:
    image: hermes-base
    container_name: hermes-frontier
    env_file: ./farms/frontier/.env
    volumes:
      - /data/farms/frontier:/farm
    mem_limit: 1g
    restart: unless-stopped

networks:
  default:
    driver: bridge
```

Add a farm: copy the service block, change FARM_ID, create a new .env file, `docker compose up -d`.

The .env file per farm:
```bash
FARM_ID=tantra
YOUTUBE_API_KEY=
R2_ACCESS_KEY_ID=          # scoped to this farm's bucket only
R2_SECRET_ACCESS_KEY=
D1_DATABASE_ID=
CONTROL_PLANE_URL=https://control-plane.workers.dev
CONTROL_PLANE_TOKEN=       # shared secret for authenticating to control plane
```

## What This Replaces

Nothing in Hermes. The control plane is a new component. Hermes still proposes topics via HTTPS calls to farm Workers. The control plane handles the operational state tracking that Hermes currently can't do (no webhooks, no persistent state about running workflows).

## What This Doesn't Replace

- Hermes still chooses topics (its unique value)
- Hermes still does research (its unique value)  
- Hermes still calls farm Workers to start production
- Each farm's content stays in its own D1/R2 with scoped credentials

The control plane only stores what farms choose to report. It's a nervous system, not a brain.
