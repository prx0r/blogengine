#!/usr/bin/env python3
"""Auto-fix essay quality issues: strip references, remove garbage blocks, clean headers.
   Run after audit-essays.py identifies problems."""
import json, os, re

ESSAY_DIR = "/root/projects/blog/content/glossary/essays"
ARXIV_DIR = f"{ESSAY_DIR}/arxiv"

def is_reference_start(text):
    t = text.strip().lower()
    return any(t.startswith(m) or t == m for m in ['references','bibliography','works cited','notes','endnotes','further reading'])

def has_spaced_letters(text):
    return bool(re.search(r'\b([A-Za-z]) ([a-z]{2,})\b', text))

def is_garbage(text):
    alpha = sum(1 for c in text if c.isalpha())
    total = len(text.strip())
    if total < 10: return True
    if total > 0 and alpha / total < 0.3: return True
    return False

def is_running_header(text):
    t = text.strip()
    if t.isupper() and 10 < len(t) < 60 and ('THE LETTERS' in t or 'LETTER' in t.upper()):
        return True
    return False

def fix_spaced_letters(text):
    """Fix OCR artifacts: 'c entre' → 'centre', 'T he' → 'The'"""
    text = re.sub(r'\b([A-Za-z]) ([a-z]{2,})\b', lambda m: m.group(1) + m.group(2), text)
    text = re.sub(r'\b([Tt]) ([Hh][ea][eor])\b', lambda m: m.group(1) + m.group(2), text)
    return text

fixed = 0
deleted = 0
errors = 0

# Process top-level essays
for fname in sorted(os.listdir(ESSAY_DIR)):
    if not fname.endswith('.json'): continue
    path = os.path.join(ESSAY_DIR, fname)
    if os.path.isdir(path): continue
    
    try:
        with open(path) as f:
            essay = json.load(f)
    except:
        continue
    
    body = essay.get('body', [])
    title = essay.get('title', '')[:60]
    
    # Check for string blocks (broken — delete)
    string_count = sum(1 for b in body if isinstance(b, str))
    if string_count > 10:
        os.remove(path)
        deleted += 1
        print(f"🗑️ DELETED broken: {title}")
        continue
    
    if not body:
        os.remove(path)
        deleted += 1
        print(f"🗑️ DELETED empty: {title}")
        continue
    
    original_count = len(body)
    changed = False
    
    # 1. Strip reference sections
    new_body = []
    ref_found = False
    for block in body:
        text = block.get('text', str(block))
        if is_reference_start(text):
            if not ref_found:
                print(f"   ✂️ Stripped refs from: {title}")
                ref_found = True
                changed = True
            continue  # Skip this and all subsequent blocks
        if not ref_found:
            new_body.append(block)
        else:
            changed = True  # Skipping blocks
    
    # 2. Remove garbage blocks
    cleaned = []
    garbage_count = 0
    for block in new_body:
        text = block.get('text', str(block)) if isinstance(block, dict) else str(block)
        if is_garbage(text):
            garbage_count += 1
        else:
            cleaned.append(block)
    
    if garbage_count > 0:
        print(f"   🧹 Removed {garbage_count} garbage blocks from: {title}")
        changed = True
    
    # 3. Remove running headers (ficino-specific)
    header_count = 0
    filtered = []
    for block in cleaned:
        text = block.get('text', str(block)) if isinstance(block, dict) else str(block)
        if is_running_header(text):
            header_count += 1
        else:
            filtered.append(block)
    
    if header_count > 0:
        print(f"   📄 Removed {header_count} running headers from: {title}")
        changed = True
    
    # 4. Fix spaced letters
    spaced_count = 0
    for i, block in enumerate(filtered):
        if isinstance(block, dict) and 'text' in block:
            old = block['text']
            new = fix_spaced_letters(old)
            if new != old:
                block['text'] = new
                spaced_count += 1
        elif isinstance(block, str):
            old = block
            new = fix_spaced_letters(old)
            if new != old:
                filtered[i] = new
                spaced_count += 1
    
    if spaced_count > 0:
        print(f"   🔤 Fixed spaced letters in {spaced_count} blocks: {title}")
        changed = True
    
    if changed:
        essay['body'] = filtered
        with open(path, 'w') as f:
            json.dump(essay, f, indent=2)
        fixed += 1
        print(f"  ✅ Fixed: {title} ({original_count}→{len(filtered)} blocks)")

# Process arxiv phase subdirectories
for phase in sorted(os.listdir(ARXIV_DIR)):
    phase_dir = os.path.join(ARXIV_DIR, phase)
    if not os.path.isdir(phase_dir): continue
    
    for fname in sorted(os.listdir(phase_dir)):
        if not fname.endswith('.json'): continue
        path = os.path.join(phase_dir, fname)
        
        try:
            with open(path) as f:
                essay = json.load(f)
        except:
            continue
        
        body = essay.get('body', [])
        if not body: continue
        
        changed = False
        new_body = []
        ref_found = False
        
        # Strip reference sections (rare in arxiv/ but check anyway)
        for block in body:
            text = block.get('text', str(block))
            if is_reference_start(text):
                ref_found = True
                changed = True
                continue
            if not ref_found:
                new_body.append(block)
        
        if ref_found:
            print(f"   ✂️ Stripped refs from arxiv/{phase}/{fname[:40]}")
        
        # Remove garbage
        cleaned = []
        gc = 0
        for block in new_body:
            text = block.get('text', str(block))
            if is_garbage(text):
                gc += 1
            else:
                cleaned.append(block)
        
        if gc > 0:
            print(f"   🧹 {gc} garbage in arxiv/{phase}/{fname[:40]}")
            changed = True
        
        if changed:
            essay['body'] = cleaned
            with open(path, 'w') as f:
                json.dump(essay, f, indent=2)
            fixed += 1

print(f"\n{'='*50}")
print(f"Done: {fixed} fixed, {deleted} deleted, {errors} errors")
