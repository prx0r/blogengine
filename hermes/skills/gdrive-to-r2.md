# GDrive-to-R2

Download files from Google Drive links to R2 storage.

## Usage

```
/gdrive-to-r2 <google-drive-url> [r2-path]
```

## Examples

```
/gdrive-to-r2 https://drive.google.com/file/d/1abc123/view
  → Downloads to s3://research-datasets/blueprint/gdrive-imports/{filename}

/gdrive-to-r2 https://drive.google.com/file/d/1abc123/view tantraloka/drafts
  → Downloads to s3://research-datasets/blueprint/gdrive-imports/tantraloka/drafts/{filename}
```

## Implementation

```bash
# Install gdown if needed
pip install gdown 2>/dev/null

# Extract file ID from URL
FILE_ID=$(echo "$URL" | sed -n 's/.*\/d\/\([^/]*\).*/\1/p')
FILENAME=$(gdown "$FILE_ID" --fuzzy 2>&1 | grep "To:" | sed 's/.*To: //')

# Upload to R2
aws s3 cp "$FILENAME" "s3://research-datasets/blueprint/gdrive-imports/$R2_PATH/" \
  --endpoint-url $S3_ENDPOINT

# Clean up
rm "$FILENAME"
```

## Notes

- Works with any publicly shared Google Drive file
- Large files (>100 MB) may take time — runs in background
- Files land in `blueprint/gdrive-imports/` unless a subpath is specified
