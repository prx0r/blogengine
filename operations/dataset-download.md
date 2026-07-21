# Dataset Download to R2 — Operations Spec

## Objective

Download the YouNiverse dataset subset from Zenodo and upload to Cloudflare R2. This is the first of four research datasets needed for breakout metric validation.

## Prerequisites

### Required Accounts & Credentials

| Item | Where to Find | Notes |
|------|---------------|-------|
| **Cloudflare Account** | dash.cloudflare.com | Must have R2 enabled |
| **R2 Access Key ID** | Dashboard → R2 → Manage R2 API Tokens → Create Token | Permissions: Read+Write on `research-datasets` bucket |
| **R2 Secret Access Key** | Same page — shown once, save immediately | Store in `.env` or secrets manager, never in code |
| **R2 Endpoint URL** | Dashboard → R2 → Bucket → Connect to R2 → S3-compatible API | Format: `https://<account-id>.r2.cloudflarestorage.com` |
| **Account ID** | Dashboard → Right sidebar → Account ID | 32-character hex string |

### Hetzner Server Access

| Item | Value |
|------|-------|
| Server | `debz` (existing) |
| Free disk | ~18 GB after cache clears |
| OS | Debian |
| AWS CLI | Must be installed (`apt-get install -y awscli`) |

## Files to Download

Only the YouNiverse subset needed for breakout metric validation. Skip the 77 GB comments file and 13 GB raw metadata — YTCommentVerse covers comments better.

| Priority | File | Size | Zenodo URL | Purpose |
|----------|------|------|------------|---------|
| 1 | `df_channels_en.tsv.gz` | 10 MB | `https://zenodo.org/record/4650046/files/df_channels_en.tsv.gz` | Channel metadata: subs, videos, category, rank |
| 2 | `df_timeseries_en.csv.gz` | 570 MB | `https://zenodo.org/record/4650046/files/df_timeseries_en.csv.gz` | Weekly channel stats: views, subs, activity |
| 3 | `yt_metadata_helper.feather` | 2.8 GB | `https://zenodo.org/record/4650046/files/yt_metadata_helper.feather` | Video metadata: title, duration, view/like/dislike |

**Total: ~3.4 GB compressed. Skip all other files in the Zenodo record.**

## System Constraints

- Server has ~18 GB free after clearing `.next/` and `.open-next/` build caches
- Download one file at a time → upload to R2 → delete local copy → next file
- Each file fits individually in 18 GB free space
- Never have more than one file on disk at a time

## Step-by-Step Procedure

### 0. Install AWS CLI (if not present)

```bash
apt-get update && apt-get install -y awscli
```

### 1. Set Environment Variables

```bash
# From Cloudflare Dashboard → R2 → API Tokens
export AWS_ACCESS_KEY_ID="<r2-access-key-id>"
export AWS_SECRET_ACCESS_KEY="<r2-secret-access-key>"

# Always "auto" for R2
export AWS_DEFAULT_REGION="auto"

# From Cloudflare Dashboard → Right sidebar → Account ID
export R2_ACCOUNT_ID="<account-id>"
export S3_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Bucket name (create if doesn't exist)
export BUCKET="research-datasets"
```

**Never commit these values to git. Set them fresh each session.**

### 2. Create R2 Bucket (one-time)

```bash
aws s3api create-bucket \
  --bucket $BUCKET \
  --endpoint-url $S3_ENDPOINT
```

If it already exists, this will error harmlessly.

### 3. Download & Upload — File 1: Channel Data (10 MB)

```bash
cd /tmp

# Download from Zenodo
wget https://zenodo.org/record/4650046/files/df_channels_en.tsv.gz

# Verify size (should be ~5.7 MB)
ls -lh df_channels_en.tsv.gz

# Upload to R2
aws s3 cp df_channels_en.tsv.gz \
  s3://$BUCKET/youniverse/df_channels_en.tsv.gz \
  --endpoint-url $S3_ENDPOINT

# Verify upload
aws s3 ls s3://$BUCKET/youniverse/df_channels_en.tsv.gz \
  --endpoint-url $S3_ENDPOINT

# Delete local copy
rm df_channels_en.tsv.gz

echo "File 1 complete"
```

### 4. Download & Upload — File 2: Time Series (570 MB)

