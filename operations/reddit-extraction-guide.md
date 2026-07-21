# Reddit Extraction Guide — Complete Operations Spec

## Objective

Extract ~15 GB of filtered Reddit data from Pushshift (2005-2023) across 30 topic-relevant subreddits. Stream-filter only — never download the full 292 GB dump. Upload filtered Parquet to R2 for analysis.

---

## Prerequisites

### Credentials (Set Fresh Each Session)

```bash
# R2 — never commit these
export AWS_ACCESS_KEY_ID="b31c6e90450f740629ac030f6e16eef4"
export AWS_SECRET_ACCESS_KEY="cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"
```

### Storage

Each dataset in R2 is part of the `s3://research-datasets/reddit/` prefix.

The HuggingFace datasets library streams from remote storage without downloading the full dataset. Extraction needs ~20 GB temporary disk for the filtered output.

**Do not use the Hetzner volume** — it's nearly full. Use `/tmp/` or stream directly to R2.

### Python Environment

```bash
pip install datasets pyarrow pandas huggingface-hub
```

HuggingFace may request a token for higher rate limits. Optional but helps with speed:
```bash
huggingface-cli login
```

---

## Subreddit Panel

### Historical Core (30 subreddits, all have data in Pushshift 2005-2023)

These are grouped by research role. The role tag is critical — never pool across roles without explicit stratification.

```yaml
# DIRECT SOURCE / PRACTITIONER (specialist knowledge)
Tantra:                 { created: 2008, role: specialist }
KashmirShaivism:        { created: 2015, role: specialist }
shaivism:               { created: 2013, role: specialist }
Shaktism:               { created: 2015, role: specialist }
AdvaitaVedanta:         { created: 2011, role: practitioner }
hinduism:               { created: 2008, role: practitioner }
Vajrayana:              { created: 2009, role: specialist }
TibetanBuddhism:        { created: 2008, role: practitioner }
Dzogchen:               { created: 2009, role: specialist }
kundalini:              { created: 2008, role: practitioner }

# WESTERN ESOTERIC (specialist knowledge)
occult:                 { created: 2008, role: practitioner }
magick:                 { created: 2008, role: practitioner }
GoldenDawnMagicians:    { created: 2019, role: specialist }
Quareia:                { created: 2016, role: specialist }
Hermeticism:            { created: 2013, role: specialist }
Thelema:                { created: 2009, role: practitioner }
Theurgy:                { created: 2012, role: specialist }
Esotericism:            { created: 2012, role: specialist }
alchemy:                { created: 2008, role: practitioner }

# MASS SPIRITUAL / AUDIENCE LANGUAGE (broad curiosity)
awakened:               { created: 2012, role: mass }
spirituality:           { created: 2009, role: mass }
nonduality:             { created: 2012, role: mass }
Meditation:             { created: 2008, role: mass }
streamentry:            { created: 2015, role: specialist }
TheMindIlluminated:     { created: 2015, role: specialist }

# NARRATIVE DEMAND (stories and experiences)
HighStrangeness:        { created: 2013, role: narrative }
Paranormal:             { created: 2008, role: narrative }
NDE:                    { created: 2012, role: narrative }
Glitch_in_the_Matrix:   { created: 2013, role: narrative }
AstralProjection:       { created: 2009, role: narrative }
```

**Note on created dates:** Some subreddits (GoldenDawnMagicians 2019, Quareia 2016, TheMindIlluminated 2015) have fewer years of historical data. They are still valuable — just shorter windows. Subreddits created after April 2023 (r/Tantrasadhaks, r/HighMagic) have ZERO data in Pushshift and are not included.

---

## Extraction Code

Save this as `scripts/extract-reddit.py` and run it.

