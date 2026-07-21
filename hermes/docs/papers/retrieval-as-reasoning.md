# Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki

**arXiv:** 2605.25480, May 25 2026 (revised May 26)
**Authors:** Haoliang Ming, Feifei Li, Xiaoqing Wu, Wenhui Que (WeChat/Tencent, Beijing)
**Tags:** #llm-wiki #error-book #compositional-retrieval #retrieval-as-reasoning

---

## Core Argument

Current RAG treats retrieval as one-shot lookup — embed a query, grab top-k chunks, hand them to the model. This breaks for multi-hop reasoning because a dense retriever may retrieve two film pages but miss the director biography pages containing birth dates (those pages are semantically distant from the original query).

**Diagnosis:** The bottleneck is how knowledge is organized and exposed to the agent, not just the retrieval algorithm.

## Three Principles for Agent-Native Retrieval

1. **Compilability** — documents get compiled into structured, linked units, not flat chunks
2. **Composability** — retrieval is broken into atomic ops (search/read/follow-link) the agent chains together
3. **Evolvability** — the knowledge structure self-corrects instead of degrading over time

## System: LLM-Wiki

### Index Time
Raw documents are compiled into Markdown wiki pages with:
- Frontmatter, aliases, tags
- Key facts extracted
- Bidirectional wikilinks (`[[link]]`)
- Source references per fact
- Organized in directory tree with browsable `_index.md` indices

### Query Time
Two agent tools:
- `wiki_search(query)` — searches index by page names, aliases, tags, descriptions, then falls back to page content. Returns candidate pages and metadata.
- `wiki_read(paths)` — batch-reads directory indices or full pages. Returned content includes inter-page links for subsequent traversal hops.

Three traversal strategies (adaptively selected):
- **Direct access** — for known entities, directly read pages or search→read top results
- **Bridge queries** (A→B→answer) — read page A, identify entity B through inter-page links, traverse to B. Reduces complex reasoning to iterative link traversal.
- **Exploratory browsing** — for open-ended queries, read directory indices for structured overview, then selectively read promising pages.

Stopping conditions: evidence sufficient, budget exhausted, too many consecutive empty searches.

## The Error Book

LLM-compiled knowledge degrades over time — dangling links, unsupported facts, cross-page contradictions. Instead of one-time cleanup:

1. Detect errors
2. Attribute root cause
3. Turn cause into natural-language constraint
4. Inject constraint into future compilation prompts
5. Periodically re-verify and close resolved errors

**Two repair layers:**
- **Deterministic code fixes** — for structural errors (dangling links, index inconsistencies). Account for 29.1-63.8% of detected errors across corpora.
- **Periodic LLM-based fixes** — for semantic errors (unsupported facts, cross-page contradictions).

Error entries include: `{description, affected_objects, rule, status}`. Rules become reusable constraints that prevent recurrence.

## Results

| Benchmark | vs Best Baseline | Gain |
|---|---|---|
| HotpotQA | HippoRAG 2 | +2.0 F1 |
| MuSiQue | GraphRAG | +8.1 F1 |
| 2WikiMultiHopQA | LightRAG | +6.4 F1 |
| 4-hop 2Wiki questions | LightRAG | +8.3 F1 |
| AuthTrace (multi-doc) | All baselines | Best overall |

**Ablations:**
- Removing wiki structure → −6-7 F1
- Removing progressive traversal → −12-14 F1 (biggest single factor)
- Removing Error Book → −3.4-4 F1

## Honest Weak Spot

On single-document questions in AuthTrace, HippoRAG 2 beats it by 2.3 points — because when the answer is in one original article, retrieving the original directly beats reading a compiled/reorganized summary page that may drop fine detail. Compilation is also expensive upfront (amortized over queries) and doesn't obviously scale to web-size corpora yet.

## Relevance to Hermes

| Paper Concept | Hermes Equivalent |
|---|---|
| Wiki page | Research Object (one bounded scholarly question) |
| wiki_search + wiki_read | search_objects + read_object |
| Error Book | Lint findings + issues.json per RO |
| Bridge traversal (A→B→answer) | Family 3: Thinker on Thinker ("Ficino on Plato") |
| Browse-first traversal | Family 7: Tradition objects ("What is Theurgy?") |
| Deterministic repair layer | Lint auto-fixes (broken citations, missing sources) |
| LLM-based repair layer | Learning loop (Vision 1) |
| Compilability → Composability → Evolvability | Our pipeline Stages 1→2→3→4→5→6 |

## Related Landscape (2025-2026)

This paper is one entry in a broader shift toward "reasoning-intensive retrieval":

| Work | Approach | Key Difference from LLM-Wiki |
|---|---|---|
| **BRIGHT benchmark** (Su et al. 2024/25) | Established the problem | No system — identified that dense retrievers fail on multi-step inference |
| **PRISM** (arXiv 2510.14278) | Selector↔Adder agentic loop, 3 rounds | Iterates over raw corpus, not compiled wiki |
| **Critic-R** | Critic judges evidence sufficiency + query rewriting | Targets the querying side, not knowledge organization |
| **When to Retrieve During Reasoning** (SIGIR '26) | Adaptive retrieval timing via uncertainty | Decides *when* to retrieve, not *how* to organize |
| **Survey: Reasoning-Intensive Retrieval** (2605.00063) | Review article | Taxonomizes the space |

**The general taxonomy:**
- Flat chunks + embeddings (Vanilla RAG) — matching, not reasoning
- Summarization trees (RAPTOR) — compress, but lose specificity
- Graph/KG approaches (GraphRAG, HippoRAG, LightRAG) — better structure, but lossy summaries/triples, not human-readable
- **Compiled, linked, self-correcting knowledge (LLM-Wiki)** — newest entrant, explicit bet that a human-auditable, traversable structure beats a compressed one

## How We Use This

1. **wiki_search / wiki_read** → implement `search_objects(query)` and `read_object(id, version)` as Hermes tools for Stage 2 (Impact Analysis)
2. **Error Book** → create `content/research-objects/error-book.json` with constraint accumulation, two repair layers
3. **Three traversal strategies** → route user questions to the right retrieval strategy in the 15-family question router
4. **Bridge traversal** → enables Family 3 (Thinker on Thinker) and Family 5 (Comparative) without touching raw PDFs
5. **Composability principle** → every pipeline stage must expose atomic operations that the next stage can chain

## References

- Paper: https://arxiv.org/abs/2605.25480
- PDF: https://arxiv.org/pdf/2605.25480
- AuthTrace benchmark: https://arxiv.org/abs/2605.25382 (same authors)
- Karpathy's original LLM Wiki gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
