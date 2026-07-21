# Process Guide — Continuing the Work

## For the Next LLM Agent

Read `handover.md`, `HOW_IT_WORKS.md`, and `formattingrequirements.md` first. This guide assumes you've read those.

---

## What Exists vs What Needs Building

### ✅ Already Working

- **Astrology engine**: caelus → ActivationPacket → 5 interpreters → practice recommendations. Client-side in `src/astrology/`. Deterministic.
- **65 essays with audio**: In `content/glossary/essays/`. JSON format with body blocks. Audio in `public/audio/`.
- **3 books** (Ficino, Iamblichus, Corbin): In `content/glossary/books/`. Essays linked from book JSONs.
- **Spellbook**: 13 entries in `src/astrology/spellbook/spellbook.ts`. Trigger-based matching.
- **Correspondences**: ~250 entries in `src/astrology/spellbook/correspondences.ts`. Covers herbs, metals, colours, stones, incenses, animals, days, numbers, archangels, body parts, musical notes, senses, divine names, spirits. Cross-referenced to planets.
- **Glossary concepts**: 75 entries in `content/glossary/concepts/`. Cross-linked to essays and art.
- **Art library**: 60 entries in `content/glossary/art/`. 55 with images, 5 missing.
- **Atlas graph**: 17-phase transformation path in `src/atlas/graph/`. Full schema with phases, assumptions, risks, correctives, practices, source cards, traditions.
- **Molts studio**: Video generation pipeline on Cloudflare Workers. LTX-2 + ViMax character continuity. Deployed at `molts-v2.tradesprior.workers.dev`.
- **Website**: Cloudflare Workers + D1 + R2. Deployed at `re-rendering-atlas.tradesprior.workers.dev`.

### 🚧 Partially Built

- **Hermes Agent**: Not installed. Needs a VPS, SOUL.md, AGENTS.md, and Telegram gateway.
- **UNO/HXRMXS dialogues**: 73 syntheses in the sanskritree repo (`syntheses/`). Not loaded into the site's knowledge graph.
- **Practice extraction**: PGM, Agrippa, Arbatel, Dee texts sit at `content/glossary/sources/books/` and `blueprints/source_texts/`. Not yet parsed into the SpellEntry format.

### ❌ Not Started / Abandoned

- **Lean/sanskritree integration**: Dropped. No value for essays, astrology, or concepts.
- **Truthcore DB as separate system**: Dropped. HXRMXS JSONs already serve this purpose.
- **UNO LoRA training**: Dropped. Too much work. Structured pedagogy can be a prompt.

---

## How to Wire Hermes Up

### Step 1: Install Hermes on a VPS

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup --portal  # OAuth + Tool Gateway in one command
```

Requires a $5-10/month VPS (Hetzner, DigitalOcean) or Modal (serverless).

### Step 2: Write SOUL.md

Create `~/.hermes/SOUL.md` with the daimonic personality. The primal substrate text at `content/mythos/primal-substrate.md` is the mythos. The standardized vocabulary from `content/source/path-of-re-rendering.md` defines the terms.

Key elements: tone (warm, precise, numinous), style (compact, sourced, no flattery), what to avoid (new age language, certainty where there isn't any).

### Step 3: Write AGENTS.md

Create `~/.hermes/AGENTS.md` with:

- The site's API endpoints (astrology, essays, journal)
- Paths to spellbook and correspondences
- How audio generation works (edge-tts)
- The atlas graph structure
- How to format essays (see `formattingrequirements.md`)

### Step 4: Set Up Telegram Gateway

```bash
hermes gateway install
# Configure TELEGRAM_BOT_TOKEN in .env
hermes gateway start
```

### Step 5: Write the Daily Daimon Skill

A skill file at `~/.hermes/skills/daily-daimon/SKILL.md` that:

1. Calls the site's astrology API for today's ActivationPacket
2. Identifies the most active planet
3. Looks up correspondences for that planet
4. Selects a relevant practice from the spellbook
5. Chooses an essay recommendation
6. Writes a 3-paragraph Telegram message

### Step 6: Set Up Cron

```bash
hermes cron create "0 7 * * *" --skill daily-daimon --deliver telegram \
  "Today's daimonic reading with practices and essay recommendation."
