---
name: acquire
description: Acquire a scholarly paper — resolve metadata, find OA copy, download, validate, and save as JSON record
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [research, papers, acquisition, download, pdf]
    requires_tools: [terminal, web_search, web_extract]
---

# Paper Acquisition Pipeline

Accepts a title, DOI, or URL from the user. Resolves metadata, finds a legal open-access copy, downloads and validates the PDF, creates a JSON record in `content/works/`, and reports back.

## Workflow

```
User: /acquisition "Title of Paper" or DOI or URL
  │
  ▼
STEP 1: Resolve metadata
  ├── If DOI given → Crossref for metadata, OpenAlex for OA locations
  ├── If URL given → web_extract for metadata, check if direct PDF
  └── If title given → Crossref search, OpenAlex search, Unpaywall lookup

STEP 2: Find OA copy
  ├── OpenAlex: best_oa_location.pdf_url + locations[].pdf_url
  ├── Unpaywall: oa_locations[].url_for_pdf
  ├── Direct URL: check if link points to a PDF
  └── Alternative repos: check all OpenAlex locations[] — different repos
      may not block the VPS even when the publisher does

STEP 3: Try automated download
  └── curl -L "{url}" -o library/{corpus}/{slug}.pdf
  ├── If 403 → try alternative URLs from OpenAlex locations[] (different repos)
  ├── If all automated attempts fail → go to STEP 3b (user-assisted)
  └── If success → go to STEP 4

STEP 3b: User-assisted download (when VPS is IP-blocked)
  └── Send Telegram message with:
      ├── Paper info (title, authors, DOI)
      ├── Direct PDF URL (the one that returned 403)
      ├── Note: "This site blocks my VPS. Can you download and send me the PDF?"
      └── User downloads on their own device and sends the file back to Telegram

STEP 4: Process received file
  ├── Save to library/{corpus}/{slug}.pdf
  ├── Validate: starts with %PDF, title/author match
  └── Record: sha256, size, page count

STEP 5: Create JSON record
  └── content/works/work_{slug}.json
  ├── If work already exists, skip
  └── Create author JSON if new author

STEP 6: Report back
  └── Telegram: summary of what was acquired
  └── If user-assisted: "Got it! Saved and indexed."
```

## Resolution Order

```
1. Crossref — verify/canonicalize DOI
   GET https://api.crossref.org/works/{doi}
   or GET https://api.crossref.org/works?query.title={title}&rows=3

2. OpenAlex — find OA locations + citation metadata
   GET https://api.openalex.org/works/doi/{doi}?select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts
   or GET https://api.openalex.org/works?search={query}&per_page=5&select=id,doi,title,open_access,best_oa_location

3. Unpaywall — resolve DOI to OA
   GET https://api.unpaywall.org/v2/{doi}?email=tradesprior@gmail.com
   Check oa_locations[].url_for_pdf — especially host_type: "repository"

4. Direct URL — if user provided a URL, try it directly
   curl -I "{url}" to check if it's a PDF
   curl -L "{url}" to download
```

## Download Rules

- Only download if HTTP 200 and Content-Type: application/pdf
- Verify: first 4 bytes are `%PDF`
- Never bypass authentication, CAPTCHAs, subscriptions, or publisher controls
- Never use pirate libraries (Sci-Hub, Library Genesis, etc.)
- Record the landing page and DOI, not only the PDF
- Calculate SHA-256 for duplicate detection
- Preserve publication version: version_of_record / accepted_manuscript / submitted_manuscript / thesis / unknown
- If unavailable or blocked, create record with `access_status: "paywalled_or_request_only"` instead of substituting a dubious copy

## User-Assisted Download (When Automated Fails)

Some publishers (MDPI, some repositories) block the VPS IP even though their content is genuinely open access. The browser tool cannot download files. In this case:

1. Send the user a Telegram message with:
   - Paper title, authors, DOI
   - The direct PDF URL that was blocked
   - A request to download it manually

2. When the user sends the PDF file back via Telegram, Hermes receives it and:
   - Saves it to library/{corpus}/{slug}.pdf
   - Validates the file (PDF magic bytes, title check)
   - Creates the work JSON record
   - Reports success

3. For paywalled papers (no OA copy exists anywhere), still create a stub record and mark `access_status: paywalled_or_request_only`. Do not ask the user to bypass a real paywall.

This respects the rule: never bypass authentication. The user is simply accessing open-access content from their own IP, which the publisher does not block.

## Output Directory Structure

```
library/{corpus}/
  {slug}.pdf

content/works/
  work_{slug}.json

content/authors/
  author_{name}.json  (if new author)
```

## Paper JSON Format

```json
{
  "work_id": "work:corbin-mundus-imaginalis",
  "schema_version": 1,
  "title": "Mundus Imaginalis...",
  "authors": [{ "name": "Henry Corbin", "author_id": "author:henry-corbin" }],
  "publication": { "year": 1972, "type": "essay" },
  "identifiers": { "doi": null, "openalex_id": null },
  "topics": ["mundus_imaginalis", "active_imagination"],
  "tradition": ["sufism"],
  "relations": [
    { "predicate": "develops", "target_id": "concept:mundus-imaginalis", "confidence": 0.99 }
  ],
  "assets": {
    "pdf_path": "library/corbin/{slug}.pdf",
    "source_url": "https://..."
  },
  "provenance": {
    "access_status": "open",
    "oa_status": "bronze",
    "sha256": null,
    "file_size_bytes": 76750,
    "retrieved_at": "2026-07-11T06:55:00Z",
    "validation_confidence": 0.95
  },
  "analysis": {
    "summary": "...",
    "quality_score": 0.9
  }
}
```

## Examples

```
# By title
/acquisition "Mundus Imaginalis Henry Corbin"

# By DOI
/acquisition 10.1080/09608788.2013.771608

# By URL
/acquisition https://labaninternational.org/wp-content/uploads/2017/10/imagination-and-the-mundus-imaginalis-printed-in-spring-no-77-2007.pdf
```

## Pitfalls

- Many academic PDFs return 403 without proper User-Agent. Always use `-A "Mozilla/5.0"`
- **If 403 persists, check ALL OpenAlex locations[] not just best_oa_location.** Different repositories (KU Leuven, institutional repos) may not block the VPS even when the publisher does.
- **If ALL repositories return 403**, the VPS IP is blocked by the institution. Use user-assisted download: send the Telegram user the direct link and ask them to download from their own device.
- OpenAlex: `best_oa_location.pdf_url` may be a handle/redirector; use `curl -L` to follow
- Unpaywall: `best_oa_location` (publisher) often lacks PDF URL; check `oa_locations` for repository entries
- HAL: filter `fq=submitType_s:file` to get only records with PDFs
- Internet Archive: ALWAYS check `rights` or `access-restriction` in metadata before downloading
- CORE: requires API key for full text; without key, metadata only
- PhilPapers: blocked by Cloudflare; use `web_search site:philpapers.org` instead
- Do NOT download Temple and Contemplation if rights are unclear — it's a copyrighted book
- If a paper already exists in content/works/, skip and report
- The browser tool CANNOT download files — it's for navigation and interaction only

## Verification

- At least metadata was resolved (title + authors + year + DOI)
- If PDF downloaded: starts with %PDF, title/author match
- JSON record written to content/works/work_{slug}.json
- Author JSON written if new
