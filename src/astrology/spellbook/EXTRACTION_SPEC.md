# Spellbook Extraction Spec

## Source Material Inventory

| Source | Location | Format | Extractable Entries | Status |
|---|---|---|---|---|
| **Ficino** | `content/glossary/essays/ficino_*.json` | JSON | ~15 planetary practices | ✅ Done (4) |
| **Orphic Hymns** | (via ritual_references.ts) | Structured | 7 hymns | ✅ Done (2) |
| **Picatrix** | `src/data/picatrix.json` + PDFs | JSON + PDF | ~30 operations | ✅ Partial (3) |
| **Agrippa** | `blueprints/source_texts/agrippa-books1-2.txt` | Plain text | ~50 correspondences | ✅ Partial (2) |
| **PGM** | `content/glossary/sources/books/pgm.txt` | Plain text | ~100 spells | ✅ Partial (2) |
| **Arbatel** | `content/glossary/sources/books/arbatel.txt` | Plain text | 7 Olympic spirits | ❌ Not done |
| **777** | `content/glossary/sources/books/Liber 777 Revised.pdf` | PDF | ~200 correspondence tables | ❌ Not done |
| **Voss** | `scholars/voss/` | PDF | Planetary music + magic | ❌ Not done |
| **Shaw** | `scholars/shaw/` | PDF | Theurgic theory | ❌ Not done |

## SpellEntry Format (Canonical)

Every entry from any source must use this structure:

```typescript
interface SpellEntry {
  id: string;                    // "source:type:domain:number"
  source: SpellSource;           // "Ficino" | "Picatrix" | "Agrippa" | "PGM" | "Orphic" | "Arbatel" | "777"
  type: string;                  // "invocation" | "ritual" | "meditation" | "talisman" | "prayer" | "music" | "general"
  purpose: string[];             // ["courage", "protection"]
  tags: string[];                // ["planet:mars", "courage"]
  planet?: string;               // "planet:mars" — shared entity ID
  sign?: string;                 // "sign:leo" — shared entity ID
  house?: number;
  title: string;                 // Display name
  summary: string;               // One-line description
  procedure: string[];           // Step-by-step
  timing?: { planetaryDay?: number; planetaryHour?: number; moonPhase?: string; };
  materials?: { herbs?: string[]; metals?: string[]; colours?: string[]; stones?: string[]; incenses?: string[]; };
  incantation?: string;          // Prayer or spoken words
  safety: SafetyClass;           // "safe_symbolic" | "historical_reference" | "restricted"
  safeAdaptations: string[];     // Always required
}
```

## How to add entries

1. Read the source text
2. For each distinct practice, create a SpellEntry
3. Follow the canonical format
4. Run `npm run typecheck` to validate
5. Run `npx tsx src/astrology/spellbook/validate.ts` to check completeness

## Target: 100+ entries

| Source | Current | Target | Priority |
|---|---|---|---|
| Ficino | 4 | 10 | High |
| Orphic | 2 | 7 | High |
| Picatrix | 3 | 15 | High |
| Agrippa | 2 | 15 | High |
| PGM | 2 | 10 | Medium |
| Arbatel | 0 → 7 | 7 | ✅ Done |
| 777 | 0 | 200 (as correspondences) | Low (bulk parsing) |
| **Correspondences** | **78** | **~120** | **Ongoing** |
| **Total** | **91** | **~184** | |

## Data We Already Have (Not Yet Fully Extracted)

| Source | Location | Size | Extractable Content | Priority |
|---|---|---|---|---|
| **Picatrix Bks 1-2** | PDF → `/tmp/picatrix_b1b2.txt` | 10,468 lines | Planetary images (7 planets × 4 sages), suffumigations, prayers, talisman instructions (Bk 2 Ch.10-12). Structured sections at lines 4455+ and 7202+. | 🔴 HIGH |
| **Picatrix Bks 3-4** | PDF → `/tmp/picatrix_b3b4.txt` | 16,197 lines | Additional operations, planetary hours, magical squares. | 🔴 HIGH |
| **Agrippa Bks 1-2** | `blueprints/source_texts/agrippa-books1-2.txt` | 970K | Full correspondence tables in prose (Bk I Ch.22-43 on planets). Needs structured extraction. | 🟡 MEDIUM |
| **PGM** | `content/glossary/sources/books/pgm.txt` | 1.2M | 100+ spell formulae, needs regex extraction for purpose/materials/speech. | 🟡 MEDIUM |
| **Liber 777** | `content/glossary/sources/books/Liber 777 Revised.pdf` | PDF | 200+ correspondence tables. Needs PDF table parsing. | ⚪ LOW |

## Future Works (If Acquired)

| Work | Expected Entries |
|---|---|
| **Key of Solomon** | ~30 planetary operations |
| **Heptameron** (Peter de Abano) | ~15 angelic invocations |
| **The Magus** (Francis Barrett) | ~30 structured tables |
