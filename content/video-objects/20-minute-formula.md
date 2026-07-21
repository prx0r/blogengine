# The 20-Minute Formula

## The Problem

A 20-minute video at 145 WPM = ~2,900 words. At 30s per beat = 40 beats. At 40 unique LTX clips per video = **not feasible.**

## The Solution: 5 Clip Types, Mixed Ratio

```
A = LTX abstract concept clip (15s)     →  4-6 per video  (60-90s total)
B = World B-roll LTX clip  (15-30s)     →  2-3 per video  (30-60s total)  
C = Still art with slow zoom/camera     →  8-12 per video (8-12min total)
D = Quote card on atmospheric bg (10s)  →  4-6 per video  (40-60s total)
E = The Seeker overlay (10-15s)         →  2-3 per video  (20-45s total)
```

**Total LTX clips per video: 8-12** (A + B + E)
**Total still segments: 12-18** (C + D)

The other 10 minutes are pure narration over still art with slow parallax moves — this is what `assemble-video.mjs` already does.

---

## The Standardized Beat Template

Every video follows this rhythm:

```
[HOOK]          D (Quote card)          "Swami Lakshmanjoo said..."
[ESTABLISH]     B (World B-roll)        Establishing the Kashmir world
[CONTEXT]       C (Still art)           Sāṅkhya vs Trika distinction
[CONCEPT IN]    A (LTX abstract)        The emanation begins (15s)
[EXPLAIN]       C (Still art)           Unfolding the concept
[QUOTE]         D (Quote card)          Primary source verse
[DEEPEN]        C (Still art)           Further explanation
[VISUALIZE]     A (LTX abstract)        The core idea visualized (15s)
[EXPLAIN]       C (Still art)           Application / implication
[SEEKER]        E (Seeker overlay)      The Seeker witnesses
[SYNTHESIS]     C (Still art)           Wrapping up
[CLOSE]         D (Quote card)          Closing quote / call to action
```

This template is **12 segments**. At average 100s per segment = 20 minutes.

---

## Concrete Example: "Rasa — The Transformation of Emotion into Beauty"

Source: Hareesh Rasa blog post (~6,600 words, trimmed to ~2,900 for 20 min)

### Script Structure

```
SEG 1 — HOOK (60s spoken, 185 words)
Visual: D + B
  D: "Nothing exists which is not Śiva" — Svacchanda Tantra
  B: KASH_EST_01 (temple valley, slow crane) — fades in behind quote

Narration: "Among Sanskrit scholars, Abhinavagupta is better known as a 
philosopher of aesthetics than as a Tantric master. The study of what 
makes something beautiful — alaṅkāra-śāstra — was his first love. He 
wrote a massive commentary on the Nāṭya-śāstra, the foundational work 
of dramaturgy. And in that context, he elaborated what we now call 
Rasa theory."


SEG 2 — ESTABLISH (45s spoken, 140 words)
Visual: B → C
  B: KASH_EST_04 (three-faced deity, slow orbit) 
  C: Shiva-Parvati stone carving (slow zoom)

Narration: "Rasa literally means 'savor' or 'flavor' or 'juiciness.' 
But in this context it means aesthetic sentiment — the experience 
of artistic beauty. And what is surprising about the list of nine 
Rasas is that it includes some we wouldn't expect: anger, fear, 
even disgust can be experienced as beauty. In this way, it becomes 
a spiritual teaching."


SEG 3 — DEFINITION (75s spoken, 230 words)
Visual: D → C
  D: "Rasa is not located in the work but in the viewer."
  C: Naranag temple (slow zoom in)

Narration: "My teacher Somadeva Vasudeva wrote: Rasa is the experience 
one has viewing artwork that is moving or impactful. It refers to the 
experience itself. Therefore, what we call Rasa is not located in the 
work but in the viewer. Rasa does not refer to everyday worldly 
emotions — love, sorrow, humor — but to their transformation into 
aesthetic sentiment."


SEG 4 — THE PARADOX (90s spoken, 280 words)
Visual: A → C
  A: RASA_01 (crimson watercolor bloom, 15s)
  C: Manuscript page (slow pan)

Narration: "Imagine watching Romeo and Juliet. You're drawn in. 
You share the feelings of the characters. But if you ask yourself 
whose love this is, a paradox arises. It cannot be Romeo's — he's 
fictional. It cannot be the actors' — they may despise each other. 
It cannot be your own. So whose love is it? A Sanskrit aesthete 
would say: you are relishing your own fundamental emotional state — 
your capacity for passion — which has been decontextualized by 
sympathetic resonance and transformed into aesthetic sentiment 
called śṛṅgāra-rasa."


SEG 5 — TRANSFORMATION (60s spoken, 185 words)
Visual: C → C
  C: Temple carving (slow drift)
  C: Śāradā manuscript (slow zoom)

Narration: "The key word here is 'transformation.' The Rasas are 
NOT emotions. This is the most common misunderstanding. Emotion 
transformed into esthetic sentiment is Rasa. When the erotic is 
transformed into beauty, we call it śṛṅgāra-rasa. When courage 
is transformed, vīrya-rasa. When grief is transformed, kāruṇya-rasa. 
You may weep at a film, but it's beautiful. The difference between 
that and the grief of your own life? Just this self-referencing ego 
that takes things personally."


SEG 6 — THE UNEXPECTED RASAS (90s spoken, 280 words)
Visual: A → C → A
  A: RASA_02 (nine color swatches, slow orbit, 15s)
  C: Bhairava mask (slow zoom, dramatic)
  A: SPANDA_01 (pulsing point, 10s — crossfade at anger mention)

Narration: "Now we come to the most unexpected Rasas. The wrathful 
Rasa, raudra-rasa — when anger is transformed into aesthetic 
sentiment. Anger becomes divine wrath, an experience of wrath-as-beauty. 
Even more unexpected: the terrifying Rasa, bhayānaka-rasa. Fear 
transformed into beauty. Even the repulsive can become an experience 
of beauty — bībhatsa-rasa. Abhinavagupta argues that the peaceful 
Rasa, śānta-rasa, is the ninth and highest. Not everyone accepted it. 
But he proved that world-weariness itself can become sublime tranquillity."


SEG 7 — THE NINE RASAS (60s spoken, 185 words)
Visual: D (long hold, list appears)
  D: List of nine Rasas on atmospheric dark background

Narration: "So the nine are: śṛṅgāra (romantic), vīrya (heroic), 
bībhatsa (repulsive), raudra (wrathful), hāsya (comedic), adbhuta 
(marvelous), bhayānaka (frightful), kāruṇya (compassionating), 
and śānta (peaceful). Nine ways that emotion becomes beauty."


SEG 8 — SPIRITUAL MEANING (75s spoken, 230 words)
Visual: E → C
  E: SEEK_STAND (Seeker in darkness, breathing slowly)
  C: Martand enclosure (slow panorama)

Narration: "Now here is the spiritual teaching. In all nine modalities, 
you are touching the sublime. That's what makes it Rasa. Otherwise 
it's just emotion. Emotions come and go, they don't define who we are. 
But when we touch the sublime, we touch the depths of our real nature.

The Svacchanda-tantra says: nāśivaṁ vidyate kvacit — nothing exists 
which is not Śiva. Every experience has the potential to be a blessing. 
And it is up to the observer to extract that energy. Just as in Rasa 
theory, you cannot be entirely passive. The connoisseur of great art 
is called a sahṛdaya — someone with heart. Someone who can truly 
experience beauty."


SEG 9 — CAMATKĀRA (60s spoken, 185 words)
Visual: A → C
  A: PRATYABHIJNA_01 (mirror merging, 15s)
  C: Shankaracharya temple hilltop (slow pull-back)

Narration: "Abhinavagupta says the highest form of beauty is 
camatkāra — an experience of wonder that completely obliterates 
everyday concerns. In that state, you are simply lost in blissful 
wonder. That is what art has the capacity to evoke. It is what 
life itself has the capacity to evoke. We are those unique beings 
who can experience camatkāra. We are the universe savoring itself."


SEG 10 — RETURN (30s spoken, 100 words)
Visual: D → E  
  D: Quote card — "Nothing exists which is not Śiva."
  E: SEEK_DISSOLVE (Seeker glows, dissolves into gold light)

Narration: "The Sanskrit word śiva literally means 'a blessing.' 
Therefore every experience, every moment, everything has the 
potential to be a blessing. Iti śivam — may it be for a blessing."

[OUTRO]
```

