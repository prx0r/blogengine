# Handover to Future Agents

This document is the source of truth for any agent working on this system. Read it before changing anything.

---

## Core Principles — Do Not Violate These

### 1. Deterministic Engine Core

The engine produces the same output for the same input. **Always.** No randomness, no LLM calls, no fuzzy logic in the engine layer. The `ActivationPacket` is a pure function of `(birth data + current time)`. This is the foundation everything else builds on.

**Never**: Add an LLM call, random number, or non-deterministic component to `src/astrology/activation_engine.ts`, `activation_packet.ts`, or `daily_sphere_reader.ts`.

### 2. Packet Before Prose

The `ActivationPacket` is complete BEFORE any interpretation or LLM rendering. The packet is the product. Prose is just a renderer.

**Never**: Make the LLM part of the core data pipeline. The LLM is only a consumer of the packet, never a producer.

### 3. Engine ↔ Interpretation Separation

The engine produces pure signals (`ActivationPacket`). The interpretation layer reads those signals and adds meaning. The engine NEVER imports interpretation data (planet profiles, ritual references, alignment modes).

**Check**: If `activation_engine.ts` or `activation_packet.ts` imports from `planet_profiles.ts`, `ritual_references.ts`, or `interpretation_schema.ts`, something has gone wrong.

### 4. Shared Entity IDs

Every entity across every layer uses the same ID format: `planet:mars`, `sign:leo`, `house:1`, `lot:fortune`. The knowledge graph, spellbook, correspondences, and interpreters all use these IDs.

**Never**: Use different IDs for the same entity across different modules. `"mars"` in one file and `"planet:mars"` in another will break the knowledge graph.

### 5. Nothing Is Lost Between Layers

The macro translation (`aggregator.ts`) preserves EVERY field from the ActivationPacket. The interpreters each read the SAME structured data. The practice recommender builds triggers from the structured convergence.

**Never**: Summarize or truncate structured data when passing between layers. If you need to add a field, add it to the type. Don't drop fields.

### 6. Pipeline Isolation

`src/pipeline/` imports from the engine but the engine never imports from the pipeline. The pipeline is excluded from the main TypeScript config.

**Never**: Import anything from `src/pipeline/` into `src/astrology/` or `src/app/`.

---

## Architecture Overview

```
BIRTH DATA + TIME
     ↓
COMPUTATION (caelus npm package)
  → Raw planetary positions, aspects, houses
     ↓
ENGINE (16 deterministic layers in src/astrology/)
  → ActivationPacket (pure signals)
     ↓
MACRO TRANSLATION (interpreters/aggregator.ts)
  → MacroTranslation (structured PlanetContext[], never summarized)
     ↓
5 INTERPRETERS (interpretation_schema.ts)
  → al-Khayyāt, Valens, Ficino, Greenbaum, Demetra George
     ↓
CONVERGENCE DETECTION
  → Planets flagged by 3+ systems = high confidence
     ↓
PRACTICE RECOMMENDER (spellbook/spellbook.ts)
  → Queries SpellEntry[] by trigger vector
     ↓
KNOWLEDGE GRAPH (knowledge_graph.ts)
  → traverse("planet:mars") returns everything
```

## Key Files and What They Do

### Core Engine (src/astrology/)

| File | What it does | Lines | Fragile? |
|---|---|---|---|
| `activation_engine.ts` | Timing, scoring, confidence, conditions, w/ firdaria, aspects | ~600 | **YES** — core scoring logic |
| `activation_packet.ts` | Pure signal packet type + builder | ~210 | **YES** — packet structure must not change |
| `daily_sphere_reader.ts` | Assembles final reading by layering interpretation on packet | ~130 | Moderate — extends packet with profiles |
| `types.ts` | All shared types | ~306 | **YES** — changing types breaks everything |
| `source_rules.ts` | 117 rules from Valens + al-Khayyāt | ~250 | Moderate — adding rules is safe |
| `oikodespotes.ts` | Personal daimon via almuten() | ~120 | **YES** — fragile almuten logic |
| `knowledge_graph.ts` | Typed in-memory graph with shared IDs | ~180 | Moderate — adding node types is safe |
| `containment.ts` | LLM output validation | ~100 | Low — standalone utility |

### Interpreters (src/astrology/interpreters/)

| File | What it does | Method |
|---|---|---|
| `aggregator.ts` | Macro translation — preserves all engine data | Generative (builds structured context) |
| `demetra.ts` | 6-step sentence structure | Generative (planet + sign + house + condition) |
| `interpretation_schema.ts` | Orchestrates all 5 interpreters + convergence | Orchestration |
| `macro_view.ts` | (Deleted — merged into aggregator.ts) | — |

### Spellbook (src/astrology/spellbook/)

| File | What it does |
|---|---|
| `types.ts` | SpellEntry, SpellbookQuery types with trigger-based matching |
| `spellbook.ts` | 13 entries + query engine + practice recommender |
| `correspondences.ts` | 69 entries across 9 types, all with chapter citations |
| `validate.ts` | Validation script — run after adding entries |
| `ARCHITECTURE.md` | How spells connect to the engine |
| `EXTRACTION_SPEC.md` | Source priorities and extraction guide |

