#!/usr/bin/env python3
"""
Paper Acquisition Pipeline — standalone script for Hermes to call via terminal.

Usage:
  python3 acquisition.py resolve --title "Mundus Imaginalis Henry Corbin"
  python3 acquisition.py resolve --doi 10.1080/09608788.2013.771608
  python3 acquisition.py download --url https://example.com/paper.pdf --slug my-paper --corpus ficino
  python3 acquisition.py acquire --doi 10.1080/09608788.2013.771608 --email tradesprior@gmail.com
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path("/root/projects/blog")
EMAIL = "tradesprior@gmail.com"
USER_AGENT = f"HermesAcquisition/1.0 (mailto:{EMAIL})"

def req(url, data=None, method="GET"):
    """Make an HTTP request with proper headers."""
    hdrs = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }
    if data:
        data = json.dumps(data).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        return json.dumps({"error": f"HTTP {e.code}"}).encode()
    except Exception as e:
        return json.dumps({"error": str(e)}).encode()


def slugify(text):
    """Turn a title into a slug."""
    s = text.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[-\s]+', '-', s)
    return s[:80]


def resolve_crossref(title):
    """Resolve a title to metadata via Crossref."""
    url = f"https://api.crossref.org/works?query.title={urllib.parse.quote(title)}&rows=3"
    raw = req(url)
    data = json.loads(raw)
    items = data.get("message", {}).get("items", [])
    results = []
    for item in items[:3]:
        results.append({
            "title": (item.get("title") or [""])[0],
            "doi": item.get("DOI"),
            "authors": [a.get("family", "") for a in item.get("author", [])],
            "year": (item.get("published-print") or item.get("created") or {}).get("date-parts", [[None]])[0][0],
            "publisher": item.get("publisher"),
            "type": item.get("type"),
        })
    return results


def resolve_openalex(doi_or_title):
    """Resolve a DOI or title to OA locations via OpenAlex."""
    if doi_or_title.startswith("10."):
        url = f"https://api.openalex.org/works/doi/{doi_or_title}?select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts,cited_by_count"
    else:
        q = urllib.parse.quote(doi_or_title)
        url = f"https://api.openalex.org/works?search={q}&per_page=5&select=id,doi,title,authorships,open_access,best_oa_location,locations,concepts,cited_by_count"
    raw = req(url)
    return json.loads(raw)


def resolve_unpaywall(doi):
    """Resolve a DOI to OA locations via Unpaywall."""
    url = f"https://api.unpaywall.org/v2/{doi}?email={EMAIL}"
    raw = req(url)
    return json.loads(raw)


def download_pdf(url, dest_path, alt_urls=None):
    """Download a PDF with validation. Tries alt_urls if primary fails."""
    urls_to_try = [url] + (alt_urls or [])
    
    for attempt_url in urls_to_try:
        try:
            hdrs = {"User-Agent": USER_AGENT}
            r = urllib.request.Request(attempt_url, headers=hdrs)
            with urllib.request.urlopen(r, timeout=60) as resp:
                data = resp.read()
            
            if data.startswith(b"%PDF"):
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                dest_path.write_bytes(data)
                sha256 = hashlib.sha256(data).hexdigest()
                return {
                    "sha256": sha256,
                    "file_size_bytes": len(data),
                    "final_url": resp.url,
                    "used_url": attempt_url,
                }
            else:
                print(f"  Not PDF from {attempt_url[:80]}... (got {data[:30]})")
        except Exception as e:
            print(f"  Failed: {attempt_url[:80]}... ({e})")
    
    raise ValueError("No valid PDF found from any URL")


def check_exists(slug):
    """Check if a paper already exists in content/works/."""
    path = PROJECT_ROOT / "content" / "works" / f"work_{slug}.json"
    return path.exists()


def make_work_json(slug, title, authors, doi, topics, tradition, pdf_path, provenance, summary, quality):
    """Create the work JSON record."""
    work_id = f"work:{slug}"
    author_entries = []
    for a in authors:
        a_slug = slugify(a)
        author_entries.append({
            "name": a,
            "author_id": f"author:{a_slug}",
        })
    
    work = {
        "work_id": work_id,
        "schema_version": 1,
        "title": title,
        "authors": author_entries,
        "publication": {"year": provenance.get("year"), "type": "article", "language": "en"},
        "identifiers": {"doi": doi, "openalex_id": None},
        "topics": topics,
        "tradition": tradition,
        "relations": [],
        "assets": {
            "pdf_path": str(pdf_path),
            "source_url": provenance.get("source_url"),
        },
        "provenance": {
            "access_status": provenance.get("access_status", "open"),
            "oa_status": provenance.get("oa_status"),
            "sha256": provenance.get("sha256"),
            "file_size_bytes": provenance.get("file_size_bytes"),
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "validation_confidence": provenance.get("confidence", 0.9),
        },
        "analysis": {
            "summary": summary,
            "quality_score": quality,
        },
    }
    return work


def build_corpus(tradition):
    """Map tradition to library subdirectory."""
    mapping = {
        "ficino": "ficino",
        "late_platonism": "ficino",
        "corbin": "corbin",
        "sufism": "corbin",
        "shii_islam": "corbin",
        "nanananda": "nanananda",
        "theravada_buddhism": "nanananda",
    }
    for key, val in mapping.items():
        if key in tradition:
            return val
    return "bridges"


def cmd_acquire(args):
    """Full acquisition pipeline from DOI or title."""
    doi = args.doi
    title = args.title
    url = args.url
    
    print(f"{'='*60}")
    print(f"ACQUISITION PIPELINE")
    print(f"{'='*60}")
    
    # Step 1: Resolve metadata
    print(f"\n[1] Resolving metadata...")
    if doi:
        print(f"  DOI: {doi}")
        # Get metadata from OpenAlex
        oa = resolve_openalex(doi)
        if "results" in oa:
            work = oa["results"][0]
        elif "id" in oa:
            work = oa
        else:
            work = None
        
        if work and work.get("title"):
            title = work["title"]
            authors = [a.get("author", {}).get("display_name", "") for a in work.get("authorships", [])]
            print(f"  Title: {title[:70]}")
            print(f"  Authors: {', '.join(authors[:3])}")
        else:
            # Fallback to Crossref
            cr = resolve_crossref(doi)
            if cr:
                title = cr[0]["title"]
                authors = cr[0]["authors"]
                print(f"  Title: {title[:70]} (from Crossref)")
            else:
                print("  ERROR: Could not resolve DOI")
                return
    
    elif title:
        print(f"  Title: {title[:70]}")
        # Try Crossref first
        cr = resolve_crossref(title)
        if cr:
            doi = cr[0].get("doi")
            authors = cr[0]["authors"]
            print(f"  DOI: {doi} (from Crossref)")
            print(f"  Authors: {', '.join(authors[:3])}")
        # Try OpenAlex
        oa = resolve_openalex(title)
        if "results" in oa and oa["results"]:
            w = oa["results"][0]
            if not doi:
                doi = w.get("doi", "").replace("https://doi.org/", "")
            authors = [a.get("author", {}).get("display_name", "") for a in w.get("authorships", [])]
    
    elif url:
        print(f"  URL: {url}")
        # For direct URL, derive basic info
        from urllib.parse import urlparse
        path = urlparse(url).path
        fname = os.path.basename(path)
        # Try to get a title from the URL
        title = title or fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
        authors = args.authors or ["Unknown"]
    
    slug = args.slug or slugify(title or "unknown")
    corpus = args.corpus or "bridges"
    
    # Check if already exists
    if check_exists(slug):
        print(f"\n  ⚠ Paper already exists: content/works/work_{slug}.json")
        return
    
    # Step 2: Find OA copy
    print(f"\n[2] Finding OA copy...")
    pdf_url = None
    oa_info = {}
    
    if doi:
        # OpenAlex
        oa = resolve_openalex(doi)
        if "results" in oa:
            w = oa["results"][0]
        elif "id" in oa:
            w = oa
        else:
            w = None
        
        if w:
            oa_status = w.get("open_access", {})
            alt_urls = []
            
            if oa_status.get("is_oa"):
                best = w.get("best_oa_location") or {}
                pdf_url = best.get("pdf_url")
                oa_info = {
                    "oa_status": oa_status.get("oa_status"),
                    "host_type": best.get("source", {}).get("type") if best.get("source") else None,
                    "source": "openalex",
                }
                if pdf_url:
                    print(f"  ✓ OA found via OpenAlex best_oa_location: {pdf_url[:80]}")
            
            # Always collect alternative URLs from locations
            for loc in w.get("locations", []):
                if loc.get("pdf_url") and loc["pdf_url"] != pdf_url:
                    alt_urls.append(loc["pdf_url"])
                if loc.get("landing_page_url") and ("bitstream" in loc.get("landing_page_url", "") or "retrieve" in loc.get("landing_page_url", "")):
                    if loc["landing_page_url"] != pdf_url:
                        alt_urls.append(loc["landing_page_url"])
            
            if not pdf_url and alt_urls:
                pdf_url = alt_urls.pop(0)
                print(f"  ✓ OA found in locations[0]: {pdf_url[:80]}")
            elif pdf_url:
                print(f"  📋 Also found {len(alt_urls)} alternative OA URLs (will try if primary fails)")
        
        # Special case: Wayback Machine URLs with HTML wrapper
        # Try adding 'id_' suffix to URL path for direct PDF
        if not pdf_url and "web.archive.org" in str(url or ""):
            wm_url = str(url).replace("/web/", "/web/").replace(".pdf", ".pdf")
            # Try the 'id_' modifier
            if "id_" not in wm_url:
                wm_url = wm_url.replace("/web/", "/web/id_/", 1) if "/web/" in wm_url else wm_url
                # Actually more precise: add 'id_' before the timestamp
                import re
                wm_fixed = re.sub(r'/web/(\d{14})/', r'/web/\1id_/', str(url or ""))
                if wm_fixed != str(url or ""):
                    pdf_url = wm_fixed
                    oa_info = {"source": "wayback-machine"}
                    print(f"  ✓ Trying Wayback Machine direct PDF: {pdf_url[:80]}")
        
        # Unpaywall
        # Semantic Scholar fallback
        if not pdf_url:
            try:
                ss_url = f"https://api.semanticscholar.org/graph/v1/paper/DOI/{doi}?fields=openAccessPdf"
                ss_raw = req(ss_url)
                ss_data = json.loads(ss_raw)
                if ss_data.get("openAccessPdf", {}).get("url"):
                    pdf_url = ss_data["openAccessPdf"]["url"]
                    oa_info = {"source": "semantic-scholar"}
                    print(f"  ✓ OA found via Semantic Scholar: {pdf_url[:80]}")
            except:
                pass
    
    if not pdf_url:
            upw = resolve_unpaywall(doi)
            if "oa_locations" in upw:
                for loc in upw["oa_locations"]:
                    if loc.get("url_for_pdf"):
                        pdf_url = loc["url_for_pdf"]
                        oa_info = {
                            "oa_status": upw.get("oa_status"),
                            "host_type": loc.get("host_type"),
                            "source": "unpaywall",
                        }
                        print(f"  ✓ OA found via Unpaywall: {pdf_url[:80]}")
                        break
    
    elif url:
        # Try direct URL
        pdf_url = url
        print(f"  Using provided URL")
    
    # Collect alt URLs for download retry (from OpenAlex locations + alt_urls already found)
    alt_download_urls = list(alt_urls) if 'alt_urls' in dir() else []
    if doi:
        oa_check = resolve_openalex(doi)
        if "results" in oa_check:
            w2 = oa_check["results"][0]
        elif "id" in oa_check:
            w2 = oa_check
        else:
            w2 = None
        if w2:
            for loc in w2.get("locations", []):
                if loc.get("pdf_url") and loc["pdf_url"] not in alt_download_urls:
                    alt_download_urls.append(loc["pdf_url"])
                if loc.get("landing_page_url") and ("bitstream" in loc.get("landing_page_url", "") or "retrieve" in loc.get("landing_page_url", "")):
                    if loc["landing_page_url"] not in alt_download_urls:
                        alt_download_urls.append(loc["landing_page_url"])
    
    if pdf_url:
        # Step 3: Download
        print(f"\n[3] Downloading...")
        dest = PROJECT_ROOT / "library" / corpus / f"{slug}.pdf"
        try:
            dl_info = download_pdf(pdf_url, dest, alt_urls=alt_download_urls)
            print(f"  ✓ Downloaded: {dest}")
            print(f"  ✓ Size: {dl_info['file_size_bytes']} bytes")
            print(f"  ✓ SHA256: {dl_info['sha256'][:16]}...")
            
            # Step 4: Create JSON
            print(f"\n[4] Creating JSON record...")
            provenance = {
                "access_status": "open",
                "oa_status": oa_info.get("oa_status"),
                "sha256": dl_info["sha256"],
                "file_size_bytes": dl_info["file_size_bytes"],
                "year": None,
                "source_url": url or pdf_url,
                "confidence": 0.9,
            }
            
            topics = args.topics or [slug]
            tradition = args.tradition or [corpus]
            
            work = make_work_json(slug, title, authors, doi, topics, tradition, f"library/{corpus}/{slug}.pdf", provenance, "", 0.9)
            
            work_path = PROJECT_ROOT / "content" / "works" / f"work_{slug}.json"
            work_path.write_text(json.dumps(work, indent=2))
            print(f"  ✓ Created: {work_path}")
            
            # Step 5: Summary
            print(f"\n{'='*60}")
            print(f"ACQUISITION COMPLETE")
            print(f"{'='*60}")
            print(f"  Title: {title[:60]}")
            print(f"  File: library/{corpus}/{slug}.pdf")
            print(f"  JSON: content/works/work_{slug}.json")
            
        except ValueError as e:
            print(f"  ✗ Download failed: {e}")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    else:
        print(f"\n  ✗ No OA copy found for this paper.")
        print(f"  Create record with access_status: paywalled_or_request_only")
        
        # Create limited record
        work_path = PROJECT_ROOT / "content" / "works" / f"work_{slug}.json"
        work = make_work_json(slug, title, authors, doi, args.topics or [], args.tradition or [], "", {
            "access_status": "paywalled_or_request_only",
            "source_url": url or f"https://doi.org/{doi}" if doi else "",
            "confidence": 0.5,
        }, "", 0.5)
        work_path.write_text(json.dumps(work, indent=2))
        print(f"  ✓ Created stub record: {work_path}")


if __name__ == "__main__":
    import urllib.parse
    
    parser = argparse.ArgumentParser(description="Paper Acquisition Pipeline")
    sub = parser.add_subparsers(dest="command")
    
    # acquire
    acq = sub.add_parser("acquire", help="Full pipeline: resolve + download + save")
    acq.add_argument("--doi", help="DOI to resolve")
    acq.add_argument("--title", help="Title to search")
    acq.add_argument("--url", help="Direct URL to PDF")
    acq.add_argument("--slug", help="Slug for the work (auto-generated from title if not given)")
    acq.add_argument("--corpus", help="Corpus directory (ficino/corbin/nanananda/bridges)")
    acq.add_argument("--topics", nargs="*", default=[])
    acq.add_argument("--tradition", nargs="*", default=[])
    acq.add_argument("--authors", nargs="*", default=[], help="Author names")
    acq.add_argument("--email", default=EMAIL)
    
    args = parser.parse_args()
    if args.command == "acquire":
        cmd_acquire(args)
    else:
        parser.print_help()
