# Visionary Engine — Visual Language Architecture

## Core Principle

The Visionary Engine is a **semantic compiler for visual thought**. Transcript → semantic beats → visual verbs → persistent entities → process parameters → Motion Canvas scene → timed preview → rendered scene chunks → FableCut finishing.

---

## Why Motion Canvas

Motion Canvas is designed for informative vector animations synchronized with voice-over. Animations are TypeScript generator functions with live preview and editable timing. FableCut handles final assembly, music, and corrections.

Key features:
- Custom reusable components for processes (pulse fields, wheels, veils, reflections)
- Signals — parameters like openness, synchrony, density automatically update all dependent geometry
- Time Events — animation cues attached to narration phrases, draggable in the editor
- Generator composition: `all`, `chain`, `sequence`, `delay`, `loop`
- Native vector nodes: `Line`, `Path`, `Spline`, `Circle`, `SVG`, `Txt`, `Camera`
- Path-data tweening for morphing forms
- Project variables for light/dark themes

Render scenes individually as image sequences or via FFmpeg exporter. Keep FableCut for final assembly.

---

## The Central Design Decision

Do **not** have the agent generate arbitrary TSX. Have it generate a validated JSON document in a constrained visual language.

Bad:
> "Write an imaginative Motion Canvas scene for this paragraph."

Good:
```json
{
  "operator": "resonate",
  "source": "mantraGlyph",
  "target": "pulseField",
  "intensity": 0.55,
  "durationEvent": "mantra-is-pulse",
  "continuity": "preserve-center"
}
```

A deterministic runtime interprets that instruction using pre-approved components.  
The model chooses the idea. The engine controls the aesthetics.

---

## Architecture

```
Transcript + word timestamps + sources
                  ↓
     1. Rhetorical parser
        claim / analogy / quotation / practice
                  ↓
     2. Semantic visual planner
        chooses verbs, entities, continuity
                  ↓
     3. Visual Program IR
        constrained JSON, schema-validated
                  ↓
     4. Scene compiler / interpreter
        JSON → Motion Canvas process calls
                  ↓
     5. Preview + visual critic
        contact sheet + low-resolution scene
                  ↓
     6. Scene renders
        6–10 scenes for a 10-minute essay
                  ↓
     7. FableCut
        final sound, art inserts, corrections
```

---

## Layer 1: Rhetorical Parsing

Identifies what each passage is doing, without thinking visually yet.

```typescript
type RhetoricalBeat = {
  id: string;
  startWord: number;
  endWord: number;
  cueText: string;

  function:
    | 'hook'
    | 'definition'
    | 'mechanism'
    | 'analogy'
    | 'quotation'
    | 'example'
    | 'practice'
    | 'synthesis'
    | 'climax'
    | 'transition';

  logic:
    | 'identity'
    | 'causation'
    | 'partWhole'
    | 'contrast'
    | 'sequence'
    | 'recurrence'
    | 'emanation'
    | 'return'
    | 'resonance'
    | 'transformation';

  entities: string[];
  keyTerm?: string;
  emphasisCandidate?: string;
};
```

Example:
> "The mantra works because it is the pulse shaped into sound, riding the breath."

```json
{
  "function": "mechanism",
  "logic": "identity",
  "entities": ["mantra", "pulse", "sound", "breath"],
  "keyTerm": "मन्त्र",
  "emphasisCandidate": "one woven thrum"
}
```

---

## Layer 2: Visual Grammar

The agent can only choose from approved visual verbs and nouns.

### Primary Verbs
```
appear      pulse       open        close       expand
contract    emanate     branch      gather      return
connect     disconnect  weave       resonate    reflect
veil        unveil      ascend      descend     orbit
stabilize   fracture    merge       dissolve
```

### Visual Nouns
```
point       line        field       contour     circle
aperture    hub         spoke       wave        thread
node        branch      mirror      veil        ladder
flame       glyph       frame       image-window
```

