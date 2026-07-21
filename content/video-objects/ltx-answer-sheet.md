# LTX Reality Check & Tantraloka Series Plan

## 1. Will LTX Produce What Our Prompts Describe?

**Probably not perfectly — but close enough to work.**

Here's what LTX docs confirm it can do:
- **Stop-motion style**: Yes — they have example prompts showing felt birds in stop-motion
- **Clay texture**: Yes — "clay-textured" is a recognized style keyword
- **Camera movements**: Pushes in, pulls back, circles around, pans, tilts, static — all work
- **Atmospheric lighting**: Volumetric, single-source, dramatic shadows — yes
- **Geometric forms**: Yes, but simpler is better
- **Colour control**: Specify dominant colours in the prompt (warm parchment, gold, crimson)

What LTX struggles with (from docs):
- **Complex physics**: Chaotic motion introduces artifacts
- **Overloaded scenes**: Too many elements reduce clarity
- **Readable text**: Can't reliably render text on screen
- **Fine details**: Intricate patterns may blur

**Verdict on our 50 prompts:** They're in the right style and structure. The first 5-10 generations will tell us what LTX does well and what needs adjustment. Expect to iterate — that's normal.

## 2. What's the Output Style Like?

Looking at LTX's official examples and community results:

- **Resolution**: 1280×720 minimum, 1080p possible. Not 4K quality.
- **Motion**: Smooth at 24fps for slow camera moves. Faster motion gets jittery.
- **Colours**: Warm and saturated when asked. Dark scenes work well.
- **Texture**: Get clay-texture by putting it in the prompt — but it won't look like actual stop-motion. It will look like AI video *with clay-texture influence*.
- **The Seeker**: Simple geometric forms should work. Small figures in the frame work better than close-ups.

**Reality check:** This won't look like Coraline. It will look like AI video in a clay-texture style. That's fine — AfterSkool doesn't look like Studio Ghibli either. The consistency across clips is what builds the brand.

## 3. Can We Include Sound Effects Like Laughing?

**Yes.** LTX has a separate **Text-to-Audio workflow** that generates specific sounds from a text prompt:

> "A woman laughing warmly in the distance"
> "A single deep bell tone, resonant, fading"
> "Fire crackling softly, no other sounds"

Generate these separately, download as WAV, mix in post at the right moments. We already use this in the Rasa storyboard (laughter at SEG 3, bell tones at SEG 2/8/12, fire crackle at SEG 6/10).

## 4. Are 6 Seeker Clips Enough?

**Yes, because of compositing.** The Seeker clips are generated against a plain dark background. In post, we overlay them onto:

- World backgrounds (temple, garden, cave)
- Abstract concept backgrounds (emanating light, dissolving particles)
- Different positions in frame (left third, center, right third)
- Different scales (full height, distant, close-up)

6 poses × 3 positions × 2 scales = 36 variations from 6 clips. The key Seeker poses needed:
- S1 Standing (default, most common)
- S2 Sitting in meditation (second most common)
- S3 Looking upward (wonder, receiving)
- S4 Walking forward (journey)
- S5 Kneeling (reverence, initiation)
- S6 Dissolving (transformation, liberation)

**One addition:** Add S7 — Seeker reaching out (hand extended toward light). Useful for the mirror/recognition moments. That gives us 7.

## 5. GPU Pod Reality

**Start small, don't generate all 50 at once.**

Batch 1 (test):
- Generate 1 clip (AC6 Spanda pulse or AC1 Emanation — simplest concept)
- See what comes out
- Adjust prompt based on result

Batch 2 (validate):
- If batch 1 works: generate AC11 (Rasa bloom), K2 (Mountain temple), S1 (Seeker stand)
- If these 3 work, the style is validated

Batch 3 (scale):
- Generate the rest in priority order from the Rasa storyboard

---

## Tantraloka Series — Full Outline

### Pillar 1: Fundamental Concepts (8 videos)

The core concepts. Each stands alone. Each is 15-20 min.

