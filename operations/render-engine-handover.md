# Render Engine & Assets — Complete Handover

## Project Context

This supplements `handovervideo.md` (FableCut pipeline) and `ULTIMATE_HANDOVER.md` (research/data). Covers what neither documents: the 3 rendering engines, visual library, scene system, 331 MP4 outputs, animation packs, and Cloudflare R2 infrastructure.

---

## 1. Three Render Engines

### 1.1 PIL Renderer (`scripts/renderer/renderer.py` — 713 lines)

Core engine. Produces 1280x720 image sequences at 2fps using PIL `ImageDraw`.

**8 Drawing Primitives:**
| Primitive | Function | Params |
|-----------|----------|--------|
| dot | `dot(d,x,y,r,color,alpha)` | Center, radius |
| ring | `ring(d,x,y,r,color,alpha,width)` | Center, radius, stroke |
| arrow | `arrow(d,p1,p2,color,alpha,width)` | Start/end points |
| silhouette | `silhouette(d,cx,cy,s,color,alpha)` | Scale factor, body outline |
| flower | `flower(d,cx,cy,r,petals,color,alpha,rotation)` | Petal count, rotation |
| wavy_line | `wavy_line(d,x0,x1,y,amp,phase,color,alpha,cycles)` | Amplitude, phase, cycles |
| regular_polygon | `regular_polygon(d,cx,cy,r,n,color,alpha,rot)` | Sides, rotation |
| text | `centered(d,text,y,font,color)` / `left(d,...)` | Wrapping, fonts |

**9 Colors:** DARK, INK, GOLD, CRIMSON, MUTED, WHITE, PARCHMENT, BLUE, GREEN

**11 Fonts:** Devanagari (xl/l/m), Latin bold (xl/l/m/s/xs), Serif (l/m/s)

**Scene class:** `Scene(title, duration, fn(t,u,idx)->Image)` with `render()` outputting PNGs.

### 1.2 Scene Packs (`scripts/renderer/`)

| Pack | File | Functions | Topic |
|------|------|-----------|-------|
| Reflection | `p01_reflection.py` | 8 | Mirroring, self-knowing |
| Sound | `p02_sound.py` | 8 | Mantra, vibration, spanda |
| Upayas | `p03_upayas.py` | 8 | Four means: ananda, iccha, jnana, kriya |
| Kalis | `p04_kalis.py` | 8 | Twelve Kālis, time cycles |
| Spanda 2 | `p05_spanda2.py` | 8 | Spanda, pulse, expansion/contraction |
| Abhinavagupta | `p06_abhinavagupta.py` | 8 | Life, teachers, lineage |
| Mantra Breath | `p07_mantra_breath.py` | 8 | Breath, bija, prana |
| Tantra | `p19_25_tantra.py` | 11 | 25 tattvas, emanation |
| VBT Magnum | `vbt_magnum.py` | 20 | Vijnana Bhairava verses (1-20) |
| Add One VBT | `add_one_vbt.py` | 162 helpers | Grid of 162 VBT verse generators |

**Total: 249 scene functions across packs.**

### 1.3 Spanda Renderer (`scripts/spanda-renderer.py` — 196 lines)

Standalone renderer for the "Engine of Consciousness — Spanda" video. 10 scene functions, 352s at 2fps, 1280x720. Generated the first end-to-end video.

### 1.4 Particle Render (`scripts/particle_render.py` — 389 lines)

Procedural particle system renderer. Used for test/experimental animations.

### 1.5 Thumbnail Render (`scripts/thumbnail_render.py` — 276 lines)

Generates channel-branded YouTube thumbnails with text overlays, color palettes per channel.

---

## 2. Visual Library (`visual-library/` — 20 packs, 4,616 lines)

Standalone scene function library, independent of the `scripts/renderer/` packs. 172 scene functions total.

| Pack | Lines | Functions | Description |
|------|-------|-----------|-------------|
| `core_scenes.py` | 394 | 9 | Foundational scenes |
| `light_pack.py` | 464 | 15 | Light/illumination metaphors |
| `concept_packs.py` | 300 | 12 | Abstract concept scenes |
| `complexity_pack.py` | 237 | 11 | Complex systems visuals |
| `experimental_v2.py` | 350 | 13 | V2 experimental techniques |
| `experimental_v3.py` | 276 | 11 | V3 experimental techniques |
| `experimental_techniques.py` | 237 | 15 | Experimental approaches |
| `domain_assets.py` | 192 | 8 | Domain-specific visuals |
| `spanda_karika_pack.py` | 266 | 9 | Spanda Karika verses |
| `vijnana_bhairava_pack.py` | 259 | 9 | Vijnana Bhairava |
| `consiousness_to_bits.py` | 192 | 6 | Consciousness→information |
| `lsystem_collection.py` | 195 | 5 | L-system fractals |
| `minimal_forms.py` | 160 | 12 | Minimal geometric forms |
| `focus_pack.py` | 145 | 9 | Focus/concentration |
| `quote_templates.py` | 113 | 3 | Quote overlay templates |
| `packs_redone.py` | 282 | 12 | Redone pack scenes |
| `pack_01_consciousness_states.py` | 91 | 8 | Consciousness states |
| `p01_reflection.py` | 155 | 8 | Reflection (duplicate) |
| `ralph_loop.py` | 32 | 4 | Ralph's loop test |
| `ingest_packs.py` | 176 | — | Catalog ingestion script |

