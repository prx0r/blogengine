# Brainstorm: Solutions to Benchmark Findings

Based on log analysis of benchmark-a-33 (5/13 stages completed, storyboard blocked).

---

## Problem 1: Storyboard Stage Always Fails

**Symptom:** 3 retries, 0 chars response each time. 229s wasted.
**Root cause:** Single LLM call expected to produce 35+ shots with full visual_audio_alignment, concrete_motif, composition, continuity, animation_phases — exceeds context window.

### Solutions Brainstorm

**A. Chapter-Batched Shot Design** (our proposed fix)
- Visual Director produces thesis + chapter contracts (4-6 chapters)
- Per-chapter LLM calls, each 8-12 shots (fits in context)
- Each chapter contract specifies: starting state, must_introduce, must_resolve, continuity_in, continuity_out
- Zeus reviews compiled result
- **Risk:** Continuity across chapters might break
- **Risk:** More LLM calls = more total time even if each is faster

**B. Two-Pass Shot Design**
- Pass 1: LLM produces shot list with minimal fields (shot_id, spoken_passage, visual_mode, duration)
- Pass 2: LLM enriches each shot with visual_audio_alignment, concrete_motif, etc.
- Pass 2 can be done in small batches
- **Risk:** Two passes might produce inconsistent results (shot list says one thing, enrichment changes it)

**C. Template-First Design**
- Instead of generating from scratch, the LLM fills in a pre-built template
- The template has N shots with blank fields
- LLM fills in spoken_passage, visual_audio_alignment, etc. for each
- **Risk:** The template constrains creativity
- **Risk:** Doesn't solve context window — still N shots in one call

**D. Hybrid: Deterministic Beat Splitting + LLM Shot Design**
- Run the essay through a deterministic sentence splitter (NLP: sentence boundary detection)
- Each sentence becomes a provisional beat
- LLM receives 8-12 adjacent beats at a time with context
- **Risk:** Deterministic split might cut in the wrong places
- **Risk:** Requires building the sentence splitter

**My vote: A (Chapter Batching)** — aligns with how gold packs were likely made. Stones has 11 chapters — ~10 shots per chapter. The architecture review also recommended this.

---

## Problem 2: 46% Time Wasted on Retries

**Symptom:** 251s of 541s spent on retries that failed the same way.
**Root cause:** Retry strategy is "try exact same prompt again" — nothing changes.

### Solutions Brainstorm

**A. Smart Retry: Different on Each Attempt**
- Attempt 1: full prompt
- Attempt 2: simplified prompt (fewer requirements, less context)
- Attempt 3: reduced scope (e.g., fewer shots, shorter descriptions)
- **Risk:** Simplified output might fail validation differently

**B. Model Fallback Chain**
- Attempt 1: deepseek-v4-flash (cheap, fast)
- Attempt 2: llama-4-scout via Workers AI (bigger context window)
- Attempt 3: gpt-5.4 via Gateway (most capable, most expensive)
- **Risk:** Cost increases significantly on failures
- **Risk:** Different models produce inconsistent output formats

**C. Exponential Backoff with Context Reduction**
- Each retry reduces context by 20% (trim essay excerpts, fewer gold pack examples)
- By attempt 3, the prompt is minimal
- **Risk:** Might lose important context and produce poor output

**D. Fail Fast After 1 Retry**
- If a stage fails on attempt 1, don't retry — flag for human review
- Eliminates wasted retry time entirely
- **Risk:** Some stages might pass on retry 2 (motif_manufacturability needed 3 attempts but eventually passed)

**My vote: B (Model Fallback)** — the Workers AI token has `llama-4-scout-17b` available with a much larger context window. Use deepseek for easy stages, fall back to llama for hard ones.

---

## Problem 3: LLM Returns Shell Commands Instead of JSON

**Symptom:** motif_manufacturability attempt 1 returned `cat content/publishing/renders/...` instead of JSON.
**Root cause:** The prompt doesn't emphasize "OUTPUT ONLY JSON" strongly enough, and the LLM falls back to "let me read the file first" behavior.

### Solutions Brainstorm

