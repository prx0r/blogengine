# Log Analysis 1 — benchmark-a-33

**Essay:** expansion-essay33.md ("the sun that knows itself")
**Date:** 2026-07-24
**Log:** `factory/runs/benchmark-a-33-20260724-144741.log`
**Variant:** A (current 13-stage sequential controller)

---

## 1. Summary

| Metric | Value |
|--------|-------|
| Total time | 541s (9m 1s) |
| Result | FAILED at storyboard stage (3 retries exhausted) |
| Stages completed | 5/13 (pack_setup, gold_study, rhetorical_map, visual_thesis, motif_manufacturability) |
| Stages failed | 1 (storyboard — 3/3 retries) |
| LLM calls | 11 (including retries) |
| API failures | 3 (empty responses: visual_thesis attempt 1, storyboard attempts 1-3) |
| Gates triggered | 3 (visual_thesis timeout, 2 motif manufacturability failures, storyboard timeout) |

## 2. Stage-by-Stage Breakdown

| Stage | Attempts | Total Time | LLM Response | Result |
|-------|----------|------------|--------------|--------|
| pack_setup | 1 | 16s | 696 chars ✅ | PASS |
| gold_study | 1 | 56s | 5529 chars ✅ | PASS |
| rhetorical_map | 1 | 51s | 4604 chars ✅ | PASS |
| visual_thesis | 2 | 122s | ∅→12459 chars | PASS (retry needed) |
| motif_manufacturability | 3 | 67s | 186→892→829 chars | PASS (2 retries) |
| storyboard | 3 | 229s | ∅ all 3 | FAIL ❌ |
| **Total** | **11** | **541s** | | **INCOMPLETE** |

## 3. What's Working

**The gates are catching real failures:**
- visual_thesis empty response → retried and succeeded
- `three_veils` motif scored 10/16 → caught by manufacturability gate
- `axis_mundi` motif scored 10/16 → caught by manufacturability gate
- storyboard 0 shots → caught by timing gate (min 35, got 0)

**LLM responses are being saved to files** (the fix works):
- gold_signatures.json ✅
- rhetorical_map.json ✅
- visual_thesis.md ✅
- motif_lint_report.json ✅

## 4. What's Broken

### A. Storyboard stage always returns empty (0 chars)
The storyboard prompt asks for 35+ shots with full visual_audio_alignment. The LLM consistently returns empty — it's timing out or hitting context limits. This is the #1 blocker.

**Root cause:** The deepseek-v4-flash model has a limited context window and the storyboard prompt is enormous (essay text, rhetorical map, visual thesis, plus instructions for 35+ shots with all fields).

**Fix:** Chapter-batched shot design. Instead of one call for all shots:
1. LLM designs the visual thesis (done)
2. A deterministic compiler splits the essay into chapters (8-12 shots each)
3. Per-chapter LLM calls (each 8-12 shots, fits in context)
4. Zeus reviews the compiled result

### B. visual_thesis stage failed on first attempt
Empty response (API timeout). Retry succeeded but cost 88s.

**Root cause:** The visual_thesis prompt asks the LLM to read the rhetorical_map.json and gold_signatures.json files, then generate three worlds with full evolution arcs. The LLM spent too long reasoning.

**Fix:** Split the prompt — first call for three proposals (lighter), second call for full development of the selected world.

### C. Motif manufacturability required 3 attempts
Attempt 1: LLM responded with shell commands instead of JSON (tried to `cat` the visual_program.json). Attempt 2: JSON returned but 2 motifs failed. Attempt 3: Passed.

**Root cause:** The prompt doesn't emphasize strongly enough that the LLM must read the file first and output JSON only.

**Fix:** The motif_manufacturability prompt needs to say "OUTPUT ONLY JSON. Read the file, score each motif, return JSON."

### D. The label says "Calling Hermes..." but it's NOT using Hermes (or MCP)

**What's actually happening:**
The controller calls `call_llm_direct()` which runs:
```bash
curl -s -X POST https://opencode.ai/zen/go/v1/chat/completions \
  -d '{"model":"deepseek-v4-flash","messages":[...]}'
```

This is a **direct API call to deepseek-v4-flash** — NOT the Hermes CLI agent, NOT the MCP server. The print statement says "Calling Hermes..." but that's misleading — it's calling the raw LLM with no agent intermediary. The Hermes MCP server at `factory/cloudflare/src/mcp-server.py` is registered with the gateway but the controller doesn't use it.

**What we specced vs what's running:**

| Specced | Actually Running | Gap |
|---------|-----------------|-----|
| Cloudflare Workflow per job | Local Python controller | Controller works but isn't deployed as Workflow |
| Durable Object coordination | .jobs/*.json files | Same logic, less resilient |
| MCP server drives the pipeline | Controller calls LLM directly | MCP server exists but isn't wired into the run loop |
| Parallel chapter design | Sequential stages | Storyboard fails because it's too much for one call |
| Workers AI models | deepseek-v4-flash only | Token has scope but no code calls it |
| Vision QC (llama-3.2) | None | Not implemented |

## 5. Speed Analysis

| Stage | Time | Bottleneck |
|-------|------|------------|
| pack_setup | 16s | LLM call + validation |
| gold_study | 56s | LLM reads 4 gold packs |
| rhetorical_map | 51s | LLM reads + analyzes essay |
| visual_thesis | 88s | LLM generates 3 worlds (timeout on attempt 1) |
| motif_manufacturability | 3s/36s/28s | LLM reads file + scores motifs |
| storyboard | 77s/71s/81s | LLM times out (prompt too large) |

**Total productive time:** ~290s (stages that completed)
**Total wasted time:** ~251s (retries of failed stages)
**Waste ratio:** 46%

## 6. Recommendations (Priority Order)

1. **Fix storyboard immediately** — Split into chapter-batched calls (8-12 shots per call). This is the single blocker.
2. **Update print labels** — "Running stage via direct API call" not "Calling Hermes..." to avoid confusion.
3. **Add prompt guardrails** — motif_manufacturability and other stages need "OUTPUT ONLY JSON" in the prompt to prevent shell command responses.
4. **Wire MCP server into the run loop** — The MCP server exists with 11 tools but the controller bypasses it entirely. Use MCP for stage execution and get the streaming/logging benefits.
5. **Reduce visual_thesis timeout** — Split into two calls: proposal (3 worlds light) → development (selected world deep).

## 7. Raw Metrics for Future Benchmarking

```
Total time: 541s
Stages: 5/13 completed
LLM calls: 11 (6 successful, 3 empty, 1 command instead of JSON)
Retries triggered: visual_thesis(1), motif_manufacturability(2), storyboard(3)
Characters received: 696 + 5529 + 4604 + 0+12459 + 186+892+829 + 0+0+0 = 25,195 total
Motifs scored: 4 (watching_stones 14, bishop_codex ?, three_veils 10 FAIL, axis_mundi 10 FAIL)
Gates triggered: 3 of 5 completed stages
```
