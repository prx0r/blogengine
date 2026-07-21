# Research Arm — Hermes Academic Pipeline

## Architecture

```
Query (concept / author / title / DOI)
  │
  ▼
1. NORMALIZE — Crossref (title → DOI, author → ORCID)
  │
  ▼
2. DISCOVER — PhilPapers (philosophical classification, citations)
  │
  ▼
3. EXPAND — OpenAlex (citation graph, authors, topics, OA locations)
  │
  ▼
4. ACQUIRE — layered full-text search:
  ├── PhilArchive (direct open full text)
  ├── CORE (theses, repository manuscripts)
  ├── HAL (French/European humanities)
  ├── Zenodo (recent deposits, datasets)
  ├── Unpaywall (preferred legal OA copy)
  ├── BASE / OAI-PMH (institutional repositories)
  └── Internet Archive (older/public domain, with rights check)
  │
  ▼
5. CLASSIFY — Friston schema (per essayprocess.md)
  │
  ▼
6. STORE — ResearchNote → journal_write(kind="research_note")
```

---

## Source Capability Classifier — Verified by Live API Tests

All capabilities below verified by calling each API with real queries (Ficino, Corbin, etc.) on 2026-07-11.

### Capability Key

| | Meaning | Example |
|:---:|---|---|
| ✅ | **Direct PDF download** via stable API URL | `GET .../document` returns PDF bytes |
| 🔗 | **URL to PDF known** but may need redirect following or rights check | `best_oa_location.pdf_url` exists but may be a handle |
| 📋 | **Metadata only** — no full-text field in response | title, authors, DOI, abstract at most |
| 🔒 | **Gated** — full text exists but requires API key / auth | Free tier may exist but must register |
| 🚫 | **Blocked / no API** — do not automate | Cloudflare bot protection or no public API |
| 🧭 | **Citation graph** — knows about relationships, not full text | references, citations, related works |

### Source-by-Source Classifier

| Source | Full Text? | Verified | Best For | Gotcha |
|---|---|---|---|---|
| **HAL** | ✅ **Direct PDF** | `fileMain_s` gives `https://.../document` — downloadable as-is | French/European humanities, theses | Filter `fq=submitType_s:file` to get only records with files |
| **Zenodo** | ✅ **Direct download** | `files[].links.self` gives `https://.../content` — downloadable | Recent deposits, datasets, conference papers | Max 100 results per page; anonymous rate-limited |
| **Internet Archive** | ✅ **Full text + PDF** | `_djvu.txt` for raw text + PDF from `/download/...` | Older/public-domain books | Must check `rights` or `access-restriction` before download |
| **OpenAlex** | 🔗 **Knows where OA is** | `best_oa_location.pdf_url` has URL (may be handle), `locations[].pdf_url` per copy | Citation graph, discovering OA locations | Not a download service — tells you WHERE the PDF is, gives the URL |
| **Unpaywall** | 🔗 **Resolves DOI→OA** | `oa_locations[].url_for_pdf` has direct PDF (esp. from repositories like PMC) | Getting the legal OA copy from a DOI | Requires real email; `best_oa_location` may lack PDF but `repository` locations often have it |
| **CORE** | 🔒 **Gated** | Public API returns `"fullText": "Not available for public API users"`, `downloadUrl: ""` | Theses, institutional manuscripts | **Requires API key** for full text. Without key: metadata-only |
| **PhilPapers** | 🚫 **Blocked by Cloudflare** | All endpoints return Cloudflare challenge page. OAI-PMH also blocked. | Philosophical categorization | **Cannot be called programmatically** from a VPS. Use web_search via Hermes web tool instead. |
| **Crossref** | 📋 **Metadata only** | Returns title, DOI, authors, year, references — no full-text field at all | DOI resolution, title→DOI normalization | Best at the START of a pipeline to get a canonical DOI |
| **BASE** | ❓ **Untested** | Search API returned no parsable JSON | Broad repository fallback | May need specific parameters |
| **Academia.edu** | 🚫 No public API | No documented API | Never automate | Manual discovery only |
| **ResearchGate** | 🚫 No public API | No documented API | Never automate | Manual discovery only |

