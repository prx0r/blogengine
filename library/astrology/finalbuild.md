# Final Build — Daimonic Astrology Engine

## Architecture

```
COMPUTATION (caelus) → ENGINE (activation packet) → INTERPRETATION (delineation) → PRACTICE (spellbook)
                                  ↕                           ↕                           ↕
                            KNOWLEDGE GRAPH (shared entity IDs)
```

Three chains, each building on the one before:
- **Engine**: what is active?
- **Interpretation**: what does it mean?
- **Practice**: what do I do?

## Build Order

| Step | What | Time | Tests |
|---|---|---|---|
| 1 | Refactor engine — pure `ActivationPacket` | 30 min | determinism still passes |
| 2 | Add firdaria — `firdariaAt()` wired | 20 min | firdaria adds yearly timing layer |
| 3 | Add aspect patterns — grand trine, T-square, grand cross, yod | 30 min | patterns detected in synthetic charts |
| 4 | Build knowledge graph — typed Map, shared entity IDs | 1 hr | traverse + clusterByPlanet work |
| 5 | SourceRuleEngine — 21 Valens pairs + al-Khayyāt rules | 1 hr | rules return correct themes |
| 6 | LLM containment — regex post-hoc validation | 30 min | hallucinated planets rejected |
| 7 | Refine existing tests for new architecture | 20 min | all 54+ tests pass |
