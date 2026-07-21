# Control Plane Design

## Architecture

Three components: a Worker API, a D1 database, and a dashboard UI. Hermes doesn't change — it still calls HTTPS endpoints on farm Workers directly, same as its existing astrology API calls.

## Data Flow

```
1. FARM reaches WAIT_FOR_APPROVAL → POSTs gate to CONTROL PLANE (with artifact_hash)
2. DASHBOARD displays pending gate → human sees exact version with hash
3. HUMAN approves/rejects/revises → POST to CONTROL PLANE
4. CONTROL PLANE atomically resolves gate, creates signed command
5. CONTROL PLANE sends command to FARM WORKER's control endpoint
6. FARM WORKER verifies signature, nonce, expiry, expected workflow state
7. FARM WORKER verifies artifact hash still matches
8. FARM WORKER applies command → emits pipeline event
9. CONTROL PLANE marks command acknowledged + applied
```

The approval binds to an exact artifact hash, not a mutable database pointer.

## Schema (5 tables)

```sql
CREATE TABLE farms (
  farm_id TEXT PRIMARY KEY,
  name TEXT, niche TEXT,
  status TEXT DEFAULT 'active',
  health_status TEXT DEFAULT 'unknown',
  auth_key_id TEXT,
  worker_url TEXT,
  last_heartbeat TEXT, last_event_at TEXT,
  config_version TEXT,
  created_at TEXT
);

CREATE TABLE workflow_instances (
  workflow_id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  topic_id TEXT,
  current_stage TEXT NOT NULL,
  status TEXT NOT NULL,
  active_gate_id TEXT,
  started_at TEXT, updated_at TEXT, completed_at TEXT,
  last_event_id TEXT,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
);

CREATE TABLE pipeline_events (
  event_id TEXT UNIQUE,
  farm_id TEXT NOT NULL, workflow_id TEXT NOT NULL,
  sequence_no INTEGER,
  event_type TEXT,
  stage TEXT, status TEXT,
  summary TEXT, payload_json TEXT,
  occurred_at TEXT, received_at TEXT,
  FOREIGN KEY (farm_id) REFERENCES farms(farm_id),
  UNIQUE(farm_id, workflow_id, sequence_no)
);

CREATE TABLE approval_gates (
  gate_id TEXT UNIQUE,
  farm_id TEXT NOT NULL, workflow_id TEXT NOT NULL,
  gate_type TEXT NOT NULL, gate_version INTEGER NOT NULL,
  artifact_ref TEXT, artifact_hash TEXT,
  summary TEXT, payload_json TEXT,
  status TEXT DEFAULT 'pending',
  decision TEXT, reason_codes JSON,
  superseded_by TEXT,
  expires_at TEXT,
  created_at TEXT, resolved_at TEXT,
  command_id TEXT,
  UNIQUE(farm_id, workflow_id, gate_type, gate_version)
);

CREATE TABLE control_commands (
  command_id TEXT UNIQUE,
  farm_id TEXT, workflow_id TEXT,
  gate_id TEXT,
  command_type TEXT NOT NULL,
  nonce TEXT UNIQUE, expires_at TEXT,
  payload_json TEXT, response_json TEXT,
  status TEXT DEFAULT 'pending',
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TEXT,
  acknowledged_at TEXT, applied_at TEXT,
  error_code TEXT, error_message TEXT,
  created_at TEXT
);
```

`pipeline_events` is the immutable history. `workflow_instances` is the current projection — dashboard reads this, not the event log. Gates carry `artifact_hash` so approval binds to an exact version.

## Signed Command Format

Every command from control plane to farm Worker includes:

```json
{
  "command_id": "cmd_abc123",
  "farm_id": "tantra",
  "workflow_instance_id": "wf_xyz",
  "action": "approve_gate",
  "gate_id": "gate_789",
  "timestamp": "2026-07-21T12:00:00Z",
  "nonce": "a1b2c3d4",
  "expires_at": "2026-07-21T12:05:00Z",
  "body_hash": "sha256:...",
  "signature": "hmac_sha256(...)"
}
```

Farm verifies: farm_id matches, signature valid, nonce unused, timestamp within 5 minutes, expected workflow state. Never use a shared CONTROL_PLANE_TOKEN across farms — each farm has its own signing secret stored as a Worker secret, not in D1.

Command outcomes: pending → sent → acknowledged → applied → completed. Or: pending → sent → failed. The control plane never infers success from HTTP 200 alone.

## Gate Resolution

Three outcomes, not two:

- **Approve** → workflow continues. Stores artifact_hash that was approved.
- **Revise** → returns to previous generation stage with reason_codes and notes. Does not kill the workflow.
- **Terminate** → closes workflow, cancels pending gates.

Resolution uses compare-and-set:

```sql
UPDATE approval_gates SET status = 'approved', decision = 'approve'
WHERE gate_id = ? AND status = 'pending' AND gate_version = ?;
```

If zero rows updated → 409 Conflict. Prevents stale approvals from old browser tabs.

Structured reviewer feedback:
```json
{
  "decision": "revise",
  "reason_codes": ["weak_hook", "insufficient_sources"],
  "notes": "The topic is good but the opening relies too heavily on supernatural framing."
}
```

## Dashboard Views

Three views, server-rendered HTML:

**Approval Inbox** — the primary view. Each card shows: farm, topic, gate_type, age, artifact_version, artifact_hash, risk flags. Buttons: Approve (A), Revise (R), Terminate (X). Navigate with J/K.

**Farm Grid** — health status, current workflow count, oldest pending gate, last heartbeat, last successful production, 24h failure count.

**Farm Detail** — workflow timeline, expandable raw event JSON, interrupt buttons (pause, resume, terminate, retry_stage, restart_from_stage).

## Heartbeat

Farm reports:
```json
{
  "farm_id": "tantra",
  "agent_alive": true,
  "worker_reachable": true,
  "queue_depth": 3,
  "running_workflows": 1,
  "oldest_job_age_seconds": 420,
  "last_success_at": "...",
  "config_version": "farm-template-0.4.1"
}
```

Health states: healthy, degraded, stalled, offline, misconfigured.

No heartbeat for 5 minutes → offline. Workflow stage unchanged beyond SLA → stalled. Repeated failures → degraded. Schema version mismatch → misconfigured.

## Interrupt Semantics

| Command | Effect |
|---------|--------|
| `pause` | Complete current atomic step, then stop. Not mid-write. |
| `resume` | Only valid from paused state. |
| `terminate` | Mark workflow terminal, cancel pending gates. |
| `retry_stage` | Retry current failed stage with same inputs. |
| `restart_from_stage` | New attempt preserving original event history. |

`retry_stage` and `restart_from_stage` will be used more often than terminate.

## Build Order

**Critical vertical slice first:**
1. farms + workflow_instances + pipeline_events + approval_gates + control_commands tables
2. Authenticated event ingestion (POST from farms)
3. Gate creation (farm hits WAIT_FOR_APPROVAL → gate appears)
4. Approval inbox (dashboard reads pending gates)
5. Atomic gate resolution + signed command delivery
6. Farm command verification + application
7. Command acknowledgement event

Once this works end-to-end, add heartbeats, farm grid, interrupts, health calculations, farm detail view.

## Auth

Cloudflare Access in front of the dashboard. Zero Trust — your email only. No auth code.

Farm → control plane authentication uses per-farm secrets stored as Worker secrets, not in D1. A shared CONTROL_PLANE_TOKEN means compromise of one farm lets it impersonate all farms.

## Docker Compose

One service block per farm. Add a farm: copy block, change FARM_ID, new .env file, `docker compose up -d`.

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
```

Per-farm .env (note: per-farm secret, not shared token):
```bash
FARM_ID=tantra
YOUTUBE_API_KEY=
R2_ACCESS_KEY_ID=          # scoped to this farm's bucket only
R2_SECRET_ACCESS_KEY=
D1_DATABASE_ID=
CONTROL_PLANE_URL=https://control-plane.workers.dev
CONTROL_PLANE_SECRET=      # PER-FARM secret, not shared
```

## Key Changes from V1

| V1 | V2 | Why |
|----|----|-----|
| 4 tables | 5 tables (added workflow_instances) | Current state projection is faster than scanning events |
| Auto-increment IDs | Farm-generated event_id + UNIQUE constraints | Idempotency on retry |
| No gate versioning | gate_version + artifact_hash + compare-and-set | Prevents stale approval from old browser tab |
| Shared CONTROL_PLANE_TOKEN | Per-farm secret | Compromise of one farm doesn't compromise all |
| Binary approve/reject | Approve / Revise / Terminate | Revision doesn't kill the workflow |
| No artifact hash | artifact_hash on gates | Approve exact version, not mutable pointer |
| Basic heartbeat | Health states + queue depth + config version | Dashboard is operational, not decorative |
| Pause/resume/terminate | + retry_stage + restart_from_stage | Recovery without workflow death |
| Build dashboard first | Build critical slice first (gate → approve → resume) | Without this working, the dashboard is decorative |