### What Each API Actually Returns (Live Test Results)

**OpenAlex** — citation graph, returns OA locations with PDF URLs:
```json
{
  "best_oa_location": {
    "pdf_url": "http://nrs.harvard.edu/urn-3:HUL.InstRepos:3223908",
    "landing_page_url": "http://nrs.harvard.edu/urn-3:HUL.InstRepos:3223908",
    "is_oa": true,
    "version": "submittedVersion"
  },
  "locations": [
    { "pdf_url": "http://nrs.harvard.edu/urn-3:HUL.InstRepos:3223908", "is_oa": true },
    { "pdf_url": null, "landing_page_url": "https://dash.harvard.edu/bitstream/handle/1/3223908/ficinomagic.pdf?sequence=6", "is_oa": false }
  ],
  "open_access": { "is_oa": true, "oa_status": "green", "any_repository_has_fulltext": true }
}
```
Note: `best_oa_location.pdf_url` may be a handle/redirector, not a direct PDF. You may need to follow the redirect. The field IS populated when OA is available. When `is_oa: false`, `best_oa_location` is `null`.

**HAL** — direct PDF download URL confirmed:
```
GET https://api.archives-ouvertes.fr/search/?q=Henry+Corbin&fq=submitType_s:file&wt=json&fl=title_s,fileMain_s
→ fileMain_s: "https://uca.hal.science/hal-04691150/document"  ← DIRECT PDF
```
No auth needed. Filter by `submitType_s:file` to exclude metadata-only records.

**Zenodo** — direct file download confirmed:
```
GET https://zenodo.org/api/records?q=Marsilio+Ficino&size=3
→ files[0].links.self: "https://zenodo.org/api/records/3594245/files/2019Rodriguez.pdf/content"  ← DOWNLOADABLE
→ files[0].key: "2019Rodriguez.pdf"
```
No auth needed for reads. Download URL is at `files[].links.self`.

**Internet Archive** — full text and files confirmed:
```
GET https://archive.org/metadata/{identifier}
→ files[] includes:
   "format": "DjVuTXT", "name": "..._djvu.txt"  ← RAW FULL TEXT
   "format": "Image Container PDF", "name": "...pdf"  ← PDF
Download: https://archive.org/download/{identifier}/{filename}
```
Always check `rights` or `access-restriction` in metadata before downloading.

**Crossref** — metadata only, no full-text fields:
```
GET https://api.crossref.org/works/10.1177/039219219103915605
→ message.title, message.DOI, message.author, message.publisher, message.type, message.URL
→ NO abstract, NO full-text URL, NO PDF URL
```
Use Crossref to normalize a title/author into a canonical DOI. Then pass to Unpaywall or OpenAlex for OA resolution.

**Unpaywall** — resolves DOI to OA locations:
```
GET https://api.unpaywall.org/v2/10.1371/journal.pone.0308224?email=you@example.com
→ best_oa_location: { host_type: "publisher", url_for_pdf: null, url_for_landing_page: "https://doi.org/..." }
→ oa_locations: [
    { host_type: "publisher", url_for_pdf: null, ... },
    { host_type: "repository", url_for_pdf: "https://pmc.ncbi.nlm.nih.gov/articles/.../pdf/pone.0308224.pdf", ... },
    { host_type: "repository", url_for_pdf: null, ... }
  ]
```
The `best_oa_location` (publisher) often lacks a direct PDF. Check `oa_locations` for `host_type: "repository"` entries which often have the actual PDF URL. Requires a real email address.

**PhilPapers** — blocked by Cloudflare on VPS. All endpoints (REST API, OAI-PMH) return Cloudflare challenge page. Use Hermes `web_search` tool with `site:philpapers.org` queries instead, which goes through Firecrawl.

