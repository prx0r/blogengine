# Cloudflare Reference Docs

Fetched from the official Cloudflare llms.txt index. These are the complete documentation sets for the Cloudflare products used in this pipeline.

## Files

| File | Source | Covers |
|------|--------|--------|
| `cloudflare-full.txt` | [llms-full.txt](https://developers.cloudflare.com/llms-full.txt) | Complete Cloudflare documentation index (57MB, all products) |
| `r2-llms.txt` | [r2/llms.txt](https://developers.cloudflare.com/r2/llms.txt) | R2 object storage: buckets, objects, S3 API, Data Catalog, pricing |
| `d1-llms.txt` | [d1/llms.txt](https://developers.cloudflare.com/d1/llms.txt) | D1 SQL database: queries, limits, migrations, bindings |
| `r2-sql-llms.txt` | [r2-sql/llms.txt](https://developers.cloudflare.com/r2-sql/llms.txt) | R2 SQL: serverless query engine for Iceberg tables in R2 |
| `workers-llms.txt` | [workers/llms.txt](https://developers.cloudflare.com/workers/llms.txt) | Workers: runtime, limits, bindings, cron triggers |

## Key Architecture Notes

**R2 + Data Catalog + R2 SQL** is the stack for dataset hosting:
- Upload raw files to R2 (Standard storage, $0.015/GB/month)
- Enable Data Catalog to register Iceberg tables
- Query with `wrangler r2 sql query` or DuckDB connected to the catalog
- No separate database needed — query in-place against R2 objects

**D1** is for the feature store and small processed outputs (the breakout scores, gap maps, etc. — not raw datasets).

## See Also

- YouTube API docs: `docs/api-ref/`
- Pipeline specs: `pipelines/`