---

## 3. Scene System (`scene-system/`)

A formal metadata layer over the render functions.

| Component | Path | Count |
|-----------|------|-------|
| Concepts | `scene-system/concepts/` | **263** semantic tags (JSON files) |
| Templates | `scene-system/templates/` | **12** families (JSON): concentric_center, radial_relation, bilateral_relation, body_axis, wave_field, vertical_sequence, aperture, grid_dissolution, vessel_reception, knot_release, quote_card, unknown |
| Primitives | `scene-system/primitives/` | 8 (dot, ring, arrow, silhouette, flower, line, text, card) |
| Packs | `scene-system/packs/` | Pack definitions |
| Catalog | `scene-system/catalog/scenes.json` | **198 scenes** across 24 packs, indexed with schema |
| Builder | `scene-system/build.py` | 175 lines, catalog build script |
| Engine doc | `scene-system/ENGINE.md` | System documentation |

Each scene in the catalog has: pack source, renderer function, meaning (primary/secondary concepts), narrative functions, visual layout, background, primitives, operators, timing (default/min/max/loopable), reuse constraints (good_for/avoid_for).

---

## 4. Visual Director (`scripts/visual-director.py` — 297 lines)

Essay → scene manifest parser with 9 rhetorical functions:

| Function | Purpose |
|----------|---------|
| hook | Opening attention-grabber |
| establish | Set context |
| define | Define terms |
| analogy | Make comparisons |
| quotation | Display quotes |
| chain | Build argument sequence |
| climax | Build to peak |
| closing | Wrap up |

Takes an essay transcript text, returns a scene manifest mapping rhetorical beats to visual templates.

---

## 5. Manim Port Scenes

| File | Description |
|------|-------------|
| `scripts/manim_port_scenes.py` (206 lines) | Manim scene definitions: SpandaHook, TetrahedronBuild, TimelineFour, NestedTetrahedra, QuickK4, PhonemeGrid, RotatingTetrahedron, TriangleToTetrahedron |
| `content/publishing/manim/media/videos/` | Manim render outputs (480p/1080p/2160p partial movie files) |

---

## 6. Visionary Renderer (`visionary-renderer/`)

Three.js/Skia GPU renderer. Architecture (153-line ARCHITECTURE.md):

```
Passages → Claim graph → Tradition ontology → Semantic scene
  → Visual Director (spatial, camera, composition, lighting, material, continuity)
  → Render Router (Skia 2D, Three.js 3D, shader/WebGPU, artwork, video)
  → Frames → FFmpeg → Documentary
```

**Gates completed:**
| Gate | Test | Status |
|------|------|--------|
| A | Devanāgarī shaping (8 samples) | ✅ PASS |
| B | SVG layer extraction (7 layers, pixel-perfect) | ✅ PASS |
| C | Deterministic timeline (300 frames, SHA-256) | ✅ PASS |
| Spike | 20s Spanda render (bindu+SVG+Sanskrit+art+subtitle+camera+FFmpeg) | ✅ DONE |

**Location:** `/root/projects/blog/visionary-renderer/`
**Scripts:** `capture-spanda.mjs`, `capture-three.mjs`, `render-three-spanda.mjs`, `three-spanda.html`
**Test scenes:** gate-a, gate-b, gate-c, spanda-spike (various SVG/layer composites)

---

## 7. MP4 Files — Complete Inventory

**331 MP4 files, 305 MB total.**

### 7.1 Gold Standard Exemplars (reference videos)

| Video | Size | Duration | Shots | Avg Shot | BPM | Path |
|-------|------|----------|-------|----------|-----|------|
| Anandamayi Ma | 59 MB | 20:02 | 139 | 8.6s | 152 | `exemplars/gold-standards/` |
| Nisargadatta | 50 MB | 19:45 | 75 | 15.8s | 123 | `exemplars/gold-standards/` |
| Jesus Himalayas | 49 MB | 24:40 | 92 | 16.1s | 99 | `exemplars/gold-standards/` |
| Alan Watts | 25 MB | 12:26 | 105 | 7.1s | 112 | `exemplars/gold-standards/` |
| Academy of Ideas x2 | 37 MB, 25 MB | — | — | — | — | `exemplars/academy-of-ideas/video/` |

