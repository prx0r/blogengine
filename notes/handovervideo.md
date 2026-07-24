# Video Production Pipeline — Complete Handover

## Project Context

This is a **research laboratory disguised as a media company**. The project produces documentary videos about Tantra, Kashmir Shaivism, and Indian philosophy across 5 channels:

| Channel | Focus |
|---------|-------|
| **Tantra Files** | Primary channel — Tantric philosophy, history, figures |
| **Ochema** | Occult / Western esoteric traditions |
| **Angeliz** | Angelology, apocrypha |
| **Pramāṇa** | Epistemology, logic, comparative philosophy |
| **Intelligent Others** | Non-human intelligence, UAP |

All infrastructure runs on a single Hetzner VPS (4 core, 8GB RAM, 75GB disk). The codebase lives at `/root/projects/blog/`.

---

## Video Pipeline Architecture

```
Research Object → Storyboard → Beat Plan → Image Matching → FableCut Project → Export
```

| Stage | Output | Tool |
|-------|--------|------|
| Research | `TBP-NNN.md` blueprint | Hermes (AI agent) |
| Storyboard | `storyboards/{name}.json` — segments with narration | `apply-template.py` |
| Beat Plan | Segments → sub-beats with durations + image types | `gold-standard.py --apply` |
| Image Matching | Each beat gets a matched art image | `match-images-to-storyboard.py` |
| FableCut Project | `project.json` with timeline, clips, media | `match-images-to-storyboard.py --project` |
| Validation | Score report (pass >= 85%) | `validate-video.mjs` |
| Publishing | Packaged video + all assets | `gold-standard.py --publish` |

---

## Gold Standard Exemplars

4 reference videos downloaded from YouTube, analyzed frame-by-frame, stored at `/root/projects/blog/exemplars/gold-standards/`:

| Video | Duration | Shots | Avg Shot | BPM | File |
|-------|----------|-------|----------|-----|------|
| Anandamayi Ma | 20:02 | 139 | 8.6s | 152 | `...Anandamayi Ma...mp4` |
| Alan Watts | 12:26 | 105 | 7.1s | 112 | `...Alan Watts...mp4` |
| Jesus in Himalayas | 24:40 | 92 | 16.1s | 99 | `...Jesus in the Himalayas...mp4` |
| Nisargadatta Maharaj | 19:45 | 75 | 15.8s | 123 | `...Nisargadatta Maharaj...mp4` |

Each reference has a JSON analysis (`*-analysis.json`) with per-shot cut timestamps, energy levels, and classification. The Alan Watts exemplar has been captured as a reusable gold standard template (`video-templates/gold-standards/alan-watts-gold.json`) with 105 shots, 7.1s average duration, BPM 112.

---

## Analysis Engine

