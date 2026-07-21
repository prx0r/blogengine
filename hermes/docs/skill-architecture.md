# Skill Architecture — How Hermes Navigates the System

> The data layer is organized. The skills are how Hermes moves through it.
> This document defines every skill, what it does, how they chain together,
> and the navigational hierarchy Hermes uses to find anything.

---

## Navigational Hierarchy

Hermes navigates the system through a tree of skills. Each level answers a
different kind of question:

```
Level 1: "What question does the user want answered?"
  → /research-objects (routes to the right family)
  → Question router (regex → family)

Level 2: "How do I acquire and catalog the sources?"
  → /acquisition (download + catalog)
  → /impact (check ROs affected)

Level 3: "How do I compile the sources into knowledge?"
  → /compile (create/update RO)
  → /propose (knowledge PR)
  → /merge (approve + version bump)

Level 4: "How do I verify the compilation is correct?"
  → /lint (structural checks)
  → /test (diagnostic questions)
  → /error-book (persistent corrections)

Level 5: "How do I publish this to the user?"
  → /publish-paper (Type B: existing paper → essay)
  → /write-and-publish (Type A: original essay)
  → /deploy-site (git → Cloudflare)
```

## Skill Inventory

### Pipeline Skills (The Core)

| Skill | Purpose | When Hermes Calls It |
|---|---|---|
| `/research-objects` | Route user question to RO family. Create, status, expand, lint, publish. | User asks a question about a topic |
| `/acquisition` | Download paper, create work JSON, tag with tier and concepts | User sends title/DOI/URL |
| `/impact` | New work → check all ROs → materiality score → Telegram notification | After acquisition completes |
| `/propose` | Create knowledge PR: git branch + diff + Telegram review | User accepts impact notification |
| `/merge` | Merge PR → version bump → changelog → git push | User approves PR |
| `/lint` | Structural validation: broken citations, orphan passages, duplicates | After every merge |
| `/test` | Diagnostic questions: required sources, coverage checks | After lint passes |
| `/error-book` | Record error → create constraint → inject into next compilation | Lint/test failure detected |

### Publishing Skills (Downstream)

| Skill | Purpose | When Hermes Calls It |
|---|---|---|
| `/publish-paper` | Type B: RO body → essay JSON → audio → deploy | User says "publish this RO" |
| `/write-and-publish` | Type A: source passages → write commentary → audio → deploy | User says "write an essay" |
| `/generate-audio` | TTS for any essay JSON | After essay JSON is created |
| `/deploy-site` | Git add → commit → push → cf:build → cf:deploy | After audio is generated |

### Research Skills (Discovery)

| Skill | Purpose | When Hermes Calls It |
|---|---|---|
| `/academic-research` | Multi-source search across OpenAlex, HAL, Zenodo | User asks "find papers on X" |
| `/research-mapping` | Map esoteric concepts to science domains | User asks "what science relates to X" |

### Maintenance Skills (Autonomous Cron)

| Skill | Purpose | Cron Schedule |
|---|---|---|
| `daily-impact-sweep` | Check for new works, run impact analysis | Daily 6am |
| `weekly-lint` | Lint all ROs, report failures | Monday 9am |
| `weekly-test` | Run diagnostic tests on all ROs | Monday 10am |
| `dreaming-cycle` | Cross-RO pattern detection, new RO proposals | Sunday 2am |
| `monthly-digest` | Ecosystem report: new sources, ROs updated, coverage trends | 1st of month |

## Skill Chaining (How Skills Call Each Other)

### Full Pipeline Flow

```
User sends: "Ficino on the daimon"
  │
  ▼
/research-objects (routes to family: thinker-topic)
  │
  ├── Checks if ro:ficino-daimon exists
  │   ├── YES → /research-objects status ficino-daimon
  │   └── NO  → Create RO stub, then:
  │
  ├── Checks which sources are already in library
  │   ├── Has enough? → /compile (build RO from library)
  │   └── Missing sources → /acquisition (download more)
  │
  ├── /impact (check if new sources affect other ROs)
  ├── /propose (create PR with changes)
  ├── /merge (on approval: bump version)
  ├── /lint + /test (verify quality)
  └── /publish-paper (deploy as essay + audio)
```

### Impact Detection Flow

```
New work arrives at content/works/work_{slug}.json
  │
  ▼ (cron or post-acquisition hook)
  │
/impact
  ├── Read concepts from work JSON
  ├── For each concept, search ROs that share it
  ├── Score materiality: shared_concepts × source_quality × gap_coverage
  ├── Rank affected ROs by materiality
  └── If materiality > threshold: send Telegram notification
```

### Learning Loop Flow (Vision 1)

```
After RO is published
  │
  ▼ (cron: weekly)
  │
/lint + /test
  ├── Compare RO body against source texts
  ├── Calculate gap score
  ├── If gap_score < threshold:
  │   ├── Identify missing topics
  │   ├── Search for new sources
  │   └── /propose (suggest expansion)
  └── If patterns detected:
      ├── Write skill via skill_manage
      └── Link skill to RO version
```

## Skill Bundle (Grouped Pipeline)

Using Hermes' skill bundle feature:

```yaml
# ~/.hermes/skill-bundles/full-acquisition.yaml
name: full-acquisition
description: Full pipeline: acquire → impact → propose → merge → lint → publish
skills:
  - acquisition
  - impact
  - propose
  - merge
  - lint
  - test
  - publish-paper
instruction: |
  Run skills in sequence. After each skill, verify output before proceeding.
  If any skill fails, report and stop. Do not skip verification steps.
```

The user can invoke the entire pipeline with one command:
```
/full-acquisition "Ficino on the Daimon"
```

## Hermes Features We Should Be Using

| Feature | What It Does | How We Use It |
|---|---|---|
| **Skill Bundles** | Group skills under one slash command | `/full-acquisition` runs the entire pipeline |
| **Skill Pinning** | Protect critical skills from Curator | Pin `acquisition`, `publish-paper`, `deploy-site` |
| **Curator** | Auto-archive unused skills | Let it archive old skills we don't use |
| **`/goal`** | Persistent goal across turns | Set a goal for multi-step acquisitions |
| **External Skills Dir** | Live sync from project to Hermes | Already configured — edits picked up on gateway restart |
| **Hermes Bundled LLM Wiki** | Karpathy-style wiki skill | Use as fallback when RO pipeline is overkill |
| **MCP** | Connect other tools via MCP protocol | Future: connect knowledge graph tools |

## File Tree Navigation for Hermes

Hermes can find anything by following this tree:

```
To find...                              Search path
─────────────────────────────────────────────────────────────
A concept                              content/glossary/concepts/{slug}.json
Art for a concept                      concept JSON → art[] array
Essays about a concept                 concept JSON → essays[] array
Sources discussing a concept           concept JSON → source_material[] array
ROs about a concept                    concept JSON → research_objects[] array
                                        OR research-objects/_index.json
A work's PDF                           work JSON → assets.pdf_path
A work's tier                          work JSON → analysis.tier
What a work comments on                work JSON → commentary_on{}
What scholarly claims a work makes     work JSON → scholarly_contribution.claims[]
Which ROs a work feeds into            work JSON → relevance_to_ros{}
An RO's current version                RO JSON → current_version
An RO's coverage gaps                  RO JSON → coverage.{section}.gaps[]
An RO's issues                         RO JSON → issues[]
An RO's outputs (essays)               RO JSON → outputs[]
Whether an output is stale             Compare output.ro_version to RO.current_version
What Hermes skills exist               hermes/skills/**/SKILL.md
What process docs exist                hermes/notes/**/*.md
