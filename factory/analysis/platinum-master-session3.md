# Platinum Master — Session 3: From Planning Pipeline to Production Pipeline

## The Core Diagnosis

> "The report calls the pipeline 'fully operational,' but three production stages are placeholders. The current system can complete a job record without producing or inspecting a real film."

The planning pipeline is validated. The production pipeline is not.

## Correct Priority Order

### 1. Add Validation Before Real Rendering

Port only the hard gates needed to protect execution, not the entire Python controller:

**Storyboard gate:** valid JSON, unique shot IDs, every narration covered, positive durations, total duration ≈ audio, average/max shot duration, alignment fields, ≥2 drawable parts, valid animation phase ranges, continuity references point to real shots/systems.

**Motif gate:** every selected motif has score ≥12/16. Failed motifs block only dependent chapters, not the whole job.

**Render-plan gate:** every shot has one render spec, unique function names, renderer is pil-custom-v1, required assets exist, no unsupported operations, expected output declared.

Keep validation rules in a shared config file:

```json
{
  "storyboard": {
    "alignment_min_chars": 50,
    "drawable_parts_min": 2,
    "ordinary_shot_max_seconds": 15,
    "absolute_shot_max_seconds": 20,
    "average_duration_max": 11
  }
}
```

### 2. Connect VPS as Real PIL Executor

Not Cloudflare Containers yet. The VPS already has Python, Pillow, ffmpeg, Edge TTS, fonts, working rendering code.

**Simplest reliable v1:**
```
Worker creates render task in D1
→ Worker writes input manifest to R2
→ VPS polls GET /render-tasks/claim
→ VPS claims one task atomically
→ downloads artifacts
→ runs Python renderer
→ uploads results to R2
→ POSTs completion callback
→ Worker validates output manifest
→ stage advances
```

### 3. Separate Code Generation from Code Review

Three distinct operations: RENDER_SPEC → CODE_GENERATION → STATIC_CODE_REVIEW → EXECUTION

Code generation: LLM produces render_pack.py
Static review: syntax check, allowlisted imports, no network/shell, scene function count matches storyboard, no forbidden dispatch
Execution: VPS runs only code that passed static review

### 4. Generate Narration Before Locking Timing

Use: narration text → Edge TTS → measure exact audio duration → sentence timing → compile timed beats → final storyboard timing

Prefer one full narration track (not per-shot TTS which creates discontinuities). Map shot boundaries to timestamps.

### 5. Make Draft QC Real but Minimal

Start with deterministic artifacts and human review: draft.mp4, contact_sheet, motion strips, render report.

Technical checks: all clips exist, no zero-byte files, correct dimensions, expected duration, decodable MP4, no frozen frames, audio exists, AV drift within tolerance.

Structural: one thumbnail per shot, motion strip at 4 time points, adjacent-frame similarity, composition repetition, text ratio.

Human: simple approve/reject endpoints with failed shot IDs and notes.

### 6. Shot-Local Repair Before Parallel Chapter Design

Failed shot → repair manifest → regenerate only those scene functions → static review → rerender only those clips → remux draft → rerun local QC.

This saves far more time than chapter parallelism during early development.

## Where Chapter Fan-Out Belongs

Later. The creative pipeline completes in ~3 minutes at negligible cost. Parallelism is useful only when:
- Chapter outputs are individually valid
- Continuity contracts exist
- The renderer works
- Failed chapters can be retried locally
- Quality differences between parallel and sequential are measured

## Where Medium Selection Belongs

Also later. Add schema fields now without activating additional media:
```json
{
  "evidence_role": "conceptual_model",
  "medium_candidates": ["pil"],
  "medium_locked": "pil",
  "renderer": "pil-custom-v1"
}
```

## The Next Benchmark: C (PIL Proof Film)

**Target:** 60-120 seconds, 10-18 shots, one continuity system, one full narration track, one genuine PIL renderer, real R2 outputs, one deliberately broken shot to test repair.

**Pass conditions:**
- Storyboard passes structural validation
- Every shot has render code
- VPS claims the task
- ≥90% shots render on first attempt
- Failed shot repaired locally
- Remux succeeds
- Contact sheet and motion strips exist
- Final video has audio
- Worker marks complete only after outputs verified
- Restart doesn't lose the task
- Repeated callback doesn't duplicate advancement

**Metrics:** planning time, code-generation time, render time, failed shots, repair time, final duration, AV drift, R2 bytes, total model cost, human visual score.

## Concrete Next 7 Tasks

1. Port minimum hard validators to Worker JavaScript
2. Add render_tasks and render_attempts tables
3. Build VPS claim/heartbeat/complete endpoints
4. Make VPS execute an existing validated render_pack.py
5. Generate actual narration and timing artifacts
6. Produce contact sheets and motion strips automatically
7. Test one-shot local repair and remux

## The Core Principle

> "Do not add another renderer until PIL has crossed the entire boundary from approved design to inspected final film."

The planning infrastructure is fast and cheap. Stop optimizing its speed. Make it encounter reality: filesystem errors, missing fonts, malformed code, timing drift, frozen shots, weak transitions, failed callbacks, and repair. That is where the next useful architectural knowledge will come from.
