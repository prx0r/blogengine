# Astrological Engine — Additions & Restructuring Vision

> This document captures the architectural vision for transforming the astrology
> engine into a layered symbolic operating system, restructuring the site pages,
> and creating the Observatory — a beautiful, atmospheric home for the site.

---

## Part 1: The 10-Layer Architecture

### Core Principle

Everything should be a **layer**. Each tradition is an independently sourced
overlay that produces **typed symbolic objects**, never prose. Never merge
traditions. Never claim "these are your names" — only "texts associated with..."

```
Natal Chart
      │
      ├── Layer 1:  Hellenistic (foundation — deterministic)
      ├── Layer 2:  Egyptian (decans, time-decans, deities)
      ├── Layer 3:  Agrippa (Good Genius, Evil Genius, Hebrew)
      ├── Layer 4:  Picatrix (lunar mansions, talismans)
      ├── Layer 5:  Shem / Kabbalah (72 angels, paths, sephiroth)
      ├── Layer 6:  Fixed Stars (conjunctions, mythology)
      ├── Layer 7:  Orphic (hymns, Greek text, commentary)
      ├── Layer 8:  Olympic Spirits (planet → spirit → attributes)
      ├── Layer 9:  PGM (divine names, voces magicae, invocations)
      └── Layer 10: Practice (recommendations, timing, elections)
```

### Universal Object Schema

Every symbolic correspondence uses exactly this shape:

```json
{
  "id": "agrippa.good_genius",
  "tradition": "Agrippa",
  "entity": "Good Genius",
  "value": "לוצכאל",
  "method": "Occult Philosophy III.26",
  "source": {
    "book": "Three Books of Occult Philosophy",
    "chapter": 26,
    "edition": "Tyson"
  },
  "confidence": "historical_reconstruction",
  "notes": ""
}
```

This works for literally everything — decans, angels, hymns, metals, incenses,
planetary hours. Every datum carries provenance like a museum label.

### Layer Details

**Layer 1 — Hellenistic (already built)**
Keep deterministic. Output: Sect, Hyleg, Oikodespotes, Kurios, Master of
Nativity, Lots, Zodiacal Releasing, Annual Profections, Planetary phases/
conditions. Sources: Valens, Dorotheus, Ptolemy, Paulus, Rhetorius.

**Layer 2 — Egyptian (new)**
Decan calculations: rising decan, culminating decan, hourly decan at birth.
Each decan has deity, planetary ruler, Picatrix image, Hermetic interpretation,
Book of Nut reference. Ancient Egyptian astronomy used decans to divide the
night — time-of-birth overlays are particularly interesting.

**Layer 3 — Agrippa (already started)**
Good Genius, Evil Genius, Hebrew letters, divine suffix, full derivation,
every intermediate calculation. Store method separately — different
astrological systems (Whole Sign vs Placidus, Tropical vs Sidereal) yield
different names.

**Layer 4 — Picatrix (new)**
Given chart: Lunar mansion, mansion image, planetary intelligence, talisman
timing, incense, metal, colour, animal, suffumigation, planetary hour.
Don't generate advice — just expose structured data.

**Layer 5 — Shem / Kabbalah (new)**
72 Shem angel(s) by configurable method (GD / Kircher / Agrippa). Output:
Psalm, Hebrew, Sigil, Divine name, Sephirah, Hebrew paths, Tarot path.
Each method stored as a separate variant — never merged.

Reference: https://www.occult.live/index.php/Kabbalistic_angel

**Layer 6 — Fixed Stars (new)**
Every natal conjunction. Output from: mythology, Picatrix, Agrippa, Ptolemy,
Vivian Robson, modern astronomy data.

**Layer 7 — Orphic (new)**
Given dominant planet: return hymn, translation, Greek text, commentary.

**Layer 8 — Olympic Spirits (new)**
Planet → Spirit (Bethor, etc.) → Attributes → Source reference.

**Layer 9 — PGM (new)**
Divine names, voces magicae, planetary invocations, associated gods.
Never claim "these are your names" — only "texts associated with..."

**Layer 10 — Practice (new)**
Today's planet + hour + moon + election → recommend: Ficino hymn, incense,
colour, meditation, Corbin essay, Suhrawardī recital, Vijnāna Bhairava practice.

### Source Registry

Every datum carries:

```json
{
  "value": "...",
  "tradition": "...",
  "source": "...",
  "edition": "...",
  "location": "book/chapter/page",
  "confidence": "primary|scholarly|derived",
  "notes": ""
}
```

