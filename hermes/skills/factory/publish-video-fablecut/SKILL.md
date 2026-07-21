---
name: publish-video-fablecut
description: Full pipeline — storyboard → voiceover → art search → quote cards → FableCut timeline → export. Run after essay is written.
version: 2.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [video, publish, fablecut, pipeline]

---

# Publish Video (FableCut)

Full pipeline: storyboard → edge-tts voiceover → art search → subtitle .ass → black-page quote PNGs → FableCut timeline → preview → export. Uses deepseek-v4-flash for storyboard generation. Default voice: en-US-AriaNeural.

## When to Use
- "Generate a video for ro:ajahn-lee-in-mind"
- "Publish expanded essay 1 as a video"
- "Make a video from the tattvas RO"

## Prerequisites
- `edge-tts` installed
- `ffmpeg` installed
- `VIDEO_LLM_API_KEY` set (opencode endpoint)
- FableCut server running on port 7777

## File Locations

```
Project root:            /root/projects/blog
FableCut:                /root/projects/FableCut
Scripts:                 /root/projects/blog/scripts/
Art gallery:             /root/projects/blog/content/glossary/art/
Research objects:        /root/projects/blog/content/research-objects/
Output storyboards:      /root/projects/blog/content/publishing/storyboards/
Output voiceover:        /root/projects/blog/content/publishing/voiceover/
Output subtitles:        /root/projects/blog/content/publishing/subtitles/
Output videos:           /root/projects/blog/public/videos/
Visual assignments:      /root/projects/blog/content/video-objects/<slug>/visual-assignment.json
```

---

## Procedure

### Phase 0: Resolve the source

The user provides either:
- `--ro ro:<slug>` — a research object (e.g. `ro:ajahn-lee-in-mind`)
- `--essay <slug>` — an essay JSON (e.g. `ficino-on-the-daimon`)
- `--expanded <n>` — an expanded essay number

Extract:
- `ro_id` — the full RO identifier (e.g. `ro:ajahn-lee-in-mind`)
- `title` — a human-readable episode title
- `series` — the series name (e.g. `tantraloka`, `mixed-traditions`)

If no title is provided, use the RO's title field.

---

### Phase 1: Generate storyboard

```bash
cd /root/projects/blog

node scripts/generate-storyboard.mjs \
  --ro {ro_id} \
  --title "{title}" \
  --series "{series}"
```

This calls DeepSeek with the RO's passages. It produces:
`content/publishing/storyboards/{episode_id}.json`

**Validation:**
- File exists and parses as JSON
- Has at least 5 segments
- First segment `rhetorical_role` is `"hook"`
- Last segment `rhetorical_role` is `"closing"`
- Every segment has non-empty `narration` text

Store `episode_id` from the generated file for subsequent phases.

---

### Phase 2: Generate voiceover

```bash
node scripts/generate-voiceover.mjs {episode_id}
```

Edge-TTS generates per-segment MP3s. Dual voice:
- `en-US-AriaNeural` (female) for main commentary blocks
- `en-GB-RyanNeural` (male) for quote/source blocks

The script auto-detects the voice per segment based on the storyboard's `rhetorical_role`:
- `source` / `quote` → male voice
- everything else → female voice

**Output:**
`content/publishing/voiceover/{episode_id}/`
- `seg-*.mp3` per segment
- `timing.json` with exact audio durations

**Validation:**
- `timing.json` exists and has entries for every segment
- All MP3 files exist and are non-zero
- Total audio duration matches storyboard estimate within 20%

---

### Phase 3: Search and assign artwork

For each storyboard segment, find related artwork using the art gallery API.

**For artwork segments** (context, evidence, example, contrast, synthesis, etc.):

1. Extract key concepts and keywords from the segment's narration text
2. Search the art gallery at `/root/projects/blog/content/glossary/art/` by matching keywords against each artwork's `concepts`, `visual_motifs`, `mood`, and `entities_depicted` fields
3. Score candidates by overlap count
4. Pick the best match — prefer artwork with rich metadata (tagged concepts)
5. Fallback: use an alchemical emblem with the closest mood

