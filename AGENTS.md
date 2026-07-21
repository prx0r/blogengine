# Source Atlas — Agent Context

## Session Constraints
- **RAM**: 4 GB total
- **CPU**: 2 cores
- Keep all operations resource-light: no parallel builds, no heavy inference, no large dependency installs without checking, avoid running dev servers unnecessarily. Prefer sequential lightweight operations.

## Project Root
`/root/projects/blog/`

## Architecture (7-Layer Pipeline)

```
Layer 1: COMPUTATION (caelus) → raw planetary positions
Layer 2: ENGINE (activation_engine.ts) → timing, scoring, conditions, oikodespotes, antiscia, bonification, aspect patterns, valens combinations
Layer 3: PACKET (activation_packet.ts) → ActivationPacket — pure signals, no interpretation
Layer 4: MACRO TRANSLATION (interpreters/aggregator.ts) → PlanetMacroContext[] — preserves ALL engine data
Layer 5: INTERPRETERS (interpretation_schema.ts) → 5 systems: al-Khayyāt, Valens, Ficino, Greenbaum, Demetra + convergence
Layer 6: SPELLBOOK (spellbook/) → SpellEntry[] triggered by engine state vector
Layer 7: KNOWLEDGE GRAPH (knowledge_graph.ts) → shared entity IDs, clusterByPlanet("mars")
```

## Key Files for Extraction

### Correspondences (Skinner target)
- `src/astrology/spellbook/correspondences.ts` — ~250 entries across 15 types, all with citations
- `src/astrology/spellbook/types.ts` — CorrespondenceEntry interface
- `src/astrology/spellbook/validate.ts` — validation script
- `stephenskinnerworking` — 81K-line OCR text (the source to parse)
- `scripts/skinner-sections/` — pre-split sections (angels, heavens, kabbalah, magic, natural, pagan, etc.)
- `scripts/extract-skinner.mjs` — failed regex approach (returns 0 entries)
- `scripts/extract-skinner-llm.mjs` — LLM-based approach (splits into sections)

### Spellbook (PGM target)
- `src/astrology/spellbook/spellbook.ts` — 13 entries (only 2 from PGM so far)
- `src/astrology/spellbook/EXTRACTION_SPEC.md` — extraction priorities and format
- `content/glossary/sources/books/pgm.txt` — 89K-line Betz translation
- `src/astrology/spellbook/types.ts` — SpellEntry interface
- `src/astrology/spellbook/ARCHITECTURE.md` — how spells connect to engine states

## Entity ID Format (Critical)
All entities use shared IDs: `planet:mars`, `sign:leo`, `house:1`, `lot:fortune`, `corr:herb:basil`, `corr:metal:iron`, `corr:colour:red`, `corr:stone:ruby`, `corr:incense:myrrh`, `corr:animal:wolf`, `corr:day:tuesday`, `corr:number:5`, `corr:archangel:michael`, `corr:divine_name:el`, `corr:musical_note:c`, `corr:body_part:heart`, `corr:sense:sight`, `corr:spirit:aratron`

## Trigger Format (Spellbook)
`trigger:active:mars`, `trigger:daimon:mercury`, `trigger:year_lord:saturn`, `trigger:retrograde:mars`, `trigger:detriment:mars`, `trigger:mode:spirit`, `trigger:mode:fortune`

## Validation
After any changes to spellbook or correspondences:
```
npx tsx src/astrology/spellbook/validate.ts
npm run typecheck
```

## Skills Available
- `skinner-extraction` — extract CorrespondenceEntry objects from Stephen Skinner's OCR text
- `pgm-extraction` — extract SpellEntry objects from the Greek Magical Papyri
