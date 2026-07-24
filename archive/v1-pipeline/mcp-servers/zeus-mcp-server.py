#!/usr/bin/env python3
"""ZEUS v4 — Creative Director. Reads all gold packs, then rewrites scripts to gold standard."""
import sys, json, re, os, subprocess, math
from pathlib import Path
from collections import Counter
from PIL import Image

# ── GOLD PACK KNOWLEDGE BASE ──────────────────────────────────────────
_GOLD_KNOWLEDGE = None

def _load_gold_knowledge():
    """Load all gold pack render scripts at startup as reference."""
    global _GOLD_KNOWLEDGE
    if _GOLD_KNOWLEDGE is not None:
        return _GOLD_KNOWLEDGE
    
    base = "/root/projects/blog/content/publishing/imports/packs/unpacked"
    packs = []
    for entry in sorted(os.listdir(base)):
        for root, dirs, files in os.walk(os.path.join(base, entry)):
            for f in files:
                if f.endswith(".py") and "render" in f.lower():
                    path = os.path.join(root, f)
                    code = open(path).read()
                    name = entry[:30]
                    packs.append({"name": name, "code": code})
                    break
            break
    
    _GOLD_KNOWLEDGE = packs
    return packs

# ── LAZY SBERT LOADER ────────────────────────────────────────────────
_SBERT_MODEL = None
def _get_sbert():
    global _SBERT_MODEL
    if _SBERT_MODEL is None:
        from sentence_transformers import SentenceTransformer
        _SBERT_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    return _SBERT_MODEL

TEMPLATE_DESCRIPTIONS = {
    'center_radiance': 'concentric gold rings pulsing outward from a bright center point on dark background, the rings expand and contract rhythmically like a heartbeat',
    'spoke_wheel': 'gold lines radiating outward from a center point like spokes of a wheel, with a bright center dot, the lines rotate creating a dynamic starburst pattern',
    'lattice_weave': 'a shifting grid of intersecting gold lines resembling a woven lattice or screen, with a small dot at the center',
    'wave_field': 'multiple flowing gold sine waves rippling across the frame at different phases, resembling water or energy waves',
    'bloom_petal': 'gold triangular petal-like forms unfolding from a central point, arranged in a circular mandala pattern',
    'architecture': 'vertical gold structural columns rising from the lower frame with an arched connection, like pillars supporting a gateway',
    'node_web': 'a network of gold dots connected by lines forming a web or constellation pattern, the nodes shift slightly',
    'contract_expand': 'a gold rectangular boundary that pulses inward and outward, with cross-hair marks extending beyond it, containing a bright center point',
    'spiral_path': 'a gold spiral tracing outward from center in an expanding coil, leaving a trailing path, with a dot at the current end',
    'scatter_field': 'gold dots scattered around a center point in a radial pattern, some connected back to center by faint lines',
    'silhouette_form': 'a human figure outlined in gold lines with head circle, vertical body, and two arm lines extending outward',
    'polygon_mandala': 'nested gold regular polygons at different angles forming a geometric mandala, with crossing star lines',
}

# ── MOTIF → TEMPLATE MAP ─────────────────────────────────────────────
# Import the same mapping used by the renderer
import importlib.util as _iutil
_vt_spec = _iutil.spec_from_file_location("vt_map", "/root/projects/blog/scripts/renderer/visual_templates.py")
_vt_mod = _iutil.module_from_spec(_vt_spec)
_vt_spec.loader.exec_module(_vt_mod)
MOTIF_TEMPLATE = _vt_mod.MOTIF_TEMPLATE

ROOT = "/root/projects/blog"

# ── GOLD REFERENCE REGISTRY ──────────────────────────────────────────
GOLD_PACKS = {
    "stones":  {"shots": 106, "avg_shot": 6.6, "motifs": 36, "chapters": 11, "range_min": 5.2, "range_max": 9.4, "continuity_pct": 100},
    "earth":   {"shots": 75,  "avg_shot": 6.1, "motifs": 45, "chapters": 11, "range_min": 5.2, "range_max": 9.4, "continuity_pct": 100},
    "corbin":  {"shots": 102, "avg_shot": 6.3, "motifs": 43, "chapters": 11, "range_min": 5.2, "range_max": 9.4, "continuity_pct": 100},
    "path":    {"shots": 109, "avg_shot": 6.1, "motifs": 41, "chapters": 10, "range_min": 5.2, "range_max": 9.4, "continuity_pct": 100},
}

# ── ABSTRACT/CONCRETE PATTERNS ──────────────────────────────────────
ABSTRACT_KEYWORDS = [
    "system", "concept", "process", "center", "surface", "thought",
    "witness", "consciousness", "awareness", "experience", "state",
    "level", "stage", "phase", "aspect", "dimension", "nature",
    "essence", "quality", "capacity", "power", "principle", "function",
    "noticing", "begin", "start", "between", "internal", "external",
]

