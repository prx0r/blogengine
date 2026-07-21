# Layer 1 Handover — YouNiverse Breakout Metric Validation

## Objective

Validate the 3 core assumptions behind the breakout metric before any pipeline code is written. Uses YouNiverse data already in R2.

## What's Being Tested

| # | Assumption | Method | Pass Threshold |
|---|-----------|--------|----------------|
| A1 | OLS residual predicts breakout better than raw views | Per-channel OLS `log(views) ~ log(age)`, compare residual-based top-quartile vs raw-view top-quartile overlap | Overlap < 80% (residual captures different signal) |
| A2 | Format class (category) adds signal to OLS | Add one-hot category to OLS, compare delta R^2 | delta R^2 > 0.01 |
| A3 | Channel momentum changes >15% of breakout labels | Compare breakout labels before/after stripping calendar-time subscriber growth trend | >15% of labels flip |

## How to Run

```bash
# 1. Set R2 credentials (session only, never commit)
export AWS_ACCESS_KEY_ID="b31c6e90450f740629ac030f6e16eef4"
export AWS_SECRET_ACCESS_KEY="cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"

# 2. Install dependencies
pip install pyarrow pandas numpy scipy boto3

# 3. Run (default: 5000 channels, 50 videos each)
python3 scripts/layer1-youniverse-test.py

# 4. Check output
cat data/research/youniverse/layer1-*.json

# 5. If PASS, proceed to Layer 2 (API tests) and build pipeline
#    If FAIL, report which assumptions failed and why
```

## Data Flow

```
R2 bucket: research-datasets/youniverse/
├── df_channels_en.tsv.gz      (5.7 MB — loaded fully)
├── df_timeseries_en.tsv.gz    (544 MB — stream-filtered to sample channels)
└── yt_metadata_helper.feather (2.6 GB — sampled by channel, ~50 rows each)
```

The script:
1. Loads channels table (5.7 MB — full)
2. Samples ~5000 channels, loads ~50 videos each from feather (2.6 GB — partial read)
3. For A3 only: streams time series filtered to sampled channels

## Expected Runtime

~10-15 minutes for the 5000-channel sample. Most time is reading the feather file from R2. The actual computation is fast (per-channel OLS on ~50 data points each).

## Output Format

`data/research/youniverse/layer1-{timestamp}.json`

```json
{
  "experiment": "layer-1-breakout-metric",
  "dataset": "youniverse",
  "timestamp": "20260722_120000",
  "sample": { "channels": 5000, "videos": 250000 },
  "assumptions": {
    "A01_ols_vs_raw": {
      "mean_overlap_with_raw": 0.65,
      "signal_difference_pct": 35.0,
      "conclusion": "OLS residual captures different breakout signal",
      "gate_A01": { "status": "PASS", "detail": "..." }
    },
    "A02_format_class": { ... },
    "A03_momentum": { ... }
  },
  "gates": { "A01": {...}, "A02": {...}, "A03": {...} },
  "all_gates_passed": true,
  "duration_seconds": 742
}
```

## If All Pass

Layer 1 confirms the structural assumptions. Hand off to pipeline build agent with:
- `pipelines/farm-implementation-plan.md` — full spec
- `farm-factory/` — complete but untested Worker code
- `pipelines/r2-dataset-reference.md` — standardized R2 data docs
- R2 credentials in session env vars (same as above)

## If Any Fail

| Failure | What It Means |
|---------|---------------|
| A1 fails (overlap > 80%) | OLS residual agrees with raw views — simpler metric (raw views/day) may suffice. Drop OLS, use age-band median fallback. |
| A2 fails (delta R^2 < 0.01) | Category doesn't add signal. Drop format_class from model. Use age-only OLS. |
| A3 fails (< 15% flips) | Momentum stripping not worth the complexity. Skip calendar-time regression. Use single-stage OLS residual. |

In all failure cases, re-run with the simplified metric before proceeding to Layer 2.

## Reference Files

| File | Purpose |
|------|---------|
| `scripts/layer1-youniverse-test.py` | The test script (this file) |
| `pipelines/farm-implementation-plan.md` | Full spec with assumption definitions |
| `pipelines/r2-dataset-reference.md` | All R2 dataset docs, columns, access |
| `data/research/youniverse/` | Output directory for layer1 results |
| `pipelines/youniverse/README.md` | Original YouNiverse pipeline spec |
