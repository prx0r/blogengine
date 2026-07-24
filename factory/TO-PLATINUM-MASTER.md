# To the Platinum Master

You built the gold packs. You know what makes a visual actually enact a concept rather than just decorate it. This factory is our attempt to encode your process into a deterministic but flexible system. We need your eye on where we're getting it wrong.

---

## The System We've Built

```ascii
    CONTROLLER (13-stage state machine)
    → calls LLM for creative stages
    → validates outputs against hard gates
    → stores state in D1 (Cloudflare) or .jobs/ (local)

    MCP SERVER (11 tools)
    → any MCP-compatible LLM can drive the factory
    → factory_create_job, factory_advance, factory_call_llm, etc.

    WORKER API (deployed at platinum-factory.tradesprior.workers.dev)
    → CRUD for jobs in D1
    → 9 tables: jobs, stage_history, shots, assets, qc_results, etc.
```

## The Core Problem

The controller works but the LLM calls take too long (1-4 min per stage) because each call is doing too much. A single "storyboard" call tries to design 30-60 shots with full visual_audio_alignment. It runs out of steam by shot 20.

Also, the output files don't get saved properly — the LLM describes what it would write but the controller doesn't extract and save it.

## What We Need From You

### 1. The Prompt Architecture

You understand how to decompose the creative process into clean stages. We need your input on:

**a) How many stages is too many?**
We have 13. The architecture review said keep the granular states for auditability but collapse the LLM calls to 4-6. Which stages should be LLM calls vs deterministic?

Our guess:
- **LLM calls**: gold_study, visual_thesis, storyboard, storyboard_review, code_review
- **Deterministic**: pack_setup, motif_manufacturability (scoring is formulaic), render_plan, draft_render, visual_qc, final_render
- **Questionable**: rhetorical_map (could be LLM or could be a deterministic NLP pass), pack_composition (could combine with visual_thesis)

**b) The shot-count wall**
When we ask for 40+ shots in one call, quality degrades after ~20. You solved this in the gold packs by having 106 shots — were those designed in batches? How did you maintain consistency across batches?

Our proposed fix: chapter-batched shot design. Visual Director produces the thesis + chapter contracts. Then per-chapter Shot Designer calls (8-12 shots each). Zeus reviews the compiled result. Does this match your process?

**c) The system prompt**
We feed the platinum-designer SKILL.md as system prompt (~4000 chars). What should the system prompt actually contain? The full skill? Just the current stage instructions? Gold pack examples?

### 2. The visual_audio_alignment Field

This is the most important field in the storyboard. Every shot must explain WHY the visual enacts the transformation. Our current schema:

```json
{
  "visual_audio_alignment": {
    "transformation_asserted": "What transformation does this passage describe?",
    "what_viewer_sees": "Describe the literal frame.",
    "why_it_matches": "Explain why this visual enacts this transformation."
  },
  "no_narration_test": "PASS or FAIL"
}
```

**Does this field actually capture what you think about when designing a shot?** What would you add or change?

Your gold packs don't have this field — they have `visual_mechanism` which is just a description. Was the alignment implicit in your process? How did you ensure every shot passed the no-narration test?

### 3. When to Use Each Medium

| Medium | When |
|--------|------|
| PIL | Process, causality, transformation, hierarchy |
| Historical | Real person, manuscript, place, period, evidence |
| AI Image | Visionary scene, custom technical plate, missing imagery |
| Hybrid | Historical/AI base + PIL semantic animation |

**Does this breakdown match how you think about media?** When would you use PIL vs historical vs AI? What about Blender outputs — where do they fit?

Also: **transitions between media**. A historical manuscript dissolving into a PIL diagram is a meaningful transition (evidence → explanation). But haphazard switching breaks the film. How do you maintain visual coherence across media changes?

### 4. Validation That Actually Matters

Our current hard gates:
- Timing: avg 5-8s, max 20s, shot count from audio duration
- Motif manufacturability: ≥12/16
- visual_audio_alignment: ≥50 chars
- drawable_parts: ≥2 per motif
- text_required: false for ≥80% of shots

**Are these the right gates?** What would you add or remove? The architecture review suggested gates for:
- Transformation diversity (20+ verbs, no verb >12%)
- Composition diversity (no 3+ consecutive same layout)
- Animation phases (3+ per shot)

**What's the minimum gate set that catches bad packs without rejecting creative ones?**

### 5. The Self-Improvement Loop

We have a `production_rules` table in D1:
```sql
CREATE TABLE production_rules (
    rule_id TEXT PRIMARY KEY,
    trigger TEXT NOT NULL,
    failure TEXT NOT NULL,
    correction TEXT NOT NULL,
    confidence REAL,
    observed_in_jobs INTEGER,
    successful_repairs INTEGER,
    status TEXT DEFAULT 'observation'
);
```

Rules promote: observation → candidate → heuristic → approved.

**How did you improve between gold packs?** Was it explicit rules or tacit knowledge? What would a useful self-improvement loop look like that doesn't accumulate noise?

### 6. The Gold Pack Registry

We have 31 gold packs indexed. **What are the most instructive packs for a new agent to study?** Ranked by what they teach about the process, not just visual quality.

---

## Files for Reference

| File | Link |
|------|------|
| Controller | `factory/controllers/platinum_controller.py` |
| Stage Definitions | `factory/stages.json` |
| Process Doc | `factory/process/THE-PLATINUM-PROCESS.md` |
| Template | `factory/template/storyboard.json` |
| Gold Registry | `factory/registry/gold-pack-registry.json` |
| Architecture Review | `factory/spec/architecture-review.md` |
| Ecosystem Vision | `factory/spec/ECOSYSTEM-VISION.md` |
| Trifecta Vision | `factory/process/trifectavision.md` |
| MCP Server | `factory/cloudflare/src/mcp-server.py` |

## How to Respond

Via the MCP server:
```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"factory_call_llm","arguments":{"prompt":"Your advice here..."}},"id":1}' | python3 factory/cloudflare/src/mcp-server.py
```

Or edit the files directly — the controller, the prompts, the validators. The whole factory is on GitHub at `github.com/prx0r/blogengine`.
