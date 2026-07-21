# /teach — TetraHermes Teaching Skill

Responds to a student question using the TetraHermes pipeline: classify state → select CO → adapt voice → return response.

## When to Use

A user asks a philosophical, spiritual, or conceptual question. The skill activates the TetraHermes pipeline which:
1. Classifies the student's state (seeking_clarity, defensive_rationalization, etc.)
2. Detects the likely lineage (Advaita, Socratic, Buddhist, etc.)
3. Selects a Commentary Object via Thompson sampling (Bayesian Beta posterior)
4. Adapts the teacher's response preserving lineage voice and register

## Input

```
/teach What is the difference between Siva and Sunyata?
```

## Output

```
State: conceptual_confusion
Lineage: Advaita
Response: [Advaita teaching in Nisargadatta's voice]
```

## How It Works

The pipeline loads:
- `content/commentaries/uno/` — 738 COs with teacher responses
- `geometricengine/src/classifier.py` — embedding-based state + lineage classifier
- `geometricengine/src/tetrahermes_pipeline.py` — full pipeline (Thompson, adapter, Error Book)

## Pipeline Steps

1. Classify student state via sentence-transformers (22 prototypes)
2. Detect lineage via keyword matching (6 lineages, defaults to Advaita for spiritual content)
3. Thompson sample COs for (state, lineage) — Beta(α+1, β+1) with exploration noise
4. If no CO found: fallback gracefully asking for clarification
5. Retrieve linked RO passages for content context
6. Adapt CO's visible_response via DeepSeek (preserves voice, regenerates for context)
7. Return response with state/lineage metadata

## Error Book

Teaching outcomes are logged. 3 failures for the same (state, function) pair activates a constraint, blocking that CO in the future. Successes decrement the failure counter.

## Dependencies

- Python: sentence-transformers, numpy, requests
- Data: content/commentaries/uno/ (738 COs)
- Optional: DEEPSEEK_API_KEY env var for voice-preserving adaptation
