# FableVid — Content Factory

## The Complete Closed Loop

```
                          RESEARCH
                    (acquire papers per phase)
                            ↓
                    RESEARCH OBJECTS
                  (compile ROs from papers)
                            ↓
                    ESSAY (Type A)
            (multi-pass refinement, 8 phases)
                            ↓
 ┌──────────────── VIDEO PIPELINE ────────────────┐
 │  Storyboard (deepseek-v4-flash, 8 segments)     │
 │    ↓                                            │
 │  Voiceover (edge-tts, en-US-AriaNeural default) │
 │    ↓                                            │
 │  Art Search (match keywords → gallery API)      │
 │    ↓                                            │
 │  Subtitles (.ass styled + .srt plain)           │
 │    ↓                                            │
 │  Quote Cards (black page, serif text)           │
 │    ↓                                            │
 │  Thumbnail (art + title)                        │
 │    ↓                                            │
 │  FableCut Timeline (project.json)               │
 │    ↓                                            │
 │  Browser Preview → Export MP4                   │
 └────────────────────────────────────────────────┘
```

## Hermes Skill Chain

```
User triggers: /full-video-pipeline "Tantraloka — Engine of Consciousness"

  1. /research-acquire
     → acquire papers for phase (consciousness, self)
     → validate: papers in content/works/

  2. /ro-compile (knowledge PR pipeline)
     → build RO from acquired papers
     → validate: RO has ≥5 passages, no coverage gaps

  3. /write-and-publish (Type A essay)
     → 8-phase refinement: classify → extract → write → audio → deploy
     → validate: essay JSON exists, audioUrl set

  4. /publish-video-fablecut
     → storyboard → voiceover → visual assignment → subtitles
     → quote cards → FableCut MCP timeline → browser preview → export
     → validate: MP4 >1MB, duration within 20% of estimate

  5. /upload-youtube
     → upload as unlisted draft → set thumbnail → schedule publish
     → validate: youtube_video_id returned

  6. /ingest-analytics (7+ days after publish)
     → pull retention data from YouTube Analytics API
     → map retention per beat → join visual-assignment.json
     → compute: treatment retention scores, artwork dropoff rates
     → feed gaps back into phase research queue
```

## Skill Bundle

Installed at `~/.hermes/skill-bundles/full-video-pipeline.yaml`.

```bash
/full-video-pipeline "Tantraloka — The Engine of Consciousness"
```

This runs the entire closed loop: research → RO → essay → video → upload → analytics → feedback.

---

## Pipeline Steps

---

## Services

### 1. FableCut Editor
```
Port: 7777
Location: /root/projects/FableCut
Start:   screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"
Stop:    screen -S fablecut -X quit
Access:  http://localhost:7777
Tunnel:  https://remembered-donations-glasgow-alive.trycloudflare.com
```
Zero-dependency. Just Node 18+. `project.json` is the timeline — edit it directly or let an agent write it.

### 2. Thumbnail Server
```
Port: 8765
Location: /root/projects/blog
Start:   screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
Stop:    screen -S thumbnail_server -X quit
Access:  http://localhost:8765
Tunnel:  https://passenger-literary-alignment-enable.trycloudflare.com
Endpoints:
  /api/images        — all 348+ images in the art library
  /api/matches       — video-to-image match results
  /api/assignments   — user-saved image assignments
  /api/render        — render a thumbnail from spec
  /img/<id>          — serve any artwork image by ID
```

---

## Pipeline Scripts

### Voiceover (`scripts/generate-voiceover.mjs`)
```bash
node scripts/generate-voiceover.mjs <storyboard-id>
```
Edge-TTS per segment. Dual voice:
- `en-US-AriaNeural` (female) — main narration
- `en-GB-RyanNeural` (male) — quotes/source material

Output: `content/publishing/voiceover/<id>/` — per-segment MP3s + `timing.json`

### Subtitles (`scripts/generate-subtitles.mjs`)
```bash
node scripts/generate-subtitles.mjs <storyboard-id> [--font <name>] [--quote-font <name>]
```
Reads storyboard + timing manifest. Produces:
- `.ass` — styled subs (Reenie Beanie main, Ephesis quotes, gold accent, fade in/out)
- `.srt` — plain text for YouTube upload

Uses app-generated word-timing from edge-tts to align subtitles to speech.

Options:
- `--font` — main text font (default: "Reenie Beanie")
- `--quote-font` — quote text font (default: "Ephesis")
- `--out` — output directory

### Quote Cards (`scripts/generate-quote-card.py`)
```bash
echo '{"text":"...","author":"...","style":"centered_sparse"}' | python3 scripts/generate-quote-card.py
```
Pillow-generated transparent PNGs for overlay. Styles:

| Style | Position | Text Font | Author Font |
|-------|----------|-----------|-------------|
| `centered_sparse` | Center | Ephesis 52px | Cormorant 28px gold |
| `lower_third` | Bottom | Reenie Beanie 44px | Cormorant 24px gold |
| `full_quote` | Center-wide | Ephesis 48px | Playfair 26px gold |

All cards: 1280x720 RGBA, transparent bg, text shadow, soft margins.

Cards are dropped into FableCut's `media/` folder, then placed on V1 or V2 as overlay clips with fade transitions.

---

## FableCut Filter Presets (Ochema treatments)

Added to `app.js` → `FILTER_PRESETS`:

