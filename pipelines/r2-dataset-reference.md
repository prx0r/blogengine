# R2 Dataset Reference

Standardized documentation for all research datasets stored in R2. Each dataset has a source, schema, access method, known limitations, and high-signal usage notes.

**Credentials (set fresh each session, never commit):**
```bash
export AWS_ACCESS_KEY_ID="b31c6e90450f740629ac030f6e16eef4"
export AWS_SECRET_ACCESS_KEY="cce64be980580e166482b2c64c6396d5ea25bdb889ff43f3782c0932a75a9b32"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"
export BUCKET="research-datasets"
```

---

## Bucket Overview

```
s3://research-datasets/
├── youniverse/              3.2 GB   Breakout metric validation
├── ytcommentverse/          10.1 GB  Comment intent taxonomy
├── global-trending/         26.4 GB  Cross-country diffusion
├── google-trends/           25 MB    Western demand signal validation
├── sanskrit-gretil/         382 MB   Tantra text subject classifier
└── hindi-transcripts/       13 GB    Cross-language transfer analysis
```

---

## Dataset 1: YouNiverse

**Source:** arXiv:2012.10378 — "YouNiverse: Large-Scale Channel and Video Metadata from English-Speaking YouTube"
**R2:** `s3://research-datasets/youniverse/`
**Period:** 2005-05 to 2019-10
**License:** CC BY 4.0

### Files

| File | Size | Rows | Content |
|------|------|------|---------|
| `df_channels_en.tsv.gz` | 5.7 MB | 136,470 | Channel metadata: subs, videos, category, rank |
| `df_timeseries_en.tsv.gz` | 544 MB | 18,872,499 | Weekly channel stats: views, subs, activity |
| `yt_metadata_helper.feather` | 2.6 GB | 72,924,794 | Video metadata: duration, views, likes, dislikes |

**Note:** Original filename for time series was `df_timeseries_en.csv.gz` — confirmed via Zenodo API that it's `.tsv.gz`. Specs that reference `.csv.gz` are wrong.

### Schema

`df_channels_en.tsv.gz`: category_cc, join_date, channel (ID), name_cc, subscribers_cc, videos_cc, subscriber_rank_sb, weights

`df_timeseries_en.tsv.gz`: channel (ID), category, datetime (week start), views, delta_views, subs, delta_subs, videos, delta_videos, activity

`yt_metadata_helper.feather`: categories, channel_id, crawl_date, dislike_count, display_id, duration (seconds), like_count, upload_date, view_count

### Access

```bash
# Direct S3 read
aws s3 cp s3://$BUCKET/youniverse/df_channels_en.tsv.gz - --endpoint-url $S3_ENDPOINT | gunzip | head

# Python — feather
import pyarrow.feather as pf
table = pf.read_feather(
    pf.S3FileSystem(access_key=..., secret_key=...).open_input_file(
        '$BUCKET/youniverse/yt_metadata_helper.feather'
    )
)
```

### High-Signal Usage

- **Best for**: Breakout metric validation, channel size effects, category analysis
- **Channel IDs** change over time — YouTube search is time-sensitive. Run queries weekly for fresh lists, don't cache channel sets
- **The feather file** excludes description/tags/title — those are in the 13 GB `_raw_yt_metadata.jsonl.zst` (still on Zenodo, not downloaded). Only download if you need NLP on video titles
- **Sampling**: 5000 channels × 50 videos each is ~250k rows, takes ~70s. Good default for quick validation

---

## Dataset 2: YTCommentVerse

**Source:** arXiv:2412.03465 — "YT-30M: A Multi-lingual Multi-category Dataset of YouTube Comments"
**R2:** `s3://research-datasets/ytcommentverse/`
**Size:** 10.1 GB (1 SQLite DB, 32M comments)
**License:** CC BY 4.0

### Access

```bash
# Stream to local, query with sqlite3
aws s3 cp s3://$BUCKET/ytcommentverse/YT-30M.db - --endpoint-url $S3_ENDPOINT > /tmp/YT-30M.db
sqlite3 /tmp/YT-30M.db "SELECT category, COUNT(*) FROM comments GROUP BY category ORDER BY 2 DESC LIMIT 10;"

# Or use DuckDB SQLite scanner for remote streaming
```

