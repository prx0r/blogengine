# Fresh Agent Onboarding — Ochema Video Pipeline

## Project Location
We are in the **blog project** at `/root/projects/blog` on branch `agent/video-object-pipeline`.

The repo is `github.com/prx0r/blogengine.git`. The LTX webapp is at `/root/projects/ltx-style-lab/`. The vast.ai instance communicates via SSH.

## How to Navigate Everything

### Finding what you need:

| If you need... | Go to... |
|----------------|----------|
| **The current state of everything** | `content/video-objects/COMPLETE_HANDOVER.md` |
| **How to prompt LTX** | `content/video-objects/ltx-prompt-guide.md` + `content/video-objects/ltx23-official-guide.md` |
| **The project strategy & concept** | `content/video-objects/north-star.md` |
| **Technical setup (SSH, API, auth)** | `content/video-objects/build-notes.md` |
| **What clips have been generated & ratings** | `content/video-objects/clip-feedback.md` |
| **Full video scripts** | `content/video-objects/storyboard-*.md` (19 files) |
| **All 184 prompts** | `content/video-objects/prompts-catalog.json` |
| **The Hareesh blog (script source)** | `content/research/hareesh-blog/by-topic/` |
| **What worlds we're exploring** | `content/video-objects/doorway-ideas.md` |
| **What other channels did that worked** | `content/video-objects/top-performers/` |
| **The LTX webapp** | `/root/projects/ltx-style-lab/` |
| **Batch scripts for generating** | `/tmp/batch_*.py` on vast.ai instance |

### Project hierarchy:
```
blog project (root)          ← scripts, storyboards, research, prompts
  content/video-objects/     ← ALL video production files
  content/research/          ← Hareesh blog, seed images
  content/research-objects/  ← 171 research objects
  scripts/                   ← video pipeline tools

ltx-style-lab/               ← LTX webapp + worker
  web/                       ← Next.js frontend (deployed to Cloudflare Pages)
  worker/                    ← FastAPI backend
  scripts/                   ← batch submission

vast.ai instance             ← GPU rendering
  /tmp/batch_*.py            ← batch submission scripts
  ComfyUI at :35076          ← view/download results
```

### The Golden Rule:
When in doubt, start at `content/video-objects/COMPLETE_HANDOVER.md` — every file is listed by category with descriptions. Then check `clip-feedback.md` for what's been tried and what worked.

---

## The Project Goal
Create animated philosophical videos about Kashmir Shaivism / Tantraloka using LTX-2.3 AI video generation. Channel name: Ochema ("vehicle of the soul" in Greek). Core focus: become THE English channel for Tantraloka (zero competition confirmed by market research).

---

## THE KEY DISCOVERY: How to Prompt LTX-2.3

### Rule 1: Hyper-Literal Only
LTX does NOT infer anything. If it's not explicitly stated, it won't happen. Write like you're describing every single detail to someone who has never seen anything before.

Bad (vague mood):
```
"A contemplative atmosphere with warm lighting"
```

Good (every detail stated):
```
"I am looking down at my own hands resting on my knees. I am sitting cross-legged on a brown meditation cushion on a wooden floor. Soft warm golden light comes from a window on my left. The light falls across my hands and knees. I am not moving. My chest rises and falls slowly with each breath. The light gradually becomes warmer and softer. My vision slowly blurs and fades to black as if my eyes are closing. The warm light shrinks to a single point, then darkness."
```

### Rule 2: First-Person POV Always
Every clip is from the perspective of "I" / "me" / "my." You are the Seeker. Write as if describing what YOU see through YOUR eyes.

Start every prompt with "I am" or "I see":
- "I am floating forward through a dark forest..."
- "I am looking down at my hands on a wooden bench..."
- "I am sitting cross-legged on a meditation cushion..."

### Rule 3: Describe a Sequence, Not a Scene
Every prompt must describe something CHANGING over time. Not a still image. Use verbs that show progression:
- "The light gradually grows brighter"
- "My vision slowly blurs and fades"
- "I drift forward between the trees"
- "The fog parts around each trunk as I approach"

