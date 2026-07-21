# Retrieval Guide — Working Sources & Best Practices

## Philosophy of Acquisition

Open-access acquisition is about **finding the legal copy**, not breaking a paywall. The agent's job is to follow the trail of metadata until it finds a freely accessible file. That trail is: title → DOI → OpenAlex → Unpaywall → repository → direct download. Each link in the chain either yields the PDF or confirms the paper isn't openly available.

Never substitute a dubious copy. A stub record with `access_status: paywalled_or_request_only` is better than a file that might be wrong or illegally obtained.

## The Retrieval Chain (Verified Working)

### Level 1: Direct URL (highest success rate)

If the user provides a URL, try it first. These sites worked in testing:

| Site | Success | Notes |
|---|---|---|
| WordPress blogs (`*.files.wordpress.com`) | ✅ | Direct PDF, no blocking |
| Personal/academic websites (`*.org/wp-content/uploads/`) | ✅ | Direct PDF, no blocking |
| Traditional Hikma (`traditionalhikma.com`) | ✅ | Direct PDF, verify copyright status |
| Laban International (`labaninternational.org`) | ✅ | Direct PDF |
| MDPI (`www.mdpi.com`) | ⚠️ | Direct `/pdf` URL returns 403. Use the HTML page and find the PDF link |

**Technique:**
```
curl -sIL -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" "{url}"
```
Always use a real browser User-Agent. Many academic sites block the default Python/curl UA.

If the URL returns 403 but you know the content should be OA, try the HTML landing page instead of the PDF link — the page often has a "Download PDF" link that works.

### Level 2: OpenAlex (best starting point for discovery)

OpenAlex is the **single best source** because it combines three things in one API call:
1. Metadata (title, authors, DOI, year)
2. OA locations (`best_oa_location.pdf_url`, `locations[].pdf_url`)
3. Citation graph (references, citing works, author works)

**API:** `https://api.openalex.org/`

```
# By DOI (fastest, most precise)
GET https://api.openalex.org/works/doi/{doi}?select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts

# By search
GET https://api.openalex.org/works?search={query}&per_page=5&select=id,doi,title,open_access,best_oa_location
```

**Key fields for acquisition:**
- `best_oa_location.pdf_url` — may be a handle/redirector (e.g., Harvard DASH handle)
- `best_oa_location.landing_page_url` — the OA landing page
- `locations[].pdf_url` — alternative URLs (sometimes more direct than best_oa_location)
- `open_access.is_oa` — boolean
- `open_access.oa_status` — `gold`, `green`, `hybrid`, `bronze`, `closed`

**Gotcha:** `best_oa_location.pdf_url` can be a handle URL that redirects to an HTML form rather than a PDF. Example: Harvard DASH (`http://nrs.harvard.edu/urn-3:HUL.InstRepos:3223908`) returns a Cloudflare challenge page. In this case:
1. Try the direct bitstream URL from `locations[]` (e.g., `https://dash.harvard.edu/bitstream/handle/1/3223908/ficinomagic.pdf?sequence=6`)
2. If that also fails, the repository requires interactive access → need Hermes browser tool
3. Record as `access_status: paywalled_or_request_only`

**Rate limits:** Free tier costs $0.001 per search. $1/day free with API key. Without key: slower rate. Sign up at https://openalex.org/settings/api

### Level 3: Unpaywall (best for DOI → OA resolution)

When OpenAlex has no OA location, try Unpaywall. It's the most reliable way to get the **legal** OA copy from a DOI.

**API:** `https://api.unpaywall.org/v2/{doi}?email={your_email}`

**Key insight from testing:** Do NOT rely on `best_oa_location` alone. The publisher entry (which is usually `best_oa_location`) often lacks a `url_for_pdf`. Check the `oa_locations` array for entries with `host_type: "repository"` — these often have the actual PDF URL.

```
# Example response for an OA paper:
oa_locations: [
  { host_type: "publisher", url_for_pdf: null },           # ← no PDF
  { host_type: "repository", url_for_pdf: "https://pmc.ncbi.nlm.nih.gov/articles/.../pdf/pone.0308224.pdf" },  # ← PDF!
]
```

**Requires:** A real email address in the API call. Free tier.

### Level 4: Specialized Repositories

When OpenAlex and Unpaywall fail, try domain-specific repositories:

#### HAL (French/European Humanities) — ✅ Direct PDF
```
GET https://api.archives-ouvertes.fr/search/?q={query}&fq=submitType_s:file&fl=fileMain_s,title_s,uri_s
```
`fileMain_s` is a **direct downloadable PDF** URL. No auth needed. Filter by `submitType_s:file` to get only records with files.

#### Zenodo (Recent Deposits) — ✅ Direct Download
```
GET https://zenodo.org/api/records?q={query}&size=25
```
`files[].links.self` is a **direct download URL**. No auth needed for reads.

**Example:**
```
→ files[0].links.self: "https://zenodo.org/api/records/3594245/files/2019Rodriguez.pdf/content"
→ files[0].key: "2019Rodriguez.pdf"
```

#### Internet Archive (Older/Public Domain) — ✅ Full Text
```
1. GET https://archive.org/advancedsearch.php?q={query}&fl[]=identifier,title,creator,year,rights&output=json
2. Check metadata.rights before downloading
3. GET https://archive.org/metadata/{identifier}
4. Download: _djvu.txt (raw text) or PDF from https://archive.org/download/{identifier}/{filename}
```

**Always check the `rights` field before downloading.** Just because something is on the Internet Archive doesn't mean it's freely distributable.

#### CORE (Theses/Institutional Manuscripts) — 🔒 Gated
```
GET https://api.core.ac.uk/v3/search/works?q={query}
```
Without API key: `"fullText": "Not available for public API users."` — metadata only.
With free API key: may have `downloadUrl` for repository copies.

### Level 5: Fallback Discovery Only (Not Acquisition)

These sources can help you DISCOVER papers but cannot be used for automated download:

| Source | Why | Alternative |
|---|---|---|
| PhilPapers | Blocked by Cloudflare on VPS | Use `web_search site:philpapers.org` (goes through Firecrawl) |
| Academia.edu | No public API, do not scrape | Use title/DOI to search OpenAlex instead |
| ResearchGate | No public API, do not scrape | Use title/DOI to search OpenAlex instead |
| Scribd | No public API, do not scrape | Use title to search institutional repositories |

## Download Validation Steps

After getting a potential PDF URL, always:

1. **Check HTTP status** — must be 200
2. **Check Content-Type** — must be `application/pdf`
3. **Check magic bytes** — first 4 bytes must be `%PDF`
4. **Check it's not an HTML login page** — if the "PDF" starts with `<!DOCTYPE html>`, it's a fake
5. **Calculate SHA-256** — for duplicate detection
6. **Record file size** — too small (< 1KB) is suspicious
7. **Extract first page text** — verify title/author match the requested work

## What To Do When Everything Fails

Create a stub record:

```json
{
  "provenance": {
    "access_status": "paywalled_or_request_only",
    "oa_status": "closed",
    "validation_confidence": 0.5
  }
}
```

This is better than:
- Downloading from a pirate site
- Substituting a paper with a similar title
- Silently skipping it
- Using a compromised/unverified file

## The Hermes Tool Chain for Retrieval

| Scenario | Tool | Why |
|---|---|---|
| API returns direct PDF URL | `terminal` + `curl -L` | Fastest, most reliable |
| API returns HTML page with PDF link | `web_extract` on landing page | Parse HTML for PDF href |
| Repository behind WAF/CAPTCHA | `browser` tool | Interact with form, click download |
| PhilPapers (Cloudflare blocked) | `web_search site:philpapers.org` | Firecrawl bypasses Cloudflare |
| Need to process/classify PDF | `execute_code` (Python) | Text extraction, SHA-256, Friston schema |
| Multiple sources to search | Subagents | Parallelize OpenAlex + HAL + Zenodo |

## Summary: Best Practices

1. **OpenAlex first** — it's the most efficient single API for discovery + OA location
2. **Unpaywall second** — best DOI→OA resolution, check `oa_locations` not just `best_oa_location`
3. **Direct URL third** — try the URL directly with proper User-Agent
4. **Specialized repos fourth** — HAL, Zenodo, Internet Archive, CORE
5. **Never pirate** — don't use Sci-Hub, Library Genesis, or similar
6. **Record failure** — `access_status: paywalled_or_request_only` is fine
7. **Browser UA** — always use `Mozilla/5.0 ...` User-Agent
8. **Validate downloads** — check for `%PDF` magic bytes
9. **Deduplicate** — check SHA-256 and DOI before storing
10. **Document provenance** — save source URL, retrieval date, version info
