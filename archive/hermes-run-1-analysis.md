# Hermes Run 1 Analysis — "The Stones Are Watching You"

Date: 2026-07-24
Skill: produce-platinum-video (v6.0)
Session: 20260724_101100_f9a552
Output: content/publishing/renders/stones-hermes-run/v1/

---

## What It Produced

| File | Size | Notes |
|------|------|-------|
| the_stones_are_watching_you_full_film.mp4 | 13 MB | 106 shots, 698s, 24fps |
| reference_narration.wav | 31 MB | Edge TTS audio |
| storyboard.json | 64 KB | 106 shots, 36 motifs |
| visual_program.json | 51 KB | Thesis, palette, chapters |
| visual_thesis.md | 4.6 KB | Detailed thesis doc |
| rhetorical_map.json | 5.9 KB | Per-passage analysis |
| alignment_report.json | 378 B | AV drift: 0.046s |
| PRODUCTION_BLUEPRINT.md | 2.5 KB | Minimal |
| contact_sheet.jpg | 755 KB | Visual overview |
| render_stones_hermes.py | 59 KB | 1321 lines PIL code |
| shots/ | — | 106 individual MP4 clips |

---

## What It Did RIGHT

1. **106 shots** — matches gold pack exactly
2. **698s runtime** — matches gold
3. **36 unique motifs** — matches gold's 36
4. **32/36 concrete motif names** — good (bishop_codex, watching_stones, crystal_growth, etc.)
5. **Created rhetorical_map.json** — per-passage analysis with process extraction
6. **Created visual_thesis.md** — detailed: material world, spatial world, 12 motion verbs, 6 recurring systems with evolution arcs, color semantics with hex codes, opening-to-closing resolution, 9 forbidden clichés
7. **AV alignment: 0.046s drift** — tighter than gold's 0.088s
8. **Chapter interleaving** — follows gold's pattern (Chapter IX as catch-all)
9. **Color palette with semantic meanings** — not just hex codes, each color has a job
10. **Opening-to-closing arc** defined in visual thesis
11. **No dispatch tables** — custom PIL functions per motif

---

## What It Did WRONG (The Slogs)

### Slog 1: Skipped Pass 0 (Study Gold)
Never actually studied the gold pack to understand what makes it good. It listed the files but didn't extract lessons. The output structure copies the gold format but the thinking doesn't reflect gold-level understanding.

### Slog 2: Skipped Pass 2 (Per-Shot Semantic Design)
**CRITICAL.** The skill defines per-shot semantic design with `visual_translation_ladder` (words → proposition → relation → process → material metaphor → motion → resolved image). Hermes skipped this entirely.

The storyboard has NO rationale field connecting the visual to the audio. No `why_this_visual`, no `visual_audio_alignment`, no `transformation` field. Just `visual_mechanism` which is the motif name repeated (e.g. "bishop codex", "inner lattice", "watching stones").

### Slog 3: `visual_mechanism` is Empty
Every shot's `visual_mechanism` is just the motif name with underscores replaced by spaces. Not a description. Not a rationale. The gold pack has actual descriptions like "An open book on a dark surface with mineral illustrations, pages slowly turning."

### Slog 4: No AGENT_KNOWLEDGE_DOSSIER
The gold/animation pack format requires per-pack dossiers defining aim, visual rules, guardrails, style family. Hermes didn't create any.

### Slog 5: Jumped Directly to Render
The skill defines:
- Pass 1: Concept analysis + rhetorical map + visual thesis
- Pass 2: Shot segmentation + audio probe + **per-shot semantic design**
- Pass 3: Animation pack production
- Pass 4: Film pack composition
- Pass 5: Quality gate

Hermes did: Pass 1 (partial) → Pass 4 (render). Skipped Pass 2 (semantic design) and Pass 3 (animation packs entirely).

### Slog 6: Unnecessary Dependencies
Render script imports `cv2` (OpenCV) and `numpy` which aren't in the gold pack's dependency list. The gold packs use pure PIL + ffmpeg. These extra deps may not be available in all environments.

### Slog 7: No Zeus Validation
The output was never validated against the gold pack. No quality gate run. No comparison.

### Slog 8: Render Script Quality Unknown
1321 lines, 106 shots. But without per-shot rationales or no-narration-test verification, we don't know if the visuals actually communicate the concepts. The code might be doing the right thing or might be decorative.

### Slog 9: Followed Gold Structure, Not Gold Thinking
The chapter structure and shot count match gold exactly — but this looks like copying the format rather than understanding why the gold pack chose those structures. The gold pack's chapter IX has 60+ shots because the intermediate substance IS the central concept. Hermes copied this pattern without explaining why.

---

## Root Cause

The skill needs **hard binary gates** between passes. Hermes should not be able to start rendering until the storyboard has valid `visual_audio_alignment` fields for every shot. Currently the skill is a suggestion, not an enforcement.

The solution: split into two skills where the second skill physically cannot run without the first skill's completed output.

---

## Comparison: Gold vs Hermes Run

| Metric | Gold Pack | Hermes Run | Verdict |
|--------|-----------|------------|---------|
| Shots | 106 | 106 | ✅ |
| Runtime | 698.2s | 698.2s | ✅ |
| Unique motifs | 36 | 36 | ✅ |
| Concrete names | 36/36 | 32/36 | ⚠️ |
| AV drift | 0.088s | 0.046s | ✅ Better |
| Per-shot rationale | implicit | **MISSING** | ❌ |
| visual_mechanism quality | descriptive | empty (just name) | ❌ |
| AGENT_KNOWLEDGE_DOSSIER | yes | **MISSING** | ❌ |
| Production blueprint | detailed | minimal | ❌ |
| Zeus validation | — | **NOT RUN** | ❌ |
| Color semantics | yes | yes | ✅ |
| Forbidden clichés | yes | yes | ✅ |
| Opening-closing arc | yes | yes | ✅ |
| Rhetorical map | — | yes | ✅ Extra |
| Render deps | PIL only | PIL+cv2+numpy | ❌ |

---

## What To Fix

1. **Enforce Pass 0**: Hermes must articulate what it learned from studying gold BEFORE generating anything
2. **Enforce Pass 2**: Every shot needs a `visual_audio_alignment` field. No render without it.
3. **Add AGENT_KNOWLEDGE_DOSSIER**: Per-animation-pack dossier
4. **Fix visual_mechanism**: Must be a real description, not the motif name
5. **Remove cv2/numpy**: Pure PIL + ffmpeg only
6. **Run Zeus**: Post-render quality check against gold standards
7. **Two-skill split**: blocker-designer and reviewer-renderer with hard separation
