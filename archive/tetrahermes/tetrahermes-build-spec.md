# TetraHermes — Final Build Specification

## Overview

A layered teaching engine. Fast path (Thompson sampling over COs) handles 80%+ of cases. Graph path (HGT + TGN) handles novel states. Metacognitive path (Hypergraph NN) handles rare edge cases with self-generated reasoning. Sanskritree validation catches all failures. Dreaming cycle grows the system weekly.

Total: ~352K parameters, < 25ms inference (worst case), < 5MB storage, zero GPU required.

---

## Layer 0: Thompson Sampling over COs (Fast Path)

### Mechanism

Each Commentary Object (CO) maintains a Beta posterior over its success probability:

```
α_i = success_count_i + 1     (prior: uniform Beta(1,1))
β_i = failure_count_i + 1
θ_i ~ Beta(α_i, β_i)          (sample — not mean — for exploration)
selected = argmax θ_i
```

After observing outcome:
```
if student state moved toward Green Core:  α_i += 1
if student state moved away or plateaued:  β_i += 1
```

### Inference Pipeline

```
1. Student utterance → sentence-transformers (384-dim, frozen)
2. Cosine distance to 50 Mātṛkā prototypes → s_t ∈ 𝒮₅₀ + confidence
3. If confidence < 0.6: mark as uncertain, use distribution over top-3 states
4. Query COs for (s_t, ℓ_estimated) — ℓ estimated from register vector
5. If no COs match: query by state-only, then fallback to lineage-agnostic
6. For each matching CO: sample θ_i ~ Beta(α_i, β_i)
7. Check Error Book: block COs with active constraints for (s_t, ℓ)
8. Select argmax θ_i → CO gives (f, m, r, p)
9. If uncertain state: blend register from top-3 state matches
10. Render via DeepSeek: (f, m, r, RO_content) → natural language
```

### Homeostatic Weight Normalization

Weekly normalization to prevent monoculture:

```
for each (state, lineage) group:
    μ = mean(α_i / (α_i + β_i)) across all COs in group
    if any CO's success rate > μ + 2σ: α_i ← α_i * 0.9 (gentle regression)
    if any CO's success rate < μ - 2σ: β_i ← β_i * 0.9 (give it another chance)
```

This prevents a single CO from dominating a (state, lineage) pair while still allowing low-performing COs to recover.

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Beta convergence | Simulate 1000 conversations with known P(success)=0.7 | Posterior concentrates at 0.7 ± 0.05 after 500 trials |
| Exploration coverage | Count unique COs selected in first 100 real conversations | > 30% of eligible COs tried |
| Homeostatic balance | Inject a CO with high α (100/100 success), run normalization | CO's success rate drops toward group mean |
| Thompson vs greedy | Simulate non-stationary success rates (abrupt changes) | Thompson has < 50% regret vs greedy over 1000 steps |
| Cold start | CO with (α=1, β=1) — no data yet | Sampled at least once in first 50 conversations |

---

## Sanskritree Validation Layer

### Error Book

A constraint log of teaching failures:

```json
{
  "constraint_id": "c_001",
  "co_id": "co:uno_gurdjieff_shock_001",
  "state": "hopeless_shutdown",
  "function": "UM_03",
  "lineage": "Therapeutic",
  "observed_outcome": "student_disengaged",
  "failure_count": 3,
  "constraint": "Do NOT use UM_03 when student state is hopeless_shutdown in Therapeutic lineage. Use ME_02 instead.",
  "preferred_co_id": "co:uno_therapeutic_aporia_validation_001",
  "timestamp_first": "2026-07-15",
  "timestamp_last": "2026-07-20",
  "resolved": false
}
```

### Constraint Lifecycle

```
1. CO selected, move executed, outcome observed
2. If outcome = failure (state worsened or student disengaged):
   a. Check if constraint already exists for (CO, state, function)
   b. If yes: increment failure_count
   c. If no: create new constraint with failure_count = 1
3. If constraint.failure_count >= 3:
   a. Activate constraint — block this CO for (state, function)
   b. Log to Error Book as active
   c. Query nearest successful CO for alternative move
4. If a blocked CO is later successful (user overrode the block):
   a. failure_count -= 1
   b. If failure_count reaches 0: deactivate constraint
```

### Loop Detection

Track consecutive state identicality:

