# Ochema Format — Definitive Spec

## The Formula

```
[Doorway]   POV moment → fades to themed world      (LTX, 10-15s)
[World]     Landscape establishes, warm, alive       (LTX, 20-30s)
[↓]         Fade to black                            (editor, 1-2s)
[Quote]     Text on black. Narration lands on it.    (editor, 10-20s)
[↓]         Fade back into SAME world                (editor, 1-2s)
[Explore]   Different angle/area of the world        (LTX, 15-25s)
[↓]         Fade to black                            (editor, 1-2s)
[Quote]     Text on black                            (editor, 10-20s)
[↓]         Fade back into world — deeper            (editor, 1-2s)
[Explore]   Hidden corner, darker, more intimate     (LTX, 15-25s)
[↓]         Fade to black                            (editor, 1-2s)
[Quote]     Closing text                             (editor, 15-20s)
[Return]    Black → world returns → dissolve to doorway  (LTX+editor, 10s)
```

## The Only 6 Things We Generate

### 1. Doorway POV (4 variants)
POV transition from ordinary to imaginal. Universal, reused across ALL videos.

| ID | Shot | Prompt |
|----|------|--------|
| D1 | Sitting to meditate | Hands resting on knees, sitting cross-legged, soft warm light, shallow depth of field |
| D2 | Candle flame | Candle flame close up, warm gold light, flame wavers softly, dark background |
| D3 | Rain at window | Rain streaming down window glass, grey-blue light, soft, cozy interior |
| D4 | Lie down | Looking up at ceiling from pillow, soft warm light, slow fade |
| D5 | Open book | Hands on open book pages, warm parchment, firelight flickering |

### 2. World Crystallizations (6 variants)
One per tradition. The world is established ONCE per video. All subsequent returns visit the SAME world.

| ID | Tradition | Prompt (from 50-clip-bank DL14-19) |
|----|-----------|------|
| W1 | Kashmir | Pure gold light → Himalayan peaks, stone temple, mist |
| W2 | Sufi | Warm honey light → Andalusian courtyard, fountain, tilework |
| W3 | Neoplatonic | Cool white light → marble colonnade, Academy, sea |
| W4 | Hermetic | Amber light → alchemical laboratory, alembics, furnace |
| W5 | Buddhist | Clear light → bamboo grove, mist, meditation path |
| W6 | Yoga | Golden pulse → river at dawn, mountain, meditation cave |

### 3. World Explores (36 variants, 6 per world)
Different areas of the same world. Each revisit lands in a different spot.

For Kashmir (W1):
| ID | Area | Prompt |
|----|------|--------|
| W1a | Valley | Himalayan valley at golden hour, mist between peaks |
| W1b | Temple | Stone temple courtyard, carved pillars, saffron flag |
| W1c | Cave | Cave interior, oil lamp, birch-bark manuscripts on shelves |
| W1d | Peak | Mountain peak above clouds, first light |
| W1e | Water | Still lake reflecting peaks, single stone at edge |
| W1f | Forest | Pine forest, dappled light, path disappearing into trees |

For Sufi (W2):
| ID | Area | Prompt |
|----|------|--------|
| W2a | Courtyard | Andalusian courtyard, central fountain, geometric tilework |
| W2b | Archway | Single arched window, moonlight through lattice, candle on ledge |
| W2c | Desert | Desert night, single tent, stars, fire |
| W2d | Garden | Orange trees in clay pots, lantern light, dusk |
| W2e | Library | Shelves of leather-bound books, single reading lamp |
| W2f | Rooftop | Rooftop overlooking city at dusk, minaret silhouette |

Same pattern for W3-W6.

### 4. Black (1 thing)
Pure black. Zero cost. Generated in editor.

### 5. Quote Text (per video)
White or warm-gold text on black. Fade in, hold, fade out. Added in editor.

### 6. Doorway Return (same as #1, reversed)
The same POV shot, but the transition reverses: world → hands/candle/book → ordinary.

---

## Per Video Production Math

| Item | Count | Source |
|------|-------|--------|
| Doorway POV | 1 | From shared bank (4 variants) |
| World crystallization | 1 | From shared bank (6 variants) |
| World explores | 3-6 | From per-world bank (6 per world) |
| Black segments | 4-7 | Editor, zero cost |
| Quote cards | 3-7 | Editor, text on black |
| **Total LTX clips** | **5-8** | All reusable across videos |

