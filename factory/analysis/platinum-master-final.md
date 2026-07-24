# Platinum Master — Final Session Advice

## The Core Message

> "You are at the point where more infrastructure work will start reducing progress rather than increasing it."

> "You are not 'one auth header away from a gold film.' You are one auth fix away from a working execution loop. After that comes the real work: proving the generated visual decisions deserve to become a film."

## Fix Auth (Under 1 Hour)

**Use `requests`, not `urllib` or `curl` subprocess.** The 403 is not a header casing issue. Likely causes:
- Wrong deployment/route
- Token whitespace
- WAF/user-agent filtering
- Redirect stripping auth
- `dev-token` fallback in production

Diagnose by printing the error body:
```python
except urllib.error.HTTPError as exc:
    print("status:", exc.code)
    print("headers:", dict(exc.headers))
    print("body:", exc.read().decode("utf-8", errors="replace"))
```

**Remove the `dev-token` fallback** — fail closed if `RENDER_WORKER_TOKEN` isn't set.

## D1 Claim Atomicity Is Fine

Two-step SELECT then conditional UPDATE is safe for one or multiple workers. The key is checking `claim.meta?.changes !== 1`. No Durable Object needed.

Even cleaner: one SQL statement with `RETURNING *` (test if your D1 version supports it).

## The Biggest Insight: Stop Asking LLMs to Generate Full Animation Programs

The LLM already produced Python that compiles and creates a PNG. That proves syntax generation, not production animation.

**Freeze the renderer harness.** A single `factory/renderers/pil/runtime.py` file owns: Film, Scene, frame iteration, canvas, fps, ffmpeg, output paths, contact sheets, helper primitives.

The LLM generates only scene functions:
```python
def scene_s001(t, u, ctx):
    ...
SCENES = [SceneSpec(shot_id="s001", duration=6.2, render=scene_s001)]
```

Then: `python -m factory.renderers.pil.runtime --pack render_pack.py --output output/`

**Generate scene functions in batches** (4-8 per request), not 35-100 at once.

**Renderer-in-the-loop repair** — for each batch, generate → compile → render mature frame → review → repair failed functions only.

## The Strategic Decision: Build One Hand-Crafted Gold Film Now

Stop building infrastructure. Use the factory for planning (rhetorical map, visual thesis, storyboard, continuity, shot rationale) then manually elevate the PIL scene functions.

This creates the missing reference pair:
```
structured planning artifacts → gold-quality implementation
```

**What to capture while handcrafting:**
```json
{
  "shot_id": "s014",
  "generated_code_revision": "r1",
  "final_code_revision": "r5",
  "failure_types": ["motif_too_abstract", "motion_did_not_enact_claim"],
  "human_changes": ["replaced generic circles with suspended reservoir"],
  "preserved_from_generated": ["palette", "timing", "central-axis composition"]
}
```

The most valuable training data is: **generated attempt → criticism → specific correction → final accepted result.**

## The Immediate Sequence

1. **Fix auth in under an hour** — use `requests`, inspect error body, strip token, remove fallback
2. **Run deterministic smoke fixture through D1 tasks** — pending → claimed → rendering → completed → Worker advances
3. **Run a generated five-shot microfilm** — 30-45s, one chapter, stable renderer harness, one narration track
4. **Choose the flagship essay** — essay 33 is a candidate if the visual thesis is strong
5. **Register the result as the first factory-native gold pack** — with full repair history

## What Not to Build Next

Pause: Skia, Blender, medium selection, parallel chapter queues, YouTube analytics, Shorts automation, vision-QC automation, Durable Objects.

None of these answers: **"Can this new system make one film as good as the existing gold packs?"**

## Direct Answers

- **urllib vs curl?** Use `requests`. Diagnose the 403 body. No normal reason Bearer auth fails in urllib.
- **Two-step D1 claiming?** Safe with conditional UPDATE + changes check. No Durable Object needed.
- **Best prompt pattern for animation?** Freeze the runtime. Generate only scene functions in batches of 4-8. Repair from rendered frames.
- **Handcraft one film now?** Yes. Absolutely. The factory should assist the first flagship film, not autonomously produce it.