---

## Part 2: Current State Audit

### Pages (too many, overlapping, messy)

| Route | Purpose | Problem |
|-------|---------|---------|
| `/astrology` | Dynamic daily reading + interpretation | Duplicates `/birth-chart` logic. 923 lines. Messy. |
| `/birth-chart` | Natal chart + analysis + LLM passes | 2000+ lines. Has both static (chart) and dynamic (daily) content mixed. |
| `/daimon` | Devotional practice page | Static. No live astrology integration. Daimon name hardcoded. |
| `/` | Blog feed | Fine, but should be secondary. |
| `/art` | Art gallery | Static, works fine. |
| `/chat` | LLM chat | Works, but redundant with astrology page's chat. |
| `/journal` | Journal entries | Fine, standalone. |
| `/spells` | Spellbook | Static reference. |
| `/rituals/*` | Ritual references | Static. |
| `/meditation/*` | Meditation guides | Static. |
| `/books/*` | Book lists | Static. |
| `/elements/*` | Element descriptions | Static. |
| `/sources` | Source materials | Static, works fine. |
| `/atlas` | Atlas system | Unclear purpose, probably redundant. |
| `/settings` | User settings | Fine. |
| `/glossary` | Concept glossary | Fine. |
| `/tree-of-life` | Qabalah diagram | Static. |
| `/essays/[tradition]` | Tradition essays | Fine. |
| `/personal/[slug]` | Personal content | Unclear. |
| `/login`, `/audio`, `/books` | Various | Fine. |

**Key issues:**
- `/astrology` and `/birth-chart` have MASSIVE overlap (~70% shared computation logic)
- `/daimon` is static but should be dynamic and personalized
- Interpretations from the same Hellenistic school only — no Egyptian, Agrippa, Picatrix layers
- AI analysis has a 2-pass system but it barely works (API key required, fallback chain fragile)
- The "Generate Deep Analysis" button pattern is confusing
- No lunar mansion data, no angel names, no Egyptian decans
- Daimon name is computed on birth chart page but not surfaced on astrology page
- No cron job for daily dawn snapshot

### AI Analysis Audit

**Pass 1 (Advanced Forecasting — llm-synthesis.ts):**
- System prompt is good — has the Forecasting Stack, hierarchical filters, aspect grammar
- 3-endpoint fallback chain: worker URL → /api/chat → deterministic
- Problem: the `/api/chat` route is server-side only (Cloudflare Workers), fails silently on GitHub Pages
- The prompt references the full ActivationPacket which is rich data
- Actually produces decent output when the API key is set

**Pass 2 (Ficinian Depth — ficino-synthesis.ts):**
- The Descent method (Natal → Daimon → Year → Month → Day → Medicine) is excellent
- Three-Part Prescription (sensory, action, contemplation) is the right structure
- Practice recommendation parsing is smart
- But: it depends on Pass 1 output, so if Pass 1 fails, Pass 2 never runs
- No containment validation for Pass 2 (only Pass 1)

**Containment (containment.ts):**
- Only validates planets, houses, and rule IDs mentioned
- Doesn't validate daimon names, decans, or other non-Hellenistic entities
- Runs after LLM output but doesn't feed back into anything

**Root cause of "doesn't work":**
The `DEEPSEEK_API_KEY` must be set as a Cloudflare secret. Without it, both
passes silently fall back to deterministic output. The localStorage override
(`localStorage.setItem("deepseek_api_key", "sk-...")`) is undocumented.

---

## Part 3: Page Restructuring Plan

### New Page Architecture

```
/observatory     ← NEW: Main home. Dynamic atmospheric dashboard.
/birth-chart     ← KEEP: Static. Your fixed correspondences for life.
/astrology       ← DEPRECATE: Merge into /observatory + /birth-chart.
/daimon          ← REWRITE: Live daimon practice dashboard, linked to observatory.
```

### Birth Chart (Static — Your Life Correspondences)

This is your **fixed** chart. It doesn't change daily. Contains:

- Natal chart wheel (caelus render)
- Planetary positions, aspects, houses (table)
- **All 10 layers** computed at birth:
  - Hellenistic: sect, hyleg, oikodespotes, lots, profections
  - Egyptian: birth decans (rising/culminating/hourly)
  - Agrippa: Good Genius, Evil Genius, full derivation
  - Picatrix: lunar mansion at birth
  - Shem: 72 angels relevant to nativity
  - Fixed stars: conjunctions with mythology
  - Orphic: hymns for dominant planets
  - Olympic: spirits for planetary rulers
  - PGM: divine names associated with birth configuration
  - Practice: lifelong correspondences (metal, colour, incense, stone)
