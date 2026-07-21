#!/usr/bin/env python3
"""Deep niche analysis: breakout rates for specific topics, deities, texts, practices.
Saves structured results to data/research/layer2/niche-breakout-rates.json"""

import json, numpy as np
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "research" / "layer2"

all_videos = []
for f in sorted(DATA_DIR.glob("analysis_*.json")):
    with open(f) as fh:
        ch = json.load(fh)
    for v in ch["videos"]:
        all_videos.append(v)

overall_brk = sum(1 for v in all_videos if v.get("is_breakout")) / len(all_videos)
overall_views = np.median([v["views"] for v in all_videos])

def scan(keywords, label, niche_group):
    hits = [(v["title"], v["views"], v["is_breakout"], v.get("duration_min", 0), v.get("video_id", ""))
            for v in all_videos if any(kw.lower() in v.get("title","").lower() for kw in keywords)]
    if len(hits) < 2:
        return None
    brk = sum(1 for h in hits if h[2])
    rate = brk / len(hits)
    views_arr = [h[1] for h in hits]
    return {
        "niche": label,
        "group": niche_group,
        "keywords": keywords[:5],
        "video_count": len(hits),
        "breakout_count": brk,
        "breakout_rate": round(rate, 3),
        "lift_vs_baseline": round(rate / overall_brk, 2),
        "median_views": int(np.median(views_arr)),
        "mean_views": int(np.mean(views_arr)),
        "max_views": max(h[1] for h in hits),
        "top_titles": [{"title": h[0][:70], "views": h[1], "breakout": h[2]} for h in sorted(hits, key=lambda x: -x[1])[:3]],
    }

