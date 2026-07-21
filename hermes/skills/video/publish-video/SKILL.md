---
name: publish-video
description: Generate a complete video episode from a Research Object — storyboard, voiceover, FableCut timeline, preview, export
version: 2.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [video, publish, fablecut, ochema]
deprecated: true
superseded_by: publish-video-fablecut
---

# Publish Video

Full pipeline: RO → storyboard → edge-tts voiceover → Manim render → FFmpeg assembly → YouTube upload. Outputs a complete MP4 video with geometric animations and TTS narration, backed by your voiceover when you're ready to record.

## When to Use
- "Generate a video for ro:nanavira-clearing-path"
- "Publish video episode about the tattvas"
- "Make a video from the Ficino daimon RO"

## Prerequisites
- `edge-tts` installed (Python CLI — already on system)
- `ffmpeg` installed (already on system)
- `manim` installed (`pip install manim`) — only needed if using Manim scenes
- DeepSeek API key set as `DEEPSEEK_API_KEY` env var (already set)
- YouTube OAuth credentials in `~/.hermes/youtube-credentials.json` (for upload step)

## Procedure

### Phase 1: Storyboard

```bash
cd /root/projects/blog

# From a Research Object
node scripts/generate-storyboard.mjs --ro {ro_id} --series "{series}" --title "{episode_title}"

# From an essay JSON  
node scripts/generate-storyboard.mjs --essay {essay_id} --series "{series}"

# Review the generated storyboard
cat content/publishing/storyboards/{episode_id}.json
```

**What it does:** DeepSeek reads the RO passages and generates a storyboard JSON with 5-8 segments, each containing narration text, Manim scene specs, on-screen text, and rhetorical roles.

**Validation gate:**
- Storyboard JSON exists and parses
- Has at least 5 segments
- Narration text is non-empty for all segments
- First segment is `rhetorical_role: "hook"`
- Last segment is `rhetorical_role: "closing"`

**If validation fails:** Re-run with a more specific title or series context. Check that the RO has enough body passages.

---

### Phase 2: Voiceover

```bash
node scripts/generate-voiceover.mjs {episode_id}
```

**What it does:** Calls `edge-tts` for each segment's narration text. Segments with identical text are cached (SHA1 keyed by text + voice). Produces per-segment MP3 files + a `timing.json` manifest with exact audio durations.

**Voices:**
- `en-GB-RyanNeural` (British male — default, scholarly)
- `en-US-AriaNeural` (American female — alternative)
- `en-US-JennyNeural` (American female, warmer)

Change voice: `node scripts/generate-voiceover.mjs {episode_id} --voice en-US-AriaNeural`

**Validation gate:**
- `timing.json` exists with all segments
- All MP3 files exist and are non-zero
- No errors in output

**If validation fails:** Check edge-tts is installed (`which edge-tts`). Check internet. Retry failed segments individually.

---

### Phase 3: Manim Scenes (Optional — skip for still-image mode)

```bash
# Install Manim if needed
pip install manim

# Render each scene (from the storyboard's visual.scene_file references)
cd content/publishing/manim
manim -pql distillery_style.py K4Build
manim -pql distillery_style.py NanaviraQuote

# Create custom scenes per episode
# Copy distillery_style.py as a starting template
# Each scene class must match the storyboard's visual.scene_class
```

**If you skip Manim:** Assembly falls back to `--mode still` which uses art images from `content/glossary/art/` with slow zoom animations.

**Validation gate:**
- Each referenced `.py` scene file exists
- `manim -ql {scene_file} {scene_class}` succeeds (use `-ql` for fast preview)

---

### Phase 4: Assembly

```bash
# With Manim scenes
node scripts/assemble-video.mjs {episode_id} --mode manim

# With still art images (no Manim)
node scripts/assemble-video.mjs {episode_id} --mode still

# With custom output path
node scripts/assemble-video.mjs {episode_id} --output ~/videos/ep1.mp4
```