**CORE** — full text gated behind API key:
```
GET https://api.core.ac.uk/v3/search/works?q=test
→ "fullText": "Not available for public API users."
→ "downloadUrl": ""
→ "sourceFulltextUrls": []
```
Without an API key: metadata only. With a free API key: full text may be available for many records.

### Default Retrieval Pathway (OpenAlex Primary)

This is the default path for getting a paper. OpenAlex is the best STARTING POINT because it combines discovery, citation graph, AND OA location knowledge in one API. Fall back to specialized sources when OpenAlex fails.

```
START: I have a topic / author / DOI
│
▼
PATH A: OpenAlex (primary — first resort)
─────────────────────────────────────────
1. GET https://api.openalex.org/works?search={query}&per_page=10
   &select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts,referenced_works,cited_by_count

2. Check if best_oa_location.pdf_url exists
   ├── YES → Download the PDF using curl/wget (terminal tool)
   │         Try the PDF URL directly. If it's a handle/redirector,
   │         follow redirects with curl -L.
   │
   └── NO  → Check open_access.any_repository_has_fulltext
              ├── TRUE  → Check locations[].pdf_url entries
              │           Some may have direct PDF URLs even when
              │           best_oa_location is null
              │
              └── FALSE → Paper may not be OA. Fall to Path B.

3. For each paper, use concepts[].display_name for topic classification
   and referenced_works for citation graph expansion.

Note: OpenAlex finds ~329 results for "Henry Corbin mundus imaginalis"
      in our tests, with best_oa_location populated for OA papers.
│
│ (if PDF still not found)
▼
PATH B: Resolve by DOI via Unpaywall
────────────────────────────────────
1. Get DOI from OpenAlex results (or start here if you already have a DOI)
2. GET https://api.unpaywall.org/v2/{doi}?email=your@email.com
3. Check oa_locations array:
   ├── Look for host_type: "repository" entries — these often have
   │   url_for_pdf with direct PDF URLs (e.g., PMC repository)
   │
   └── Check best_oa_location.url_for_pdf
       Note: publisher entries typically lack direct PDF URL
4. Download: curl -L "{url_for_pdf}" -o paper.pdf

Note: Unpaywall found PDF URLs for repository copies (PMC, etc.)
      even when publisher entries lacked them.
│
│ (if PDF still not found)
▼
PATH C: Search specialized repositories
───────────────────────────────────────
Is it French/European humanities?
├── YES → HAL: GET https://api.archives-ouvertes.fr/search/
│           ?q={query}&fq=submitType_s:file&fl=fileMain_s,title_s
│           fileMain_s gives DIRECT PDF URL (no redirect)
│           Tested: https://uca.hal.science/hal-04691150/document
│
Is it a recent deposit / dataset?
├── YES → Zenodo: GET https://zenodo.org/api/records?q={query}
│           files[].links.self gives DIRECT download URL
│           Tested: https://zenodo.org/api/records/3594245/files/...pdf/content
│
Is it an older / public-domain book?
├── YES → Internet Archive:
│           1. GET https://archive.org/advancedsearch.php?q={query}&fl[]=identifier,rights&output=json
│           2. Check rights field => must allow download
│           3. GET https://archive.org/metadata/{identifier}
│           4. Download _djvu.txt (raw text) or PDF from
│              https://archive.org/download/{identifier}/{filename}
│
Is it a thesis / institutional manuscript?
├── YES → CORE: needs API key (free)
│           GET https://api.core.ac.uk/v3/search/works?q={query}&pageSize=100
│           Without key: metadata only
│           With key: may have downloadUrl
│
Is it a philosophy paper specifically?
├── YES → PhilArchive: use web_search site:philarchive.org {title}
│           (PhilPapers is blocked by Cloudflare, use web_search instead)
│
└── All failed → Paper likely not openly available. Note in ResearchNote.
```

### Expansion Pathways (After You Have a Seed Paper)

