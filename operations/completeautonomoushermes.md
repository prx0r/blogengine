# Complete Autonomous Hermes — Vision

## Architecture

```
Hermes (cognitive controller — Telegram/MCP)
  │
  ├── Skills Layer (46 skills across core/factory)
  │   ├── produce-platinum-video (new — owns the video loop)
  │   ├── factory-pipeline (existing — source→RO→essay)
  │   ├── write (existing — 3-pass essay validation)
  │   └── 43 others
  │
  ├── Factory Worker API (Cloudflare)
  │   ├── D1: job state, shots, feedback, scenes, gold standards
  │   ├── R2: MP4s, voiceover, art, gold files
  │   ├── Queues: render job dispatch
  │   └── Workers AI: FLUX, LLaVA, BGE, Llama
  │
  ├── AI Search (managed RAG)
  │   ├── factory-scenes: scene catalog search
  │   ├── factory-feedback: feedback pattern analysis
  │   └── factory-golds: gold standard retrieval
  │
  ├── Validation Modules (prompt-based passes)
  │   ├── rubric-scorer: scores output vs GOLD benchmarks
  │   ├── subtitle-sync: checks narration aligns with shot timing
  │   ├── visual-narration: checks visuals match spoken content
  │   ├── continuity-check: verifies objects persist across shots
  │   └── palette-audit: ensures color discipline
  │
  └── Infrastructure
      ├── VPS: PIL render engine, Hermes gateway, FableCut
      ├── Cloudflare: Workers, D1, R2, Queues, AI, Vectorize
      └── vast.ai: GPU rendering (Blender, future)
```

## The Platinum Loop (Hermes-Owned)

```
1. PICK ESSAY
   Hermes reads factory queue → picks next draft
   → POST /api/factory/jobs { status: "draft" }

2. GENERATE STORYBOARD
   Runs visual-director.py → splits essay into rhetorical beats
   → Each beat = 5-10 shots × 6-10s = 50-100 shots total
   → Defines continuity objects, palette, visual modes

3. BUILD RENDER SCRIPT
   Maps each shot to existing scene functions from:
   - scripts/renderer/p*.py (67 functions, 9 packs)
   - visual-library/ (172 functions, 20 packs)
   - spanda_scenes.py (10 proven functions)
   - scene-system/catalog/scenes.json (198 indexed)
   → Writes new functions only where gaps exist

4. RENDER
   → PIL generates frames at 8fps
   → Edge TTS generates per-shot audio
   → FFmpeg assembles into MP4

5. VALIDATE (binary gates)
   → rubric-scorer: analysis-output.py (target 85+)
   → subtitle-sync: narration timing matches shot boundaries
   → visual-narration: each shot's mode matches spoken concept
   → continuity-check: objects persist across transitions
   → palette-audit: only defined colors are used
   ALL PASS or loop back to step 3 (max 3 iterations)

6. REGISTER
   → Upload to R2
   → Update factory job status = "review"
   → Store analysis report as gold standard reference
   → Post feedback to factory for next iteration learning
```

## Modules (Prompt-Based Validation Passes)

Each module is a structured prompt that Hermes runs. Not a script — a thinking pass.

### rubric-scorer
```
Analyze the output pack against these benchmarks:
- Shot count >= 80 (20 pts)
- Avg shot 5-10s (20 pts)
- Runtime 8-25min (20 pts)
- Visual modes >= 15 (15 pts)
- Palette defined (10 pts)
- Continuity entities >= 3 (10 pts)
- Operators >= 10 (10 pts)
- Chapters >= 8 (10 pts)

Score. Grade. List top 3 gaps.
```

### subtitle-sync
```
Read storyboard.json. Each shot has a start/end time.
Read narration_script.txt.
For each shot: does the spoken text fit within the shot's duration?
Flag shots where narration overflows or underfills.
Suggested fix: adjust shot duration or split the shot.
```

### visual-narration
```
Read storyboard.json. Each shot has a 'mode' and 'text'.
For each shot: does the visual mode match the concept being discussed?
Example: "world_geography" mode for text about "levels of reality" → OK
"threshold_triad" mode for text about "three worlds" → OK
"kancukas" mode for text about "time, space, desire" → OK
Flag mismatches. Suggest alternative modes from the library.
```

### continuity-check
```
Read storyboard.json. Track 'continuity_object' across shots.
Shot N's continuity_object should be preserved in shot N+1's transition_in.
Check: does each shot's transition_in reference the previous shot's continuity?
Flag breaks. Suggest continuity bridge.
```

### palette-audit
```
Read visual_program.json for palette.
Scan all scene functions for color tuples.
Flag any color not in the defined palette.
Suggested fix: replace with nearest palette color.
```

## File Organization

```
hermes/
├── goals/                          — Active production goals
│   └── produce-{slug}.md           — Per-video goal with criteria
├── skills/
│   ├── core/                       — Original pipeline skills
│   ├── factory/                    — Factory-optimized skills
│   │   ├── produce-platinum-video/ — THE skill (this loop)
│   │   ├── factory-pipeline/       — Source→RO→essay pipeline
│   │   ├── write/                  — Essay writing (3-pass)
│   │   ├── audio/                  — TTS generation
│   │   └── publish/                — Video publishing
│   └── ...
├── scripts/                        — Hermes helper scripts
└── docs/                           — Hermes documentation

factory/
├── HEADER.md                       — Pipeline stages, commands
├── REFERENCE.md                    — Full system reference
├── SYSTEM-SPEC.md                  — Cloudflare architecture
├── CLOUDFLARE-BUILD.md             — Deployment instructions
├── scripts/
│   ├── run-pipeline.sh             — Full pipeline executor
│   └── analyze-output.py           — Gold standard analysis
└── feedback/                       — Per-iteration feedback logs
```

## Decision Gates

| Condition | Action |
|-----------|--------|
| analysis >= 85 | ✅ GOLD — Publish, capture gold standard |
| analysis >= 65, iteration >= 3 | 🟡 SILVER — Escalate for human review |
| analysis < 85, iteration < 3 | 🔄 Loop — Fix top 3 gaps, re-render |
| iteration >= 3, still < 65 | 🔴 FAIL — Mark as needs-human, move on |

## Cloudflare Integration

Hermes can call the factory Worker API directly via curl. No Cloudflare MCP needed unless we want Hermes to:
- Directly query D1 for complex joins
- Manage R2 bucket policies
- Deploy new Worker versions
- Use Workers AI directly

For v1, the factory Worker API is sufficient. Add Cloudflare MCP only when Hermes needs capabilities the API doesn't expose.

## Cost

| Component | Monthly |
|-----------|---------|
| Hermes (VPS) | Existing |
| Factory Worker (Cloudflare) | $0 (free tier) |
| D1 | $0 (free tier) |
| R2 | ~$0.15 |
| Workers AI | $0 (free tier 10k neurons/day) |
| AI Search | $0 (beta) |
| **Total** | **~$0.15/mo** |