```python
#!/usr/bin/env python3
"""
Extract Reddit submissions and comments from Pushshift archive for 30 subreddits.
Stream-filter only — never downloads the full 292 GB dump.
Uploads filtered Parquet to R2.
"""

import os, json, subprocess, tempfile
from datasets import load_dataset

# ── Config ──────────────────────────────────────────────────────────
SUBREDDITS = [
    "Tantra", "KashmirShaivism", "shaivism", "Shaktism", "AdvaitaVedanta",
    "hinduism", "Vajrayana", "TibetanBuddhism", "Dzogchen", "kundalini",
    "occult", "magick", "GoldenDawnMagicians", "Quareia", "Hermeticism",
    "Thelema", "Theurgy", "Esotericism", "alchemy", "awakened", "spirituality",
    "nonduality", "Meditation", "streamentry", "TheMindIlluminated",
    "HighStrangeness", "Paranormal", "NDE", "Glitch_in_the_Matrix", "AstralProjection"
]

S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
R2_BASE = "s3://research-datasets/reddit"
BATCH_SIZE = 50000  # save every 50K rows to avoid memory issues

# ── Subreddit Metadata (hardcoded from Pushshift to avoid extra queries) ──
# Creation dates verified against subreddit about.json
SUBREDDIT_INFO = {
    "Tantra": {"created": 2008, "role": "specialist"},
    "KashmirShaivism": {"created": 2015, "role": "specialist"},
    # ... (full dict from the panel above. Include all 30.)
}

def save_batch(data, prefix, batch_num):
    """Save a batch to temp parquet, then upload to R2 and delete local."""
    import pandas as pd
    df = pd.DataFrame(data)
    with tempfile.NamedTemporaryFile(suffix=".parquet", delete=False) as f:
        tmp = f.name
    df.to_parquet(tmp, index=False)
    
    # Upload to R2
    dest = f"{R2_BASE}/{prefix}/batch-{batch_num:04d}.parquet"
    subprocess.run(["aws", "s3", "cp", tmp, dest, "--endpoint-url", S3_ENDPOINT], check=True)
    os.unlink(tmp)
    print(f"  Uploaded {dest} ({len(df)} rows)")


def extract_submissions():
    """Stream-filter submissions from pushshift-reddit dataset."""
    print("=== Extracting Submissions ===")
    ds = load_dataset("fddemarco/pushshift-reddit", split="train", streaming=True)
    
    batch = []
    batch_num = 0
    total = 0
    
    for i, row in enumerate(ds):
        if row["subreddit"] not in SUBREDDITS:
            continue
        
        batch.append({
            "subreddit": row["subreddit"],
            "subreddit_role": SUBREDDIT_INFO.get(row["subreddit"], {}).get("role", "unknown"),
            "subreddit_created_year": SUBREDDIT_INFO.get(row["subreddit"], {}).get("created"),
            "id": row["id"],
            "author": row["author"],
            "created_utc": row["created_utc"],
            "title": row["title"],
            "selftext": row["selftext"],
            "score": row["score"],
            "num_comments": row["num_comments"],
        })
        
        if len(batch) >= BATCH_SIZE:
            save_batch(batch, "submissions", batch_num)
            total += len(batch)
            batch = []
            batch_num += 1
            print(f"  Total so far: {total}")
    
    if batch:
        save_batch(batch, "submissions", batch_num)
        total += len(batch)
    
    print(f"=== Submissions done: {total} rows ===")


def extract_comments():
    """Stream-filter comments from pushshift-reddit-comments dataset."""
    print("=== Extracting Comments ===")
    ds = load_dataset("fddemarco/pushshift-reddit-comments", split="train", streaming=True)
    
    batch = []
    batch_num = 0
    total = 0
    
    for i, row in enumerate(ds):
        if row["subreddit"] not in SUBREDDITS:
            continue
        
        batch.append({
            "subreddit": row["subreddit"],
            "subreddit_role": SUBREDDIT_INFO.get(row["subreddit"], {}).get("role", "unknown"),
            "id": row["id"],
            "author": row["author"],
            "created_utc": row["created_utc"],
            "body": row["body"],
            "score": row["score"],
            "controversiality": row["controversiality"],
            "link_id": row["link_id"],  # parent submission ID, strip "t3_" prefix to match
        })
        
        if len(batch) >= BATCH_SIZE:
            save_batch(batch, "comments", batch_num)
            total += len(batch)
            batch = []
            batch_num += 1
    
    if batch:
        save_batch(batch, "comments", batch_num)
        total += len(batch)
    
    print(f"=== Comments done: {total} rows ===")


if __name__ == "__main__":
    if not S3_ENDPOINT:
        print("ERROR: Set S3_ENDPOINT env var")
        exit(1)
    
    extract_submissions()
    extract_comments()
    print(f"\nAll data uploaded to {R2_BASE}/")
    print("Submissions: s3://research-datasets/reddit/submissions/")
    print("Comments: s3://research-datasets/reddit/comments/")
```

### Run

```bash
# Expected: ~2-4 hours for comments, ~30 min for submissions
nohup python3 scripts/extract-reddit.py > /tmp/reddit-extraction.log 2>&1 &
tail -f /tmp/reddit-extraction.log
```

---

## Expected Output

```
s3://research-datasets/reddit/submissions/
  ├── batch-0000.parquet    (~50K rows)
  ├── batch-0001.parquet    (~50K rows)
  └── ...                   (~15-25 batches total for ~1M submissions)

s3://research-datasets/reddit/comments/
  ├── batch-0000.parquet    (~50K rows)
  ├── batch-0001.parquet    (~50K rows)
  └── ...                   (~100-200 batches total for ~8M comments)
```

