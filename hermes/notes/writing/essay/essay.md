# Essay Layer — Guiding Principle

## The Stack

```
Layer 3: Essays (comparative abstraction layer)
    — referenced, cross-linked, quotable
    — each essay = a take with a voice
    — forms a knowledge graph above the source layer
Layer 2: RAG Database (per-phase source material)
    — key texts, papers, primary sources chunked per phase
    — retrievable for answer grounding
Layer 1: Atlas Graph (17 phases, risks, correctives, traditions)
    — the map, not the territory
    — Kuzu embedded graph DB
```

We create the Atlas and the graph for AI answers and useful paths. From this we create a RAG database for each stage of the path with key source material. From this we write interesting content in the form of essays.

## The Essay Layer

Essays are the bridge between source material and the reader. They are not the graph and they are not the source. They are a comparative abstraction layer — a curated take that references actual quotes, links phases, and stakes a position.

### Schema

```typescript
interface Essay {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;                   // always "Re-Rendering Atlas" (our voice)
  publishedAt: string;              // ISO date
  updatedAt?: string;
  
  // Phase mapping — which phases this essay primarily addresses
  primaryPhase: number;             // 1-17
  secondaryPhases: number[];        // 0-3 other phases it bridges to
  
  // Relation types to other essays
  relations: {
    essayId: string;
    type: "builds_on" | "challenges" | "parallel" | "precedes" | "responds_to";
    note: string;
  }[];
  
  // Source grounding — every substantive claim links to source material
  sources: {
    sourceCardId: string;           // references content/sourceCards.yaml
    quotes: string[];               // verbatim quotes used
    pages?: string;                 // page reference
  }[];
  
  // The essay body — written with our voice
  body: string;                     // markdown, with inline phase references
  
  // Epistemic status
  evidenceTier: EvidenceTier;       // from graph schema
  confidence: "draft" | "exploratory" | "established" | "revised";
  status: "idea" | "draft" | "reviewed" | "published" | "deprecated";
  
  // Tags for cross-linking
  tags: string[];                   // traditions, figures, concepts
  
  // Contradiction handling
  supersededBy?: string;            // essay ID if this essay is deprecated
  challenges?: string[];            // essay IDs this essay directly disagrees with
}
```

### The Author Voice: Re-Rendering

Every essay is written with a consistent author prompt for DeepSeek. This is not a neutral wiki. It is a specific lens — the Re-Rendering framework. The voice is:

- **Clarifying, not claiming** — "This concept is better understood as..." rather than "This is what X truly means."
- **Comparative, not dogmatic** — essays compare traditions, figures, and concepts across phases. They stake positions but always show the alternative.
- **Grounded, not speculative** — every substantive claim has a source card reference and verbatim quote. No floating assertions.
- **Self-aware of its own frame** — the essay knows it is written within the 17-phase Atlas and references that framing explicitly.

### Author Prompt (for DeepSeek generation)

```
You are a writer in the Re-Rendering tradition — a 17-phase framework for
understanding metaphysical assumptions, their demolition, and their
replacement models. You write essays that illuminate connections between
traditions, figures, and concepts across these phases.

Your voice is clarifying, comparative, and grounded. You do not make claims
without source quotes. You present alternative views fairly before staking
a position. You explicitly reference Atlas phases by number and name when
they provide the framing.

Every essay must:
- Reference at least one primary source with a verbatim quote
- Map to at least one Atlas phase, preferably showing how it bridges phases
- Acknowledge counter-positions or risks
- End with an open question, practice, or inquiry — not a conclusion

You are not a neutral encyclopedia. You are a lens. Your lens is the
Re-Rendering Atlas. Name your lens. Show your work. Cite your sources.
```

### Why Essays Are a Separate Graph Layer

The source layer (phase RAG) is chunked primary texts — raw, unfiltered, retrievable. The graph layer (Kuzu) is the structural map — phases, risks, correctives, relations.

Essays sit above both:

```
Essays (comparative layer)
    ↑    references actual quotes from sources
    ↑    links phases across the graph
    ↑    stakes interpretations, not just facts
    ↑    can challenge other essays (contradiction edges)
    
Source Cards / RAG (evidence layer)
    ↑    chunked texts, verbatim, immutable
    
Atlas Graph (structural layer)
    ↑    phases, risks, correctives, traditions, relations
```

An essay takes a position that uses source material as evidence but is not reducible to it. Two essays on the same topic with the same sources can disagree. That disagreement is itself knowledge — recorded as a `challenges` edge in the essay graph.

### The Essay Graph (Kuzu)

```cypher
// Node types
CREATE NODE TABLE Essay (
  id STRING, title STRING, slug STRING,
  primaryPhase INT, evidenceTier STRING,
  confidence STRING, status STRING,
  publishedAt DATE, author STRING,
  PRIMARY KEY (id)
);

// Relations between essays
CREATE REL TABLE BUILDS_ON (FROM Essay TO Essay);
CREATE REL TABLE CHALLENGES (FROM Essay TO Essay);
CREATE REL TABLE RESPONDS_TO (FROM Essay TO Essay);
CREATE REL TABLE PARALLEL_TO (FROM Essay TO Essay);

// Essays reference phases
CREATE REL TABLE ADDRESSES_PHASE (FROM Essay TO Phase);

// Essays use source cards as evidence
CREATE REL TABLE CITES_SOURCE (FROM Essay TO SourceCard, quotes STRING[]);
```

### How This Works with the Existing Stack

1. **Phase 0** — Atlas graph exists (Kuzu), sources exist (sourceCards.yaml)
2. **Phase 1** — Write essays: pick a primary phase + secondary phases, write with the author prompt, include verbatim quotes from source cards
3. **Phase 2** — Import essays into Kuzu as `Essay` nodes with edges to phases and source cards
4. **Phase 3** — The Letta agent's `query_knowledge_graph` tool can now traverse: "Find essays that bridge Phase 12 (Ritual Re-Rendering) and Phase 13 (Daimon/Guidance)"
5. **Phase 4** — The `/research-deep` pattern: when answering a user query, the agent retrieves relevant essays as context, not just raw graph data

### What We Can Borrow from obsidian-second-brain

- **AI-first note format** — frontmatter schemas, recency markers, mandatory cross-links. Every essay body has a `## Sources` section with link-back to the source card.
- **Scheduled synthesis** — A weekly agent that cross-references essays for contradiction edges ("Essay A says X, Essay B says not-X — link with `challenges`")
- **Dual-track research** — For essay drafting: open-web track (Perplexity) for "what are people saying about this" + vault-grounded track (our graph + existing essays) for "what have we already established"
- **Distill pattern** — `/obsidian-distill` condenses a long source into key claims with provenance. Our version: ingest a source card, distill into claim nodes linked to the source.
- **Graduate pattern** — `/obsidian-graduate` turns an idea fragment into a full project. Our version: a cluster of related questions/notes in the graph graduates into an essay assignment.

## Essay Generation Pipeline: Folder-Native (OKF + ICM)

Building on Eugeniu Ghelbur's folder-native pattern (Google OKF for memory × Edinburgh ICM for workflow), the essay generation pipeline uses a hybrid: **Kuzu for queryable graph relationships + folders for inspectable staged workflows**.

### Why Hybrid

| Pure Kuzu | Pure Folder-Native | Hybrid (ours) |
|---|---|---|
| Fast Cypher traversal | Any editor can read/write | Kuzu for queries, folders for stages |
| No human intermediary | Human reviews at every step | Kuzu drives discovery, folders drive creation |
| Opaque intermediate state | Every stage is a file | Both: graph query → folder stage → graph update |
| Hard to version diffs | Git-native | Essays versioned in folders, relations in Kuzu |

### The Layout

