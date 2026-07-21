# Ochema — Complete Project Handover

## Current State
- **Vast.ai instance:** RTX 5090, ~$0.25/hr, running
- **ComfyUI:** `http://198.53.64.194:35076/` (login: `vastai` / token in build-notes)
- **API Wrapper:** `http://198.53.64.194:35219/`
- **Cloudflare Pages:** `https://ochema-ltx.pages.dev/app.html` (prompt catalog + submit)
- **Queue:** Currently cleared. 4 doorway clips rendering.

---

## All Files — Organized by Purpose

### 📋 Strategy & Research (read first)
| File | What it is |
|------|------------|
| `north-star.md` | The final concept: POV Seeker, white space, doorways, daimon as light orb, worlds |
| `ltx-prompt-guide.md` | Lessons learned from every clip reviewed. What LTX does well/badly |
| `ltx23-official-guide.md` | Official LTX-2.3 prompting guide. Be hyper-literal. State everything |
| `prompt-lesson.md` | Summary: describe sequences, not scenes. Use verbs, not adjectives |
| `clip-feedback.md` | Every clip rating + notes. 9/10 for dolphin ambient world |
| `writing-quality-review.md` | Review of storyboard hooks against gold standard videos |

### 🚪 Doorways (POV entry points to imaginal realm)
| File | What it is |
|------|------------|
| `doorway-ideas.md` | 25 doorway concepts (meditate, candle, sleep, fire, cat, rain, etc.) |
| Current queue | DOOR_CANDLE, DOOR_SLEEP, DOOR_CAT, DOOR_LIGHTSOFF |

### 🌍 Worlds (experimental textures)
| File | What it is |
|------|------------|
| `visual-vocabulary.md` | 15 core visual operations (emanation, contraction, pulse, etc.) |
| `50-clip-bank.md` | 184 prompts for abstract concepts, seeker poses, yogi stories |
| `concept-explainers.md` | How to visually explain each philosophical concept |
| `gpu-production-queue.md` | 44 ready-to-paste prompts in batch order |
| `variant-generation-sheet.md` | 3 variants per visual for comparison |
| `seed-images/` | Museum art organized by world (Kashmir, Sufi, Neoplatonic, etc.) |

### 📖 Scripts & Storyboards
| File | What it is |
|------|------------|
| `20-minute-formula.md` | Standard video structure (12 segments, 6-9 LTX clips) |
| `all-video-outlines.md` | 19 video outlines (fundamentals, deep dives, comparative) |
| `storyboard-rasa.md` | Complete Rasa script — gold standard format |
| `storyboard-*.md` (18 more) | 36 Tattvas, Spanda, Pratyabhijna, Kundalini, Maya, etc. |
| `video-hooks-comparison.md` | Titles + hooks for all 26 videos, mapped to proven winners |

### ⚙️ Pipeline & Infrastructure
| File | What it is |
|------|------------|
| `build-notes.md` | Technical setup: SSH, auth, API endpoints, render times |
| `api-ltx-comfy.md` | ComfyUI API wrapper reference |
| `prompts-catalog.json` | 184 prompts machine-readable |
| `prompts-catalog.html` | Browse + search prompts in browser |
| `prompt-pipeline.md` | Feedback loop: generate → review → analyze → refine |
| `review.html` | Web-based clip rating tool (Y/T/N + notes) |
| `schemas/video-object-pipeline.md` | Full video-object pipeline docs |

### 💾 Batch Scripts (on vast instance at /tmp/)
| Script | What it does |
|--------|-------------|
| `batch_seeker.py` | 8 Seeker world variants |
| `batch_seeker_styles.py` | 6 style texture tests (Coraline, del Toro, Laika, etc.) |
| `batch_white_world.py` | White World opening + 6 world transitions |
| `batch_submit_all.py` | Submits all 184 prompts at once |
| `submit_rich.py` | Single prompt with high detail |

### 📦 Reference Content
| Path | What it is |
|------|------------|
| `top-performers/` | Analysis of successful YouTube videos in our space |
| `reference-scripts/` | Transcripts + analysis of Igor Kufayev, Mahaffey lectures |
| `yogi-spotlight/` | Research on Khaptad Baba, Matsyendranath, Vidyarnya Swami |
| `research/hareesh-blog/` | 149 Hareesh blog posts by topic — primary script source |
| `research/hareesh-blog/by-topic/` | Tantraloka, Spanda, VBT, Pratyabhijna, etc. |

---

## Key Decisions (do not override)
1. **POV only.** No third-person. No character to render badly.
2. **First-person human.** Photorealistic hands, legs, bench, book. LTX does humans well.
3. **Hyper-literal prompts.** State every single thing. Implication doesn't exist.
4. **Doorways first.** Meditate, candle, sleep, fire, cat, rain — simple cozy moments.
5. **Worlds second.** Pure atmosphere, no characters. Experimental textures.
6. **2 clips at a time.** Small batches. Review before submitting more.
7. **Daimon = pure light.** No figure. Orb or glow only.
8. **The White World** is the imaginal realm. Cream void between worlds.

---

## Common Commands
```bash
# SSH into vast
ssh -i ~/.ssh/id_ed25519 -p 35915 root@ssh1.vast.ai

# Submit a batch
python3 /tmp/batch_seeker.py

# Clear queue (restart services)
supervisorctl restart api-wrapper comfyui

# Check queue
curl http://localhost:18288/queue-info

# View in ComfyUI
# Browser: http://198.53.64.194:35076/
# Login: vastai / [token in build-notes.md]

# Deploy webapp
cd /root/projects/ltx-style-lab/web && npx wrangler pages deploy public --project-name=ochema-ltx
```
