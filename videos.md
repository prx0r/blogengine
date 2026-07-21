# Video Essay System — Storyboard-Driven Video Pipeline

> Implementation update: the canonical upstream object now lives in
> `content/video-objects/<slug>/video.json`. It adds live breakout evidence,
> packaging hypotheses, the complete beat-script, deterministic reading-time
> calculation, and exact beat/shot timing before this document's render and
> retention stages. See `hermes/docs/video-object-pipeline.md`.

The core idea: **the storyboard serves two masters** — it must be simple enough to generate beautiful videos, and structured enough that analytics can learn from it later.

## Architecture

```
Essay-level mythos + style direction
→ frame-level local labels
→ frame-level concept tags
→ frame-level visual descriptions
→ compiler-generated video DNA
→ YouTube retention mapped back to frames
```

## DeepSeek Storyboard JSON Schema

Keep output human-readable, structured for analytics:

```json
{
  "essay_title": "string",
  "essay_thesis": "string",
  "mythos_filter": "string",
  "visual_direction": "string",
  "global_concepts": ["string"],
  "global_entities": ["string"],
  "frames": [
    {
      "frame_label": "string",
      "start": 0.0,
      "end": 10.0,
      "rhetorical_role": "hook | thesis | quote | example | contrast | expansion | transition | intensification | synthesis | closing",
      "local_concepts": ["string"],
      "image_description": "string",
      "search_terms": ["string"],
      "reason": "string",
      "quote_text": null
    }
  ]
}
```

**Crucial fields**: `frame_label`, `rhetorical_role`, `local_concepts`, `image_description`, `quote_text` — because later analytics can ask: "quote frames retained better than contrast frames" or "alchemical vessel images retained better than portrait images."

## Two-Level Tag System

```txt
global_concepts = what the whole essay is about
local_concepts  = what this exact frame is doing
```

Example for a daimon essay:

```json
{
  "global_concepts": ["daimon", "genius", "vocation", "soul-guidance"],
  "frames": [
    { "frame_label": "The Call",      "local_concepts": ["summons", "vocation", "restlessness"] },
    { "frame_label": "The Refusal",   "local_concepts": ["avoidance", "fear", "ego-resistance"] },
    { "frame_label": "Eros as Guide", "local_concepts": ["eros", "longing", "orientation"] },
    { "frame_label": "Angel of the Work", "local_concepts": ["genius", "service", "higher intelligence"] }
  ]
}
```

## Three-Layer Frame Identity

```txt
A. Global concept tags  → essay-level
B. Frame local concepts → moment-level (semi-standardized)
C. Frame label          → unique human-readable name (poetic)
D. Rhetorical role      → fully standardized for analytics
```

## Mythos Filter

Every essay passes through a house filter that makes the channel feel like itself:

```txt
Hermetic mythos filter:
Treat philosophy, Buddhism, ecology, alchemy, astrology, and metaphysics as different symbolic languages
for consciousness, transformation, value, and participation. Prefer images that feel archival, sacred,
intelligent, strange, luminous, and mythic. Avoid generic AI fantasy, wellness-core, corporate stock imagery,
or random occult wallpaper.
```

Tradition-specific visual directions vary (Tibetan thangka, Renaissance alchemy, early scientific illustrations) but the mythos remains consistent.

## Full DeepSeek Prompt

Use as the actual storyboard-generation prompt:

> You are a storyboard director for philosophical, mystical, ecological, and esoteric audio essays. Your job is to convert an essay script with timings into a rhythm-aware visual storyboard for a slow cinematic listening video. The video style is not generic educational content. It must retain a coherent mythos: archival, symbolic, luminous, contemplative, strange, intelligent, and sacred without becoming cheap fantasy or random occult wallpaper.
>
> First, analyze the essay's structure as rhythm: Where does it breathe? Where does a new theme begin? Where is a quote being read? Where does the argument pivot? Where would an image genuinely help the listener understand? Where should one image stay longer to preserve atmosphere?
>
> Use roughly 10-second frames by default. Use 6-8 seconds for quick transitions. Use 14-20 seconds for major meditative images. Avoid frames shorter than 6s or longer than 20s unless intentional. Return valid JSON only (see schema above).

## How Storyboard Becomes Video

```
DeepSeek storyboard
→ validate JSON
→ resolve concepts against glossary
→ fetch/select image or motion asset
→ align quotes to word timings
→ generate subtitle chunks
→ compile render timeline
→ render mp4
→ save video DNA
```

Asset resolution priority:
1. Reusable motion clip exists → use it
2. Approved glossary image exists → animate with slow zoom/parallax
3. No asset → search public-domain archives → queue for future generation

## Analytics Design — Three Layers

### A. Video-level DNA (what the whole video is about)
```json
{
  "global_concepts": ["daimon", "vocation", "genius", "eros"],
  "global_entities": ["Plato", "Ficino", "Hillman"],
  "visual_direction": "Florentine hermetic daemonology...",
  "style_profile": "hermetic_documentary_v1"
}
```

### B. Frame-level DNA (what this moment is doing)
```json
{
  "frame_label": "The Call",
  "rhetorical_role": "hook",
  "local_concepts": ["summons", "restlessness", "vocation"],
  "asset_tags": ["candlelit figure", "threshold", "angelic light"],
  "duration": 11.2,
  "quote_active": false
}
```

### C. Performance data (how viewers responded)
```json
{
  "frame_label": "The Call",
  "retention_start": 1.0,
  "retention_end": 0.87,
  "retention_delta": -0.13,
  "dropoff_flag": true
}
```

## YouTube Retention → Frame Mapping

