# Atlas Graph Structure

Current implementation details of the Re-Rendering Atlas graph data.

## Source of Truth

All graph data lives in `content/*.yaml` — human-editable YAML files, validated against Zod schemas in `src/atlas/graph/schema.ts`, compiled to `src/atlas/graph/generated-data.ts` (auto-generated fallback for environments without filesystem access like Cloudflare Workers).

```
content/*.yaml  ──→  validate-content.ts (Zod)  ──→  generate-graph-json.mjs  ──→  generated-data.ts
                                                                                          │
                                                                          loadGraph.ts (runtime loader)
                                                                               ↓
                                                                    In-memory Graph object
```

`loadGraph.ts` tries filesystem first (Node.js), falls back to generated-data.ts (browser/Worker).

## Current Graph: What Exists

All counts as of 2026-07-04:

| Entity | Count | Source File |
|---|---|---|
| Phases | 17 | `content/phases.yaml` |
| Risks | ~12 | `content/risks.yaml` |
| Correctives | ~28 | `content/correctives.yaml` |
| Warnings | 7 | `content/warnings.yaml` |
| Traditions | 4 | `content/traditions.yaml` |
| Source Cards | 8 | `content/sourceCards.yaml` |
| Edges | 38 | `content/edges.yaml` |

## Entity Schemas

### Phase (17)

The core structural unit. Each phase represents a stage of transformation in the Re-Rendering framework.

```typescript
{
  id: string;                    // e.g. "phase-1-dashboard-diagnosis"
  label: string;                 // e.g. "Dashboard Diagnosis"
  phaseNumber: number;           // 1-30, sequential order
  entryAssumption: string;       // What you believe entering this phase
  proofMove: string;             // Why that assumption breaks down
  replacementModel: string;      // What replaces the broken assumption
  practiceMove: string;          // What to do about it
  successMarker: string;         // How you know it's working
  failureMode: string;           // How this phase can go wrong
  nextPhaseLogic: string;        // Why the next phase follows
  evidenceTier: EvidenceTier;    // How established this phase's claims are
  pathFunction: PathFunction[];  // What this phase does in the overall arc
  stream?: string;               // Thematic grouping
  summary?: string;              // One-sentence description
}
```

**EvidenceTier enum:**
- `established` — supported by converging evidence across traditions
- `serious_interpretive` — well-argued scholarly interpretation
- `speculative` — provocative but unproven
- `visionary_mythic` — visionary/mythological in nature
- `historical_ritual` — historically attested practice
- `practice_validated` — validated by personal practice, not institutional proof

**PathFunction enum:**
- `deconstructs` — breaks a prior assumption
- `grounds` — provides foundation
- `bridges` — connects two phases
- `reconstructs` — rebuilds on deconstructed ground
- `stabilizes` — prevents regression
- `opens_imaginal` — opens imaginal/symbolic access
- `orders_field` — structures the conceptual space
- `receives_guidance` — opens to guidance/daimon
- `incarnates` — makes abstract concrete
- `corrects_risk` — mitigates a specific failure mode
- `pressure_tests` — stress-tests prior phases

### Phase Streams

Phases are grouped into thematic streams:

```
Stream: Foundation              — Phases 1-2  (Dashboard Diagnosis, Physical De-solidification)
Stream: Mind / Cognition        — Phases 3-4  (Mind-as-Computer Critique, Nested Agency)
Stream: Mechanism / Conditioning — Phases 5-6  (Mechanicality, Dependent Arising)
Stream: Emptiness / Fabrication  — Phases 7-9  (Emptiness, Non-fabrication, Imaginal)
Stream: Practice / Embodiment   — Phases 10-12 (Imaginal Reconstruction, Body-Energy, Ritual)
Stream: Guidance / Daimon       — Phase 13    (Daimon/Guidance/Vocation)
Stream: Rendering / Cosmology   — Phases 14-15 (Nonordinary Rendering, Physical De-solidification)
Stream: Integration / Ecology   — Phases 16-17 (Ecology/Animism, Social Incarnation)
```

### Risk (~12)

Failure modes — ways a phase or practice can go wrong.

