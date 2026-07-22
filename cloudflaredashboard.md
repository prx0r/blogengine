# Studio Dashboard — Complete Reference

## URLs

| URL | Type | Purpose |
|-----|------|---------|
| `https://studio.tantrafiles.xyz` | Cloudflare Tunnel → VPS | Full Flask backend + static frontend. **Primary access.** |
| `https://dashboard.tantrafiles.xyz` | Cloudflare Pages + Worker | Static frontend with API proxy to the tunnel. |
| `https://studio-dashboard-c33.pages.dev` | Pages fallback | Same as above, no custom domain. |

Both routes serve the same SPA frontend. The tunnel URL is faster (direct VPS backend). The Pages URL uses a Worker to proxy `/api/*` calls through.

---

## Architecture

```
Your Browser
  │
  ├── https://studio.tantrafiles.xyz ──┐
  │                                    ▼
  │                          Cloudflare Edge (CDN + SSL)
  │                                    │
  │                     CNAME → cfargotunnel.com
  │                                    │
  │                          cloudflared tunnel (systemd)
  │                          /root/.cloudflared/config.yml
  │                                    │
  │                          localhost:8766
  │                          ┌──────────────────────┐
  │                          │  Flask (server.py)    │
  │                          │  Serves: index.html   │
  │                          │  API: /api/*          │
  │                          └──────┬───────────────┘
  │                                  │
  │              ┌───────────────────┼───────────────────┐
  │              ▼                   ▼                   ▼
  │     localhost:7777        Filesystem           Telegram API
  │     ┌──────────────┐  tantrafiles/         Hermes gateway
  │     │  FableCut     │  data/research/      (existing bot)
  │     │  Node editor  │  scripts/engines/
  │     └──────────────┘  content/publishing/
  │
  ├── https://dashboard.tantrafiles.xyz ──┐
  │                                       ▼
  │                             Cloudflare Pages
  │                             ┌──────────────────┐
  │                             │  _worker.js       │
  │                             │  ├── /api/* → proxy to studio.tantrafiles.xyz
  │                             │  └── /* → serve index.html
  │                             └──────────────────┘
```

---

## Services (all systemd, auto-start on boot)

| Service | Systemd Name | Port | Purpose |
|---------|-------------|------|---------|
| Dashboard Flask | `operator-dashboard` | 8766 | API backend + static file server |
| Cloudflare Tunnel | `studio-dashboard` | → CF | Exposes dashboard to the internet |
| FableCut Editor | `fablecut` | 7777 | Video editor + timeline |
| Tor Proxy | `tor@default` | 9050 | SOCKS5 proxy for asset downloads |
| Hermes Gateway | (direct python) | stdio | AI agent, Telegram bot, MCP host |

### Control Commands

```bash
# Dashboard
systemctl status operator-dashboard
systemctl restart operator-dashboard
journalctl -u operator-dashboard -f  # live logs

# Tunnel
systemctl status studio-dashboard
systemctl restart studio-dashboard
journalctl -u studio-dashboard -f

# FableCut
systemctl status fablecut
systemctl restart fablecut
journalctl -u fablecut -f

# Tor
systemctl status tor@default
systemctl restart tor@default
```

---

## Tor Proxy — Asset Downloads

**Yes, Tor auto-starts** with the system (`tor@default.service`, enabled). It runs SOCKS5 at `localhost:9050`.

**Why Tor?** The VPS is hosted on Hetzner. Hetzner IPs are blocked by several image sources:
- Wikimedia Commons (`upload.wikimedia.org`) → returns **403**
- British Museum → **DNS blocked**
- YouTube audio extraction → **bot detection**

Tor bypasses these by routing traffic through Tor exit nodes (consumer/residential IPs), not Hetzner datacenter IPs.

**How it works in code:**

`scripts/pipeline/build-from-blueprint.py` (line 15-21):
```python
try:
    import socks
    socks.set_default_proxy(socks.SOCKS5, "localhost", 9050)
    socket.socket = socks.socksocket
    TOR_AVAILABLE = True
except:
    TOR_AVAILABLE = False
```

When `socks` (PySocks) is installed, all Python socket operations go through Tor automatically. The script detects this and routes Wikimedia, Met Museum, and other asset downloads via Tor.

