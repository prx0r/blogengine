# Karpathy's LLM Wiki — The Conceptual Seed

**Source:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
**Date:** 2026
**Tags:** #llm-wiki #karpathy #origin

---

The conceptual seed that the LLM-Wiki paper (2605.25480) explicitly cites and formalizes. Not a paper — a GitHub gist describing an architectural pattern for compiling unstructured documents into a persistent structured knowledge store.

## Core Pattern

```
raw/       ← immutable source documents
wiki/      ← LLM-maintained Markdown syntheses
schema/    ← instructions governing structure and maintenance
```

Three operations:
- **Ingest** — new source → source summary → update relevant pages → update index → append to activity log
- **Query** — search maintained wiki → answer from compiled pages → optionally save valuable answer as another page
- **Lint** — find contradictions, broken links, stale summaries, orphans, duplicate pages, structural problems

## Key Difference from RAG

Synthesis happens during ingestion and maintenance, not reconstructed from raw chunks per query. The wiki is a persistent artifact whose cross-references and evolving synthesis have already been compiled.

## Relevance to Hermes

Karpathy provides the philosophy. The LLM-Wiki paper provides the implementation. Hermes provides the scholarly domain specialization — bounded research questions instead of generic wiki pages, source-level change tracking, versioned compilations, and downstream artifact generation.
