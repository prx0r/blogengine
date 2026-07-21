# GoldThoughts — Visual Production Methodology for Distillery Videos

## I. What the Examples Actually Use (Tech Survey)

### Canvas 2D (vanilla JS)
**Files:** `tukdam claude.txt`, `aurora.html`, `eegelegance.txt`, `amazing emergeant consciousness art.txt`, `cooking.html`, `emerge.html`, `sphereeee.html`, `waooh.html`, `yooom.html`

Core techniques:
- `createRadialGradient()` + `ctx.shadowBlur` for glow depth
- `ctx.globalCompositeOperation = 'lighter'` for additive blending
- HSB color cycling via `hue = (startHue + progress * range)`
- Perlin/Simplex noise for organic flow fields
- Particle systems with attractor nodes
- `easeInOutCubic` on all transitions

### THREE.js (WebGL)
**Files:** `calude increidbel.txt`, `goated1.txt`

Core techniques:
- Vertex displacement via noise over time
- `UnrealBloomPass` (post-processing glow)
- Audio-reactive via FFT (Tone.js → vertex position)
- SimplexNoise for organic mesh deformation
- Interactive controls for song/shape switching

### p5.js
**Files:** `blooom cool animation.txt`, `perfect.html`, `nutty gielis.html`

Core techniques:
- HSB colorMode for hue cycling
- Stochastic parameter randomization per cycle
- Drawing/erasing loop (expand → contract → regenerate)
- Curve-based generative forms (Lissajous, Euler spirals)

### Common Patterns Across All Three
1. **Phase-based state machines** — every piece has 4-5 distinct phases with different visual rules
2. **HSB color space** — transitions through hue wheel, not RGB lerp
3. **Noise fields** — never purely random, always Perlin/Simplex for organic coherence
4. **Glow via blur** — shadowBlur or UnrealBloomPass, never flat colors
5. **Additive blending** — `lighter` composite mode for overlapping glows
6. **Sparse audio** — 8% probability per frame, harmonic frequency ratios, heavy reverb
7. **Text overlays not voiceover** — poetry subtitles + equations, no spoken word

---

## II. The Production Method (Narration First)

### PASS 0: Concept Selection
Pick one Research Object. Not a synthesis. Not a cross-tradition comparison. One bounded concept explained razor-sharp.
- `ro:nanavira-clearing-path` → Fundamental Structure / K₄
- `ro:tantraloka-three-means` → The 4 Upāyas
- `ro:law-of-one` → The 8 Densities
- `ro:friston-free-energy` → Free Energy Principle

### PASS 1: Script (Words Only)
Write a 3-5 minute narration script. Rules:
- Open with the ONE insight this video teaches
- Build it up logically — no leaps, no "interestingly..."
- Every sentence justifies its existence as spoken word
- End by returning to the opening insight, now earned
- Max 5 minutes. If it takes longer, split into a series.

Format:
```
[0:00-0:30] HOOK — State the insight directly
[0:30-2:00] BUILD — Layer the pieces in logical order
[2:00-3:30] REVEAL — Show how the pieces interlock
[3:30-4:30] IMPLICATION — What this means
[4:30-5:00] CLOSE — Return to the insight, transformed
```

Example for Ñāṇavīra's K₄:
```
HOOK: "Every moment of your experience has four parts. Not three. Not five. Four. 
And if you remove any one of them, experience itself collapses."

BUILD: Explain each of the four — subject, object, intention, act. 
Use concrete examples the listener can check right now in their own experience.

REVEAL: Show that these four are not sequential. They co-arise. 
You cannot be a subject without an object. You cannot intend without the act of intending. 
This is dependent arising stated geometrically.

IMPLICATION: Ñāṇavīra was a Buddhist monk in a Ceylon hut in 1963. 
He had no physics training. Yet the structure he found — K₄, the complete graph on 4 vertices, 
6 edges — is the same minimal structure that particle physicists found in the amplituhedron 50 years later.

CLOSE: "The tetrahedron is not a metaphor. It is the minimum. 
You are one of its vertices. You cannot leave. Because the attempt to leave IS the tetrahedron."
```

