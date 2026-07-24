"""Platinum visual thesis builder — from essay to geometric argument.
Stage 3-5-7 of the platinum process:
1. Decode essay into processes (not concepts)
2. Define visual thesis: material world, spatial world, motion verbs, 4-7 systems
3. Map processes to fixed shape semantics (point, circle, lattice, axis, etc.)
4. Compose per-shot geometry from the shape vocabulary"""

import re
from collections import Counter

# ── SHAPE SEMANTICS (fixed alphabet from validation-platinum.md Stage 7) ──
SHAPES = {
    "point": {"meaning": "origin, seed, potential, attention", "primitives": ["dot", "ellipse"]},
    "circle": {"meaning": "field, containment, wholeness", "primitives": ["ellipse", "ring"]},
    "aperture": {"meaning": "threshold, perception, revelation", "primitives": ["arc", "rectangle", "ellipse"]},
    "axis": {"meaning": "mediation, ascent/descent, ordering", "primitives": ["line"]},
    "branch": {"meaning": "differentiation, procession", "primitives": ["line", "polygon"]},
    "lattice": {"meaning": "form, internal law, structured relation", "primitives": ["line", "ellipse"]},
    "vessel": {"meaning": "receptivity, transformation", "primitives": ["ellipse", "rectangle", "polygon"]},
    "mirror": {"meaning": "recognition, counterpart, reflection", "primitives": ["line", "ellipse"]},
    "mosaic": {"meaning": "ordered multiplicity", "primitives": ["ellipse", "line", "polygon"]},
    "spiral": {"meaning": "evolution, return, progressive unfolding", "primitives": ["line", "ellipse"]},
    "wave": {"meaning": "continuous emanation, rhythmic process", "primitives": ["line"]},
    "web": {"meaning": "interconnection, network of relation", "primitives": ["line", "ellipse"]},
}

# ── MOTION VERBS (from gold pack analysis) ──────────────────────────
MOTIONS = [
    "crystallize", "unfold", "overflow", "weave", "descend", "mirror",
    "ignite", "dissolve", "coagulate", "align", "pulse", "radiate",
    "condense", "expand", "branch", "flow", "emerge", "stabilize",
    "differentiate", "integrate", "transform", "correspond", "collapse",
    "witness", "threshold", "craft",
]

# ── ESSAY VOCABULARY EXTRACTION ─────────────────────────────────────

def extract_processes(text):
    """Extract processes from essay — decode WHAT the language is doing.
    Returns list of (process_type, phrase, subjects, verbs, objects).
    This is the "rhetorical map" from Stage 2 of the platinum process."""
    text_lower = text.lower()
    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('>')]
    
    # Process patterns — what the essay is DOING at each step
    processes = []
    
    # Detect key process types from essay structure
    process_indicators = {
        "assertion": [r'^what if', r'^the ultimate', r'^the entire', r'^everything'],
        "definition": [r'^the .+ is', r'^a .+ is', r'^every .+ is'],
        "mechanism": [r'^by', r'^through', r'^when', r'^as'],
        "analogy": [r'^like', r'^as if', r'^now consider', r'^imagine', r'^think of'],
        "contrast": [r'^but', r'^yet', r'^however', r'^not', r'^rather'],
        "consequence": [r'^so', r'^thus', r'^therefore', r'^this means'],
        "question": [r'\?$'],
        "resolution": [r'^sit with', r'^the .+ itself', r'^this is the'],
    }
    
    for line in lines:
        if len(line) < 15:
            continue
        # Determine process type
        ptype = "assertion"
        for pt, patterns in process_indicators.items():
            for pat in patterns:
                if re.match(pat, line.lower()):
                    ptype = pt
                    break
        # Extract subjects and verbs (simplified)
        words = line.split()
        subjects = [w for w in words[:5] if w[0].isupper() and len(w) > 3]
        # Find verbs by looking for common verb patterns
        verbs = []
        for w in words:
            if any(w.endswith(suf) for suf in ['ize', 'ate', 'ify', 'es', 'ed', 'ing', 'ins']):
                verbs.append(w)
        if not verbs:
            # Pick main verb from sentence structure
            for w in words[1:6]:
                if w[0].islower() and len(w) > 3:
                    verbs.append(w)
                    break
        processes.append({
            "type": ptype,
            "text": line,
            "subjects": subjects,
            "verbs": verbs[:3],
            "length": len(words),
        })
    
    return processes

