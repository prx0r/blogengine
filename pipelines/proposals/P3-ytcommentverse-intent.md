# P3: YTCommentVerse Comment Intent Classification

**Layer:** Signal — Audience intelligence
**Engine:** None yet (exploratory)
**Dataset:** YTCommentVerse — 10.1 GB, 32M multilingual YouTube comments
**R2 path:** `s3://research-datasets/ytcommentverse/YT-30M.db`
**Status:** Not started

## Research Question

Can YouTube comments be classified by intent (question, objection, testimony, recommendation, criticism) at scale, and does intent distribution predict content gaps?

## Hypothesis

The ratio of questions to statements in comments on a topic indicates unmet demand. Topics where ≥20% of comments are questions (rather than reactions or testimony) represent content gaps that a documentary could fill.

**Falsification:** Comment intent distribution does not correlate with YouTube gap scores (Spearman r < 0.2) — i.e., comments asking questions are not a proxy for underserved topics.

## Methodology

1. Extract comments from YT-30M.db via SQLite
2. Sample 2,000 comments → manually label into 5 intent categories:
   - Question (asking for explanation)
   - Objection (disagreeing with video claims)
   - Testimony (sharing personal experience)
   - Recommendation (suggesting other content)
   - Reaction (emotional response, no informational content)
3. Train intent classifier on labeled sample
4. Classify all 32M comments → compute intent distribution per video/category
5. Correlate question_rate per topic with YouTube gap scores from Gap Engine
6. Identify topics with high question_rate + high gap_score → strong script material

## Output Schema

```json
{
  "experiment": "P3-ytcommentverse-intent",
  "timestamp": "YYYYMMDD_HHMMSS",
  "total_comments_classified": 32000000,
  "intent_distribution": {
    "question": 0.15,
    "objection": 0.08,
    "testimony": 0.35,
    "recommendation": 0.05,
    "reaction": 0.37
  },
  "topic_intent_profiles": [
    {
      "topic": "kundalini",
      "question_rate": 0.22,
      "gap_score": 0.7,
      "content_gap_signal": "high"
    }
  ],
  "gates": {
    "classifier_accuracy_above_080": true,
    "correlation_with_gap_score_confirmed": true
  },
  "limitations": ["Comments are self-selected — not representative of all viewers"]
}
```

## Engine Integration

If validated, adds an audience-intelligence layer to the Question Engine. Not a standalone engine — feeds into existing topic scoring.

## Gotcha

SQLite file is 10.1 GB — needs to be downloaded locally for SQLite queries. DuckDB can query SQLite directly via `sqlite_scanner` extension, avoiding the full download.