```
if s_t == s_{t-1} == s_{t-2}:  (3 turns same state)
    escalate = true
    if phase(f_t) == f_{t-1} == f_{t-2}:  (same phase 3x)
        override_function = "ME_02"  (aporia validation — normalize confusion)
    else:
        override_register = {PR_01, IN_04, AT_03}  (gentle, compassionate, high attunement)
```

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Constraint creation | Force a CO to fail 3 times | Constraint created and activated |
| Constraint blocking | Attempt to select blocked CO | Blocked at inference (before Thompson sampling) |
| Constraint forgiveness | User overrides block with success | failure_count decremented |
| Loop detection | Feed 3 identical states in a row | ME_02 triggered on 3rd turn |
| False positive rate | Run on UNO data (known-good transitions) | < 5% of successful moves falsely flagged |

---

## TGN Memory (Per-Conversation Student Model)

### Mechanism

Each conversation maintains a memory vector updated by a GRU:

```
memory_0 = zeros(128)
memory_t = GRU(memory_{t-1}, concat(s_t, f_{t-1}, r_{t-1}, outcome_t))
```

The memory is:
- Created at conversation start
- Updated after each turn
- Persisted to SQLite at conversation end
- Loaded when student returns (even after days)

### Memory Contents

The 128-dim memory encodes:
- Current state trajectory (past 5 states)
- Recent function success rates
- Register sensitivity profile (which registers this student responds to)
- Trap frequency (which errors this student tends toward)
- Estimated lineage affinity

### State Inference Enhancement

The raw student utterance is classified by the prototype matcher, then adjusted by the TGN memory:

```
s_raw = argmax cosine(utterance_emb, prototypes)
s_adjusted = f(memory_t, s_raw, previous_trajectory)
```

Where f is a learned correction: students on a known trajectory (e.g., guarded_irritation → justification → passive_withdrawal) should continue on that trajectory, not be re-classified from scratch each turn.

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Memory trajectory | Feed UNO episode, check memory after each turn | Memory state cosine-similar to expected trajectory > 0.85 |
| Cross-session persistence | Save memory after conversation, load next session | Memory loaded correctly, last state matches |
| State adjustment | Feed ambiguous utterance (could be 2 states) | Memory disambiguates correctly based on trajectory |
| Drift prevention | Run 1000 turns, check memory for NaN/explosion | Memory norm stays in [0.5, 2.0] |

---

## HGT Pattern Mining (Weekly Offline)

### Mechanism

A Heterogeneous Graph Transformer (Hu et al., 2020) trained on the full CO + transition graph. NOT used at inference — used weekly for pattern discovery.

### Graph Structure

| Node Type | Nodes | Features |
|-----------|-------|----------|
| State | 50 | 128-dim (from sentence-transformer) |
| Function | 22 | 64-dim learned |
| Mechanism | 20 | 32-dim learned |
| Register | 6×4×3×6×4×2 | 16-dim per config bin |
| Lineage | 6 | 16-dim learned |
| CO | N_observed | α, β, tattva_region |

| Edge Type | From → To | Meaning |
|-----------|-----------|---------|
| responds_with | State → Function | This state uses this function |
| uses | Function → Mechanism | This function uses this mechanism |
| has_register | Function → Register | This function at this register |
| transitions_to | State → State | This state tends to lead to this one |
| lineage_uses | Lineage → Function | This lineage favors this function |

### Training

```
Data: All observed COs + transitions
Loss: Link prediction (mask edges, predict them) + contrastive
Epochs: 200
Batch: 32
Optimizer: AdamW, lr=1e-4
```

### Weekly Output

```
1. Cross-lineage mappings:
   "Socratic UM_01 (definition_collapse) is geometrically similar to Advaita UM_06 (constraint_removal)"
   
2. Function similarity clusters:
   "UM_01, UM_02, UM_03 cluster together in function embedding space"
   "RM_03, RM_04, RM_05 form a separate cluster"
   
3. Cold state pairing:
   "State 'nihilistic_collapse' has only 2 COs. Nearest well-covered state is 'hopeless_shutdown' (12 COs)."
```

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Link prediction | Mask 20% of transitions during training | AUC > 0.8 on held-out edges |
| Embedding cluster quality | Compare intra-lineage vs inter-lineage function distances | Intra-lineage < inter-lineage by > 0.2 cosine |
| Cross-lineage validity | Ask domain expert to review 10 top cross-lineage mappings | > 60% rated "plausible" |

---

## Dreaming Cycle (Weekly Cron)

### Mechanism

Graph diffusion over CO sequences to generate novel teaching arcs.

### Training (offline, ~1 hour)

