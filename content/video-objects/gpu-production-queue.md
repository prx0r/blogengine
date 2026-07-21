# GPU Pod — Production Queue

Fire up `ltx-style-lab` webapp or LTX-Desktop. Generate in this order. Log every seed.

**Fixed style prefix for ALL prompts:**
```
Stop-motion animation, clay-textured, handcrafted aesthetic, warm parchment tones, subtle grain, shallow depth of field, volumetric lighting,
```

**Fixed negative prompt for ALL clips:**
```
photorealistic, smooth CG, 3D render, plastic, glossy, commercial, bright colors, cartoon, anime, digital art, sharp edges
```

**Audio for ALL clips:**
```
silence, no audio, complete quiet
```

---

## Phase 1: World Establishments (Reusable B-Roll)

These are generic. Once generated, they work across ALL videos in that world.

### Kashmir World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 1 | KASH_EST_01 | Stop-motion animation, clay-textured, handcrafted aesthetic, warm parchment tones, subtle grain. A vast stone temple complex sits in a mountain valley. Mist drifts between ancient carved pillars. Himalayan peaks visible in the far distance. Golden hour light. | Slow crane upward, revealing the full valley | 15s |
| 2 | KASH_EST_02 | Stop-motion animation, clay-textured. A small stone temple reflected perfectly in still water. Moss on the stones. Single shaft of golden light breaking through clouds. Mountains behind. | Slow push-in toward the reflection | 15s |
| 3 | KASH_EST_03 | Stop-motion animation, clay-textured. Interior of a stone cave. Stacked birch-bark manuscripts on wooden shelves. A single oil lamp flickers, casting warm amber light. Sanskrit text visible on open pages. | Static frame, slow fade-in from darkness | 12s |
| 4 | KASH_EST_04 | Stop-motion animation, clay-textured. A stone carving of a three-faced deity emerging from a dark stone wall. Warm light from below illuminates the faces. Cobra crown, serene expressions. | Slow orbit around the carving | 15s |

### Sufi World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 5 | SUFI_EST_01 | Stop-motion animation, clay-textured. A moonlit Andalusian courtyard garden. Central fountain with water catching moonlight. Geometric tilework on walls. Orange trees in the corners. Deep indigo sky above. | Static frame, water moves slowly | 15s |
| 6 | SUFI_EST_02 | Stop-motion animation, clay-textured. A single arched window in a stone wall. Moonlight streams through ornate geometric lattice, casting shadow patterns on the floor. Candle flickers on a ledge. | Slow push-in toward the window | 12s |
| 7 | SUFI_EST_03 | Stop-motion animation, clay-textured. A vast desert night. Single candle inside a small tent. Stars visible through the open flap. A silhouette of a seated figure is visible against the tent wall from outside. | Slow pull-back from the tent | 15s |

### Neoplatonic World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 8 | NEO_EST_01 | Stop-motion animation, clay-textured. A marble colonnade at dusk. Torches flicker on stone pillars. A path leads through columns toward the sea, visible in the distance. Warm torchlight on cool stone. | Slow walk-through between columns | 15s |
| 9 | NEO_EST_02 | Stop-motion animation, clay-textured. A Renaissance study. Books stacked everywhere. A brass astrolabe on a wooden desk. Single candle illuminates an open manuscript. Dark wood paneling. | Slow push-in on the open manuscript | 12s |
| 10 | NEO_EST_03 | Stop-motion animation, clay-textured. Concentric celestial spheres floating in darkness. Each sphere is a translucent ring with tiny stars embedded. The center glows gold. | Slow orbit around the spheres | 15s |

### Hermetic World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 11 | HERM_EST_01 | Stop-motion animation, clay-textured. A dim stone laboratory. Glass alembics glow with amber liquid on a wooden table. Bundled herbs hang from the ceiling. A single candle burns. Furnace glow in the background. | Slow pan across the table | 15s |
| 12 | HERM_EST_02 | Stop-motion animation, clay-textured. An ancient book open on a wooden lectern. Pages show alchemical diagrams of circles and symbols. Candlelight flickers across the page. Dark background. | Slow push-in on a diagram page | 12s |

### Buddhist World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 13 | BUD_EST_01 | Slow-motion animation, clay-textured. A bamboo forest path. Dappled morning light filters through the tall stalks. Mist hangs between the trees. A stone meditation bench sits at the path's end. | Slow walk down the path | 15s |
| 14 | BUD_EST_02 | Slow-motion animation, clay-textured. A stone Buddha statue seated in meditation in a forest clearing. Moss grows on the statue's base. Faint mist. Early morning light. | Slow orbit around the statue | 15s |

