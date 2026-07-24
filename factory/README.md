# Platinum Factory

Deterministic video essay production pipeline. 13-stage state machine with hard validation gates. Produces canonical platinum packs with visual_audio_alignment, motif manufacturability scoring, and adversarial review.

```
GOLD_STUDY → RHETORICAL_MAP → VISUAL_THESIS → MOTIF_LINT
→ STORYBOARD → STORYBOARD_REVIEW → PACK_COMPOSITION
→ RENDER_PLAN → CODE_REVIEW → DRAFT_RENDER → VISUAL_QC → FINAL_RENDER
```

## Structure

| Directory | Contents |
|-----------|----------|
| `controllers/` | `platinum_controller.py` — 13-stage state machine |
| `process/` | THE-PLATINUM-PROCESS.md, ZEUS-AMPLIFIER.md, trifectavision.md |
| `spec/` | Architecture specs, comparisons, ecosystem vision |
| `registry/` | Gold pack index, deduplicated pack manifest |
| `template/` | Canonical pack format (storyboard, thesis, dossier, etc.) |
| `notes/` | Session build notes, handover docs |
| `archive-v1/` | Old pipeline files (reference only) |

## Skills

- `hermes/skills/platinum-designer/` — PASS 1: planning and storyboarding
- `hermes/skills/platinum-renderer/` — PASS 2: Zeus review and rendering

## Usage

```bash
python3 factory/controllers/platinum_controller.py new \
  --slug my-pack \
  --essay scripts/expansion-essayXX.md \
  --output content/publishing/renders/my-pack/v1

python3 factory/controllers/platinum_controller.py advance --slug my-pack
```

## Key Files

| File | Purpose |
|------|---------|
| `controllers/platinum_controller.py` | State machine, validators, stage prompts |
| `process/THE-PLATINUM-PROCESS.md` | Definitive process flow |
| `template/` | Canonical output format |
| `registry/gold-pack-registry.json` | 31 gold packs indexed |
| `spec/CLOUDFLARE-VIDEO-ARCHITECTURE.md` | Cloudflare migration plan |
| `spec/ECOSYSTEM-VISION.md` | Full agent ecosystem vision |
| `cloudflare/src/controller.py` | Cloudflare Worker API |
| `cloudflare/db/schema.sql` | D1 database schema |
