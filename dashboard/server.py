#!/usr/bin/env python3
"""Operator Cockpit — lightweight Flask dashboard for content farm operations."""
import json, os, re, subprocess, glob, urllib.request, time, threading, sys
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).parent.parent
_cache = {}
_cache_lock = threading.Lock()
_predictor = None

sys.path.insert(0, str(ROOT / "scripts" / "engines"))

def load_predictor():
    global _predictor
    if _predictor is not None:
        return _predictor
    try:
        from predict_views import ViewsPredictor
        _predictor = ViewsPredictor()
        print(f"Predictor loaded: {_predictor.holdout_auc}", file=sys.stderr)
    except Exception as e:
        print(f"Predictor load failed: {e}", file=sys.stderr)
        return None
    return _predictor

def cached(key, ttl=60):
    def deco(fn):
        def wrapper(*a, **kw):
            now = time.time()
            with _cache_lock:
                if key in _cache and now - _cache[key]["time"] < ttl:
                    return _cache[key]["data"]
            result = fn(*a, **kw)
            with _cache_lock:
                _cache[key] = {"data": result, "time": time.time()}
            return result
        return wrapper
    return deco

app = Flask(__name__, static_folder="static")

ROOT = Path("/root/projects/blog")
BLUEPRINTS = ROOT / "tantrafiles" / "blueprints"
LAYER2 = ROOT / "data" / "research" / "layer2"
PUBLISHING = ROOT / "content" / "publishing" / "scripts"
FABLECUT_DIR = ROOT.parent / "FableCut"
HERMES_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
HERMES_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "")

def parse_blueprint(path):
    text = path.read_text()
    bp_id = re.search(r'\* `blueprint_id`: (\S+)', text)
    title = re.search(r'^# Research Blueprint \d+: (.+)$', text, re.MULTILINE)
    channel = re.search(r'\* `channel`: (\S+)', text)
    runtime = re.search(r'\* `target_runtime_minutes`: (\d+)', text)
    beats = len(re.findall(r'^\d+\.\s+\*\*', text, re.MULTILINE))
    hook = re.search(r'## Charged Hook\n\n(.+?)(?:\n\n)', text, re.DOTALL)
    return {
        "id": bp_id.group(1) if bp_id else path.stem,
        "title": title.group(1).strip()[:80] if title else path.stem,
        "channel": channel.group(1) if channel else "?",
        "runtime": int(runtime.group(1)) if runtime else 20,
        "beats": beats,
        "hook": hook.group(1).strip()[:150] if hook else "",
    }

def pipeline_status(bp_id):
    slug = bp_id.lower()
    base = PUBLISHING / slug
    return {
        "beat_map": base.joinpath("beat-map.md").exists(),
        "fablecut_project": base.joinpath(f"{slug}-fablecut.json").exists(),
        "media_dir": base.joinpath("media").exists(),
    }

@cached("channel_stats", ttl=60)
def channel_stats():
    channels = []
    for f in sorted(LAYER2.glob("analysis_*.json")):
        if "tantra_" in f.name: continue
        with open(f) as fh:
            d = json.load(fh)
        channels.append({
            "name": d["channel"], "subs": d["subs"],
            "median_views": d["median_views"], "analyzed": d["analyzed_videos"],
            "breakout_rate": d.get("breakout_rate", 0),
            "output_per_month": d.get("output_per_month", 0),
        })
    return sorted(channels, key=lambda c: -c["subs"])

# ── API ROUTES ──────────────────────────────────────────────────────────────

@app.route("/api/status")
def api_status():
    fablecut_ok = False
    try:
        r = urllib.request.urlopen("http://localhost:7777/", timeout=2)
        fablecut_ok = r.status == 200
    except: pass
    bps = list(BLUEPRINTS.glob("TBP-*.md"))
    return jsonify({
        "fablecut": "running" if fablecut_ok else "stopped",
        "blueprints": len(bps),
        "channels_analyzed": len(list(LAYER2.glob("analysis_*.json"))),
    })

@app.route("/api/blueprints")
def api_blueprints():
    bps = []
    for f in sorted(BLUEPRINTS.glob("TBP-*.md")):
        bp = parse_blueprint(f)
        pipe = pipeline_status(bp["id"])
        bps.append({**bp, "pipeline": pipe})
    return jsonify({"blueprints": bps})