### Compositional Relations
```
inside      around      through     toward      away-from
mirrored-by contained-within        emerging-from  returning-to
transmitted-between
```

This gives the agent a language more like stage direction:

```
FIELD pulse subtly.
POINT appears inside FIELD.
FIELD contracts into POINT.
POINT becomes HUB.
Three SPOKES emanate from HUB.
```

---

## Layer 3: Visual Program IR

### Scene Structure

```typescript
type VisionaryScene = {
  id: string;
  title: string;
  narration: string;
  audioFile: string;
  initialState: EntitySpec[];
  beats: VisualBeat[];
  handoff: SceneHandoff;
};

type EntitySpec = {
  id: string;
  process: ProcessId;
  layer: 'background' | 'structure' | 'focus' | 'text' | 'insert';
  params: Record<string, unknown>;
};

type VisualBeat = {
  id: string;
  event: string;
  rhetoricalFunction: string;
  actions: VisualAction[];
  subtitle?: {
    text: string;
    role: 'emphasis' | 'quotation' | 'source';
    durationEvent?: string;
  };
  sanskrit?: {
    text: string;
    role: 'term' | 'revelation' | 'chapter';
  };
  density: 1 | 2 | 3 | 4 | 5;
};

type VisualAction = {
  operator: VisualOperator;
  subject: string;
  target?: string;
  params?: Record<string, unknown>;
  duration?: number;
  durationEvent?: string;
};

type SceneHandoff = {
  preserve: string[];
  transform?: { entity: string; into: ProcessId };
};
```

### Example: Transcript to Visual Program

For:
> "A tuning fork across a room begins to ring when its note is struck. The mantra meets spanda the same way — by resonance."

```json
{
  "id": "resonance-explanation",
  "event": "tuning-fork-across-room",
  "rhetoricalFunction": "analogy",
  "actions": [
    { "operator": "pulse", "subject": "leftFork", "duration": 1.2 },
    { "operator": "transmit", "subject": "resonanceField", "target": "rightFork",
      "duration": 1.8, "params": { "waveCount": 3, "spacing": 0.22 } },
    { "operator": "resonate", "subject": "rightFork",
      "params": { "phaseDelay": 0.18, "amplitude": 0.65 } },
    { "operator": "transform", "subject": "leftFork", "target": "mantraGlyph" },
    { "operator": "transform", "subject": "rightFork", "target": "pulseField" }
  ],
  "sanskrit": { "text": "मन्त्र", "role": "term" }
}
```

The final transformation prevents the analogy from becoming a disposable illustration. The tuning forks become the next philosophical objects.

---

## Persistent State: The Cure for Montage

Every scene maintains a world state:

```typescript
type VisualWorldState = {
  entities: Map<string, VisualEntity>;
  focalEntity: string | null;
  center: Vector2;
  density: number;
  visualEnergy: number;
  mode: 'contemplative' | 'explanatory' | 'quotation';
};
```

Hard constraint:
> At least 70% of beats must transform or reuse an existing entity.
> At most 20% may introduce a genuinely new primary entity.
> At most 10% may be cutaway inserts.

---

## Process Registry

```typescript
const processRegistry = {
  pulseField: PulseField,
  openClose: OpenClose,
  apertureBreath: ApertureBreath,
  wheelHub: WheelHub,
  waveReturn: WaveReturn,
  branchEmanation: BranchEmanation,
  resonance: ResonanceTransfer,
  braid: BraidUnification,
  connectDisconnect: ConnectDisconnect,
  gatherToCenter: GatherToCenter,
  nestedCycles: NestedCycles,
  playfulOrbit: PlayfulOrbit,
  veilReveal: VeilReveal,
  mirrorReflection: MirrorReflection,
  descentInvocation: DescentInvocation,
  ladderAscent: LadderAscent,
  fireTransform: FireTransform,
  sanskritGlyph: SanskritGlyph,
  artworkWindow: ArtworkWindow,
};
```

