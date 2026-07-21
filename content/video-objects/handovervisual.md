# Ochema Visual Pipeline — Session Handover

## Current State

**Everything needed to produce videos without LTX is ready right now:**
- 19 full video outlines with hooks and segment breakdowns → `all-video-outlines.md`
- Hareesh blog posts (149 posts) as script source material → `research/hareesh-blog/by-topic/`
- 1,500+ museum images for still backgrounds → `seed-images/*/museum-results.json` + `browse.html`
- Assembly pipeline → `scripts/assemble-video.mjs --mode still` (existing, zero LTX needed)
- 184 LTX clip prompts for when rendering is available → `prompts-catalog.json` + `prompts-catalog.html`

**Strategy: Script + audio first, LTX visuals second.**
1. Script a video from the outlines + Hareesh blog source (free)
2. Record narration + ambient audio ($20-40 for TTS or mic)
3. Assemble with still museum images using existing assemble-video.mjs
4. Publish and validate the content
5. Only then invest $30-60 in LTX clip generation for videos that already perform

The content is the product. LTX is the polish layer, not the foundation.

---

## Decisions Made This Session

### Visual Style
- **Single unified world** — stop-motion clay-texture, warm parchment tones, geometric, dark backgrounds
- **Not 6 different worlds** — same aesthetic for Kashmir, Sufi, Neoplatonic, Hermetic, Buddhist, Yoga. The *concepts* differ, the *look* is consistent
- **Reference aesthetic:** Guillermo del Toro, Fantastic Mr. Fox, Coraline — warm, tactile, slightly imperfect

### Narrative Framework
- **The Seeker** — a small geometric clay figure who appears in every video as the viewer's avatar
- **No visible mouth movement** — gurus are shown as silhouettes, from behind, or as presences. The Seeker is the reaction shot
- **Quote typography** — key primary source quotes appear as text overlays while narrator speaks

### Audio
- **No LTX audio** — every prompt ends with "silence, no audio, complete quiet"
- **Narrator + guru voices recorded separately** and mixed in post
- **Ambient beds per tradition** — no music, just environmental tones

### LTX Workflow
- **Image-to-Video is the workhorse** — give LTX a seed image as first frame, describe motion. Much more reliable than text-to-video
- **Text-to-Video only for pure abstractions** (spanda pulse, tattva diagram, rasa bloom)
- **Fixed style prefix** for all prompts: `Stop-motion animation, clay-textured, handcrafted aesthetic, warm parchment tones...`
- **Fixed negative prompt** for all clips

### Content Structure
- **20-min video = ~12 segments, 6-9 LTX clips, 8-12 still art segments**
- **Universal visual vocabulary** — 15 core visual operations (emanation, contraction, expansion, pulse, etc.) that map across all traditions
- **80 reusable concept visuals** — stored by visual ID (V1, V2), not by tradition, so one clip serves multiple videos

---

## Key Files Created

| File | Purpose |
|------|---------|
| `videoltxbuild.md` | Complete visual language — narrative framework, 6 worlds, color language, Seeker, prompting guide, official LTX docs findings |
| `gpu-production-queue.md` | 44 ready-to-paste prompts in batch order for generating on the GPU pod |
| `20-minute-formula.md` | Standardized formula: beat template, clip ratio, segment structure, production math |
| `concept-explainers.md` | 16 concept-specific LTX prompts across 6 worlds, each specifying I2V vs T2V, seed image, what it teaches |
| `visual-vocabulary.md` | Universal visual alphabet — 15 core operations, 80 concept visuals, cross-tradition mapping table |
| `variant-generation-sheet.md` | Generation sheet with 3 variants per visual operation, seed/rating columns, ready for GPU batch. Also: 6 priority concepts to script first |
| `handovervisual.md` | This file |

### Seed Images (text-based references, not downloaded)

| World | Location | Contents |
|-------|----------|----------|
| Kashmir | `seed-images/kashmir/README.md` | 66 curated links (Met, Cleveland, LACMA, Wikimedia) |
| Sufi | `seed-images/sufi/browse.html` + `museum-results.json` | 194 Wikimedia images |
| Neoplatonic | `seed-images/neoplatonic/browse.html` | 217 images (filter out lunar craters) |
| Hermetic | `seed-images/hermetic/browse.html` | 25 images |
| Buddhist | `seed-images/buddhist_philosophy/browse.html` | 223 images |
| Yoga | `seed-images/yoga_philosophy/browse.html` | 225 images |

