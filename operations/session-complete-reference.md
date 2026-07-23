# Session Reference — July 22, 2026

## Render Pipeline (Confirmed)

```
Expanded essay → scene manifest (JSON) → PIL draft (2-8fps, fast)
→ Skia final (12fps, sharp) → FableCut assembly → export
```

PIL for drafting. Skia for final. Three.js reserved for special scenes.

## Visual Library

`visual-library/catalog/scenes.json` — **160 scenes across 12 packs**

### All Packs Built This Session

| Pack | File | Scenes | Status | User Feedback |
|------|------|--------|--------|---------------|
| Spanda PIL render | `scripts/renderer/spanda_scenes.py` | 10 | Working | "decent" |
| Spanda Skia render | `visionary-renderer/scripts/render-full.mjs` | 10 | 12fps, audio | — |
| Experimental v1 | `visual-library/experimental_techniques.py` | 10 | Draft | "cool but samey" |
| Experimental v2 | `visual-library/experimental_v2.py` | 10 | Refined | better, more variety |
| Experimental v3 (generative) | `visual-library/experimental_v3.py` | 10 | Research-inspired | "drawing to point was great" |
| Focus Pack (variable speed) | `visual-library/focus_pack.py` | 3 | Speed control | "L-systems YES" |
| Domain Assets (superformula) | `visual-library/domain_assets.py` | 6 | Gielis curves | useful |
| 20 L-system grammars | `visual-library/lsystem_collection.py` | 20 | All types | "thistle, dragon, koch, hilbert, weed are faves" |
| 6 Core Scenes (gold) | `visual-library/core_scenes.py` | 6 | **Gold** | "they all looked pro" |
| Light Pack | `visual-library/light_pack.py` | 10 | Candle/flame | "first candle was decent, rest iffy" |
| Concept Packs (deities) | `visual-library/concept_packs.py` | 7 | Geometric deities | — |
| Complexity Pack | `visual-library/complexity_pack.py` | 6 | Mandelbrot, CA | "contained tree and minimal energy are PERFECT" |
| Minimal Forms | `visual-library/minimal_forms.py` | 10 | Pure geometry | "p basic" |
| Consciousness→Bits | `visual-library/consciousness_to_bits.py` | 9 | Wave to binary | "awful" |
| Quote Templates (L-system) | `visual-library/quote_templates.py` | 6 | **Gold** | "good :)" |
| **Spanda Karika Pack** | `visual-library/spanda_karika_pack.py` | 6 | **New** | Just built |

### Reference Packs Received (22 total → 23 with Pratyabhijñā)

All saved at `video-templates/animation-references/`

| Pack | Scenes | Duration | Source |
|------|--------|----------|--------|
| 36 Tattvas | 12 | 9m40s | Drive |
| Five Kancukas | 19 | 11m00s | Drive |
| Pain is Juice | 8 | 4m10s | Drive |
| World Between Worlds | 8 | 4m15s | Drive |
| Secret Life of Matter | 8 | 4m15s | Drive |
| Everything is Empty | 8 | 4m05s | Drive |
| Dante Journey | 8 | 4m16s | Drive |
| Recognition | 8 | 3m56s | Drive |
| Mantra | 8 | 3m54s | Drive |
| Theurgy | 8 | 3m50s | Drive |
| Plotinus | 8 | 3m48s | Drive |
| Dream | 8 | 3m48s | Drive |
| Three Upāyas | 6 | 2m24s | Drive |
| Śaktipāta | 6 | 2m24s | Drive |
| Reflection | 6 | 2m24s | Drive |
| Ābhāsavāda | 6 | 2m24s | Drive |
| Pure Tattvas | 6 | 2m24s | Drive |
| Twelve Kālīs | 6 | 2m24s | Drive |
| Five Acts | 6 | 2m24s | Drive |
| Four Levels of Speech | 6 | 2m24s | Drive |
| Three Malas | 6 | 2m24s | Drive |
| Sixfold Path | 6 | 2m24s | Drive |
| **Pratyabhijñāhṛdayam** | **20** | **5m00s** | **Drive (new)** |

## Key Design Decisions

### What Worked
1. **Minimal forms unified by one pulse function** — `p(t, offset, speed)` shared across all scenes
2. **Contained L-systems** — clamping coordinates to frame prevents escapes
3. **Matched L-system + quote template** — species on both sides, quote centered
4. **Harmonograph for "pulse before form"** — single building line
5. **Doctrine→motion vocabulary** — mapping philosophical concepts to specific generators (from Pratyabhijñā pack)

### What Didn't
1. **Over-designed deity scenes** — too complex, user wanted simpler
2. **Consciousness→bits** — user said "awful"
3. **Three.js capture pipeline** — too complex, fragile, abandoned
4. **Floating L-systems** — uncontained trees left the frame
5. **English phrases popping up** — "remove english phrases u put up"

### Speed / Motion
- Universal `pulse()` function discovered late — should have been from the beginning
- Variable speed via `speed_profile()` segments — fast/slow within same scene
- 2fps for contemplative, 8-12fps for text sync, Skia for 24fps final

## File Index

| Path | Contents |
|------|----------|
| `visual-library/` | All scene packs, catalog, ingest scripts |
| `visual-library/catalog/scenes.json` | 160 searchable scenes |
| `scripts/renderer/renderer.py` | Shared PIL renderer (Film, Scene, primitives) |
| `scripts/renderer/` | Per-essay scene functions + render wrappers |
| `video-templates/gold-standards/` | Pacing templates (Alan Watts 7.1s etc.) |
| `video-templates/animation-references/` | 22 reference packs from Drive |
| `visionary-renderer/` | Skia Canvas + Three.js experiments |
| `operations/video-production-guide.md` | Confirmed pipeline docs |
| `content/ontology-engine/` | 12 ontology packs, 5 ADRs |
| `content/publishing/storyboards/` | Storyboard JSONs |
| `scripts/expansion-essay*.md` | 51 expanded essays (~1400 words avg) |
