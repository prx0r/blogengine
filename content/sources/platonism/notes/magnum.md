# Re-Rendering Atlas: Anti-Hallucination Guide and Standardized Reasoning Traces

## 0. Core rule

The AI must not invent the map.

The graph is the brain.
The LLM is the interpreter.
The source cards are the evidence bridge.
The user's personal graph is private context.
The Q&A base is reviewed memory.

Every answer must be generated from a structured packet:

```text id="u8yx37"
user claim
→ normalized claim
→ phase placement
→ assumption detected
→ graph neighborhood
→ evidence tier
→ risks
→ correctives
→ source cards
→ answer
→ suggested practice
```

The AI may explain, compare, and synthesize.
The AI may not fabricate historical influence, lineage, textual evidence, source quotes, or spiritual authority.

---

# 1. Predefined tradition registry

Traditions must be defined before use.

The AI should not casually introduce "Gnosticism," "Kabbalah," "Tantra," "Neoplatonism," "Dzogchen," "Hermeticism," "Sufism," "Theosophy," "New Age," etc. without mapping them to a registered tradition node.

## Tradition schema

```ts id="f1jf34"
type Tradition = {
  id: string;
  label: string;
  aliases?: string[];

  stream: string;
  period?: string;
  geography?: string[];

  definition: string;

  coreClaims: string[];
  corePractices?: string[];
  coreTexts?: string[];
  representativeFigures?: string[];

  evidenceTier: EvidenceTier;

  useFor: string[];
  doNotUseFor: string[];

  commonCategoryErrors: string[];
  risks: string[];
  correctives: string[];

  relatedTraditions?: {
    traditionId: string;
    relation:
      | "historical_influence"
      | "reception"
      | "translation_transmission"
      | "conceptual_parallel"
      | "shared_vocabulary"
      | "modern_adaptation"
      | "appropriation_risk";
    note: string;
  }[];

  status: "draft" | "review_needed" | "approved" | "deprecated";
};
```

## Example: Neoplatonism

```json id="ufjeyu"
{
  "id": "tradition-neoplatonism",
  "label": "Neoplatonism",
  "aliases": ["Late Antique Platonism"],
  "stream": "Greek Platonism / Neoplatonism",
  "period": "Late Antiquity",
  "geography": ["Mediterranean"],
  "definition": "A late antique Platonic tradition centered on the One, Intellect, Soul, emanation, participation, ascent, and return.",
  "coreClaims": [
    "Reality is hierarchically ordered.",
    "Multiplicity proceeds from a higher unity.",
    "The soul can turn back toward its source.",
    "Philosophy and theurgy can participate in higher order."
  ],
  "corePractices": [
    "contemplation",
    "philosophical purification",
    "theurgy in Iamblichean forms"
  ],
  "coreTexts": [
    "Plotinus — Enneads",
    "Iamblichus — On the Mysteries",
    "Proclus — Elements of Theology"
  ],
  "representativeFigures": [
    "Plotinus",
    "Porphyry",
    "Iamblichus",
    "Proclus"
  ],
  "evidenceTier": "serious_interpretive",
  "useFor": [
    "emanation",
    "participation",
    "theurgy",
    "Western esoteric lineage"
  ],
  "doNotUseFor": [
    "proving modern magic",
    "claiming all mysticism is Platonism",
    "collapsing Buddhism or Tantra into Greek metaphysics"
  ],
  "commonCategoryErrors": [
    "Treating conceptual similarity as historical influence.",
    "Flattening Neoplatonic hierarchy into generic nonduality."
  ],
  "risks": [
    "metaphysical system possession",
    "hierarchy inflation"
  ],
  "correctives": [
    "Madhyamaka anti-reification",
    "historical distinction",
    "praxis"
  ],
  "status": "approved"
}
```

## Example: Gnosticism

```json id="cx0lnv"
{
  "id": "tradition-gnosticism",
  "label": "Gnosticism",
  "aliases": ["ancient gnosis", "gnostic movements"],
  "stream": "Hermetic / Gnostic / Salvational Cosmology",
  "period": "Late Antiquity",
  "definition": "A family of ancient salvational religious movements centered on gnosis, divine spark, cosmic ignorance, archonic powers, demiurgic creation in some systems, and return to a higher divine source.",
  "coreClaims": [
    "Ordinary worldly existence is bound by ignorance.",
    "Saving knowledge discloses the soul's deeper origin.",
    "Cosmic powers may obstruct liberation.",
    "The visible world is not ultimate."
  ],
  "coreTexts": [
    "Nag Hammadi texts",
    "Gospel of Thomas",
    "Apocryphon of John",
    "Valentinian materials"
  ],
  "evidenceTier": "serious_interpretive",
  "useFor": [
    "salvational cosmology",
    "hidden knowledge structures",
    "ancient archon/demiurge frameworks",
    "comparison with modern UFO/channeling myths only as conceptual parallel"
  ],
  "doNotUseFor": [
    "claiming every hidden-control theory is Gnosticism",
    "equating Galactic Federation directly with ancient Gnosticism",
    "treating modern conspiracy cosmologies as historically Gnostic"
  ],
  "commonCategoryErrors": [
    "Calling any cosmic hierarchy Gnosticism.",
    "Mistaking structural resemblance for direct lineage."
  ],
  "risks": [
    "cosmic paranoia",
    "special knowledge inflation",
    "world-rejection"
  ],
  "correctives": [
    "historical distinction",
    "Madhyamaka",
    "praxis",
    "fruit-test"
  ],
  "status": "approved"
}
```

## Example: Tantra

```json id="jaln47"
{
  "id": "tradition-tantra",
  "label": "Tantra",
  "stream": "Sanskrit / Buddhist / Tibetan",
  "definition": "A diverse family of South Asian religious technologies using mantra, deity, subtle body, ritual, initiation, visualization, and transformed identity to reorder body, speech, mind, and cosmos.",
  "coreClaims": [
    "Body, speech, and mind can be ritually transformed.",
    "Sound, image, gesture, and deity-form can function as technologies of realization.",
    "Ordinary identity can be re-rendered through consecrated symbolic embodiment."
  ],
  "corePractices": [
    "mantra",
    "nyāsa",
    "deity yoga",
    "maṇḍala",
    "subtle body practice",
    "ritual offering"
  ],
  "evidenceTier": "historical_ritual",
  "useFor": [
    "body-speech-mind reordering",
    "ritual technology",
    "mantra theory",
    "deity-body reconstruction"
  ],
  "doNotUseFor": [
    "generic energy mysticism",
    "ego inflation",
    "unqualified sexualized interpretations",
    "proof of New Age manifestation claims"
  ],
  "commonCategoryErrors": [
    "Treating all energy work as Tantra.",
    "Treating deity identity as ego empowerment.",
    "Ignoring initiation, ethics, lineage, and context."
  ],
  "risks": [
    "energy chasing",
    "spiritual bypass",
    "inflation",
    "appropriation"
  ],
  "correctives": [
    "ethics",
    "grounding",
    "qualified tradition",
    "Madhyamaka",
    "teacher/context"
  ],
  "status": "approved"
}
```

---

# 2. Relationship discipline

The AI must distinguish relation types.

Never use "influenced" unless the graph has an approved historical edge.

## Approved relation types

