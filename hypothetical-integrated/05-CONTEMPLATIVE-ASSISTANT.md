# Contemplative Assistant — The Symbiotic Workflow

## Core Loop

The assistant doesn't answer questions — it guides exploration.

```
User arrives with a question/curiosity/prompt
  │
  ▼
Hermes searches internal library
  ├── Finds relevant ROs → presents as "Here's what's compiled"
  ├── Finds relevant works → presents as "Here's what's available"
  └── No results → "I don't have sources on this. Want to find some?"
  │
  ▼
User explores the presented material
  ├── Reads passages from RO
  ├── Dives into source texts
  └── Asks follow-up questions
  │
  ▼
Hermes proposes actions
  ├── "This RO has a gap in astrology — want to expand it?"
  ├── "These two sources disagree — want to create a disagreement RO?"
  └── "This concept links to 3 ROs you haven't explored"
  │
  ▼
User decides
  ├── Approves → Hermes executes
  ├── Modifies → Hermes adjusts
  └── Rejects → Hermes notes preference
```

## Example Session

```
User: "I'm curious about the daimon in different traditions."

Hermes:
  "I have material on:"
  "  • Ficino's daimon (ro:ficino-daimon, 3 sources)"
  "  • Corbin's imaginal angel (ro:corbin-imaginal, 2 sources)"
  "  • Plato's daimon (work:plato-daimon, 1 stub — paywalled)"
  "  • Plotinus on the daimon (work:plotinus-daimon, 1 stub — paywalled)"
  ""
  "Notable gap: I have nothing on the Arabic barzakh tradition yet."
  "And I see a potential connection: Ficino's daimon and Corbin's angel"
  "both function as intermediaries. Want me to explore that?"

User: "Yes, explore the intermediary connection."

Hermes:
  "Cross-referencing ro:ficino-daimon and ro:corbin-imaginal..."
  ""
  "Both discuss an entity that mediates between the human and the divine:"
  "  • Ficino: daimon is a tutelary spirit assigned at birth"
  "  • Corbin: the imaginal angel is a personal guide through the mundus imaginalis"
  ""
  "Similarities: both are personal, intermediary, reveal higher truths"
  "Differences: Ficino's daimon is astrological, Corbin's angel is imaginal"
  ""
  "Neither covers the Arabic barzakh tradition."
  "Want me to search for sources on barzakh?"
```

## What Makes It Contemplative (Not Just QA)

| Feature | QA Bot | Contemplative Assistant |
|---|---|---|
| Answers | Gives direct answer | Surfaces what's known AND what's not known |
| Gaps | Hides them | Flags them as opportunities |
| Action | Answers once | Proposes next steps |
| Sources | May or may not cite | Always cites, traces to specific passages |
| Uncertainty | Hides it | States it plainly |
| User role | Consumer | Collaborator |

## Implementation

This is mostly SOUL.md (personality) + context files (knowledge) + a few tools:

- SOUL.md already defines the contemplative personality
- Context files give Hermes access to all content
- The key skill is `/explore` which guides the user through what's available
- Everything else is prompting, not code
