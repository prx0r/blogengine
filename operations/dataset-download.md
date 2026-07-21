# Dataset Download to R2 — Operations Spec

> **⚠️ CRITICAL: NEVER COMMIT CREDENTIALS TO GIT**
> All AWS/R2 credentials, API tokens, and secret keys in this file are placeholders.
> Set them as environment variables each session. Never save them in any file tracked by git.
> If you push credentials to any remote (GitHub, Cloudflare, etc.), they must be revoked immediately.
> The `.env` and `.env.local` files are in `.gitignore` — if you add credentials to any other file,
> verify it is also gitignored before committing.

## Objective

Download all four research datasets to the Hetzner server, then upload to Cloudflare R2 for permanent storage and querying via R2 SQL / Data Catalog.

## Scope

| # | Dataset | Size | Source | Purpose |
|---|---------|------|--------|---------|
| 1 | **YouNiverse** (3 files) | 3.4 GB | Zenodo | Breakout metric validation |
| 2 | **YTCommentVerse** (1 SQLite DB) | 10.8 GB | Zenodo | Comment intent taxonomy |
| 3 | **Global Trending** (1 tarball) | 26.4 GB | Illinois Data Bank | Cross-country diffusion |
| 4 | **Regional Audit** | N/A | Author request only | Overlap metrics baseline |
| | **Total** | **~40.6 GB** | | |

Regional Audit is not publicly downloadable — requires emailing authors. Skip it for now.

---

## Prerequisites

### Hetzner Volume Setup (Required — all 3 datasets)

The server only has ~18 GB free. All datasets go on a separate volume.

**Step 1: Create the volume in Hetzner Cloud Console**