### Schema

comment_id, video_id, commentor_name, commentor_channel_id, comment_text, upvotes, channel_id, category

### Limitations

- No user geography or demographics
- Category is YouTube's broad classification
- Comment text only — can't infer viewer location from content

---

## Dataset 3: Global YouTube Trending

**Source:** arXiv:2510.23645 — "Global YouTube Trending Dataset (2022-2025)"
**R2:** `s3://research-datasets/global-trending/`
**Size:** 26.4 GB (1 tarball, 446K snapshots, 726K videos, 104 countries)

### Download Gotchas

**Illinois Data Bank blocks server IPs.** The direct URL `/datafiles/2lj91/download` returns 403 from Hetzner. Use the API:

```bash
# Get a fresh URL via API with Referer header
RESPONSE=$(curl -sS -A "Mozilla/5.0" \
  -H "Referer: https://databank.illinois.edu/datasets/IDB-9307654" \
  -H "Accept: application/json" \
  "https://databank.illinois.edu/datasets/IDB-9307654/download_link?web_ids=2lj91")
DL_URL=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['url'])")

# Download with matching headers
curl -L -A "Mozilla/5.0" -H "Referer: https://databank.illinois.edu/datasets/IDB-9307654" \
  -o youtube_trends.tar.bz2 "$DL_URL" --progress-bar
```

### Schema

snapshot_time, country (ISO 3166-1 alpha-2), rank (1-200), video_id, channel_id, category, title, description, tags, channel_name, language, live_status, view_count, comment_count, published_at

### Limitations

- Only trending-page videos (not full ecosystem). Niche content rarely trends here
- YouTube retired public Trending pages July 1, 2025 — data ends June 30, 2025
- This dataset reveals cultural-crossover mechanics, not topic popularity

---

## Dataset 4: Google Trends Corpus

**Source:** https://huggingface.co/datasets/jeremycochoy/google-trends-corpus
**R2:** `s3://research-datasets/google-trends/`
**Size:** 25 MB (Parquet)
**Period:** 2004-2026
**Versions:** v0 and v1 available (both uploaded)

### What It Contains

Monthly search interest scores for specific queries across Google. Used to validate the `western_demand` signal — if a search term is rising in English-speaking countries but Hindi content dominates the results, that's a gap.

### Access

```bash
# Read via Python/pandas
import pandas as pd
table = pd.read_parquet(
    "s3://$BUCKET/google-trends/v1/corpus.parquet",
    storage_options={"key": ..., "secret": ..., "endpoint_url": "https://..."}
)
```

### Key Terms to Query

| Query | Why It Matters | Expected Signal |
|-------|---------------|-----------------|
| `tantra` | Core niche | High in US/UK, stable over time |
| `kundalini` | Related niche | Seasonal spikes |
| `abhinavagupta` | Specific philosopher | Low absolute volume, rising trend = signal |
| `hinduism` | Broad religion context | Baseline for comparison |
| `kashmir shaivism` | Specific philosophy | Very low volume, any movement is notable |
| `bhairava` | Deity-specific | Low volume, spikes around Hindu festivals |
| `chakra` | Adjacent niche (yoga) | High volume, understand baseline |

### Usage

```python
# Example: validate western_demand for tantra
import pandas as pd
df = pd.read_parquet("s3://.../google-trends/v1/corpus.parquet")
tantra = df[df['query'] == 'tantra']
# Compare US/UK/IN trend lines over time
# If US is rising while IN is flat → western demand gap
```

### Download Gotchas

- Use `hf download` with `--repo-type dataset` flag (default is model repos)
- The `hf` CLI (not the deprecated `huggingface-cli`) is required: `hf download jeremycochoy/google-trends-corpus --repo-type dataset --local-dir ./google-trends`
- v0 and v1 have different schemas — check READMEs in the repo to decide which to use

---

## Dataset 5: Sanskrit GRETIL Verses

