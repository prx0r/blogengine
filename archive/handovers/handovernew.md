# Handover — Current State for Incoming Agent

> This is what's running, what's built, and what a fresh agent needs to know.

---

## Running Processes

| Process | Location | Status |
|---|---|---|
| Hermes Gateway | systemd user service (`hermes-gateway.service`) | ✅ Running |
| Telegram bot | Gateway → Telegram | ✅ Live |
| Tier 2 Acquisition | `scripts/cron-acquire.py` | ✅ Running (crontab supervised) |
| Scholar Expansion | `scripts/scholar-expansion.py` | ✅ Running (crontab supervised) |
| Cloudflare site | `re-rendering-atlas.tradesprior.workers.dev` | ✅ Live |

Both scripts are supervised by crontab — if either dies, it restarts within 1 minute:
```
* * * * * cd /root/projects/blog && (pgrep -f cron-acquire.py > /dev/null || python3 -u scripts/cron-acquire.py &) && (pgrep -f scholar-expansion.py > /dev/null || python3 -u scripts/scholar-expansion.py &)
```

## Acquisition Pipeline

**Script:** `/root/projects/blog/scripts/cron-acquire.py` — 83 queries (scholar names only, no topic filtering)
**Scholar expansion:** `scripts/scholar-expansion.py` — finds co-authors of known scholars, feeds into `scripts/acquisition-queries.txt`
**Log:** `/root/.hermes/cron/cron-acquire.log`
**Download budget:** `/root/.hermes/cron/oa-downloads-today.txt` (100/day max)
**OpenAlex API key:** `pCu5xinOa9gt0JarceKUzG`

**How acquisition works:**
1. Every cycle: citation chaining from a random seed paper (follows references)
2. Every 2nd cycle: search a random scholar from 83 queries (OpenAlex with `has_content.pdf:true` filter)
3. Every 3rd cycle: free sources (HAL/Zenodo) for unlimited downloads
4. OpenAlex download budget (100/day) used only for papers with `cited_by_count > 5`
5. Scholar expansion runs independently: picks random scholar, finds co-authors, adds new names

**Scholar map:** 83 scholars + 200+ indexed in `hermes/notes/scholar-map.md` across 8 tiers.
**Extended corpus:** 63 scholars saved at `hermes/notes/extended-corpus.md`.

## Content State

| Entity | Count | Location |
|---|---|---|
| Tier 2 works (commentaries) | 113 | `content/works/` |
| Total works | 130 | `content/works/` |
| Tier 1 (primary sources) | 71 | `content/works/` |
| Concepts | 76 | `content/glossary/concepts/` |
| Essays (published) | 70 (3 Type-B audio) | `content/glossary/essays/` |
| Art | 60 | `content/glossary/art/` |
| Authors | 2 | `content/authors/` |
| Research Objects | 5 (draft, placeholder passages) | `content/research-objects/` |
| Library PDFs | 62 | `library/` |
| Source texts (Anna's Archive) | 32 | `source-texts/` |

## Log Review — How to Check Health

### Check if acquisition is running
```bash
pgrep -af "cron-acquire\|scholar-expansion"
```
Should show 2 Python processes. If missing, crontab restarts within 60s.

### Check recent activity
```bash
# Last 20 log entries
tail -20 /root/.hermes/cron/cron-acquire.log

# Downloads used today
cat /root/.hermes/cron/oa-downloads-today.txt

# Recent work JSONs
ls -lt content/works/work_*.json | head -10

# Tier 2 count growth
grep -r '"tier": 2' content/works/ | wc -l
```

### Signs of healthy operation
- Log shows ✅ lines (successful downloads) with scholar names
- Download budget file shows 2-30 used per day (not 100 — free sources handle most)
- Recent work JSONs are about relevant topics (Ficino, Corbin, Iamblichus, theurgy, etc.)
- Scholar expansion log shows ➕ lines (new co-authors discovered)

### Signs of problems
- Log shows only CRASH or error messages → check script syntax
- No new work JSONs for 24+ hours → acquisition may be stuck
- Download budget shows 0 → budget file might not exist (crashed before creating)
- Off-topic papers appearing → scholar expansion found wrong co-authors (normal, self-corrects)

### What to do when stuck
```bash
# 1. Check if processes are alive
pgrep -af "cron-acquire"

# 2. If dead, start manually
cd /root/projects/blog && python3 scripts/cron-acquire.py &
python3 scripts/scholar-expansion.py &

# 3. Check log for errors
tail -50 /root/.hermes/cron/cron-acquire.log

# 4. If syntax error, fix and restart
python3 -c "import py_compile; py_compile.compile('scripts/cron-acquire.py', doraise=True)"

# 5. If completely broken, the crontab will restart within 60s
```

## Cloudflare Deploy Note

The Cloudflare deploy (`npm run cf:deploy`) requires library/ and source-texts/ to be moved out of the project first, because OpenNext's copyTracedFiles bundles the entire project including reference PDFs (2.4 GB) and the VPS disk can't hold both source and bundle simultaneously.

**Workaround:** `mv library /tmp/ && mv source-texts /tmp/ && npm run cf:deploy && mv /tmp/library ./ && mv /tmp/source-texts ./`

**Proper fix:** Add a GitHub Actions workflow for Cloudflare deploy (like the existing Pages workflow) so the build runs on GitHub's servers. Steps:
1. Add `CLOUDFLARE_API_TOKEN` as a GitHub Actions secret
2. Create `.github/workflows/cloudflare.yml` that runs `npm run cf:deploy` on push to main
3. The build will have plenty of space on GitHub's runners

## How to Proceed (Next Steps)

### Immediate
1. **Publish remaining Voss/Shaw Tier 2 works** — 36 works, ~3 done. Batch script at `scripts/batch-publish-tier2.sh`
2. **Monitor acquisition logs** — check daily for relevance and growth
3. **Fill empty concept definitions** — 52 concepts have no definition text. Needs manual filling.

### Short term
4. Extract real passages for the 5 Research Object skeletons (replace placeholder text)
5. Build impact detection: new works → check affected ROs → Telegram notification
6. Implement compile → test → refine loop (WiCER paper mechanism)

### Medium term
7. State machine for ROs (idea → draft → review → published → stale)
8. Knowledge PR workflow (git branch → Telegram review → merge → version bump)
9. Error Book for persistent corrections
10. Integrate astrology correspondences with glossary concepts

## Skills Available on Telegram

| Skill | Purpose |
|---|---|
| `/acquire` | Download + catalog papers |
| `/compile` | Create/update ROs from works |
| `/publish` | Type B: RO → essay + audio + deploy |
| `/explore` | Search all silos, surface gaps |
| `/synth` | Answer from internal sources with citations |
| `/navigate` | Show connections between entities |
| `/curate` | RO management (coverage, issues) |
| `/deploy` | Git → Cloudflare |
| `/write` | Type A essay with commentary |
| `/audio` | TTS for essay JSON |
| `/search` | OpenAlex/HAL/Zenodo search |
| `/daily-daimon` | Astrological insight |

## The One Rule

> **Every paragraph in every RO is `kind: "source"`. Hermes never writes original claims. It compiles, links, voices, deploys, and improves — but never creates.**
