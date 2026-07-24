# Agent Handover — 2026-07-24

## Things That Were Not Obvious at the Outset

---

## 1. How to Call Hermes

**Hermes is a CLI agent** at `/usr/local/bin/hermes`. The gateway is a running systemd service.

```bash
# Oneshot mode (non-interactive)
hermes -z "your task here"

# With a skill preloaded
hermes -s factory-pipeline -z "your task"

# Interactive chat
hermes chat
```

**The gateway is already running** with 3 MCP servers:
- Factory MCP (`factory_produce_video` etc.)
- Zeus MCP (validator/amplifier)
- FableCut MCP (video editor)

Check with: `hermes gateway status`

**Known issue:** The `produce-platinum-video` skill at `hermes/skills/produce-platinum-video.SKILL.md` is NOT detected by `hermes skills list`. The `.SKILL.md` extension format may not be read. Skills that ARE detected are in subdirectory format: `core/factory-pipeline/SKILL.md`. To fix, either:
- Move the skill to `hermes/skills/produce-platinum-video/SKILL.md`
- Or use `hermes skills install` to register it
- Or pass the skill content inline in the prompt

---

## 2. The Correct Workflow (Do NOT Skip Pre-Production)

The automated pipeline `factory_produce_video` produces **generic SILVER-grade output** that fails Zeus validation. It uses abstract shape names (circle, aperture, vessel, point) instead of concrete motifs, and every shot looks the same.

**The correct platinum process is:**

```
STEP 1: READ the essay for PROCESSES, not nouns
       Ask: "What transformation does this sentence describe?"
       Not: "What objects does this sentence mention?"

STEP 2: DESIGN the visual thesis BEFORE any code
       - Material world (what is this essay MADE OF? stone? parchment? glass?)
       - Spatial world (where does action take place? scriptorium? mineral vein?)
       - Motion verbs (5-8 that dominate: crystallize, petrify, coagulate, reveal)
       - Recurring systems (4-7 that evolve across the film)
       - Color semantics (70% neutral, 10-20% secondary, 3-8% accent)
       - Forbidden clichés (≥5 things you will NOT do)

STEP 3: STORYBOARD each shot through the visual translation ladder
       words → proposition → relation → process → material metaphor → motion → resolved image
       Every shot needs: motif name (CONCRETE not abstract), continuity_object, 
       visual_mechanism description, spoken_passage from actual essay text

STEP 4: WRITE custom scene functions
       Each motif group needs a UNIQUE function. No dispatch tables, no motif pools.
       15-40 lines of PIL code per function. The function IS the concept.

STEP 5: RENDER using the library (6fps for draft, 10fps for animation packs)
STEP 6: SELF-CRITIQUE (7 questions before presenting)
STEP 7: ZEUS validation → iterate if < GOLD
```

**The existing library** has 60 motif functions at `scripts/renderer/motif_renderers.py` and 172+ functions at `visual-library/`. Search before writing:

```bash
python3 factory/scripts/search-scenes.py "your concept"
```

---

## 3. Gold Reference Standards

From analyzing the gold "Stones Are Watching" pack (essay 46):

| Metric | Gold Range | Our Baseline | Notes |
|--------|-----------|--------------|-------|
| Shot count | 75-110 | 80 | ✅ |
| Unique motifs | 36-45 | 4 (!!) | ❌ Huge gap |
| Chapters | 10-11 | 7 | Near |
| Shot duration | 5.2-9.4s | 4.0-5.6s | ❌ Too short |
| Continuity | 100% | 0% | ❌ Missing continuity_object |
| Consecutive distinct | All different | 0/10 | ❌ All identical |
| Visual thesis | Specific to essay | "laboratory of stone" | ❌ Generic |
| Motif NAMES | bishop_codex, watching_stones | circle, aperture | ❌ Abstract |

**The gold pack uses 36 unique motif names**, many hand-crafted for the essay:
`bishop_codex, watching_stones, inner_lattice, crystal_growth, earth_water, star_map, stone_star, sulphur_fire, onyx_faces, mercury_flow, twin_vessels, salt_crucible, human_intermediate, adamant, electrum, silver_vein, river_gold, false_gold, prime_matter, solar_furnace, magnet_relation, cooling_stone, dream_stone, seed_form, subtle_body, twelvefold, lapis_birth, etc.`

