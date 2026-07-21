# Metaphysics Doc — What It Implies We Need to Build

## Purpose

A fixed reference frame for the Re-Rendering Atlas. Every PDF, source card, and essay is extracted and written relative to this doc's canonical concepts and claims — not the source's own framing. This prevents 50 PDFs producing 50 disconnected vocabularies for the same concepts.

## Architecture

```
metaphysics.md (this file — overview + build plan)
content/
  metaphysics/
    concepts.yaml    — canonical concept list
    claims.yaml      — our framework's positions per concept
    aliases.yaml     — cross-tradition synonym table (every term → one concept ID)
    glossary.yaml    — human-readable one-paragraph definitions for the glossary page
```

---

## What Exists Already

| Piece | Status |
|-------|--------|
| `"concept"` node kind in `schema.ts` | ✅ Already there (line 46) |
| `router.ts` keyword→phase mappings | ✅ 102 entries already |
| `phaseCache.ts` | ✅ Can be extended for concepts |
| `buildGraphPacket.ts` | ✅ Existing, just needs concept field |
| SourceCard schema (Zod) | ✅ Existing |
| Edge types in schema | ✅ Partial — needs 2 more |

---

## What We Need to Build — Full Breakdown

### Layer 1: Data (YAML files)

#### 1. `content/metaphysics/concepts.yaml`
Canonical concepts mapped to phases. Each entry:
```yaml
- id: concept-daimon
  label: "Daimon / Guidance / Vocation"
  primaryPhase: 13
  status: "draft"              # draft | review | stable
  supersededBy: ~              # concept ID if deprecated
  canonicalClaim: >
    The daimon is the existential vector — not an external entity,
    but the interface between nested agency and nonordinary rendering.
```

#### 2. `content/metaphysics/claims.yaml`
One concept can have multiple claims at different evidence tiers:
```yaml
- id: claim-daimon-existential-vector
  conceptId: concept-daimon
  claim: "The daimon is the existential vector of a life's trajectory."
  evidenceTier: serious_interpretive
  status: draft
  supersededBy: ~
  addedAt: "2026-07-04"
```

#### 3. `content/metaphysics/aliases.yaml`
The load-bearing part — every term from every tradition maps to exactly one concept:
```yaml
- term: "guardian angel"
  conceptId: concept-daimon
  tradition: christian
  precision: exact              # exact | partial | contested
  note: "Christianity externalizes the daimon into a separate created being"
- term: "genius"
  conceptId: concept-daimon
  tradition: roman
  precision: exact
- term: "higher self"
  conceptId: concept-daimon
  tradition: new_age
  precision: partial
  note: "Democratized — everyone has one without initiation. Loses the threshold aspect."
- term: "fravashi"
  conceptId: concept-daimon
  tradition: zoroastrian
  precision: exact
```

#### 4. `content/metaphysics/glossary.yaml`
Auto-generated from concepts + claims, but hand-editable for prose quality:
```yaml
- conceptId: concept-daimon
  definition: >
    The daimon is the intelligible density of a life's trajectory —
    the existential vector encountered at the threshold where ritual
    competence opens into genuine transformation. In Neoplatonism it
    is an intermediate being; in the Atlas it is the interface between
    nested agency and nonordinary rendering.
  seeAlso: ["concept-nested-agency", "concept-nonordinary-state"]
  forBeginners: >
    Your daimon is not a voice in your head. It is the shape your life
    wants to take when you stop getting in your own way.
```

---

### Layer 2: Schema Changes (`src/atlas/graph/schema.ts`)

#### 5. New EdgeKind values
```typescript
// Add to edgeKindSchema:
"affirms_claim"      // SourceCard → Claim: this source supports our canonical claim
"contradicts_claim"  // SourceCard → Claim: this source challenges our canonical claim
"aliases"            // Concept → Concept: shared alias ancestry
```

Already exists: `"concept"` node kind ✅

#### 6. New Zod schemas
```typescript
const conceptSchema = z.object({
  id: z.string(),
  label: z.string(),
  primaryPhase: z.number().min(1).max(17),
  status: z.enum(["draft", "review", "stable", "deprecated"]),
  supersededBy: z.string().optional(),
  canonicalClaim: z.string(),
});

const claimSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  claim: z.string(),
  evidenceTier: evidenceTierSchema,
  status: z.enum(["draft", "review", "stable", "deprecated"]),
  supersededBy: z.string().optional(),
});

const aliasSchema = z.object({
  term: z.string(),
  conceptId: z.string(),
  tradition: z.string(),
  precision: z.enum(["exact", "partial", "contested"]),
  note: z.string().optional(),
});
```

---

### Layer 3: Graph Loading (`src/atlas/graph/`)

#### 7. `loadMetaphysics.ts` — new module
Loads `content/metaphysics/*.yaml` into typed in-memory structures, same pattern as `loadGraph.ts`.

