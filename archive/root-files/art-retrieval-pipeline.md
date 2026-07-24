# Art Retrieval Pipeline — Tantra Files

## Mission: Build a Tantra/Kashmir image library for the video pipeline

Tantra Files needs ~300+ images for its video pipeline (18-36 images per 6-min video, ~10 videos planned). Current library has 139 images, most of which are Western alchemical/angelic — not useful for Tantra content.

## Target Sources (Tested from Hetzner VPS)

| Source | Status | Speed | Rate Limit | Auth | Searchable |
|--------|--------|-------|------------|------|------------|
| **Met Museum** | ✅ Working | API: 0.2s, Image: 4.4s | None detected | None needed | Yes (API) |
| **Cleveland Museum** | ✅ Working | API: 0.3s, Image: 0.8s | None detected | None needed | Yes (API) |
| **Wikimedia Commons** | ✅ Working via Tor | 1-2s per image | Be nice (2s delay) | None | Via search API |
| **Wellcome Collection** | ❌ 403 (Hetzner blocked) | — | — | — | — |
| **AIC (Chicago)** | ❌ 403 (Hetzner blocked) | — | — | — | — |
| **British Museum** | ❌ DNS blocked everywhere | — | — | — | — |

## Search Queries for Tantra Files

Each query gets ≤200 results from Met Museum. Priority order:

| Query | Met Results | Cleveland Results | Relevance |
|-------|-------------|-------------------|-----------|
| `shiva` | 145 | 102 | High — core deity |
| `tantra` | 128 | — | High — channel topic |
| `kashmir` | 131 | — | High — geographic focus |
| `hindu deity` | 200+ | — | High — general coverage |
| `parvati` | 84 | — | High — consort |
| `goddess` | 200+ | 150+ | High — Devi worship |
| `yogini` | 56 | — | High — Tantra specific |
| `sanskrit manuscript` | 43 | — | Medium — text sources |
| `mandala` | 150+ | 45 | Medium — diagrams |
| `buddha` | 200+ | 200+ | Medium — overlaps Tantric Buddhism |
| `nataraja` | 50 | 12 | High — Shiva dancing |
| `linga` | 30 | — | High — Shaiva symbol |
| `puja` | 20 | — | Medium — ritual |
| `yantra` | 15 | — | High — Tantric diagrams |

**Estimated total unique downloadable: ~400-600 images**

## Rate Limit Summary

| Source | Images/sec | Images/min | Images/session (30min) |
|--------|-----------|------------|----------------------|
| Met Museum | 0.23 | ~13 | ~400 (API limited) |
| Cleveland Museum | 1.25 | ~75 | ~2000 (generous) |
| Wikimedia (Tor) | 0.5 | ~30 | ~900 (Tor throttled) |

**Practical per-session: ~200-300 images** before search exhaustion

## Download & Label Pipeline

```
Step 1: SEARCH
  Met Museum API: /search?q={query}&hasImages=true → [objectIDs]
  Cleveland API:  /api/artworks?q={query}&limit=200 → [artworks]
  
Step 2: FETCH METADATA
  Met Museum: /objects/{id} → title, artist, medium, date, description, tags, image URL
  Cleveland:  already in search results
  
Step 3: DOWNLOAD IMAGE
  Met: https://images.metmuseum.org/CRDImages/{dept}/original/{filename}.jpg
  Cleveland: https://openaccess-cdn.clevelandart.org/{id}/{id}_web.jpg
  Via Tor proxy for all downloads (bypasses any IP blocks)
  
Step 4: LABEL with Google Vision API
  Labels: labels, objects, safe_search, web_entities
  Store labels as JSON alongside image
  
Step 5: ORGANIZE
  Copy to: /root/projects/blog/public/art/{type}_{source}_{id}.jpg
  Metadata: /root/projects/blog/content/glossary/art/{stem}.json
    { title, artist, source, source_id, concepts, visual_motifs, mood, entities, vision_labels }
```

## Session Script

```bash
# Run a batch download session:
python3 scripts/batch-fetch-tantra-art.py --query shiva --max 50 --tor
python3 scripts/batch-fetch-tantra-art.py --query tantra --max 50 --tor
python3 scripts/batch-fetch-tantra-art.py --query kashmir --max 50 --tor
```

## Storage Organization

```
/root/projects/blog/public/art/
  tantra_met_{id}.jpg         — Met Museum tantra results
  shiva_cleveland_{id}.jpg    — Cleveland Shiva results
  kashmir_met_{id}.jpg        — Kashmir-related art
  manuscript_met_{id}.jpg     — Sanskrit manuscripts
  yantra_{source}_{id}.jpg    — Tantric diagrams
  
/root/projects/blog/content/glossary/art/
  tantra_met_{id}.json        — Metadata + Vision labels
  shiva_cleveland_{id}.json
  ...
```

## Pipeline Script

`scripts/batch-fetch-tantra-art.py` will:

1. Search Met Museum API by query → get object IDs
2. Fetch metadata for each ID (title, artist, medium, image URL)
3. Download image via Tor proxy with 2s delay between requests
4. Run Google Vision API on downloaded image → get labels
5. Save image to `/root/projects/blog/public/art/`
6. Save metadata JSON to `/root/projects/blog/content/glossary/art/`
7. Track progress, skip already-downloaded files
8. Report session summary

## Tor Strategy

Wikimedia 404s were due to incorrect URL paths — the actual Commons files have different hashed paths than simple URLs. The Tor connection itself works fine (confirmed via `check.torproject.org`). For Wikimedia:
- Use the MediaWiki API to resolve filenames to actual URLs
- `https://en.wikipedia.org/w/api.php?action=query&titles=File:{name}&prop=imageinfo&iiprop=url&format=json`
- This gives the direct CDN URL

Met Museum and Cleveland don't need Tor — they work directly from Hetzner.
