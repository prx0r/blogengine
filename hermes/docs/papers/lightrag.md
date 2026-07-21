# LightRAG — Best-Performing Baseline, Most Widely Deployed

**arXiv:** 2410.05779
**Authors:** HKUDS
**Tags:** #lightrag #graph-rag #entity-relation

---

Best-performing baseline in the LLM-Wiki paper's comparisons, and the most widely deployed graph-RAG system in practice.

## Key Mechanism

- Extracts entities and relations from documents
- Builds a graph index (entity → relation → entity)
- Retrieval over the graph via entity/relation matching
- Dual-level retrieval: low-level (specific entities) and high-level (topic summaries)

## Why It Matters for Hermes

LightRAG's dual-level retrieval (specific vs. summary) maps to our distinction between individual RO passages (low-level) and RO overview/coverage sections (high-level). Useful for the question router — when a user asks a broad question, route to overview sections; when specific, route to individual passages.

## Results vs LLM-Wiki

LLM-Wiki beats LightRAG by +6.4 F1 on 2WikiMultiHopQA, with the gap widening to +8.3 F1 on 4-hop questions — structure + traversal beats entity-relation indices for deep multi-step reasoning.

## Repo

https://github.com/HKUDS/LightRAG
