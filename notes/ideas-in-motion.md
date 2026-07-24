# Ideas in Motion — Active Systems & Objects

## Status Key
- 🟢 **Live** — working in production, cron active
- 🟡 **Built** — code exists, needs integration
- 🔵 **Spec'd** — design complete, not built
- ⚪ **Idea** — concept stage, needs spec

---

## Factory Core (🟢 Live)

The base layer. Everything else plugs into this.

| Component | Status | Location |
|-----------|--------|----------|
| RO pipeline | 🟢 Live | `content/research-objects/` — 153 ROs |
| Essay pipeline | 🟢 Live | 3 essays written, 43 ready to write |
| Video pipeline | 🟢 Live | Storyboard → voiceover → FableCut → export |
| Cron (every 6h) | 🟢 Live | Processes one stage per cycle |
| Factory audit | 🟢 Live | `scripts/factory-audit.py` — binary validation |
| 3-pass writing | 🟢 Live | Blocking gates P1-P3, exit code 0/1 |

---

## RO — Research Object (🟢 Live)

One topic, one tradition. The atomic knowledge unit.

153 exist. 43 ready for essay expansion. 8 deleted (placeholders). 3 dissolved into parents. 2 converted to COs.

---

## CO — Comparison Object (🟡 Built)

Compares exactly 2 ROs.

2 exist: `co:daimon-guidance`, `co:laya-daimon-contact`
Directory: `content/comparison-objects/`
**Status:** Schema defined, 2 created. Not yet wired into the cron queue.

---

## SO — Synthesis Object (⚪ Idea)

Combines 3+ ROs/COs. Higher-level cross-tradition insights.

0 exist. Not yet spec'd beyond factory-manual.md.

---

## HO — Hypothesis Object (🔵 Spec'd)

Market signal → hypothesis → content → validate → feed back.

| Aspect | Status |
|--------|--------|
| Schema | 🔵 Spec'd in `hermes/skills/daily-research/HYPOTHESIS-SYSTEM.md` |
| Signal scoring | 🔵 Spec'd in `hermes/skills/daily-research/SIGNAL-SYSTEM.md` |
| First scan data | 🟡 Built — `data/market/scan-2026-07-20.json` (92 breakouts) |
| Pattern analysis | 🟡 Built — `data/market/patterns.json` |
| Cron integration | ⚪ Not yet — cron still reads only ro-queue.json |
| Validation | ⚪ Not yet — needs YouTube analytics after 30 days |

**Next:** Wire cron to read `data/hypotheses/` alongside `ro-queue.json`. When HO has confidence ≥ 0.6, prioritise its content_spec.ros over normal queue order.

**Signal scores calculated (first run):**
| Topic | Score | Verdict |
|-------|-------|---------|
| Abhinavagupta | N/A (no market data — zero competitors) | Own by default |
| Theurgy | 0.36 | Monitor — single strong signal (Esoterica 3.1x) |
| Tantra | 0.40 | Monitor — Tantra Talks 25.8x but short-form only |

---

## PO — Philosopher Object (🔵 Spec'd)

A philosopher as structured data: metaphysics, key terms, art assets, quotes, affinities, scenarios.

| Aspect | Status |
|--------|--------|
| Schema | 🔵 Spec'd in `hermes/skills/daily-research/PHILOSOPHER-OBJECT.md` |
| First POs | ⚪ Not created — needs 3 initial: Abhinavagupta, Iamblichus, Plotinus |
| Battle format | 🔵 Spec'd — PO_x + PO_y + scenario → battle script |
| Shorts pipeline | 🔵 Spec'd — each PO has pre-vetted quotes + art = instant 60s content |
| Scenario engine | ⚪ Idea — "Who wins in X?" template |
| Art asset linking | ⚪ Not connected — POs reference art IDs but art gallery isn't tagged for philosophers |

**Next:** Create `po:abhinavagupta` manually (17 ROs, lots of art). Then `po:iamblichus` (3 ROs, for the first battle). Then wire PO schema into the factory so battles become a pipeline.

