# Factory Progress — Complete Learnings

## The 4 Iterations

### v1: Build Script Approach
- **Essay:** expansion-essay1 (Spanda)
- **Method:** Wrote a monolithic Python script that split 10 existing spanda_scenes into 50 shots
- **Result:** 50 shots, 190s (3.2 min), 2fps, **BRONZE 45/100**
- **Problem:** Mechanical. No intelligence in shot selection. Just split scenes mechanically.
- **Lesson:** Build scripts don't make good videos. Selection and composition do.

### v2: Composition Approach
- **Essay:** expansion-essay1 (Spanda)
- **Method:** Selected 17 existing functions from 6 packs, arranged into 60 shots with continuity bridges
- **Result:** 60 shots, 420s (7.0 min), 8fps, ~60/100 est.
- **Problem:** Wrong FPS (renderer defaulted to 2, not 8). Durations estimated from word count.
- **Lesson:** Use existing scene functions (don't write new ones). But timing must be real, not estimated.

### v3: Pre-Production Files First
- **Essay:** expansion-essay1 (Spanda)
- **Method:** Created storyboard.json, visual_program.json, narration_script.txt BEFORE rendering
- **Result:** 73 shots, 298s (5.0 min), 15 modes, 12 chapters
- **Problem:** 4.1s avg shot vs platinum's 6.1s. Durations were word-count estimates, not audio-derived.
- **Lesson:** Structure is right. Timing is wrong. Need audio-first.

### v4: Audio-First Workflow (CURRENT)
- **Essay:** expansion-essay5 (Pain Is Juice / Rasa)
- **Method:** Strip essay → split into shots → generate per-shot WAVs → MEASURE durations → build storyboard with real timing → map to existing functions → render → alignment report
- **Result:** 63 shots, 148.2s (2.5 min), 7 modes, 8 chapters, **0.000s AV drift**
- **Verdict:** Workflow is correct. Duration is short because the essay is short (416 words).

## The Platinum Workflow (Reverse-Engineered)

### Pre-Production Phase (files first)

```
1. READ essay → understand rhetorical structure, metaphors, key concepts
2. STRIP markdown → clean narration prose (no headers, no citations)
3. SPLIT into 60-100 shots (each = one spoken sentence/phrase)
4. GENERATE per-shot WAV via Edge TTS
5. MEASURE each WAV's actual duration (seconds from sample count)
6. BUILD storyboard.json with:
   - shot_id, chapter, chapter_title, spoken_text
   - start_seconds, end_seconds, duration_seconds
   - motif (visual mode), continuity_object, transition
   - background_justification, caption_restrictions
7. BUILD visual_program.json with:
   - continuity_systems (3-5 persistent conceptual threads)
   - chapters with visual_thesis
   - palette, entities, operators
8. BUILD PRODUCTION_BLUEPRINT.md (constraints, specs)
```

### Production Phase (render)

```
9. MAP each motif to an existing scene function from:
   - scripts/renderer/ — 67 functions across 9 packs
   - visual-library/ — 172 functions across 20 packs
   - scene-system/catalog/scenes.json — 198 indexed scenes
10. RENDER at 6fps (draft) or 24fps (final)
11. ASSEMBLE with voiceover audio
12. GENERATE alignment_report.json (per-shot AV sync check)
```

### Validation Phase

```
13. CHECK alignment_report:
    - AV duration difference < 0.1s
    - Max per-shot error < 0.5s
14. RUN factory/scripts/analyze-output.py for quality score
15. REGISTER in factory worker API
```

## Key Files Created

| File | Location | Purpose |
|------|----------|---------|
| Factory header | `factory/HEADER.md` | Entry point for new agents |
| Factory reference | `factory/REFERENCE.md` | Complete system reference |
| Cloudflare plan | `factory/CLOUDFLARE-BUILD.md` | Worker deployment |
| System spec | `factory/SYSTEM-SPEC.md` | Architecture + improvement loop |
| Validation rubric | `factory/validation-rubric.md` | 100-pt scoring with 5 passes |
| Hermes vision | `operations/completeautonomoushermes.md` | Full autonomous system |
| Progress | `factory/PROGRESS.md` | **This file** |
| Analysis tool | `factory/scripts/analyze-output.py` | Score any output pack |
| Resource search | `factory/scripts/search-resources.py` | Find existing functions for gaps |
| Ralph loop | `factory/scripts/ralph-loop.sh` | Auto-iteration manager |
| Pipeline script | `factory/scripts/run-pipeline.sh` | Full pipeline executor |
| Platinum skill | `hermes/skills/factory/produce-platinum-video/SKILL.md` | Hermes skill |
| v4 build | `content/publishing/renders/pain-is-juice/build_v4.py` | Working audio-first pipeline |

## Existing Resources Available

| Resource | Count | Location |
|----------|-------|----------|
| Scene functions (renderer) | 67 | `scripts/renderer/p*.py` |
| Scene functions (library) | 172 | `visual-library/*.py` |
| Total scene functions | **261** | Both combined |
| Cataloged scenes | 198 | `scene-system/catalog/scenes.json` |
| Semantic concepts | 263 | `scene-system/concepts/` |
| Template families | 12 | `scene-system/templates/` |
| Expansion essays | 56 | `scripts/expansion-essay*.md` |
| Animation pack refs | 12 | R2 `uploads/goldfiles/` |
| Platinum reference (Corbin) | 1 | `renders/corbin-analysis/` |
| Platinum reference (Earth) | 1 | `renders/you_existed_before_earth/` |
| Gold standards captured | 3 | Factory worker API |
