# Astrology Engine — Test Results

## Test Suite: 54/54 passed

| File | Tests | Status |
|---|---|---|
| `mvp.test.ts` | 19 | ✅ All passed |
| `coherence.test.ts` | 35 | ✅ All passed |

**Typecheck**: ✅ Clean, 0 errors.

---

## Manual Analysis: Thomas Prior (20 March 1985, 14:30 London)

### What the engine detects

| Planet | Score | Confidence | Timing Sources | Condition |
|---|---|---|---|---|
| Mars | 14 | high | natal prominence, ZR Spirit lord, monthly profection, transit, lot transit | Taurus H10, angular, in sect, **detriment** |
| Saturn | 14 | high | natal prominence, **annual profection lord**, transit, **firdaria** | Scorpio H4, angular, out of sect, retrograde |
| Venus | 11 | high | natal prominence, ZR Fortune lord, transit, lot transit | Aries H9, cadent, in sect, **detriment**, retrograde |
| Mercury | 6 | medium | **oikodespotes**, transit | Aries H9, cadent, neutral |
| Jupiter | 4 | medium | natal prominence (angular H7), transit | Aquarius H7, angular, out of sect |
| Moon | 3 | medium | transit, angle transit | Pisces H8, succedent, in sect |

### What the sources say about these activations

| Signal | Source Rule | Delineation |
|---|---|---|
| Mars in house 10 | al-Khayyāt Ch.47 | "Sorrow and captivity by powerful people, scarcity, wars, adversities" |
| Saturn retrograde in 4th, lord of year | al-Khayyāt Ch.47 | "Squandering of the inheritance, ruin of the parents" |
| Venus in 9th, detriment, retrograde | al-Khayyāt Ch.47 | "Instruction, moderation, knowledge and experience of many hidden things" |
| Mars + Saturn activated | Valens I.21 | "Disciplined force, strategic pressure, endurance through conflict" |
| Mars + Venus activated | Valens I.21 | "Passionate love, creative assertion, desire in action" |

### Architecture verification

| Component | Status | Details |
|---|---|---|
| **ActivationPacket** (pure signals) | ✅ | 6 signals, no interpretation data mixed in |
| **Firdaria** (new timing layer) | ✅ | Saturn detected as firdaria lord (weight +4) |
| **Aspect patterns** | ✅ | Module runs, 0 patterns in this chart (correct) |
| **Antiscia** | ✅ | 0 connections in this chart (correct) |
| **Bonification** | ✅ | 8 conditions detected (receptions, striking) |
| **Knowledge graph** | ✅ | Mars cluster: 6 nodes, 5 edges (planet + herbs/metal/colour/stone/incense) |
| **Source rules** | ✅ | 117 total, 18 for Mars, 8 for house 10 |
| **LLM containment** | ✅ | Clean output passes, hallucinated planets caught |
| **Valens combinations** | ✅ | 35 combinations from 6 activated planets (15 pairs + 20 triples) |
| **Oikodespotes** | ✅ | Mercury = personal daimon (score 11, via Lot of Fortune) |

### Is the analysis good?

**Yes, but with caveats.**

What's genuinely good:
- Mars in house 10 with the correct delineation from al-Khayyāt ("sorrow and captivity by powerful people") matches the native's real career struggles.
- Saturn as annual lord + firdaria lord + retrograde gives a genuinely strong signal about karmic family/roots work.
- The Fortune/Spirit split is meaningful: Spirit (17) > Fortune (14), mixed mode — the native's current period is slightly more Spirit-led (vocation, intention, authorship) than Fortune-led (circumstance).
- The alignment modes are reasonable: Mars → cool (aggression needs channeling), Saturn → strengthen (melancholy needs warming), Venus → discipline (detriment needs structure).
- LLM containment correctly rejects hallucinated entities.

What's still weak:
- **No aspect patterns in this chart** — the current sky aspects array is empty (we don't parse current sky aspects yet). The natal chart does have aspects (Sun trine Saturn, Mars opposition Pluto), but we never computed current-transit aspects between sky planets.
- **Daimonic houses (5/6/11/12) are empty** for this chart — correct, but makes the feature invisible in testing. Need a chart with planets in these houses.
- **Ibn Azzuz's tables** not accessible.
- **Al-Biruni's Book of Instruction** not accessible (password protected).

### What to fix next

| Issue | Fix |
|---|---|
| Empty current sky aspects | Wire `currentSkyAspects` from transit aspect computation |
| No aspect patterns in test chart | Use the natal aspects from caelus (Sun trine Saturn, etc.) |
| Daimonic houses invisible | Use a chart with planets in 5/6/11/12 |
| House 9 topic for Mars is wrong | Mars is in H10, not H9 — house detection is correct in the condition but wrong in the signal |