#### 8. `conceptCache.ts` — new module
In-memory cache of concepts with alias lookup. Primary method:
```typescript
function resolveAlias(term: string): Concept | null
// "guardian angel" → concept-daimon
// "daimon" → concept-daimon
// unknown → null
```

#### 9. `buildGraphPacket.ts` — add concept field
When a phase is matched, also pull in associated concepts and their canonical claims into the graph packet:
```typescript
interface GraphPacket {
  // ... existing fields
  concepts?: { id: string; label: string; canonicalClaim: string }[];
  aliases?: { term: string; tradition: string; precision: string }[];
}
```

---

### Layer 4: Kuzu Schema

#### 10. New node tables
```cypher
CREATE NODE TABLE Concept (
  id STRING, label STRING,
  primaryPhase INT, status STRING,
  createdAt DATE, supersededBy STRING,
  PRIMARY KEY (id)
);

CREATE NODE TABLE Claim (
  id STRING, conceptId STRING,
  claim STRING, evidenceTier STRING,
  status STRING, createdAt DATE,
  PRIMARY KEY (id)
);
```

#### 11. New edge tables
```cypher
CREATE REL TABLE AFFIRMS (FROM SourceCard TO Claim, quotes STRING[]);
CREATE REL TABLE CONTRADICTS (FROM SourceCard TO Claim, quotes STRING[]);
CREATE REL TABLE ALIAS_OF (FROM Concept TO Concept, term STRING, tradition STRING);
CREATE REL TABLE ADDRESSES_CONCEPT (FROM Essay TO Concept);
```

#### 12. `scripts/import-graph.mjs` — add metaphysics import
Add Concept + Claim node creation and edge creation to the existing import script.

---

### Layer 5: AI Pipeline

#### 13. `src/ai/prompts/sourceExtractor.ts` — extraction prompt
```
You are extracting source material for the Re-Rendering Atlas —
a 17-phase framework for metaphysical transformation.

CONTROLLED VOCABULARY (use these concept IDs, not the source's terms):
{concepts.yaml serialized}

OUR CANONICAL CLAIMS (the framework's positions):
{claims.yaml serialized}

For each passage, output:
{
  "passage": "verbatim quote",
  "pageRef": "p.XX",
  "mappedConcept": "concept-daimon",
  "relationshipToOurClaim": "agrees" | "extends" | "contradicts" | "irrelevant",
  "coreContribution": "...",
  "breaks": [...],
  "grounds": [...],
  "enables": [...],
  "phase": [13],
  "evidenceTier": "..."
}
```

#### 14. `src/ai/extractSourceCards.ts` — extraction function
Takes (PDF path, metaphysics doc) → SourceCard candidates. Uses DeepSeek with the sourceExtractor prompt. Deduplicates by concept + claim overlap.

#### 15. Router alias expansion (`src/atlas/ai/router.ts`)
When a user types "guardian angel" or "genius", the router currently misses it. Need an alias expansion step:
```typescript
// Before keyword→phase matching:
// 1. Check aliases: "guardian angel" → concept-daimon → phase-13
// 2. Add phase-13 to matched phases
```

This is the concrete change that makes the metaphysics doc pay off immediately in the chat experience.

---

### Layer 6: Glossary Page

#### 16. `/glossary` route
Auto-generated page from `content/metaphysics/glossary.yaml`. Lists every concept with:
- Definition (human-readable)
- Cross-references (`seeAlso`)
- Which phase it maps to
- For beginners version
- Inline alias list: "Also known as: guardian angel (Christian), genius (Roman), higher self (New Age)"

#### 17. Glossary component
Shared component used on `/glossary` and as an inline tooltip in `/chat` when a concept name is hovered.

---

### Layer 7: Validation

#### 18. `scripts/validate-metaphysics.ts`
```typescript
// Required checks:
// 1. No alias maps to more than one concept — UNIQUE CONSTRAINT
// 2. Every concept has a non-empty canonicalClaim
// 3. Every claim references an existing conceptId
// 4. Every concept has a primaryPhase that exists in phases.yaml
// 5. No orphan aliases — every alias has a valid conceptId
// 6. No circular supersededBy chains
// 7. Glossary covers every concept with status !== "deprecated"
```

#### 19. Add to `npm run validate:content`
```json
"validate:content": "npx tsx scripts/validate-content.ts && npx tsx scripts/validate-metaphysics.ts"
```

---

### Layer 8: Extraction Pipeline

#### 20. Chunking utility
```typescript
// src/lib/chunk.ts
function chunkPDF(pdfPath: string): { text: string; pageRef: string }[]
// Splits by section heading or paragraph boundary
// Preserves page numbers
```

#### 21. R2 integration
```typescript
// POST /api/admin/sources/extract
// Body: { pdfKey: "user-uploads/iamblichus-mysteries.pdf" }
// 1. Fetch PDF from R2
// 2. Chunk
// 3. For each chunk: DeepSeek extraction → SourceCard candidate
// 4. Store candidates in D1 extraction_candidates table
// 5. Return candidate count + preview
```