Each component has a common API:

```typescript
interface VisionaryProcess {
  enter(options?: EnterOptions): ThreadGenerator;
  hold(options?: HoldOptions): ThreadGenerator;
  mutate(operator: VisualOperator, params: Record<string, unknown>): ThreadGenerator;
  exit(options?: ExitOptions): ThreadGenerator;
  snapshot(): ProcessState;
  canTransformTo(process: ProcessId): boolean;
  transformTo(process: VisionaryProcess, options?: TransformOptions): ThreadGenerator;
}
```

### Native Motion Canvas Component Example

```tsx
export interface PulseFieldProps extends NodeProps {
  layers?: SignalValue<number>;
  expansion?: SignalValue<number>;
  irregularity?: SignalValue<number>;
  opacity?: SignalValue<number>;
}

export class PulseField extends Node {
  @initial(3)
  @signal()
  public declare readonly layers: SimpleSignal<number, this>;

  @initial(0)
  @signal()
  public declare readonly expansion: SimpleSignal<number, this>;

  public *pulse(amount = 0.06, duration = 2): ThreadGenerator {
    yield* this.expansion(amount, duration / 2).to(0, duration / 2);
  }

  public *contractToPoint(duration = 1.4): ThreadGenerator {
    yield* all(this.expansion(-0.95, duration), this.opacity(0.2, duration));
  }
}
```

---

## Scene Interpreter

Build a generic scene interpreter rather than codegenning a bespoke scene for every essay:

```tsx
export function makeVisionaryScene(plan: VisionaryScene) {
  return makeScene2D(function* (view) {
    const world = new VisionaryWorld(view);

    for (const spec of plan.initialState) {
      world.create(spec);
    }

    for (const beat of plan.beats) {
      yield* waitUntil(beat.event);

      const animations = beat.actions.map(action => world.execute(action));

      if (beat.subtitle) animations.push(world.subtitles.show(beat.subtitle));
      if (beat.sanskrit) animations.push(world.sanskrit.reveal(beat.sanskrit));

      yield* all(...animations);
    }

    yield* world.prepareHandoff(plan.handoff);
  });
}
```

---

## Timing: Semantic Events

The planner writes:
```json
{ "event": "mantra-is-pulse" }
```

The scene uses:
```ts
yield* waitUntil('mantra-is-pulse');
```

The editor exposes that event on its timeline, draggable to the exact narration cue. `useDuration` can make animation duration depend on the distance between events.

```ts
yield* waitUntil('unmesha-begins');
yield* aperture.open(useDuration('unmesha-hold'));
yield* waitUntil('nimesha-begins');
yield* aperture.close(useDuration('nimesha-end'));
```

---

## Subtitle Engine

Score candidate phrases:

```typescript
score = novelty * 0.25 + rhetoricalForce * 0.25 + memorability * 0.20 + conceptualCentrality * 0.20 + visualPauseAvailability * 0.10;
```

Rules:
- 2–7 words
- One emphasis phrase every 12–20 seconds
- Never repeat a Sanskrit term in English simultaneously
- Never subtitle what the diagram already expresses
- Never place text during a high-complexity transformation

```typescript
type SubtitleRole = 'emphasis' | 'question' | 'quotationFragment' | 'sourceCitation';

const subtitleTheme = {
  fontFamily: 'Source Serif 4',
  fill: ink,
  fontSize: 54,
  lineHeight: 1.15,
  maxWidth: 980,
  y: 365,
};
```

---

## Light and Dark Mode

```typescript
const darkMode = createSignal(false);
const paper = () => (darkMode() ? '#000000' : '#ffffff');
const ink = () => (darkMode() ? '#f6f6f6' : '#111111');
const muted = () => (darkMode() ? '#999999' : '#777777');

<PulseField stroke={() => ink()} secondaryStroke={() => muted()} />
```

---

## Visual Planning Rules for the Agent