The FableCut timeline should apply a **slow zoom or Ken Burns pan** to each artwork clip so there's gentle motion throughout.

**For quote segments:**

1. Extract the quote text from the segment's `on_screen_text` or the most quotable sentence from its `narration`
2. Generate a **black page** with:
   - White serif text (EB Garamond, centered)
   - Speaker name in smaller gold-serif (Cormorant) underneath
   - No shadow, no decoration, no effects
3. Use `generate-quote-card.py` with style `black_page` or `black_page_compact`
4. Place in FableCut on V1 (not V2 overlay) — it's a full-screen card

**Output:**
`content/video-objects/{slug}/visual-assignment.json`

**Schema:**
```json
{
  "video_id": "tantraloka-01",
  "storyboard_id": "{episode_id}",
  "generated": "2026-07-20",
  "segments": [
    {
      "segment_id": "seg-01-hook",
      "type": "artwork",
      "artwork_id": "art_alchemy_e270",
      "motion": "slow_zoom",
      "duration": 40.0,
      "concepts_matched": ["light", "consciousness"]
    },
    {
      "segment_id": "seg-02-quote",
      "type": "quote_card",
      "quote_text": "The imaginal is not the imaginary.",
      "quote_author": "Henry Corbin",
      "style": "black_page",
      "duration": 10.0
    },
    {
      "segment_id": "seg-03-context",
      "type": "artwork",
      "artwork_id": "art_alchemy_e045",
      "motion": "ken_burns",
      "duration": 41.0,
      "concepts_matched": ["transformation", "ascent"]
    }
  ]
}
```

**Writing the file:**
Since you (the agent) are making creative decisions per segment, construct the JSON directly rather than calling a script. Validate against the schema above.

---

### Phase 4: Generate subtitles

```bash
node scripts/generate-subtitles.mjs {episode_id}
```

Produces:
- `content/publishing/subtitles/{episode_id}/{episode_id}.ass` — styled (Reenie Beanie main, Ephesis quotes, gold accent)
- `content/publishing/subtitles/{episode_id}/{episode_id}.srt` — plain for YouTube

**Validation:**
- Both files exist and have content
- .ass file has proper [V4+ Styles] header
- .srt file has sequential numbering

---

### Phase 5: Generate quote card images

For each `quote_card` segment in the visual assignment, generate the PNG:

```bash
echo '{"text":"...","author":"...","style":"centered_sparse","output":"/root/projects/FableCut/media/quote_{slug}_{segment_id}.png"}' \
  | python3 /root/projects/blog/scripts/generate-quote-card.py
```

Available styles: `centered_sparse`, `lower_third`, `full_quote`

Generated PNGs go into FableCut's media directory so they're ready for the timeline.

**Validation:**
- All quote card PNGs exist and are > 5KB
- Transparent background confirmed (check alpha channel with Pillow)

---

### Phase 6: Build FableCut timeline via MCP

Ensure FableCut is running. If not, start it:
```bash
cd /root/projects/FableCut && node server.js &
```

FableCut exposes an MCP server. Use the following approach via its REST API:

**Step 6a: Import all media assets**

```bash
# Import artwork images (from visual-assignment.json)
curl -s -X POST http://localhost:7777/api/upload \
  -F "file=@/root/projects/blog/public/art/{artwork_filename}"

# Import quote card PNGs (from Phase 5)
curl -s -X POST http://localhost:7777/api/upload \
  -F "file=@/root/projects/FableCut/media/quote_{slug}_{segment_id}.png"

# Import voiceover MP3s
curl -s -X POST http://localhost:7777/api/upload \
  -F "file=@/root/projects/blog/content/publishing/voiceover/{episode_id}/{segment_id}.mp3"

# (No doorway clips — all visual segments use artwork or black-page quote cards)
```