### UI (src/app/astrology/)

| File | What it does |
|---|---|
| `page.tsx` | Main page (~900 lines) — macro view, interpretations, chat, all sections |

### Pipeline (src/pipeline/)

| File | What it does |
|---|---|
| `fetch.ts` | Wikidata SPARQL queries for training data |
| `fetch_ogdb.ts` | Open Gauquelin Database download |
| `chart_similarity.ts` | Cosine similarity nearest neighbor search |
| `experiment_daimon.ts` | Chi-square test for daimon-vocation |
| `compute.ts` | Batch chart computation for training |

---

## What Not to Change — The Fragile Parts

### 1. The ActivationPacket Type

Defined in `activation_packet.ts`. This is the contract between the engine and everything downstream. If you change the `ActivationPacket` type, you must update:
- `interpretation_schema.ts` (reads the packet)
- `interpreters/aggregator.ts` (reads the packet)
- `daily_sphere_reader.ts` (wraps the packet)
- `page.tsx` (displays the packet)
- `containment.ts` (validates against the packet)

**How to change**: If you must add a field, add it to the `ActivationPacket` interface, then follow the compiler errors to every file that needs updating. TypeScript will tell you what's broken.

### 2. The Oikodespotes / Almuten Calculation

In `oikodespotes.ts`, the `computeOikodespotes` function calls `almuten()` from caelus. The almuten scoring determines which planet wins the dignity contest across 5 points (ASC, Fortune, Spirit, Sun, Moon). If the almuten calculation changes, the oikodespotes for every chart changes.

**Known issue**: Mercury wins almauten ~28% of the time across all charts. This is a systematic bias. Before changing it, understand that the almuten scoring comes from caelus, not our code.

**How to debug**: Run `dignityScore("mercury", lon, sect)` to see which dignity category gives Mercury the points. The fix may be in caelus's `dignity-score.ts`, not our code.

### 3. The Timing System Weights

In `activation_engine.ts`, the scoring weights are:
```
annual_profection: +5
zr_spirit: +5
zr_fortune: +4
firdaria: +4
monthly_profection: +2
transit_to_lot: +2
transit_to_planet: +1
transit_to_angle: +1
sky_aspect: +1
natal_prominence: +1-2
oikodespotes: +3
```

These are hardcoded heuristics. Changing them changes every reading. If you change them, document why and run the full test suite.

### 4. The Entity ID Format

The knowledge graph validates node IDs against a prefix list:
```
const NODE_PREFIXES = ["planet:", "sign:", "house:", "lot:", "angle:", 
  "element:", "modality:", "herb:", "metal:", "colour:", "stone:", 
  "incense:", "tradition:"];
```

If you add a new type of entity, add its prefix to this list. If you forget, the graph will silently drop the node.

### 5. The Macro Translation

`interpreters/aggregator.ts` contains the `buildMacroTranslation` function. This is the bridge between the engine and every downstream consumer. If the macro translation drops a field, that field is lost for ALL interpreters, convergence, and practice recommendations.

**Never**: Remove a field from `PlanetMacroContext`. Add new fields if needed, but never remove.

---

## How to Troubleshoot

### Engine Produces Wrong Results

1. **Check caelus first**: Run `Engine.chart()` directly and verify the raw positions are correct.
2. **Check the timing**: `computeActivations()` logs which timing systems fired. Add `console.error` to verify each timing source produces the expected output.
3. **Check the confidence**: Low confidence usually means a planet has only 1 timing source. Add more timing sources or check that `findTransits` is working.
4. **Check the oikodespotes**: `computeOikodespotes()` logs the almuten score. If Mercury wins everything, run `dignityScore()` manually for each planet.

### Interpretations Are Wrong

1. **Check the source text**: Each interpreter references specific source texts. Verify the text supports the interpretation.
2. **Check the packet data**: The interpreter may be reading a field that doesn't exist. Run the packet through the interpreter directly.
3. **Check convergence**: If convergence says 5 planets are active but only 2 have high confidence, check the convergence threshold logic.

### Practice Recommendations Are Wrong

1. **Check triggers**: The practice recommender builds triggers from macro contexts. Print the trigger vector and verify it matches the active planets.
2. **Check spellbook entries**: Each entry has triggers. Verify the triggers use the format `trigger:active:mars`. Wrong format = no match.

### Tests Fail

The 54 tests are in `src/astrology/tests/`. They test:
- Determinism (same input → same output)
- Activation scoring (transit-only = low, 3+ sources = high)
- Valens pairs (all 21 exist, themes match source text)
- Fortune/Spirit split (mode is valid)
- Integration smoke tests (full pipeline runs without crashing)

**If tests fail**: Tests usually break because:
- A type changed (`types.ts`)
- A function signature changed
- Import paths changed

Run `npm run typecheck` first. If that passes, the tests should pass. If tests fail despite typecheck passing, the test data in `fixtures.ts` may need updating.