| Preset | Contrast | Sat | Bright | Temp | Vignette | Grain | Other |
|--------|----------|-----|--------|------|----------|-------|-------|
| none | 100 | 100 | 100 | 0 | 0 | 0 | — |
| golden-imaginal | 108 | 82 | 97 | +15 | 16 | 3% | — |
| tibetan-red | 112 | 90 | 95 | +10 | 0 | 4% | tint +20 |
| corbin-blue | 110 | 74 | 94 | -15 | 20 | 2% | — |
| engraving-crisp | 116 | 0 | 102 | 0 | 0 | 1% | grayscale, 5% sepia |
| sepia-classic | 108 | 70 | 100 | 0 | 15 | 0 | 35% sepia |
| mystical-dark | 112 | 105 | 90 | 0 | 35 | 5% | — |

---

## Font Registry

### System-installed (for Pillow, FFmpeg, .ass subs)

| Font | Use | Source |
|------|-----|--------|
| EB Garamond | Scholarly serif | apt |
| IM FELL English | Old book | apt |
| IM FELL English SC | Small caps | apt |
| Cinzel | Classical display | Google Fonts |
| Cinzel Decorative | Ornamental display | Google Fonts |
| Cormorant Garamond | Editorial serif | Google Fonts |
| Playfair Display | Classical serif | Google Fonts |
| Alegreya | Old-style | Google Fonts |
| Lora | Readable serif | Google Fonts |
| Libre Baskerville | Old-style | Google Fonts |
| Cardo | Medieval scholarly | apt |
| Goudy Bookletter | Old style | apt |
| UnifrakturCook | Blackletter | Google Fonts |
| UnifrakturMaguntia | Blackletter | Google Fonts |
| Kaushan Script | Calligraphic | apt |
| Mea Culpa | Calligraphic | Google Fonts |
| Eagle Lake | Mystical/whimsical | Google Fonts |
| Metamorphous | Whimsical | Google Fonts |
| Parisienne | Elegant script | Google Fonts |
| MedievalSharp | Medieval display | Google Fonts |
| Old Standard TT | Classical | apt |
| **Reenie Beanie** | **Subtitles (main)** | Google Fonts |
| **Ephesis** | **Subtitles (quotes)** | Google Fonts |
| **Sedgwick Ave Display** | **Thumbnail titles** | Google Fonts |
| **Caveat** | **Handwritten subs** | Google Fonts |
| Dancing Script | Calligraphic | apt |
| Lobster Two | Script | apt |
| Junicode | Medievalist | apt |
| Elstob | Medievalist | apt |
| DejaVu Serif | Fallback | system |

### FableCut Google Fonts (auto-fetched in UI)
All above + Anton, Bebas Neue, Inter, Montserrat, Poppins, Roboto, etc. (20+ bundled in `library/fonts/`)

---

## Video Structure

Every video follows this structure in FableCut:

```
Track V1 (main visuals):
  [artwork with slow zoom] → [artwork with Ken Burns] → [quote card black page] → [artwork] → ...
  
Track A1 (audio):
  [narration segments]
```

All artwork clips: gentle slow zoom or Ken Burns pan for motion. No filters, no colour grading.
Quote cards: full-screen black with centred white serif text, speaker name in smaller gold below.

---

## Hermes MCP Integration

FableCut exposes an MCP server at `/root/projects/FableCut/mcp-server.js`.

### Register with Claude:
```bash
claude mcp add -s user fablecut -- node "/root/projects/FableCut/mcp-server.js"
```

### Available tools:

| Tool | Purpose |
|------|---------|
| `fablecut_status` | Check server, get project + media summary |
| `fablecut_docs` | Get schema docs (supports `section` filter) |
| `fablecut_get_project` | Read current timeline (pass `compact:true` for summary) |
| `fablecut_set_project` | Replace entire project JSON |
| `fablecut_patch_project` | Targeted edits — PREFER THIS |
| `fablecut_import_media` | Copy file into media/ and register |
| `fablecut_analyze_reference` | Analyze reference video into edit blueprint |

### Patch operations:
- `{op:'addClip', clip:{track:'V1', start:0, duration:10, kind:'video', mediaId:'m_xxx', props:{...}}}`
- `{op:'updateClip', id:'c_xxx', set:{props:{filterPreset:'golden-imaginal'}}}`
- `{op:'removeClip', id:'c_xxx'}`
- `{op:'addMedia', media:{src:'/media/file.mp4', kind:'video'}}`

### Hermes workflow for a video:
```
1. fablecut_status — ensure server is running
2. fablecut_import_media — import artwork images
3. fablecut_import_media — import quote card PNGs
4. fablecut_import_media — import narration MP3s
5. fablecut_patch_project — add clips to timeline:
   → V1: artwork with slow zoom (fade in)
   → V1: artwork with Ken Burns
   → V1: quote card (black page, fade in/out)
   → V1: artwork with slow zoom
   → ...
   → V1: final artwork (fade to black)
   → A1: narration segments
```

---

## Commands Quick Reference

```bash
# Start everything
screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"

# Voiceover
node /root/projects/blog/scripts/generate-voiceover.mjs <id>

# Subtitles
node /root/projects/blog/scripts/generate-subtitles.mjs <id>

# Quote cards
echo '{"text":"...","author":"...","style":"centered_sparse","output":"media/quote.png"}' | python3 /root/projects/blog/scripts/generate-quote-card.py

# Thumbnails
python3 /root/projects/blog/scripts/thumbnail_render.py --test

# Tunnel access
cloudflared tunnel --url http://localhost:7777   # FableCut
cloudflared tunnel --url http://localhost:8765   # Thumbnail server

# Kill screens
screen -S fablecut -X quit
screen -S thumbnail_server -X quit
```
