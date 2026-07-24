#!/usr/bin/env python3
"""
Standardized video output analysis tool.
Analyzes any produced video pack and generates a structured report.

Usage:
    python3 factory/scripts/analyze-output.py <path-to-pack-directory>
    
The pack directory should contain:
    - storyboard.json         (shot-by-shot breakdown)
    - visual_program.json     (renderer-neutral spec)
    - PRODUCTION_BLUEPRINT.md (production notes)
    - source_essay.md         (source text)
    - narration_script.txt    (narration text)
    - clips/*.mp4             (rendered clips)
    - audio_segments/*.wav    (audio per shot)
    - thumbs/*.jpg            (shot thumbnails)
    - the_*_full_film.mp4     (final assembly)
"""
import json, os, sys, subprocess
from collections import Counter
from datetime import timedelta

def analyze_pack(pack_dir):
    report = {"pack": os.path.basename(pack_dir.rstrip("/"))}
    
    # 1. Load all metadata files
    paths = {
        "storyboard": os.path.join(pack_dir, "storyboard.json"),
        "visual_program": os.path.join(pack_dir, "visual_program.json"),
        "blueprint": os.path.join(pack_dir, "PRODUCTION_BLUEPRINT.md"),
        "essay": os.path.join(pack_dir, "source_essay.md"),
        "narration": os.path.join(pack_dir, "narration_script.txt"),
        "render_script": os.path.join(pack_dir, "render_world_between_worlds.py"),
        "concat": os.path.join(pack_dir, "concat.txt"),
    }
    
    # 2. Shot-level analysis
    if os.path.exists(paths["storyboard"]):
        with open(paths["storyboard"]) as f:
            sb = json.load(f)
        shots = sb["shots"]
        total_dur = sum(s["duration"] for s in shots)
        
        report["shots"] = {
            "count": len(shots),
            "runtime_seconds": round(total_dur, 1),
            "runtime_minutes": round(total_dur / 60, 1),
            "avg_shot_seconds": round(total_dur / len(shots), 1),
            "fps": sb.get("fps", 30),
            "resolution": sb.get("resolution", [1280, 720]),
        }
        
        # Chapters
        chapters = []
        ch_shots = {}
        for s in shots:
            ch = s.get("chapter", "unknown")
            if ch not in ch_shots:
                ch_shots[ch] = {"shots": [], "title": s.get("chapter_title", ch)}
            ch_shots[ch]["shots"].append(s)
        
        report["chapters"] = []
        for ch, data in ch_shots.items():
            dur = sum(s["duration"] for s in data["shots"])
            report["chapters"].append({
                "id": ch,
                "title": data["title"],
                "shot_count": len(data["shots"]),
                "duration_seconds": round(dur, 1),
                "duration_percent": round(dur / total_dur * 100, 1),
            })
        
        # Visual modes
        mode_counts = Counter(s.get("mode", "unknown") for s in shots)
        report["visual_modes"] = {
            "unique_count": len(mode_counts),
            "modes": [{"mode": m, "count": c, "total_seconds": round(sum(
                s["duration"] for s in shots if s.get("mode") == m
            ), 1)} for m, c in mode_counts.most_common()],
        }
        
        # Transitions
        tin = Counter(s.get("transition_in", "") for s in shots)
        tout = Counter(s.get("transition_out", "") for s in shots)
        report["transitions"] = {
            "in": [{"type": t, "count": c} for t, c in tin.most_common(5)],
            "out": [{"type": t, "count": c} for t, c in tout.most_common(5)],
        }
        
        # Continuity objects
        cont = Counter(s.get("continuity_object", "") for s in shots)
        report["continuity"] = [{"object": c, "shots": n} for c, n in cont.most_common(5)]
    
    # 3. Visual Program analysis
    if os.path.exists(paths["visual_program"]):
        with open(paths["visual_program"]) as f:
            vp = json.load(f)
        
        report["visual_program"] = {
            "schema": vp.get("schema_version", "unknown"),
            "thesis": vp.get("visual_thesis", ""),
            "palette": vp.get("palette", {}),
            "entities": [{"id": e["id"], "archetype": e["archetype"], "continuity": e["continuity"]}
                        for e in vp.get("entities", [])],
            "operators": vp.get("operators", []),
        }
    
    # 4. Source text analysis
    if os.path.exists(paths["essay"]):
        with open(paths["essay"]) as f:
            text = f.read()
        report["source"] = {
            "words": len(text.split()),
            "chars": len(text),
            "lines": len(text.split("\n")),
        }
    
    # 5. Render script analysis
    if os.path.exists(paths["render_script"]):
        with open(paths["render_script"]) as f:
            script = f.read()
        scene_count = script.count("def scene_")
        report["render"] = {
            "scene_functions": scene_count,
            "lines": len(script.split("\n")),
        }
    
    # 6. Clip analysis
    clips_dir = os.path.join(pack_dir, "clips")
    if os.path.exists(clips_dir):
        clips = [f for f in os.listdir(clips_dir) if f.endswith(".mp4")]
        clip_sizes = []
        for c in clips[:5]:
            sz = os.path.getsize(os.path.join(clips_dir, c))
            clip_sizes.append({"name": c, "size_kb": round(sz / 1024)})
        report["clips"] = {
            "count": len(clips),
            "sample": clip_sizes,
            "total_mb": round(sum(os.path.getsize(os.path.join(clips_dir, c)) for c in clips) / 1024 / 1024, 1),
        }
    
    # 7. Audio analysis
    audio_dir = os.path.join(pack_dir, "audio_segments")
    if os.path.exists(audio_dir):
        audio_files = [f for f in os.listdir(audio_dir) if f.endswith(".wav")]
        report["audio"] = {"segments": len(audio_files)}
    
    # 8. Final film analysis (if exists)
    for fname in os.listdir(pack_dir):
        if fname.endswith(".mp4") and "full_film" in fname:
            film_path = os.path.join(pack_dir, fname)
            film_size = os.path.getsize(film_path)
            try:
                dur = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=noprint_wrappers=1:nokey=1", film_path],
                    capture_output=True, text=True, timeout=10
                )
                film_duration = float(dur.stdout.strip()) if dur.stdout.strip() else None
            except:
                film_duration = None
            report["final_film"] = {
                "file": fname,
                "size_mb": round(film_size / 1024 / 1024, 1),
                "duration_seconds": round(film_duration, 1) if film_duration else None,
            }
    
    # 9. Quality assessment
    report["quality"] = assess_quality(report)
    
    return report

