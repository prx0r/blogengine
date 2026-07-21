# TetraHermes — Formal Specification

## Preamble

This document specifies a dynamical system for pedagogical state transitions. The system is grounded in four independently-derived formal structures which converge on the same geometry: Ñāṇavīra's K₄ (1963), the Tantraloka's 36 tattvas (~1000 CE), the HXRMXS PEDAGOGY taxonomy (2026), and Michael Levin's cognitive light cone (2012–2024). That these four emerged from Buddhist phenomenology, Kashmir Shaivism, clinical therapy transcripts, and developmental biology — without mutual influence — constitutes the system's evidential basis.

---

## 1. The Fundamental Object: K₄

### 1.1 Definition

Let K₄ be the complete graph on 4 vertices. Any moment of experience is represented by a labeling:

```
V = {S, O, I, A}
```

where:

| Vertex | Name | Ñāṇavīra's term | Role |
|--------|------|-----------------|------|
| S | Subject | purisa | The pole of subjectivity |
| O | Object | ārammaṇa | The pole of objectivity |
| I | Intention | cetanā | Directedness of S toward O |
| A | Act | kamma | The event itself |

The 6 edges:

```
E = {e_{SO}, e_{SI}, e_{SA}, e_{OI}, e_{OA}, e_{IA}}
```

**Axiom 1** (Co-arising): All 4 vertices appear simultaneously or not at all. There is no moment with fewer than 4 terms and no moment with more than 4 terms.

**Axiom 2** (No priority): No vertex is prior to any other. Priority is a relation between moments, not within a moment.

**Axiom 3** (Invariance): The structure K₄ is invariant across all moments. The labeling changes; the graph does not.

### 1.2 The Edge Tension Vector

Each edge carries a scalar value in ℝ representing the "tension" on that relation at a given moment. The 6-dimensional vector:

```
r = (r_{SO}, r_{SI}, r_{SA}, r_{OI}, r_{OA}, r_{IA}) ∈ ℝ⁶
```

is called the **register vector**.

### 1.3 Vertices as Operators

Each vertex operates on the edge connected to it. For a vertex v ∈ V, its operation is the vector of edges incident to v:

```
op(S) = (e_{SO}, e_{SI}, e_{SA})
op(O) = (e_{SO}, e_{OI}, e_{OA})
op(I) = (e_{SI}, e_{OI}, e_{IA})
op(A) = (e_{SA}, e_{OA}, e_{IA})
```

A teaching phase selects one vertex as the current site of transformation:

| Phase | Vertex | Operation |
|-------|--------|-----------|
| UNMAKING | S | Modifies op(S): the relation of subject to object, intention, act |
| REMAKING | O | Modifies op(O): the relation of object to subject, intention, act |
| META | I | Modifies op(I): the relation of intention to subject, object, act |
| SELF-MAKING | A | Modifies op(A): the relation of act to subject, object, intention |

---

## 2. The 36 Tattvas as K₄ Unfolded

### 2.1 The Recursion

Each vertex of K₄ is itself a K₄ (self-similarity). This is not a metaphor — it follows from Ñāṇavīra's demonstration (§I.13) that the 4-symbol structure reappears at every level of reflexion.

Define the unfolding operator U:
```
U(K₄) = {K₄_S, K₄_O, K₄_I, K₄_A}
```

where K₄_v is the K₄ structure of vertex v's internal articulation.

### 2.2 The Truncation

The full recursion is infinite in both directions (§I.16). The Tantraloka truncates at 36 by taking:

```
Level 0:   4 vertices (the bare K₄)         =   4
Level 1:   4 vertices × 4 sub-vertices      =  16
Level 2:   partial unfolding of Level 1     =  16 (some vertices are terminal)
                                       Total =  36
```

The truncation is not arbitrary. Level 0 corresponds to the 4 upāyas (Śiva tattva through Īśvara). Level 1 corresponds to the 11 pure principles (Śuddha tattvas 5–15). Level 2 corresponds to the 25 impure principles (Aśuddha tattvas 16–36).

### 2.3 The 36-State Space

Let 𝒮 = {s₁, …, s₃₆} be the set of 36 tattva states. Each student state maps to a point in 𝒮. The mapping is many-to-one: many fine-grained UNO states collapse to the same tattva.

