# TetraHermes — 4 Complete Systems

Based on: 100 arxiv papers (graph NNs, temporal networks, hypergraph networks, information theory, generative models, causal inference, reinforcement learning, few-shot learning, optimization); LH-LLM V2/V3 extracted mechanisms; Ñāṇavīra's K₄ formal structure; geometricengine implementation; 738 UNO teaching blocks.

Each system is a complete, buildable architecture with specified mechanisms, training procedure, inference pipeline, and test criteria. They are ordered by complexity.

---

## System 1: Weighted Transition Graph + Thompson Sampling

**Core mechanism:** Multi-armed bandit with Bayesian posterior updates over COs. No neural network. No GNN. Pure probabilistic inference.

**Papers used:**
- Thompson sampling for contextual bandits (arXiv:2011.04626, from bandit query)
- Bayesian update rules (from bayesian optimization query)
- Information bottleneck for state compression (arXiv:2004.01945, from information theory query)
- Minimum description length for CO pruning (from information theory query)

### Architecture

```
                    ┌─────────────────────────┐
                    │  Student utterance       │
                    └────────┬────────────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │  Sentence-transformer    │  (frozen, 384-dim)
               │  → state embedding       │
               └────────┬────────────────┘
                        │
                        ▼
              ┌─────────────────────────┐
              │  k-NN state classifier   │  (50 prototypes, cosine sim)
              │  → s_t ∈ 𝒮₅₀            │
              │  → uncertainty score     │  (entropy over top-3)
              └────────┬────────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │  Thompson Sampling       │  ⭐ Core mechanism
              │  over COs for (s_t, ℓ)   │
              │                          │
              │  For each CO i:          │
              │    α_i = success_i + 1   │
              │    β_i = failure_i + 1   │
              │    θ_i ~ Beta(α_i, β_i)  │  (sample success prob)
              │  Select: argmax θ_i      │
              └────────┬────────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │  CO → (f, m, r, p)      │
              │  → DeepSeek render      │
              │  → response             │
              └────────┬────────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │  Observe next state s₂  │
              │  Update Beta(α, β):     │
              │    if s₂ = predicted:   │
              │      α += 1             │
              │    else:                │
              │      β += 1             │
              └─────────────────────────┘
```

### Key Mechanisms

**M1 — Thompson Sampling over COs:**
Each CO maintains a Beta posterior: P(success | CO_i) ~ Beta(α_i, β_i). At inference, sample θ_i from each posterior and select CO with highest θ_i. This naturally handles exploration (COs with high uncertainty get sampled because their Beta is wide) vs. exploitation (COs with high proven success have narrow high-probability Betas).

```
α_i = success_count_i + 1  (prior: Beta(1,1) = uniform)
β_i = failure_count_i + 1
θ_i ~ Beta(α_i, β_i)        (sample success probability)
selected = argmax θ_i
```

After observing outcome:
```
if success: α_i += 1
if failure: β_i += 1
```

**M2 — Information Bottleneck for State Distillation:**
When the utterance uncertainty is high (entropy > threshold), compress to the nearest tattva region using the information bottleneck principle: min I(Z; X) - β I(Z; Y) where Z is the compressed state, X is the utterance, Y is the tattva label. This prevents the system from overconfidently classifying ambiguous utterances into specific COs.

**M3 — MDL Pruning:**
Weekly prune COs where: (α_i + β_i) < 5 (too few observations to trust) OR β_i / (α_i + β_i) > 0.8 (failure rate too high). Use minimum description length: if removing a CO reduces the total description length of the policy (fewer failures, simpler model), delete it.

### Training

**Zero neural network training required.** Only Beta posterior updates from real conversations.

- Seed: α_i = 1, β_i = 1 for all 738 COs
- After each turn: update α_i or β_i
- After 50 conversations: run MDL pruning
- After 200 conversations: re-evaluate state prototypes (run k-means on observed utterances to refine 50 prototypes)

### Inference Cost

