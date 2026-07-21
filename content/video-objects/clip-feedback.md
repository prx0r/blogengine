# Clip Feedback Log

Paste descriptions here and I'll match them to the prompt that generated them.

---

## Batch 1: Seeker Variants (8 clips)

| Clip ID | Prompt | Your Rating | Your Notes |
|---------|--------|-------------|------------|
| SEEKER_KASHMIR_v1 | Seeker in Himalayan valley, temple ruins, golden hour | ___ | |
| SEEKER_SUFI_v1 | Moonlit courtyard, fountain, tilework | ___ | |
| SEEKER_FOREST_v1 | Bamboo forest path, fireflies, dappled light | ___ | |
| SEEKER_MANDALA_v1 | Seeker on glowing mandala, rings of light | ___ | |
| SEEKER_DESERT_v1 | Sand dunes at sunset, walking | ___ | |
| SEEKER_CAVE_v1 | Seated meditation in cave, shaft of light | ___ | |
| SEEKER_DAIMON_v1 | Two figures, luminous guide reaching out | ___ | |
| SEEKER_WATER_v1 | Kneeling at still lake, touching reflection | ___ | |

## Batch 2: Lead-Ins (6 clips)

| Clip ID | Prompt | Rating | Notes |
|---------|--------|--------|-------|
| LEADIN_KASHMIR | Walks in, sits on stone bench under tree, opens birch-bark ms | ___ | |
| LEADIN_SUFI | Sits at fountain edge in courtyard, opens leather book | ___ | |
| LEADIN_NEO | Sits on marble step overlooking sea, unrolls scroll | ___ | |
| LEADIN_HERM | Sits at wooden desk in study, opens grimoire | ___ | |
| LEADIN_BUD | Sits on meditation stone in bamboo forest, opens palm-leaf ms | ___ | |
| LEADIN_YOGA | Sits on cliff at sunrise, opens cloth-bound book | ___ | |

## Batch 3: Style Tests (6 clips)

| Clip ID | Texture Style | Rating | Notes |
|---------|--------------|--------|-------|
| STYLE_CORALINE | Stitched cloth, button eyes, gothic garden | ___ | |
| STYLE_DELTORO | Brass automaton, cathedral, candles, gears | ___ | |
| STYLE_LAIKA | Clay fingerprint texture, floating islands | ___ | |
| STYLE_FELT | Wool/fabric, yarn trees, cozy | ___ | |
| STYLE_WOODCARVED | Carved wood grain, cherry blossoms | ___ | |
| STYLE_CHALK | Chalk pastel on dark paper, constellations | ___ | |

## Batch 4: White World (7 clips)

| Clip ID | What it should show | Rating | Notes |
|---------|--------------------|--------|-------|
| WHITE_WORLD_01 | Seeker alone in cream-white void, meditating | ___ | |
| TRANSIT_KASHMIR | White cracks → Himalayan valley | ___ | |
| TRANSIT_SUFI | Silver thread → moonlit courtyard | ___ | |
| TRANSIT_NEO | Gold rings → marble colonnade at dusk | ___ | |
| TRANSIT_HERM | White darkens → alchemical study | ___ | |
| TRANSIT_BUD | White dissolves to mist → bamboo forest | ___ | |
| TRANSIT_YOGA | White warms → Himalayan peak at dawn | ___ | |

---

## Rating: 9/10 — Clip b677c952

**What was great:**
- Ambient water fountain sounds — LTX does audio well
- Ambient lights flickering — atmospheric lighting worked perfectly
- Random dolphins flying about — the model created unexpected magical elements that worked
- Overall atmosphere was immersive and beautiful

**What was bad:**
- The Seeker character looked shit — LTX can't do consistent characters

**The lesson:** LTX is AMAZING at environments, atmosphere, lighting, ambient audio. It's BAD at characters. Strategy: generate world backgrounds with LTX, then composite a consistent Seeker character in post.

---

## How to report

Paste what you see like this:

```
DESCRIPTION: "guy with weird head walking down steps, the head was lumpy and the walking motion was jerky, stone steps, dark background, the figure didn't look like the clay style we wanted"
LIKELY CLIP: one of the lead-in clips (walking down steps + stone)
SUGGESTION: avoid walking motions, keep figure still or sitting
```

I'll match it to the clip ID, log the feedback, and adjust the prompt for next time.