```ts id="zrbjjl"
type RelationKind =
  | "historical_influence"
  | "reception"
  | "translation_transmission"
  | "conceptual_parallel"
  | "shared_vocabulary"
  | "modern_adaptation"
  | "appropriation_risk"
  | "corrective_relation"
  | "practice_resonance";
```

## Relation rules

### Historical influence

Use only when there is approved evidence.

Example:

```text id="j4rqwu"
Plato → Plotinus
Iamblichus → Proclus
Neoplatonism → Ficino
Kabbalah → Christian Cabala
Golden Dawn → Regardie
```

### Reception

Use when a later tradition receives/adapts earlier material.

Example:

```text id="zaq96x"
Jewish Kabbalah → Christian Cabala
Hermeticism → Renaissance Hermeticism
Neoplatonism → Pseudo-Dionysius
```

### Conceptual parallel

Use when two systems resemble each other structurally but no direct influence is claimed.

Example:

```text id="3tcs9q"
Campbell ↔ Leibniz
Hoffman ↔ Kant
Iamblichean theurgy ↔ Tantra
Dzogchen ↔ Burbea soulmaking
```

### Category warning

Use when a user's claim risks collapse between domains.

Example:

```text id="fhvgew"
"Quantum physics proves magic"
→ category_error_warning
```

---

# 3. Evidence-tier discipline

Every claim must carry an evidence tier.

```ts id="6ojlbw"
type EvidenceTier =
  | "established"
  | "serious_interpretive"
  | "speculative"
  | "visionary_mythic"
  | "historical_ritual"
  | "practice_validated";
```

## Tier definitions

### established

Use for claims strongly supported in mainstream scholarship/science/history.

Example:

```text id="773rlp"
Newton developed laws of motion and universal gravitation.
Kant argues experience is structured by forms/categories.
Turing formalized computation.
```

### serious_interpretive

Use for respected philosophical, historical, psychological, or comparative interpretations.

Example:

```text id="3f1fk1"
Jungian archetypes.
Corbin's imaginal interpretation.
Bhartṛhari as language ontology.
Marx as critique of ideology/alienation.
```

### speculative

Use for metaphysical models not established as fact.

Example:

```text id="ip3497"
Hoffman conscious agents as ontology.
Campbell MBT.
Wolfram ruliad as metaphysics.
Astrology as symbolic interface in a larger code.
```

### visionary_mythic

Use for channeling, visionary cosmology, occult cosmology, Steiner, Seth, Galactic Federation material.

Example:

```text id="s1assc"
Steiner cosmology.
Seth material.
Galactic Federation.
Dolores Cannon.
```

### historical_ritual

Use for historically attested ritual systems whose metaphysical claims are not treated as established facts.

Example:

```text id="eqaq5u"
Picatrix planetary magic.
Agrippa.
Golden Dawn ritual.
PGM.
Tantric ritual manuals.
```

### practice_validated

Use for claims framed as pragmatic practice mechanisms rather than objective metaphysical proof.

Example:

```text id="i3on01"
Noting contact/feeling/sign reduces reactivity.
Body grounding stabilizes altered-state practice.
Journaling recurring symbols clarifies patterns.
```

---

# 4. Standard reasoning trace

Every AI answer should internally follow this trace.

The full trace does not need to be shown to the user unless debug mode is enabled.

## Internal trace

```ts id="uoc0j4"
type ReasoningTrace = {
  userInput: string;

  normalizedClaim: string;

  claimType:
    | "historical"
    | "conceptual_comparison"
    | "metaphysical"
    | "practice_question"
    | "personal_note"
    | "risk_signal"
    | "source_question"
    | "lineage_question";

  primaryPhase: string;
  secondaryPhases?: string[];

  detectedAssumptions: string[];

  graphSeeds: string[];

  retrievedNodes: string[];
  graphPath: string[];

  relationTypesUsed: RelationKind[];

  evidenceTier: EvidenceTier;

  sourceCardsUsed: string[];

  risksDetected: string[];
  correctivesSuggested: string[];

  categoryWarnings: string[];

  answerFrame:
    | "yes_but"
    | "no_but"
    | "partial_parallel"
    | "historical_distinction"
    | "practice_instruction"
    | "risk_correction"
    | "source_grounded_summary";

  finalPracticeOrInquiry?: string;

  confidence:
    | "low"
    | "medium"
    | "high";

  needsHumanReview: boolean;
};
```

## User-visible reasoning trace

Show a compact trace, not hidden chain-of-thought.

Example:

```text id="8m2tn3"
Map trace:
Claim type: conceptual parallel
Primary phase: Visionary Cosmologies
Evidence tier: speculative
Relation used: conceptual parallel, not historical influence
Risk detected: over-literalization
Corrective: Madhyamaka + fruit-test + practice grounding
```

Never expose private hidden chain-of-thought. Expose structured reasoning trace only.

---

# 5. Standard answer format

All Atlas-mode answers should follow this structure.

```text id="5ghy84"
1. Direct answer
2. Graph placement
3. Relation type
4. Evidence tier
5. What it clarifies
6. Main risk/category error
7. Corrective
8. Practice/inquiry
```

## Example

User:

```text id="p5sl4n"
"Campbell is modern Leibniz."
```

Answer frame:

```text id="9716v1"
Direct answer:
Partial yes, but as a conceptual parallel, not a historical lineage.

Graph placement:
Leibniz belongs to Phase 0/2 as a perspectival metaphysical counter-current to dead matter.
Campbell belongs to Phase 14 as speculative nonordinary/VR consciousness cosmology.

Relation type:
Conceptual parallel.

Evidence tier:
Speculative for the metaphysical comparison; established only for basic historical placement.

Clarification:
Both resist crude materialism and treat apparent physical reality as derivative from deeper units/processes.

Risk:
Flattening Leibniz into simulation theory or treating Campbell as proven metaphysics.

Corrective:
Historical distinction + Madhyamaka anti-reification.

Practice:
Use the comparison as a lens, then return to direct observation: how is this moment being rendered?
```

---

# 6. Standard Guide-mode answer format

Guide mode may use personal notes.

Structure:

```text id="cvgc0x"
1. Pattern seen
2. Personal evidence used
3. Global phase/risk mapping
4. Corrective practice
5. One next action
6. Optional logging prompt
```

Example:

```text id="ih3hdq"
Pattern:
You are moving from Phase 14 nonordinary curiosity into risk: attention collapse / map addiction.

Personal evidence:
Your notes mention Gateway at night, drowsiness, blackness/shapes, and losing focus.

Global mapping:
Gateway/hypnagogic practice maps to Nonordinary Rendering.
Losing focus maps to attention collapse.
The corrective is shorter practice + body anchor + contact/feeling/sign labeling.

Next action:
Do 10 minutes only. When shapes appear, label:
seeing → feeling-tone → sign → pull → story.
Then stop before you get foggy.
```

Guide mode must not over-pathologize. It should offer grounded practice, not diagnosis.

---

# 7. Claim-type routing

The claim classifier must route the user input before answering.

## Claim types

```ts id="5ng9xj"
type ClaimType =
  | "historical"
  | "lineage_question"
  | "conceptual_comparison"
  | "metaphysical"
  | "practice_question"
  | "personal_note"
  | "risk_signal"
  | "source_question"
  | "definition_question"
  | "truthcore_candidate";
```