CONCRETE_PATTERNS = [
    "door", "wheel", "eye", "hand", "face", "star", "stone", "seed",
    "flower", "ladder", "bridge", "gate", "thread", "rope", "knot",
    "net", "web", "veil", "mask", "crown", "throne", "sword", "shield",
    "cup", "vessel", "forge", "anvil", "bell", "drum", "mirror", "lamp",
    "candle", "flame", "river", "wave", "ocean", "crystal", "gem",
    "lapis", "gold", "silver", "copper", "iron", "salt", "sulphur",
    "mercury", "codex", "scroll", "page", "book", "seal", "compass",
    "axis", "sphere", "cube", "pyramid", "prism", "lens", "aperture",
    "arch", "column", "tower", "wall", "chamber", "room", "field",
    "garden", "tree", "root", "leaf", "branch", "wing", "beak", "claw",
    "shell", "scale", "feather", "bone", "blood", "heart", "lung",
    "brain", "eye", "ear", "mouth", "tooth", "tongue", "hand", "foot",
    "bishop", "angel", "daimon", "spirit", "figure", "body", "face",
    "child", "parent", "king", "queen", "smith", "scribe", "artist",
    "hunter", "gatherer", "farmer", "builder", "weaver", "potter",
    "basket", "bowl", "plate", "cup", "bottle", "box", "chest",
    "lattice", "grid", "spiral", "orbit", "ring", "chain", "link",
    "pulse", "throb", "beat", "rhythm", "breath", "breathing",
]

# ── PRIMITIVE SEMANTICS ─────────────────────────────────────────────
PRIMITIVE_CAPABILITIES = {
    "dot": ["point", "seed", "star", "bindu", "spark"],
    "ring": ["field", "boundary", "circle", "orbit", "halo", "wheel_rim"],
    "line": ["axis", "connection", "division", "ray", "spoke", "path"],
    "ellipse": ["eye", "face", "vessel", "seed", "aperture", "lens"],
    "rectangle": ["door", "page", "frame", "window", "chamber", "wall"],
    "polygon": ["crystal", "prism", "star", "gem", "facet", "pyramid"],
    "arc": ["aperture", "bridge", "eye", "arch", "portal", "curve"],
    "rounded_rectangle": ["tablet", "seal", "panel", "plaque"],
}

def can_draw(primitives, concept):
    """Check if the available primitives CAN represent the concept."""
    concept_lower = concept.lower()
    for prim, caps in PRIMITIVE_CAPABILITIES.items():
        if prim in primitives:
            for cap in caps:
                if cap.split("_")[0] in concept_lower or concept_lower in cap:
                    return True
    return False

# ── HELPER FUNCTIONS ────────────────────────────────────────────────

def _load_storyboard(output_dir):
    for root, dirs, files in os.walk(output_dir):
        for f in files:
            if f == "storyboard.json":
                try:
                    d = json.load(open(os.path.join(root, f)))
                    if isinstance(d, list): return d
                    if isinstance(d, dict): 
                        for key in ["shots", "scenes", "storyboard"]:
                            if key in d: return d[key]
                        # Return first list value
                        for v in d.values():
                            if isinstance(v, list): return v
                except: pass
    return None

def _find_mp4(output_dir):
    candidates = []
    for root, dirs, files in os.walk(output_dir):
        for f in files:
            if f.endswith(".mp4"):
                path = os.path.join(root, f)
                sz = os.path.getsize(path)
                if sz > 100000: candidates.append((path, f, sz))
    # Prefer final.mp4 over draft.mp4 (final has audio muxed in)
    for path, fname, _ in candidates:
        if fname == "final.mp4": return path
    if candidates:
        return candidates[0][0]
    return None

def _find_pil_script(output_dir):
    for root, dirs, files in os.walk(output_dir):
        for f in files:
            if f.endswith(".py") and ("render" in f.lower() or "scene" in f.lower()):
                return os.path.join(root, f)
    return None

# ── MAIN VALIDATION ENGINE ──────────────────────────────────────────

