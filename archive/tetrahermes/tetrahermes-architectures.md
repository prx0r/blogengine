# TetraHermes — 5 Architectures for the Full System

Based on: `unoguide.md` (graph extraction + 10-step live system), `metaunoguide.md` (metacognitive hypergraph + 6 architectures), `tetrahermes.md` (738 COs, 6 lineages, sanskritree), `hypothetical/` (learning loop, dreaming, validation), and `geometricengine/src/` (working implementation).

## Common Foundation (All Architectures Share This)

```
UNO.txt (738 blocks, 6 lineages)
  → Fixed parser (handle concatenated JSON arrays)
  → 738 Commentary Objects exported
  → Linked to 169 ROs by lineage
  → policy_weights table seeded with all transitions
```

---

## Architecture 1: Weighted Graph + Policy Weights (The Current System, Expanded)

**Core idea:** The geometricengine as-is, but with all 6 lineages. No neural network. No LLM in cognition path. Pure weighted transition graph.

```
Input: user_text
  ↓
State Classifier (embedding similarity → 50 Mātṛkā states)
  ↓
Policy Query (geometricengine's train.py weights):
  state → top_k functions
  state → top_k mechanisms
  state → top_k register settings
  ↓
Pathway Selection (weighted sampling with similarity fallback)
  ↓
CO Retrieval (find CO for lineage × state × function)
  ↓
LLM Renderer (DeepSeek: verbalize the move using RO content)
  ↓
Response to user
  ↓
Feedback → policy_weights.update() + CO.success/failure++
```

**Pros:**
- Already works (geometricengine runs)
- No training cost
- Fully auditable (every move traces to a weighted transition)
- Similarity fallback handles unseen states

