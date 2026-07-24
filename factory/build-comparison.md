# Build Comparison: Hermes Controller vs Cloudflare Visions Spec

## Current Build (Hermes Controller)

**What it is:** A Python CLI that calls `hermes -z` as subprocess for each stage. Job state stored as JSON files in `factory/.jobs/`. 13 stages with validation gates.

**Strengths:**
- Stage definitions and validators are complete and tested
- Prompt templates exist for all creative stages
- Canonical pack format is defined
- Gold pack registry is built
- Run successfully through 7 stages on essay 33
- Catches real quality failures (motif manufacturability gate works)
- Timing gate now enforces gold-standard pacing

**Weaknesses:**
- Sequential — one Hermes call at a time, 1-4 min per stage
- No parallelism — can't design chapter 2 while chapter 1 renders
- No real-time feedback — `-z` oneshot mode is silent until complete
- No asset intelligence — no searchable art repository
- No medium selection — PIL-only, no historical/AI hybrid support
- Fragile — depends on Hermes following the prompt exactly
- Single point of failure — if the Python process dies, job state is lost

## Cloudflare Visions Spec

**What it is:** A production architecture using Workflows, Durable Objects, Queues, Agents, D1, R2, Vectorize, and AI Gateway.

**Strengths:**
- Durable execution — Workflow retries without state loss
- Parallelism — 10 essays simultaneously, chapter fan-out, shot batches
- Real-time feedback — WebSockets to dashboard
- Asset intelligence — Vectorize search over 1000+ historical images
- Medium selection — historical, PIL, AI image, hybrids per shot
- Scalability — Queues with independent concurrency caps
- Typed schema validation — ThinkWorkflow enforces output format
- No fragile subprocess calls — native cloud execution

**Weaknesses:**
- Doesn't exist yet — pure spec
- Would need to port all stage logic from Python to TypeScript
- Cloudflare Workers have CPU limits (not suitable for PIL rendering)
- Requires learning Agents SDK, Workflows API, Queue config
- Over-engineered for the current problem (we can't even get 14-shot timing right)

## The Key Insight

**They are not competing approaches.** The Hermes controller is a prototype of the orchestration logic. The Cloudflare spec is the production architecture to run that logic on.

The Hermes controller already has:
- Stage definitions → become Workflow steps
- Validators → become ThinkWorkflow schema validation
- Prompt templates → become Agent prompts
- Canonical pack format → becomes R2 asset layout
- Gold pack registry → becomes D1 + Vectorize indices

What the spec adds that the controller can't do:
- Durable execution (controller loses state on crash)
- Parallelism (controller is strictly sequential)
- Asset retrieval (controller has no art library)
- Medium selection (controller is PIL-only)

## ## Quick Update: Direct API Call Implemented

The controller now uses `call_llm_direct()` instead of `hermes -z`:
- Calls deepseek-v4-flash via curl → opencode API
- No Hermes agent overhead (tool parsing, npm checks, file ops)
- Response time dropped from 1-4 min to ~10-30s per stage
- Output verified: same quality, same validators, just faster

The Cloudflare Worker at `factory/workers/controller.py` mirrors this logic for deployment. Job state in D1, calls via AI Gateway.

---

Recommended Hybrid

**Phase 1 — Keep controller logic, add Cloudflare orchestration:**

The controller's `Stage` enum and validators don't need to change. Instead of calling `hermes -z` as a subprocess, each stage becomes a Workflow step. The prompts go through AI Gateway instead of the local Hermes CLI. Job state lives in D1 instead of `.jobs/*.json`.

```text
Current:   python3 controller.py advance --slug X
           → calls hermes -z (subprocess, silent, sequential)
           → validates output in Python
           → writes .jobs/X.json

Hybrid:    Workflow step
           → calls AI Gateway (API, parallelizable, monitored)
           → validates output via ThinkWorkflow schema
           → writes D1 record + R2 artifact
```

**Phase 2 — Add medium selection to the storyboard:**

The `trifectavision.md` evidence roles slot directly into the existing storyboard template:

```json
{
  "shot_id": "s004",
  "primary_medium": "historical",
  "secondary_medium": "pil_annotation",
  "evidence_role": "primary_source_image",
  "asset_query": ["manuscript", "medieval", "alchemical"]
}
```

No new controller stages needed — just a new field in the storyboard template and a validator that checks the medium matches the evidence role.

**Phase 3 — Parallel chapter design:**

The controller currently does one storyboard call for all shots. Split into chapter batches as the Visions spec recommends. The controller still owns the sequence, but the "storyboard" stage becomes "storyboard_per_chapter" × N chapters.

## What To Actually Do

1. **Don't rewrite everything.** The controller works. It caught motif failures, timing failures, and missing fields. That's the hard part.

2. **Port the job state to D1.** Replace `.jobs/*.json` with a D1 database. This is the highest-leverage Cloudflare integration — it makes job state durable and queryable without changing any stage logic.

3. **Add the `evidence_role` and `primary_medium` fields to the storyboard template.** This enables the trifecta vision without new infrastructure.

4. **Do Cloudflare Workflows last.** Wait until the creative pipeline is producing gold-quality outputs consistently on the current system. Then parallelize.

## Verdict

The controller is the right **logic layer**. The Cloudflare spec is the right **infrastructure layer**.

Keep the controller's validators, stages, and prompts. Port the execution to Cloudflare Workflows + Queues for parallelism and durability. Add medium selection and asset retrieval on top of the existing stage sequence.

The minimum viable Cloudflare integration is replacing `.jobs/*.json` with D1 and `hermes -z` with AI Gateway calls — and that can be done in an afternoon without changing any creative logic.
