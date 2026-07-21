# AGENTS.md — Project Context for Hermes

## Factory Pipeline — Primary Mission

This project is a content factory. Transform source material → Work JSON → Research Object → Essay → Storyboard → Video. Every stage has binary validation gates.

**Factory index:** `content/_factory-index.json`
**Pipeline queue:** `content/_pipeline-queue.json`
**Factory skill:** `hermes/skills/core/factory-pipeline/SKILL.md`
**Factory audit:** `scripts/factory-audit.py`
**Video pipeline skill:** `hermes/skills/video/publish-video-fablecut/SKILL.md`

**Cron:** `video-pipeline` every 6h — reads factory index, processes one stage, updates index.

**Priority order:** Tier 1 (tantra/kashmir/corbin) → 2 (alchemy/hermetic) → 3 (comparative) → 4 (scholarly) → 5 (literature)

Always read the factory index before starting any pipeline work. Always validate output before advancing.

## Site
- Base URL: `https://re-rendering-atlas.tradesprior.workers.dev`
- Dev URL: `http://localhost:3000`

## API Endpoints

### Astrology
- `POST /api/astrology/today` — Compute today's reading from birth data
- `GET /api/astrology/graph` — Traverse knowledge graph
- `POST /api/astrology/snapshot` — Save daily reading to D1
- `GET /api/astrology/snapshot?user_id=X&days=7` — Retrieve historical snapshots

### Journal
- `GET /api/journal` — List journal entries
- `POST /api/journal` — Create journal entry

### Chat
- `POST /api/chat` — LLM proxy to opencode API

## Telegram
- Bot is live (username set via @BotFather)
- Token: stored in `~/.hermes/.env` as `TELEGRAM_BOT_TOKEN`
- User ID: `8799078300` (in `TELEGRAM_ALLOWED_USERS` and `TELEGRAM_HOME_CHANNEL`)
- Gateway: running as systemd user service (`hermes-gateway.service`), survives logout
- Status: `hermes gateway status`
- Logs: `journalctl --user -u hermes-gateway -f`
- Skills available as slash commands in Telegram
- Cron deliveries go to user's DM

## Project Structure

```
hermes/
  AGENTS.md              ← this file — project context
  SOUL.md                ← daimonic companion personality
  skills/                ← all SKILL.md files (loaded as Telegram slash commands)
    publishing/          ← publish-paper (Type B), write-and-publish (Type A)
    research/            ← acquisition, academic-research, research-mapping
    devops/              ← deploy-site
    essay/               ← generate-audio, fetch-art
    daimon/              ← daily-reading, weekly-review
    practice/            ← recommend-practice, schedule-ritual
    analysis/            ← advanced-analysis
  notes/                 ← all documentation and specs
    handover.md          ← master orientation: core principles, architecture
    handover2.md         ← codebase context, bugs, roadmap
    handover0.md         ← research arm build session
    hermesspec1.md       ← integrated build specification
    researcharm.md       ← research pipeline with verified API capabilities
    targets.md           ← paper acquisition targets
    retrieval-guide.md   ← verified retrieval methods and best practices
    publication-notes.md ← pipeline tracking and session log
    essayprocess.md      ← essay JSON format specification
    hermes-architecture.md    ← API specs, plugin structure
    hermes-visionary-spec.md  ← daimonic agent vision
    futureresearch.md    ← product spec
    review.md            ← codebase audit
    acquisition-process-notes.md  ← what worked and what didn't
    essay-automation-loop.md     ← essay workflow
  docs/
    hermes-docs-full.txt ← full Hermes Agent documentation (66K lines)
  plugins/
    atlas-astrology/      ← Python plugin tools for site API
  goals/                  ← goal definitions
  blueprints/             ← cron blueprint definitions
```

## Skills Quick Reference

| Command | Type | Purpose |
|---|---|---|
| `/publish-paper` | Type B | Existing paper → JSON (all source blocks) → audio → deploy. NO writing. |
| `/write-and-publish` | Type A | Source passages → original essay with commentary → dual-voice audio → deploy. WITH writing. |
| `/acquisition` | Shared | Download papers from OpenAlex/HAL/Zenodo, create work JSONs |
| `/deploy-site` | Shared | Git commit → push → Cloudflare build → deploy |
| `/academic-research` | Shared | Multi-source research pipeline |
| `/generate-audio` | Shared | TTS for any essay JSON |

## Key Data

### User Birth Data
Thomas Prior — May 16, 1999, 14:37, Ascot, England (51.41°N, 0.67°W)

### Astrology Engine
- Deterministic: caelus → ActivationPacket → DailySphereReading
- 5 interpreters: al-Khayyāt, Valens, Ficino, Greenbaum, Demetra
- Knowledge graph with 457+ nodes, 528+ edges
- Spellbook with 30+ practices

## Essay Library
Essays live in `content/glossary/essays/` as JSON. Three books:
- Ficino — Platonic Theology
- Iamblichus — On the Mysteries
- Corbin — Alone with the Alone

Format: `{ id, title, author, book, audioUrl?, body: [{ type, text?, blocks? }], concepts[] }`

## Audio Generation
```bash
node scripts/generate-audio.mjs <essay-id>
```

Voice config: `source` → en-GB-RyanNeural (male), `ai` → en-US-AriaNeural (female), `summary` → en-US-AriaNeural (female)

## Deployment
```bash
npm run cf:build
npm run cf:deploy
```

## Skills Loading
Skills live in `/root/projects/blog/hermes/skills/`. The `skills.external_dirs` config in Hermes points to this directory. After editing a skill file, changes are picked up automatically. To force registration as Telegram slash commands, restart the gateway: `hermes gateway restart`

## Development Notes
- Hermes v0.18.2 installed at `/usr/local/lib/hermes-agent/`
- Config: `~/.hermes/config.yaml`
- Secrets: `~/.hermes/.env`
- Provider: opencode-go with deepseek-v4-flash
- Full Hermes docs: `/root/projects/blog/hermes/docs/hermes-docs-full.txt`
