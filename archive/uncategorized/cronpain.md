# cronpain.md — Acquisition Pipeline Postmortem

> Everything that went wrong, what we learned, and what actually works.

## Timeline

1. **Original cron-acquire.py** was cycling 20 scholars through HAL/Zenodo/DOAJ/OpenAlex/CORE
2. **OpenAlex** got hammered by `scholar-expansion.py` (running every 4s) → rate-limited permanently (IP + budget)
3. **DOAJ** had no PDFs → useless
4. **Scholar names as queries** → wrong person matches (chemist Anna Corrias, CERN physicist Michael J.B. Allen)
5. **Author-field search** → still matched wrong people on HAL (same name, different field)
6. **Topic search with AND-ification** → working but noisy (344 topics → nuclear physics, fashion, literature)
7. **Pruned to 141 topics** — better but still noisy
8. **CORE API** registered, added as source (10 req/60s window)
9. **State persistence** added via `cron-state.json` — survives restarts
10. **Cron auto-restart** via crontab every minute
11. **Hermes skill** `~/.hermes/skills/cron-acquire/SKILL.md` updated to v2.0.0:
    - OpenAlex out, Crossref + HAL + Zenodo + CORE in
    - All procedure steps rewritten
12. **Hermes `-z` / `chat -q`** — times out in non-interactive mode. Can't use Hermes from cron scripts reliably.

## What Works

| Source | Status | Notes |
|---|---|---|
| **HAL** (topic search) | ✅ Working | AND-ified queries. Some noise, some signal. French OA repo. |
| **Zenodo** (topic search) | ✅ Working | AND-ified queries. Noisier than HAL. CERN OA repo. |
| **CORE** (v3 API) | ✅ Working | 10 req/60s window. Key: `E9FJmcOGujhB0Ls78Tg14PHfyVKNDzSx`. Needs auth header. |
| **Crossref** | ✅ Working | 50 req/s, no key. Metadata only (no PDFs). |
| **State file** | ✅ Working | `/root/.hermes/cron/cron-state.json` tracks step counter. |

## What's Broken

| Source | Status | Notes |
|---|---|---|
| **OpenAlex** | ❌ Blocked | IP-blocked + $0 budget. Resets midnight UTC. Even free tier requires API key now. |
| **Semantic Scholar** | ❌ Blocked | IP-blocked from earlier hammering. |
| **DOAJ** | ❌ No PDFs | Only HTML links, no downloadable PDFs. |
| **CORE (free, no key)** | ❌ Redirect loop | Must use API key. |
| **Unpaywall** | ❌ Needs email key | Not registered. |
| **Scholar names as queries** | ❌ Wrong person | Same-name scientists dominate results. |

## Hermes CLI Issues

- `hermes -z "prompt"` — times out after 120s in non-interactive mode. No output returned.
- `hermes chat -q "prompt"` — also times out. Possibly needs TTY or interactive session.
- `hermes send --to telegram "message"` — works for sending notifications.
- **Conclusion**: Hermes cannot be used as a cron-able subprocess. Keep the crontab running raw Python scripts.

## Key Lessons

1. **Topic-only search is better than author search** — our scholars aren't on HAL/Zenodo, but papers ABOUT our topics are.
2. **AND-join all multi-word topics** — `urllib.parse.quote(" AND ".join(s.split()))` — prevents OR-matching that returns 34K results.
3. **No single source covers our domain** — need HAL + Zenodo + CORE at minimum.
4. **236 existing works already in `content/works/`** — most already have PDFs. Further acquisition is diminishing returns.
5. **The cron found ~5-10% relevant papers** — rest is noise. The 344-topic list was too broad.
6. **Pruned to 141 high-signal topics** — removed single generic words and broad phrases.

## Next Steps When OpenAlex Resets

- Remove the API key from URL (use free tier: 10 req/s without key)
- Or keep the key but cap at $0.50/day
- Use `title_and_abstract.search` filter (not plain `search`) for precision
- Scholar expansion is dead — don't run `scholar-expansion.py` again

## Files

| File | Purpose |
|---|---|
| `/root/projects/blog/scripts/cron-acquire.py` | Main cron script — 141 topics, 3 sources, 10s apart |
| `/root/.hermes/cron/cron-state.json` | Step counter, survives restarts |
| `/root/.hermes/cron/cron-acquire.log` | Full acquisition log |
| `/root/.hermes/skills/cron-acquire/SKILL.md` | Hermes skill (v2.0.0, no OpenAlex) |
| `/root/projects/blog/content/works/` | 236 work records |
| `/root/projects/blog/library/` | Downloaded PDFs |
