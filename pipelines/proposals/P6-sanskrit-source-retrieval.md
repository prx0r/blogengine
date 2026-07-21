# P6: Sanskrit Source Passage Retrieval

**Layer:** Knowledge — Fact-checking and primary-source verification
**Engine:** Source Engine (E9)
**Datasets:** SARIT (204 MB), Muktabodha (89 MB), GRETIL (283 MB) — 576 MB total
**R2 paths:** `s3://research-datasets/blueprint/sarit/`, `s3://research-datasets/blueprint/muktabodha/`, `s3://research-datasets/blueprint/gretil/`
**Status:** Not started

## Research Question

Can we build a unified Sanskrit source index that lets Hermes retrieve primary-text passages matching any tantra-related topic, and does this improve RO fact-checking accuracy?

## Hypothesis

The three Sanskrit corpora (SARIT, Muktabodha, GRETIL) contain overlapping but complementary content. A unified full-text index enables passage-level retrieval. ROs compiled with Sanskrit source verification will have fewer factual errors (measured by the existing RO validation script's issue count).

**Falsification:** The three corpora contain < 10 overlapping texts for our target traditions (Kashmir Shaivism, Tantra, Shaiva Siddhanta). The corpora are too thin on our specific niche to support passage retrieval.

## Methodology

1. Extract each corpus to a standard format:
   - SARIT: TEI XML → extract `<text><body>` with TEI IDs
   - Muktabodha: IAST + Devanagari text files → index by filename
   - GRETIL: `1_sanskr.zip` → extract `.txt` files, index by path
2. Build a unified DuckDB full-text index: `CREATE UNIFIED INDEX ON (corpus, text_id, passage_text)`
3. Define 50 target search terms: śaktipāta, pratyabhijñā, spanda, śāktopāya, samāveśa, etc.
4. For each term, retrieve 5 highest-relevance passages
5. Manual review: are the retrieved passages actually about the concept? (precision@5)
6. If precision@5 ≥ 0.8: mark as production-ready for RO compilation

## Output Schema

```json
{
  "experiment": "P6-sanskrit-source-retrieval",
  "timestamp": "YYYYMMDD_HHMMSS",
  "corpora_loaded": ["sarit", "muktabodha", "gretil"],
  "total_passages_indexed": 450000,
  "target_terms": 50,
  "retrieval_precision": {
    "overall_precision_at_5": 0.82,
    "by_corpus": {
      "sarit": 0.75,
      "muktabodha": 0.90,
      "gretil": 0.72
    }
  },
  "gates": {
    "overall_precision_above_08": true
  },
  "next_step": "Integrate into RO compilation: source_engine.primary(topic) returns Sanskrit passages",
  "limitations": ["Transliteration variants (śaktipāta vs shaktipata) require fuzzy matching"]
}
```

## Engine Integration

```
source_engine.primary(topic, language="sanskrit") → {
    passages: [{ corpus, text_id, verse_ref, text, translation }],
    confidence: float
}
```

Used in Stage 4 (Conjunction) to add primary-source verification to RO passages. Every RO passage that cites a Sanskrit text should trace to a retrievable verse.

## Value Proposition

This is **defensible moat** — no other YouTube content pipeline cross-references scholarly Sanskrit corpora for fact-checking. Most documentary channels work from English secondary sources. Primary-source verification is the difference between "a video about Tantra" and "a video that cites Tantrāloka 4.2 by verse number."

## Gotchas

- SARIT TEI XML needs `lxml` or `xml.etree` parsing
- GRETIL zip has inconsistent encoding — some files are UTF-8, some are ISO-8859-1
- Muktabodha IAST uses diacritics — query terms must be normalized
