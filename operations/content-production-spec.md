# Content Production Spec — Channel Architecture

## The Formula (All Channels)

```
Title: "Who was [Figure]? [Hook]" — biography format (+1.5x lift)
    or: "The [Secret/Bizarre/Unknown] [Aspect] Of [Topic]" — curiosity format
    or: "What/Why is [Topic]?" — question format (use after 100k subs)
Duration: 15-20 minutes
Thumbnail: Single striking image + 2-3 word text overlay
Format: Narrated documentary, sourced visuals, no faces unless relevant to topic
Output: 3-4 videos/month per channel
Avoid: Numbers in titles, generic practices (meditation/divination), uncategorized concepts
```

---

## Channel 1: Tantra Files

**Tagline:** Documenting the forgotten wisdom of Kashmir Shaivism
**Vibe:** Scholarly, warm, awe-inspiring

| Content Pillar | Example Titles | Data Signal |
|---------------|----------------|-------------|
| Forgotten Yogi Biographies | "Who was Abhinavagupta?" | Biography (+1.5x), Kashmir Shaivism (+1.2x), Figure (43%) |
| Text Deep-Dives | "The Secret Teachings of the Vijnana Bhairava Tantra" | Specific texts outperform general topics |
| Goddess/Deity Focus | "Tripura Sundari: The Secret Goddess of Kashmir Shaivism" | Devi (+1.2x), Sri Vidya (+1.9x) |
| Practice Explained | "Kundalini Awakening: What the Tantras Actually Say" | Kundalini (+2.1x) |
| Comparative Mysticism | "Why Kashmir Shaivism and Neoplatonism Agree on Everything" | Neoplatonism (+1.3x) |

**Does NOT cover:** Christian saints, western esotericism, grimoires, neuroscience
**Key source material:** 173 ROs on tantra, Kashmir Shaivism, Abhinavagupta
**First video:** "Who was Abhinavagupta? The Forgotten Genius of Kashmir Shaivism"

---

## Channel 2: Ochema

**Tagline:** The science and practice of occult technology
**Vibe:** Technical, sharp, precise

| Content Pillar | Example Titles | Data Signal |
|---------------|----------------|-------------|
| Grimoire Deep-Dives | "The Key of Solomon: A Complete Guide" | Key of Solomon (86%), Grimoires (+1.5x) |
| Practical Magic | "How Sigils Actually Work" | Sigils (+1.9x) |
| Occult Figures | "Who was John Dee? The Queen's Occultist" | Biography (+1.5x), Enochian (+1.8x) |
| Esoteric Science | "The Physics of Chaos Magic" | Chaos Magic (+2.4x) |
| Angelic/Theurgic | "The Celestial Hierarchy: Understanding Angelic Magic" | Angels (+1.8x), Theurgy (+1.5x) |

**Science bridge:** This is where the "Intelligent Others" content lives. Explaining why grimoires work through neuroscience, why sigils tap into the unconscious, the psychology of ritual. The science layer adds credibility and broadens audience.

**Does NOT cover:** Tantra, Christian mysticism, meditation
**Key source material:** Gap map data, competitor analysis, neuroscience datasets
**First video:** "The Key of Solomon: A Scientific Analysis of the World's Most Dangerous Book"

---

## Channel 3: (Name TBD — Contemplative / Angels)

**Tagline:** Exploring the imaginal realm through Christian mysticism and visionary art
**Vibe:** Dreamy, poetic, atmospheric

| Content Pillar | Example Titles | Data Signal |
|---------------|----------------|-------------|
| Angelic/Theurgic | "Who are the Angels? A History of Celestial Beings" | Angels (+1.8x) |
| Mystic Biographies | "Who was Meister Eckhart? The Heretic Mystic" | Biography (+1.5x) |
| Visionary Art & Poetry | "William Blake's Visionary Universe" | Biography (+1.5x), proven artist channel |
| Imaginal Realm | "Henry Corbin's Mundus Imaginalis" | Untested (first-mover risk) |
| Sufi Mysticism | "Rumi: The Poet of Divine Love" | Sufism (+1.7x) |

**Strategy:** Lead with angels and mystic biographies (proven), build audience, then introduce Corbin/Steiner/imaginal content once traction is established.

**Does NOT cover:** Western esoteric magic, tantra, science
**First video:** "Who was Pseudo-Dionysius? The Mystic Who Defined the Angels"

---

## Channel 4: Intelligent Others

**Tagline:** The frontier where science meets the unexplained
**Vibe:** Skeptical but open, evidence-driven, cinematic

| Content Pillar | Example Titles | Data Signal |
|---------------|----------------|-------------|
| Neuroscience of Mysticism | "What Happens to Your Brain During Meditation" | Science content, proven format |
| Paranormal Science | "The Science of Near-Death Experiences" | High-interest topic |
| Psychedelic Research | "How Psychedelics Unlock the Mystical Experience" | Growing mainstream interest |
| Weird Phenomena | "The Physics of Telepathy" | Curiosity-driven content |
| Consciousness Studies | "Is Consciousness Fundamental? The Science Says Maybe" | Academic + popular interest |

**Bridge function:** This channel can produce crossover videos that feed into Ochema ("The Neuroscience of Why Sigils Work") and Tantra Files ("What Brain Scans Reveal About Kundalini").

**First video:** "The Neuroscience of Mystical Experience"

---

## Content Pipeline (How ROs Feed Videos)

```
RO (173 research objects)
  → Extract figure, concept, or text
  → Apply title formula for the channel
  → Write 15-20 min script (biography or explanatory)
  → Create thumbnail: striking image + 2-3 words
  → Record voiceover
  → Source visuals (art library, public domain, AI-generated)
  → Edit and publish
  → Log actual views vs XGBoost prediction
  → Model improves over time
```

## Cross-Channel Crossover Strategy

- Videos that could work on multiple channels get a "spinoff" treatment for the other channel
- Example: "What Brain Scans Reveal About Kundalini" → Tantra Files + Intelligent Others crossover
- Example: "Theurgy in Neoplatonism" → Ochema + Tantra Files (neoplatonism bridge)

## Blacklist (Topics That Underperform)

| Avoid | Why |
|-------|-----|
| Meditation / Mindfulness | Saturated, 0.9x lift |
| Chakras alone | 0.4x lift |
| Plotinus (alone) | 0.4x lift |
| Generic spells/talismans | 0.5x lift |
| Christian mysticism (alone) | 0% breakout in dataset (untested format) |
| Astrological predictions | Low engagement |