```typescript
{
  id: string;                    // e.g. "risk-occult-inflation"
  label: string;                 // e.g. "Occult Inflation"
  statement: string;             // e.g. "Believing that esoteric knowledge makes one superior"
  causedBy?: string[];           // Edge references to phases/practices that spawn this risk
  correctives?: string[];        // Edge references to correctives that mitigate this
}
```

### Corrective (~28)

Practices or perspectives that mitigate risks.

```typescript
{
  id: string;                    // e.g. "corrective-madhyamaka"
  label: string;                 // e.g. "Madhyamaka"
  statement: string;             // e.g. "Apply four-corner negation to any fixed view"
  practice?: string;             // e.g. "Daily: question one metaphysical certainty"
  corrects?: string[];           // Edge references to risks this corrects
}
```

### Warning (7)

Category errors — distinct from risks, these are conceptual confusions that derail understanding.

```typescript
{
  id: string;                    // e.g. "warning-physics-magic"
  label: string;                 // e.g. "Physics-Magic Category Error"
  statement: string;             // e.g. "Using quantum physics to prove magic conflates descriptive and prescriptive domains"
}
```

### Tradition (4)

Registered traditions with definitions, core claims, practices, texts, and category errors.

```typescript
{
  id: string;                    // e.g. "tradition-neoplatonism"
  label: string;                 // e.g. "Neoplatonism"
  aliases?: string[];            // e.g. ["Late Antique Platonism"]
  stream: string;                // e.g. "Greek Platonism / Neoplatonism"
  period?: string;               // e.g. "Late Antiquity"
  geography?: string[];          // e.g. ["Mediterranean"]
  definition: string;            // One-paragraph definition
  coreClaims: string[];          // The tradition's essential positions
  corePractices?: string[];      // Practices associated with the tradition
  coreTexts?: string[];          // Canonical texts
  representativeFigures?: string[];
  evidenceTier: EvidenceTier;
  useFor: string[];              // What this tradition is good for in Atlas context
  doNotUseFor: string[];         // What to avoid doing with this tradition
  commonCategoryErrors: string[];// Mistakes people make when referencing this tradition
  risks: string[];               // Risk labels
  correctives: string[];         // Corrective labels
  relatedTraditions?: {
    traditionId: string;
    relation: RelationKind;      // See below
    note: string;
  }[];
  status: "draft" | "review_needed" | "approved" | "deprecated";
}
```

**RelationKind enum:**
- `historical_influence` — A directly influenced B
- `reception` — A was received/interpreted by B
- `translation_transmission` — Transmitted through translation
- `conceptual_parallel` — Similar ideas, no direct influence
- `shared_vocabulary` — Use overlapping terminology
- `modern_adaptation` — B is a modern adaptation of A
- `appropriation_risk` — May be appropriating from A
- `corrective_relation` — B corrects a risk in A
- `practice_resonance` — Practices share structural similarity

### Source Card (8)

Annotated references to primary/secondary sources — this is the evidence layer.

```typescript
{
  id: string;                    // e.g. "source-iamblichus-mysteries"
  title: string;                 // e.g. "On the Mysteries"
  author: string;                // e.g. "Iamblichus"
  tradition: string;             // e.g. "Neoplatonism / Theurgy"
  phase: number[];               // Which phases this source is relevant to [12, 13]
  sourceType: "primary_text" | "book" | "paper" | "essay" | "talk" | "website";
  epistemicTier: EvidenceTier;
  coreContribution: string;      // One-sentence: what this source does for the Atlas
  breaks?: string[];             // Assumptions this source breaks
  grounds?: string[];            // Concepts this source grounds
  enables?: string[];            // Practices/concepts this source enables
  risks?: string[];              // Risks this source introduces
  correctives?: string[];        // Correctives this source suggests
  bestUsedFor: string;           // When to reach for this source
  caution?: string;              // What to watch out for
}
```

### Edge (38)

Relationships between any two nodes in the graph.

```typescript
{
  id: string;                    // e.g. "edge-phase-1-to-2"
  source: string;                // Source node ID
  target: string;                // Target node ID
  kind: EdgeKind;                // See below
  label: string;                 // Human-readable description
  strength?: number;             // 1-3, intensity of the relation
  confidence?: EvidenceTier;     // How confident we are this edge exists
  note?: string;                 // Additional context
}
```

