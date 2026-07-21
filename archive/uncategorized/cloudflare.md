# Cloudflare Account & Credentials

## Account

```
Account ID: 954612afb5a97bb15dddcdc70176813d
```

## API Token

⚠️ **DO NOT STORE TOKENS HERE** — this file is in a git repository.
Set `CLOUDFLARE_API_TOKEN` as an environment variable instead:
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

## R2 (S3-compatible)

```
Access Key ID:     1d1b45c9c4c8ef8c9581a03164ad44b3
Secret Access Key: fb3603a48c47650abaa287bfb6bfad843f05b2f8775d08df66785bd3385982cf
S3 API Endpoint:   https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com
```

### Example Usage

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/954612afb5a97bb15dddcdc70176813d/tokens/verify" \
  -H "Authorization: Bearer cfat_vrWKpKmq95LWSi0cwxoJWGZvZczwBvCqorUv4cmAa7224a63"
```