**Total LTX generation to launch the channel:**
- 4 doorways × 3 seeds = 12 generations
- 6 world crystals × 3 seeds = 18
- 36 world explores × 2 seeds = 72
- **Total: ~102 generations** → complete visual library for every video

---

## Style Rules

1. **No characters** — pure environment. The viewer IS the presence in the space.
2. **No readable text in LTX** — all text is post-production overlay on black.
3. **Color filter in post** — existing clips can be color-shifted to change mood (cool for Buddhist, warm for Kashmir, silver for Sufi).
4. **Shadowy teacher** — if a figure appears, it's a distant silhouette in the environment (a shadow in a cave, a figure on a peak). LTX does silhouettes well. Never close-up.
5. **Black is the transition** — no wipes, no dissolves, no complex effects. Fade to black. Let it breathe. Then fade back in.
6. **The world does not change** — every return is to the SAME world. The viewer explores it more deeply, but it remains one place.
7. **Doorway is the only POV** — after the initial transition, we're unmoored, floating in the world. No hands, no body. Just the environment.

---

## Example: Ibn Arabi — Unity of Being

**World:** W2 (Sufi — Andalusian courtyard)

```
0:00 ─ [D2] Candle flame POV → flame expands → gold light fills frame
0:15 ─ [W2] Warm honey light crystallizes into courtyard, fountain, tilework
0:45 ─ BLACK
0:47 ─ "There is nothing in existence but God." — Ibn Arabi
1:05 ─ BLACK → fade into [W2a] Courtyard at dusk, water in fountain
1:35 ─ BLACK
1:37 ─ "Being is one. The many are the loci of manifestation."
2:00 ─ BLACK → fade into [W2d] Garden at night, lantern, orange trees
2:30 ─ BLACK
2:32 ─ "The seeker's journey is not about finding God out there..."
2:55 ─ BLACK → fade into [W2b] Moonlight through arch, candle on ledge
3:25 ─ BLACK
3:27 ─ "Close your eyes. Feel your breath. Who is breathing you?"
3:50 ─ BLACK → fade to [W2] World dissolves back to honey light
4:10 ─ [D2] Light condenses back to candle flame
```

**LTX clips used:** D2, W2, W2a, W2d, W2b
**Editor overlays:** 5 quote cards on black
**Total LTX generation:** 5 clips

---

## Example: 36 Tattvas

**World:** W1 (Kashmir — Himalayan valley)

```
0:00 ─ [D1] Hands on knees, sitting → warm white fills frame
0:15 ─ [W1] Gold light crystallizes into Himalayan peaks, temple, mist
0:45 ─ BLACK
0:47 ─ "36 tattvas is the entrance point into Kashmir Shaivism." — Lakshmanjoo
1:10 ─ BLACK → [W1e] Still lake reflecting peaks, single stone
1:40 ─ BLACK
1:42 ─ "From pure consciousness down to earth — 36 categories."
2:05 ─ BLACK → [W1c] Cave interior, manuscripts, oil lamp
2:35 ─ BLACK
2:37 ─ "The observer and the observed are one structure."
3:00 ─ BLACK → [W1f] Pine forest, dappled light, path
3:30 ─ BLACK
3:32 ─ "Nothing exists which is not Śiva."
3:55 ─ BLACK → [W1] World dissolves to gold light
4:10 ─ [D1] Hands on knees return
```

**LTX clips used:** D1, W1, W1e, W1c, W1f
**Editor overlays:** 5 quote cards on black
**Total LTX generation:** 5 clips

---

## Why This Works

1. **Minimal LTX per video** — 5-8 clips, all reusable from the library
2. **Zero character generation** — LTX never has to make a face or body
3. **Black is free** — the quotes land because there's nothing competing with them
4. **World feels deep** — each return visit to the same world makes it feel real, explored, lived-in
5. **Style is unique** — doorways + black + atmospheric worlds = nothing else looks like this
6. **Scales infinitely** — 102 generations = every world, every angle. Add more explores per world as needed.
