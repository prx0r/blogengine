# LTX Prompt Guide — Lessons Learned

## What Doesn't Work

| Thing to Avoid | What Happens | Use Instead |
|----------------|-------------|-------------|
| **Walking / running / complex motion** | Body deforms, head gets lumpy, legs merge | Static camera, seated figure, slow breathing |
| **Hands doing fine actions** (opening book, reaching) | Fingers merge, hands look malformed | Hands visible but still (resting on knees, holding item) |
| **Multiple figures interacting** | Figures blend into each other | One figure at a time, keep them separated |
| **Face close-ups** | Face morphs, third eye looks lumpy | Mid or wide shots, silhouette preferred |
| **Complex transitions** (world dissolving) | Muddy, unclear | Simple cuts or fades in post-production |
| **Abstract concepts** (rings of light, mandalas) | Works OK but keep it simple | Single element, slow motion, high contrast |

## What Works Well

| Thing to Do | Why It Works | Example |
|-------------|-------------|---------|
| **Static camera, locked-off** | No motion artifacts, figure stays stable | "Static camera, locked-off, 24fps" |
| **Single figure seated in stillness** | No limb deformation | "A small clay figure sits cross-legged, chest rising and falling slowly" |
| **Silhouettes and shadows** | Hide detail issues, create mood | "The figure is backlit, their face in shadow" |
| **Slow lighting changes** | LTX handles gradual brightness shifts well | "Warm golden light slowly fills the space from below" |
| **Atmospheric environments** (mist, fog, smoke) | LTX does these beautifully | "Mist drifts slowly between stone pillars" |
| **Simple geometric forms** (mandalas, circles) | Cleaner output, less confusion | "A circle of gold lines on dark stone" |
| **Dark backgrounds with one light source** | Hides artifacts, creates drama | "Deep warm darkness with a single shaft of light" |
| **Static establishing shots** (landscape only) | No character needed, looks great | "Himalayan valley at dawn, mist, stone temple" |

## The Seeker: What to Prompt

```
DO: "A small geometric clay figure sits cross-legged in [setting]. 
Their chest rises and falls slowly. They do not move. [Lighting change] 
illuminates them from [direction]. Static camera."

DON'T: "A small figure walks across [setting]. They open a book. 
They raise their hand. They look around."
```

## Practical Prompt Structure

```
[STYLE anchor] Stop-motion Laika Studios aesthetic, handcrafted miniature, warm parchment tones, subtle clay texture on surfaces.

[ATMOSPHERE] Deep warm darkness with a single shaft of golden light from above. Volumetric mist catches the light. Rich shadows in corners.

[SUBJECT] A small geometric clay figure sits cross-legged with hands resting on knees. Their chest rises and falls with slow breath. They do not move.

[LIGHTING CHANGE] Warm amber light begins to glow from below, slowly rising up their body from their crossed legs to their chest to their face.

[CAMERA] Static camera, locked-off, 24fps, shallow depth of field with the figure in focus.

[AUDIO] Silence, no audio, complete quiet.
```

## What to Actually Generate

| Safe | Risky | Don't bother |
|------|-------|-------------|
| Seated figure, static | Figure walking slowly | Figure running |
| Landscape establishing | Figure opening a book | Figure interacting with objects |
| Slow light change | Reach toward something | Multiple figures touching |
| Pure abstract (light, rings) | Face close-up with expression | Detailed facial features |
| Mist, fog, atmosphere | World transition dissolve | Complex scene change |
| Single element at center | Two elements balancing | Crowd or group scenes |

## Breakthrough Finding: LTX Excels at Worlds, Not Characters

Clip b677c952 (rated 9/10) proved:
- **LTX is AMAZING at:** environments, atmospheric lighting, ambient audio (water fountain, flickering lights), emergent magical elements (random dolphins)
- **LTX is TERRIBLE at:** consistent characters, the Seeker, any figure needing to look the same across clips
- **Solution:** Generate world backgrounds with LTX. Composite a consistent Seeker character in post (render once, overlay on every world)

## CHUTES API Alternative

The CHUTES API at `https://chutes-ltx-2.chutes.ai/generate` is simpler than our ComfyUI wrapper:
- Returns video directly (no job ID polling)
- Uses `num_frames` not `duration_sec` (250 frames = 10s)
- Dimensions must be divisible by 64
- Has `cfg_guidance_scale` (default 3.0)
- Has `distilled: true/false`
- Key is in the agent's skill file (shared earlier)

## Updated Strategy

```
1. Generate atmospheric world backgrounds with LTX ← LTX excels here
2. Generate the Seeker as a separate clip (or render once, reuse) ← LTX is weak here
3. Composite Seeker over world backgrounds in post
4. Add ambient audio from LTX or separate generation
```

## Summary

The model is good for: **atmosphere, lighting, environments, ambient audio, magical emergent effects.**
The model is bad for: **consistent characters, character motion, hands, faces.**

Design every shot around what it does well. Let LTX build the WORLD, build the CHARACTER separately.
