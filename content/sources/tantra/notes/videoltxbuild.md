# Ochema — LTX Visual Language & Content Pipeline

## The Core Insight

The moat isn't the philosophy — it's the *world* we build to contain it.

The channel is **Ochema** — the vehicle of the soul. Each video is a journey. The Seeker travels across traditions and time, encountering the great masters and asking the questions the viewer wants to ask.

---

## Part 1: The Narrative Framework

### The Seeker's Journey (Series Arc)

The Seeker is a recurring character — a small geometric clay-textured figure who appears in every video. They are the viewer's avatar. They do not speak. They *witness*.

Each video follows the same structure:

```
[CONTEMPLATION]  The Seeker sits in darkness. A question appears.
[ENCOUNTER]      The Seeker arrives in a world — Kashmir, Iran, Varanasi.
[THE GURU]       A master appears (Abhinavagupta, Corbin, Gorakhnath, Ibn Arabi)
                 and speaks directly — using exact translations from their texts.
[DERIVATION]     The teaching unfolds visually (tattvas, spanda, rasa).
[INTEGRATION]    The Seeker and Guru merge or the Guru dissolves.
[RETURN]         The Seeker sits alone again, transformed.
```

### Three Audio Layers

| Layer | Source | Character |
|-------|--------|-----------|
| **Narrator** | Recorded voiceover | Calm, warm, authoritative. Frames the video, connects concepts. |
| **The Guru** | Recorded voiceover or LTX generated | Uses **exact translations** from primary texts. The guru's actual words. Different voice per guru. |
| **Ambient** | LTX generated or sound design | No music. Just environment: wind, fire, bells, breathing, silence. |

**LTX audio decision: No, don't use LTX for the main audio.** The generated audio is unpredictable and may insert music. Instead:
- Record narrator + guru voices cleanly
- Use LTX *only* for visual generation with "silence, no audio" in the prompt
- Add sound design in post (ambient beds, bells, breaths)

### The Mouth Movement Problem — Solved

**The gurus don't need visible mouth movement.** Here's why this works:

1. **The clay-texture/stop-motion aesthetic does not require lip sync.** In *The Fantastic Mr. Fox*, mouths move minimally. In *9*, characters have no mouths. The viewer accepts simplified or absent facial animation as a stylistic choice.

2. **The Seeker is our reaction shot.** When the Guru speaks, the camera is on the Seeker — watching, receiving, being transformed. The viewer identifies with the Seeker. Seeing them receive the teaching *is* feeling the teaching.

3. **The Guru is shown through presence, not speech animation:**
   - Guru as silhouette against their world
   - Guru from behind, facing the landscape
   - Guru's hands in a teaching gesture
   - Guru as animated statue — still, only the environment moves around them
   - Over-the-shoulder from the Seeker's perspective (we see what the Seeker sees)
   - Key quotes appear as **typography** over the Guru's image

4. **Visual grammar:**

```
[GURU SPEAKS]  →  Show Seeker listening, or Guru's world, or concept unfolding
[QUOTE]        →  Text appears as the words are spoken (typewriter fade)
[REVELATION]   →  The concept visualizes (tattvas, spanda, rasa bloom)
[SEEKER RESPONDS] →  Seeker's posture changes (no words needed)
```

### Each Guru Gets a Distinct World

| Guru | World | Visual Palette | Audio Signature | Speaking Style |
|------|-------|---------------|----------------|----------------|
| **Abhinavagupta** | Kashmir, 10th c. — mountain cave with stacked manuscripts | Gold, crimson, deep blue | Wind through pines, distant bell, no wind | Shown writing, seated in cave, facing away |
| **Gorakhnath** | Himalayan cave, dhuni fire glowing | Amber, smoke-black, ember-orange | Crackling fire, slow breath, no wind | Silhouette before fire, voice from flames |
| **Ibn Arabi** | Andalusian garden at dusk, moonlight on water | Silver, deep green, indigo | Water fountain, night insects, distant flute | Standing by water, facing the moon |
| **Henry Corbin** | Imaginal realm — no ground, translucent geometry | Translucent white, lavender, gold | Absolute silence, then a single bell | A presence, not a form — light shaped like a teacher |
| **Matsyendranath** | Inside the fish — bioluminescent deep teal | Deep teal, bioluminescent green | Water pressure, muffled heartbeat, distant whale | Floating in the deep, hands in mudra |
| **Lalleshwari (Lallā)** | Open Kashmiri meadow, vast sky | Earth tones, sky blue, cloud white | Wind through grass, birds, distant stream | Walking, seen from behind, merging with landscape |
| **Khapaḍa Bābā** | Khapaḍa Valley at sunset — forest hermitage | Warm brown, parchment, gold leaf | Forest ambience, meditation bell, no birds | Seated under a tree, still as stone |
| **Proclus** | Athenian night — the Academy colonnade | Marble white, midnight blue, torch gold | Crickets, distant footsteps, crackling torch | Standing in torchlight, scroll in hand |
| **Ficino** | Florentine study — books, astrolabe, candlelight | Deep red, aged parchment, brass | Page-turning, crackling candle, distant lute | At a desk, writing by candlelight, never looking up |
| **Suhrawardi** | Illumination — all gold light, no ground | Gold, white, no shadow | A single sustained note, no environment | Pure light in human shape, radiant |

### The Seeker's Arc Across Videos

The Seeker doesn't just appear — they **change** slightly each time. Not in form, but in what they carry:

- First video: The Seeker is empty-handed, standing before the tattva diagram
- Rasa video: The Seeker's chest glows with color for the first time
- Spanda video: The Seeker learns to pulse in rhythm with the light
- Corbin video: The Seeker steps *through* a mirror into the imaginal realm
- Final video: The Seeker merges with the light, becomes the Guru

This gives viewers a **reason to watch in order** — not because the concepts depend on it, but because the *character* is growing.

### The Question Each Video Answers

Every video starts with The Seeker's question, visualized as text or as a thought-form:

```
"What is the self?"        → The 36 Tattvas
"Why do I feel separate?"  → Māyā and the Kañcukas
"What is this aliveness?"  → Spanda
"Why does beauty move me?" → Rasa
"Is there a guide?"        → Daimon / HGA
"What happens when I die?" → The Death Systems
"How do I practice?"       → The Three Upāyas
"Who was I before?"        → Kuṇḍalinī
```

---

## Part 2: Visual Style — Yes, Clay-Texture

Yes, we are using **clay-texture / stop-motion aesthetic**. LTX-2.3 officially supports this (their docs list "stop-motion" and "claymation" as supported animation styles, and their own example prompt features felt birds in stop-motion).

The aesthetic is: **Guillermo del Toro meets The Fantastic Mr. Fox meets Coraline**. Warm, tactile, slightly imperfect. Geometric simplification. Handcrafted feel.

### The Two-Layer System

### Color Language

Assign colors to concepts so viewers intuitively map them:

```
Śiva (consciousness)     →    Deep gold / white light
Śakti (energy)           →    Crimson / molten orange  
Spanda (vibration)       →    Pulsing blue-white
Māyā (limitation)        →    Greyed desaturated
Tattva (category)        →    Transparent amber
Rasa (aesthetic bliss)   →    Rainbow bloom on black
Kañcuka (sheath)         →    Darkening greys / browns
Bhairava (awakened)      →    Deep purple-black with gold veins
```

Every video uses the same color code. Viewers learn it subconsciously.

---

## Part 2: LTX-2.3 Docs & Capabilities

**Docs:** https://docs.ltx.video/open-source-model/getting-started/overview
**HuggingFace:** https://huggingface.co/Lightricks/LTX-2.3
**GitHub:** https://github.com/Lightricks/LTX-2
**API Console:** https://console.ltx.video/playground/
**Quick Start:** https://docs.ltx.video/open-source-model/getting-started/overview
**ComfyUI Nodes:** https://github.com/Lightricks/ComfyUI-LTXVideo

### Key Capabilities for Our Use Case

| Capability | Spec | Our Use |
|------------|------|---------|
| **Clip length** | Up to 20 sec | 10-15 sec per shot |
| **Resolution** | Up to 4K (1080p, 1440p native) | 1080p for YouTube |
| **Frame rates** | 24/25/48/50 fps | 24 fps (cinematic) |
| **Aspect ratio** | Native portrait 1080×1920 | YouTube vertical shorts |
| **Image-to-video** | Animate still images | Breathe life into alchemical engravings, yogini paintings |
| **Audio-to-video** | Sync audio + video | Voiceovers drive visual pacing |
| **Camera control** | Dolly in/out, left/right, static | Standardized angles (PUSH, ORBIT, CRANE) |
| **LoRA support** | Train custom styles + characters | The Seeker character, clay-texture style LoRA |
| **Stop-motion style** | YES — officially supported | LTX example: felt birds in stop-motion style |
| **Depth-aware gen** | Control motion by depth map | Complex tattva diagram reveals |
| **OpenPose** | Pose-driven animation | The Seeker's movements |
| **ComfyUI** | Full integration | Run locally on vast.ai |

## Key LTX Docs Findings

### Image-to-Video is Our Workhorse

From the official LTX docs: Image-to-Video is preferred when you "have a specific starting image you want to bring to life." The model uses the seed image as the **first frame** and generates motion/audio from there.

**This is critical.** For world atmospherics, temple scenes, deity visuals — give LTX a seed image (Martand temple, Bhairava mask, Hermes illustration) and tell it what *moves*. Much more reliable than Text-to-Video.

Image-to-Video prompts should focus on **what happens**, not what the scene looks like (the image handles that):
- "Slow camera push-in, mist drifts through the columns, warm light intensifies"
- Not: "A temple with columns and mist" (waste — the image already shows this)

Text-to-Video only for pure abstractions (spanda pulse, tattva diagram, rasa bloom).

### Two-Stage Pipeline
1. Stage 1 generates at half resolution (8 steps) + audio
2. Spatial upscaler doubles resolution
3. Stage 2 refines at full resolution (3 steps)

Start at 1280×720 × 5s for testing. Increase once working.

### Distilled vs Full Model
Distilled (8+3 steps) — faster, for iteration. Full (15-40 steps) — higher quality. Use distilled for testing, full for final clips.

### Default Negative Prompt (from LTX docs)
```
pc game, console game, video game, cartoon, childish, ugly
```
We add our own for clay-texture:
```
photorealistic, smooth CG, 3D render, plastic, glossy, commercial, bright colors, cartoon, anime, digital art, sharp edges
```

### IC-LoRA for Consistency
IC-LoRAs condition generation on a reference input. Available types:
- **Style LoRAs** — artistic/visual aesthetics (can train one for our clay-texture look)
- **Character LoRAs** — consistent character appearance (The Seeker)
- **Motion LoRAs** — specific movement types

Train an IC-LoRA if character consistency across clips becomes an issue.

### Stop-Motion / Puppet Style — Confirmed

LTX-2.3's own examples include:
> "A **stop-motion style** scene featuring birds made of yellow felt. One bird approaches a birdhouse and shares a worm with another, showcasing the tactile textures of wool, cardboard, and twine in a miniature set."

This is exactly the Guillermo del Toro / Coraline / "9" aesthetic. The prompt keywords to use:

```
stop-motion style, handcrafted aesthetic, tactile textures, 
miniature-world animation, [material] textures, low-fi, 
rough fabric, painted wood, charming handmade look,
clay-textured, slight imperfection, puppet-like, 
geometric simplification, warm parchment tones
```

We train a **Style LoRA** on reference images from Coraline, "9", del Toro's Pinocchio, and The Fantastic Mr. Fox to create a consistent base look. Then every clip uses the LoRA + prompt keywords.

### World System — Reusable Landscapes

Each **world** is a set of reusable LTX prompts that establish the environment. Once generated, these clips can be reused across multiple videos set in the same world.