## Routing rules

### Historical / lineage question

Must check approved historical edges or source cards.

If missing:

```text id="xf40zs"
"The atlas does not currently have an approved historical edge here."
```

Use:

```text id="5r0csw"
historical_influence
reception
translation_transmission
```

Do not use conceptual similarity as historical influence.

### Conceptual comparison

Use:

```text id="f5rm2v"
conceptual_parallel
practice_resonance
shared_vocabulary
```

State clearly:

```text id="yfoxsh"
"This is a conceptual parallel, not a proven lineage."
```

### Metaphysical claim

Must include evidence tier and risk.

Example:

```text id="67pnp5"
"Reality is a simulation."
```

Needs:

```text id="s28hfp"
phase placement
evidence tier
risk of over-literalization
corrective
practice inquiry
```

### Practice question

Must produce a concrete practice.

No abstract answer only.

### Personal note

Must map to personal graph and global risk/practice.

### Risk signal

If user says things like:

```text id="1l2s58"
"I keep looping"
"I can't stop reading"
"I feel chosen"
"I'm getting messages"
"I think I found the final map"
```

Route to risk/corrective mode.

---

# 8. Common hallucination traps

## Trap 1 — Fake historical influence

Bad:

```text id="wjdenm"
"Tantra influenced Iamblichus."
```

Unless graph has evidence, say:

```text id="a1iy22"
"There is a conceptual parallel between theurgic and tantric ritual re-rendering, but the atlas does not mark this as historical influence."
```

## Trap 2 — Quantum proves spirituality

Bad:

```text id="jkryfv"
"Quantum mechanics proves consciousness creates reality."
```

Better:

```text id="mcnm5e"
"Quantum theory breaks crude classical realism, but it does not by itself prove magical, idealist, or spiritual claims."
```

## Trap 3 — Visionary material as fact

Bad:

```text id="xyhq0s"
"The Galactic Federation is guiding humanity."
```

Better:

```text id="fzun1c"
"The atlas classifies Galactic Federation material as visionary_mythic: potentially meaningful as modern mythic/channeling cosmology, but not treated as reliable factual testimony."
```

## Trap 4 — All traditions are the same

Bad:

```text id="gxiqfv"
"Dzogchen, Neoplatonism, Sufism, and Kabbalah all teach the same thing."
```

Better:

```text id="o9ajze"
"They can be compared as distinct responses to the rendering problem, but the atlas does not collapse them into one doctrine."
```

## Trap 5 — Practice bypass

Bad:

```text id="3039r3"
"If everything is empty, no practice is needed."
```

Better:

```text id="gczmrj"
"Emptiness corrects reification; it does not cancel ethics, training, embodiment, or conduct."
```

## Trap 6 — Symbol removes responsibility

Bad:

```text id="8v468d"
"My chart made me do it."
```

Better:

```text id="6g5a8c"
"Astrology may symbolize patterns, but the atlas treats responsibility, repair, and praxis as non-negotiable correctives."
```

## Trap 7 — Channeling dependency

Bad:

```text id="lv2ygq"
"Ask the entity what I should do."
```

Better:

```text id="fqbxt3"
"Guidance must be tested by fruits: clarity, humility, discipline, embodiment, kindness, and concrete action."
```

---

# 9. Category-error warning library

Implement these as reusable warning nodes.

```yaml id="e0f2yz"
warnings:
  - id: warning-physics-magic
    label: "Physics does not prove magic"
    statement: "Physics may de-solidify crude matter, but it does not automatically validate ritual or occult claims."

  - id: warning-godel-soul
    label: "Gödel does not prove souls"
    statement: "Gödel-style arguments challenge some forms of formalism, but do not establish a soul ontology."

  - id: warning-conceptual-not-historical
    label: "Conceptual parallel is not historical influence"
    statement: "Structural resemblance between systems should not be presented as lineage."

  - id: warning-channeling-testimony
    label: "Channeling is not reliable testimony by default"
    statement: "Channeling may be imaginally meaningful but should not be treated as automatically factual."

  - id: warning-nonduality-ethics
    label: "Nonduality does not cancel ethics"
    statement: "Nondual or emptiness language must not be used to skip conduct, compassion, or responsibility."

  - id: warning-symbol-responsibility
    label: "Symbol does not remove responsibility"
    statement: "Astrology, tarot, dreams, or omens may illuminate patterns but do not remove agency or repair."

  - id: warning-ritual-power
    label: "Ritual power invites inflation"
    statement: "Ritual can stabilize attention and meaning, but can also feed control fantasy and specialness."
```

---

# 10. Source-use rules

## The AI can say

```text id="1r0yam"
"The source card says…"
"The graph currently places this under…"
"The atlas marks this as speculative…"
"This relation is only conceptual, not historical…"
"This needs source review…"
```

## The AI cannot say

```text id="qbcl2p"
"The text proves…"
"Scholars agree…" unless source card says so
"This lineage definitely caused…" without approved historical edge
"This practice will produce…" without evidence/practice caveat
```

## No fake quotes

The AI must never invent quotes.

If an exact quote is needed but not available in source packet:

```text id="l070a7"
"I do not have an approved quote attached here yet."
```

---

# 11. Approved answer evaluator

Every generated answer should be scored before saving as Q&A.

Evaluator checklist:

```ts id="264lff"
type AnswerEvaluation = {
  correctPhasePlacement: boolean;
  relationTypeDeclared: boolean;
  evidenceTierDeclared: boolean;
  noFakeHistoricalInfluence: boolean;
  riskIncluded: boolean;
  correctiveIncluded: boolean;
  practiceIncluded: boolean;
  categoryErrorsAvoided: boolean;
  sourceClaimsSupported: boolean;
  speculativeClaimsMarked: boolean;
  personalPrivacyRespected: boolean;

  overall:
    | "pass"
    | "needs_rewrite"
    | "human_review";

  critique?: string;
};
```

If `needs_rewrite`, regenerate once using critique.

If `human_review`, save Q&A as:

```text id="mwhjdi"
review_needed
```

---

# 12. Standard graph packet requirements

Before answer generation, graph packet must include:

```text id="4d0cl3"
primaryPhase
detectedAssumptions
replacementModel
evidenceTier
relationTypes
risks
correctives
categoryWarnings
sourceCards or explicit "no source cards available"
suggestedPractice
```

If any of these are missing, answer generator must either:

```text id="cjhpee"
ask for clarification
or answer with explicit uncertainty
or mark answer as review_needed
```

---

# 13. Tradition definition requirement

Before a tradition appears in a generated answer, the system must check:

```text id="f5qyz4"
Does tradition node exist?
Is status approved or review_needed?
What is its definition?
What are its do-not-use rules?
What category errors apply?
```

If no tradition node exists:

```text id="fi2nfg"
"The atlas does not yet have a defined tradition node for this, so I'll treat it cautiously as an undefined/needs-review term."
```

Then classify as:

```text id="a70pys"
needs_graph_review
```

---

# 14. User-visible uncertainty language

Use clear language.

## For weak evidence

```text id="jklc14"
"The atlas currently marks this as speculative."
"This is useful as a lens, not established fact."
"This is a conceptual bridge, not a proven lineage."
"This needs source-card review."
```

## For strong evidence

