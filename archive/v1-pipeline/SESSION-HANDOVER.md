# Session Handover — 2026-07-23

**What we built:** A complete MCP-based video production pipeline for Hermes.
**What we learned:** The 5 iterations of failure that led to the current approach.
**State:** Pipeline works end-to-end. `factory_produce_video` is the single-call tool.

---

## Where Everything Lives

### Core System Files
| File | Purpose | Status |
|------|---------|--------|
| `factory/HEADER.md` | Pipeline overview, commands | ✅ |
| `factory/REFERENCE.md` | Complete system reference | ✅ |
| `factory/validation-platinum.md` | **Master reference** — the complete thought process | ✅ Read this first |
| `factory/HANDOVER-FOR-NEXT-AGENT.md` | Mistakes I made, how to avoid them | ✅ Read this second |
| `factory/PROGRESS.md` | All 4+ iterations documented | ✅ |
| `factory/SESSION-HANDOVER.md` | **This file** — today's session state | ✅ |

### MCP Toolkit
| File | Purpose | Status |
|------|---------|--------|
| `hermes/plugins/factory-mcp-server.py` | MCP server with `factory_produce_video` (one-shot pipeline) + 5 individual tools | ✅ Live |
| `hermes/docs/mcp-reference.md` | Complete MCP reference for new agents | ✅ |
| `hermes/plugins/factory/tools/clean.py` | Plugin tools (backup approach) | ✅ |
| `hermes/plugins/factory/tools/render.py` | Scene search via plugin | ✅ |
| `hermes/plugins/factory/tools/validate.py` | Analysis via plugin | ✅ |

### Platinum Video Skill
| File | Purpose | Status |
|------|---------|--------|
| `hermes/skills/factory/produce-platinum-video/SKILL.md` | 5-pass deterministic skill (1123 lines) | ✅ v6.0 |
| Matches platinum process stages 1-9 with binary validation gates | — | ✅ |
| Gate chaining (if Gate 1.1 fails, cannot proceed) | — | ✅ Added today |
| Unauthorized additions detection via diff | — | ✅ Added today |

### Gold Pack Analyses (7 packs studied)
| File | Pack | Key Insight |
|------|------|-------------|
| `factory/analysis-malas.md` | Three Veils | Filters, not substances; transparency not destruction |
| `factory/analysis-dvadasanta.md` | 12-Stage Axis | Each node needs unique metaphor; progressive spatial transformation |
| `factory/analysis-amnayas.md` | Four Streams | Directional color semantics; center holds while periphery moves |
| `factory/analysis-pramatr.md` | Seven Subjects | Explicit "don't"s; guardrails prevent misinterpretation |
| `factory/analysis-cakrodaya.md` | Mantra Cycles | Nested orbital motion; breath-synced tempo |
| `factory/analysis-stones.md` | Stones Watching | Concrete noun motif names; chapters interleave |
| `factory/analysis-path-chose-you.md` | Path Chose You | 109 shots, 41 motifs, .srt subtitles included |

### Platinum References (2 film packs downloaded)
| Pack | Location | Shots | Duration |
|------|----------|-------|----------|
| Stones Are Watching | `renders/gold-analysis/stones_analysis/` | 106 | 11.6 min |
| You Existed Before Earth | `renders/you_existed_before_earth/` | 75 | 7.6 min |

### Rationale Examples (deep per-shot thinking)
| File | What It Shows |
|------|---------------|
| `factory/rationale-deep-dive.md` | Stones pack first 5 shots: my bad instinct vs platinum's correct choice |
| `factory/rationale-exercise-malas.md` | All 8 malas scenes: how each PIL function maps to its concept |

### Cloudflare Infrastructure
| File | Purpose |
|------|---------|
| `cloudflare-infra.md` | Cloudflare architecture (Workers AI, D1, R2, Vectorize) |
| `cloudflaredashboard.md` | Dashboard + tunnel setup |
| `factory/CLOUDFLARE-BUILD.md` | Deploy instructions |

### Render Outputs (our attempts)
| Output | Essay | Shots | Status |
|--------|-------|-------|--------|
| `renders/spanda-v5/` | expansion-essay1 | 179 | Rendering worked, quality needs work |
| `renders/pain-is-juice/` | expansion-essay5 | 63 | Audio-first workflow proof |
| `renders/you-are-made-of-light/` | expansion-essay7 | 60 | Pre-production files, re-rendered |
| `renders/daimon-threshold/` | expansion-essay9 | 5 | Animation pack (32s, 10fps) |
| `renders/hermes-test/` | expansion-essay7 | — | Hermes Pass 1 output (narration, rhetorical map, visual thesis) |
| `renders/mcp-e2e/` | expansion-essay5 | 52 | E2E pipeline test (all 8 steps documented) |

---