```
WORLD LIBRARY
══════════════

KASHMIR_MOUNTAIN          → Reusable establishing shot of Himalayan peaks
KASHMIR_CAVE_INTERIOR     → Cave with manuscripts, gold light
ANDALUSIAN_GARDEN         → Moonlit garden with fountain
ANDALUSIAN_NIGHT          → Same garden, different angle
HIMALAYAN_CAVE_FIRE       → Dark cave with dhuni fire
HIMALAYAN_CAVE_DARK       → Same cave, no fire (for contrast)
FLORENTINE_STUDY          → Renaissance study with books and astrolabe
FLORENTINE_NIGHT          → Same study, candlelit
ATHENIAN_ACADEMY          → Colonnade at dusk
ATHENIAN_ACADEMY_NIGHT    → Same, torchlit
IMAGINAL_REALM            → Translucent space with no ground
IMAGINAL_REALM_DEEP       → Deeper layer, more abstract
KHAPADA_FOREST            → Forest clearing at golden hour
KHAPADA_SUNSET            → Valley view at sunset
TEAL_DEEP                 → Underwater bioluminescent space
MEADOW_KASHMIR            → Open meadow with vast sky
PURE_LIGHT                → All-white, no ground, radiant

→ Each landscape is a seed + prompt logged in the CLIP LIBRARY
→ Reuse the same seed for the same landscape across videos
→ The Seeker is inserted into the landscape in different positions
```

### Audio Approach — Ambient Worlds Without LTX Audio

LTX generates audio, but we **turn it off in every prompt** and build soundscapes separately:

```
Every LTX prompt ends with: "silence, no audio, complete quiet"
```

The audio for each world is built from **three layers**, all created in post:

```
Layer 1: AMBIENT BED (continuous, drone-like)
  → Created from field recordings, synth pads, or found sound
  → Loops seamlessly
  → One per world, reusable across all videos in that world

Layer 2: ENVIRONMENTAL DETAILS (occasional, specific to scene)
  → Wind through pines (Kashmir), crackling fire (Gorakhnath), 
    water fountain (Ibn Arabi), page turning (Ficino)
  → Placed at specific moments corresponding to visual changes

Layer 3: NARRATOR + GURU VOICES (dialogue)
  → Recorded cleanly, mixed at -12dB over ambient
  → Guru voices have slight reverb to match their world
  → Narrator voice is dry, intimate, close
```

**No music. Ever.** The ambient beds serve the role of music — they carry emotional tone without drawing attention to themselves as "music."

### Generation Flows

| Flow | Best for | Speed |
|------|----------|-------|
| **Fast** | Iteration, testing prompts | Quick |
| **Pro** | Final production clips | Slower, higher quality |

For our pipeline: use Fast for prompt development, Pro for final shots.

---

## Part 3: The Seeker — Our Reusable Character

Not a person. An **archetypal figure**:

```
Form:     Geometric humanoid silhouette
Texture:  Clay-like, slightly irregular surface  
Color:    Warm parchment / unbleached linen
Scale:    Always small within the frame (emphasizes vastness of consciousness)
Motion:   Slow, meditative, deliberate
Purpose:  Anchor for the viewer's identification
```

The Seeker appears in every concept video:
- Stands before the tattva map as each layer unfolds
- Reaches toward a luminous point (spanda)
- Is surrounded by contracting rings (kañcukas)
- Dissolves into gold light at the end (recognition)

## The Six Worlds — Complete Specifications

### World 1: Hindu Tantra (Kashmir Śaivism)

**Gurus:** Abhinavagupta, Lakshmanjoo, Kṣemarāja, Matsyendranath, Gorakhnath, Lalleshwari, Khapaḍa Bābā

**Reusable Landscapes:**
```
KASHMIR_MOUNTAIN      →  Himalayan peaks, mist, far distance, golden sunrise
KASHMIR_CAVE          →  Cave interior, stacked manuscripts, single oil lamp
KASHMIR_MEADOW        →  Open meadow, vast sky, single tree
HIMALAYAN_CAVE_FIRE   →  Dark cave, dhuni fire, embers floating
KHAPADA_FOREST        →  Forest clearing, golden hour light through leaves
TEAL_DEEP             →  Underwater bioluminescent space (Matsyendra)
SACRED_SPACE          →  Abstract maṇḍala floor, The Seeker at center
```

**Color Palette:** Gold, crimson, deep blue, warm amber, parchment, saffron
**Lighting:** Golden hour, firelight, oil lamp, single shaft of light from above
**Audio Bed:** Low Himalayan drone — tanpura-like, continuous, warm
**Environmental Details:** Wind through pines, distant bell, crackling fire, page turning, meditation bell
**Reverb:** Large cave/hall — 2.5s decay
**Visual Motifs:** Manuscripts stacked, oil lamps, mountain silhouettes, maṇḍala diagrams, rudrākṣa beads

---

### World 2: Sufi & Illuminationist

**Gurus:** Ibn Arabi, Suhrawardi, Rūmī, Henry Corbin, Shams-e Tabrīz

**Reusable Landscapes:**
```
ANDALUSIAN_GARDEN     →  Courtyard garden, central fountain, moonlight
ANDALUSIAN_NIGHT      →  Same garden, candlelit arcade, starry sky above
SUFICIRCLE            →  Dervishes circling, seen from above
PURE_LIGHT            →  No ground, all gold-white radiance (Suhrawardi)
IMAGINAL_REALM        →  Translucent space, impossible geometry, no shadow
IMAGINAL_DEEP         →  Deeper layer, more abstract, colors shifting
PERSIAN_NIGHT         →  Starry desert, single tent, fire
```

**Color Palette:** Silver, deep green, indigo, moonlight white, gold, translucent lavender
**Lighting:** Moonlight, candlelight, self-radiant (no external light source in imaginal realm)
**Audio Bed:** Low sustained note — like a ney flute held long
**Environmental Details:** Water fountain, night insects, rustling leaves, distant ney, silence
**Reverb:** Medium garden — 1.2s decay with early reflections
**Visual Motifs:** Geometric tile work, water reflections, moon phases, calligraphy, veils

---

### World 3: Greek / Neoplatonic

