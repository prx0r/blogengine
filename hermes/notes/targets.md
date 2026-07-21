# Acquisition Targets — Paper Pipeline

## Pipeline Overview

```
Telegram message with title/DOI
  │
  ▼
1. Hermes resolves metadata (Crossref → OpenAlex)
2. Hermes finds OA copy (OpenAlex → Unpaywall → CORE)
3. Hermes downloads and validates PDF
4. Hermes creates paper JSON in content/works/
5. Hermes extracts text and links concepts
6. (Future) Hermes writes essay → generates audio → deploys
```

## Ongoing Acquisition Pipeline

A cron job runs every 30 minutes searching for Tier 2 commentaries on core authors,
starting from the imaginal realm (Phase 10) and expanding in natural connection order.

### The 17-Phase Coverage System

The Path of Re-Rendering defines 17 phases. Acquisition starts at Phase 10 and
expands outward through natural scholarly connections:

```
Phase 10 (Imaginal) → Phase 12 (Ritual) → Phase 13 (Daimon) →
Phase 11 (Body-energy) → Phase 9 (Language/Mantra) →
Phase 6 (Dependent arising)
```

Do NOT jump to Phase 2 (physics) or Phase 16 (visionary cosmologies) until the
core imaginal-ritual-daimonic corpus has substantial coverage.

### Core Authors (Priority Order)

| Priority | Author | Phase | Focus |
|---|---|---|---|
| 1 | Henry Corbin | 10 | Mundus imaginalis, angelology, ta'wil |
| 2 | Marsilio Ficino | 10, 12, 13 | Daimon, astrology, magic, Platonic theology |
| 3 | Iamblichus | 12 | Theurgy, ritual, daimons, divine symbols |
| 4 | Proclus | 12 | Elements of Theology, hieratic art |
| 5 | Gregory Shaw | 12 | Theurgy, Iamblichus, Neoplatonic ritual |
| 6 | Angela Voss | 10, 12 | Ficino, imagination, divination |
| 7 | Ibn Arabi | 10 | Barzakh, imagination, theophany |
| 8 | Suhrawardi | 10 | Ishraq, illumination, imaginal world |
| 9 | C.G. Jung | 10 | Archetypes, active imagination, alchemy |
| 10 | James Hillman | 10 | Soul-making, imaginal, daimon |
| 11 | Bhikkhu Ñāṇananda | 6 | Papañca, dependent arising |
| 12 | Rudolf Steiner | 10, 16 | Imagination, evolution of consciousness |
| 13 | Plato | 13 | Daimon, eros, anamnesis |
| 14 | Plotinus | 10 | The One, intellect, soul, daimon |
| 15 | Nāgārjuna | 7 | Emptiness, dependent arising |

### Expansion Logic

When searching for new papers, Hermes follows natural scholarly connections:

1. **Author → co-cited authors**: If a paper on Ficino cites Kristeller, search Kristeller
2. **Concept → related concept**: If searching "mundus imaginalis" also search "barzakh"
3. **Phase → adjacent phase**: If Phase 10 is well-covered, expand to Phase 12
4. **Gap-driven**: Prioritize authors with 0-2 works over those with 5+ works

Do NOT jump directly to Michael Levin, complexity theory, or physics papers.
Stay within the imaginal-ritual-daimonic-tradition zone. Let connections unfold
naturally through citation chains, not speculative leaps.

### Cron Schedule

```yaml
# Every 30 minutes: search for new Tier 2 commentaries (not every 5 — OpenAlex
# rate limits and API costs make 5min impractical)
cron: "*/30 * * * *"
skill: search
prompt: |
  Search OpenAlex for Tier 2 (commentary) papers related to the core authors.
  
  Current priority: Phase 10 (Imaginal) authors — Corbin, Ficino, Ibn Arabi,
  Suhrawardi, Jung, Hillman, Voss.
  
  For each search:
  1. Search OpenAlex for author name + "imaginal" or "mundus imaginalis" or "daimon"
  2. Check if the paper is already in content/works/
  3. If not found, check if OA copy exists
  4. If OA, download and catalog
  5. Extract text to verify it's a real Tier 2 commentary (not primary source)
  6. Create work JSON with correct tier tagging and commentary_on fields
  
  Report back: new papers found, which ROs they might affect.
```

### Coverage Tracking

Each phase has a coverage score tracked in `content/research-objects/_index.json`:

```json
{
  "phase_coverage": {
    "10_imaginal": {"sources": 12, "ros": 2, "status": "developing"},
    "12_ritual": {"sources": 8, "ros": 2, "status": "developing"},
    "13_daimon": {"sources": 5, "ros": 1, "status": "early"},
    "6_dependent_arising": {"sources": 3, "ros": 0, "status": "early"}
  }
}
```

Status progression: `not_started → early → developing → substantial → comprehensive`

Only move to the next phase when current phase reaches "substantial" (10+ sources, 2+ ROs).

---

## Voice Configuration

## Target Papers by Corpus

### Corpus A: Ficino & Late Platonism

