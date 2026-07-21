# Storage Audit — 2026-07-12

## Overview

| Filesystem | Size | Used | Avail | Use% |
|---|---|---|---|---|
| `/dev/sda1` | 38G | 36G | 307M | 100% |

**Critically low.** Immediate cleanup recommended.

---

## Top-Level Projects (/root/projects)

| Project | Size | Notes |
|---|---|---|
| **blog** | 12G | Current project |
| enochian | 2.1G | Separate project w/ 1.8G node_modules |
| CX-Train | 1.3G | Previous project |
| ltx-style-lab | 682M | |
| audiator | 664M | |
| 33sermons | 601M | |
| blogengine | 507M | |
| win11React | 109M | |
| hermes | 15M | |
| itsm-service-desk-platform | 416K | |

---

## Blog Project Breakdown

### Build artifacts (fully reclaimable)

| Path | Size | Notes |
|---|---|---|
| `.open-next/` | **2.9G** | Cloudflare build output — ~2.2G in server-functions, 677M assets |
| `.next/` | **2.3G** | Next.js build cache — ~2.2G standalone, 106M server, 16M static |
| **Total reclaimable** | **5.2G** | Regenerates on next `npm run build` |

### node_modules

| Path | Size |
|---|---|
| `blog/node_modules/` | **1.2G** |
| `CX-Train/node_modules/` | **689M** |
| `CX-Train/blog/node_modules/` | **329M** (nested blog inside CX-Train) |

Largest packages in blog/node_modules:
- `next/` + `@next/` — 298M
- `@cloudflare/` — 124M
- `@letta-ai/` — 44M

### Content assets

| Path | Size | Notes |
|---|---|---|
| `library/` | **1.7G** | PDFs and papers, mostly unique research content |
| `public/audio/` | **692M** | 17 audio files (10–40M each) |
| `public/art/` | **74M** | |
| `source-texts/` | **207M** | Source texts by author |
| `scholars/` | **118M** | Scholar PDFs |
| `content/` | **67M** | |

### Root-level large files

| File | Size |
|---|---|
| Suhrawardi PDF (philosophy of illumination) | 17M |
| Suhrawardi PDF (Book of Radiance) | 7.4M |
| hellenistic_astrology | 1.6M |
| daimon_astrology | 1.6M |
| ancientastrology | 1.4M |

---

## Other Reclaimable Space

### Docker (3.0G total images)

| Image | Size | Status |
|---|---|---|
| coolify-realtime | 998M | Active (Coolify) |
| coolify | 615M | Active |
| coolify-helper | 581M | Active |
| postgres:15-alpine | 417M | Active |
| traefik:v3.6 | 245M | Active |
| redis:7-alpine | 58M | Active |
| sentinel | 48M | Active |
| **Reclaimable** | **569M** | Docker images unused |

### Cache directories

| Path | Size |
|---|---|
| `/root/.cache/` | 642M |
| `/root/.npm/` | 180M |
| `/tmp/` | 1.1G (includes 498M ocrmypdf temp, various PDFs, audio) |

---

## Recommendations

### Immediate (can reclaim ~5.5G+)

| Action | Estimated reclaim | Risk |
|---|---|---|
| `rm -rf .open-next/` | **2.9G** | Low — regenerates on build |
| `rm -rf .next/` | **2.3G** | Low — regenerates on build |
| `rm -rf CX-Train/node_modules` | **689M** | Low — not needed if project is done |
| `rm -rf CX-Train/blog/node_modules` | **329M** | Low — duplicate of blog project? |
| `rm -rf /tmp/*` | **1.1G** | Low — temp files |
| `docker image prune -a` | **569M** | Medium — removes unused Docker images |
| `rm -rf /root/.cache` | **642M** | Low — caches will regenerate |

### If more space needed

| Action | Estimated reclaim | Risk |
|---|---|---|
| Delete `library/` PDFs selectively | **1.7G** | High — irreplaceable research content |
| Delete `public/audio/` | **692M** | Medium — re-downloadable |
| `rm -rf enochian/node_modules enochian/.next` | **~2G** | Low — separate project |
| `rm -rf blogengine/node_modules audiator/node_modules 33sermons/node_modules` | **~1.5G** | Medium — other inactive projects |

---

## Quick Wins (copy-paste)

```bash
# 1. Delete build artifacts (5.2G)
rm -rf /root/projects/blog/.open-next /root/projects/blog/.next

# 2. Delete CX-Train node_modules (1G)
rm -rf /root/projects/CX-Train/node_modules /root/projects/CX-Train/blog/node_modules

# 3. Clean temp files (1.1G)
rm -rf /tmp/*

# 4. Clean caches (822M)
rm -rf /root/.cache
npm cache clean --force

# 5. Prune Docker images (569M)
docker image prune -a -f
```

**Total from quick wins: ~8.7G**
