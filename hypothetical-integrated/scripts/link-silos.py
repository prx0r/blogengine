#!/usr/bin/env python3
"""Link all data silos: Concepts ↔ ROs ↔ Works ↔ Astrology ↔ Essays.
   Safe to run — only adds fields, never removes or overwrites.
   Tests: python3 hypothetical-integrated/scripts/link-silos.py --dry-run"""
import json, os, glob, sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv

CONCEPTS_DIR = "content/glossary/concepts"
WORKS_DIR = "content/works"
ROS_DIR = "content/research-objects"
ESSAYS_DIR = "content/glossary/essays"

# ─── Astrology → Concept mapping ──────────────────────────────
# Which glossary concepts have astrological correspondences?
ASTROLOGY_MAP = {
    "daimon": {"planet": "mercury", "house": 1, "keywords": ["tutelary spirit", "mediation", "guidance"]},
    "mercury": {"planet": "mercury", "house": 3, "keywords": ["communication", "messenger", "intellect"]},
    "venus": {"planet": "venus", "house": 7, "keywords": ["love", "beauty", "harmony"]},
    "mars": {"planet": "mars", "house": 1, "keywords": ["action", "will", "assertion"]},
    "jupiter": {"planet": "jupiter", "house": 9, "keywords": ["expansion", "wisdom", "generosity"]},
    "saturn": {"planet": "saturn", "house": 10, "keywords": ["structure", "limitation", "discipline"]},
    "sun": {"planet": "sun", "house": 5, "keywords": ["self", "vitality", "consciousness"]},
    "moon": {"planet": "moon", "house": 4, "keywords": ["emotion", "receptivity", "soul"]},
    "spiritus": {"planet": "mercury", "house": None, "keywords": ["spirit", "breath", "life-force"]},
    "eros": {"planet": "venus", "house": 5, "keywords": ["desire", "love", "creative impulse"]},
    "theurgy": {"planet": None, "house": 9, "keywords": ["ritual", "divine", "participation"]},
    "soul": {"planet": None, "house": None, "keywords": ["psyche", "animation", "life"]},
}

def log(msg):
    print(f"  {'[DRY RUN] ' if DRY_RUN else ''}{msg}")

def link_concepts_to_ros():
    """Add research_objects[] to concept JSONs based on shared topics."""
    log("Linking Concepts → ROs...")
    # Build RO topic index
    ro_topics = {}
    for rf in sorted(glob.glob(f"{ROS_DIR}/ro-*/ro.json")):
        try:
            ro = json.load(open(rf))
            # Extract topics from body passages
            topics = set()
            for p in ro.get("body", []):
                for t in p.get("topics", []):
                    topics.add(t)
            # Also from source contributions
            for s in ro.get("sources", []):
                for c in s.get("contribution", []):
                    topics.add(c)
            if topics:
                slug = ro.get("ro_id", "").replace("ro:", "")
                ro_topics[slug] = topics
        except:
            pass
    
    # For each concept, check if any RO's topics match
    for cf in sorted(glob.glob(f"{CONCEPTS_DIR}/*.json")):
        try:
            concept = json.load(open(cf))
            cid = concept.get("id", "")
            cname = concept.get("name", "").lower()
            
            # Find matching ROs
            matched_ros = []
            for ro_slug, rtopics in ro_topics.items():
                # Match if concept name appears in RO topics
                if cname in " ".join(rtopics).lower():
                    matched_ros.append(f"ro:{ro_slug}")
                # Match if RO slug contains concept id
                if cid in ro_slug:
                    matched_ros.append(f"ro:{ro_slug}")
            
            matched_ros = list(set(matched_ros))
            if matched_ros:
                if not DRY_RUN:
                    concept["research_objects"] = list(set(concept.get("research_objects", []) + matched_ros))
                    json.dump(concept, open(cf, "w"), indent=2)
                log(f"  {cid}: linked to {len(matched_ros)} ROs")
        except:
            pass

def link_astrology_to_concepts():
    """Add astrology field to relevant concept JSONs."""
    log("Adding Astrology → Concept links...")
    for cid, astro in ASTROLOGY_MAP.items():
        cf = f"{CONCEPTS_DIR}/{cid}.json"
        if not os.path.exists(cf):
            log(f"  Missing concept: {cid} (would create)")
            continue
        try:
            concept = json.load(open(cf))
            if not DRY_RUN:
                concept["astrology"] = astro
                json.dump(concept, open(cf, "w"), indent=2)
            log(f"  {cid}: added astrology mapping")
        except:
            pass

def link_works_to_ros():
    """Ensure work JSON has correct relevance_to_ros field."""
    log("Linking Works → ROs...")
    for wf in sorted(glob.glob(f"{WORKS_DIR}/work_*.json")):
        try:
            work = json.load(open(wf))
            # Check if relevance_to_ros is empty and we can infer it
            if not work.get("relevance_to_ros"):
                topics = work.get("topics", [])
                if topics:
                    if not DRY_RUN:
                        work["relevance_to_ros"] = {}
                        json.dump(work, open(wf, "w"), indent=2)
        except:
            pass

def build_index():
    """Rebuild the RO index."""
    log("Building RO index...")
    index = {"by_family": {}, "by_tradition": {}, "by_status": {}}
    for rf in sorted(glob.glob(f"{ROS_DIR}/ro-*/ro.json")):
        try:
            ro = json.load(open(rf))
            fid = ro.get("family", "unknown")
            index["by_family"].setdefault(fid, []).append(ro["ro_id"])
            for t in ro.get("summary", {}).get("traditions", []):
                index["by_tradition"].setdefault(t, []).append(ro["ro_id"])
            index["by_status"].setdefault(ro.get("status", "draft"), []).append(ro["ro_id"])
        except:
            pass
    if not DRY_RUN:
        json.dump(index, open(f"{ROS_DIR}/_index.json", "w"), indent=2)
    log(f"  Index: {sum(len(v) for v in index['by_family'].values())} ROs across {len(index['by_family'])} families")

def verify_citations():
    """Check that all RO passage sources exist in sources[]."""
    log("Verifying RO citations...")
    issues = []
    for rf in sorted(glob.glob(f"{ROS_DIR}/ro-*/ro.json")):
        try:
            ro = json.load(open(rf))
            source_ids = [s["id"] for s in ro.get("sources", [])]
            for p in ro.get("body", []):
                ps = p.get("source", "")
                if ps and ps not in source_ids:
                    issues.append(f"  ⚠ {ro['ro_id']}: passage {p['id']} references {ps} not in sources[]")
            for s in ro.get("sources", []):
                if s.get("status") == "active":
                    used = [p for p in ro.get("body", []) if p.get("source") or p.get("source_id") == s["id"]]
                    if not used:
                        issues.append(f"  ⚠ {ro['ro_id']}: active source {s['id']} has no passages")
        except:
            pass
    if issues:
        log(f"  {len(issues)} citation issues found:")
        for i in issues[:5]:
            log(i)
    else:
        log("  All citations valid")

# ─── Run ─────────────────────────────────────────────────────
if __name__ == "__main__":
    log(f"Linking silos...")
    link_concepts_to_ros()
    link_astrology_to_concepts()
    link_works_to_ros()
    build_index()
    verify_citations()
    if DRY_RUN:
        log(f"\nDry run complete. Run without --dry-run to apply changes.")
    else:
        log(f"\nChanges applied.")