**Cons:**
- No cross-lineage generalization (can't say "Socratic move would work here because Advaita did something similar")
- No metacognitive modeling (can't generate its own `my_thoughts`)
- Static weights (only updates from feedback, no pattern discovery)

**When to use:** MVP. Get the system running with all 6 lineages this week.

---

## Architecture 2: Heterogeneous Graph Neural Network (PyTorch Geometric)

**Core idea:** The full GNN approach from `unoguide.md` Stage 3. Build a HeteroData graph with all node/edge types, train a Heterogeneous Graph Transformer to predict next move.

```
Node types (17): state, move, mechanism, action, register, lineage, trap,
                impact, episode, turn, user_utterance, assistant_move,
                behavior_tag, phase, intent, meta_thought, concept (from ROs)

Edge types (14): expresses, has_behavior, responds_with, uses_mechanism,
                 performs_action, in_phase, has_register, avoids_trap,
                 predicts, transitions_to, next_turn, contains, has_concept,
                 lineage_uses_move

Training task: 
  Given: current subgraph (state_t, lineage, recent turns, RO concepts)
  Predict: next move node (function_id)

Pipeline:
  node2vec embeddings → HeteroData → HGT/GAT → next-move classification
```

**Inference:**
```
user_text → infer state → build current subgraph → 
HGT forward pass → top-3 moves → select via register predictor →
LLM verbalize → observe outcome → update graph
```

**Pros:**
- Generalizes across lineages (HGT can learn "Socratic and Advaita both use structural_analogy from different states")
- Embeddings capture semantic similarity between states/moves
- Can incorporate RO concepts as node features
- Active research area (PyG, papers cited in unoguide.md)

**Cons:**
- Requires labeled data (738 transitions is small for GNNs — risk of overfitting)
- Training infra (PyG, GPU)
- Black box embeddings (less auditable than weighted transitions)
- Cold start for new states without similarity fallback

**When to use:** After MVP, once you have 2,000+ real conversation transitions to augment UNO.

---

## Architecture 3: Metacognitive Hypergraph Teacher (MHT)

**Core idea:** From `metaunoguide.md`. Each turn is a hyperedge binding {state, behavior, move, mechanism, register, trap, prediction, my_thoughts}. Train a model to reconstruct `my_thoughts` from the graph, then invert it to generate moves.

```
Layer 1 — Turn Graph:
  UserUtterance_t → StudentState_t → Move_t → Register_t → PredictedImpact_t → UserUtterance_t+1

Layer 2 — Metacognitive Hyperedge (one per turn):
  H_t = {StudentState, BehaviorTags, Move, Mechanism, Register, Trap, Impact, MetaThought}
  "These things co-occurred as one teaching decision."

Layer 3 — Temporal Memory:
  MetaThought_t → MetaThought_t+1
  State_t → State_t+1
  Move_t → Move_t+1

Layer 4 — Policy Output:
  Predict: next_state, next_move, next_register, next_my_thoughts_summary
```

**The Novel Task — Metacognitive Graph Distillation:**

```
Task A (Forward): Given graph without MetaThought → predict MetaThought
  This teaches the model what internal rationale belongs to a situation.

Task B (Inverse): Given user_text + previous_meta_thoughts + RO concepts → generate candidate state + move + impact
  This is the live inference path.

Task C (Delta): MetaThought_t + user_reply → MetaThought_t+1
  The metacognitive update loop. The system learns how to update its own beliefs.

Task D (Lineage Translation): Socratic MetaThought → equivalent Advaita move geometry
  "What would Nisargadatta do with this Socratic insight?"
```

**Pros:**
- The most novel architecture (few systems model teacher metacognition)
- `my_thoughts` becomes a latent policy language
- Cross-lineage translation is genuinely valuable
- Hypergraph better captures the structure of teaching decisions

**Cons:**
- Most complex to implement
- Requires structured parsing of `my_thoughts` into sub-signals (state_hypothesis, move_rationale, trap_hypothesis, prediction, watch_signal, uncertainty)
- Small dataset for the complexity of the model
- Hypergraph GNNs are less mature than regular GNNs

**When to use:** After Architecture 2 is working. The MHT is the research contribution — the thing that makes this novel.

---

## Architecture 4: Sanskitree — The Proof Assistant

**Core idea:** No neural network. Symbolic theorem-prover approach inspired by Lean. Each CO is a theorem. Teaching outcomes are proofs. Error Book is the contradiction log.

```
CO THEOREM:
  ⊢ lineage(L) ∧ state(S) ∧ topic(T) → function(F) @ register(R)
  
PROOF:
  Applied with student → student reached expected next state S' → theorem holds
  Counterexample: student disengaged / worsened → theorem needs revision

ERROR BOOK ENTRY:
  co:gurdjieff_shock_reductio failed with state hopeless_shutdown.
  CONSTRAINT: When state is hopeless_shutdown, do NOT use UM_03 (reductio_extension).
  PREFERRED: ME_02 (aporia_validation) at PR_01, IN_04.

DREAMING CYCLE — CONJECTURE GENERATION:
  "We have 0 COs for state nihilistic_collapse × lineage Advaita.
   Closest known: state hopeless_shutdown × Therapeutic → ME_02.
   Propose: co:dream_advaita_nihilistic_collapse_001 based on ME_02 pattern."
```

**Inference (no model, pure lookup):**
```
user_text → state classifier (embedding sim) → 
find COs for (lineage, state) → 
if multiple: pick highest success_rate (success / total) →
if none: similarity fallback to nearest known state →
if still none: use lineage-agnostic default (most common function for this state)
```

**Growth mechanics:**
```
- Each conversation adds +1 to CO.success_count or CO.failure_count
- When failure_count > threshold: CO flagged for review
- When success_rate drops below 0.3: CO demoted to "experimental"
- When state has 0 COs: dreaming cycle proposes candidate
- Error Book constraints are checked at inference time (block invalid moves)
```

**Pros:**
- Zero training cost
- Fully auditable (every decision traces to a specific CO and its success/failure history)
- No catastrophic forgetting (COs are never deleted, only demoted)
- Grows organically with use
- Handles sparse data well (unlike GNNs)

**Cons:**
- No generalization (can't interpolate between states — must have exact match or fallback)
- No pattern discovery (can't learn "these 3 COs share a structure")
- Manual clustering of 530 states into 50 is essential
- Doesn't leverage the richness of UNO's `my_thoughts` and `accumulated_insight`

**When to use:** If you want the fastest path to a working system that improves with use. Also the best fit for the "Lean proof" vision you described.

---

## Architecture 5: TetraHermes Hybrid (The Full Vision)

**Core idea:** All four architectures above, integrated. Each handles what it's best at:

```
┌──────────────────────────────────────────────────────────────────┐
│  TETRAHERMES — The Integrated System                             │
│                                                                  │
│  Layer 1 — Fast Path (Architecture 4 — Sanskitree)              │
│    CO lookup → weighted by success_rate → basic inference        │
│    Purpose: respond immediately, handle common cases             │
│    Runs: every turn, <50ms                                       │
│                                                                  │
│  Layer 2 — Policy Path (Architecture 1 — Geometricengine)       │
│    policy_weights query → similarity fallback → pathway selection │
│    Purpose: handle rare states, cold-start, robust fallback      │
│    Runs: when Sanskitree finds no good CO                        │
│                                                                  │
│  Layer 3 — Pattern Discovery (Architecture 2 — GNN)             │
│    Nightly training: update node embeddings, cluster states,     │
│    discover cross-lineage patterns                                │
│    Purpose: find "Socratic UM_01 ≈ Advaita RM_03" etc.           │
│    Runs: nightly cron (offline)                                  │
│                                                                  │
│  Layer 4 — Metacognitive Model (Architecture 3 — MHT)           │
│    Train on my_thoughts → generate internal reasoning            │
│    Purpose: the "internal analyst" that explains its own choices │
│    Runs: when my_thoughts is needed (user asks "why?")           │
│                                                                  │
│  Layer 5 — Dreaming / Growth (All architectures)                │
│    Weekly: sample ROs + COs → detect cold pairs →               │
│    propose new COs → find cross-lineage patterns →               │
│    Error Book pruning → graph updates                            │
│    Runs: Sunday 2am                                              │
└──────────────────────────────────────────────────────────────────┘
```

**Integration flow:**

```
User says something
  ↓
Layer 1 (Sanskitree): {lineage, state} → CO lookup
  if CO found with success_rate > 0.7 → use it immediately
  if CO found but low confidence → pass to Layer 2
  if no CO → pass to Layer 2
  ↓
Layer 2 (Geometricengine): policy_weights query → top-3 candidates
  if similarity > threshold → pick best by weight
  if low similarity → fallback to lineage-agnostic weights
  ↓
Layer 3 (GNN — nightly): embedding-based state similarity
  (not used in live inference, only for dreaming cycle)
  ↓
Response generated:
  CO provides the move (phase, function, mechanism, register)
  RO provides the content (what to teach)
  LLM renders the response (how to say it)
  ↓
User responds
  ↓
Feedback: Layer 1 CO.success_count++ or CO.failure_count++
  if failure → Error Book constraint
  if cold state → dreaming cycle proposes new CO
  ↓
Nightly (Sunday 2am):
  Layer 3: GNN training → new embeddings → cluster discovery
  Layer 4: MHT training → my_thoughts reconstruction task
  Dreaming: sample COs → cold pairs → propose new ones
  Error Book: prune outdated constraints
```

**Pros:**
- Best of all approaches
- Fast path for common cases, robust fallback for rare ones
- Pattern discovery improves the system over time
- Metacognitive model enables self-explanation
- No single point of failure (layers degrade gracefully)

**Cons:**
- Most complex to build
- Multiple models to maintain
- Need to define clear handoff criteria between layers

---

## Comparison Table

| Dimension | Arch 1: Weighted Graph | Arch 2: GNN | Arch 3: MHT | Arch 4: Sanskitree | Arch 5: Hybrid |
|-----------|----------------------|-------------|-------------|-------------------|----------------|
| **Training cost** | None | Medium (GPU) | High (GPU + data prep) | None | Medium |
| **Inference speed** | <10ms | <100ms | <200ms | <5ms | <50ms (fast path) |
| **Auditability** | High | Low | Low | Very High | High |
| **Pattern discovery** | None | High | Very High | None (manual) | High |
| **Cold start** | Good (similarity fallback) | Poor | Poor | OK (fallback chain) | Good (layered) |
| **Novelty** | Low | Medium | High | Medium | Very High |
| **Sparse data handling** | Good | Poor | Poor | Very Good | Good |
| **my_thoughts modeling** | No | No | Yes | No | Yes (Layer 4) |
| **Cross-lineage learning** | No | Yes | Yes | No | Yes |
| **Implementation time** | 1 week | 3-4 weeks | 4-6 weeks | 1 week | 6-8 weeks |

---

## Recommendation

**Week 1:** Architecture 4 (Sanskitree) + Architecture 1 (Geometricengine) as fallback. Fix the parser, export all 738 COs, get the system running with all 6 lineages. This is the MVP.

**Week 2-3:** Architecture 2 (GNN) — nightly training for pattern discovery. The GNN doesn't run live inference, it runs offline to find cross-lineage patterns that feed back into Architecture 4's CO proposals.

**Week 4+:** Architecture 3 (MHT) — the metacognitive model. This is the research contribution. Train my_thoughts reconstruction, then invert it for move generation. This is what makes the system "conscious" of its own teaching.

**Architecture 5 is the final form** — but you don't build it directly. It emerges by adding layers 3 and 4 on top of 1 and 4 once the foundation is stable.

The sanskritree you were trying to build is Architecture 4. It's the simplest path to a working system and the foundation everything else builds on. Fix the parser, export the COs, and you have your proof assistant.