### Rule 4: Be Specific About Textures, Materials, Lighting
LTX-2.3 can handle detail. Give it:
- Specific materials: "weathered stone," "warm amber light," "rough wooden bench"
- Lighting direction: "warm golden window light from my left"
- Camera: "I slowly turn my head from left to right"
- Duration: 10-15 seconds per clip

### Rule 5: What LTX Does Well vs Badly

| Does Well | Does Badly |
|-----------|------------|
| Atmospheric environments (mist, fog, water, fire) | Consistent characters (Seeker will look different every time) |
| Lighting shifts (sunrise, sunset, candle flame) | Walking figures (legs merge, body deforms) |
| Ambient audio (water, fire, wind) | Face close-ups |
| Simple forms (trees, columns, crystals) | Multiple figures interacting |
| Floating/drifting camera motion | Complex hand gestures |
| Color and texture (stone, wood, water, crystal) | Any character needing to appear consistent across clips |
| Landscapes, interiors, abstract spaces | Text or readable signs on screen |

### Rule 6: The Solution — POV + Photoreal Humans + Pure World Backgrounds
Since LTX can't do consistent characters, split the work:
- **World backgrounds:** Generate using LTX (no characters, just environments)
- **The Seeker:** Never generated at all. Use POV (first-person, viewer IS the Seeker).
- **Doorways:** POV photorealistic human moments (hands, lap, book, candle, cat)
- **Worlds:** Pure environments, no characters — POV floating through

---

## The Two Track System

### Track 1: DOORWAYS (entry points to the imaginal realm)
POV photorealistic human moments. Cozy, relatable, universal.

Each doorway is: a human sitting in a comfortable place, doing a simple relatable thing, then a slow transition to blankness (fade to black, fade to white, blur to color).

Doorway types confirmed good:
- Sitting to meditate (look at hands on knees, eyes close → black)
- Staring into a candle flame (flame grows → white light fills everything)
- Lying in bed, turning off lamp (afterimage fades → darkness)
- Cat on lap (stroking cat, warm lamp light → blurs to golden glow)
- Sitting by a fire (flames, warm glow → trance → white)
- Looking at rain on a window (rain blurs → diffuse grey)
- Reading a book in armchair (look up from page → soft blur)

### Track 2: WORLDS (the imaginal realms)
Pure experimental environments. POV floating/drifting through. No characters, no figures. Just atmosphere, light, color, motion.

World types to explore (20 queued):
- Dark/eerie: dark forest, abandoned cathedral, graveyard, lava cave
- Light/cheerful: flower field, city rooftop, autumn forest, crystal grotto
- Fantasy/magical: spirit world, Ghibli valley, floating islands, cloud city
- Abstract: cubist landscape, ink water, neon rain city, starry void
- Natural: underwater reef, desert temple, infinite library, crystal nexus

---

## The North Star Structure (Every Video)

```
[DOORWAY] — POV human moment. Cozy room. Relatable action.
  → Transition to blankness (black/white/blur)
  → 
[WORLD] — POV floating through an imaginal realm. Pure atmosphere.
  → Voiceover teaches the philosophical concept
  →
[CUT BACK TO DOORWAY] — Brief return to the POV human moment
  → Then into next world section
```

The white void (imaginal realm) sits BETWEEN doorways and worlds. The transition itself is a teaching — you are entering the space between.

---

## Research Content We're Bringing to Life

### Primary Source (read first):
- Hareesh blog: `/root/projects/blog/content/research/hareesh-blog/by-topic/` — 149 posts across 21 categories (Tantraloka, Spanda, Pratyabhijna, Rasa, Kundalini, etc.)
- These are the script sources. Each video is based on one or more Hareesh posts.