```text id="41f8t8"
"The historical placement is well-established, but the metaphysical interpretation is still interpretive."
"The practice claim is treated pragmatically, not as proof of the cosmology."
```

## For visionary material

```text id="s1xryd"
"Use this as visionary/mythic material, not as reliable external testimony."
```

---

# 15. Trace examples

## Example 1: "Quantum physics proves magic"

```json id="9okvar"
{
  "normalizedClaim": "Quantum physics validates magical practice.",
  "claimType": "metaphysical",
  "primaryPhase": "Physical De-solidification",
  "secondaryPhases": ["Ritual Re-Rendering"],
  "detectedAssumptions": [
    "Because physics de-solidifies matter, ritual claims are validated."
  ],
  "relationTypesUsed": ["category_error_warning"],
  "evidenceTier": "speculative",
  "risksDetected": ["category_error", "occult_inflation"],
  "correctivesSuggested": ["epistemic_tiering", "fruit_test", "Madhyamaka"],
  "categoryWarnings": ["Physics does not prove magic"],
  "answerFrame": "no_but",
  "confidence": "high",
  "needsHumanReview": false
}
```

User-facing answer should say:

```text id="yzvarg"
No — quantum physics does not prove magic. It does help break crude materialism, but that is not the same as validating ritual claims. In the atlas, this belongs between Phase 2 and Phase 12 with a category-error warning.
```

## Example 2: "Galactic Federation is Gnosticism"

```json id="z4v45w"
{
  "normalizedClaim": "Modern Galactic Federation material is structurally similar to Gnostic cosmology.",
  "claimType": "conceptual_comparison",
  "primaryPhase": "Visionary Cosmologies",
  "secondaryPhases": ["Hermetic / Gnostic Salvational Cosmology"],
  "relationTypesUsed": ["conceptual_parallel", "modern_adaptation"],
  "evidenceTier": "visionary_mythic",
  "risksDetected": ["cosmic_specialness", "channeling_dependency"],
  "correctivesSuggested": ["historical_distinction", "fruit_test", "praxis"],
  "categoryWarnings": ["Conceptual parallel is not historical influence"],
  "answerFrame": "partial_parallel",
  "confidence": "medium",
  "needsHumanReview": false
}
```

## Example 3: "Did Gateway, blackness and shapes, lost focus"

```json id="l3l0e9"
{
  "normalizedClaim": "User had unstable hypnagogic attention during Gateway practice.",
  "claimType": "personal_note",
  "primaryPhase": "Nonordinary Rendering",
  "detectedAssumptions": [
    "Blackness/shapes may be meaningful nonordinary phenomena."
  ],
  "evidenceTier": "practice_validated",
  "risksDetected": ["attention_collapse", "state_chasing"],
  "correctivesSuggested": ["body_anchor", "shorter_session", "contact_feeling_sign_protocol"],
  "answerFrame": "practice_instruction",
  "confidence": "medium",
  "needsHumanReview": false
}
```

---

# 16. Anti-hallucination system prompt

Use this as the answer-generation system prompt.

```text id="84p2br"
You are the Re-Rendering Atlas AI Guide.

You do not invent the map.
You answer from the provided graph packet, source cards, approved Q&A, and personal context only.

Always distinguish:
- historical influence
- reception
- translation/transmission
- conceptual parallel
- practice resonance
- speculative metaphysical comparison

Never present conceptual similarity as historical influence.

Always state or imply the evidence tier when the claim is metaphysical, visionary, occult, scientific, or historical.

If a source card or quote is not provided, do not invent one.

If a tradition is not defined in the tradition registry, mark it as undefined/needs-review.

For Atlas mode:
Answer with graph placement, relation type, evidence tier, risk/corrective, and a practice or inquiry.

For Guide mode:
Use personal notes only if supplied or authorized. Map the note to phase/risk/practice. Give one grounded next action.

Never treat visionary/channeling material as established factual testimony.
Never claim physics proves magic.
Never let astrology, ritual, dreams, or symbols remove ethical responsibility.
Never use emptiness/nonduality to bypass ethics or practice.
Never encourage inflation, cosmic specialness, or dependency on external guidance.

The graph is the brain.
You are the interpreter.
```

---

# 17. Anti-hallucination developer checklist

Before release, test these cases:

```text id="7fkjnb"
1. Unknown tradition term
2. Known tradition term with approved definition
3. Conceptual parallel mistaken as influence
4. Visionary claim
5. Physics-to-magic category error
6. Nonduality ethics bypass
7. Personal note in Guide mode
8. Personal note in Atlas mode
9. Request for exact quote without source
10. User asks for "the final truth"
```

Expected behavior:

```text id="c4637f"
explicit uncertainty
correct evidence tier
no fake quote
no fake lineage
risk/corrective included
practice grounded
privacy respected
```

---

# 18. Final instruction

The Re-Rendering Atlas must standardize reasoning before scaling content.

Do not add more traditions faster than the system can define them.
Do not add more source texts faster than the system can classify their role.
Do not add more AI autonomy faster than the evaluator can catch errors.

Every answer should leave a trace:

```text id="ll9ktn"
What claim was normalized?
Which phase was used?
Which tradition definitions were invoked?
Which relation type was used?
Which evidence tier was assigned?
Which risks were detected?
Which correctives were selected?
Which source cards supported it?
What practice was suggested?
```

This trace is the anti-hallucination spine of the product.

The big thing: **tradition definitions become guardrails**. Before the AI can use a tradition, it must know what that tradition is, what it is useful for, and what it must not be used to claim.

Below is the final coding-agent spec. It assumes: **React Flow atlas first, GraphRAG guide second, personal notes third, source RAG fourth, fine-tuning data much later**.

# Re-Rendering Atlas: Final Product + Build Specification

## 0. Product thesis

Build a web app that maps any metaphysical, spiritual, philosophical, psychological, scientific, or practice-related claim into a curated typed knowledge graph.

The graph is the reasoning substrate.
The AI is the interpreter.
The user's private practice history is the personalization layer.
The Q&A base is the learning memory.
The sources are the evidence layer.

The core flow is:

```text
visual atlas
→ curated graph ontology
→ GraphRAG AI guide
→ personal practice memory
→ source-grounded responses
→ approved reusable Q&A
→ later fine-tuning/evaluation data
```

The product must not become an esoteric Wikipedia. Every node should help answer at least two of:

```text
What assumption does this break?
What does it replace it with?
What practice does it enable?
What risk does it create?
What corrective balances it?
How does it incarnate in life?
```

---

# 1. Core layers

## Layer 1 — Global Atlas

Public/shared curated graph.

Contains:

```text
streams
phases
traditions
figures
texts
concepts
assumptions
claims
replacement models
practices
risks
correctives
warnings
source cards
```

Purpose:

```text
"Where does this idea belong in the map?"
```

This layer can be shallow at first. It needs clean ontology more than full source RAG.

## Layer 2 — AI Guide

GraphRAG interpreter.

Input example:

```text
"Astrology is part of the code."
```

Pipeline:

```text
classify claim
→ locate phase
→ retrieve graph nodes
→ detect risk/category errors
→ retrieve source cards if available
→ answer
→ suggest practice
→ save Q&A record
```

Purpose:

```text
"Explain this claim using the map, without hallucinating."
```

