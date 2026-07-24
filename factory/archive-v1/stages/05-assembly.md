# Stage 5: FableCut Assembly

**Scripts:**
- `05-blueprint-to-fablecut.py` — TBP blueprint → FableCut project
- `05-build-from-blueprint.py` — Full pipeline orchestrator
- `05-match-art.py` — Storyboard + art library → FableCut project

## Purpose

Assemble rendered scenes, voiceover, and art into a FableCut project file. This is the final assembly stage before export.

## Path A: Blueprint-driven

If you have a TBP-NNN blueprint in `tantrafiles/blueprints/`:

```bash
cd /root/projects/blog/factory

# Full pipeline (download + voiceover + FableCut)
python3 05-build-from-blueprint.py TBP-NNN

# Skip voiceover if already generated
python3 05-build-from-blueprint.py TBP-NNN --skip-voiceover
```

This:
1. Parses the blueprint markdown (metadata, beats, assets, claims)
2. Downloads art assets via Tor proxy (bypasses Hetzner IP blocks)
3. Generates voiceover via edge-tts
4. Builds a FableCut `project.json` with timeline, clips, media
5. Stores in `content/publishing/scripts/{slug}/`

## Path B: Storyboard-driven

From an essay-processed storyboard:

```bash
cd /root/projects/blog/factory

# Match art and build FableCut project
python3 05-match-art.py --storyboard <name> --beat-plan <name> --project

# With specific template
python3 05-match-art.py --storyboard <name> --beat-plan <name> --project --template biography
```

This:
1. Matches art to beats using proper noun extraction (25x weight for exact matches)
2. Applies 4 alternating Ken Burns styles (zoom_in, zoom_in_left, zoom_out, drift_diagonal)
3. Generates `project.json` with all clips, transitions, and media references
4. Adds quote cards for attributed quotations

## Art Matching Strategy

| Match Type | Weight | Example |
|------------|--------|---------|
| Exact proper noun in title/filename | 25× | "Abhinavagupta" matches "abhinavagupta_portrait.jpg" |
| Concept match in tags/labels | 3-5× | "consciousness" matches tagged art |
| Vision label overlap | 2× | Google Vision labels overlap with narration keywords |

## FableCut Editor

Access: `http://localhost:7777` (SSH tunnel) or `https://studio.tantrafiles.xyz`

Once the project.json is built, open FableCut to:
- Preview the timeline
- Adjust clip positions
- Add music tracks
- Export the final MP4

## Export Commands

```bash
# Via FableCut API (if available)
curl http://localhost:7777/api/export

# Manual FFmpeg (from rendered frames)
ffmpeg -framerate 30 -i renders/frame_%05d.png \
  -i voiceover/seg-01.mp3 \
  -c:v libx264 -c:a aac \
  -pix_fmt yuv420p output.mp4
```
