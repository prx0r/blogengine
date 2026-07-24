"""Narration cleaning tools — wrappers around factory/scripts."""
import os, re, json, subprocess

ROOT = "/root/projects/blog"

def clean_narration(essay_path: str, output_dir: str) -> dict:
    """Strip markdown from essay. Preserves title text. Returns integrity report."""
    raw = open(essay_path).read()
    lines = raw.split('\n')
    spoken = []
    for line in lines:
        text = line.strip()
        if not text or text == "---":
            continue
        if text.startswith("# "):
            text = text[2:].strip()  # Strip '#', KEEP title
        if text.startswith(">"):
            text = text[1:].strip()
        text = re.sub(r'\*([^*]+)\*', r'\1', text)
        spoken.append(text)
    
    narration = "\n\n".join(spoken)
    os.makedirs(output_dir, exist_ok=True)
    open(f"{output_dir}/narration_script.txt", "w").write(narration)
    
    # Integrity report
    source_sents = len(re.split(r'(?<=[.!?])\s+', raw))
    spoken_sents = len(re.split(r'(?<=[.!?])\s+', narration))
    
    report = {
        "source_sentences": source_sents,
        "spoken_sentences": spoken_sents,
        "sentence_match": "PASS" if source_sents == spoken_sents else "FAIL",
        "source_chars": len(raw),
        "spoken_chars": len(narration),
        "title_preserved": any(w in narration.lower() for w in raw.split('\n')[0].replace('# ','').lower().split()[:3])
    }
    
    # Check unauthorized additions
    source_words = set(re.findall(r'\w+', raw.lower()))
    spoken_words = set(re.findall(r'\w+', narration.lower()))
    additions = spoken_words - source_words
    report["unauthorized_additions"] = list(additions - {"s", "t", "m", "re", "ve", "ll", "d"})[:10]
    report["unauthorized_additions_count"] = len(report["unauthorized_additions"])
    
    json.dump(report, open(f"{output_dir}/script_integrity.json", "w"), indent=2)
    
    return report

def integrity_check(output_dir: str) -> dict:
    """Read and return the integrity report."""
    return json.load(open(f"{output_dir}/script_integrity.json"))
