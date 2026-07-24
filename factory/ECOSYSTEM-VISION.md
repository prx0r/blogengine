# Full Agent Ecosystem Vision

## What We Have Now

### The Controller (Core Orchestrator)
`factory/platinum_controller.py` — 13-stage state machine with hard validation gates. Runs locally, calls LLM directly via API (no more `hermes -z` subprocess). Stores state in `.jobs/*.json` files. Validates timing, motif manufacturability, visual_audio_alignment, continuity.

### The Canonical Pack Format
`factory/pack-template/` — Merged film + animation pack format. Every pack has: storyboard.json (with visual_audio_alignment), visual_program.json (thesis, palette, systems), AGENT_KNOWLEDGE_DOSSIER.md (design brief), STYLE_EVOLUTION.md (inheritance), PRODUCTION_BLUEPRINT.md (production spec), render_pack.py (PIL code).

### The Gold Registry
`factory/gold-pack-registry.json` — 31 gold packs indexed. 61 total packs deduplicated. Used by the controller's validators as quality benchmarks.

### The Skills
- `platinum-designer` — PASS 1: planning/storyboarding. Three competing worlds, visual_audio_alignment, motif manufacturability.
- `platinum-renderer` — PASS 2: Zeus review + render. Adversarial critique, changelog, code generation.

### The Validators
- Timing gate (avg 5-8s, max 20s, shot count from audio duration)
- Motif manufacturability (≥12/16 score)
- visual_audio_alignment (≥50 chars)
- Storyboard field completeness
- Evidence role assignment

---

## What the Cloudflare Spec Adds

### Durable Execution (Workflow)
Current problem: if the Python process dies, job state is lost. Workflow steps are persisted — completed steps are never repeated after restart. Unlimited wall time per step.

### Real-Time Feedback (Durable Object + WebSocket)
Current problem: you're blind during stages. The DO streams progress, tool calls, and outputs to the dashboard in real time.

### Parallelism (Queues)
Current problem: one essay at a time, sequential stages. Queues enable: 10 essays simultaneously, chapter fan-out (chapter 1 designs while chapter 2 retrieves assets), shot batches, parallel TTS (50 files in seconds), parallel QC.

### Asset Intelligence (Vectorize + D1 + R2)
Current problem: no searchable art library. Vectorize over 1000+ historical images enables: "find me a 12th-century yogic manuscript with moon symbolism" in 200ms. Every asset gets captioned, tagged, embedded on upload.

### Medium Selection (Trifecta)
Current problem: PIL-only. The trifecta (historical + PIL + AI image) chooses medium by evidence role: historical for authenticity, PIL for process, AI for visionary. Hybrid shots combine all three.

### Self-Improving Rules
Current problem: every lesson learned is lost. The production_rules table in D1 tracks: observation → candidate → heuristic → approved. Rules only promote after repeated successful repairs.

---

## The Full Agent Ecosystem

```
                    ┌──────────────────────────────────┐
                    │        WORKFLOW PER ESSAY        │
                    │  Owns stage sequence per job     │
                    │  Durable, retryable, observable  │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │     JOB DURABLE OBJECT           │
                    │  Live state, WebSocket stream    │
                    │  Human approval gates            │
                    │  Shot-level repair coordination  │
                    └──────────────┬───────────────────┘
                                   │
       ┌───────────────────────────┼─────────────────────────────┐
       ▼                           ▼                             ▼
┌─────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  DESIGNER LANE  │     │   RENDER LANE     │     │    QC LANE      │
│                 │     │                   │     │                 │
│ 1. Visual       │     │ 1. TTS (parallel) │     │ 1. Silent-film  │
│    Director     │     │ 2. PIL render     │     │    vision QC    │
│                 │     │    (Container/VPS)│     │ 2. Repetition   │
│ 2. Chapter Shot │     │ 3. AI image gen   │     │    QC           │
│    Designer ×N  │     │    (Workers AI)   │     │ 3. Provenance   │
│                 │     │ 4. FableCut       │     │    check        │
│ 3. Asset        │     │    slideshow      │     │ 4. Style drift  │
│    Curator      │     │ 5. ffmpeg assembly│     │    detection    │
│                 │     │                   │     │                 │
│ 4. Zeus Critic  │     │ 6. Pack packaging │     │ 5. Local repair │
└─────────────────┘     └───────────────────┘     └──────────────────┘
                               │                           │
                               └───────────┬───────────────┘
                                           ▼
              ┌────────────────────────────────────────────┐
              │           DATA & INFRASTRUCTURE            │
              │                                            │
              │  D1: jobs, shots, assets, rules, scores   │
              │  R2: source art, generated images, packs  │
              │  Vectorize: semantic asset search          │
              │  AI Gateway: model control + logging       │
              │  Queues: fan-out across all lanes          │
              └────────────────────────────────────────────┘
```

