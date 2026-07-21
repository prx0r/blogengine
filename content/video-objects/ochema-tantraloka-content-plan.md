# Ochema — Tantraloka Content Plan

Channel identity: **Ochema** (ὄχημα — the vehicle of the soul).
Core focus: **Become THE English channel for Tantraloka / Kashmir Shaivism.**
Expand into: comparative metaphysics (Neoplatonism, Sufi, Yoga, alchemy) from the Tantraloka root.

---

## The Market Reality

| What exists | What doesn't |
|---|---|
| Hindi audiobooks of Tantraloka (Spiritual Spirit, 8k views) | English explanation of Tantraloka — **zero** |
| One-off "I tried Kashmir Shaivism" (Neo Dharmism, 69k) | Systematic, rigorous, repeatable English channel |
| Academic talks (Vimarsha Foundation) | Accessible + authoritative + visual |
| Osho's take on VBT (shorts/clips) | Actual VBT practice guided meditations |
| Igor Kufayev (36 tattvas, 40k) | His own channel, not competing |

**The window is open. No one has walked through it.**

---

## Content Pillars

### Pillar 1: Tantraloka Fundamental Concepts (high-level, accessible)

Single videos explaining broad Tantraloka concepts. Each stands alone. No series dependency.

| # | Title | Concept | Est. Length |
|---|---|---|---|
| 1 | **The 36 Tattvas — The Architecture of Experience** | The complete emanation map: Śiva → Earth. How infinite consciousness becomes a limited person. | 20-25 min |
| 2 | **What Is Spanda? The Cosmic Pulse** | The vibration/ throb that is the substrate of all experience. Spanda Kārikās in plain English. | 15-20 min |
| 3 | **Rasa — The Aesthetic Taste of Reality** | Abhinavagupta's theory of aesthetic emotion as the closest analogy to non-dual experience. Rasa = the taste of the divine. | 15-20 min |
| 4 | **Pratyabhijñā — The Recognition Philosophy** | You are not trying to become Śiva. You are recognizing you already are. The core argument. | 18-22 min |
| 5 | **The Three Upāyas — Three Paths to Liberation** | Āṇava (individual means), Śākta (energetic means), Śāmbhava (divine means). How Tantraloka classifies all spiritual paths. | 20-25 min |
| 6 | **What Is a Tattva?** | The 36 categories explained not as a list but as a derivation. Śiva → Śakti → Sadāśiva → Īśvara → Śuddhavidyā → māyā → 5 kañcukas → 24 prakṛti tattvas. | 20-25 min |
| 7 | **The Five Kañcukas — Why You're Limited** | The five sheaths of limitation that contract infinite consciousness into a finite self: kalā, vidyā, rāga, kāla, niyati. | 15-20 min |
| 8 | **Abhāsa — The Appearance Doctrine** | Why the world is real as appearance, not real as separate substance. The middle path between illusionism and naive realism. | 15-20 min |

These 8 videos define the channel. Each is a high-production, authored, permanent reference.

---

### Pillar 2: Vijñāna Bhairava — Guided Meditation Series

The Vijñāna Bhairava Tantra contains 112 dhāraṇās (meditation techniques). Each can be a short guided meditation video.

**Format:** 5-8 minutes. Simple visual (text + ambient/tantric imagery). Guided voice. The practice itself is the content.

**Not 112 separate videos.** Group them into thematic clusters:

| Cluster | Dhāraṇās | Videos | Title |
|---|---|---|---|
| Breath | 1-15, 24-30 | 3 | Breathing the Bhairava |
| Sense doors | 31-50 | 3 | Entering Through the Senses |
| Body awareness | 51-70 | 3 | The Body as Temple |
| Mind & thought | 71-90 | 3 | Dissolving the Mind |
| Advanced | 91-112 | 2 | The Final Seals |

**= 14 guided meditation videos** that can also be compiled into a single 60-min "Complete VBT Practice" compilation.

**Art needed:** Each video needs a visual — yantra, abstract forms, subtle body diagrams. Our art engine can source these.

---

### Pillar 3: Yogi Spotlight (cross-pillar)

Unknown yogis from the Śaiva/Tantra tradition. Connects the philosophy to living human stories.

| Planned entries |
|---|
| Khapaḍa Bābā — the surgeon-hermit who taught VBT |
| Matsyendranāth — the man who learned yoga in a fish |
| Vidyāraṇya Svāmī — "the greatest tantric of the 20th century" |
| Lalleshwari (Lallā) — 14th c. Kashmiri Śaiva poetess |
| Nāgendranāth — next research target |
| Kṣiprānāth — the Haṭha Yoga mahāsiddha |

---

### Pillar 4: Comparative (expansion)

After Tantraloka foundation is laid, bridge to other traditions:
- Tantraloka × Neoplatonism (Proclus emanation vs 36 tattvas)
- Tantraloka × Sufi (wahdat al-wujud vs advaita)
- Tantraloka × Goethe (metamorphosis vs spanda)
- Tantraloka × Levin (basal cognition vs prāṇa)