### Content Research

| Source | Location | Contents |
|--------|----------|----------|
| Hareesh blog | `content/research/hareesh-blog/by-topic/` | 149 posts across 21 topics — primary script reference |
| Rasa reference | `by-topic/rasa/rasa.html` | Full 6,600-word post → script template |
| Market strategy | `ochema-tantraloka-content-plan.md` | 8 concept videos, 90-day release plan |
| Market evidence | `market-landscape.json` | 180 videos, 53 breakouts analyzed |

---

## What To Do When GPU Pod Is Ready

### Batch 1: Validate Aesthetic (highest priority)
Generate from `variant-generation-sheet.md`:
1. V4A (pulse) — tests abstract concept quality
2. V1A (emanation) — tests light/color quality
3. V2A (contraction) — tests motion quality
4. V15A (breath) — tests form quality

Report Y/T/N on each. This tells us if the prompt structure works at all.

### Batch 2: The Seeker
Generate from `gpu-production-queue.md`:
1. SEEK_STAND
2. SEEK_SIT
3. SEEK_DISSOLVE

Test if character consistency works. If not, the Seeker becomes a post-production overlay (SVG composited onto backgrounds).

### Batch 3: Core Concepts
From `variant-generation-sheet.md`, generate all variants of V1-V15. Log seeds. Report Y/T/N per variant.

### Batch 4: First Video Script
Script topic: **Mundus Imaginalis** (Henry Corbin) — suggested as first video because:
- Zero English competition (one video with 3.2k views)
- Corbin ROs are mature
- Uses V10 (veil) + V14 (threshold) + V9 (bloom) — all from the variant sheet

---

## Scripts That Need Writing (for first 6 videos)

These are the priority concepts from `variant-generation-sheet.md`. Each needs a loose script.

| Priority | Topic | Source Material | Visuals |
|----------|-------|----------------|---------|
| 1 | **Mundus Imaginalis** | Hareesh: corbin-imaginal expanded | V10, V14, V9 |
| 2 | **The Daimon** | Hareesh: daimon-platonist, daimon-guidance | V11, V14, V13 |
| 3 | **The Witness** | Hareesh: recognition sutras | V13, V4, V7 |
| 4 | **Angels & Intellect** | Hareesh: corbin-imaginal + suhrawardi | V1, V13, V11 |
| 5 | **Rasa** | Hareesh: rasa (full blog post) | V9, V7 |
| 6 | **36 Tattvas** | Hareesh: tantraloka posts | V1, V12, V2 |

---

## 135-Clip Library — Categorized

### Thematic Categories (with clip IDs)

| Theme | Clips | Count |
|-------|-------|-------|
| **Establishing / Atmosphere** | K1-4, S1-3, N1-2, H1-2, B1-2, Y1-2, AT1-7 | 19 |
| **The Seeker (character)** | S1-S7 | 7 |
| **Abstract Concepts** | AC1-AC15 | 15 |
| **Yogi / Narrative Stories** | YS1-YS10, HF1-HF4 | 14 |
| **Tantraloka (deep)** | GC1-GC20 | 20 |
| **Transformative / Reveal** | TR1-TR20, HT1-HT20, UT11-UT12, UT15-UT16 | 44 |
| **Dreams & Sleep** | UT1-UT4 | 4 |
| **Karma & Causality** | UT5-UT6 | 2 |
| **Freedom & Liberation** | UT7-UT8 | 2 |
| **Stars & Angels** | UT9-UT10 | 2 |
| **Koshas / Subtle Body** | UT11-UT12 | 2 |
| **Presence / Immanence** | UT13-UT14 | 2 |
| **Metamorphosis** | UT15-UT16 | 2 |
| **Perception & Reality** | UT17-UT18 | 2 |
| **Connection & Unity** | UT19-UT20 | 2 |
| **Total** | | **184** |

## Formal Prompt Pipeline

The workflow is now a closed loop:

```
prompts-catalog.json (184 seed prompts)
    ↓
batch-submit.sh → Worker API → LTX renders MP4
    ↓
review.html (user rates Y/T/N + notes)
    ↓
feedback-log.json (accumulated ratings)
    ↓
analyze-feedback.py (pattern report after 20+)
    ↓
Refine prompts → bump version → repeat
```