```
essays/
  memory/                       ← OKF: what the system knows
    phases/
      01-dashboard-diagnosis.md
      02-mechanicality.md
      ...
      17-social-incarnation.md
    traditions/
      neoplatonism.md
      gnosticism.md
      tantra.md
      early-buddhism.md
    source-cards/
      plotinus-ennads.md
      iamblichus-mysteries.md
      nagarjuna-mulamadhyamakakarika.md
      ...
    essays/
      ritual-re-rendering-as-metaphysical-technology.md
      daimon-and-the-socratic-impulse.md
      ...
    MEMORY.md                    ← index: one line per note
  workflow/                      ← ICM: how essay generation runs
    01-discover/
      CONTEXT.md                 ← instructions for this step
      output.md                  ← what the step produced
    02-research/
      CONTEXT.md
      output.md
    03-structure/
      CONTEXT.md
      output.md
    04-draft/
      CONTEXT.md
      output.md
    05-review/
      CONTEXT.md
      output.md
    06-publish/
      CONTEXT.md
      output.md
```

`memory/` mirrors the Kuzu graph as flat markdown files. `workflow/` is the numbered pipeline that produces one essay per run. The two stay in sync: graph writes update memory files, and memory file changes trigger graph re-imports.

### The Pipeline (One Essay, Six Stages)

#### Stage 01 — Discover
Reads Kuzu graph for unwritten essay candidates. Finds clusters of related source cards and phases that have no covering essay.

```
CONTEXT.md:
  Read: Kuzu query — MATCH (s:SourceCard)-[:RELATES_TO]->(p:Phase)
        WHERE NOT EXISTS { MATCH (e:Essay)-[:ADDRESSES_PHASE]->(p) }
        RETURN p.number, p.label, collect(s.title) as sources
  Task: Identify the top candidate cluster. One sentence per cluster:
        which phases, which sources, what gap.
  Write: output.md — ranked list of 1-3 essay candidates with rationale
```

```
output.md (example):
  Candidate 1 (score: 0.85):
    Phases: 12 (Ritual Re-Rendering), 13 (Daimon/Guidance)
    Sources: Iamblichus, On the Mysteries; Corbin, Mundus Imaginalis; Plotinus, Enneads
    Gap: No existing essay bridges the ritual-daimon interface.
    The sources converge on theurgy as participatory transformation, but
    no essay has framed this as a phase transition.
```

Human reviews the candidates. Picks one or adjusts. Moves to Stage 02.

#### Stage 02 — Research
Reads Kuzu graph for full context on the selected phases, sources, and related traditions. Researches external context via Perplexity (dual-track).

```
CONTEXT.md:
  Read: Kuzu — full phase data, source cards with verbatim quotes,
        related traditions, existing essays on adjacent topics
  Task: For each source, extract 2-3 key verbatim quotes with page refs.
        Note contradictions between sources. Identify the main claim
        the essay will make.
  Write: output.md — research dossier with quotes, contradictions,
        and a proposed thesis statement
```

Human reads the dossier. Approves or redirects. Moves to Stage 03.

#### Stage 03 — Structure
Maps the essay arc: which phases it bridges, how it opens, what positions it stakes, how it handles counter-arguments, what it ends with.

```
CONTEXT.md:
  Read: ../02-research/output.md
  Task: Write a structured outline with:
        - Opening: the lens, the frame, the question
        - Body paragraph 1: phase X — what it claims, how the source supports
        - Body paragraph 2: phase Y — comparative move, bridge between X and Y
        - Body paragraph 3: counter-position or risk
        - Closing: inquiry, practice, open question
        For each section, note which verbatim quotes anchor it.
  Write: output.md — section-by-section outline with source anchors
```

Human reviews the outline. Edits structure. Approves. Moves to Stage 04.

#### Stage 04 — Draft
Writes the full essay with the Re-Rendering author voice. Every paragraph grounded in a source quote.

```
CONTEXT.md:
  Read: ../03-structure/output.md
  Read: memory/ (for voice reference)
  Author prompt: [the Re-Rendering prompt from above]
  Write: output.md — full essay body, markdown
```

Human reads the draft. Edits tone, fixes quotes, adjusts emphasis. Moves to Stage 05.

#### Stage 05 — Review
Validates the essay against graph data: every phase reference exists, every source card exists, no contradictory claims with existing essays.

