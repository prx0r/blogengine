# Acquisition Process Notes — 2026-07-11

## Summary

Tested 17 papers through the acquisition pipeline. Results:

- **6 successfully downloaded** as valid PDFs
- **6 stub records created** for paywalled/unavailable papers
- **5 failed** due to 403/connection errors (no stub created)

## What Worked

### Direct URL with proper User-Agent
```
curl -sL -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" "{url}"
```
The browser User-Agent is essential. Default Python/curl UA gets blocked by most academic sites.

### OpenAlex OA Location Discovery
OpenAlex successfully found OA download URLs for:
- Ficino daemon Portuguese (OpenAlex found the journal's download page)

### Wayback Machine with `id_` modifier
Wayback Machine PDFs require a special URL format:
```
# Wrong (returns HTML wrapper):
https://web.archive.org/web/20080509183618/http://example.com/file.pdf

# Right (returns direct PDF):
https://web.archive.org/web/20080509183618id_/http://example.com/file.pdf
```
The `id_` suffix after the timestamp tells Wayback to serve the raw file without its HTML chrome.

### Direct WordPress/Blog PDFs
Simple WordPress-hosted PDFs (ahandfulofleaves.files.wordpress.com) work with no issues.

## What Failed & Why

### 403 Forbidden (Server Blocking)
These sites returned HTTP 403 regardless of User-Agent:
- **MDPI** (Kiosoglou) — Even the HTML article page returns 403. IP block?
- **SciSpace** (Corrias Imagination) — 403 on PDF endpoint
- **Iris Repository** (Rutkin) — 403 on retrieve endpoint
- **Kingston Repository** (Idinopulos) — 403 on files endpoint

**Possible fixes:**
- Use Hermes `web_search` to find alternative copies
- Use `browser` tool to navigate the site interactively
- Try with different IP (if VPS IP is blocked)
- Check if these URLs are accessible from a browser

### Paywalled (No OA Available)
These are behind publisher paywalls with no repository copy:
- **Corrias Daemonic** (T&F) — confirmed closed by Unpaywall and OpenAlex
- **Garner** (Chicago) — confirmed closed
- **Wolfson** (Springer book chapter) — confirmed closed  
- **Shariat** (Sage) — confirmed closed
- **Evans** (Equinox journal) — confirmed closed
- **Dhammadinna** (Equinox journal) — confirmed closed

These are correctly recorded as `access_status: paywalled_or_request_only`.

### Connection Errors
- **bahaistudies.net** (Corbin Mundus Imaginalis) — Connection refused. Site may be down.

## Lessons for the Acquisition Skill

1. **Wayback Machine URLs need special handling.** The acquisition script now has a fix that detects `web.archive.org` URLs and adds the `id_` modifier.

2. **MDPI requires browser-level access.** The Hermes `browser` tool may be needed to download from MDPI.

3. **Semantic Scholar API is a useful fallback** for finding OA PDFs. Added to the acquisition script.

4. **403 errors should trigger alternative search** rather than just failing. If a direct URL returns 403, the script should fall back to DOI-based search (OpenAlex → Unpaywall → Semantic Scholar).

5. **User-Agent rotation** could help with some 403s. Try a few different UAs before giving up.

6. **Stub records are created for paywalled papers** but NOT for 403 errors. This is a gap — the script should create a stub for 403s too.

## Improvement Plan for Acquisition Skill

1. Add 403 fallback: if direct URL returns 403, search by DOI/title instead
2. Add Wayback Machine `id_` modifier automatically (DONE)
3. Add Semantic Scholar as OA resolver (DONE)
4. Add stub creation for 403 failures (not just paywalled)
5. Add retry with different User-Agent on 403
6. Add browser tool usage note for MDPI-type sites
7. Add `web_search` fallback for PhilPapers-type sites (Cloudflare blocked)

## Git Workflow for Deploy

The deploy skill (`/deploy-site`) now requires:
```
1. git add -A && git commit -m "deploy: ..." && git push
2. npm run cf:build
3. npm run cf:deploy
```

This ensures every deploy corresponds to a git commit, enabling rollback by checking out the previous commit and re-deploying.
