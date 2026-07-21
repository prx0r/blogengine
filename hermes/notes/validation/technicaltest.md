# Technical Test — Full System Diagnostics

## Test Date: 2026-07-09
## Subject: Thomas Prior (1999-05-16, 14:37, Ascot)

---

## Layer-by-Layer Test Results

| # | Layer | Status | Notes |
|---|---|---|---|
| 1 | Planet Conditions | ✅ | Angularity, sect, dignities, retrograde, triplicity rulers all computed |
| 2 | Oikodespotes | ✅ | Mercury (score 17) via Lot of Fortune + Moon |
| 3 | Activation Packet | ✅ | 5 signals, dominant mode: spirit |
| 4 | Aspect Patterns | ✅ | 0 patterns (correct — no grand trines/T-squares in this chart) |
| 5 | Antiscia | ✅ | 0 connections (correct — no planets within 3° of antiscion) |
| 6 | Bonification | ✅ | 7 conditions detected |
| 7 | Daimonic Houses | ✅ | Empty (correct — no planets in H5/6/11/12) |
| 8 | Valens Combinations | ✅ | 4 pair combinations from activated planets |
| 9 | Interpreters (5) | ✅ | 5 al-Khayyāt · 10 Valens · 5 Ficino · 2 Greenbaum · 5 Demetra |
| 10 | Convergence | ✅ | Jupiter, Mercury, Venus, Saturn, Mars flagged by 3+ systems |
| 11 | Source Rules | ✅ | 117 total |
| 12 | Correspondences | ✅ | 69 entries across 9 types |
| 13 | Spellbook | ✅ | 13 entries, 4 recommended for today |
| 14 | Knowledge Graph | ✅ | Mars cluster: 6 nodes, 5 edges |
| 15 | LLM Containment | ✅ | Clean: passes · Dirty: catches hallucinated planets |

## Bugs Found During Testing

| Bug | Severity | Status |
|---|---|---|
| `interpretPacket()` typo: `figino` instead of `ficino` in test script | Low (test only) | Noted — test script had typo, not production code |
| `recommendPractices` imported from `source_rules` instead of `spellbook` | Low (test only) | Wrong import path in diagnostic test |
| Hardcoded profection values bypass firdaria/ZR | Low (test only) | Real `buildActivationPacket` call uses computed values correctly |
| Planet conditions show Saturn as non-retrograde — but Mars IS retrograde | ✅ Correct | Mars Rx in Libra H1, Saturn direct in Taurus H8 |
| Firdaria lord not appearing | ✅ Correct | Saturn is firdaria lord — appears in signal as source |

## Performance

| Operation | Time |
|---|---|
| Engine init | ~300ms |
| Chart computation | ~35ms |
| Full analysis (packet + interpretations + convergence + practices) | ~150ms |
| **Total cold start** | **~500ms** |
| **Total warm (engine cached)** | **~200ms** |

## Fragility Points

1. **Oikodespotes almuten bias**: Mercury wins ~28% across all charts. This comes from caelus's `dignityScore()` — not our code. If caelus updates, oikodespotes may change.

2. **Type changes**: `ActivationPacket` type is imported by 7+ files. Changing a field name breaks compilation silently (TypeScript catches it, but `as any` casts bypass this).

3. **Spellbook trigger format**: `trigger:active:mars` — if the format changes, practices silently stop matching.

4. **Knowledge graph prefix list**: `NODE_PREFIXES` in `knowledge_graph.ts` — adding a new entity type requires adding its prefix. Forgetting causes silent node drops.

5. **Correspondence citations**: All 69 entries have chapter citations. Adding entries without citations breaks the validation check but doesn't crash the system.

## What the 54 Tests Cover

| Test file | Tests | What it proves |
|---|---|---|
| `mvp.test.ts` | 19 | Determinism, scoring, Valens pairs, Fortune/Spirit, profiles, smoke tests |
| `coherence.test.ts` | 35 | Real caelus integration, Valens theme matches, Greenbaum semantics, house topics, Ficino safety |

**Not covered**: Knowledge graph traversal, spellbook query matching, practice recommender, correspondence validation, LLM containment. These need test coverage.

## Full Chain Verification

```
Engine → Packet → Macro → 5 Interpreters → Convergence → Practices
  5 signals    5 planets   27 themes      5 planets      4 recommendations
```

All layers produce output. No silent failures. No uncaught type errors.
