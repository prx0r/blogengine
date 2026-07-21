# TetraHermes Build — Next Steps

## Current State

**What works:**
- geometricengine parses Therapeutic only (201 of 738 blocks)
- policy_weights trained on 201 Therapeutic transitions
- pathway.py inference from trained weights
- LangGraph server on :2222
- 169 ROs across 30+ traditions

**What's blocked:**
- Parser stops at first JSON array — 537 blocks unread (Advaita, Socratic, Gurdjieffian, Realist, Buddhist)
- No CO export yet
- No RO linking
- 55 META phase blocks not accessible
- No Error Book
- No feedback loop

**What's designed:**
- tetrahermes-coordinates.md — complete UNO taxonomy, Ñāṇavīra K₄ mapping, 36-tattva coordinate system, 3 traversal paths, kañcuka model of resistance
- tetrahermes.md — Commentary Objects, 50-state classifier, sanskritree proof assistant
- tetrahermes-architectures.md — 5 architectures compared

**What's missing:**
- No actual build steps taken since the docs were written

---

## Phase 0: Foundation (This Session)

### 0.1 Fix the Parser

**File:** `geometricengine/src/parser/uno_parser.py`

**Problem:** `_load_json_arrays()` attempts to parse concatenated JSON arrays but fails after the first one because the error recovery is too primitive.

**Fix:** Replace the bracket-counting approach with a simple loop that finds each `[`, tracks balanced brackets including string escapes, and attempts `json.loads()` on each valid segment independently. Skip segments that fail to parse instead of aborting.

**Test:** `len(parse_uno())` should return 738, not 201.

**Files changed:** 1 file, ~20 lines changed.

### 0.2 Export All Commentary Objects

**New file:** `geometricengine/src/export_commentaries.py`

**What it does:** Reads all 738 parsed turns, creates a CO JSON file for each, saves to `content/commentaries/uno/`.

**CO schema:**
```json
{
  "co_id": "co:uno_{episode_id}_t{turn_index}",
  "lineage": "Therapeutic|Advaita|Socratic|...",
  "source_episode": "...",
  "turn_index": 0,
  "student_state": "...",
  "behavior_tags": [],
  "pedagogy": {
    "phase": "...",
    "function_id": "...",
    "mechanism_shape": "...",
    "register": { "intensity": "...", "intimacy": "...", ... },
    "teaching_actions": [],
    "traps_avoided": [],
    "predicted_impact": "..."
  },
  "my_thoughts": "...",
  "abstract_pattern": "",
  "linked_ros": [],
  "linked_concepts": [],
  "success_count": 0,
  "failure_count": 0
}
```

**Output:** 738 JSON files in `content/commentaries/uno/`.

**Deliverable:** First concrete output anyone can inspect.

### 0.3 Link COs to ROs by Lineage

**File:** `hypothetical-integrated/scripts/link-silos.py` (extend)

**Mapping:**
```
Advaita COs → ro:upanishads, ro:yoga-vasistha, ro:bhagavad-gita, ro:yoga-sutras
Socratic COs → ro:proclus-elements, ro:platonism-decoded, ro:chaldean-oracles
Therapeutic COs → (no RO — therapy concepts, not our content)
Gurdjieffian COs → ro:sufi-comparative-analysis, ro:steiner-tantraloka-parallels
Realist COs → ro:kybalion, ro:grimoires-decoded, ro:hermes-proof-system
Buddhist COs → ro:nagarjuna-mulamadhyamaka, ro:dhammapada, ro:buddhism-decoded
```

**Deliverable:** Every CO has `linked_ros[]` populated. Can now query: "show me all Advaita COs that link to ro:upanishads."

### 0.4 Retrain Policy Graph on All 6 Lineages

**File:** `geometricengine/src/train.py` (already works, just needs the fixed parser)

**Change:** Re-run after 0.1. The `train_all()` function reads all Unix transitions and builds `policy_weights`. With 738 blocks instead of 201, the graph is 3.7× denser.

**New weight type:** `lineage→function` — which lineages prefer which functions.

**Deliverable:** Policy graph covers all 6 lineages. Can ask: "What does Socratic do with `defensive_rationalization` vs. what does Advaita do?"

---

## Phase 1: The Teaching Loop (Next Session)

### 1.1 50-State Classifier

**New file:** `geometricengine/src/classifier.py`

