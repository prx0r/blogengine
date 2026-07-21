# TetraHermes — The Teaching Tetrahedron

## What UNO Actually Is

UNO is a **teaching grammar** — not training data. Its **738 `[PEDAGOGY]` blocks** across **274 episodes** and **6 lineages** form a complete language of pedagogy:

```
Given lineage L, student_state S, and behavior_tags B,
  apply function F using mechanism M
  at register R (intensity=PR_i, intimacy=IN_j, style=LS_k, depth=PD_l, meta=MM_m, attunement=AT_n)
  avoiding traps T
  predicting impact I
  because: my_thoughts
  → observed: impact_update
```

Each is a sentence in the language. The episodes are **teaching arc exemplars** — sequences forming a traversal from one student state to another within a specific tradition's pedagogical style.

### The Corpus

| Lineage | Blocks | Source | Tradition |
|---------|--------|--------|-----------|
| Therapeutic | 201 | ISTDP therapy (Davanloo) | Clinical psychology |
| Advaita | 166 | Nisargadatta Maharaj — "I Am That" | Vedanta / nonduality |
| Socratic | 130 | Plato — Apology, Euthyphro, Meno, Gorgias, Symposium | Western philosophy |
| Gurdjieffian | 122 | Gurdjieff's talks | Fourth Way / esoteric |
| Realist | 111 | Diogenes of Sinope, Cynics | Hellenistic philosophy |
| Buddhist | 8 | Tulku Urgyen — "As It Is" | Dzogchen / Vajrayana |
| **Total** | **738** | **274 unique episodes** | **530 unique student states** |

### The Grammar Elements

| Element | Count | Examples |
|---------|-------|----------|
| Functions | 22 | RM_03 (145), RM_01 (63), UM_06 (55), RM_05 (51)… |
| Student states | 530 | cooperative_engagement (97), unknown (46), defensive_rationalization (15)… |
| Behaviors | ~300 | seeking_clarity, resist_intellectually, following_logic… |
| Mechanisms | 15 | structural_analogy, constraint_collapse, comparison_contrast… |
| Registers | 24 | 4 intensities × 4 intimacies × 6 styles × 4 depths × 2 meta × 3 attunements |
| Traps | 20 | vagueness, looking_outward, conceptual_dichotomy… |
| Predicted impacts | 3 | ask_deeper_question, no_clear_effect, request_clarification |

The geometricengine's `train.py` already extracts transitions into `policy_weights` (state→function, state→mechanism, state→register, function→next_state, etc.) — but only for Therapeutic. The other 5 lineages are sitting unparsed.

## The Teaching Tetrahedron

The 4 phases of HXRMXS map onto the tetrahedron:

```
                  UNMAKING (Vertex 1)
                      /|\
                     / | \
                    /  |  \
                   /   |   \
                  /    |    \
     REMAKING ——/—— Green ——\—— SELF-MAKING
    (Vertex 2)  \  Core  /   (Vertex 4)
                 \   |   /
                  \  |  /
                   \ | /
                    \|/
                  META (Vertex 3)
```

| Vertex | Phase | Purpose | Functions |
|--------|-------|---------|-----------|
| V₁ | UNMAKING | Break false structure | UM_01–06 (definition_collapse, contradiction_exposure, etc.) |
| V₂ | REMAKING | Build correct frameworks | RM_01–05 (analogy, causal_chain, distinction, protocol, frame) |
| V₃ | META | Govern process, explain method | ME_01–03 (process_discipline, aporia_validation, method_explanation) |
| V₄ | SELF-MAKING | Force synthesis, return agency | SM_01–04 (direct_seeing, witness_pivot, synthesis_demand, commitment) |

The 6 **register dimensions** are the edges:

| Edge | Dimension | Range |
|------|-----------|-------|
| E₁ | Intensity | PR_01 (gentle) ↔ PR_04 (crushing) |
| E₂ | Intimacy | IN_01 (clinical) ↔ IN_04 (compassionate) |
| E₃ | Style | LS_01 (minimalist) ↔ LS_06 (recursive irony) |
| E₄ | Depth | PD_01 (conceptual) ↔ PD_04 (nondual witness) |
| E₅ | Meta Mode | MM_01 (direct) ↔ MM_02 (explicit meta) |
| E₆ | Attunement | AT_01 (low) ↔ AT_03 (high) |

