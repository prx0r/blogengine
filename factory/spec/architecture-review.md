# Architecture Review — Full Analysis

> *"The architecture is already pointed in the right direction. The main shift now is from a file-producing state machine to an immutable, event-driven production graph."*

---

## Executive Verdict

Keep the 13-stage conceptual lifecycle. Change the underlying model to:

- Workflow owns lifecycle
- D1 owns searchable state and audit indexes
- R2 owns immutable artifact bodies
- Durable Object owns live locks and coordination
- Queues own asynchronous work
- Agents own bounded creative decisions
- Render adapters own media-specific production

Do **not** use one mutable "job context" document that every stage appends to. Use an immutable, versioned artifact graph with explicit stage input manifests.

---

## Immediate Issues Found

### 1. Python and TypeScript stage definitions can drift
The stage list is duplicated in `platinum_controller.py` (Python) and `controller.ts` (TypeScript). One will inevitably diverge.

**Fix:** Move lifecycle definition into one shared declarative JSON file, generate Python enum + TypeScript union from it.

### 2. TEMPLATE_DIR path is wrong in controller
`factory/controllers/pack-template/` doesn't exist — template is at `factory/template/`. The fallback means pack setup silently uses no template.

### 3. Skill path is wrong
`ROOT / "hermes/skills/..."` resolves to `factory/hermes/skills/...` instead of repo-root `hermes/skills/...`. System prompt silently falls back to empty.

### 4. Worker can't read local filesystem
The Worker tries `fs.readFileSync(essayPath)` which doesn't work in production. Essays must come from R2 or request body.

### 5. Worker is not yet a controller
Currently supports: health, list jobs, create job, get job. Does not advance stages, dispatch queues, or lock transitions. Version 0.2.0 — described as "factory API", not yet the distributed controller.

---

## 1. Data Flows and Stage Transitions

### What's Good
- Explicit per-stage inputs, outputs, retry limits, validators, stage history
- Storyboard validator catches: shot-count bounds, duration inflation, long shots, weak alignment, weak motifs

### Where State Leaks

**File existence ≠ artifact identity.** Controller checks if paths exist — doesn't know which attempt created the file, which inputs were used, if file changed after approval, if retry overwrote prior artifact.

**Artifacts are mutable shared files.** Stages can overwrite `storyboard.json` and later stages unknowingly consume the replacement.

**No explicit artifact lineage.** D1 has jobs + stage history, but no first-class artifact table.

### Correct Pattern: Immutable Artifact Graph

Every stage attempt produces immutable artifacts in R2:

```
jobs/{job_id}/artifacts/
  rhetorical_map/a01.json
  visual_thesis/a01.md
  storyboard/chapter-01/a02.json
  storyboard/compiled/a03.json
```

D1 records artifacts with sha256, version, stage_run_id, supersedes_artifact_id.

Every stage receives an explicit input manifest referencing exact artifact hashes.

### Do Not Use append-only job_context.json
Would become enormous, stale, contradictory, impossible to retry locally. Instead maintain a small mutable **job head**:

```json
{
  "current_stage": "storyboard_review",
  "active_artifacts": {"visual_program": "art_vp_a02", "storyboard": "art_sb_a03"},
  "continuity_ledger": "art_cl_a05",
  "revision": 37
}
```

---

## 2. Agent Handovers

Use typed **context capsules**, not "include all relevant prior files."

### Visual Director produces:
1. **Visual Bible** — material world, spatial world, palette, composition families, motion operators, medium policy, forbidden interpretations
2. **Continuity Ledger** — machine-readable system states, palette lock, unresolved handoffs
3. **Chapter Contracts** — per-chapter: starts_with, must_introduce, must_resolve, continuity_in/out, forbidden_compositions
4. **Beat Packets** — only 8-12 timed beats + neighboring context

### Shot Designers receive:
- One chapter contract + 8-12 beats + previous batch final state + next batch required entry
- NOT: the entire visual thesis, full essay, or other chapters

### Zeus receives (production proof packet):
- visual_bible.json, continuity_ledger.json, compiled_storyboard.json
- chapter_contact_previews/, shot_duration_histogram.json, composition_histogram.json
- motif_usage.json, medium_map.json, high_risk_shots.json, gold_similarity_report.json

