---
name: deploy
description: Build and deploy the site to Cloudflare, with automatic git commit before deploy
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [devops, deploy, cloudflare, git]
    requires_tools: [terminal]
---

# Deploy to Cloudflare

Builds the Next.js site and deploys to Cloudflare Pages + Workers. Automatically commits all changes to git before deploying.

## Workflow

```
1. git add -A
2. git commit -m "description of changes"
3. git push
4. npm run cf:build
5. npm run cf:deploy
6. Verify at https://re-rendering-atlas.tradesprior.workers.dev
```

## Procedure

### Phase 1: Commit to Git

```bash
cd /root/projects/blog
git add -A
git commit -m "deploy: {brief description of what changed}"
git push
```

Always commit before deploy. This ensures:
- The deployed code matches a git commit
- Rollback is possible by checking out the previous commit and deploying
- All changes are backed up

### Phase 2: Build

```bash
npm run cf:build
```

This runs:
1. `node scripts/generate-graph-json.mjs` — regenerates all glossary/concept/essay data from JSON files
2. `next build` — builds the Next.js site
3. `opennextjs-cloudflare build` — wraps the build for Cloudflare Workers

### Phase 3: Deploy

```bash
npm run cf:deploy
```

This runs:
1. The build step again (cf:build)
2. `opennextjs-cloudflare deploy` — deploys to Cloudflare Workers

### Phase 4: Verify

Check that the site loads:
- Main site: https://re-rendering-atlas.tradesprior.workers.dev
- Essays: https://re-rendering-atlas.tradesprior.workers.dev/essays
- Audio: check that any new essay's audio plays

## When to Deploy

- After adding a new essay JSON
- After changing content/glossary/ files
- After fixing a bug in the site code
- After the acquisition pipeline downloads new papers (deploy to make them visible)

## Pitfalls

- If `npm run cf:build` fails with TypeScript errors, run `npx tsc --noEmit` first to see the errors
- If `npm run cf:deploy` fails with auth errors, run `npx wrangler login` first
- The deploy takes ~2-3 minutes. Be patient.
- If the site doesn't update after deploy, hard-refresh the browser (Ctrl+Shift+R)
- D1 database changes require a separate `npx wrangler d1 execute atlas-db --remote --file=schema.sql`

## DISK SPACE: Local Build Fails (ENOSPC)

The VPS disk (38GB) is too small for the OpenNext bundle. The `copyTracedFiles` step copies the entire project including `library/` and `source-texts/` (2.4GB of reference PDFs) into the bundle, which exceeds available space.

**Workaround:** Move heavy dirs out, build, restore:
```bash
mv library /tmp/ && mv source-texts /tmp/ && npm run cf:deploy && mv /tmp/library ./ && mv /tmp/source-texts ./
```

**Better approach:** Use GitHub Actions. Push to main triggers `.github/workflows/cloudflare.yml` which builds on GitHub's servers. But this workflow has a remaining issue — the `pg` module needs to be installed for the build to succeed (API routes trace it).

## API Routes on GitHub Pages vs Cloudflare

- `/api/chat` and other server-side routes ONLY work on the Cloudflare Workers deploy
- GitHub Pages is a static export — API calls will fail silently
- The "Generate Deep Analysis" button on the birth chart page requires Cloudflare
- Recommended practices also require the knowledge graph (server-side)
- The Cloudflare deploy needs `CLOUDFLARE_API_TOKEN` as a GitHub secret (already set)

## Verification

- Build exits with code 0
- Deploy exits with code 0
- Site loads at the cloudflare URL
- New essays appear in the /essays listing
- Audio files play