def infer_material_world(processes, essay_text):
    """Stage 3: Define the material world — what is the essay made of?"""
    text_lower = essay_text.lower()
    materials = {
        "stone": ["stone", "rock", "mineral", "crystal", "gem", "lapis"],
        "water": ["water", "river", "ocean", "flow", "wave", "stream", "liquid"],
        "light": ["light", "radiant", "shine", "glow", "luminous", "flame", "fire"],
        "glass": ["glass", "crystal", "transparent", "clear", "lens", "mirror"],
        "metal": ["metal", "gold", "silver", "iron", "copper", "bronze"],
        "paper": ["paper", "page", "scroll", "codex", "book", "parchment", "ink"],
        "fabric": ["fabric", "thread", "weave", "cloth", "silk", "wool"],
        "earth": ["earth", "clay", "soil", "ground", "dust", "sand"],
        "body": ["body", "flesh", "blood", "bone", "skin", "heart", "breath"],
        "void": ["void", "dark", "empty", "space", "field", "absence"],
    }
    scores = {}
    for mat, keywords in materials.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            scores[mat] = score
    if not scores:
        return "parchment and ink"
    return max(scores, key=scores.get)

def infer_spatial_world(processes, essay_text):
    """Stage 3: Define the spatial world."""
    text_lower = essay_text.lower()
    spaces = {
        "field": ["field", "space", "plane", "surface", "expanse"],
        "chamber": ["chamber", "room", "interior", "within", "inside", "cave"],
        "axis": ["axis", "vertical", "ascent", "descent", "ladder", "spine"],
        "page": ["page", "manuscript", "book", "codex", "folio", "scroll"],
        "body": ["body", "organism", "anatomy", "flesh", "circulatory"],
        "laboratory": ["laboratory", "forge", "workshop", "alchemy", "vessel"],
        "temple": ["temple", "sanctuary", "altar", "shrine", "sacred"],
        "landscape": ["landscape", "mountain", "valley", "horizon", "world"],
    }
    scores = {}
    for sp, keywords in spaces.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            scores[sp] = score
    if not scores:
        return "manuscript page"
    return max(scores, key=scores.get)

def infer_motion_verbs(processes):
    """Extract dominant motion verbs from the essay's processes."""
    # Collect verbs from processes
    all_verbs = []
    for p in processes:
        all_verbs.extend(p["verbs"])
    
    # Score against known motion verbs
    verb_scores = {}
    for mv in MOTIONS:
        score = sum(1 for v in all_verbs if mv[:4] in v.lower())
        if score > 0:
            verb_scores[mv] = score
    
    # If no matches, pick motions that match the process types
    if not verb_scores:
        types = Counter(p["type"] for p in processes)
        motion_map = {
            "assertion": ["emerge", "stabilize"],
            "definition": ["crystallize", "structure"],
            "mechanism": ["flow", "weave", "pulse"],
            "analogy": ["mirror", "correspond"],
            "contrast": ["differentiate", "collapse"],
            "consequence": ["condense", "integrate"],
            "question": ["expand", "radiate"],
            "resolution": ["integrate", "witness"],
        }
        for pt, count in types.most_common(3):
            for m in motion_map.get(pt, ["pulse"]):
                verb_scores[m] = verb_scores.get(m, 0) + count
    
    top = sorted(verb_scores, key=verb_scores.get, reverse=True)[:6]
    if not top:
        top = ["emerge", "flow", "differentiate", "correspond", "integrate", "transform"]
    return top

