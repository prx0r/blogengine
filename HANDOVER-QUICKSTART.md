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

## Is the Platinum Ramble Good Advice?

**Yes.** The core insight is dead right: only 5 creative calls are needed, not 12. The Beat Architect prompt would have prevented the 3-shot disaster. The Gold Bible concept is the missing piece — a cached reference that constrains every visual decision to gold-standard material language.

The current Worker has 12 stages that mostly map onto the 5-prompt system. You don't need to rewrite the infrastructure — just consolidate which stages actually call the LLM vs run deterministic checks.

## How I Made the Gold Minute Coherent (Did I Use Hermes/Zeus?)

**No.** I didn't use any of the factory prompts. I studied the gold packs directly (Kabbalah's palette, Stones' motif naming, Malas' transformation logic), then wrote the PIL code by hand. The coherence comes from:

1. **Consistent palette** — parchment, ink, gold, lapis, silver, crimson. Every shot uses these. No LEDs, no fog, no generic glow.
2. **One transformation per shot** — each scene function enacts exactly one thing (corona forming, seam fracturing, thread weaving, lights merging, circle completing)
3. **Continuity objects** — the gold seam appears in shot 4, the thread connects in shot 5, the vessel fills in shot 6. Objects carry across shots.
4. **Stable runtime** — the `runtime.py` handles ALL the mechanical work (frame loops, ffmpeg, concat, contact sheets). I only had to think about the visual.

The factory's creative stages generated weak output because the prompts are too vague and there's no Gold Bible constraining them. The ramble fixes that.

## Getting to Full Video with Audio

The gap from the gold minute to a full film is small:

```
1. Read the essay text aloud or generate Edge TTS
2. Align storyboard timing to actual audio duration
3. Render scene functions (runtime handles frames → clips → concat)
4. Mux audio: ffmpeg -i draft.mp4 -i narration.wav -c:v copy -c:a aac final.mp4
5. Upload to R2
```

The runtime already handles steps 3-4. What's missing is step 1-2: Edge TTS generation and timing alignment. These are deterministic — no LLM needed.

The video endpoint serves whatever exists at `renders/{slug}/draft.mp4` or `renders/{slug}/final.mp4` in R2. Upload a narrated version and it's immediately watchable.

## What to Build First

1. **`factory/gold/GOLD-CREATIVE-BIBLE.json`** — extract material grammar, spatial grammar, motion grammar, continuity patterns from the 5 best gold packs (Kabbalah, Stones, Malas, Dvadasanta, Amnayas). This single file fixes the "LED lights and fog machines" problem permanently.

2. **Edge TTS narration** — `edge-tts essay-text --voice en-US-AriaNeural --write-media narration.wav` — one command. Then measure duration, adjust storyboard timing, mux.

3. **Run the 5-prompt system** on essay 33 — Beat Architect → Visual Director → Storyboard Designer → PIL Scene Writer → Zeus. Use the Gold Bible. Should produce proper 35-50 shot storyboard with gold-quality material language.