**Source:** https://huggingface.co/datasets/paws/sanskrit-verses-gretil
**R2:** `s3://research-datasets/sanskrit-gretil/`
**Size:** 382 MB (Parquet + Arrow, 450K verses)
**License:** CC-BY (check dataset card)

### What It Contains

Sanskrit verses from the GRETIL (Göttingen Register of Electronic Texts in Indian Languages) corpus, including actual tantra texts like Svacchandatantra and Kubjikamatantra. Each verse has genre tags.

### Access

```bash
# Python with datasets library
from datasets import load_dataset
# Currently can't stream directly from R2 — download first
aws s3 cp s3://$BUCKET/sanskrit-gretil/data/train-00000-of-00001.parquet ./ \
  --endpoint-url $S3_ENDPOINT
import pandas as pd
df = pd.read_parquet("train-00000-of-00001.parquet")
```

### High-Signal Usage

**Best use case**: Build a tantra-specific subject classifier. The genre tags let you isolate tantric texts from the broader corpus:

```python
# Isolate tantra texts
tantra_verses = df[df['genre'].str.contains('tantra|agama', case=False, na=False)]
print(f"{len(tantra_verses)} tantra verses found")

# Key texts to look for
target_texts = ['svacchanda', 'kubjika', 'kularnava', 'tantraloka', 'malinivijaya']
for text in target_texts:
    subset = df[df['source'].str.contains(text, case=False, na=False)]
    print(f"{text}: {len(subset)} verses")
```

### Download Gotchas

- Downloads as HuggingFace `datasets` format (Arrow + Parquet), not plain text
- Actual size was 382 MB, not the ~1 GB the spec estimated
- Dataset contains the full directory structure: `data/` folder with train split

---

## Dataset 6: Hindi YouTube ASR Transcripts

**Source:** https://huggingface.co/datasets/ketav/hindi-youtube-asr-transcripts
**R2:** `s3://research-datasets/hindi-transcripts/`
**Size:** 13 GB (21 channels, full tarball extracted into R2)
**License:** CC-BY-4.0

### What It Contains

Auto-generated YouTube VTT subtitle files from 21 Hindi YouTube channels. 22K hours of Hindi and Hinglish speech. Not audio — just subtitle text files.

### Full Channel List (21)

Most are Hindi news channels (NOT useful for tantra/spirituality research):

| Channel | Size | Language | Relevance |
|---------|------|----------|-----------|
| shriprashant | 57 MB | Hindi | **HIGH** — spiritual teacher |
| RanveerAllahbadia | 117 MB | Hindi/English | **HIGH** — podcast with philosophy episodes |
| NitishRajput | 44 MB | Hindi | **HIGH** — spiritual content |
| ThinkSchool | 17 MB | Hindi | **MEDIUM** — educational |
| JoshTalksHindi | 314 MB | Hindi | **MEDIUM** — motivational/educational |
| DhruvRathee | 131 MB | Hindi | LOW — political commentary |
| StudyIQEducationLtd | 2.7 GB | Hindi | LOW — exam prep |
| PhysicsWallah | 270 MB | Hindi | LOW — physics teaching |
| khansirofficial | 524 KB | Hindi | LOW — exam prep |
| all news channels (NDTVIndia, AajTak, etc.) | ~8 GB | Hindi | **NOT RELEVANT** — news |

**5 high-signal channels uploaded as pre-filtered subset:**
- `s3://research-datasets/hindi-transcripts/shriprashant/`
- `s3://research-datasets/hindi-transcripts/RanveerAllahbadia/`
- `s3://research-datasets/hindi-transcripts/NitishRajput/`
- `s3://research-datasets/hindi-transcripts/ThinkSchool/`
- `s3://research-datasets/hindi-transcripts/JoshTalksHindi/`

### Access

```bash
# List a channel's subtitle files
aws s3 ls s3://$BUCKET/hindi-transcripts/RanveerAllahbadia/subs/ \
  --endpoint-url $S3_ENDPOINT --human-readable | head -10

# Download a specific subtitle
aws s3 cp s3://$BUCKET/hindi-transcripts/shriprashant/subs/ABC123.hi.vtt . \
  --endpoint-url $S3_ENDPOINT
```