### PASS 2: Beat Map
Tag the script with visual beat markers. What should the viewer SEE at each line?

Format:
```
[0:00] "Every moment of your experience has four parts..."
  VISUAL: Empty void. Single point of gold light appears center-screen.
  Label fades: "YOU". This is the subject.

[0:12] "Not three. Not five. Four."
  VISUAL: Three grey shadow-points pulse faintly around YOU — rejected shapes.
  Then snap off. Void again. Just the one gold point.

[0:18] "And if you remove any one of them..."
  VISUAL: Four points now arranged as tetrahedron vertices.
  One vertex dissolves. Remaining three collapse to a flat triangle.
  Triangle pulses red, dims. "No experience" text appears.

[0:25] "...experience itself collapses."
  VISUAL: The dissolved vertex returns. Tetrahedron reforms. 
  Gold edges brighten. Green core dot appears at center.
```

Rules for visual beats:
- Every visual change is paired to a specific narration beat
- Nothing rotates or animates without a narrative reason
- The visual PROVES what the narration is CLAIMING
- Visual metaphors must match the concept's actual structure
  - Ñāṇavīra's K₄ = precise geometric construction, not chaos→order
  - Friston's FEP = model error decreasing, not particles crystallizing
  - Tukdam = coherence persisting without mechanism, ∴ mysterious persistence NOT transformation

### PASS 3: Visual Prompts (Per Beat)
For each beat, write the exact visual prompt. This is what the renderer consumes.

Format:
```
BEAT: "Not three. Not five. Four."
SCENE TYPE: manim-geometry | canvas-particles | threejs-mesh
DURATION: 6 seconds

BACKGROUND: #0D1117 pure void

VISUAL:
- Three grey (#6B7280, opacity 0.3) geometric shapes appear momentarily:
  a triangle (3 vertices), a pentagon (5 vertices), a hexagon (6 vertices)
- They pulse once with an X through each, then dissolve
- A single gold (#D4A574) dot remains
- Purple (#A855F7) ring pulses once around it: "Choose"
- Gold dot grows slightly. Four gold dots now form: tetrahedron vertices

TEXT OVERLAY:
- "3" appears beside triangle → X → fade
- "5" appears beside pentagon → X → fade  
- "4" appears centered → gold glow → held

AUDIO: Single C4 tone (261Hz) held for 3s. At "Four", a perfect fifth (G4, 392Hz) joins.
```

### PASS 4: Render & Review
Render each beat. Review against narration:
1. Does the visual land ON the word it's meant to illustrate? If not, adjust timing.
2. Does the visual PROVE the point? If it's just decorative, cut it.
3. Do adjacent beats flow? If not, add transition (0.5s crossfade max).
4. Is the color palette consistent? Black > Gold > Purple > White > Turquoise accents > Dark Green.

### PASS 5: Assembly
1. Render all scenes at 1080p
2. Record/generate narration in sync with beat map
3. FFmpeg: overlay narration onto visuals, crossfade between scenes
4. Add ambient audio layer (Tone.js-generated, mixed to -25dB — not silence, not foreground)
5. Add title card (3s) + end card (5s)

---

## III. Visual Palette (Distillery)

```
Order of significance:
1. BLACK  (#0D1117) — Void, background, canvas
2. GOLD   (#D4A574) — Primary geometry, wireframes, key labels
3. PURPLE (#A855F7) — Secondary structure, resonance, probability 
4. WHITE  (#E6E1DC) — Text, subtitles, equations
5. TURQUOISE (#14B8A6, low opacity) — Tiny accents, edge highlights, glint
6. DARK GREEN (#166534) — Preservation, life, biological coherence phases

HSB equivalents for transitions:
- Gold:   hue 33, sat 42, bri 83 → "warm understanding"
- Purple: hue 271, sat 65, bri 97 → "structure beneath"
- Green:  hue 150, sat 87, bri 40 → "living coherence"
```

## IV. Visual Rulebook (Distillery Style)

### When to Use Which Tech

