#!/usr/bin/env python3
"""
Semantic scene search: given a narration concept, find the best matching
scene function from our 261-function library.

Usage:
    python3 factory/scripts/search-scenes.py "wheel of powers"
    python3 factory/scripts/search-scenes.py "grief sits like a stone" --top 5
"""
import json, sys, re
from pathlib import Path

INDEX_PATH = Path(__file__).parent.parent / "scene-index.json"

# Concept→function keyword mapping (hand-curated from platinum analysis)
# Each concept maps to: (function_name, pack, description)
CONCEPT_MAP = {
    # Spanda concepts
    "hidden pulse": ("s_hook", "spanda_scenes", "Dot with pulsing rings"),
    "spanda": ("s_hook", "spanda_scenes", "Dot with pulsing rings"),
    "wheel": ("s_wheel", "spanda_scenes", "Wheel with hub, three spokes, ring"),
    "six names": ("s_six", "spanda_scenes", "Six Sanskrit terms radiating from center"),
    "mantra": ("s_mantra", "spanda_scenes", "Breathing aperture with particles"),
    "breath": ("s_mantra", "spanda_scenes", "Breathing aperture"),
    "perception": ("s_perception", "spanda_scenes", "Eye opening/closing"),
    "eye": ("s_perception", "spanda_scenes", "Eye aperture"),
    "unmesha": ("s_perception", "spanda_scenes", "Eye opening"),
    "nimesha": ("s_perception", "spanda_scenes", "Eye closing"),
    "throb": ("s_throb", "spanda_scenes", "Throbbing organic rings"),
    "fish": ("s_throb", "spanda_scenes", "Throbbing organic rings"),
    "chain": ("s_chain", "spanda_scenes", "Five-layer cascade: TIME→BREATH→SPANDA→VOID→CONSCIOUSNESS"),
    "cascade": ("s_chain", "spanda_scenes", "Five-layer cascade"),
    "time": ("s_chain", "spanda_scenes", "Time→breath→void chain"),
    "universe is play": ("s_play", "spanda_scenes", "Orbiting geometry, dots in circular motion"),
    "play": ("s_play", "spanda_scenes", "Orbiting geometry"),
    "krida": ("s_play", "spanda_scenes", "Orbiting geometry"),
    "recognition": ("s_recog", "spanda_scenes", "Radial collapse to center dot"),
    "pratyabhijna": ("s_recog", "spanda_scenes", "Recognition field collapsing"),
    "expansion": ("s_close", "spanda_scenes", "Dot expands to fill frame"),
    "bliss": ("s_close", "spanda_scenes", "Expanding dot, complete expansion"),
    
    # Light pack concepts
    "light": ("scene_light_darkness", "light_pack", "Radiating light from darkness"),
    "darkness": ("scene_light_darkness", "light_pack", "Light emerging from void"),
    "wave": ("scene_light_wave", "light_pack", "Expanding rings of light"),
    "candle": ("scene_candle", "light_pack", "Single flame illumination"),
    "vibration": ("scene_vibration", "light_pack", "Multiple frequency wave patterns"),
    "resonance": ("scene_vibration", "light_pack", "Wave interference patterns"),
    
    # Core concepts
    "branches": ("scene_branching", "core_scenes", "Branching tree structure"),
    "tree": ("scene_branching", "core_scenes", "Branching structure"),
    "harmonograph": ("scene_harmonograph", "core_scenes", "Lissajous curve pattern"),
    "lattice": ("scene_tattva_lattice", "core_scenes", "Geometric lattice of tattvas"),
    "tattva": ("scene_tattva_lattice", "core_scenes", "Tattva lattice geometry"),
    "rings": ("scene_constraint_rings", "core_scenes", "Concentric constraint rings"),
    "constraint": ("scene_constraint_rings", "core_scenes", "Nested ring constraints"),
    "dissolve": ("scene_dissolution", "core_scenes", "Dissolution pattern fading"),
    "dissolution": ("scene_dissolution", "core_scenes", "Pattern dissolving away"),
    
    # Spanda Karika concepts
    "inner exertion": ("s01_inner_exertion", "spanda_karika", "Harmonograph line building progressively"),
    "exertion": ("s01_inner_exertion", "spanda_karika", "Harmonograph emergence"),
    "six names sk": ("s02_six_names", "spanda_karika", "L-system branching six names"),
    "wave upon wave": ("s03_wave_upon_wave", "spanda_karika", "Overlapping wave patterns"),
    "breath pulse": ("s04_breath_pulse", "spanda_karika", "Breathing pulse geometry"),
    "the centre": ("s05_the_centre", "spanda_karika", "Pulsing core at center"),
    "cosmic bliss": ("s06_cosmic_bliss", "spanda_karika", "Radial wheel expanding outward"),
    
    # VBT concepts
    "between breaths": ("s01_between_breaths", "vijnana_bhairava", "Two breathing spheres"),
    "third eye": ("s02_third_eye", "vijnana_bhairava", "Radiating lines from center"),
    "central channel": ("s03_central_channel", "vijnana_bhairava", "Vertical energy channel"),
    "between thoughts": ("s04_between_thoughts", "vijnana_bhairava", "Gap between thought pulses"),
    "sense withdrawal": ("s05_sense_withdrawal", "vijnana_bhairava", "Senses folding inward"),
    "sudden awakening": ("s06_sudden_awakening", "vijnana_bhairava", "Sudden expansion from center"),
    
    # Minimal forms
    "breathing circle": ("scene_breathing", "minimal_forms", "Circle that breathes in/out"),
    "rotating": ("scene_rotating", "minimal_forms", "Rotating geometric form"),
    "expanding ring": ("scene_expanding_ring", "minimal_forms", "Ring expanding outward"),
    "pulsing dots": ("scene_pulsing_dots", "minimal_forms", "Dots pulsing in sequence"),
    "growing line": ("scene_growing_line", "minimal_forms", "Line that grows across frame"),
    
    # Complex forms
    "mandelbrot": ("scene_mandelbrot", "complexity_pack", "Mandelbrot set fractal"),
    "julia": ("scene_julia", "complexity_pack", "Julia set fractal"),
    "cellular": ("scene_cellular", "complexity_pack", "Cellular automaton"),
    
    # Consciousness states
    "waking": ("scene_waking", "consciousness_states", "Waking state geometry"),
    "dream": ("scene_dream", "consciousness_states", "Dream state flowing forms"),
    "deep sleep": ("scene_deep_sleep", "consciousness_states", "Deep sleep void"),
    "fourth": ("scene_fourth", "consciousness_states", "Turiya state beyond"),
    
    # Concept packs
    "shiva": ("scene_shiva", "concept_packs", "Shiva tattva geometry"),
    "shakti": ("scene_shakti", "concept_packs", "Shakti energy pattern"),
    "nataraja": ("scene_nataraja_dance", "concept_packs", "Nataraja cosmic dance"),
    "kali": ("scene_kali_time", "concept_packs", "Kali time-devouring geometry"),
    "abhinavagupta": ("scene_abhinavagupta", "concept_packs", "Abhinavagupta portrait geometry"),
}