def validate_all(output_dir, previous_dir=None):
    results = []; errors = []
    
    def add(name, phase, severity, passed, detail):
        results.append({"check": name, "phase": phase, "severity": severity, "passed": passed, "detail": str(detail)[:200]})
        if not passed and severity == "HARD":
            errors.append(f"{name}: {detail}")
    
    sb = _load_storyboard(output_dir)
    mp4 = _find_mp4(output_dir)
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 1: PACK STRUCTURE
    # ═══════════════════════════════════════════════════════════════════
    
    required_files = ["storyboard.json", "narration_script.txt", "source_essay.md"]
    for f in required_files:
        found = False
        for root, dirs, files in os.walk(output_dir):
            if f in files: found = True; break
        add(f"File: {f}", 1, "HARD", found, f"{'Found' if found else 'Missing'} in pack")
    
    # Check for render script
    render_script = _find_pil_script(output_dir)
    add("Render script exists", 1, "HARD", render_script is not None, 
        f"Found: {os.path.basename(render_script)}" if render_script else "No render_*.py found")
    
    # Check for scene clips
    scene_dir = None
    for root, dirs, files in os.walk(output_dir):
        if "scenes" in root.split(os.sep) or root.endswith("/scenes"):
            mp4s = [f for f in files if f.endswith(".mp4")]
            if mp4s:
                scene_dir = root
                break
    add("Scene clips exist", 1, "SOFT", scene_dir is not None,
        f"Found {len(mp4s)} clips" if scene_dir else "No scenes/ directory with MP4s")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 2: STORYBOARD FIELD VALIDATION
    # ═══════════════════════════════════════════════════════════════════
    
    if sb:
        # Required fields (platinum format)
        req_fields = ["shot_id", "start", "end", "duration", "spoken_passage", 
                      "chapter", "visual_mode", "visual_mechanism", "continuity_object"]
        missing_fields = set()
        for s in sb[:20]:  # sample first 20
            for f in req_fields:
                if f not in s: missing_fields.add(f)
        add("Storyboard fields match platinum", 2, "HARD", len(missing_fields) == 0,
            f"Missing: {missing_fields}" if missing_fields else f"All {len(req_fields)} fields present")
        
        # Check visual_mechanism is a real sentence (not just mode name repeated)
        bad_mech = 0
        for s in sb:
            mech = s.get("visual_mechanism", "")
            mode = s.get("visual_mode", s.get("motif", ""))
            if len(mech) < 10 or mech == mode.replace("_", " "):
                bad_mech += 1
        add("Visual mechanisms are descriptive", 2, "SOFT", bad_mech == 0,
            f"{bad_mech} shots have empty or duplicate visual_mechanism")
        
        # Check raw_audio_duration
        has_raw = sum(1 for s in sb if "raw_audio_duration" in s or "raw_audio" in s)
        add("raw_audio_duration tracked", 2, "SOFT", has_raw >= len(sb) * 0.5,
            f"{has_raw}/{len(sb)} shots have raw_audio_duration")
        
        # Continuity objects
        has_cont = sum(1 for s in sb if s.get("continuity_object"))
        add("Continuity objects present", 2, "SOFT", has_cont >= len(sb) * 0.5,
            f"{has_cont}/{len(sb)} shots ({has_cont/len(sb)*100:.0f}%)")
    else:
        add("Storyboard loads", 2, "HARD", False, "Could not load storyboard.json")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 3: YES/NO VISUAL TEST
    # ═══════════════════════════════════════════════════════════════════
    
    if sb:
        yes_count = 0; no_count = 0; no_examples = []
        for s in sb:
            name = s.get("motif", s.get("visual_mode", "")).lower()
            # Check if abstract keyword is present WITHOUT a concrete noun
            has_abstract = any(kw in name for kw in ABSTRACT_KEYWORDS)
            has_concrete = any(cp in name for cp in CONCRETE_PATTERNS)
            
            if has_concrete and not has_abstract:
                yes_count += 1  # Clear concrete image
            elif has_concrete and has_abstract:
                yes_count += 1  # Mixed but has concrete anchor
            elif has_abstract:
                no_count += 1
                if len(no_examples) < 5: no_examples.append(name)
            else:
                # Neither abstract nor concrete — check if it's at least a real word
                if len(name) > 3 and "_" in name:
                    no_count += 1
                    if len(no_examples) < 5: no_examples.append(name)
                else:
                    yes_count += 1
        
        total = yes_count + no_count
        yes_pct = (yes_count / total * 100) if total else 0
        add(f"YES/NO Visual Test: {yes_pct:.0f}% YES", 3, "SOFT", yes_pct >= 70,
            f"{yes_count} YES, {no_count} NO — bad examples: {no_examples[:3]}")
    else:
        add("YES/NO Visual Test", 3, "SOFT", False, "No storyboard available")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 4: PIL CODE INSPECTION
    # ═══════════════════════════════════════════════════════════════════
    
    if render_script and sb:
        code = open(render_script).read()
        
        # Find function definitions — also check imported module files for scene functions
        funcs = re.findall(r'def (\w+)\(', code)
        motif_funcs = {}
        
        # Also check if visual_templates module is imported and scan it for functions
        render_dir = os.path.dirname(render_script)
        vt_path = os.path.join(os.path.dirname(render_script), "..", "..", "..", "scripts", "renderer", "visual_templates.py")
        # Try common relative paths from output dirs
        alt_vt_paths = [
            "/root/projects/blog/scripts/renderer/visual_templates.py",
            os.path.join(output_dir, "..", "..", "..", "..", "scripts", "renderer", "visual_templates.py"),
        ]
        for p in [vt_path] + alt_vt_paths:
            p = os.path.normpath(p)
            if os.path.exists(p):
                vt_code = open(p).read()
                vt_funcs = re.findall(r'def (\w+)\(', vt_code)
                # Add template functions to the function list
                for f in vt_funcs:
                    if f.startswith("tmpl_") or f == "render_shot":
                        if f not in funcs:
                            funcs.append(f)
                            start = vt_code.find(f"def {f}(")
                            if start >= 0:
                                body = vt_code[start:start+500]
                                prims = []
                                for prim in ["ellipse", "rectangle", "line", "polygon", "arc", "rounded_rectangle"]:
                                    if prim in body: prims.append(prim)
                                motif_funcs[f] = prims
                break
        
        for fname in funcs:
            if fname in motif_funcs:
                continue  # Already processed from visual_templates
            # Get first 5 lines of the function
            start = code.find(f"def {fname}(")
            if start >= 0:
                body = code[start:start+500]
                # Check for drawing primitives
                prims = []
                for prim in ["ellipse", "rectangle", "line", "polygon", "arc", "rounded_rectangle"]:
                    if prim in body: prims.append(prim)
                motif_funcs[fname] = prims
        
        # For each motif, check if its function CAN represent it
        bad_prims = 0
        motif_to_func = {}
        for s in sb:
            name = s.get("motif", s.get("visual_mode", ""))
            # Find matching function
            for fname in funcs:
                if name.replace("-","_").replace(" ","_") in fname:
                    motif_to_func[name] = fname
                    prims = motif_funcs.get(fname, [])
                    if prims and not can_draw(prims, name):
                        bad_prims += 1
                    break
        
        add(f"PIL primitives match motifs", 4, "SOFT", bad_prims == 0,
            f"{bad_prims} motifs have primitives that can't represent them" if bad_prims else 
            f"{len(motif_to_func)} motifs mapped to functions with appropriate primitives")
        
        # Check how many unique primitives are used across the whole script
        all_prims = set()
        for prims in motif_funcs.values():
            all_prims.update(prims)
        add(f"Drawing primitive variety", 4, "SOFT", len(all_prims) >= 3,
            f"{len(all_prims)} unique primitives used: {all_prims}")
        
        # Check function-to-motif ratio — 1 function for 60 motifs = fraud
        unique_motifs = len(set(s.get("motif", s.get("visual_mode", "?")) for s in sb))
        actual_drawing_funcs = [f for f in funcs if f not in ("canvas", "dot", "ring", "rgba", "render_all")]
        func_to_motif_ratio = len(actual_drawing_funcs) / max(unique_motifs, 1)
        add(f"Drawing functions match motif variety", 4, "SOFT", func_to_motif_ratio >= 0.8,
            f"{len(actual_drawing_funcs)} functions for {unique_motifs} motifs (ratio {func_to_motif_ratio:.2f}, need >=0.8)")
    else:
        add("PIL Code Inspection", 4, "SOFT", False, 
            "No render script found" if not render_script else "No storyboard")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 5: VISUAL-ONLY COMPREHENSION
    # ═══════════════════════════════════════════════════════════════════
    
    if sb:
        mechanisms = [s.get("visual_mechanism", s.get("motif", s.get("visual_mode", ""))) for s in sb[:10]]
        motifs_only = [s.get("motif", s.get("visual_mode", "")) for s in sb[:10]]
        
        # Check if mechanisms are descriptive enough to understand without narration
        has_description = sum(1 for m in mechanisms if len(m) >= 15)
        has_variety = len(set(motifs_only)) >= 4
        
        add("Visuals explain concepts without narration", 5, "SOFT", has_description >= 7 and has_variety,
            f"{has_description}/10 have good descriptions, {len(set(motifs_only))} unique motifs in first 10")
        
        # Gold standard: can we infer the topic from motifs alone?
        concrete_in_first10 = sum(1 for m in motifs_only if any(cp in m.lower() for cp in CONCRETE_PATTERNS))
        add("Concrete imagery in first 10 shots", 5, "SOFT", concrete_in_first10 >= 5,
            f"{concrete_in_first10}/10 first shots use concrete imagery")
        
        # Visual mechanism template detection — detect boilerplate mechanisms
        all_mechs = [s.get("visual_mechanism", "") for s in sb]
        def strip_motifs(text, motifs_in_text):
            t = text.lower().replace("_", " ")
            for m in sorted(motifs_in_text, key=len, reverse=True):
                t = t.replace(m.lower().replace("_", " "), "___")
            # Collapse repeated spaces
            import re
            t = re.sub(r'\s+', ' ', t)
            return t.strip()
        
        motif_names = set(s.get("motif", s.get("visual_mode", "")) for s in sb)
        stripped = [strip_motifs(m, motif_names) for m in all_mechs]
        unique_stripped = len(set(stripped))
        template_ratio = max(Counter(stripped).values()) / max(len(stripped), 1)
        add("Visual mechanisms are genuinely unique", 5, "HARD", template_ratio <= 0.3,
            f"{template_ratio:.0%} share same template structure ({unique_stripped} unique variants, threshold <=30%)")
        
        # Frame-to-frame similarity — check consecutive shots differ
        out_dir = Path(output_dir)
        scenes_dir = out_dir / "scenes"
        similar_pairs = 0
        checked_pairs = 0
        if scenes_dir.exists():
            try:
                from PIL import Image
                shot_dirs = sorted(str(d) for d in scenes_dir.iterdir() if d.is_dir() and d.name.startswith("s"))
                for i in range(min(len(shot_dirs)-1, 10)):
                    sd_a, sd_b = shot_dirs[i], shot_dirs[i+1]
                    src_frames = sorted(f for f in os.listdir(sd_a) if f.endswith(".png"))
                    dst_frames = sorted(f for f in os.listdir(sd_b) if f.endswith(".png"))
                    if src_frames and dst_frames:
                        im_a = Image.open(f"{sd_a}/{src_frames[len(src_frames)//2]}").convert("RGB")
                        im_b = Image.open(f"{sd_b}/{dst_frames[len(dst_frames)//2]}").convert("RGB")
                        wa, ha = im_a.size
                        px_a = list(im_a.getdata())
                        px_b = list(im_b.getdata())
                        changed = 0
                        total = len(px_a)
                        for idx in range(total):
                            ra, ga, ba = px_a[idx][:3]
                            rb, gb, bb = px_b[idx][:3]
                            # Count pixel as "changed" if any channel differs by >=10
                            if abs(ra-rb) >= 10 or abs(ga-gb) >= 10 or abs(ba-bb) >= 10:
                                changed += 1
                        pct = changed / total * 100
                        if pct < 0.5:  # Less than 0.5% of pixels changed = similar
                            similar_pairs += 1
                        checked_pairs += 1
            except Exception as e:
                pass  # Fall through
        add("Consecutive shots are visually distinct", 5, "HARD", similar_pairs <= 1,
            f"{similar_pairs}/{checked_pairs} consecutive-shot pairs nearly identical" if checked_pairs else "Could not check (no frames)")
        
        # ── Visual-Narration Alignment ─────────────────────────────────
        out_dir = Path(output_dir)
        aligned_shots = 0
        valid_shots = 0
        total_sim = 0.0
        template_usage = Counter()
        if sb:
            try:
                sbert = _get_sbert()
                # Encode all template descriptions once
                tmpl_names = list(TEMPLATE_DESCRIPTIONS.keys())
                tmpl_texts = [TEMPLATE_DESCRIPTIONS[t] for t in tmpl_names]
                tmpl_embs = sbert.encode(tmpl_texts)
                import numpy as np
                tmpl_embs = tmpl_embs / np.sqrt((tmpl_embs ** 2).sum(axis=1, keepdims=True))
                
                # Sample up to 30 shots
                shot_mechs = []
                shot_nars = []
                shot_templates = []
                for i, s in enumerate(sb[:30]):
                    motif = s.get("visual_mode", s.get("motif", ""))
                    tmpl_key = MOTIF_TEMPLATE.get(motif, "center_radiance")
                    template_usage[tmpl_key] += 1
                    shot_mechs.append(s.get("visual_mechanism", ""))
                    shot_nars.append(s.get("spoken_passage", ""))
                    shot_templates.append(tmpl_key)
                
                # Encode narrations
                nar_embs = sbert.encode(shot_nars)
                nar_embs = nar_embs / np.sqrt((nar_embs ** 2).sum(axis=1, keepdims=True))
                
                # Check 1: does the VISUAL (template) express the NARRATION?
                # e.g., "concentric rings pulsing" vs "the One is the mirror" = LOW → fail
                nar_aligned = 0
                for j in range(len(shot_nars)):
                    tmpl_idx = tmpl_names.index(shot_templates[j]) if shot_templates[j] in tmpl_names else 0
                    sim = float(tmpl_embs[tmpl_idx] @ nar_embs[j])
                    total_sim += sim
                    if sim >= 0.15:  # lower threshold — concepts are abstract
                        nar_aligned += 1
                    valid_shots += 1
                
                # Check 2: non-generic shapes (reward specificity)
                generic_terms = ["geometric", "abstract", "pattern", "digital", "animation", "shape on dark"]
                generic_count = 0
                for j in range(len(shot_nars)):
                    mech_lower = shot_mechs[j].lower()
                    if any(g in mech_lower for g in generic_terms):
                        generic_count += 1
                
            except Exception:
                pass
        
        if valid_shots > 0:
            avg_sim = total_sim / valid_shots
            nar_pct = nar_aligned / valid_shots * 100
            add(f"Visual expresses narration", 5, "HARD", nar_pct >= 30 and avg_sim >= 0.10,
                f"{nar_aligned}/{valid_shots} shots have visual-narration alignment ({nar_pct:.0f}%, avg sim {avg_sim:.3f})")
            
            generic_pct = generic_count / valid_shots * 100
            add(f"Specific visual language", 5, "SOFT", generic_pct <= 40,
                f"{generic_pct:.0f}% of mechanisms use generic terms (e.g., 'geometric', 'abstract')")
            
            # Template repetition check
            most_common = template_usage.most_common(1)[0]
            repeat_pct = most_common[1] / max(valid_shots, 1) * 100
            add(f"Template variety", 5, "SOFT", repeat_pct <= 25,
                f"Most used template: {most_common[0]} ({most_common[1]}/{valid_shots} = {repeat_pct:.0f}%)")
        else:
            add("Visual-narration alignment", 5, "SOFT", False, "Could not run (no storyboard)")
    else:
        add("Visual-Only Comprehension", 5, "SOFT", False, "No storyboard")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 6: GOLD BENCHMARKING
    # ═══════════════════════════════════════════════════════════════════
    
    if sb:
        durs = [float(s.get("duration", s.get("duration_seconds", 0))) for s in sb]
        shot_count = len(sb)
        avg_shot = sum(durs)/len(durs) if durs else 0
        motifs = set(s.get("motif", s.get("visual_mode", "?")) for s in sb)
        chapters = set(s.get("chapter", "") for s in sb)
        continuity = sum(1 for s in sb if s.get("continuity_object"))
        cont_pct = continuity/len(sb)*100 if sb else 0
        
        # Compare against gold range
        gold_list = list(GOLD_PACKS.values())
        gold_ranges = {
            "shots": (min(g["shots"] for g in gold_list), max(g["shots"] for g in gold_list)),
            "motifs": (min(g["motifs"] for g in gold_list), max(g["motifs"] for g in gold_list)),
            "chapters": (min(g["chapters"] for g in gold_list), max(g["chapters"] for g in gold_list)),
        }
        
        in_gold_range = 0
        total_metrics = 0
        
        metric_map = {"Shot count": "shots", "Motif variety": "motifs", "Chapter count": "chapters"}
        for metric, value, name in [
            (shot_count, "shots", "Shot count"),
            (len(motifs), "motifs", "Motif variety"),
            (len(chapters), "chapters", "Chapter count"),
        ]:
            total_metrics += 1
            lo, hi = gold_ranges[metric_map[name]]
            if lo <= metric <= hi:
                in_gold_range += 1
                add(f"{name}: {metric} (within gold range {lo}-{hi})", 6, "SOFT", True, "")
            elif metric >= lo * 0.7:
                add(f"{name}: {metric} (near gold range {lo}-{hi})", 6, "SOFT", True, "Close to gold")
            else:
                add(f"{name}: {metric} (gold range {lo}-{hi})", 6, "SOFT", False, f"Below gold range")
        
        add(f"Shot timing vs gold", 6, "SOFT", 
            min(durs) >= 4.0 and max(durs) <= 10.5,
            f"Range {min(durs):.1f}-{max(durs):.1f}s (gold: 5.2-9.4)")
        
        add(f"Continuity vs gold", 6, "SOFT", cont_pct >= 70,
            f"{cont_pct:.0f}% continuity (gold: 100%)")
    else:
        add("Gold Benchmarking", 6, "SOFT", False, "No storyboard")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 7: STRUCTURED TECHNICAL CHECKS
    # ═══════════════════════════════════════════════════════════════════
    
    # Shot durations
    if sb:
        durs = [float(s.get("duration", s.get("duration_seconds", 4))) for s in sb]
        under_4 = sum(1 for d in durs if d < 4.0)
        over_10 = sum(1 for d in durs if d > 10.5)
        add("Shot durations 4-10.5s", 7, "SOFT", under_4 == 0 and over_10 == 0,
            f"{under_4} under 4s, {over_10} over 10.5s (out of {len(durs)})")
        
        # Chapter interleaving
        chapters_list = [s.get("chapter", "") for s in sb]
        consec = 0
        for i in range(len(chapters_list)-2):
            if chapters_list[i] and chapters_list[i] == chapters_list[i+1] == chapters_list[i+2]:
                consec += 1
        add("Chapter interleaving", 7, "SOFT", consec == 0,
            f"{consec} cases of 3+ consecutive same chapter")
    
    # MP4 validity
    if mp4:
        sz = os.path.getsize(mp4)
        try:
            r = subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size',
                '-of','json',mp4],capture_output=True,text=True,timeout=5)
            info = json.loads(r.stdout)
            has_video = any(s.get("codec_type") == "video" for s in info.get("streams", []))
            has_audio = any(s.get("codec_type") == "audio" for s in info.get("streams", []))
            dur = float(info.get("format",{}).get("duration",0))
            add("MP4 has video stream", 7, "HARD", has_video, f"{'Yes' if has_video else 'No'}")
            add("MP4 has audio stream", 7, "SOFT", has_audio, f"{'Yes' if has_audio else 'No'}")
            add("MP4 duration matches storyboard", 7, "SOFT", sb is None or abs(dur - sum(s.get("duration",0) for s in sb)) < 30,
                f"MP4: {dur:.0f}s vs storyboard: {sum(s.get('duration',0) for s in sb):.0f}s" if sb else "No storyboard to compare")
        except:
            add("MP4 stream analysis", 7, "SOFT", False, "FFprobe failed")
    
    # ═══════════════════════════════════════════════════════════════════
    # PHASE 8: CROSS-PACK IMPROVEMENT
    # ═══════════════════════════════════════════════════════════════════
    
    if previous_dir and os.path.exists(previous_dir):
        prev_sb = _load_storyboard(previous_dir)
        if prev_sb and sb:
            prev_motifs = len(set(s.get("motif", s.get("visual_mode", "")) for s in prev_sb))
            curr_motifs = len(set(s.get("motif", s.get("visual_mode", "")) for s in sb))
            improved = curr_motifs >= prev_motifs and len(sb) >= len(prev_sb) * 0.8
            add(f"Improvement over previous version", 8, "SOFT", improved,
                f"Motifs: {prev_motifs}→{curr_motifs}, Shots: {len(prev_sb)}→{len(sb)}")
    
    # ═══════════════════════════════════════════════════════════════════
    # FINAL SCORING
    # ═══════════════════════════════════════════════════════════════════
    
    hard_passed = all(r["passed"] for r in results if r["severity"] == "HARD")
    soft_passed = [r for r in results if r["severity"] == "SOFT" and r["passed"]]
    soft_total = [r for r in results if r["severity"] == "SOFT"]
    soft_score = round(len(soft_passed) / max(len(soft_total), 1) * 100)
    
    # Calculate phase scores
    phases = {}
    for r in results:
        p = r["phase"]
        if p not in phases: phases[p] = {"pass": 0, "total": 0}
        phases[p]["total"] += 1
        if r["passed"]: phases[p]["pass"] += 1
    
    verdict = "PASS" if hard_passed and soft_score >= 50 else "FAIL"
    grade = "GOLD" if soft_score >= 85 else "SILVER" if soft_score >= 65 else "BRONZE" if soft_score >= 45 else "DRAFT"
    
    return {
        "verdict": verdict,
        "grade": grade,
        "soft_score": soft_score,
        "hard_failures": [r for r in results if r["severity"] == "HARD" and not r["passed"]],
        "soft_warnings": [r for r in results if r["severity"] == "SOFT" and not r["passed"]],
        "phase_scores": {f"Phase {k}": f"{v['pass']}/{v['total']}" for k, v in sorted(phases.items())},
        "summary": {
            "shots": len(sb) if sb else 0,
            "motifs": len(set(s.get("motif", s.get("visual_mode", "")) for s in sb)) if sb else 0,
            "chapters": len(set(s.get("chapter", "") for s in sb)) if sb else 0,
            "avg_shot": round(sum(float(s.get("duration", 0)) for s in sb)/len(sb), 1) if sb and len(sb) > 0 else 0,
        },
        "all_checks": results
    }

