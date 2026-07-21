# TetraIdeas — Extracted Mechanisms from Experimental AI Systems

## Source Analysis

### LH-LLM V3 Prompt (Bio-synthetic, Evo-2 based)

**Premise:** A "Liquid Harmonic LLM" that treats digital cells as neurons with synaptic plasticity, homeostatic energy regulation, evolutionary connectomes via Evo-2 diffusion, swarm ecology interactions, and Orch-OR quantum coherence modules.

**Signal vs. Noise:**

The prompt is ~80% speculative/vibey and ~20% mechanically interesting. The core ideas worth extracting are:

**1. Synaptic Plasticity via Hebbian + Homeostatic Scaling**

```python
# From the V3 spec — this is the clean part
delta_w = learning_rate * (firing_correlation - decay * current_weights)
weights = weights * (target_norm / current_norm)  # homeostatic scaling
```

*Why useful:* This is a biologically-plausible online learning rule. Our system needs to update CO weights after each conversation. The Hebbian term strengthens moves that work; the homeostatic term prevents runaway confidence.

*How to use in TetraHermes:* After each teaching turn, compute:
- `correlation = dot(state_embedding, next_state_embedding)` — if the student moved in the right direction, strengthen the CO weights
- `decay = 0.01` — slowly forget to adapt to changing students
- `homeostatic_scale = target_norm / current_norm` — prevent a single CO from dominating

**2. Diffusion Evolution for Policies**

The V3 spec uses diffusion denoising (forward: add noise, reverse: denoise) to evolve connectome adjacency matrices over 1000 steps.

*Why useful:* We don't have a "connectome" but we DO have a policy graph (state→function→next_state transitions). Diffusion could be used to **generate novel teaching pathways** — not just recombine existing COs, but generate new (state, function, mechanism, register) tuples that have never been observed.

*How to use:* Train a small diffusion model (not a full image diffuser — a tiny 1D diffusion on 50-dimensional state space) to generate plausible transition sequences:

```
1. Take a sequence of COs: (s₁, f₁, m₁, r₁) → (s₂, f₂, m₂, r₂) → ... → (sₙ, fₙ, mₙ, rₙ)
2. Add noise to the sequence
3. Train to denoise
4. At generation time: sample a start state, diffuse to generate a full teaching arc
```

**3. Two-Membrane Minimal Architecture (from P Systems / CMC 2011)**

V2 adapted from membrane computing: a single PCR system with 2 membranes + 1 catalyst achieves Turing completeness (computes RE sets).

*Why useful:* Our system doesn't need 22 functions, 20 mechanisms, 50 states, etc. to be complete. A minimal subset can express all teaching possibilities. The question is: what's the minimal function set? 4 phases + 6 registers + 12 core functions (3 per phase) covers 95% of UNO's teaching moves.

*How to use in TetraHermes:* Define a "minimum viable teaching grammar" — 12 functions (3 per phase), 6 mechanism shapes, 4 register settings per dimension. Everything else is an optimization, not a necessity.

### LH-LLM V2 Full Implementation (Membrane Computing + DNA Topology)

**Premise:** A complete PyTorch implementation of digital cells with nucleosome data wrapping, liquid ODEs, self-organized criticality, graph evolution with digital topoisomerase, and harmonic processing units.

**Signal vs. Noise:**

V2 has genuine engineering: actual working PyTorch code. ~40% useful, ~60% over-engineered for our use case.

**4. Self-Organized Criticality with Rule Priorities**

```python
# From V2 Criticosome — prioritized toppling
active = energy > threshold
active_indices = where(active)
# Sort by priority, topple highest priority sites first
priorities = priority_weights[active_indices]
sorted_indices = active_indices[argsort(priorities, descending=True)]
```

*Why useful:* In a teaching system, some moves HAVE priority over others. Safety moves (META) should be attempted before confrontational moves (UNMAKING). This priority queue prevents the system from escalating when the student needs de-escalation.

*How to use in TetraHermes:* Add a priority weight to each CO. Priority = safety_level × confidence. META COs get high safety. UNMAKING COs get lower safety. When multiple COs match (state, lineage), select the highest-priority CO with acceptable confidence.

**5. Liquid ODE for Continuous State Evolution**

```python
# From V2 LiquidODE — continuous-time dynamics
dh = -h/tau + activation(W_input + R_recurrent + bias) + damping_term
h_new = h + dh * dt
```

*Why useful:* Student state is not discrete — it evolves continuously during a conversation. A LiquidODE can model the student's state trajectory between teacher moves, not just at teacher turns.

