# Session Build Notes — 2026-07-24

## What We Did This Session

### Problem We Were Solving
Automated video essay production (philosophical content for YouTube) kept producing generic output — 4 abstract motifs (circle, aperture, vessel, point) instead of 36+ concrete ones (watching_stones, bishop_codex). The automated pipeline skipped all creative thinking.

### Root Cause
Quality was advisory. The old skill (`produce-platinum-video`, 1123 lines, 5-pass monolithic) was a suggestion, not an enforcement. Hermes could skip Pass 0 (study gold), Pass 2 (per-shot semantic design), and jump straight to rendering. The storyboard was copied from the gold pack, not designed.

### What We Built

**1. The Platinum Process Document**
`factory/THE-PLATINUM-PROCESS.md` — The definitive process flow for producing platinum-quality video essays. Hermes is a visual designer, not a pipeline. Zeus is an amplifier, not a validator.

**2. Two-Skill Split**
- `hermes/skills/platinum-designer/SKILL.md` — PASS 1: Planning only. Studies gold packs, reads essay, designs visual thesis, builds storyboard with `visual_audio_alignment` field. NO code, NO rendering.
- `hermes/skills/platinum-renderer/SKILL.md` — PASS 2: Review + Render. Zeus takes the planning pack, produces comparative analysis vs gold packs, writes custom PIL code, renders.

**3. The State Machine Controller**
`factory/platinum_controller.py` — A deterministic controller that owns the stage sequence. Hermes cannot skip stages. The controller validates outputs and advances.
- 13 stages: PACK_SETUP → GOLD_STUDY → RHETORICAL_MAP → VISUAL_THESIS → MOTIF_MANUFACTURABILITY → STORYBOARD → STORYBOARD_REVIEW → PACK_COMPOSITION → RENDER_PLAN → CODE_REVIEW → DRAFT_RENDER → VISUAL_QC → FINAL_RENDER
- Each stage has: required inputs, expected outputs, max retries, Hermes prompt template
- Usage: `python3 factory/platinum_controller.py new --slug X --essay Y --output Z`
- Then: `python3 factory/platinum_controller.py advance --slug X` (repeat through all stages)
- If a stage fails: `python3 factory/platinum_controller.py retry --slug X`

**4. Canonical Pack Template**
`factory/pack-template/` — The standard format for all packs. Both film packs and animation packs use the same template:
- `storyboard.json` — per-shot with visual_audio_alignment, concrete_motif (drawable_parts, motion_verbs), composition, animation_phases, bad_first_visual, rejected_because
- `visual_program.json` — thesis, palette, systems, chapters, forbidden cliches
- `AGENT_KNOWLEDGE_DOSSIER.md` — design brief (from animation packs)
- `STYLE_EVOLUTION.md` — visual inheritance chain (from animation packs)
- `PRODUCTION_BLUEPRINT.md` — production spec (from film packs)
- `render_pack.py` — custom PIL functions
- `scenes/` + `contact_sheet.jpg` + `final.mp4`

**5. Gold Pack Registry**
`factory/gold-pack-registry.json` — 31 gold/platinum reference packs indexed with type, size, shot count, path.
`factory/pack-manifest.json` — 61 unique packs found across all directories (deduplicated from 74 entries).
All zips extracted across 4 locations.

**6. TTS Testing**
`scripts/tts-test.py` — Compared Edge TTS vs CF Workers AI models. Edge TTS (free) generated 113s of audio in 4.2s. CF models (MeloTTS, Aura-1/2) couldn't be tested due to API token permissions.
Results published to `public/audio/tts-test.html` + `factory/cloudflare-ai-reference.md`.

**7. Archive of Old Approach**
`archive/v1-pipeline/` — motif_renderers.py, visual_templates.py, factory-mcp-server.py, zeus-mcp-server.py, build_threads.py, old handover docs.

**8. Key Insight Documents**
- `factory/THE-PLATINUM-PROCESS.md` — The definitive process
- `factory/ZEUS-AMPLIFIER.md` — Zeus challenge questions
- `factory/PLATINUM-ADVICE.md` — The 20-point production protocol
- `factory/storyboard-template.json` — Storyboard with visual_audio_alignment
- `factory/MULTI-MEDIUM-PIPELINE-PROPOSAL.md` — Future direction
- `factory/CLOUDFLARE-VIDEO-ARCHITECTURE.md` — Cloudflare Workflow/DO/Queues/Containers architecture
- `factory/cloudflare-ai-reference.md` — CF AI models + pricing
- `factory/SESSION-SUMMARY.md` — Concise session summary
- `factory/PROBLEM-STATEMENT.md` — Full problem statement for external LLMs

