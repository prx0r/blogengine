# Dashboard Stream — Operator Cockpit

## Vision

One browser tab to monitor farms, approve gates, prompt Hermes, preview FableCut timelines, and check analytics. Not a monolith — a thin shell that talks to everything.

## Architecture

```
Dashboard (Cloudflare Pages, server-rendered HTML)
  │
  ├── Control Plane API (pipeline state, approval gates, farm health)
  ├── Farm Workers (trigger research, check status)
  ├── FableCut (embed timeline preview, trigger render)
  ├── Hermes Gateway (send prompts, receive responses)
  └── TryPost API (publishing status, analytics)
```

The dashboard is a read/write view across all systems. It doesn't own any data — it's a window.

## Integration Points

### Hermes Prompting

Each farm has a Hermes agent running in a Docker container on the VPS. Hermes already has a Telegram gateway running as a systemd service (`hermes-gateway.service`). The dashboard uses this existing gateway instead of adding a new HTTP endpoint.

The dashboard chat panel POSTs to Telegram's Bot API as if it were a user message. Hermes receives it via the existing Telegram gateway polling loop, processes it, and sends the response back. The dashboard displays the response.

**Decision: Use Telegram API, not a custom HTTP endpoint.** The Telegram gateway already exists, is running, has cron scheduling, and is battle-tested. Adding a second channel duplicates the auth surface and divides Hermes's attention. The dashboard simply wraps the Telegram API.

```python
# Dashboard → Telegram Bot API → Hermes Gateway → Hermes → response
import requests
TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={
    "chat_id": CHAT_ID,
    "text": f"[dashboard] {message}",
    "parse_mode": "Markdown"
})
```

Each farm container has its own Hermes identity. The dashboard's chat panel targets a specific farm. Hermes responds with "I'm the Tantra channel's research assistant" vs "I'm the Frontier Science channel's research assistant."

Per-farm identity:
```bash
# farms/tantra/.env
HERMES_NAME="Ochema Guide"
HERMES_PERSONALITY="You are a research assistant for a tantra documentary channel..."
```

### FableCut Integration

FableCut runs on localhost:7777 on the VPS. A cloudflared tunnel is already running (started Jul 20) exposing it to a `*.trycloudflare.com` URL. FableCut itself is running on port 7777.

The dashboard embeds the tunnel URL in an iframe for timeline preview.

**Status:** FableCut running. Tunnel running. Dashboard just needs the embed.

The dashboard needs:
- **Timeline preview** — embed FableCut's player view for the current video in production
- **Render trigger** — button that sends FableCut's project to export
- **Status check** — is the render done? Did it succeed?
- **Asset browser** — what media is loaded in the current project?

Since FableCut is a local service, access it through a Cloudflare Tunnel (`cloudflared tunnel`) that exposes a URL. The dashboard embeds that URL. Only the dashboard's Cloudflare Access policy can reach it — not the public internet.

### User Iteration Loop

The dashboard should support the feedback loop:

1. Video renders → dashboard shows preview
2. You watch, make notes
3. Dashboard sends notes back to Hermes: "The pacing in segment 3 is too slow, add visual variety"
4. Hermes revises the script/beat sheet
5. Farm re-renders
6. Repeat

This is the approve/revise workflow extended beyond gates. The dashboard is where you watch drafts, leave revision notes, and iterate.

## Views

### Main Nav
```
[Dashboard] [Farms] [Approvals] [Chat] [FableCut] [Analytics]
```

### Dashboard (Home)
- Farm health grid (current stage, last heartbeat, pending gates)
- Quick approve/reject from the farm grid
- One-click "prompt Hermes" per farm

### Farm Detail
- Pipeline stage timeline
- Current workflow state
- Chat panel for that farm's Hermes
- FableCut preview (if a video is rendering)
- Interrupt buttons (pause/resume/terminate/retry)

### Approvals
- Unified inbox across all farms
- Keyboard shortcuts (A/R/X, J/K)
- Artifact hash displayed, expandable diff

### Chat
- Per-farm Hermes conversation panel
- History persists in control plane D1
- Hermes responds with its farm-specific persona

### FableCut
- Embedded timeline preview via Cloudflare Tunnel
- Render trigger + status
- Asset browser

### Analytics
- TryPost publishing status
- YouTube Analytics summaries
- Cross-farm comparison table

## Hermes Identity Per Channel

Each farm's Hermes agent gets its own name and personality:

```bash
# farms/tantra/.env
FARM_ID=tantra
HERMES_NAME="Ochema Guide"
HERMES_PERSONALITY="You are a research assistant for a tantra documentary channel. You specialize in Kashmir Shaivism, Indian philosophy, and religious history. You are scholarly but accessible."

# farms/frontier/.env  
FARM_ID=frontier
HERMES_NAME="Frontier Navigator"
HERMES_PERSONALITY="You are a research assistant for a frontier science channel. You specialize in consciousness studies, bioelectricity, and active inference. You translate complex science into engaging narratives."
```

The dashboard chat panel reads `HERMES_NAME` from the farm's config and displays it as the chat partner. Hermes uses `HERMES_PERSONALITY` as its system prompt.

## Build Priority

```
Must have (start here):
├── Control plane API (5 tables, 10 endpoints) — already designed
├── Approval inbox (the only view that blocks production)
├── Chat panel for one farm (test Hermes prompting from dashboard)

Should have (next):
├── Farm grid with health states
├── FableCut timeline preview via tunnel
├── Per-farm Hermes identity (name + personality)

Nice to have (later):
├── Render trigger from dashboard
├── Analytics views
├── Cross-farm comparison
├── Revision notes workflow
```

## Files

| File | Purpose |
|------|---------|
| `pipelines/control-plane-design.md` | Full schema, endpoints, signed commands, gate resolution |
| `farm-template/src/index.ts` | Farm Worker with control plane reporting stubs |
| `pipelines/dashboard-stream.md` | This file — the dashboard vision |