def infer_color_semantics(essay_text):
    """Stage 3: Define color semantics — 70-85% neutral, 10-20% secondary, 3-8% accent."""
    text_lower = essay_text.lower()
    
    # Detect dominant materials and map to colors
    material_colors = {
        "gold": ["gold", "gild", "aurum", "sun"],
        "crimson": ["crimson", "blood", "fire", "ruby", "flame"],
        "lapis": ["lapis", "blue", "sapphire", "deep", "night"],
        "ivory": ["ivory", "bone", "parchment", "paper", "page"],
        "umber": ["earth", "brown", "soil", "clay", "umber"],
        "silver": ["silver", "quicksilver", "mercury", "moon"],
        "verdigris": ["green", "verdigris", "emerald", "growth", "leaf"],
        "charcoal": ["charcoal", "black", "dark", "shadow", "ink"],
    }
    
    scores = {}
    for color, keywords in material_colors.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            scores[color] = score
    
    top_colors = sorted(scores, key=scores.get, reverse=True)
    
    # Build palette: neutral field + 2-3 secondary + 1-2 accent
    neutral = "ivory" if "ivory" in top_colors or not top_colors else top_colors[0]
    secondary = [c for c in top_colors if c != neutral][:3]
    accent = [c for c in reversed(top_colors) if c not in secondary and c != neutral][:2]
    if not accent:
        accent = ["crimson"]
    
    return {
        "neutral_field": neutral,
        "secondary": secondary,
        "accent": accent,
        "ratio": "70-85% neutral, 10-20% secondary, 3-8% accent"
    }

# ── RECURRING SYSTEMS ───────────────────────────────────────────────

def build_recurring_systems(processes):
    """Build 4-7 recurring visual systems from the essay's core processes.
    Each system is a visual argument that evolves across the film."""
    types = Counter(p["type"] for p in processes)
    system_patterns = {
        "assertion": {"name": "The Primary Claim", "shape": "circle", "meaning": "the central thesis as field"},
        "definition": {"name": "Terms and Boundaries", "shape": "aperture", "meaning": "defining what is and is not"},
        "mechanism": {"name": "The Operating Principle", "shape": "lattice", "meaning": "how it works internally"},
        "analogy": {"name": "Mirror Worlds", "shape": "mirror", "meaning": "correspondence across levels"},
        "contrast": {"name": "Differentiation", "shape": "branch", "meaning": "one becomes two distinct"},
        "consequence": {"name": "The Chain", "shape": "axis", "meaning": "what follows from what"},
        "question": {"name": "Open Field", "shape": "spiral", "meaning": "inquiry without closure"},
        "resolution": {"name": "Return to Source", "shape": "vessel", "meaning": "all threads converge"},
    }
    
    systems = []
    used_shapes = set()
    for pt, count in types.most_common():
        if len(systems) >= 6:
            break
        if pt in system_patterns:
            sp = system_patterns[pt]
            if sp["shape"] not in used_shapes:
                used_shapes.add(sp["shape"])
                systems.append({
                    "name": sp["name"],
                    "shape": sp["shape"],
                    "meaning": sp["meaning"],
                    "passages": [p for p in processes if p["type"] == pt],
                })
    
    # Fill to 4 minimum
    filler_shapes = [s for s in ["point", "circle", "lattice", "web"] if s not in used_shapes]
    while len(systems) < 4 and filler_shapes:
        fs = filler_shapes.pop(0)
        sh = SHAPES[fs]
        systems.append({
            "name": f"The {sh['meaning'].split(',')[0].title()}",
            "shape": fs,
            "meaning": sh["meaning"],
            "passages": [],
        })
    
    return systems[:7]

# ── VISUAL THESIS ───────────────────────────────────────────────────

def build_visual_thesis(essay_text):
    """Stage 3: Build the complete visual thesis from the essay.
    Returns material world, spatial world, motion verbs, recurring systems, color semantics."""
    processes = extract_processes(essay_text)
    
    thesis = {
        "material_world": infer_material_world(processes, essay_text),
        "spatial_world": infer_spatial_world(processes, essay_text),
        "motion_verbs": infer_motion_verbs(processes),
        "recurring_systems": build_recurring_systems(processes),
        "color_semantics": infer_color_semantics(essay_text),
        "forbidden_cliches": [
            "generic galaxy or star field",
            "random particle effects",
            "unmotivated mandala",
            "generic meditation silhouette",
            "arbitrary concentric circles",
            "stock network graph",
            "constant center composition",
            "decorative motion without semantic function",
        ],
        "process_count": len(processes),
    }
    
    return thesis

