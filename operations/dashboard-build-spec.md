# Dashboard Build Spec — Operator Cockpit

## Architecture

**Stack:** Python Flask + vanilla JS + SSE for live updates
**Port:** 8766
**Runtime:** Systemd service (restarts on boot)
**Memory target:** < 200 MB RSS
**Dependencies:** flask, requests, pyyaml (all pip-installable)

```
VPS (4 core, 8 GB RAM, no GPU)
  ├── FableCut (:7777) — editor + timeline
  ├── Dashboard (:8766) — THIS BUILD
  ├── Thumbnail server (:8765) — existing
  ├── Hermes gateway (systemd) — existing
  └── Your site (Cloudflare) — existing
```

No database. State lives in:
- Filesystem (`tantrafiles/blueprints/`, `data/research/layer2/`)
- R2 (thumbnails, video metadata)
- FableCut project.json
- Hermes Telegram gateway

---

## Directory Structure

```
/root/projects/blog/dashboard/
  server.py                  ← Flask app, single file
  static/
    index.html               ← Main SPA, loads all views
    app.js                   ← Client logic, SSE listener
    style.css                ← Dark theme, minimal
  templates/                 ← If needed for server-rendered views
```

---

## API Endpoints

### `GET /api/status`
Returns system health:
```json
{
  "fablecut": "running",
  "hermes": "running",
  "thumbnails": "running",
  "blueprints": 2,
  "channels_analyzed": 149,
  "videos_analyzed": 19290,
  "last_model_training": "2026-07-21"
}
```

### `GET /api/blueprints`
List all blueprints with status:
```json
{
  "blueprints": [
    {"id": "TBP-026", "title": "Why Were the Yoginī Temples...", "channel": "Tantra Files",
     "status": "researching", "beats": 12, "duration": 20,
     "predicted_breakout": 0.68,
     "created": "2026-07-21"}
  ]
}
```
**Implementation:** Read `tantrafiles/blueprints/*.md`, parse YAML frontmatter + title.
**Status logic:** Check if `content/publishing/scripts/{id}/` exists → has beat-map → has media → has exported video.

### `GET /api/blueprints/<id>`
Full blueprint detail with pipeline stage:
```json
{
  "id": "TBP-026",
  "title": "...",
  "channel": "Tantra Files",
  "beats": 12,
  "duration": 20,
  "pipeline": {
    "research": "done",
    "storyboard": "done",
    "voiceover": "pending",
    "artwork": "pending",
    "fablecut_timeline": "done",
    "rendered": false,
    "published": false
  },
  "predictions": {"breakout_probability": 0.68, "baseline": 0.25},
  "assets_needed": 24,
  "assets_loaded": 0
}
```
**Implementation:** Parse blueprint markdown. Check filesystem for media.

### `POST /api/blueprints/<id>/generate`
Triggers the blueprint → FableCut pipeline:
- Runs `blueprint-to-fablecut.py`
- Returns generated beat-map + project paths

### `GET /api/channels`
Channel performance summary:
```json
{
  "channels": [
    {"name": "ESOTERICA", "subs": 1120000, "median_views": 49487,
     "breakout_rate": 0.32, "status": "active"}
  ]
}
```
**Implementation:** Read `data/research/layer2/analysis_*.json` directly.

### `GET /api/channels/<name>`
Full channel detail including top/bottom videos, title patterns, thumbnail analysis.

### `GET /api/fablecut/status`
Proxies FableCut health:
- `curl localhost:7777/` → parse response
- Returns running/stopped, project name, clip count

### `POST /api/hermes/send`
Sends message to Hermes via Telegram gateway:
```python
requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={
    "chat_id": CHAT_ID,
    "text": f"[dashboard] {message}",
    "parse_mode": "Markdown"
})
```
**Response:** echo the message ID + timestamp.

### `GET /api/hermes/messages`
Polls recent Hermes responses (reads from Telegram or a log file).

### `GET /api/analytics/overview`
Returns:
- Total views across all channels
- Top 10 videos this week
- Breakout rate trends
- Prediction accuracy (if post-publish data exists)
**Implementation:** Sum from `analysis_*.json`, compute from breakout flags.

### `GET /api/predict?title=...&channel=...`
Runs `predict_views.py` on the fly:
```python
import subprocess
result = subprocess.run(["python3", "predict_views.py", title], capture_output=True)
return json.loads(result.stdout)
```

---

## Frontend Views

### Dashboard Home (`/`)
```
┌────────────────────────────────────────────────┐
│ STATUS BAR:  FableCut ✅  Hermes ✅  APIs ✅   │
├────────────────────────────────────────────────┤
│ CHANNELS (quick grid)                          │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │Tantra  │ │Ochema  │ │Angeliz │ │Pramāṇa │  │
│ │Files   │ │        │ │        │ │        │  │
│ │12 vids │ │8 vids  │ │3 vids  │ │0 vids  │  │
│ └────────┘ └────────┘ └────────┘ └────────┘  │
├────────────────────────────────────────────────┤
│ BLUEPRINT QUEUE (by priority)                  │
│ TBP-026: Yogini Temples ── research done       │
│ TBP-033: Kumari ────────── researching ▓▓░░░   │
└────────────────────────────────────────────────┘
```