**Testing Tor:**
```bash
curl -s --socks5-hostname localhost:9050 https://check.torproject.org/api/ip
# → {"IsTor":true,"IP":"185.220.101.8"}
```

**Tor security notes:**
- Tor can be slow (1-5s per request). Asset downloads are sequential, so 20+ assets take ~1-2 min.
- Some Tor exit nodes are themselves blocked. The script retries on failure.
- Run `systemctl restart tor@default` if connections stall.

---

## Blueprint → FableCut Pipeline

How a video goes from idea to editable timeline:

```
TBP-NNN.md (blueprint in tantrafiles/blueprints/)
  │
  ▼
scripts/engines/blueprint-to-fablecut.py
  │  Parses: metadata, beats, assets, claims, hypotheses
  │  Generates: beat-map.md + {slug}-fablecut.json
  │
  ▼
content/publishing/scripts/{slug}/
  ├── beat-map.md
  └── {slug}-fablecut.json
  │
  ▼
scripts/pipeline/build-from-blueprint.py
  Step 1: Download all AST assets via Tor proxy
  Step 2: Generate voiceover via edge-tts (en-US-AriaNeural)
  Step 3: Generate FableCut project file
  Step 4: Load into FableCut at localhost:7777
```

**One-command build:**
```bash
python3 scripts/pipeline/build-from-blueprint.py TBP-026
python3 scripts/pipeline/build-from-blueprint.py TBP-026 --skip-voiceover
```

**From the dashboard:** Select a blueprint in the Editor tab, click "Generate".

---

## FableCut Integration — Current State

**FableCut is running** at `http://localhost:7777` — it's a full Node.js video editor with:
- Timeline view (V1 video track, A1 audio track)
- Project file management
- Media library (73 files loaded for the Abhinavagupta video)
- Export/render capability

**The dashboard shows:**
- FableCut status indicator (running/stopped)
- Beat explorer with blueprint beat structure
- Load blueprint → see beats → click Generate
- Project info (media count, clip count)

