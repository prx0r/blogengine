# Cunningham's Encyclopedia — Integration Spec

## Source
`content/astrology/Cunninghams_Encyclopedia_of_Magical_Herbs.md`
19,720 lines, ~400+ herbs with planetary, elemental, deity, and magical use data.

## Current State
`src/astrology/spellbook/correspondences.ts` has ~40 herbs with simple planet→herb mappings
from Agrippa/777/Picatrix/Ficino. Each entry: `{ id, type, label, planets[], source, citation }`.

## Goal
Add Cunningham's 400+ herbs as correspondence nodes in the knowledge graph,
with FULL metadata (not just planet mapping).

## Data Structure Per Herb

Parsed from text like:
```
BASIL
(Ocimum basilicum) G
Folk Names: ...
Gender: Masculine
Planet: Mars
Element: Fire
Deities: Vishnu, Erzulie
Powers: Protection, Wealth, Flying, Exorcism
Magical Uses: ...
```

### Graph Node
```
id: "corr:herb:sweet_basil"
layer: "correspondence"
type: "herb"
label: "Sweet Basil"
data: {
  source: "Cunningham",
  planet: "mars",
  element: "fire",
  gender: "masculine",
  deities: ["Vishnu", "Erzulie"],
  powers: ["Protection", "Wealth", "Flying", "Exorcism"],
  folk_names: ["Albahaca", "Basilico", "St. Joseph's Wort"],
  citation: "Cunningham p.X",
  safety: "G"  // G=general, P=poison, N=not for internal use
}
```

### Graph Edges
```
corr:herb:sweet_basil --corresponds_to--> planet:mars
corr:herb:sweet_basil --associated_with--> element:fire
corr:herb:sweet_basil --has_power--> power:protection
corr:herb:sweet_basil --has_power--> power:wealth
```

## Implementation Plan

### Phase 1: Parser Script
Create `scripts/parse-cunningham.mjs` that:
1. Reads the markdown file
2. Splits into individual herb entries (separated by blank lines, each starting with ALL CAPS name)
3. For each entry, extracts:
   - NAME (line in ALL CAPS)
   - Folk Names (after "Folk Names:")
   - Gender (after "Gender:")
   - Planet (after "Planet:")
   - Element (after "Element:")
   - Deities (after "Deities:")
   - Powers (after "Powers:")
   - Safety (poison note in parentheses on the name line)
   - Ritual Uses (after "Ritual Uses:")
   - Magical Uses (after "Magical Uses:")
4. Outputs JSON array of parsed entries

### Phase 2: Graph Registration
Add a `registerCunninghamHerbs()` function called from `registerSpellbookInGraph()`:
1. Load the parsed JSON
2. For each herb, register a graph node with full metadata
3. Register edges: `corresponds_to` → planet, `associated_with` → element, `has_power` → power

### Phase 3: Query Integration
The LLM synthesis prompts should include Cunningham herb data when relevant:
- For a Mars-active day, surface Mars-associated herbs from Cunningham with their powers
- For a Venus-active day, surface Venus herbs with love/beauty powers
- Practice recommendations can include specific herbs with Cunningham's magical uses

## Edge Cases
- Some herbs have multiple planets (pipe-separated): "Planet: Mercury, Venus"
- Some herbs have no planet listed — skip or use element-only
- Poisonous herbs marked with "(Poison)" in name line — store safety flag
- Some entries have "Parts Used:" or "Nutrition:" sections — capture if present
- Deities field may have 0-N entries — store as array even if empty
- Folk names may span multiple lines — join them

## Output Format (JSON)
```json
{
  "herbs": [
    {
      "id": "cunningham:basil",
      "name": "Sweet Basil",
      "slug": "sweet_basil",
      "folk_names": ["Albahaca", "Basilico", "St. Joseph's Wort"],
      "gender": "masculine",
      "planet": "mars",
      "element": "fire",
      "deities": ["Vishnu", "Erzulie"],
      "powers": ["Protection", "Wealth", "Flying", "Exorcism"],
      "safety": "general",
      "ritual_uses": "...",
      "magical_uses": "...",
      "citation": "Cunningham p.XX"
    }
  ]
}
```
