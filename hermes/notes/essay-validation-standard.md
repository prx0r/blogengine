# Essay JSON Validation Standard

Every essay JSON must pass these checks before audio generation. This prevents unlistenable audio (references read aloud, OCR garbage, page numbers).

---

## Pre-Audio Validation Checklist

### 1. Text Quality — No OCR Artifacts
- [ ] No single-letter words separated by spaces ("c entre" → "centre", "T he" → "The")
- [ ] No random character sequences (OCR garbage like `4 tv? rrt/y <>r)`)
- [ ] No isolated page numbers as blocks (just a number like `23` or `266`)
- [ ] No running headers (all-caps short lines like `THE IMAGO TEMPLI IN CONFRONTATION`)

### 2. No Reference/Bibliography Sections
- [ ] No footnote markers in body text (e.g., `^1`, `[1]`, `(1)`)
- [ ] No bibliography/references section at the end
- [ ] If the paper has a reference list, it must be removed from the body
- [ ] No "References", "Bibliography", "Notes", "Works Cited" sections

### 3. Block Quality
- [ ] Every block should have ≥ 50 alphanumeric characters
- [ ] No blocks that are just numbers or page markers
- [ ] No empty blocks
- [ ] No blocks with less than 10% alphabetic content

### 4. Content Integrity
- [ ] The text is recognisably English (or the original language)
- [ ] The first block is a meaningful sentence, not a title page or metadata
- [ ] The essay has at least 3 body blocks (otherwise not worth publishing)
- [ ] No copyright statements, license text, or author affiliations as body content

### 5. Metadata
- [ ] Title is clean (no OCR artifacts in title)
- [ ] Author name is clean
- [ ] `kind` field is correct: all blocks must be `"source"` for Type B

---

## Automated Audit Script

Run `/root/projects/blog/hermes/scripts/audit-essays.py` to scan all essay JSONs for violations.

The script checks every block in every essay and reports:
- Essays with reference sections (References, Bibliography, Notes)
- Essays with garbage blocks (< 50 alpha chars)
- Essays with spaced-letter artifacts
- Essays with footnote markers
- Essays with page numbers as blocks

---

## Fix Process

1. **Run audit** — identify all violations
2. **Auto-fix** — strip reference sections, remove garbage blocks, clean spacing
3. **Re-run audit** — verify fixes
4. **Regenerate audio** — for any essay where content changed
5. **Re-deploy** — push fixed essays to site
