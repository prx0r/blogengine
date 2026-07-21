# Chat Interface — Internal Knowledge Chat

## How It Works

When the user asks a question, Hermes searches OUR data first:

```
User: "What did Ficino think about the daimon?"

Hermes:
  1. Search ROs → ro:ficino-daimon found (v0.1.0, 3 sources)
  2. Search concepts → concept:daimon found (definition + synonyms)
  3. Search works → work:ficino-daemon-socratico found (Tier 2 commentary)
  4. Search essays → essay:ficino-daimon found (published version)
  5. Compile answer from RO body passages + concept definition
  6. Return answer with citations to specific sources

Response:
  "Ficino identified the Socratic daimon as a tutelary spirit assigned at birth.
   [Source: work:ficino-daemon-socratico, Vieira's analysis of Ficino's Apology commentary]
   
   The daimon also functions as the vehicle of the soul, mediating between intellect
   and body — a structure Ficino derived from Proclus.
   [Source: work:kiosoglou-ficino-soul, Kiosoglou on Proclus's Elements of Theology]
   
   For the full compilation, see: ro:ficino-daimon"
```

## Implementation

Hermes already has everything needed:
- **Context files** can load entire directories: `hermes config set context_files '["content/works/", "content/glossary/concepts/", "content/research-objects/"]'`
- **Memory** stores user preferences: `memory_write("user_prefers_detailed_citations", true)`
- **Session search** retrieves past conversations
- **Terminal tool** reads JSON files, runs grep searches

No new infrastructure needed. Just configuration:

```yaml
context_files:
  - content/glossary/concepts/
  - content/glossary/essays/  
  - content/research-objects/
  - content/works/
  - hermes/AGENTS.md
  - hermes/SOUL.md
```

## Citation Format

Every answer cites its source:

```markdown
**Claim:** Ficino's daimon is a tutelary spirit.
**Source:** `work:ficino-daemon-socratico` — Vieira's analysis of the Apology commentary
**RO:** `ro:ficino-daimon` passage p_001
```

If the answer can't cite a source, Hermes says so:
"I don't have a source for that in my library. Here's what I know from general knowledge — but you should verify with a primary source."

## What It Can't Do

- Can't answer questions about content not in our library
- Can't synthesize across traditions if no RO bridges them
- Can't give medical or therapeutic advice (SOUL.md restriction)