**EdgeKind enum (17 types):**
- `historical_influence` — direct historical influence
- `reception` — reception/interpretation
- `translation_transmission` — transmitted via translation
- `conceptual_parallel` — conceptual parallel, no direct link
- `grounds` — provides foundation for
- `breaks_assumption` — breaks an assumption of
- `replaces_with` — replaces concept/practice with
- `enables_practice` — enables a practice
- `risks` — introduces a risk
- `corrects` — corrects a risk
- `incarnates_as` — manifests as
- `evidenced_by` — is evidenced by
- `contained_in` — is contained in
- `bridges` — transitions between phases
- `pressure_tests` — stress-tests
- `category_error_warning` — flags a category error
- `maps_to_phase` — maps to a phase
- `maps_to_risk` — maps to a risk
- `maps_to_practice` — maps to a practice

## Load-Time Graph (runtime)

At runtime, `loadGraph.ts` assembles the `Graph` object:

```typescript
interface Graph {
  phases?: Phase[];
  assumptions?: Assumption[];    // not yet populated
  claims?: Claim[];              // not yet populated
  practices?: Practice[];        // not yet populated
  risks?: Risk[];
  correctives?: Corrective[];
  warnings?: Warning[];
  sourceCards?: SourceCard[];
  traditions?: Tradition[];
  edges?: Edge[];
}
```

The graph is loaded once and cached via `getPhaseCache()` / `getCachedGraph()` in `src/atlas/graph/phaseCache.ts`. All AI pipeline components (router, classifier, answer generator, evaluator) read from this cache.

## Graph Packet (for LLM context)

When a user submits a claim, the pipeline builds a `GraphPacket` — a compressed subset of the graph relevant to that specific query:

```typescript
interface GraphPacket {
  userClaim: string;
  mode: "atlas" | "guide";
  primaryPhase?: { id, label, phaseNumber };
  assumptions: string[];
  demolition?: string;
  replacementModel?: string;
  graphPath: { nodeId, label, kind }[];
  sourceCards: SourceCard[];
  risks: { id, label, causedBy? }[];
  correctives: { id, label, practice? }[];
  evidenceTier?: EvidenceTier;
  categoryWarnings: string[];
  suggestedPractice?: string;
}
```

This is what gets injected into the LLM's system prompt during the streaming chat pipeline.

## What's Stored in D1 vs What's in the Graph