*How to use in TetraHermes:* Instead of classifying student state only at teacher turns, run a LiquidODE between turns to model how the student's state evolves during their response. This gives a finer-grained picture of whether the move actually shifted the student, or just triggered a surface response.

**6. Nucleosome Data Wrapping for Topological Constraints**

```python
# From V2 NucleosomeDataStructure — compact representation
wrapped = linear(data)
wrapped += SLk * wrapped.mean()  # surface linking number constraint
```

*Why useful:* Research Objects are currently separate files. A "nucleosome" wrapping would bundle related ROs (by lineage, by concept, by tattva region) into compact, indexed units that the teaching system can retrieve efficiently.

*How to use in TetraHermes:* Group ROs into "nucleosomes" — compact bundles of 3-5 related ROs wrapped together. The surface linking number SLk becomes the "semantic linking" between ROs in the bundle. A high SLk means the ROs are tightly coupled (teaching one requires the other).

**7. Digital Topoisomerase for Graph Simplification**

```python
# From V2 DigitalTopoisomerase — knot resolution
crossings = calculate_crossings(graph)
if crossings > max_crossings:
    adjust_edges(graph, lk_change)
```

*Why useful:* The CO graph grows over time. Without pruning, it develops "knots" — circular dependencies where COs reference each other without resolution. The topoisomerase resolves these by removing redundant edges.

*How to use in TetraHermes:* Weekly cron job that:
1. Detects "knots" in the CO graph (COs that form cycles — A→B→C→A)
2. Evaluates whether the cycle is productive (escalation arc) or redundant (confusion)
3. Removes redundant edges with lowest success_rate

**8. Harmonic Processing Unit — Complex-Valued Resonators**

```python
# From V2 HPU — complex-valued computation
superposed = matmul(harmonic_out, superposition)  # complex matrix
entangled = matmul(superposed, entanglement)        # complex matrix
collapse_probability = softmax(entangled.abs())     # collapse at 40Hz
```

*Why useful:* Not the quantum woo — the engineering pattern. Complex-valued embeddings with periodic collapse at a fixed frequency (40Hz) is a nice way to implement discrete decision points in a continuous system. The teacher's state is continuous (LiquidODE), but at predictable intervals (every ~25ms), it "collapses" into a concrete decision.

*How to use in TetraHermes:* Replace the per-turn classification with a continuous state evolution:
1. After each student utterance, the system enters a "listening state" represented as a complex vector
2. The vector evolves continuously (via LiquidODE-like dynamics)
3. At a "collapse interval" (~200ms), the system produces a concrete teaching decision
4. The interval can be varied based on urgency (PR_04 → fast collapse, PR_01 → slow collapse)

---

## Extracted Mechanisms — Usable in TetraHermes

| # | Mechanism | Source | What it does for us | Effort |
|---|-----------|--------|-------------------|--------|
| 1 | Hebbian + homeostatic weight update | LH-LLM V3 | Online CO confidence learning | Low |
| 2 | Diffusion evolution for policies | LH-LLM V3 | Generate novel teaching pathways | Medium |
| 3 | Minimal function set (2-membrane completeness) | CMC 2011 paper | Simplify to 12 essential functions | Low |
| 4 | Priority-based move selection | LH-LLM V2 Criticosome | Safety before confrontation | Low |
| 5 | Liquid ODE for continuous state evolution | LH-LLM V2 LiquidODE | Track student state between turns | Medium |
| 6 | RO nucleosome bundling | LH-LLM V2 Nucleosome | Group ROs by semantic linking | Low |
| 7 | Topoisomerase graph pruning | LH-LLM V2 DigitalTopoisomerase | Resolve circular CO dependencies | Low |
| 8 | Complex-valued collapse mechanism | LH-LLM V2 HPU | Continuous→discrete decision boundary | Medium |

---

## Papers to Review (ArXiv)

From the metaunoguide.md references plus LH-LLM sources:

1. **Hypergraph Neural Networks Survey** — Kim et al. (2024) arxiv:2404.01039
   - Our teaching decisions ARE hyperedges (8 elements bound together)
   - HNN message passing can propagate "what works" across similar (state, function, mechanism) hyperedges
   - *Key for us:* hyperedge classification — given a partial hyperedge (state, behavior, function), predict the missing elements (mechanism, register, my_thoughts)

2. **Temporal Graph Networks** — Rossi et al. (2020) arxiv:2006.10637
   - Conversations are temporal graphs — turns have order
   - TGN memory modules can track student state across turns
   - *Key for us:* memory + graph operator = student model that evolves per-conversation

