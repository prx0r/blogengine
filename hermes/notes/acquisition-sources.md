# Acquisition Sources — What Works, What Doesn't, What's Next

## Currently Active Sources

| Source | API | Auth | Direct PDF? | Reliability | Notes |
|---|---|---|---|---|---|
| **HAL** | `api.archives-ouvertes.fr/search/` | None | ✅ yes (`fileMain_s`) | High | French/European humanities. Filter `submitType_s:file` |
| **Zenodo** | `zenodo.org/api/records` | None | ✅ yes (`files[].links.self`) | High | Recent deposits, datasets. Rate: 25/100 per page |
| **DOAJ** | `doaj.org/api/search/articles` | None | 🔗 landing page URL | Medium | Directory of Open Access Journals. Philosophy section |
| **Citation Chain** | OpenAlex `works/{id}/referenced_works` | Rate-limited | 🔗 depends on source | Medium | Follows references from papers we already have |
| **Internet Archive** | `archive.org/advancedsearch.php` | None | ✅ yes (`_djvu.txt`, PDF) | Medium | Older/public-domain. Check rights before download |

## Sources Not Yet Active (Potential)

| Source | API | Why It Would Help | Blockers |
|---|---|---|---|
| **CrossRef** | `api.crossref.org` | DOI resolution, metadata normalization | Already used in acquisition script for title→DOI |
| **Semantic Scholar** | `api.semanticscholar.org/graph/v1` | OA PDF URLs, citation graph | Returned empty in tests — may need different endpoint |
| **arXiv** | `export.arxiv.org/api/query` | Preprints, some philosophy of mind | Mostly STEM. Limited philosophy content |
| **CORE** | `api.core.ac.uk/v3/search/works` | Full-text from institutional repositories | Needs API key. Free tier available |
| **Unpaywall** | `api.unpaywall.org/v2/{doi}` | Best legal OA copy from DOI | Needs email (we have: tradesprior@gmail.com) |
| **OpenLibrary** | `openlibrary.org/api/books` | Older philosophical texts | Not scholarly commentaries |
| **JSTOR** | REST API | Extensive humanities journal archive | Needs institutional access or API key |
| **PhilPapers** | philpapers.org/api | Philosophy specialist database | Cloudflare blocks VPS. Use `web_search` instead |

## How the Engine Guarantees New Related Papers

### Mechanism 1: Author Loop
```
25 authors → cycle continuously → search HAL + Zenodo + DOAJ for each
Different sources return different results each time
New papers published daily → eventually show up
```

### Mechanism 2: Citation Chaining
```
Every 4th run: pick a seed paper from our library
  → get its OpenAlex ID
  → fetch its references
  → check first 3 for OA
  → download if available
  
Seeds accumulate: every paper we acquire gets saved as a future seed
50 seed limit (keeps the pool focused on recent/relevant papers)
```

### Why It Doesn't Find the Same Papers Twice
```
Before downloading: check if work_id already exists in content/works/
work_id = md5hash of title → deterministic → same title = same ID → skip
```

### Why It Expands in the Right Direction
```
Author search: picks from our curated list of relevant authors
Citation chain: follows references from papers we ALREADY like
              → their references are naturally about similar topics
              → expands the corpus in the same scholarly tradition
```

## Acquisition Strategy

```
Phase 1 (current): Broad author search → HAL/Zenodo/DOAJ → download OA
Phase 2 (next):     Citation chaining from seeds → expand through references
Phase 3 (future):   Citation chaining FROM cited papers → depth-first expansion
Phase 4 (future):   Web search for author names → discover new seeds → repeat
```

## Rate Limit Management

| Source | Limit | Recovery |
|---|---|---|
| OpenAlex (no key) | ~10 req/min | 60s wait |
| OpenAlex (with key) | $1/day free (~100k req) | Needs API key registration |
| HAL | No apparent limit | All good |
| Zenodo | 25/min (anon) | Brief pause |
| DOAJ | No apparent limit | All good |
| Semantic Scholar | 1 req/sec (with key) | Needs API key |

## DOAJ Integration (Just Added)

DOAJ is the best new source for philosophy OA articles:
- Specifically open access
- Philosophy section with proper classification
- No API key needed
- Returns real results for "imaginal", "henry corbin", "suhrawardi"
- Landing page URL can be checked for direct PDF link
