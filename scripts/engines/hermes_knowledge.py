#!/usr/bin/env python3
"""Hermes knowledge query interface — machine-readable access to all research data.

Usage:
  python3 hermes_knowledge.py --topic kundalini
  python3 hermes_knowledge.py --phrase "the bizarre life"
  python3 hermes_knowledge.py --best-niches 10
  python3 hermes_knowledge.py --framing-words
  python3 hermes_knowledge.py --channel ESOTERICA
  python3 hermes_knowledge.py --rules
  python3 hermes_knowledge.py --summarize  # full overview for new agent
"""

import json, sys, os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "research" / "layer2"
KNOWLEDGE = Path(__file__).parent.parent.parent / "data" / "hermes-knowledge.json"

def load_knowledge():
    with open(KNOWLEDGE) as f:
        return json.load(f)

def load_all_videos():
    videos = []
    for f in sorted(DATA_DIR.glob("analysis_*.json")):
        if "tantra_" in f.name: continue
        with open(f) as fh:
            ch = json.load(fh)
        for v in ch["videos"]:
            v["_channel"] = ch["channel"]
            videos.append(v)
    return videos

def query_topic(keyword):
    videos = load_all_videos()
    hits = [v for v in videos if keyword.lower() in v.get("title","").lower()]
    if not hits:
        # Check knowledge base
        k = load_knowledge()
        for entry in k["topics"]["tantra_keywords_channel_controlled"]:
            if entry["keyword"] == keyword.lower():
                return entry
        return {"error": f"No data for '{keyword}'"}
    
    overall = len(videos)
    brk = sum(1 for v in hits if v.get("is_breakout"))
    chs = len(set(v["_channel"] for v in hits))
    return {
        "keyword": keyword,
        "occurrences": len(hits),
        "channels": chs,
        "breakout_rate": round(brk/len(hits), 3),
        "baseline_rate": round(sum(1 for v in videos if v.get("is_breakout"))/overall, 3),
        "lift": round((brk/len(hits)) / (sum(1 for v in videos if v.get("is_breakout"))/overall), 2),
        "avg_views": int(sum(v["views"] for v in hits)/len(hits)),
    }

def best_niches(n=10):
    k = load_knowledge()
    return k["niche_breakout_rates"]["best_performers"][:n]

def framing_words():
    k = load_knowledge()
    return k["framing_words"]["data"]

def get_channel(name):
    path = DATA_DIR / f"analysis_{name.lower().replace(' ','_')}.json"
    if not path.exists():
        # Try to find it
        for f in DATA_DIR.glob("analysis_*.json"):
            with open(f) as fh:
                ch = json.load(fh)
            if ch["channel"].lower() == name.lower():
                return {"channel": ch["channel"], "subs": ch["subs"],
                        "median_views": ch["median_views"], "breakout_rate": ch["breakout_rate"],
                        "videos_analyzed": ch["analyzed_videos"]}
        return {"error": f"Channel '{name}' not found"}
    ch = json.load(open(path))
    return {"channel": ch["channel"], "subs": ch["subs"], "median_views": ch["median_views"],
            "breakout_rate": ch["breakout_rate"], "videos_analyzed": ch["analyzed_videos"]}

def rules():
    k = load_knowledge()
    return k["content_rules"]["rules"]

def summarize():
    k = load_knowledge()
    return {
        "total_channels": k["channel_analysis"]["total_channels"],
        "total_videos": k["channel_analysis"]["total_videos"],
        "model_auc": k["title_patterns"]["model_auc"],
        "top_phrases": [p["phrase"] for p in k["phrases"]["data"][:5]],
        "top_rules": [r["rule"] for r in k["content_rules"]["rules"][:5]],
        "channel_blueprint": list(k["channel_blueprint"]["channels"].keys()),
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "--topic" and len(sys.argv) > 2:
        print(json.dumps(query_topic(sys.argv[2]), indent=2))
    elif cmd == "--best-niches":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        print(json.dumps(best_niches(n), indent=2))
    elif cmd == "--framing-words":
        print(json.dumps(framing_words(), indent=2))
    elif cmd == "--channel" and len(sys.argv) > 2:
        print(json.dumps(get_channel(sys.argv[2]), indent=2))
    elif cmd == "--rules":
        print(json.dumps(rules(), indent=2))
    elif cmd == "--summarize":
        print(json.dumps(summarize(), indent=2))
    elif cmd == "--phrase" and len(sys.argv) > 2:
        k = load_knowledge()
        for p in k["phrases"]["data"]:
            if sys.argv[2].lower() in p["phrase"].lower():
                print(json.dumps(p, indent=2))
                break
        else:
            print(json.dumps({"error": f"Phrase '{sys.argv[2]}' not found"}, indent=2))
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