Total filtered size: ~3 GB submissions + ~12 GB comments = ~15 GB.

---

## Verification Gates

Before declaring complete:

- [ ] All 30 subreddits present in the output (run a quick count per subreddit)
- [ ] Subreddits with zero rows identified and documented (should be none — all 30 existed before April 2023)
- [ ] Row counts by subreddit saved to `data/research/reddit/extraction-stats.json`
- [ ] Date range: submissions span 2005-2023 (check min/max `created_utc`)
- [ ] R2 upload verified: `aws s3 ls s3://research-datasets/reddit/ --recursive --human-readable`
- [ ] Credentials NOT committed (set as session env vars only)

---

## Schema Reminder

These are the actual Pushshift fields verified by querying a sample row:

**Submissions:** `author`, `created_utc` (Unix timestamp), `id`, `num_comments`, `score` (upvotes - downvotes), `selftext`, `subreddit`, `subreddit_id`, `title`

**Comments:** `author`, `body` (text with spaces around apostrophes — clean before NLP: `isn ' t` → `isn't`), `controversiality` (0 or 1 — Reddit flags when upvote ratio ~50%), `created_utc`, `id`, `link_id` (prefixed `t3_`), `score`, `subreddit`, `subreddit_id`

---

## Signal Interpretation Rules (Apply in Analysis, Not Extraction)

The extraction just gets the data. When analyzing it, follow these rules:

**1. Normalize scores by subreddit and year.** A score of 30 in r/KashmirShaivism (3k users) is more exceptional than a score of 1000 in r/occult (700k users). Always use percentiles within subreddit-year bins.

**2. High score does NOT mean "validated demand."** People upvote for many reasons: funny phrasing, emotional resonance, known poster, group identity confirmation. Demand becomes credible when signal repeats across multiple independent posts, years, authors, and subreddits.

**3. Top comments are the community's preferred explanation, not the canonical truth.** Treat them as "what this community finds convincing," not "what is factually correct." Attach separate source_support and expert_verification flags.

**4. Controversiality = 1 means mixed voting, not exactly 50/50.** Reddit's flag is binary and internal. You don't have the raw upvote/downvote counts. Interpret as "meaningful mixture of positive and negative voting."

**5. Deep comment chains do not automatically mean conceptual depth.** They could be arguments, jokes, moderation, or off-topic drift. Calculate unique participants, semantic branch count, and off-topic rate before treating depth as content breadth.

**6. Cross-subreddit recurrence may be artificial.** Deduplicate by author, exact URL, near-identical text, and publication window before calling it independent mass resonance.

**7. Never use multiplicative opportunity scores.** Keep dimensions separate: mass_resonance, specialist_depth, persistence, controversy, narrative_readiness, source_quality. Rank with transparent rules or Pareto dominance, not a single magic number.

**8. Personal stories need safety flags.** First-person + 500 chars does not mean useful narrative. Check for fiction, roleplay, marketing, delusion, unverifiable claims. Attach verification_status, medical_claims_present, supernatural_claims_present, safe_to_quote.

**9. This is Tier 3 exploratory intelligence.** It generates hypotheses about audience questions, language, and objections. It does not independently establish truth, historical fact, actual YouTube demand, or expected video performance.

**10. The structural claim "Reddit signals improve topic selection" is Tier 1.** It should eventually be tested against an external outcome (channel-normalized 28-day views on produced videos) with prospective validation and held-out data.

---

## Post-Extraction: First Analysis Query

After extraction, the first analysis query should be:

```python
# For each subreddit, compute basic signal metrics
# This tells us which subs are worth deeper analysis

results = []
for sub in SUBREDDITS:
    sub_df = submissions[submissions.subreddit == sub]
    comment_df = comments[comments.subreddit == sub]
    
    results.append({
        "subreddit": sub,
        "role": SUBREDDIT_INFO[sub]["role"],
        "total_submissions": len(sub_df),
        "total_comments": len(comment_df),
        "submissions_per_year": len(sub_df) / (2023 - SUBREDDIT_INFO[sub]["created"]),
        "question_rate": (sub_df.title.str.contains("?").sum()) / len(sub_df),
        "median_score": sub_df.score.median(),
        "high_score_threshold_95pct": sub_df.score.quantile(0.95),
        "median_comments_per_post": sub_df.num_comments.median(),
        "long_comment_rate": (comment_df.body.str.len() > 500).mean(),
        "controversial_rate": comment_df.controversiality.mean(),
        "source_mentions_per_1k": estimate_source_density(comment_df),
    })
```

Save to `data/research/reddit/extraction-stats.json` as part of verification.