```
CONTEXT.md:
  Read: ../04-draft/output.md
  Read: Kuzu — verify all phase refs, source refs, tradition refs
  Task: 
    1. Verify every `[[phase:XX]]` link resolves in Kuzu
    2. Verify every cited source card exists with correct quote
    3. Check existing essays for direct contradictions
    4. If contradiction found, decide: challenge edge or revise
    5. Assign evidence tier based on source quality
  Write: output.md — validation report + any required relation edges
```

Human approves the validation. Merges any contradiction decisions. Moves to Stage 06.

#### Stage 06 — Publish
Final essay written to `memory/essays/<slug>.md`. Kuzu graph updated with Essay node + edges.

```
CONTEXT.md:
  Read: ../04-draft/output.md (final approved version)
  Read: ../05-review/output.md (validation result + edge specs)
  Task:
    1. Write to memory/essays/<slug>.md — AI-first note with full frontmatter
    2. Create MATCH/MERGE queries for Kuzu:
       - Essay node: id, title, slug, primaryPhase, evidenceTier, confidence, status, publishedAt
       - ADDRESSES_PHASE edges to primary + secondary phases
       - CITES_SOURCE edges with verbatim quotes array
       - BUILDS_ON / CHALLENGES / PARALLEL_TO edges to related essays
    3. Update MEMORY.md index with new essay entry
  Write: output.md — confirmation with Kuzu query log
```

### The Compounding Loop

Same pattern as Ghelbur's weekly client report. After publish, the agent runs the discovery stage again. The new essay is now in the graph. The query for "unwritten essay candidates" excludes the new covered ground. Next run starts smarter.

```
Cycle:
  1. Discover: Kuzu → what gaps remain
  2. Research: Kuzu + Perplexity → fill dossier
  3. Structure: Human approves arc
  4. Draft: DeepSeek writes with Re-Rendering voice
  5. Review: Kuzu validates, human signs off
  6. Publish: Essay → memory/ + Kuzu nodes + edges
  └─→ Loop to 1: the new essay changes what "gaps remain"
```

### Weekly Scheduled Agent

```
Agent "essay-writer":
  Schedule: Sunday 8 AM
  Read: Kuzu — MATCH clusters of sources with no covering essay
  If candidate found AND confidence > 0.7:
    Run pipeline stages 01-06 with human review gates
  If no strong candidate:
    Write summary of current graph coverage
    Flag which phases have the thinnest source card density
  Write: Weekly output to memory/essays/coverage-report.md
  Update: Kuzu with any new edges or phase coverage annotations
```

## Cool Mechanics This Enables

### 1. Topology-Driven Essay Assignment

The graph automatically generates assignments. When Kuzu detects a "hot cluster" — multiple source cards converging on a phase pair with no covering essay — it creates an essay ticket. Not manually. The graph structure itself drives what gets written next.

```
Kuzu query:
MATCH (s:SourceCard)-[:RELATES_TO]->(p1:Phase)
MATCH (s)-[:RELATES_TO]->(p2:Phase)
WHERE p1.number < p2.number
AND NOT EXISTS { MATCH (e:Essay)-[:ADDRESSES_PHASE]->(p1)
                 MATCH (e)-[:ADDRESSES_PHASE]->(p2) }
RETURN p1.number, p1.label, p2.number, p2.label,
       collect(s.title) as sources, count(s) as sourceCount
ORDER BY sourceCount DESC
```

Output: "3 source cards bridge Phase 12 and Phase 13. No essay covers this bridge. Suggested: 'Theurgy as Phase Transition: Ritual Re-Rendering and the Daimonic Encounter.'" → auto-creates workflow/01-discover with this assignment.

### 2. Contradiction-Driven Revision

When a new source card is added that contradicts an existing essay's position, the system doesn't just flag it. It starts a revision workflow:

```
New source card "Proclus, Elements of Theology" added:
  → Kuzu detects: this source's core claim contradicts
    essay "Daimon as Exclusively Socratic" (both address Phase 13)
  → essay-writer agent flags existing essay
  → workflow starts: 01-discover finds the contradiction,
    02-research gathers both sides, 03-structure maps a reconciliation,
    04-draft writes a revised essay
  → Original essay gets `supersededBy` edge pointing to new one
  → Human reviews, approves, publishes
```

