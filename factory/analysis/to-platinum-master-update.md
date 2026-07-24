# To the Platinum Master — Update After Implementing Advice

We implemented your key recommendations. Here's what changed and where we're stuck.

---

## What We Fixed

1. **Worker is now the controller.** Added POST /advance endpoint with D1 state, LLM calls, stage advancement. Python controller is dev-only now.
2. **All 13 stage prompts ported** from Python to the Worker. Each stage has a specific prompt (gold_study asks to study 4 gold packs, storyboard asks for JSONL with chapter batching, etc.).
3. **D1 foreign key constraint** removed from stage_history (was blocking stage execution).
4. **Infrastructure split**: Worker for automated runs, MCP for interactive operators, Python for local prototyping.

## The Current Situation

All 13 stages advance successfully through the Worker. But there are quality issues:

### Problem 1: LLM Responses Are Generic
The prompts fire correctly (stage-specific content appears in responses) but the LLM returns generic text like "To complete the required output for the stage gold_study..." instead of actually studying gold packs and producing structured output. This happens with both Workers AI (llama-3.3-70b) and the opencode fallback (deepseek-v4-flash).

**Hypothesis:** The prompt formatting might be off — we're sending a plain string instead of a structured messages array with system/user roles.

### Problem 2: No Validation on the Worker Side
The Python controller has validators (timing gate, motif score ≥12/16, alignment ≥50 chars). The Worker just saves the LLM response and advances. We need to port the validators.

**Question:** Should validators be in the Worker (JavaScript) or should the Worker call the Python controller for validation as a subprocess? Porting 200 lines of Python validation to JS seems error-prone.

### Problem 3: Storybook Still Monolithic
The storyboard prompt now says "JSONL format, chapter by chapter, 6-12 per chapter" but it's still one LLM call. The model returns generic text instead of actual shot data. The chapter fan-out (parallel calls per chapter) isn't implemented yet.

**Question:** Should the Worker fan out chapter calls itself (loop in JS calling the LLM per chapter) or should this be a Queue-based fan-out? The Queue approach is more scalable but requires more infrastructure.

### Problem 4: Which Model Should We Use?
We have three options:
- **Workers AI** @cf/meta/llama-3.3-70b-instruct-fp8-fast ($0.293/M tokens) — available via `env.AI.run()`
- **Workers AI** @cf/qwen/qwen3-30b-a3b-fp8 ($0.051/M tokens) — cheapest
- **OpenCode API** deepseek-v4-flash — we have a working API key, $0 cost so far

The Workers AI calls are failing or returning generic text. The opencode fallback works but is also generic. 

**Question:** What model and prompt format do you use for the gold packs? Single system+user message? Chat format with examples? What works for producing structured JSON output reliably?

## The Current Code

The Worker advance handler (simplified):
```javascript
// Build prompt from prompts object by stage
prompt = prompts[stage] || fallback;
prompt += '\n\nOutput format: valid JSON. No markdown, no shell commands.';

// Try Workers AI
let resp = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 4000,
});

// Fallback to opencode
let resp = await fetch('https://opencode.ai/zen/go/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({ 
    model: 'deepseek-v4-flash', 
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000 
  }),
});
```

Is the issue that we're not using a system message? All our prompts are `role: 'user'`. Should gold_study have a system prompt like "You are a visual design analyst. Extract transferable principles from gold packs."?

## Specific Questions

1. **Prompt format**: System + user messages, or just user? Do you include few-shot examples in the prompt?
2. **Model choice**: deepseek-v4-flash works for us but responses are generic. Is there a better model for structured JSON output?
3. **Validation location**: Port validators to JS in the Worker, or call Python from the Worker?
4. **Chapter fan-out**: Loop in the Worker, or Queue-based fan-out?
5. **Storyboard format**: We switched to JSONL (one JSON object per line). Does this match how you work? Any gotchas?

## Files for Reference

| File | Contains |
|------|----------|
| `factory/cloudflare/src/controller.js` | The Worker with all 13 prompts (213 lines) |
| `factory/controllers/platinum_controller.py` | Python controller with validators (946 lines) |
| `factory/template/storyboard.json` | Canonical shot schema |
| `factory/stages.json` | Shared stage definitions |