### Blueprint Detail (`/blueprints/TBP-026`)
```
┌────────────────────────────────────────────────┐
│ TBP-026: Why Were the Yoginī Temples...        │
│ Channel: Tantra Files | 12 beats | 20 min      │
│ Predicted breakout: 68% (baseline 25%)         │
├────────────────────────────────────────────────┤
│ PIPELINE STAGES                                │
│ ✅ Research  ✅ Script  ⬜ VO  ⬜ Art  ✅ FC   │
├────────────────────────────────────────────────┤
│ BEAT TIMELINE (compact)                        │
│ B1  HOOK        0:00-1:25  ████░░░░░░░░░░░░░  │
│ B2  ORIENTATION 1:25-3:05  ████████░░░░░░░░░  │
│ ...                                            │
│ B12 SYNTHESIS  18:45-20:15 ████████████████░  │
├────────────────────────────────────────────────┤
│ PREDICTED vs ACTUAL (placeholder)              │
│ Published: N/A                                 │
│ Predicted: 68% breakout                        │
│ Actual: pending                                │
└────────────────────────────────────────────────┘
```
**Implementation:** Read blueprint markdown, parse beats with regex. Pipeline stage = check filesystem paths.

### FableCut View (`/fablecut`)
```
┌────────────────────────────────────────────────┐
│ FABLECUT TIMELINE                               │
│ ┌────────────────────────────────────────────┐ │
│ │ [embedded iframe to localhost:7777 →       │ │
│ │  cloudflared tunnel URL]                   │ │
│ └────────────────────────────────────────────┘ │
│ Generate from Blueprint: [TBP-026 ▼] [Run]    │
│ Media status: 0/24 assets loaded               │
└────────────────────────────────────────────────┘
```
**Implementation:** If cloudflared tunnel is up, embed `<iframe src="https://{tunnel}.trycloudflare.com">`. Otherwise, show link to `http://localhost:7777` with instructions.

### Analytics View (`/analytics`)
```
┌────────────────────────────────────────────────┐
│ VIEWS BY CHANNEL (bar chart, text-based)       │
│ ESOTERICA    ████████████████ 49,487 median    │
│ RFB          ██████████████████████ 183,197    │
│ Asangoham    █████████████ 87,062              │
│ ...                                            │
├────────────────────────────────────────────────┤
│ TOP FRAMING WORDS                              │
│ bizarre (2.6x)  forgotten (2.0x)  forbidden    │
├────────────────────────────────────────────────┤
│ PREDICTION ACCURACY                            │
│ (placeholder — needs published videos)          │
└────────────────────────────────────────────────┘
```
**Implementation:** Read from `data/research/layer2/analysis_*.json`.

### Hermes Chat (`/chat`)
```
┌────────────────────────────────────────────────┐
│ Channel: [Tantra Files ▼]                      │
├────────────────────────────────────────────────┤
│ Hermes: Ready to help. What should we research?│
│ You: Check the Kumari blueprint for accuracy   │
│ Hermes: Checking TBP-033... 3 claims need      │
│         source verification (CLM-008, CLM-012) │
├────────────────────────────────────────────────┤
│ [message input                         ] [Send]│
└────────────────────────────────────────────────┘
```
**Implementation:** POST to Telegram API. Poll for response. No database — reads from Telegram thread.

---

## Build Order

### Step 1: Scaffold (30 min)
```bash
mkdir -p /root/projects/blog/dashboard/static
pip install flask requests pyyaml
```
Create `server.py` with health endpoint + static file serving.

### Step 2: Blueprint API (30 min)
Implement `GET /api/blueprints` and `GET /api/blueprints/<id>`.
Parse `tantrafiles/blueprints/*.md` with regex for metadata + beats.
Check filesystem for pipeline stage markers.

### Step 3: FableCut integration (20 min)
`GET /api/fablecut/status` — curl localhost:7777, return up/down.
Frontend embed with tunnel URL or localhost link.

### Step 4: Channel API (20 min)
`GET /api/channels` — read `analysis_*.json` files, aggregate.
`GET /api/channels/<name>` — return single channel detail.

### Step 5: Prediction API (15 min)
`GET /api/predict?title=...` — shell out to `predict_views.py`, return JSON.

### Step 6: Hermes chat (30 min)
`POST /api/hermes/send` — proxy to Telegram Bot API.
Chat UI with per-channel persona selection.

### Step 7: Dashboard frontend (2 hr)
Single `index.html` with vanilla JS. SSE for live updates.
Views: home, blueprints, channels, fablecut, analytics, chat.

**Total:** ~5 hours for a working agent.

---

## Deployment

```bash
# systemd service
cat > /etc/systemd/system/dashboard.service << 'EOF'
[Unit]
Description=Operator Cockpit Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/projects/blog/dashboard
Environment=PYTHONUNBUFFERED=1
ExecStart=/usr/bin/python3 /root/projects/blog/dashboard/server.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now dashboard.service
```

Access: `http://VPS_IP:8766` or proxy through your Cloudflare site.

---

## Resource Budget

| Component | RAM | CPU | Disk |
|-----------|-----|-----|------|
| Flask server | ~50 MB | <1% idle | Negligible |
| SSE connections | ~5 MB per connection | Minimal | — |
| File reads | — | Spikes per request | — |
| **Total** | **< 200 MB** | **Near zero idle** | **Negligible** |

Fits alongside FableCut, Hermes, and everything else on 8 GB RAM.

---

## Files Created (by the building agent)

| File | Lines | Content |
|------|-------|---------|
| `dashboard/server.py` | ~300 | Flask routes for all endpoints |
| `dashboard/static/index.html` | ~400 | Single-page app shell |
| `dashboard/static/app.js` | ~500 | Client logic, fetch + SSE |
| `dashboard/static/style.css` | ~200 | Dark theme, responsive grid |

Total: ~1,400 lines of production code.