| Data | D1 | Kuzu (planned) | YAML |
|---|---|---|---|
| Users & profiles | `users` table | — | — |
| Chat sessions | `chat_sessions` table | — | — |
| Chat messages | `chat_messages` table | — | — |
| Q&A records | `qa_records` table | — | — |
| Journal entries | `journal_entries` table | JournalEntry nodes | — |
| Personal mappings | `personal_mappings` table | MAPS_TO edges | — |
| Global learning candidates | `global_learning_candidates` table | — | — |
| Phase definitions | — | Phase nodes | phases.yaml (source) |
| Risks | — | Risk nodes | risks.yaml (source) |
| Correctives | — | Corrective nodes | correctives.yaml (source) |
| Traditions | — | Tradition nodes | traditions.yaml (source) |
| Source cards | — | SourceCard nodes | sourceCards.yaml (source) |
| Edges | — | Edges between all nodes | edges.yaml (source) |
| Essays (future) | — | Essay nodes | memory/essays/*.md |

D1 is for transactional data (users, sessions, messages, journals). YAML is the source of truth for the graph definition. Kuzu will be the runtime graph database for Cypher queries.

## Future Graph Extensions (from essay.md)

Once the essay layer is built, Kuzu will gain:

```cypher
// Essay nodes
CREATE NODE TABLE Essay (
  id STRING, title STRING, slug STRING,
  primaryPhase INT, evidenceTier STRING,
  confidence STRING, status STRING,
  publishedAt DATE, author STRING,
  PRIMARY KEY (id)
);

// Essay-to-essay relations
CREATE REL TABLE BUILDS_ON (FROM Essay TO Essay);
CREATE REL TABLE CHALLENGES (FROM Essay TO Essay);
CREATE REL TABLE RESPONDS_TO (FROM Essay TO Essay);
CREATE REL TABLE PARALLEL_TO (FROM Essay TO Essay);

// Essay-to-phase relations
CREATE REL TABLE ADDRESSES_PHASE (FROM Essay TO Phase);

// Essay-to-source relations
CREATE REL TABLE CITES_SOURCE (FROM Essay TO SourceCard, quotes STRING[]);
```

And from the folder-native workflow:

```cypher
// Workflow state (optional, could stay in folder)
CREATE NODE TABLE WorkflowRun (
  id STRING, essaySlug STRING,
  stage INT, status STRING,
  startedAt DATE, completedAt DATE,
  PRIMARY KEY (id)
);
```

## Contribution Model: Personal → Global Pipeline

The key question: how does a user's personal exploration feed back into the global graph?

### The Problem

The global Atlas (YAML files) must stay curated. Not every user discovery belongs in the global graph. But valuable discoveries — new edges between existing nodes, new source card proposals, gap detections — shouldn't be lost.

### The Mechanism

```
User's personal Kuzu instance
  → Agent detects a pattern cross-referencing personal journal
    ↔ global graph
  → "Candidate" flagged in local graph (confidence > threshold)
    → Submitted to review queue (D1 candidates table)
      → Admin reviews
        → Approved: merged into YAML + global Kuzu
        → Rejected: feedback to user's agent
```

### What Users Can Contribute

| Contribution Type | How Agent Detects It | Global Value | Curation Required |
|---|---|---|---|
| **New edge proposal** | User journals about phases X and Y repeatedly → agent proposes a new edge | Novel connections between existing nodes | Medium — admin validates the edge makes sense |
| **Gap detection** | User keeps asking about topic Z, no source card covers it | Identifies missing source material | Low — just a flag, no data to validate |
| **Source card suggestion** | User uploads PDF, agent extracts key claims | New evidence layer material | High — admin must read source, write card |
| **Practice-to-phase mapping** | User logs a practice and agent maps it to a phase | Grounds a phase in practical experience | Low — practice validation tier |
| **Essay request** | User's phase engagement pattern suggests an underserved cluster | Shapes editorial calendar | Low — just a signal |
| **Edge confidence upgrade** | Multiple users independently traverse the same path | Strengthens evidence for an edge | Low — aggregate signal, not individual |

### What Users Cannot Contribute

Users cannot add source cards from unread sources. The agent can only work with material the user has provided (PDFs, URLs, texts in their R2 bucket). New primary source material requires someone to read, extract, and write the card.

### The Review Pipeline

```
User's agent → POST /api/graph/candidates
  Body: {
    type: "edge" | "source_card" | "gap" | "essay_request",
    data: { ... },
    confidence: 0.85,
    userPhaseContext: [12, 13],     // anonymized
    supportingEvidence: "user journals...",
  }
  → Stored in D1 `graph_candidates` table
    → Admin reviews via `/admin/graph-candidates`
      → Approve: runs scripts/import-graph.mjs with new data
      → Reject: updates candidate status with reason
        → User's agent notified on next sync
```

### Propagation

When a contribution is approved:

1. YAML file updated (source of truth)
2. `generate-graph-json.mjs` re-run
3. `generated-data.ts` updated
4. Global Kuzu graph rebuilt
5. All users' agents pick up changes on next weekly sync

## Brainstorm: Global Contribution from User Agents

The user raises a hard problem: each user's Letta agent, exploring their personal context, could contribute to the global graph. But how? And what about adding new source material — the core bottleneck?

### The Asymmetry Problem

```
User has:  journal entries, practice logs, chat history, birth chart, personal Kuzu instance
User sees: a small slice of the global graph (relevant phases, their essays)
User does: asks questions, journals, explores
User CAN contribute: new edges between existing nodes, gap flags, essay requests

User CANNOT contribute: valid new source cards (hasn't read the source),
                       new phase definitions (doesn't have editorial scope),
                       structural changes to the framework
```

The agent is in the same position. It can reason about what the user shows it. It cannot read a book the user hasn't uploaded.

### What Each User's Agent Actually Generates

| What Agent Generates | Is It Valuable Globally? | How To Extract Signal |
|---|---|---|
| `write_to_graph` facts about the user | No — personal data | Never leaves user's instance |
| New edges between existing phases/sources the user explores | Yes — if pattern is novel | Aggregate across users, surface high-frequency novel paths |
| Gap detection ("I keep asking about X, no source card exists") | Yes — identifies missing material | Submit as `graph_candidate` with type `gap` |
| Personal essays in user's `memory/essays/` | Maybe — if they contribute novel synthesis | User can opt to submit for review |
| Phase affinity patterns from user's journal | Yes — validates existing edges | Anonymized aggregate only |
| Source card suggestions from user's uploaded documents | Yes — but needs human review | Proposed card + extracted quotes → review queue |

### The Signal Problem

A single user's pattern is noise. A hundred users independently discovering the same edge is signal.

```
Aggregate principle:
  If 1 user journals about Phase 7 → Phase 12 connection:   noise
  If 10 users independently journal about Phase 7 → 12:     signal
  If 50 users:                                               high-confidence edge proposal
```

The global graph doesn't need every user's agent submitting candidates. It needs **aggregate, anonymized pattern detection** across user instances.

### Architecture for Global Signal Extraction

```
Each user's Kuzu instance:
  → Records de-identified phase-transition co-occurrence stats
    (no raw text, no PII, just: user_affinity[phaseA][phaseB] += journal_co-occurrence_weight)
  → Periodically pushes compact affinity aggregates to global endpoint
    Not: "user says X about Phase 12"
    Just: { sourcePhase: 7, targetPhase: 12, coOccurrence: 0.73, userCount: 1 }

Global aggregator (D1 or lightweight service):
  → Receives anonymized affinity reports
  → Accumulates: edge_7_12.totalCoOccurrence += 0.73
                   edge_7_12.userCount += 1
  → When userCount threshold crossed: generates edge candidate
    → Admin reviews: "50 users independently traverse Phase 7 → Phase 12.
       No edge exists. Recommend adding: 'Emptiness practice naturally
       opens ritual understanding' — `conceptual_parallel` edge."
```

No raw journal data ever leaves the user's instance. Only phase-level affinity scores — unidentifiable, aggregate-only.

### The Source Material Bottleneck (Unsolved)

This remains the hard problem. The graph has 8 source cards. To get to 80, someone must read 72 more texts.

The agent can help with:

1. **Extraction from user uploads** — User uploads a PDF to their R2 bucket. Agent reads it, proposes a source card draft. Admin reviews. This distributes the reading workload across users who already have the texts.

2. **Multi-hop discovery** — Source card A cites text B. If A exists in the graph, the agent can attempt to find text B (via URL, citation lookup) and propose it as a candidate source card. Still needs human review, but the discovery is automated.

3. **Citation graph import** — Given a paper/book with footnotes, the agent can extract all cited works and check which are already in the graph. The citation network becomes a source card discovery pipeline.

4. **The "long tail" strategy** — Don't try to add 80 source cards. Add the 8 most impactful ones for each phase cluster. Source cards that bridge multiple phases are worth more than phase-specific ones. The 8 current cards cover 11 of 17 phases. One card (Plotinus) covers phases 2 and 7. Adding one card per uncovered phase cluster (phases 1, 3-5, 8-9, 11, 15, 17) gets full coverage with ~6 more cards.

### The Loop Closes

```
Global graph (YAML + Kuzu)
  → synced to each user's instance
    → user explores, journals, their agent reasons
      → de-identified affinity patterns extracted
        → aggregated across all users
          → new edge candidates emerge
            → admin reviews, approves
              → global graph updated
                → synced to each user's instance (loop)

Source cards:
  → admin or users upload texts
    → agent proposes source card drafts
      → admin reviews, approves
        → global graph updated
```

The user's personal exploration feeds the global graph through aggregate pattern detection — not through direct contribution. No noise, no curation burden. Only high-confidence signals from many users independently finding the same thing.
