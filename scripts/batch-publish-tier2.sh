#!/bin/bash
# Batch publish Tier 2 works (Voss, Shaw) as Type B essays with audio.
# Usage: ./scripts/batch-publish-tier2.sh [--dry-run] [--count N]
# 
# Type B = straight publication: existing text → JSON → audio → deploy.
# No writing, no commentary. All blocks are kind: "source".
# Audio voice: en-GB-RyanNeural (male, British) — the author's voice.

cd /root/projects/blog
DRY_RUN=""
COUNT=3  # Default: publish 3 at a time

if [ "$1" = "--dry-run" ]; then DRY_RUN="--dry-run"; COUNT=${2:-100}; fi
if [ "$1" = "--count" ]; then COUNT=$2; fi

python3 << PYEOF
import json, glob, os, subprocess, sys

DRY = "--dry-run" in sys.argv
COUNT = int(sys.argv[sys.argv.index("--count")+1]) if "--count" in sys.argv else 3

# Find Voss & Shaw Tier 2 works with PDFs
candidates = []
for f in sorted(glob.glob("content/works/work_*.json")):
    w = json.load(open(f))
    author = w.get("authors", [{}])[0].get("name", "")
    tier = w.get("analysis", {}).get("tier")
    pdf = w.get("assets", {}).get("pdf_path", "")
    if tier == 2 and ("Voss" in author or "Shaw" in author) and pdf and os.path.exists(pdf):
        # Check if already published as essay
        slug = os.path.basename(f).replace("work_", "").replace(".json", "")
        essay_path = f"content/glossary/essays/{slug}.json"
        if os.path.exists(essay_path):
            continue
        candidates.append((author, w.get("title", ""), pdf, slug, f))

print(f"Found {len(candidates)} unpublisheed Tier 2 works by Voss/Shaw")
print(f"Publishing {min(COUNT, len(candidates))} this batch\n")

for i, (author, title, pdf, slug, wf) in enumerate(candidates[:COUNT]):
    print(f"[{i+1}/{min(COUNT, len(candidates))}] {author}: {title[:50]}...")
    
    if DRY:
        print(f"  Would publish: content/glossary/essays/{slug}.json")
        continue
    
    # Extract text from PDF
    text_file = f"/tmp/{slug}.txt"
    result = subprocess.run(["pdftotext", pdf, text_file], capture_output=True, text=True, timeout=30)
    if not os.path.exists(text_file) or os.path.getsize(text_file) < 100:
        print(f"  ❌ No extractable text")
        continue
    
    # Read extracted text
    with open(text_file) as f:
        full_text = f.read()
    
    # Split into paragraphs, filter empty, limit to reasonable length
    paragraphs = [p.strip() for p in full_text.split('\n\n') if len(p.strip()) > 50]
    if not paragraphs:
        print(f"  ❌ No usable paragraphs")
        continue
    
    # Create essay JSON (Type B — all kind: "source")
    body = []
    for para in paragraphs[:30]:  # Limit to first 30 paragraphs
        body.append({"kind": "source", "text": para[:2000]})  # Limit paragraph length
    
    authors_list = [a.strip() for a in author.replace("Angela Voss", "Angela Voss").replace("Gregory Shaw", "Gregory Shaw").split(",")]
    
    essay = {
        "id": slug,
        "title": title[:120],
        "author": author,
        "type": "source_publication",
        "source_ids": [slug],
        "concepts": [author.split()[0].lower()],
        "prerequisites": [],
        "audioUrl": f"/audio/{slug}.mp3",
        "body": body[:50],  # Max 50 body blocks
        "tier": 2,
        "tier_label": "scholarly commentary"
    }
    
    # Save essay JSON
    essay_path = f"content/glossary/essays/{slug}.json"
    with open(essay_path, "w") as f:
        json.dump(essay, f, indent=2)
    print(f"  ✅ Essay JSON created ({len(body)} paragraphs)")
    
    # Generate audio
    audio_result = subprocess.run(
        ["node", "scripts/generate-audio.mjs", slug],
        capture_output=True, text=True, timeout=120
    )
    if audio_result.returncode == 0:
        print(f"  ✅ Audio generated")
    else:
        print(f"  ⚠ Audio failed: {audio_result.stderr[-100:]}")
    
    # Update work JSON with publish status
    work = json.load(open(wf))
    work.setdefault("analysis", {})["published_as"] = slug
    json.dump(work, open(wf, "w"), indent=2)
    print(f"  ✅ Work JSON updated")

print(f"\nDone. Run 'git add -A && git commit && git push && npm run cf:deploy' to deploy.")
PYEOF
