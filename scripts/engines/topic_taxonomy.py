#!/usr/bin/env python3
"""
Topic Taxonomy — reusable topic classification for any video title.
Apply to any dataset to find which topics outperform.

Usage:
  from topic_taxonomy import classify_title, find_hidden_niches
  cats = classify_title("Who was Abhinavagupta?")
  niches = find_hidden_niches(all_videos, taxonomy)
"""

import json, re, numpy as np
from pathlib import Path
from collections import defaultdict, Counter

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "research" / "layer2"

TAXONOMY = {
    "esoteric_magic": {
        "label": "Ceremonial / High Magic",
        "keywords": ["ceremonial magic", "high magic", "ritual magic", "evocation", "banishing",
                      "lesser banishing", "lbrp", "middle pillar", "pentagram ritual", "hexagram"],
        "breakout_baseline": None,
    },
    "chaos_magic": {
        "label": "Chaos Magic",
        "keywords": ["chaos magic", "chaos magick", "pop magic", "belief shifting", "sigil chaos",
                      "gnosis", "result magic", "peter carroll", "liber null", "psychonaut"],
    },
    "enochian": {
        "label": "Enochian Magic",
        "keywords": ["enochian", "john dee", "edward kelley", "angelical language", "enochian keys",
                      "watchtower", "enochian calls", "heptarchia mystica"],
    },
    "solomonic": {
        "label": "Solomonic Magic",
        "keywords": ["solomon", "solomonic", "key of solomon", "testament of solomon",
                      "seal of solomon", "goetia", "ars goetia", "ars almadel", "ars notoria",
                      "ars paulina", "lesser key", "greater key"],
    },
    "grimoires": {
        "label": "Grimoires / Spellbooks",
        "keywords": ["grimoire", "spellbook", "book of magic", "book of shadows", "magical treatise",
                      "magical text", "pseudo-monarchia", "arbatel", "heptameron", "sworn book",
                      "liber", "grimorium", "sacred magic"],
    },
    "theurgy": {
        "label": "Theurgy / Divine Magic",
        "keywords": ["theurgy", "theurgic", "divine magic", "angel magic", "angelic magic",
                      "celestial magic", "heavenly magic", "iamblichus", "divine names",
                      "god name", "theophany"],
    },
    "necromancy": {
        "label": "Necromancy / Death Magic",
        "keywords": ["necromancy", "necromancer", "death magic", "spirit communication",
                      "medium", "mediumship", "ouija", "seance", "speaking board",
                      "dead", "raise dead", "corpse", "skull", "bone"],
    },
    "demonology": {
        "label": "Demonology",
        "keywords": ["demon", "demonic", "demonology", "infernal", "devil", "satan", "satanic",
                      "diabolical", "possessed", "possession", "exorcism", "demon summon",
                      "hell", "abyss", "pit"],
    },
    "goetia": {
        "label": "Goetia",
        "keywords": ["goetia", "ars goetia", "72 spirits", "solomon demons", "lesser key",
                      "paimon", "buer", "astaroth", "belial", "asmodeus"],
    },
    "alchemy": {
        "label": "Alchemy",
        "keywords": ["alchemy", "alchemical", "alchemist", "philosopher stone", "transmutation",
                      "elixir", "paracelsus", "alkhemy", "magnum opus", "prima materia",
                      "nigredo", "albedo", "rubedo", "calcination", "sublimation"],
    },
    "hermeticism": {
        "label": "Hermeticism",
        "keywords": ["hermetic", "hermes", "corpus hermeticum", "kybalion", "emerald tablet",
                      "hermetica", "poimandres", "hermes trismegistus", "three parts wisdom",
                      "as above so below", "thoth", "hermetic axiom"],
    },
    "kabbalah": {
        "label": "Kabbalah",
        "keywords": ["kabbalah", "cabala", "qabalah", "sephirot", "sefirot", "tree of life",
                      "zohar", "merkavah", "heichalot", "binah", "chokmah", "keter",
                      "da'at", "yetzer", "sitra achra", "qliphot"],
    },
    "astrology": {
        "label": "Astrology",
        "keywords": ["astrology", "astrological", "zodiac", "horoscope", "natal chart",
                      "planetary", "houses", "aspect", "transit", "saturn return",
                      "mercury retrograde", "sun sign", "moon sign", "rising sign"],
    },
    "divination": {
        "label": "Divination",
        "keywords": ["divination", "tarot", "i ching", "runes", "scrying", "augury",
                      "oracle", "fortune telling", "omen", "geomancy", "pendulum",
                      "bibliomancy", "sortilege"],
    },
    "witchcraft": {
        "label": "Witchcraft",
        "keywords": ["witch", "witchcraft", "wicca", "pagan", "sorcery", "folk magic",
                      "traditional witch", "green witch", "hedge witch", "cottage witch",
                      "kitchen witch", "sabbath", "esbat", "wheel year", "samhain",
                      "beltane", "handfasting"],
    },
    "sigil_magic": {
        "label": "Sigils / Symbol Magic",
        "keywords": ["sigil", "seal", "symbol", "glyph", "character", "pentagram",
                      "hexagram", "seal spirit", "magic square", "kamea"],
    },
    "tantra": {
        "label": "Tantra",
        "keywords": ["tantra", "tantric", "tantrik", "kundalini", "chakra", "sadhana",
                      "mantra", "yantra", "sri vidya", "srividya", "lalita", "tripura",
                      "bhairava", "kali", "devi", "shakti", "chinnamasta", "kamakhya",
                      "siva tantra", "netra tantra", "mahanirvana", "kularnava"],
    },
    "kashmir_shaivism": {
        "label": "Kashmir Shaivism",
        "keywords": ["kashmir shaivism", "kashmir saivism", "pratyabhijna", "spanda",
                      "trika", "abhinavagupta", "lakshmanjoo", "siva sutra", "shiva sutra",
                      "nondual shaiva", "vijnana bhairava", "netra tantra", "krama",
                      "kaula", "ksemaraja", "utpaladeva", "somanda"],
    },
    "neoplatonism": {
        "label": "Neoplatonism",
        "keywords": ["neoplatonism", "neoplatonic", "plotinus", "porphyry", "iamblichus",
                      "proclus", "henads", "the one", "procession", "reversion",
                      "emanation", "demiurge", "platonic tradition", "platonic",
                      "henology", "hyperarch", "unknowing"],
    },
    "gnosticism": {
        "label": "Gnosticism",
        "keywords": ["gnostic", "gnosticism", "pistis sophia", "johannite", "valentinian",
                      "basilides", "archon", "pleroma", "aeon", "demiurge", "yaldebaoth",
                      "barbelo", "gnosis", "apocryphon", "nag hammadi"],
    },
    "jungian": {
        "label": "Jungian Psychology",
        "keywords": ["jung", "jungian", "archetype", "shadow", "individuation",
                      "collective unconscious", "anima", "animus", "synchronicity",
                      "mandala", "persona", "red book", "self", "individuation"],
    },
    "biography": {
        "label": "Biography / Life Story",
        "keywords": ["life of", "biography", "who was", "story of", "the life",
                      "death of", "legacy of", "rise of", "fall of", "history of",
                      "age of", "portrait of", "day in life"],
    },
}