**Gurus:** Proclus, Plotinus, Iamblichus, Socrates (daimon), Ficino (Renaissance bridge)

**Reusable Landscapes:**
```
ATHENIAN_ACADEMY       →  Colonnade at dusk, marble, distant sea
ATHENIAN_ACADEMY_NIGHT →  Same colonnade, torchlight, stars
FLORENTINE_STUDY       →  Renaissance study, books, astrolabe, candle
FLORENTINE_NIGHT       →  Same study, darker, single candle
COSMIC_SPHERES         →  Concentric celestial spheres, earth at center
SYRIAN_TEMPLE          →  Iamblichus' temple — fire altar, statues
CAVE_MATRIX            →  Plato's cave — shadows on wall, fire behind
```

**Color Palette:** Marble white, midnight blue, torch gold, deep red (Ficino), aged parchment
**Lighting:** Torchlight, candlelight, diffuse dusk, single shaft of light (cave)
**Audio Bed:** Low drone — like a bowed instrument, continuous
**Environmental Details:** Crickets, distant footsteps on stone, crackling torch, page-turning, sea far below
**Reverb:** Large stone chamber — 2.8s decay
**Visual Motifs:** Columns, scrolls, celestial spheres, shadows on walls, flame, statues

---

### World 4: Western Occult & Hermetic

**Gurus:** Hermes Trismegistus, Paracelsus, John Dee, Edward Kelley, Crowley, Agrippa

**Reusable Landscapes:**
```
ELIZABETHAN_STUDY     →  Dee's study — books, globes, scrying mirror, candle
LABORATORY            →  Paracelsus' lab — alembics, furnaces, herbs
STONE_CIRCLE          →  Ritual circle in landscape, standing stones
LIBRARY_NIGHT         →  Occult library, stacks of grimoires, single lamp
DESERT_HERMIT         →  Hermetic hermit's cave, desert landscape
TEMPLE_INNER          →  Ritual temple, black and white tiles, altar
```

**Color Palette:** Deep red, aged parchment, brass, dark wood, black, emerald green
**Lighting:** Candlelight, furnace glow, single lamp, firelight
**Audio Bed:** Low continuous drone — slightly discordant, unsettling
**Environmental Details:** Page turning, glass clinking (alembics), fire crackling, footsteps on stone, distant bell
**Reverb:** Medium stone room — 1.8s decay
**Visual Motifs:** Seals, spirit jars, astrolabes, grimoires, circles, wands, crystal

---

### World 5: Buddhist Philosophy

**Gurus:** Nāgārjuna, Vasubandhu, Dōgen, Padmasambhava, Buddhaghosa

**Reusable Landscapes:**
```
FOREST_GROVE          →  Bamboo forest, dappled light, meditation path
EMPTY_HALL            →  Meditation hall, wooden floor, single incense
MOUNTAIN_TEMPLE       →  Temple on cliff, clouds below, mist
DESERT_SKY            →  Endless sky, no ground, no reference (śūnyatā)
BODH_TREE             →  Giant tree, roots spreading, golden leaves
LIBRARY_SCROLLS       →  Scroll library, shelves disappearing into dark
```

**Color Palette:** Earth tones, sky blue, cloud white, faded gold, bamboo green, shadow
**Lighting:** Dappled light through leaves, diffuse overcast, mist-filtered, dawn
**Audio Bed:** Low continuous — like a distant chanting, barely audible
**Environmental Details:** Wind through bamboo, birds, incense burning, footsteps on wood, distant bell, silence
**Reverb:** Large wooden hall — 2.0s decay
**Visual Motifs:** Bamboo, lotus, wheel, empty space, scrolls, infinite sky, candle in daylight

---

### World 6: Yoga Philosophy

**Gurus:** Patañjali, Vyāsa, Śaṅkara, Nātha yogis, modern yogis

**Reusable Landscapes:**
```
FOREST_ASHIAT        →  Forest ashram, huts, meditation platforms, dawn
RIVER_BANK           →  River at sunrise, sitting platforms, sand
MOUNTAIN_PEAK        →  Snow peak, single figure, vast space
CAVE_MEDITATION      →  Small cave, just enough room to sit, single shaft of light
GURUKULA_COURT       →  Traditional school courtyard, students sitting
BODILY_INTERNAL      →  Abstract subtle body — nāḍīs, cakras, prāṇa flowing
```

**Color Palette:** Saffron, white, earth brown, sky blue, gold, green (nature)
**Lighting:** Dawn, sunrise, diffuse forest light, single shaft from cave opening
**Audio Bed:** Continuous — like a harmonium held chord, soft
**Environmental Details:** Birds at dawn, river flowing, footsteps on earth, breathing, chanting in distance
**Reverb:** Open outdoor — 0.6s decay (natural)
**Visual Motifs:** Asanas, subtle body diagrams, sunrise, sitting figures, tree, river, staff (daṇḍa)

---

## The Seeker's Role in Each World

The Seeker enters each world the same way — from darkness into light — but their posture and position changes:

| World | Seeker's Position | Seeker's Role |
|-------|-------------------|---------------|
| Hindu Tantra | Sitting in lotus at bottom of frame | Student receiving |
| Sufi | Standing, looking up at moon | Wandering seeker |
| Greek/Neoplatonic | Walking through colonnade, hand on column | Philosopher questioning |
| Western Occult | Kneeling before a circle or altar | Initiate |
| Buddhist | Sitting in open space, empty-handed | Meditator releasing |
| Yoga | Standing in mountain pose, dawn behind | Practitioner embodying |

---

## LTX Prompt Template for The Seeker

```
[A small geometric humanoid figure, clay-textured warm beige, standing in 
vast darkness. Before them, [describe the concept visualization]. Slow camera 
orbit. Cinematic lighting from [direction]. 10s duration.]
```

---

## Part 3: Integration with Existing Pipeline

You already have everything in place:

```
ltx-style-lab/             ← Webapp for generating LTX clips
  web/                     ← Next.js frontend (projects, generations, storyboard)
  worker/                  ← FastAPI backend + LTX runner
    app/
      ltx_runner.py        ← Loads LTX-2.3, generates video+audio clips
      main.py              ← REST API at /render endpoint
      schemas.py           ← Request/response models
    Dockerfile             ← Ready for deployment

blog/                      ← Content pipeline
  scripts/
    particle_render.py     ← Particle animations (fallback for non-LTX scenes)
    assemble-video.mjs     ← Final video assembly from clips + voiceover
    generate-storyboard.mjs ← Creates storyboard from research objects
    build-beat-perfect.sh  ← Orchestrates full video builds
```

### Workflow

```
1. Research Object → generate-storyboard.mjs → storyboard JSON
2. Storyboard → extract prompt for each beat
3. Each beat prompt → ltx-style-lab webapp → LTX clip (10-20s)
4. LTX clips + voiceover → assemble-video.mjs → final video
```

### The ltx_runner API

The worker at `ltx-style-lab/worker/app/main.py` accepts:

```json
POST /render
{
  "prompt": "A stop-motion style geometric figure...",
  "negative_prompt": "...",
  "width": 1080,
  "height": 1920,
  "duration_sec": 10,
  "seed": 4242
}
```

Returns: path to generated MP4 with synchronized audio.

This is the interface our prompt library feeds into.

---

## Part 5: LTX Prompting Guide (Official + Community Insights)

### Official Prompt Structure (from LTX docs)

Write prompts as a **single flowing paragraph** covering:

```
1. ESTABLISH THE SHOT   → Cinematography terms, shot scale, genre
2. SET THE SCENE        → Lighting, color palette, textures, atmosphere
3. DESCRIBE THE ACTION  → Present tense, natural sequence
4. DEFINE CHARACTERS    → Visual cues only (no "sad" — show the face)
5. CAMERA MOVEMENT      → Dolly, pan, orbit, push, pull, static
6. DESCRIBE THE AUDIO   → Ambient sound, silence, speech in quotes
```

### The Audio Control Trick (critical)

The model generates audio. If you don't specify audio, it may insert distracting music. **Always describe audio explicitly:**

```
✓ "Quiet breathing, no music, ambient silence with subtle wind"
✓ "Soft meditation bell, distant, no background music"
✓ "Complete silence except for the narrator's voice"
✓ "Gentle ambient drone, low frequency, no percussion"
```

This prevents the model from auto-inserting music.

### What Works Well (from LTX docs)

| Category | What works |
|----------|------------|
| **Cinematic** | Wide/medium/close-up with thoughtful lighting, shallow DOF |
| **Emotive** | Strong single-subject, subtle gestures, facial nuance |
| **Atmosphere** | Fog, mist, golden-hour, rain, reflections, ambient textures |
| **Camera language** | "Slow dolly in", "handheld tracking", "static frame" |
| **Stylized** | Painterly, noir, analog film, stop-motion, claymation |

### What to Avoid

| Avoid | Why |
|-------|-----|
| "Sad" or "confused" | Use visual cues instead — "eyes downcast, brow furrowed" |
| Text and logos | Not reliable — don't put words on screen in LTX |
| Complex physics | Chaotic motion introduces artifacts |
| Overloaded scenes | Too many characters/actions reduces clarity |
| Conflicting lighting | Mixed light sources confuse the model |

### Camera Language Vocabulary

From the docs, these are the official camera terms that work:

```
Follows, Tracks, Pans across, Circles around, Tilts upward,
Pushes in, Pulls back, Overhead view, Handheld movement,
Over-the-shoulder, Wide establishing shot, Static frame
```

### Standardized Camera Angles for Ochema

Map these to the official terms:

```
OUR ANGLE_PUSH      → "Pushes in slowly on the subject"
OUR ANGLE_ORBIT     → "Circles around the subject"
OUR ANGLE_CRANE     → "Tilts upward, revealing the larger scene"
OUR ANGLE_ZOOMOUT   → "Pulls back from the detail to reveal context"
OUR ANGLE_PULL      → "Pulls back from abstract to reveal the figure"
OUR ANGLE_FIRST     → "Over-the-shoulder shot from the figure's perspective"
```

### Recommended LoRAs (from CivitAI)

| LoRA | Downloads | Use |
|------|-----------|-----|
| **Soft Enhance** | 15k | Natural detail, softer contrast, smooth finish |
| **Crisp Enhance** | 15k | Sharp cinematic, stronger edges, high-def |
| **Pixar CGI Toon Style** | 2.5k | Stylized 3D animation look |
| **Pose Helper (I2V)** | 5k | Better character pose consistency |

**Recommendation:** Start with NO LoRAs. Test the base model. If clips look too harsh, add Soft Enhance. If too soft, add Crisp Enhance. Balance both at different strengths for a custom look.

---

## Part 6: Concept-to-Visual Translation (The Core Challenge)

This is the actual art: translating an abstract Tantraloka concept into an LTX prompt that produces a reliable, explanatory, beautiful 10-second clip.

### The Translation Framework

```
CONCEPT → VISUAL ANALOGY → LTX PROMPT
```

Each concept needs:
1. A **visual analogy** that non-specialists can read
2. A **color language** that maps to the emotion
3. A **spatial relationship** (what moves, what stays still)
4. An **audio signature** (what sound accompanies it)

### Rasa — The Translation

**Concept:** Rasa is the transformation of worldly emotion into aesthetic bliss. Not the emotion itself, but emotion *experienced as beauty*.

**Visual analogy:** A watercolor bloom — a single point of color that expands outward, revealing layers within layers, until the viewer is surrounded by it. The Seeker stands within the bloom, no longer separate from the color.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured aesthetic, warm parchment tones, 
deep dark background with subtle golden particles floating upward.

[SUBJECT] A single point of deep crimson light at center frame. The color slowly 
blooms outward like watercolor on wet paper, revealing layers of emerald, 
saffron, and violet within the expanding sphere. A small warm beige geometric 
silhouette stands within the bloom, their form now suffused with the colors.

[MOTION] The bloom expands in slow waves, colors bleeding into each other. 
Tiny golden particles drift upward from the center. The figure does not move 
but their edges soften, merging with the surrounding color.