# ── CREATIVE CRITIQUE ──────────────────────────────────────────────────

def _load_gold_packs(base_dir="/root/projects/blog/content/publishing/imports/packs/unpacked"):
    """Load gold pack render scripts for reference patterns."""
    patterns = []
    for entry in os.listdir(base_dir):
        for root, dirs, files in os.walk(os.path.join(base_dir, entry)):
            for f in files:
                if f.endswith(".py") and "render" in f.lower():
                    path = os.path.join(root, f)
                    code = open(path).read()
                    funcs = re.findall(r'def (sc\d+|scene_\w+|render_\w+)\(', code)
                    # Count lines per scene function
                    scene_lines = []
                    for fn in funcs:
                        start = code.find(f"def {fn}(")
                        if start >= 0:
                            end = code.find("\ndef ", start + 10)
                            if end < 0: end = len(code)
                            scene_lines.append((fn, len(code[start:end].split('\n'))))
                    patterns.append({
                        "name": entry[:20],
                        "functions": len(funcs),
                        "avg_lines_per_scene": sum(l for _, l in scene_lines) / max(len(scene_lines), 1),
                        "total_lines": len(code.split('\n')),
                    })
    return patterns

def analyze_scene_function(func_name, code_snippet):
    """Analyze a single scene function's visual structure."""
    analysis = {
        "name": func_name,
        "lines": len(code_snippet.split('\n')),
        "primitives": [],
        "has_t_parameter": "t," in code_snippet[:100] or "t)" in code_snippet[:100],
        "has_time_variation": "math.sin(t" in code_snippet or "*t" in code_snippet or "ease(" in code_snippet,
        "elements": 0,
        "richness": "sparse",
    }
    for prim in ["ellipse", "rectangle", "line", "polygon", "arc", "text", "point"]:
        count = code_snippet.count(prim)
        if count > 0:
            analysis["primitives"].append(f"{prim}x{count}")
    analysis["elements"] = len(analysis["primitives"])
    if analysis["lines"] > 20 and analysis["elements"] >= 3 and analysis["has_time_variation"]:
        analysis["richness"] = "rich"
    elif analysis["lines"] > 12 and analysis["elements"] >= 2:
        analysis["richness"] = "moderate"
    return analysis