```
You have one good paper (OpenAlex ID or DOI)

PATH X1: Follow references
  GET https://api.openalex.org/works/{id} → referenced_works[]
  For each reference ID:
    GET https://api.openalex.org/works/{ref_id}?select=id,doi,title,open_access
    Then try Path A (OpenAlex PDF) for each

PATH X2: Find citing works
  GET https://api.openalex.org/works?filter=cites:{id}&per_page=50
  &select=id,doi,title,open_access,cited_by_count

PATH X3: Same author
  GET https://api.openalex.org/works?filter=authorships.author.id:{author_id}
  &per_page=50&sort=cited_by_count:desc

PATH X4: Related topics
  Use concepts[].id from the seed paper:
  GET https://api.openalex.org/works?filter=concepts.id:{concept_id}
  &sort=cited_by_count:desc&per_page=20
```

### Hermes Capabilities That Apply Here

| Capability | How It Helps the Research Pipeline |
|---|---|
| **`terminal` tool** | Run `curl`, `wget`, `python` to call APIs and download PDFs directly to disk |
| **`web_search` tool** | Search PhilPapers, PhilArchive, arxiv, PubMed via Firecrawl (bypasses Cloudflare blocks) |
| **`web_extract` tool** | Extract full text from landing pages, parse HTML for PDF links |
| **`execute_code` tool** | Run Python scripts to process, classify, and format research notes |
| **`browser` tool** | If direct API fails, use headless browser to visit publisher page, find PDF link, download |
| **`read_file` / `write_file`** | Save downloaded PDFs and research notes to disk |
| **`journal_write`** | Store ResearchNote as structured journal entry (already implemented) |
| **Cron** | Schedule monthly research digests per domain mapping |
| **Subagents** | Parallelize: search OpenAlex + HAL + Zenodo simultaneously |

**When to use `terminal` vs `web_search` vs `browser` for downloading:**

| Scenario | Tool | Why |
|---|---|---|
| OpenAlex gives `best_oa_location.pdf_url` | `terminal` + `curl -L` | Direct URL, just need to follow redirects |
| Unpaywall gives `url_for_pdf` | `terminal` + `curl` | Direct PDF URL |
| HAL gives `fileMain_s` | `terminal` + `curl` | Direct PDF URL, no redirect |
| Zenodo gives `files[].links.self` | `terminal` + `curl` | Direct download URL |
| Internet Archive gives file paths | `terminal` + `curl` | Direct download |
| Need to search PhilPapers (Cloudflare blocked) | `web_search site:philpapers.org` | Firecrawl bypasses Cloudflare |
| Need to find PDF link on a publisher page | `web_extract` on landing page URL | Parse HTML for PDF links |
| All APIs fail, need to navigate a complex site | `browser` tool (headless) | Visit page, look for download button |
| Need to process/classify downloaded papers | `execute_code` (Python) | Run Friston schema classification |

### What the Agent Should NEVER Do

- ❌ Scrape Academia.edu or ResearchGate
- ❌ Download copyrighted material without rights check
- ❌ Ignore robots.txt or API terms of service
- ❌ Bulk-harvest entire repositories without rate limiting
- ❌ Use the browser tool as first resort — always try API + terminal first

---

```python
class SearchProvider:
    """Search for works by query string."""
    def search(self, query: str, **filters) -> list[Work]: ...

class OAResolver:
    """Resolve a DOI or ID to open-access locations."""
    def resolve(self, doi: str) -> list[Location]: ...

class OAIPMHHarvester:
    """Harvest records from OAI-PMH endpoints."""
    def identify(self, base_url: str) -> dict: ...
    def list_records(self, base_url: str, metadata_prefix: str): ...

class FullTextAcquirer:
    """Download full text from a known URL."""
    def fetch(self, url: str) -> str | None: ...
```

---

## Provider Configuration