The 14 additional vowel states (a, ā, i, ī, u, ū, ṛ, ṝ, ḷ, e, ai, o, au, ḥ) extend 𝒮 to 𝒮₅₀ = 𝒮 ∪ {v₁, …, v₁₄}. These represent metacognitive positions — states about states, not states of content.

### 2.4 The Green Core

The center of K₄ is the point equidistant from all 4 vertices — the fixed point of the tetrahedron's symmetry group A₄. In register coordinates:

```
g* = (r*_{SO}, r*_{SI}, r*_{SA}, r*_{OI}, r*_{OA}, r*_{IA})
```

This is the **Green Core**: the register configuration at which all 4 vertices are in equilibrium and the student's self-excitation error Sv(O) has collapsed. Teaching trajectories converge to g*.

---

## 3. The Teaching Hypergraph

### 3.1 Definition

A **teaching decision** is a tuple:

```
h_t = (s_t, b_t, f_t, m_t, r_t, t_t, p_t, μ_t)
```

where at time t:

| Symbol | Set | Element | Range | Source |
|--------|-----|---------|-------|--------|
| s_t | 𝒮₅₀ | student state | 50 prototypes | Classifier |
| b_t | ℬ | behavior tags | ~700 observed | Student utterance |
| f_t | ℱ | function | 22 functions (UM_01–ME_03) | Teacher move |
| m_t | ℳ | mechanism shape | 20 shapes | Teacher move |
| r_t | ℝ⁶ | register vector | PR_01–04, IN_01–04, AT_01–03, LS_01–06, PD_01–04, MM_01–02 | Teacher modulation |
| t_t | 𝒯 | traps avoided | ~95 observed | Teacher's caution |
| p_t | 𝒫 | predicted impact | 23 outcomes | Teacher's expectation |
| μ_t | ℳ𝒯 | my_thoughts | Natural language | Teacher's metacognition |

Each h_t is a **hyperedge** — not a set of pairwise edges. The 8 elements co-occur as one teaching decision. Removing any element changes the decision.

### 3.2 The Hypergraph Η

Let Η = (V, E) where:
- V = 𝒮₅₀ ∪ ℬ ∪ ℱ ∪ ℳ ∪ ℝ⁶ ∪ 𝒯 ∪ 𝒫 ∪ ℳ𝒯
- E = {h₁, …, h_N} where N is the number of teaching decisions in the corpus (currently N = 738)

### 3.3 Temporal Structure

Teaching decisions are not independent. They form sequences:

```
σ = (h₁, h₂, …, h_k)
```

with temporal edges:

```
h_t → h_{t+1}  (the next decision follows the previous)
s_t → s_{t+1}  (student state transitions)
μ_t → μ_{t+1}  (metacognitive updates)
```

The sequence σ is called a **teaching arc**.

---

## 4. The Transition Model

### 4.1 Problem Statement

Given the current pedagogical state (s_t, b_t, r_t) and conversation history (h₁, …, h_{t-1}, h_t), select (f_t, m_t, r_t, t_t) such that the next student state s_{t+1} is closer to the Green Core than s_t.

### 4.2 The Transition Function

Learn a function T:

```
T: 𝒮₅₀ × ℱ × ℳ × ℝ⁶ → Δ(𝒮₅₀)
```

where Δ(𝒮₅₀) is the probability simplex over student states. T(s_t, f_t, m_t, r_t) gives the distribution of s_{t+1} conditioned on the teaching decision.

The empirical data from UNO provides ~580 observed transitions. Each transition is:

```
((s_t, f_t, m_t, r_t), s_{t+1})
```

with a label from {true, partial, false} indicating whether the observed s_{t+1} matched the teacher's predicted impact p_t.

### 4.3 The Register Prediction Model

Learn a function R:

```
R: 𝒮₅₀ × ℱ × ℳ × ℒ → ℝ⁶
```

where ℒ = {Therapeutic, Advaita, Socratic, Gurdjieffian, Realist, Buddhist} is the lineage set. R predicts the register vector given the student state, chosen function, chosen mechanism, and lineage.

### 4.4 The Green Core Loss

For a teaching arc σ = (h₁, …, h_k), define:

```
ℒ(σ) = Σ_t ||r_t - g*||² + λ · Σ_t d(s_{t+1}, g*)
```

