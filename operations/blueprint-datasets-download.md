# Blueprint Intelligence Datasets — Download & Setup Guide

## Objective

Add orthogonal datasets that improve the documentary blueprint, not the popularity score. These feed six packets: demand, questions, contradictions, sources, visuals, and narrative structure.

---

## Priority Order

### Tier 1: Download Now (small, causal, immediate value)

| # | Dataset | Size | What It Gives You | R2 Path |
|---|---------|------|-------------------|---------|
| 1 | **Upworthy Research Archive** | ~50 MB | Causal title experiments — 32k headline A/B tests with known winners. Tells you what wording actually drives clicks, controlling for content. | `s3://research-datasets/blueprint/upworthy/` |
| 2 | **Wikimedia Clickstream** (latest 12mo English) | ~2 GB | How people navigate between topics. Tells you the gateway entities — "people reach Chinnamasta through Kali." | `s3://research-datasets/blueprint/clickstream/` |
| 3 | **Met Museum Open Access** | ~100 MB CSV | 470k CC0 museum objects with metadata. Immediate visual asset library for thumbnails and video backgrounds. | `s3://research-datasets/blueprint/met-openaccess/` |
| 4 | **DPLA Bulk Download** | ~5 GB | Millions of cultural heritage objects from US libraries, archives, museums. CC0. Visual assets + source leads. | `s3://research-datasets/blueprint/dpla/` |
| 5 | **SARIT** (Sanskrit text corpus) | ~500 MB | Searchable Sanskrit and Prakrit texts. Primary-text concordance for fact-checking claims against original sources. | `s3://research-datasets/blueprint/sarit/` |

### Tier 2: Add Second (larger but valuable)

| # | Dataset | Size | What It Gives You | R2 Path |
|---|---------|------|-------------------|---------|
| 6 | **GoogleTrendArchive** | 3.9 GB | Cross-country attention episodes Nov 2024–Jan 2026. Detects real-world events driving interest (festivals, controversies, films). | `s3://research-datasets/blueprint/google-trend-archive/` |
| 7 | **Stack Exchange dumps** (Hinduism, Buddhism, Philosophy, History) | ~500 MB | Structured Q&A with accepted answers, scores, tags. Clean audience question corpus for question-cluster extraction. | `s3://research-datasets/blueprint/stackexchange/` |
| 8 | **Smithsonian Open Access** | ~10 GB | 5.1M digital items. Supplementary visual assets for topics the Met doesn't cover well (South Asian ritual objects, manuscripts). | `s3://research-datasets/blueprint/smithsonian/` |

### Tier 3: Download When Needed

| # | Dataset | Size | When To Use |
|---|---------|------|-------------|
| 9 | **Europeana** (South Asian collections) | Variable | When a specific topic needs European museum collections (colonial-era photographs, orientalist paintings) |
| 10 | **Google Books Ngrams** | ~10 GB queryable | When researching terminology history ("when did 'tantra' become associated with sex in English print?") |
| 11 | **GDELT** | Streamed | Current event spike detection — "why did Kali pageviews spike this week?" |

---

## Download Instructions

### Dataset 1: Upworthy Research Archive

**Source:** https://osf.io/jd64p/
**Paper:** https://doi.org/10.1038/s41597-021-00934-7
**Files:** 1 CSV (~50 MB)
**License:** CC0

```bash
# Direct download from OSF
wget -O /tmp/upworthy-raw.csv "https://osf.io/jd64p/download"

# Upload to R2
aws s3 cp /tmp/upworthy-raw.csv s3://research-datasets/blueprint/upworthy/upworthy-raw.csv --endpoint-url $S3_ENDPOINT

# Cleanup
rm /tmp/upworthy-raw.csv
```

### Dataset 2: Wikimedia Clickstream

**Source:** https://dumps.wikimedia.org/other/clickstream/
**Files:** Monthly TSV.GZ files for English Wikipedia. Download last 12 months.
**License:** CC0

```bash
# Download latest 12 months of English clickstream
for month in $(seq -w 7 12); do
  wget "https://dumps.wikimedia.org/other/clickstream/2026-${month}/clickstream-enwiki-2026-${month}.tsv.gz" -P /tmp/clickstream/
done
for month in $(seq -w 1 6); do
  wget "https://dumps.wikimedia.org/other/clickstream/2026-${month}/clickstream-enwiki-2026-${month}.tsv.gz" -P /tmp/clickstream/
done

# Upload to R2
aws s3 cp /tmp/clickstream/ s3://research-datasets/blueprint/clickstream/ --recursive --endpoint-url $S3_ENDPOINT
```

### Dataset 3: Met Museum Open Access

**Source:** https://github.com/metmuseum/openaccess
**File:** `MetObjects.csv` (~100 MB)
**License:** CC0

```bash
wget -O /tmp/MetObjects.csv "https://github.com/metmuseum/openaccess/raw/master/MetObjects.csv"
aws s3 cp /tmp/MetObjects.csv s3://research-datasets/blueprint/met-openaccess/MetObjects.csv --endpoint-url $S3_ENDPOINT
rm /tmp/MetObjects.csv
```

### Dataset 4: DPLA Bulk Download