```yaml
discovery:
  - philpapers        # Philosophical classification & citation graph
  - openalex          # Global citation graph & OA locations
  - crossref          # DOI resolution & metadata normalization

full_text:
  - philarchive       # Philosophy open-access repository
  - core              # University repository aggregator
  - hal               # French/European humanities
  - zenodo            # Recent deposits & datasets
  - internet_archive  # Older & public-domain material

oa_resolution:
  - unpaywall         # Preferred legal OA copy
  - openalex          # OA locations from OpenAlex

fallback:
  - base              # OAI-PMH institutional repository harvester

manual_only:
  - academia          # Discovery-only, no automated scraping
  - researchgate      # Discovery-only, no automated scraping
```

---

## Search Order (Recommended Hermes Procedure)

### Step 1: Normalize with Crossref

```
GET https://api.crossref.org/works?query={title}&rows=1
GET https://api.crossref.org/works/{doi}
```

Returns: DOI, title, authors, published date, journal, references.

### Step 2: PhilPapers — Philosophical Classification

```
# JSON API
GET https://philpapers.org/api/search?q={query}&format=json
GET https://philpapers.org/api/record?id={philpapers_id}&format=json

# OAI-PMH
GET https://philpapers.org/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:philpapers.org:{id}
```

Returns: philosophical categories, citations, related works, author info.

### Step 3: OpenAlex — Citation Graph Expansion

```
# Auth: free API key at https://openalex.org/settings/api
# Rate: $1/day free tier

# Search by title
GET https://api.openalex.org/works?search={query}

# Get single work
GET https://api.openalex.org/works/{doi_or_openalex_id}

# Get references
GET https://api.openalex.org/works?filter=cites:{openalex_id}

# Get citing works
GET https://api.openalex.org/works?filter=referenced_works:{openalex_id}

# Author works
GET https://api.openalex.org/works?filter=authorships.author.id:{author_id}

# Related topics
GET https://api.openalex.org/concepts?search={concept}

# Filter: open access only
&filter=is_oa:true
&filter=has_fulltext:true
&filter=has_pdf_url:true

# Filter: type
&filter=type:article|book|chapter|dissertation|preprint

# Fields to return
&select=id,doi,title,authorships,primary_location,cited_by_count,open_access,referenced_works
```

Key response fields per work:
- `id` — OpenAlex ID (`W` + number)
- `doi` — DOI string
- `title` — work title
- `authorships` — authors with institutions
- `primary_location` — landing page, PDF URL
- `open_access` — `is_oa`, `oa_status`, `any_repository_has_fulltext`
- `best_oa_location` — best OA landing page + PDF URL
- `referenced_works` — list of OpenAlex IDs it cites
- `cited_by_count` — citation count
- `concepts` — topics with relevance scores

### Step 4: PhilArchive — Direct Open Full Text

```
GET https://philarchive.org/api/search?q={query}&format=json
```

PhilArchive is integrated with PhilPapers. Author-uploaded full texts are freely accessible. Check `philarchive_url` field in PhilPapers records.

### Step 5: CORE — Repository Full Text

```
# Auth: API key at https://core.ac.uk/services/api/
# v3 API

# Search
GET https://api.core.ac.uk/v3/search/works?q={query}&page=1&pageSize=100

# Get work
GET https://api.core.ac.uk/v3/works/{id}

# Fields
&select=id,title,authors,doi,fullTextUrls,downloadUrl,publisher,year,abstract
```

Key response: `fullTextUrls` and `downloadUrl` for repository PDFs. Strong for theses and institutional manuscripts.

### Step 6: HAL — French/European Humanities

```
# Solr-based API, no auth required
# Base: https://api.archives-ouvertes.fr/search/

# Title search
GET https://api.archives-ouvertes.fr/search/?q=title_t:"{query}"&wt=json&fl=title_s,authFullName_s,uri_s,fileMain_s,doiId_s

# Full-text with files only
GET https://api.archives-ouvertes.fr/search/?q={query}&fq=submitType_s:file&wt=json

# Theses only
GET https://api.archives-ouvertes.fr/search/?q={query}&fq=docType_s:(THESE OR HDR)&wt=json

# Common fields (fl=):
#   title_s, authFullName_s, uri_s, fileMain_s, doiId_s,
#   label_s, abstract_s, keyword_s, producedDateY_i

# Response formats: json, xml, bibtex, csv, rss, atom, endnote, xml-tei
# Pagination: &start=0&rows=100 (max 10000)
# Cursor-based pagination: &sort=docid asc&cursorMark=*

# Format: &wt=bibtex (useful for citation import)
```