### 7.2 Animation Reference Packs

| Pack | Size | Location |
|------|------|----------|
| shiva_sutras_pack | 6.3 MB | `video-templates/animation-references/shiva_sutras_pack/` |
| essay05_pain_is_juice | 4.7 MB | `video-templates/animation-references/essay05_.../` |
| essay23_dante_journey | 3.1 MB | `video-templates/animation-references/essay23_.../` |
| dream_output_pack | 3.0 MB | `video-templates/animation-references/dream_.../` |
| pratyabhijnahrdayam_20_sutras | 2.6 MB | `video-templates/animation-references/pratyabhijnahrdayam_.../` |
| recognition_output_pack | 2.3 MB | `video-templates/animation-references/recognition_.../` |
| essay12_world_between_worlds | 1.7 MB | `video-templates/animation-references/essay12_.../` |
| essay13_secret_life_of_matter | 1.4 MB | `video-templates/animation-references/essay13_.../` |
| mantra_output_pack | 1.2 MB | `video-templates/animation-references/mantra_.../` |
| plotinus_output_pack | 792 KB | `video-templates/animation-references/plotinus_.../` |
| essay20_everything_is_empty | 564 KB | `video-templates/animation-references/essay20_.../` |
| theurgy_output_pack | 351 KB | `video-templates/animation-references/theurgy_.../` |
| tantraloka-batch (8 topics) | ref/abhasa/malas/pure_tattvas/five_acts/shaktipata/speech/sixfold_path/upayas/twelve_kalis — 241-321 KB each | `video-templates/animation-references/tantraloka-batch/` |

### 7.3 Manim Render Outputs

| Scene | Resolutions | Clip Count | Location |
|-------|-------------|------------|----------|
| NoEscape | 1080p60 | 59 | `media/videos/tight_escape/1080p60/partial_movie_files/NoEscape/` |
| PhonemeGrid | 480p15 | 30 | `content/publishing/manim/media/videos/distillery_scenes/480p15/` |
| NestedTetrahedra | 480p15 | 22 | Same |
| QuickK4 | 1080p60 | 19 + 21 | `media/videos/test_k4/` + `content/publishing/manim/...` |
| TetrahedronBuild | 2160p60 + 480p15 | 13 + 13 | `media/videos/distillery_scenes/` |
| TimelineFour | 1080p60 | 12 | `media/videos/distillery_scenes/1080p60/` |
| TriangleToTetrahedron | 1080p60 | 8 | Same |
| SpandaHook | 1080p60 + 2160p60 | 4 + 2 | `media/videos/manim_port_scenes/` |
| K4Build | 480p15 | 15 | `content/publishing/manim/.../distillery_style/` |
| RotatingTetrahedron | 480p15 | 4 | Same |

### 7.4 Dashboard & Demo

| File | Size |
|------|------|
| `dashboard/static/manim-tri.mp4` | 224 KB |
| `dashboard/static/manim-timeline.mp4` | — |
| `dashboard/static/manim-tetra.mp4` | — |
| `dashboard/static/manim-quickk4.mp4` | — |
| `public/lab/liminal-demo.mp4` | 5.2 MB |
| `public/lab/zoom-test.mp4` | — |
| `public/lab/liminal-fludd-test.mp4` | — |
| `public/videos/test-short.mp4` | — |

### 7.5 Visionary Renderer Outputs

- `visionary-renderer/renders/spanda-spike/spanda-20s-spike.mp4` (2.1 KB, 20s spike)
- `visionary-renderer/renders/scene-unknown/scene.mp4` (147 KB)

---

## 8. Visual Language Architecture (`operations/visuallanguage.md` — 752 lines)

Core design: **semantic compiler** — transcript → rhetorical beats → visual verbs → constrained JSON → Motion Canvas scene.

**Central decision:** Agent outputs validated JSON, not arbitrary TSX:
```json
{
  "operator": "resonate",
  "source": "mantraGlyph",
  "target": "pulseField",
  "intensity": 0.55,
  "durationEvent": "mantra-is-pulse"
}
```

**Pipeline:** Transcript → Rhetorical parser (claim/analogy/quotation/practice) → Semantic visual planner (verbs, entities, continuity) → Visual Program IR (constrained JSON, schema-validated) → Scene compiler → Preview + visual critic → Scene renders (6-10 per 10min) → FableCut.

**10 Rhetorical Functions:** hook, definition, mechanism, analogy, quotation, example, practice, synthesis, climax, transition.

