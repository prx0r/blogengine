# R2 Dataset Reference

Standardized documentation for all research datasets stored in R2. Each dataset has source, schema, access method, use case, and known limitations.

**Credentials (set fresh each session, never commit):**
```bash
# Set these fresh each session. Old keys were rotated.
# export AWS_ACCESS_KEY_ID="..."
export AWS_DEFAULT_REGION="auto"
# export AWS_SECRET_ACCESS_KEY="..."
export BUCKET="research-datasets"
```

---

## Bucket Overview

```
s3://research-datasets/
│
├── youniverse/                  3.2 GB   Breakout metric validation
├── ytcommentverse/              10.1 GB  Comment intent taxonomy
├── global-trending/             26.4 GB  Cross-country diffusion
├── google-trends/               25 MB    Western demand signal (generic terms only)
├── sanskrit-gretil/             382 MB   Sanskrit verses with genre tags
├── hindi-transcripts/           13 GB    Hindi YT subtitles (21 channels)
├── youtube-trending-kaggle/     337 MB   Multi-region trending (Kaggle)
├── sanskrit-text-corpus/        138 MB   Sanskrit text corpus (Kaggle)
├── youtube-hindi-subtitles/     1.5 GB   Hindi YT transcript CSVs (HF)
│
└── blueprint/                   5+ GB    Documentary blueprint intelligence
    ├── upworthy/                122 MB   Causal title A/B tests
    ├── met-openaccess/          303 MB   Museum objects CSV
    ├── sarit/                   204 MB   Sanskrit TEI XML corpus
    ├── clickstream/             4.2 GB   Wikipedia navigation paths
    ├── stackexchange/           337 MB   Q&A dumps (5 sites)
    ├── muktabodha/              89 MB    Sanskrit e-texts (IAST + Devanagari)
    ├── gretil/                  283 MB   Full GRETIL 1_sanskr.zip
    ├── samanantar-hi-en/        425 MB   Hindi-English parallel (2M pairs)
    ├── iitb-hi-en/              112 MB   IITB Hindi-English parallel
    ├── sans-en-vocab/           10 MB    Sanskrit-English word-level dictionary
    ├── bpcc-sanskrit/           56 MB    Sanskrit-English parallel (496K pairs)
    ├── sanskrit-hindi-mt/       47 MB    Sanskrit-Hindi parallel (religious domain)
    └── indiccorp-sanskrit/      ~0       Sanskrit monolingual (metadata only)
```

---

# CORE RESEARCH DATASETS

## Dataset 1: YouNiverse

**Source:** arXiv:2012.10378
**R2:** `s3://research-datasets/youniverse/`
**Period:** 2005-05 to 2019-10
**License:** CC BY 4.0

### Files

| File | Size | Rows | Content |
|------|------|------|---------|
| `df_channels_en.tsv.gz` | 5.7 MB | 136,470 | Channel metadata |
| `df_timeseries_en.tsv.gz` | 544 MB | 18,872,499 | Weekly channel stats |
| `yt_metadata_helper.feather` | 2.6 GB | 72,924,794 | Video metadata (excl description/tags) |

### Schema

`df_channels_en.tsv.gz`: category_cc, join_date, channel (ID), name_cc, subscribers_cc, videos_cc, subscriber_rank_sb, weights

`df_timeseries_en.tsv.gz`: channel, category, datetime, views, delta_views, subs, delta_subs, videos, delta_videos, activity

`yt_metadata_helper.feather`: categories, channel_id, crawl_date, dislike_count, display_id, duration, like_count, upload_date, view_count

### Use Cases

- Breakout metric validation (OLS residual vs raw views)
- Channel size effects and category analysis
- Sampling: 5000 channels × 50 videos ≈ 250k rows, ~70s runtime

### Access

```bash
aws s3 cp s3://$BUCKET/youniverse/df_channels_en.tsv.gz - --endpoint-url $S3_ENDPOINT | gunzip | head
```

---

## Dataset 2: YTCommentVerse

**Source:** arXiv:2412.03465
**R2:** `s3://research-datasets/ytcommentverse/`
**Size:** 10.1 GB (1 SQLite DB, 32M comments)
**License:** CC BY 4.0

### Schema

comment_id, video_id, commentor_name, commentor_channel_id, comment_text, upvotes, channel_id, category