# Also search the function index for fuzzy matches
def load_index():
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text())
    return {"scenes": []}

def search(query: str, top_k: int = 5):
    """Search for the best scene functions matching a concept."""
    query = query.lower()
    results = []
    
    # 1. Exact concept match
    for concept, (func, pack, desc) in CONCEPT_MAP.items():
        if concept in query or query in concept:
            # Score by how much of the concept is covered
            overlap = len(set(concept.split()) & set(query.split()))
            score = overlap / max(len(query.split()), 1) * 100
            results.append({
                "function": func,
                "pack": pack,
                "description": desc,
                "match_type": "concept",
                "score": score + 50,  # boost exact matches
            })
    
    # 2. Partial word matching
    index = load_index()
    for scene in index.get("scenes", []):
        title = scene.get("title", "").lower()
        concepts = [c.lower() for c in scene.get("concepts", [])]
        search_text = title + " " + " ".join(concepts)
        
        query_words = set(query.split())
        title_words = set(title.split())
        common = query_words & title_words
        if common:
            score = len(common) / max(len(query_words), 1) * 100
            # Skip if already in results via exact match
            if not any(r["function"] == scene["function"] and r["pack"] == scene["pack"] for r in results):
                results.append({
                    "function": scene["function"],
                    "pack": scene["pack"],
                    "description": scene.get("title", ""),
                    "match_type": "index",
                    "score": score,
                })
    
    # 3. Keyword match in concept map (partial keyword)
    for concept, (func, pack, desc) in CONCEPT_MAP.items():
        query_words = set(query.split())
        concept_words = set(concept.split())
        common = query_words & concept_words
        if common and len(common) >= 1:
            if not any(r["function"] == func and r["pack"] == pack for r in results):
                overlap = len(common) / max(len(query_words), 1) * 100
                results.append({
                    "function": func,
                    "pack": pack,
                    "description": desc,
                    "match_type": "keyword",
                    "score": overlap,
                })
    
    # Sort by score descending
    results.sort(key=lambda r: -r["score"])
    return results[:top_k]

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "pulse"
    top_k = 5
    if "--top" in sys.argv:
        idx = sys.argv.index("--top")
        top_k = int(sys.argv[idx + 1])
    
    results = search(query, top_k)
    print(f"Search: \"{query}\"")
    print(f"{'Score':>6} {'Function':25s} {'Pack':20s} {'Description'}")
    print("-" * 80)
    for r in results:
        print(f"{r['score']:5.0f}% {r['function']:25s} {r['pack']:20s} {r['description'][:40]}")
