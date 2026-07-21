#!/usr/bin/env python3
"""Hermes skill: /explore — guided exploration of the internal library.
   Contemplative assistant: surfaces what we know AND what we don't.
   Usage (in Hermes chat): /explore "the daimon in different traditions"
   Or: /explore ficino astrology"""
import json, os, glob, sys
from pathlib import Path

CONCEPTS_DIR = "content/glossary/concepts"
ROS_DIR = "content/research-objects"
WORKS_DIR = "content/works"
ESSAYS_DIR = "content/glossary/essays"

def load_json(path):
    try: return json.load(open(path))
    except: return {}

def search(query):
    """Search all silos for matches. Returns organized results."""
    q = query.lower()
    results = {"concepts": [], "ros": [], "works": [], "essays": [], "gaps": []}
    
    # 1. Search concepts
    for f in sorted(glob.glob(f"{CONCEPTS_DIR}/*.json")):
        c = load_json(f)
        if q in c.get("name", "").lower() or q in json.dumps(c.get("synonyms", [])).lower():
            results["concepts"].append(c)
    
    # 2. Search ROs
    for rf in sorted(glob.glob(f"{ROS_DIR}/ro-*/ro.json")):
        ro = load_json(rf)
        if q in json.dumps(ro).lower():
            results["ros"].append(ro)
    
    # 3. Search works
    for wf in sorted(glob.glob(f"{WORKS_DIR}/work_*.json")):
        w = load_json(wf)
        if q in w.get("title", "").lower():
            results["works"].append(w)
    
    # 4. Search essays
    for ef in sorted(glob.glob(f"{ESSAYS_DIR}/*.json")):
        e = load_json(ef)
        if q in e.get("title", "").lower() or q in json.dumps(e.get("concepts", [])).lower():
            results["essays"].append(e)
    
    # 5. Detect gaps
    concept_names = [c.get("name", "").lower() for c in results["concepts"]]
    if not concept_names:
        results["gaps"].append(f"No concept found for '{query}'. Need to create one?")
    
    ros_about_topic = [r for r in results["ros"] if q in json.dumps(r.get("body", [])).lower()]
    if not ros_about_topic:
        results["gaps"].append(f"No Research Objects on '{query}'. Need to compile one?")
    
    tier2_works = [w for w in results["works"] if w.get("analysis", {}).get("tier") == 2]
    if not tier2_works:
        results["gaps"].append(f"No Tier 2 commentaries on '{query}'. Need to acquire?")
    
    return results

def format_response(results):
    """Format search results as a contemplative response."""
    lines = []
    
    # Concepts
    if results["concepts"]:
        lines.append("## Concepts")
        for c in results["concepts"][:3]:
            lines.append(f"  • **{c.get('name')}**: {c.get('definition', '')[:120]}...")
            if c.get("astrology"):
                a = c["astrology"]
                lines.append(f"    Astrology: {a.get('planet', 'N/A')}, House {a.get('house', 'N/A')}")
    else:
        lines.append("## Concept\n  (none found)")
    
    # Research Objects
    if results["ros"]:
        lines.append(f"\n## Research Objects")
        for r in results["ros"][:3]:
            coverage = sum(1 for c in r.get("coverage", {}).values() if c.get("status") == "substantial")
            total = len(r.get("coverage", {}))
            lines.append(f"  • **{r.get('ro_id')}** — {r.get('status')} ({coverage}/{total} sections covered)")
    else:
        lines.append(f"\n## Research Objects\n  (none compiled yet)")
    
    # Works
    if results["works"]:
        lines.append(f"\n## Acquired Papers")
        for w in results["works"][:3]:
            tier = w.get("analysis", {}).get("tier", "?")
            status = w.get("provenance", {}).get("access_status", "unknown")
            lines.append(f"  • {w.get('title', '')[:50]} — Tier {tier}, {status}")
    else:
        lines.append(f"\n## Acquired Papers\n  (none found)")
    
    # Gaps
    if results["gaps"]:
        lines.append(f"\n## Gaps & Opportunities")
        for g in results["gaps"]:
            lines.append(f"  • {g}")
    
    # Connection suggestions
    if len(results["ros"]) >= 2:
        lines.append(f"\n## Connections")
        names = [r.get("ro_id", "") for r in results["ros"][:2]]
        lines.append(f"  These ROs might be related: {' vs '.join(names)}")
    
    return "\n".join(lines)

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "daimon"
    results = search(query)
    print(format_response(results))
    print(f"\n---")
    print(f"Total: {len(results['concepts'])} concepts, {len(results['ros'])} ROs, "
          f"{len(results['works'])} works, {len(results['essays'])} essays, "
          f"{len(results['gaps'])} gaps")
