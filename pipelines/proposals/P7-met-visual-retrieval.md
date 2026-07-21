# P7: Met Museum Visual Asset Retrieval

**Layer:** Production — Thumbnail and scene composition
**Engine:** Visual Engine (E8)
**Dataset:** Met Museum Open Access — 303 MB, 470K CC0 objects
**R2 path:** `s3://research-datasets/blueprint/met-openaccess/MetObjects.csv`
**Status:** Not started

## Research Question

Can we match Met Museum artworks to documentary topics via embedding similarity, and do topic-matched thumbnails improve predicted CTR over random art selection?

## Hypothesis

Visual embeddings of museum artworks (trained on title + culture + period metadata) cluster by concept. For any given topic (e.g., "Kali"), the nearest artworks in embedding space are visually relevant (Kali statues, tantric diagrams, related iconography). This gives us a free, CC0-licensed visual library that already has high production value.

**Falsification:** Embedding similarity based on Met metadata returns irrelevant results for ≥50% of target topics (precision@5 < 0.5). The metadata is too sparse or noisy for semantic matching.

## Methodology

1. Load MetObjects.csv — filter by culture (Indian, Tibetan, Nepali, Southeast Asian) and medium (sculpture, painting, drawing)
2. Build text embeddings from concatenated fields: `Title + Culture + Period + Medium + Geography`
3. Build an embedding index (FAISS or DuckDB) from filtered objects
4. For each target topic (Kali, Shiva, Kundalini, Chinnamasta, Mandala, Yantra, Tantra, Bhairava, Shakti):
   - Embed the topic description
   - Search nearest neighbors in Met embedding space
   - Return top 10 with image URLs
5. Manual review: are the returned images visually relevant? (precision@5)
6. If precision@5 ≥ 0.7: mark as production-ready

## Output Schema

```json
{
  "experiment": "P7-met-visual-retrieval",
  "timestamp": "YYYYMMDD_HHMMSS",
  "objects_filtered": 15000,
  "target_topics": 12,
  "retrieval_precision": {
    "overall_precision_at_5": 0.82,
    "by_topic": {
      "Kali": { "precision_at_5": 1.0, "notes": "Direct matches — Kali statues and paintings" },
      "Kundalini": { "precision_at_5": 0.4, "notes": "No direct concept — serpent imagery instead" }
    }
  },
  "gates": {
    "overall_precision_above_07": true
  },
  "next_step": "Add to Visual Engine: visual_engine.find(topic) returns Met artworks",
  "limitations": ["Met collection is Western-heavy — Indian/Tibetan art is a minority. May need DPLA supplement"]
}
```

## Engine Integration

```
visual_engine.find(topic, count=5) → {
    artworks: [{ title, image_url, artist, culture, period, concept_match, confidence }]
}
visual_engine.thumbnail(topic) → {
    candidates: [{ image_url, composition_score, predicted_ctr }]
}
```

Used in Stage 6 (Distillation) for scene visuals. Also feeds Stage 3 (Purification) for thumbnail composition — the top-ranked Met artwork becomes the basis for thumbnail design.

## Value Proposition

470K CC0-licensed artworks = unlimited visual library. No copyright risk. No commissioning cost. The 341 already-tagged entries in our art library can bootstrap the embedding model's training data.

## Gotchas

- Image URLs in MetObjects.csv may be stale — need to verify 404 rate
- Only objects with `Is Public Domain = TRUE` are usable
- Our existing art library (904 entries) should be mixed in: tag them, embed them, search across both
