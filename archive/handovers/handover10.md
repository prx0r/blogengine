# Handover 10 — July 20 2026

## Session Summary
LTX video generation experiments concluded. Pivot to still images + FFmpeg pipeline for video production. CLIP-based thumbnail matcher built and trained with 56 user assignments. Cloudflare AI vision pipeline identified but needs license acceptance.

---

## 1. LTX Video Generation — Status: ABANDONED

### What was tried
- **Doorways (POV meditation anchor):** 10+ renders across 7 locations (forest, ocean cliff, mountain, bamboo, desert, lake, temple). All failed to produce reliable POV — LTX defaulted to third-person "man sitting" shots.
- **Worlds (liminal environments):** Candle flame, stone chamber, reflection pool, corridor of light, Sufi courtyard, Himalayan valley, Greek colonnade, starry lake, floating meadow. All came out as generic stock footage, not dreamlike.
- **Successful render (1 clip):** Clip `00006_` (job `ebbcca69`) produced a usable POV shot. Prompt format used: "First-person POV. You are seated cross-legged..." with "your hands rest on your knees - no rings, no polish, relaxed fingers."
- **Key failure modes:**
  - Third-person rendering despite explicit POV language
  - "The camera is the eyes" framing made LTX render a camera, not the eyes
  - "No character visible" was ignored
  - Adding "camera" language to world prompts caused POV rendering of environments
  - Hyper-real prompts produced generic stock footage, not dreamlike/mythic atmospheres
  - Anime/Ghibli style prompts were ignored (LTX can't do stylized animation)

### Lessons learned
- LTX excels at emergent magical elements in rich environments (the 9/10 dolphin clip)
- LTX fails at: consistent POV, stylized/non-realistic aesthetics, specific character framing
- Doorways work better filmed IRL with a phone
- Still images + Ken Burns (slow zoom/fade) + ambient audio is more reliable and atmospheric
- Alchemical emblems + img2vid for subtle animation could work but image input format was problematic

### Prompts archive
All doorway prompts in `content/video-objects/doorway-prompts.md`
World prompts in `content/video-objects/liminal-worlds-vision.md`
GPU queue spec in `content/video-objects/gpu-production-queue.md` (old stop-motion style)

---

## 2. Visual System Design — COMPLETE

### The four-style system
| Element | Style | Use Case |
|---------|-------|----------|
| EARTH | Alchemical toy / storybook | Grounding, growth, tradition |
| WATER | Flow / process | Causation, cycles, depth |
| AIR | Liminal dream | Between-states, mystery, transcendence |
| FIRE | Sharp imaginal | Revelation, illumination, beings of light |

### The 12 core concepts
Star field, corridor of light, stone chamber, reflection pool, mist over water, candle flame, match striking, deep ocean, cave opening, mountain ridge, forest floor, clouds from above.

### The 3 dream temples (highest priority)
1. Stone chamber — single light beam, dust particles, rough stone
2. Corridor of light — infinite recession, warm glow, stone floor joints
3. Reflection pool — dark water, single ripple, momentary gold reflection

Full spec in `content/video-objects/liminal-worlds-vision.md`

---

## 3. Thumbnail Matching Pipeline — OPERATIONAL

### CLIP-based image matcher
- **Model:** OpenAI CLIP ViT-B/32 running on CPU
- **Image library:** 346 alchemical emblems indexed from `content/sources/occult/alchemy/images/all-with-metadata/`
- **Essay titles:** 56 expansion essay titles
- **Matching:** Cosine similarity between CLIP embeddings of titles and images

### User assignments (56/56 complete)
- 55 manually assigned via webapp at `passenger-literary-alignment-enable.trycloudflare.com/thumbnails/assigner.html`
- 1 auto-assigned by AI for the remaining unassigned essay
- Assignments stored at: `https://5ff2dddc.ochema-ltx.pages.dev/assignments.json`
- Mapping preserved in `/tmp/assignment_map.json`

### How it works
1. Each alchemical emblem image gets a CLIP embedding
2. Each essay title gets a CLIP text embedding
3. Cosine similarity scores are computed
4. User's manual picks get +1.0 boost, visually similar images get +0.3
5. Top 5 recommendations per essay stored in `/tmp/thumbnail_recs.json`

### Auto-assignment logic
For unassigned essays, the top CLIP recommendation is used. The filename (e.g., `A204.jpg`) maps to art_id (e.g., `art_alchemy_e204`) by extracting the number.

---

## 4. Cloudflare AI Vision Pipeline — PENDING LICENSE ACCEPTANCE

### What's wired up
- **Account ID:** `<account-id-from-cloudflare-dashboard>`
- **API Token:** `<cf-api-token-from-cloudflare-dashboard>`
- **Vectorize binding:** `ATLAS_VECTORIZE` (index: `atlas-global`)
- **Wrangler config:** Vectorize already configured in `wrangler.jsonc` and `wrangler.toml`

### What needs to happen
1. Accept Llama 3.2 11B Vision license in Cloudflare Dashboard:
   - Go to `https://dash.cloudflare.com/` → Workers & Pages → AI
   - Find "Llama 3.2 11B Vision" → Accept License
2. Once accepted, the vision model can generate descriptions for all 346 emblems
3. Descriptions can be embedded and stored in Vectorize for similarity search
4. This replaces the local CLIP pipeline with a proper cloud-based solution

### Models available after license acceptance
- `@cf/meta/llama-3.2-11b-vision-instruct` — image analysis + description generation
- `@cf/baai/bge-base-en-v1.5` — text embeddings (already free, no license needed)
- `@cf/llava-hf/llava-1.5-7b-hf` — backup vision model (image format needs debugging)

---

## 5. Key Files Created/Modified

| File | Content |
|------|---------|
| `SESSION-NOTES.md` | Full session log |
| `user-style.md` | Title voice guide (lowercase, punchy, "you"-address) |
| `TTS-STYLE.md` | Audio prose guide (em-dashes, breath pauses, flow) |
| `alchemy-decoded.md` | 50 decoded alchemical texts (hook → passage → decode → takeaway) |
| `liminal-worlds-vision.md` | Visual system design (12 spaces, 4 styles, 3 dream temples) |
| `doorway-prompts.md` | 10 POV doorway prompts for LTX |
| `liminal-worlds-vision.md` | Updated with 4-style system, LTX prompts, essay mappings |

### Temp files (on this machine)
| File | Content |
|------|---------|
| `/tmp/assignment_map.json` | User's 51 mapped assignments (title → filename) |
| `/tmp/thumbnail_matches.json` | Raw CLIP similarity scores for all 56 essays |
| `/tmp/thumbnail_recs.json` | Top 5 AI recommendations per essay |
| `/tmp/final_assignments.json` | Complete 56-assignment set (55 user + 1 AI) |
| `/tmp/submit_ltx.py` | LTX job submission script |
| `/tmp/clipenv/` | Python venv with CLIP installed |

### Vast.ai instance (45357545)
| Detail | Value |
|--------|-------|
| SSH | `ssh -p 35224 root@198.53.64.194` |
| GPU | RTX 5090 (32GB VRAM) |
| ComfyUI | Port 18188 (internal) |
| API Wrapper | Port 18288 (internal) |
| Output | `/workspace/ComfyUI/output/video/` |
| Workflow template | `/opt/comfyui-api-wrapper/payloads/video_ltx2_3_t2v.json` |
| Submit script | `/tmp/submit_ltx.py` |

---

## 6. Next Steps

### Immediate
1. Accept Cloudflare Llama 3.2 Vision license in dashboard (30s)
2. Then run Cloudflare vision pipeline to generate descriptions for all 346 emblems
3. Feed descriptions + user assignments → retrain thumbnail matcher with AI-generated content tags

### Short-term
4. Produce alchemy shorts using still images + FFmpeg pipeline (no LTX)
5. Film doorway videos IRL (phone, POV, meditation posture, different locations)
6. Build image selection pipeline: for each essay, auto-select top 3-5 thumbnail candidates
7. Generate essay videos: narration + ambient audio + Ken Burns on selected emblems + subtitles

### Longer-term
8. Image-to-video for alchemical emblems via LTX (once image input format is solved)
9. Cloudflare Vectorize for semantic image search
10. Full automated pipeline: essay text → CLIP query → image selection → FFmpeg render