3. **Heterogeneous Graph Transformer** — Hu et al. (2020) arxiv:2003.01332
   - Our graph has 17+ node types, 14+ edge types
   - HGT handles node-type and edge-type dependent parameters
   - *Key for us:* learn cross-lineage patterns (Socratic→Advaita function mapping)

4. **GraphGPS** — Rampášek et al. (2022) arxiv:2205.12454
   - Local message passing + global attention
   - *Key for us:* learn both local transition patterns (this state→this function) and global analogies (this Socratic move resembles this Buddhist move)

5. **Diffusion Models on Graphs** — arXiv:2302.02591
   - Generate new plausible graph structures
   - *Key for us:* generate novel teaching pathways from diffusion on the CO graph

6. **Liquid Time-Constant Networks** — Hasani et al. (2020) arxiv:2006.04439
   - Continuous-time models with varying time constants
   - *Key for us:* model varying "response time" expectations — a PR_01 move expects slow reflection, a PR_04 move expects immediate response

7. **Closed-form Continuous-time Models** — Hasani et al. (2021) arxiv:2106.13898
   - Faster than ODE solvers, same dynamics
   - *Key for us:* if we use LiquidODE for student state, use CfC for performance

8. **Swarm Chemistry** — Sayama (2024) arxiv:2409.01469
   - Heterogeneous swarms → open-ended evolution
   - *Key for us:* model COs as particles with behavioral parameters; COs should "interact" to produce novel teaching strategies
   - *Caveat:* This is the most speculative — swarm-like CO interaction would require careful constraints to avoid chaos

---

## Other Experimental AI Systems Worth Examining

### Sakura AI (mentioned)
Not a specific paper — refers to the general experimental AI space. The key architectural ideas from this space:

- **Mixture of Experts with dynamic routing** — our 6 lineages can be treated as "experts" with a learned router
- **Retrieval-Augmented Generation** — our ROs ARE the retrieval corpus, but RAG typically retrieves chunks, not structured passages. Our CO system is a structured, pedagogical RAG
- **Contrastive learning for embeddings** — train state embeddings to cluster by tattva region, separate by register distance

### Grover's Search / Superposition Encoding (mentioned)

The user mentioned "encode in x dimensions and have harmonics, collapsing into best responses." This maps to:

- **Superposition in the CO space:** Instead of selecting one CO per turn, maintain a distribution over COs. All COs are "active" with different probabilities. The distribution collapses to a single CO at decision time.
- **Harmonics as register modulation:** The 6 register dimensions are harmonics on the current state. Changing a register is like changing the frequency of one harmonic — the interference pattern shifts, and different COs resonate.
- **Collapse into best response:** At decision time, the CO with highest amplitude (best match to state + register) collapses into the selected move.

This is literally Grover's search analog — not a quantum computer, but a simulated amplitude amplification over COs.

```python
# Superposition over COs
co_amplitudes = torch.zeros(num_cos)
for i, co in enumerate(cos):
    co_amplitudes[i] = (
        state_similarity(state, co.state) *  # how well does state match
        register_match(register, co.register) *  # how well does register match
        lineage_compatibility(lineage, co.lineage)  # how compatible is lineage
    )

# Phase inversion (Grover-like): boost COs that have high success_rate
co_amplitudes *= (co.success_rates > threshold).float() * 2 - 1

# Diffusion (Grover-like): average then reflect
mean_amplitude = co_amplitudes.mean()
co_amplitudes = mean_amplitude + (mean_amplitude - co_amplitudes)  # reflection

# Collapse: select CO with highest amplitude
selected_co_idx = co_amplitudes.argmax()
```

---

## What to Keep, What to Discard

### Keep (genuinely useful engineering patterns):
1. Hebbian + homeostatic weight updates for CO confidence
2. Priority-based move selection (safety before confrontation)
3. Liquid ODE for continuous state tracking
4. Topoisomerase-style CO graph pruning
5. Diffusion for novel pathway generation
6. Complex-valued collapse for continuous→discrete decisions

### Discard (too speculative / over-engineered for our use case):
1. Evo-2 genomic encoding of connectomes (we don't have a genome)
2. Orch-OR quantum coherence modules (ungrounded)
3. Swarm chemistry ecological interactions (chaotic, hard to control)
4. Nucleosome data wrapping (elegant but overkill for JSON files)
5. Two-membrane Turing completeness proof (irrelevant to our architecture)

### Defer (interesting but needs more research):
1. Grover-style amplitude amplification over COs
2. Complex-valued embeddings with harmonic interference
3. Diffusion evolution for novel teaching arcs
