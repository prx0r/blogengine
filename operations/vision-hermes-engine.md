# Hermes: Decision System for Allocating Documentary Production Effort Under Uncertainty

> A research lab disguised as a media company. The goal: systematically identify intellectually underserved topics and produce documentaries about them, fully automated except for human voiceover recording.

## What This System Actually Is

Not an automated content pipeline. A **decision system** for allocating a scarce resource (human voiceover time, ~2 hours/week) across competing topic and packaging hypotheses under uncertainty.

The closed loop is the actual moat:

```
detect signal
→ validate from independent sources
→ estimate opportunity
→ generate treatment
→ expose uncertainty at approval gates
→ publish
→ observe performance
→ update beliefs
```

Hermes sits at the centre as a persistent cognitive controller (VPS Docker container, Nous Research agent). It does NOT run on Cloudflare Workers. It asks questions; Workers answer narrow ones; Workflows execute; the control plane authorises.

---

## Table of Contents

- [A. End-to-End Flow](#a-end-to-end-flow)
- [B. Opportunity Evidence Dimensions](#b-opportunity-evidence-dimensions)
- [C. Evidence Contracts](#c-evidence-contracts)
- [D. Four Ledgers](#d-four-ledgers)
- [E. The Title Engine](#e-the-title-engine)
- [F. YouTube Package Experiments](#f-youtube-package-experiments)
- [G. Research Pack + Claim Graph](#g-research-pack--claim-graph)
- [H. Security Boundaries](#h-security-boundaries)
- [I. Cloudflare-Native Strategy](#i-cloudflare-native-strategy)
- [J. GCP Credit Strategy](#j-gcp-credit-strategy)
- [K. Implementation Roadmap](#k-implementation-roadmap)
- [L. Open Questions](#l-open-questions)

---

## A. End-to-End Flow

### Stage 1: Signal Detection

Hermes scans these sources daily:

| Source | Frequency | What It Produces | Mechanism |
|--------|-----------|------------------|-----------|
| Daily Research Worker | Daily 06:00 UTC | Breakout videos, breakout scores | `GET /api/research/opportunities` |
| Reddit (R2 Parquet) | Weekly batch | Question clusters, opportunity scores | DuckDB against R2 |
| Global Trending | Weekly | Cross-country diffusion signals | BigQuery extraction |
| Google Trends | Weekly | Western demand (US+GB) | `pytrends` on VPS |
| Hermes market-scan skill | Daily | 75-channel monitoring | Hermes tool call |

### Stage 2: Topic Validation (7 steps)

For each candidate topic, Hermes runs validation in order. Each step queries a different dataset and updates an evidence dimension (see Section B). Steps are designed as approximately independent failure modes:

1. **Supply gap** — YouTube gap score (is this underserved?)
2. **Western demand** — Google Trends (are people searching for it?)
3. **Related breakout** — YouNiverse breakout model (have related topics broken out?)
4. **Audience questions** — Reddit question clusters (are people repeatedly asking about it?)
5. **Geographic diffusion** — Global Trending (is it spreading from IN to US/UK?)
6. **Gateway entities** — Clickstream graph (what familiar topic leads to this?)
7. **Production viability** — Source depth + visual asset depth + independence check

### Stage 3: Opportunity Scoring

The old weighted-sum formula with clamp is removed (see Section B). Instead:

```
topic_value        = composite of evidence dimensions with uncertainty
packaging_potential = title model prediction + narrative frame match
production_cost    = research effort + voiceover time + rendering cost
editorial_risk     = controversy score + unverifiable claim count + safety flags
information_value  = expected posterior update from producing this topic
```

These are kept separate. **Packaging potential is not added to topic value.** A title model estimates how well a topic can be packaged; it does not change whether the underlying subject has audience demand.

### Stage 4: Research Pack Construction

See Section G — claim graph with provenance, certainty, contradictions.

### Stage 5: Treatment + Package Generation

See Section F — title-thumbnail-hook packages, not bare titles.

### Stage 6: Human Approval with Evidence Display

The approval gate shows:
- What evidence supports the recommendation
- What evidence contradicts it
- What assumptions drive it
- What uncertainty would change the choice
- Whether this is EXPLOIT, EXPLORE, or FOUNDATION

### Stage 7: Publish + Observe

Fixed-age snapshots: 24h, 7d, 28d, 90d. Outcomes tied to exact package and model version.

### Stage 8: Update Beliefs

Bayesian update of evidence dimensions. Decision ledger stores all candidates, scores, policy, and propensity. No "retraining" on policy-biased data without correction.

---

## B. Opportunity Evidence Dimensions

The revised document previously called these "latent variables." They are not — no measurement model exists connecting observations to quantities, no covariance structure is identified, and no validation confirms the dimensions are identifiable.

Rename to: **opportunity evidence dimensions**.

Each dimension is an interpretable rubric with uncertainty and source provenance. Only call them latent variables when a proper measurement model exists (observed values ~ measurement model for dimension, with parameters estimated and calibrated against outcomes).

### The Six Dimensions

| Dimension | Questions It Answers | Evidence Sources |
|-----------|---------------------|------------------|
| D: Audience demand | Is anyone looking for this? | Google Trends, Reddit question clusters, YouTube search volume |
| S: Supply scarcity | Is it underserved? | YouTube gap map (IN-only vs US/GB channel counts) |
| M: Topic momentum | Is it growing? | YouNiverse breakout rate by year, Reddit topic velocity, Global Trending trajectory |
| T: Cross-market transfer | Will it travel from IN to US/UK? | Global Trending diffusion analysis, clickstream gateway counts, YouTube search across regions |
| V: Production viability | Can we research and illustrate it? | Source depth (SARIT, Muktabodha), visual asset depth (Met, DPLA), independence (channel count), editorial safety |
| F: Audience-topic fit | Does this specific channel's audience want this? | Reddit cross-subreddit score, channel profile similarity, past video performance on related topics |

### What Was Wrong With the Old Formula

The old Stage 3 score:
```
0.30 * clamp(gap_score)
+ 0.25 * clamp(language_lag)
+ 0.20 * clamp(breakout_rate)
+ 0.15 * clamp(western_demand)
+ 0.10 * clamp(pageview_signal)
```

Problems:
1. **Discarded signal included:** Wikipedia pageview signal was permanently skipped (r=0.027), yet it remains in the formula.
2. **Clamp silently manufactures evidence:** `clamp(x) = max(0.1, min(1.0, x))` means a missing, zero, or negative signal contributes positively. Missing evidence is not weak positive evidence; store it as missing.
3. **No uncertainty:** Point estimates without CIs. A dimension estimated from 30 queries is treated identically to one estimated from 30,000.
4. **Packaging contaminates topic value:** "Bayesian title prior update" was included in topic opportunity. A title model estimates packaging potential, not audience demand.
5. **Weights are guessed, not estimated:** No empirical basis for 0.30 vs 0.25 vs 0.20.

### How to Use Them Now

Each dimension produces a report:

```json
{
  "dimension": "supply_scarcity",
  "value": 0.82,
  "uncertainty": "ci_90": [0.73, 0.89],
  "sources": ["youtube_gap_map"],
  "sample_size": 30,
  "data_period": "2025-07 to 2026-07",
  "status": "production",
  "limitations": ["Only 30 queries tested", "Tantra niche only"]
}
```

Hermes combines dimensions using explicit reasoning (not a weighted sum) — or simply presents them to the human for judgment. The system learns the combination weights from outcome data over time, not from a priori guesses.

### Viability Gates (Revised)

Hard gates remain for production viability only:
- source_depth >= minimum
- visual_depth >= minimum
- safe editorial treatment possible

**Do NOT include independent_channel_count >= 3.** A genuinely novel topic may have zero existing channels. Use channel count as an uncertainty signal instead:

```
0-1 channels:   novelty candidate, require stronger source + demand evidence
2-3 channels:   early replication opportunity
4+ channels:    established demand, scarcity may be lower
```

---

## C. Evidence Contracts

Every model endpoint returns the same envelope. Hermes never receives a naked score.

### Draft v1 → v2 Changes

The current `ci_90` field is ambiguous: frequentist confidence interval, Bayesian credible interval, or posterior predictive interval? These are not interchangeable. Add `interval_type`.

Evidence quality is not a scalar (see Section F on experimental design). Store confounders, not a weight.

### v2 Contract

```json
{
  "contract_schema_version": "0.2.0",
  "model": "upworthy-title-ranker",
  "model_version": "0.3.1",
  "prediction": {
    "target": "P(title_a wins over title_b)",
    "target_unit": "probability",
    "value": 0.63,
    "interval": [0.55, 0.71],
    "interval_type": "bayesian_credible_interval_90",
    "time_horizon": "immediate_click",
    "unit_of_analysis": "experiment"
  },
  "evidence": {
    "effective_sample_size": 4182,
    "experimental_design": "randomized_ab_test",
    "domain": "Upworthy confirmatory, 2013-2015",
    "data_period": "2013-01 to 2015-12",
    "dataset_hash": "sha256:abc...",
    "analysis_code_commit": "def456",
    "last_updated": "2026-07-20",
    "out_of_sample_metrics": {
      "holdout_accuracy": 0.5254,
      "holdout_auc": 0.5447
    },
    "calibration_metrics": { "ece": 0.032 },
    "missingness": 0.03
  },
  "limitations": [
    "Upworthy headline effects may not transfer to YouTube documentary titles",
    "No validation on documentary-domain data"
  ],
  "operational_status": "shadow",
  "intended_use": "directional_prior_for_title_generation",
  "prohibited_use": [
    "final_editorial_decision_without_human_review",
    "historical_claim_support"
  ],
  "expires_at": "2026-08-20T00:00:00Z",
  "dependency_tags": ["dataset:upworthy-confirmatory-v1", "model:logistic-v1"]
}
```

### Operational Statuses

| Status | Meaning |
|--------|---------|
| exploratory | Offline only; conclusions provisional |
| shadow | Runs on real decisions but cannot affect them |
| candidate | Can influence recommendations with human approval |
| production | Authorised to influence decisions under specified scope |
| deprecated | Replaced, retained for reproducibility |

---

## D. Four Ledgers

The system maintains four immutable ledgers. These are the actual "organism memory" — more important than any individual model.

### D1. Evidence Ledger

Immutable observations from datasets and APIs.

```sql
CREATE TABLE evidence_ledger (
  observation_id TEXT PRIMARY KEY,
  source_dataset TEXT NOT NULL,
  source_version TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  recorded_at TEXT DEFAULT (datetime('now')),
  observation JSON NOT NULL,
  dataset_hash TEXT NOT NULL,
  ingestion_code_commit TEXT
);
```

### D2. Claim/Evidence Graph

Every narrative sentence maps to claims; every claim maps to exact passages.

```sql
CREATE TABLE claims (
  claim_id TEXT PRIMARY KEY,
  claim_text TEXT NOT NULL,
  certainty TEXT CHECK(certainty IN ('confirmed','consensus','traditional','disputed','speculative')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE claim_evidence (
  claim_id TEXT NOT NULL,
  source_passage TEXT NOT NULL,
  source_id TEXT NOT NULL,
  relation TEXT CHECK(relation IN ('supports','contradicts','qualifies')),
  extractor TEXT NOT NULL,  -- 'llm_extraction' | 'scholarly_citation' | 'manual'
  PRIMARY KEY (claim_id, source_id, relation)
);

CREATE TABLE claim_qualifiers (
  primary_claim_id TEXT NOT NULL,
  qualifying_claim_id TEXT NOT NULL,
  relation TEXT CHECK(relation IN ('contradicts','contextualises','depends_on')),
  PRIMARY KEY (primary_claim_id, qualifying_claim_id)
);
```

Four evidence types, never conflated:

| Evidence Type | Examples | Use |
|--------------|----------|-----|
| Factual | Primary texts, academic books, museum records | Historical claims |
| Interpretive | Scholarly interpretations, disagreements | Balanced treatment |
| Audience | Reddit, Stack Exchange, search behaviour | Topic selection, framing |
| Packaging | Upworthy, YouTube experiments, title priors | Title-thumbnail optimisation |

**Upworthy has nothing to do with historical claims.** Stack Exchange identifies questions, not facts.

### D3. Decision Ledger

All candidates, scores, policy, propensities, human overrides.

This prevents the feedback loop where the system trains on data it caused:

```
policy chooses evidence
→ chosen evidence becomes training data
→ model validates its own prior choices
```

```sql
CREATE TABLE decision_ledger (
  decision_id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  production_mode TEXT CHECK(production_mode IN ('EXPLOIT','EXPLORE','FOUNDATION')),
  considered_candidates JSON NOT NULL,  -- all candidates with features and scores
  selected_candidate JSON NOT NULL,
  selection_policy TEXT NOT NULL,       -- 'argmax' | 'thompson_sample' | 'human_choice' | 'random'
  selection_propensity REAL,           -- P(selected | model) for off-policy eval
  model_version TEXT,
  human_override INTEGER DEFAULT 0,
  human_reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### D4. Outcome Ledger

24h, 7d, 28d, 90d outcomes tied to exact decision.

```sql
CREATE TABLE outcome_ledger (
  outcome_id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL,
  age_hours INTEGER NOT NULL,          -- 24, 168, 672, 2160
  impressions INTEGER,
  watch_time_minutes REAL,
  ctr REAL,
  retention_avg REAL,
  subscribers_gained INTEGER,
  negative_feedback INTEGER,
  collected_at TEXT NOT NULL,
  FOREIGN KEY (decision_id) REFERENCES decision_ledger(decision_id)
);
```

---

## E. The Title Engine

### E1. What the Current Code Actually Does

The current Upworthy script constructs every winner-versus-loser pair twice:

```
winner vs loser → label 1
loser vs winner → label 0
```

A single winning headline in a multi-variant test (e.g., 1 winner vs 5 losers) generates 10 pair rows. The simple Beta-Binomial model then treats each row as an independent observation. This artificially narrows credible intervals.

**Fixed: Use experiment-level likelihood instead of pair-row counts.**

### E2. Model A: Descriptive Display (For Dashboard Only)

Experiment-level cluster bootstrap, not pair-row Beta-Binomial:

1. For each feature, for each experiment where it varies:
   - Compute the feature's win rate within that experiment
2. Bootstrap across experiments (not across pairs):
   - Resample experiments with replacement
   - Recompute mean win rate per feature
   - Report 95% bootstrap CI

This correctly reflects that the experiment is the unit, not the pair.

### E3. Model B: Hierarchical Pairwise Model (For Prediction)

Where clicks and impressions are available:

```
clicks_variant ~ Binomial(impressions_variant, p_variant)

logit(p_variant) =
    experiment_intercept
  + title_features * beta
  + title/thumbnail interactions

experiment_intercept ~ Normal(0, sigma²)
```

With:
- Random intercept per experiment
- Random or fixed eyecatcher (thumbnail) effects
- Clustered uncertainty at experiment level
- Hierarchical domain effects (Upworthy vs YouTube documentary)

Where only winner rankings are available (not clicks/impressions), use a hierarchical Bradley-Terry or Plackett-Luce model.

### E4. Model A vs Model B

| | Model A (Descriptive) | Model B (Predictive) |
|--|---------------------|---------------------|
| Purpose | Explain what we've observed | Predict new comparisons |
| Method | Experiment-level cluster bootstrap | Hierarchical logistic / Bradley-Terry |
| Uncertainty | Bootstrap CI across experiments | Full posterior via HMC |
| Deployment | Dashboard display | Worker inference endpoint |
| Status | Shadow | Exploratory |

They are not the same model. The document previously mixed them.

---

## F. YouTube Package Experiments

### F1. YouTube's Actual Experiment Design

YouTube Test & Compare tests up to **three title-thumbnail combinations** concurrently. The primary outcome is **watch time**, not CTR. Tests may take up to two weeks and frequently end without a winner when impressions are insufficient.

**The current title schema models the wrong object and the wrong reward.**

### F2. Correct Action Object

```json
{
  "experiment_id": "yt-test-001",
  "video_id": "abc123",
  "created_at": "2026-07-21T12:00:00Z",
  "variants": [
    {
      "variant_id": "A",
      "title": "The Goddess Who Drinks Her Own Blood",
      "thumbnail_id": "thumb-v3",
      "hook_frame": "concrete_visual",
      "audience_intent": "browse"
    },
    {
      "variant_id": "B",
      "title": "What Chinnamasta Really Represents",
      "thumbnail_id": "thumb-v4",
      "hook_frame": "explanatory",
      "audience_intent": "search"
    }
  ],
  "outcome": {
    "watched_minutes_per_impression": {
      "A": { "value": 2.1, "ci_90": [1.8, 2.4] },
      "B": { "value": 1.7, "ci_90": [1.4, 2.0] }
    },
    "ctr": {
      "A": { "value": 0.061, "ci_90": [0.055, 0.067] },
      "B": { "value": 0.058, "ci_90": [0.052, 0.064] }
    },
    "winner": "A",
    "test_duration_hours": 168,
    "traffic_source": "youtube_browse",
    "impressions_per_variant": { "A": 12000, "B": 11500 }
  }
}
```

The primary reward is `watched_minutes_per_impression`. CTR and retention are decomposed diagnostics.

### F3. API Availability

The official Test & Compare process is managed through YouTube Studio. It is unconfirmed whether a variant-level API exists for automated ingestion. **Design manual or semi-manual entry first**, with an automated path added later if the API proves available.

### F4. Experimental Design Storage (Replaces evidence_quality Scalar)

The old schema stored a single `evidence_quality` weight (e.g., 0.25). A scalar weight does not remove confounding. Store the actual design:

```sql
CREATE TABLE title_experiments_v2 (
  experiment_id TEXT PRIMARY KEY,
  video_id TEXT,
  assignment_method TEXT CHECK(
    assignment_method IN (
      'randomized_concurrent',
      'sequential_controlled',
      'observational',
      'external_dataset'
    )
  ),
  candidate_set JSON,
  exposure_period_hours INTEGER,
  traffic_source TEXT,
  viewer_cohort TEXT,
  concurrent_variants JSON,
  thumbnail_ids JSON,
  selection_probability REAL,
  data_generating_process TEXT,
  model_version TEXT,
  human_override INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

Randomized and nonrandomized observations enter different likelihoods or different evidence pools. They are not combined via a scalar weight.

---

## G. Research Pack + Claim Graph

The old research pack was a flat list of claims with source IDs. This is not enough.

### G1. Three Relations

```
SOURCE PASSAGE → supports → CLAIM
SOURCE PASSAGE → contradicts → CLAIM
CLAIM → qualifies → CLAIM
```

### G2. Claim Certainty Levels

| Level | Meaning | Example |
|-------|---------|---------|
| confirmed | Multiple independent primary sources agree | "The Kapalikas existed as a sect in medieval India" |
| consensus | Scholarly consensus, some disagreement | "They carried skull-topped staffs" |
| traditional | Widely repeated in tradition, weak historical evidence | "They ate from human skulls" |
| disputed | Significant scholarly disagreement | "They were left-handed tāntrikas" |
| speculative | Inferred but unconfirmed | "This may have influenced later Tibetan practices" |

### G3. Every Narration Sentence Maps to Claims

```json
{
  "script_line": "The Kapalikas carried skull-topped staffs as a deliberate inversion of caste markers.",
  "mapped_claims": [
    {
      "claim_id": "C001",
      "relation": "restates",
      "certainty": "consensus",
      "sources": [
        { "source_id": "davidson_2002", "locator": "p. 45-47" },
        { "source_id": "sanderson_2009", "locator": "Chapter 3" }
      ]
    },
    {
      "claim_id": "C002",
      "relation": "implies",
      "certainty": "disputed",
      "contradicted_by": ["white_2012"]
    }
  ]
}
```

### G4. Evidence Type Separation

| Evidence Source | Belongs In |
|----------------|-----------|
| Primary texts (SARIT, Muktabodha) | **Factual** — historical claims |
| Academic books, papers | **Factual / Interpretive** |
| Museum records, visual artifacts | **Factual** |
| Scholarly disagreements | **Interpretive** — balanced treatment |
| Reddit questions, comments | **Audience** — topic selection, framing |
| Stack Exchange Q&A | **Audience** — terminology, questions |
| YouTube search, Google Trends | **Audience** — demand signal |
| Upworthy experiments | **Packaging** — title priors only |
| Asset availability, licensing | **Production** — viability |

**Upworthy has zero relevance to historical claims. Stack Exchange identifies questions, not facts.**

---

## H. Security Boundaries

This is a P0 issue, not operational polish.

### H1. Principles

- Read-only research tools by default
- Scoped per-farm credentials
- Egress allowlists
- Isolated execution containers
- No shell access to control-plane secrets
- Human approval for publishing and external writes
- Immutable logs for every consequential action

### H2. Credential Architecture

```
Hermes (VPS)
├── Scoped R2 read-only token (research-datasets bucket)
├── Scoped R2 read-write token (own farm's bucket only)
├── YouTube API key (search + videos, no channel management)
├── No D1 write access
└── No Cloudflare admin access

Farm Worker (Cloudflare)
├── Own D1 (read-write, farm-scoped)
├── Own R2 (read-write, farm-scoped)
├── YouTube API key (upload + analytics, separate from Hermes key)
├── FARM_SECRET (per-farm signing secret, stored as Worker secret)
└── No VPS access

Control Plane (Cloudflare)
├── Global D1 (metadata only, never content)
├── Cloudflare Access (Zero Trust, your email only)
├── Per-farm secrets (iterates known secrets, no shared token)
└── No direct VPS or Hermes access
```

### H3. Execution Isolation

```yaml
hermes-agent:
  container: hermes-base
  network: isolated
  egress_allowlist:
    - api.cloudflare.com
    - googleapis.com
    - api.telegram.org
    - en.wikipedia.org
    - # pytrends domains
  no_access:
    - control-plane D1 writes
    - Cloudflare admin API
    - YouTube channel management
  approved_human_gates:
    - treatment approval
    - publish approval
    - model promotion to production
```

---

## I. Cloudflare-Native Strategy

### I1. What Works

- **Cloudflare Workflows**: Long wall-clock workflows supported, paid-plan active CPU up to 5 min per step. Good for the production pipeline.
- **Vectorize**: Can store embeddings produced externally (VPS or GPU batch). 10M vectors/index, 1,536 dims max, ~$0.31/mo for 10K x 768-dim queries at 1K/day.
- **R2 + DuckDB**: DuckDB queries Parquet in R2 directly via S3. R2 SQL + Data Catalog for Iceberg tables. No separate query engine needed for batch analysis.
- **D1**: 10 GB/database. Fine for metadata, scores, ledgers. Not for full text.
- **R2**: $0.015/GB-month, no egress fees. Store datasets, model artifacts, full posterior draws here.

### I2. What Was Overstated

The document repeatedly assumed:

```
XGBoost → ONNX → Workers AI
Bayesian LR → ONNX → Workers AI
DistilBERT → ONNX → Workers AI
```

Workers AI provides a **curated hosted model catalogue**, not arbitrary ONNX deployment. Custom model hosting is a custom-requirements case, not a normal upload workflow. Do not design around arbitrary ONNX deployment there until a supported path is confirmed.

**Safer architecture:**

```
Worker endpoint
→ validates request
→ checks cache (AI Gateway)
→ invokes small VPS or Cloud Run inference service
→ stores response
```

For tiny tabular models, running inference directly in Worker JavaScript or WebAssembly is simpler than an ONNX deployment platform.

### I3. Storage Split

| Data | Store | Why |
|------|-------|-----|
| Active metadata, scores, ledgers | D1 | Fast queries, <10 GB |
| Full posterior draws | R2 | Large, versioned, infrequent reads |
| Datasets (Parquet) | R2 | DuckDB queries in-place |
| Model artifacts | R2 | Versioned, ONNX or pickle |
| Vector embeddings | Vectorize | Similarity search, <10M vectors |
| Immutable lineage | R2 | Append-only, never modified |

### I4. Worker Route Map*

```
farm-{FARM_ID}.workers.dev/
├── /api/research/
│   ├── gap-map
│   └── opportunities
├── /api/models/
│   ├── upworthy/rank-titles       → Bayesian LR (Worker JS or VPS sidecar)
│   ├── upworthy/ingest            → D1 title_experiments_v2
│   ├── assets/search              → Vectorize similarity
│   └── predict-breakout           → XGBoost (Worker JS or VPS sidecar)
├── /api/reddit/
│   ├── opportunities?farm=X       → DuckDB on R2 Parquet
│   ├── question-deep-dive         → DuckDB + D1
│   ├── controversy-map            → D1
│   └── recommendation-graph       → D1
├── /api/factory/
│   ├── produce                    → Triggers Workflow
│   └── approve/:gate_id           → Gate resolution
├── /__cron/
│   ├── daily-research             → Channel harvest
│   ├── weekly-gap                 → Gap map recomputation
│   └── monthly-maintenance        → Model retrain triggers
└── /__ledger/
    ├── evidence                   → Evidence ledger append
    ├── decision                   → Decision ledger append
    └── outcome                    → Outcome ledger append
```

---

## J. GCP Credit Strategy ($300)

### J1. Principles

Credits fund **experiments that produce reusable assets**, not monthly infrastructure. Don't commit to recurring services before the corresponding model proves useful.

Least valuable:
- Cloud Run FFmpeg (VPS is free and already works)
- Video Intelligence API monthly (speculative; test once)
- Vision API monthly (test once)

Most valuable:
- BigQuery for datasets awkward locally (Global Trending 26 GB, Clickstream 4 GB)
- Model training experiments with clear falsification conditions
- Temporary GPU training where the artifact survives after credits expire

### J2. Revised Budget

| Spend | Service | Use | When |
|-------|---------|-----|------|
| $80-120 | Vertex AI / preemptible VMs | Model experiments: Bayesian title HMC, YouNiverse pilot, embedding batches | Phase 3 |
| $30-50 | BigQuery | Dataset exploration: Global Trending, cross-dataset joins, clickstream | Phase 4 |
| $40-60 | Cloud Run GPU (preemptible) | One-shot benchmark: verify Sanskrit NLLB viability before committing | Phase 5 (deferred) |
| $20-30 | Vision API / Video Intelligence | One-shot competitor analysis experiments — measure once | Phase 5 |
| $40 | Hold for validated bottlenecks | Spend only when a model proves useful and needs scaling | Ongoing |

---

## K. Implementation Roadmap

### Phase 0: Publish-First Experimental Protocol (Before Building Anything Else)

Before more modelling, define one format for the first ten videos:
- Candidate topics saved before selection
- Three title-thumbnail packages saved before publishing
- Research claims and sources captured
- Human choice and reason recorded
- Outcomes captured at fixed ages (24h, 7d, 28d, 90d)
- No retrospective rewriting of hypotheses

### Phase 1: Ledgers + Security (~1 week)

1. Build the four ledgers (evidence, claim/evidence, decision, outcome) as D1 tables
2. Implement evidence contract v2 schema
3. Set up credential scoping and egress allowlists
4. Build immutable logging for every consequential action
5. Implement decision ledger with propensity logging

### Phase 2: Rebuild Title Statistics (~1 week)

1. Fix the pair-construction bug: use experiment-level likelihood, not pair rows
2. Independent holdout replication (Upworthy holdout dataset)
3. Build Model A (experiment-level cluster bootstrap for descriptive display)
4. Build Model B (hierarchical logistic or Bradley-Terry for prediction)
5. Add thumbnail/eyecatcher controls
6. Temporal validation (2013 vs 2014 vs 2015)
7. Deploy only as **exploratory** — the dashboard displays uncertainty, not a ranker

### Phase 3: Production Retrieval (~2 weeks)

1. Finish Reddit extraction for 30 subs → R2 Parquet
2. Embed titles via bge-m3 → Vectorize
3. Build query endpoints: opportunities, question-deep-dive, controversy-map, recommendation-graph
4. Build CLIP asset retrieval from museum datasets → Vectorize
5. Build Stack Exchange Q&A extractor
6. Build clickstream gateway graph

### Phase 4: Validate Decision Value (~1 week)

Test whether opportunity evidence dimensions rank historical or live candidates better than:
- Human judgment
- Simple gap score
- Random selection
- Channel-normalized view baselines

Evaluate ranking utility, not model accuracy. The question is: "Does this help allocate production effort better?" not "Is the predicted score correlated with the outcome?"

### Phase 5: Train Predictive Models (~2 weeks)

Only after Phase 4 confirms the labels are meaningful:
- YouNiverse breakout classifier (validate the label first)
- Global Trending diffusion model (only if Phase 4 finds measurable signal)
- Opportunity score as learned model (replace hand-tuned combination)

Deploy all as **shadow** — running alongside existing heuristics, not replacing them.

### Phase 6: Adaptive Experimentation (Ongoing)

Only after sufficient traffic and candidate/propensity logging:
- Ax or BoTorch experiment selection
- Tempered Thompson sampling
- Controlled exploration quota (10% of production)
- Off-policy evaluation where valid

### Phase 7: Online Channel Learning (Ongoing)

- Weekly Bayesian posterior update from own A/B results
- Compare own posteriors to Upworthy priors — does the transfer hold?
- Quarterly re-evaluation of all evidence dimension combinations vs actual performance

### The Three Production Modes

| Mode | Goal | Example |
|------|------|---------|
| EXPLOIT | Maximise expected success | Highest-confidence topic, proven packaging |
| EXPLORE | Test a high-uncertainty hypothesis | Topic with wide posterior — learn whether a whole class works |
| FOUNDATION | Create evergreen gateway content | "What Is Kashmir Shaivism?" — needed for later discoverability |

These should become explicit policy fields in the decision ledger, not just descriptive labels.

---

## L. Open Questions

### L1. Do Upworthy title priors transfer to YouTube documentaries?

The logistic regression got 52.5% — above chance, below useful. The hierarchical model might not do better. **Test:** First 10 videos. Run Test & Compare on 3. Compare coefficient directions to Upworthy. If correlation is positive, the prior is useful. If negative, discard.

### L2. Is the breakout metric meaningful?

"Differentiated, not validated." Redo A1-A3 as Tier 1 against YouNiverse time series before training models on it. **Fail condition:** If the breakout metric has no predictive power for future views, the entire opportunity formula needs redesign.

### L3. Can the first ten videos tell us anything?

n=10 cannot estimate 20+ correlated title features. Test 1-2 coarse hypotheses only (statement vs question, concrete vs abstract). Use Bayesian updating — own data updates the prior, does not overturn it. Need n=30-50 before own data dominates.

### L4. Can we deploy custom models on Workers AI?

Unconfirmed. Workers AI is a curated model catalogue, not arbitrary ONNX hosting. Design for VPS/Cloud Run inference as the primary path. Worker JS inference for tiny tabular models as an alternative.

### L5. Does YouTube provide a Test & Compare API?

Unconfirmed. The process is managed through YouTube Studio. Design manual ingestion with automated upload as a later addition.

### L6. Will the feedback loop degrade the system?

Yes, if decision propensity is not logged. The decision ledger with selection probabilities is the mitigation. The system cannot "learn from what it chose" without correcting for the selection policy.

### L7. The voiceover bottleneck persists.

None of these models solve the human voiceover constraint. At ~2 hours/week, maximum output is ~8 videos/month. The ML system amplifies the value of each recording session by choosing better topics — it does not remove the ceiling.

---

## Appendix: Open-Source Projects to Borrow From

| Project | Borrow | Avoid |
|---------|--------|-------|
| PaperQA2 | Document indexing, passage retrieval, contradiction checks | Letting it write final scripts |
| STORM / Co-STORM | Perspective-driven questions, outline discovery | Treating output as publish-ready |
| OpenLineage | Run/job/dataset identifiers and facets | Deploying a large lineage backend immediately |
| MLflow | Experiment tracking, version registry | Making it the control plane |
| Evidently | Drift and evaluation reports | Live monitoring before sufficient data exists |
| Ax / BoTorch | Later experiment design, multi-objective optimisation | Using BO with three videos' data |
| Vowpal Wabbit | Contextual-bandit policies with propensity logging | Online learning without randomised traffic |
| DoWhy | Explicit causal graphs and refutation tests | Assuming causal discovery infers everything |

---

## Appendix: Model Status Matrix

| Model | Build Now? | Why | Dependency |
|-------|-----------|-----|-----------|
| Title Model A (descriptive bootstrap) | ✅ Yes | Needed for approval display | Phase 2 |
| Title Model B (hierarchical logistic) | ✅ Yes | Needed for title ranking | Phase 2 |
| Reddit question clusters | ✅ Yes | Directly improves topic selection | Phase 3 |
| CLIP asset retriever | ✅ Yes | Visual assets for every topic | Phase 3 |
| Clickstream gateway graph | ✅ Yes | Narrative entry frames | Phase 3 |
| Stack Exchange extractor | ✅ Yes | Q&A for research packs | Phase 3 |
| YouNiverse breakout predictor | ⏳ Wait | Label not validated | Phase 5 |
| Cross-country diffusion model | ⏳ Wait | Signal may not exist | Phase 5 |
| Comment intent classifier | ⏳ Wait | Needs labeled data | Phase 5 |
| Sanskrit-English NMT | ❌ Separate project | Use existing translations | Deferred |

---

## What Success Looks Like

The project succeeds if Hermes becomes:

> A disciplined evidence and decision system that helps a small creator make fewer, better, better-researched documentaries while learning from each production decision.

It fails if it becomes:

> A miniature MLOps empire that produces precise-looking scores from weak labels while delaying the actual channel.

The moat is **not** the XGBoost model, Bayesian title ranker, or five Vectorize indexes. Those can all be copied. The moat is the accumulated structured memory:

```
which subjects were considered
why they were selected
what evidence existed
which claims survived review
which narrative gateways worked
which packages were tested
how audiences responded
which beliefs changed
```

That decision-and-evidence history is what eventually makes Hermes genuinely intelligent.
