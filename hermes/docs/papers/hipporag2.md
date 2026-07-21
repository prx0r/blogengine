# HippoRAG 2 — Strongest Baseline LLM-Wiki Had to Beat

**Authors:** Gutiérrez et al., 2025
**Tags:** #hipporag #pagerank #graph-retrieval #neuroscience

---

The strongest baseline LLM-Wiki (2605.25480) had to beat, and the one with real neuroscience-inspired math. Uses Personalized PageRank over a knowledge graph for multi-hop retrieval — actual graph-theoretic propagation, unlike LLM-Wiki's discrete link-following.

## Key Mechanism

- Builds a KG from documents (entities + relations)
- Multi-hop retrieval via Personalized PageRank — propagates relevance scores through the graph
- Neuroscience-inspired: models memory consolidation and retrieval via hippocampal indexing theory

## Why It Matters for Hermes

HippoRAG 2's graph propagation is useful if we want to add a "related ROs" recommendation feature — find ROs that are structurally connected even when they don't share explicit tags. But for our core pipeline (RO compilation with provenance), LLM-Wiki's explicit link structure is more appropriate because it's human-auditable.

## Results vs LLM-Wiki

LLM-Wiki beats HippoRAG 2 by +2.0 F1 on HotpotQA and wider margins on multi-hop — the compiled wiki structure + compositional traversal outperforms graph propagation for multi-step reasoning.

## Repo

https://github.com/OSU-NLP-Group/HippoRAG