```
Data: 580 observed transition sequences
  {(s₁, f₁, m₁, r₁) → (s₂, f₂, m₂, r₂) → ... → (sₙ)}
  
Forward: add Gaussian noise to function/mechanism/register labels over T=100 steps
Reverse: train UNet-style denoiser to predict clean labels from noisy
Model: 1D diffusion over sequences of length 2-8 turns
Params: ~50K (tiny — just for this task)
```

### Generation

```
Given: start state s₀ or cold (state, lineage) pair
1. Sample random noise over (function, mechanism, register) sequence
2. Reverse-diffuse for T=100 steps
3. Output: candidate CO sequence
4. Validate: does this sequence end closer to the Green Core?
5. If yes: present to user as candidate CO
6. If no: discard
```

### Dream Log Format

```markdown
# Dream Log — 2026-07-22

## Pattern: Intermediary Being States
- ro:ficino-daimon and ro:corbin-imaginal both describe guidance states
- Neither has CO for student seeking_guidance (0 COs)
- Nearest known: seeking_clarity → RM_01 (structural_analogy)
- Proposed: co:dream_guidance_001 — RM_05 (frame_upgrade) at PD_04 (nondual depth)

## Gap: Nihilistic Collapse
- 2 COs, both fail > 50%
- No lineage handles this well
- Proposed: co:dream_nihilistic_001 — ME_02 (aporia_validation) at PR_01, IN_04
```

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Sequence validity | Generate 100 sequences, check they obey PEDAGOGY grammar | > 95% valid phase→function→register combinations |
| Green Core convergence | Generate sequences of length 3-8, check final state | Final state closer to Green Core than start (by tattva distance) |
| Novelty | Compare generated sequences to existing COs | > 70% not in existing CO corpus |
| Human approval | Expert review of 20 candidate COs | > 50% accepted with minor edits |

---

## Hypergraph NN (Metacognitive Layer — Optional)

### When to Build

Only if the user explicitly asks "why did you choose that move?" or if Thompson + HGT plateaus below 70% accuracy.

### Mechanism

Each teaching decision is an 8-element hyperedge:

```
H_t = {s_t, b_t, f_t, m_t, r_t, t_t, p_t, μ_t}
```

Trained to reconstruct μ_t (my_thoughts) from the other 7 elements:

```
L = ||Decoder(Encoder(H_t \ μ_t)) - μ_t||²
```

Once trained, invert: given (s_t, b_t, r_t) without (f_t, m_t, p_t, μ_t), predict what the teacher would think and do.

### Architecture

```
Input: 7 of 8 hyperedge elements (missing one)
→ Linear projection (d_input → 256)
→ 2-layer hypergraph message passing (implicit fixed-point solver, ~20 steps)
→ Decoder MLP (256 → d_missing)
→ Output: predicted missing element
```

### Tests

| Test | Method | Pass Condition |
|------|--------|---------------|
| Metacognitive reconstruction | Holdout 10% of UNO my_thoughts | Cosine sim > 0.7 between predicted and actual |
| Move prediction | Mask function, compare predicted to actual | Top-3 accuracy > 70% |
| Implicit convergence | Check fixed-point residual ||Z* - φ(Z*)|| | < 1e-5 |

---

## File Structure

```
geometricengine/
  src/
    train.py                       ← existing (fixed parser → 738 blocks)
    pathway.py                     ← modified (add Thompson fallback chain)
    classifier.py                  ← new (50 Mātṛkā prototypes)
    register_predictor.py          ← new (6-dim register from state+function+lineage)
    tgn_memory.py                  ← new (per-conversation GRU memory)
    hgt_miner.py                   ← new (weekly offline HGT pattern mining)
    diffusion_dream.py             ← new (weekly CO generation via diffusion)
    hypergraph_nn.py               ← new (optional metacognitive layer)
    sanskritree.py                 ← new (Error Book + constraint checking)
    export_commentaries.py         ← new (UNO → CO export)
  
content/
  commentaries/
    uno/                           ← 738 COs exported from UNO
    dream/                         ← weekly generated candidate COs
    flagged/                       ← COs needing review (high failure rate)
  error-book.json                  ← Sanskritree constraint log

scripts/
  dream.py                         ← weekly cron: dream cycle
  hgt_mine.py                      ← weekly cron: HGT pattern mining
  prune_cos.py                     ← weekly cron: MDL pruning of low-value COs
```

---

## Build Order

### Week 1: Foundation

| Day | Task | Files | Test |
|-----|------|-------|------|
| 1 | Fix UNO parser (concatenated JSON arrays) | uno_parser.py | parse_uno() returns 738, not 201 |
| 2 | Export COs | export_commentaries.py | 738 JSON files in content/commentaries/uno/ |
| 3 | Implement Thompson selector + fallback | pathway.py | Quick test: CO selected for known state |
| 4 | Implement Sanskritree validation | sanskritree.py | Error Book constraint blocks invalid CO |
| 5 | Wire chat interface | server.py + app.py | End-to-end test: student utterance → response → feedback |