### File Format

Each video has `.hi.vtt` (Hindi) and sometimes `.en.vtt` (English auto-translate) subtitle files:
```
hindi-transcripts/{channel}/manifest.csv     — video metadata
hindi-transcripts/{channel}/videos.json      — structured video info
hindi-transcripts/{channel}/subs/{id}.hi.vtt — Hindi subtitles
hindi-transcripts/{channel}/subs/{id}.en.vtt — English subtitles (when available)
```

### High-Signal Usage

**Cross-language transfer analysis**: Find topics that break out in Hindi before English:

```python
# 1. Scan RanveerAllahbadia subtitles for tantra keywords (Hindi or English)
# 2. Extract topic clusters from high-view Hindi videos
# 3. Cross-reference against gap scores from Stage 1 test
# 4. If a topic spikes in Hindi and has high gap score in EN → content opportunity

# Example keywords to track in Hindi subtitles:
# तंत्र (tantra), कुंडलिनी (kundalini), शैव (shaiva), भैरव (bhairava), काली (kali)
```

**Best channel for cross-language signal**: RanveerAllahbadia (117 MB). His podcast covers spirituality/philosophy with Hindi-English code-switching. The English subtitle files (`.en.vtt`) are auto-translated, not native, but useful for keyword matching.

### Download Gotchas

- **The `hf download` command only gets 1 channel by default.** The dataset card shows all 21 channels, but HuggingFace's `hf` CLI treats each top-level file/folder as a separate download entity. Use the tarball URL instead.
- **Full download**: `wget https://huggingface.co/datasets/ketav/hindi-youtube-asr-transcripts/resolve/main/youtube_asr_data.tar.gz` (2.2 GB compressed, 13 GB extracted)
- **Tarball extracts to** `data/youtube/{channel}/` — if extracting from tarball, the structure is nested under `data/`
- **The user aborted the full 13 GB upload** — only the 5 high-signal channels were selectively uploaded. The full 21-channel tree ended up in R2 from the initial partial upload. For most analysis, stick to the 5 channels listed above.

---

## Dataset 7: Reddit Comments (592M) — NOT DOWNLOADED

**Status:** Not yet acquired. Two approaches:

### Approach A: Pushshift API (recommended, no download)
```python
import requests
subreddits = ['hinduism', 'tantra', 'Buddhism', 'yoga', 'philosophy', 
              'spirituality', 'occult', 'religion', 'AdvaitaVedanta']
for sub in subreddits:
    url = f"https://api.pushshift.io/reddit/submission/search?subreddit={sub}&size=1000"
    data = requests.get(url).json()
```

### Approach B: Stream-filtered download from HuggingFace
The full file is 50 GB compressed (592M comments). **Do not download fully.** Stream-filter with `ijson`:
```python
import ijson, requests, gzip
# Stream the gzipped JSONL, keep only rows matching target subreddits
# Estimated filtered output: ~500 MB
```

---

## General Download Patterns & Gotchas

### HuggingFace Datasets

| Issue | Fix |
|-------|-----|
| `hf download` defaults to model repos, not datasets | Add `--repo-type dataset` |
| `huggingface-cli` is deprecated | Use `hf` CLI instead |
| Dataset tarballs vs individual files | Check the dataset's file tree via API: `curl https://huggingface.co/api/datasets/{owner}/{name}` |
| Rate limiting without auth | Set `HF_TOKEN` env var for higher limits |

### Volume Management

The Hetzner volume `/mnt/HC_Volume_106423434/` (50 GB) is the download staging area. Pattern:
1. Download to volume
2. Upload to R2 via `aws s3 cp`
3. Verify in R2 with `aws s3 ls`
4. Delete local copy

Total R2 storage across all datasets: ~40 GB at ~$0.45/month.

### R2 Credentials Safety

- **Never commit credentials.** Set env vars each session
- `.env.local` was previously tracked in git — run `git rm --cached .env.local` if it happens again
- R2 has no egress fees — uploading and downloading costs nothing beyond storage