| # | Video | Source Material | Key LTX Clips |
|---|-------|----------------|---------------|
| 1 | **Rasa — The Transformation of Emotion into Beauty** | Hareesh rasa blog (6,600 words) | AC11, AC5, AC12, K2, S3, AT2 |
| 2 | **The 36 Tattvas — The Architecture of Experience** | Hareesh tantraloka posts + Igor Kufayev transcript | AC3, AC4, AC5, AT7, K1, S1 |
| 3 | **Spanda — The Divine Vibration** | Hareesh spanda karika posts (3 parts) | AC6, AC1, AC2, AT4, S2, AT5 |
| 4 | **Pratyabhijñā — The Recognition Philosophy** | Hareesh recognition sutras posts (9 parts) | AC9, AC5, AC13, AC15, S3, S6 |
| 5 | **The Three Upāyas — Three Paths to Liberation** | Hareesh upayas/three ways to freedom post | AC14, AC15, AC1, AT7, YS3, S5 |
| 6 | **Māyā and the Five Kañcukas — Why You Feel Limited** | Hareesh tantraloka posts | AC4, AC10, AC12, K1, S2, AT1 |
| 7 | **Kuṇḍalinī — The Serpent Power** | Hareesh kundalini posts (3 parts) | AC8, AC6, AC2, AC14, Y2, S2 |
| 8 | **Śaktipāta — Grace and the Descent of Power** | Hareesh tantraloka + tantrasara posts | AC7, AC1, AC2, AC5, YS2, S5 |

### Pillar 2: The Subtle Body (3 videos)

| # | Video | Source Material |
|---|-------|----------------|
| 9 | **The Seven Cakras — What They Actually Mean** | Hareesh chakra posts |
| 10 | **Prāṇa, Nāḍī, and the Breath** | Hareesh + tanraloka breath posts |
| 11 | **The Three Bodies and the Witness** | Hareesh kosha post |

### Pillar 3: Deep Dives (5 videos)

| # | Video | Source Material |
|---|-------|----------------|
| 12 | **Abhinavagupta — The Man Who Synthesized Tantra** | Hareesh Abhinavagupta posts |
| 13 | **The Trika — Three Goddesses, One Reality** | Hareesh + tantraloka |
| 14 | **The Twelve Kālīs — Time as Goddess** | Hareesh twelve kalis post |
| 15 | **The 50 Phonemes — Sacred Sound and Creation** | Hareesh tantraloka sound posts |
| 16 | **Svacchanda Tantra — The Freedom of the Lord** | Hareesh + research objects |

### Pillar 4: Comparative (5 videos)

| # | Video | Connection |
|---|-------|-----------|
| 17 | **Kashmir Śaivism × Neoplatonism — Emanation Compared** | Proclus + Abhinavagupta |
| 18 | **Kashmir Śaivism × Sufi — Unity of Being** | Ibn Arabi + Abhinavagupta |
| 19 | **Kashmir Śaivism × Patañjali — Yoga Compared** | Yoga Sūtras + Tantra |
| 20 | **Kashmir Śaivism × Daimon — The Guide** | HGA + recognition |
| 21 | **Kashmir Śaivism × Alchemy — The Great Work** | Nigredo → Rubedo = Purification → Recognition |

### Pillar 5: Yogi Spotlights (5 videos)

| # | Video | Source Material |
|---|-------|----------------|
| 22 | **Lakṣmaṇjū — The Last Living Master** | Hareesh + Simplest State video |
| 23 | **Lalleshwari — The Poet of Kashmir** | Lalla ROs |
| 24 | **Abhinavagupta — A Day in the Life of a Tantric Master** | Hareesh + ROs |
| 25 | **Kṣemarāja — The Heart of Recognition** | Hareesh pratyabhijna posts |
| 26 | **The Yoginīs — Secrets of the Tantric Goddesses** | Hareesh + ROs |

### Count: 26 videos, fully sourced from Hareesh blog + 171 ROs.