- State classification: O(50×384) dot product = ~19K FLOPs
- Thompson sampling: O(N_COs) = 738 Beta samples = negligible
- Total: < 1ms (CPU) + LLM call

### Tests

| Test | Method | Pass condition |
|------|--------|---------------|
| Beta convergence | Simulate 1000 conversations with known success rates | CO posteriors converge to correct success probabilities |
| Exploration coverage | Count unique COs selected in first 100 conversations | > 30% of eligible COs tried at least once |
| MDL pruning correctness | Inject a deliberately bad CO with 100 failures | CO removed within 2 pruning cycles |
| Thompson regret | Compare to greedy (argmax α/(α+β)) over 1000 sims | Thompson has > 10% lower regret on non-stationary success rates |

### Build Plan

```
Day 1: 
  └── Fix UNO parser → export 738 COs → add α, β fields
  └── Implement Beta sampling + argmax selection
Day 2:
  └── Wire to geometricengine pathway.py
  └── Add state classifier with uncertainty output
Day 3:
  └── Add MDL pruning cron job
  └── Write test suite
Day 4:
  └── Deploy chat interface
  └── Log all selections + outcomes
```

### Reflection

**Pros:** Simplest possible learning system. No training, no GPU, no overfitting. Thompson sampling naturally balances exploration/exploitation. Every decision is fully auditable (which CO was selected, what its α/β were).

**Cons:** Cannot generalize to unseen states — relies entirely on the 50 prototype coverage. No cross-lineage transfer. No pattern discovery. If a student enters a truly novel state, the system has no mechanism to adapt beyond falling back to the nearest prototype.

**Best for:** Immediate MVP. Get a working, improving system in 4 days.

---

## System 2: Heterogeneous Graph Transformer + Temporal Memory

**Core mechanism:** HGT (Hu et al., arXiv:2003.01332) over the teaching hypergraph, with TGN memory (Rossi et al., arXiv:2006.10637) for per-conversation student modeling.

**Papers used:**
- HGT — Heterogeneous Graph Transformer (arXiv:2003.01332, from attention query)
- TGN — Temporal Graph Networks (arXiv:2006.10637, from temporal query)
- Expressive TGN (arXiv:2209.15059, from message_passing query)
- Simple HGN (arXiv:2207.02547, from attention query)
- GraphGPS (arXiv:2205.12454, from attention query)

### Architecture

```
                    ┌─────────────────────────┐
                    │  Student utterance       │
                    └────────┬────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  State encoder (384→128)    │
              │  → s_t embedding            │
              └────────┬────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────┐
              │  TGN Memory Module           │  ⭐ Student memory
              │  Per-conversation memory:    │
              │    memory_t = GRU(           │
              │      memory_{t-1},           │
              │      [s_t, f_{t-1}, r_{t-1}] │
              │    )                         │
              │  Output: student_state_t     │
              └────────┬────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────┐
              │  HGT Forward Pass            │  ⭐ Graph reasoning
              │  Node types: state, func,    │
              │    mech, register, lineage   │
              │  Edge types: responds_with,  │
              │    uses, transitions_to,     │
              │    has_register              │
              │                              │
              │  Query: (s_t, ℓ_t) →         │
              │  → predict function node     │
              └────────┬────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────┐
              │  Register head (MLP)        │
              │  → r_t ∈ ℝ⁶               │
              └────────┬────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────┐
              │  DeepSeek render + respond   │
              └────────┬────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────┐
              │  Observe s_{t+1}            │
              │  TGN memory.update(s_{t+1}) │
              │  HGT: contrastive loss       │
              │    (s_t, f_t) vs (s_t, f')  │
              └─────────────────────────────┘
```

### Key Mechanisms

**M1 — TGN Memory Module (Rossi et al.):**
Each conversation has a memory vector that updates via GRU:

```
memory_t = GRU(memory_{t-1}, [s_t; f_{t-1}; r_{t-1}])
```

