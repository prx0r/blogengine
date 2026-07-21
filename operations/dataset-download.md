# Dataset Download to R2 — Operations Spec

## Objective

Download the YouNiverse subset needed for breakout metric validation from Zenodo, upload to Cloudflare R2, and verify.

## Files to Download (sorted by priority)

| Priority | File | Size | Purpose |
|----------|------|------|---------|
| 1 | `df_channels_en.tsv.gz` | 10 MB | Channel metadata: subs, videos, category, rank |
| 2 | `df_timeseries_en.csv.gz` | 570 MB | Weekly channel stats: views, subs, activity |
| 3 | `yt_metadata_helper.feather` | 2.8 GB | Video metadata: title, duration, view/like/dislike |
| Skip | `youtube_comments.tsv.gz` | 77 GB | Not needed (YTCommentVerse covers this) |
| Skip | `yt_metadata_en.jsonl.gz` | 13.6 GB | Not needed (helper file has enough) |
| Skip | `_raw_*` files | ~15 GB | Raw unfiltered versions, not needed |

## System Constraints

- Hetzner server: 75 GB total, 61 GB used, ~11 GB free
- Download one file at a time → upload to R2 → delete local → next file
- Each file fits individually in 11 GB free space

## Step-by-Step Commands

### Prerequisites

```bash
# Install AWS CLI if not present
apt-get update && apt-get install -y awscli

# Configure R2 S3-compatible endpoint
export AWS_ACCESS_KEY_ID="<r2-access-key-id>"
export AWS_SECRET_ACCESS_KEY="<r2-secret-access-key>"
export AWS_DEFAULT_REGION="auto"
export S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
export BUCKET="research-datasets"
```

### File 1: Channel Data (10 MB)

```bash
cd /tmp
wget https://zenodo.org/record/4650046/files/df_channels_en.tsv.gz
aws s3 cp df_channels_en.tsv.gz s3://$BUCKET/youniverse/df_channels_en.tsv.gz \
  --endpoint-url $S3_ENDPOINT
rm df_channels_en.tsv.gz
echo "File 1 done"
```

### File 2: Time Series (570 MB)

```bash
cd /tmp
wget https://zenodo.org/record/4650046/files/df_timeseries_en.csv.gz
aws s3 cp df_timeseries_en.csv.gz s3://$BUCKET/youniverse/df_timeseries_en.csv.gz \
  --endpoint-url $S3_ENDPOINT
rm df_timeseries_en.csv.gz
echo "File 2 done"
```

### File 3: Helper Feather (2.8 GB)

```bash
cd /tmp
wget https://zenodo.org/record/4650046/files/yt_metadata_helper.feather
aws s3 cp yt_metadata_helper.feather s3://$BUCKET/youniverse/yt_metadata_helper.feather \
  --endpoint-url $S3_ENDPOINT
rm yt_metadata_helper.feather
echo "File 3 done"
```

### Verification

```bash
# List all uploaded files with sizes
aws s3 ls s3://$BUCKET/youniverse/ --endpoint-url $S3_ENDPOINT --recursive --human-readable

# Expected output:
# 10 MB  youniverse/df_channels_en.tsv.gz
# 570 MB youniverse/df_timeseries_en.csv.gz
# 2.8 GB youniverse/yt_metadata_helper.feather
```

## R2 Bucket Structure After Upload

```
research-datasets/
└── youniverse/
    ├── df_channels_en.tsv.gz
    ├── df_timeseries_en.csv.gz
    └── yt_metadata_helper.feather
```

## Estimated Time

- File 1: ~30 seconds download + ~5 seconds upload + delete
- File 2: ~2 minutes download + ~30 seconds upload + delete
- File 3: ~8 minutes download + ~2 minutes upload + delete
- **Total: ~13 minutes**

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `wget` fails | Check Zenodo URL. Try `curl -L` instead. |
| `aws s3 cp` fails | Verify R2 credentials and endpoint URL. Bucket must exist. |
| Disk full during download | Check `df -h /`. Delete `/tmp` files with `rm -rf /tmp/*` |
| Slow download | Expected. Files are on Zenodo (Europe). |
| Checksum mismatch | Re-download. Zenodo provides MD5 in API response. |

## Next Steps After Download

1. Convert helper feather to Parquet for R2 SQL compatibility
2. Load into DuckDB via R2 Data Catalog
3. Run breakout metric validation (see `pipelines/youniverse/README.md`)

## Output file: `operations/dataset-download.md`