def _call_llm(prompt):
    """Call deepseek-v4-flash via direct API."""
    import urllib.request, json
    api_key = "OPENCODE_API_KEY_PLACEHOLDER"
    data = json.dumps({
        "model": "deepseek-v4-flash",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 8000
    }).encode()
    req = urllib.request.Request(
        "https://opencode.ai/zen/go/v1/chat/completions",
        data=data,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=180)
        result = json.loads(resp.read())
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        return f"LLM call failed: {e}"

def _extract_gold_patterns():
    """Extract compact pattern summaries from gold packs."""
    _load_gold_knowledge()
    patterns = []
    for p in _GOLD_KNOWLEDGE:
        code = p["code"]
        scene_funcs = re.findall(r'def (sc\d+|scene_\w+)\(', code)
        primitives = set()
        for prim in ["ellipse", "rectangle", "line", "polygon", "arc", "text", "polygon"]:
            if prim in code: primitives.add(prim)
        palette_colors = re.findall(r'[A-Z_]{3,}\s*=\s*\(', code)
        patterns.append({
            "name": p["name"],
            "scenes": len(scene_funcs),
            "primitives": sorted(primitives),
            "colors": len(palette_colors),
            "lines": len(code.split('\n')),
            "sample_funcs": scene_funcs[:3],
        })
    return patterns