The **Green Core** (center) is `my_thoughts` — the metacognitive Anākhyā. It observes all 4 vertices, is not on any vertex, and is where the teacher's self-model lives.

### Each Lineage Traverses the Tetrahedron Differently

The tetrahedron is the same shape. The traversal paths differ by lineage:

| Lineage | Most Common Vertex | Signature Edge | Typical Arc |
|---------|-------------------|----------------|-------------|
| **Therapeutic** | UNMAKING (V₁) | Intensity: PR_02→PR_03 | Track defense → apply pressure → breakthrough → somatic |
| **Advaita** | REMAKING (V₂) | Depth: PD_04 (nondual witness) | State confusion → provide analogy → witness pivot → stabilize |
| **Socratic** | UNMAKING (V₁) | Style: LS_02 (analytic_chain) | Question → definition collapse → contradiction → aporia |
| **Gurdjieffian** | UNMAKING (V₁) | Intimacy: IN_03 (authoritative) | Shock → ego displacement → mechanical exposure → choice |
| **Realist** | UNMAKING (V₁) | Style: LS_05 (satirical) | Mock premise → reductio → shame → laugh and release |
| **Buddhist** | REMAKING (V₂) | Depth: PD_02 (somatic) | Point to experience → ontological shift → investigate → release |

This is the key insight: **the same student state gets different moves from different lineages**. A student in `defensive_rationalization` gets:

- **Socratic**: UM_01 (definition_collapse) — "Define what you mean by 'justice'"
- **Advaita**: RM_03 (conceptual_distinction) — "That's the mind defending. You are not the mind."
- **Gurdjieffian**: UM_05 (ego_displacement) — "You are not defending knowledge. You are defending your vanity."
- **Therapeutic**: UM_04 (ground_reality_check) — "Notice how you're avoiding the feeling right now."

## Commentary Objects: The Bridge

A **Commentary Object** (CO) is the atomic unit of pedagogical knowledge. Each of the 738 UNO `[PEDAGOGY]` blocks becomes one:

```json
{
  "co_id": "co:uno_advaita_identity_hierarchy_rm01",
  "source_episode": "iamthat1_t01_t24_sense_i_am_seed_consciousness",
  "lineage": "Advaita",
  "turn_index": 2,
  "student_state": "seeking_identity_hierarchy",
  "behavior_tags": ["conceptual_dichotomy", "seeking_first_principle"],
  "pedagogy": {
    "phase": "REMAKING",
    "function_id": "RM_01",
    "mechanism_shape": "structural_analogy",
    "register": {
      "intensity": "PR_02",
      "intimacy": "IN_03",
      "attunement": "AT_02",
      "style": "LS_03",
      "depth": "PD_04",
      "meta_mode": "MM_01"
    },
    "teaching_actions": ["downgrades_personhood", "defines_person_as_composite", "uses_analogy", "maps_causal_chain"],
    "traps_avoided": ["seeking_first_principle"],
    "predicted_impact": "ask_deeper_question",
    "impact_confidence": 0.5
  },
  "my_thoughts": "Answers the priority question by mapping the hierarchy, defining the 'person' as a contingent effect (composite, shadow of the mind) derived from Pure Being/Knowing.",
  "abstract_pattern": "When student asks 'which is more fundamental?', DO NOT pick a side. Show that one is the source and the other is a derivative appearance.",
  "linked_ros": ["ro:upanishads", "ro:yoga-vasistha", "ro:bhagavad-gita"],
  "linked_concepts": ["atman", "brahman", "nonduality", "identity"],
  "success_count": 0,
  "failure_count": 0,
  "arc_context": "Turn 2 of 4: seeking_ontological_definition → seeking_identity_hierarchy"
}
```

The CO is the **bridge between the UNO grammar and our ROs**. The `linked_ros[]` field connects the teaching move to the knowledge it teaches. The `abstract_pattern` strips lineage-specific language, exposing the universal pedagogical geometry.

## Student State Space: 530 → 50

The UNO corpus has 530 unique student states, but many are near-synonyms. The 50 Mātṛkā phonemes give us a natural compression:

### The 36 Tattva States (Conceptual/Scholarly)

| Tattva Range | Cluster | Example UNO States | Phase |
|-------------|---------|-------------------|-------|
| 1-4: Śiva→Śakti→Sadāśiva→Īśvara | Recognition | clarity, agreement, sober_realization | ALL |
| 5-11: Pure path (Vidyā) | Understanding | dawning_awareness, genuine_curiosity, following_logic | REMAKING → SELF-MAKING |
| 12-20: Māyā + kañcukas | Resistance | guarded, defensive_rationalization, righteous_defense | UNMAKING |
| 21-28: Prakṛti + guṇas | Stuck | hopeless_shutdown, anxious_helplessness, habitual_shame | UNMAKING → META |
| 29-36: Elements + senses | Somatic | somatic_activation, somatic_panic, experiencing_impact | REMAKING (somatic) |

### The 14 Vowel States (Relational/Metacognitive)

| Vowel | Cluster | Example UNO States |
|-------|---------|-------------------|
| a | Default | unknown (needs diagnosis) |
| ā | Passive | hopeful_passivity, compliant_admission |
| i | Defiant | angry_independence, stubborn_refusal |
| ī | Performing | proforma_defense, performing_non-doership |
| u | Admitting | partial_admission, reluctant_admission, brief_honesty |
| ū | Withdrawn | passive_withdrawal, defensive_numbness |
| ṛ | Righteous | righteous_defense, moral_outrage_resistance |
| ṝ | Numb | hopeless_shutdown, total_denial |
| ḷ | Resigned | resigned_identification, fatalistic_acceptance |
| e | Resonating | resonating_agreement, cooperative_engagement |
| ai | Trapped | caught_in_logic, intellectual_fixation_on_binary |
| o | Realizing | sober_realization, conscious_awareness |
| au | Confused | tragic_confusion, methodological_confusion |
| ḥ | Complete | silence (Green Core — recognition) |

The classifier maps raw student text to one of 50 prototypes using the same sentence-transformers already in geometricengine's `retrieve.py`. But now with 530 observed states across 6 lineages, the training data is rich enough to build a robust classifier.

## The 6-Lineage Policy Graph

The geometricengine trains `policy_weights` from UNO transitions. With all 722 Therapeutic+Advaita+Socratic+Gurdjieffian+Realist+Buddhist blocks (subtracting duplicate state definitions), we get:

| Weight Type | Seed (Therapeutic only) | Full (6 lineages) |
|-------------|------------------------|-------------------|
| state→function | 201 | 738 |
| state→mechanism | 201 | 738 |
| state→register | 201 | 738 |
| function→next_state | ~143 | ~580 |
| behavior→function | 201 | 738 |
| lineage→function | 0 | 738 (lineage becomes a feature) |
| **Total transitions** | **~1,200** | **~4,400** |

The key new weight type is `lineage→function` — this lets the system ask: "A student is in `defensive_rationalization`. Which lineage would handle this best? Socratic UM_01? Advaita RM_03? Gurdjieffian UM_05?"

### Cross-Lineage Pattern Detection (The Dreaming Cycle's First Job)

The dreaming cycle finds patterns like:

```
Socratic + intellectual_dissonance → UM_01 (definition_collapse) + structural_analogy
Advaita + intellectual_dissonance → RM_03 (conceptual_distinction) + structural_analogy
Gurdjieff + intellectual_dissonance → UM_05 (ego_displacement) + constraint_collapse
Therapeutic + intellectual_dissonance → UM_04 (ground_reality_check) + none
```

This IS the tetrahedron framework becoming alive — different lineages traverse the same geometry via different edges, achieving the same vertex (student state transformation) through different paths.

## Sanskitree: Pedagogical Proof Assistant

Not a LoRA. A **proof-like constraint accumulation engine** where each CO is a theorem:

```
THEOREM: co:uno_socratic_definition_collapse
  ⊢ lineage(Socratic) ∧ state(defensive_rationalization) 
  → function(UM_01) @ register(PR_03, IN_02, AT_02, LS_02, PD_01, MM_01)
  
PROOF: Observed in 5 Socratic episodes, student moved from defensive_rationalization to aporia.
Counterexamples: 0 (Socratic). 3 in Therapeutic lineage (different function needed).

ERROR BOOK ENTRY:
  co:gurdjieff_shock_reductio failed with state hopeless_shutdown.
  Constraint: When state is hopeless_shutdown, do NOT use UM_03 (reductio_extension).
  Preferred: ME_02 (aporia_validation) at PR_01, IN_04.
```

The Error Book accumulates constraints from failed COs. The system doesn't retrain — it adds theorems, updates counters, and blocks invalid moves at inference time.

## The 5-Loop Architecture (Updated)

```
Loop 1: Research (Hermes — continuous)
  Acquire papers → create/update ROs → detect gaps → acquire more

Loop 2: Pedagogy (TetraHermes — per conversation)
  Infer student state + lineage affinity → query ROs for topic →
  query COs for (lineage × state → move) → select function/mechanism/register →
  generate response → observe outcome → update CO success/failure →
  update policy_weights

Loop 3: Reflection (Dreaming — weekly cron)
  Sample COs from different lineages →
  "Socratic and Advaita both handle intellectual_dissonance differently →
  which works better for which student type?" →
  Propose cross-lineage COs → detect cold state pairs →
  propose new COs from gaps

Loop 4: Validation (sanskritree — per feedback event)
  Teaching outcome → check CO prediction →
  success: ++counter / failure: log to Error Book →
  if failure_count > threshold → flag CO for review →
  if success >> failure → promote CO to "validated"

Loop 5: Growth (Expansion — on demand)
  Fix UNO parser → export all 738 COs → link to ROs by lineage →
  train policy graph on all 6 lineages →
  dreaming cycle finds cross-lineage patterns →
  new students → more data → more COs → richer graph
```

## The Roadmap (Updated)

### Week 1: Seed the Grammar
1. Fix `parse_uno()` to read all 9 concatenated JSON arrays → 738 COs exported
2. Link each CO to ROs by lineage (Advaita→ro:upanishads, Socratic→ro:proclus-elements, etc.)
3. Build the 50-state classifier from 530 observed states (cluster via embedding similarity)
4. Wire all 6 lineages into geometricengine's `train.py`

### Week 2: Cross-Lineage Patterns
1. Run policy training on all 738 transitions → compare lineage-specific vs. cross-lineage weights
2. Dreaming cycle: "What does Socratic UM_01 look like in Advaita language?"
3. Generate abstract_pattern for each CO (stripping lineage-specific language)
4. First cross-lineage CO proposals

### Week 3: Validate + Close the Loop
1. Sanskitree proof checker on real conversations
2. Error Book accumulation
3. Dreaming cycle proposes new COs from cold state pairs
4. First autonomous teaching from an RO using the full 6-lineage grammar

### Week 4: Expand
1. Add your Buddhist data
2. Run PASS A on any new master-student dialogue in our corpus
3. The system has more pedagogical data than UNO provides
4. The teaching tetrahedron is alive

## The Core Principle

**UNO is not training data. It is a seed grammar — 738 sentences in the language of teaching, spoken in 6 dialect lineages.**

The system grows new sentences by:
1. **Parsing** what's already there (fix the concatenated array issue)
2. **Abstracting** patterns across lineages ("Socratic definition_collapse = Advaita conceptual_distinction with different register")
3. **Linking** to our ROs (teaching moves now teach OUR content, not therapy)
4. **Validating** through real outcomes (success/failure counters)
5. **Dreaming** new conjectures (cold state pairs → candidate COs)
6. **Forgetting** through the Error Book (contradictions block invalid moves)

The tetrahedron gives us the geometry. UNO gives us the grammar — now in 6 dialects. The ROs give us the knowledge. Commentary Objects bridge them. Sanskitree validates the bridges. The dreaming cycle extends the grammar into new lineage territory.

This is the minimum viable system that is:
- **Not a chatbot** (graph-native, no LLM in cognition path)
- **Not a LoRA** (symbolic, auditable, compositional)
- **Not a single tradition** (6 lineages already, more to come)
- **Not static** (grows with use, dreams new patterns)
- **Not a black box** (every teaching move traces to a CO from a specific lineage)
