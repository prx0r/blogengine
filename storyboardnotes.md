# Storyboard Notes — Ochema Video Pipeline

## Full Pipeline

```
Essay / Research Object
    ↓
[1] generate-storyboard.mjs
    → storyboard.json (segments with narration, rhetorical roles, visual notes)
    ↓
[2] generate-voiceover.mjs
    → per-segment MP3s + timing.json
      (en-US-AriaNeural female = main, en-GB-RyanNeural male = quotes)
    ↓
[3] generate-visual-assignment.mjs   ← NEW
    → visual-assignment.json (artwork, treatments per segment)
    ↓
[4] generate-subtitles.mjs
    → .ass (styled) + .srt (YouTube plain)
    ↓
[5] generate-quote-card.py
    → transparent quote PNGs
    ↓
[6] Hermes → FableCut MCP
    → project.json (timeline with clips, filters, transitions)
    ↓
[7] Preview in browser (FableCut UI)
    → tweak timings, swap artwork, adjust filters
    ↓
[8] Export MP4
    → ffmpeg CRF-18, 1280x720
```

---

## Video Structure Template

Every Ochema video follows this structure:

```
OPENING:
  black (2s)
  doorway clip (fade from black, 6-10s)
  black (1.5s, audio continues)

BODY (per beat):
  artwork (with treatment filter + slow zoom)
  — or —
  quote card (transparent PNG overlay, fade in/out)
  — or —
  visual clip (LTX-generated scene)

CLOSING:
  black (1.5s)
  doorway clip reversed (fade to black, 6-10s)
  black (2s)
```

---

## Segments → Event Type Mapping

| Rhetorical Role | Visual Event Type | Duration Range |
|----------------|-------------------|----------------|
| hook | doorway_open | 6-10s |
| context | artwork | 10-20s |
| evidence | artwork | 12-25s |
| quote | quote_card | 6-12s |
| example | artwork | 10-18s |
| contrast | artwork | 10-15s |
| reconstruction | artwork | 12-20s |
| implication | artwork or visual clip | 10-18s |
| synthesis | artwork | 12-20s |
| closing | doorway_close | 6-10s |
| section_break | black (audio continues) | 1.5-3s |

---

## Visual Assignment Schema

Stored at: `content/video-objects/<slug>/visual-assignment.json`

```json
{
  "video_id": "tantraloka-01",
  "storyboard_id": "tantraloka-01-engine-of-consciousness",
  "generated": "2026-07-20",
  "model": "deepseek-chat",
  "segments": [
    {
      "segment_id": "seg-01-hook",
      "type": "doorway_open",
      "doorway": "door_candle_001.mp4",
      "duration": 8,
      "notes": "Candle flame doorway — contemplative entry"
    },
    {
      "segment_id": "seg-02-context",
      "type": "artwork",
      "artwork_id": "art_alchemy_e270",
      "treatment": "golden-imaginal",
      "motion": "slow_zoom",
      "duration": 14,
      "concepts_matched": ["light", "descent", "consciousness"]
    },
    {
      "segment_id": "seg-03-quote",
      "type": "quote_card",
      "quote_text": "Consciousness is not in the body.",
      "quote_author": "Abhinavagupta",
      "style": "centered_sparse",
      "duration": 8,
      "font": "ephesis"
    },
    {
      "segment_id": "seg-04-evidence",
      "type": "artwork",
      "artwork_id": "art_alchemy_e045",
      "treatment": "corbin-blue",
      "motion": "ken_burns",
      "duration": 14
    },
    {
      "segment_id": "seg-05-closing",
      "type": "doorway_close",
      "doorway": "door_candle_001.mp4",
      "duration": 6
    }
  ]
}
```

### Decision Rules

1. **Rhetorical role** determines the event type (see mapping table above)
2. **Key concepts** from segment narration → matched against art gallery `concepts` + `visual_motifs` + `mood` fields
3. **Mood** of the segment text → picks treatment preset that matches
4. **Quote segments** use the exact quote text from the storyboard's `on_screen_text` or narration
5. **First segment** is always `doorway_open`, **last segment** always `doorway_close`
6. **Default treatment** per tradition:
   - Kashmir Shaivism → golden-imaginal
   - Sufi / Corbin → corbin-blue
   - Western occult / Hermetic → engraving-crisp
   - Buddhist / emptiness → sepia-classic
   - Tantra / energy → tibetan-red

---

## Treatment Presets

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

## Quote Card Styles