The memory encodes the conversation's state trajectory. When a student returns after a break, the memory is loaded from the database and used to initialize the TGN. This enables accurate state inference even in turn 1 of a multi-session conversation.

The TGN has 3 components:
1. **Memory updater:** GRU that reads (s_t, f_{t-1}, r_{t-1}) and updates memory
2. **Embedding module:** Transforms memory into node embeddings for HGT
3. **Message function:** When the student responds, the message (s_{t+1}, observed impact) is used to update memory

**M2 — HGT for Move Selection (Hu et al.):**
The heterogeneous graph has:

| Node type | Count | Features |
|-----------|-------|----------|
| State | 50 | 128-dim embedding |
| Function | 22 | 64-dim embedding |
| Mechanism | 20 | 32-dim embedding |
| Register | 6×4×3×... | 16-dim per config |
| Lineage | 6 | 16-dim embedding |
| CO | 738 | α, β, tattva region |

Edge types encode the relationships from the teaching hypergraph:
- state → function (responds_with)
- function → mechanism (uses)
- function → register (has_register)
- state → state (transitions_to)
- lineage → function (lineage_uses)
- CO → state (covers)
- CO → function (recommends)

The HGT forward pass at inference:
```
HGT(student_state_t, lineage_t, memory_t)
  → probability over 22 function nodes
  → argmax → f_t
```

**M3 — GraphGPS Hybrid (Rampášek et al.):**
Replace pure HGT with GraphGPS for the core message-passing. HGT handles the heterogeneous attention; GraphGPS adds global attention over the entire graph to find long-range analogies (e.g., "this Socratic CO resembles this Advaita CO even though they have different state labels").

```
GPSLayer(x) = 
  local_mp: HGT message passing → x_local
  global_attn: Transformer over all node embeddings → x_global
  output: FFN(concat(x_local, x_global))
```

