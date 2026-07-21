# Acquisition Run Notes — July 11, 2026

## Access Status Distribution (All Works)

| Status | Count | Meaning |
|---|---|---|
| `unknown` | 81 | Auto-cataloged from scholars/ — needs verification |
| `open` | 34 | PDF downloaded and validated |
| `paywalled_or_request_only` | 15 | No OA copy exists anywhere |
| `rights_check` | 1 | PDF exists but copyright unclear |

## Paywall vs 403 Distinction

Checked 14 paywalled DOIs with Unpaywall:
- **11 genuinely paywalled** — closed access, no OA copy exists, skip permanently
- **1 IP-blocked** (MDPI) — OA exists but VPS IP is blocked, flag for user-assisted download
- **2 uncertain** — API error or unclear status

### Genuinely Paywalled Publishers (Skip Future Runs)

These publishers consistently return no OA copy. No point re-checking:
- Brill (Proclus, Iamblichus, Plotinus) — all closed
- Taylor & Francis (Renaissance studies) — all closed
- Sage (Corbin papers) — all closed
- University of Chicago Press (Journal of Religion) — all closed
- Springer (book chapters) — all closed
- Equinox (Buddhist studies) — all closed

### IP-Blocked Publishers (Flag for User Download)

These have OA copies but the VPS is blocked at the IP level:
- MDPI (always, every time) — gold OA but Cloudflare blocks the VPS
- SciSpace — 403
- Some university repositories — 403

### Mixed (Some OA, Some Not)

- Cambridge University Press — some OA via green repository, some closed
- Oxford University Press — some OA, some closed
- JSTOR — mostly closed but some OA content

## Repeat Query Strategy

The cron script (`scripts/cron-acquire.sh`) picks random author+topic each run.
To avoid re-checking genuinely paywalled papers, the acquisition script should:

1. Before searching, check if DOI is already in content/works/ as paywalled
2. If yes, skip
3. If open, skip
4. Only attempt acquisition for unknown DOIs or new searches

This is already handled by the acquisition script's duplicate check.

## What Hermes Should Learn

1. MDPI = always IP-blocked → flag for user Telegram download
2. Brill/T&F/Sage/Springer = always paywalled → skip permanently
3. University repos = often OA but sometimes 403 → try alternative repos first
4. HAL, Zenodo, institutional repositories = best sources for OA
5. OpenAlex `locations[]` often has alternative repository URLs when the publisher URL is blocked

## Workflow for User-Assisted Download

When a paper is IP-blocked (403) but OA:
1. Hermes notes: `access_status: "ip_blocked"` instead of `paywalled`
2. Sends user Telegram message with direct PDF URL
3. User downloads on own device, sends PDF back
4. Hermes receives, validates, catalogs, and reclassifies to `access_status: "open"`
