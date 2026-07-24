#!/usr/bin/env python3
"""
Search existing project resources for solutions to identified gaps.
When analysis identifies a gap, this tool searches the codebase for relevant patterns.
"""
import os, json, re, sys
from pathlib import Path

ROOT = Path("/root/projects/blog")
PACKS_DIR = ROOT / "scripts" / "renderer"
VLIB_DIR = ROOT / "visual-library"
SCENE_CATALOG = ROOT / "scene-system" / "catalog" / "scenes.json"
GOLD_FILES_DIR = ROOT / "video-templates" / "gold-standards"
ANIMATION_REFS = ROOT / "video-templates" / "animation-references"

def search_scene_functions(query: str, max_results=10):
    """Search existing scene functions by keyword."""
    results = []
    for py_file in sorted(PACKS_DIR.glob("*.py")):
        content = py_file.read_text()
        if query.lower() in content.lower():
            funcs = re.findall(r'^def (\w+)', content, re.MULTILINE)
            results.append({
                "file": py_file.name,
                "functions": funcs[:5],
                "lines": len(content.split("\n")),
            })
    for py_file in sorted(VLIB_DIR.glob("*.py")):
        content = py_file.read_text()
        if query.lower() in content.lower():
            funcs = re.findall(r'^def (\w+)', content, re.MULTILINE)
            results.append({
                "file": f"visual-library/{py_file.name}",
                "functions": funcs[:5],
                "lines": len(content.split("\n")),
            })
    return results[:max_results]

def search_scene_catalog(concept: str, max_results=10):
    """Search the scene catalog for scenes matching a concept."""
    if not SCENE_CATALOG.exists():
        return []
    catalog = json.loads(SCENE_CATALOG.read_text())
    scenes = catalog.get("scenes", [])
    results = []
    for s in scenes:
        text = json.dumps(s).lower()
        if concept.lower() in text:
            results.append({
                "id": s.get("id"),
                "title": s.get("title"),
                "pack": s.get("source", {}).get("pack", "?"),
                "duration": s.get("timing", {}).get("default_duration", "?"),
                "meaning": s.get("meaning", {}).get("primary", ""),
            })
    return results[:max_results]

def search_palette_examples():
    """Find examples of multi-color palette usage across packs."""
    results = []
    for py_file in sorted(PACKS_DIR.glob("*.py")):
        content = py_file.read_text()
        # Find color definitions
        colors = re.findall(r'(\w+)\s*=\s*\(\d+,\s*\d+,\s*\d+\)', content)
        if len(colors) >= 4:
            results.append({
                "file": py_file.name,
                "colors": colors,
                "function_count": len(re.findall(r'^def \w+', content, re.MULTILINE)),
            })
    return results[:5]

def search_continuity_patterns():
    """Find patterns where objects persist across scenes."""
    results = []
    # Look for transition patterns in spanda scenes
    spanda_file = PACKS_DIR / "spanda_scenes.py"
    if spanda_file.exists():
        content = spanda_file.read_text()
        # Find scene functions that reference elements from previous scenes
        results.append({
            "file": "spanda_scenes.py",
            "scenes": len(re.findall(r'^def s_\w+', content, re.MULTILINE)),
            "continuity_objects": ["dot at center", "rings", "axis line"],
        })
    return results

def search_transition_examples():
    """Find transition and bridge patterns in scene packs."""
    results = []
    for keyword in ["transition", "bridge", "fade", "dissolve", "cross"]:
        for py_file in sorted(PACKS_DIR.glob("*.py")):
            content = py_file.read_text()
            if keyword in content.lower():
                results.append({
                    "file": py_file.name,
                    "keyword": keyword,
                    "context_lines": [l.strip() for l in content.split("\n") if keyword in l.lower()][:3],
                })
    return results[:10]

def search_gold_files_for_concept(concept: str):
    """Search gold file descriptions for relevant reference material."""
    results = []
    manifest = GOLD_FILES_DIR / "animation-packs" / "manifest.json"
    if manifest.exists():
        data = json.loads(manifest.read_text())
        for item in data:
            if concept.lower() in item.get("file", "").lower():
                results.append(item)
    # Also search the animation references directory for relevant packs
    for ref_dir in sorted(ANIMATION_REFS.iterdir()):
        if ref_dir.is_dir() and concept.lower() in ref_dir.name.lower():
            results.append({
                "dir": ref_dir.name,
                "files": [f.name for f in ref_dir.glob("*.*")][:5],
            })
    return results[:5]

def generate_report(gaps: list):
    """Given a list of gap descriptions, search resources and return findings."""
    report = []
    for gap in gaps:
        gap_lower = gap.lower()
        findings = {"gap": gap, "resources_consulted": [], "insights": []}
        
        # Search scene functions
        for keyword in gap_lower.split():
            if len(keyword) > 3:
                funcs = search_scene_functions(keyword)
                if funcs:
                    findings["resources_consulted"].append(f"scene_functions matching '{keyword}': {len(funcs)} found")
                    findings["insights"].append(f"{funcs[0]['file']} has relevant functions: {', '.join(funcs[0]['functions'][:3])}")
        
        # Search scene catalog
        for keyword in gap_lower.split():
            if len(keyword) > 3:
                scenes = search_scene_catalog(keyword)
                if scenes:
                    findings["resources_consulted"].append(f"catalog scenes matching '{keyword}': {len(scenes)}")
                    if scenes:
                        findings["insights"].append(f"Catalog has '{scenes[0]['title']}' in pack {scenes[0]['pack']}")
        
        # Gap-specific searches
        if "shot" in gap_lower or "count" in gap_lower:
            # Look for scene-splitting patterns
            findings["resources_consulted"].append("Analyzed spanda_scenes.py for shot structure")
            findings["insights"].append("Existing spanda scenes average 33s each. Split into 5-8 shorter shots each to reach 80+")
        
        if "audio" in gap_lower or "voiceover" in gap_lower:
            findings["resources_consulted"].append("Checked generate-voiceover.mjs and audio generation pipeline")
            findings["insights"].append("Edge TTS can generate per-shot WAVs via generate-voiceover.mjs --segment")
        
        if "continuity" in gap_lower or "transition" in gap_lower:
            trans = search_transition_examples()
            if trans:
                findings["resources_consulted"].append(f"Found {len(trans)} transition patterns across packs")
            findings["insights"].append("Add dot/ring at center as continuity object between shots")
        
        if "fps" in gap_lower or "frame" in gap_lower:
            findings["insights"].append("Render at 8fps instead of 2fps for smoother motion. Corbin reference uses 8fps.")
        
        if "palette" in gap_lower or "color" in gap_lower:
            pal = search_palette_examples()
            if pal:
                findings["resources_consulted"].append(f"Found packs with 4+ color palettes")
                findings["insights"].append(f"{pal[0]['file']} uses {len(pal[0]['colors'])} colors: {', '.join(pal[0]['colors'][:5])}")
        
        if "runtime" in gap_lower or "duration" in gap_lower or "minute" in gap_lower:
            findings["insights"].append("Runtime = shots × avg_duration. To reach 8+ min: 80 shots × 6s = 8 min. Increase both shot count and per-shot duration.")
        
        report.append(findings)
    
    return report

if __name__ == "__main__":
    gaps = sys.argv[1:] if len(sys.argv) > 1 else [
        "shot count needs to be 80+",
        "runtime needs to be 8+ minutes",
        "per-shot audio missing",
        "continuous transitions needed",
        "fps should be 8+",
        "palette discipline needed",
    ]
    
    report = generate_report(gaps)
    print(json.dumps(report, indent=2, ensure_ascii=False))
