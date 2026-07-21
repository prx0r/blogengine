# Build References — Academic Papers & Their Contributions to Hermes

> 9 papers + 1 Hermes bundled skill analyzed for integration into our architecture.
> Each paper has: core contribution, what to implement, what to avoid, and how it maps to our pipeline.

---

## 1. Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki
**arXiv: 2605.25480** — [PDF](https://arxiv.org/pdf/2605.25480)

### Core Contribution
Compiles documents into structured Wiki pages with bidirectional links. Exposes `search`, `read`, and link-traversal as agent tools. Introduces the **Error Book** — a persistent registry of structural and semantic corrections. Outperforms HippoRAG 2, LightRAG, and GraphRAG by 2.0-8.1 F1 on multi-hop QA.

### What to Implement
- **Error Book** — permanent corpus-level corrections registry. Every mistake Hermes catches becomes a reusable constraint.
- **Search/read/traverse tool interface** — clone the retrieval API for Hermes: `search_objects(query)`, `read_object(id, version)`, `follow_links(id, relation)`, `read_sources(id)`, `report_error(id, error)`
- **Bidirectional links** between ROs and their sources

### What to Avoid
Its benchmark target is question answering. Ours is maintained scholarship. Add: source manifests, object versions, update proposals, human review, downstream dependency tracking.

### Pipeline Mapping
→ Stage 5 (Lint): Error Book integration
→ Stage 2 (Impact): search/read/traverse tools for impact analysis

---

## 2. WiCER: Wiki-memory Compile, Evaluate, Refine
**arXiv: 2605.07068** — [PDF](https://arxiv.org/pdf/2605.07068)

### Core Contribution
Addresses the compilation gap: LLMs compiling documents into wikis catastrophically drop critical facts (53-60% failure rate). WiCER's iterative cycle — compile → evaluate with diagnostic probes → refine → recompile — recovers 80% of lost quality in 1-2 iterations. Targeted diagnosis (+0.95) outperforms generic pinning (+0.16).

### What to Implement
- **Diagnostic tests per RO** — small test suites that check: required sources cited, key subjects present, excluded claims not returned, opposing interpretations represented
- **Compile → test → refine → retest loop** — integrated into Stage 5 (Lint+Test)
- **Version-linked test history** — v0.3 passed 7/10 tests, v0.4 passed 9/10

### What to Avoid
Don't over-engineer the tests initially. A test can be simple: "does the RO mention concept X?" and "does it cite at least Y sources?" It doesn't need an exact answer key.

### Pipeline Mapping
→ Stage 5 (Lint+Test): diagnostic tests + refinement loop
→ Version tracking: test pass rate as coverage metric

---

## 3. Proactive Materiality-Scored Pinning for Time-Evolving LLM Wikis
**arXiv: 2606.09877** — [PDF](https://arxiv.org/pdf/2606.09877)

### Core Contribution
When new documents arrive continuously, the compiled knowledge layer has limited attention. Which information is materially important enough to keep "pinned"? Materiality = relevance × novelty × source quality × contradiction strength × coverage gap.

### What to Implement
- **Materiality scoring for impact detection** — when a new source arrives, rank affected ROs by materiality:
  ```json
  {
    "ro:ficino-daimon": { "materiality": "high", "reason": "adds missing historical treatment" },
    "ro:ficino-spiritus": { "materiality": "medium", "reason": "qualifies existing interpretation" },
    "ro:proclus-daimon": { "materiality": "low", "reason": "only indirect reception" }
  }
  ```
- **Deterministic first version** — use title/abstract similarity + shared topics + open research todos + source quality. No model needed.

### What to Avoid
Don't auto-rewrite on every new source. Materiality scoring prevents noisy updates from vaguely related papers.

### Pipeline Mapping
→ Stage 2 (Impact): materiality scoring as the decision function for whether to create a PR

---

## 4. Vector RAG vs LLM-Compiled Wiki: A Preregistered Comparison
**arXiv: 2605.18490** — [HTML](https://arxiv.org/html/2605.18490)

### Core Contribution
Compares compiled wiki against ordinary vector retrieval over a small research corpus. Useful as an evaluation model: test whether compiled ROs actually outperform querying source PDFs.

### What to Implement
- **Two retrieval routes for benchmarking:**
  - Baseline A: question → Vectorize passages → answer
  - Hermes B: question → relevant ROs → sources as fallback → answer
- **Test set**: "What does Ficino mean by daimon?", "How do Ficino and Plotinus differ?", "Which sources connect daimon with vocation?"
- **Comparison metrics**: citation correctness, missing-source rate, latency, cost, consistency, whether RO already contained the answer, how often raw-source fallback was needed

### What to Avoid
Don't treat the architecture as an article of faith. If a compiled RO is worse than direct retrieval, improve the RO rather than trusting it.

### Pipeline Mapping
→ Validation: ongoing benchmark comparing RO-based answers vs. raw retrieval

---

## 5. DeepRefine: Agent-Compiled Knowledge Refinement
**arXiv: 2605.10488** — [PDF](https://arxiv.org/pdf/2605.10488)

### Core Contribution
Studies how agent-compiled knowledge bases can be refined over time rather than treated as one-pass summaries. Refinement must be a first-class operation with explicit type and reason.

### What to Implement
- **Four refinement operations:**
  - `EXPAND` — incorporate genuinely new coverage
  - `CORRECT` — repair unsupported or mistaken material
  - `REORGANIZE` — change structure without changing evidence
  - `DEPRECATE` — retain history but remove from current version
- **Knowledge PR proposal type** — each proposal specifies `proposal_type`, `object_id`, `base_version`, `reason`, and `sources_used`

### What to Avoid
"Refine" must not mean "ask the model to rewrite it more nicely." Every refinement must specify what changed and why.

### Pipeline Mapping
→ Stage 3 (Proposal): proposal_type field determines PR category
→ Stage 4 (Merge): version bump determined by proposal_type

---

## 6. A Design for Companion Knowledge Systems
**arXiv: 2604.12034** — [PDF](https://arxiv.org/pdf/2604.12034)

### Core Contribution
Long-term personal knowledge systems built from interlinked, compiled artifacts rather than disposable conversations. Public scholarly objects + private companion layer.

### What to Implement
- **Public/private separation:**
  - Public: canonical ROs (Ficino on the Daimon) — never silently altered
  - Private: user's notes, reading position, diary entries, questions, astrology correspondences
- **Linking without merging:** `user_note → references → object version`, `diary_entry → occurred_while_reading → object`
- **Private experience never alters canonical scholarship** — the key architectural boundary

### Pipeline Mapping
→ Vision 2 (Personal ROs): private companion layer alongside public ROs
→ Stage 6 (Publish): personal ROs published with `visibility: "private"` flag

---

## 7. Generate FAIR Literature Surveys with Scholarly Knowledge Graphs (ORKG)
**arXiv: 2006.01747** — [PDF](https://arxiv.org/pdf/2006.01747)

### Core Contribution
Method for finding similar research contributions, aligning their descriptions, visualizing comparisons, and publishing reusable literature surveys through the Open Research Knowledge Graph.

### What to Implement
- **Comparison as persistent artifact** — a comparison of Ficino/Plotinus/Proclus on the daimon is itself a scholarly object
- **Explicit comparison dimensions:** ontological_status, relation_to_soul, relation_to_fate, relation_to_astrology, practical_function
- **Source-only comparison prose** — passages from each thinker organized by dimension, no AI synthesis

### What to Avoid
ORKG is designed for scientific contributions, not philosophical commentary. Copy the **comparison object** pattern, not its full ontology.

### Pipeline Mapping
→ Family 5 (Comparative ROs): comparison dimensions as structured RO fields
→ Vision 4 (Comparative Engine): auto-detect comparable ROs and suggest comparison objects

---

## 8. Open Research Knowledge Graph: A System Walkthrough
**arXiv: 2206.01439** — [PDF](https://arxiv.org/pdf/2206.01439)

### Core Contribution
How ORKG represents, curates, and explores research contributions as machine-actionable scholarly knowledge. Stable identities, reusable templates, human correction as normal operation.

### What to Implement
- **Reusable templates for recurring RO families:**
  ```yaml
  template: thinker_on_concept
  fields: [thinker, concept, scope, primary_sources, commentarial_sources, sections, unresolved_questions]
  ```
- **Stable identities** — our `work:`, `ro:`, `concept:` ID convention already matches this
- **Human correction as normal operation** — the knowledge PR workflow (Stage 3-4)

### What to Avoid
Don't import ORKG's full RDF-style granularity unless we later need interoperability with outside scholarly graphs.

### Pipeline Mapping
→ RO Schema: template field in RO JSON determines available sections and validation rules

---

## 9. Analysing the Requirements for an Open Research Knowledge Graph
**arXiv: 2102.06021** — [PDF](https://arxiv.org/pdf/2102.06021)

### Core Contribution
Derives requirements for research knowledge graphs from actual activities scientists perform. Serves scholarship rather than constructing an impressive graph.

### What to Implement
- **Capability checklist for Hermes:**
  - Can I find all relevant sources?
  - Can I identify what has already been synthesized?
  - Can I compare interpretations?
  - Can I inspect provenance?
  - Can I reuse the synthesis in another object?
  - Can I update it when new evidence arrives?
  - Can I reproduce an older version?
  - Can I collaborate without losing attribution?

### What to Avoid
This is architectural discipline rather than code to clone. Use it as a design review checklist.

### Pipeline Mapping
→ System-wide: capability checklist for each pipeline stage during design review

---

## 10. Hermes Bundled LLM Wiki Skill
**Docs:** [Hermes Agent LLM Wiki Skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/research/research-llm-wiki)

### Core Contribution
Hermes already ships a bundled Karpathy LLM Wiki skill implementing ingest/query/lint. This is our foundation — we don't need to build from zero.

### What to Use
- **As our starting point** — clone the skill's conceptual operations (`ingest`, `query`, `lint`) and extend them into Hermes-specific operations
- **As a fallback** — if our RO pipeline is too complex for a quick answer, fall back to the bundled skill's wiki

### What to Extend
```
ingest_source              ← new: Stage 1 (Acquisition)
find_affected_objects      ← new: Stage 2 (Impact)
create_object              ← new: Stage 1-2 (RO creation)
propose_object_update      ← new: Stage 3 (Proposal)
review_update              ← new: Stage 3 (Review)
merge_update               ← new: Stage 4 (Merge)
lint_object                ← extended from bundled lint
test_object                ← new: WiCER diagnostic tests
publish_object             ← new: Stage 6 (Publish)
```

---

## Combined Implementation Roadmap

### Phase 0: Foundation (Bundled Skill + Error Book)
**1-2 days**

- Install the Hermes bundled LLM Wiki skill
- Create `content/research-objects/error-book.json`
- Implement the first error: when a source is incorrectly attributed, record the correction

### Phase 1: Core Pipeline (Search/Read/Traverse + Tests)
**1 week**

- Implement `search_objects`, `read_object`, `follow_links`, `read_sources` as Hermes terminal/web tools
- Create diagnostic test format (YAML per RO)
- Write first test suite for `ro:ficino-daimon` (manual RO)
- Implement compile → test → refine loop

### Phase 2: Impact Intelligence (Materiality Scoring)
**3-4 days**

- Implement materiality scoring: relevance × novelty × quality × gap
- Wire into Stage 2: when new work arrives, rank affected ROs
- Deterministic first version (no model needed)

### Phase 3: Refinement Operations (DeepRefine Types)
**2-3 days**

- Implement EXPAND, CORRECT, REORGANIZE, DEPRECATE as PR types
- Version bumps determined by operation type
- Each PR must specify `reason` and `sources_used`

### Phase 4: Benchmarking (RAG vs RO Comparison)
**2-3 days**

- Build two retrieval routes
- Create test set of 10-20 questions
- Run comparison: citation correctness, missing-source rate, latency
- If RO loses to raw retrieval → improve the RO

### Phase 5: Companion Layer (Public/Private Split)
**1 week**

- Private ROs with `visibility: "private"`
- Link user notes to RO versions without altering canon
- Personal diary → personal RO pipeline

### Phase 6: Templates + Capability Checklist
**Ongoing**

- RO family templates (thinker_on_concept, comparative, etc.)
- Weekly capability checklist review
- Error Book as living document