After each upload, note the returned media entry (id, src, duration, kind).

**Step 6b: Build the timeline JSON**

Read the current project:
```bash
curl -s http://localhost:7777/project.json
```

Construct a new project.json with this structure:

```
Settings:
  width: 1280, height: 720, fps: 25

Tracks:
  V1 — main visuals (artwork + quote cards, full-screen)
  A1 — narration

Clips (in chronological order):

V1:
  [0.0s]  artwork 1 — slow zoom, fade in from black
  [end]   artwork 2 — Ken Burns pan, crossfade
  [end]   black page quote — fade in/out, serif text
  [end]   artwork 3 — slow zoom, crossfade
  ...
  [end]   final artwork — fade to black

A1:
  [0.0s]  narration seg-01
  [end]   narration seg-02
  [end]   narration seg-03
  ...
```

Write the full project.json:
```bash
curl -s -X PUT http://localhost:7777/api/project \
  -H "Content-Type: application/json" \
  -d @project_video.json
```

Use the MCP patch endpoint for fine-grained adjustments after the initial write.

---

### Phase 7: User preview

The FableCut UI is at `http://localhost:7777`. Tell the user:

> "The timeline is ready at http://localhost:7777. You can:
> - Play through the entire video
> - Drag clips to reorder
> - Adjust filter presets in the Grade panel
> - Change transitions (Alt+T on selected clip)
> - Tweak quote card timing
> - When satisfied, click Export for final MP4"

The user needs to open the UI in a browser before they can export (the export runs in-browser using the compositor).

If the user can't access localhost, start a tunnel:
```bash
cloudflared tunnel --url http://localhost:7777
```

---

### Phase 8: Export

User clicks Export in the FableCut UI. The export process:
1. Browser composites every frame using Canvas
2. FFmpeg encodes CRF-18 MP4 at 1280x720
3. Saves to `exports/` directory

Alternatively, for headless export (if the user wants to render without a browser):
```bash
# This requires the FableCut compositor to be running
# Currently FableCut renders in-browser, so browser is required for final export
```

---

## Quick Start — Full Pipeline

```bash
cd /root/projects/blog

# 1. Generate storyboard
node scripts/generate-storyboard.mjs --ro ro:ajahn-lee-in-mind \
  --title "Keeping the Breath in Mind" \
  --series "tantraloka"

# 2. Generate voiceover
node scripts/generate-voiceover.mjs ajahn-lee-in-mind

# 3. Manual step: write visual-assignment.json with artwork picks
#    (agent does this based on the storyboard segments)

# 4. Generate subtitles
node scripts/generate-subtitles.mjs ajahn-lee-in-mind

# 5. Generate quote card PNGs
#    (one per quote segment in the visual assignment)

# 6. Build FableCut timeline via MCP/REST

# 7. User previews in browser

# 8. Export
```

## Files Created

| File | Location |
|------|----------|
| Storyboard JSON | `content/publishing/storyboards/{id}.json` |
| Voiceover MP3s | `content/publishing/voiceover/{id}/` |
| Visual assignment | `content/video-objects/{slug}/visual-assignment.json` |
| Subtitles .ass | `content/publishing/subtitles/{id}/{id}.ass` |
| Subtitles .srt | `content/publishing/subtitles/{id}/{id}.srt` |
| Quote card PNGs | `/root/projects/FableCut/media/quote_{slug}_*.png` |
| FableCut project | `/root/projects/FableCut/project.json` |
| Final video | `/root/projects/FableCut/exports/{name}.mp4` |

## Manual Override Points

The pipeline is designed for you (the agent) to make creative decisions at these points:
1. **Phase 3 (Art Search)** — which artwork per segment
2. **Phase 6 (Timeline)** — clip order, exact timings, transitions
3. **Phase 7 (Preview)** — user tweaks before final export

After 3-4 seed videos, you will have enough pattern data to make these decisions faster.
