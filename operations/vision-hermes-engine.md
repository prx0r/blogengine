# Vision: Hermes Engine — Cognitive Controller for an Automated Documentary Foundry

> A research lab disguised as a media company. The goal: systematically identify intellectually underserved topics and produce documentaries about them, fully automated except for human voiceover recording.

---

## Table of Contents

- [A. Hermes as Cognitive Controller — End-to-End Flow](#a-hermes-as-cognitive-controller--end-to-end-flow)
- [B. Latent Variable Architecture — Models Represent Decisions, Not Datasets](#b-latent-variable-architecture--models-represent-decisions-not-datasets)
- [C. Cloudflare-Native ML Strategy](#c-cloudflare-native-ml-strategy)
- [D. The Bayesian Title Engine](#d-the-bayesian-title-engine)
- [E. GCP Credit Strategy ($300)](#e-gcp-credit-strategy-300)
- [F. Evidence Contracts — Unified Model Response Schema](#f-evidence-contracts--unified-model-response-schema)
- [G. Implementation Roadmap](#g-implementation-roadmap)
- [H. Open Questions & Risks](#h-open-questions--risks)

---

## A. Hermes as Cognitive Controller — End-to-End Flow

Hermes is the central intelligence. It does NOT run on Cloudflare Workers. It runs as a Hermes Agent (Nous Research) Docker container on a VPS (Hetzner, €5/mo), with persistent memory, cron, 70+ tools, and a skills system. It talks to Cloudflare Workers via HTTPS and to TryPost via MCP.

The pipeline has 8 stages. Each stage consumes a specific dataset and produces a specific output that Hermes can query.

### Stage 1: Signal Detection

**Hermes scans these sources daily:**

| Source | Frequency | What It Produces | Mechanism |
|--------|-----------|------------------|-----------|
| **Daily Research Worker** (Cloudflare cron) | Daily 06:00 UTC | Breakout videos from 75 tracked channels, breakout scores | `GET /api/research/opportunities` on farm Worker |
| **Reddit** (R2 Parquet) | Weekly batch | Question clusters, cross-subreddit opportunity scores | DuckDB query against `s3://research-datasets/reddit/` |
| **Global Trending** (R2 tarball) | Weekly batch | Cross-country diffusion signals, IN→US lag | BigQuery or DuckDB extraction |
| **Google Trends** (pytrends on VPS) | Weekly | Western demand signal (US+GB) for topic terms | `pytrends.interest_over_time()` |
| **Reddit intelligence** (R2) | Monthly | Topic persistence, language drift, narrative frames | Pre-computed in R2 Parquet |

**The signal detection Worker** is a Cloudflare cron that runs daily at 06:00 UTC. It:
1. Calls `playlistItems.list` + `videos.list` for all tracked channels
2. Computes per-channel OLS residual breakout scores
3. Runs thumbnail cascade (cheap features on all, LLaVA on stratified sample)
4. Pushes high-opportunity topics to `research_ingest` Queue

Hermes polls the Worker's `/api/research/opportunities` endpoint each morning and aggregates signals into a candidate list.

### Stage 2: Topic Validation

For each candidate topic, Hermes runs a validation pipeline. It queries datasets in this order:

```
1. YouTube Gap Score (farm D1)
   "How many IN-only channels vs US/GB channels appear for this topic?"
   → If gap_score < 0.30, discard.

2. Google Trends (VPS pytrends)
   "Is there Western search demand for this topic?"
   → If western_demand < 0.2 (normalized 0-1), flag as high-risk.

3. YouNiverse Breakout Model (Workers AI)
   "Do similar topics break out in existing channels?"
   → Query via Vectorize: find similar topic terms, check their breakout rate.

4. Reddit Question Clusters (R2 DuckDB)
   "Is there a recurring question about this topic across subreddits?"
   → Query pre-computed question clusters. If specialist_depth * mass_signal > threshold, boost.

5. Global Trending (BigQuery/DuckDB)
   "Is this topic trending in IN that hasn't appeared in US yet?"
   → Check cross-country diffusion lag. If IN trending + US absent → high language_lag signal.

6. Clickstream Gateway Graph (R2 DuckDB)
   "What gateway entities lead people to this topic?"
   → Query clickstream dataset: "people reach Chinnamasta through Kali."
   → Produces narrative entry frame.

7. Viability Gates (hard checks)
   - source_depth >= minimum (do we have primary texts?)
   - visual_depth >= minimum (are there public domain images?)
   - central_mystery exists (is there a question worth answering?)
   - safe editorial treatment possible (no living lineage claims)
   - independent_channel_count >= 3 (not a single-channel phenomenon)
```

### Stage 3: Opportunity Scoring

After validation, Hermes computes the weighted score:

```
topic_opportunity = 0.30 * clamp(gap_score)
                  + 0.25 * clamp(language_lag)
                  + 0.20 * clamp(breakout_rate)
                  + 0.15 * clamp(western_demand)
                  + 0.10 * clamp(pageview_signal)
```

Where `clamp(x) = max(0.1, min(1.0, x))`.

Additionally, Hermes applies:
- **Replicated topic boost**: if `independent_channel_count >= 3`, multiply by 1.2
- **Celebrity dependence penalty**: if all signal comes from one large channel, multiply by 0.7
- **Bayesian title prior update**: query the Upworthy title model for the topic's best title frame

### Stage 4: Research Pack Construction

For topics with opportunity > 0.5, Hermes builds a research pack:

```json
{
  "research_pack_id": "RP-{slug}",
  "claims": [
    {
      "claim": "The Kapalikas carried skull-topped staffs as a deliberate inversion of caste markers.",
      "certainty": "scholarly_consensus",
      "sources": [
        {
          "source_id": "work:example",
          "locator": "Chapter 3, p. 45-47",
          "secondary": "Davidson 2002, Indian Esoteric Buddhism"
        }
      ]
    }
  ],
  "fact_check": {
    "all_claims_sourced": true,
    "gates_passed": ["F01", "F02", "F03", "F04"]
  }
}
```

**Sources come from:**
- **SARIT** (R2 TEI XML): search Sanskrit forms → retrieve verse + context
- **Muktabodha** (R2): Shaiva Tantra manuscript sources
- **GRETIL** (R2): full Sanskrit corpus for cross-reference
- **Stack Exchange** (R2): community-validated explanations
- **Upworthy title priors**: what framing worked for similar topics
- **Reddit recommendation graph**: what sources does the community recommend?

### Stage 5: Treatment Generation

Hermes generates a treatment containing:
- Title candidates (weighted by Upworthy priors + Bayesian title engine)
- Hook selection (from hook library, matched to topic)
- Narrative structure (flexible narrative functions, not fixed 8-beat)
- Source list with certainty levels
- Visual asset requirements

The treatment is sent to the control plane for human approval.

### Stage 6: Script Writing

After treatment approval, the farm Worker's Workflow runs:

1. **generate_treatment** → AI Gateway (DeepSeek), ~$0.02
2. **write_script** → AI Gateway, HOST/AI-COHOST format, ~$0.05
3. **Validation gates**: every AI-COHOST line has a source, HOST lines are reactions only

The script uses the Upworthy title model to rank title candidates: for each pair of proposed titles, predict which wins. The Bayesian belief engine provides uncertainty-calibrated predictions.

### Stage 7: Thumbnail Design

Thumbnails are composed deterministically from:
- **Met Museum Open Access** (R2): CC0 museum objects filtered by culture/period
- **DPLA** (R2): cultural heritage objects
- **Smithsonian** (R2): South Asian ritual objects, manuscripts

FLUX is used ONLY for backgrounds or texture extensions. The brand edge is authentic historical artwork + crisp typography.

### Stage 8: Publishing + Feedback Loop

After publish, the learning pipeline fires at fixed ages:
- 24h, 7d, 28d, 90d snapshots
- Hypothesis testing against historical corpus priors
- Bayesian update of the title engine with new A/B data
- Genome feedback: which patterns worked?

```
Published → YouTube Analytics API → farm D1 hypotheses table
  → Hermes reads weekly: "Which of our priors were confirmed/rejected?"
  → Updates: opportunity score weights, title priors, hook library
```

---

## B. Latent Variable Architecture — Models Represent Decisions, Not Datasets

Datasets are evidence sources. Models should correspond to **decisions or latent variables**, not storage buckets. Nine one-off models, each trained on a different dataset with no shared representation, produces incomparable scores that Hermes must glue together with ad-hoc weights. The current weighted sum formula (0.30 gap + 0.25 language lag + ...) will double-count evidence — for example, Google Trends demand, trending video presence, Reddit question volume, and Wikipedia clickstream may all rise from the same underlying event.

### B1. Latent Variables

Replace nine model scores with beliefs about a small number of underlying quantities:

```
D = audience demand (is anyone looking for this?)
S = supply scarcity (is it underserved?)
M = topic momentum (is it growing?)
T = cross-market transfer (will it travel?)
V = production viability (can we research and illustrate it?)
F = audience-topic fit (does this specific channel's audience want this?)
```

Each dataset updates one or more of these beliefs:

```
Google Trends            → D (western demand)
YouTube search gap map   → S (supply scarcity)
YouNiverse breakout      → D, F (related topics broke out)
Global Trending          → M, T (diffusing geographically)
Reddit question clusters → D, F (people asking about it)
Clickstream gateways     → F, T (gateway entities exist)
SARIT / Muktabodha       → V (source depth)
Met Museum / DPLA        → V (visual depth)
Wikipedia pageviews      → M (interest velocity)
Stack Exchange           → D, V (community Q&A depth)
```

The evidence object for "Chinnamasta":

```json
{
  "topic": "Chinnamasta",
  "beliefs": {
    "western_demand": {
      "mean": 0.41, "ci_90": [0.24, 0.62],
      "sources": ["google_trends", "reddit"]
    },
    "supply_scarcity": {
      "mean": 0.82, "ci_90": [0.73, 0.89],
      "sources": ["youtube_gap_map"]
    },
    "cross_market_transfer": {
      "mean": 0.58, "ci_90": [0.29, 0.78],
      "sources": ["global_trending"]
    },
    "production_viability": {
      "mean": 0.91,
      "sources": ["sarit", "museum_assets", "source_gate"]
    }
  }
}
```

### B2. Concrete Implementations

| Latent Variable | Method | Primary Dataset | Deploy | Priority |
|----------------|--------|----------------|--------|----------|
| audience_demand | Google Trends time-series + Reddit question frequency | Google Trends, Reddit | VPS batch | Phase 3 |
| supply_scarcity | Gap score formula + bootstrap CI | YouTube search API | Worker | Phase 1 |
| topic_momentum | YouNiverse breakout rate + trend slope | YouNiverse | Workers AI | Phase 5 |
| cross_market_transfer | Exploratory analysis (descriptive, not predictive yet) | Global Trending | BigQuery | Phase 4 |
| production_viability | Heuristic gate (source depth, visual depth, mystery, independence) | SARIT, Met, SE | Worker | Phase 3 |
| audience_topic_fit | Reddit cross-subreddit score + channel profile similarity | Reddit, YouNiverse | DuckDB | Phase 3 |
| opportunity_score | Weighted belief combination | All above | Worker | Phase 1 |

### B3. Title Ranking (Separate System, Maintain Both Models)

The Upworthy title engine maintains two distinct models, not one:

**Model A: Descriptive Feature Posteriors (Beta-Binomial)**
For each binary feature:
```
wins_observed ~ Binomial(comparisons, θ_f)
θ_f ~ Beta(α, β)
```
Used for: readable priors, uncertainty displays in dashboard, fast updates.

**Model B: Pairwise Predictive Ranker (Bayesian Logistic Regression)**
```
P(A beats B) = logistic((X_A - X_B)β + context_effects)
```
with Normal or hierarchical priors over coefficients. Used for: comparing complete title candidates, controlling correlated features.

Maintain both. The first explains; the second predicts. They are not the same model.

### B4. Models Deferred Until Label Validation

**YouNiverse breakout classifier (XGBoost):** The breakout metric is "differentiated, not validated." Training XGBoost on an unvalidated label creates a highly optimized predictor of a potentially meaningless target. Redo A1-A3 as Tier 1 against YouNiverse time series before building the deployment stack.

**Cross-country diffusion model (Cox PH):** The Global Trending tarball must be extracted and explored first. A descriptive analysis (does IN-to-US diffusion happen at measurable rates for our niche?) should precede a predictive model. We don't know if the signal exists.

**Comment intent classifier (DistilBERT):** Requires labeled training data (10K comments). No labeled data exists. A pilot study (200-500 hand-labeled comments) should determine whether the taxonomy is learnable before fine-tuning a BERT variant.

**Sanskrit-English NMT (NLLB-200):** This is a separate project. Translation of philosophical Sanskrit requires text normalization, sandhi/morphology, genre-specific evaluation, and human reference translations. Defer to existing translation services (Dyczkowski corpus, GRETIL) rather than building a custom NMT pipeline.

---

## C. Cloudflare-Native ML Strategy

### C1. What Runs on Workers AI ($5/mo included)

| Model Type | Specific Model | Cost | Use Case |
|------------|---------------|------|----------|
| Embeddings | @cf/baai/bge-small-en-v1.5 | ~1 neuron/query | Title embedding, comment embedding, topic embedding |
| Classification | @cf/microsoft/resnet-50 | ~50 neurons/image | Thumbnail classification (has_face, brightness, contrast) |
| Visual QA | @cf/llava-hf/llava-1.5-7b-hf | ~500 neurons/image | Full thumbnail analysis (use on 25% stratified sample only) |
| Text classification | @cf/huggingface/distilbert-sst-2-int8 | ~5 neurons/text | Comment intent classifier |
| Small LLM | @cf/meta/llama-3.2-3b-instruct | ~30 neurons/query | Lightweight text processing, hook classification |

**Cost rule:** 900 LLaVA analyses × 500 neurons = 450,000 neurons. At $0.011/1k = $4.95. The cascade (cheap features on all, LLaVA on 25% stratified sample) cuts this by ~80%.

### C2. Vectorize — Vector Similarity Search

Vectorize ($0 included with Workers Paid) is the backbone of all similarity operations:

| Index | Dimension | Use Case | Update Frequency |
|-------|-----------|----------|-----------------|
| `topic-similarity` | 384 (bge-small) | Given a topic, find similar breakout topics from YouNiverse | Weekly |
| `question-similarity` | 384 | Given a user question, find best answer from Stack Exchange | On data update |
| `asset-retrieval` | 512 (CLIP) | Given a topic, find relevant images from Met/DPLA/Smithsonian | On data update |
| `script-retrieval` | 384 | Given a topic description, find best-performing script patterns | On new publish |
| `gateway-entities` | 384 | Given an entity, find gateway entities | On clickstream update |

**Example topic-similarity query:**
```
POST /api/vectorize/topic-similarity/query
{ "vector": [0.1, -0.3, ...],  // embedded from "Chinnamasta tantric goddess"
  "topK": 10,
  "returnMetadata": true }
→ { "matches": [
    { "topic": "Kali", "similarity": 0.87, "breakout_rate": 0.34 },
    { "topic": "Bhairava", "similarity": 0.72, "breakout_rate": 0.28 }
  ] }
```

### C3. D1 + Queues — Pipeline State and Batch Inference

| Table | Purpose | Schema |
|-------|---------|--------|
| `model_predictions` | Cache model inference results | `(prediction_id, model_name, input_hash, output_json, created_at, expires_at)` |
| `inference_batches` | Track batch inference jobs | `(batch_id, model_name, status, total_items, completed_items, created_at)` |
| `model_versions` | Track deployed model versions | `(model_name, version, deployed_at, evaluation_metrics_json, is_active)` |

**Queue topology for ML:**
```
research_ingest       ← Research cron pushes new topics for batch scoring
model_training        ← Retraining triggers (scheduled or event-driven)
model_inference       ← Batch inference jobs (e.g., re-embed all thumbnails)
dead_letter           ← Failed ML jobs for manual review
```

### C4. R2 — Model Weights, Vector Indexes, Dataset Storage

| Object | Location | Size |
|--------|----------|------|
| YouNiverse model (XGBoost ONNX) | `s3://models/youniverse/breakout-v1.onnx` | ~50 MB |
| Upworthy model (Bayesian LR weights) | `s3://models/upworthy/title-ranker-v1.json` | ~1 MB |
| Comment classifier (DistilBERT ONNX) | `s3://models/ytcomments/intent-classifier-v1.onnx` | ~90 MB |
| CLIP image embeddings (Met Museum) | `s3://embeddings/met-openaccess/clip-v1/` | ~2 GB |
| REDIS cluster backups (optional) | `s3://vector-index-backups/` | Variable |
| All research datasets | `s3://research-datasets/` | ~50 GB |

---

## D. The Bayesian Title Engine

The Upworthy title engine maintains **two distinct models**, not one. They serve different purposes and use different inference mechanisms.

### D1. Model A: Descriptive Feature Posteriors (Beta-Binomial)

For each binary feature (question mark, "actually", imperative opening, etc.):

```
wins_observed ~ Binomial(present_comparisons, θ_f)
θ_f ~ Beta(α, β)

prior: θ_f ~ Beta(1, 1)
posterior: θ_f | data ~ Beta(1 + wins, 1 + losses)
```

Useful for: readable priors, uncertainty displays in the dashboard, fast closed-form updates. This is NOT a predictive model — it describes what we've observed about each feature independently.

**Inference:** Closed-form (conjugate update). No MCMC needed.

### D2. Model B: Pairwise Predictive Ranker (Bayesian Logistic Regression)

```
P(A beats B) = logistic((X_A - X_B)β + context_effects)
β ~ Normal(0, σ²)  or hierarchical priors per feature group
```

Useful for: comparing complete title candidates, controlling for correlated features, platform interactions.

**Inference:** Hamiltonian Monte Carlo (Pyro/PyMC) — retrained weekly on GCP or VPS. At query time: compute P(A > B) from posterior samples stored in D1.

### D3. Thompson Sampling for Exploration

When Hermes generates title candidates, it samples from the posterior rather than always picking the top-ranked:

```
P(select variant A) = P(A's latent CTR > B's latent CTR | data)
```

Low-uncertainty features are exploited; high-uncertainty features are explored.

### D4. Title Testing Reality — Evidence Quality

Native YouTube testing capabilities, eligibility, and Analytics API exposure may not match the idealized pipeline. The ingestion layer must handle multiple experiment types with different evidence weights:

| Source | Evidence Weight | Notes |
|--------|----------------|-------|
| YouTube Test & Compare (randomized) | 1.0 | Gold standard |
| Sequential title swap (non-randomized) | 0.25 | Time/audience composition changes |
| Thumbnail test | 0.6 | Quasi-randomized |
| Observational (video A vs video B) | 0.1 | Too many confounds |
| External dataset (Upworthy) | 0.5 | Causal within source domain |

```sql
CREATE TABLE title_posteriors (
  feature_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  alpha REAL NOT NULL,
  beta REAL NOT NULL,
  last_updated TEXT NOT NULL,
  n_experiments INTEGER DEFAULT 0,
  PRIMARY KEY (feature_id, domain)
);

CREATE TABLE title_experiments (
  experiment_id TEXT PRIMARY KEY,
  video_id TEXT,
  title_a TEXT, title_b TEXT,
  impressions_a INTEGER, clicks_a INTEGER,
  impressions_b INTEGER, clicks_b INTEGER,
  winner TEXT,
  evidence_quality REAL DEFAULT 0.1,
  started_at TEXT, completed_at TEXT,
  ingested_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE title_posterior_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  snapshot_date TEXT NOT NULL,
  feature_posteriors JSON NOT NULL,
  model_version TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

The `evidence_quality` column prevents nonrandomized title swaps from updating the causal posterior with the same weight as randomized experiments.

---

## E. GCP Credit Strategy ($300)

The credit should fund **experiments that produce reusable assets**, not monthly infrastructure. Don't commit to recurring services before the corresponding model proves useful.

### E1. Principle: Experiments Over Infrastructure

Least valuable allocations (defer or skip):
- Cloud Run FFmpeg rendering ($80) — VPS FFmpeg has $0 marginal cost
- Video Intelligence API ($50) — interesting but speculative; no demonstrated ROI
- Vision API thumbnail analysis ($20) — same

Most valuable allocations:
1. Processing datasets that are awkward locally (BigQuery)
2. Model experiments with clear falsification conditions
3. Expensive embedding/classification batches that create reusable assets
4. Temporary GPU training where the artifact survives after credits expire

### E2. Revised Budget

| Spend | Service | Use | When |
|-------|---------|-----|------|
| $80-120 | Vertex AI / preemptible VMs | Model experiments + training: Bayesian title ranker, YouNiverse pilot, embedding batches | Phase 1-3 |
| $30-50 | BigQuery | Large-dataset exploration: Global Trending extraction, cross-dataset joins, clickstream processing | Phase 4 |
| $40-80 | Cloud Run GPU (preemptible) | Sanskrit translation benchmark/fine-tune — verify whether NLLB-200 works before committing | Phase 6 (deferred) |
| $20-40 | Vision API / Video Intelligence | One-shot competitor analysis experiments — measure once, not monthly | Phase 5 |
| $30 | Hold for validated bottlenecks | Spend only when a model proves useful and needs scaling | Ongoing |

### E3. BigQuery Allocation ($30-50)

| Dataset | Query Pattern | Cost | Notes |
|---------|---------------|------|-------|
| Global Trending extraction | IN→US diffusion analysis | ~$3 (one-time) | Extract tarball → BQ → explore diffusion signal |
| YTCommentVerse | Comment language distribution | ~$1 (one-time) | Check if language-as-geography proxy exists |
| Clickstream | Gateway entity graph | ~$2 (one-time) | Precompute gateway entities, cache in D1 |
| Cross-dataset experiments | YouNiverse × Trending | ~$5 | Does breakout predict trending appearance? |

### E4. Model Training Experiments ($80-120)

| Experiment | Cost | Success Condition | Artifact |
|-----------|------|-------------------|----------|
| Upworthy Bayesian ranker (HMC) | ~$5 | Converges, predictive check passes | Posterior samples + model weights |
| YouNiverse breakout pilot (toy XGBoost, validate label first) | ~$5 | Validated breakout label (Tier 1 redo) | Feature importance + label validation report |
| Reddit embedding + HDBSCAN batch | ~$10 | Silhouette > 0.3 | Question clusters in R2 |
| Vision API thumbnail pilot (200 images) | ~$3 | Detectable patterns in breakout thumbnails | Composition pattern library |
| Sanskrit NLLB benchmark | ~$15 | BLEU > 25 on test set | Comparison of NLLB vs DeepSeek translation quality |
| Total model experiments | ~$38 | — | — |

Remaining $42-82 held for validated bottlenecks. Spend credits only when a model proves useful in shadow deployment.

---

## F. Evidence Contracts — Unified Model Response Schema

Every model endpoint returns the same envelope so Hermes can compare predictions across models without assuming equal calibration.

### F1. The Contract

```json
{
  "model": "upworthy-title-ranker",
  "model_version": "0.2.1",
  "prediction": {
    "value": 0.63,
    "ci_90": [0.55, 0.71]
  },
  "evidence": {
    "sample_size": 4182,
    "domain": "Upworthy confirmatory, 2013-2015",
    "data_period": "2013-01 to 2015-12",
    "last_updated": "2026-07-20",
    "external_validation": false
  },
  "limitations": [
    "Upworthy headline effects may not transfer to YouTube documentary titles",
    "No validation on documentary-domain data"
  ],
  "operational_status": "shadow"
}
```

Every field is required. The schema:

| Field | Always Present | Purpose |
|-------|---------------|---------|
| `model` | Yes | Which model produced this |
| `model_version` | Yes | Semver — enables rollback |
| `prediction.value` | Yes | Point estimate |
| `prediction.ci_90` | Yes | 90% credible/confidence interval |
| `evidence.sample_size` | Yes | How many observations |
| `evidence.domain` | Yes | What population was this trained/validated on |
| `evidence.data_period` | Yes | Time range of training data |
| `evidence.last_updated` | Yes | Freshness timestamp |
| `evidence.external_validation` | Yes | Has this been validated outside training domain? |
| `limitations` | Yes | At least one limitation |
| `operational_status` | Yes | experimental / shadow / candidate / production / deprecated |

This prevents Hermes from comparing a validated probability (n=5,000, external validation passed) with an uncalibrated heuristic as though both are equivalent.

### F2. Hermes Consumption

Hermes should never receive a naked `0.63`. It reads:

```text
model: upworthy-title-ranker
version: 0.2.1
prediction: title_a beats title_b with 0.63 probability
domain: Upworthy 2013-2015
confidence: small transfer weight to YouTube
status: shadow
```

A shadow status means "use as directional prior, don't deploy as ranker until manually approved." Hermes can still use the prediction — but weighted by the evidence quality.

### F3. Worker Endpoints

Each model exposes a Worker endpoint returning the evidence contract:

| Endpoint | Model | Cache |
|----------|-------|-------|
| `POST /api/models/upworthy/rank-titles` | Upworthy Bayesian | 24h TTL |
| `POST /api/models/upworthy/ingest` | Ingestion | No cache |
| `POST /api/models/assets/search` | CLIP asset retriever | 1h TTL |
| `GET /api/reddit/questions?topic=X` | Reddit clusters | 24h TTL |
| `GET /api/models/clickstream/gateways?entity=X` | Gateway graph | 7d TTL |
| `POST /api/models/predict-breakout` | YouNiverse (Phase 5) | 1h TTL |
| `GET /api/models/predict-diffusion?topic=X` | Diffusion (Phase 5) | 24h TTL |

### F4. Scheduled Batch Jobs

| Job | Frequency | What It Does |
|-----|-----------|-------------|
| Reddit recluster | Biweekly | Re-embed + re-cluster, upload to R2 |
| Clickstream update | Monthly | Recompute gateway graph from new dump |
| Upworthy posterior update | Monthly | Full HMC posterior update |
| YouNiverse breakout recompute | Weekly | Full recomputation of breakout scores |
| Model health check | Daily | Ping all endpoints, check freshness, flag stale predictions |

### F5. Approval Gates with Model Predictions

When Hermes presents a treatment for approval, every model prediction includes its evidence contract:

```
┌──────────────────────────────────────────────────────────────┐
│ Treatment: "Why Enlightenment Does Not Destroy the Ego"      │
│                                                              │
│ Model Predictions:                                            │
│                                                              │
│ Title rank: 0.63                                             │
│   [upworthy-title-ranker v0.2.1, shadow, n=4182, Upworthy]  │
│                                                              │
│ Gap score: 0.72                                              │
│   [gap-map v1.1.0, production, n=30 queries, YouTube API]   │
│                                                              │
│ Reddit opportunity: 0.68                                     │
│   [reddit-clusters v0.1.0, experimental, n=12 subreddits]   │
│                                                              │
│ [Approve] [Revise] [Terminate]                                │
└──────────────────────────────────────────────────────────────┘
```

The human sees both the prediction and the evidence quality. A shadow prediction next to a production prediction is visually distinguishable.

---

## G. Implementation Roadmap

The system's first real success criterion: **Did it help choose and produce a better first ten videos?** Build the evidence contracts, title engine, research retrieval, and approval loop first. Make the rest earn its place through ablation and measurable decision improvement.

### Phase 0: What We Have Today (Done)

| Asset | Status |
|-------|--------|
| YouNiverse breakout metric (A1-A3) | Differentiated, not validated |
| Gap score pattern | Confirmed (16/30 queries) |
| Wikipedia signal | Skipped (r=0.027, permanently) |
| Daily search collection | Cron running (12 days remaining) |
| Upworthy title analysis | Per-feature win rates, logistic regression (failed 0.55 gate) |
| Farm template Worker | Written, untested, stubs throw errors |
| Control plane schema | 5 D1 tables designed |
| R2 datasets | YouNiverse, YTCommentVerse, Global Trending, Google Trends, Gretil, Hindi transcripts |
| Blueprint datasets (R2) | Upworthy, Clickstream, Met Museum, SARIT, Stack Exchange, Muktabodha, translation datasets |
| Hermes agent | Installed, Telegram gateway, skills system |
| Market scan skill | 75-channel daily monitoring |

### Phase 1: Evidence Substrate (~1 week)

**Goal:** A common schema for all model predictions so Hermes never receives a naked score. Prevents nine incompatible mini-systems.

**Tasks:**
1. Design and implement **evidence contract schema** (see Section F)
2. Build **model registry** D1 table (model_id, version, status, last_updated, domain, endpoint_url)
3. Add **lineage tracking** to all existing research outputs (dataset hashes, code commits, formula versions)
4. Add **freshness metadata** to every R2 dataset (last_updated timestamp)
5. Build a simple **prediction logging** endpoint: `POST /api/models/log-prediction`
6. Replicate Upworthy analysis on **holdout dataset** — check if per-feature directions replicate
7. Add **confidence intervals** to existing per-feature win rates
8. Add **permutation test** (shuffle winner labels 1,000x, compare to null distribution)

**Deliverable:** Every model endpoint returns the same envelope. Hermes can distinguish validated predictions from exploratory heuristics.

### Phase 2: Title Belief Engine (~1 week)

**Goal:** Bayesian Beta-Binomial posteriors for all title features, deployed as exploratory.

**Tasks:**
1. Build Model A **(descriptive Beta-Binomial posteriors)** — one per feature, CIs on everything
2. Build Model B **(Bayesian logistic pairwise ranker)** — Pyro on VPS or GCP
3. Deploy as **exploratory** (operational_status = "shadow")
4. Build explanation display: at approval gates, show uncertainty, not just point estimates
5. Implement D1 schema for posterior storage
6. Add ingestion endpoint: `POST /api/models/upworthy/ingest`
7. Feature belief registry dashboard: posterior plots per feature

**Deliverable:** Hermes queries `rank-titles(topic, a, b)` → probability + CIs + limitations. Dashboard shows title uncertainty at approval gates.

### Phase 3: Research Intelligence (~2 weeks)

**Goal:** Datasets that directly improve documentary production, not just prediction.

**Tasks:**
1. **Reddit clusters** — run extraction, embed, HDBSCAN, store in R2
2. **Reddit recommendation graph** — from top-voted comments per subreddit
3. **Visual asset retrieval** — CLIP embed museum captions, Vectorize index
4. **Gateway entity graph** — process clickstream, cache in D1
5. **Stack Exchange Q&A extractor** — deterministic DuckDB queries
6. **Source-depth gate** — validate against SARIT + Muktabodha
7. **Visual-depth gate** — validate against Met Museum + DPLA
8. Build query endpoints: `GET /api/reddit/questions?topic=X`, `POST /api/assets/search`, `GET /api/clickstream/gateways?entity=X`

**Deliverable:** Hermes gets research packs, visual assets, and audience questions for any topic. Production bottleneck shifts from "can we research this?" to "which topic should we record?"

### Phase 4: Validate Opportunity Labels (~1 week)

**Goal:** Before training any predictive model, confirm the target labels are meaningful.

**Tasks:**
1. **Redo A1-A3 as Tier 1** — compare OLS residual, views/day, age-bin percentile against future view growth in YouNiverse time series. Bootstrap CIs. External outcome validation.
2. **Test gap score stability** — 14-day collection ends (12 days remaining), compute week-over-week Spearman r. If r < 0.3, weekly cadence needs redesign.
3. **Ablation study** — measure whether current opportunity score (weighted sum) ranks known breakout topics above non-breakout topics in YouNiverse. Run with all 5 components, then remove each one. Does any component add negative value?
4. **Global Trending descriptive analysis** — extract tarball, answer: does IN-to-US diffusion actually happen at measurable rates for philosophy/religion categories? If not, skip the diffusion model entirely.

**Deliverable:** Confirmed which labels are real (breakout metric, gap score) and which are noise. Opportunity score weights are empirically grounded, not guessed.

### Phase 5: Train Opportunity Models (~2 weeks)

**Goal:** Predictive models for the validated latent variables, deployed with evidence contracts.

**Tasks:**
1. **YouNiverse breakout classifier** (XGBoost, validated label from Phase 4)
2. **Cross-country diffusion model** (only if Phase 4 found measurable diffusion signal)
3. **Opportunity score as learned model** (replace hand-tuned weights with learned combination)
4. Deploy all as **shadow** — running alongside existing heuristics, not replacing them
5. Compare model predictions to heuristic scores for 30 days
6. Only promote if model consistently outperforms heuristic

**Deliverable:** Three predictive models deployed in shadow mode, being evaluated against current heuristic baselines.

### Phase 6: Online Learning from Own Production Data (Ongoing)

**Goal:** Every published video feeds back into model improvements.

**Tasks:**
1. Implement YouTube Test & Compare capture → title_experiments table
2. Weekly Bayesian posterior update from own A/B results
3. Compare own posteriors to Upworthy priors — does the transfer hold?
4. Genome feedback: which patterns predicted success?
5. Monthly: retrain YouNiverse model with own channel data added
6. Quarterly: re-evaluate all opportunity score weights vs actual performance

**Deliverable:** Models improve with every published video. Opportunity score weights are data-driven per channel.

### Beyond: Choose What Evidence to Collect Next

The system should eventually decide which video to make based on both expected production value AND expected information gain:

```
utility = production_value + information_gain_weight
```

Three production modes:

| Mode | Goal | Example |
|------|------|---------|
| EXPLOIT | Maximize expected success | Highest-confidence topic, proven packaging |
| EXPLORE | Test a high-uncertainty hypothesis | Topic with wide posterior — learn whether a whole class of topics works |
| FOUNDATION | Create evergreen gateway content | "What Is Kashmir Shaivism?" — needed for later topics to be discoverable |

This prevents the system from converging on a narrow formula. A video becomes both a piece of media and an experiment that improves the organism.

---

## H. Open Questions & Risks

### H1. Dataset Transfer Risk

**The biggest unknown: Do Upworthy priors transfer to YouTube documentary titles?**

Upworthy data is 2013-2015 list-style clickbait. YouTube documentary titles are 2026+ search-driven. The logistic regression got 52.5% — above chance, below useful. The Bayesian model might not do better.

**Test:** First 10 videos. Run Test & Compare on 3. Compare coefficient directions to Upworthy. If correlation is positive, the prior is useful. If negative, discard.

### H2. Breakout Metric Validity

**Does the OLS residual breakout metric predict actual video performance?**

We have "differentiated, not validated." A1 showed 44% label difference from raw views. But that's a difference metric, not a prediction metric. The redo with YouNiverse time series (A1-A3 as Tier 1) needs to happen.

**Fail condition:** If the breakout metric has no predictive power for future views in the YouNiverse time series, the entire opportunity formula needs redesign.

### H3. Small Sample in Own Production

**The first 10 videos are a coin flip for hypothesis testing.**

n=10 is not enough to distinguish "gap score doesn't work" from "packaging was bad." The Bayesian framing means own data updates the prior, doesn't overturn it. Need n=30-50 before own data dominates.

**Mitigation:** Design first 10 videos as one structured experiment. Span high and low gap scores. Hold packaging constant. Use Bayesian updating, not binary pass/fail.

### H4. Context Window Limits

**Workers have 5 min CPU per step. Model inference on large models may exceed this.**

ONNX models (XGBoost, DistilBERT) should finish in <1s. But if you run LLaVA on 50 thumbnails in one step, that's 500 neurons × 50 = 25,000 neurons, which at ~5s each = 250s (~4 min). Close to limit.

**Mitigation:** Batch smaller. Use Queues for batch inference. Never run LLaVA on the main request path.

### H5. Vectorize Index Freshness

**Clickstream data updates monthly. Reddit clusters update biweekly. YouNiverse embeddings update quarterly.**

Stale indexes produce stale recommendations. Hermes needs to know the staleness of each index.

**Mitigation:** Store `last_updated` timestamp in D1 per index. Hermes checks before querying. If stale > 2× expected update frequency, flag for refresh.

### H6. BigQuery Costs on $300 Credit

**At $5/TB scanned, scanning the full 26.4 GB Global Trending tarball costs only $0.13. But repeated full scans add up.**

**Mitigation:** Partition by year+month. Scan only recent partitions for daily/weekly queries. Full scan only for monthly recomputation.

### H7. Real-Time vs Batch Inference

**Some models need real-time inference (title ranking during Hermes decision) and some are batch-only (Reddit reclustering).**

The architecture must support both. Real-time: Workers AI + Vectorize. Batch: Queues + GCP Cloud Run.

**Risk:** Confusing batch-only models for real-time ones (e.g., trying to re-cluster Reddit on every topic query).

### H8. The $300 GCP Credit Expires

**After the credit expires, the system needs to fit within ~$15/month Cloudflare budget.**

Some GCP services can migrate:
- BigQuery → DuckDB on VPS (slower but free)
- Vision API → Workers AI ResNet-50 (less capable but free)
- Video Intelligence → manual spot-checking (worse but free)
- Cloud Run FFmpeg → VPS FFmpeg (already exists)
- Vertex AI training → VPS training (slower GPUs)

**Design upfront for migration.** Use ONNX as the interchange format. Don't rely on GCP-specific features that can't be replicated on Workers AI + VPS.

### H9. Model Evaluation Without Ground Truth

**For the first 10 videos, there's no ground truth for "is this a good title?" beyond human approval.**

Test & Compare on YouTube is the only source of ground truth, and it's underpowered at low traffic.

**Mitigation:** Use click-through rate from Test & Compare as the ground truth. Expect wide CIs. Don't reject the Bayesian approach on the first null result. The model is a prior, not a final answer.

### H10. The Voiceover Bottleneck

**None of these ML models solve the human voiceover constraint.**

The models help pick topics that matter. They can't make you record faster. At ~2 hours/week, maximum output is ~8 videos/month. The ML system amplifies the value of each recording session by choosing better topics, but it doesn't remove the ceiling.

---

## Appendix: Model Deployment Matrix

| Model | Framework | Infrastructure | Status | Value | Phase |
|-------|-----------|---------------|--------|-------|-------|
| Upworthy Beta-Binomial (Model A) | Closed-form conjugate | Worker + D1 | ✅ Build now | High: uncertainty for every title decision | Phase 2 |
| Upworthy Bayesian LR (Model B) | Pyro HMC | Workers AI + GCP training | ✅ Build now | High: pairwsie ranker with CIs | Phase 2 |
| Reddit question clusters | MiniLM + HDBSCAN | VPS + DuckDB | ✅ Build now | High: directly improves topic selection | Phase 3 |
| CLIP asset retriever | CLIP → Vectorize | Workers AI + Vectorize | ✅ Build now | High: visual assets for every topic | Phase 3 |
| Gateway entity graph | Aggregation | BigQuery + D1 | ✅ Build now | High: narrative entry frames | Phase 3 |
| Stack Exchange extraction | Deterministic | DuckDB on R2 | ✅ Build now | High: Q&A for research packs | Phase 3 |
| YouNiverse breakout predictor | XGBoost → ONNX | Workers AI | ⏳ Wait for label validation | Medium: depends on breakout metric validity | Phase 5 |
| Cross-country diffusion | Cox PH / Logistic | BigQuery | ⏳ Wait for descriptive analysis | Medium: signal may not exist | Phase 5 |
| Comment intent classifier | DistilBERT → ONNX | Workers AI | ⏳ Wait for labeled data | Medium: requires 10K labeled comments | Phase 5 |
| Sanskrit-English NMT | NLLB-200 fine-tune | GCP Cloud Run GPU | ❌ Separate project | Low: use existing translations instead | Deferred |

## Appendix: Worker Route Map

```
farm-{FARM_ID}.workers.dev/
├── /api/research/
│   ├── gap-map                → D1 gap_map table (cached 1h)
│   └── opportunities          → D1 gap_map WHERE opportunity_score > 0.5
│
├── /api/models/
│   ├── youniverse/
│   │   └── predict-breakout   → Workers AI ONNX inference
│   ├── upworthy/
│   │   ├── rank-titles        → Workers AI Bayesian inference
│   │   └── ingest             → D1 title_experiments insert
│   ├── ytcomments/
│   │   └── classify-intent    → Workers AI DistilBERT inference
│   ├── assets/
│   │   └── search             → Vectorize similarity search
│   ├── global-trending/
│   │   └── predict-diffusion  → D1 cached (BigQuery precomputed)
│   └── clickstream/
│       └── gateways           → D1 cached (BigQuery precomputed)
│
├── /api/factory/
│   ├── produce                → Triggers ProduceVideoWorkflow
│   └── approve/:gate_id       → Gate resolution
│
├── /__cron/
│   ├── daily-research         → Channel harvest + breakout scores
│   ├── weekly-gap             → Full gap map recomputation
│   └── monthly-maintenance    → Full recomputation + model retrain triggers
```

## Appendix: Queue Topology Summary

```
research_ingest
  ← Daily research cron pushes: topics with opportunity > 0.5
  → Workflow: produce_video
    → Pushes to external_jobs when VPS FFmpeg needed
  → Dead letter after 3 retries

model_training
  ← Monthly maintenance cron
  → Triggers: Vertex AI training pipeline
  → Updates: model weights in R2, model_versions in D1

model_inference
  ← Scheduled batch inference (re-embed, recluster)
  → Updates: Vectorize indexes, R2 Parquet files

external_jobs
  ← Workflow pushes FFmpeg render jobs
  → VPS render worker pulls and processes
  → Uploads result to R2, notifies Workflow

dead_letter
  ← All queues after 3 retries
  → Human review via control plane dashboard
```

---

*This document maps the transformation from a set of ~50 spec files and 41 designed experiments into a coherent ML-augmented cognitive controller. Every paragraph references a specific dataset, a specific model architecture, a specific deployment target, and a specific endpoint Hermes can call. Nothing here is generic.*