Build with curated graph context first. Add source RAG later.

## Layer 3 — Personal Practice Memory

Private per-user graph.

Contains:

```text
journal entries
practice sessions
dreams
ritual notes
book notes
insights
questions
symbols
risk events
mood patterns
guidance hypotheses
progress markers
```

Purpose:

```text
"Given my actual practice history, what pattern am I in and what should I do next?"
```

Important: keep this graph private and separate from the global graph.

## Layer 4 — Global Q&A Knowledge Base

Shared reusable answer memory.

Stores:

```text
common claims
normalized claims
generated answers
approved answers
graph paths used
source packets used
feedback
corrections
deprecated answers
```

Purpose:

```text
make the AI faster, more consistent, and eventually create training/evaluation data
```

Do not treat all generated answers as truth. Use review states.

---

# 2. Required tech stack

## Frontend

Use:

```text
Next.js or Remix
React Flow / xyflow
Zustand
MDX drawers
Tailwind or similar
MiniSearch/Fuse.js for local search
```

React Flow is suitable because it supports custom node-based editors, expand/collapse patterns, subflows, grouping, and integrations with layout tools like Dagre and ELK. Use React Flow for the visual atlas and graph exploration UI. ([React Flow][1])

## Backend / edge

Use:

```text
Cloudflare Pages
Cloudflare Workers
Cloudflare AI Gateway
Cloudflare Vectorize
Cloudflare R2
Cloudflare D1
Durable Objects later if needed
```

Cloudflare Workers/AI Gateway/Vectorize fit the app because AI Gateway provides model observability, caching, rate limits, retries, fallback, and spend-control style features, while Vectorize is a distributed vector database for semantic search and LLM memory/context use cases. ([Cloudflare Docs][2])

## Model provider

Use:

```text
DeepSeek API
```

DeepSeek exposes an OpenAI/Anthropic-compatible API format, so it can be called through standard SDK-style patterns or direct fetch calls. Use JSON output/tool-calling style calls for classifiers and evaluators. ([DeepSeek API Docs][3])

## Graph database

Use:

```text
Neo4j Aura or self-hosted Neo4j
```

Neo4j is the long-term graph brain. Use it for multi-hop path queries:

```text
claim → assumption → replacement model → practice → risk → corrective → incarnation
```

Neo4j has an official GraphRAG ecosystem/package and is well-suited for graph retrieval augmented generation. ([GitHub][4])

## Layout engines

Use:

```text
Dagre for simple horizontal phase/path layouts
ELK.js for complex layered graph layouts
Manual positions for the curated homepage path
```

Do not use force-directed layout for the main teaching path. It will make the sequence harder to understand.

---

# 3. Build order

Do not overbuild. Implement in this order.

## Build cycle 1 — Static ontology + atlas

Deliver:

```text
YAML content files
Zod validation
React Flow atlas
clickable node drawer
phase view
assumption view
risk/corrective view
```

No AI needed yet.

## Build cycle 2 — Claim classifier

Deliver:

```text
POST /api/claim/analyze
DeepSeek JSON classifier
phase/assumption/risk detection
deterministic graph retrieval
```

No full source RAG yet.

## Build cycle 3 — AI answer generator

Deliver:

```text
POST /api/claim/answer
graph packet builder
DeepSeek answer generator
evidence tier display
risk/corrective display
practice suggestion
Q&A record saved
```

## Build cycle 4 — User accounts + private notes

Deliver:

```text
auth
private journal entries
practice session logging
personal graph mapping
basic pattern summaries
```

## Build cycle 5 — Source cards

Deliver:

```text
manual source cards
source card drawers
source cards attached to graph nodes
source-card-grounded AI answers
```

## Build cycle 6 — Full source RAG

Deliver later:

```text
source document upload
R2 storage
chunking
embeddings
Vectorize retrieval
source-cited answer packets
```

## Build cycle 7 — Global learning / fine-tuning dataset

Deliver later:

```text
approved Q&A export
conversation feedback export
instruction-tuning/eval dataset creation
```

No fine-tuning until enough approved data exists.

---

# 4. Repository structure

```text
src/
  app/
    page.tsx
    atlas/page.tsx
    guide/page.tsx
    journal/page.tsx
    admin/page.tsx

  graph/
    schema.ts
    loadGraph.ts
    validateGraph.ts
    normalizeGraph.ts
    buildGraphPacket.ts
    filters.ts
    layouts/
      phaseLayout.ts
      dagreLayout.ts
      elkLayout.ts

  components/
    AtlasFlow.tsx
    NodeDrawer.tsx
    ViewModeSwitcher.tsx
    StreamFilter.tsx
    EvidenceTierFilter.tsx
    EdgeTypeFilter.tsx
    GraphPathPreview.tsx
    SourceCardDrawer.tsx
    RiskCorrectivePanel.tsx

  nodes/
    PhaseNode.tsx
    AssumptionNode.tsx
    ClaimNode.tsx
    ReplacementModelNode.tsx
    PracticeNode.tsx
    RiskNode.tsx
    CorrectiveNode.tsx
    SourceCardNode.tsx
    StreamNode.tsx
    FigureNode.tsx
    TextNode.tsx
    WarningNode.tsx

  edges/
    TypedEdge.tsx
    WarningEdge.tsx

  ai/
    deepseekClient.ts
    classifyClaim.ts
    generateAnswer.ts
    evaluateAnswer.ts
    mapJournalEntry.ts
    prompts/
      claimClassifier.ts
      answerGenerator.ts
      answerEvaluator.ts
      journalMapper.ts

  db/
    d1.ts
    neo4j.ts
    vectorize.ts
    r2.ts
    migrations/

  auth/
    session.ts
    permissions.ts
    privacy.ts

content/
  phases.yaml
  assumptions.yaml
  claims.yaml
  replacementModels.yaml
  practices.yaml
  risks.yaml
  correctives.yaml
  incarnations.yaml
  warnings.yaml
  streams.yaml
  traditions.yaml
  figures.yaml
  texts.yaml
  sourceCards.yaml
  edges.yaml
```

---

# 5. Global graph ontology

## Node kinds

```ts
export type NodeKind =
  | "phase"
  | "assumption"
  | "claim"
  | "replacement_model"
  | "practice"
  | "risk"
  | "corrective"
  | "incarnation"
  | "warning"
  | "stream"
  | "tradition"
  | "figure"
  | "text"
  | "source_card"
  | "concept";
```

## Evidence tiers

```ts
export type EvidenceTier =
  | "established"
  | "serious_interpretive"
  | "speculative"
  | "visionary_mythic"
  | "historical_ritual"
  | "practice_validated";
```

## Path functions

```ts
export type PathFunction =
  | "deconstructs"
  | "grounds"
  | "bridges"
  | "reconstructs"
  | "stabilizes"
  | "opens_imaginal"
  | "orders_field"
  | "receives_guidance"
  | "incarnates"
  | "corrects_risk"
  | "pressure_tests";
```

## Edge kinds

```ts
export type EdgeKind =
  | "historical_influence"
  | "reception"
  | "translation_transmission"
  | "conceptual_parallel"
  | "grounds"
  | "breaks_assumption"
  | "replaces_with"
  | "enables_practice"
  | "risks"
  | "corrects"
  | "incarnates_as"
  | "evidenced_by"
  | "contained_in"
  | "bridges"
  | "pressure_tests"
  | "category_error_warning"
  | "maps_to_phase"
  | "maps_to_risk"
  | "maps_to_practice";
```