**M4 — Contrastive Loss for State Transitions:**
Positive pair: (s_t, f_t) → observed s_{t+1} (the chosen function led to the predicted next state)
Negative pair: (s_t, f') → observed s_{t+1} (a different function would NOT have led to this state)

Contrastive loss: L = -log( exp(sim(z_positive)) / (exp(sim(z_positive)) + Σ exp(sim(z_negative))) )

This teaches the HGT to distinguish effective from ineffective moves for each state.

### Training

**Pre-training (offline, ~1 hour on CPU):**

```
Dataset: 738 COs + 580 transitions
Split: 80/20 train/test
Train: HGT + TGN jointly
  └── HGT parameters: ~200K (node embeddings + attention weights)
  └── TGN parameters: ~50K (GRU + memory projection)
  └── Loss: cross-entropy(function) + 0.1×contrastive + 0.01×L2
  └── Optimizer: AdamW, lr=1e-4, batch=32
  └── Epochs: 200 (early stop at val loss plateau, patience=10)
```

**Fine-tuning (online, per conversation):**

```
After each turn:
  └── Update TGN memory (always, no gradients)
  └── HGT: optional fine-tuning step (every 10 turns)
    └── Compute contrastive loss on observed (s_t, f_t, s_{t+1})
    └── One gradient step on HGT parameters
    └── Learning rate: 1e-6 (tiny, to avoid catastrophic forgetting)
```

### Inference Cost

- TGN memory update: GRU(128) = ~33K FLOPs
- HGT forward pass: ~200K FLOPs (sparse graph attention over ~800 nodes)
- Total: < 5ms (CPU) + LLM call

### Tests

| Test | Method | Pass condition |
|------|--------|---------------|
| TGN memory accuracy | Feed 50 UNO episodes, compare memory state to expected | Memory correctly encodes state trajectory (cosine sim > 0.9 w/ last state) |
| HGT function prediction | Holdout 20% of transitions | Top-3 accuracy > 75% |
| Contrastive improvement | With vs without contrastive loss on holdout | +5% accuracy with contrastive |
| Cross-lineage generalization | Train on Therapeutic+Socratic, test on Advaita | Top-1 accuracy > 40% (baseline: random = 4.5%) |
| Online fine-tuning stability | 1000 online update steps, check parameter drift | Parameter L2 norm change < 10% |

### Build Plan

```
Week 1: 
  └── Build HeteroData graph from 738 COs
  └── Implement HGT (use PyG's HGTConv)
  └── Pre-train on 580 transitions
Week 2:
  └── Implement TGN memory module
  └── Integrate memory into HGT inference
  └── Add contrastive loss
Week 3:
  └── Implement GraphGPS hybrid (local+global attention)
  └── Add online fine-tuning loop
  └── Profile: 5ms target
Week 4:
  └── Deploy with chat interface
  └── Run test suite
  └── Begin collecting real conversation data
```

### Reflection

**Pros:** Generalizes across states (HGT node embeddings cluster similar states together). Per-conversation memory via TGN captures student-specific patterns. Contrastive loss improves move selection. Cross-lineage patterns emerge naturally in HGT attention weights.

**Cons:** Requires pre-training (1 hour). Risk of catastrophic forgetting with online fine-tuning. 738 COs is a small graph for HGT — might overfit. TGN memory stores a 128-dim vector per conversation — storage scales linearly with active users.

**Best for:** A generalizable system that learns from sparse data. The best balance of complexity and capability.

---

## System 3: Hypergraph Neural Network + Metacognitive Reconstruction

**Core mechanism:** Hypergraph NN (Kim et al., arXiv:2404.01039) where each teaching decision is a hyperedge. Train a model to reconstruct `my_thoughts` from the hyperedge, then invert it for move generation.

**Papers used:**
- Hypergraph NN survey (arXiv:2404.01039, from hypergraph query)
- Directed hypergraph NN (arXiv:2008.03626)
- Implicit hypergraph NN (arXiv:2508.14101)
- Noise-robust hypergraph (arXiv:2102.01934)
- Parameter-free hypergraph (arXiv:2510.21462)
- Hypergraph + contrastive (arXiv:2602.04360)

### Architecture

```
                    ┌─────────────────────────┐
                    │  Student utterance       │
                    └────────┬────────────────┘
                             │
                             ▼
              ┌─────────────────────────────────┐
              │  Hyperedge Construction          │
              │  H_t = {s_t, b_t, f_{t-1},      │
              │         m_{t-1}, r_{t-1},       │
              │         p_{t-1}, μ_{t-1}}       │
              │  Partial hyperedge (missing     │
              │  f_t, m_t, r_t, p_t, μ_t —      │
              │  these must be predicted)        │
              └────────┬────────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────────┐
              │  Hypergraph NN Forward           │  ⭐ Core
              │  Message passing over            │
              │  hyperedges:                     │
              │                                  │
              │  For each node v in H_t:         │
              │    h_v^{(k+1)} = σ(              │
              │      W · Σ_{e ∋ v}               │
              │      Message_e(h_v^{(k)})        │
              │    )                              │
              └────────┬────────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────────┐
              │  Metacognitive Decoder           │  ⭐ Novelty
              │  Reconstruct μ_t from H_t        │
              │  "Why did we choose this move?"  │
              │                                  │
              │  μ_pred = Decoder(H_encoded)     │
              │  Compare to actual μ_teacher     │
              │  (from UNO training data)        │
              └────────┬────────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────────┐
              │  Inverse Prediction:             │
              │  Given H_t without (f_t, m_t,    │
              │  r_t), predict what the teacher  │
              │  WOULD choose.                   │
              │                                  │
              │  f_pred, m_pred, r_pred, p_pred  │
              │  = Argmax Decoder(H_t)           │
              └────────┬────────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────────┐
              │  DeepSeek render                 │
              │  Respond                         │
              └────────┬────────────────────────┘
                       │
                       ▼
              ┌─────────────────────────────────┐
              │  Observe s_{t+1}                │
              │  Complete hyperedge:             │
              │  H_{t+1} = {s_{t+1}, ..., μ_t}  │
              │  Train: predict μ_t from H_t    │
              │  (self-supervised)               │
              └─────────────────────────────────┘
```

### Key Mechanisms

**M1 — Hypergraph Message Passing (Kim et al. survey):**
Standard GNNs pass messages along pairwise edges. Hypergraph NNs pass messages along hyperedges — each hyperedge connects 8+ nodes simultaneously. The message from hyperedge e to node v is:

```
Message_e(v) = f( { h_u : u ∈ e, u ≠ v } )
```

Where f is a permutation-invariant function (mean, max, or attention). This means the model learns how the 8 elements of a teaching decision co-occur as a coherent whole — not as separate pairwise relationships.

**M2 — Directed Hypergraph (arXiv:2008.03626):**
Teaching hyperedges are directed: the current elements (s_t, b_t) CAUSE the chosen (f_t, m_t, r_t), which in turn CAUSE the next state s_{t+1} and the metacognitive μ_t. Directed hypergraph NNs learn these causal relationships explicitly:

```
H_directed = (H_input → H_output)
H_input = {s_t, b_t, f_{t-1}, r_{t-1}}
H_output = {f_t, m_t, r_t, p_t, μ_t}
```

**M3 — Metacognitive Reconstruction (the novel task):**
Train to reconstruct μ_t (my_thoughts) from the rest of the hyperedge:

```
L_reconstruct = MSE(Decoder(H_t \ μ_t), μ_t_true)
```

Where H_t \ μ_t is the hyperedge without the my_thoughts field. This teaches the model to generate the teacher's internal reasoning from just the observable elements. Once trained, the decoder can be inverted to answer: "Given this student state and this context, what would the teacher think, and then what would they choose?"

**M4 — Implicit Hypergraph Layer (arXiv:2508.14101):**
Instead of stacking multiple message-passing layers (which can oversmooth), use an implicit layer that finds the fixed point of the hypergraph dynamics:

```
Z* = φ(W, Z*, H)
```

Where Z* is the fixed point of the hypergraph diffusion, found by solving a nonlinear system. This gives infinite effective depth without the over-smoothing problem, and is mathematically analogous to the Green Core attractor in the teaching tetrahedron — the system converges to a fixed point regardless of initialization.

### Training

**Pre-training (offline, ~2 hours on CPU):**

```
Dataset: 738 hyperedges (each = 1 UNO turn)
  Each hyperedge: {s, b, f, m, r, t, p, μ}
  Train mask: randomly hide 1-2 elements per hyperedge
  Task: reconstruct hidden elements

Loss:
  L = L_reconstruct(μ) + L_predict(f, m, r, p) + L_contrastive
  L_reconstruct: MSE on my_thoughts embedding (384-dim)
  L_predict: cross-entropy on f, m, r
  L_contrastive: hyperedges with similar s_t should have similar μ_t

Model:
  Hypergraph encoder: 2-layer HNN, hidden=256
  Metacognitive decoder: MLP(256→384), 2 layers
  Move decoder: MLP(256→22+15+6), 2 layers
  Total params: ~180K

  Optimizer: AdamW, lr=1e-4, batch=16
  Epochs: 500 (no overfitting on 738 hyperedges due to reconstruction task)
  Validation: holdout 10% of hyperedges, check reconstruction accuracy
```

**Online learning (per conversation):**

```
After each turn:
  └── Complete the hyperedge H_t with observed outcome
  └── One gradient step on HNN (lr=1e-5)
  └── Update μ_t prediction: store Decoder(H_t) as "predicted my_thoughts"
```

### Inference Cost

- Hyperedge construction: O(8) concatenation
- HNN forward + implicit fixed point: ~500K FLOPs (iterative solver, ~20 steps)
- Decoder: MLP(256→6) = ~1.5K FLOPs
- Total: < 20ms (CPU for all but implicit solver) + LLM call

### Tests

| Test | Method | Pass condition |
|------|--------|---------------|
| Metacognitive reconstruction | Holdout 10% of UNO my_thoughts, compare Decoder output | Cosine sim > 0.7 between predicted and actual my_thoughts embedding |
| Move prediction accuracy | Cross-entropy on holdout functions | Top-3 accuracy > 70% |
| Implicit layer convergence | Check fixed point residual ||Z* - φ(Z*)|| < 1e-5 |
| Directed hyperedge causality | Inject wrong (f, m) → check if Decoder reconstructs different μ | μ changes significantly (cosine sim < 0.5) when f is wrong |
| Online drift | 500 online steps, compare to offline-only model | L2 weight change < 5% |

### Build Plan

```
Week 1:
  └── Build hyperedge data structure from 738 COs
  └── Implement hypergraph message passing (PyG or custom)
  └── Train reconstruction task
Week 2:
  └── Implement metacognitive decoder + train
  └── Implement inverse prediction (f, m, r from hyperedge)
  └── Add implicit layer (fixed-point iteration)
Week 3:
  └── Wire inference pipeline (utterance → hyperedge → move → render)
  └── Add online learning loop
  └── Test metacognitive reconstruction quality
Week 4:
  └── Deploy
  └── Compare predicted my_thoughts vs actual teacher annotations
  └── Iterate on hypergraph architecture
```

### Reflection

**Pros:** Most novel architecture — few systems model teacher metacognition explicitly. Hypergraph structure is the natural representation for teaching decisions (8 elements binding as a coherent whole). The implicit layer gives infinite depth without oversmoothing. The reconstruction task creates a self-supervised signal from unlabeled conversations (once trained, the system can generate its own my_thoughts).

**Cons:** Most complex to implement. Implicit layer requires iterative solver at inference. Hypergraph NNs are less mature than standard GNNs (fewer PyG implementations, less documentation). 738 hyperedges is small for HNN pre-training.

**Best for:** Research contribution — the metacognitive reconstruction task is genuinely novel. Use this architecture if the goal is to publish, not just to build.

---

## System 4: Hybrid Ensemble — All Mechanisms Integrated

**Core mechanism:** Thompson sampling for fast path (System 1) + HGT for pattern mining (System 2) + Hypergraph NN for metacognition (System 3) + Diffusion for dreaming (arXiv:2302.02591). Each layer handles what it's best at.

**Papers used:** All 100 papers integrated by mechanism type.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  TETRAHERMES HYBRID — The Complete System                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L0: RAPID RESPONSE PATH                                     │   │
│  │  Thompson Sampling over COs (System 1)                        │   │
│  │  Purpose: Respond within 1 second for common cases            │   │
│  │  Trigger: Always, as first pass                               │   │
│  │  Fallback: If no CO with conf > 0.6 → L1                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L1: GRAPH REASONING PATH                                    │   │
│  │  HGT + TGN (System 2)                                        │   │
│  │  Purpose: Handle novel states, unseen state combinations     │   │
│  │  Trigger: L0 has low confidence, OR state embedding is        │   │
│  │    far from all 50 prototypes                                 │   │
│  │  Output: (f, m, r) with confidence score                     │   │
│  │  Fallback: If HGT confidence < 0.3 → L2                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L2: METACOGNITIVE PATH                                      │   │
│  │  Hypergraph NN + Implicit Layer (System 3)                    │   │
│  │  Purpose: Handle completely novel situations, generate        │   │
│  │    teaching moves from first principles                       │   │
│  │  Trigger: L1 confidence < 0.3, OR user asks "why?"           │   │
│  │  Output: (f, m, r) + my_thoughts explanation                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L3: DREAMING / GROWTH (Offline, Weekly Cron)               │   │
│  │  Diffusion on CO graph (arXiv:2302.02591)                    │   │
│  │  Purpose: Generate new teaching pathways,                    │   │
│  │    propose new COs for cold state pairs                     │   │
│  │  Trigger: Sunday 2am                                         │   │
│  │  Output: candidate COs, dream log                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  L4: VALIDATION (Continuous, per turn)                      │   │
│  │  Sanskritree Proof System                                    │   │
│  │  Checks: CO prediction success, Error Book constraints,      │   │
│  │    loop detection, safety thresholds                         │   │
│  │  On failure: escalate L0→L1→L2, log constraint              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Mechanisms (All Prior + New)

**M1 — Layered Fallback (all three prior systems):**
The system starts at L0 (fastest, most concrete). If L0 lacks confidence, it falls back to L1 (slower, more general). If L1 also lacks confidence, it falls back to L2 (slowest, most abstract). Each layer has a confidence check before deciding.

```
if max(θ_i) > 0.6: use L0 result (Thompson)
elif HGT_confidence > 0.3: use L1 result (HGT)
else: use L2 result (HNN metacognitive)
```

**M2 — Diffusion for Dreaming (arXiv:2302.02591):**
The dreaming cycle uses a graph diffusion model to generate novel COs. Forward process: add noise to existing CO sequences. Reverse process: denoise to produce plausible new teaching arcs.

```
Training:
  Take all 580 UNO transitions as sequences:
  {(s₁, f₁, m₁, r₁) → (s₂, f₂, m₂, r₂) → ...}
  Add Gaussian noise to function/mechanism/register labels
  Train to denoise

Generation:
  Sample a start state s₀
  Diffuse through the reverse process k steps
  Output: (s₀, f₁, m₁, r₁) → (s₁, f₂, m₂, r₂) → ... → (sₙ)
  This is a novel teaching arc
```

**M3 — Causal Counterfactual Reasoning (arXiv:2602.04360):**
When a CO fails (student disengages, state worsens), the system asks: "What would have happened if we used a different function instead?"

```
Observed: (s_t, f_t, m_t, r_t) → s_{t+1} (worsened)
Counterfactual: (s_t, f', m_t, r_t) → s'_{t+1}
If s'_{t+1} is predicted to be better than s_{t+1}, then:
  Log constraint: "Do NOT use f_t when in state s_t. Use f' instead."
```

This requires a causal model of transitions. The HGT's transition predictor provides this — given (s_t, f', m_t, r_t), predict s'_{t+1}. If the counterfactual s' is closer to the Green Core than the actual s, the constraint is added to the Error Book.