def assess_quality(report):
    """Score the output against gold-standard benchmarks."""
    notes = []
    score = 0
    
    s = report.get("shots", {})
    count = s.get("count", 0)
    avg = s.get("avg_shot_seconds", 0)
    
    # Shot count
    if count >= 80:
        notes.append(f"✅ Shot count ({count}) meets gold standard (80+). Score +20")
        score += 20
    elif count >= 50:
        notes.append(f"🟡 Shot count ({count}) meets silver standard (50+). Score +10")
        score += 10
    else:
        notes.append(f"🔴 Shot count ({count}) below standard. Score +0")
    
    # Avg shot duration (gold: 5-10s)
    if 5 <= avg <= 10:
        notes.append(f"✅ Avg shot ({avg}s) in ideal range (5-10s). Score +20")
        score += 20
    elif 3 <= avg <= 12:
        notes.append(f"🟡 Avg shot ({avg}s) in acceptable range (3-12s). Score +10")
        score += 10
    else:
        notes.append(f"🔴 Avg shot ({avg}s) outside ideal range. Score +0")
    
    # Runtime (gold: 8-20 min)
    mins = s.get("runtime_minutes", 0)
    if 8 <= mins <= 25:
        notes.append(f"✅ Runtime ({mins}min) in ideal range (8-25min). Score +20")
        score += 20
    elif 5 <= mins <= 30:
        notes.append(f"🟡 Runtime ({mins}min) acceptable. Score +10")
        score += 10
    else:
        notes.append(f"🔴 Runtime ({mins}min) outside range. Score +0")
    
    # Visual modes variety
    vm = report.get("visual_modes", {})
    if vm.get("unique_count", 0) >= 15:
        notes.append(f"✅ {vm['unique_count']} unique visual modes. Excellent variety. Score +15")
        score += 15
    elif vm.get("unique_count", 0) >= 8:
        notes.append(f"🟡 {vm['unique_count']} visual modes. Good variety. Score +8")
        score += 8
    else:
        notes.append(f"🔴 Only {vm.get('unique_count', 0)} visual modes. Score +0")
    
    # Palette defined
    if report.get("visual_program", {}).get("palette"):
        notes.append("✅ Palette defined in visual program. Score +10")
        score += 10
    
    # Entities defined
    entities = report.get("visual_program", {}).get("entities", [])
    if len(entities) >= 3:
        notes.append(f"✅ {len(entities)} continuity entities. Score +10")
        score += 10
    
    # Operators defined
    ops = report.get("visual_program", {}).get("operators", [])
    if len(ops) >= 10:
        notes.append(f"✅ {len(ops)} operators. Rich visual grammar. Score +10")
        score += 10
    
    # Chapters / narrative structure
    chapters = report.get("chapters", [])
    if len(chapters) >= 8:
        notes.append(f"✅ {len(chapters)} chapters. Clear narrative structure. Score +10")
        score += 10
    elif len(chapters) >= 4:
        notes.append(f"🟡 {len(chapters)} chapters. Score +5")
        score += 5
    
    # Having a render script
    if report.get("render", {}).get("scene_functions", 0) > 0:
        notes.append(f"✅ Render script with {report['render']['scene_functions']} functions. Score +5")
        score += 5
    
    return {
        "total_score": score,
        "max_score": 100,
        "percentage": round(score / 100 * 100),
        "grade": "GOLD" if score >= 85 else "SILVER" if score >= 65 else "BRONZE" if score >= 45 else "DRAFT",
        "notes": notes,
    }

if __name__ == "__main__":
    pack_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    report = analyze_pack(pack_dir)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    # Also write report to file
    out_path = os.path.join(pack_dir, "analysis_report.json")
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nReport saved to: {out_path}")
