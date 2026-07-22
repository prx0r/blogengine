# Current State — Video + Art Pipeline

## Art Library

**Location:** `/mnt/HC_Volume_106427611/sacred-art/`

| Dataset | Images | Metadata | R2 | Notes |
|---------|--------|----------|----|-------|
| **WikiArt** | 15,299 | ✅ CLIP-labeled | ✅ | Symbolism + Surrealism |
| **CYTKv1** | 1,778 | ✅ extracted + metadata | ✅ | Thangkas from JSONs |
| **CIRThan** | 179 images, 2,287 sketches | ✅ captions (gold standard) | ❌ not yet | Rest of images uploading from your Drive |
| **Blog gallery** | 1,146 metadata, 135 images | ✅ concepts, entities, mood | — | Needs more images downloaded |
| **HAB Alchemy** | 901/1,057 | ✅ category labels | ✅ | 156 remaining images |
| **ArtDL** | 42.5K in ZIP | ⏳ partial extract on R2 | ✅ ZIP only | Extraction stopped at 16K (disk space) |
| **Deities-25** | 0/8,239 | ❌ | ❌ | HF download keeps failing |
| **AOI articles** | 234 scraped | ✅ transcripts + art URLs | — | Ready for use |

### Key docs
- `ART-AUDIT.md` — full audit with schema, totals, action items
- `EXPERIMENT-SPEC.md` — labeling experiment design (CLIP zero-shot vs CIRThan transfer)
- `RESEARCH-SPEC.md` — standardization strategy proposal
- `metadata/*.jsonl` — all labeled metadata in unified format

### To do when returning
1. Restart Deities-25 download (`hf download Yegiiii/deities-25 --repo-type dataset`)
2. Extract ArtDL from R2 ZIP when disk space allows
3. Run labeling experiment (`python3 experiment_runner.py`) — ~3 min, choose winner
4. Apply winning method to all unlabeled images
5. Download remaining CIRThan images from Drive (you're uploading)
6. Download blog gallery images from their source URLs

---

## Video Production

**FableCut:** `http://localhost:7777` | **Tunnel:** `https://fablecut.tantrafiles.xyz`

### Modules
- `video-templates/modules/` — 10 module JSONs (quote-card, full-bleed-art, portrait-focus, detail-zoom, text-on-black, lower-third, map-diagram, side-by-side, quote-image, timeline)
- `video-templates/modules/USAGE-GUIDE.md` — when to use each module
- 3 FableCut filter presets added to `app.js`: `mystical-dark`, `golden-imaginal`, `corbin-blue`

### Templates
- `video-templates/biography.json` — 12-segment biography template
- `video-templates/gold-standards/alan-watts-gold.json` — primary pacing template (7.1s avg)
- `video-templates/style-rules.md` — derived from all exemplar analyses

### Kapala Video (TBP-034)
- **Status:** Built, validated at 81%, loaded into FableCut
- **Narration:** 10 segments, 6.8 min, full script written
- **Art:** 10 Met Museum images matched
- **To finish:** Add quote cards from source texts, expand narration to fill 20 min target

### Validation
- `operations/video-creation-spec.md` — 3 validation levels (Bronze 60%, Silver 75%, Gold 85%)
- `scripts/validate-video.mjs` — 24-check validation runner
- `operations/hermes-video-pipeline.md` — 9-phase pipeline bridging essay skill → gold standards → FableCut

### To do when returning
1. Add quote cards to Kapala video for attributed quotes
2. The Silver validation (75%) - close at 81% but some minor format fixes needed
3. Next video: try the tattvas expanded essay as source script

---

## Downloads Running

| Process | Status | Location |
|---------|--------|----------|
| HAB Alchemy | ⏸️ 901/1057 | `/mnt/HC_Volume_106427611/sacred-art/raw/hab-alchemy/.../downloads/` |
| Deities-25 | ❌ stuck | `/mnt/HC_Volume_106427611/sacred-art/raw/deities-25/` |
| Experiment | ❌ killed (too slow on CPU) | `sacred-art/experiment_runner.py` |

---

## System

| Resource | Usage |
|----------|-------|
| Root disk | 54G/75G (76%) |
| Volume disk | 21G/30G (73%) |
| FableCut | running on :7777 |
| Cloudflare tunnel | active → fablecut.tantrafiles.xyz |
| R2 sacred-art bucket | images + metadata uploading |