The graph edition maintains an audit trail. Nothing is deleted. "What did we think about this before Proclus?" is answered by following the `supersededBy` chain.

### 3. Evidence Tier Propagation + Cascade

Essays inherit their evidence tier from the sources they cite. When a source card gets upgraded (new academic translation, newly discovered manuscript), every essay that cites it gets flagged for tier review:

```
Source card "Iamblichus, On the Mysteries" upgraded:
  evidenceTier: "secondary" → "primary"
  
Kuzu:
MATCH (s:SourceCard {id: "iamblichus-mysteries"})-[:CITES_SOURCE]-(e:Essay)
RETURN e.title, e.evidenceTier
  → 3 essays currently at "secondary" now eligible for "primary"
  → Agent drafts tier-update notes for each
  → Human reviews, approves, tiers propagate
```

Reverse direction also works: an essay that cites 5 secondary sources gets capped at "secondary" evidence tier regardless of how well it's written.

### 4. Cross-Essay Dialogue (The Synthesis Cascade)

When 3+ essays exist on related phases, the system auto-generates a meta-essay that synthesizes them. This recurses:

```
Layer 1: Essay A (Phase 12), Essay B (Phase 13), Essay C (Phase 12→13 bridge)
  → Agent reads all three, generates Synthesis 1: "Three Views on the Ritual-Daimon Interface"
    with explicit agreement/disagreement map

Layer 2: Synthesis 1 + Essay D (Phase 14, adjacent) + new source card
  → Agent generates Synthesis 2: "The Transformative Arc: Phases 12-14"
    at a higher abstraction level

Layer 3: Synthesis 2 + Synthesis 1 + Essays A-E
  → Agent generates "The Re-Rendering Framework: A Reader's Guide"
    — the meta-meta essay that orients new readers
```

Each synthesis creates new Kuzu edges (`SYNTHESIZES`) pointing back to its source essays. The Letta agent can answer "what's the shortest path from beginner to this concept?" by traversing the synthesis chain.

### 5. Reading Lists as Graph Traversal

For any phase, the system generates a recommended reading path through essays and sources:

```
Input: Phase 7 (Emptiness)
Output (from Kuzu traversal):
  Start:   sourceCard "Nagarjuna, MMK" (primary text)
  Then:    essay "Emptiness as Method, Not Doctrine" (orientation)
  Then:    essay "Dependent Arising and the Limits of Nihilism" (bridge to Phase 8)
  Then:    challenge essay "Is Emptiness Compatible with Theurgy?" (contradiction)
  Then:    practice "Madhyamaka Dialectic: A 21-Day Inquiry" (from essay closing)
  Then:    synthesis: "Emptiness in the Re-Rendering Frame" (meta-view)
```

The agent can also generate *personalized* reading lists based on what the user has already read (from journal entries mapped to phases via Kuzu).

### 6. The Negative Space Map

The most interesting mechanic: the agent visualizes what *doesn't* exist.

```
Weekly negative space report:
  
  Phases with no source cards:
    - Phase 9 (Visionary Cosmologies) — 0 source cards
    
  Source cards cited by no essays:
    - "Proclus, Elements of Theology" — 0 essays cite it
    - "Corbin, Creative Imagination" — cited in 1 essay, could bridge 3 more phases
    
  Essays that challenge nothing:
    - "Mechanicality and Free Will" — no CHALLENGES edges
    → Suggestion: find a counter-position source card, commission a reply
    
  Phase bridges with thin coverage:
    - Phase 6 → Phase 14: 0 essays, 1 source card overlap
    - Phase 3 → Phase 17: 0 essays, 0 source cards
    → These are "cold edges" — potential novel territory
```

The gaps become the editorial calendar. The agent doesn't just generate the next essay — it generates a 4-week plan based on which gaps are most connected to existing material.

### 7. Live-Updating Source Grounding

When a source card is updated (new translation, corrected page refs), every essay that cites it gets an automated update note:

```
Source card update: "Plotinus, Enneads" — page refs corrected
  → Kuzu MATCH (s:SourceCard)-[:CITES_SOURCE]->(e:Essay)
  → For each essay, agent generates a diff:
    "In essay 'The One and the Many,' the quote from Ennead V.1.6
     is now correctly attributed to Ennead V.1.7. No other changes."
  → Appended to essay frontmatter as `groundingUpdates[]`
  → No automatic body edit — human decides whether the page ref matters
```

### 8. Practice Extraction Across Essays

Every essay ends with an inquiry or practice. The agent can extract all practices across all essays into a curated sequence, mapped to phases:

```
Kuzu query:
MATCH (e:Essay)-[:ADDRESSES_PHASE]->(p:Phase)
RETURN p.number, p.label, e.practice, e.slug
ORDER BY p.number

Output: 17-phase practice sequence
  Phase 1  — Dashboard Diagnosis: "30-day self-survey"
  Phase 2  — Mechanicality: "Catch yourself in a habit loop"
  Phase 3  — Free Will: "Trace one decision back to its roots"
  ...
  Phase 17 — Social Incarnation: "Map your community's phase distribution"
  
→ Written to memory/practices/curated-path.md
→ Letta agent retrieves this when the user asks for practice recommendations
```

### 9. The Hermeneutic Spiral

The system doesn't plateau. Each pass through the pipeline operates at a higher level of abstraction than the last:

```
Pass 1: Write foundation essays (Phase 1-17 basics)
  → New graph edges → new queries reveal gaps
  
Pass 2: Write bridge essays (phase pairs with thin coverage)
  → More edges → new queries reveal cross-phase patterns
  
Pass 3: Write synthesis essays (3+ essays coalescing into meta-view)
  → Even more edges → able to answer "what does the Atlas say about X?"
  → Now ready for comparative essays: "Tantra vs Neoplatonism on Ritual"
  
Pass 4: Write challenge essays (intentional contradictions)
  → CHALLENGES edges → the graph now encodes genuine debate
  → Letta agent can give balanced answers: "Some essays argue X, others Y"
  → More useful than a monolithic "the answer"
```

### 10. The Daimon Pattern (Proactive Recommendation)

The Letta agent, knowing the user's journal entries (mapped to phases via Kuzu), proactively recommends essays and identifies gaps the user is personally exploring:

```
User's last 10 journal entries: 6 tagged Phase 12, 3 tagged Phase 13, 1 tagged Phase 7

Agent:
  "You've been deep in Phase 12 (Ritual Re-Rendering) with some movement
   into Phase 13 (Daimon/Guidance). There's an essay that bridges exactly
   these two: 'Theurgy as Phase Transition.'

   I also notice there's a gap in essay coverage at the Phase 13/14 boundary
   (Daimon → Nonordinary Rendering). Your journal entries suggest you're
   bumping into this transition yourself. Would you like me to draft a
   source card for Phase 14 based on what you've written, which could seed
   an essay there?"

  [If yes]: Agent extracts relevant passages from journal, drafts a source card
  draft, places it in workflow/01-discover for the next essay-writing cycle.
```

This is the loop closing at the individual user level — not just "system writes essays" but "system notices the user is personally exploring a gap and commissions an essay to fill it."

### 11. Adaptive Essay Depth

Essays can be generated at different depths depending on the reader's context (from their profile / birth chart → phase affinity mapping):

```
Light:  "Phase 13 (Daimon/Guidance) — the encounter with the daimon as
         the threshold between ritual competence and genuine transformation."
Normal: Full essay with source quotes, cross-phase comparisons, risks.
Deep:   Full essay + 5 additional source cards + 2 challenge essays cited
        + practice sequence + "for further reading" with personalized phase affinities.
```

The Letta agent selects depth based on the user's `insightDepth` preference from their profile. The same essay node in Kuzu has a `bodyLight`, `bodyNormal`, `bodyDeep` variant — all generated during Stage 04, stored in the essay markdown as separate sections.

### 12. Editorial Calendar as Graph Output