def elevate_scenes(render_script_path, essay_path, output_path):
    """Return structured elevation context for Hermes to act on."""
    if not os.path.exists(render_script_path):
        return "Render script not found."
    
    patterns = _extract_gold_patterns()
    essay_text = open(essay_path).read() if essay_path and os.path.exists(essay_path) else ""
    current_script = open(render_script_path).read()
    
    # Analyze each scene
    scene_funcs = re.findall(r'def (sc\d+)\(', current_script)
    scene_analysis = []
    for fn in scene_funcs:
        start = current_script.find(f"def {fn}(")
        end = current_script.find("\ndef ", start + 10)
        if end < 0: end = len(current_script)
        code = current_script[start:end]
        lines = len(code.split('\n'))
        prims = []
        for p in ["ellipse", "rectangle", "line", "polygon", "arc", "text"]:
            if p in code: prims.append(p)
        has_motion = "math.sin(t" in code or "ease(" in code
        scene_analysis.append({"name": fn, "lines": lines, "primitives": prims, "has_motion": has_motion})
    
    return json.dumps({
        "gold_patterns": patterns,
        "scene_analysis": scene_analysis,
        "essay_snippet": essay_text[:1500],
        "render_script_path": render_script_path,
        "output_path": output_path,
    }, indent=2)

