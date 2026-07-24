# Concept Bridge — Platinum Pattern → Our System

## How the Platinum Pack Maps to Our Existing Files

### Storyboard Entry → Our Resources

```
Platinum storyboard.json shot:          Our equivalent:
─────────────────────────────────────   ─────────────────────────────
shot_id: "shot_001"                     → auto-generated
chapter: "spacious_present"             → scene-system/concepts/ (263 tags)
chapter_title: "I. The Spacious Present" → custom per film
spoken_text: "..."                       → from essay narration
start/end/duration_seconds               → from actual WAV measurement
motif: "attention_lens"                 → CONCEPT_MAP in search-scenes.py
visual_mechanism: "attention lens"       → described in operations/visuallanguage.md
continuity_object: "the field"          → scene-system/ENGINE.md entity model
transition: "continuous..."             → template families in scene-system/
background_justification: "..."         → custom per film

draw_motif() implementation:             → scripts/renderer/spanda_scenes.py
  if motif == "attention_lens":          → visual-library/core_scenes.py
    draw converging rays...              → visual-library/light_pack.py
                                         → (261 functions available)
```

### The Search Tool

```bash
# Given narration text, find matching scene function:
python3 factory/scripts/search-scenes.py "wheel of powers"
# → s_wheel from spanda_scenes (83% match)

python3 factory/scripts/search-scenes.py "time breath void consciousness"
# → s_chain from spanda_scenes (75% match)
# → s_mantra from spanda_scenes (breath — 75% match)
```

### What's Indexed

| Pack | Functions | Concepts Covered |
|------|-----------|-----------------|
| spanda_scenes | 10 | pulse, wheel, six names, mantra, perception, throb, chain, play, recognition, expansion |
| light_pack | 10 | light, darkness, wave, candle, vibration, resonance, constellation |
| core_scenes | 6 | branching, harmonograph, lattice, rings, resonance, dissolution |
| minimal_forms | 10 | breathing circle, rotating, expanding ring, pulsing dots, growing line |
| spanda_karika | 6 | inner exertion, six names, wave upon wave, breath pulse, the centre, cosmic bliss |
| vijnana_bhairava | 6 | between breaths, third eye, central channel, between thoughts, sense withdrawal, awakening |
| concept_packs | 7 | shiva, shakti, nataraja, kali, abhinavagupta, quote |
| consciousness_states | 5 | waking, dream, deep sleep, fourth, beyond |
| complexity_pack | 6 | mandelbrot, julia, cellular automaton, tree, minimal energy, game of life |
| **Total** | **66 indexed** | **(+ ~195 more unindexed functions in packs)** |

### The Production Workflow (with Bridge)

```
1. READ essay → extract key concepts per paragraph
2. For each concept: RUN search-scenes.py
   → Get matching function name + pack
3. If match found (≥50%): USE existing function as shot's visual
4. If no match: WRITE new small function (10-30 lines)
   → Register it in pack's scene list
   → Add to CONCEPT_MAP in search-scenes.py
5. BUILD storyboard with motif = matched function's concept
6. GENERATE audio → measure durations
7. MAP each shot to function via motif
8. RENDER using the mapped functions
9. ANALYZE with analyze-output.py
```

### Gap Analysis

| Concept | Has Existing Function? | Where |
|---------|----------------------|-------|
| Wheel of powers | ✅ s_wheel | spanda_scenes |
| Perception as pulse | ✅ s_perception | spanda_scenes |
| Time-breath-void chain | ✅ s_chain | spanda_scenes |
| Universe as play | ✅ s_play | spanda_scenes |
| Recognition | ✅ s_recog | spanda_scenes |
| Hidden pulse | ✅ s_hook | spanda_scenes |
| Light emerging | ✅ scene_light_darkness | light_pack |
| Ocean/waves | ✅ scene_light_wave | light_pack |
| Between breaths | ✅ s01_between_breaths | vijnana_bhairava |
| Third eye | ✅ s02_third_eye | vijnana_bhairava |
| Grief as stone | ❌ None | Needs new function |
| From fist to cup | ❌ None | Needs new function |
| Witness watching | ❌ None | Needs new function |
| Emotion as wine | ❌ None | Needs new function |
| Ride the wave | ❌ None | Needs new function |