**A. Stronger Prompt Guardrails**
```
CRITICAL: OUTPUT ONLY VALID JSON. Do NOT include explanations, bash commands, file paths, 
or markdown formatting. Your entire response must be parseable by json.loads().
```
- **Risk:** Even with guardrails, some models ignore instructions

**B. Prepend System Prompt with Format Lock**
- Before the stage-specific prompt, add: `{ "role": "system", "content": "You are a JSON-only API. Your responses must be valid JSON. No markdown, no bash, no explanations." }`
- **Risk:** System prompt can also be ignored

**C. Parse-and-Retry Wrapper**
- If the response isn't valid JSON, try to extract JSON from markdown code blocks (already partially implemented)
- If that fails, re-prompt with "Your previous response was not valid JSON. Output ONLY valid JSON."
- **Risk:** More retries, more time

**D. Use a Model Better at JSON Mode**
- deepseek-v4-flash doesn't have native JSON mode
- qwen3-30b or gpt-5.4 have structured output / JSON mode
- **Risk:** Need to integrate additional models

**My vote: C (Parse-and-Retry)** — already have the markdown extraction code. Add a "not JSON, try again" loop before failing the stage.

---

## Problem 4: Infrastructure Not Wired

**Symptom:** MCP server, Worker API, D1 database all exist but controller bypasses them.
**Root cause:** We built the pieces but never connected them into a coherent system.

### Solutions Brainstorm

**A. Keep Direct API Calls, Fix Prompt Architecture**
- The controller works fine for individual stages
- The problem isn't the transport (curl vs MCP) — it's the prompt design
- Fix storyboard batching, keep everything else
- **Risk:** Still no parallelism, no durability, no dashboard

**B. Route Stage Calls Through the MCP Server**
- Controller sends JSON-RPC to MCP server instead of calling LLM directly
- MCP server handles: prompt building, LLM call, response parsing, file saving
- Benefits: single point for logging, caching, retry logic
- **Risk:** Extra hop adds latency
- **Risk:** MCP server becomes single point of failure

**C. Route Through the Cloudflare Worker**
- Controller sends HTTP request to `platinum-factory.tradesprior.workers.dev/run-stage`
- Worker handles: D1 state management, LLM call via AI binding, response saving to R2
- Benefits: Durable state, parallel capability, dashboard integration
- **Risk:** Worker CPU limits (5 min per request) might be too tight for long LLM calls
- **Risk:** Significantly more complex

**D. Hybrid: Controller for Local Dev, Worker for Production**
- Local dev: controller calls LLM directly (fast iteration)
- Production: worker orchestrates via queues (parallel, durable)
- Both use the same stage definitions and prompts
- **Risk:** Two codebases to maintain

**My vote: D (Hybrid)** — keep the controller for local runs and development. Use the Worker/Queues for production parallel runs. Share prompts and stage definitions (which we already do via stages.json).

---

## Problem 5: No Medium Selection

**Symptom:** Haven't even reached this stage yet. Storyboard blocks everything.
**Root cause:** Storyboard needs to be fixed before medium selection matters.

### Solutions Brainstorm

**A. Add Medium to Each Shot in the Storyboard Call**
- Each shot gets a `medium: pil | historical | ai_image | hybrid` field
- The LLM decides based on the shot's evidence role
- **Risk:** More fields = more prompt size pressure

**B. Separate Medium Pass After Storyboard**
- Storyboard produces shots with `evidence_role` (conceptual_model, historical_context, etc.)
- A separate lightweight call assigns medium based on evidence role + asset availability
- **Risk:** Two-pass adds time

**C. Deterministic Medium Assignment**
- Rule-based: if evidence_role = historical_context, medium = historical. If conceptual_model, medium = pil.
- No LLM call needed
- **Risk:** Might miss opportunities where AI gen would be better

**My vote: C (Deterministic)** — medium follows from evidence role. No need for an LLM to decide.

---

## Priority Order for Implementation

1. **Chapter-batched storyboard** — unblocks the entire pipeline
2. **Smart retry with model fallback** — cuts waste from 46% to ~15%
3. **JSON guardrails** — prevents shell commands in responses
4. **Medium selection (deterministic)** — quick win, no LLM needed
5. **Route through Worker** — only after the creative pipeline produces consistent output