**8 Visual Operators:** reveal, oscillate, align, mirror, radiate, descend, ascend, dissolve.

---

## 9. Cloudflare R2 Storage

### Credentials

| Field | Value |
|-------|-------|
| Account ID | `954612afb5a97bb15dddcdc70176813d` |
| S3 Endpoint | `https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com` |
| Access Key ID | `<redacted>` |
| Secret Access Key | `<redacted>` |
| API Token | `<redacted>` (⚠ may be expired) |
| DNS Token | `<redacted — revoke and regenerate>` |

### Known Buckets

| Bucket | Contents | Est. Size |
|--------|----------|-----------|
| `research-datasets` | YouNiverse (3.2 GB), ytcommentverse (10.1 GB), global-trending (26.4 GB), google-trends (25 MB), sanskrit-gretil (382 MB), hindi-transcripts (13 GB), youtube-trending-kaggle (337 MB), sanskrit-text-corpus (138 MB), youtube-hindi-subtitles (1.5 GB) + blueprint/ (upworthy, met-openaccess, sarit, clickstream, stackexchange, muktabodha, gretil, samanantar, iitb, sans-en-vocab, bpcc-sanskrit, indiccorp) | ~55 GB |
| `sacred-art` | WikiArt (15,299), CYTKv1 (1,778), CIRThan, HAB Alchemy (901/1,057), ArtDL (~16K extracted), blog gallery (~135 images) | Not quantified |
| `tantrafiles` | Unknown (likely production assets) | — |

### IAM Status

S3 credentials: `head_bucket` works (confirms bucket existence) but `ListBuckets`/`ListObjects` denied. API token returns "Invalid" — may have been rotated. To use:

```bash
export AWS_ACCESS_KEY_ID="<redacted>"
export AWS_SECRET_ACCESS_KEY="<redacted>"
export S3_ENDPOINT="https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"
# Test head bucket:
python3 -c "import boto3; c=boto3.client('s3',endpoint_url='$S3_ENDPOINT',aws_access_key_id='$AWS_ACCESS_KEY_ID',aws_secret_access_key='$AWS_SECRET_ACCESS_KEY'); print(c.head_bucket(Bucket='research-datasets')['ResponseMetadata']['HTTPStatusCode'])"
```

Full dataset reference: `pipelines/r2-dataset-reference.md` (562 lines) — schemas, access methods, limitations for all datasets.

---

## 10. Key Architecture Documents

| Document | Lines | What It Covers |
|----------|-------|----------------|
| `TO_ARCHITECT.md` | 112 | Architecture advice request: constraining LLM visual output, HITL feedback, pipeline gap |
| `operations/visuallanguage.md` | 752 | Full Visionary Engine spec: rhetorical parser, visual planner, JSON IR, scene compiler |
| `visionary-renderer/ARCHITECTURE.md` | 153 | Visionary Renderer: Skia/Three.js/WebGPU pipeline, 4 completed gates |
| `scene-system/ENGINE.md` | — | Scene system formal model (concepts, templates, primitives) |
| `scene-system/catalog/scenes.json` | 4,349 | 198 indexed scenes across 24 packs |
| `cloudflaredashboard.md` | 590 | Dashboard infra, tunnel, FableCut integration, Hermes, Tor |
| `cloudflare-infra.md` | 167 | Workers AI, D1, R2, Vectorize deployment |
| `pipelines/r2-dataset-reference.md` | 562 | All R2 datasets with schema and access |
| `FABLECUT_DOCS.md` | 522 | FableCut API, MCP tools, recipe library |

---

## 11. TO_ARCHITECT.md — Open Questions

The `TO_ARCHITECT.md` file poses 3 major open problems:

1. **Visual Language Guarantee** — How to constrain LLM scene generation so output is guaranteed good (not random). Proposed: scene type grammar (rhetorical function → visual recipe), pre-approved templates, compositional constraint system, RAG from 198-scene catalog.

2. **HITL Quality Validation** — Moving from "user says thing, I hand-edit" to "user says thing → system infers parameter change → re-renders → confirms". Needs: feedback decomposition, parameter inference matrix, regression prevention, confidence accumulation.

3. **Pipeline Gap** — Current: essay → hand-written scenes → PIL → FableCut. Desired: essay → LLM scene manifest → parameter selection → auto-render → auto-feedback → iterate. Missing piece: LLM has no guidance on what scene functions look like.

---

## 12. Resource Constraints

| Resource | Limit |
|----------|-------|
| RAM | 4 GB (shared across all services) |
| CPU | 2 cores |
| Disk (root) | 75 GB — 54 GB used (76%) |
| Disk (volume) | 30 GB — 22 GB used (73%) |
| YouTube API | 10k units/day + 100 searches/day |
| No parallel render builds, no heavy inference |