```

---

## How to Continue Extraction Work

### Correspondence Extraction (the next LLM's job)

The Skinner file at `stephenskinnerworking` (81K lines) contains 777 tables but the OCR is messy. The existing correspondence entries are standard planetary correspondences sourced from memory (Agrippa, 777, Picatrix). To add more:

1. Use Hermes or direct API calls to the LLM with the Skinner file sections
2. Extract in the existing `CorrespondenceEntry` format
3. Add to `correspondences.ts` before the closing `];`
4. Run `npx tsc --noEmit src/astrology/spellbook/correspondences.ts` to validate

**Priority targets**: Kabbalistic sephirah correspondences, angelic hierarchies, Tarot card associations, Dee's Enochian tablets.

### Practice Extraction

The source texts at `content/glossary/sources/books/` need parsing into `SpellEntry` format (defined in `EXTRACTION_SPEC.md`):

- `pgm.txt` (1.2MB) — 100+ spells. Extract purpose, materials, incantation.
- `arbatel.txt` — 7 Olympic spirits. Clean format, easiest win.
- `loagaeth.txt`, `dee5.txt` — Enochian material. For later.
- `agrippa-books1-2.txt` (970K) — Correspondence tables in prose. Already partially extracted.

Add entries to `spellbook.ts`. Run `npx tsx src/astrology/spellbook/validate.ts` to check format.

### Essay Writing Workflow

The existing 65 essays were created manually or through the blueprint conversion script. To write new ones:

1. Read the source material from `blueprints/source_texts/` or `essayglobal/blueprints/`
2. Format as essay JSON in `content/glossary/essays/` with body blocks
3. Run `node scripts/generate-graph-json.mjs` to regenerate data
4. Run `node scripts/generate-audio.mjs <essay-id>` for audio
5. Build and deploy

---

## Future Expansions

### Structured Pathways (Abramelin, Tantra, etc.)

Practices from other traditions (Abramelin operation, tantric sādhanā, Buddhist deity yoga) won't be in Skinner or the Western correspondence tables. They need their own extraction:

- **Tantric practices**: Source texts in GRETIL and the sanskritree syntheses. Extract as `SpellEntry` with tradition tags.
- **Abramelin**: The Holy Guardian Angel operation. Extract as a multi-step ritual with timing requirements.
- **Buddhist practices**: From the existing meditation pages and sanskritree syntheses. Tag by tradition.

Each needs the same format: `SpellEntry` with procedure steps, timing, materials, safety, and tradition tag. The astrology engine already recommends practices by planet — adding tradition tags lets it also recommend by interest.

### 17-Phase Path Mapping

Each essay maps to a phase of the Path of Re-Rendering (see `content/source/path-of-re-rendering.md`):

- Ficino essays → Phase 11 (body-energy) and Phase 12 (ritual)
- Corbin essays → Phase 10 (imaginal)
- Iamblichus essays → Phase 12 (ritual/theurgy)
- Dependent arising → Phase 6
- Madhyamaka → Phase 7

Add a `phase` field to each essay JSON. The atlas graph already has the phase structure. Hermes can then recommend essays by "where are you working right now?"

### Video Pipeline

The long-term pipeline: essay JSON + audio → Remotion composition → talking head from molts studio avatar → background art from glossary → YouTube upload → analytics → better essays.

Short-term: wire an existing essay + audio into the molts studio API for a 5-minute proof of concept.

### Diary + Pattern Discovery

Store diary entries in D1 via `/api/journal`. Hermes cron tags each entry with the day's ActivationPacket. After 30 days, answer: "When Mercury is active, your average mood is 4.2. When Saturn is active, 2.8."

---

## What NOT to Do

- **Don't build a separate Truthcore DB** — the HXRMXS JSONs already serve this purpose
- **Don't train a LoRA** — too much work for unclear benefit
- **Don't integrate Lean** — no value for essays, astrology, or concepts
- **Don't try to parse Skinner with regex** — it's messy OCR; use LLM extraction or write entries from known correspondences
- **Don't overengineer** — the simplest thing that works is: install Hermes, write SOUL.md, write one cron

---

## Where to Find Things

| What | Where |
|---|---|
| Astrology engine | `src/astrology/` |
| Essays | `content/glossary/essays/` |
| Books/albums | `content/glossary/books/` |
| Glossary concepts | `content/glossary/concepts/` |
| Art | `content/glossary/art/` |
| Spellbook | `src/astrology/spellbook/` |
| Correspondences | `src/astrology/spellbook/correspondences.ts` |
| Atlas graph | `src/atlas/graph/` |
| Source texts | `blueprints/source_texts/`, `content/glossary/sources/books/` |
| Blueprint essays | `essayglobal/blueprints/` |
| Audio generation | `scripts/generate-audio.mjs` |
| Build/deploy | `npm run cf:build`, `npm run cf:deploy` |
| Hermes docs | `https://hermes-agent.nousresearch.com/docs/` |
| Sanskitree repo | `/root/sanskritree/` |
| Molts studio | `https://github.com/prx0r/molts.live` |