The weekly agent doesn't just pick one essay. It generates a 4-week plan using graph topology:

```
Week 1: Fill Phase 7 gap (1 source card, 0 essays)
Week 2: Write bridge Phase 7 → Phase 8 (3 source cards overlap, 0 essays)
Week 3: Challenge the new Phase 7 essay with a counter-position from Tradition X
Week 4: Synthesize Phase 6-7-8 into a meta-essay

Rationale (from graph):
  "Phase 7 has the highest source-card-to-essay ratio — material is
   waiting. Week 2 uses the new essay to bridge to Phase 8, which has
   the next highest ratio. Week 3 ensures the Phase 7 essay doesn't
   stand unchallenged. Week 4 consolidates the new cluster into a
   synthesis that orients future readers."
```

### 13. Phase Traversal as Essay Generator

Given a start phase and end phase, the system generates an essay series that walks through the intermediate phases, showing how the frame shifts at each step:

```
Input: Phase 8 (Dependent Arising) → Phase 12 (Ritual Re-Rendering)
Output: 4-essay series
  Essay 1: "From Dependent Arising to Emptiness" (Phase 8 → Phase 7)
  Essay 2: "Emptiness as the Ground of Ritual" (Phase 7 → Phase 12)
  Essay 3: "Ritual Re-Rendering as Dependent Arising in Practice" (Phase 12, bridging back)
  Essay 4: "The Full Arc: How Pratītyasamutpāda Informs Theurgy" (synthesis)
```

The path is found by Kuzu shortest-path traversal. The series is the edge-by-edge walk.

### 14. Bi-Temporal Knowledge State

The system tracks two timelines: when something was true AND when the vault learned it. This enables temporal queries:

```
User: "What did this system think about ritual in July 2026?"
Agent: (walks supersededBy chain backward)
  "In July 2026, the published essay was 'Ritual as Technology' (Phase 12).
   It cited 2 source cards and had a 'speculative' evidence tier.
   It was superseded in August 2026 by 'Theurgy as Participation' which
   added Proclus as a source and upgraded to 'established' tier.
   The key change: the frame shifted from instrumentalist (ritual does X)
   to participatory (ritual participates in X)."

User: "How has the essay coverage of Phase 7 changed over time?"
Agent: (queries Kuzu with temporal filters)
  "June 2026: 0 essays, 1 source card
   July 2026: 1 essay ('Emptiness as Method'), 2 source cards
   August 2026: 1 essay superseded, 1 challenge essay added, 3 source cards
   September 2026: 1 synthesis essay, 2 bridge essays to Phase 6 and 8"
```

### 15. Cross-User Pattern Detection

With multiple graph instances (different users, different journal histories), the agent can detect patterns across users and suggest editorial directions:

```
Aggregate query across 50 user graphs:
  "Users who journal about Phase 12 also journal about Phase 13
   within 2 weeks, 73% of the time."

Insight: The Phase 12→13 transition is a natural progression users discover
on their own. The essay series should prioritize this bridge.

Action: If the Phase 12→13 bridge essay doesn't exist yet, promote it to
top of the editorial calendar. If it exists, add a practice sequence
specifically for users making this transition.
```

All without raw journal data leaving the user's instance — only the aggregate pattern (anonymized, phase-level counts) surfaces to the global layer.

### What Gets Synced Where

| Data | Kuzu | Folder (memory/) | Git |
|---|---|---|---|
| Phase definitions | Nodes + edges | YAML source | YAML in content/ |
| Source cards | Nodes | Markdown notes | sourceCards.yaml |
| Essays | Nodes + edges | Markdown notes | memory/essays/ |
| Workflow state | — | workflow/ stage dirs | workflow/ |
| Essay relations | Edges in Kuzu | Frontmatter in .md | Both |
| Human edits | — | Direct file edit | Tracked in diff |

Kuzu is the **query engine** — fast Cypher traversal, relationship queries, temporal trends. The folder is the **authoring surface** — inspectable, editable, reviewable, versionable. They converge on publish: the essay lives in both, and the weekly agent keeps them in sync.