Key HAL fields:
- `fileMain_s` — direct PDF download URL
- `uri_s` — landing page on HAL
- `submitType_s:file` — records with actual files
- `docType_s` — THESE / HDR / ART / COMM / BOOK / COUV / OUV / REPORT

### Step 7: Zenodo — Recent Deposits & Datasets

```
# Records API (no auth for read)
GET https://zenodo.org/api/records?q={query}&size=25
GET https://zenodo.org/api/records?q="Marsilio Ficino"&size=100

# Pagination
&page=1&size=100 (max 100 for authenticated, 25 for anonymous)

# Sort
&sort=mostrecent

# Type filter
&type=publication
&subtype=article|preprint|book|section|thesis

# Single record
GET https://zenodo.org/api/records/{id}

# File download
# Files listed in record.files[].links.self
```

Key response fields:
- `metadata.title`, `metadata.creators`, `metadata.publication_date`
- `metadata.upload_type`, `metadata.publication_type`
- `files[].key`, `files[].links.self`, `files[].size`
- `doi`, `conceptdoi`

### Step 8: Unpaywall — Legal OA Resolution

```
# Auth: email-based, free tier
GET https://api.unpaywall.org/v2/{doi}?email={your_email}
```

Returns: best OA location (PDF URL, landing page, license, version).

### Step 9: BASE — OAI-PMH Fallback

```
# OAI-PMH endpoint
GET https://oai.base-search.net/
?verb=ListRecords
&metadataPrefix=oai_dc
&set={collection}
&resumptionToken={token}

# Search
GET https://api.base-search.net/v1/search?query={query}&format=json
```

### Step 10: Internet Archive (With Rights Check)

```
# Metadata
GET https://archive.org/metadata/{identifier}

# Search
GET https://archive.org/advancedsearch.php?q=creator:"{author}"&fl[]=identifier,title,creator,year&output=json

# Download: check rights/access status first
# Full-text available at https://archive.org/stream/{identifier}/{identifier}_djvu.txt
```

Only download files where `rights` or `access` status is clearly open.

---

## Work Data Model

```python
@dataclass
class Work:
    id: str                    # provider-specific ID
    doi: str | None
    title: str
    authors: list[Author]
    year: int | None
    source: str                # provider name
    abstract: str | None
    url: str | None            # landing page
    pdf_url: str | None
    oa_status: str | None      # open / closed / embargoed
    references: list[str]      # DOIs or IDs
    cited_by_count: int | None
    concepts: list[Concept]    # OpenAlex topics

@dataclass
class ResearchNote:
    paper: Work
    classification: str        # domain mapping
    esoteric_mapping: str      # Ficino/Corbin/Iamblichus/Plotinus/Goethe
    key_claim: str
    tension_with_essays: list[str]
    recommendation: str        # essay / footnote / ignore
```

---

## Domain Mappings (for classification)

| Esoteric Domain | Science Domain | Search Keywords |
|---|---|---|
| Ficino spiritus / celestial medicine | Interoception, predictive processing | interoception spiritus predictive processing |
| Corbin imaginal / mundus imaginalis | Mental imagery, hallucination models, psychedelic research | mental imagery hallucination psychedelic imaginal |
| Goethe perception / living thinking | Active inference, enactive cognition | active inference enactive cognition 4E cognition |
| Iamblichus theurgy / ritual | Contemplative neuroscience | contemplative neuroscience ritual meditation |
| Plotinus beauty / the One | Neuroaesthetics | neuroaesthetics beauty aesthetic experience |
| Swedenborg correspondences | Predictive processing, Bayesian brain | predictive coding bayesian brain correspondence |
| Ibn Arabi / Sufi epistemology | Altered states, self-model | self-model predictive processing mysticism |