### 19 Completed Storyboards (in `content/video-objects/storyboard-*.md`):
Each is a full 12-segment script with narration, visual references, and timing:
1. Rasa — transformation of emotion into beauty (most complete)
2. 36 Tattvas — the architecture of experience
3. Spanda — the divine vibration
4. Pratyabhijna — the recognition philosophy
5. Three Upayas — three paths to liberation
6. Maya — what it actually means
7. Kundalini — what the Tantras actually say
8. Shaktipata — the descent of grace
9. Abhinavagupta — the man who synthesized Tantra
10. Trika — three goddesses, one reality
11. 50 Phonemes — sacred sound and creation
12. Twelve Kalis — time as goddess
13. Kashmir Shaivism × Neoplatonism
14. Kashmir Shaivism × Sufi — unity of being
15. Kashmir Shaivism × Daimon — the guide
16. Abhinavagupta — a day in the life
17. Lakshmanjoo — the last living master
18. Lalleshwari — the poet of Kashmir
19. The Yoginis — secrets of the Tantric goddesses

### Gold Targets (reference videos that prove the format works):
- Ibn Arabi "You Are Not Who You Think" (200k views) — `top-performers/sufi-illuminationist/ibn-arabi-you-are-not-who-you-think.md`
- Igor Kufayev "FLOW — Kashmir Shaivism & the 36 Tattvas" (40k views) — `top-performers/reference-scripts/igor-kufayev-36-tattvas.md`
- Library of Tehuti "Goddess Hiding in Your Spine" (220k views) — proven title pattern
- Dr. Mahaffey PRS Lecture — `top-performers/reference-scripts/shavisimlecture1.md`

### 184 Prompt Catalog:
`content/video-objects/prompts-catalog.json` — organized by category with style prefix, duration, and tags.

---

## Current Technical State

### Running Status
- **Vast.ai instance:** WAS running but SSH connection refused — may need restart
- **Instance ID:** 45315914
- **GPU:** RTX 5090 (32GB VRAM), ~$0.25/hr
- **ComfyUI:** `http://198.53.64.194:35076/` (login: `vastai` / pass in build-notes.md)
- **20 world clips were queued** before SSH died — may have completed or may need re-queueing

### If Instance Is Down:
1. Go to vast.ai dashboard, restart instance 45315914
2. SSH: `ssh -i ~/.ssh/id_ed25519 -p 35915 root@ssh1.vast.ai`
3. Check services: `supervisorctl status`
4. If API wrapper not running: `supervisorctl restart api-wrapper`
5. If queue empty, re-submit worlds with: `python3 /tmp/batch_20_worlds.py`

### Key Files on Blog Server:
- `content/video-objects/build-notes.md` — technical setup, auth, API details
- `content/video-objects/ltx-prompt-guide.md` — what works and what doesn't
- `content/video-objects/ltx23-official-guide.md` — official LTX prompting guide
- `content/video-objects/north-star.md` — the final concept
- `content/video-objects/clip-feedback.md` — all clip ratings
- `content/video-objects/COMPLETE_HANDOVER.md` — comprehensive file index

### Batch Scripts (on vast instance at /tmp/):
- `batch_20_worlds.py` — 20 experimental world textures
- `batch_seeker.py` — Seeker world variants (old approach)
- `batch_white_world.py` — White World transitions (old concept)

---

## Prompt Template (Copy This)

```
I am [doing a specific action] in/at [specific location]. 
In front of me / below me / around me, [describe exactly what is visible].
[Describe light source and direction].
[Describe what happens over time — the change, the sequence].
The [color/light/mist/etc] gradually [changes].
Finally, [the endpoint — fade to black, fill with white, etc].
Silence, no audio, complete quiet.
```

### Example (copy-paste ready):
```
"I am sitting cross-legged on a wooden floor, looking down at my own hands resting on my knees. A warm golden light comes from a window on my left. The light falls across my hands and knees. A small brown meditation cushion beneath me. I breathe slowly, my chest rising and falling. My vision gradually softens and blurs, the warm light spreading wider. The light becomes warmer and softer until everything fades to a gentle warm black. Silence, no audio, complete quiet."
```

---

## First Tasks for Fresh Agent
1. Check if vast instance is running (test SSH + ComfyUI)
2. If queue is empty, submit a batch of 2-3 worlds using the template above
3. Check completed clips in ComfyUI History tab
4. Let the user review and give feedback
5. Based on feedback, refine prompts and submit more