---

## Yogi Watch Series (🔵 Spec'd)

Biographical shorts + essays on lesser-known yogis.

| Aspect | Status |
|--------|--------|
| Format | 🔵 Spec'd — 90s hook → life → teaching → threshold |
| First subject | ⚪ Not selected — Khaptad Swami suggested |
| PO integration | ⚪ Each Yogi Watch subject = a PO (life data + teaching + art) |
| Market validation | 🔵 SittingNow pattern at 5.9x — named figures drive breakouts |

**Next:** First subject needs a PO. Then the shorts pipeline is: read PO → pick quote + art → 60s script → voiceover → thumbnail → upload.

---

## Market Scan System (🟡 Built)

| Component | Status |
|-----------|--------|
| YouTube breakout scanner | 🟡 Built — scans channels, detects breakouts |
| Pattern extractor | 🟡 Built — title patterns, duration clusters, topic words |
| First scan | 🟡 Built — 92 breakouts (180-day), 145 (365-day) |
| Recurring scans | ⚪ Not scheduled — should be weekly cron |
| Pattern comparison | ⚪ Not built — can't diff "last week vs this week" yet |

**Key patterns from first scan:**
- 27% of breakout titles are questions
- 49% of breakouts are 20+ min, 32% are under 2 min (bimodal)
- Small channels (<50k) drive 40% of breakouts in our niche
- "X Isn't What You Think" works across niches

**Next:** Schedule weekly market scan cron. After 3 scans, start comparing pattern shifts.

---

## Battle Series (🔵 Spec'd)

Philosopher battles as a content format.

| Battle | POs Needed | Scenario | Status |
|--------|-----------|----------|--------|
| Abhinavagupta vs Iamblichus | po:abhinavagupta, po:iamblichus | Earthquake | 🔵 Spec'd (scenario in PO doc) |
| Abhinavagupta vs Plotinus | po:abhinavagupta, po:plotinus | To be chosen | ⚪ Idea |
| Tantra vs Theurgy | po:abhinavagupta, po:iamblichus | "Western Tantra" framing | ⚪ Idea |

**Pipeline:** Create POs → write battle script (3-pass, same as essay) → pull art from PO assets → storyboard → voiceover → FableCut → YouTube.

---

## Signal System (🔵 Spec'd)

Intelligence layer for deciding what to produce.

| Component | Status |
|-----------|--------|
| Market source (external) | 🟡 Built — breakout data feeds in |
| Analytics source (internal) | ⚪ Not built — needs YouTube uploads first |
| Content readiness source | 🟡 Built — RO queue + art count |
| Channel fit source | ⚪ Subjective — needs formalization |
| Confluence scoring | 🔵 Spec'd — algorithm defined |
| HO creation on high signal | ⚪ Not built — needs cron integration |

---

## What Exists vs What's Coming

```
EXISTING (live):                         COMING (spec'd/built):
  Factory pipeline (cron)                 HO lifecycle (needs cron integration)
  153 ROs + 2 COs                        PO creation (Abhinavagupta first)
  3 essays + 43 ready                    Battle series (wired into pipeline)
  904 art entries (341 tagged)           Yogi Watch series (needs first PO)
  Market scanner (data collected)        Weekly market scan cron
  Signal/HO/PO specs (designed)          Analytics connector (needs uploads)
  FableCut + thumbnail server            Scenario engine (needs POs first)
```

---

## Spell Spotlight Series (⚪ Idea)

Short-form video narratives of specific historical spells. Part ritual demonstration, part historical deep dive, part astrology almanac.

### The Format (60-90 seconds)

```
1. Context (10s) — Where this spell comes from (PGM, Picatrix, Agrippa)
2. The Problem (10s) — What this spell is for (protection, love, vision, binding)
3. Correspondences (15s) — Planetary hour, materials, symbols, incantation
4. The Method (20s) — How to perform it (simplified, accessible)
5. The Promise (10s) — What you can expect
6. Alignment (5s) — Why now? (full moon, planetary hour, solstice, etc.)
```