---

## How to Extend

### Adding a New Source Text

1. Extract the text to a readable format (txt, not PDF with custom fonts)
2. Create a new section in `source_rules.ts` or `spellbook/spellbook.ts`
3. Each entry must follow the canonical format:
   ```ts
   { id: "source:type:domain:001", source: "Author", type: "ritual",
     purpose: ["purpose"], triggers: ["trigger:active:planet"],
     planets: ["planet:mars"], procedure: ["step 1", "step 2"],
     safety: "historical_reference", safeAdaptations: ["adaptation"] }
   ```
4. Run `npx tsx src/astrology/spellbook/validate.ts`
5. Run `npm run typecheck`

### Adding a New Interpreter

1. Create a new file in `src/astrology/interpreters/`
2. The interpreter reads `ActivationPacket` and outputs `InterpretationTheme[]`
3. Import and register it in `interpretation_schema.ts`:
   - Add it to the `interpretations` object type
   - Call it in `interpretPacket()`
   - Add it to the `interpretations` return value
4. Add the display to `page.tsx`:
   - Add to the `labels` map
   - Add to the system array

### Adding a New Correspondence Type

1. Add the type string to `CorrespondenceType` union in `correspondences.ts`
2. Add entries with the format: `{ id: "corr:newtype:item", type: "newtype", ... }`
3. Add the prefix to `NODE_PREFIXES` in `knowledge_graph.ts`

---

## Pipeline Notes

The pipeline (`src/pipeline/`) is entirely separate from the engine. It exists for validation and training:

- **OGDB dataset**: 24,539 records with real birth times from Open Gauquelin Database. Download URL: `https://opengauquelin.org/download/ogdb-time-sep.csv.zip`
- **Chart similarity**: Cosine similarity on ~245-feature vectors. Nearest neighbors for any chart against 3,425 OGDB charts.
- **Daimon experiment**: Chi-square test found χ² = 31.64, df = 30, p > 0.05 — NOT significant. Mercury base rate bias (~28%) drowns domain-specific signals.

**To run the pipeline:**
1. `npx tsx src/pipeline/fetch.ts --domain athlete --limit 10` (test fetch)
2. `npx tsx src/pipeline/chart_similarity.ts --limit 1000` (similarity search)
3. The OGDB CSV must exist at `/tmp/ogdb-time-sep.csv` (download + unzip)

---

## Key Decisions (Why Things Are The Way They Are)

| Decision | Why |
|---|---|
| **No LLM in engine** | LLMs are non-deterministic. The engine must produce identical output for identical input. |
| **Packet before prose** | Separating signal from interpretation lets us swap renderers without recomputing. |
| **Shared entity IDs** | Allows `clusterByPlanet("mars")` to return computation + interpretation + practice + correspondences in one graph traversal. |
| **Macro translation preserves everything** | Earlier versions summarized to text, losing structured data. The aggregator now carries every field forward. |
| **Trigger-based practice matching** | Instead of tagging spells by planet only, we match by engine state (active, daimon, retrograde, detriment, year lord). More precise, fewer false matches. |
| **Pipeline isolation** | The pipeline needs heavy imports (caelus, SQLite). Keeping it separate means the engine stays lightweight and the pipeline can fail without affecting the app. |
| **Skinner as reference, not source** | Skinner's PDF has custom fonts and can't be text-extracted. The Internet Archive text version (81K lines) exists but is prose-heavy. We use it to verify our existing correspondence data, not as a primary extraction source. |

---

## Source Material Status

| Source | Status | Location | Readable? |
|---|---|---|---|
| Agrippa (3 Books) | Reference extracted | `blueprints/source_texts/agrippa-*.txt` (970K) | ✅ Full text |
| Picatrix (4 Books) | Partially extracted | `content/glossary/sources/books/Picatrix*PDF` → `/tmp/picatrix_b1b2.txt` (10K lines) | ✅ Text extracted from PDF |
| PGM | Not extracted | `content/glossary/sources/books/pgm.txt` (1.2M) | ✅ Full text |
| Orphic Hymns | 2 of 7 extracted | (via spellbook entries) | ✅ |
| Arbatel | 7 Olympic spirits done | `content/glossary/sources/books/arbatel.txt` | ✅ Full text |
| Stephen Skinner | Reference only | `stephenskinnerworking` (81K lines) | ✅ UTF-8 text from Internet Archive |
| Ficino De Vita | Profiles extracted | `planet_profiles.ts` | ✅ |
| Liber 777 | Not extracted | `content/glossary/sources/books/Liber 777 Revised.pdf` | ❌ PDF (unparsed) |

---

---

## Deployment to Cloudflare

### Architecture

The app runs on Cloudflare Pages with Workers. The stack:

| Component | What | Config |
|---|---|---|
| Hosting | Cloudflare Pages | `wrangler.jsonc` → `re-rendering-atlas` |
| Runtime | Cloudflare Workers (Node.js compat) | `compatibility_flags: ["nodejs_compat"]` |
| Database | D1 (SQLite-compatible) | `ATLAS_DB` binding → `atlas-db` instance |
| Storage | R2 (S3-compatible) | `ATLAS_R2` binding → `atlas-sources` bucket |
| Vector | Vectorize | `ATLAS_VECTORIZE` → `atlas-global` index |
| Build | OpenNext + Cloudflare | `opennextjs-cloudflare` package |
| Ephemeris | caelus (embedded JSON data) | Works in Workers — no native deps, no WASM |

### Build and Deploy Commands

```bash
# Full build (graph data + next + cloudflare adapter)
npm run cf:build

# Deploy
npm run cf:deploy

# Preview locally
npm run cf:preview
```

The `cf:build` script runs: `generate-graph-json.mjs` → `next build` → `opennextjs-cloudflare build`. The output goes to `.open-next/worker.js`.

### Database (D1)

The D1 instance `atlas-db` has tables for users, chat sessions, journal entries, graph nodes, etc. All defined in `src/atlas/db/schema.sql`. Access pattern:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = getCloudflareContext();
const db = env.ATLAS_DB as D1Database;
const result = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
```

The astrology engine runs CLIENT-SIDE in the browser — caelus is bundled with the Next.js client bundle. The D1 database is used for:

| Data | Table | API Route |
|---|---|---|
| User profiles + birth charts | `users` (profile JSON column) | `/api/profile` (GET/PATCH) |
| Daily snapshots | (not yet created) | `/api/astrology/snapshot` (POST) |
| Diary entries | `journal_entries` | `/api/journal` (GET/POST) |
| Chat sessions | `chat_sessions` + `chat_messages` | `/api/chat` (POST) |

### What Breaks if You Deploy Without Changes

1. **`better-sqlite3` import in pipeline code**: The pipeline (`src/pipeline/store.ts`) tries to import better-sqlite3. This is ONLY used locally for the OGDB dataset. The pipeline is excluded from the main TypeScript config and should NOT be included in the Cloudflare build. **Verify that `src/pipeline/` is not imported anywhere in `src/app/` or `src/astrology/`.**

2. **File system access**: The cloudflare build (`opennextjs-cloudflare`) includes server functions. Any `readFileSync` or file system operations in API routes will fail on Workers. Ensure that:
   - `src/app/api/` routes only use D1 or HTTP fetch
   - No local file reads in API handlers

3. **OGDB dataset (24K records)**: The chart similarity feature currently loads OGDB from `/tmp/ogdb-time-sep.csv`. This CSV cannot exist on Workers. Options:
   - Defer: the similarity feature is not wired into the UI (hardcoded data shown)
   - Store the pre-computed index in D1 or R2
   - Remove the feature from the client-side build

4. **`/api/chat` proxy**: The chat endpoint at `/api/chat/route.ts` forwards to `opencode.ai/zen/go/v1/chat/completions`. This works on Workers because it uses `fetch()`. The API key is read from `DEEPSEEK_API_KEY` env var. **Verify the env var is set in Cloudflare Pages.**

### What to Do Before Deploying

1. **Set environment variables** in Cloudflare Pages dashboard:
   - `DEEPSEEK_API_KEY` — the API key for the chat proxy
   - `ENVIRONMENT` = `production` (already in wrangler.jsonc)

2. **Initialize D1 tables** if not already done:
   ```bash
   npx wrangler d1 execute atlas-db --remote --file=src/atlas/db/schema.sql
   ```

3. **Build and deploy**:
   ```bash
   npm run cf:build
   npm run cf:deploy
   ```

4. **Test the deployed URL** — verify:
   - The page loads at `/astrology`
   - Birth chart computation works (caelus in client bundle)
   - The "Save to Profile" button works (calls `/api/profile`)
   - The daimonic chat works (calls `/api/chat`)

### What NOT to Deploy

- `src/pipeline/` — excluded from tsconfig, but ensure no accidental imports
- `ogdb_subjects.jsonl` — local OGDB dataset, not on Workers
- `src/astrology/spellbook/` — this is client-side reference data, it's bundled with the Next.js client — safe
- `StephenSkinner-*.pdf` — not needed at runtime
- `content/glossary/sources/books/pgm.txt` — not needed at runtime

The astrology engine itself (`src/astrology/`) is safe because caelus uses embedded JSON data (no native dependencies). The spellbook and correspondences are static data bundled with the client.

## Final Warnings

1. **Do not change the ActivationPacket type without updating every consumer.** TypeScript helps but doesn't catch runtime field access in the interpreters.

2. **Do not add LLM calls to the engine pipeline.** The LLM is a renderer only. If you need LLM output, add it as a consumer of the packet, not as a producer.

3. **Do not remove fields from PlanetMacroContext.** The macro translation is the canonical bridge. Removing a field breaks every downstream consumer.

4. **Do not change shared entity ID formats.** `planet:mars` is not the same as `mars` or `Planet:mars`. The knowledge graph validates against a prefix list.

5. **Do not modify the pipeline's tsconfig exclusion.** The pipeline imports heavy modules (caelus, SQLite). Excluding it from the main tsconfig keeps the app build clean.

6. **Do not skip the validation step.** After adding spellbook entries, always run `npx tsx src/astrology/spellbook/validate.ts` and `npm run typecheck`.

---

## Hermes Agent Integration

### What Hermes Is

Hermes Agent (Nous Research, MIT license) is an autonomous agent runtime installed on a VPS. It has cron, persistent memory, 70+ tools, 20+ messaging platforms, and a skills system. It's NOT on your Cloudflare site — it's a separate instance that talks to the site via API.

### What Hermes Can Do For This System

| Task | How | Status |
|---|---|---|
| **Daily Telegram daimon** | Cron reads ActivationPacket, picks top planet, writes a paragraph, delivers via Telegram | Not built |
| **Diary & chat** | MEMORY.md + USER.md learn preferences. Session search retrieves past conversations | Built into Hermes |
| **Essay writing** | Write a `/write-essay` skill that reads source material → drafts → formats. Cron schedules it | Not built |
| **Practice scheduling** | Cron reads the spellbook + astrology engine, picks a practice for the current planetary hour | Not built |
| **Video pipeline trigger** | Hermes queues finished essays to the Remotion + molts studio pipeline | Not built |
| **YouTube analytics** | Hermes pulls audienceWatchRatio from YouTube Data API, stores it for next iteration | Not built |

### Connection Pattern

Hermes is NOT wired to the site yet. The pattern:

```
Hermes (VPS/Modal)
  ├── Cron → calls site API → writes to Telegram
  ├── Chat → MEMORY.md learns about you over time
  └── Skills → execute multi-step workflows (write essay, generate video)
         │
         ▼
