# Dataset Handover — Download the Next 3 Datasets

## Job

Download these 3 datasets to R2. They fill gaps in language analysis, audience question clustering, and historical trend tracking.

---

## Dataset 1: Google Trends Corpus

**Why:** Replaces the unreliable pytrends library with clean historical data. Query "tantra", "kundalini", "abhinavagupta", "hinduism" trends from 2004-2026 to validate western_demand signal.

**Source:** https://huggingface.co/datasets/jeremycochoy/google-trends-corpus
**Size:** 24.8 MB
**Format:** Parquet
**License:** Check the dataset card

**Command:**
```bash
pip install huggingface_hub
huggingface-cli download jeremycochoy/google-trends-corpus --local-dir /mnt/data/raw/google-trends
aws s3 cp /mnt/data/raw/google-trends s3://research-datasets/google-trends/ --recursive --endpoint-url $S3_ENDPOINT
```

**R2 target:** `s3://research-datasets/google-trends/`

---

## Dataset 2: Sanskrit GRETIL Verses

**Why:** 450K Sanskrit verses including actual tantra texts (Svacchandatantra, Kubjikamatantra) with genre tags. Directly feeds script research and topic taxonomy. Can be used to build a tantra-specific subject classifier.

**Source:** https://huggingface.co/datasets/paws/sanskrit-verses-gretil
**Size:** ~1 GB
**Format:** Parquet
**License:** CC-BY or similar (check dataset card)

**Command:**
```bash
huggingface-cli download paws/sanskrit-verses-gretil --local-dir /mnt/data/raw/sanskrit-gretil
aws s3 cp /mnt/data/raw/sanskrit-gretil s3://research-datasets/sanskrit-gretil/ --recursive --endpoint-url $S3_ENDPOINT
```

**R2 target:** `s3://research-datasets/sanskrit-gretil/`

---

## Dataset 3: Hindi YouTube ASR Transcripts

**Why:** 22K hours of Hindi YouTube transcripts from 21 channels. The closest thing to a Hindi YouNiverse. Directly tests the cross-language transfer thesis — can we identify topics that break out in Hindi before English?

**Source:** https://huggingface.co/datasets/ketav/hindi-youtube-asr-transcripts
**Size:** ~5 GB
**Format:** Parquet + VTT transcripts
**License:** CC-BY-4.0

**Command:**
```bash
huggingface-cli download ketav/hindi-youtube-asr-transcripts --local-dir /mnt/data/raw/hindi-transcripts
aws s3 cp /mnt/data/raw/hindi-transcripts s3://research-datasets/hindi-transcripts/ --recursive --endpoint-url $S3_ENDPOINT
```

**R2 target:** `s3://research-datasets/hindi-transcripts/`

---

---

## Future Expansion: Science/Niche Datasets

For when the system expands into frontier science (Michael Levin, bioelectricity, consciousness neuroscience). These are harder to access but high value:

**OpenNeuro** (fMRI/EEG datasets) — download.oneuro.org. 1,000+ studies with raw brain data. Not directly usable for content discovery but could power a "what is consciousness science actually studying right now" signal.

**PubMed Central Bulk** — ftp.ncbi.nlm.nih.gov/pub/pmc/. Full-text XML of 4M+ open-access biomedical papers. ~250 GB. Includes consciousness, neuroscience, bioelectricity papers. Queryable by topic. This is the academic database for frontier science — replaces Crossref for that niche.

**Allen Brain Atlas** — brain-map.org. Gene expression, cell types, connectivity data. Unique visual asset potential.

**ClinicalTrials.gov** — clinicaltrials.gov. 500K+ clinical trial records. "What are researchers actively studying" = leading indicator of topics entering public discourse.

**protocols.io** — Research methodology repository. Early-stage research not yet published as papers.

These are too large and speculative for this handover. Noted here for the future farm expansion into science content.

---

## Regarding Reddit Comments (592M)

**Do not download the full 592M file.** Instead, stream-filter for specific subreddits:

```python
# Pseudocode — run as a streaming job, not a full download
import requests, json, ijson

# Stream the gzipped JSONL from HuggingFace
# Filter for: subreddit in ['hinduism', 'tantra', 'Buddhism', 
#                          'yoga', 'philosophy', 'spirituality',
#                          'occult', 'religion', 'AdvaitaVedanta']
# Save only those rows
```

This avoids downloading 50 GB of irrelevant comments. The filtered output will be much smaller (~500 MB).

**Alternative:** Use Pushshift.io API to pull comments by subreddit directly, no download needed:
```
https://api.pushshift.io/reddit/submission/search?subreddit=hinduism&size=1000
```

---

## Storage on Hetzner Volume

Current volume: `/mnt/HC_Volume_106423434` (50 GB, ~6.8 GB free after previous downloads)

| Dataset | Size | Running Total |
|---------|------|---------------|
| Google Trends corpus | 25 MB | 25 MB |
| Sanskrit GRETIL | ~1 GB | ~1 GB |
| Hindi transcripts | ~5 GB | ~6 GB |
| Reddit filtered | ~500 MB | ~6.5 GB |

**The volume does not have enough free space for all three.** Options:
- Free space: check `/mnt/HC_Volume_106423434/raw/` — previous raw downloads might still be there and can be deleted after R2 verification
- Or: download one at a time, upload to R2, delete, repeat

---

## Verification Gates

Before declaring done:

- [ ] Google Trends corpus uploaded to `s3://research-datasets/google-trends/`
- [ ] Sanskrit GRETIL uploaded to `s3://research-datasets/sanskrit-gretil/`
- [ ] Hindi transcripts uploaded to `s3://research-datasets/hindi-transcripts/`
- [ ] All three datasets queryable via `aws s3 ls`
- [ ] Reddit comments NOT downloaded fully — stream-filtered or Pushshift API used instead
- [ ] Credentials NOT committed (set env vars each session)
- [ ] Hetzner volume cleaned up after uploads verified