### Zeus → Renderer: locked render contract
Not prose. Exact shot spec with acceptance tests.

---

## 3. Audit Trail & Self-Improvement

### Six Additional Tables Needed

1. **agent_runs** — model, provider, tokens, cost, latency, prompt template version
2. **stage_runs** — unique ID, lease, start/end, input manifest, validator version, retry parent
3. **shot_revisions** — never overwrite shot records; revision chain with change_reason
4. **shot_qc_results** — per-shot, per-metric, threshold, observed vs expected
5. **repairs** — failed revision → repaired revision, strategy, outcome
6. **human_interventions** — approval, override, chosen candidate, rejected candidate

### Production Rules Need Evidence
Current `production_rules` has `successful_repairs` counter. Add `production_rule_evidence` table with: failure_before, intervention, metric_before, metric_after, successful.

### High-Signal Metrics
- First-pass storyboard/render approval rate
- Repairs per shot
- QC failures by failure code
- Successful repair rate by strategy
- Visual-audio alignment score
- Silent transformation inference score
- Composition repetition score
- Text dependence
- Cost per accepted shot

---

## 4. Multi-Source Art Extensibility

Do not add `BLENDER_STAGE`, `HISTORICAL_STAGE`, `AI_IMAGE_STAGE` to the stage machine. That couples lifecycle to media technology.

Instead define generic stages: MEDIUM_PROPOSAL → ASSET_RESOLUTION → RENDER_PLAN → RENDER_EXECUTION → MEDIA_QC

Each shot declares a renderer adapter:

```json
{
  "medium": "blender",
  "adapter": "blender-render-v1",
  "spec_version": "blender-shot-v1"
}
```

### Renderer Adapter Interface
```typescript
interface RenderAdapter {
  medium: string;
  validateSpec(spec: unknown): ValidationResult;
  submit(task: RenderTask): Promise<RenderHandle>;
  normalizeOutput(result: unknown): Promise<NormalizedRenderOutput>;
}
```

Adapters: pil-custom, historical-ken-burns, ai-image, ai-image-plus-pil, fablecut, blender, manim, generated-video.

The stage machine remains unchanged when you add a medium.

### Medium Selection Gate Placement
Place before final shot design: VISUAL_THESIS → PROVISIONAL_BEATS → MEDIUM_PROPOSAL → ASSET_DISCOVERY → EXPRESSIVITY_CHECK → MEDIUM_LOCK → SHOT_DESIGN

---

## 5. Blender Integration

Treat as external async renderer. Pattern:
```
Workflow → enqueue render_task → Blender farm claims → downloads assets → renders → uploads to R2 → POST completion → DO validates → Workflow advances
```

### Render Task Schema
- task_id, idempotency_key, adapter, priority, input_manifest, render_spec, expected_outputs

### Blender-Specific QC
Missing textures, camera mismatch, frame count, alpha problems, lighting inconsistency, style deviation from visual bible, first/last-frame compatibility.

Final normalized output should look identical to PIL output contract — assembly doesn't care which renderer produced it.

---

## 6. Clean Data Per Run

Capture five categories:

1. **Inputs** — essay hash, narration version, gold-signature versions, production-rule versions
2. **Decisions** — three worlds, selected/rejected, medium candidates, rejected designs, Zeus changes, human overrides
3. **Execution** — model, latency, cost, render adapter, machine identity, retries, checksums
4. **Evaluation** — validator results, vision-QC, similarity metrics, motion scores, repair success
5. **Outcomes** — YouTube CTR, retention curve, chapter drop-off, gold promotion decisions

The factory should learn from: decision → execution → measured result.

---

## Recommended Next Implementation Slice

Before expanding number of agents:

1. Artifact + stage_run + agent_run tables
2. Immutable R2 artifact paths and hashes
3. Shared stage-definition JSON
4. Workflow instance per job
5. Job Durable Object with revision lock
6. Shot revision model
7. Generic render_tasks table and adapter field
8. Outbox/event table for reliable queue dispatch