### Use Cases

- Comment intent taxonomy (question, objection, testimony, etc.)
- Code-mixed Hinglish patterns in comments
- Topic-specific comment mining

### Access

```bash
aws s3 cp s3://$BUCKET/ytcommentverse/YT-30M.db - --endpoint-url $S3_ENDPOINT > /tmp/YT-30M.db
sqlite3 /tmp/YT-30M.db "SELECT category, COUNT(*) FROM comments GROUP BY category;"
```

---

## Dataset 3: Global YouTube Trending

**Source:** arXiv:2510.23645
**R2:** `s3://research-datasets/global-trending/`
**Size:** 26.4 GB (1 tarball)
**License:** CC BY 4.0

### Schema

snapshot_time, country, rank (1-200), video_id, channel_id, category, title, description, tags, channel_name, language, live_status, view_count, comment_count, published_at

### Use Cases

- Cross-country diffusion patterns (IN→US lag)
- Category trends across regions
- Niche vs mainstream threshold analysis

### Gotcha

Illinois Data Bank blocks Hetzner IPs. Use the `download_link` API with `Referer` header to get a fresh URL.

---

## Dataset 4: Google Trends Corpus

**Source:** https://huggingface.co/datasets/jeremycochoy/google-trends-corpus
**R2:** `s3://research-datasets/google-trends/`
**Size:** 25 MB (Parquet, v0+v1)

### ⚠️ Limitation

**Does NOT contain tantra/spirituality keywords.** The 1,845 unique terms are all pop culture, sports, movies, news. v0 = 2 MB (788 rows), v1 = 22 MB (9,220 rows). Neither has our target terms. Use `pytrends` for custom pulls instead.

---

## Dataset 5: Sanskrit GRETIL (HF)

**Source:** https://huggingface.co/datasets/paws/sanskrit-verses-gretil
**R2:** `s3://research-datasets/sanskrit-gretil/`
**Size:** 382 MB (Parquet + Arrow)
**License:** CC-BY

### Schema (from HF datasets format)

text, source, genre, verse_id — 450K Sanskrit verses with genre tags

### Use Cases

- Tantra text classifier: filter for `tantra|agama` genre tags
- Find specific texts: Svacchandatantra, Kubjikamatantra, Tantraloka

---

## Dataset 6: Hindi YouTube ASR Transcripts

**Source:** https://huggingface.co/datasets/ketav/hindi-youtube-asr-transcripts
**R2:** `s3://research-datasets/hindi-transcripts/`
**Size:** 13 GB (21 channels, VTT subtitles)

### High-Signal Subset

| Channel | Size | Why |
|---------|------|-----|
| shriprashant | 57 MB | Spiritual teacher |
| RanveerAllahbadia | 117 MB | Philosophy podcast, code-switching |
| NitishRajput | 44 MB | Spiritual content |
| JoshTalksHindi | 314 MB | Educational |

### Use Cases

- Cross-language transfer: topics breaking in Hindi before English
- Code-mixed Hinglish keyword tracking

---

# BLUEPRINT INTELLIGENCE DATASETS

## Blueprint 1: Upworthy Research Archive (Title Causal Prior)

**Source:** OSF https://osf.io/jd64p/
**R2:** `s3://research-datasets/blueprint/upworthy/`
**Size:** 122 MB (4 CSV files)
**License:** CC0

### Files

| File | Size | Content |
|------|------|---------|
| `upworthy-archive-confirmatory-packages-03.12.2020.csv` | 63 MB | Main experiment data |
| `upworthy-archive-exploratory-packages-03.12.2020.csv` | 14 MB | Exploratory tests |
| `upworthy-archive-holdout-packages-03.12.2020.csv` | 14 MB | Holdout set |
| `upworthy-archive-undeployed-packages.01.12.2021.csv` | 32 MB | Undeployed tests |

### Key Columns

clickability_test_id, eyecatcher_id, headline, impressions, clicks, significance, experiment_date

### Use Case

Train a pairwise title ranker: for each `clickability_test_id`, compare winning vs losing headlines. Extract semantic features (question?, familiarity, concreteness) → causal prior for title generation.

### Pipeline