**M4 — Grover-Style Amplitude Amplification over COs (from LH-LLM V3):**
Before selecting a CO, the system maintains a superposition of candidate COs with amplitudes based on state similarity, register match, lineage compatibility, and confidence. Amplitude amplification (phase inversion of low-confidence COs, then diffusion/reflection around the mean) concentrates probability on the optimal CO over k = √N iterations.

This merges Thompson sampling (Bayesian confidence) with Grover-style search (amplitude amplification) and harmonic filtering (register match):

```
a_i = w_i × sim(s_t, s_i) × register_match(r_t, r_i) × lineage_compat(ℓ, ℓ_i)
k = int(sqrt(N_candidates))
for _ in range(k):
    a[a < threshold] *= -1         # phase inversion
    a = 2 * mean(a) - a             # diffusion
    a = softmax(a / temperature)    # normalize
selected = argmax(a)
```

### Training

**Layer 0 — Thompson:** No training. Pure Bayesian update from feedback.

**Layer 1 — HGT + TGN:** Pre-train offline on 580 transitions. Online fine-tuning per conversation.

**Layer 2 — Hypergraph NN:** Pre-train offline on 738 hyperedges. Metacognitive reconstruction task.

**Layer 3 — Diffusion:** Pre-train offline on 580 transition sequences.