1. Narration carries prose.
2. Visuals carry relation, transformation and rhythm.
3. Sanskrit names concepts; English text emphasizes rhetoric.
4. Never illustrate a noun when a process can express the claim.
5. Reuse or transform an existing entity whenever possible.
6. Each beat has one primary visual operator.
7. Maximum three independent motions at once.
8. Maintain at least 35% negative space.
9. Use only approved processes.
10. A scene must end with an entity that can become the next scene.
11. Analogies must transform back into the philosophical system.
12. No random particles unless disorder, multiplicity or field behavior is semantically relevant.
13. No ornamental movement.
14. No visual should merely prevent the screen from being empty.

---

## Agent Planning Output

```json
{
  "sceneId": "breath-mantra",
  "visualThesis": "Breath, mantra and pulse are three appearances of one current.",
  "initialEntity": { "id": "breathStream", "process": "waveReturn" },
  "beats": [
    {
      "event": "say-a-word",
      "meaning": "intention precedes articulation",
      "primaryOperator": "emanate",
      "subject": "breathStream",
      "result": "soundRings",
      "continuity": "preserve-origin"
    },
    {
      "event": "mantra-pulse-taking-shape",
      "meaning": "sound is pulse given determinate form",
      "primaryOperator": "transform",
      "subject": "soundRings",
      "result": "mantraGlyph",
      "sanskrit": "मन्त्र"
    },
    {
      "event": "woven-thrum",
      "meaning": "breath, mantra and pulse are non-separate",
      "primaryOperator": "weave",
      "subjects": ["breathStream", "mantraGlyph", "pulseField"],
      "result": "unifiedCurrent",
      "subtitle": "one woven thrum"
    }
  ],
  "handoff": {
    "preserve": ["unifiedCurrent"],
    "transformInto": "senseObjectConnection"
  }
}
```

---

## Semantic Process Selector

| Meaning in Transcript | Preferred Operators | Preferred Process |
|---|---|---|
| Something subtly alive | pulse, breathe | PulseField |
| One becomes many | emanate, branch | BranchEmanation |
| Many return to one | gather, merge | GatherToCenter |
| Opening and closing | open, close | OpenClose |
| Center governs powers | radiate, turn | WheelHub |
| Influence without contact | resonate, transmit | ResonanceTransfer |
| Distinct streams become one | weave, merge | BraidUnification |
| Perception meets object | connect, disconnect | ConnectDisconnect |
| Levels within levels | nest, cycle | NestedCycles |
| Concealed becomes manifest | unveil, reveal | VeilReveal |
| Self sees itself | reflect, recognize | MirrorReflection |
| Grace or power enters | descend, receive | DescentInvocation |
| Progressive return | ascend, refine | LadderAscent |
| Radical transformation | ignite, consume | FireTransform |
| Freedom and delight | orbit, play | PlayfulOrbit |

---

## Visual QA Loop

For every scene:
1. Render low-resolution preview
2. Extract one frame every 2 seconds
3. Build contact sheet
4. Send contact sheet + visual plan to vision model

The critic scores:

```typescript
type VisualReview = {
  semanticFit: number;
  continuity: number;
  negativeSpace: number;
  textRedundancy: number;
  visualDensity: number;
  sharpness: number;
  comments: string[];
  parameterChanges: ParameterPatch[];
};
```

The critic may only suggest: parameter changes, timing changes, subtitle removal, entity removal, process replacement from the approved registry. It may not redesign the entire scene.

---

## Validation and Linting

```typescript
function lintScene(scene: VisionaryScene): LintIssue[] {
  return [
    ...checkProcessNames(scene),
    ...checkEntityReferences(scene),
    ...checkSubtitleFrequency(scene),
    ...checkSubtitleRedundancy(scene),
    ...checkMaximumConcurrentActions(scene, 3),
    ...checkContinuityRatio(scene, 0.7),
    ...checkHandoff(scene),
    ...checkSacredTerms(scene),
    ...checkDensity(scene),
  ];
}
```

