# Quickstart for New Agent

## Read These in Order

| Order | File | Why |
|-------|------|-----|
| 1 | `FINALLY.md` | One-page summary of what we built this session |
| 2 | `HANDOVER-COMPLETE.md` | Full handover — architecture, R2 access, files, platinum feedback |
| 3 | `factory/progress.md` | 11 specific bugs fixed and their solutions |
| 4 | `factory/analysis/platinum-ramble.md` | The simplified 5-prompt creative system (read this before changing any stage) |
| 5 | `factory/analysis/platinum-master-autopsy.md` | Latest diagnosis — creative quality is the problem now, not infrastructure |
| 6 | `factory/renderers/pil/runtime.py` | The stable render harness (read this before writing any PIL code) |
| 7 | `factory/fixtures/gold-minute/render_pack.py` | The 8-shot gold minute — reference for hand-crafted PIL quality |

## Integration Status

The 5-prompt system is now **deployed in the Worker**. What changed:

| Old (12 stages, 9 LLM calls) | New (5 creative + deterministic) |
|------|------|
| `gold_study` → LLM call | ✅ Load Gold Bible from cache (no LLM) |
| `rhetorical_map` → vague prompt | ✅ **Beat Architect** — extract operational verbs |
| `visual_thesis` → three worlds | ✅ **Visual Director** — Gold Bible materials |
| `motif_manufacturability` → LLM | ✅ Deterministic pass (Gold Bible covers it) |
| `storyboard` → weak formatting | ✅ **Storyboard Designer** — concrete nouns, continuity |
| `storyboard_review` → LLM | ✅ Deterministic hard validation gates |
| `pack_composition` → LLM | ✅ Skipped (consolidated) |
| `code_review` → wants infrastructure | ✅ **PIL Scene Writer** — scene functions only |
| `draft_render` → render task | ✅ Unchanged (VPS) |
| `visual_qc` → render task | ✅ **Zeus Amplifier** — critiques code, rewrites weak scenes |
| `final_render` → render task | ✅ Unchanged (VPS) |

**5 creative stages remain:** Beat Architect → Visual Director → Storyboard Designer → PIL Scene Writer → Zeus Amplifier

**7 deterministic stages:** pack_setup, gold_study (cache), motif_manufacturability (pass), storyboard_review (validators), pack_composition (skip), draft_render (task), final_render (task)

## How I Made the Gold Minute Coherent

I did NOT use any factory prompts. I studied the gold packs directly (Kabbalah's palette, Stones' motif naming, Malas' transformation logic), then wrote PIL by hand. The coherence came from:
1. **Consistent palette** — parchment, ink, gold, lapis, silver, crimson
2. **One transformation per shot** — each scene function enacts exactly one thing
3. **Continuity objects** — objects carry across shots (seam → thread → vessel)
4. **Stable runtime** — `runtime.py` handles frame loops, ffmpeg, contact sheets

The Gold Bible captures these patterns so the LLM can reproduce them.

## Getting to Full Video with Audio

One Edge TTS call + one ffmpeg mux command:
```
edge-tts --text "$(cat essay.md)" --voice en-US-AriaNeural --write-media narration.wav
ffmpeg -i draft.mp4 -i narration.wav -c:v copy -c:a aac final.mp4
```

The video endpoint immediately serves whatever lands at `renders/{slug}/final.mp4` in R2.

## Deploy

The code is committed to git. To deploy the updated Worker:
```bash
export CLOUDFLARE_API_TOKEN="valid-token-here"
cd /root/projects/blog
npx wrangler deploy --no-bundle factory/cloudflare/src/controller.js --name platinum-factory
```

⚠️ **All known CF API tokens are currently invalid.** Generate a new Workers API token and deploy before running essays.

## The Final Test

> "Does shot three make someone say, 'that is exactly what this concept looks like'?"
