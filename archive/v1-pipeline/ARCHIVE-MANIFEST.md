# V1 Pipeline — Archived 2026-07-24

This entire directory is the OLD approach. DO NOT USE any of these files.

## What was archived and why

| File | Original Location | Why Archived |
|------|-------------------|--------------|
| `dispatch-renderer/motif_renderers.py` | scripts/renderer/ | Dispatch table with 60 pre-made motifs. Gold packs prove each scene needs custom PIL code, not library selection. |
| `dispatch-renderer/visual_templates.py` | scripts/renderer/ | 12 templates that made every shot look the same. Zeus caught this every time. |
| `mcp-servers/factory-mcp-server.py` | hermes/plugins/ | Auto-generates visual thesis and storyboard. Produces abstract shape names (circle, aperture) instead of concrete motifs. |
| `mcp-servers/zeus-mcp-server.py` | hermes/plugins/ | Automated validator with checklists. Zeus should AMPLIFY, not just validate. |
| `auto-thesis/build_threads.py` | factory/ | Auto-generated visual theses that were always generic ("laboratory of stone"). |
| `HANDOVER-FOR-NEXT-AGENT.md` | factory/ | Replaced by THE-PLATINUM-PROCESS.md |
| `SESSION-HANDOVER.md` | factory/ | Replaced by THE-PLATINUM-PROCESS.md |
| `NORTHSTAR.md` | factory/ | Replaced by THE-PLATINUM-PROCESS.md |
| `BREAKTHROUGH.md` | factory/ | Preserved — core insight is now in THE-PLATINUM-PROCESS.md |
| `validation-platinum.md` | factory/ | Preserved — original process reference now in THE-PLATINUM-PROCESS.md |
| `baseline-output/stones-baseline/` | content/publishing/renders/ | Old approach output — 4 generic motifs, all shots identical |

## The New Approach

The new process is documented in `factory/THE-PLATINUM-PROCESS.md`.

Key difference: Hermes is a visual designer who studies gold packs, thinks through each shot, and writes custom PIL code. No dispatch. No templates. No auto-generation.
