# Platinum Master — Full Autopsy

## The Verdict

> "You have built a functioning planning-and-task platform, but not yet a functioning film factory. That is not a failure. It means the infrastructure phase is basically over."

> "The remaining problem is overwhelmingly creative-production quality, not Cloudflare plumbing."

---

## What Is Actually Wrong

### 1. Storyboard Validator Lets Catastrophic Underproduction Pass

3 shots for a 789-word essay (315s audio) should never pass. Expected: 35-52 shots. Got: 3.

**Fix:** Hard minimum/maximum shot count derived from narration duration:
```javascript
minimum_shots = max(8, floor(audio_duration / 10))
recommended_shots = round(audio_duration / 7)
// For essay 33: minimum ≈ 31, recommended ≈ 45
```

The model must not determine shot count freely.

### 2. Visual Thesis Ignores Gold Material Vocabulary

"LED lights and fog machines" proves the visual-thesis stage operates in generic event-design vocabulary, not the factory's established material language. The gold-study principles are not constraining the next stage strongly enough.

**Fix:** Add Gold Material Grammar to visual-thesis input:
```json
{
  "preferred_materials": ["vellum", "ink", "lapis", "porphyry", "gold leaf", "smoke", "glass", "polished stone", "thread", "wax", "water"],
  "forbidden_material_language": ["LED", "projection mapping", "fog machine", "neon", "generic hologram", "generic cosmic energy", "meditating silhouette"]
}
```

Reject forbidden language deterministically — not another LLM opinion.

### 3. code_review Generates Too Much Infrastructure

The LLM generates ffmpeg setup, frame loops, output paths, video writers alongside scene logic. It produces single PNGs because it's overloaded.

**Fix:** Freeze a stable runtime (`pil-runtime-v1`). The LLM generates ONLY scene functions:
```python
def render_s001(ctx, t, u): ...
SCENES = [SceneSpec("s001", 6.2, render_s001)]
```

The runtime handles: frame iteration, PNG sequence, MP4 encoding, contact sheet, motion strips, manifest.

### 4. Worker Persistence Is Operational, Not Architectural

Manual worker churn leaves tasks claimed. Fix with one systemd service, heartbeat every 20-30s, stale-task reaper, graceful shutdown. Half a day max.

### 5. Testing Too Large Too Soon

A 789-word essay before validating generated animation quality introduces too many variables.

---

## The Next Benchmark: Factory-Native Gold Minute

**Input:** 120-160 words from essay 33
**Target:** 45-75 seconds, 8-12 shots, 1 recurring system, 1 clear philosophical transformation

**Human role:** Factory creates rhetorical map, visual thesis, storyboard, initial scene functions. Human improves visual thesis, shot count, weak motifs, scene code.

**Required output:** narration.wav, storyboard.json, render_pack.py, shot clips, draft.mp4, contact_sheet.jpg, motion_strips/, final.mp4, repair_log.json

## Correct Implementation Order

1. Install VPS worker as systemd service
2. Freeze pil-runtime-v1 (SceneSpec, RenderContext, Film, frame loop, ffmpeg, narration mux, contact sheets, motion strips, validation)
3. Split code generation and code review (generation → py_compile → static lint → representative frame render → visual review → targeted repair)
4. Add shot-count enforcement (minimum from duration, no chapter < 4 shots)
5. Add visual-language linting (reject LED, fog machine, generic glow, etc.)
6. Add real narration (one TTS file → measure duration → align storyboard → render → mux)
7. Generate contact sheets automatically (u=0.15, 0.40, 0.70, 0.92 per shot)

## The Most Important Strategic Change

> "Do not treat 'all stages passed' as success."

Distinguish four pass levels:
- **syntactic_pass:** JSON parses
- **structural_pass:** shot count, duration, coverage meet thresholds
- **production_pass:** renders, audio, contact sheets exist
- **artistic_pass:** human-judged quality

A JSON response existing is not a production pass.

## What to Pause

Skia, Blender, parallel queues, medium selection, automated Shorts, YouTube analytics, more MCP features, more Cloudflare abstractions.

## What to Start

One beautiful 60-second film, even if half the scene code is manually corrected. That film will be more valuable than the previous sixteen hours of infrastructure because it will reveal exactly what must be automated next.