**What it does:**
1. Creates per-segment video clips (Manim scene or still image + slow zoom)
2. Muxes voiceover audio onto each clip
3. Adds intro card (episode title + series)
4. Adds outro card (subscribe CTA)
5. Concatenates all clips into final MP4

**Output:** `public/videos/{episode_id}.mp4`

**Validation gate:**
- Output file exists and is > 1MB
- Duration is within 20% of the storyboard estimate
- `ffprobe` confirms video + audio streams

---

### Phase 5: YouTube Upload (Not Yet Automated)

Currently manual — upload via YouTube Studio:
1. Upload `public/videos/{episode_id}.mp4`
2. Copy metadata from storyboard's `youtube_metadata` section
3. Set thumbnail (generate from art + title)
4. Add to playlist

**Future automation:** `scripts/upload-youtube.mjs` using `googleapis` npm package. Requires OAuth2 one-time setup.

---

### Phase 6: Analytics

After publishing, create analytics JSON:
```bash
mkdir -p content/publishing/analytics
cp content/publishing/analytics/analytics-template.json content/publishing/analytics/{episode_id}-analytics.json
# Edit: fill in youtube_video_id
```

**Pull retention data (future):**
```bash
node scripts/sync-youtube-analytics.mjs {episode_id}
# → fetches YouTube Analytics API retention data
# → maps elapsedVideoTimeRatio * duration → storyboard segments
# → computes per-segment retention, dropoff, rewatch signals
# → updates analytics JSON with insights
```

---

## Quick Start — Full Pipeline (Still Mode, No Manim)

```bash
# 1. Generate storyboard
node scripts/generate-storyboard.mjs --ro ro:nanavira-clearing-path \
  --title "Ñāṇavīra's Fundamental Structure" \
  --series "The Tetrahedron"

# 2. Review the storyboard
cat content/publishing/storyboards/nanavira-fundamental-structure.json

# 3. Generate voiceover
node scripts/generate-voiceover.mjs nanavira-fundamental-structure

# 4. Assemble video (still mode — uses art images)
node scripts/assemble-video.mjs nanavira-fundamental-structure --mode still

# 5. Watch
ffplay public/videos/nanavira-fundamental-structure.mp4
```

## With Manim (Better Visuals)

```bash
# After step 3 above:
# 4a. Render Manim scenes (edit content/publishing/manim/distillery_style.py first)
cd content/publishing/manim
manim -pql distillery_style.py K4Build
manim -pql distillery_style.py NanaviraQuote
cd /root/projects/blog

# 4b. Assemble with Manim scenes
node scripts/assemble-video.mjs nanavira-fundamental-structure --mode manim
```

## When to Use Your Own Voice

The edge-tts voiceover is a quick way to get a draft. For final videos:
1. Generate storyboard + voiceover (as draft)
2. Listen to the TTS narration
3. Record your own voice using the same narration text
4. Replace `content/publishing/voiceover/{episode_id}/seg-*.mp3` with your recordings
5. Re-run assembly (it caches clips, so only re-muxes)

## Performance Constraints
- 4GB RAM, 2 cores — No parallel processing
- Manim renders are CPU-heavy — render one scene at a time, `-ql` for preview, `-qh` for final
- edge-tts is fast (network-bound, not CPU-bound)
- FFmpeg assembly is fast (~30s for a 15-min video)
- Full pipeline time: ~5 min (still mode), ~30 min (Manim mode, 6 scenes)

## Files Created

| File | Location |
|------|----------|
| Storyboard JSON | `content/publishing/storyboards/{id}.json` |
| Voiceover MP3s | `content/publishing/voiceover/{id}/` |
| Timing manifest | `content/publishing/voiceover/{id}/timing.json` |
| Manim scenes | `content/publishing/manim/{scene}.py` |
| Rendering workspace | `content/publishing/renders/{id}/` |
| Final video | `public/videos/{id}.mp4` |
| Analytics | `content/publishing/analytics/{id}-analytics.json` |