| Concept type | Tech | Reason |
|---|---|---|
| Geometric proofs (K₄, tattvas, amplituhedron) | Manim or THREE.js wireframe | Needs precise labeled vertices, rotation |
| Process visualization (FEP, karma, diffusion) | Canvas 2D particles | Needs to show behavior over time |
| Biological/neural (Levin bioelectric, EEG) | Canvas 2D or THREE.js | Organic noise fields, dendrite-like growth |
| POV/experiential ("you are the tetrahedron") | Canvas 2D | First-person interactive feel, simple |
| Sound/metaphysics (Mātṛkā, mantra, Sanskrit) | THREE.js + Tone.js | 3D resonance, audio-to-geometry mapping |

### Particle System Rules
- Never purely random — always Perlin/Simplex noise
- Particles attract to concept-relevant structures (tetrahedron vertices, probability nodes, neural clusters)
- Color shifts by phase via HSB hue rotation, not RGB lerp
- Glow: `shadowBlur: 4-12` depending on phase intensity
- Trails: store 5-frame history, draw with `lineTo` at reducing opacity
- Opacity: `0.1-0.4` for background particles, `0.6-0.9` for focal

### Animation Rules
- All transitions use `easeInOutCubic` — no linear motion, no snapping
- Scene duration: 6-20 seconds max per visual beat
- Rotation: only when demonstrating a geometric property (e.g. showing all 6 edges of K₄)
- Never rotate for aesthetics alone
- Zoom: slow (0.5-2.0 scale over 8+ seconds), reveals structure not "whoa cool"

### Text Overlay Rules
- Font: Inter for labels, JetBrains Mono for equations, Times New Roman for poetry/titles
- Position: title top-left, equation top-right, poetry/subtitle bottom-center
- Opacity transitions: 0 → 1 over 1.5s, fade out over 1s
- Never more than 2 text elements simultaneously
- Subtitles max 2 lines, equations max 3 lines

### Audio Rules (Generative Ambient via Tone.js)
- Sparse: 5-10% probability per frame of triggering a note
- Frequency: fundamental at 80-333Hz, harmonics at perfect fifth, octave
- Envelope: attack 2-3s, release 4-5s — notes breathe, don't strike
- Reverb: depth 4-6 seconds
- Volume: -25 to -35dB — felt not heard
- Narration: -10dB, clear and dry, sits above ambient

---

## V. Anti-Patterns (What to Avoid)

1. **Chaos→Order as default** — Only use if the CONCEPT is about emergence from disorder. Ñāṇavīra's K₄ is about structure always present, not order from chaos. The visual should REVEAL, not CREATE.

2. **Particles without purpose** — Every particle system must have attractors that MEAN something. Random particles floating = visual noise = cut it.

3. **Rotation for aesthetics** — Rotating geometry communicates "look at this 3D thing." If the geometric property is 2D, show it in 2D. If you need to show all 6 edges of a tetrahedron, rotate ONCE, slowly, and only to serve that demonstration.

4. **Overlapping text** — Title + equation + subtitle + phase indicator = 4 text elements. Max is 2. Cut ruthlessly.

5. **Voiceover competing with ambient** — Narration at -10dB, ambient at -30dB. The ambient supports, never competes.

6. **Color cycling without meaning** — Each color shift must correspond to a phase change in the concept. No rainbow-for-rainbow's-sake.

---

## VI. Next: The Script-Only Exercise

Before any visual is touched, write 5 scripts. Each:
- Explains ONE concept from an existing RO
- Is 3-5 minutes when spoken at ~150 words/minute
- Builds logically — the listener can follow without visuals
- Has a hook, build, reveal, implication, close
- Uses concrete examples the listener can verify in their own experience

Only after a script is solid do we proceed to beat map → visual prompts → render.

Suggested first five scripts:
1. Ñāṇavīra's Fundamental Structure (ro:nanavira-clearing-path)
2. The 4 Upāyas: Body, Mind, Direct, No-Means (ro:tantraloka-three-means)
3. What Is a Daimon? 5 Traditions, 1 Answer (daimon ROs)
4. The 36 Tattvas Explained (ro:tantraloka-*, tantraloka-decoded.md)
5. Friston's Free Energy Principle (ro:friston-free-energy)