---

## Art Sourcing Strategy

### Phase 1: Museum API pulls (today)

Edit `scripts/fetch-art.mjs` — add these query seeds:

```
tantraloka: [
  "Shiva", "Shakti", "Kali", "Parvati",
  "tantra", "tantric", "yantra", "mandala",
  "sri chakra", "kundalini", "nataraja",
  "Indian miniature", "Pahari painting",
  "Kashmir manuscript", "Hindu deity",
  "sadhana", "yogini", "bhairava",
]
```

The APIs will find: Pahari paintings of Śiva, Chola bronzes (Nataraja), Rajput miniatures, Kashmiri manuscripts, Wellcome Collection tantric drawings, Met Museum Indian sculpture.

### Phase 2: Wikimedia Commons deep pull

Wikimedia has the largest collection of freely-licensed tantric imagery:
- IAST/ISO transliteration names for better results
- Śiva, Pārvatī, Kālī, Bhairava, Gaṇeśa
- Yantra diagrams, maṇḍala paintings
- Tantric manuscript folios (Nepal, Kashmir)

### Phase 3: Specialized sources

- **Wellcome Collection** — strongest for tantric medical/yogic diagrams
- **British Library** — Indian manuscript collections
- **Los Angeles County Museum (LACMA)** — South Asian sculpture
- **Philadelphia Museum** — tantric art collection
- **Nepal Museum** / **Patna Museum** — if they have open access

### Phase 4: Custom creation (future)

For abstract concepts (spanda, tattva derivation, kañcuka sheaths), we may need:
- Commissioned diagrams
- Procedural animation (particle_render.py can be extended)
- AI-generated concept art as placeholder/reference

---

## First 90 Days — Tantraloka Launch

### Month 1: Foundation

| Week | Video | Type |
|---|---|---|
| 1 | **The 36 Tattvas — The Architecture of Experience** | Concept (canon) |
| 2 | **Yogi Spotlight: Matsyendranāth** | Yogi (field/canon hybrid) |
| 3 | **What Is Spanda?** | Concept (canon) |
| 4 | **Guided VBT — Breath Cluster 1** | Practice (short) |

### Month 2: Depth

| Week | Video | Type |
|---|---|---|
| 5 | **Rasa — The Aesthetic Taste of Reality** | Concept (canon) |
| 6 | **Yogi Spotlight: Khapaḍa Bābā** | Yogi |
| 7 | **The Three Upāyas** | Concept (canon) |
| 8 | **Guided VBT — Sense Doors Cluster** | Practice (short) |

### Month 3: System

| Week | Video | Type |
|---|---|---|
| 9 | **Pratyabhijñā — Recognition** | Concept (canon) |
| 10 | **Guided VBT — Body Awareness Cluster** | Practice (short) |
| 11 | **The Five Kañcukas** | Concept (canon) |
| 12 | **Abhāsa — The Appearance Doctrine** | Concept (canon) |

After 90 days: 12 videos. Foundation laid. Analytics data flowing. Next commission informed by actual performance.

---

## The 36 Tattvas — Delivery Decision

**Recommendation:** One video, 20-25 minutes.

- Don't split into a series — people won't watch the rest
- Don't try to cover all 36 in detail — that's a reference, not a video
- Structure: start with Śiva, derive downward through the 5 pure tattvas → māyā → kañcukas → 24 impure → earth
- Visual: procedural derivation animation — each tattva unfolds from the previous
- The "list" problem: frame it as a **process**, not a catalog

**Follow-up options (if 36 tattvas video performs):**
- "Why Are There 36 Tattvas and Not 24 or 96?" (comparative)
- "The Kañcukas Deep Dive" (single kañcuka video)
- "Māyā — What It Actually Means in Kashmir Shaivism" (the most misunderstood term)

---

## Art Engine — Next Steps

To pull Tantraloka images now:

```bash
# Add tantraloka query seeds to fetch-art.mjs, then:
node scripts/fetch-art.mjs --test "Kashmir Shaivism"
node scripts/fetch-art.mjs --test "Shiva Pahari painting"
node scripts/fetch-art.mjs --test "yantra mandala"

# Import found art:
node scripts/import-art.mjs

# Rebuild glossary:
node scripts/generate-graph-json.mjs
```

Then we can classify and theme the art the same way alchemy is done.

---

## Summary

| What | When | Why |
|---|---|---|
| 8 concept videos | First 90 days | Defines the channel |
| 14 guided VBT meditations | Ongoing | Short, high-retention, practice-based |
| Yogi Spotlight entries | Monthly | Human connection + untold stories |
| Comparative videos | Post-90 days | Grows the audience beyond Tantra |
| Art sourcing | Immediate | Feeds visual identity for all videos |
