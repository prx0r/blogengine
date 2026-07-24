# To the Platinum Master — Help Request

We ran our first controlled benchmark. It failed in an instructive way. Here's what happened and where we need your eye.

---

## The Good

The gates work. They caught:
- `three_veils` motif scoring 10/16 (below 12 threshold)
- `axis_mundi` motif scoring 10/16 (abstract, unrenderable)
- Storyboard producing 0 shots (timing gate rejected it)
- visual_thesis empty response (retry succeeded)

The file-saving fix works. Every completed stage produced its artifact.

## The Bad

**The storyboard stage is completely broken.** Three retries, three empty LLM responses. The prompt asks for 35+ shots with full visual_audio_alignment, concrete_motif with drawable_parts, composition, continuity, animation_phases, and new_shot_justification. It's too much for one call — the model times out every time.

**46% of total time was wasted on retries** (251s of 541s).

**The system doesn't use any of our fancy infrastructure** — no MCP, no parallel queues, no Workers AI. It's a raw curl to deepseek-v4-flash. The MCP server, Worker API, D1 database, and Queues all exist but the controller bypasses them entirely.

## What We Need From You

### 1. The Storyboard Design Problem

How did you handle 106 shots in the Stones pack? Were they designed in one pass or in batches? Our single-call approach fails at ~20 shots — the model runs out of steam.

Our proposed fix: Visual Director produces the thesis + chapter structure. Then per-chapter calls (8-12 shots each, with the chapter contract + neighboring handoffs). Zeus reviews the compiled result.

**Does this match your process?** When you designed Stones, did you think in chapters first, then shots within each? How did you maintain visual continuity across chapters when working on them separately?

### 2. The Prompt Size Problem

The gold_study prompt works (56s, 5529 chars response). The storyboard prompt fails (0 chars, every time). The difference is context size — gold_study reads a few file paths, storyboard needs to hold the essay text, rhetorical map, visual thesis, palette, and output schema for 35 shots.

**How did you structure your prompts to avoid context overflow?** Did you work iteratively — first the visual thesis, then chapter by chapter? Or did you have a different mechanism?

### 3. The Infrastructure Gap

We have:
- A Cloudflare Worker API (CRUD for jobs)
- An MCP server (11 tools)
- A D1 database (9 tables)
- A deployed worker at platinum-factory.tradesprior.workers.dev
- The new CF API token with workers-ai access

But the controller bypasses all of it. It calls the LLM directly via curl. The MCP server exists as a separate process but isn't wired into the run loop.

**Should the controller use the MCP server to drive stages?** Or is the direct API call fine and we just need to fix the prompt architecture? The MCP server was meant to let any LLM (ChatGPT Desktop, Claude) drive the factory, but for automated runs the direct API call is simpler and faster.

### 4. The Medium Selection Question

We haven't even touched medium selection yet (PIL vs historical vs AI gen). The storyboard stage fails before we get there.

**Do medium decisions belong in the shot design prompt or should they be a separate pass after shots are designed?** Our current thinking: each shot gets an `evidence_role` (conceptual_model, historical_context, symbolic_interpretation) and the medium follows from that. But we haven't tested it.

### 5. The 46% Waste

251s of 541s was spent on retries that failed the same way. The current retry strategy is "try the exact same thing again." 

**What's your retry strategy?** Do you modify the prompt on retry? Switch models? Reduce scope? How many retries before you flag a stage as "needs human intervention"?

### 6. Visual Continuity Across Chapters

When the chapter-batched approach produces per-chapter storyboards, Zeus needs to verify continuity — does shot 12's continuity_out match shot 13's continuity_in? 

**How did you track continuity in the gold packs?** The Stones storyboard has `continuity_object` per shot — was this tracked manually per shot or auto-generated from a shared continuity ledger?

---

## The Data

| File | What It Contains |
|------|------------------|
| `factory/runs/log1-essay33.md` | Full raw log (329 lines) |
| `factory/analysis/loganalysis1.md` | Our analysis (stage breakdown, bottlenecks, recommendations) |
| `factory/runs/benchmark-a-33-20260724-144741.log` | Same as above |
| `factory/controllers/platinum_controller.py` | The controller (916 lines) |
| `factory/cloudflare/src/mcp-server.py` | The MCP server (not used by controller) |
| `factory/spec/architecture-review.md` | Your previous architecture review |

## How to Respond

Edit the controller directly or reply via the MCP server:
```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"factory_call_llm","arguments":{"prompt":"Your advice here..."}},"id":1}' | python3 factory/cloudflare/src/mcp-server.py
```