Site API (Cloudflare Workers)
  ├── GET /api/astrology/today → ActivationPacket
  ├── GET /api/essays → list of essays with metadata
  ├── POST /api/journal → diary entry
  └── Spellbook data → client-side, bundled with Next.js
```

### Setup Order

1. Install Hermes on a $5 VPS: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
2. Write SOUL.md (daimonic personality, mythos filter from `videos.md`)
3. Write AGENTS.md (paths to site API, essay locations, spellbook format)
4. Set up Telegram gateway for daily messages
5. Write `/daily-daimon` skill — reads chart, picks top planet, writes paragraph
6. Set up cron for daily message
7. Later: `/write-essay` skill, video pipeline trigger, practice scheduler

## Realistic Next Steps (Ranked By Impact)

### Week 1: Install + Daily Daimon (3 hours)

Install Hermes on a VPS. Write SOUL.md and AGENTS.md. Set up Telegram. Write a `/daily-daimon` skill that calls the site's astrology API and sends a Telegram message. This gives you a morning message with your current planetary activation.

### Week 2: Practice Database Extraction (4 hours)

Write extraction scripts for PGM, Agrippa, and the remaining correspondences. The EXTRACTION_SPEC.md defines the target format. The source texts are in `content/glossary/sources/books/` and `blueprints/source_texts/`. The goal is 100+ extractable practices that the astrology engine can recommend.

### Week 3: Diary + Pattern Discovery (2 hours)

Connect Hermes to `/api/journal`. Each day's diary entry gets tagged with the day's ActivationPacket. After 30 days, Hermes can answer: "When Mercury is active and I write, my average mood is 4.2. When Saturn is active, 2.8."

### Week 4: Video Pipeline Prototype (1 day)

Wire an existing essay + audio into the molts studio avatar pipeline. The output is a 5-minute talking-head video. Upload to YouTube. This proves the concept.

### Month 2+: Loop Closure

Pull YouTube retention data → feed back into essay structure → better videos → more data → better essays.

## What We Gave Up On

- **Lean/sanskritree integration** — No value. The cross-reference tables are tautologies. Drop it.
- **Truthcore DB as separate system** — HXRMXS JSONs already serve this purpose. No new infra needed.
- **UNO LoRA training** — Too much work for unclear benefit. Structured pedagogy can be a prompt.
- **Training our own models** — No need. Tool Gateway provides frontier models per-use.

## Open Questions

- Where to run Hermes? $5 VPS (Hetzner) vs Modal (serverless) vs locally
- How to handle the essay writing skill? LLM drafts, you edit, or fully autonomous?
- YouTube strategy: one channel per tradition (Ficino, Iamblichus, Corbin) or one channel for everything?

---

## Post-Correspondence Decisions (July 2026)

### What Changed

After expanding correspondences from ~69 to ~250 entries (adding animals, colours, days, numbers, archangels, body parts, musical notes, senses, divine names), the direction shifted. The correspondences work proved that manual extraction from memory is faster than parsing messy OCR. Skinner's file (81K lines) is reference-only — too inconsistent for reliable parsing.

### New Priorities

**1. Hermes essay writing via knowledge graph tensions, not random ingestion.**

The 73 HXRMXS syntheses in the sanskritree repo are the seed graph. Each `n2_truthcore` block is a node with claim, mechanisms, correspondences, evidence, category_distinctions, unknowns. The `correspondences` array in each is an edge list. A simple script loads them into a graph DB. When two nodes contradict, that's an essay topic.

For science mapping: pull arxiv papers matching the concepts in EXISTING essays, not random. The essay domains are: Ficino (spiritus, celestial medicine), Iamblichus (theurgy, ritual), Corbin (imaginal, ta'wil), Goethe/Steiner (perception, living thinking), Plotinus (beauty, the One), theurgy (divine symbols). Each has a corresponding science domain:
- Ficino spiritus → interoception, predictive processing
- Corbin imaginal → mental imagery, hallucination models, psychedelic research
- Goethe perception → active inference, enactive cognition
- Iamblichus ritual → contemplative neuroscience
- Plotinus beauty → neuroaesthetics

**2. No ThinkTank/Shadow Model.** Overengineered for the problem. The discovery loop is simpler: Hermes reads the graph, finds high-tension pairs, writes an essay. No UMAP, no HDBSCAN, no multi-agent psychology lab.

**3. Lean is dead.** Formally. No value for essays, astrology, or concepts. The sanskritree FOL→Lean bridge is only useful for Sanskrit philosophical inference validation, which isn't part of the site.

**4. Simulation blueprint.** 8,490-line file at `content/source/simulation-blueprint.md`. Starts with a Plutarch companion but the bulk is a synthesis of every major computational consciousness theory (Campbell, Levin, Friston, Seth, Hoffman, Wolfram, Tegmark, Zenil, IIT, GWT, predictive processing) structured as Imaginarium companions. This is the external knowledge graph for consciousness research, already formatted.

**5. The paper ingestion format** is the Friston JSON schema from the research arm discussion: classification, mathematical framework (variable registry + equations), empirical predictions, theoretical relationships (builds_on, supports, conflicts_with), evidence assessment. Every ingested paper produces nodes in the same graph as the HXRMXS syntheses.

**6. The 17 phases** (from `content/source/path-of-re-rendering.md`) are the top-level categories. Each essay and synthesis maps to a phase. The graph lives inside that structure.

### What Comes Next

1. Load the 73 syntheses into a graph (one script, ~50 lines)
2. For each essay on the site, identify the science domain that maps to it
3. Write a cron that pulls arxiv papers in those domains, classifies them per the Friston schema, inserts into graph
4. When the graph detects a tension (contradicting claims, or a scientific paper that addresses an essay's `unknowns`), queue an essay for Hermes

That's the pipeline. No Shadow Model. No ThinkTank. Just a graph of claims with edges, and Hermes reading it.

---

## Session: July 2026 — PGM Catalog, Llewellyn Extraction, Spellbook Expansion

### What Changed

**1. Source material priority rebalanced**

| Source | Verdict |
|---|---|
| **Llewellyn Complete Book of Ceremonial Magick** | NEW PRIMARY SOURCE. Clean e-book PDF, ~12MB, 24K lines of extractable text. Planetary correspondence tables (Tables 19-24) are clean and properly attributed. |
| **Stephen Skinner (81K lines OCR)** | Reference-only confirmed. OCR too corrupted — planet symbols rendered as garbage chars, table structure destroyed. Already noted in handover but verified in practice: regex, LLM, and Hermes approaches all fail. |
| **Picatrix** | ~10K + ~16K lines extracted from PDF. Full planetary ring talisman operations with timing, engraving instructions, materials, and effects. |
| **PGM** | 140 spells cataloged by purpose and planetary association. Structured JSON at `content/glossary/pgm-catalog.json`. |

**2. Correspondence expansion (Llewellyn)**
Added ~100+ entries from Llewellyn Book Three (David Rankine, Planetary Magic):
- 7 metals + 9 colours (Table 19)
- 7 primary + 43 extended crystals (Tables 19, 23)
- 37 incenses across all planets (Table 21)
- 7 planetary numbers (Table 19)
- 14 body parts (Table 2)
- 7 planetary spirits — Zazel, Hismael, Bartzabel, Sorath, Kedemel, Taphthartharath, Schad (Table 17)
- 7 planetary intelligences — Agiel, Jophiel, Graphiel, Nakhiel, Hagiel, Tiriel, Malka (Table 16)
- 3 alternate archangels — Tzaphkiel, Khamael, Uriel (Table 15, Golden Dawn tradition)
- 6 divine names (Table 5)

**3. Spellbook expansion (30 entries, up from 13)**
- PGM: 10 entries (Apollonian invocation, Helios memory, solar charm, anger restraint, Aphrodite attraction, restraining seal, Zeus prosperity, divination by fire, dream oracles)
- Picatrix: 11 entries (planetary ring talismans for Saturn, Jupiter, Mars, Sun, Mercury + adapted operations)
- Llewellyn: Mercury Theurgic Devotion — full 15-step ritual with Orphic Hymn incantation

**4. PGM Catalog (`content/glossary/pgm-catalog.json`)**
140 spells extracted from the table of spells, each with:
- `ref`: PGM reference number
- `title`: spell name
- `type`: ritual / prayer / meditation / talisman
- `purposes[]`: love, divination, protection, success, calm, binding, memory, invisibility, necromancy, daimon, exorcism, initiation
- `planets[]`: mapped by deity invoked (Venus=38, Sun=9, Moon=7, Mercury=2)

Query with:
```
node -e "const c=require('./content/glossary/pgm-catalog.json');c.spells.filter(s=>s.purposes.includes('love')).forEach(s=>console.log(s.ref,s.title))"
```

**5. Hermes Agent integration**
Installed at `/usr/local/bin/hermes` with opencode Go API using model `deepseek-v4-flash`. Custom skills written:

| Skill | Purpose |
|---|---|
| `essay-companion` | Full essay pipeline: source → blueprint → JSON → audio → deploy |
| `research-mapping` | arXiv science mapping per domain (Ficino→interoception, Corbin→mental imagery, etc.) |
| `pgm-extraction` | Extract SpellEntry objects from PGM text |
| `skinner-extraction` | (Abandoned — OCR too broken) |

SOUL.md rewritten with dual-mode persona (extraction + essay writing as "Aurelius"). AGENTS.md updated with full project context. Blogwatcher configured with 20 research blogs.

**6. Steiner archive noted**
GA013 and GA110 are fully accessible at `rsarchive.org` as clean HTML. Proposed as a 6th interpreter (anthroposophical lens on the ActivationPacket) rather than correspondence data — Steiner's planetary hierarchy is cosmological (Moon→Angels, Mercury→Archangels, etc.) not material.

### Graph Wired — July 2026

The knowledge graph was wired into the engine pipeline. Previously the graph was populated by `registerSpellbookInGraph()` but never called, and the practice recommender was a 30-element array filter with no connection to interpretations or convergence.

**Changes to `src/astrology/knowledge_graph.ts`:**
- New `EntityLayer`: `"static"` — for signs, houses, elements, modalities (never cleared between sessions)
- `registerStaticEntities()` — registers 12 signs, 12 houses, 4 elements, 3 modalities with edges: `sign→ruled_by→planet`, `sign→has_element→element`, `sign→has_modality→modality`
- `pushActivationToGraph(signals, themes, oikodespotes)` — called per chart computation. Adds:
  - `planet:mars → has_condition → condition:mars_retrograde` (for each essential dignity, retrograde status, angularity)
  - `planet:mars → has_timing → timing:annual_profection` (for each timing source)
  - `planet:mars → interpreted_by → theme:mars_al-khayyat` (for each interpreter theme)
  - `planet:mars → activated_at → confidence:high`
  - `planet:mars → is_daimon → daimon:mercury` (if daimon active)
- `graphRecommend(planet, convergencePlanets, confidence)` — queries the graph for practices with convergence context
- `clearSession()` — removes all `computation` and `interpretation` layer nodes between chart computations, preserving static + correspondence + practice layers

**Changes to `src/app/astrology/page.tsx`:**
- `registerSpellbookInGraph()` called once on mount alongside Engine init
- After each chart computation, `pushActivationToGraph()` is called with the packet signals + all interpreter themes
- `graphRecs` state stores detailed recommendations: practice name, planet, score, confidence, daimon flag, convergence flag, interpreter themes that triggered it, correspondences linked to it
- Old hardcoded "Practices" section (Saturn Year Practice + Daimon Active from aggregator.ts) replaced with graph-backed "Recommended Practices" section showing 8 practices sorted by convergence → score
- Each recommendation card shows: planet badge, daimon tag, converged tag, practice name, score, reasoning (which interpreters agreed), and linked correspondences

**Changes to `src/astrology/daily_sphere_reader.ts`:**
- `pushActivationToGraph()` called after `buildActivationPacket()` in `buildDailySphereReading()`

**Result:** `clusterByPlanet("mars")` now returns in one call:
- 9 practices, 38 correspondences, 6 interpreter themes, 2 conditions, 3 timing sources
- Plus static entity links (Mars rules Aries/Scorpio, Mars is in the element/layer defined by its sign)
- All visible in the UI with full provenance

**Test:** `scripts/test-graph-integration.ts` — uses synthetic day chart, verifies all 8 checks pass (oikodespotes, signals, interpretations, convergence, graph recommendations, graph interpretations, graph conditions, static entities). Run with `npx tsx scripts/test-graph-integration.ts`.

**Graph state after wiring:**
- 457 nodes (263 correspondence + 134 practice + 31 static + 8 computation + 21 interpretation)
- 528 edges (corresponds_to, practice_for, has_condition, has_timing, interpreted_by, activated_at, is_daimon, ruled_by, has_element, has_modality, uses_material)

### Key Decisions

- **Skinner is dead as a data source.** The Llewellyn book replaces it entirely for planetary correspondence data. Skinner stays reference-only for manual cross-checking.
- **Steiner is an interpreter, not a correspondence source.** His planetary→hierarchy mapping (Moon Angels, Mercury Archangels, Venus Archai, etc.) doesn't slot into the engine's trigger system. If added, it lives in `interpretation_schema.ts` as a 6th voice.
- **PGM catalog is a lookup, not a runtime graph node.** The planetary associations are inferred from deity names. They're useful for human querying and essay research, not for the engine's practice recommender.
- **Blogwatcher feeds the research-mapping pipeline.** arXiv searches plus blog RSS form the raw material stream for the science ↔ essay domain bridge.

---

## Current State — July 2026

### Architecture (3 Layers)

```
Layer 1: DETERMINISTIC ENGINE (stable)
  caelus → activation_engine.ts → ActivationPacket → synthesis.ts
  Instant, always works, produces structured data with:
  - Top 3 transits sorted by orb with natal targets
  - Sky aspects separated from personal transits  
  - Year→Month→Day causal chain
  - Daimon-specific + general practice ranking
  - Yesterday comparison (+new/-dropped transits)
  - Planetary hours for daimon practice timing

