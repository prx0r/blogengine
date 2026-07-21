# Tier 2 Extraction Notes

## Iteration History

### Iteration 1: OpenAlex batch (46 queries, ~4 min)
- Hit 429 rate limit at ~40 queries
- 59 Tier 2 works cataloged
- Problems: mostly paywalled results (Brill, T&F, Sage, Springer)
- Lesson: OpenAlex returns too many paywalled results, wastes time

### Iteration 2: Cron every 5 min via Hermes no-agent script
- Cron `no_agent` mode doesn't fire reliably — gateway issue
- Switched to system crontab instead

### Iteration 3: Direct-source (HAL → Zenodo → IA)
- No API keys needed
- HAL: direct PDF URLs with `submitType_s:file` filter
- Zenodo: direct file downloads
- Problem: HAL queries weren't finding matches (author+topic pairs too specific)

### Iteration 4: Continuous back-to-back loop
- No cron interval — one finishes, next starts immediately
- 2s pause between API calls to be polite
- OpenAlex → when rate limited → HAL/Zenodo → retry OpenAlex after 5 rounds

### Iteration 5: Author names only (simplest)
- Just search author name (e.g. "Ibn Arabi"), repos return relevant papers
- No topic pairs needed
- Current approach

## Current Architecture

```
Continuous Python script (PID running via nohup)
  │
  ├── OpenAlex (primary — best coverage)
  │   └── When 429 rate limit → direct sources for 5 rounds → retry OA
  │
  ├── HAL (fallback — direct PDFs, no auth)
  │   └── api.archives-ouvertes.fr with submitType_s:file filter
  │
  └── Zenodo (fallback — direct downloads, no auth)
      └── zenodo.org/api/records
```

Each run: pick author → search OpenAlex → if OA, download → if paywalled, stub → repeat.

## What Works

| Source | Direct PDF? | Auth | Reliability |
|---|---|---|---|
| OpenAlex (OA filter) | Sometimes (handle/redirect) | Rate-limited without key | Good when not rate-limited |
| HAL | ✅ Yes (fileMain_s) | None | Good for French/European |
| Zenodo | ✅ Yes (files[].links.self) | None | Good for recent deposits |

## What's Paywalled (Skip)

- Brill (Proclus, Iamblichus, Plotinus) — all closed
- Taylor & Francis (Renaissance) — all closed
- Sage (Corbin papers) — all closed
- University of Chicago Press — all closed
- Springer book chapters — all closed
- Equinox (Buddhist studies) — all closed

## What's IP-Blocked (Flag for User Download)

- MDPI — gold OA but Cloudflare blocks VPS
- Some university repositories (Iris, Kingston) — 403
- SciSpace — 403

## Future: Citation Chaining

From a seed paper, follow its references to find related works:
1. Get OpenAlex ID of a good paper we already have
2. GET /works/{id} → referenced_works[] (papers it cites)
3. GET /works?filter=cites:{id} (papers that cite it)
4. For each reference, check if OA, acquire if so

This naturally expands the corpus in the right direction — if we have a paper on Corbin's imaginal, its references will be other papers about Corbin or the imaginal.

## Future: Prioritization

Not yet implemented. Ideas:
- Seminal works first: most-cited papers in each author's corpus
- Then depth: papers that cite the seminal works
- Then breadth: move to next author when coverage is substantial (10+ works)
- Track per-author acquisition count and signal when to move on
