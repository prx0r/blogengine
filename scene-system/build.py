#!/usr/bin/env python3
"""Build the formal scene system from all existing assets."""
import json, os, re, shutil
from pathlib import Path

ROOT = Path(__file__).parent
BLOG = ROOT.parent

def add_to(concept_map, concept, s):
    t = str(concept).strip().lower()
    if not t or len(t) <= 3:
        return
    if t not in concept_map:
        concept_map[t] = []
    concept_map[t].append({
        "id": s.get("id", ""),
        "title": s.get("title", ""),
        "pack": s.get("source", {}).get("pack", ""),
        "duration": s.get("timing", {}).get("default_duration", 0),
    })

# ── 1. Copy master catalog ──
src = BLOG / "visual-library" / "catalog" / "scenes.json"
if src.exists():
    shutil.copy2(src, ROOT / "catalog" / "scenes.json")
    catalog = json.loads(src.read_text())
    print(f"Catalog: {catalog['total_scenes']} scenes, {catalog['total_packs']} packs")
else:
    catalog = {"scenes": [], "total_scenes": 0, "total_packs": 0}
    print("WARN: no master catalog found")

# ── 2. Build template family definitions ──
templates = {}
for s in catalog.get("scenes", []):
    v = s.get("visual", {})
    layout = v.get("layout", "unknown")
    if layout not in templates:
        templates[layout] = {
            "name": layout.replace("_", " ").title(),
            "key": layout, "scene_count": 0,
            "primitives": set(), "operators": set(), "backgrounds": set(),
            "example_scenes": [],
        }
    templates[layout]["scene_count"] += 1
    templates[layout]["primitives"].update(v.get("primitives", []))
    templates[layout]["operators"].update(v.get("operators", []))
    templates[layout]["backgrounds"].add(v.get("background", "unknown"))
    if len(templates[layout]["example_scenes"]) < 4:
        templates[layout]["example_scenes"].append({
            "title": s.get("title", ""),
            "id": s.get("id", ""),
            "duration": s.get("timing", {}).get("default_duration", 0),
        })

for t in templates.values():
    t["primitives"] = sorted(t["primitives"])
    t["operators"] = sorted(t["operators"])
    t["backgrounds"] = sorted(t["backgrounds"])

(ROOT / "templates" / "_index.json").write_text(json.dumps({
    "total_templates": len(templates),
    "templates": templates,
}, indent=2))

for key, t in templates.items():
    (ROOT / "templates" / f"{key}.json").write_text(json.dumps(t, indent=2))
print(f"Templates: {len(templates)} families written")

# ── 3. Build concept → scene mappings ──
concept_map = {}
for s in catalog.get("scenes", []):
    m = s.get("meaning", {})
    if isinstance(m, str):
        add_to(concept_map, m, s)
        continue
    texts = []
    if isinstance(m, dict):
        texts.append(m.get("primary", ""))
        texts.extend(m.get("secondary", []))
        texts.extend(m.get("narrative_functions", []))
    v = s.get("visual", {})
    texts.extend(v.get("primitives", []))
    texts.extend(v.get("operators", []))
    texts.append(v.get("layout", ""))
    for t in texts:
        add_to(concept_map, t, s)

for concept, scenes in concept_map.items():
    key = re.sub(r'[^a-z0-9]+', '_', concept).strip('_')[:80]
    (ROOT / "concepts" / f"{key}.json").write_text(json.dumps({
        "concept": concept,
        "scene_count": len(scenes),
        "scenes": scenes[:30],
    }, indent=2))

sorted_c = sorted(concept_map.items(), key=lambda x: -len(x[1]))
(ROOT / "concepts" / "_index.json").write_text(json.dumps({
    "total_concepts": len(concept_map),
    "concepts": [{"concept": k, "scene_count": len(v)} for k, v in sorted_c[:200]],
}, indent=2))
print(f"Concepts: {len(concept_map)} unique tags written")

# ── 4. Primitives ──
prims = set()
for s in catalog.get("scenes", []):
    for p in s.get("visual", {}).get("primitives", []):
        if p: prims.add(p)
(ROOT / "primitives" / "_index.json").write_text(json.dumps({
    "total_primitives": len(prims),
    "primitives": sorted(prims),
}, indent=2))
for p in sorted(prims):
    (ROOT / "primitives" / f"{p}.json").write_text(json.dumps({
        "primitive": p, "used_in_scenes": [],
        "description": "", "parameters": [],
    }, indent=2))
print(f"Primitives: {len(prims)} written")

# ── 5. Instance symlinks ──
src_inst = BLOG / "visual-library" / "instances"
dst_inst = ROOT / "instances"
if src_inst.exists() and not dst_inst.exists():
    os.symlink(os.path.relpath(src_inst, ROOT), dst_inst)
    print("Instances: symlinked")

# ── 6. Pack index ──
packs = {}
for s in catalog.get("scenes", []):
    pk = s.get("source", {}).get("pack", "unknown")
    if pk not in packs:
        packs[pk] = {"key": pk, "scene_count": 0, "scenes": []}
    packs[pk]["scene_count"] += 1
    packs[pk]["scenes"].append({
        "id": s.get("id", ""),
        "title": s.get("title", ""),
        "duration": s.get("timing", {}).get("default_duration", 0),
    })
(ROOT / "packs" / "_index.json").write_text(json.dumps({
    "total_packs": len(packs),
    "packs": list(packs.values()),
}, indent=2))
print(f"Packs: {len(packs)} written")

# ── 7. Renderer/engine location index ──
(ROOT / "ENGINE.md").write_text(f"""# Scene Engine Locations

| Component | Path |
|-----------|------|
| Renderer core | `scripts/renderer/renderer.py` |
| Spanda scenes | `scripts/renderer/spanda_scenes.py` |
| VBT scenes | `scripts/renderer/vbt_magnum.py` |
| Visual-library packs | `visual-library/` |
| Scene catalog | `visual-library/catalog/scenes.json` |
| Scene instances | `visual-library/instances/` |
| Animation references | `video-templates/animation-references/` |
| Gold standards | `video-templates/gold-standards/` |
| Video modules | `video-templates/modules/` |
| Visual director | `scripts/visual-director.py` |
| Build pipeline | `scripts/build-timed-video.py` |
| Sync to R2 | `scripts/sync-review.py` |

## Render Flow

```
Essay (expansion-essay*.md)
  -> Visual Director (parse -> scene manifest)
  -> PIL draft (2fps, scripts/renderer/)
  -> Skia final (12fps, visionary-renderer/)
  -> FableCut timeline (port 7777)
  -> Upload to R2 (scripts/sync-review.py)
  -> Review at studio.tantrafiles.xyz
```
""")

print("Done. All files written.")
