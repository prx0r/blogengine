# P8: Decision Ledger Schema

**Layer:** Cross-cutting — Immutable evidence tracking
**Engine:** Decision Ledger (E10)
**Dataset:** Self-generated (pipeline outcomes)
**Status:** Not built — schema only

## Research Question

How do we prevent the system from training on data it caused, and how do we track every prediction so we can measure whether our opportunity formula actually works?

## Hypothesis

An immutable append-only ledger of (evidence → claim → decision → outcome) prevents feedback-loop contamination and enables off-policy evaluation. Without this ledger, every model in the system will eventually predict its own past decisions rather than true topic value.

**Falsification:** The system reaches 10 published videos without the ledger in place, and we cannot determine whether high gap scores caused good performance or good packaging caused it. The confound is unrecoverable.

## Schema (4 Tables)

### evidence_ledger

Every piece of evidence that influenced a decision. Immutable, append-only.

```sql
CREATE TABLE evidence_ledger (
    evidence_id TEXT PRIMARY KEY,
    evidence_type TEXT NOT NULL,  -- gap_score | breakout_score | trend_velocity | etc.
    source_engine TEXT NOT NULL,  -- gap_engine | breakout_engine | trend_engine
    topic_id TEXT NOT NULL,
    value REAL NOT NULL,
    confidence REAL,
    collected_at TEXT NOT NULL,
    data_hash TEXT,               -- hash of the raw data row that produced this evidence
    created_at TEXT DEFAULT (datetime('now'))
);
```

### claim_evidence

Binds claims to the evidence that supports them. Each claim can reference multiple evidence rows.

```sql
CREATE TABLE claim_evidence (
    claim_id TEXT PRIMARY KEY,
    claim TEXT NOT NULL,           -- "Topic X has high opportunity because gap=0.7 + breakout=0.6"
    claim_type TEXT NOT NULL,      -- opportunity_assessment | packaging_prediction | etc.
    evidence_ids JSON NOT NULL,    -- [evidence_id, evidence_id, ...]
    confidence REAL,
    created_at TEXT DEFAULT (datetime('now'))
);
```

### decision_ledger

Every production decision with its evidence basis and expected outcome.

```sql
CREATE TABLE decision_ledger (
    decision_id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    decision_type TEXT NOT NULL,    -- topic_selection | title_selection | publish
    claim_id TEXT,                  -- FK to claim_evidence
    expected_value REAL,           -- predicted views at 28 days
    expected_range JSON,           -- [lower_bound, upper_bound]
    selected_title TEXT,
    selected_thumbnail TEXT,
    actual_value REAL,             -- NULL until 28 days after publish
    actual_collected_at TEXT,
    decision_hash TEXT,            -- hash of all preceding fields at decision time
    created_at TEXT DEFAULT (datetime('now'))
);
```

### outcome_ledger

Performance data collected at fixed intervals.

```sql
CREATE TABLE outcome_ledger (
    outcome_id TEXT PRIMARY KEY,
    decision_id TEXT NOT NULL,      -- FK to decision_ledger
    checkpoint TEXT NOT NULL,       -- 24h | 7d | 28d | 90d
    views INTEGER,
    watch_time_seconds REAL,
    ctr REAL,
    retention_avg REAL,
    collected_at TEXT NOT NULL,
    FOREIGN KEY (decision_id) REFERENCES decision_ledger(decision_id)
);
```

## Integration

After every publish (Stage 7):

1. `evidence_ledger` gets all evidence that influenced topic + title selection
2. `claim_evidence` binds that evidence to a testable claim
3. `decision_ledger` records what we chose and what we expected
4. At each checkpoint (24h/7d/28d/90d): `outcome_ledger` records actual performance

After 10+ videos:

```
ledger.evaluate(mode="opportunity_formula") → {
    accuracy: 0.6,       // how often did high-opportunity topics outperform low?
    calibration: 0.8,    // are confidence intervals well-calibrated?
    bias: -0.1,          // do we systematically over- or under-estimate?
    per_engine: {
        gap_engine: { mae: 0.12, bias: -0.02 },
        headline_engine: { mae: 0.08, bias: 0.01 }
    }
}
```

## Value Proposition

Without the ledger, we cannot distinguish "the gap score worked" from "we got lucky with packaging." With the ledger, every decision is traceable to its evidence, and the system can learn which engines actually predict success.

This is **P0 infrastructure** — build before video 5, deploy before video 10.

## References

`pipelines/hermes-operations-manual.md` §E10
`operations/vision-hermes-engine.md` §D (Four Ledgers)