**Layer 4 — Sanskritree:** No training. Constraint accumulation from outcomes.

All layers train independently. No joint training needed. The layers interact only through the fallback logic and the dreaming cycle (Layer 3 proposes COs that L0/L1/L2 can use).

### Inference Cost

- L0 (Thompson): < 1ms
- L1 (HGT): ~5ms (if needed)
- L2 (HNN): ~20ms (if needed)
- L3 (Diffusion): offline only, not at inference
- L4 (Validation): < 1ms (constraint check)
- Typical: L0 handles ~80% of cases → < 1ms + LLM call
- Worst case (all layers): ~26ms + LLM call

### Tests

| Test | Method | Pass condition |
|------|--------|---------------|
| L0 coverage (fast path) | Count % of cases resolved by L0 | > 80% |
| L1 improvement over L0 | Compare accuracy on held-out states | L1 > L0 by > 10% for unseen states |
| L2 metacognitive quality | Human evaluation of my_thoughts | > 60% rated "coherent" |
| Dream CO quality | Expert review of 20 generated COs | > 60% accepted with minor edits |
| Counterfactual safety | Check that counterfactual constraints prevent repeated failures | < 5% repeat failure rate for same (state, function) pair |
| End-to-end latency | Production monitoring | < 1s total (with LLM) for 95th percentile |
| Error Book growth | Weekly check | < 10% of constraints are false positives |