```python
import pandas as pd
df = pd.read_csv("s3://.../blueprint/upworthy/upworthy-archive-confirmatory-packages-03.12.2020.csv")
# For each test_id, compare same-eyecatcher variants
# Extract features → train pairwise ranker
# Output: for any proposed title, predict whether it beats alternative
```

---

## Blueprint 2: Wikimedia Clickstream (Curiosity Pathways)

**Source:** https://dumps.wikimedia.org/other/clickstream/
**R2:** `s3://research-datasets/blueprint/clickstream/`
**Size:** 4.2 GB (9 monthly TSV.GZ files, 2025-07 to 2026-03)
**License:** CC0

### Schema

prev_id, curr_id, click_count, search_engine_entry_count

### Use Cases

Build a gateway graph: for any obscure topic (Chinnamasta, Kaula, Pratyabhijna), find what pages people read before reaching it. "People reach Chinnamasta through Kali."

### Pipeline

```python
import pandas as pd
df = pd.read_csv("s3://.../clickstream-enwiki-2026-03.tsv.gz", sep="\t")
# For target topics, aggregate incoming prev_ids
# Rank by click_count → gateway entities
```

---

## Blueprint 3: Met Museum Open Access (Visual Assets)

**Source:** https://github.com/metmuseum/openaccess
**R2:** `s3://research-datasets/blueprint/met-openaccess/MetObjects.csv`
**Size:** 303 MB (CSV)
**License:** CC0

### Key Columns

ObjectID, Title, Culture, Period, Date, Medium, Department, Geography, Image URL, Rights

### Use Case

Visual asset retrieval: filter by culture (Indian, Tibetan, Nepali), period, medium. Connect to topic entities for verified imagery.

---

## Blueprint 4: SARIT (Sanskrit Text Corpus)

**Source:** https://github.com/sarit/SARIT-corpus
**R2:** `s3://research-datasets/blueprint/sarit/`
**Size:** 204 MB (110 TEI XML files)
**License:** Various (mostly open for research)

### Contents

Key philosophical and medical texts in TEI XML including Nyaya, Vaisheshika, Mimamsa, Yoga, Ayurveda texts. Contains `bhartrhari-vakyapadiya.xml`, `nyayamanjari.xml`, `sarvadarsanasangraha.xml`, etc.

### Use Case

Primary-text concordance: search for Sanskrit forms → retrieve verse + context. Build verified passage sheets for script writers.

---

## Blueprint 5: Stack Exchange Q&A (Audience Questions)

**Source:** https://archive.org/details/stackexchange
**R2:** `s3://research-datasets/blueprint/stackexchange/`
**Size:** 337 MB (5 7z files)

### Files

| File | Size | Site |
|------|------|------|
| `hinduism.stackexchange.com.7z` | 69 MB | Hinduism |
| `buddhism.stackexchange.com.7z` | 50 MB | Buddhism |
| `philosophy.stackexchange.com.7z` | 122 MB | Philosophy |
| `history.stackexchange.com.7z` | 89 MB | History |
| `mythology.stackexchange.com.7z` | 8.5 MB | Mythology |

### Use Case

Question clustering: extract unanswered questions, controversial topics, repeated questions across sites. "Same question + contradictory answers + no citations = documentary mystery."

---

## Blueprint 6: Muktabodha Digital Library (Sanskrit E-texts)

**Source:** https://muktalib7.com/
**R2:** `s3://research-datasets/blueprint/muktabodha/`
**Size:** 89 MB (2 ZIP files)

### Files

| File | Content |
|------|---------|
| `MUKTABODHA-LIBRARY-IAST.zip` | 570+ e-texts in IAST transliteration |
| `MUKTABODHA-LIBRARY-DEVANAGARI.zip` | 570+ e-texts in Devanagari |

### License

CC BY-NC 4.0

### Use Case

Shaiva Tantra manuscript source. Hundreds of Sanskrit texts supervised by Mark Dyczkowski directly from manuscripts. Input to translation pipeline.

---

## Blueprint 7: GRETIL Full Sanskrit Collection

**Source:** https://gretil.sub.uni-goettingen.de/
**R2:** `s3://research-datasets/blueprint/gretil/1_sanskr.zip`
**Size:** 283 MB (ZIP)
**License:** Open access

### Contents

Complete GRETIL Sanskrit corpus: Vedic, philosophical, tantric, and scientific texts in multiple formats (TXT, XML, HTML).