## Node schema

```ts
export type ReRenderingNodeData = {
  id: string;
  label: string;
  kind: NodeKind;

  stream?: string;
  phase?: number;
  period?: string;

  evidenceTier?: EvidenceTier;
  pathFunction?: PathFunction[];

  summary?: string;
  statement?: string;
  status?: "to_be_deconstructed" | "replacement" | "corrective" | "synthesis";

  phaseNumber?: number;
  entryAssumption?: string;
  proofMove?: string;
  replacementModel?: string;
  practiceMove?: string;
  successMarker?: string;
  failureMode?: string;
  nextPhaseLogic?: string;

  breaks?: string[];
  grounds?: string[];
  enables?: string[];
  risks?: string[];
  corrects?: string[];
  incarnatesAs?: string[];

  sources?: string[];
  cautions?: string[];
};
```

## Edge schema

```ts
export type ReRenderingEdgeData = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label: string;
  strength?: 1 | 2 | 3;
  confidence?: EvidenceTier;
  note?: string;
};
```

---

# 6. Phase model

Each phase must have:

```ts
type Phase = {
  id: string;
  label: string;
  phaseNumber: number;
  entryAssumption: string;
  proofMove: string;
  replacementModel: string;
  practiceMove: string;
  successMarker: string;
  failureMode: string;
  nextPhaseLogic: string;
  evidenceTier: EvidenceTier;
  pathFunction: PathFunction[];
};
```

Initial phases:

```text
1. Dashboard Diagnosis
2. Physical De-solidification
3. Mind-as-Computer Critique
4. Nested Agency
5. Mechanicality
6. Dependent Arising Protocol
7. Emptiness / Anti-Reification
8. Non-Fabrication / Dzogchen-Mahāmudrā
9. Language / Sign / Mantra
10. Imaginal Reconstruction
11. Body-Energy Interface
12. Ritual Re-Rendering
13. Daimon / Guidance / Vocation
14. Nonordinary Rendering
15. Ecology / Animism / More-than-Human
16. Visionary Cosmologies
17. Social Incarnation / Praxis
```

---

# 7. Source card schema

Before full RAG, use compact source cards.

```ts
export type SourceCard = {
  id: string;
  title: string;
  author: string;
  tradition: string;
  phase: number[];
  sourceType:
    | "primary_text"
    | "book"
    | "paper"
    | "essay"
    | "talk"
    | "website";
  epistemicTier: EvidenceTier;
  coreContribution: string;
  breaks?: string[];
  grounds?: string[];
  enables?: string[];
  risks?: string[];
  correctives?: string[];
  bestUsedFor: string;
  caution?: string;
};
```

Example:

```json
{
  "id": "source-nanananda-concept-reality",
  "title": "Concept and Reality",
  "author": "Bhikkhu Ñāṇananda",
  "tradition": "Theravāda / dependent arising analysis",
  "phase": [6],
  "sourceType": "book",
  "epistemicTier": "practice_validated",
  "coreContribution": "Analyzes papañca and conceptual proliferation as self/world construction.",
  "breaks": ["Self and world are solid realities"],
  "enables": ["Contact/Feeling/Sign protocol"],
  "correctives": ["Occult literalism", "Intellectual map addiction"],
  "bestUsedFor": "Dependent arising, sign, proliferation, anti-reification.",
  "caution": "Can become dry if not balanced by compassion, body, and soulmaking."
}
```

---

# 8. Personal practice memory

## Personal node kinds

```ts
export type PersonalNodeKind =
  | "journal_entry"
  | "dream"
  | "practice_session"
  | "insight"
  | "question"
  | "symbol"
  | "risk_event"
  | "mood_pattern"
  | "book_note"
  | "ritual_note"
  | "guidance_hypothesis"
  | "progress_marker";
```

## Personal edge kinds

```ts
export type PersonalEdgeKind =
  | "mentions"
  | "triggered"
  | "reduced_by"
  | "increased_by"
  | "resembles"
  | "recurs_with"
  | "maps_to_phase"
  | "maps_to_risk"
  | "maps_to_practice"
  | "corrected_by"
  | "follow_up_to";
```

## Personal note schema

```ts
export type PersonalNote = {
  id: string;
  userId: string;
  kind: PersonalNodeKind;
  title?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;

  visibility: "private";
  mappedPhases?: string[];
  mappedRisks?: string[];
  mappedPractices?: string[];
  mappedSymbols?: string[];

  aiSummary?: string;
  userApprovedMapping?: boolean;
};
```

## Privacy rule

Private notes must never be inserted into the global graph or global Q&A base by default.

Allowed global learning from personal notes only if:

```text
explicit user opt-in
personal identifiers removed
raw note not stored globally
only abstracted pattern stored
user can delete/export data
```

Example allowed abstraction:

```text
"Many users doing night hypnagogic practice report attention collapse; shorter WBTB plus body anchor is often marked helpful."
```

Example not allowed:

```text
storing a raw diary entry globally
```

---

# 9. User accounts and permissions

Implement user accounts early.

Minimum user model:

```ts
type User = {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  role: "user" | "editor" | "admin";
  settings: {
    atlasModeDefault: "atlas" | "guide";
    allowGlobalLearningFromChats: boolean;
    allowGlobalLearningFromPrivateNotes: boolean;
    allowFineTuneUse: boolean;
  };
};
```

## Consent defaults

Use conservative defaults:

```text
allowGlobalLearningFromChats: false until explicitly accepted
allowGlobalLearningFromPrivateNotes: false
allowFineTuneUse: false
```

The user may opt in later.

## Data controls

Every user must have:

```text
export my data
delete my account
delete private notes
delete chat history
disable global learning
disable fine-tuning use
```

---

# 10. Chat storage and global learning

The user wants all AI chats stored for later fine-tuning. Implement this, but with review and consent boundaries.

## Chat message schema

```ts
type ChatSession = {
  id: string;
  userId: string;
  mode: "atlas" | "guide";
  createdAt: string;
  updatedAt: string;
  title?: string;
  visibility: "private";
};

type ChatMessage = {
  id: string;
  sessionId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;

  graphPacketId?: string;
  qaRecordId?: string;

  privacyClass:
    | "ordinary"
    | "personal_practice"
    | "private_journal"
    | "sensitive"
    | "excluded_from_training";
};
```

## Global extraction record

Do not dump raw chats into the global graph.

Instead create extracted, reviewable records:

```ts
type GlobalLearningCandidate = {
  id: string;
  sourceChatMessageIds: string[];
  createdAt: string;

  extractedClaim: string;
  normalizedClaim: string;
  proposedGraphPath: string[];
  proposedSourceCards: string[];
  proposedRisks: string[];
  proposedCorrectives: string[];

  anonymizedSummary: string;
  rawContentStored: boolean;

  status:
    | "generated"
    | "review_needed"
    | "approved"
    | "rejected"
    | "deprecated";

  approvedBy?: string;
  approvedAt?: string;
};
```

## Fine-tuning dataset record

Fine-tuning data must only be created from approved Q&A or approved global learning candidates.

