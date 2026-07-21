# Distillery / Blogengine

Next.js app for the Distillery feed, personal diary pages, and the local Elemental Journal.

Live site: https://prx0r.github.io/blogengine/

## Development

```bash
npm install
npm run dev
```

The app uses server routes and Postgres-backed helpers for the live feed/source management flow. Local runtime data expects the relevant environment variables, especially `DATABASE_URL` when API routes touch the database.

## Pages Deployment

GitHub Pages is intentionally configured for **Actions workflow deployment**, not legacy `main/docs` serving.

Important files:

- `.github/workflows/pages.yml` builds and uploads the static artifact with `actions/deploy-pages`.
- `scripts/build.mjs` creates a GitHub Pages static export.
- `next.config.ts` applies `output: "export"`, `basePath: "/blogengine"`, and `assetPrefix: "/blogengine/"` only when `GITHUB_PAGES=true`.
- `.gitignore` ignores generated `docs/` because the workflow uploads it as an artifact.

The app has server-only pieces that cannot be exported directly: `src/app/api`, `src/app/entry`, `src/lib/db.ts`, and `src/middleware.ts`. During `npm run build:pages`, `scripts/build.mjs` temporarily moves those paths into `.static-disabled-for-pages/`, runs `next build`, copies `out/` to `docs/`, writes `.nojekyll`, and restores the moved files in `finally`.

Use this to verify the Pages build locally:

```bash
npm run lint
npm run build:pages
```

If GitHub Pages starts serving stale or errored content again, check:

```bash
gh api repos/prx0r/blogengine/pages
```

Expected shape:

```json
{
  "build_type": "workflow",
  "html_url": "https://prx0r.github.io/blogengine/"
}
```

If it says `"build_type": "legacy"` with `source.path` set to `/docs`, switch it back:

```bash
gh api -X PUT repos/prx0r/blogengine/pages -f build_type=workflow
```

## Elemental Journal

Route: `/elements`

The Elemental Journal is a client-side mobile-style tracker for Fire, Air, Water, and Earth. Each element includes:

- Hermetic elemental symbol
- Element profile
- Balanced, excess, and deficient manifestations
- Reflection prompts
- Flip-side notes for `+ Manifestations`, `- Manifestations`, `Psyche`, and `Life`

Notes are stored in the browser with `localStorage` under:

```text
blogengine:element-notes:v1
```

There is no API persistence for elemental notes yet. This keeps the page static-export compatible for GitHub Pages, but notes are device/browser-local.

## Current Static Export Limits

The GitHub Pages version exports the static pages that do not need the database-backed API at build time:

- `/`
- `/elements`
- `/login`
- `/sources`
- `/personal/day-1` through `/personal/day-6`

The feed and sources screens still contain client fetches to API routes for the dynamic app behavior. On GitHub Pages those API routes are not present, so the static shell loads but dynamic feed/source data requires a server deployment.
