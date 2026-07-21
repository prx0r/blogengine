# session notes — july 20 2026 (complete)

---

## 1. expansion essays — NEG removal + restructure

**56 essays** in `/root/projects/blog/scripts/expansion-essay[1-51].md` and `/root/projects/blog/expansion-essay[52-56].md`

### NEG patterns fixed (~380 edits)
- Compiled 30 techniques for replacing NEG (Negat-Assert-Itis): positive parallelism, personal witness, gradient description, em-dash pivot
- Studied Angela Voss (parallel characterization) and Corbin (personal witness) as reference
- Created `TTS-STYLE.md` — guide for audio-flowing prose

### Quote-carries-argument restructure
- Pulled inline quotes into blockquotes
- Cut commentary that restated quotes
- Replaced explanatory framing with invitational framing

### Titles — 3 iterations
- Final style: lowercase, short, "you"-address, quirky ("pain is juice"), sometimes reversed ("the path chose you")
- User confirmed specific picks for essays 1-10, rest follow the style
- Documented in `user-style.md`

---

## 2. alchemy shorts — 50 texts decoded

File: `alchemy-decoded.md` (641 lines, 50 entries)

### Format (developed over 3 iterations)
1. **Hook** — oversold, clickbait, insane claim
2. **Passage** — the poem/text in blockquotes
3. **Decode** — what it means in Tantraloka/tetrahedron/consciousness terms
4. **Takeaway** — loops back to the hook

### Key learnings
- No "this = tattva" direct equations (user rejected as false)
- No untranslated Sanskrit
- Conversational language, not academic
- The short loops — ending references the beginning
- Best hook style: short, specific, insane ("the world ends not by judgment but by improved sex")

### Worst hooks fixed (entries 23, 24, 25, 27, 30, 35, 42, 48)
- Removed Sanskrit stacking
- Added loop-back endings
- Made conversational

### Still needs fixing (~20 entries with old equation style)
Entries 22, 26, 28, 29, 31-34, 36-41, 43-47, 49-50 still have "X = Y" decode format

---

## 3. visual system — liminal worlds

File: `content/video-objects/liminal-worlds-vision.md`

### The 9/10 dolphin clip (b677c952)
- Environmental fountain courtyard at night with flickering lights
- Random dolphins emerged magically — LTX excels at emergent elements
- Ruined by the Seeker character looking bad
- Lesson: no characters, just environments

### The four-style system

| Element | Style | Look & Feel |
|---------|-------|-------------|
| EARTH | alchemical toy / storybook | whimsical, painted tin, clockwork, visible brushstrokes, warm ochre, moss green |
| WATER | flow / process | pipes, wheels, currents, bubbles, chains of causation, deep blue, teal, silver |
| AIR | liminal dream | mist-soaked, soft edges, things emerge and dissolve, lavender, cream, grey |
| FIRE | sharp imaginal | crisp, luminous, beings of light, stained-glass, gold, crimson, white |

All four share: imaginal, minimal, harmonic colours. Same universe, different provinces.

### The 12 core concepts (element-agnostic)
1. star field (space)
2. corridor of light (space)
3. stone chamber (earth)
4. reflection pool (water)
5. mist over water (air)
6. candle flame (fire)
7. match striking (fire)
8. deep ocean (water)
9. cave opening (earth)
10. mountain ridge (earth)
11. forest floor (earth)
12. clouds from above (air)

### LTX prompts written (batch 1)
- STONE_CHAMBER — invites you to sit in the ancient
- CORRIDOR_OF_LIGHT — invites you to walk toward the source
- REFLECTION_POOL — invites you to wait for recognition
- STAR_FIELD — invites you to see the many within the one
- MIST_OVER_WATER — invites you to accept the unseen
- CANDLE_FLAME — invites you to steady attention
- MATCH_STRIKING — invites you to ignite the work

Each prompt includes: what it invites, hyper-literal environment description, action sequence, sound effects.

---

## 4. doorways — POV meditation anchor

File: `content/video-objects/doorway-prompts.md`

### The ritual sequence
```
already seated cross-legged → 
open eyes → 
look straight ahead → 
slowly turn head left → 
slowly turn head right → 
take a deep breath → 
exhale → 
close eyes → 
fade to black
```

### The return (end of essay)
```
black → breath → eyes open → hands come back into focus → world reassembles
```

### Locations (7 prompts written)
1. **Forest clearing** — morning, birds, green
2. **Ocean cliff** — sunset, wind, horizon
3. **Mountain ridge** — snow, clouds, silence
4. **Bamboo grove** — filtered light, stillness
5. **Desert mesa** — sunset, rock, vast
6. **Lake shore at dawn** — mist, water, quiet
7. **Old temple courtyard** — stone, morning, quiet

### Requirements
- Hyper-real human (not stop-motion)
- No identifiable gender — simple hands, neutral dark pants, no rings/polish/hair
- POV only — no face, no full body
- Same hands/posture across all locations — continuity
- Fade to black is the transition into the essay
- LTX safe — seated static frame, head turning only, no walking

### First test recommended: FOREST CLEARING
- Natural environment, good lighting, safe for LTX
- No complex geometry
- High contrast (green/gold against skin)

---

## 5. key files created/modified

| File | What | Status |
|------|------|--------|
| `TTS-STYLE.md` | Audio prose guide | Done |
| `user-style.md` | Title voice guide | Done |
| `alchemy-decoded.md` | 50 decoded texts | Done (20 need hook polish) |
| `alchemy-shorts.md` | Hook + passage only | Superseded |
| `liminal-worlds-vision.md` | Full visual system spec | Written |
| `doorway-prompts.md` | 7 POV doorway prompts | Written |
| `SESSION-NOTES.md` | This file | Done |

## 6. Plotinus shorts — 28 essays complete

All 28 Ennead essay.md files polished:
- Killer hooks added (oversold, counterintuitive, concrete)
- NEG patterns removed (~120 fixes across all files)
- Treatise numbering added (ennead 1-27 + III.4)
- Source material padded (+74 new Plotinus quotes)
- Hooks sharpened, endings strengthened, mid-essay excitement lines added
- Tone: uplifting, sharp, illuminating — conveys zeal for Plotinus's system
- Locations: `/essayglobal/blueprints/Plotinus - The Enneads/*/essay.md`
- Summary file: `/root/projects/blog/plotinus-decoded.md`

## 7. VBT shorts — 112 meditations complete

All 112 Vijnana Bhairava Tantra verses:
- Each has: practice, motivation, where it leads, pointer
- Practice instruction is actionable (what to DO)
- Motivation: "can you do it once every time you remember?"
- Where it leads: specific to each verse
- Pointer: Lakshmanjoo-style single sentence
- Based on Hareesh blog commentaries + standard VBT translations
- File: `/root/projects/blog/vbt-decoded.md`

## 8. api
- YouTube API key exists (`YOUTUBE_API_KEY` in `.env.local`)
- Market scan script at `scripts/market-by-region.ts`
- Existing data shows Spanish market is massive (Odyssey video 106k views/day)
- Cloudflare AI vision pipeline ready but needs model license accepted in dashboard

## 9. next steps
1. Longform essay on Corpus Hermeticum (gap identified)
2. Finish VBT daily meditation practice framework
3. Accept Cloudflare Llama 3.2 Vision license for thumbnail pipeline
4. When API works: run market scan for ES/MX/IN regions