**Key files:**
- `prompts-catalog.json` — 184 prompts machine-readable
- `prompts-catalog.html` — browse, search, copy prompts
- `review.html` — rate clips Y/T/N with notes
- `scripts/analyze-feedback.py` — pattern analysis after 20+ ratings
- `scripts/batch-submit.sh` — submit batches to worker

**Minimal viable loop:** Generate 5 → Review 5 → Repeat 4x → Analyze patterns → Fix worst prompts → Generate v02 → Review → Done.

### New in Section XI (DL1-DL25):
- **Death & dying** (7 clips): Five elements dissolving (Tibetan bardo), peaceful & wrathful deities, three bardos, Egyptian weighing of the heart, Steiner's Kamaloca, Tantraloka death as offering, deities as own thoughts
- **Daimon / Higher Self** (5 clips): Daimon as next-higher you, daimon in the heart speaking in silence, Synesius dream impressions, daimon as future self, angel as star's self-awareness
- **Light condensing into form** (7 clips): First condensation, light crystalizing into each of the 6 worlds (Kashmir, Sufi, Neoplatonic, Hermetic, Buddhist, Yoga)
- **Sanskrit mantra** (5 clips): OM vibrating the universe, AHAṀ root mantra, 50 phonemes as alphabet of creation, bīja mantra creating worlds, mantra becoming deity
- **Dream messages** (1 clip): Dream as letter from higher self

### Section XII — World B-Roll & Shadowed Gurus (BR1-BR24)
- **Environmental B-roll** per world (14 clips): Kashmir mist, manuscript room, Sufi garden, Sufi manuscript, Neoplatonic academy, Neoplatonic library, Hermetic lab, Hermetic tower, Tibetan monastery, meditation hall, prayer flags, thangka unrolling, Indian forest, and Himalayan sunrise
- **Shadowed guru** per tradition (6 clips): Kashmir Shaiva teacher, Sufi mystic, Neoplatonic philosopher, Hermetic adept, Buddhist teacher (Indian/Tibetan), Yoga teacher under tree — each shows a seated figure whose face is never visible, making them reusable for ANY specific guru in that tradition
- **Generic cross-world** (4 clips): Temple corridor, open book, single candle, and the source light
- **Buddhist world now includes Tibetan themes**: Snow monastery, prayer flags, thangka, butter lamps

## Complete Storyboard Library (19 videos, 5,057 lines)

All 19 videos have full production-ready storyboards with 12 segments each, including visual IDs, narration, clip usage summaries, and sound effect tables:

| Pillar | Videos | Files |
|--------|--------|-------|
| **Fundamentals** (8) | Rasa, 36 Tattvas, Spanda, Pratyabhijñā, 3 Upāyas, Māyā, Kuṇḍalinī, Śaktipāta | `storyboard-{rasa,36-tattvas,spanda,pratyabhijna,three-upayas,maya,kundalini,shaktipata}.md` |
| **Deep Dives** (4) | Abhinavagupta (life + work), Trika, 50 Phonemes, 12 Kālīs | `storyboard-{abhinavagupta,abhinavagupta-life,trika,phonemes,twelve-kalis}.md` |
| **Comparative** (3) | × Neoplatonism, × Sufi, × Daimon | `storyboard-{neoplatonism,sufi,daimon}.md` |
| **Yogi Spotlights** (4) | Lakṣmaṇjū, Lalleshwari, Yoginīs | `storyboard-{lakshmanjoo,lalla,yoginis}.md` |

Total: **19 storyboards, 5,057 lines, ~228 segments, ~330 minutes of content.**

