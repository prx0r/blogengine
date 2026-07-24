# Session Summary — 2026-07-24

## What We Built

| File | Purpose |
|------|---------|
| `factory/platinum_controller.py` | State machine controller — 13 stages with hard validation gates |
| `factory/pack-template/` | Canonical pack blueprint (merged film + animation formats) |
| `factory/THE-PLATINUM-PROCESS.md` | Definitive process flow for platinum production |
| `factory/ZEUS-AMPLIFIER.md` | Zeus challenge questions per shot |
| `factory/PLATINUM-ADVICE.md` | 20-point production protocol from external advisor |
| `factory/CLOUDFLARE-VIDEO-ARCHITECTURE.md` | Cloudflare Workers/Durable Objects/Queues architecture advice |
| `factory/MULTI-MEDIUM-PIPELINE-PROPOSAL.md` | Multi-medium direction (PIL + AI images + historical) |
| `factory/cloudflare-ai-reference.md` | CF Workers AI models + pricing reference |
| `factory/PROBLEM-STATEMENT.md` | Full problem statement for external LLMs |
| `factory/gold-pack-registry.json` | 31 gold packs indexed |
| `factory/pack-manifest.json` | 61 unique packs deduplicated |
| `factory/storyboard-template.json` | Storyboard with visual_audio_alignment field |
| `factory/AGENT-HANDOVER-2026-07-24.md` | Early handover (pre-session) |
| `factory/SESSION-BUILD-NOTES-2026-07-24.md` | Full build notes |
| `factory/SESSION-SUMMARY.md` | This file |
| `hermes/skills/platinum-designer/SKILL.md` | PASS 1 skill: planning/storyboarding |
| `hermes/skills/platinum-renderer/SKILL.md` | PASS 2 skill: review + render (Zeus) |
| `archive/v1-pipeline/` | Old approach (monolithic skill, dispatch renderers, auto-thesis) |

## What We Ran

| Run | Essay | Result |
|-----|-------|--------|
| Run 1: `stones-hermes-run` (old monolithic skill) | 46 — Stones | Copied gold storyboard. FAIL. |
| Run 2: `light-designer-v2` (platinum-designer skill) | 15 — Light | 47 motifs, 60 shots, all with visual_audio_alignment. PASS planning. |
| Run 3: `canonical-test` (controller) | 15 — Light | pack_setup → gold_study → rhetorical_map passed. |
| Run 4: `essay11-run` (controller, full test) | 11 — One Thing | 7 stages passed. Currently on pack_composition. |

## Test Run Analysis (essay 11)

**Strengths:**
- Creative vision is gold-quality — three competing worlds, hybrid selection, 6 systems with evolution arcs, 10-color semantic palette, 7 forbidden clichés showing real philosophical thinking
- Controller caught failing motif (SMOKE TRAIL at 11/16)
- All required fields present in storyboard

**Weaknesses:**
- 14 shots for 600 seconds = 30-50s per shot (gold standard: 5-10s)
- Motif names are compound phrases not concise gold-style names
- Timing doesn't match essay length (595 words claiming 10 min runtime)

**Controller issues:**
- `-z` oneshot mode is silent — fixed with streaming output
- Validator key mismatch (`why_it_matches` vs `why_this_visual_matches`) — fixed
- Each Hermes call takes 1-4 minutes — 13 stages × 2 min avg = ~26 min per run

## Skills Status

Both `platinum-designer` and `platinum-renderer` are detected by `hermes skills list`. The old `produce-platinum-video` and all `factory/` duplicates are archived.

## Gold Packs

31 gold packs indexed in `factory/gold-pack-registry.json`. All zips extracted. 61 total packs deduplicated (from 74 entries). 12 R2 gold Blender/Manim files.

## Architecture Decision

Current controller is a Python CLI that calls Hermes as subprocess. Recommended migration path:
1. Phase 1: Cloudflare Workflow + DO + Queues coordinating existing VPS renderer
2. Phase 2: Fan-out TTS, embeddings, image gen into Workers
3. Phase 3: Container renderer replacing VPS
4. Phase 4: Automated local repairs for failed shots