### Yoga World

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 15 | YOGA_EST_01 | Stop-motion animation, clay-textured. A Himalayan mountain peak at dawn. Snow caps catching orange light. A small stone hut on a ridge. Pine trees below. | Slow crane upward along the mountain | 15s |
| 16 | YOGA_EST_02 | Stop-motion animation, clay-textured. A river bank at sunrise. Flat sitting stones arranged in meditation rows. Water flows slowly. Far mountains in mist. | Static frame, water moves | 15s |

---

## Phase 2: The Seeker (Reusable Character Overlay)

These clips are composited in post (not generated into complex scenes). Generate the Seeker alone in darkness, then overlay onto world backgrounds.

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 17 | SEEK_STAND | Stop-motion animation, clay-textured. A small geometric clay humanoid figure, warm beige, simplified form, standing alone in vast darkness. Single soft light from above illuminates them. No background detail. | Static frame, the figure breathes slowly | 12s |
| 18 | SEEK_SIT | Stop-motion animation, clay-textured. A small geometric clay humanoid figure sits cross-legged in meditation pose in complete darkness. Warm beige. Soft rim light from the left. | Static frame, gentle rise and fall of chest | 15s |
| 19 | SEEK_LOOKUP | Stop-motion animation, clay-textured. A small geometric clay humanoid figure standing in darkness, head tilted upward as if looking at something above. Warm beige. Light from above illuminates their face. | Slow push-in on the figure | 10s |
| 20 | SEEK_HAND | Stop-motion animation, clay-textured. Extreme close-up of a small geometric clay hand reaching forward into darkness. Warm beige. Light catches the fingertips. | Static | 8s |
| 21 | SEEK_DISSOLVE | Stop-motion animation, clay-textured. A small geometric clay humanoid figure in darkness slowly begins to glow from within, starting at the chest. The light spreads until the figure is pure gold light, then fades. | Static | 15s |

---

## Phase 3: Abstract Concept Clips (Reusable Explainer Visuals)

These are the core visual explanations. Each depicts one philosophical concept.

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 22 | SPANDA_01 | Stop-motion animation, clay-textured, deep dark blue background. A single point of pulsating blue-white light at center. Concentric rings emanate outward in slow rhythmic waves. The rings are semi-transparent, revealing geometric patterns within. | Slow orbit around the pulsing center | 15s |
| 23 | SPANDA_02 | Stop-motion animation, clay-textured. A field of tiny gold particles suspended in darkness. They pulse together in rhythm — bright then dim, bright then dim. The pulse is slow, like a heartbeat. | Static frame | 12s |
| 24 | SHAKTI_01 | Stop-motion animation, clay-textured, deep darkness. From the bottom of frame, a single thin thread of crimson light spirals upward, slowly, leaving a trail. The thread weaves into a complex spiral pattern. | Camera follows the spiral upward | 15s |
| 25 | SHAKTI_02 | Stop-motion animation, clay-textured. A stream of molten gold-crimson light descending from the top of frame in slow motion. It strikes the ground and pools, spreading like liquid. | Slow push-in on the pool of light | 12s |
| 26 | MAYA_01 | Stop-motion animation, clay-textured, desaturated tones. Semi-transparent grey concentric rings floating in darkness. They contract slowly, one by one, layering over each other. The center grows darker. | Slow push-in as rings contract | 15s |
| 27 | TATTVA_01 | Stop-motion animation, clay-textured. A geometric diagram of descending nodes floating in darkness. 36 distinct nodes arranged in layers from top to bottom. Each node lights up gold sequentially, sending a pulse to the node below. | Slow crane-down as nodes illuminate | 20s |
| 28 | TATTVA_02 | Stop-motion animation, clay-textured. A single tetrahedral form made of gold lines floating in darkness. The 36 nodes at its vertices begin to glow. The tetrahedron slowly rotates. | Slow orbit | 15s |
| 29 | RASA_01 | Stop-motion animation, clay-textured, deep dark background. A single point of deep crimson light at center. The color blooms outward slowly like watercolor on wet paper, revealing layers of emerald, saffron, and violet. | Static frame as bloom fills the screen | 15s |
| 30 | RASA_02 | Stop-motion animation, clay-textured. Nine distinct color swatches floating in a circle in darkness. Each one pulses gently — deep red, orange, gold, green, blue, indigo, violet, white, and silver. | Slow orbit around the color circle | 15s |
| 31 | PRATYABHIJNA_01 | Stop-motion animation, clay-textured. A dark mirror-like surface floating vertically in darkness. A warm beige geometric figure approaches it. The reflection in the mirror becomes brighter, larger, more luminous. | Over-the-shoulder facing the mirror | 15s |
| 32 | KUNDALINI_01 | Stop-motion animation, clay-textured, deep darkness. A thin crimson serpent of light coiled at the bottom of frame. It begins to uncoil and rise, spiraling upward slowly. Tiny gold sparks trail behind it. | Camera follows the ascent | 20s |
| 33 | NADI_01 | Stop-motion animation, clay-textured. A translucent human form made of golden lines, like an outline. Three internal channels glow: a central column (gold) and two side channels (crimson and pale blue). Faint light pulses through them. | Slow push-in on the central channel | 15s |
| 34 | BHED_01 | Stop-motion animation, clay-textured. A single clay pot in darkness. The pot slowly breaks into pieces along crack lines. From inside, golden light spills out. | Static frame, slow-motion break | 12s |