| Style | Position | Text Font | Author Font | Best For |
|-------|----------|-----------|-------------|----------|
| centered_sparse | Center | Ephesis 52px | Cormorant 28px gold | Major quotes, full attention |
| lower_third | Bottom | Reenie Beanie 44px | Cormorant 24px gold | Supplementary quotes, overlay on artwork |
| full_quote | Center-wide | Ephesis 48px | Playfair 26px gold | Longer quotes, contemplative pause |

All: 1280x720 RGBA, transparent bg, text shadow, soft margins.

---

## Font Registry

### Subtitle fonts
| Font | Use |
|------|-----|
| Reenie Beanie | Main narration subtitles |
| Ephesis | Quote attribution subtitles |

### Quote card fonts
| Font | Use |
|------|-----|
| Ephesis | Quote text (centered_sparse, full_quote) |
| Reenie Beanie | Quote text (lower_third) |
| Cormorant Garamond | Author attribution (gold) |
| Playfair Display | Author attribution (full_quote) |

### Thumbnail fonts
| Font | Use |
|------|-----|
| Sedgwick Ave Display | Video title |
| Cinzel | Classical/academic titles |
| UnifrakturCook | Occult/gothic titles |
| EB Garamond | Scholarly captions |

### System-installed (all available for any use)
EB Garamond, IM FELL English, IM FELL English SC, Cinzel, Cinzel Decorative,
Cormorant Garamond, Playfair Display, Alegreya, Lora, Libre Baskerville,
Cardo, Goudy Bookletter, UnifrakturCook, UnifrakturMaguntia,
Kaushan Script, Mea Culpa, Eagle Lake, Metamorphous, Parisienne,
MedievalSharp, Old Standard TT, Reenie Beanie, Ephesis,
Sedgwick Ave Display, Caveat, Dancing Script, Lobster Two,
Junicode, Elstob, DejaVu Serif (fallback)

---

## Asset Storage

### Per-video assets
```
content/video-objects/<slug>/
  market.json                    — YouTube market snapshot
  commission-draft.json          — LLM creative brief
  video.json                     — compiled video object
  visual-assignment.json         — artwork/treatment per segment  ← NEW
  thumbnail.png                  — generated thumbnail
```

### Generated assets
```
content/publishing/
  storyboards/<id>.json          — storyboard (segments, narration)
  voiceover/<id>/                — per-segment MP3s + timing.json
  subtitles/<id>/                — .ass + .srt
  renders/<id>/                  — per-segment video clips
  videos/<id>.mp4                — final rendered video
```

### Art library
```
content/glossary/art/<id>.json   — artwork metadata (348+ records)
public/art/<id>.jpg              — artwork images
```

### Visual library (reusable clips)
```
content/video-objects/visual-library/
  doorways/                      — doorway clips (candle, mist, rain, etc.)
  treatments/                    — LTX-generated scenes
  overlays/                      — particle effects, animated SVGs
```

---

## Hermes → FableCut MCP Workflow

### Register the MCP server
```bash
claude mcp add -s user fablecut -- node "/root/projects/FableCut/mcp-server.js"
```

### Build a video timeline
```
1. fablecut_status — check server running, get project summary
2. fablecut_import_media — import all assets (doorway clips, artwork, narration, quote cards)
3. fablecut_patch_project — build timeline:
   a. Add media entries for all imported files
   b. Add clips to V1 in order:
      - doorway (fade from black, filter: golden-imaginal)
      - black (1.5s, audio continues)
      - artwork (filter: golden-imaginal, slow zoom keyframe)
      - quote card (fade in/out, V2)
      - artwork (filter: corbin-blue)
      - ...
      - black (1.5s)
      - doorway reversed (fade to black, speed: -1)
   c. Add narration to A1 at corresponding times
   d. Add ambient bed to A1 (lower volume)
4. fablecut_get_project {compact:true} — review timeline
5. User tweaks in browser → export
```

### Key patch operations
```json
{"op":"addMedia", "media":{"src":"/media/door_candle.mp4", "kind":"video"}}
{"op":"addMedia", "media":{"src":"/media/art_001.jpg", "kind":"image"}}
{"op":"addMedia", "media":{"src":"/media/narration.mp3", "kind":"audio"}}

{"op":"addClip", "clip":{
  "id":"c_doorway", "track":"V1", "start":0, "duration":8,
  "kind":"video", "mediaId":"m_door",
  "props":{"filterPreset":"golden-imaginal"},
  "transitionIn":{"type":"fade","duration":1.2}
}}

{"op":"updateClip", "id":"c_art_01", "set":{
  "props":{"filterPreset":"corbin-blue", "contrast":110}
}}
```