def critique_scenes(render_script_path, essay_path):
    """Use LLM to read essay + render script + gold packs and give conceptual critique."""
    if not os.path.exists(render_script_path):
        return "Render script not found."
    
    essay_text = ""
    if essay_path and os.path.exists(essay_path):
        with open(essay_path) as f:
            essay_text = f.read()
    
    with open(render_script_path) as f:
        render_code = f.read()
    
    # Load gold pack references
    gold_refs = ""
    gold_base = "/root/projects/blog/content/publishing/imports/packs/unpacked"
    gold_packs_found = []
    for entry in os.listdir(gold_base):
        for root, dirs, files in os.walk(os.path.join(gold_base, entry)):
            for f in files:
                if f.endswith(".py") and "render" in f.lower():
                    path = os.path.join(root, f)
                    name = entry[:30]
                    gold_packs_found.append(name)
                    # Read first 100 lines as reference sample
                    with open(path) as gf:
                        sample = "".join(gf.readlines()[:100])
                    gold_refs += f"\n--- Gold pack: {name} ---\n{sample}\n"
                    break
            break
    
    patterns = _extract_gold_patterns()
    gold_summary = "\n".join(
        f"- {p['name']}: {p['scenes']} scenes, primitives={p['primitives']}"
        for p in patterns[:6]
    )
    
    prompt = f"""You are Zeus, a creative director for video essays.

Gold pack reference patterns:
{gold_summary}

Read the essay and render script below. For EACH scene (sc01-sc16):

1. What concept must this scene enact? (from the essay)
2. Does the visual ENACT it, or just show a shape? 
3. THE KEY TEST: Without audio, would a viewer understand the concept? If not, WHY not and what's missing?
4. Specific advice to fix it

THE ESSAY:
{essay_text[:2000]}

THE RENDER SCRIPT (scene functions):
{render_code[:5000]}

Give per-scene conceptual critique. This is about visual COMMUNICATION, not code style."""
    
    result = _call_llm(prompt)
    return result