### Topical Triggers

The Spell Spotlight calendar aligns with:

| Trigger | Spell Example | Source |
|---------|--------------|--------|
| Full Moon | Lunar revelation spell | PGM VII. 250-254 |
| Mercury Retrograde | Mercury binding/communication spell | Picatrix Book II |
| Mars in Aries | Protection/warding spell | Agrippa Book III |
| Spring Equinox | Visionary ascent ritual | PGM IV. 475-829 (Mithras Liturgy) |
| Samhain/Halloween | Necromancy/spirit contact | PGM — Sword of Dardanus |
| Public holiday | Civic protection spell | Picatrix — City warding |
| Trending topic (e.g. Odyssey) | Homeric spell / dream oracle | PGM — Dream oracle |

### Spell Object (SpO) Schema (Proposed)

```json
{
  "id": "spo:pgm-vii-protection",
  "source": "PGM VII. 250-254",
  "name": "Lunar Revelation Spell",
  "purpose": "protection",
  "astrology_align": {"moon_phase": "full", "planet": "diana", "day": "monday"},
  "correspondences": ["myrrh", "linen", "silver", "moonwater"],
  "method_summary": "Tie seven knots in a linen cord while reciting...",
  "content_warning": "historical practice — symbolic adaptation recommended",
  "art": ["art_pgm_scroll", "art_moon_bowl"],
  "status": "planned"
}
```

### Integration with Astrology Engine

The astrology engine computes today's chart. From the chart, find spells whose `astrology_align` matches:

```
today_chart = compute(now)
  → moon phase: waxing gibbous → no perfect match
  → planet: venus in taurus → find love/beauty spells
  → pick closest: SpO with venus_align
  → produce short
```

### Integration with Market Scan

The market scanner detects trending topics. If "odyssey" trends, Hermes finds spells from the Homeric tradition (PGM dream oracles, necromancy spells). If "protection" trends after a news event, protection spells jump the queue.

### What Already Exists

| Asset | Location | Status |
|-------|----------|--------|
| PGM catalog | `content/glossary/pgm-catalog.json` | ✅ Has spell names, purposes, deities |
| Picatrix catalog | `content/glossary/picatrix-catalog.json` | ✅ Has book/chapter structure |
| Agrippa source | `blueprints/source_texts/` | ✅ Three Books of Occult Philosophy |
| Astrology engine | Workers + `library/astrology/` | ✅ Computes daily chart |
| Art gallery | `content/glossary/art/` | ✅ PGM-inspired art exists |
| Short-form format | (Yogi Watch pattern) | 🔵 Adaptable |

### What Needs Building

| Component | Notes |
|-----------|-------|
| Spell Object schema | Adapt from PO pattern — one JSON per spell |
| SpO → short pipeline | Same as Yogi Watch: read SpO → pick quote + art → 60s script |
| Astrology almanac cron | Weekly: "next 7 days' best spell windows" |
| SpO catalog from PGM | Parse `pgm-catalog.json` into individual SpO JSONs |
| Content warning system | Some spells need historical context disclaimer |

### Implication

Spell Spotlight turns the astrology engine into a content driver. Instead of just computing charts, it schedules content. Full moon isn't just a data point — it's a production deadline.

---

## Priority Queue

```
NOW (this week):
  1. Create po:abhinavagupta (manual — 17 ROs, pick art, write scenarios)
  2. Create po:iamblichus (manual — 3 ROs, for first battle)
  3. Wire HO into cron (read hypotheses/ alongside ro-queue.json)
  4. Write essay for first battle: "Abhinavagupta vs Iamblichus"

NEXT (after POs exist):
  5. Create po:plotinus
  6. First Yogi Watch PO (Khaptad Swami or similar)
  7. Generate shorts from PO assets (one quote + one art = one short)
  8. Weekly market scan cron

SOON (after analytics exist):
  9. Analytics connector — 30-day validation for HOs
  10. Signal system auto-creates HOs on high confidence
  11. Pattern comparison — market scan diffs week over week
```
