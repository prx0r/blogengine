# Vision: Hermes Engine — Cognitive Controller for an Automated Documentary Foundry

> A research lab disguised as a media company. The goal: systematically identify intellectually underserved topics and produce documentaries about them, fully automated except for human voiceover recording.

---

## Table of Contents

- [A. Hermes as Cognitive Controller — End-to-End Flow](#a-hermes-as-cognitive-controller--end-to-end-flow)
- [B. ML Model Architecture — One Model Per Dataset](#b-ml-model-architecture--one-model-per-dataset)
- [C. Cloudflare-Native ML Strategy](#c-cloudflare-native-ml-strategy)
- [D. The Bayesian Belief Engine](#d-the-bayesian-belief-engine)
- [E. GCP Credit Strategy ($300)](#e-gcp-credit-strategy-300)
- [F. Integration with Control Plane](#f-integration-with-control-plane)
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

## B. ML Model Architecture — One Model Per Dataset

Every R2 dataset becomes a queryable model. Each has a specific architecture, framework, and output format.

### B1. YouNiverse — Breakout Prediction Model

**Purpose:** Given a topic/channel, predict whether a video on that topic will break out (top 10% of OLS residual).

**Features (from YouNiverse video metadata):**
- `log(channel_subscribers)`, `channel_category`
- `title_length`, `has_question`, `has_colon`, `power_word_count`
- `duration_seconds`, `duration_bucket`
- `weekday_published`, `hour_published`
- `channel_upload_frequency` (videos/month)
- `channel_median_views`, `channel_std_views`

**Target:** Binary breakout label (top 10% of OLS residual within channel).

**Model type:** Gradient-boosted tree (XGBoost or LightGBM) — interpretable, handles non-linearities, gives feature importance.

**Training:** Train on YouNiverse English channels with ≥20 videos. Hold-out validation by channel ID (no channel leakage). Bootstrap CI on all metrics.

**Deployment:** Export as ONNX, run inference via Workers AI (CPU inference is cheap for tabular models). Or use a small Worker that loads model weights from R2.

**Query endpoint:**
```
POST /api/models/youniverse/predict-breakout
{ "topic_terms": ["Chinnamasta", "Kali"],
  "channel_profile": { "subs": 5000, "category": "Education",
                       "median_views": 2000, "videos_per_month": 4 } }
→ { "breakout_probability": 0.34, "ci_95": [0.28, 0.40],
    "top_features": ["channel_median_views:0.4", "duration:0.3"] }
```

### B2. Upworthy — Title Ranking Model (Bayesian)

**Purpose:** For any two title variants, predict which has higher CTR.

**Features (extracted from headlines):**
- 23 surface features from existing analysis (word count, question mark, exclamation, colon, numbers, 2nd person, negation, curiosity gap, urgency, specificity, imperative opening, question-word opening, uppercase ratio)
- LLM-extracted semantic features: concreteness (0-1), epistemic posture (certain/hedged/curious), narrative frame (mystery/revelation/contrast), technical density
- Eyecatcher embedding (from thumbnail image via CLIP)

**Model type:** Bayesian logistic regression with:
- Beta-Binomial likelihood per feature
- Hierarchical pooling across semantic feature groups
- Thompson sampling for exploration during production

**Training:** Train on Upworthy confirmatory dataset (5,385 tests). Validate on holdout dataset. Report CIs on all coefficients.

**Deployment:** Workers AI for inference. Model weights in R2. Bayesian inference via closed-form Beta-Binomial updates (no MCMC at inference time).

**Query endpoint:**
```
POST /api/models/upworthy/rank-titles
{ "title_a": "The Hidden History of the Kapalikas",
  "title_b": "Why Skull-Carrying Ascetics Were Not What You Think",
  "topic": "Kapalika",
  "thumbnail_embedding": [0.1, -0.3, ...] }
→ { "winner": "title_a",
    "probability_a_beats_b": 0.63,
    "posterior_ci": [0.55, 0.71],
    "feature_contributions": { "question_b: -0.12", "never_b: +0.08", ... } }
```

### B3. Reddit — Question Clustering + Opportunity Scoring

**Purpose:** Extract structured question clusters from Reddit discussions and score them by content opportunity.

**Features:**
- Submission: title, selftext, score, num_comments, created_utc, subreddit, subreddit_role
- Comment: body, score, controversiality, link_id, depth

**Model type:** Hybrid pipeline:
1. **Embedding** (all-MiniLM-L6-v2 via Workers AI): embed submission titles + top comment texts
2. **Clustering** (HDBSCAN on VPS batch): cluster embeddings into topic groups
3. **Scoring** (deterministic formula):

```
reddit_opportunity = specialist_depth × mass_signal
specialist_depth = score_in_specialist_sub × comment_depth × source_density
mass_signal = cross_subreddit_count × total_score × years_active
```

**Training:** No training needed — embedding + clustering is unsupervised. The scoring formula is a calibrated heuristic.

**Deployment:** Batch processing on VPS (or GCP Cloud Run). Results stored in R2 as Parquet. Hermes queries via DuckDB.

**Query endpoint (via DuckDB on R2 Parquet):**
```
SELECT * FROM read_parquet('s3://research-datasets/reddit/question-clusters/*.parquet')
WHERE opportunity_score > 0.5 AND topic_terms LIKE '%Chinnamasta%'
ORDER BY opportunity_score DESC LIMIT 10
```

### B4. Global Trending — Cross-Country Diffusion Prediction

**Purpose:** Predict which topics trending in India will cross to US/UK markets.

**Features:**
- `country`, `rank`, `category`, `title`, `language`, `live_status`
- `view_count`, `comment_count`, `published_at`
- Title features (same 23 as Upworthy)
- Channel metadata (subs, category, country)
- Lag features: days since first appearance in any country

**Model type:** Survival model (Cox proportional hazards) or binary classifier (logistic regression with time-window features). Predicts whether an IN-trending video appears in US/UK within 30 days.

**Training:** On Global Trending dataset (104 countries, 2022-2025). Train/test split by time.

**Deployment:** BigQuery for training (SQL + BQML). Exported model weights for inference via Workers AI or Cloud Run.

**Query endpoint:**
```
POST /api/models/global-trending/predict-diffusion
{ "topic_terms": ["Chinnamasta", "tantra"],
  "in_trending_rank": 45,
  "in_category": "Education",
  "days_since_first_appearance": 3 }
→ { "cross_probability_30d": 0.28,
    "expected_lag_days": 12,
    "top_predictors": ["in_category:0.3", "in_rank:0.25"] }
```

### B5. YTCommentVerse — Comment Intent Classifier

**Purpose:** Classify YouTube comments into intent categories.

**Classes:**
- `question` (asking for explanation)
- `correction` (disagreeing with content)
- `source_request` (asking for citations)
- `personal_testimony` (sharing experience)
- `critique` (methodological or factual objection)
- `praise` (non-substantive)
- `spam` (self-promotion, irrelevant)

**Model type:** Small transformer classifier (DistilBERT or MiniLM) fine-tuned on YTCommentVerse sample. Workers AI for inference.

**Features:** Comment text only. Use class weights to handle imbalance.

**Validation:** Dual evaluation sets — diagnostic balanced (200) + natural-prevalence frozen (500). Macro F1 >= 0.75, kappa >= 0.65.

**Deployment:** Workers AI (MiniLM is ~90M params, fits within Workers AI CPU limits).

**Query endpoint:**
```
POST /api/models/ytcomments/classify-intent
{ "comment": "Where did you find this information? I've never heard this before." }
→ { "intent": "source_request", "confidence": 0.87,
    "all_probs": { "question": 0.05, "source_request": 0.87, ... } }
```

### B6. Clickstream — Gateway Entity Graph

**Purpose:** For any obscure topic, find what pages people read before reaching it.

**Model type:** Directed graph aggregation — no ML needed. Aggregate `(prev_id, curr_id, click_count)` across monthly clickstream dumps.

**Algorithm:**
1. For target topic (e.g., "Chinnamasta"), find all `prev_id` values
2. Aggregate click counts per `prev_id`
3. Rank by total click count
4. Extract top-5 gateway entities

**Deployment:** Batch processing via BigQuery or DuckDB on R2. Results cached in D1 for fast lookups.

**Query:**
```
SELECT prev_id, SUM(click_count) as total_clicks
FROM clickstream_enwiki
WHERE curr_id = 'Chinnamasta'
GROUP BY prev_id ORDER BY total_clicks DESC LIMIT 5
```

### B7. Met Museum / DPLA / Smithsonian — Visual Asset Retriever

**Purpose:** Given a topic, find relevant public domain artwork.

**Model type:** CLIP embedding similarity search. Embed topic text + candidate image captions. Return top-k images where similarity > threshold.

**Pipeline:**
1. On dataset download: embed all image captions via CLIP (Workers AI or batch on VPS)
2. Store embeddings in Vectorize index
3. At query time: embed topic text, Vectorize similarity search, return top matches

**Deployment:** Vectorize index (Cloudflare-native). Embeddings computed once during dataset ingestion.

**Query:**
```
POST /api/models/assets/search
{ "query": "Kali standing on Shiva, cremation ground, 18th century Indian painting" }
→ { "results": [
    { "asset_id": "met_12345", "score": 0.87, "image_url": "...",
      "attribution": "Met Museum CC0", "period": "18th century" }
  ] }
```

### B8. Stack Exchange — Question-Answer Pair Extractor

**Purpose:** For a given topic, extract high-quality Q&A pairs for script research.

**Model type:** Deterministic extraction + ranking by score and accepted-answer status.

**Query:**
```
-- DuckDB on R2 Parquet
SELECT q.title as question, a.body as answer, q.score, a.score as answer_score,
       q.tags
FROM questions q JOIN answers a ON q.id = a.parent_id
WHERE q.tags LIKE '%hinduism%' AND q.title LIKE '%Chinnamasta%'
  AND a.is_accepted = 1
ORDER BY q.score DESC LIMIT 5
```

### B9. Translation Datasets — Sanskrit-English Pipeline

**Purpose:** Verify primary-source claims and translate under-translated texts.

**Model type:** NMT ensemble for SA→EN. Use BPCC Sanskrit-English (496K pairs) + Samanantar HI-EN pivot (2M pairs).

**Approach:**
- Fine-tune NLLB-200-distilled on BPCC data
- Run on GCP Cloud Run (requires GPU for reasonable speed)
- Alternatively: use LLM (DeepSeek) with few-shot translation for short passages

**Deployment:** GCP Cloud Run with GPU (sporadic usage) or Workers AI if model fits.

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

## D. The Bayesian Belief Engine

### D1. Core Design

The title intelligence system is a living Bayesian model that learns from every experiment. It replaces the current "soft priors" approach with formal uncertainty quantification.

**Model structure:**
```
For each feature f (question mark, "actually", imperative opening, etc.):
  α_f ~ Gamma(a0, b0)  # prior successes
  β_f ~ Gamma(c0, d0)  # prior failures

For each experiment e:
  For each pair (variant_i, variant_j):
    logit(p_i) = β_0 + Σ β_f * (feature_i_f - feature_j_f)
    wins_i ~ Binomial(impressions, p_i)
```

**Hierarchical pooling:**
- Domain level: YouTube documentaries, Upworthy listicles, Twitter headlines
- Platform level: YouTube Browse, YouTube Search, YouTube Suggested
- Features partially pool across domains with domain-specific offsets

### D2. Inference

- **Posterior update:** Conjugate Beta-Binomial for per-feature win rates → closed-form updates
- **Full model:** Hamiltonian Monte Carlo (via Pyro/PyMC) retrained weekly on GCP
- **Inference at query time:** Read posterior samples from D1, compute P(A > B) via Monte Carlo

### D3. Thompson Sampling for Exploration

When Hermes generates title candidates, it doesn't always pick the top-ranked. It samples from the posterior:

```
P(select variant A) = P(A's latent CTR > B's latent CTR | data)
```

This naturally balances exploration vs exploitation. Low-uncertainty features are exploited; high-uncertainty features are explored.

### D4. Continual Ingestion Pipeline

```
1. YouTube A/B test completes (Test & Compare)
2. Farm Worker captures results: (title_a, title_b, impressions, clicks, winner)
3. Worker POSTs to /api/models/upworthy/ingest
4. Bayesian engine updates posteriors in D1
5. Weekly: full HMC retrain on GCP, compare new posteriors to old
6. If posterior shift > threshold: flag for human review
```

### D5. D1 Schema for Bayesian State

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
  started_at TEXT, completed_at TEXT,
  ingested_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE title_posterior_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  snapshot_date TEXT NOT NULL,
  feature_posteriors JSON NOT NULL,  -- full posterior state
  model_version TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## E. GCP Credit Strategy ($300)

### E1. BigQuery ($5/TB) — Spend: ~$30

| Dataset | Query Pattern | Cost/Month | Justification |
|---------|---------------|------------|---------------|
| Global Trending (26.4 GB tarball → BigQuery) | Cross-country diffusion analysis, IN→US lag computation | ~$2/month (scan filtered partitions) | Need SQL JOIN + GROUP BY across 104 countries. D1 can't handle 26 GB. |
| YTCommentVerse (10.1 GB SQLite) | Comment taxonomy distribution, language-as-geography proxy | ~$1/month | Extract patterns from 32M comments. SQL in D1 would be slow. |
| Clickstream (4.2 GB) | Gateway graph computation, entity adjacency | ~$0.50/month | Window functions for path analysis. One-time processing, infrequent refreshes. |
| Cross-dataset joins | YouNiverse × Trending × Clickstream | ~$3/month | Find channels that appear in trending AND have breakout scores. |

### E2. Vision API ($1.50/1000 images) — Spend: ~$20

**Use case:** Analyzing competitor thumbnails for composition patterns. NOT for our own thumbnail generation (we use deterministic composition).

**Monthly volume:** ~1000 thumbnails from breakout videos
**Analysis:** Subject position, face count, text overlay area, color palette, composition rule (rule of thirds, centered, diagonal)
**Output:** Thumbnail composition pattern library → feed into content genome

### E3. Video Intelligence API ($1.50/minute) — Spend: ~$50

**Use case:** Detecting beats and pacing patterns in competitor documentary videos. NOT for our own content.

**Monthly volume:** ~30 minutes of analysis (3 competitor videos × 10 min each)
**Analysis:** Shot boundary detection, label detection, explicit content detection, segment duration distribution
**Output:** Pacing pattern library → feed into script generation

### E4. Vertex AI (custom training) — Spend: ~$100

| Model | Training Cost | Frequency | Notes |
|-------|--------------|-----------|-------|
| YouNiverse breakout predictor | ~$5 (small tabular data) | One-time + quarterly retrain | XGBoost on feature table. Data fits in memory. |
| Upworthy Bayesian ranker | ~$3 (HMC on small data) | One-time + monthly retrain | Full posterior with Pyro. Small dataset (5K tests). |
| Comment intent classifier | ~$15 (fine-tune DistilBERT) | One-time + quarterly retrain | Fine-tune on 10K labeled comments. |
| NLLB fine-tune (Sanskrit→EN) | ~$40 (fine-tune on BPCC) | One-time | 496K pairs. Can use preemptible VMs. |
| Reddit topic clustering | ~$2 (batch embedding) | Monthly | No training — just embedding computation. |

### E5. Cloud Run (FFmpeg rendering) — Spend: ~$80

**Use case:** Video rendering instead of VPS FFmpeg. Cloud Run scales to zero when not in use.

**Monthly volume:** ~8 videos, ~$0.50/video in compute
**Alternatives:** VPS FFmpeg (existing Hetzner, $0 marginal cost) is cheaper but less reliable. Cloud Run is the fallback if VPS is overloaded.

### E6. Budget Summary

| Service | Spend | Why |
|---------|-------|-----|
| BigQuery | ~$30 | Large-dataset SQL analytics |
| Vision API | ~$20 | Competitor thumbnail analysis |
| Video Intelligence | ~$50 | Competitor pacing analysis |
| Vertex AI training | ~$100 | Custom model training |
| Cloud Run rendering | ~$80 | FFmpeg rendering |
| **Total** | **~$280** | Within $300 credit. Remaining $20 for overages. |

---

## F. Integration with Control Plane

### F1. Worker Endpoints for Real-Time Queries

Each ML model exposes a Worker endpoint:

| Endpoint | Model | Cache |
|----------|-------|-------|
| `POST /api/models/youniverse/predict-breakout` | YouNiverse XGBoost | 1 hour TTL |
| `POST /api/models/upworthy/rank-titles` | Upworthy Bayesian | 24 hour TTL (topic-dependent) |
| `POST /api/models/upworthy/ingest` | Upworthy ingestion | No cache |
| `POST /api/models/ytcomments/classify-intent` | Comment classifier | 72 hour TTL |
| `POST /api/models/assets/search` | CLIP asset retriever | 1 hour TTL |
| `GET /api/models/global-trending/predict-diffusion?topic=X` | Diffusion predictor | 24 hour TTL |
| `GET /api/models/clickstream/gateways?entity=X` | Gateway graph | 7 day TTL (dataset is monthly) |

All endpoints are routed through AI Gateway for caching, fallback, and cost tracking.

### F2. Scheduled Batch Jobs

| Job | Frequency | What It Does | Where |
|-----|-----------|-------------|-------|
| YouNiverse model retrain | Monthly | Retrain breakout classifier with latest data | GCP Vertex AI → export ONNX to R2 |
| Upworthy posterior update | Weekly | Full HMC posterior update | GCP Vertex AI → export to D1 |
| Reddit recluster | Biweekly | Re-embed + re-cluster Reddit submissions | VPS → upload to R2 |
| Comment classifier retrain | Monthly | Fine-tune on new labeled data | GCP Vertex AI → export ONNX to R2 |
| Clickstream update | Monthly | Recompute gateway graph from new dump | GCP BigQuery → upload to D1 |
| Global Trending update | Monthly | Re-extract from tarball, recompute diffusion model | GCP BigQuery → upload to R2 |
| YouNiverse breakout recompute | Weekly | Full recomputation of breakout scores from scratch | Farm D1 (Cloudflare cron) |

### F3. Gateway for LLM Calls with Caching

AI Gateway sits in front of ALL LLM calls:

```
Hermes → AI Gateway → DeepSeek (primary)
                        └── Workers AI Llama 4 (fallback)
```

**Cache key format:**
```
sha256(model_version + prompt_version + input_asset_hash)
```

**Cache hit rates:**
- Hook classification: ~80% cacheable (same topics recur)
- Thumbnail analysis: ~60% cacheable (similar images)
- Script generation: 0% cacheable (always unique)
- Treatment generation: ~30% cacheable (similar topic clusters)

### F4. Approval Gates with Model Predictions

When Hermes presents a treatment for human approval, the dashboard shows:

```
┌─────────────────────────────────────────────────────────┐
│ Treatment: "Why Enlightenment Does Not Destroy the Ego" │
│                                                         │
│ 📊 Model Predictions:                                    │
│   Title rank: 0.63 (beats "Enlightenment and the Ego")  │
│   Breakout probability: 0.34 (vs channel baseline 0.10) │
│   Gap score: 0.72 (strong)                               │
│   Reddit opportunity: 0.68 (specialist_depth × mass)     │
│   Western demand: 0.45 (moderate)                        │
│                                                         │
│ 🧠 Bayesian Title Priors Applied:                        │
│   "actually" +29% lift (n=238, CI wide)                  │
│   question mark -22% lift (n=1,882, CI tight)            │
│   imperative opening +16% lift (n=464, CI moderate)     │
│                                                         │
│ 📝 Research Pack: 12 claims, 18 sources, all verified    │
│ 🖼️ Visual Assets: 8 candidates (3 Met, 2 DPLA, 3 FLUX)  │
│                                                         │
│ [Approve] [Revise: weak hook] [Terminate]                │
└─────────────────────────────────────────────────────────┘
```

---

## G. Implementation Roadmap

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

### Phase 1: Bayesian Title Engine + Holdout Replication (~1 week)

**Goal:** A production-ready Bayesian title ranker with uncertainty quantification.

**Tasks:**
1. Download Upworthy holdout dataset (already designed in `blueprint-datasets-download.md`)
2. Re-run existing analysis on holdout dataset — check if per-feature directions replicate
3. Implement Bayesian Beta-Binomial model (Pyro on VPS or GCP)
4. Add CIs to all per-feature win rates
5. Add permutation test (shuffle winner labels 1,000x, compare to null distribution)
6. Deploy title ranker as Worker: `POST /api/models/upworthy/rank-titles`
7. Implement D1 schema for posterior storage (title_posteriors, title_experiments)
8. Add ingestion endpoint: `POST /api/models/upworthy/ingest`

**Deliverable:** Hermes can query `rank-titles(topic, candidate_a, candidate_b) → probability + CIs`.

### Phase 2: YouNiverse Breakout Model + Gap Score Model (~2 weeks)

**Goal:** Predict breakout probability for any topic on any channel profile.

**Tasks:**
1. Build YouNiverse feature table (log subs, category, duration, title features, channel median, etc.)
2. Train XGBoost breakout classifier with bootstrap CIs
3. Validate against multiple baselines (views/day, age-bin percentile, raw views)
4. Export to ONNX, deploy to Workers AI
5. Build gap score model: given search queries, predict gap score + confidence interval
6. Integrate with Vectorize: topic-similarity index

**Deliverable:** Hermes queries `predict-breakout(topic, channel_profile) → probability + CIs`.

### Phase 3: Reddit Question Clusters + Reddit Opportunity Scoring (~1 week)

**Goal:** Structured question clusters with opportunity scores that feed directly into treatment generation.

**Tasks:**
1. Run Reddit extraction script (already designed in `reddit-extraction-guide.md`)
2. Embed all submission titles (Workers AI batch or VPS)
3. Cluster with HDBSCAN
4. Compute opportunity scores per cluster
5. Store in R2 as Parquet
6. Build DuckDB query worker: `GET /api/reddit/questions?topic=X`
7. Build recommendation graph from top-voted comments

**Deliverable:** Hermes queries `reddit/questions?topic=Chinnamasta` → returns question clusters, opportunity scores, recommended sources.

### Phase 4: Global Trending Cross-Country Model + Clickstream Gateway Graph (~2 weeks)

**Goal:** Predict cross-country topic diffusion and narrative entry frames.

**Tasks:**
1. Extract Global Trending tarball (26.4 GB) into BigQuery
2. Build cross-country diffusion features (IN rank, category, language, IN→US lag)
3. Train Cox survival model or logistic regression
4. Deploy diffusion predictor: `GET /api/models/global-trending/predict-diffusion`
5. Process clickstream data: aggregate gateway entity pairs
6. Deploy gateway lookup: `GET /api/models/clickstream/gateways?entity=X`
7. Build Vectorize index for gateway entity similarity

**Deliverable:** Hermes queries `predict-diffusion("Chinnamasta")` → `{cross_prob, expected_lag}`. Hermes queries `gateways("Chinnamasta")` → `["Kali", "Hindu_goddess", "Tantra"]`.

### Phase 5: Full Integration with Control Plane + Dashboard (~2 weeks)

**Goal:** All model predictions visible in the dashboard at every approval gate.

**Tasks:**
1. Wire all model endpoints into control plane Worker
2. Add model predictions to approval gate display
3. Implement heartbeat reporting from each model Worker
4. Add "re-train model" button to dashboard (triggers Vertex AI pipeline)
5. Build Bayesian title prior visualization (posterior plots per feature)
6. Add model version tracking and rollback
7. Implement AI Gateway caching for all model endpoints

**Deliverable:** Dashboard shows model predictions at every gate. Hermes gets model outputs as structured data.

### Phase 6: Online Learning from Own Production Data (Ongoing)

**Goal:** Every published video feeds back into model improvements.

**Tasks:**
1. Implement YouTube Test & Compare capture → title_experiments table
2. Weekly Bayesian posterior update from own A/B results
3. Compare own posteriors to Upworthy priors — does the transfer hold?
4. Implement genome feedback: which patterns predicted success?
5. Monthly: re-train YouNiverse model with own channel data added
6. Quarterly: re-evaluate all opportunity score weights vs actual performance

**Deliverable:** Models improve with every published video. Opportunity score weights are data-driven per channel.

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

| Model | Framework | Infrastructure | Inference Cost | Training Frequency | Latency |
|-------|-----------|---------------|----------------|-------------------|---------|
| YouNiverse breakout | XGBoost → ONNX | Workers AI (CPU) | ~$0.001/query | Monthly on GCP Vertex | <100ms |
| Upworthy title ranker | Bayesian LR (Pyro) | Workers AI (CPU) | ~$0.001/query | Weekly on GCP Vertex | <100ms |
| Reddit question clusters | MiniLM + HDBSCAN | VPS (DuckDB) | ~$0 (batch) | Biweekly on VPS | ~1s (cached) |
| Global Trending diffusion | Cox PH / Logistic | BigQuery + Workers AI | ~$0.01/month scan | Monthly on GCP BigQuery | ~2s (cached) |
| Comment intent classifier | DistilBERT → ONNX | Workers AI (CPU) | ~$0.002/query | Monthly on GCP Vertex | <200ms |
| CLIP asset retriever | CLIP → Vectorize | Workers AI + Vectorize | ~$0.001/query | One-time + on update | <50ms |
| Gateway entity graph | Aggregation | BigQuery + D1 | ~$0.005/month | Monthly on GCP BigQuery | <20ms |
| Stack Exchange extraction | Deterministic | DuckDB on R2 | ~$0 (batch) | One-time | ~500ms |
| Sanskrit-English NMT | NLLB-200 fine-tune | GCP Cloud Run (GPU) | ~$0.01/translation | One-time | ~3s |

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