Example failures:
- `ERROR: unknown process "cosmic-galaxy"`
- `ERROR: beat introduces 5 unrelated entities`
- `ERROR: subtitle repeats 11 consecutive narration words`
- `ERROR: scene ends with no continuity handoff`
- `WARNING: three new visual metaphors introduced within 12 seconds`
- `WARNING: quotation scene contains excessive movement`

---

## Development Sequence

### Phase 1: Prove the Runtime
Build: `PulseField`, `WheelHub`, `BranchEmanation`, `WaveReturn`, `ResonanceTransfer`, `SubtitleSystem`, `SanskritSystem`. Implement one 60-90 second scene manually.

### Phase 2: Build the Interpreter
Create the JSON schema. Make one scene run entirely from `visual-plan.json`.

### Phase 3: Add the Planner
Transcript → rhetorical beats → constrained visual plan. Do not add vision yet.

### Phase 4: Add Visual Review
Render previews and use a vision model to patch parameters.

### Phase 5: Produce the Full Essay
Render approximately 8 scene chunks and finish them in FableCut.

---

## Repository Structure

```
visionary-engine/
├── content/
│   └── spanda/
│       ├── transcript.md
│       ├── narration.wav
│       ├── words.json
│       ├── rhetoric.json
│       ├── visual-plan.json
│       └── reviews/
├── src/
│   ├── project.ts
│   ├── theme/ (palette.ts, typography.ts, spacing.ts)
│   ├── grammar/ (schema.ts, operators.ts, process-registry.ts, mappings.ts, lint.ts)
│   ├── runtime/ (VisionaryWorld.ts, SceneInterpreter.ts, EntityStore.ts, SubtitleSystem.tsx, SanskritSystem.tsx)
│   ├── processes/ (PulseField.tsx, OpenClose.tsx, WheelHub.tsx, ...)
│   └── scenes/ (hidden-pulse.tsx, wheel-of-powers.tsx, ...)
├── agents/ (rhetorical-parser.md, visual-planner.md, visual-critic.md)
├── scripts/ (transcribe.ts, plan.ts, validate-plan.ts, contact-sheet.ts, render-scenes.ts)
└── schemas/ (visionary-plan.schema.json)
```

---

## The Universal Metaphysical Visualization Engine (UMVE)

### Core Insight

Every mature metaphysical system is fundamentally a **process ontology**, not a collection of doctrines. Tantrāloka, Neoplatonism, Ibn 'Arabī, Dzogchen, Lurianic Kabbalah, German Idealism — all are describing **transformations of awareness**. The engine should therefore compile **metaphysical transformations**, not animations.

### Three Layers

#### Layer 1 — Meaning

Pure ontology. No graphics.

```yaml
Shiva → Shakti → Sadāśiva → Īśvara → Śuddhavidyā
```

#### Layer 2 — Visual Grammar

The planner converts ontology into canonical operations using tradition-agnostic operators:

| Manifestation | Return | Awareness | Relationship | Dynamic |
|--------------|--------|-----------|--------------|---------|
| emanate | withdraw | self-reflect | contain | pulse |
| overflow | contract | illuminate | participate | cycle |
| express | simplify | recognize | mirror | spiral |
| differentiate | merge | conceal | generate | descend |
| articulate | dissolve | reveal | transmit | ascend |
| condense | recollect | forget | resonate | orbit |
| solidify | — | remember | bridge | stabilize |

#### Layer 3 — Motion Canvas

Only now do we produce concrete animation code from the canonical operators.

### Abhinava's Verbs as First-Class Operators

Instead of generic geometry operators, the engine understands the metaphysical verbs of the tradition:

```yaml
prakāśa      — light/illumination
vimarśa      — reflective awareness
spanda       — vibration
ābhāsa       — appearance
unmeṣa       — opening/unfolding
nimeṣa       — closing/withdrawal
visarga      — emission
saṃhāra      — contraction/reabsorption
pratyabhijñā — recognition
```