@app.route("/api/blueprints/<bp_id>")
def api_blueprint_detail(bp_id):
    path = BLUEPRINTS / f"{bp_id.upper()}.md"
    if not path.exists():
        for f in BLUEPRINTS.glob(f"{bp_id.upper()}*.md"):
            path = f; break
        else:
            return jsonify({"error": "not found"}), 404
    bp = parse_blueprint(path)
    pipe = pipeline_status(bp["id"])
    # Extract beats
    text = path.read_text()
    beats = []
    for m in re.finditer(r'^(\d+)\.\s+\*\*(.+?)\*\*\s+\((\d+):(\d+)-(\d+):(\d+)\)\s+.*?—\s+(.+)$', text, re.MULTILINE):
        beats.append({"n": m.group(1), "title": m.group(2), "start": f"{m.group(3)}:{m.group(4)}",
                      "end": f"{m.group(5)}:{m.group(6)}", "role": m.group(7).strip()})
    return jsonify({**bp, "pipeline": pipe, "beats": beats})

@app.route("/api/channels")
def api_channels():
    return jsonify({"channels": channel_stats()})

@app.route("/api/channels/<name>")
def api_channel_detail(name):
    for f in LAYER2.glob("analysis_*.json"):
        with open(f) as fh:
            d = json.load(fh)
        if d["channel"].lower() == name.lower():
            return jsonify(d)
    return jsonify({"error": "not found"}), 404

@app.route("/api/predict")
def api_predict():
    title = request.args.get("title", "")
    if not title:
        return jsonify({"error": "provide ?title=..."}), 400
    p = load_predictor()
    if p is None:
        return jsonify({"error": "model not loaded"}), 500
    try:
        result = p.predict(title)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/fablecut/status")
def api_fablecut_status():
    try:
        r = urllib.request.urlopen("http://localhost:7777/", timeout=2)
        return jsonify({"status": "running", "port": 7777, "code": r.status})
    except Exception as e:
        return jsonify({"status": "stopped", "error": str(e)})

@app.route("/api/fablecut/project")
def api_fablecut_project():
    path = FABLECUT_DIR / "project.json"
    if path.exists():
        return jsonify(json.loads(path.read_text()))
    return jsonify({"error": "no project"}), 404

@app.route("/api/hermes/send", methods=["POST"])
def api_hermes_send():
    data = request.json
    msg = data.get("message", "")
    channel = data.get("channel", "general")
    if not HERMES_TOKEN:
        return jsonify({"error": "Telegram not configured"}), 400
    try:
        r = urllib.request.urlopen(
            f"https://api.telegram.org/bot{HERMES_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": HERMES_CHAT, "text": f"[{channel}] {msg}",
                           "parse_mode": "Markdown"}).encode(),
            timeout=5)
        return jsonify({"ok": True, "response": json.loads(r.read())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate/<bp_id>", methods=["POST"])
def api_generate(bp_id):
    """Run blueprint-to-fablecut pipeline for a blueprint."""
    scripts_dir = ROOT / "scripts" / "engines"
    script = scripts_dir / "blueprint-to-fablecut.py"
    # Find the blueprint file
    bp_path = None
    for f in BLUEPRINTS.glob(f"{bp_id.upper()}*.md"):
        bp_path = f; break
    if not bp_path or not script.exists():
        return jsonify({"error": "blueprint or pipeline not found"}), 404
    try:
        r = subprocess.run(["python3", str(script), str(bp_path)],
                          capture_output=True, text=True, timeout=30)
        return jsonify({"output": r.stdout, "error": r.stderr[:500] if r.returncode != 0 else ""})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics/overview")
def api_analytics():
    channels = channel_stats()
    total_views = sum(c["median_views"] * c["analyzed"] for c in channels if c["median_views"])
    top_channels = sorted(channels, key=lambda c: -c["median_views"])[:5]
    return jsonify({"total_estimated_views": total_views,
                    "channels_analyzed": len(channels),
                    "top_channels": top_channels})

# ── STATIC FILES ────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    print(f"Dashboard: http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
