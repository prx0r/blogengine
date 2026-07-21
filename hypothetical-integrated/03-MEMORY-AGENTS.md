# Memory + Agent Context — What Hermes Knows About You

## Files Hermes Reads on Startup

From SOUL.md reading order (14 docs):
- `hermes/AGENTS.md` — project context, Telegram, skills
- `handover.md`, `handover2.md` — orientation
- `system-architecture.md` — what we're building
- `content/schemas/complete-data-model.md` — all entity types
- `hermes/docs/ro-schema-spec.md` — RO format
- `hermes/docs/skill-architecture.md` — skills
- `daimon.md` — RO concept
- `visionary.md`, `visionbuild.md` — vision + build plan
- `currentresearchdocs.md` — three-tier taxonomy
- `researcharm.md` — API capabilities
- `targets.md` — paper targets
- `retrieval-as-reasoning.md` — key paper
- `visionflaws.md` — where it breaks

## Memory Stores

### ~/.hermes/memories/MEMORY.md (Agent Notes)
```markdown
# MEMORY.md
- User prefers concise answers with source citations
- User is currently focused on Ficino daimon research
- RO ficino-daimon is in draft state, needs passage extraction
- Acquisition pipeline is running (PID 48940)
- Today's OpenAlex downloads used: 3/100
- Last dreaming cycle found: intermediary beings pattern
```

### ~/.hermes/memories/USER.md (User Profile)
```markdown
# USER.md
- Communication: Telegram, prefers evening check-ins
- Interests: Ficino, Corbin, Iamblichus, Neoplatonism, Theurgy
- Current goals: Build RO corpus for imaginal/ritual/daimon
- Reading pace: ~2 papers/week for review
- Preferences: source-only compilations, no AI commentary
```

## Context Files (Loaded Every Chat)

```yaml
context_files:
  - content/glossary/concepts/   # 76 concept definitions
  - content/glossary/essays/     # 67 published essays
  - content/research-objects/    # 5 ROs
  - content/works/               # 130 cataloged papers
  - hermes/AGENTS.md
  - hermes/SOUL.md
  - handovernew.md
```

This means Hermes can answer questions about ANY of our content
without needing to search the web or use general knowledge.

## Symbiotic Workflow Example

```
User: "I just got a new paper on Ficino's astrology. Can you extract passages 
       for the daimon RO?"

Hermes:
  1. User sends paper URL/DOI
  2. Acquisition pipeline downloads + catalogs
  3. Impact detection: this affects ro:ficino-daimon (astrology section currently empty)
  4. Hermes extracts passages from the PDF
  5. Creates PR: "expand ro:ficino-daimon — add astrology section"
  6. Telegram: "3 passages extracted, 2 citations, coverage +15% [Review]"

User: "Looks good, but move the planetary mediation passage to a subsection."

Hermes:
  1. Applies the correction
  2. Updates the PR diff
  3. Telegram: "Done. Planetary mediation now under 'astrology/planetary_mediation'"

User: "Approve."

Hermes:
  1. Merges PR
  2. Bumps RO version (minor)
  3. Adds to changelog
  4. Telegram: "ro:ficino-daimon v0.2.0 — astrology section added"
```

Neither Hermes nor the user could do this alone. The user provides direction;
Hermes provides execution. That's the symbiosis.
