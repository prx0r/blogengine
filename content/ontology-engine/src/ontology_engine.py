"""ontology_engine.py — Canonical Ontology Engine Runtime.

Three-stage compilation pipeline:
  1. normalize_scene  — validate structure, fill defaults
  2. resolve_scene    — archetypes→components, assets→files, operators→capabilities
  3. compile_timeline — shots + timing → frame-level event list
"""
import json
from pathlib import Path
from typing import Any, Optional

# Registered visual components per archetype
# Each maps to a renderer implementation in visionary-renderer/src/primitives/
ARCHETYPE_COMPONENTS = {
    "bindu": {"component": "Bindu", "type": "circle", "defaults": {"radius": 12, "color": "#8b1e1e"}},
    "field": {"component": "Field", "type": "concentric_field", "defaults": {"ring_count": 3, "opacity": 0.5}},
    "eye": {"component": "Eye", "type": "eye_outline", "defaults": {"color": "#111111"}},
    "wave": {"component": "Wave", "type": "sine_wave", "defaults": {"amplitude": 20, "color": "#8b1e1e"}},
    "mirror": {"component": "Mirror", "type": "mirror_pair", "defaults": {"axis": "vertical"}},
    "void": {"component": "Void", "type": "empty_region", "defaults": {"size": 0.5}},
    "flame": {"component": "Flame", "type": "flame_shape", "defaults": {"color": "#8b1e1e"}},
    "mandala": {"component": "Mandala", "type": "concentric_circles", "defaults": {"rings": 7, "color": "#111111"}},
    "pillar": {"component": "Pillar", "type": "vertical_line", "defaults": {"color": "#111111"}},
    "thread": {"component": "Thread", "type": "horizontal_line", "defaults": {"color": "#111111"}},
    "hexagram": {"component": "Hexagram", "type": "interlocking_triangles", "defaults": {"color": "#8b1e1e"}},
    "spiral": {"component": "Spiral", "type": "archimedean", "defaults": {"color": "#111111"}},
    "threshold": {"component": "Threshold", "type": "arch", "defaults": {"color": "#111111"}},
    "net": {"component": "Net", "type": "grid", "defaults": {"color": "#111111"}},
    "seed": {"component": "Seed", "type": "small_dot", "defaults": {"color": "#8b1e1e"}},
    "contraction": {"component": "Contraction", "type": "shrinking_circle", "defaults": {"color": "#8b1e1e"}},
    "expansion": {"component": "Expansion", "type": "expanding_circle", "defaults": {"color": "#111111"}},
    "tree": {"component": "Tree", "type": "tree_diagram", "defaults": {"color": "#111111"}},
}

# Registered camera modes for Skia backend
CAMERA_MODES = {
    "hold": {"behavior": "static", "params": {}},
    "push": {"behavior": "zoom_in", "params": {"from": 1.0, "to": 1.04, "target": "center"}},
    "pull_back": {"behavior": "zoom_out", "params": {"from": 1.0, "to": 0.96, "target": "center"}},
    "pan": {"behavior": "translate", "params": {"from_x": 0, "to_x": 100, "from_y": 0, "to_y": 0}},
    "track": {"behavior": "translate", "params": {"from_x": 0, "to_x": 200, "from_y": 0, "to_y": 0}},
}

# Registered transitions
TRANSITION_TYPES = {"cut", "dissolve", "fade_to_white", "fade_to_black", "wipe", "dissolve_to_white", "dissolve_to_black"}


class ValidationError(Exception):
    pass