---

## Hermes Skills Integration

### Skill: `academic-research`
Invoke: `/academic-research "Marsilio Ficino spiritus interoception"`

Procedure:
1. Normalize query with Crossref
2. Search PhilPapers for philosophical classification
3. Expand via OpenAlex citation graph
4. Acquire full texts (PhilArchive → CORE → HAL → Zenodo)
5. Classify per Friston schema & domain mapping
6. Save ResearchNote via journal_write
7. If tension detected with existing essay, flag for essay pipeline

### Updating `essay-companion`
The `/write-and-publish` skill should add a research step in Phase 1:
- Before writing, run `/research-pipeline` on the topic
- Incorporate research findings into the essay blueprint

### Cron: Monthly Research Digest
```
hermes cron create "0 9 1 * *" \
  --skill research-pipeline \
  --deliver telegram \
  "Run the research pipeline for each domain mapping. Summarize new papers found this month."
```

---

## API Keys Required

| Service | Key | Env Var | Free? |
|---|---|---|---|
| OpenAlex | API key (rate limit increase) | `OPENALEX_API_KEY` | Yes ($1/day free) |
| CORE | API key | `CORE_API_KEY` | Yes (free tier) |
| Unpaywall | Email (for polite pool) | `UNPAYWALL_EMAIL` | Yes |
| Crossref | None (rate-limited) | — | Yes |
| PhilPapers | None | — | Yes |
| PhilArchive | None | — | Yes |
| HAL | None | — | Yes |
| Zenodo | Optional (for higher rate) | `ZENODO_API_KEY` | Yes |
| Internet Archive | None | — | Yes |
| BASE | None | — | Yes |

---

## Git Links & References

- **OpenAlex API docs**: https://developers.openalex.org/ / https://api.openalex.org
- **OpenAlex GitHub**: https://github.com/ourresearch/openalex-api
- **OpenAlex paper**: https://arxiv.org/abs/2205.01833
- **PhilPapers API**: https://philpapers.org/help/api.html / https://philpapers.org/help/api/json.html
- **CORE API docs**: https://api.core.ac.uk/docs/v3
- **CORE GitHub**: https://github.com/oacore/core-api
- **HAL API docs**: https://api.archives-ouvertes.fr/docs/search
- **HAL OAI-PMH**: https://api.archives-ouvertes.fr/docs/oai
- **Zenodo REST API**: https://developers.zenodo.org/
- **Zenodo API base**: https://zenodo.org/api/records
- **Unpaywall API**: https://unpaywall.org/products/api
- **BASE OAI-PMH**: https://oai.base-search.net/
- **Internet Archive APIs**: https://archive.org/advancedsearch.php / https://archive.org/metadata/
- **Crossref API**: https://api.crossref.org/
- **Crossref REST API docs**: https://github.com/Crossref/rest-api-doc

---

## Existing Project Integration

### Files to create/modify:

| File | Purpose |
|---|---|
| `hermes/skills/analysis/research-pipeline/SKILL.md` | New Hermes skill for the pipeline |
| `hermes/skills/essay/write-and-publish/SKILL.md` | Update Phase 1 to add research step |
| `hermes/plugins/atlas-astrology/tools/research.py` | Hermes plugin tool wrapping the pipeline |

### Design Decisions

1. **No local database.** ResearchNotes are stored via Hermes `journal_write(kind="research_note")`. The journal is searchable via session_search.

2. **No graph model for now.** The "graph of claims" from handover.md (HXRMXS syntheses + tensions) is a future step. This pipeline focuses on acquisition and classification.

3. **Friston schema** from handover.md section "The paper ingestion format": classification, mathematical framework, empirical predictions, theoretical relationships, evidence assessment.

4. **Tension detection** is manual for now — the agent identifies contradictions between paper claims and existing essay claims during classification.

5. **Rate limiting.** All APIs have rate limits. Implement exponential backoff. OpenAlex requires an API key for the $1/day free tier.