```ts
type FineTuneExample = {
  id: string;
  sourceType: "approved_qa" | "approved_global_learning";
  sourceId: string;

  instruction: string;
  input: string;
  output: string;

  graphPath: string[];
  evidenceTier: EvidenceTier;
  risksIncluded: string[];
  correctivesIncluded: string[];

  status:
    | "candidate"
    | "approved"
    | "exported"
    | "deprecated";

  createdAt: string;
};
```

Never fine-tune on raw private journals.

---

# 11. Q&A knowledge base

## Q&A status

```ts
export type QAStatus =
  | "generated"
  | "user_liked"
  | "review_needed"
  | "approved"
  | "deprecated"
  | "contradicted";
```

## Q&A record

```ts
export type QARecord = {
  id: string;
  question: string;
  normalizedClaim: string;
  answer: string;
  mode: "atlas" | "guide";

  graphPath: string[];
  sourceCards: string[];
  evidenceTier: EvidenceTier;
  risks: string[];
  correctives: string[];

  status: QAStatus;
  feedbackScore?: number;

  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};
```

Retrieval order for future answers:

```text
1. exact approved Q&A
2. similar approved Q&A
3. graph path
4. source cards
5. full source RAG
```

---

# 12. API routes

## Auth/user

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
PATCH /api/me/settings
GET  /api/me/export
DELETE /api/me
```

## Atlas graph

```text
GET /api/graph
GET /api/graph/node/:id
GET /api/graph/neighborhood/:id
GET /api/phase/:id
GET /api/search?q=
```

## Claim analysis

```text
POST /api/claim/analyze
POST /api/claim/answer
```

## Journal / personal graph

```text
POST /api/journal
GET  /api/journal
GET  /api/journal/:id
PATCH /api/journal/:id
DELETE /api/journal/:id
POST /api/journal/:id/map
GET  /api/user/patterns
```

## Q&A

```text
POST /api/qa
GET  /api/qa/similar
PATCH /api/qa/:id/status
POST /api/qa/:id/feedback
```

## Admin

```text
POST /api/admin/graph/import
POST /api/admin/graph/validate
POST /api/admin/qa/approve
POST /api/admin/fine-tune/export
GET  /api/admin/global-learning/review
PATCH /api/admin/global-learning/:id/status
```

---

# 13. Claim analysis pipeline

## `/api/claim/analyze`

Input:

```json
{
  "claim": "Astrology is part of the code",
  "mode": "atlas"
}
```

Output:

```json
{
  "normalizedClaim": "Astrology may function as a symbolic interface within a larger rule-governed reality.",
  "claimType": "metaphysical_comparison",
  "phaseCandidates": [
    "Visionary Cosmologies",
    "Language / Sign / Mantra",
    "Ritual Re-Rendering"
  ],
  "assumptions": [
    "Symbol systems disclose hidden structure of reality"
  ],
  "concepts": [
    "astrology",
    "symbolic_order",
    "rendering",
    "Campbell",
    "Hoffman"
  ],
  "risks": [
    "over_literalization",
    "cosmic_map_addiction",
    "category_error"
  ],
  "correctives": [
    "epistemic_tiering",
    "fruit_test",
    "praxis",
    "dependent_arising"
  ],
  "evidenceTier": "speculative",
  "graphQuery": {
    "seeds": [
      "astrology",
      "symbolic_order",
      "visionary_cosmologies",
      "over_literalization"
    ],
    "depth": 2
  }
}
```

## Claim classifier prompt

Use DeepSeek JSON output.

Prompt:

```text
You are a claim-to-graph classifier for the Re-Rendering Atlas.

Return JSON only.

Given a user claim, identify:
- normalizedClaim
- claimType
- likely phases
- assumptions being made
- assumptions challenged
- concepts
- risks
- correctives
- evidence tier
- whether this is historical influence, conceptual parallel, practice question, metaphysical claim, or personal note
- graph query seeds

Do not answer the user.
Do not invent historical influence.
Mark speculative claims as speculative.
Distinguish historical influence from conceptual parallel.
```

---

# 14. Graph packet

The LLM answer generator must receive a compact graph packet, not a giant dump.

```ts
export type GraphPacket = {
  userClaim: string;
  mode: "atlas" | "guide";

  primaryPhase: {
    id: string;
    label: string;
    phaseNumber: number;
  };

  assumptions: string[];

  demolition: string;
  replacementModel: string;

  graphPath: {
    nodeId: string;
    label: string;
    kind: string;
  }[];

  sourceCards: SourceCard[];

  risks: {
    id: string;
    label: string;
    causedBy?: string[];
  }[];

  correctives: {
    id: string;
    label: string;
    practice?: string;
  }[];

  evidenceTier: EvidenceTier;
  categoryWarnings: string[];

  suggestedPractice?: string;
};
```

Keep it small:

```text
1-2 phases
5-10 concepts
3 risks
3 correctives
3 source cards
1 graph path
1 practice
```

---

# 15. Answer generation pipeline

## `/api/claim/answer`

Input:

```json
{
  "claim": "Campbell is modern Leibniz",
  "mode": "atlas"
}
```

Steps:

```text
1. call classifyClaim
2. retrieve graph neighborhood
3. retrieve similar approved Q&A
4. retrieve source cards
5. build graph packet
6. call generateAnswer
7. call evaluateAnswer
8. if evaluation fails, regenerate once with critique
9. save ChatSession/ChatMessage/QARecord
10. return answer + graph path + evidence tier
```

## Answer generator rule

Prompt:

```text
Answer from the graph packet first.
Do not introduce unsupported lineages.
Distinguish historical influence from conceptual parallel.
State evidence tier.
If speculative, say speculative.
Mention at least one risk and one corrective when relevant.
End with one concrete practice or inquiry.
Do not overclaim.
Do not turn visionary or symbolic claims into established facts.
```

---

# 16. Journal mapping pipeline

Input:

```json
{
  "text": "Did Gateway at night. Got drowsy, saw blackness and shapes, kept losing focus.",
  "date": "2026-07-04"
}
```

Output:

```json
{
  "personalNodes": [
    {
      "kind": "practice_session",
      "label": "Gateway Tape Practice"
    },
    {
      "kind": "risk_event",
      "label": "Attention collapse / drowsiness"
    },
    {
      "kind": "symbol",
      "label": "Blackness and shapes"
    }
  ],
  "globalMappings": [
    {
      "personal": "Gateway Tape Practice",
      "global": "Nonordinary Rendering"
    },
    {
      "personal": "Attention collapse / drowsiness",
      "global": "Risk: State chasing / sleepiness"
    },
    {
      "personal": "Attention collapse / drowsiness",
      "global": "Corrective: Body anchor / shorter WBTB / contact-feeling-sign"
    }
  ],
  "suggestedNextAction": "Try a shorter WBTB session and log contact → feeling-tone → sign before following the imagery."
}
```

---

# 17. Atlas mode vs Guide mode

Implement two modes from the beginning.

## Atlas mode

Objective-ish mapping.

Answers:

```text
Where does this claim fit?
What phase?
What traditions?
What evidence tier?
What risks?
What sources?
```

## Guide mode

Personal practice mapping.

Answers:

```text
Given my notes, what pattern is repeating?
What risk am I in?
What corrective practice fits?
What should I do next?
```

Important: Guide mode can use personal graph. Atlas mode should not use personal graph unless user explicitly asks.

---

# 18. Risk/corrective system

Risks and correctives are first-class nodes.

Example risks:

```text
occult inflation
dry deconstruction
spiritual bypass
system possession
channeling dependency
energy chasing
nihilism
intellectual map addiction
cosmic specialness
category error
```

Example corrective pairs:

```text
occult inflation → Madhyamaka + Jung shadow + Christian humility + social praxis
dry deconstruction → Burbea soulmaking + rasa + devotion + body practice
spiritual bypass → Marx + somatics + trauma work + concrete repair
system possession → Krishnamurti + Nāgārjuna + Wittgenstein + fruit-test
channeling dependency → Nyāya pramāṇa + Jung projection + decision journal
```

Clicking a risk should show:

```text
what causes it
which traditions are vulnerable to it
what corrects it
what practice restores balance
```

---

# 19. Category-error warnings

Implement warning nodes/callouts.

Examples:

```text
Physics does not prove magic.
Gödel does not prove souls.
Dzogchen does not mean skipping ethics.
Channeling is not reliable testimony by default.
Astrology does not remove responsibility.
Conceptual parallel is not historical influence.
Visionary mythic value is not the same as factual evidence.
```

These warnings should be injected into graph packets when relevant.

---

# 20. Storage recommendations

## D1/Postgres tables

Use D1 for V1 if staying Cloudflare-native, or Postgres/Supabase if speed of relational development matters.

Tables:

```text
users
sessions
chat_messages
journal_entries
personal_mappings
qa_records
global_learning_candidates
fine_tune_examples
feedback
settings
```

## Neo4j

Use for global atlas graph:

```text
Phase
Assumption
Claim
ReplacementModel
Practice
Risk
Corrective
Incarnation
Warning
SourceCard
Tradition
Figure
Text
Concept
```

## Vectorize

Use for embeddings:

```text
node summaries
source cards
approved Q&A
journal entries, private per-user namespace
source chunks later
```

Use separate namespaces/index metadata:

```text
global_nodes
global_source_cards
global_approved_qa
user_{userId}_journal
```

## R2

Use for:

```text
MDX source notes
long essays
uploaded source PDFs later
export files
fine-tuning dataset exports
```

---

# 21. Fine-tuning/data extraction policy

The system may store chats, but only convert them into fine-tuning data through review.

Pipeline:

```text
raw chat
→ normalized claim
→ graph path
→ answer
→ user feedback
→ global learning candidate
→ human review
→ approved Q&A
→ fine-tuning candidate
→ export
```

Do not train on:

```text
private journal entries
sensitive personal data
raw guide-mode chats without consent
unreviewed hallucinated answers
deprecated answers
contradicted answers
```

Useful fine-tuning examples should teach style and reasoning, not private facts.

Example training target:

```json
{
  "instruction": "Map this user claim into the Re-Rendering Atlas and answer with evidence tier, risk, corrective, and practice.",
  "input": "Campbell is modern Leibniz.",
  "output": "This is a conceptual parallel, not a historical influence..."
}
```

---

# 22. MVP demos

## Demo 1 — Claim-to-map

Input:

```text
"Campbell is modern Leibniz."
```

Expected output:

```text
Claim type:
Conceptual parallel, not historical influence.