**Source:** https://pro.dp.la/developers/bulk-download
**Files:** JSON or Parquet exports. Start with a single provider (e.g., "Smithsonian" subset within DPLA).
**License:** CC0

```bash
# DPLA provides S3 bucket access. Sync the desired collections.
# Exact command depends on which export format you choose.
# Start with the "partner" or "institution" subsets, not the full dump.
```

### Dataset 5: SARIT

**Source:** https://sarit.github.io/
**Files:** TEI XML from GitHub
**License:** Various (mostly open for research)

```bash
git clone --depth 1 https://github.com/sarit/sarit.git /tmp/sarit
aws s3 cp /tmp/sarit/ s3://research-datasets/blueprint/sarit/ --recursive --endpoint-url $S3_ENDPOINT
```

### Dataset 6: GoogleTrendArchive

**Source:** https://huggingface.co/datasets/aurman/GoogleTrendArchive
**Size:** 3.9 GB
**Paper:** https://arxiv.org/abs/2603.21871

```bash
# Requires HF token for higher rate limits
export HF_TOKEN="your_token"

pip install datasets
python3 -c "
from datasets import load_dataset
ds = load_dataset('aurman/GoogleTrendArchive', split='train', streaming=True)
ds.save_to_disk('/tmp/google-trend-archive')
"
aws s3 cp /tmp/google-trend-archive/ s3://research-datasets/blueprint/google-trend-archive/ --recursive --endpoint-url $S3_ENDPOINT
```

### Dataset 7: Stack Exchange Dumps

**Source:** https://archive.org/details/stackexchange
**Files:** Site-specific XML dumps. Download: hinduism.stackexchange.com, buddhism.stackexchange.com, philosophy.stackexchange.com, history.stackexchange.com, mythology.stackexchange.com

```bash
# Download individual site dumps from Internet Archive
for site in hinduism buddhism philosophy history mythology; do
  wget "https://archive.org/download/stackexchange/${site}.stackexchange.com.7z" -P /tmp/stackexchange/
done

# Upload to R2
aws s3 cp /tmp/stackexchange/ s3://research-datasets/blueprint/stackexchange/ --recursive --endpoint-url $S3_ENDPOINT
```

### Dataset 8: Smithsonian Open Access

**Source:** https://www.si.edu/openaccess
**Files:** JSON metadata (~10 GB)
**License:** CC0

```bash
# Download the full metadata dump
wget -O /tmp/smithsonian-meta.json "https://si-media-uploads.s3.amazonaws.com/Smithsonian_Open_Access_Metadata.json"
aws s3 cp /tmp/smithsonian-meta.json s3://research-datasets/blueprint/smithsonian/metadata.json --endpoint-url $S3_ENDPOINT
```

---

## How These Feed the Blueprint System

### Upworthy → Title & Hook Prior

```python
# For each clickability_test_id:
# 1. Compare winning vs losing headlines (same image via eyecatcher_id)
# 2. Extract semantic features: question?, familiarity, concreteness, etc.
# 3. Train a pairwise ranker (not a global CTR predictor)
# Output: For any proposed title, predict whether variant A beats variant B
```

### Clickstream → Gateway Language

```python
# For each topic (Chinnamasta, Bagalamukhi, etc.):
# 1. Build incoming links graph
# 2. Find top gateway entities (what do people read before this topic?)
# 3. Extract search-engine entry share
# Output: "People reach X through Y." This is your narrative entry frame.
```

### Met + DPLA + Smithsonian → Visual Asset Graph

```python
# For each asset:
# 1. Normalize to common schema (id, culture, region, date, material, rights)
# 2. Embed for similarity search
# 3. Connect to topic entities
# 4. Run anachronism check: does the date fit the narrated period?
# Output: Verified visual manifests per topic. No hallucinated imagery.
```

### SARIT → Primary-Text Concordance

```python
# For each concept (cremation_ground, bhairava, mantra, etc.):
# 1. Search Sanskrit forms + inflections
# 2. Retrieve verse + context + translation if available
# 3. Tag passage type: description, prescription, prohibition, metaphor
# Output: Verified passage sheet for script writers. Never search from scratch.
```

### Stack Exchange + GoogleTrendArchive → Question & Event Clusters

```python
# Stack Exchange: cluster questions by topic, flag unanswered or unresolved
# GoogleTrendArchive: detect current-attention episodes, check if evergreen
# Output: "This question keeps appearing without a good answer, AND interest is rising."
```

---

## Verification Gates

- [ ] Upworthy CSV downloaded and uploaded to R2
- [ ] Clickstream: 12 months of English Wikipedia files uploaded
- [ ] Met Museum: MetObjects.csv uploaded
- [ ] DPLA: at least one provider subset uploaded
- [ ] SARIT repository cloned and uploaded
- [ ] GoogleTrendArchive streamed and uploaded
- [ ] Stack Exchange: Hinduism + Buddhism + Philosophy dumps uploaded
- [ ] Smithsonian: metadata JSON uploaded
- [ ] Each dataset verified: `aws s3 ls s3://research-datasets/blueprint/ --recursive --human-readable`
- [ ] Credentials NOT committed (set as session env vars only)
- [ ] R2 layout documented in `pipelines/r2-dataset-reference.md`