Each of these has a custom PIL function. ~17 of these exist in the library, the rest are hand-written.

---

## 4. The Visual Library & Render Engine

Three render backends, PIL is the only production one:

| Component | Path | Functions | Status |
|-----------|------|-----------|--------|
| Motif renderers | `scripts/renderer/motif_renderers.py` | 60 (stone_eye, bishop_codex, star_map...) | ✅ Production |
| Visual templates | `scripts/renderer/visual_templates.py` | 12 templates | ✅ For fallback |
| Core renderer | `scripts/renderer/renderer.py` | 8 primitives, 9 colors | ✅ |
| Visual library | `visual-library/` | 172+ across 20 files | ✅ |
| Scene catalog | `scene-system/catalog/scenes.json` | 198 indexed | ✅ |

**Key insight:** The renderer has `render_for_motif(motif_name, t, u, idx)` which dispatches to the right function. But the gold process says this is wrong — each motif should have its own function call, not a dispatch.

---

## 5. What Essays Have Been Done

51 expansion essays exist at `scripts/expansion-essay1.md` through `expansion-essay51.md`.

**Already produced as videos:** essay 1 ("The Universe Has Two Assembly Lines") and essay 46 ("The Stones Are Watching You"). That's it.

**Essays 2-45 and 47-51 are untouched** by any pipeline.

The essay registry at `content/factory/essay-registry.json` tracks by RO (Research Object) ID, not essay number. The RO queue at `content/factory/ro-queue.json` lists 43 ready-for-essay topics that haven't been turned into videos yet.

---

## 6. The Output Path

The tantrafiles.xyz dashboard is the output destination. Renders go to:
```
/root/projects/blog/content/publishing/renders/{slug}/v1/
```

Files are uploaded to R2 bucket `factory-assets` and registered with the factory worker at:
```
https://factory-worker.tradesprior.workers.dev/api/factory/jobs/{slug}
```

The baseline for essay 46 is at:
```
/root/projects/blog/content/publishing/renders/stones-baseline/v1/
```
Files: `storyboard.json` (83 shots), `visual_program.json`, `visual_thesis.md`, `render_stones_proper.py` (31 functions), `draft.mp4`

---

## 7. Cloudflare Stack

| Service | Binding | Purpose |
|---------|---------|---------|
| Worker | `re-rendering-atlas` | Next.js site + API |
| D1 | `atlas-db` | Factory state, essay registry |
| R2 | `atlas-sources`, `factory-assets` | Art, videos, audio |
| Vectorize | `atlas-global` | Semantic search |

Deploy: `wrangler.jsonc` at project root.

---

## 8. Dashboard & Output Display

The tantrafiles.xyz dashboard is the front-end for displaying produced videos:

| URL | Type | Purpose |
|-----|------|---------|
| `https://studio.tantrafiles.xyz` | Cloudflare Tunnel → VPS | Full Flask backend + frontend |
| `https://dashboard.tantrafiles.xyz` | Cloudflare Pages + Worker | Static frontend with API proxy |
| `https://factory-worker.tradesprior.workers.dev` | Cloudflare Worker | Factory API (R2 uploads, job registration) |

Renders are uploaded to R2 (`factory-assets` bucket) and registered with the factory worker API. The dashboard reads from the D1 database and R2 to display finished videos.

The factory worker API is alive and responding. The R2 S3 credentials are hardcoded in `factory-mcp-server.py`.

For now, video slugs follow this pattern:
```
{slug}/v1/final.mp4     → stored in R2
{slug}/v1/storyboard.json → local filesystem only
```

---

## 9. Common Mistakes to Avoid

1. **Don't call factory MCP modules directly** as Python imports. They're designed for the MCP stdio protocol (JSON-RPC over stdin/stdout). Either call them through Hermes or write a proper wrapper.

2. **Don't use the automated pipeline without pre-production.** `factory_produce_video` auto-generates a visual thesis, but it produces generic shape names (circle, aperture, vessel) instead of concrete motifs (watching_stones, bishop_codex). It also generates garbled narration text instead of using the actual essay.

3. **Don't write scripts that auto-assign motifs.** Keyword matching produces at most 19 motifs, not the 36-45 gold range. Each shot needs to be thought through individually.

4. **Don't skip the visual thesis.** The thesis defines material world, spatial world, motion verbs, 4-7 recurring systems, color semantics (with hex codes), and ≥5 forbidden clichés. Without this, every shot defaults to the same look.