### Use Case

Source texts for translation pipeline. The `6_philos/` directory inside contains philosophical works including Nyaya, Bhatrihari's Vakyapadiya.

---

# TRANSLATION DATASETS

## Translation 1: BPCC Sanskrit-English Parallel

**Source:** https://huggingface.co/datasets/ai4bharat/BPCC (gated — terms accepted)
**R2:** `s3://research-datasets/blueprint/bpcc-sanskrit/`
**Size:** 56 MB (52 Parquet files, 496,740 rows)
**License:** CC0 (mined) / CC-BY-4.0 (seed)

### Schema

src (Sanskrit text), tgt (English translation), source (config name)

### Config Sources

| Config | Rows | Quality |
|--------|------|---------|
| nllb-filtered | 244,131 | LASER-scored NLLB data |
| bpcc-seed-latest | 98,778 | Curated seed |
| bpcc-seed-v2 | 97,646 | Curated seed v2 |
| daily | 27,744 | Daily conversation domain |
| bpcc-seed-v1 | 27,744 | Curated seed v1 |
| comparable | 697 | Web-mined comparable |

### Use Case

Primary Sanskrit→English parallel corpus for NMT training. Mix of general and religious domain.

---

## Translation 2: Samanantar Hindi-English

**Source:** https://huggingface.co/datasets/ai4bharat/samanantar
**R2:** `s3://research-datasets/blueprint/samanantar-hi-en/`
**Size:** 425 MB (20 Parquet files, 2,000,000 rows)
**License:** CC-BY-NC-4.0

### Schema

src (Hindi), tgt (English)

### Use Case

Pivot translation leg: Hindi→English. 10.1M pairs available total; 2M downloaded as sample. Full stream available on HF.

---

## Translation 3: IITB Hindi-English Parallel

**Source:** https://www.kaggle.com/datasets/vaibhavkumar11/hindi-english-parallel-corpus
**R2:** `s3://research-datasets/blueprint/iitb-hi-en/`
**Size:** 112 MB (1 CSV, ~1.5M pairs)
**License:** Unknown

### Schema

source (English), target (Hindi)

### Use Case

Additional Hindi→English pivot data from IIT Bombay.

---

## Translation 4: Sanskrit-to-English Vocabulary

**Source:** https://huggingface.co/datasets/Manoj2702/Sanskrit-to-English-Vocabulary-v1
**R2:** `s3://research-datasets/blueprint/sans-en-vocab/`
**Size:** 10 MB (192K entries)
**License:** MIT

### Schema

Word-level: Sanskrit term → English gloss. From Monier-Williams and other dictionaries.

### Use Case

Lexicon coverage for rare tantric terms. Augment NMT vocabulary.

---

## Translation 5: IIT Guwahati Sanskrit-Hindi

**Source:** https://github.com/priyanshu2103/Sanskrit-Hindi-Machine-Translation
**R2:** `s3://research-datasets/blueprint/sanskrit-hindi-mt/`
**Size:** 47 MB (27 files)
**License:** Not specified

### Contents

Parallel corpus from Ramayana, Rigveda, Bhagavad Gita. Sanskrit↔Hindi aligned.

### Use Case

Domain-specific religious translation. Combined with Samanantar (HI→EN) gives SA→HI→EN pivot.

---

## Translation 6: GRETIL + Muktabodha + SARIT (Monolingual Source Texts)

**R2:** `blueprint/gretil/`, `blueprint/muktabodha/`, `blueprint/sarit/`
**Total:** ~576 MB

### Use Case

Sanskrit source texts needing alignment with English translations. Pair GRETIL's `1_sanskr.zip` with Dyczkowski's Tantraloka translations to create custom tantra-domain parallel corpus.

---

# STANDARDIZED ACCESS API

## Quick Python Access Module