[CAMERA] Static frame, shallow depth of field, the bloom fills the frame slowly.

[AUDIO] Soft resonant hum, low drone, no music, quiet breathing.
```

### Spanda — The Translation

**Concept:** The divine vibration/pulsation that is the substrate of all experience. Consciousness as a throb.

**Visual analogy:** A single point of light pulsing in rhythm, sending concentric rings outward. The Seeker watches from the edge.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured figures, dark cosmic void with 
subtle warm fog, handcrafted aesthetic.

[SUBJECT] In a vast dark space, a single point of pulsing blue-white light at 
center. Concentric rings emanate outward in slow, rhythmic waves. The rings 
are semi-transparent, revealing geometric patterns within. A small warm beige 
geometric humanoid silhouette stands at the edge of the frame, watching.

[MOTION] The light pulses in a steady rhythm — expand, contract, expand. Each 
pulse sends a new ring outward. The silhouette's chest glows faintly in sync.

[CAMERA] Slow orbit around the pulsing center, 30mm equivalent.

[AUDIO] Deep resonant pulse, like a slow heartbeat in a vast chamber, silence 
between beats.
```

### Māyā — The Translation

**Concept:** The limitation/veil that contracts infinite consciousness into finite experience.

**Visual analogy:** Grey semi-transparent rings closing in around the Seeker, one by one. Each ring reduces the visible space.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured, desaturated warm tones, 
dimming light, the scene grows darker as rings close in.

[SUBJECT] A small warm beige geometric humanoid silhouette stands at center. 
From the edges of frame, semi-transparent grey concentric rings close inward, 
one by one. Each ring reduces the visible space. The figure's color dims 
slightly with each ring.

[MOTION] The rings contract in slow, deliberate increments. Each ring 
overlaps the previous, creating a layered cage. The figure remains still.

[CAMERA] Slow push-in as the rings contract, narrowing the field of view.

[AUDIO] Low creaking sound with each ring, like old wood settling, deep 
sub-bass rumble, silence.
```

### Pratyabhijñā — The Translation

**Concept:** Recognition — seeing that what you sought is what you always were.

**Visual analogy:** Seeker approaches a mirror. Their reflection transforms into something luminous and infinite. They merge.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured, warm golden light that 
intensifies, handcrafted aesthetic.

[SUBJECT] A small warm beige geometric humanoid silhouette stands before a 
tall mirror-like surface floating in darkness. Their reflection begins to 
transform — growing more luminous, larger, less defined. The reflection 
extends a hand toward the figure. At the moment of contact, both figure and 
reflection dissolve into identical golden light.

[MOTION] The reflection's transformation is slow and continuous. The moment 
of hand contact is a single frame of complete illumination.

[CAMERA] Slow pull-back as light fills the entire frame.

[AUDIO] A single deep bell tone that swells and fades into silence, no music.
```

### Śaktipāta — The Translation

**Concept:** Descent of grace — the energy of awakening entering from above.

**Visual analogy:** A stream of molten gold light descends from above, strikes the crown of the Seeker, and illuminates them from within.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured, warm metallic highlights, 
deep darkness above, growing light below.

[SUBJECT] A small warm beige geometric humanoid silhouette sits in meditation 
pose in darkness. From the top of frame, a stream of molten gold light descends 
in slow motion, striking the crown of their head. The light spreads through 
their form, illuminating them from within.

[MOTION] The light descends slowly, with small particles trailing. As it enters 
the figure, the illumination spreads like liquid through veins, from crown to 
extremities. The figure's color shifts from beige to warm gold.

[CAMERA] Slow push-in on the figure as the light enters them.

[AUDIO] High resonant chime at the moment of contact, then a deep sustained 
warm tone, no music.
```

### The 36 Tattvas — The Translation

**Concept:** The emanation of reality from pure consciousness down to physical matter — 36 categories as a single process.

**Visual analogy:** A luminous tetrahedral diagram floating in darkness, nodes lighting up in sequence from top to bottom, each sending a pulse downward.

**LTX Prompt:**
```
[STYLE] Stop-motion animation, clay-textured, geometric forms with warm 
gold and amber tones, depth of field blurring lower nodes.

[SUBJECT] A luminous tetrahedral diagram floats in darkness, made of warm 
gold clay-like lines. The diagram has 36 distinct nodes arranged in 
descending layers. Starting from the topmost node, each node lights up 
sequentially, sending a pulse of light to the node below it. The small warm 
beige geometric humanoid silhouette stands below the diagram, looking upward.

[MOTION] The illumination travels downward node by node, each pulse taking 
about a second. Already-lit nodes emit a gentle glow. The lowest nodes are 
in shadow, barely visible.

[CAMERA] Slow crane upward as the tattvas illuminate, following the light 
downward.

[AUDIO] Soft resonant tone each time a node lights up, the tone dropping 
in pitch as it travels downward, ambient silence between.
```

### Concept-to-Visual Library (Reference)

| Concept | Visual Analogy | Primary Color | Motion | Audio |
|---------|---------------|---------------|--------|-------|
| **Śiva** | Golden point of light at center | Gold/white | Still, radiating | Silence |
| **Śakti** | Crimson thread emerging from gold | Crimson | Spiraling upward | Rising tone |
| **Spanda** | Pulsing point with concentric rings | Blue-white | Rhythmic pulse | Heartbeat |
| **Tattva** | Illuminating nodes in descending order | Amber | Sequential lighting | Dropping tones |
| **Māyā** | Grey rings closing inward | Grey | Contraction | Creaking |
| **Kañcuka** | Colored sheaths slipping over form | Darkening | Wrapping | Muffling |
| **Rasa** | Watercolor bloom in expanding layers | Rainbow | Blooming | Warm drone |
| **Śaktipāta** | Molten gold light descending | Gold | Descending | Bell + tone |
| **Pratyabhijñā** | Mirror reflection merging | White-gold | Merging | Swelling bell |
| **Kuṇḍalinī** | Serpent of light rising in spiral | Crimson | Ascending spiral | Rising hum |
| **Nāda** | Concentric sound rings from center | Transparent | Expanding | Om resonance |
| **Bhairava** | Terrifying/compassionate face emerging | Purple-black | Slow reveal | Low growl |

---

## Part 7: Pipeline Decision Tree

```
For each beat in the script:

  Is it an ABSTRACT CONCEPT? (Spanda, Rasa, Śakti, Māyā)
    → LTX clip via ltx-style-lab (10-15s)
    → Use the concept-to-visual library above

  Is it a PRACTICE/GUIDANCE? (meditation instruction)
    → particle_render.py (ambient particle background)
    → Or LTX ambient scene with Seeker sitting

  Is it a DIAGRAM/DERIVATION? (tattvas unfolding)
    → LTX clip of the diagram (image-to-video from drawn diagram)

  Is it a HISTORICAL REFERENCE? (manuscript, yogi photo)
    → Archival art with slow zoom (assemble-video.mjs still mode)

  Is it a STORY/YOGI SPOTLIGHT? (narrative about a person)
    → LTX clip of a scene mixed with archival images