---

## Phase 4: Specific Explainer Visuals (Concept-Specific)

These are tied to specific video concepts but still reusable as B-roll within that video.

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 35 | EXPL_SHIVA | Stop-motion animation, clay-textured. A golden triangular form floating above a dark landscape. It radiates light in all directions. Everything below is in shadow, everything above is illuminated. | Slow push toward the triangle | 12s |
| 36 | EXPL_MAHESHVARA | Stop-motion animation, clay-textured. Three faces emerging from a single stone column in darkness. Each face has a different expression: serene, fierce, contemplative. Warm golden light from below. | Slow orbit showing each face | 15s |
| 37 | EXPL_UPHAYA | Stop-motion animation, clay-textured. Three distinct paths appearing in darkness: one is a narrow stone stair (āṇava), one is a flowing river (śākta), one is a beam of light (śāmbhava). A small figure stands at the fork. | Slow crane from the figure up to the paths | 20s |
| 38 | EXPL_YANTRA | Stop-motion animation, clay-textured. A Śrī Yantra diagram built from interlocking triangles. They assemble one by one from the center outward. Each layer is a slightly different shade of warm gold. | Slow zoom out as yantra assembles | 20s |
| 39 | EXPL_SOUND | Stop-motion animation, clay-textured. Dark space. Concentric ripples emanate from a central point, visible as subtle distortions in the clay surface. Each ring carries tiny particles outward. | Static, looking down at the surface | 12s |
| 40 | EXPL_TIME | Stop-motion animation, clay-textured. A sand timer floating in darkness. The sand flows upward instead of down. Three faces of a clock are visible, each showing a different time. The hands move backward. | Slow orbit | 15s |

---

## Phase 5: Ambient Backgrounds (Reusable Textures)

These are pure texture/environment clips for transitions or background loops.

| # | Clip ID | Prompt | Camera | Duration |
|---|---------|--------|--------|----------|
| 41 | AMB_FIRE | Stop-motion animation, clay-textured. A slow-burning fire with amber and gold flames. Smoke curls upward. Embers float. No logs visible — pure flame in darkness. | Static | 20s |
| 42 | AMB_SMOKE | Stop-motion animation, clay-textured. Incense smoke rising in a dark room in slow, continuous spirals. The smoke is pale grey, catching a warm light from below. | Static, slow downward pan | 20s |
| 43 | AMB_WATER | Stop-motion animation, clay-textured. Slow ripples on dark water surface. Gold light reflects on the ripples. No shore visible — just water and reflection. | Static, overhead | 20s |
| 44 | AMB_STARS | Stop-motion animation, clay-textured. A dark sky filled with tiny pinprick lights. They pulse subtly. No ground visible. The stars drift very slowly. | Static | 20s |

---

## Generation Log

Copy this table and fill as you generate:

```
| Batch # | Clip ID | Seed | Result | Notes |
|---------|---------|------|--------|-------|
| 1 | SEEK_STAND | ____ | ___ / ___ | |
| 1 | SEEK_SIT | ____ | ___ / ___ | |
| 2 | KASH_EST_01 | ____ | ___ / ___ | |
| 2 | KASH_EST_02 | ____ | ___ / ___ | |
| ... | ... | ... | ... | |
```

Result key: Y = use as-is, T = tweak prompt, N = unusable

---

## Batch Order (Priority)

Generate in this order so early clips inform later ones:

```
Batch 1: The Seeker (17-21) → test if character consistency works
Batch 2: Kashmir establishments (1-4) → validate world aesthetic
Batch 3: Abstract concepts — SPANDA, SHAKTI, MAYA (22-26) → core explainers
Batch 4: Abstract concepts — TATTVA, RASA, PRATYABHIJNA (27-31) → more explainers
Batch 5: KUNDALINI, NADI, BHED (32-34) → subtle body
Batch 6: Specific explainers (35-40) → concept-specific
Batch 7: Ambient backgrounds (41-44) → filler/transitions
Batch 8: Other world establishments (5-16) → expand
```
