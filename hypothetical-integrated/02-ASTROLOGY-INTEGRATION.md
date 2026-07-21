# Astrology Integration — Correspondences, Graph, and Concepts

## How They Connect

### Astrology → Concepts
Every planet, sign, and house already has correspondences (herbs, metals, colours, stones, incenses).
These map to glossary concepts:

```python
# Existing: planet:mars → corr:herb:basil, corr:metal:iron, corr:colour:red
# Proposed: concept:mars (glossary) links to ro:mars-astrology, ro:ares-archetype
```

The astrology knowledge graph (`src/astrology/knowledge_graph.ts`) has 32+ node prefixes.
The glossary concepts (`content/glossary/concepts/`) have 76 nodes.
**They don't talk to each other yet.**

### Bridge: Concept → Astrology

```json
{
  "id": "daimon",
  "name": "Daimon",
  "definition": "An intermediate spiritual being...",
  "related_to": ["Eros", "Participation"],
  "astrology": {
    "planet": "mercury",  # daimon is mediated by Mercury in Ficino's system
    "house": 1,           # selfhood, identity
    "correspondences": ["corr:herb:mercury", "corr:metal:mercury"]
  }
}
```

This connects the glossary concept "daimon" to the astrology system.
When Hermes talks about the daimon, it can also reference the astrological dimension
(planetary hour, correspondences, natal placement).

### Bridge: Astrology → Essay Recommendations

```python
def recommend_essays_for_activation(planet):
    """When a planet is astrologically active, recommend relevant essays."""
    planet_concept = f"concept:{planet}"
    # Find all essays tagged with this planet's concept
    concept_file = f"content/glossary/concepts/{planet}.json"
    if os.path.exists(concept_file):
        concept = json.load(open(concept_file))
        return concept.get("essays", [])
    return []
```

## What Already Exists

| Component | Location | Status |
|---|---|---|
| Planetary correspondences (herbs, metals, colours) | `src/astrology/spellbook/correspondences.ts` | ✅ 231 entries |
| Knowledge graph with 32 node prefixes | `src/astrology/knowledge_graph.ts` | ✅ Working |
| Astrology API routes | `src/app/api/astrology/today/` | ✅ Working |
| Glossary concepts (76) | `content/glossary/concepts/` | ✅ Existing |
| Essays about astrological topics | `content/glossary/essays/` | ✅ 67 essays |

## What's Missing

| Bridge | Status | Effort |
|---|---|---|
| Concept JSON → astrology correspondences | ❌ Not linked | Low (add `astrology` field to concept JSONs) |
| Astrology graph → glossary concepts | ❌ Not linked | Medium (add cross-references) |
| Essay recommendation from planetary activation | ❌ Not built | Low (query essays by planet tag) |
| Chat: "What does Mercury mean today?" → internal docs | ❌ Not wired | Low (context files + search) |

## Contemplative Assistant Use Case

```
User: "Mercury is active today. What should I read?"

Hermes:
  1. Checks astrology engine → Mercury is daimon today
  2. Searches concepts → concept:mercury found
  3. Searches essays → ficino-mercury essay found
  4. Searches ROs → ro:ficino-daimon has astrology section
  5. Searches works → Voss on Ficino's astrological music therapy
  6. Recommends:
     - Read: "Ficino on the Daimon" (RO) — astrology section
     - Listen: essay on Ficino's music therapy (audio available)
     - Practice: Mercury hour meditation (from correspondences)
     - Note: Today's Mercury activation supports communicative work
```
