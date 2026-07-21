# Acquisition Pipeline — Running Now

**Status:** Running continuously on VPS (PID 48940).

## Strategy

### Primary: Citation Chaining (every cycle)
Picks random seed from library → follows its OpenAlex references → downloads OA PDFs with cited_by > 5. Naturally stays in the right area because seeds are already relevant.

### Secondary: OpenAlex Search (every 2nd cycle)
37 curated queries covering: Corbin, Ficino, Iamblichus, Jung, Hillman, Proclus, Shaw, Voss, Nanananda + topics (imaginal, theurgy, daimon, ritual, astrology, magic). Uses `filter=has_content.pdf:true` to find only downloadable PDFs.

### Tertiary: Free Sources (every 3rd cycle)
HAL and Zenodo for the same queries. Unlimited, no cost.

## Budget (OpenAlex)

| Resource | Usage | Limit |
|---|---|---|
| Search/filter | $0.10/1k calls | Unlimited |
| Content download | 100/day free | ~15-30/day actual |

## Tests

```
Given: seed paper in library
When: citation_chain() runs
Then: at least 1 reference should be checked for OA status

Given: query "Henry Corbin imaginal" 
When: oa_search() runs  
Then: results should contain ≥1 paper with has_content.pdf:true

Given: download budget is 0
When: dl_use() called
Then: should not download (dl_left() returns 0)
```

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| OpenAlex rate limit (429) | HTTP 429 response | Wait 60s, retry. After 3 failures, skip OpenAlex for 10 cycles |
| Content download fails (404, 403) | HTTP error on download URL | Try `best_oa_location.pdf_url` as fallback. If also fails, flag as "no accessible PDF" |
| No new papers found for 50+ cycles | Counter tracks empty cycles | Broaden search queries (they're too narrow). After 100 empty cycles, add query variants |
| API key expires or is revoked | All OpenAlex calls return 401 | Log critical error. Fall back to free sources only. Notify user. |
| Disk space full (100+ PDFs/day) | `dl_pdf` raises disk full error | Pause acquisition. Notify user. Resume when space available. |
| Citation chain returns same papers repeatedly | 90%+ of refs already in library | Pick different seed. If all seeds exhausted, rotate seed pool. |