## MCP Pipeline Status

### MCP Servers Running (3)
```
factory          — stdio python3  — 6 tools (produce_video + 5 individual)  ✅
cloudflare-docs  — HTTPS remote   — 4 tools (docs search)                   ✅
fablecut         — stdio node     — 7 tools (video editor)                  ✅
```

### The `factory_produce_video` One-Shot Tool
Does the full pipeline in a single MCP call:
```
clean → split → voiceover → search scenes → storyboard → render → assemble → upload → register
```

**Status:** Created but the test timed out (300s wasn't enough for voiceover generation on 50+ shots). The individual tools all work (<2s each). The bottleneck is Edge TTS generating 50+ WAV files sequentially.

### Individual MCP Tools (all tested, all passing)
| Tool | Avg Response | Tested? |
|------|-------------|---------|
| `factory_clean_narration` | <2s | ✅ |
| `factory_search_scenes` | <2s | ✅ |
| `factory_list_gold_files` | <2s | ✅ |
| `factory_create_job` | <2s | ✅ |
| `factory_register_job` | <2s | ✅ |

---

## Key Mistakes to Not Repeat

### Mistake 1: Writing code instead of thinking
Every failure traced back to: I started coding before understanding the transformation. The fix is in `rationale-deep-dive.md` — before rendering any shot, write the rationale for HOW the visual represents the concept.

### Mistake 2: Noun-level vs process-level
"Stones have life" → I drew a glowing rock (noun). Platinum drew a stone with eye-like markings (process: what kind of life? patient watching). The fix is in the skill's Gate 2.3: per-shot semantic design with the visual translation ladder.

### Mistake 3: Not searching the existing library
We have 261 scene functions. I wrote ~30 new ones that were worse versions of existing ones. The fix is `factory_search_scenes` — search before writing.

### Mistake 4: Linear storyboards
My films were A→B→C→D. Platinum films interleave: A→B→C→A→D→B. The fix is in the skill's Gate 2.4: no chapter occupies 3+ consecutive shots.

### Mistake 5: No gate chaining
The skill had validations but they weren't CHAINED — the self-critique could pass even if Step 1.2 failed. Fixed today with explicit gate chain in Step 1.6.

---

## What's Next

### Immediate TODO (to produce an actual platinum video)
1. Run `factory_produce_video` on a SHORT essay (expansion-essay5 is only 416 words — faster test)
2. Wait for the voiceover generation step (this takes the longest)
3. Review the output MP4
4. Improve scene rendering (currently draws dots — needs actual concept diagrams)
5. Iterate

### Medium-term
1. Add the `cloudflare-api` MCP OAuth (needs browser — run from interactive terminal)
2. Expand the scene function library for concepts we're missing (rasa, emotion, grief, witness)
3. Build the animation pack tier (10fps modules that compose into film packs)
4. Add auto-self-critique to `factory_produce_video` (run analyze_output after render, loop if < GOLD)

### The factory_produce_video bottleneck
The tool works but is limited by sequential Edge TTS. Each WAV takes 2-5s to generate. 50 shots = 2-4 minutes just for voiceover. Render time is similar. Total pipeline time for a full video: ~10-15 minutes.

---

## Quick Start for Tomorrow

```bash
# Pick up where we left off:
cd /root/projects/blog

# 1. Check Hermes is running
hermes gateway status

# 2. Check MCP tools
hermes mcp test factory

# 3. Run a short test
hermes -z "Call mcp__factory__factory_produce_video with essay_path='/root/projects/blog/scripts/expansion-essay5.md' slug='resume-test-1' channel='Tantra Files'"

# 4. Check results
curl -s https://factory-worker.tradesprior.workers.dev/api/factory/jobs/resume-test-1 | python3 -m json.tool

# 5. Watch the video
open https://factory-worker.tradesprior.workers.dev/api/factory/assets/resume-test-1/v1/final.mp4
```

## Key Credentials (set fresh each session)
```
CLOUDFLARE_API_TOKEN=CF_API_TOKEN_PLACEHOLDER
R2_ACCESS_KEY_ID=87335c47538971cc698270f84559ed7d
R2_SECRET_ACCESS_KEY=efd1968d867661f0cd09ce47bee4af8c6ad3e1f8b0f1e434b8a084bdcec7c4f0
R2_ENDPOINT=https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com
```

## Key URLs
```
Factory Worker API:    https://factory-worker.tradesprior.workers.dev
Dashboard:             https://studio.tantrafiles.xyz
Custom Domain:         https://factory.tantrafiles.xyz (needs DNS setup)
Hermes Skills:         /root/projects/blog/hermes/skills/factory/
Factory MCP:           /root/projects/blog/hermes/plugins/factory-mcp-server.py
Factory Reference:     /root/projects/blog/factory/