YouTube gives `elapsedVideoTimeRatio` and `audienceWatchRatio` per point. Convert:

```txt
elapsed_seconds = elapsedVideoTimeRatio × video_duration
→ find frame where start <= elapsed_seconds < end
```

## Frame Scoring

Per frame: `retention_start`, `retention_end`, `retention_delta`, `average_retention`, `dropoff_rate`, `rewatch_signal`. Aggregate across videos to answer:

- Which rhetorical roles retain best?
- Which local concepts retain best?
- Which visual motifs retain best?
- Which author names cause dropoff?
- Which quote-card lengths work?
- Which image durations work?
- Which style profiles perform best?

## Best Tag System Hierarchy

```txt
Global concepts   → essay category
Local concepts    → what this moment does
Frame label       → human-readable name
Rhetorical role   → analytics category
Visual motifs     → what appears visually
Asset concepts    → glossary-linked concepts on the chosen image
```

## Database Tables

- `essays` — id, title, script_text, essay_thesis, global_concepts, global_entities
- `storyboards` — id, essay_id, version, mythos_filter, visual_direction, storyboard_json
- `frames` — id, storyboard_id, frame_index, frame_label, start/end_seconds, rhetorical_role, local_concepts, image_description, search_terms, quote_text
- `assets` — id, title, source, local_path, license, content/style_tags, reusable_score
- `motion_assets` — id, base_asset_id, file_path, duration, prompt, model_used, reusable_score
- `renders` — id, storyboard_id, render_engine, output_path, style_profile, duration, timeline_json
- `video_dna` — id, render_id, dna_json
- `youtube_uploads` — id, render_id, youtube_video_id, title, privacy_status
- `youtube_retention_points` — id, youtube_video_id, elapsed_ratio, elapsed_seconds, audience_watch_ratio
- `frame_performance` — id, frame_id, youtube_video_id, average_retention, retention_start/end/delta, dropoff_flag, rewatch_signal

## Full Algorithm

1. Input essay script + MP3
2. Run forced alignment → word/sentence/paragraph/quote timings
3. Send script + timings to DeepSeek → storyboard JSON
4. Validate JSON (no overlapping frames, valid roles, quote_text exists in script)
5. Normalize tags → map local_concepts to glossary concept IDs
6. Resolve assets (reusable motion → glossary art → public-domain archives → generate)
7. Compile timeline (asset + motion preset + transition + quote overlay + subtitles)
8. Render video
9. Save video DNA (storyboard, assets, timings, overlays, style, settings)
10. Upload to YouTube
11. Ingest YouTube analytics (views, watch time, retention points)
12. Map retention points to frames (elapsed_ratio × duration → frame lookup)
13. Compute frame performance (score each frame)
14. Generate insight report (which concepts/roles/motifs work best)

## The Core Loop

```
Essay → rhythm analysis → mythos-filtered storyboard → glossary/concept matching
→ still or motion asset selection → video render → mp4
→ video DNA → YouTube retention mapping → frame-level performance
→ creative insight → better future storyboard
```

Every video becomes an experiment in: **which ideas, under which symbolic images, at which rhythm, with which mythic style, held attention?**

---

## Integration: Molts Studio v2 (ViMax Pipeline)

The `molts.live/studio-v2` project is a full video generation platform on Cloudflare Workers that maps directly to this video pipeline. It provides:

### ViMax Character-Continuity Storyboarding

Takes a story idea and produces a multi-shot video with consistent characters:

```
Story idea
  → Extract characters (LLM: appearance, static/dynamic features, seed)
  → Generate character portraits (Huanyin image gen)
  → Design storyboard (shot type, duration, visual prompt, character refs)
  → Generate each shot sequentially (LTX-2 text-to-video)
  → Chain shots with character continuity (portrait references + seed consistency)
  → Final video in R2, served via Cloudflare Stream
```

### Smart Prompt Enhancement

```
Raw prompt → Kimi K2.5 LLM with high-rated prompt library → enhanced cinematic prompt
  → Cached in D1 prompt_cache table
  → Prompt_library tracks ratings + usage_count per enhanced prompt
  → Feedback loop: video ratings update prompt_library → better prompts over time
```

### How It Maps

| Our pipeline (videos.md) | ViMax equivalent |
|---|---|
| DeepSeek storyboard JSON | ViMax storyboard (shots with visual_prompt, shot_type, duration) |
| Frame labels + rhetorical roles | Shot sequence + shot_type (wide/medium/close-up) |
| frame_label, local_concepts | shot description, character references |
| image_description, search_terms | visual_prompt for LTX-2 generation |
| Asset resolution (glossary art → public domain → generate) | Character portraits (Huanyin) + LTX-2 video gen |
| Compile render timeline | Sequential shot generation with first-frame continuity |
| video DNA → YouTube analytics | Video ratings + prompt_library feedback loop |

### Stack

All on Cloudflare Workers: D1 (jobs, projects, videos, prompt_cache, scenes, characters, storyboards), R2 (video + image storage), Chutes API (LTX-2 video gen, Hunyuan image gen, Kimi K2.5 LLM). Already deployed at `molts-v2.tradesprior.workers.dev`.

### Key Files

- `studio-v2/worker-prod-v2.js` — Full Worker with ViMax pipeline, job queue, prompt enhancement, project management
- `studio-v2/index.html` — Frontend with Quick Generate, ViMax Production, Gallery, Queue
- `studio-v2/wrangler-prod-v2.toml` — Wrangler config for D1 + R2 bindings
- `studio-v2/migrations/` — Database migrations for jobs, projects, scenes, characters, portraits, storyboards, continuity