```bash
cd /tmp

wget https://zenodo.org/record/4650046/files/df_timeseries_en.csv.gz
ls -lh df_timeseries_en.csv.gz

aws s3 cp df_timeseries_en.csv.gz \
  s3://$BUCKET/youniverse/df_timeseries_en.csv.gz \
  --endpoint-url $S3_ENDPOINT

rm df_timeseries_en.csv.gz

echo "File 2 complete"
```

### 5. Download & Upload — File 3: Helper Feather (2.8 GB)

```bash
cd /tmp

# This is the largest file — will take ~8 minutes to download
wget https://zenodo.org/record/4650046/files/yt_metadata_helper.feather
ls -lh yt_metadata_helper.feather

aws s3 cp yt_metadata_helper.feather \
  s3://$BUCKET/youniverse/yt_metadata_helper.feather \
  --endpoint-url $S3_ENDPOINT

rm yt_metadata_helper.feather

echo "File 3 complete"
```

### 6. Final Verification

```bash
# List all uploaded files with sizes
aws s3 ls s3://$BUCKET/youniverse/ \
  --endpoint-url $S3_ENDPOINT \
  --recursive --human-readable
```

Expected output:
```
5.7 MiB  youniverse/df_channels_en.tsv.gz
570 MiB  youniverse/df_timeseries_en.csv.gz
2.8 GiB  youniverse/yt_metadata_helper.feather
```

### 7. Verify Disk Space After

```bash
df -h /
```

Should show at least as much free space as before starting (files were deleted after upload).

## Expected R2 Bucket Structure

```
research-datasets/
└── youniverse/
    ├── df_channels_en.tsv.gz
    ├── df_timeseries_en.csv.gz
    └── yt_metadata_helper.feather
```

## Estimated Timeline

| Step | Duration |
|------|----------|
| Install AWS CLI | 30 seconds |
| Set env vars + create bucket | 1 minute |
| Download + upload file 1 (10 MB) | 30 seconds |
| Download + upload file 2 (570 MB) | 2.5 minutes |
| Download + upload file 3 (2.8 GB) | 10 minutes |
| Verification | 30 seconds |
| **Total** | **~15 minutes** |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `wget` fails / connection timeout | Zenodo is in Europe. Retry with `curl -L --retry 3` instead of wget |
| `aws: command not found` | Run `apt-get install -y awscli` first |
| `aws s3 cp` fails with 403 | Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Verify token has R2 write permissions |
| `aws s3 cp` fails with NoSuchBucket | Create bucket first: `aws s3api create-bucket --bucket $BUCKET --endpoint-url $S3_ENDPOINT` |
| Disk full during download | Check `df -h /`. May need to free space: `rm -rf /tmp/*` then retry |
| Slow download | Expected for large files from Europe. File 3 may take 8-10 minutes |
| File exists on R2 already | Upload will overwrite. Verify checksum if needed via Zenodo API |
| Environment variables lost | Session expired. Re-export: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `BUCKET` |

## R2 Configuration Reference

### Where to find credentials in Cloudflare Dashboard

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Account ID**: Right sidebar, under your account name. 32-character hex string.
3. **R2 API Token**: 
   - Click "R2" in left sidebar
   - Click "Manage R2 API Tokens"  
   - Click "Create API Token"
   - Name: `research-datasets-rw`
   - Permissions: Read + Write
   - Scope: Apply to specific bucket → `research-datasets`
   - Click "Create" → **Copy the Secret Access Key immediately** (shown once)
   - Access Key ID is also shown and can be retrieved later
4. **Bucket creation**: R2 → Create bucket → name `research-datasets`

### R2 S3 Endpoint Format

```
https://<account-id>.r2.cloudflarestorage.com
```

This is the `--endpoint-url` parameter for all `aws s3` commands.

## Verification Gates

Before declaring complete:

- [ ] All 3 files uploaded to R2
- [ ] File sizes match expected (5.7 MB, 570 MB, 2.8 GB)
- [ ] R2 bucket listing shows all 3 files
- [ ] Server disk space restored to pre-download level
- [ ] R2 credentials NOT in any committed file
- [ ] /tmp is clean of downloaded files

## Next Steps After Download

1. The files are now in R2, accessible via S3 API or Workers R2 binding
2. Next: Convert `yt_metadata_helper.feather` to Parquet for R2 SQL compatibility
3. Next: Set up R2 Data Catalog for DuckDB/Spark querying
4. Next: Run breakout metric validation (see `pipelines/youniverse/README.md`)