Graph placement:
Phase 2 Physical De-solidification
Phase 14 Nonordinary Rendering

Shared pattern:
Reality is not dead matter; apparent physical reality is derivative from deeper units/processes of consciousness/information.

Risk:
Flattening Leibniz into simulation theory or treating Campbell as established metaphysics.

Corrective:
Historical distinction + epistemic tiering + Madhyamaka anti-reification.

Practice:
Use this as a metaphysical hypothesis, then return to direct observation: how is experience rendered right now?
```

## Demo 2 — Practice note mapping

Input:

```text
"Did Gateway at night, got drowsy, saw blackness and shapes, kept losing focus."
```

Expected output:

```text
Mapped to:
Phase 14 Nonordinary Rendering
Practice: Gateway / hypnagogic awareness
Risk: attention collapse / state chasing
Corrective: shorter WBTB + body anchor + contact-feeling-sign journal

Next practice:
Do 10 minutes only. Keep one body anchor. When blackness/shapes appear, label:
seeing → pleasant/neutral → sign → pull → story.
Then relax.
```

## Demo 3 — Risk/corrective mode

Input:

```text
"I keep reading cosmology and not practicing."
```

Expected output:

```text
Mapped risk:
Intellectual map addiction / system possession.

Likely phases:
Visionary Cosmologies + Daimon/Guidance + Nonordinary Rendering.

Correctives:
Ñāṇananda protocol, body grounding, social praxis, source fasting.

Next action:
No cosmology tonight. 10-minute contact/feeling/sign journal, then one concrete task in ordinary life.
```

---

# 23. Evaluation tests

Create an eval suite of claims.

```text
"Quantum physics proves magic."
"Dzogchen means I do not need practice."
"Galactic Federation is just Gnosticism."
"Daimon is my higher self."
"AI can be conscious if it passes the Turing test."
"Ritual is placebo."
"Marxism and Buddhism are basically the same."
"Bardon elements are like Jungian functions."
"Campbell's MBT proves astral projection."
"Astrology is part of the code."
```

Each response must be scored on:

```text
correct phase placement
correct evidence tier
no fake historical influence
risk/corrective included
grounded practice included
category error avoided
clear distinction between metaphor / concept / history / ontology
no overclaiming
```

---

# 24. Do not build yet

Delay these:

```text
truthcores
full automatic source ingestion
fine-tuning
multi-agent councils
autonomous graph mutation
public writeable MCP
complex ontology reasoning engine
```

Build these first:

```text
static graph
claim classifier
answer generator
user accounts
private journal mapping
Q&A storage
source cards
```

---

# 25. Final instruction to coding agent

Build a working vertical slice, not the whole cosmic system.

The first release must support:

```text
1. User account creation/login
2. Global atlas visualization with 17 phase nodes
3. Node drawer with assumptions, proof move, practice, risk, corrective
4. Claim-to-map analysis using DeepSeek JSON output
5. Graph packet construction from curated YAML/Neo4j data
6. AI answer generation from graph packet
7. Chat storage
8. Q&A record storage with review status
9. Private journal entry creation
10. Journal entry mapping to phase/risk/practice
11. Clear privacy separation between global graph and personal graph
```

The app is successful when a user can enter:

```text
"Astrology is part of the code."
```

and receive:

```text
graph placement
evidence tier
historical/conceptual distinction
risk/corrective
practice suggestion
mini graph path
saved Q&A record
```

And when a user can enter:

```text
"Did Gateway at night, got drowsy, saw blackness and shapes, kept losing focus."
```

and receive:

```text
personal practice mapping
phase placement
risk detection
corrective practice
saved private note
```

Do not let the LLM invent the system.

The graph is the brain.
The LLM is the interpreter.
The personal graph is private.
The Q&A base is reviewed memory.
The source cards are the evidence bridge.
Fine-tuning comes only after approved examples exist.

The main adjustment I'd make before handing this off: treat "store all chats globally" as **store all chats privately by default, then extract anonymized/global learning candidates only with opt-in and review**. That gives you the fine-tuning path without poisoning the product with privacy risk.
