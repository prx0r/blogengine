# Deployment

## GitHub Pages (Static Export)

Pushing to `main` triggers the workflow at `.github/workflows/pages.yml`, which runs `scripts/build.mjs` and deploys the static export.

### Quick Deploy

```bash
git add -A
git commit -m "message"
git push origin main
```

### Manual Build (local verification)

```bash
npm run build:pages
```

This runs `node scripts/build.mjs`, which:

1. Temporarily moves server-only paths (`src/app/api`, `src/app/entry`, `src/lib/db.ts`, `src/middleware.ts`) into `.static-disabled-for-pages/`
2. Runs `next build` with `GITHUB_PAGES=true` (static export mode with `/blogengine` base path)
3. Copies `out/` → `docs/`
4. Writes `docs/.nojekyll`
5. Restores all server-only paths

### Check deploy status

```bash
gh run list --repo prx0r/blogengine --limit 5
gh run watch <run-id> --repo prx0r/blogengine
```

### Live site

https://prx0r.github.io/blogengine/