**What's NOT yet wired in the dashboard:**
- ❌ No iframe embed of FableCut editor (spec'd but not built)
- ❌ No live preview of the video timeline
- ❌ No render/export trigger from dashboard
- ❌ No approve/revise workflow
- ❌ No Hermes chat panel
- ❌ No live update stream from Hermes

**Workaround to access FableCut directly:**
```bash
# SSH tunnel (from your local machine)
ssh -L 7777:localhost:7777 root@VPS_IP
# Then open http://localhost:7777 in your browser
```

Or use the Cloudflare Tunnel URL: `https://studio.tantrafiles.xyz` serves the dashboard, but FableCut itself is not exposed through the tunnel (only the Flask app on port 8766 is). The FableCut editor at port 7777 is only accessible locally on the VPS or via SSH tunnel.

---

## Hermes Integration — Current State

**Hermes runs as:**
1. **Gateway** (PID 664384) — Telegram bot that receives/sends messages, runs cron jobs
2. **FableCut MCP server** (child process) — Hermes can control FableCut via MCP tools

**Hermes can already do:**
- Generate storyboards from research objects
- Run edge-tts voiceover generation
- Search art library and match to segments
- Assemble FableCut timeline
- Run daily market research scans

**Dashboard Hermes endpoint:** `POST /api/hermes/send` proxies messages to the Telegram bot. But there's **no chat UI** in the dashboard yet — the spec describes one but it's not built.

**To talk to Hermes now:**
```bash
# Via Telegram (your phone/desktop)
# Hermes responds to commands in your Telegram chat

# Via SSH (direct MCP interaction)
curl -s http://localhost:7777/api/project | python3 -m json.tool
```

---

## Dashboard API Reference

All endpoints available at `https://studio.tantrafiles.xyz/api/`:

| Endpoint | Method | Returns | Purpose |
|----------|--------|---------|---------|
| `/api/status` | GET | system health | FableCut status, blueprint count, channels analyzed |
| `/api/blueprints` | GET | all blueprints | List with pipeline stage indicators |
| `/api/blueprints/<id>` | GET | single blueprint | Beats, pipeline, metadata |
| `/api/channels` | GET | all channels | Sorted by subs, with breakout rates |
| `/api/channels/<name>` | GET | single channel | Full video analysis data |
| `/api/predict?title=...` | GET | prediction | XGBoost title score (0.747 AUC) |
| `/api/fablecut/status` | GET | running/stopped | FableCut health check |
| `/api/fablecut/project` | GET | project.json | Current FableCut project data |
| `/api/analytics/overview` | GET | stats | Total views, top channels |
| `/api/generate/<bp_id>` | POST | output | Runs blueprint-to-fablecut pipeline |
| `/api/hermes/send` | POST | Telegram response | Sends message via Hermes gateway |

---

## What's Possible RIGHT NOW

| Action | How |
|--------|-----|
| **See all blueprints** | Open `https://studio.tantrafiles.xyz`, click Blueprints tab |
| **See channel benchmarks** | Open Channels tab — 125+ channels with breakout rates |
| **Score a title** | Type in the "Title Quick Score" box in Editor tab |
| **Generate FableCut timeline from blueprint** | Select blueprint → click Generate |
| **See FableCut is running** | Status bar shows ✅ |
| **See beat structure** | Load blueprint in Editor tab |
| **Download assets via Tor** | `build-from-blueprint.py` handles this automatically |
| **Tor auto-starts** | Yes — `tor@default.service` is systemd-enabled |

## What's NOT Yet Built (in priority order)

| Feature | Dashboard Status | Why |
|---------|-----------------|-----|
| **FableCut iframe embed** | ❌ Not built | Need to expose FableCut port via tunnel or add tunnel ingress |
| **Watch video preview** | ❌ Not built | Depends on FableCut embed working |
| **Approve/Reject button** | ❌ Not built | Needs workflow state machine |
| **Hermes chat panel** | ❌ Not built | Chat UI not implemented |
| **Live Hermes updates** | ❌ Not built | Needs SSE or WebSocket from backend |
| **Render trigger** | ❌ Not built | FableCut export API not integrated |
| **Published video archive** | ❌ Not built | No videos published yet |

---

## Roadmap — How It Should Work (Spec)

The intended end-to-end workflow:

```
1. Hermes researches topic → writes blueprint (TBP-NNN.md)
2. You review blueprint in Dashboard → click Approve
3. Dashboard triggers build-from-blueprint.py
4. Assets download via Tor → voiceover generates → FableCut timeline assembles
5. Dashboard shows LIVE FableCut preview (iframe embed via tunnel)
6. You watch the video, make notes
7. Dashboard sends notes to Hermes: "Segment 3 pacing too slow"
8. Hermes revises script → re-generates
9. Loop until you click "Ready to Publish"
10. Hermes publishes to YouTube via TryPost
11. Analytics flow back → model retrains → next video improves
```

**Approval gates:**
```
Blueprint Draft → [APPROVE/REVISE] → Research Pack → [APPROVE] →
Script → [APPROVE] → Voiceover Recorded → Audio Generated →
Rendered Preview → [APPROVE/REVISE/TERMINATE] → Published
```

This approval flow exists in `farm-template/src/index.ts` (Workflow with WAIT_FOR_APPROVAL steps) and `pipelines/control-plane-design.md`, but is not wired into the dashboard frontend.

---

## Troubleshooting

### Dashboard not loading (502/504)
```bash
# Check Flask backend
curl -s http://localhost:8766/api/status
systemctl restart operator-dashboard
journalctl -u operator-dashboard -n 50

# Check tunnel
systemctl status studio-dashboard
journalctl -u studio-dashboard -n 20
```

### FableCut shows "stopped"
```bash
systemctl restart fablecut
sleep 2
curl -s http://localhost:7777/ | head -5
curl -s http://localhost:8766/api/fablecut/status
```

### Asset downloads failing (Tor issues)
```bash
# Test Tor
curl -s --socks5-hostname localhost:9050 https://check.torproject.org/api/ip
# If fails: systemctl restart tor@default

# Test Wikimedia through Tor
curl -s --socks5-hostname localhost:9050 \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/foo.jpg" -o /dev/null
```

### Blueprint generation fails
```bash
python3 scripts/engines/blueprint-to-fablecut.py tantrafiles/blueprints/TBP-NNN-name.md
# Check output: content/publishing/scripts/tbp-nnn/
```

### Hermes not responding
```bash
# Check Hermes gateway
ps aux | grep hermes
# If missing: check Telegram bot token in env
```

### Too many Cloudflare auth failures
```bash
# The API token is sensitive to repeated bad requests.
# Wait 60s before retrying. Use the cfat_ token for API calls,
# cfut_ token for DNS operations.
```

---

## Key Files

| File | Purpose |
|------|---------|
| `dashboard/server.py` | Flask API backend (http://localhost:8766) |
| `dashboard/static/index.html` | SPA frontend with all views |
| `.cloudflared/config.yml` | Tunnel ingress rules |
| `.cloudflared/studio-dashboard.json` | Tunnel credentials |
| `scripts/pipeline/build-from-blueprint.py` | Full pipeline: Tor download + voiceover + FableCut |
| `scripts/engines/blueprint-to-fablecut.py` | Blueprint → beat-map + project.json |
| `scripts/engines/predict_views.py` | XGBoost title scorer (0.747 AUC) |
| `scripts/engines/headline_score.py` | YouTube-calibrated title scoring (+0.235) |
| `scripts/engines/niche_deep_dive.py` | 80+ sub-niche breakout analysis |
| `scripts/engines/hermes_knowledge.py` | Central knowledge query interface |
| `operations/dashboard-build-spec.md` | Original dashboard spec document |
| `operations/asset-workflow.md` | Asset download + Tor documentation |
| `pipelines/dashboard-stream.md` | Future dashboard vision document |
| `/root/projects/FableCut/` | FableCut editor (port 7777) |
| `/root/projects/FableCut/server.js` | FableCut Node.js server |
| `/root/projects/FableCut/mcp-server.js` | FableCut MCP server (Hermes integration) |

---

---

## FableCut Complete API & Capabilities

Full docs saved to `FABLECUT_DOCS.md` (522 lines). Key reference:

### Aspect Ratio Presets (built-in)

| Label | Resolution | Use |
|-------|-----------|-----|
| 16:9 · 1280×720 | 1280×720 | Default YouTube landscape |
| 16:9 · 1920×1080 | 1920×1080 | Full HD YouTube |
| **9:16 · Reel 1080×1920** | **1080×1920** | **YouTube Shorts / TikTok** |
| 4:5 · IG 1080×1350 | 1080×1350 | Instagram |
| 1:1 · 1080×1080 | 1080×1080 | Square |

Switch via: `fablecut_patch_project` with `ops: [{op:"setProject", set:{width:1080, height:1920, fps:30}}]`

### MCP Tools Available to Hermes

| Tool | Description |
|------|-------------|
| `fablecut_status` | Health + project summary. Call first. |
| `fablecut_docs` | Schema documentation (522 lines) |
| `fablecut_get_project` | Read project.json. `compact:true` for 10× smaller summary. |
| `fablecut_set_project` | Replace entire project. Conflict-safe (revision check). |
| `fablecut_patch_project` | **Prefer this for edits.** Targeted ops: `addClip`, `updateClip`, `removeClip`, `addMedia`, `removeMedia`, `setProject`. |
| `fablecut_import_media` | Copy file into media library + register in project |
| `fablecut_analyze_reference` | Analyze reference video → edit blueprint (shots, beats, BPM, energy, drop) + extract music |
| `fablecut_validate` | Run validation pipeline (Ralph Loop) against blueprint/storyboard |

### REST API (alternative to MCP)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/project` | GET/PUT | Read/write timeline. PUT is conflict-safe (revision check). |
| `/api/media` | GET | List media files with sizes |
| `/api/library?dir=sfx|elements|svg|fonts` | GET | List built-in library assets |
| `/api/upload?name=foo.mp4` | POST | Upload file to media library (auto-remux for MP4) |
| `/api/analyze` | GET/POST | Analyze reference video into edit blueprint |
| `/api/events` | GET | SSE live-reload channel (emits `change` on edits) |
| `/api/export/begin` | POST | Start export session → returns session ID |
| `/api/export/frame?id=` | POST | Send browser-rendered JPEG frame |
| `/api/export/audio?id=` | POST | Send WAV audio mix |
| `/api/export/end?id=` | POST | Finish export → returns MP4 path |
| `/api/ffmpeg` | GET | Check if ffmpeg is available for server-side export |

### Recipe Library (Effects & Edits)

| Recipe | How |
|--------|-----|
| **Rough cut** | Clips back-to-back on V1, `start` = running sum |
| **Title card** | Text clip on V2 with `props.text`, `fontSize`, `color` |
| **Music bed** | Audio on A1, `props.volume: 0.3`, trim with `in`/`duration` |
| **Cinematic grade** | `props.filterPreset: "teal-orange"` |
| **Green-screen** | V2 with `props.chromaKey:"#00ff00"`, background on V1 |
| **Remove background** | `props.bgRemove:true` (people) |
| **Picture-in-picture** | V3 with `props.scale:0.35, x:380, y:-200` |
| **Slow motion** | `props.speed: 0.5` (half) or `4` (timelapse) |
| **Speed ramp** | `keyframes: { speed: [ {t:0, v:3}, {t:1.1, v:3}, {t:1.3, v:0.4} ] }` |
| **Impact hit** | Adjustment layer `props.shake:20, rgbSplit:8` + `library/sfx/impact-hit.mp3` |
| **VHS / glitch** | `props.rgbSplit:4, grain:35` + scanline overlay |
| **Film look** | Adjustment layer `props.filterPreset:"cinematic", grain:18` |
| **Neon caption** | `props.glow:60, glowColor:"#22d3ee"` |
| **Ken Burns** | `keyframes: { scale:[{t:0,v:1},{t:D,v:1.2}], x:[{t:0,v:0},{t:D,v:-40}] }` |
| **Crossfade** | Overlap clips + `transitionIn:{type:"fade", duration:1}` |
| **Whip-pan** | A: `transitionOut:{type:"whip"}`, B: `transitionIn:{type:"whip"}` |
| **Beat-synced cut** | Write beats into `markers`, align clip `start`s to them |
| **Music fade-out** | `transitionOut:{type:"fade", duration:3}` on audio |
| **Lower-third** | Text clip with `props.textAnim:"rise-mask"` |
| **Kinetic title** | `props.fontCutSet:["Anton","Bebas Neue",...]` with `textAnim:"font-cut"` |
| **Animated sticker** | SVG in `library/svg/`, clips on V3/V4 |
| **Vertical reel (Shorts)** | `setProject {width:1080, height:1920}` — safe-area guides available |
| **Custom font** | Drop `.ttf` into `library/fonts/`, reference by name |
| **Audio waveform** | Visualized in UI when enough vertical track space |

### YouTube / Shorts Templates

**No built-in YouTube templates.** FableCut is a general-purpose editor. But:
- **Shorts support**: Set project to 1080×1920, safe-area guides show platform UI zones
- **Reference analysis**: Analyze any YouTube video → get shot boundaries, energy curve, BPM, drop point → recreate the same pacing
- **Export**: Produces CRF-18 faststart MP4 at whatever resolution you set → upload directly to YouTube

To make a Shorts template workflow, set:
```json
{
  "name": "YouTube Shorts Template",
  "width": 1080, "height": 1920, "fps": 30,
  "background": "#000000",
  "markers": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50, 55, 60]
}
```
And create a corresponding `library/svg/shorts-safe-areas.svg` overlay for text placement guidance.

### Export (how final video is created)

Two engines:
| Engine | How it works | Speed | Quality |
|--------|-------------|-------|---------|
| **Fast** (default) | Browser renders each frame via Canvas compositor → streams JPEGs to server → ffmpeg encodes CRF-18 MP4. | Fast | High |
| **Realtime** | `MediaRecorder` browser API fallback | Real-time | Lower |

**Cannot be triggered headlessly** — the compositor lives in the browser. You click Export in the FableCut UI, or render with ffmpeg directly from the source media files.

### Library Assets (Built-in)

```
library/
  elements/   — overlays (light leaks, scanlines, VHS effects, etc.)
  sfx/        — sound effects (impact hits, whooshes, transitions)
  svg/        — animated stickers
  fonts/      — custom .ttf files (any Google Font by name works)
```

---

## Video Validation Pipeline

### How It Works

The `validate-video.mjs` script checks the FableCut project against multiple sources:

```
Blueprint (TBP-NNN.md) ──┐
Storyboard (JSON) ───────┼──→ validate-video.mjs ──→ Score ≥ 85% = PASS
FableCut project.json ───┘
Google Vision API (images)
```

### Running Validation

**From the dashboard:** Click the "✓ Validate" tab, optionally select a blueprint, click "Run".

**From CLI:**
```bash
# Current project, no blueprint comparison
node scripts/validate-video.mjs

# Compare against a blueprint
node scripts/validate-video.mjs --blueprint TBP-026

# Compare against a storyboard
node scripts/validate-video.mjs --storyboard nanavira

# Machine-readable (for Hermes / MCP)
node scripts/validate-video.mjs --json --skip-vision
```

**From Hermes (MCP):** Hermes calls `fablecut_validate` tool after building a timeline to self-check. Optional params: `blueprint` (e.g. "TBP-026"), `storyboard` (e.g. "nanavira").

### What It Checks (17 weighted checks)

| ID | Check | Weight | Why |
|----|-------|--------|-----|
| C1a | Has audio media | 8 | Must have narration/voiceover files |
| C1b | Has visual media | 8 | Must have images or video clips |
| C1c | Files on disk & non-zero | 6 | No missing or 0-byte files |
| C1d | Audio ≥5s duration | 5 | Voiceover not just placeholder beeps |
| C2a | Both V1 & A1 tracks | 6 | Timeline has video + audio |
| C2b | Duration ≥5 min | 6 | Video is substantial, not trivial |
| C2c | Proper project name | 4 | Not "Untitled" or "Test" |
| C3a | Unique audio segments | 6 | No repeated voiceover clips |
| C3b | Unique visual assets | 6 | No repeated images |
| C3c | Meaningful art names | 5 | Not art_01.jpg — matched to content |
| C4a | Varied clip durations | 5 | Not all 80s — real timings |
| C4b | Audio covers ≥50% | 4 | Voiceover fills the timeline |
| C5a | Visual effects applied | 5 | Filters, transitions used |
| C5b | Channel treatment | 3 | Right color preset for channel |
| C5c | Duration 3-30 min | 2 | Sanity check |
| V01 | Image integrity | 10 | No corrupt/duplicate images |
| V02 | Vision content check | 10 | Google Vision label analysis |

**Pass threshold: 85%**

### Fixing Common Failures

| Failure | Likely Cause | Fix |
|---------|-------------|-----|
| C3c: Generic art names | Art not matched from gallery | Run `match_art_to_videos.py` or write `visual-assignment.json` |
| C4a: Identical durations | Placeholder project.json | Rebuild with actual voiceover durations via `generate-voiceover.mjs` |
| C5a: No effects | Missing channel filter | Apply treatment via FableCut MCP `patch_project` |
| V01: Duplicate images | Same image used for multiple beats | Match unique art per segment from the 904-piece gallery |
| B01: Beat mismatch | Blueprint vs implementation differ | Align segment count to blueprint spec |
| B03: Wrong treatment | Wrong channel filter | Set correct filter per channel preset |

### Current Validation Score (Abhinavagupta)

**72% — FAIL** (needs 85% to pass)

| Failed Check | What's Wrong |
|-------------|--------------|
| C3c: Art names generic | art_01.jpg through art_12.jpg — not matched to content |
| C4a: Identical durations | All clips = 80s — placeholder timings |
| C5a: No effects | No visual filters applied |
| C5b: No channel treatment | Missing golden-imaginal Tantra Files filter |
| V01: Duplicate images | 5 of 12 art files are duplicates |

---

## Credentials Reference

Stored as environment variables or session-only:

| Credential | Value / Location |
|------------|-----------------|
| Cloudflare API Token | `cfat_2c32BYrGAzy4FM4tUYZIyQZqPIc0nyGFiWMp5lBn9e17cd57` |
| Cloudflare DNS Token | `cfut_e2iMVQEgDlvnOtFuLvfaUfQwfk4YDhUkAgJWmaJY5ab9f317` |
| R2 Access Key ID | `b31c6e90450f740629ac030f6e16eef4` |
| R2 Secret Access Key | `cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32` |
| R2 Endpoint | `https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com` |
| Account ID | `954612afb5a97bb15dddcdc70176813d` |
| Telegram Bot Token | In env (`TELEGRAM_BOT_TOKEN`) |
| Tunnel Token | Embedded in `~/.cloudflared/studio-dashboard.json` |