where d(s, g*) is the geodesic distance from state s to the Green Core in 𝒮₅₀, and λ is a hyperparameter controlling the tradeoff between register convergence and state convergence.

The loss is minimized when:
1. The register vector converges to the Green Core (all 6 dimensions at equilibrium)
2. The student state converges to the recognition state (the Mātṛkā vowel ḥ — completion)

---

## 5. The Lineage Condition

### 5.1 Definition

A lineage ℓ ∈ ℒ is a conditional distribution over the teaching hypergraph:

```
P(f_t, m_t, r_t | s_t, ℓ)
```

Each lineage has a preferred region of the (𝒮₅₀ × ℱ × ℳ × ℝ⁶) space. The corpus gives us 6 empirical distributions:

| Lineage | N | Preferred states (s) | Preferred functions (f) | Preferred register (r) |
|---------|---|---------------------|------------------------|----------------------|
| Therapeutic | 201 | defensive, somatic, emotional | UM_04, UM_06 | PR_02–03, IN_02–03 |
| Advaita | 166 | seeking, confused, clarity | RM_03, UM_06 | PR_02, IN_03, PD_04 |
| Socratic | 130 | cooperative, intellectual | UM_01, UM_03 | PR_02–03, LS_02–03 |
| Gurdjieffian | 122 | resistant, defiant | UM_05, UM_06 | PR_03, IN_03, LS_04 |
| Realist | 111 | cooperative, amused | UM_02, UM_03 | PR_02, LS_05 |
| Buddhist | 8 | seeking, open | UM_04, RM_03 | PR_02, PD_02 |

### 5.2 Lineage Switching

The system is not bound to a single lineage. For a conversation with k turns, define the lineage sequence:

```
(ℓ₁, …, ℓ_k)
```

The lineage at turn t is selected by:

```
ℓ_t = argmax_ℓ P(ℓ | s_t, h_{t-1})
```

where P(ℓ | s_t, h_{t-1}) is the posterior probability of lineage ℓ given the current student state and the previous turn's outcome. This allows the system to shift from Therapeutic (crisis de-escalation) to Socratic (conceptual clarification) to Advaita (direct pointing) within a single conversation.

---

## 6. The Metacognitive Model (my_thoughts)

### 6.1 The Reconstruction Task

Each hyperedge h_t contains μ_t (my_thoughts). The metacognitive model learns to reconstruct μ_t from the other 7 elements:

```
M: 𝒮₅₀ × ℬ × ℱ × ℳ × ℝ⁶ × 𝒯 × 𝒫 → ℳ𝒯
```

The inverse is the move generation model:

```
M⁻¹: 𝒮₅₀ × ℬ × ℳ𝒯 × (f_t, m_t, r_t history) → ℱ × ℳ × ℝ⁶ × 𝒯 × 𝒫
```

M⁻¹ is the **policy model** — it generates teaching decisions from the teacher's internal state. Once trained, M⁻¹ can generate new teaching decisions without referring to the UNO corpus.

### 6.2 Metacognitive Delta

The metacognitive update from turn t to t+1 is:

```
Δμ_t = μ_{t+1} - μ_t
```

This Δ represents what the teacher learned from the student's response. The metacognitive model learns to predict Δμ from (h_t, s_{t+1}):

```
U: H × 𝒮₅₀ → Δℳ𝒯
```

U is the **learning-to-learn model** — it captures how the teacher updates their beliefs based on observed outcomes.

---

## 7. The Proof System (Sanskritree)

### 7.1 Theorem

A theorem is a conditional statement:

```
φ(s, ℓ) → (f, m, r, p)
```

meaning: "When the student is in state s with lineage ℓ, the recommended teaching decision is (f, m, r), predicting impact p."

Each theorem is derived from one or more hyperedges in Η. The confidence in theorem φ is:

```
conf(φ) = (N_success + 1) / (N_total + 5)
```

(the Bayesian success rate with uniform prior to avoid overtrusting small samples).

### 7.2 Proof

A theorem is proved when:

```
conf(φ) > θ_proved  (θ_proved = 0.8, say)
```

A theorem is refuted when:

```
conf(φ) < θ_refuted (θ_refuted = 0.2, say)
```

A theorem is conjectured when:

```
conf(φ) = NaN (no data — proposed by the dreaming cycle)
```