| # | Paper | DOI | Status |
|---|---|---|---|
| 1 | Kiosoglou — Marsilio Ficino and the Soul | MDPI OA page | 🔍 Need DOI — MDPI 403 with direct PDF |
| 2 | Corrias — Imagination and Memory in Ficino's Vehicles of the Soul | — | 🔍 Paywalled, no OA found |
| 3 | Corrias — From Daemonic Reason to Daemonic Imagination | 10.1080/09608788.2013.771608 | 🔒 Closed (T&F), no OA |
| 4 | Ficino daemon Portuguese (Sacrilegens) | 10.34019/2237-6151.2020.v17.31924 | 🔍 OA journal, need to find PDF |
| 5 | Rutkin — Ficino, Cosmology and Astrology | — | 🔍 Iris repository URL returned HTML, need alternative |

### Corpus B: Corbin & The Imaginal

| # | Paper | Status | File |
|---|---|---|---|
| 1 | Idinopulos — Henry Corbin's Imaginal and the Space of the Fictional (2026 thesis) | ❌ Kingston 403 | — |
| 2 | Garner — The Imaginal World (Journal of Religion, 2024) | 🔒 Closed (Chicago), no OA | — |
| 3 | Wolfson — Mundus Imaginalis and the Test of the Veil (2025 book chapter) | 🔍 Academia copy available | — |
| 4 | Shariat — Henry Corbin and the Imaginal (1991) | 🔒 Closed (Sage), no OA | — |
| 5 | **Corbin — Mundus Imaginalis** | ✅ Downloaded | `library/corbin/mundus-imaginalis-corbin.pdf` |
| 6 | **Imagination and the Mundus Imaginalis (Spring 2007)** | ✅ Downloaded | `library/corbin/imagination-mundus-imaginalis-spring2007.pdf` |
| 7 | **Corbin — Temple and Contemplation** | ✅ Downloaded (rights check) | `library/corbin/temple-and-contemplation.pdf` |
| 8 | Corbin — History of Islamic Philosophy (Internet Archive) | 🔍 Archive.org | — |

### Corpus C: Ñāṇananda & Buddhist Deconstruction

| # | Paper | Status | File |
|---|---|---|---|
| 1 | **Ñāṇananda — Concept and Reality in Early Buddhist Thought** | ✅ Downloaded | `library/nanananda/concept-and-reality.pdf` |
| 2 | Evans — Ñāṇananda's Concept and Reality: An Assessment | 🔍 ResearchGate record | — |
| 3 | Dhammadinnā — Reply to Stephen Evans | 🔍 ResearchGate record | — |

## Acquisition Results (2026-07-11)

### Direct PDF Downloads — Working

These URLs returned HTTP 200 with Content-Type: application/pdf:

| Paper | URL | Size |
|---|---|---|
| Imagination and Mundus Imaginalis (Spring 2007) | `https://labaninternational.org/wp-content/uploads/2017/10/imagination-and-the-mundus-imaginalis-printed-in-spring-no-77-2007.pdf` | 75 KB |
| Corbin — Temple and Contemplation | `https://traditionalhikma.com/wp-content/uploads/2015/08/Temple-and-Contemplation-by-Henry-Corbin.pdf` | 6.9 MB |
| Ñāṇananda — Concept and Reality | `https://ahandfulofleaves.files.wordpress.com/2012/02/concept-and-reality-in-early-buddhist-thought_nanananda_1971.pdf` | 36 MB |

### OpenAlex — OA Copies Found

| Paper | OA Location |
|---|---|
| Copernicus's Development in Context (Rutkin?) | `https://research-information.bris.ac.uk/files/52397418/Copernicus_s_development_in_context_v20.pdf` |
| Reassessing Marginalization of Astrology | Cambridge OA PDF |
| Fragmentation of Renaissance Occultism | Edinburgh research repository |

### Paywalled / No OA Found

Papers which Unpaywall and OpenAlex both confirm as closed:

- Corrias — From Daemonic Reason to Daemonic Imagination (T&F)
- Garner — The Imaginal World (Chicago)
- Shariat — Henry Corbin and the Imaginal (Sage)

These require institutional access or author copies. Record as `access_status: paywalled_or_request_only`.

## Repository Structure

```
content/
  works/
    work_corbin_mundus_imaginalis.json
    work_imagination_mundus_imaginalis_spring.json
    work_corbin_temple_contemplation.json
    work_nanananda_concept_reality.json
    ...

  authors/
    author_henry_corbin.json
    author_angela_voss.json
    author_bhikkhu_nanananda.json
    ...

  concepts/
    concept_mundus_imaginalis.json
    concept_active_imagination.json
    concept_dependent_origination.json
    concept_papanca.json
    ...

library/
  ficino/
    rutkin-ficino-cosmology-astrology.pdf  (failed — HTML)
  corbin/
    imagination-mundus-imaginalis-spring2007.pdf
    temple-and-contemplation.pdf
  nanananda/
    concept-and-reality.pdf
```

## Next Steps

1. Create `content/works/` with JSON for the 3 successfully downloaded papers
2. Extract text from PDFs and link to existing concepts
3. Create `content/authors/` JSON files for Corbin, Voss, Ñāṇananda
4. Build Hermes skill that:
   a. Accepts a title/DOI/URL on Telegram
   b. Resolves via OpenAlex/Unpaywall
   c. Downloads and validates the PDF
   d. Creates the paper JSON
   e. Reports back the result
5. Set up cron for monthly research check per domain
6. Future: wire into essay pipeline (research → write → audio → deploy)