The exemplar analysis pipeline (triggered via FableCut's `/api/analyze` or `fablecut_analyze_reference` MCP tool) extracts per-shot:
- Cut boundaries (scene detection via histogram threshold 0.3)
- Keyframe capture per shot
- Google Vision labels per keyframe
- Transcript alignment (SRT → shot mapping)
- Motion classification (Ken Burns pan/zoom vs real video)
- Proper noun extraction from narration
- Energy curve and BPM calculation

Raw analysis is stored as JSON with structure:
```json
{
  "source": "...",
  "duration": 745.8,
  "fps": 29.97,
  "cuts": [0.868, 1.068, 16.75, ...],
  "total_shots": 105,
  "avg_shot_sec": 7.1,
  "bpm": 112.3
}
```

---

## Tools Built

### Video Production

| Script | Description | Usage |
|--------|-------------|-------|
| `scripts/gold-standard.py` | Capture/apply pacing templates from FableCut projects | `--capture --name=X`, `--publish=X`, `--apply=X --storyboard=Y`, `--list`, `--show=X` |
| `scripts/match-images-to-storyboard.py` | Match art to storyboard beats via proper noun extraction + concept fallback | `--storyboard=X --beat-plan=Y --project` |
| `scripts/apply-template.py` | Expand a storyboard using a video template (e.g. `biography.json` → 36 sub-beats) | `--storyboard=X --template=biography --build-fablecut` |
| `scripts/generate-quote-cards.py` | Detect attributed quotes in narration, generate FableCut text overlay clips | `--storyboard=X --preview --project` |

### Validation

| Script | Description | Usage |
|--------|-------------|-------|
| `scripts/validate-video.mjs` | 24 quality checks on the FableCut project | `--json`, `--skip-vision`, `--blueprint=TBP-NNN`, `--storyboard=X` |
| `scripts/video-vision-check.py` | Image integrity + Google Vision content validation | `--json`, `--skip-vision` |

### Art Library

| Script | Description | Usage |
|--------|-------------|-------|
| `scripts/batch-fetch-tantra-art.py` | Download from Met Museum + Cleveland Museum APIs | `--query=shiva --max=50 --skip-vision`, `--all-queries` |
| `scripts/vision-label-art.py` | Google Vision labeling + thumbnail suitability scoring for all art | `--dry-run`, `--max=100`, `--thumbnails-only` |

---

## FableCut Patches

Three critical patches in the FableCut editor (`/root/projects/FableCut/`):

| File:Line | Patch | Purpose |
|-----------|-------|---------|
| `app.js:474` | `loadImage()` — added `crossOrigin="anonymous"` | Fixes Canvas tainted rendering when loading images through tunnel |
| `app.js:2207` | `getClipEl()` — returns `null` for image clips | Fixes "JPEG in `<video>` element" DOM error |
| `server.js:180` | `serveFile()` — added `Access-Control-Allow-Origin: *` | CORS headers for image serving through tunnel |
| `index.html` | Cache-busting `?v=2` + `<meta http-equiv="Cache-Control" content="no-cache">` | Prevents stale HTML/JS on reload |

---

## Video Creation Spec

A consolidated spec `operations/video-creation-spec.md` defines three validation levels (Bronze/Silver/Gold) derived from all exemplar analyses. Reference it when creating new videos — start at Bronze, graduate up.

## Hermes Video Pipeline

`operations/hermes-video-pipeline.md` — bridges the 3-pass essay skill (write/SKILL.md) with the FableCut video pipeline, adding gold-standard validation gates at every phase. Includes deterministic art matching, Ken Burns animation rules from modules/README.md, and Bronze/Silver/Gold validation stages. Designed to be Hermes-readable as a step-by-step prompt.

## Key Files

| Path | Description |
|------|-------------|
| `/root/projects/FableCut/project.json` | Current FableCut project (live timeline) |
| `/root/projects/FableCut/media/` | All video project media assets (~73 files for Abhinavagupta) |
| `/root/projects/blog/public/art/` | 382 curated art images |
| `/root/projects/blog/content/glossary/art/` | 1,146 art metadata JSON files (titles, concepts, vision labels) |
| `/root/projects/blog/content/publishing/storyboards/` | Storyboard + beat plan JSONs (8 files) |
| `/root/projects/blog/content/publishing/videos/` | Published video packages (1 published so far) |
| `/root/projects/blog/video-templates/biography.json` | Biography template — 12 segments × 3 sub-beats = 36 beats, ~12min target |
| `/root/projects/blog/video-templates/gold-standards/` | 4 captured gold standards (alan-watts, abhinavagupta-v1, etc.) |
| `/root/projects/blog/video-templates/modules/` | Reusable modules: `quote-card.json` |
| `/root/projects/blog/cloudflaredashboard.md` | Full system reference (services, URLs, API, troubleshooting) |
| `/root/projects/blog/indic-sacred-art-dataset.md` | Dataset build spec (1M+ target) |

### 2026-07-22 — Optimizations & Reorganization

**Speed fixes applied to `scripts/analyze-exemplar.py`:**
- **Motion analysis**: switched from individual ffmpeg calls per frame to batch extraction via `ffmpeg -vf fps=N`. ~12× speedup (33 individual calls in 5.5s → 32 batch frames in 0.45s)
- **Transcription**: replaced local CPU-bound Whisper with **Cloudflare Workers AI Whisper** (`@cf/openai/whisper-large-v3-turbo`). Transcribes 30s in <1s on GPU. Returns full segments with word timestamps. Chunks long audio in 120s segments (25MB API limit).
- Only 4 CPU cores on VPS; avoid running >1 analysis in parallel.

**2026-07-22 — Scene threshold fix for smooth-cut videos (Academy of Ideas):**
- **Problem**: Academy of Ideas videos use very smooth crossfades/zooms (max scene score 0.117). FableCut analyze.js adaptive threshold [0.30→0.20→0.12] never triggered — returned 1 shot total.
- **Fix**: Added `--threshold` arg to `analyze-exemplar.py`. Pass `--threshold=0.05` for smooth-cut videos. AOI videos went from 1→22 shots and 6→59 shots.
- **Detection**: Ran `ffmpeg -vf "select='gt(scene,{N})'"` iteratively to find the right threshold. Max scene score was 0.117 for AOI videos vs 0.5+ for Eternalised hard-cut videos.
- **Usage**: `python3 analyze-exemplar.py --video X.mp4 --save --threshold=0.05`

**YouTube cookies**: expired (rotated by browser). Need fresh export from user's logged-in browser for yt-dlp caption downloads. Alternative: CF Whisper on extracted WAV works for all videos.

**Folder reorganization:**
`/root/projects/blog/exemplars/` now organized per-video:
```
exemplars/
  anandamayi-ma/    analysis/  transcript/  frames/  video/
  alan-watts/       analysis/  transcript/  frames/  video/  (full analysis complete: 105 shots)
  jesus-himalayas/  analysis/  transcript/  frames/  video/  (pending analysis)
  nisargadatta/     analysis/  transcript/  frames/  video/  (pending analysis)
  gold-standards/   — raw MP4s + original FableCut analyze.js outputs
```
Each `analysis/` folder contains the full JSON output. `transcript/` has text/SRT/VTT. `video/` symlinks to MP4 in `gold-standards/`.

**To re-export cookies from browser:**
```bash
# On your local machine, then SCP to VPS:
yt-dlp --cookies-from-browser firefox > /tmp/yt-cookies.txt
# or Chrome:
yt-dlp --cookies-from-browser chrome > /tmp/yt-cookies.txt
# Then on VPS:
yt-dlp --cookies /tmp/yt-cookies.txt --write-auto-subs --sub-lang "en.*" --skip-download <URL>
```

---

## URLs

| URL | Purpose |
|-----|---------|
| `https://studio.tantrafiles.xyz` | Dashboard (Flask backend via Cloudflare Tunnel) |
| `https://fablecut.tantrafiles.xyz` | FableCut editor (intended but not yet wired in dashboard) |
| `https://dashboard.tantrafiles.xyz` | Cloudflare Pages static frontend |

---

## Services (all systemd)

| Service | Port | Purpose |
|---------|------|---------|
| `operator-dashboard` | 8766 | Flask API + static file server |
| `studio-dashboard` | → CF | Cloudflare Tunnel (exposes dashboard to internet) |
| `fablecut` | 7777 | FableCut Node.js video editor |
| `tor@default` | 9050 | SOCKS5 proxy for Wikimedia/Museum asset downloads (bypasses Hetzner IP blocks) |
| Hermes Gateway | stdio | Telegram bot + MCP host (AI agent) |

---

## Validation Checks (24 total, pass threshold 85%)

| ID | Check | Weight |
|----|-------|--------|
| C1a | Has audio media | 8 |
| C1b | Has visual media | 8 |
| C1c | Files on disk & non-zero | 6 |
| C1d | Audio >= 5s | 5 |
| C1e | app.js crossOrigin patch applied | 3 |
| C1f | app.js getClipEl null-return patch applied | 3 |
| C2a | V1 + A1 tracks present | 6 |
| C2b | Duration >= 5 min | 6 |
| C2c | Proper project name (not "Untitled") | 4 |
| C3a | Unique audio segments | 6 |
| C3b | Unique visual assets | 6 |
| C3c | Meaningful art names (not art_01.jpg) | 5 |
| C3d | Clip kind field matches media type | 4 |
| C4a | Varied clip durations | 5 |
| C4b | Audio covers >= 50% of timeline | 4 |
| C4c | No orphan clips | 3 |
| C4d | No duplicate clips | 3 |
| C4e | Ken Burns animations applied | 3 |
| C5a | Visual effects applied | 5 |
| C5b | Channel treatment (correct filter preset) | 3 |
| C5c | Duration 3-30 min | 2 |
| V01 | Image integrity (no corrupt/dead images) | 10 |
| V02 | Google Vision content check | 10 |
| V03 | Vision API label relevance | 5 |

---

## Image Matching Strategy

The `match-images-to-storyboard.py` script uses a two-tier scoring system:

1. **Proper noun extraction** — regex-based detection of person names, deity names (50+ Sanskrit/Tibetan), place names, and historical Indic figures (80+ known names). Matches against art titles, filenames, concepts, and Vision labels.
2. **Concept fallback** — for beats with no proper noun match, scores by keyword overlap between narration and art metadata.

**Scoring:**
- Exact proper noun match in title/filename: **25x**
- Concept match in tags/labels: **3-5x**
- Vision label overlap: **2x**

**Beat timing:**
- Rapid beats (1-3s) for name-drops and quick cuts
- Descriptive beats (5-20s) for substantive content
- 4 alternating Ken Burns styles (never back-to-back repeats):
  1. `zoom_in` (1.0→1.10)
  2. `zoom_in_left` (1.0→1.12 with right pan)
  3. `zoom_out` (1.12→1.0)
  4. `drift_diagonal` (1.0→1.08 with diagonal pan)

---

## Current Video Status

**"Who was Abhinavagupta? A Day in the Life"**
- 12 segments, ~6 min, 72 beats
- Pacing from Alan Watts gold standard (7.1s avg, BPM 112)
- Published to: `content/publishing/videos/abhinavagupta-july2026-20260722/`
- Gold standard captured: `alan-watts-gold`
- Art matched: 72 images (2 by proper noun, 70 by concept fallback)
- Validation: 100% pass

---

## Datasets Downloading

| Dataset | Size | Status | Source |
|---------|------|--------|--------|
| CYTKv1 | 1,778 annotated thangkas | On volume at `/mnt/.../cytky1/` | GitHub |
| CIRThan | 2,287 thangka images + descriptions | Downloading | Google Drive |
| Deities-25 | 8,239 labelled deity images | Needs approval | HuggingFace |
| Smithsonian OA | ~4.9M assets | Planned | Smithsonian Open Access |
| Himalayan Art Resources | ~100K artworks | Planned scrape | HAR website |

---

## Common Workflows

### New Video (biography format)
```bash
# 1. Apply biography template to storyboard
python3 scripts/apply-template.py --storyboard <name> --template biography

# 2. Apply gold standard pacing
python3 scripts/gold-standard.py --apply alan-watts-gold --storyboard <name>

# 3. Match art and build FableCut project
python3 scripts/match-images-to-storyboard.py --storyboard <name> --beat-plan <name> --project

# 4. Generate quote cards
python3 scripts/generate-quote-cards.py --storyboard <name> --project

# 5. Validate
node scripts/validate-video.mjs

# 6. Publish
python3 scripts/gold-standard.py --publish=<slug>
```

### Capture a New Gold Standard
```bash
# After finishing a video in FableCut:
python3 scripts/gold-standard.py --capture --name my-new-template
python3 scripts/gold-standard.py --show my-new-template
```

### Add Art to Library
```bash
python3 scripts/batch-fetch-tantra-art.py --query=nataraja --max=30
python3 scripts/vision-label-art.py
```

---

## Diagram

```
                              ┌─────────────────┐
                              │  Research Object │
                              │  (Hermes/TBP)    │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Storyboard     │
                              │  (JSON segments) │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                   ▼
           ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
           │ Apply        │  │ Gold Standard│  │ Template         │
           │ Template     │  │ Pacing       │  │ (biography.json) │
           └──────┬───────┘  └──────┬───────┘  └──────────────────┘
                  │                 │
                  ▼                 ▼
           ┌─────────────────────────────┐
           │       Beat Plan             │
           │  (sub-beats × durations)    │
           └─────────────┬───────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │   Image Matching Engine     │
           │  (proper nouns → concepts)  │
           │  ┌───────────────────────┐  │
           │  │  Art Library (382 imgs)│  │
           │  │  + 1,146 metadata     │  │
           │  │  + Vision API labels  │  │
           │  └───────────────────────┘  │
           └─────────────┬───────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │   FableCut Project          │
           │  (project.json + media/)    │
           └─────────────┬───────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │   Validation (24 checks)    │
           │   Pass >= 85%?              │
           └──────┬──────────────┬───────┘
                  │              │
                YES              NO
                  │              │
                  ▼              ▼
           ┌──────────┐  ┌──────────────┐
           │ Publish  │  │ Fix & Re-run │
           └──────────┘  └──────────────┘
```