### 7.3 The Error Book

The Error Book is a set of constraints:

```
ε = {c₁, …, c_m}
```

where each c_j is a constraint of the form:

```
¬(s, ℓ, f)  (do not use function f with state s in lineage ℓ)
```

Constraints are added to ε when a theorem is refuted. Constraints are removed from ε when:

```
P(failure | s, ℓ, f) < θ_forgive  (θ_forgive = 0.05, say)
```

---

## 8. The Dynamical System

### 8.1 State Equations

The system's state at time t is:

```
X_t = (s_t, b_t, r_t, μ_t, conf_t, ε_t)
```

where:
- s_t ∈ 𝒮₅₀ is the student state
- b_t ∈ ℬ^* is the behavior tag multiset
- r_t ∈ ℝ⁶ is the register vector
- μ_t ∈ ℳ𝒯 is the metacognitive state
- conf_t: Φ → [0,1] is the confidence function over all theorems
- ε_t is the current Error Book

### 8.2 Update Equations

The system evolves by:

```
1. Classification:    s_t, b_t = C(user_text_t | h_{t-1})
2. Lineage selection: ℓ_t = L(s_t, conf_t, ε_t)
3. Theorem lookup:    Φ_t = {φ ∈ Φ | φ.s = s_t, φ.ℓ = ℓ_t, conf_t(φ) > θ}
4. Error Book check:  Φ'_t = Φ_t \ ε_t(s_t, ℓ_t)
5. Decision:          (f_t, m_t, r_t, p_t) = argmax_φ conf_t(φ) for φ ∈ Φ'_t
6. Register adjust:   r_t ← R(s_t, lineage, previous outcome)
7. Render:            response_t = LLM(f_t, m_t, r_t, RO_content(s_t))
8. Observe:           user_text_{t+1}
9. Classify:          s_{t+1}, b_{t+1} = C(user_text_{t+1} | h_t)
10. Evaluate:         match = (p_t ≈ observed s_{t+1})
11. Update:           conf_{t+1} = update(conf_t, φ, match)
12. Error Book:       ε_{t+1} = update(ε_t, φ, match, s_{t+1})
13. Metacognitive:    μ_{t+1} = μ_t + U(h_t, s_{t+1})
```

### 8.3 Convergence Criteria

A teaching arc σ converges when:

```
lim_{t→∞} ||r_t - g*|| → 0
lim_{t→∞} d(s_t, s_recognition) → 0
```

where s_recognition ∈ 𝒮₅₀ is the completion state (Mātṛkā vowel ḥ). In practice, convergence is declared when:

```
||r_t - g*|| < δ_register AND d(s_t, s_recognition) < δ_state
```

for 3 consecutive turns, where δ_register and δ_state are hyperparameters.

---

## 9. Parameter Count

### 9.1 The Core Model

The smallest learnable model operates on:

| Component | Dimension | Source |
|-----------|-----------|--------|
| State embedding | 384 | sentence-transformers (frozen) |
| Compressed state | 128 | nn.Linear(384, 128) |
| Lineage embedding | 16 | nn.Embedding(7, 16) |
| Function logits | 22 | nn.Linear(128+16, 22) |
| Mechanism logits | 15 | nn.Linear(128+16, 15) |
| Register prediction | 6 | nn.Linear(128+16, 6) |
| Next-state projection | 384 | nn.Linear(128+16, 384) |

Total parameters:

```
state_compressor:   384 × 128 + 128       = 49,280
lineage_embed:       7 × 16               =    112
fusion:           (128 + 16) × 128 + 128  = 18,560
function_head:      128 × 22 + 22         =  2,838
mechanism_head:     128 × 15 + 15         =  1,935
register_head:      128 × 6 + 6           =    774
next_state_head:    128 × 384 + 384       = 49,536
Total:                                     123,035
```

The hypergraph metacognitive model M adds:

```
state_encoder:     384 × 128 + 128        = 49,280
behavior_encoder:  700 × 32 + 32          = 22,432
function_encoder:   22 × 16 + 16          =    368
mechanism_encoder:  20 × 16 + 16          =    336
register_encoder:    6 × 16 + 16          =    112
trap_encoder:       95 × 16 + 16          =  1,536
impact_encoder:     23 × 16 + 16          =    384
fusion:           (128+32+16+16+16+16+16) × 256 + 256 = 55,808
my_thoughts_head:  256 × 384 + 384        = 98,688
Total M:                                   228,944
Combined total:                             352,000

Despite the complex formalism, the actual learned model has ~350K parameters — 0.0002× the size of a 7B LLM. The geometry (K₄, 36 tattvas, 6 register dimensions) provides the inductive bias that makes this possible with 738 training examples.

---

## 10. Complexity Bounds

### 10.1 Inference

Each inference step (classification → theorem lookup → decision → render):

- Classification: O(d) dot product with 50 prototypes, d = 384. Negligible.
- Theorem lookup: O(log N) for N = 738 COs via hash table on (s, ℓ) pairs. Negligible.
- Error Book check: O(|ε|) where |ε| is the number of active constraints (bounded by total failures).
- Render: single LLM API call. Dominates latency.
- Total inference time: ~LLM API call + 10ms.

### 10.2 Training

Training the core model on 738 examples:

- Forward pass: O(N · (d² + d·h)) where N = 738, d = 384, h = 128. ~2 × 10⁷ FLOPs.
- Backward pass: ~2× forward. ~4 × 10⁷ FLOPs.
- Total per epoch: ~6 × 10⁷ FLOPs.
- 100 epochs: ~6 × 10⁹ FLOPs.
- Wall time at 10¹² FLOPs/s (CPU): ~6ms. At 10¹³ FLOPs/s (GPU): negligible.

Training the hypergraph model M on 738 hyperedges:

- Forward: O(N · (h₁h₂ + h₂h₃)) where h₁ = 252 (fused input), h₂ = 256, h₃ = 384.
- ~N · (252·256 + 256·384) = 738 × 162,816 ≈ 1.2 × 10⁸ FLOPs.
- 100 epochs: ~1.2 × 10¹⁰ FLOPs. ~12s on CPU.

### 10.3 Storage

- 738 COs: ~738 × 2KB = ~1.5MB
- Policy weights: ~500KB
- Core model: ~1.4MB (FP32) / ~350KB (FP16)
- Metacognitive model: ~900KB (FP32) / ~230KB (FP16)
- Error Book: grows with use, typically < 100KB
- Total permanent storage: < 5MB

---

## 11. Formal Summary

The system is a discrete-time dynamical system operating on a 6-dimensional register manifold M ≅ ℝ⁶ (the edge tension space of K₄), with a finite state space 𝒮₅₀ of 50 Mātṛkā prototypes (the unfolded K₄ truncated at 36+14 = 50), driven by 22 function operators (the edge traversal functions of the teaching tetrahedron), conditioned on 6 lineages (the empirical teaching distributions), validated by a Bayesian theorem-prover (sanskritree), and rendered by an LLM (the verbalization layer external to the dynamical core).

The core model has 123K parameters. The full system (including metacognition) has 352K parameters. Training on 738 examples completes in under 30 seconds on commodity hardware. Inference adds ~10ms overhead to whatever LLM is used for the final response generation.

The geometry is not a metaphor. K₄ is the formal object. The 4 phases are its vertices. The 6 registers are its edges. The 36 tattvas are its unfolded structure. The teaching move is an edge traversal. The Green Core is the fixed point. The dynamical system converges toward it when the correct sequence of traversals is applied.

---

## Appendix A: Relationship to Existing Formalisms

| Our Term | Ñāṇavīra | Tantraloka | HXRMXS | Levin | GNN Literature |
|----------|----------|------------|--------|-------|----------------|
| K₄ | Fundamental Structure | Śiva tattva (1) | 4 phases | Cognitive light cone | Complete graph on 4 vertices |
| Register vector | 6 relations | 6 kañcukas (5-9) | 6 register dimensions | 6 bioelectric ion channels | 6-dimensional edge features |
| State space 𝒮₅₀ | Impermanent moments | 36 tattvas + 14 vowels | 530 observed states | Morphospace | 50 prototype node embeddings |
| Teaching hyperedge | Co-arising | Mātṛkā phoneme | [PEDAGOGY] block | Bioelectric synapse | Message-passing incident hyperedge |
| Transition T | Paṭiccasamuppāda | Tattva ascent/descent | impact_predicted → impact_update | Morphospace navigation | Next-state prediction head |
| Green Core g* | Nibbāna | Anākhyā (38th) | Recognition | Target attractor | Fixed-point attractor |
| Error Book | Sakkāya-diṭṭhi | Māyā's veil | Traps avoided | Wrong attractor | Negative constraints |
| Dreaming cycle | Reflexive hierarchy | Krama cycle | Weekly cron | Regeneration | Graph diffusion generation |

---

## 12. Continuous State Dynamics

### 12.1 Motivation

The transition model T(s_t, f_t, m_t, r_t) → s_{t+1} is discrete — it updates only at teacher turns. Between turns, the student's state evolves continuously. A LiquidODE (Hasani et al., 2020, arXiv:2006.04439) models this intra-turn dynamics.

### 12.2 State Evolution Between Turns

Let τ ∈ [0, 1] parameterize the time between the teacher's move at turn t and the student's response at turn t+1. The continuous student state evolves as:

```
ds(τ)/dτ = -s(τ)/τ_s + σ(W_in · h(τ) + W_rec · s(τ) + b)
```

where:
- s(τ) is the student state embedding at time τ
- τ_s is a time constant (how fast the student processes the teacher's move)
- h(τ) is the teacher's move embedding (f, m, r) held constant during the turn
- σ is a nonlinearity
- W_in, W_rec are learned

The observed state s_{t+1} is the state at τ = 1, possibly with noise:

```
s_{t+1} = s(1) + ε, ε ~ N(0, σ²)
```

This gives a finer-grained picture of whether the move actually shifted the student, or just triggered a surface response. A move that produces a fast, stable transition to the target state is more effective than one that produces oscillations or no movement.

### 12.3 Collapse Mechanism

At the decision boundary (t + Δt), the continuous state distribution collapses to a discrete teaching decision. This is analogous to the harmonic collapse in LH-LLM V2 (40Hz resonance):

```
Given: continuous state distribution p(s) at time t + Δt
Collapse: select (f, m, r) = argmax_{f,m,r} ∫ p(s) · P(f, m, r | s) ds
```

The interval Δt varies by register: PR_01 (gentle) → slow collapse (~2s), PR_04 (crushing) → fast collapse (~100ms). This models the teacher's decision speed varying with urgency.

---

## 13. Online CO Weight Update

### 13.1 Hebbian + Homeostatic Learning

After each turn, the selected CO's weights update by a combined Hebbian-homeostatic rule (adapted from LH-LLM V3 Hebbian plasticity + Turrigiano 2008 synaptic scaling):

```
Δw_i = η · (c_i - γ · w_i)
```

where:
- w_i is the confidence weight of CO i
- c_i = cos(state_emb_t · next_state_emb_{t+1}) is the "correlation" — how aligned the observed state transition was with the CO's predicted impact
- η is the learning rate (0.1)
- γ is the decay rate (0.01 — slow forgetting of old patterns)

Homeostatic scaling normalizes weights across all COs sharing the same (state, lineage):

```
w_i ← w_i · (μ / ||w||)  ∀ i ∈ {(s, ℓ)}
```

where μ is the target mean weight across COs for state s and lineage ℓ. This prevents a single CO from dominating and creating a monoculture of teaching moves.

### 13.2 Priority-Weighted Selection

At inference time, candidate COs are ranked by:

```
score_i = w_i · priority(f_i, s_t) · safety(f_i, s_t)
```

where:
- w_i is the confidence weight
- priority(f_i, s_t) = 1 - (function_risk(f_i) × state_fragility(s_t)) — confrontational moves get lower priority when the state is fragile
- safety(f_i, s_t) = P(no_harm | f_i, s_t) — estimated from Error Book: "did this function ever cause harm for this state?"

META functions (ME_01–03) have safety = 1.0. UNMAKING functions range 0.3–0.7 depending on state fragility. This ensures that when the student needs de-escalation, META moves are selected before UNMAKING moves.

---

## 14. Superposition over Commentary Objects

### 14.1 Amplitude Encoding

Instead of selecting a single CO per turn, maintain a distribution over all COs with amplitudes:

```
a_i = α · sim(s_t, s_i) + β · match(r_t, r_i) + γ · compat(ℓ, ℓ_i) + δ · w_i
```

where a_i is the amplitude of CO i, and α, β, γ, δ are weights summing to 1. All COs are "active" with different amplitudes.

### 14.2 Amplitude Amplification (Grover-like)

Apply a Grover-style diffusion-amplification cycle (analogous to Grover's search, not quantum hardware — simulated amplitude amplification):

```
1. Phase inversion: a_i ← -a_i if w_i < threshold  (demote low-confidence COs)
2. Diffusion: a_mean = mean(a); a_i ← 2 · a_mean - a_i  (reflect around mean)
3. Repeat steps 1-2 for k iterations (typically k = √N for Grover speedup)
4. Collapse: select i ~ Categorical(softmax(a))
```

The amplitude amplification suppresses COs that have low confidence (phase inversion) while boosting COs that are consistent with the current state, lineage, and register (diffusion). After k iterations, the distribution concentrates on the optimal CO.

### 14.3 Harmonic Register Modulation

The 6 register dimensions act as harmonics on the amplitude distribution. Changing a register is like changing the frequency of one harmonic — the interference pattern shifts, and different COs resonate:

```
a_i(harmonic) = a_i · Π_{d=1..6} cos(π · (r_d - r_{i,d}) / range_d)
```

When the register vector r_t exactly matches a CO's register r_i, all cos terms = 1 and the amplitude is unchanged. As they diverge, the amplitude is suppressed by a factor in [0, 1] for each dimension. This naturally selects COs whose register profile matches the current teaching context.

---

## Appendix B: Key Hyperparameters

| Parameter | Symbol | Value | Source |
|-----------|--------|-------|--------|
| State space size | \|𝒮₅₀\| | 50 | 36 tattvas + 14 Mātṛkā vowels |
| Register dimensions | dim(r) | 6 | K₄ edges |
| Functions | \|ℱ\| | 22 | HXRMXS taxonomy |
| Minimum functions | \|ℱ_min\| | 12 | 3 per phase, P system completeness |
| Mechanisms | \|ℳ\| | 20 | HXRMXS taxonomy |
| Lineages | \|ℒ\| | 6 | UNO corpus |
| Core model params | | 123,035 | Calculated above |
| Full system params | | 351,979 | Calculated above |
| Proven theorem threshold | θ_proved | 0.8 | Hebbian prior |
| Refuted theorem threshold | θ_refuted | 0.2 | Hebbian prior |
| Hebbian learning rate | η | 0.1 | Turrigiano 2008 |
| Hebbian decay | γ | 0.01 | Slow forgetting |
| Green Core register | g* | (0,0,0,0,0,0) | K₄ symmetry center |
| Training epochs | | 100 | Overfitting check at 738 examples |
| Decision collapse interval (PR_01) | Δt_min | 2.0s | Gentle → slow |
| Decision collapse interval (PR_04) | Δt_max | 0.1s | Crushing → fast |
| Amplification iterations | k | √N | Grover schedule |
| Register convergence δ | δ_register | 0.1 | Tunable |
| State convergence δ | δ_state | 0.1 | Tunable |

## Appendix C: Related Papers

| Paper | Authors | Year | Relevance |
|-------|---------|------|-----------|
| A Survey on Hypergraph Neural Networks (arXiv:2404.01039) | Kim et al. | 2024 | Teaching hyperedges as HNN input |
| Temporal Graph Networks (arXiv:2006.10637) | Rossi et al. | 2020 | Student memory across conversation turns |
| Heterogeneous Graph Transformer (arXiv:2003.01332) | Hu et al. | 2020 | Cross-lineage pattern learning |
| GraphGPS (arXiv:2205.12454) | Rampášek et al. | 2022 | Local + global attention over CO graph |
| Liquid Time-Constant Networks (arXiv:2006.04439) | Hasani et al. | 2020 | Continuous student state dynamics |
| Closed-form Continuous-time Models (arXiv:2106.13898) | Hasani et al. | 2021 | Faster LiquidODE alternative |
| Diffusion Models on Graphs (arXiv:2302.02591) | — | 2023 | Generating novel teaching pathways |
| Swarm Chemistry (arXiv:2409.01469) | Sayama | 2024 | CO interaction dynamics (speculative) |
| Synaptic Scaling (Turrigiano) | Turrigiano | 2008 | Homeostatic weight normalization |
| P Systems with Chained Rules (CMC 2011) | Sburlan | 2011 | Two-membrane completeness |