---

## Visual Assignment Decision Process

Given a storyboard segment, how to pick the artwork:

1. **Extract keywords** from the narration text (nouns, concepts, proper names)
2. **Match against art metadata**:
   - `concepts` field (highest weight)
   - `visual_motifs` field
   - `mood` field
   - `entities_depicted` field
   - `style` field
3. **Score candidates** by overlap count + concept match strength
4. **Prefer artworks with rich metadata** (tagged concepts > untagged)
5. **Fallback**: use the video's assigned image from thumbnail assignment

### Tradition → artwork filter:
| Tradition/Topic | Preferred Artwork Source | Treatment |
|----------------|-------------------------|-----------|
| Kashmir Shaivism / Tantraloka | Alchemical emblems, Indian sculpture | golden-imaginal |
| Sufi / Corbin | Persian miniatures, angel illustrations | corbin-blue |
| Neoplatonism | Renaissance engravings, Fludd diagrams | engraving-crisp |
| Western occult / Hermetic | Alchemical emblems, grimoire pages | engraving-crisp |
| Buddhist / emptiness | Buddha images, mandalas | sepia-classic |
| Yoga / practice | Nature scenes, mountain, dawn | golden-imaginal |
| Daimon / angel | Angel paintings, Merkaba, visionary | corbin-blue |
| Death / transformation | Skull imagery, dark emblems | mystical-dark |
| Fire / energy | Sun imagery, flame emblems | tibetan-red |

---

## Analytics Tie-in

Visual-assignment.json enables:

- **Retention correlation**: "segments with golden-imaginal treatment had +8% retention"
- **Artwork performance**: "art_alchemy_e045 was used in 3 top-performing videos"
- **Treatment A/B**: compare two versions of same video with different visual assignments
- **Beat-level analytics**: map YouTube retention curve back to specific artwork + treatment combos

After upload, the analytics pipeline reads:
```
youtube retention curve
  → maps elapsedVideoTimeRatio × duration → beat timestamps
  → joins against visual-assignment.json
  → per-segment retention, dropoff, rewatch signals
  → stored in video.json analytics fields
```

---

## Services

### FableCut Editor
```
Port: 7777
Start:   screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"
Stop:    screen -S fablecut -X quit
URL:     http://localhost:7777
Tunnel:  https://remembered-donations-glasgow-alive.trycloudflare.com
```

### Thumbnail Server
```
Port: 8765
Start:   screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
Stop:    screen -S thumbnail_server -X quit
URL:     http://localhost:8765
Tunnel:  https://passenger-literary-alignment-enable.trycloudflare.com
Endpoints:
  /api/images       — all artwork images
  /api/matches      — video-to-image match results
  /api/assignments  — saved user assignments
  /api/render       — render thumbnail
  /img/<id>         — serve any artwork
```

### Vast.ai (LTX generation only)
```
GPU instance for generating doorway clips, visual scenes.
SSH: ssh -i ~/.ssh/id_ed25519 -p 35915 root@ssh1.vast.ai
ComfyUI: http://198.53.64.194:35076/
API: http://198.53.64.194:35219/
```

---

## Commands Cheat Sheet

```bash
# Start everything
screen -dmS thumbnail_server bash -c "python3 /root/projects/blog/scripts/thumbnail_server.py 8765"
screen -dmS fablecut bash -c "cd /root/projects/FableCut && node server.js"

# Generate storyboard from RO
node scripts/generate-storyboard.mjs --ro ro:<slug> --title "..." --series "..."

# Generate voiceover
node scripts/generate-voiceover.mjs <storyboard-id>

# Generate subtitles
node scripts/generate-subtitles.mjs <storyboard-id>

# Generate quote card
echo '{"text":"...","author":"...","style":"centered_sparse"}' | python3 scripts/generate-quote-card.py

# Thumbnail test
python3 scripts/thumbnail_render.py --test

# Start tunnels
cloudflared tunnel --url http://localhost:7777   # FableCut
cloudflared tunnel --url http://localhost:8765   # Thumbnails

# Stop screens
screen -S fablecut -X quit
screen -S thumbnail_server -X quit

# View logs
cat /tmp/fablecut_tunnel.log
cat /tmp/thumbnail_server.log
```
