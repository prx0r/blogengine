# Platinum Master Response — Benchmark Analysis & Solutions

## The Core Verdict

> "The controller is doing its job. The unit of creative work is wrong."

A 35-100 shot storyboard should not be generated in one call. The gold packs were designed as a hierarchy: film thesis → chapter argument → local shot sequence → cross-chapter continuity → render.

---

## 1. Storyboard: Chapter Batches, Not Monolithic

Visual Director → deterministic beat compiler → Chapter Contracts → parallel Shot Designers → compile → continuity critic → Zeus

**Key change:** Give each chapter agent 8-12 timed beats, not "8-12 shots." One beat may become one 7s shot, two 4s shots, or one 10s multiphase shot.

### Chapter Contract
```json
{
  "chapter_id": "ch02",
  "audio_start": 48.2,
  "audio_end": 103.6,
  "target_shots": 8,
  "minimum_shots": 6,
  "maximum_shots": 12,
  "continuity_in": {"object": "gold_seam", "state": "fractured but unbroken"},
  "continuity_out_required": {"object": "interior_flame", "state": "visible through every facet"},
  "chapter_transformation": {
    "before": "external perspectives appear incompatible",
    "operation": "reveal common interior source",
    "after": "difference becomes articulation of one act"
  }
}
```

### How continuity works in strong packs
Not by asking each shot what to recur. Through a small set of visual systems tracked at system level, not shot level. The `continuity_object` field is the local carrier; the real continuity lives in the global ledger.

---

## 2. Prompt Size: Compact Context Capsules

Each Shot Designer receives only:
1. Chapter narration only
2. Timed beats for this chapter
3. One-page Visual Bible Lite
4. Relevant recurring systems only
5. Continuity-in/out contracts
6. Shortened shot schema
7. 2-4 applicable production rules

**Never send:** complete gold study, all candidate worlds, the entire essay, unrelated systems, long process manuals, full gold pack examples.

### Visual Bible Lite
```json
{
  "style_id": "diamond-flame-v2",
  "field": "warm white",
  "materials": ["clear crystal", "black line", "interior amber flame"],
  "color_semantics": {"black": "structure", "crimson": "differentiated perspective", "gold": "continuity"},
  "motion_verbs": ["facet", "refract", "split", "align", "inhabit", "coincide"],
  "recurring_systems": [{"id": "gold_seam", "meaning": "identity through division"}, {"id": "interior_flame", "meaning": "self-luminous act"}],
  "forbidden": ["New Age crystal", "meditating silhouette", "floating sacred geometry", "generic aura"]
}
```

### Response format: JSONL
```
{"shot_id":"ch02_s01", ...}
{"shot_id":"ch02_s02", ...}
```
Not a single giant JSON array. If the call dies after shot 8, you keep 8 valid records instead of 0.

---

## 3. Infrastructure: Direct API Is Fine for Automated Runs

MCP doesn't fix context overflow, output limits, or bad segmentation. MCP is for interactive operators, external agents, manual debugging, studio tools.

**Ideal split:**
- Automated Workflow → direct API calls through AI Gateway → durable state
- MCP → operator interface: inspect job, retry chapter, replace asset, approve shot

Rename `call_hermes_for_stage()` to `run_stage_model()`. "Hermes" is a role and process contract, not a CLI executable.

---

## 4. Medium Selection: Two-Pass

**Pass A (after beat compilation):** Classify each beat's evidence role → medium candidates
**Pass B (during shot design):** Chapter designer sees retrieved assets and decides

Start with deterministic rules:
- historical_context / primary_source → historical or historical_plus_pil
- causal_process / technical_diagram → pil or ai_plus_pil
- symbolic_interpretation / visionary_atmosphere → ai_image or ai_plus_pil
- conceptual_synthesis → pil or hybrid

---

## 5. Retry Strategy: Never Repeat Unchanged

| Failure | 1st Repair | 2nd Repair | Final |
|---------|-----------|-----------|-------|
| Timeout | Reduce batch | Switch model | Operator |
| Empty | JSONL + halve scope | Alternate provider | Operator |
| Parse error | Formatting repair only | Local JSON fix | Operator |
| Semantic | Return failed items only | Critic redesign | Operator |
| Provider 5xx | Exponential delay | Fallback provider | Pause |
| Context | Summarize context | Split batch | Hard fail |

**Never three identical retries.** 46% waste solved by changing something on each attempt.

---

## 6. Continuity: Ledger + Boundary Reconciliation

- Global ledger tracks visual system states per chapter
- Chapter contracts assign required boundary states
- Shot fields record local handoffs
- Deterministic checks catch mismatches
- Zeus handles artistic coherence

For adjacent chapter mismatches: run a small boundary repair call with the final 2 shots of chapter A + first 2 of chapter B + continuity contract. Don't rerun both chapters.

---

## 7. Restructured Stages

Keep 13 stage names. Change which invoke models:

| Stage | Model? | Notes |
|-------|--------|-------|
| PACK_SETUP | No | Deterministic |
| GOLD_STUDY | Optional | Cached or occasional |
| RHETORICAL_MAP | 1 call | |
| NARRATION_LOCK | No | TTS + timing |
| BEAT_COMPILATION | Small correction | Mostly deterministic |
| VISUAL_WORLDS | 2 calls | Proposals then development |
| MOTIF_LINT | Mostly no | Deterministic + targeted repairs |
| MEDIUM_PROPOSAL | No | Deterministic rules |
| ASSET_RETRIEVAL | No | Vectorize/D1 query |
| SHOT_DESIGN | Parallel chapter calls | The fan-out |
| STORYBOARD_REVIEW | 1 call | Zeus global review |
| RENDER_PLAN | Per-medium | |
| DRAFT_RENDER | No | Deterministic |
| VISUAL_QC | Vision model + metrics | |
| REPAIR | Failed shots only | Local scope |

---

## 8. Storyboard Fan-Out Algorithm

```python
def design_storyboard(job):
    beats = load_beats(job)
    contracts = load_chapter_contracts(job)
    bible = load_visual_bible_lite(job)
    
    tasks = [{
        "contract": c, 
        "beats": [b for b in beats if b.chapter == c.id],
        "bible": bible,
        "continuity_version": job.continuity_version
    } for c in contracts]
    
    results = parallel_map(design_chapter, tasks, max_concurrency=4)
    compiled = compile_chapters(results)
    errors = validate_boundaries(compiled)
    if errors: compiled = repair_boundaries(compiled, errors)
    return compiled
```

---

## 9. Benchmark B1: What to Test Next

Reuse successful artifacts from benchmark A (gold_signatures, rhetorical_map, visual_program). Only test through storyboard compilation.

**Fixed inputs:** gold_signatures.json, rhetorical_map.json, visual_thesis.md, visual_program.json
**Test pipeline:** compile timing → split chapters → contracts → 3-5 chapter calls → compile JSONL → validate continuity → report

**Success criteria:**
- Zero empty responses
- All narration covered exactly once
- Average shot 5-9s
- No chapter >12 shots
- All boundaries valid or locally repaired
- <15% invalid shot records
- Wall time under 4 min with parallel calls