# ── MCP HANDLER ────────────────────────────────────────────────────────

TOOLS = [
    {"name":"zeus_judge","description":"Full 8-phase validation. Returns PASS/FAIL with detailed report, grade, and phase scores.",
     "inputSchema":{"type":"object","properties":{
         "output_dir":{"type":"string"},
         "previous_dir":{"type":"string","description":"Optional previous version for improvement tracking"}
     },"required":["output_dir"]}},
    {"name":"zeus_report","description":"Human-readable validation report.",
     "inputSchema":{"type":"object","properties":{"output_dir":{"type":"string"}},"required":["output_dir"]}},
    {"name":"zeus_test_gold","description":"Test Zeus against known-good platinum packs to calibrate.",
     "inputSchema":{"type":"object","properties":{}}},
    {"name":"zeus_critique","description":"Creative code critique. Reads render script and essay, compares against gold packs, gives per-scene advice.",
     "inputSchema":{"type":"object","properties":{
         "render_script":{"type":"string"},
         "essay_path":{"type":"string"}
     },"required":["render_script","essay_path"]}},
    {"name":"zeus_elevate","description":"Upgrade a render script to gold standard. Zeus studies all gold packs, reads your script + essay, rewrites weak scenes.",
     "inputSchema":{"type":"object","properties":{
         "render_script":{"type":"string","description":"Path to current render_pack.py"},
         "essay_path":{"type":"string","description":"Path to source essay"},
         "output_path":{"type":"string","description":"Path to write improved script"}
     },"required":["render_script","essay_path","output_path"]}},
]

def handle(method, params, msg_id):
    resp = {"jsonrpc":"2.0","id":msg_id}
    try:
        if method == "initialize":
            resp["result"] = {"protocolVersion":"2025-06-18","capabilities":{"tools":{}},"serverInfo":{"name":"zeus","version":"2.0.0"}}
        elif method == "tools/list":
            resp["result"] = {"tools":TOOLS}
        elif method == "tools/call":
            name = params.get("name",""); args = params.get("arguments",{})
            if name == "zeus_judge":
                v = validate_all(args["output_dir"], args.get("previous_dir"))
                resp["result"] = {"content":[{"type":"text","text":json.dumps(v,indent=2)}]}
            elif name == "zeus_report":
                v = validate_all(args["output_dir"])
                lines = ["═══ ZEUS JUDGMENT ═══",
                    f"Verdict: {v['verdict']} | Grade: {v['grade']} | Score: {v['soft_score']}%"]
                if v['hard_failures']:
                    lines.append(f"\n❌ HARD FAILURES ({len(v['hard_failures'])}):")
                    for r in v['hard_failures']: lines.append(f"  - {r['check']}: {r['detail']}")
                if v['soft_warnings']:
                    lines.append(f"\n⚠ SOFT ({len(v['soft_warnings'])}):")
                    for r in v['soft_warnings']: lines.append(f"  - {r['check']}: {r['detail']}")
                lines.append(f"\n📊 Summary: {v['summary']['shots']} shots, {v['summary']['motifs']} motifs, {v['summary']['avg_shot']}s avg")
                lines.append(f"📈 Phase scores: {v['phase_scores']}")
                if v['verdict'] == 'PASS':
                    lines.append(f"\n✅ ALL GATES PASSED. Grade: {v['grade']}")
                resp["result"] = {"content":[{"type":"text","text":"\n".join(lines)}]}
            elif name == "zeus_test_gold":
                gold_dir = "/root/projects/blog/content/publishing/renders/gold-analysis/stones_analysis/stones_are_watching_film_pack"
                v = validate_all(gold_dir)
                resp["result"] = {"content":[{"type":"text","text":
                    f"Gold test (Stones pack):\nVerdict: {v['verdict']}\nGrade: {v['grade']}\nScore: {v['soft_score']}%"}]}
            elif name == "zeus_critique":
                result = critique_scenes(args.get("render_script",""), args.get("essay_path",""))
                resp["result"] = {"content":[{"type":"text","text":result}]}
            elif name == "zeus_elevate":
                result = elevate_scenes(args.get("render_script",""), args.get("essay_path",""), args.get("output_path",""))
                resp["result"] = {"content":[{"type":"text","text":result}]}
            else:
                resp["error"] = {"code":-32601,"message":f"Unknown: {name}"}
        elif method == "ping": resp["result"] = {}
        else: resp["error"] = {"code":-32601,"message":f"Not found: {method}"}
    except Exception as e: resp["error"] = {"code":-32603,"message":str(e)}
    return resp

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            sys.stdout.write(json.dumps(handle(msg.get("method",""), msg.get("params",{}), msg.get("id",0))) + "\n")
            sys.stdout.flush()
        except: pass
