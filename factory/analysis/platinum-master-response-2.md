# Platinum Master Response 2 — Artifact Grounding & Security

## The Core Diagnosis

> "Your Worker is currently a convincing simulation of a factory: prompt fires → some text returns → text is written if R2 works → stage is marked passed."
> 
> "The next leap is not prompt tuning. It is making each stage artifact-grounded and truthfully executable."

The model returns generic text because the prompts tell it to "study gold packs" or "read the essay" but **the actual content is never supplied to the model**. The Worker stores only 200 chars of the essay, and the advance endpoint never loads any artifacts into the request.

---

## 1. Security: API Key is Public

The OpenCode API key is hardcoded in `controller.js` at line 173 — in a public GitHub repo.

**Immediate actions:**
1. Rotate the key via the OpenCode dashboard
2. Remove from source code
3. Add as Worker secret: `wrangler secret put OPENCODE_API_KEY`
4. Rewrite git history to remove the exposed key

---

## 2. The Fix: Load Actual Artifacts Into Prompts

Every stage needs an **input artifact manifest**. The Worker must retrieve actual content from R2 and include it in the prompt.

```javascript
async function loadStageInputs(env, job, stageDefinition) {
  const manifest = {};
  for (const logicalName of stageDefinition.inputs) {
    const artifact = await env.FACTORY_DB.prepare(
      'SELECT * FROM artifacts WHERE job_id = ? AND logical_name = ? AND status = 'active''
    ).bind(job.id, logicalName).first();
    
    const object = await env.FACTORY_ASSETS.get(artifact.r2_key);
    manifest[logicalName] = await object.text();
  }
  return manifest;
}
```

### Prompt structure:
```
SYSTEM: You are the [role]. You receive source artifacts inside the user message.
Never claim to inspect files or paths. Return only valid JSON.

USER: 
JOB: {jobId}
STAGE: {stage}

SOURCE ESSAY:
<essay>{essayText}</essay>

GOLD PRINCIPLES:
<gold_signatures>{goldData}</gold_signatures>

TASK: Extract rhetorical transformations from every passage.
```

---

## 3. Model Policy — Cheap Models First

| Stage | Model | Cost/M tokens | Why |
|-------|-------|-----|-----|
| gold_study | qwen3-30b | $0.051 | Simple extraction, no creativity needed |
| rhetorical_map | llama-3.3-70b | $0.293 | Needs comprehension |
| visual_thesis | llama-3.3-70b | $0.293 | Creative but not huge context |
| motif_lint | qwen3-30b | $0.051 | Deterministic scoring, cheap is fine |
| storyboard | qwen3-30b | $0.051 | Chapter-sized, 8-12 shots, cheap enough |
| storyboard_review | qwen3-30b | $0.051 | Classification task |
| code_review | deepseek-v4-flash | free | Already working, good at code |
| vision_QC | llama-3.2-11b-vision | $0.049 | Actually vision-capable, cheap |

No expensive models needed. The key insight: **most stages are classification/extraction, not creative generation**. Use cheap models for those.

---

## 4. Stage-by-Stage Correction

| Stage | Current Problem | Fix |
|-------|----------------|-----|
| pack_setup | Works | Keep deterministic |
| gold_study | No gold pack content sent | Load from R2 + include in prompt |
| rhetorical_map | No essay text sent | Load essay from R2 + include |
| visual_thesis | Worlds generated without essay context | Load gold sigs + rhetorical map |
| motif_lint | No visual program loaded | Load from R2 |
| storyboard | No essay, thesis, or beats loaded | Load all inputs, fan-out per chapter |
| storyboard_review | No storyboard loaded | Load compiled storyboard |
| pack_composition | Should be deterministic assembly | Use templates, not LLM |
| render_plan | Could be deterministic from shot data | No LLM needed |
| code_review | Good — already has schema | Keep |
| draft_render | LLM prompt to "render" — impossible | Dispatch to VPS/Container |
| visual_qc | No actual frames to inspect | Vision model on rendered frames |
| final_render | LLM prompt to "generate media" — impossible | Dispatch to VPS/Container |

---

## 5. The Four Things To Build Next

1. **Fix source ingestion** — Store full essay in R2, not 200 chars in D1. Add artifact tracking.
2. **Implement loadStageInputs** — Every stage loads its actual inputs from R2 before calling LLM.
3. **Stop marking failed stages as passed** — Validate before advancing. Use `repairable_failure` status.
4. **Remove fake execution prompts** — `draft_render`, `visual_qc`, `final_render` should dispatch real work, not ask an LLM.