Layer 2: LLM SYNTHESIS (behind "Generate Deep Analysis" button)
  llm-synthesis.ts + ficino-synthesis.ts → /api/chat → opencode.ai
  Two sequential passes:
  - Pass 1: Advanced Forecasting Guide interpretation
  - Pass 2: Ficinian Depth (reads Pass 1 + deterministic + raw data)
  Falls back to deterministic on failure.
  Requires: DEEPSEEK_API_KEY set as Cloudflare secret, OR user sets
  localStorage "deepseek_api_key" in browser (via Spells tab)

Layer 3: HERMES AGENT (spec exists, not implemented)
  agents/README.md — LangGraph on Cloudflare Workers
  Subgraphs: daimon, shadow, scheduler, life-review
  Durable Object per user, proactive cron insights
```

### Knowledge Graph Contents
- 421 herbs from Cunningham's Encyclopedia (335 with planetary associations, 311 with powers)
- 35 Picatrix operations (now with human-readable titles)
- PGM catalog spells
- 21 Valens pair rules + 84 al-Khayyāt house rules
- 7 planet profiles with qualities, activities, colors
- 12 signs, 4 elements, 3 modalities
- Standard correspondences (herbs, metals, colors, stones, incenses)

### Gold Standard Reference
`content/astrology/GOLD_STANDARD.md` contains the target quality level.
Key techniques demonstrated in the gold standard that we DON'T yet compute:
- Dispositorship chain (Mercury→Venus→Moon→Mercury feedback loop)
- Temperament diagnosis (melancholic-sanguine)
- Natal aspects with exact orbs (Sun trine Fortune 0°02')
- Year divided into phases/chapters with exact activation windows
- Electional windows with planetary hours
- Music prescriptions per planet
- Safe botanical table
- Seven-step ritual protocol
- Weekly planetary cadence
- Prospective validation log
- Natal configuration synthesis (not just planet-by-planet)

### Source Texts in content/astrology/
```
SOURCE_CATALOG.md                          — Index of all 50+ texts
GOLD_STANDARD.md                           — Target quality reference
ENGINE_SPEC.md                             — Quantitative engine spec
CUNNINGHAM_INTEGRATION_SPEC.md             — How to add more herb data
Advanced_Astrological_Forecasting_Guide.docx   — LLM prompt source
Ficinian_Astrology_Operating_System.docx       — Ficinian prompt source
Cunninghams_Encyclopedia_of_Magical_Herbs.md   — 421 herbs (19K lines)
ancientastrology (35K lines)                   — Demetra George
hellenistic_astrology (30K lines)              — Chris Brennan
daimon_astrology (27K lines)                   — Dorian Greenbaum
PTOLEMY_TETRABIBLOS.md                         — Ptolemy
firmicusmaternustheoryandpractice.md           — Firmicus Maternus
```

### Known Issues
1. **"Generate Deep Analysis" button** — works via `/api/chat` fallback when API key is set.
   Requires `localStorage.setItem("deepseek_api_key", "sk-...")` in browser console
   OR `DEEPSEEK_API_KEY` set as Cloudflare secret via `npx wrangler secret put DEEPSEEK_API_KEY`
2. **Day/night detection** — was inverted (fixed in commit 44004c6). Affected Lot formulas.
3. **Lot of Fortune/Spirit positions** — sensitive to <5' birth time precision. Engine matches gold standard within ~1° when same birth time used.
4. **Monthly profection theme** — was using year theme instead of month theme (fixed).
5. **`useState` inside JSX IIFE** — violated React Rules of Hooks, caused page crash (fixed).

### Next Layers (from ENGINE_SPEC.md)
1. **Dispositorship chain** — small engine change, big impact on reading quality
2. **Surface natal aspects with exact orbs** — data exists, not included in LLM prompt
3. **Year phases/chapters** — forward projection engine
4. **Electional windows** — planetary hour + date projection
5. **Music and botanical prescriptions** — content tables (Cunningham provides botanical data)
6. **Weekly cadence** — day-of-week planetary structure
7. **Prospective log** — D1 storage of daily snapshots for validation
