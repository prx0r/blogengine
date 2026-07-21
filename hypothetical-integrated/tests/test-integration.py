#!/usr/bin/env python3
"""Hypothetical tests for the integrated system.
   Run: python3 hypothetical-integrated/tests/test-integration.py
   Tests are SAFE — they only read data, never write."""
import json, os, glob, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

PASS, FAIL = 0, 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name} — {detail}")

print("=" * 50)
print("INTEGRATION TESTS")
print("=" * 50)

# ─── 1. Concepts exist and have required fields ───────────────
print("\n--- Concepts ---")
for cf in sorted(glob.glob("content/glossary/concepts/*.json")):
    c = json.load(open(cf))
    cid = c.get("id", "?")
    check(f"{cid}: has id", "id" in c)
    check(f"{cid}: has name", "name" in c)
    check(f"{cid}: has definition", "definition" in c and len(c["definition"]) > 10)
    # Check for art and research_objects fields (added by schema alignment)
    check(f"{cid}: has art[]", isinstance(c.get("art"), list))
    check(f"{cid}: has research_objects[]", isinstance(c.get("research_objects"), list))

# ─── 2. ROs have required fields ──────────────────────────────
print("\n--- Research Objects ---")
for rf in sorted(glob.glob("content/research-objects/ro-*/ro.json")):
    ro = json.load(open(rf))
    rid = ro.get("ro_id", "?")
    check(f"{rid}: has ro_id", "ro_id" in ro)
    check(f"{rid}: has title", "title" in ro)
    check(f"{rid}: has sources[]", isinstance(ro.get("sources"), list))
    check(f"{rid}: has body[]", isinstance(ro.get("body"), list))
    check(f"{rid}: has coverage", isinstance(ro.get("coverage"), dict))
    check(f"{rid}: has issues[]", isinstance(ro.get("issues"), list))
    check(f"{rid}: all passages have source", all(p.get("source") or p.get("source_id") for p in ro.get("body", [])))
    check(f"{rid}: all sources have id", all(s.get("id") or s.get("source_id") for s in ro.get("sources", [])))

# ─── 3. Works have tier and provenance ─────────────────────────
print("\n--- Works ---")
for wf in sorted(glob.glob("content/works/work_*.json"))[:20]:
    w = json.load(open(wf))
    wid = w.get("work_id", "?")[:25]
    check(f"{wid}: has tier", w.get("analysis", {}).get("tier") in [1, 2])
    check(f"{wid}: has provenance", bool(w.get("provenance")))

tier1 = sum(1 for f in glob.glob("content/works/work_*.json") if json.load(open(f)).get("analysis",{}).get("tier")==1)
tier2 = sum(1 for f in glob.glob("content/works/work_*.json") if json.load(open(f)).get("analysis",{}).get("tier")==2)
check(f"Tier distribution", tier1 + tier2 > 0, f"T1:{tier1} T2:{tier2}")

# ─── 4. Essays exist ──────────────────────────────────────────
print("\n--- Essays ---")
essays = sorted(glob.glob("content/glossary/essays/*.json"))
check(f"Essays exist", len(essays) > 0, f"{len(essays)} found")
if essays:
    e = json.load(open(essays[0]))
    check(f"Essay has body", "body" in e)
    check(f"Essay has concepts/tags", "concepts" in e or "tags" in e)

# ─── 5. RO index exists and is valid ──────────────────────────
print("\n--- RO Index ---")
if os.path.exists("content/research-objects/_index.json"):
    idx = json.load(open("content/research-objects/_index.json"))
    check(f"Index has by_family", "by_family" in idx)
    check(f"Index has by_status", "by_status" in idx)
    check(f"Index has by_tradition", "by_tradition" in idx)
else:
    check(f"_index.json exists", False, "Run link-silos.py first")

# ─── 6. Explore skill works ──────────────────────────────────
print("\n--- Explore Skill ---")
sys.path.insert(0, "hypothetical-integrated/skills")
try:
    from explore import search, format_response
    r = search("daimon")
    check(f"Explore finds concepts", len(r.get("concepts", [])) > 0)
    check(f"Explore finds ROs or works", len(r.get("ros", [])) + len(r.get("works", [])) > 0)
    check(f"Explore identifies gaps", isinstance(r.get("gaps"), list))
except Exception as e:
    check(f"Explore skill loads", False, str(e))

# ─── 7. Cross-reference integrity ─────────────────────────────
print("\n--- Cross-References ---")
# Check that concept research_objects[] point to existing ROs
existing_ros = set()
for rf in glob.glob("content/research-objects/ro-*/ro.json"):
    existing_ros.add(json.load(open(rf)).get("ro_id"))
for cf in sorted(glob.glob("content/glossary/concepts/*.json")):
    c = json.load(open(cf))
    for ro_ref in c.get("research_objects", []):
        check(f"{c['id']} → {ro_ref}", ro_ref in existing_ros, f"{ro_ref} not found")

# ─── Summary ──────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"RESULTS: {PASS} passed, {FAIL} failed")
print(f"{'='*50}")
if FAIL > 0:
    print(f"\nRun 'python3 hypothetical-integrated/scripts/link-silos.py' to fix some failures.")
    sys.exit(1)
else:
    print(f"\nAll integration checks pass.")