**What it does:** Maps raw student text to one of 50 Mātṛkā prototypes using sentence-transformers (already in geometricengine's embed.py) + k-means clustering on the 530 UNO states.

**Prototype schema:** 50 entries mapping:
- state name → tattva number (1-36 or vowel A-Ḥ) → description → example UNO states → typical phase/function

**Deliverable:** `classify("I feel like I'm broken")` → `{state: "hopeless_shutdown", tattva: 35, lineage: "Therapeutic"}`

### 1.2 Register Predictor

**New file:** `geometricengine/src/register_predictor.py`

**What it does:** Given (state, function, lineage, mechanism), predict the 6 register values. Uses the 672 register-labeled blocks as training data. Simple 4-layer MLP (state_emb + fn_id + lineage_id + mech_id → 6-class outputs).

**Training data:** 672 blocks with known registers split into train/test.

**Deliverable:** Given `hopeless_shutdown + ME_02 + Therapeutic + none` → predict `PR_01, IN_04, AT_03, LS_01, PD_03, MM_02` (gentle, compassionate, high attunement, minimalist, emotional, explicit meta).

### 1.3 CO Query + Fallback Chain

**Modified file:** `geometricengine/src/pathway.py`

**Logic:**
```
1. classify(user_text) → {state, tattva, lineage}
2. query COs: find all COs for (state, lineage)
   → if found: pick highest success_rate → extract (phase, function, mechanism, register)
   → if not found: query policy_weights for nearest known state via similarity fallback
   → if no weights: use lineage-agnostic default (most common function for this state)
3. register_predictor(state, function, lineage, mechanism) → 6 register values
4. render response using RO content (via linked_ros on the CO)
```

**Deliverable:** The system can teach from any UNO state/lineage combination with a CO, and gracefully fall back when it has no data.

---

## Phase 2: Error Book + Feedback Loop (Next Session)

### 2.1 Sanskitree Proof Checker

**New file:** `content/commentaries/error-book.json`

**Schema:**
```json
{
  "co_id": "co:uno_...",
  "failures": [
    {
      "observed_state": "hopeless_shutdown",
      "attempted_function": "UM_03",
      "outcome": "student_disengaged",
      "constraint": "Do NOT use UM_03 when state is hopeless_shutdown. Use ME_02 instead.",
      "timestamp": "..."
    }
  ],
  "successes": []
}
```

**Logic:** After each conversation turn, compare predicted impact vs actual outcome. If success → CO.success_count++. If failure → log to Error Book with constraint. If constraint already exists → increment counter.

### 2.2 Dreaming Cycle — Cold State Detection

**New script:** `scripts/dream.py`

**Weekly cron (Sunday 2am):**
1. Scan all COs grouped by (lineage, state)
2. Find state-lineage pairs with 0 COs but >0 occurrences in real conversations
3. Propose candidate COs based on nearest known pair (same state, different lineage)
4. Write dream log

**Example:**
```
Cold pair detected: (Advaita, nihilistic_collapse) — 0 COs
Nearest known: (Therapeutic, nihilistic_collapse) → 3 COs
Therapeutic CO: ME_02 at PR_01, IN_04, AT_03
Proposed Advaita CO: RM_05 at PR_02, IN_03, AT_02
Rationale: Advaita doesn't use ME_02; it frame-upgrades existential questions
```

---

## Phase 3: The Web Interface (Next Session)

### 3.1 Chat UI

**Build on:** geometricengine's existing `src/app.py` (Streamlit) or `server.py` (HTTP)

**Add:**
- CO trace display (shows which CO was selected, why)
- Register display (shows the 6 register values for each turn)
- Feedback buttons (thumbs up/down per turn)
- Error Book readout
- Dream log display

**Deliverable:** User can chat with the system, see the CO selection path, register settings, and provide feedback that updates the system.

### 3.2 CO Explorer

**New page/tool:** Browse all 738 COs by lineage, state, function. See counts, distributions, success rates. Filter by linked RO.

**Deliverable:** Any CO can be inspected manually.

---

## Build Order Summary

| Step | What | Time | Depends On |
|------|------|------|-----------|
| 0.1 | Fix parser → 738 blocks | 30 min | — |
| 0.2 | Export 738 COs | 15 min | 0.1 |
| 0.3 | Link COs to ROs | 20 min | 0.2 |
| 0.4 | Retrain policy graph | 10 min | 0.1 |
| 1.1 | 50-state classifier | 45 min | 0.1 |
| 1.2 | Register predictor | 45 min | 0.1 |
| 1.3 | CO query + fallback chain | 60 min | 1.1, 1.2, 0.2, 0.4 |
| 2.1 | Error Book + feedback | 30 min | 1.3 |
| 2.2 | Dreaming cycle | 30 min | 2.1 |
| 3.1 | Chat UI | 60 min | 1.3 |
| 3.2 | CO Explorer | 30 min | 0.2 |

**Total build time to working system:** ~4 hours.

## Files Created

| File | Where | Purpose |
|------|-------|---------|
| `geometricengine/src/export_commentaries.py` | New | Export 738 COs from parsed UNO |
| `geometricengine/src/classifier.py` | New | 50-state Mātṛkā classifier |
| `geometricengine/src/register_predictor.py` | New | 6-dim register predictor from (state, function, lineage) |
| `content/commentaries/error-book.json` | New | Sanskitree contradiction log |
| `scripts/dream.py` | New | Weekly dreaming cycle |
| `content/commentaries/uno/` | New directory | 738 CO JSON files |
| `geometricengine/src/parser/uno_parser.py` | Modified | Fix concatenated JSON array parsing |

## Open Questions

1. **Buddhist data you mentioned** — 8 blocks in UNO + more you didn't upload. When to add it? It would only add ~8 COs from the current file. The rest would need to be annotated with PEDAGOGY blocks.

2. **The 530-to-50 state reduction** — needs manual cluster naming. 530 raw states → k-means → 50 prototypes → we name each one. This is the most labor-intensive step (maybe 1 hour of naming).

3. **CO success_rate vs recency** — a CO with 2/2 successes (100%) and one with 50/60 (83%) — the first might be luck. We need a Bayesian success_rate: `(success + 1) / (total + 5)` to avoid overtrusting small samples.

4. **Lineage inference** — we don't know what lineage a user prefers until they've talked for a bit. The system could start with a neutral default (maybe Therapeutic for safety) and detect lineage affinity from the first few exchanges. Or let the user choose explicitly.