```

---

## Part 8: Aesthetic Consistency Framework

Maintain a consistent look across ALL videos without a LoRA (though a Style LoRA would help):

### Fixed Prompt Prefix

Every LTX prompt starts with:

```
Stop-motion animation, clay-textured, handcrafted aesthetic, warm parchment 
tones, subtle grain, shallow depth of field, [COLOR] color palette,
```

### Fixed Negative Prompt

```
photorealistic, smooth CG, 3D render, plastic, glossy, commercial, 
bright colors, cartoon, anime, digital art, sharp edges
```

### Consistent Audio Style

Every clip's audio follows:

```
Ambient [sound], no music, no percussion, quiet breathing, 
subtle [environmental] in background
```

### Frame Constraints

| Setting | Value |
|---------|-------|
| Resolution | 1080×1920 (portrait, YouTube Shorts) or 1920×1080 (landscape) |
| Duration | 10-15 seconds per clip |
| FPS | 24 |
| Seed | Record every working seed for reproducibility |

---

## Part 9: LTX Iteration Workflow

## Part 4: LTX 2.3 Workflow & Prompt Syntax

### What LTX 2.3 Does Well (Based on Community Knowledge)

| Capability | Best for | Our Use |
|------------|----------|---------|
| **Camera movement** | Establishing shots, reveals | Slow orbit, push-in on diagrams |
| **Stylized motion** | Abstract concepts, particles, waves | Spanda vibration, śakti flow |
| **Image-to-video** | Animating existing art | Breathing life into alchemical engravings |
| **Text-to-video** | Procedural scenes | The Seeker in environments |
| **Style transfer** | Consistent look across clips | All clips share texture/lighting |

### Camera Angle Vocabulary (Standardize These)

```
ANGLE_PUSH      →  Slow push-in on subject (for revelation moments)
ANGLE_ORBIT     →  Slow 30° orbit around subject (for complexity)
ANGLE_CRANE     →  Ascending from subject to reveal context (for cosmology)
ANGLE_ZOOMOUT   →  Slow zoom out revealing subject is part of larger pattern
ANGLE_PULL      →  Pull back from abstract to reveal The Seeker watching
ANGLE_FIRST     →  Subjective: as if looking through Seeker's eyes
```

### Prompt Architecture

Every LTX prompt has four slots:

```
STYLE + SUBJECT + MOTION + CAMERA
```

**Style:** `Clay-textured cinematic, warm parchment tones, volumetric lighting, shallow depth of field`

**Subject:** `A small beige geometric humanoid silhouette before a vast glowing golden mandala`

**Motion:** `The mandala's rings rotate slowly, particles of light drift upward from the center`

**Camera:** `Slow push-in, 30mm equivalent, slight Dutch angle`

### Shot Types for Concept Videos

| Shot Type | Duration | Content | Camera |
|-----------|----------|---------|--------|
| **Establishing** | 10s | Seeker in vast conceptual space | ANGLE_CRANE |
| **Revelation** | 10s | A concept appearing/manifesting | ANGLE_PUSH |
| **Derivation** | 10s | Diagram unfolding step by step | ANGLE_ZOOMOUT |
| **Contemplation** | 10s | Seeker witnessing the concept | ANGLE_ORBIT |
| **Dissolve** | 10s | Concept integrating into Seeker | ANGLE_PULL |

---

## Part 5: Depicting Abstract Concepts (LTX Prompt Library)

### Spanda (The Vibration)

```
[A vast dark space. At center, a pulsing blue-white point of light. 
Concentric ripples emanate outward in slow waves. The ripples are 
semi-transparent, revealing geometric patterns within. A small warm 
silhouette stands at the edge, watching. Cinematic lighting. Slow 
camera orbit around the pulsing center. Clay-textured ethereal style.]
```

### The 36 Tattvas (Derivation)

```
[A luminous tetrahedral diagram floating in darkness. Gold lines connect 
36 nodes in descending order. Starting from the top, each node lights up 
sequentially, sending a pulse downward to the next. The small warm 
silhouette stands below, looking up. Camera slowly cranes upward as the 
tattvas illuminate. Clay-textured cosmic style.]
```

### Māyā (The Limitation)

```
[The warm silhouette stands at center. From the edges of frame, 
semi-transparent grey concentric rings close in around them, one by one. 
Each ring reduces the visible space. The silhouette remains still but 
their color dims slightly. Camera slowly pushes in as rings contract. 
Clay-textured somber style.]
```

### Rasa (Aesthetic Bliss)

```
[A dark frame. At center, a single point of deep crimson. The color 
blooms outward slowly like a watercolor bloom, revealing layers of 
emerald, gold, and violet within. The Seeker's silhouette is now 
suffused with the colors, no longer separate from them. Camera gently 
pulls back as the color field expands. Clay-textured luminous style.]
```

### Śaktipāta (Descent of Grace)

```
[From the top of frame, a stream of molten gold light descends in slow 
motion. It strikes the crown of the Seeker's head and spreads through 
their form, illuminating them from within. The light continues down 
into the darkness below, rooting them. Camera slow push-in on the 
moment of contact. Clay-textured sacred style.]
```

