# Cloudflare Video Factory Architecture

> External advice on parallel agent factory using Cloudflare Workers, Workflows, Durable Objects, Queues, and Containers.

---

## Recommended Architecture

```
                    ┌──────────────────────────────┐
                    │  WORKFLOW INSTANCE PER JOB   │
                    │  Durable stage progression  │
                    │  Retries / sleeps / rollback│
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ JOB DURABLE OBJECT           │
                    │ Live state + stage lock      │
                    │ WebSocket status updates     │
                    │ Approval/retry coordination  │
                    └──────────────┬───────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
 ┌────────────────┐      ┌──────────────────┐      ┌─────────────────┐
 │ DESIGN QUEUE   │      │ RENDER QUEUE     │      │ QC QUEUE        │
 │ Designer agent │      │ Container / VPS  │      │ Workers AI      │
 │ Critics        │      │ Pillow + ffmpeg  │      │ Vision critics  │
 └───────┬────────┘      └────────┬─────────┘      └────────┬────────┘
         │                        │                         │
         └────────────────────────┼─────────────────────────┘
                                  ▼
              ┌────────────────────────────────────┐
              │ D1: registry, scores, state index  │
              │ R2: packs, frames, audio, previews │
              │ Vectorize: reference retrieval     │
              └────────────────────────────────────┘
```

## Why Both Workflow and Durable Object?

### Workflow: authoritative lifecycle

One Workflow instance per essay job. Stages:

```
GOLD_STUDY → RHETORICAL_MAP → VISUAL_WORLDS → MOTIF_LINT → MEDIUM_SELECTION
→ STORYBOARD → ADVERSARIAL_REVIEW → RENDER_PLAN → DRAFT_RENDER
→ SILENT_QC → REPAIR → FINAL_RENDER
```

Workflow steps have unlimited wall time, record retries, wait on external I/O. ([Docs](https://developers.cloudflare.com/workflows/reference/limits/))

### Durable Object: live coordination

One object per job (`JobCoordinator(job_id)`). Handles:
- Exclusive stage-transition locks
- Live progress via WebSocket
- Human approval gates
- Deduplication of completion callbacks
- Current shot repair set
- Cancellation and pause

Store artifact bodies in R2. Keep only hashes, paths, status, scores in the DO. ([Docs](https://developers.cloudflare.com/durable-objects/platform/limits/))

## Renderer Worker vs Renderer Compute

A normal Worker should not perform full PIL + ffmpeg renders. Use:

1. Existing VPS renderer pool (simplest first target)
2. Cloudflare Containers (fractional CPU to 4-vCPU/12-GB instances) ([Docs](https://developers.cloudflare.com/containers/platform-details/limits/))

Render lane:
```
Render Queue consumer → claim render task → start/wake Container or VPS executor
→ executor downloads render plan/assets from R2 → Pillow renders frames
→ ffmpeg assembles clips → upload outputs to R2
→ callback to Job Durable Object → Workflow advances
```

## Ten Simultaneous Essays

Parallelism across jobs and shot batches, not inside one DO:

```
Job A → Designer
Job B → Storyboard critic
Job C → TTS fan-out
Job D → PIL render batch 1
Job E → PIL render batch 2
Job F → Silent-film QC
Job G → Local repairs
```

Separate queues with independent concurrency caps:

```toml
platinum-design      = 10 concurrent
platinum-critique    = 15 concurrent
platinum-tts         = 50 concurrent
platinum-image       = 10 concurrent
platinum-render      = 2 concurrent
platinum-vision-qc   = 30 concurrent
platinum-repair      = 5 concurrent
platinum-publish     = 5 concurrent
```

## How the White Storyboard Sheets Were Made

From *A Thing Is Not a Dot*: frames rendered per shot → mature frame captured at ~70-72% duration → resized and tiled into 4×4 representative board + full contact sheet.

4×4 board samples milestones (opening, chapter ends, major operations, final synthesis). Full sheet is for repetition QC.

## Style Decisions That Made It Work

1. **One immutable visual field** — every shot starts from same base frame with subtle border
2. **Semantic palette** — black=structure, crimson=distinction, gold=transformation, grey=latent, white=field
3. **Bespoke scene logic** — custom branch per concept, not generic motifs
4. **Mature frame capture at t=0.70-0.76** — contact sheets look like finished illustrations
5. **Thin geometry + large negative space** — one visual proposition per shot, broad margins, 1-4px strokes

## Storyboard Generation as Factory Gate

Add `CONTACT_SHEET_REVIEW` after every draft render:

```
DRAFT_RENDER → FRAME_EXTRACTION → CONTACT_SHEET_BUILD → CONTACT_SHEET_QC → SILENT_CLIP_QC
```

Four review artifacts: `storyboard_4x4.jpg`, `contact_sheet_all.jpg`, `chapter_contact_sheets/`, `motion_strips/`

Motion strips: four frames per shot at t=0.10, 0.38, 0.68, 0.94 — exposes lifeless animation.

## R2 Asset Layout

```
jobs/{job_id}/
├── source/essay.md
├── planning/{rhetorical_map,agentvision,visual_program,storyboard}.json
├── draft/{shots/,thumbnails/,motion_strips/,storyboard_4x4.jpg,contact_sheet_all.jpg,draft.mp4}
├── qc/{silent_qc,similarity_qc,zeus_changelog,repair_manifest}.json
└── final/{film.mp4,pack.zip,contact_sheet.jpg,metadata.json}
```

## Self-Improving Loop

Compile run feedback into transferable rules:

```json
{
  "rule_id": "visual-017",
  "trigger": "three consecutive centered radial scenes",
  "failure": "composition repetition",
  "correction": "force next shot into lateral, sectional, or distributed layout",
  "confidence": 0.88,
  "observed_in_jobs": 7,
  "successful_repairs": 6
}
```

Promotion path: 1 occurrence → job-local observation → 3 occurrences → candidate rule → 5 successes → production heuristic → human approval → permanent gold principle.

## Migration Order

**Phase 1:** Workflow + DO + Queues → existing Hermes endpoints → VPS renderer → R2 storage → Workers AI vision QC

**Phase 2:** Fan-out TTS, embeddings, image gen, storyboard QC, similarity analysis into Worker/Queue consumers

**Phase 3:** Package renderer into Cloudflare Container, replace VPS behind same callback protocol

**Phase 4:** Automated local repairs — failed shot IDs loop independently through render → remux → QC cycle