```python
import boto3
import pandas as pd
import pyarrow.parquet as pq

session = boto3.session.Session(
    aws_access_key_id="REDACTED_ACCESS_KEY",
    aws_secret_access_key="REDACTED_SECRET_KEY",
)
s3 = session.client("s3", endpoint_url="https://REDACTED_ACCOUNT_ID.r2.cloudflarestorage.com")
BUCKET = "research-datasets"

def read_parquet(path):
    """Read any parquet dataset from R2."""
    import pyarrow.fs as fs
    s3fs = fs.S3FileSystem(
        access_key="REDACTED_ACCESS_KEY",
        secret_key="REDACTED_SECRET_KEY",
        endpoint_override="REDACTED_ACCOUNT_ID.r2.cloudflarestorage.com"
    )
    return pq.read_table(s3fs.open_input_file(f"{BUCKET}/{path}")).to_pandas()

def list_dataset(path):
    """List files in a dataset path."""
    resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=path)
    return [obj["Key"] for obj in resp.get("Contents", [])]
```

## Translation Data Loader

```python
import pandas as pd
import pyarrow.fs as fs

s3fs = fs.S3FileSystem(
    access_key="...",
    secret_key="...",
    endpoint_override="REDACTED_ACCOUNT_ID.r2.cloudflarestorage.com"
)

def load_bpcc_sanskrit(sources=None):
    """Load BPCC Sanskrit-English parallel data. Filter by source config if needed."""
    import pyarrow.parquet as pq
    base = "research-datasets/blueprint/bpcc-sanskrit"
    files = [f for f in s3fs.get_file_info(fs.FileSelector(base)) if f.extension == '.parquet']
    tables = [pq.read_table(f.path) for f in files]
    return pd.concat(t.to_pandas() for t in tables)

def load_samanantar_hien():
    """Load Samanantar Hindi-English parallel data."""
    import pyarrow.parquet as pq
    base = "research-datasets/blueprint/samanantar-hi-en"
    files = [f for f in s3fs.get_file_info(fs.FileSelector(base)) if f.extension == '.parquet']
    tables = [pq.read_table(f.path) for f in files]
    return pd.concat(t.to_pandas() for t in tables)
```

## Can We Create a Standardized API?

**Short answer: Yes, and it's straightforward.**

The current access pattern (direct S3 with boto3/pyarrow) is already a standardized API — S3's object storage API. Every dataset is accessible via the same endpoint, credentials, and tools.

**What a custom API would add:**
1. **Query routing**: `GET /api/datasets/youniverse?filter=category_cc=Education` → translates to S3 + DuckDB/pyarrow
2. **Format normalization**: Return any dataset as JSON/CSV/Parquet regardless of source format
3. **Streaming for large files**: Paginate results instead of full download
4. **Caching layer**: Cache frequent queries to avoid repeated S3 reads (especially for the 26 GB tarball)
5. **Cross-dataset joins**: "Join youniverse channels with trending data by channel_id"

**Implementation options:**
- **Cloudflare Worker** (cheapest, ~$0): A Worker that reads from R2 via its binding, exposes REST endpoints. Each dataset gets a route: `/api/v1/youniverse/channels`, `/api/v1/blueprint/upworthy`, etc.
- **DuckDB over R2**: DuckDB can query Parquet/CSV directly from S3-compatible storage. A thin API layer on top.
- **R2 Data Catalog**: For Parquet datasets only. Enables SQL queries via `npx wrangler r2 sql query`.

**Current recommendation:** Use direct S3 access (boto3/pyarrow) for batch processing. Add a Worker API only when you need cross-dataset joins or real-time access from the Hermes agent.

---

# DOWNLOAD PATTERNS & GOTCHAS

| Issue | Fix |
|-------|-----|
| `hf download` defaults to model repos | Add `--repo-type dataset` |
| `huggingface-cli` deprecated | Use `hf` CLI |
| Gated HF datasets | Accept terms on HF website, set `HF_TOKEN` |
| Python stdout buffering in nohup | Use `PYTHONUNBUFFERED=1` or `print(flush=True)` |
| OSF download redirects | Use the API: `api.osf.io/v2/files/{id}/` → `links.download` |
| Kaggle without API key | `kagglehub` works without auth for public datasets |

---

# VOLUME MANAGEMENT

The Hetzner volume `/mnt/HC_Volume_106423434/` (50 GB ext4) is the download staging area. Pattern:
1. Download to volume
2. Upload to R2 via `aws s3 cp`
3. Verify in R2 with `aws s3 ls`
4. Delete local copy: `rm -rf $DATA_DIR/{dataset}`

Current R2 storage: ~50 GB across all datasets at ~$0.55/month.