results = []
niches = [
    # ── NEOPLATONISM ──
    (["neoplatonism", "neoplatonic", "plotinus", "porphyry", "iamblichus", "proclus", "the one", "emanation", "henads"], "Neoplatonism (general)", "neoplatonism"),
    (["plotinus", "the one", "enn", "henology"], "Plotinus (specific)", "neoplatonism"),
    (["iamblichus", "theurgy", "divine names", "egyptian mysteries"], "Iamblichus / Theurgy", "neoplatonism"),
    (["proclus", "platonic theology", "elements of theology"], "Proclus", "neoplatonism"),
    (["porphyry", "cave nymphs", "against christians", "sentences", "introduction aristotle"], "Porphyry", "neoplatonism"),
    (["demiurge", "demiurgic", "world soul"], "Demiurge / World Soul", "neoplatonism"),
    (["hypostasis", "hypostases", "procession", "reversion"], "Hypostases / Procession / Reversion", "neoplatonism"),
    (["platonic", "plato", "forms", "allegory cave", "ideal form", "theory forms"], "Platonism (general)", "neoplatonism"),
    (["platonic tradition"], "Platonic Tradition (school)", "neoplatonism"),
    (["middle platonism", "middle platonic", "plutarch", "numenius", "alcinous"], "Middle Platonism", "neoplatonism"),
    (["renaissance platonism", "ficino", "pico", "french platonism"], "Renaissance Platonism", "neoplatonism"),
    (["cambridge platonist", "cudworth", "more", "whichcote"], "Cambridge Platonists", "neoplatonism"),

    # ── THEURGY / DIVINE MAGIC ──
    (["theurgy", "theurgic", "divine magic", "angel magic", "angelic magic", "heavenly magic"], "Theurgy (general)", "theurgy"),
    (["angel", "angelic", "archangel", "guardian angel"], "Angels / Angelic", "theurgy"),
    (["divine name", "god name", "sacred name", "tetragrammaton"], "Divine Names", "theurgy"),
    (["invocation", "invoke", "evocation", "evoke", "calling spirit"], "Invocation / Evocation", "theurgy"),
    (["prayer", "contemplative", "mystical prayer", "centering prayer"], "Prayer / Contemplation", "theurgy"),
    (["celestial hierarchy", "dionysius", "angelic hierarchy"], "Celestial Hierarchy", "theurgy"),

    # ── SPELLS / GRIMOIRES ──
    (["grimoire", "spellbook", "book magic", "magical treatise", "grimorium"], "Grimoires (general)", "grimoires"),
    (["key of solomon", "clavicula salomonis"], "Key of Solomon", "grimoires"),
    (["lesser key", "ars goetia", "ars almadel", "ars paulina", "ars notoria"], "Lesser Key of Solomon", "grimoires"),
    (["abramelin", "abramelin", "holy magic"], "Book of Abramelin", "grimoires"),
    (["heptameron", "peter abano"], "Heptameron", "grimoires"),
    (["arbatel", "arbatel"], "Arbatel", "grimoires"),
    (["occult philosophy", "agrippa", "cornelius agrippa"], "Three Books Occult Philosophy", "grimoires"),
    (["steganographia", "trithemius", "polygraphia"], "Steganographia / Trithemius", "grimoires"),
    (["armadel", "armadel"], "Armadel", "grimoires"),
    (["grimorium verum", "verum"], "Grimorium Verum", "grimoires"),
    (["grand grimoire", "red dragon", "grand alphabet"], "Grand Grimoire", "grimoires"),
    (["black pullet", "poulet noir"], "Black Pullet", "grimoires"),
    (["book abramelin", "abramelin"], "Book of Abramelin", "grimoires"),
    (["sworn book", "liber juratus", "honorius"], "Sworn Book of Honorius", "grimoires"),

    # ── SPELLWORK ──
    (["spell", "spellwork", "casting spell", "spell craft"], "Spellwork (general)", "spells"),
    (["sigil", "seal", "sigil magic", "sigilize"], "Sigils / Seals", "spells"),
    (["candle magic", "candle spell", "candle"], "Candle Magic", "spells"),
    (["talisman", "amulet", "charm", "philactery"], "Talismans / Amulets", "spells"),
    (["binding spell", "bind", "tie spell", "restrict"], "Binding / Curses", "spells"),
    (["love spell", "love magic", "attraction spell"], "Love Magic", "spells"),
    (["protection", "warding", "shield", "protective magic"], "Protection / Warding", "spells"),
    (["healing spell", "healing magic", "healing", "curative"], "Healing Magic", "spells"),
    (["elemental magic", "elemental", "air fire water earth", "elemental spirit"], "Elemental Magic", "spells"),
    (["sex magic", "sexual magic", "erotic magic", "sex spell"], "Sex Magic", "spells"),
    (["weather magic", "rain spell", "storm magic", "weather working"], "Weather Magic", "spells"),
    (["dream magic", "lucid dream", "dream spell", "oneiric"], "Dream Magic", "spells"),

    # ── MYSTICISM ──
    (["mysticism", "mystical", "mystic", "contemplative", "apophatic", "kataphatic"], "Mysticism (general)", "mysticism"),
    (["christian mystic", "cloud unknowing", "john cross", "teresa avila", "meister eckhart"], "Christian Mysticism", "mysticism"),
    (["sufi", "sufism", "islamic mystic", "rumi", "ibn arabi", "hallaj"], "Sufism / Islamic Mysticism", "mysticism"),
    (["jewish mystic", "merkavah", "heichalot", "kabbalistic"], "Jewish Mysticism", "mysticism"),
    (["henry corbin", "mundus imaginalis", "creative imagination", "corbin"], "Corbin / Imaginal", "mysticism"),
    (["perennial", "perennial philosophy", "philosophia perennis", "traditionalist", "guenon", "schuon", "evola"], "Perennialism / Traditionalism", "mysticism"),
    (["dark night", "dark soul", "spiritual dark", "desolation"], "Dark Night of the Soul", "mysticism"),
    (["union god", "divine union", "unitive", "theosis", "deification"], "Union with God / Theosis", "mysticism"),

    # ── HERMETICISM ──
    (["hermetic", "hermes", "hermetica", "poimandres"], "Hermeticism (general)", "hermeticism"),
    (["corpus hermeticum"], "Corpus Hermeticum (text)", "hermeticism"),
    (["emerald tablet", "tabula smaragdina"], "Emerald Tablet", "hermeticism"),
    (["kybalion", "three initiates"], "Kybalion", "hermeticism"),
    (["as above so below", "macrocosm", "microcosm"], "As Above So Below", "hermeticism"),
    (["hermes trismegistus"], "Hermes Trismegistus (figure)", "hermeticism"),

    # ── KABBALAH ──
    (["kabbalah", "cabala", "qabalah"], "Kabbalah (general)", "kabbalah"),
    (["zohar", "zoharic"], "Zohar", "kabbalah"),
    (["sefer yetzirah", "book creation", "book formation"], "Sefer Yetzirah", "kabbalah"),
    (["sephirot", "sefirot", "tree life", "sephirah"], "Sephirot / Tree of Life", "kabbalah"),
    (["merkavah", "heichalot", "chariot"], "Merkavah / Heichalot", "kabbalah"),
    (["lurianic", "luria", "tzimtzum", "shevirat", "kelip"], "Lurianic Kabbalah", "kabbalah"),
    (["golem", "golem"], "Golem", "kabbalah"),
    (["practical kabbalah", "kabbalistic magic", "kabbalistic ritual"], "Practical Kabbalah", "kabbalah"),

    # ── OTHER ESOTERIC ──
    (["freemason", "masonic", "masonry", "lodge"], "Freemasonry", "other_esoteric"),
    (["rosicrucian", "rose cross", "rosy cross"], "Rosicrucianism", "other_esoteric"),
    (["theosophy", "blavatsky", "secret doctrine", "theosophical"], "Theosophy", "other_esoteric"),
    (["golden dawn", "hermetic order", "g.d."], "Hermetic Order of Golden Dawn", "other_esoteric"),
    (["martinist", "martines", "willermoz", "pasqually"], "Martinism", "other_esoteric"),
    (["illuminati", "illumined", "enlightened"], "Illuminati", "other_esoteric"),
]

for kws, label, group in niches:
    r = scan(kws, label, group)
    if r:
        results.append(r)

# Save
output = {
    "overall_baseline_breakout_rate": round(overall_brk, 3),
    "total_videos_in_dataset": len(all_videos),
    "total_channels": len(list(DATA_DIR.glob("analysis_*.json"))),
    "generated": "2026-07-21",
    "niches": results,
    "summary_by_group": {},
}

# Group summary
grouped = defaultdict(list)
for r in results:
    grouped[r["group"]].append(r)
for group, niches in sorted(grouped.items()):
    best = max(niches, key=lambda x: x["lift_vs_baseline"])
    output["summary_by_group"][group] = {
        "sub_niches_analyzed": len(niches),
        "best_performer": best["niche"],
        "best_breakout_rate": best["breakout_rate"],
        "best_lift": best["lift_vs_baseline"],
    }

path = DATA_DIR / "niche-breakout-rates.json"
with open(path, "w") as f:
    json.dump(output, f, indent=2)

# Print summary
print(f"Deep niche analysis saved to {path}")
print(f"\n{'Niche':45s} {'Vids':>5s} {'Rate':>6s} {'Lift':>5s} {'Group':>20s}")
print("-" * 85)
for r in sorted(results, key=lambda x: -x["lift_vs_baseline"]):
    if r["video_count"] < 3:
        continue
    print(f"{r['niche']:45s} {r['video_count']:>5} {r['breakout_rate']:>5.0%} {r['lift_vs_baseline']:>4.1f}x {r['group']:>20s}")
