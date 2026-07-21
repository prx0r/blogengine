# Visual Engine — Distillery Video Production Playbook

## Architecture

```
Script (.md) → Voiceover (.mp3 via edge-tts) → Beat Map (.md) → Per-Beat Scene Renders → FFmpeg Assembly → MP4 → R2
```

## Tech Stack Per Content Type

| Type | Tool | Why |
|---|---|---|
| Geometry (tetrahedra, grids, timelines) | Manim CE | Precise wireframe, labeled vertices, smooth 3D rotation |
| Text overlays (titles, quotes, equations) | FFmpeg drawtext | Instant render, any font, alpha keyframes |
| Particle systems (glow, noise fields) | FFmpeg `geq`+`noise` | No dependencies, fast, controllable density & color |
| Color transitions (phase shifts) | FFmpeg `colorchannelmixer`+`eq` | Per-channel keyframing, HSB-like transitions |
| Audio layering (ambient, drone) | FFmpeg `sine` filter or Tone.js → WAV | Simple sine drones at precise frequencies |
| Image assets (art, emblems) | FFmpeg `zoompan` on static PNGs | Slow parallax zoom, always moving, never static |

## Color Pipeline

```
BG:  #0D1117 (void black)   — canvas
PRI: #D4A574 (alchemical gold) — geometry, primary labels
SEC: #A855F7 (purple)       — resonance, probability fields, secondary structure  
TXT: #E6E1DC (soft white)   — all body text, subtitles
ACC: #14B8A6 (turquoise, 40%) — edge highlights, tiny accents, glints
LIFE:#166534 (dark green)   — coherence, life, preservation states
ERR: #FF4444 (red)          — error, flatline, blocked edges
```

All colors expressed as hex in FFmpeg filters, as Manim constants in Python.

## Per-Video Beat Pipeline

For each video:
1. Parse beat-map.md → extract beat timings + visual descriptions
2. Generate Manim scene per geometric beat (or reuse cached renders)
3. Generate FFmpeg clip per text/particle beat  
4. Concat all clips with `xfade` transitions (0.5s crossfade)
5. Mux with voiceover narration
6. Upload to R2

## Caching Strategy

- Manim renders cached by scene class + parameters hash → `/tmp/manim_cache/{hash}.mp4`
- FFmpeg clips cached by filtergraph hash → `/tmp/ffmpeg_cache/{hash}.mp4`
- Voiceovers cached by script text SHA1 (already done via edge-tts)
- Assembly cached by manifest hash → only rebuild on input change

## Scene Inventory (Reusable)

| Scene | Tool | Duration | Used By |
|---|---|---|---|
| TetrahedronBuild | Manim | 18s | 01, 02, 10 |
| TriangleToTetrahedron | Manim | 14s | 01 |
| TimelineFour | Manim | 20s | 01, 10 |
| PhonemeGrid5x10 | Manim | 18s | 05 |
| NestedTetrahedra | Manim | 20s | 04 |
| RotatingTetrahedron | Manim | 25s | 03, 06, 07 |
| VoidTextCard | FFmpeg | variable | all |
| ParticleField | FFmpeg noise+geq | variable | 03, 05, 07, 08 |
| ColorPhaseShift | FFmpeg colorchannelmixer | variable | 08, 09 |
| BodyOutline | FFmpeg drawbox | variable | 08 |
| MonitorFlatline | FFmpeg drawtext | variable | 08 |
| CakraSpectrum | FFmpeg gradients | variable | 09 |

## Quality Checklist Per Video

- [ ] Beat map parsed correctly — all beats have non-zero duration
- [ ] Visual at each beat matches the beat-map description (not stock looping background)
- [ ] Text overlays appear/disappear at correct beat boundaries
- [ ] Transitions between beats are smooth (0.5s crossfade)
- [ ] Voiceover is audible and synced (narration at -10dB)
- [ ] Intro card: title + series name, fade in 1s, hold 3s
- [ ] Outro card: title + channel name, fade out 2s
- [ ] Color palette consistent across all beats
- [ ] No visual that doesn't serve the narration (NO decoration)
- [ ] File uploaded to R2, URL verified accessible