def classify_title(title):
    t = title.lower()
    matches = []
    for cat_id, cat in TAXONOMY.items():
        for kw in cat["keywords"]:
            if kw in t:
                matches.append({"category": cat_id, "label": cat["label"], "keyword_matched": kw})
                break
    return matches

def analyze_dataset(videos):
    """Analyze a list of video dicts, return breakout rates per category."""
    cat_data = defaultdict(lambda: {"breakout": 0, "total": 0, "videos": []})
    for v in videos:
        cats = classify_title(v.get("title", ""))
        for c in cats:
            cid = c["category"]
            cat_data[cid]["total"] += 1
            cat_data[cid]["videos"].append(v)
            if v.get("is_breakout"):
                cat_data[cid]["breakout"] += 1

    results = []
    for cid, d in sorted(cat_data.items(), key=lambda x: -x[1]["total"]):
        if d["total"] < 5:
            continue
        rate = d["breakout"] / d["total"]
        label = TAXONOMY.get(cid, {}).get("label", cid)
        results.append({
            "category": cid,
            "label": label,
            "total_videos": d["total"],
            "breakout_count": d["breakout"],
            "breakout_rate": round(rate, 3),
        })
    results.sort(key=lambda x: -x["breakout_rate"])
    return results

def find_hidden_niches(videos, min_freq=10):
    """Find high-performing topics NOT in our taxonomy."""
    # Extract all words, find breakout rate per word
    word_data = defaultdict(lambda: {"breakout": 0, "total": 0})
    for v in videos:
        words = set(w.lower().strip(".,!?;:'\"()[]-") for w in v.get("title", "").split()
                    if len(w) > 4)
        for w in words:
            word_data[w]["total"] += 1
            if v.get("is_breakout"):
                word_data[w]["breakout"] += 1

    # Check which words are NOT covered by taxonomy
    taxonomy_words = set()
    for cat in TAXONOMY.values():
        for kw in cat["keywords"]:
            for w in kw.split():
                taxonomy_words.add(w.lower().strip(".,!?"))

    hidden = []
    for w, d in word_data.items():
        if d["total"] < min_freq:
            continue
        if w in taxonomy_words:
            continue
        rate = d["breakout"] / d["total"]
        hidden.append({"word": w, "count": d["total"], "breakout_rate": round(rate, 3)})

    hidden.sort(key=lambda x: -x["breakout_rate"])
    return hidden


if __name__ == "__main__":
    print("Topic Taxonomy loaded.")
    print(f"Categories: {len(TAXONOMY)}")

    # Run on all data
    all_videos = []
    for f in sorted(DATA_DIR.glob("analysis_*.json")):
        with open(f) as fh:
            ch = json.load(fh)
        for v in ch["videos"]:
            all_videos.append(v)

    print(f"\n=== NICHE BREAKOUT RATES ===")
    results = analyze_dataset(all_videos)
    print(f"{'Niche':35s} {'Videos':>7s} {'Brk':>5s} {'Rate':>6s}")
    print("-" * 60)
    for r in results:
        print(f"{r['label']:35s} {r['total_videos']:>7} {r['breakout_count']:>5} {r['breakout_rate']:>5.0%}")

    print(f"\n=== HIDDEN NICHES (high breakout, NOT in taxonomy) ===")
    hidden = find_hidden_niches(all_videos, min_freq=15)
    print(f"{'Word':25s} {'Count':>6s} {'Rate':>6s}")
    print("-" * 40)
    for h in hidden[:30]:
        print(f"{h['word']:25s} {h['count']:>6} {h['breakout_rate']:>5.0%}")
