#!/usr/bin/env python3
"""Audit all Type B essay JSONs for quality issues that would make audio unlistenable.
   Reports violations: reference sections, garbage blocks, spaced letters, footnotes, page numbers.
   Usage: python3 audit-essays.py [--fix]"""
import json, os, re, sys

ESSAY_DIR = "/root/projects/blog/content/glossary/essays"
FIX = "--fix" in sys.argv

def has_spaced_letters(text):
    """Detect OCR artifacts: single letters separated by spaces like 'c entre', 'T he'"""
    return bool(re.search(r'\b([A-Za-z]) ([a-z]{2,})\b', text))

def is_garbage_block(text):
    """Block has very little alphabetic content — likely OCR noise"""
    if not text.strip():
        return True
    alpha = sum(1 for c in text if c.isalpha())
    total = len(text.strip())
    if total < 10:
        return True
    if total > 0 and alpha / total < 0.3:
        return True
    return False

def is_page_number(text):
    """Block that's just a number or page marker"""
    t = text.strip()
    if t.isdigit() and len(t) < 5:
        return True
    return False

def is_running_header(text):
    """Block that's a running header (all-caps short line)"""
    t = text.strip()
    if t.isupper() and 10 < len(t) < 60 and not any(c.islower() for c in t):
        return True
    return False

def is_reference_section(text):
    """Detect if a block starts a reference/bibliography section"""
    t = text.strip().lower()
    ref_markers = ['references', 'bibliography', 'works cited', 'notes', 'endnotes',
                   'further reading', 'sources', 'footnotes']
    for m in ref_markers:
        if t.startswith(m) or t == m:
            return True
    return False

def has_footnote_marker(text):
    """Detect footnote markers like [1], (1), ^1, superscript numbers"""
    return bool(re.search(r'\[\d+\]|\(\d+\)|\^\d+', text))

results = {
    'spaced_letters': [],
    'garbage_blocks': [],
    'page_numbers': [],
    'running_headers': [],
    'reference_sections': [],
    'footnote_markers': [],
    'too_few_blocks': [],
    'clean': [],
}

for fname in sorted(os.listdir(ESSAY_DIR)):
    if not fname.endswith('.json'):
        continue
    
    path = os.path.join(ESSAY_DIR, fname)
    with open(path) as f:
        essay = json.load(f)
    
    slug = essay.get('id', fname)
    body = essay.get('body', [])
    
    if not body or len(body) < 3:
        results['too_few_blocks'].append(slug)
        continue
    
    issues = set()
    ref_found = False
    garbage_indices = []
    
    for i, block in enumerate(body):
        if isinstance(block, str):
            text = block
        elif isinstance(block, dict) and 'text' in block:
            text = block['text']
        else:
            text = str(block)
        
        if is_reference_section(text):
            if not ref_found:
                results['reference_sections'].append((slug, i, text[:60]))
                ref_found = True
            issues.add('refs')
        
        if has_spaced_letters(text):
            results['spaced_letters'].append((slug, i, text[:50]))
            issues.add('spaced')
        
        if is_garbage_block(text):
            garbage_indices.append(i)
            issues.add('garbage')
        
        if is_page_number(text):
            results['page_numbers'].append((slug, i, text))
            issues.add('pagenum')
        
        if is_running_header(text):
            results['running_headers'].append((slug, i, text[:40]))
            issues.add('header')
        
        if has_footnote_marker(text):
            results['footnote_markers'].append((slug, i, text[:50]))
            issues.add('footnote')
    
    if garbage_indices:
        results['garbage_blocks'].append((slug, len(garbage_indices), garbage_indices[:3]))
    
    if not issues:
        results['clean'].append(slug)

# Report
print("=" * 70)
print("ESSAY QUALITY AUDIT")
print("=" * 70)

total = len(os.listdir(ESSAY_DIR))
print(f"\nTotal essays: {total}")
print(f"Clean (no issues): {len(results['clean'])}")

if results['reference_sections']:
    print(f"\n❌ REFERENCE SECTIONS ({len(results['reference_sections'])}) — will read bibliography aloud:")
    for slug, idx, preview in results['reference_sections'][:20]:
        print(f"  {slug}: block {idx} — \"{preview}\"")

if results['garbage_blocks']:
    print(f"\n❌ GARBAGE BLOCKS ({len(results['garbage_blocks'])}) — OCR noise:")
    for slug, count, examples in results['garbage_blocks'][:20]:
        print(f"  {slug}: {count} garbage blocks (e.g. block {examples[0]})")

if results['spaced_letters']:
    print(f"\n⚠️  SPACED LETTERS ({len(results['spaced_letters'])}) — OCR spacing artifacts:")
    for slug, idx, preview in results['spaced_letters'][:20]:
        print(f"  {slug}: block {idx} — \"{preview}\"")

if results['page_numbers']:
    print(f"\n⚠️  PAGE NUMBERS ({len(results['page_numbers'])}) — standalone numbers in body:")
    for slug, idx, text in results['page_numbers'][:15]:
        print(f"  {slug}: block {idx}")

if results['running_headers']:
    print(f"\n⚠️  RUNNING HEADERS ({len(results['running_headers'])}) — all-caps headers in body:")
    for slug, idx, preview in results['running_headers'][:15]:
        print(f"  {slug}: block {idx} — \"{preview}\"")

if results['footnote_markers']:
    print(f"\n⚠️  FOOTNOTE MARKERS ({len(results['footnote_markers'])}) — citation markers:")
    for slug, idx, preview in results['footnote_markers'][:15]:
        print(f"  {slug}: block {idx} — \"{preview}\"")

if results['too_few_blocks']:
    print(f"\n❌ TOO FEW BLOCKS ({len(results['too_few_blocks'])}) — < 3 blocks, not viable for audio:")
    for slug in results['too_few_blocks'][:10]:
        print(f"  {slug}")

print(f"\n{'='*70}")
print(f"SUMMARY: {len(results['reference_sections'])} ref sections, {len(results['garbage_blocks'])} with garbage, {len(results['spaced_letters'])} spaced-letter issues")
print(f"{'='*70}")

if FIX:
    print("\n⚠️ Auto-fix not yet implemented. Manual review needed for each case.")