## Agent Roles

### Studio Producer (Workflow + DO)
Not an LLM — deterministic. Owns stage transitions, retries, approvals, shot-level repair coordination. Ensures one essay doesn't block another.

### Visual Director (LLM Agent)
Receives: essay, gold signatures, repository summary, studio heuristics. Produces: three visual worlds, selected thesis, recurring systems, palette, forbidden clichés, medium strategy. One call per essay.

### Chapter Shot Designer (LLM Agent × N chapters)
Receives: 8-12 audio-timed beats, visual thesis, previous batch handoff, continuity ledger. Produces: concrete shot plans, medium choice, visual_audio_alignment, animation phases. Multiple instances in parallel.

### Asset Curator (Vectorize + D1 + LLM)
Receives: shot medium requirements, evidence role. Queries Vectorize for candidates, presents top 3-5 to designer, records selection. No LLM call for simple queries; LLM only for ambiguous matches.

### Zeus Critic (LLM Agent)
Receives: complete storyboard proof packet (not raw JSON), similarity findings, highest-risk shots. Produces: approval or repair manifest with specific constraints. One call per storyboard.

### Silent Film Critic (Workers AI Vision)
Receives: motion strips, contact sheets. Answers: what was initially true, what changed, what caused the change, what became true. Automated vision call, no LLM.

### Render Executor (Container/VPS)
Not an LLM — deterministic. Downloads render plan from R2, runs scene functions, assembles clips, uploads outputs. Pure compute.

### Repair Agent (LLM Agent)
Receives: failed shot IDs, failure codes, repair constraints. Rerenders only failed shots. Local scope prevents good work from being lost.

---

## How It Improves the Current System

| Current Problem | How Ecosystem Fixes It |
|---|---|
| One essay at a time, sequential | 10 essays in parallel, chapter fan-out per essay |
| Hermes does all creative work in one call | Specialized agents: Visual Director → Chapter Designers → Zeus |
| No asset library, manual image search | Vectorize + D1: 200ms semantic search over 1000+ tagged images |
| PIL-only, all visuals procedural | Trifecta: historical (authenticity) + PIL (process) + AI (visionary) |
| Blind during stages — you wait minutes | WebSocket streaming to dashboard in real-time |
| Lessons lost per session | Self-improving rules table: observation → heuristic → permanent |
| Job state lost on crash | Durable Workflow: completed steps never repeated |
| Long TTS bottleneck (50 files sequential) | Queue-based fan-out: 50 files in seconds |
| No QC automation | Silent-film vision QC, repetition detection, motion strip analysis |
| All on one VPS | Distributed: Cloudflare control plane + VPS/Container render |

## Migration Phases

### Phase 1 (Current — Done)
Controller, validators, pack format, gold registry, direct API calls. ✅

### Phase 2 (Next — Needs CF Token)
Deploy Worker to Cloudflare, migrate job state to D1, add Queue config, connect dashboard WebSocket.

### Phase 3 (After CF Deploy)
Add Vectorize asset indexing, connect Workers AI for TTS/image gen, implement medium selection.

### Phase 4 (Production)
Container-based rendering, self-improving rules, parallel chapter design, automated QC.