- Daimon page access (your daimon's full dossier)
- Export / share

This page is **computed once** and cached. It's your astrological identity card.

### Observatory (Dynamic — Today's Atmosphere)

This becomes the **main page of the site**. Everything revolves around it.

What it shows:
- **Atmospheric rendering**: the ActivationPacket visualized as colour, form,
  motion. The sky today rendered as an ambient scene. Each planet's influence
  is a visual element — colour washes, geometric forms, motion patterns.
- **Daimon name** at top-left (LVJK / לוצכל) — always present.
- **Highest signal activity**: the planet with strongest activation, shown with
  its correspondence imagery (icon, colour, metal, stone, incense).
- **Moon phase** prominently displayed.
- **Planetary hours** for today — when to practice.
- **Layer toggles**: click a tradition to see what IT says about today.
- **Correspondence icons**: clickable visual tokens for each active planet →
  opens detail with all layers' data for that planet.
- **Bottom chat bar**: sleek, minimal. Links into the knowledge graph.
  Traverse: "What does Ficino say about Mercury today?" →
  walks the graph and returns sourced answer.

### Daimon Page (Live — Your Practice Hub)

Rewritten as a dynamic practice dashboard:

- Daimon name from birth chart (not hardcoded)
- Today's daimon activation (from ActivationPacket)
- Planetary hours specific to daimon's nature (Mercury for LVJK)
- Practice timer / session tracker
- Dream journal (persisted)
- Practice log (persisted)
- Liber Samekh worksheet access
- Link to /observatory for full atmospheric context

---

## Part 4: The Observatory — Design Vision

### Aesthetic

Alchemical + Treasure Planet wooden/space aesthetic.

**Reference palette:**
- Deep space backgrounds with warm wooden/brass UI elements
- Gold, amber, deep teal, burgundy, brass
- Textures: parchment, wood grain, tarnished metal, celestial parchment
- Typography: serif for body, monospace for data, decorative for titles

**Atmosphere:**
The page should feel like the bridge of a celestial ship — an observatory
deck where the sky is rendered around you. Not abstract 3D for its own sake,
but **meaningful visualization** where every visual element corresponds to
an astrological datum.

### Visual Elements

**Background / Sky:**
- Dynamic based on time of day (dawn gold, noon white, dusk violet, midnight
  deep blue with stars)
- Moon phase rendered as actual moon in the sky
- Active planets as visible "stars" that pulse/glow proportionally to their
  activation score

**Correspondence Grid:**
- A circular or orbital layout showing active planets as nodes
- Each node = clickable card showing that planet's data
- Orbital rings = elemental layers (Air/Mercury ring, etc.)
- Clicking opens a detail panel with ALL layers for that planet:
  - Hellenistic condition
  - Egyptian decan ruler
  - Agrippa correspondences
  - Picatrix talisman data
  - Shem angel
  - Orphic hymn
  - PGM names
  - Practice recommendations

**Today's Pulse:**
- Dominant mode (Fortune/Spirit/Mixed) shown as a central glyph
- Confidence level as visual clarity (high = sharp, low = misty)
- Top 3 activations shown as floating cards

### Imagined Packages

| Need | Package | Why |
|------|---------|-----|
| 3D celestial rendering | **Three.js** with `@react-three/fiber` | Most mature. Can render stars, orbital rings, particle systems. |
| Orbital/constellation lines | **Three.js** + custom shaders | Draw aspect lines between planets as ethereal connections. |
| Ambient glow/bloom | **Postprocessing** (Three.js) | UnrealBloomPass for the atmospheric glow effect. |
| Particle stars | **Three.js** Points geometry | Background starfield that parallaxes on scroll. |
| Moon phase | Custom SVG + Three.js | Accurate moon phase rendered as 3D sphere with light. |
| Music / harmony | **Tone.js** | Kepler-style planetary harmonies. Each planet's orbital ratio
  maps to a frequency. The day's aspects create a chord. |
| UI | **Tailwind** (already using) | Keep. Supplement with custom wooden/brass component library. |
| Animations | **Framer Motion** | Page transitions, card reveals, orbital rotations. |
| Graph visualization | **Cytoscape.js** or **D3.js** | For the knowledge graph traversal in chat. |
| Sound design | **Web Audio API** | Subtle ambient tones per planet, intensity varies with
  activation. |

### The Ficinian Design Logic

> From Ficino's *Three Books on Life*: each planet has a colour, scent,
> music, metal, stone, and activity. The dashboard's atmosphere should
> be determined by the most active planet(s).

For example, if Mercury is dominant today:
- UI tint shifts toward yellow/gold (Mercury's colour)
- Background subtle shimmer (Mercury's quick, mercurial quality)
- Correspondences shown: Raphael, Agate, Cinnamon, The Magician tarot
- Suggested practice: writing, communication, teaching, Mercury hour ritual

If Saturn is dominant:
- UI tint shifts toward deep indigo/black
- Background slower, heavier feel
- Correspondences: Cassiel, Onyx, Myrrh, The World tarot
- Suggested practice: contemplation, structure, boundary-setting

---

## Part 5: Implementation Priorities

### Phase 1 — Fix What's Broken (Week 1)

1. **Fix AI analysis**: Set `DEEPSEEK_API_KEY` as Cloudflare secret. Test both
   passes end-to-end. Add containment validation to Pass 2. Document the
   localStorage override.
2. **Daimon name on astrology page**: Read from localStorage or profile, display
   alongside Oikodespotes.
3. **Remove redundant computation**: `/astrology` and `/birth-chart` share engine
   code. Extract shared logic into a hook or utility.

### Phase 2 — Layer Infrastructure (Week 2-3)

4. **Layer schema**: Implement the universal object schema. Create
   `src/astrology/layers/` directory.
5. **Source Registry**: Build the provenance tracking system.
6. **Egyptian Decans**: Compute rising/culminating/hourly decans from caelus.
   Map to deity, ruler, Picatrix image.
7. **Agrippa Genius**: Already started — complete with full derivation display.
8. **Shem Angels**: Integrate occult.live data for 72 angels.
9. **Picatrix Lunar Mansions**: Add 28 mansions with correspondences.

### Phase 3 — Observatory (Week 3-4)

10. **Restructure pages**: Create `/observatory`. Move dynamic content there.
    Strip `/astrology` down to essentials. Clean up routing.
11. **Atmospheric rendering**: Three.js scene with dynamic sky, active planets,
    orbital layout. Start simple — colour wash + particle system.
12. **Correspondence cards**: Clickable planet nodes that display all layers.
13. **Chat bar**: Sleek bottom bar that traverses the knowledge graph.
14. **Cron job**: Daily dawn snapshot that computes today's packet and sends
    a Telegram notification with the daimon name, top activation, and practice
    recommendation.

### Phase 4 — Refinement (Month 2)

15. **Kepler harmonies**: Tone.js or Web Audio synthesis of planetary aspects.
16. **Ficinian theming**: Dashboard UI tints based on dominant planet.
17. **Moon + stars**: Accurate celestial rendering.
18. **Practice timer**: Daimon page session tracker with Liber Samekh worksheet.
19. **Graph visualization**: Interactive knowledge graph in chat.

---

## Part 6: Cron Job Spec — Daily Dawn Snapshot

### Purpose

A cron job that fires at dawn each day, computes the astrological snapshot,
and delivers a personalized Telegram message with the daimon name, top
activations, and practice recommendations.

### Data Flow

```
Dawn trigger (cron: 0 6 * * *)
  ↓
1. Compute ActivationPacket for today
  ↓
2. Compute all 10 layers
  ↓
3. Save snapshot to D1 (POST /api/astrology/snapshot)
  ↓
4. Build Telegram message:
   ┌──────────────────────────────────────┐
   │  ☿ Lvahtzkel — Mercury Hour at Dawn  │
   │                                      │
   │  Today's Sky:                        │
   │  ★ Mercury (high) — writing flow     │
   │  ★ Mars (medium) — assertive action  │
   │  ★ Venus (low) — social ease         │
   │                                      │
   │  🌙 Moon in Gemini — communicative   │
   │                                      │
   │  Best practice: Dawn, Mercury hour   │
   │  Incense: Cinnamon   Colour: Yellow   │
   │  Prayer: Liber Samekh Section B       │
   │                                      │
   │  Full reading: /observatory           │
   └──────────────────────────────────────┘
  ↓
5. Deliver to Telegram DM
```

### Implementation

The cron runs inside Hermes (VPS), not on Cloudflare. Hermes calls
`POST /api/astrology/today` with the user's birth data, receives the
packet, formats the Telegram message, and sends it.

The existing `daily-reading` skill blueprint already exists at
`hermes/skills/daimon/daily-reading/SKILL.md` — just needs to be
activated with the cron schedule.

---

## Part 7: Reference Sites

### Occult.live
https://www.occult.live/index.php/Kabbalistic_angel
Excellent for: Shem angels, Hebrew spellings, zodiac, psalms, angel metadata.
Treat as a discovery layer — verify against primary texts.

### Renaissance Astrology (Chris Warnock)
Best modern reference for: Agrippa, Picatrix, fixed stars, talismanic
correspondences. Useful for checking reconstruction details before encoding.

### Alchemy Website (Adam McLean)
Invaluable for: alchemical terminology, Paracelsian vocabulary, historical
illustrations, manuscript references. Already partially in our archive.

---

## Part 8: Data Model — Graph Nodes

Store everything as graph nodes:

```
Planet
  ↓
Mars
  ↓
connected_to
  ↓
Graphiel       ← Olympic Spirit
  ↓
connected_to
  ↓
Tuesday        ← Day
  ↓
connected_to
  ↓
Iron           ← Metal
  ↓
connected_to
  ↓
Red            ← Colour
  ↓
connected_to
  ↓
Orphic Hymn 8  ← Hymn
  ↓
connected_to
  ↓
Picatrix Bk II ← Source
```

Every essay, ritual, artwork, and video traverses the graph. This architecture
is much closer to the *Treasure Planet* orb than a traditional astrology app.
The orb doesn't just tell you "where you are" — it reveals pathways between
otherwise disconnected places.

The graph already exists (`knowledge_graph.ts`, 457 nodes, 528 edges).
It needs the 10 layers populated as new node types, with edges connecting
them to the existing planetary/spellbook/correspondence graph.

---

## Appendix: How This Relates to the Existing Vision

This builds on the architecture in `visionguide.md`, `visionary.md`, and
`hermes/notes/hermesspec1.md`:

| Existing Element | How It Fits |
|-----------------|-------------|
| ActivationPacket | Becomes the core input to ALL 10 layers. Each layer reads the packet and produces its own typed objects. |
| 5 interpreters | Stay as Layer 1 (Hellenistic). Layers 2-10 are NEW independent overlays. |
| Knowledge graph | Gets 10 new entity types (Decan, Genius, ShemAngel, LunarMansion, FixedStar, OrphicHymn, OlympicSpirit, PGMName, Practice, Source). |
| Daimon name | Links Layer 3 (Agrippa) with the daimon page. |
| Oikodespotes | Layer 1 computation feeds into all other layers. |
| Daily synthesis | Becomes the daily dawn cron output, enriched by all layers. |
| Liber Samekh worksheet | Lives at `/daimon`, triggered by practice recommendations. |
| Art archive | Linked via correspondences (planetary colours, metals, images). |
| Research Objects | The scholarly foundation behind the recommendations (e.g., "read Corbin essay on Mundus Imaginalis" is grounded in `ro:corbin-imaginal`). |

---

## Critical Lesson (2026-07-14)

The LLM analysis prompts in `llm-synthesis.ts` and `ficino-synthesis.ts` are correct and produce excellent output — a ChatGPT prompt using the same exact system prompts generated the gold standard reading saved in `observatory-gold.md`. The pipeline doesn't actually function because:

1. The `/api/chat` route exists but the `DEEPSEEK_API_KEY` env var isn't set on Cloudflare — the fallback hardcoded key may or may not work
2. The 2-pass LLM pipeline (Advanced Forecasting → Ficinian Depth) is wired in `birth-chart/page.tsx` but never runs automatically — it requires clicking "Generate Deep Analysis"
3. The cron job only computes the deterministic snapshot — it doesn't call the LLM
4. The observatory page's "Generate Deep Analysis" button just links to `/astrology`

**Fix needed:** Wire the LLM analysis to run as part of the dawn cron, feeding the full `LLMSynthesisInput` from `synthesis.ts` through `/api/chat`. Display the output on the observatory.

---

> **North Star:** The Observatory is not an astrology app. It's a symbolic
> operating system where the sky becomes a dashboard, traditions become
> layers, and correspondences become pathways. The daimon is your guide
> through it — LVJK at the top-left, always.