### Clip Count for This Video

| Type | Count | IDs |
|------|-------|-----|
| A (LTX abstract) | 4 | RASA_01, RASA_02, SPANDA_01, PRATYABHIJNA_01 |
| B (World B-roll) | 2 | KASH_EST_01, KASH_EST_04 |
| C (Still art) | 8 | Shiva-Parvati, Naranag, Manuscript, Temple carving, Bhairava mask, Martand, Shankaracharya + 2 more |
| D (Quote cards) | 3 | Opening quote, definition, nine rasas list |
| E (Seeker) | 2 | SEEK_STAND, SEEK_DISSOLVE |
| **Total LTX clips** | **8** | |

---

## The Formula — Generalized

For any 20-minute video (2,900 words, ~12 segments):

```
SEGMENTS:
  1 × HOOK      (60s, D + B)      ← Quote + world establishing
  1 × ESTABLISH (45s, B → C)      ← World + art context
  2 × DEFINITION (60-75s each, D/C) ← What is the concept
  1 × PARADOX   (90s, A → C)      ← The tension/hook that makes it interesting
  2 × BODY      (60-90s each, C/C) ← Core explanation
  1 × VISUALIZE (45s, A)          ← Abstract LTX clip showing the concept
  1 × LIST/QUOTE (45s, D)        ← Summary list or key quote
  1 × MEANING   (60s, E → C)      ← Why it matters spiritually
  1 × CAMATKARA (60s, A → C)      ← The sublime moment
  1 × RETURN    (30s, D → E)      ← Closing quote + Seeker dissolve
```

**LTX clips required:** 6-9 per video (A + B + E)
**Still art segments:** 8-12 per video

---

## Production Math

Generating the full 44-clip library from the queue covers approximately **5-6 full videos**.

| Video | LTX clips from library | New clips needed |
|-------|----------------------|------------------|
| 36 Tattvas | SPANDA, TATTVA, MAYA, SEEK | 6-8 |
| Rasa | RASA, PRATYABHIJNA, SEEK | 4-5 |
| Spanda | SPANDA, SHAKTI, SEEK | 3-4 |
| Pratyabhijñā | PRATYABHIJNA, SPANDA, SEEK | 4-5 |
| Three Upāyas | SEEK, KASH_EST + new path visuals | 3-4 new |
| Kuṇḍalinī | KUNDALINI, NADI, SEEK | 3-4 |
| Yogi Spotlight: Khapaḍa Bābā | KASH_EST, SEEK + 0 new | 0-1 |

Most videos reuse 60-80% of their clips from the library.

---

## Standardized Script Format (Template)

```
SEG N — [LABEL] ([duration]s spoken, [word count] words)
Visual: [type IDs]

Narration: "[spoken script — exactly what the narrator says]"
```