#### 22. Human review UI
Admin page: `/admin/extraction-review`
- Shows candidates grouped by concept
- Approve/reject/merge per candidate
- Approved → written to `content/sourceCards.yaml` + Kuzu

#### 23. Batch extraction script
```bash
# npm run extract:all
# Iterates all PDFs in R2, runs extraction pipeline, creates candidates
# Dry-run mode: --dry-run to preview without writing
```

---

### Layer 9: Essay Factory (downstream)

#### 24. `scripts/generate-essay.mjs`
```
1. Query Kuzu: find concept with ≥2 SourceCards that have no Essay
2. Run comparative extraction pass across SourceCards
3. Write essay markdown to essays/memory/essays/<slug>.md
4. Create Kuzu Essay node + ADDRESSES_CONCEPT + CITES_SOURCE edges
5. Update workflow/ status
```

#### 25. `POST /api/essays/generate` endpoint
On-demand essay generation for a given concept pair or phase bridge. Returns draft for human review.

---

### Layer 10: The Router Payoff (what changes for the user)

Before metaphysics doc:
```
User: "what is a guardian angel?"
Router: [no keyword match] → falls through to generic LLM → might hallucinate
```

After metaphysics doc + alias expansion:
```
User: "what is a guardian angel?"
Router: alias lookup → concept-daimon → phase-13
  → If Essay exists: serve essay (fast path)
  → If no Essay: build GraphPacket with concept-daimon + phase-13 + SourceCards → LLM generates (slow path, but grounded)
```

---

## Summary: All Files to Create or Modify

### New Files

| File | What |
|------|------|
| `content/metaphysics/concepts.yaml` | Canonical concept list |
| `content/metaphysics/claims.yaml` | Canonical claims per concept |
| `content/metaphysics/aliases.yaml` | Cross-tradition synonym table |
| `content/metaphysics/glossary.yaml` | Human-readable definitions |
| `src/atlas/graph/loadMetaphysics.ts` | YAML loader for metaphysics |
| `src/atlas/graph/conceptCache.ts` | In-memory concept + alias cache |
| `src/atlas/graph/validateMetaphysics.ts` | Validation schemas |
| `src/ai/prompts/sourceExtractor.ts` | Extraction prompt template |
| `src/ai/extractSourceCards.ts` | Extraction function |
| `src/lib/chunk.ts` | PDF chunking utility |
| `scripts/validate-metaphysics.ts` | Validation script |
| `src/app/glossary/page.tsx` | Glossary route |
| `src/components/GlossaryTerm.tsx` | Glossary tooltip component |
| `src/app/api/admin/sources/extract/route.ts` | Extraction endpoint |
| `src/app/admin/extraction-review/page.tsx` | Human review UI |

### Existing Files to Modify

| File | Change |
|------|--------|
| `src/atlas/graph/schema.ts` | Add `affirms_claim`, `contradicts_claim` to EdgeKind; add Concept/Claim Zod schemas |
| `src/atlas/graph/buildGraphPacket.ts` | Add concepts field |
| `src/atlas/ai/router.ts` | Add alias expansion step before keyword matching |
| `src/atlas/graph/phaseCache.ts` | Load concept cache alongside phase cache |
| `scripts/import-graph.mjs` | Add Concept + Claim node/edge import |
| `package.json` | Add `validate:metaphysics` script |
| `src/app/atlas/page.tsx` | Display linked concepts in phase drawer |

---

## Sequencing (Revised from v1)

| Step | What | Depends On | Effort |
|------|------|------------|--------|
| **1** | Write `concepts.yaml` + `claims.yaml` + `aliases.yaml` | Nothing (human work) | Hours |
| **2** | Add `affirms_claim`/`contradicts_claim` to `schema.ts` + Concept/Claim Zod schemas | Step 1 | 15 min |
| **3** | Write `loadMetaphysics.ts` + `conceptCache.ts` + validation | Step 1 | 2 hrs |
| **4** | Add alias expansion to `router.ts` | Step 3 | 1 hr |
| **5** | Add concepts to `buildGraphPacket.ts` | Step 3 | 1 hr |
| **6** | Write `sourceExtractor.ts` prompt | Step 1 | 1 hr |
| **7** | Write `extractSourceCards.ts` + chunking | Step 6 | 3 hrs |
| **8** | Test extraction on 2-3 PDFs manually | Step 7 | 1 hr |
| **9** | Build extraction review UI (/admin) | Step 7 | 4 hrs |
| **10** | Build glossary page + component | Step 1 | 2 hrs |
| **11** | Update Kuzu import script + schema | Step 1 | 2 hrs |
| **12** | Build essay generator | Steps 7-9 | 4 hrs |
| **13** | Autonomous agents | Steps 1-12 | V3 |

Steps 1-5 are the critical path — once the router expands aliases, the metaphysics doc pays off immediately in chat quality even before extraction runs.
