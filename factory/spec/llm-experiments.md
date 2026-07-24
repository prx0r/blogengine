# LLM Experiments — PIL Code Generation Bake-Off

## The Idea

Give the same essay and visual thesis to multiple LLMs, compare their PIL scene function output. Score on: compiles, passes no-narration test, visual quality, code efficiency.

## Models Available via Cloudflare AI Gateway

### Workers AI (hosted, no token needed)
| Model | Price | Notes |
|-------|-------|-------|
| @cf/meta/llama-4-scout-17b-16e-instruct | $0.27/M input tokens | Multimodal, vision-capable |
| @cf/meta/llama-3.3-70b-instruct-fp8-fast | $0.293/M input tokens | Fast, good at code |
| @cf/qwen/qwen3-30b-a3b-fp8 | $0.051/M input tokens | Cheapest, 30B MoE |
| @cf/qwen/qwq-32b | $0.66/M input tokens | Reasoning model |
| @cf/deepseek-ai/deepseek-r1-distill-qwen-32b | $0.497/M input tokens | Reasoning model |

### Third-party (via AI Gateway)
| Model | Notes |
|-------|-------|
| openai/gpt-5.4 | Best PIL code generation |
| openai/o3 | Reasoning, good at geometry |
| anthropic/claude-sonnet-5 | Creative, good at visual design |
| anthropic/claude-opus-4.8 | Best overall quality |
| google/gemini-3.5-flash | Fast, cheap |
| xai/grok-4.5 | Good at following specs |

### OpenCode API (we have key)
| Model | Notes |
|-------|-------|
| deepseek-v4-flash | Current default, fast |
| (opencode gateway has more) | Check available models |

## Experiment 1: PIL Scene Function Bake-Off

**Input:** Essay 33 "the sun that knows itself" + visual thesis + storyboard scene description

**Task:** Write one scene function in PIL that:
- Takes (t, u, idx) parameters
- 15-40 lines
- No external dependencies beyond PIL + math
- Passes the no-narration test
- Uses the defined palette

**Models to test:**
1. deepseek-v4-flash (baseline — current controller)
2. llama-4-scout-17b via Workers AI
3. qwen3-30b via Workers AI (cheapest option)
4. claude-sonnet-5 via Gateway (if available)

**Scoring:**
| Criterion | Points |
|-----------|--------|
| Code compiles without errors | 10 |
| Uses correct PIL primitives | 10 |
| Multi-phase animation (3+ phases) | 10 |
| Proper easing functions | 10 |
| Palette colors used correctly | 10 |
| No-narration test: concept legible | 20 |
| Code efficiency (15-40 lines) | 10 |
| Visual quality (subjective 1-10) | 20 |

## Experiment 2: Full Render Script Race

**Input:** Essay 33 + visual thesis + storyboard.json

**Task:** Produce a complete render_pack.py with all scene functions

**Models:** Same lineup

**Scoring:** Time to first successful render + quality score

## Experiment 3: Visual Thesis Design-Off

**Input:** Essay only, no visual thesis

**Task:** Design three competing visual worlds + select one + justify

**Goal:** Which model produces the most creative, internally consistent visual direction?

## Experiment 4: Storyboard Critique

**Input:** A known-bad storyboard (14 shots at 43s each)

**Task:** Identify all problems and propose fixes

**Goal:** Which model catches the most quality issues?

## Experiment 5: Gold Pack Replication

**Input:** A gold pack's visual_program.json + essay

**Task:** Replicate the visual thesis and storyboard structure without accessing the gold pack's storyboard

**Goal:** Which model can infer the correct structure from the thesis alone?

## How To Run

```bash
# Via the MCP server (any MCP-compatible client)
factory_call_llm with prompt="Write a PIL scene function..." system="You are a PIL expert..."

# Via Workers AI directly (curl)
curl -X POST "https://api.cloudflare.com/client/v4/accounts/954612afb5a97bb15dddcdc70176813d/ai/run/@cf/meta/llama-4-scout-17b-16e-instruct" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a PIL scene..."}'

# Via the controller (current pipeline)
python3 factory/controllers/platinum_controller.py advance --slug test-essay
```

## Next Steps

1. Run Experiment 1 (single scene function) across 3-4 models
2. Score results blind (remove model names from output)
3. Best model becomes the default for CODE_REVIEW stage
4. Worst model becomes the "adversarial critic" for STORYBOARD_REVIEW
5. Track scores over time in the `production_rules` D1 table
