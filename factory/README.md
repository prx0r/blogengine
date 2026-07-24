# Platinum Factory

**Start here: [MANUAL.md](MANUAL.md)** — full operating manual with glossary, architecture, stage definitions, what works, and quick start.

## Quick Links

| What | Where |
|------|-------|
| Operating Manual | `factory/MANUAL.md` |
| Controller (local) | `factory/controllers/platinum_controller.py` |
| Cloudflare Worker | `factory/cloudflare/src/controller.js` (deployed) |
| MCP Server | `factory/cloudflare/src/mcp-server.py` (11 tools) |
| Database Schema | `factory/cloudflare/db/schema.sql` |
| Canonical Template | `factory/template/` |
| Gold Pack Registry | `factory/registry/gold-pack-registry.json` |
| Stage Definitions | `factory/stages.json` |
| Creative Process | `factory/process/THE-PLATINUM-PROCESS.md` |
| Architecture Specs | `factory/spec/` |

## Quick Start

```bash
# Create a job
python3 factory/controllers/platinum_controller.py new \
  --slug my-essay \
  --essay scripts/expansion-essay33.md \
  --output content/publishing/renders/my-essay/v1

# Advance through stages
python3 factory/controllers/platinum_controller.py advance --slug my-essay
```

Or connect any MCP-compatible LLM (ChatGPT, Claude) to `factory/cloudflare/src/mcp-server.py` for 11 factory tools.
