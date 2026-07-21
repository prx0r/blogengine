# Research Stream — Dataset Validation & Experiment Pipeline

## Scope

Everything related to running experiments, validating assumptions, processing datasets, and producing research that the farm can act on. This is the evidence layer — without it, the farm is guessing.

## Current State

| Experiment | Status | Confidence | Next Action |
|-----------|--------|------------|-------------|
| A1-A3 (breakout metric) | Differentiated, not validated | Medium | REDO with external outcome (YouNiverse time series) |
| Gap score (Stage 1) | Pattern confirmed (16/30 queries) | Medium | Weekly cadence running, 13 days remaining |
| Wikipedia signal | Skipped (r=0.027) | High | Documented as null, don't revisit |
| Daily search collection | In progress (12 days remaining) | High | Cron running, results accumulating |
| Title Association Ranking | Not started | N/A | Tier 3 exploratory — low priority |
| Comment Taxonomy | Not started | N/A | Needs YTCommentVerse pipeline |
| Cross-country diffusion | Not started | N/A | Needs Global Trending pipeline |
| Reddit intelligence | Designed, not run | N/A | 30 subreddits ready to extract |

## Tier System

Every experiment falls into one of three tiers. This determines how much rigor it needs and what decisions it can influence.

| Tier | Rigor | Can Influence | Example |
|------|-------|---------------|---------|
| 1 (Structural) | External outcome, bootstrap CIs, ≥2 baselines | Pipeline architecture changes | Breakout metric, gap score formula |
| 2 (Calibration) | Convergence check, sensitivity analysis | Parameter values | Daily vs weekly cadence, weighted sum coefficients |
| 3 (Exploratory) | Pilot OK, labeled as exploratory | What to investigate next | Title feature scan, duration scatter |

**Rule:** No Tier 3 result can change a pipeline decision. No Tier 2 result can lock a structural component. Only Tier 1 results can promote a metric to production.

## Running an Experiment

1. Create experiment manifest in `experiments/{name}/manifest.yaml`
2. CI validates manifest against `operations/research-schema.md` requirements
3. Run experiment → produce `result.yaml`
4. CI validates result (confidence intervals, rival explanations, limitations)
5. Result goes to `data/research/{dataset}/` with timestamp

The manifest and result formats are specified in `operations/research-schema.md`.

## Datasets in R2

```
research-datasets/
├── youniverse/              3.2 GB   English YouTube channel/video metadata (2005-2019)
│   ├── df_channels_en.tsv.gz         Channel metadata
│   ├── df_timeseries_en.tsv.gz       Weekly channel stats
│   └── yt_metadata_helper.feather    Video metadata
│
├── ytcommentverse/          10.1 GB  Multilingual YouTube comments (SQLite)
│   └── YT-30M.db
│
├── global-trending/         26.4 GB  Trending data 104 countries 2022-2025 (tarball)
│   └── youtube_trends.tar.bz2
│
├── google-trends/           2 MB    10K keywords daily 2004-2026
│
├── sanskrit-gretil/         382 MB  450K Sanskrit verses with genre tags
│
└── hindi-transcripts/       13 GB   21 Hindi YouTube channels ASR transcripts
```

Blueprint datasets (Upworthy, Clickstream, Met Museum, DPLA, SARIT, Stack Exchange, Smithsonian) are not yet downloaded. See `operations/blueprint-datasets-download.md`.

## What To Run Next

### Priority 1: Redo A1-A3 as Tier 1

The OLS residual is "differentiated" but not "validated." The YouNiverse time series can approximate video-level growth and serve as an external outcome. This is the single most important experiment because the entire opportunity formula rests on the breakout metric being meaningful.

**Experiment:** `breakout-metric-validation-v2`
**Files needed:** YouNiverse time series (already in R2) + video metadata (already in R2)
**Method:** For channels with ≥20 videos, compute breakout scores from OLS residual, views/day, age-bin percentile. Compare against: did videos with high scores in weeks 1-4 get more future views in weeks 5-8? Spearman r, precision@20, bootstrap CI.
**Tier:** 1

### Priority 2: Reddit Extraction (Tier 2)

30 subreddits already identified, stream-filter code written, HuggingFace datasets accessible. ~15 GB filtered output. This is labor but not research — the extraction is deterministic. The analysis (question clustering, signal metrics) is where the research happens.

**Pipeline:** `operations/reddit-extraction-guide.md`
**Signal taxonomy:** `pipelines/reddit-intelligence/reddit-signal-taxonomy.md`
**Quick reference:** `pipelines/reddit-intelligence/signal-quick-ref.md`

### Priority 3: Blueprint Dataset Title Analysis (Tier 2)

Upworthy Research Archive: 32k headline A/B tests, causal-validated. Download the CSV (~50 MB), extract semantic features, train a pairwise ranker. Output: for any title proposal, predict whether variant A beats variant B.

**Files:** `operations/blueprint-datasets-download.md` (Upworthy section)

## Completed Experiments Reference

| Report | File | Key Result |
|--------|------|------------|
| A1-A3 Breakout Metric | `data/research/youniverse/research-report-a1-a3.md` | 44% label difference — differentiated, not validated |
| Layer 1 Research Log | `data/research/youniverse/README.md` | Drill-down methodology, convergence checks |
| Layer 2 Results | `data/research/layer2/README.md` | Gap confirmed, Wikipedia skipped, daily collection running |
| Research Inventory | `operations/research-inventory.md` | 7/41 experiments completed |

## Files

| File | Purpose |
|------|---------|
| `operations/research-schema.md` | Experiment format, tier system, pre-registration, evidence state |
| `operations/research-workflow.md` | How to run an experiment step by step |
| `operations/research-inventory.md` | All 41 experiments with status |
| `operations/blueprint-datasets-download.md` | How to download Upworthy, Clickstream, museum datasets |
| `operations/reddit-extraction-guide.md` | How to extract Reddit data |
| `pipelines/reddit-intelligence/README.md` | Subreddit panel, object model, analysis pipeline |
| `pipelines/reddit-intelligence/reddit-signal-taxonomy.md` | 4 signal layers, cross-subreddit opportunity |
| `pipelines/reddit-intelligence/signal-quick-ref.md` | Signal → content decision lookup |
| `pipelines/r2-dataset-reference.md` | All R2 datasets with schema, access, limitations |
| `scripts/layer1-youniverse-test.py` | A1-A3 test script (v2) |
| `scripts/test-underserved-claim.mjs` | Stage 1 underserved claim test |
| `scripts/daily-search-collection.mjs` | Daily search collection cron |