`unmeṣa` expands into: aperture opens, pulse amplitude rises, wheel spokes lengthen, particles move outward, subtitle brightness rises — all simultaneously. One philosophical operator, many visual consequences.

### Universal Entity Types

Not circles, text, and arrows — but archetypes:

```
Center | Field | Current | Threshold | Mirror | Branch
Axis | Boundary | Seed | Wave | Ladder | Veil
Network | Container | Breath | Window | Horizon
Point | Orbit | Flame | Body
```

Every tradition maps onto these:

| Kashmir Shaivism | Neoplatonism | Ibn Arabi | Lurianic | Buddhist |
|-----------------|--------------|-----------|----------|----------|
| Paramashiva → Center | The One → Center | al-Haqq → Center | Ein Sof → Field | Dharmakaya → Field |
| Shakti → Current | Overflow → Current | Tajalli → Reveal | Tzimtzum → Contract | Rigpa → Center |
| Spanda → Pulse | Nous → Reflection | Ayan Thabita → Seeds | Kav → Current | Dependent Arising → Network |
| Maya → Veil | World Soul → Branch | Nafas ar-Rahman → Breath | Sefirot → Branch | Emptiness → Transparency |
| 36 Tattvas → Nested Branches | Matter → Condensed Boundary | Insan al-Kamil → Mirror | Shevirah → Fracture | Recognition → Mirror |
| Recognition → Mirror | Epistrophe → Return | — | Tikkun → Gather | — |

### Architecture

```
Natural language
    ↓
Metaphysical Parser (identifies claims, analogies, definitions, quotations, transitions)
    ↓
Canonical Ontology IR (entities, operators, relations, states — tradition-agnostic)
    ↓
Tradition Mapper (translates tradition-specific concepts ↔ canonical operators)
    ↓
Visual Grammar IR (visual archetypes, pacing, continuity, composition)
    ↓
Motion Canvas Compiler (generates concrete animations from approved process library)
    ↓
Video
```

### Why This Matters

1. **Consistency** — every video shares the same visual language because all roads pass through the same canonical IR.
2. **Extensibility** — adding a new tradition is authoring an ontology pack, not rewriting the renderer.
3. **Comparative scholarship** — different traditions compile into comparable process graphs, explicitly showing where systems converge, diverge, or use different vocabularies for similar patterns.

### The Final Thesis

The engine should not ask an LLM: "What should this look like?"

It should ask: **"Which transformation is this passage describing?"**

The model answers: `emanation`, `return`, `recognition`, `concealment`, `resonance`.

The compiler translates that metaphysical operator into 30-50 concrete animation operations according to the house style — the stable visual identity built from approved Motion Canvas components. The LLM never writes animation code. It writes ontology. That is how the system becomes genuinely intelligent without needing the taste to invent a visual language from scratch.

---

### Implementation: Ontology Engine

A concrete implementation of this architecture lives at `content/ontology-engine/`:

- **22 canonical relations** (≡ → ≋ ≅ ≠) bridging all traditions
- **16 semantic operators** (appear, pulse, recognize, self_manifest, procession, condition_arise, repair…)
- **24 visual archetypes** mapping operators to geometric primitives
- **12 ontology packs** (Trika, Plotinus, Proclus, Iamblichus, Ficino, Advaita, Buddhist, Madhyamaka, Yogacara, Lurianic, Hermetic Qabalah, Modern Bridge)
- **6-pass compiler**: semantic validation → guard engine → visual planner → asset resolver → macro expander → renderer backend
- **Claim Graph layer** (ADR 0002): provenance back to primary textual evidence
- **Non-equivalence rules**: explicit guardrails preventing false cross-traditional conflation
- **Python runtime** (`src/ontology_engine.py`) that loads packs, compiles scenes, and cross-maps entities

See `content/ontology-engine/README.md` and `operations/COMPLETE-REFERENCE.md` §8 for details.