class OntologyEngine:
    def __init__(self, root: str = "content/ontology-engine"):
        self.root = Path(root)
        self.packs: dict = {}
        self.canonical_relations: dict = {}
        self.canonical_operators: dict = {}
        self.visual_archetypes: dict = {}
        self._load()

    def _load(self):
        self.canonical_relations = json.loads((self.root/"canonical/relations.json").read_text())["relations"]
        self.canonical_operators = {o["id"]: o for o in json.loads((self.root/"canonical/operators.json").read_text())["operators"]}
        self.visual_archetypes = {a["id"]: a for a in json.loads((self.root/"canonical/visual-archetypes.json").read_text())["archetypes"]}
        for f in (self.root/"ontology-packs").glob("*.json"):
            p = json.loads(f.read_text())
            self.packs[p["pack_id"]] = p

    def list_packs(self):
        return [{"id":p["pack_id"],"tradition":p["tradition"],"entity_count":len(p.get("entities",[]))} for p in self.packs.values()]

    # ── Stage 1: Normalize ─────────────────────────────────────────────

    def normalize_scene(self, scene: dict) -> dict:
        """Validate structure and fill harmless defaults."""
        out = dict(scene)
        out.setdefault("width", 1920)
        out.setdefault("height", 1080)
        out.setdefault("fps", 30)
        out.setdefault("background", "#FFFFFF")
        out.setdefault("entities", [])
        out.setdefault("operators", [])

        timeline = out.get("timeline") or {}
        timeline.setdefault("duration", 5.0)
        timeline.setdefault("keyframes", [])
        timeline.setdefault("phrases", [])
        out["timeline"] = timeline

        out.setdefault("shots", [])
        out.setdefault("continuity", {})

        # Validate entity IDs are unique
        ids = [e["id"] for e in out["entities"]]
        if len(ids) != len(set(ids)):
            raise ValidationError(f"Duplicate entity IDs: {[i for i in ids if ids.count(i) > 1]}")

        # Validate shots reference existing entities
        for s in out.get("shots", []):
            for layer in s.get("layers", []):
                if layer.get("entity") and layer["entity"] not in ids:
                    raise ValidationError(f"Shot {s['id']} references unknown entity '{layer['entity']}'")

        return out

    # ── Stage 2: Resolve ───────────────────────────────────────────────

    def resolve_scene(self, scene: dict) -> dict:
        """Resolve archetypes to components, assets to files, validate operators."""
        out = dict(scene)
        out["resolved"] = {"elements": [], "warnings": [], "errors": []}

        for e in scene.get("entities", []):
            arch_id = e.get("visual_archetype", "bindu")
            component = ARCHETYPE_COMPONENTS.get(arch_id)

            if not component:
                out["resolved"]["errors"].append({
                    "entity": e["id"], "archetype": arch_id,
                    "reason": "no renderer component registered"
                })
                continue

            resolved = {
                "id": e["id"],
                "archetype": arch_id,
                "component": component["component"],
                "type": component["type"],
                "position": e.get("position", "center"),
                "color": e.get("color", component["defaults"].get("color", "#111111")),
                "label": e.get("sanskrit", e.get("name", "")),
                "params": {**component["defaults"], **e.get("params", {})},
            }
            out["resolved"]["elements"].append(resolved)

        # Resolve camera modes
        for s in out.get("shots", []):
            cam = s.get("camera")
            if isinstance(cam, str):
                mode = CAMERA_MODES.get(cam)
                if not mode:
                    out["resolved"]["warnings"].append(f"Unknown camera mode '{cam}', using hold")
                    mode = CAMERA_MODES["hold"]
                s["camera"] = {"mode": cam, **mode["params"]}
            elif isinstance(cam, dict):
                mode_name = cam.get("mode", "hold")
                mode = CAMERA_MODES.get(mode_name)
                if mode:
                    cam.setdefault("behavior", mode["behavior"])
                    for k, v in mode["params"].items():
                        cam.setdefault(k, v)

        # Validate transitions
        for s in out.get("shots", []):
            t = s.get("transition", "cut")
            if isinstance(t, str) and t not in TRANSITION_TYPES:
                out["resolved"]["warnings"].append(f"Unknown transition '{t}', using cut")
                s["transition"] = "cut"

        # Validate operators
        for op in out.get("operators", []):
            if op["id"] not in self.canonical_operators:
                out["resolved"]["warnings"].append(f"Unknown operator '{op['id']}'")

        return out

    # ── Stage 3: Compile Timeline ──────────────────────────────────────

    def compile_timeline(self, scene: dict) -> dict:
        """Convert shots + semantic timing into frame-level timeline."""
        fps = scene.get("fps", 30)
        duration = scene.get("timeline", {}).get("duration", 5.0)
        total_frames = int(duration * fps)

        # Build frame events from keyframes
        frame_events = []
        for kf in scene.get("timeline", {}).get("keyframes", []):
            frame = int(kf["time"] * fps)
            frame_events.append({"frame": frame, "time": kf["time"], "action": kf["action"]})

        # Build phrase events from timeline phrases
        phrase_events = []
        for phrase in scene.get("timeline", {}).get("phrases", []):
            frame = int(phrase.get("time", 0) * fps)
            phrase_events.append({"frame": frame, "time": phrase.get("time", 0),
                                  "word": phrase.get("word", ""), "action": phrase.get("action", ""),
                                  "entity": phrase.get("entity", "")})

        # Build shot boundaries
        shot_boundaries = []
        for s in scene.get("shots", []):
            start_frame = int(s.get("start", 0) * fps)
            end_frame = int(s.get("end", duration) * fps)
            shot_boundaries.append({
                "id": s["id"],
                "start_frame": start_frame,
                "end_frame": end_frame,
                "camera": s.get("camera", {"mode": "hold"}),
                "transition": s.get("transition", "cut"),
                "layers": s.get("layers", []),
            })

        # Build the frame-by-frame event list
        events = []
        for f in range(total_frames):
            frame_actions = {"frame": f, "time": f / fps, "actions": [], "active_shot": None,
                             "active_entities": [], "camera": {"mode": "hold", "zoom": 1.0}}

            # Find active shot
            for sb in shot_boundaries:
                if sb["start_frame"] <= f < sb["end_frame"]:
                    frame_actions["active_shot"] = sb["id"]
                    frame_actions["camera"] = dict(sb["camera"])
                    break

            # Keyframe events at this frame
            for ev in frame_events:
                if ev["frame"] == f:
                    frame_actions["actions"].append(ev["action"])

            # Phrase events at this frame
            for pe in phrase_events:
                if pe["frame"] == f and pe["action"]:
                    frame_actions["actions"].append(pe["action"])

            events.append(frame_actions)

        # Compile operator-driven animations into parameter tracks
        param_tracks = {}
        for op in scene.get("operators", []):
            tid = f"{op['target']}.{op['id']}"
            start_frame = int(op.get("delay", 0) * fps)
            end_frame = start_frame + int(op.get("duration", 1) * fps)
            param_tracks[tid] = {
                "target": op["target"],
                "operator": op["id"],
                "start_frame": start_frame,
                "end_frame": end_frame,
                "easing": op.get("easing", "linear"),
                "params": {k: v for k, v in op.items() if k in ("frequency", "amplitude", "to")},
            }

        return {
            "scene_id": scene.get("scene_id", "unknown"),
            "fps": fps,
            "duration": duration,
            "total_frames": total_frames,
            "width": scene.get("width", 1920),
            "height": scene.get("height", 1080),
            "background": scene.get("background", "#FFFFFF"),
            "elements": scene.get("resolved", {}).get("elements", []),
            "shots": shot_boundaries,
            "frame_events": events,
            "param_tracks": param_tracks,
            "phrase_events": phrase_events,
            "warnings": scene.get("resolved", {}).get("warnings", []),
            "errors": scene.get("resolved", {}).get("errors", []),
            "continuity": scene.get("continuity", {}),
        }

    # ── Full compilation pipeline ──────────────────────────────────────

    def compile_scene(self, scene: dict) -> dict:
        """Run the full 3-stage pipeline. Returns renderer-neutral timeline."""
        try:
            normalized = self.normalize_scene(scene)
        except ValidationError as e:
            return {"status": "error", "stage": "normalize", "message": str(e)}

        resolved = self.resolve_scene(normalized)

        # Fail on unresolved archetypes
        if resolved["resolved"]["errors"]:
            return {"status": "error", "stage": "resolve", "errors": resolved["resolved"]["errors"]}

        timeline = self.compile_timeline(resolved)
        timeline["status"] = "ok"
        timeline["warnings"] = resolved["resolved"]["warnings"]
        return timeline

    def cross_map(self, source_pack: str, source_entity: str, target_pack: str) -> Optional[dict]:
        mf = self.root / "mappings/direct-mappings.json"
        if not mf.exists(): return None
        for m in json.loads(mf.read_text())["mappings"]:
            if m["source"]["tradition"]==source_pack and m["source"]["entity"]==source_entity and m["target"]["tradition"]==target_pack:
                te = self.packs.get(target_pack,{})
                te2 = next((x for x in te.get("entities",[]) if x["id"]==m["target"]["entity"]), None)
                return {"source":source_entity,"target":m["target"]["entity"],"target_data":te2,
                        "relation":m["canonical_relation"],"strength":m.get("strength",""),"note":m.get("note","")}
        return None


if __name__ == "__main__":
    eng = OntologyEngine()
    print(f"Loaded {len(eng.packs)} packs")

    # Test with scene-01-hook
    import sys
    test_path = Path(__file__).parent.parent / "examples" / "scene-01-hook.json"
    if test_path.exists():
        scene = json.loads(test_path.read_text())
        result = eng.compile_scene(scene)
        print(f"Compile status: {result.get('status')}")
        if result.get("warnings"):
            for w in result["warnings"]:
                print(f"  WARN: {w}")
        if result.get("errors"):
            for e in result["errors"]:
                print(f"  ERROR: {e}")
        if result.get("status") == "ok":
            print(f"  Elements: {len(result['elements'])}")
            print(f"  Shots: {len(result['shots'])}")
            print(f"  Frame events: {len(result['frame_events'])}")
            print(f"  Param tracks: {len(result['param_tracks'])}")
            print(f"  Phrase events: {len(result['phrase_events'])}")
            # Save compiled output
            out_path = test_path.parent / "scene-01-hook-compiled.json"
            out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))
            print(f"  Saved: {out_path}")
    else:
        print(f"Test scene not found: {test_path}")