5. **Don't forget continuity_objects.** Every shot needs one. Zeus checks this and it was a hard failure.

6. **Don't abuse the dispatch table.** The gold packs don't use `render_for_motif()` — they call `render_bishop_codex()`, `render_watching_stones()` directly. Each function is custom.

7. **Don't use abbreviated narration in storyboard.** Use the ACTUAL essay sentences for `spoken_passage`. The SBERT alignment test checks similarity between visual descriptions and narration.

8. **Don't start from scratch.** 60+ motif functions exist in `motif_renderers.py`. Search before writing.

---

## 9. Skill Detection Issue

The skill `produce-platinum-video` at `hermes/skills/produce-platinum-video.SKILL.md` is not detected by `hermes skills list`. Skills that ARE detected use subdirectory convention: `core/factory-pipeline/SKILL.md`.

**To use the skill anyway**, pass its content inline or instruct the agent with:
> "Follow the 5-pass platinum video process from /root/projects/blog/hermes/skills/produce-platinum-video.SKILL.md"

Alternatively, restructure the skill directory to match the detected format.

---

## 10. What I (This Agent) Actually Did & What Remains

I ran on **expansion-essay46.md** ("The Stones Are Watching You") — same essay as the gold reference pack.

| Step | What I Did | Result |
|------|-----------|--------|
| 1. Baseline pipeline | Called `factory_produce_video` through the MCP | SILVER 77%, 4 motifs, all shots identical ❌ |
| 2. Zeus validation | Found hard failures: no continuity, 0% distinct | Confirmed pipeline is insufficient |
| 3. Visual thesis | Created proper thesis: material world, palette, 7 systems, forbidden clichés | ✅ Good |
| 4. Storyboard | Built 83-shot storyboard with real essay text, 19 concrete motifs, continuity | Better but not gold |
| 5. Custom functions | Wrote 17 custom PIL functions + used 14 from library (31 total) | Ratio 0.79 (needs 0.8+) |
| 6. Re-render | Rendered with proper motif dispatch at 6fps | 83 shots, 10.8min duration |
| 7. Zeus re-validation | SILVER 77%, but structural metrics improved: 39 motifs attempted, 100% continuity, 8/10 distinct | Still needs ~17 more motifs |

**What I SHOULD have done:** Called `hermes` CLI agent with the right skill loaded to let the AI think through each shot rather than writing assignment scripts.

**Files produced:**
- `content/publishing/renders/stones-baseline/v1/visual_thesis.md` — Visual thesis document
- `content/publishing/renders/stones-baseline/v1/storyboard.json` — 83-shot storyboard
- `content/publishing/renders/stones-baseline/v1/visual_program.json` — Visual program
- `content/publishing/renders/stones-baseline/v1/render_stones_proper.py` — 31 scene functions
- `content/publishing/renders/stones-baseline/v1/draft.mp4` — Rendered video (no audio yet)
- `content/publishing/renders/stones-baseline/v1/build_storyboard.py` — Storyboard builder

**To reach GOLD, a new agent needs to:**
1. Write 17+ more custom scene functions for unique motifs (target 36-45)
2. Build AGENT_KNOWLEDGE_DOSSIERs per animation pack
3. Generate proper per-shot audio with Edge TTS and mux with video
4. Run the 7 self-critique questions before presenting
5. Register in the factory dashboard via R2 upload

---

## 11. Quick Reference

```bash
# Search for existing scene functions
python3 factory/scripts/search-scenes.py "eye"           # → s_perception, s02_third_eye
python3 factory/scripts/search-scenes.py "lattice"       # → scene_tattva_lattice
python3 factory/scripts/search-scenes.py "light"         # → scene_light_darkness

# Run Zeus validation on output directory
cd /root/projects/blog && python3 -c "
import sys; sys.path.insert(0, 'hermes/plugins')
import importlib.util
spec = importlib.util.spec_from_file_location('z', 'hermes/plugins/zeus-mcp-server.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
r = mod.validate_all('content/publishing/renders/YOUR_SLUG/v1')
print(f'Grade: {r[\"verdict\"]} {r[\"grade\"]} ({r[\"soft_score\"]}%)')
"

# Check gateway status
hermes gateway status

# List available skills
hermes skills list
```
