---
name: cron-acquire
description: Tier 2 acquisition — search OpenAlex for commentaries on core authors, download OA, catalog
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [acquisition, openalex, tier2, cron]
    requires_tools: [terminal]
---

# Tier 2 Acquisition

Searches OpenAlex for scholarly commentaries on core authors in the imaginal-ritual-daimonic tradition.
Downloads OA copies, catalogs as work JSONs with tier=2.

A cron job (`tier2-sweep`) runs this every 5 minutes automatically via the bash script at
`~/.hermes/scripts/cron-acquire.sh`. You can also trigger it manually.

## Manual Invocation

```
/continue tier 2 extraction
```

Or run the script directly:
```bash
cd /root/projects/blog && bash ~/.hermes/scripts/cron-acquire.sh
```

## What the cron script does

Each run picks a random author + topic from the pool and searches OpenAlex:

Authors: Henry Corbin, Marsilio Ficino, Ibn Arabi, Suhrawardi, Iamblichus,
Proclus, C.G. Jung, James Hillman, Plotinus, Plato

Topics: imaginal, mundus imaginalis, daimon, theurgy, angelology, barzakh,
ishraq, active imagination, soul making, ritual, divine symbols, participation,
eros, papanca

For each result:
1. Checks if already in content/works/
2. If OA, downloads via acquisition script
3. If paywalled, creates stub record with access_status
4. Logs to /root/.hermes/cron/cron-acquire.log

## Results

To check progress:
```bash
# Count Tier 2 works
grep -r '"tier": 2' content/works/ | wc -l

# Recent acquisitions
tail -20 /root/.hermes/cron/cron-acquire.log

# All works
ls content/works/work_*.json | wc -l
```

## Run Notes (2026-07-11)

First batch run: 46 queries across all core authors in ~4 minutes.
- Hit OpenAlex rate limit (429) after ~40 queries
- 59 Tier 2 works in library (was 53)
- Downloaded: ~10 new OA papers
- Stubs created for paywalled: ~25
- Most paywalled: Proclus, Plotinus, Iamblichus (Brill/T&F publishers)
- Best OA sources: Taylor & Francis, MDPI, university repositories
- Rate limit resets after ~1 minute

The cron script distributes queries across authors so rate limits are hit less often.