### Build Plan

```
Month 1:
  └── Build L0 (Thompson) — 4 days
  └── Build L4 (Sanskritree) — 3 days
  └── Deploy L0+L4 for MVP — ongoing data collection
  
Month 2:
  └── Build L1 (HGT + TGN) — 4 weeks
  └── Train on accumulated conversations + UNO seed
  └── Replace L0 fallback with L1 for novel states
  
Month 3:
  └── Build L2 (Hypergraph NN) — 4 weeks
  └── Train metacognitive reconstruction
  └── Add L2 fallback for rare states
  
Month 4:
  └── Build L3 (Diffusion for dreaming) — 2 weeks
  └── Implement dream cycle (weekly cron)
  └── Full system integration
  └── Stress testing
```

### Reflection

**Pros:** Best of all approaches. Fast path for common cases. Graph reasoning for novel ones. Metacognitive model for rare ones. Diffusion dreaming for growth. Each layer handles what it's best at. No single point of failure — layers degrade gracefully.

**Cons:** Most complex to build and maintain. Multiple models to keep in sync. The fallback logic needs careful tuning to avoid "layer thrashing" (bouncing between layers). Requires the most compute resources for training (though inference is still cheap).

**Best for:** The final, production-worthy system. Build L0+L4 first (4 days), add L1 (1 month), add L2 (1 month), add L3 (2 weeks). After 4 months, the system is self-improving: conversations → better COs → better HGT → better metacognition → better dreams → more COs.