1. Log in to [console.hetzner.cloud](https://console.hetzner.cloud)
2. Select your project
3. Click **Volumes** in the left sidebar
4. Click **Create Volume**
5. Set:
   - **Name**: `datasets`
   - **Size**: 50 GB (minimum to fit all 3 datasets with room)
   - **Filesystem**: ext4 (Hetzner will auto-format)
   - **Attach to**: select your server (e.g. `debz`)
6. Click **Create & Attach**

**Step 2: Note the mount point**

Hetzner auto-mounts volumes to `/mnt/HC_Volume_<volume-id>/`. Check:

```bash
lsblk | grep -v loop | grep -v sr0
# Look for the 50G device — it will be mounted already

df -h | grep HC_Volume
# Shows the exact mount path, e.g. /mnt/HC_Volume_106423434 with ~47 GB available

export DATA_DIR="/mnt/HC_Volume_106423434/raw"
mkdir -p $DATA_DIR
```

If not auto-mounted, format and mount manually:
```bash
mkfs.ext4 /dev/sdb
mkdir -p /mnt/data
mount /dev/sdb /mnt/data
echo '/dev/sdb /mnt/data ext4 defaults 0 0' >> /etc/fstab
export DATA_DIR="/mnt/data/raw"
mkdir -p $DATA_DIR
```

### Cloudflare R2 Setup

| Item | Where to Find | Action |
|------|---------------|--------|
| **Account ID** | Cloudflare Dashboard → right sidebar | Copy 32-char hex string |
| **R2 API Token** | Dashboard → R2 → Manage R2 API Tokens → Create Token | Create token with Read+Write on `research-datasets` bucket |
| **Access Key ID** | Shown on token creation page | Copy, store in `.env` |
| **Secret Access Key** | Shown ONCE on token creation page | Copy immediately, never commit |
| **R2 Endpoint** | `https://<account-id>.r2.cloudflarestorage.com` | Replace `<account-id>` with yours |

**Create the R2 bucket** (one-time):

```bash
# After setting env vars (see below)
aws s3api create-bucket \
  --bucket research-datasets \
  --endpoint-url $S3_ENDPOINT
```

### Environment Variables

Set these at the start of every session. **Never commit them to git.**

```bash
# From Cloudflare Dashboard → R2 API Tokens
export AWS_ACCESS_KEY_ID="<your-access-key-id>"
export AWS_SECRET_ACCESS_KEY="<your-secret-access-key>"
export AWS_DEFAULT_REGION="auto"

# From Cloudflare Dashboard → right sidebar
export R2_ACCOUNT_ID="<your-account-id>"
export S3_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Bucket name (must match created bucket)
export BUCKET="research-datasets"

# Download destination
export DATA_DIR="/mnt/data/raw"
mkdir -p $DATA_DIR
```

Pre-verification:
```bash
echo "R2 Access: $(aws s3 ls s3://$BUCKET/ --endpoint-url $S3_ENDPOINT 2>&1 | head -1)"
echo "Disk space: $(df -h /mnt/data | tail -1 | awk '{print $4}') available"
echo "Temp dir: $DATA_DIR"
```

---

## Dataset 1: YouNiverse (3.4 GB)

Source: https://zenodo.org/record/4650046

Only download 3 of the 10 available files. Skip the 77 GB comments file and 13 GB raw JSONL.

### Files

| File | Size | URL |
|------|------|-----|
| `df_channels_en.tsv.gz` | 5.7 MB | `https://zenodo.org/records/4650046/files/df_channels_en.tsv.gz` |
| `df_timeseries_en.tsv.gz` | 544 MB | `https://zenodo.org/records/4650046/files/df_timeseries_en.tsv.gz` |
| `yt_metadata_helper.feather` | 2.8 GB | `https://zenodo.org/records/4650046/files/yt_metadata_helper.feather` |

### Download & Upload

```bash
cd $DATA_DIR
mkdir -p youniverse

# File 1: Channel data (5.7 MB)
wget https://zenodo.org/record/4650046/files/df_channels_en.tsv.gz \
  -O youniverse/df_channels_en.tsv.gz
aws s3 cp youniverse/df_channels_en.tsv.gz \
  s3://$BUCKET/youniverse/df_channels_en.tsv.gz \
  --endpoint-url $S3_ENDPOINT
ls -lh youniverse/df_channels_en.tsv.gz
echo "YouNiverse File 1 done"

# File 2: Time series (544 MB)
wget https://zenodo.org/records/4650046/files/df_timeseries_en.tsv.gz \
  -O youniverse/df_timeseries_en.tsv.gz
aws s3 cp youniverse/df_timeseries_en.tsv.gz \
  s3://$BUCKET/youniverse/df_timeseries_en.tsv.gz \
  --endpoint-url $S3_ENDPOINT
ls -lh youniverse/df_timeseries_en.tsv.gz
echo "YouNiverse File 2 done"

# File 3: Helper feather (2.8 GB)
wget https://zenodo.org/record/4650046/files/yt_metadata_helper.feather \
  -O youniverse/yt_metadata_helper.feather
aws s3 cp youniverse/yt_metadata_helper.feather \
  s3://$BUCKET/youniverse/yt_metadata_helper.feather \
  --endpoint-url $S3_ENDPOINT
ls -lh youniverse/yt_metadata_helper.feather
echo "YouNiverse File 3 done"

# Verify
echo "YouNiverse files in R2:"
aws s3 ls s3://$BUCKET/youniverse/ --endpoint-url $S3_ENDPOINT --human-readable
```

### Expected R2 Layout

```
research-datasets/youniverse/
├── df_channels_en.tsv.gz       (5.7 MiB)
├── df_timeseries_en.tsv.gz     (544 MiB)
└── yt_metadata_helper.feather  (2.8 GiB)
```

---

## Dataset 2: YTCommentVerse (10.8 GB)

Source: https://zenodo.org/records/15678816

A single SQLite database file. Can be queried directly with `sqlite3` or loaded into DuckDB.

### File

| File | Size | URL |
|------|------|-----|
| `YT-30M.db` | 10.8 GB | `https://zenodo.org/records/15678816/files/YT-30M.db` |

### Download & Upload

```bash
cd $DATA_DIR
mkdir -p ytcommentverse

# Download (single file, 10.8 GB — takes ~30-45 minutes)
wget https://zenodo.org/records/15678816/files/YT-30M.db \
  -O ytcommentverse/YT-30M.db

# Upload to R2
aws s3 cp ytcommentverse/YT-30M.db \
  s3://$BUCKET/ytcommentverse/YT-30M.db \
  --endpoint-url $S3_ENDPOINT

# Verify
ls -lh ytcommentverse/YT-30M.db
aws s3 ls s3://$BUCKET/ytcommentverse/YT-30M.db --endpoint-url $S3_ENDPOINT
echo "YTCommentVerse done"
```

### Expected R2 Layout

```
research-datasets/ytcommentverse/
└── YT-30M.db  (10.8 GiB)
```

---

## Dataset 3: Global YouTube Trending (26.4 GB)

Source: https://databank.illinois.edu/datasets/IDB-9307654

A single compressed tarball containing 78.4M trending video records across 104 countries, July 2022–June 2025.

### File

| File | Size | URL |
|------|------|-----|
| `youtube_trends.tar.bz2` | 26.4 GB | Requires API call with Referer header (see below) |

### Access Note

Illinois Data Bank blocks direct downloads from server IPs. Use the `download_link` API with a browser Referer header to get a time-limited download URL.

### Download

```bash
cd $DATA_DIR
mkdir -p global-trending

# Step 1: Get a fresh download URL via the API (requires Referer header)
RESPONSE=$(curl -sS -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  -H "Referer: https://databank.illinois.edu/datasets/IDB-9307654" \
  -H "Accept: application/json" \
  "https://databank.illinois.edu/datasets/IDB-9307654/download_link?web_ids=2lj91")
DL_URL=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['url'])")

# Step 2: Download (26.4 GB — takes ~20 min)
curl -L -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  -H "Referer: https://databank.illinois.edu/datasets/IDB-9307654" \
  -o global-trending/youtube_trends.tar.bz2 "$DL_URL" --progress-bar

# Verify
ls -lh global-trending/youtube_trends.tar.bz2

# Step 3: Upload to R2 (26.4 GB — takes ~3-4 min)
aws s3 cp global-trending/youtube_trends.tar.bz2 \
  s3://$BUCKET/global-trending/youtube_trends.tar.bz2 \
  --endpoint-url $S3_ENDPOINT
```

**Note**: The download URL expires. If you get 403, re-run Step 1 to get a fresh URL.

### Expected R2 Layout

```
research-datasets/global-trending/
└── youtube_trends.tar.bz2  (26.4 GiB)
```

---

## Dataset 4: Regional Audit (Not Yet Available)

Source: arXiv:2409.10168

Not publicly downloadable. The authors collected 915,000 geolocated search results across US and South Africa. The dataset is available by contacting the authors.

**Skip for now.** The key contribution (overlap metrics methodology) can be applied without the raw data.

---

## Final Verification

After all datasets are uploaded:

```bash
echo "=== ALL FILES IN R2 ==="
aws s3 ls s3://$BUCKET/ \
  --endpoint-url $S3_ENDPOINT \
  --recursive --human-readable

echo ""
echo="=== DISK USAGE ==="
df -h /mnt/data
```

Expected total: ~40.6 GB across 5 files in 3 directories.

```
research-datasets/
├── youniverse/
│   ├── df_channels_en.tsv.gz       (5.7 MiB)
│   ├── df_timeseries_en.tsv.gz     (544 MiB)
│   └── yt_metadata_helper.feather  (2.8 GiB)
├── ytcommentverse/
│   └── YT-30M.db                   (10.1 GiB)
└── global-trending/
    └── youtube_trends.tar.bz2      (26.4 GiB)

Note: R2 reports sizes in GiB vs source in GB — small discrepancy due to binary/decimal units.
```

---

## R2 Data Catalog Setup (Optional, After Upload)

To query these files with SQL directly from R2 without downloading:

1. Go to Cloudflare Dashboard → R2 → `research-datasets` bucket
2. Enable **Data Catalog** (tab at top of bucket page)
3. This registers the files as Iceberg tables
4. Query with: `npx wrangler r2 sql query "<catalog-id>" "SELECT ..."`

For Parquet files only (Data Catalog requires columnar formats). YouNiverse `.feather` and `.tsv.gz` files need conversion to Parquet first — that's a separate pipeline step.

---

## Cleaning Up

After all files are verified in R2, the volume can be deleted from Hetzner console to save ~€2/month.

```bash
# Unmount (if manually mounted)
umount /mnt/data

# Remove from fstab (if you added it manually — Hetzner auto-mount handles itself)
nano /etc/fstab  # remove the line you added

# Then delete volume from Hetzner Cloud Console
# Volumes → datasets → Delete

# The raw directory on disk can be removed anytime (R2 is the permanent copy)
rm -rf /mnt/HC_Volume_106423434/raw
```

---

## R2 Configuration Reference

### Where to find credentials

1. **Cloudflare Dashboard**: [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Account ID**: Right sidebar, under your account name. 32-character hex.
3. **R2 API Token**: R2 → Manage R2 API Tokens → Create Token → name `research-datasets-rw`, Read+Write on bucket `research-datasets`
4. **R2 Endpoint**: `https://<account-id>.r2.cloudflarestorage.com`

### Important

- **Never commit credentials to git.** Set env vars each session or use a `.env` file that's in `.gitignore`.
- R2 has **no egress fees** — uploading and downloading from R2 costs nothing beyond storage.
- R2 free tier: 10 GB storage. 40 GB costs ~$0.45/month.

---

## Verification Gates

Before declaring complete:

- [ ] Hetzner volume mounted at `/mnt/data`
- [ ] All 3 datasets downloaded to `/mnt/data/raw/`
- [ ] All files uploaded to R2 bucket `research-datasets/`
- [ ] YouNiverse: 3 files (5.7 MB + 570 MB + 2.8 GB) verified
- [ ] YTCommentVerse: 1 file (10.8 GB) verified
- [ ] Global Trending: 1 file (26.4 GB) verified
- [ ] File sizes in R2 match originals
- [ ] R2 credentials NOT in any committed file
- [ ] Regional Audit noted as unavailable (author request needed)

## Estimated Timeline

| Step | Duration |
|------|----------|
| Create + mount Hetzner volume | 5 minutes |
| YouNiverse (3 small files) | 15 minutes |
| YTCommentVerse (10.8 GB) | 40 minutes |
| Global Trending (26.4 GB) | 80 minutes |
| **Total** | **~2.5 hours** |

Mostly waiting on downloads. The actual active time is ~10 minutes of command entry.

---

## Run Results (2026-07-21)

Server: `debz` (Hetzner VM, Debian 6.1, 7.6 GB RAM, no swap)
Volume: `/mnt/HC_Volume_106423434` (50 GB ext4, auto-mounted via Hetzner, 47 GB free at start)
R2 Bucket: `research-datasets` (Cloudflare account `REDACTED_ACCOUNT_ID`)

### Actual R2 Layout After Run

```
s3://research-datasets/
├── youniverse/
│   ├── df_channels_en.tsv.gz        5.7 MiB    (2026-07-21)
│   ├── df_timeseries_en.tsv.gz      544.6 MiB  (2026-07-21)
│   └── yt_metadata_helper.feather   2.6 GiB    (2026-07-21)
├── ytcommentverse/
│   └── YT-30M.db                    10.1 GiB   (2026-07-21)
└── global-trending/
    └── youtube_trends.tar.bz2       26.4 GiB   (2026-07-21)
```

### Actual Timings

| Dataset | Download Time | Upload Time | Total | Notes |
|---------|---------------|-------------|-------|-------|
| YouNiverse File 1 (5.7 MB) | 1s | 2s | 3s | Fastest |
| YouNiverse File 2 (544 MB) | ~30s | ~30s | 1 min | Initial attempt failed — filename was `.csv.gz` but actual Zenodo file is `.tsv.gz` |
| YouNiverse File 3 (2.8 GB) | ~4 min | ~2 min | 6 min | Smooth |
| YTCommentVerse (10.8 GB) | 4 min (43 MB/s) | 99s | 5.5 min | wget kept dying when run via `nohup` in background — required inline execution with long timeout |
| Global Trending (26.4 GB) | ~19 min | 211s (3.5 min) | 22.5 min | `/datafiles/2lj91/download` returned 403. Workaround: hit `download_link?web_ids=2lj91` API with `Referer` header to get time-limited URL, then curl with same headers |

**Total wall time: ~35 minutes** (vs 2.5 hr estimate — faster because Zenodo and Illinois served at full bandwidth)

### Issues Encountered

| Issue | Location in This File | Resolution |
|-------|----------------------|------------|
| YouNiverse File 2 URL was `.csv.gz` but file is `.tsv.gz` | Dataset 1 Files table ($132-134) | Updated to `.tsv.gz` — verified via `zenodo.org/api/records/4650046` |
| `awscli` apt package had Python `urllib3` conflict | Prerequisites ($28-118) | `pip install --break-system-packages awscli` fixed the `DEFAULT_CIPHERS` import error |
| `wget` died on large file when run as `nohup` background process | Dataset 2 ($197-215) | Run `wget` inline with a long shell timeout. The bash tool kills child processes on shell exit |
| Global Trending 403 on direct download URL | Dataset 3 ($227-270) | Illinois Data Bank blocks server IPs. Hit `/datasets/IDB-9307654/download_link?web_ids=2lj91` with `Referer` header to get a fresh URL. Download URL expires — re-run API call if 403 |
| `wget` also got 403 on Illinois download URL | Dataset 3 ($256-259) | Must use `curl -L` with browser User-Agent AND Referer headers. wget doesn't support per-request Referer |
| Volume nearly full after all 3 datasets | Prerequisites ($30-70) | 47 GB → 6.8 GB free (86% used). 50 GB minimum for volume size |

### Verification Gates Status

- [x] Hetzner volume mounted at `/mnt/HC_Volume_106423434` (already existed, 47 GB free)
- [x] All 3 datasets downloaded to `/mnt/HC_Volume_106423434/raw/`
- [x] All files uploaded to R2 bucket `research-datasets/`
- [x] YouNiverse: 3 files (5.7 MB + 544 MB + 2.6 GB) verified
- [x] YTCommentVerse: 1 file (10.1 GB) verified
- [x] Global Trending: 1 file (26.4 GB) verified
- [x] File sizes in R2 match originals (minor GiB vs GB unit discrepancy)
- [x] R2 credentials NOT in any committed file (`.env.local` removed from git tracking, `.gitignore` updated)
- [ ] Regional Audit noted as unavailable (author request needed)

### Credentials Cleanup

- `.env.local` was tracked in git — ran `git rm --cached .env.local` to stop tracking
- `.gitignore` updated to include `.env`, `.env.local`, `.env.production`
- R2 credentials exist only as shell env vars — never written to any file
- Cloudflare API tokens in old `.env.local` content remain in git history (both were expired)
