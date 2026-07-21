# BRIGHT Benchmark — The Problem Statement

**Authors:** Su et al., 2024
**Tags:** #benchmark #reasoning-intensive #retrieval

---

The benchmark paper that created the "reasoning-intensive retrieval" problem statement that LLM-Wiki and the whole field is reacting to. Standard dense retrievers show a large accuracy drop when queries require multi-step inference rather than lexical/topical matching.

## Key Finding

Dense retrievers (ColBERT-v2, E5, etc.) perform well on lexical/topical matching but degrade sharply on queries that require:
- Multi-hop reasoning
- Compositional inference
- Cross-document aggregation

This is the empirical wound everyone else is treating — LLM-Wiki with compiled structure, HippoRAG with graph propagation, PRISM with iterative loops.

## Why It Matters for Hermes

Our Research Objects are a direct response to the BRIGHT finding. Instead of making retrieval smarter on raw chunks, we pre-compile the multi-hop paths into ROs — so the answer to "How did the daimon change from Plato to Ficino?" is already assembled, not reconstructed at query time.