---

## System Selection Guide

| Criterion | System 1 | System 2 | System 3 | System 4 |
|-----------|----------|----------|----------|----------|
| Time to MVP | 4 days | 4 weeks | 4 weeks | 4 months |
| Novelty | Low | Medium | High | Very High |
| Generality | Low (50 states only) | Medium (HGT generalizes) | Medium (hyperedge reconstruction) | High (layered) |
| Auditable | Very High (CO + Beta) | Medium (attention weights) | Low (implicit layer) | Medium-High (L0+L4 auditable, L2 not) |
| Training cost | $0 (no training) | ~$2 (CPU, 1hr) | ~$5 (CPU, 2hr) | ~$15 (spread across models) |
| Inference cost | < 1ms + LLM | < 5ms + LLM | < 20ms + LLM | < 26ms + LLM (worst case) |
| Self-improving | Yes (Bayesian) | Yes (online FT) | Yes (self-supervised) | Yes (all + dreaming) |
| Publishing potential | None | Low | Medium | High |

**Recommendation:** Start with System 1. It runs in 4 days, gives immediate feedback, and collects the conversation data needed to train Systems 2-4. Add System 4's validation layer (sanskritree) in week 2. After accumulating 500+ real conversations, train System 2. After 2000+, train System 3. System 4 is the final form — it emerges naturally by integrating the earlier systems as they mature.