Each storyboard: 12 segments with timing, visual IDs (LTX clip # + still art or museum image descriptions), full narration arcs, key quotes from primary sources, clip usage summary table, sound effects table, and LTX generation priority. Ready to produce in any order — pick a storyboard, record the narration, gather the still art, and assemble.

## Writing Quality Review

`content/video-objects/writing-quality-review.md` — full 310-line review against gold standards.

**Key findings & fixes applied:**
- **12 storyboards had weak hooks** — Rasa, Abhinavagupta, Neoplatonism, Sufi, Daimon, Trika, Lakshmanjoo, Lalla, Phonemes, 12 Kalis, Abhinavagupta Life, Shaktipata — all opened in third-person lecture mode
- **Fix applied:** Every one now addresses "you" in the first 2 sentences and opens with a question/paradox/mystery
- **Rasa closing strengthened** — now explicitly echoes the opening hook ("We began with a secret...") — circular closure
- **Sentence density is fine** — avg 12 words/sentence across all 19 storyboards with only ~2% over 30 words
- **Strongest written:** Spanda, 36 Tattvas, Kundalini (conversational, personal, concrete)
- **Needs ongoing attention:** repetition of key phrases (Ibn Arabi repeats "secret" 7x — we explain once and move on), primary source quotes in comparative/yogi spotlight videos

### Gaps Still Open (minor — 184 clips is sufficient for launch)
- **Compassion / empathy** — no clip about seeing another as yourself
- **Divine feminine standalone** — covered in goddess triads and Kālīs but no single "mother" image
- **Sacred architecture / temple as body** — the temple as a human form

---

## Next Steps

### GPU Pod Generation Order (when ready)

1. **Validate**: Generate AC6 (Spanda pulse), K2 (Mountain temple), S1 (Seeker stand) — 3 clips
2. **Core concepts**: Generate AC1-AC15 priority batch
3. **Character**: Generate S1-S7
4. **World**: Generate K1-4, Y1-2 (Kashmir + Yoga first — Tantraloka priority)
5. **Deep Tantraloka**: Generate GC1-GC20
6. **Transformative**: Generate TR1-TR20 (these are the viewer favorites)
7. **Hellenistic**: Generate HT1-HT20 (for later comparative videos)
8. **Universal**: Generate UT1-UT20
9. **Yogi stories**: Generate YS1-YS10 (as needed for specific scripts)

### Storage & Feedback Pipeline

```
1. GENERATE clip in LTX → saves as .mp4
2. UPLOAD to Cloudflare R2 bucket (atlas-sources) → public URL
3. LOG prompt + seed + clip URL in CLIP_LIBRARY (markdown table)
4. REVIEW: user watches clip, rates Y/T/N, notes what went wrong
5. ITERATE: adjust prompt, regenerate, update log
```

**File naming:**
```
TR1_MASK_REVEAL_v01.mp4
TR1_MASK_REVEAL_v02.mp4
```

**CLIP_LIBRARY format:**
```markdown
| ID | Version | Prompt Summary | Seed | URL | Rating | Notes |
|----|---------|---------------|------|-----|--------|-------|
| AC6 | v01 | Spanda pulse, blue-white point | 4242 | r2.url | Y | Good |
| AC6 | v02 | Spanda pulse, gold point | 4243 | r2.url | T | Too fast |
```

The `scripts/assemble-video.mjs` already supports uploading to Cloudflare R2 (`atlas-sources` bucket). That's the storage layer. The user can review via the public URL and report back.

A simple feedback form could be: watch the URL, reply with "ID: Y/T/N + notes." The log gets updated, the prompt gets adjusted, and we regenerate with a new seed.

---

## Known Issues

- **Neoplatonic seed images include Proclus moon craters** — about 50 of the 217 results are lunar crater maps. Filter by checking if title contains "crater"
- **Buddhist and Yoga script content** needs to come from Hareesh blog posts (we have the posts, just need to extract)
- **Kastrup daimon transcripts not available** — no captions on his YouTube videos. Would need Whisper processing (~$0.72)
- **GPU pod setup unknown** — prompts are ready for either ComfyUI, LTX-Desktop, or direct Python via the ltx-style-lab webapp

---

## The Pipeline (How It All Connects)

```
variant-generation-sheet.md  →  GPU pod generates clips  →  clip library
       ↓                                                        ↓
visual-vocabulary.md (V1-V15, 80 concepts)       ←    clips tagged by visual ID
       ↓
20-minute-formula.md (12-segment template)
       ↓
concept-explainers.md (which LTX prompt for which concept)
       ↓
Script from Hareesh blog + narrator recording + still art from seed images
       ↓
assemble-video.mjs (existing — handles still art + voiceover)
       ↓
Final video composited in editor (still art + LTX clips + Seeker overlay + quotes)
```