**Milestone:** Working system by end of week 1. Handles ~80% of cases. Improves with every conversation.

### Week 2: Memory + Growth

| Day | Task | Files | Test |
|-----|------|-------|------|
| 1 | Implement TGN memory | tgn_memory.py | Memory persists across sessions |
| 2 | Integrate TGN into state classifier | classifier.py | Ambiguous utterances disambiguated by memory |
| 3 | Build dreaming cycle | diffusion_dream.py + dream.py | 10 candidate COs generated |
| 4 | Build HGT miner | hgt_miner.py | Cross-lineage mappings reported |
| 5 | Integrate weekly cron jobs | scripts/ | All weekly tasks run on schedule |

**Milestone:** System remembers students. Grows new COs weekly.

### Week 3: Polish + Scale

| Day | Task | Files | Test |
|-----|------|-------|------|
| 1 | Register predictor | register_predictor.py | Register prediction within 1 step of correct |
| 2 | Homeostatic normalization | pathway.py | CO weights balanced |
| 3 | Loop detection + escalation | sanskritree.py | 3-turn loop triggers ME_02 |
| 4 | Performance profiling | — | < 25ms inference, < 5MB storage |
| 5 | Load testing (100 concurrent) | — | < 1s response time at 95th percentile |

**Milestone:** Production-ready.

### Week 4+: Data-Driven Refinement

| Task | Trigger |
|------|---------|
| Build HGT layer | After 500 real conversations (training data sufficient) |
| Build hypergraph NN | When users ask "why?" more than 10% of the time |
| MDL pruning | Weekly — removes COs with failure rate > 80% or N_observations < 5 |
| Prototype refresh | Monthly — re-run k-means on all observed utterances to refine 50 prototypes |
| Lineage adaptation | Continuous — update ℓ estimates per user based on successful interactions |

---

## Total Parameter Count

| Component | Params | When Loaded |
|-----------|--------|-------------|
| Sentence-transformer | 0 (frozen, not counted) | Always |
| 50 prototypes (384-dim) | 19,200 | Always |
| TGN memory (GRU) | ~50K | Always |
| Register predictor (MLP) | ~5K | Always |
| **Active total** | **~75K** | **Every inference** |
| HGT (weekly mining) | ~200K | Weekly only |
| Hypergraph NN (optional) | ~180K | On demand |
| Diffusion (dreaming) | ~50K | Weekly only |
| **Full total** | **~505K** | **Peak** |

## Total Storage by Month

| Data | Month 1 | Month 3 | Month 6 |
|------|---------|---------|---------|
| COs (seed) | 738 | 738 + ~100 generated | 738 + ~400 generated |
| Error Book entries | ~20 | ~200 | ~500 |
| TGN memories | ~100 | ~1,000 | ~5,000 |
| Policy weights | ~500K | ~500K | ~500K |
| **Total** | **~2MB** | **~10MB** | **~25MB** |

---

## Appendix: Key Equations

### Thompson Sampling
θ_i ~ Beta(α_i + 1, β_i + 1)
k* = argmax_i θ_i

### Hebbian Update
α_i ← α_i + γ · c_i — γ · decay · α_i
β_i ← β_i + γ · (1 - c_i) — γ · decay · β_i
where c_i = 1 if next state is closer to Green Core, else 0

### Homeostatic Normalization
w_i = α_i / (α_i + β_i)
w_i ← w_i · (μ_group / mean(w_group))  ∀ i in group

### TGN Memory Update
m_t = GRU(m_{t-1}, [s_t; f_{t-1}; r_{t-1}; outcome_{t-1}])

### HGT Attention
α_ij = softmax( (W_q h_i · W_k h_j) / √d + Φ(r, τ) )
where Φ(r, τ) is the relative position + edge type encoding

### Green Core Distance
d(s, g*) = ||pos(s) - (0,0,0)||₂  where pos(s) is the tattva coordinate of state s

### Register Collapse Interval
Δt(PR) = 2.0 · (1 - PR/4) + 0.1  seconds  (PR ∈ {1,2,3,4})

### Grover Amplification Iterations
k = ⌈π/4 · √(N_candidates / N_good)⌉

### Error Book Block Threshold
block(co, s, f) if failure_count(co, s, f) / total_count(co, s, f) > 0.8