### Pratyabhijñā (Recognition)

```
[The Seeker stands before a mirror-like surface. Their reflection 
begins to transform, becoming more luminous, larger, less defined. 
The reflection and the Seeker reach toward each other. At the moment 
of contact, both dissolve into identical golden light. Camera slow 
pull-back as light fills frame.]
```

---

## Part 5: Standardized Content Pipeline

### Step 1: Research Object → Hook + Title + Thumbnail

From the Research Object, the pipeline extracts:

```
UNIVERSAL_QUESTION: "Why can you observe everything except the observer?"
TITLE_ANGLE:        Pattern B (Esoteric Reveal)
TITLE:              "The 36 Tattvas — The Forgotten Architecture of Experience"
THUMBNAIL_ARGUMENT: A single tetrahedral form, gold on black, 
                    with text "36" — no face, just the diagram
HOOK:               "You can observe almost anything. Except the point 
                    from which observation happens."
```

### Step 2: Hook → Beat Script → Shot List

Each beat in the script maps to one or more visual shots:

```
BEAT 1 (Hook - 30s spoken):
  "You can observe almost anything. Except the point from which 
   observation happens."
  SHOT:        Empty field, camera slowly panning — nothing at center
  LTX PROMPT:  "A vast empty clay-textured space. Camera slowly pans 
                across empty terrain. At center, an absence, a space 
                where something should be. Warm parchment tones. 
                Cinematic lighting from above."

BEAT 2 (Question - 45s spoken):
  "The ancient Śaiva masters asked: what is this observing point?
   They called it Śiva. Not a god. Consciousness itself."
  SHOT:        The Seeker appears, looking at their own hand
  LTX PROMPT:  "A small warm beige geometric silhouette examines their 
                own hand, which glows faintly gold. Deep darkness 
                surrounds. Slow orbit around the figure. 
                Clay-textured contemplative style."

BEAT 3 (Derivation - 60s spoken):
  "From that pure consciousness, the first motion arises: Śakti.
   Not separate from Śiva, but the power of awareness itself."
  SHOT:        From the Seeker's heart, a crimson thread emerges
  LTX PROMPT:  "From the chest of a clay-textured silhouette, a single 
                thread of molten crimson light emerges, swirling upward. 
                The figure remains still, illuminated from within. 
                Slow camera pull-back."
```

### Step 3: Shot → LTX Parameters

Each shot is defined by:

```json
{
  "shot_id": "s01",
  "duration": 10,
  "type": "establishing",
  "style": "clay_textured_cinematic",
  "subject": "empty vast clay-textured space",
  "motion": "slow pan across empty terrain",
  "camera": "ANGLE_CRANE",
  "ltx_prompt": "A vast empty clay-textured space...",
  "seed": 4242,
  "iterations_until_good": null
}
```

### Step 4: Iterate → Log → Build Prompt Library

As we generate LTX clips, we log everything:

```
CLIP LOG
────────
date:       2026-07-19
concept:    36 tattvas derivation
prompt:     [full prompt]
seed:       4242
result:     SUCCESS — usable as-is
camera:     slow crane up
issue:      silhouette looked too defined, needed more abstraction
fix:        added "semi-transparent, barely outlined"
```

Over time, this becomes our prompt library — a curated set of working prompts organized by concept, camera angle, and visual effect.

---

## Part 6: The First 5 Visuals to Generate

These establish the visual language. Generate them before any full video:

1. **The Seeker** — standalone, in darkness, turning slowly
2. **Spanda pulse** — blue-white point with concentric ripples
3. **Tattva tetrahedron** — 36 nodes lighting in sequence
4. **Śakti emergence** — crimson thread from golden center
5. **Māyā contraction** — grey rings closing around Seeker

Once these work, all subsequent videos reuse them as B-roll or reference.

---

## Part 7: LTX Iteration Workflow

```
1. WRITE prompt (using template: STYLE + SUBJECT + MOTION + CAMERA)
        ↓
2. GENERATE in LTX (use same seed for reproducibility)
        ↓
3. EVALUATE: Does it match the mental image? 
   - YES → save to prompt library, add to video
   - NO  → tweak one parameter at a time
        ↓
4. LOG the working prompt with seed in CLIP_LOG
        ↓
5. ASSEMBLE: Sequence clips in editor, overlay spoken script
   Each beat = 1-3 LTX clips + possible still image overlay
```

---

## Part 8: Initial Prompt Library

To be filled as we generate:

```
CLIP LIBRARY
════════════

SEED: 1001  [Spanda Pulse]
          Prompt: "..."
          Camera: orbit
          Used in: #spanda-video

SEED: 1002  [Tattva Derivation]
          Prompt: "..."
          Camera: crane-up
          Used in: #36-tattvas

SEED: 1003  [Seeker Standalone]
          Prompt: "..."
          Camera: slow push
          Used in: ALL VIDEOS

... (fill as generated)
```

---

## Kastrup Transcripts

The three daimon videos found:

| Video | ID | Channel | Transcript |
|---|---|---|---|
| Getting what you actually want (how to follow your daimon) | `EWabmnZrvIM` | Bernardo Kastrup | Not available via API |
| Living With A Daimon | `cDjqRVTkpo0` | New Thinking Allowed | Not available via API |
| Fairies, Daimons & the Soul of the World | `STd-ph9ugdI` | Bernardo Kastrup | Not available via API |

To get these: download audio → run Whisper (local/free). ~2 hours total audio ≈ $0.72 via Whisper API or free if run locally.

---

## Research Status

| Source | Status |
|---|---|
| Hareesh blog | Scraped (149 posts, 21 categories) |
| Hermetic.com | No blog page exists — wiki-style reference library |
| Bernardo Kastrup blog | High quality, consciousness/idealism focus. Essays page only. |
| Kastrup YouTube transcripts | No captions available → needs Whisper |
| LTX 2.3 docs | Found at https://docs.ltx.io — quickstart, system reqs, inference guides |