def decode_narration_to_shots(thesis, n_shots):
    """Stage 4-5: Decode essay into shot sequence using the visual thesis.
    Each shot maps a process to shape semantics + color + motion."""
    
    import hashlib, random
    rng = random.Random(42)
    
    systems = thesis["recurring_systems"]
    motions = thesis["motion_verbs"]
    colors = thesis["color_semantics"]
    
    shots = []
    system_cycle = []
    for _ in range(n_shots):
        system_cycle.append(systems[_ % len(systems)])
    
    # Ensure variety: no same-system 3 consecutive
    final_systems = []
    for sys in system_cycle:
        if len(final_systems) >= 2 and final_systems[-1]["shape"] == sys["shape"] == final_systems[-2]["shape"]:
            # Find different system
            alt = [s for s in systems if s["shape"] != sys["shape"]]
            if alt:
                sys = rng.choice(alt)
        final_systems.append(sys)
    
    for i in range(n_shots):
        system = final_systems[i]
        shape_info = SHAPES[system["shape"]]
        motion = motions[i % len(motions)]
        
        # Color assignment based on position in film
        if i < n_shots * 0.1:
            color_role = "neutral_field"
        elif i > n_shots * 0.85:
            color_role = "accent"
        else:
            color_role = "secondary" if i % 3 == 0 else "neutral_field"
        
        # Build narration from shape + motion + system
        narration_variants = [
            f"The {system['name'].lower()} {motion}s through the {thesis['spatial_world']}.",
            f"A {shape_info['meaning']} {motion}s within the {thesis['material_world']} field.",
            f"The {thesis['material_world']} field {motion}s as {system['meaning']}.",
            f"{system['meaning'].title()} {motion}s across the {thesis['spatial_world']}.",
            f"What {motion}s is a {shape_info['meaning'].split(',')[0]}.",
        ]
        
        shots.append({
            "shot_id": i + 1,
            "system": system["name"],
            "shape": system["shape"],
            "shape_meaning": shape_info["meaning"],
            "motion": motion,
            "color_role": color_role,
            "material": thesis["material_world"],
            "space": thesis["spatial_world"],
            "narration": narration_variants[i % len(narration_variants)],
        })
    
    return shots

def generate_render_code(shot):
    """Generate inline PIL code for a shot based on its shape + motion."""
    shape = shot["shape"]
    motion = shot["motion"]
    
    # Map shapes to drawing code templates
    shape_templates = {
        "point": "d.ellipse((cx-{r}, cy-{r}, cx+{r}, cy+{r}), fill={color})",
        "circle": "d.ellipse((cx-{r}, cy-{r}, cx+{r}, cy+{r}), outline={color}, width=2)",
        "aperture": "d.arc((cx-{r}, cy-{r}, cx+{r}, cy+{r}), {start}, {end}, fill={color}, width=2)",
        "axis": "d.line((cx, cy-{len}, cx, cy+{len}), fill={color}, width=2)",
        "branch": "d.line((cx, cy, cx+{dx}, cy-{dy}), fill={color}, width=2)",
        "lattice": "for i in range({n}): d.line((cx-{w}+i*{step}, cy-{h}, cx-{w}+i*{step}, cy+{h}), fill={color}, width=1)",
        "vessel": "d.ellipse((cx-{w}, cy-{h}, cx+{w}, cy+{h}), outline={color}, width=2)",
        "mirror": "d.line((cx-{len}, cy, cx+{len}, cy), fill={color}, width=2)",
        "mosaic": "d.ellipse((cx-{r}, cy-{r}, cx+{r}, cy+{r}), outline={color}, width=1)",
        "spiral": "d.line((cx, cy, cx+{dx}, cy+{dy}), fill={color}, width=1)",
        "web": "d.line((cx, cy, cx+{dx}, cy+{dy}), fill={color}, width=1)",
    }
    
    code = shape_templates.get(shape, "d.ellipse((cx-30, cy-30, cx+30, cy+30), outline=GOLD, width=2)")
    return code

def generate_narration(shots):
    """Generate unique narration per shot."""
    lines = [s["narration"] for s in shots]
    return "\n\n".join(lines)

def get_continuity_rules(thesis):
    """Extract continuity rules from the visual thesis."""
    rules = []
    for system in thesis["recurring_systems"]:
        rules.append(f"The '{system['name']}' system ({system['shape']}) represents {system['meaning']}")
    rules.append(f"The visual thesis operates in a {thesis['spatial_world']} made of {thesis['material_world']}")
    rules.append(f"Dominant motions: {', '.join(thesis['motion_verbs'][:4])}")
    return rules[:8]