### Test Results

Run 1 (old produce-platinum-video skill, essay 46):
- Copied gold pack storyboard verbatim (106 shots, 36 motifs, all identical)
- NO visual_audio_alignment field
- Render script was original PIL but the DESIGN was copied
- Verdict: FAIL

Run 2 (platinum-designer skill, essay 15):
- 47 unique concrete motifs, all original
- 60 shots with visual_audio_alignment on every one
- 60/60 no_narration_test = PASS
- bad_first_visual + rejected_because on every shot
- Three competing visual worlds proposed
- Verdict: PASS (planning only, no render)

Run 3 (controller on essay 15, canonical-test):
- pack_setup → ✅
- gold_study → ✅
- rhetorical_map → pending

### Key Files Locations

| File | Purpose |
|------|---------|
| `factory/platinum_controller.py` | State machine controller |
| `factory/pack-template/` | Canonical pack blueprint |
| `factory/THE-PLATINUM-PROCESS.md` | Definitive process flow |
| `factory/gold-pack-registry.json` | 31 gold packs indexed |
| `factory/pack-manifest.json` | 61 unique packs deduped |
| `factory/ZEUS-AMPLIFIER.md` | Zeus challenge questions |
| `factory/PLATINUM-ADVICE.md` | 20-point production protocol |
| `factory/PROBLEM-STATEMENT.md` | Problem statement for LLMs |
| `factory/MULTI-MEDIUM-PIPELINE-PROPOSAL.md` | Multi-medium direction |
| `factory/cloudflare-ai-reference.md` | CF AI models + pricing |
| `hermes/skills/platinum-designer/SKILL.md` | Designer skill |
| `hermes/skills/platinum-renderer/SKILL.md` | Renderer skill |
| `hermes/skills/produce-platinum-video/SKILL.md` | Old monolithic skill |
| `content/publishing/renders/light-designer-test/v1/` | Run 2 output (planning pack) |
| `content/publishing/renders/light-designer-v2/v1/` | Run 2 v2 (with render + agentvision) |
| `content/publishing/renders/stones-hermes-run/v1/` | Run 1 output (copied gold) |
| `content/publishing/renders/canonical-test/v1/` | Run 3 (controller test) |
| `content/publishing/renders/gold-analysis/` | All gold analysis packs |
| `content/publishing/imports/packs/unpacked/` | All gold animation packs |
| `video-templates/gold-standards/animation-packs/extracted/` | R2 gold packs (Manim/Blender) |
| `archive/v1-pipeline/` | Old approach (archived) |
| `public/audio/tts-test.html` | TTS comparison listening page |

### What Still Needs Work

1. **Motif manufacturability validator** — The `motif_lint_report.json` from Hermes was empty because the prompt wasn't explicit enough about extracting motifs from visual_program.json. The prompt was fixed in the controller but not tested.

2. **Code review validator** — `code_review.json` needs sophistication metrics (phase count, layer diversity, text ratio).

3. **Visual QC automation** — The silent-film test and similarity check are described but not implemented.

4. **PACK_COMPOSITION stage** — The prompt was added to write AGENT_KNOWLEDGE_DOSSIER.md, STYLE_EVOLUTION.md, and PRODUCTION_BLUEPRINT.md from the reviewed storyboard, but hasn't been tested.

5. **CF Workers AI API token** — Needs a token with `workers-ai:run` scope to test MeloTTS/Aura models. Current token is R2/D1 only.

6. **Parallel TTS** — Edge TTS calls are sequential in the current pipeline. An `asyncio.gather` wrapper would solve this without spending money.

7. **Gold pack normalization** — The gold packs are all extracted and indexed but not yet normalized into the canonical format.

### Key Insights For Next Agent

- **The controller is the most important piece.** It enforces quality through hard gates. The skills are just prompts — the controller is the enforcement.
- **visual_audio_alignment is the critical field.** Every shot needs a `why_it_matches` explanation. Without it, the designer hasn't thought through the shot.
- **Don't write scripts that auto-assign.** The first run copied gold storyboards. The second run generated original work because the essay had no pre-existing gold pack.
- **Three competing visual worlds** forces creativity and prevents the first idea from dominating.
- **The PACK_SETUP stage copies the template automatically.** A new job always starts with the canonical template files.
- **Edge TTS is free and fast enough.** The bottleneck is sequential calling, not the TTS itself.
