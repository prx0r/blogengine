# Scene Engine Locations

| Component | Path |
|-----------|------|
| Renderer core | `scripts/renderer/renderer.py` |
| Spanda scenes | `scripts/renderer/spanda_scenes.py` |
| VBT scenes | `scripts/renderer/vbt_magnum.py` |
| Visual-library packs | `visual-library/` |
| Scene catalog | `visual-library/catalog/scenes.json` |
| Scene instances | `visual-library/instances/` |
| Animation references | `video-templates/animation-references/` |
| Gold standards | `video-templates/gold-standards/` |
| Video modules | `video-templates/modules/` |
| Visual director | `scripts/visual-director.py` |
| Build pipeline | `scripts/build-timed-video.py` |
| Sync to R2 | `scripts/sync-review.py` |

## Render Flow

```
Essay (expansion-essay*.md)
  -> Visual Director (parse -> scene manifest)
  -> PIL draft (2fps, scripts/renderer/)
  -> Skia final (12fps, visionary-renderer/)
  -> FableCut timeline (port 7777)
  -> Upload to R2 (scripts/sync-review.py)
  -> Review at studio.tantrafiles.xyz
```
