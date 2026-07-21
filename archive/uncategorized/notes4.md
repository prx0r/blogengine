# Recent Changes and Deployment Notes

Date: 2026-07-03

Repo: `prx0r/blogengine`
Live site: `https://prx0r.github.io/blogengine/`

## Summary

This pass fixed the GitHub Pages deployment path, added the Elemental Journal, documented the setup in `README.md`, and pushed the changes to `main`.

Pushed commits:

- `04044bb` - `add elemental journal and fix pages deploy`
- `da80477` - `document pages deployment and elemental journal`

## GitHub Pages Fix

Problem found:

- GitHub Pages was still configured as legacy Pages serving from `main` `/docs`.
- API response before the fix showed:
  - `"build_type": "legacy"`
  - `"status": "errored"`
  - `"source": { "branch": "main", "path": "/docs" }`
- The current app is no longer the old pure static essay export. It is now the Distillery app with API routes, middleware, and Postgres-backed helpers, so legacy `/docs` serving was the wrong deployment model.

Fix applied:

- Added `.github/workflows/pages.yml`.
- Switched Pages to Actions workflow deployment with:

```bash
gh api -X PUT repos/prx0r/blogengine/pages -f build_type=workflow
```

Expected Pages state now:

```json
{
  "build_type": "workflow",
  "html_url": "https://prx0r.github.io/blogengine/"
}
```

Verified after switching:

- `gh api repos/prx0r/blogengine/pages` returned `"build_type": "workflow"` and `"status": "built"`.
- Workflow `Deploy to GitHub Pages` succeeded for commit `04044bb`.
- The docs-only workflow for `da80477` initially failed at `actions/deploy-pages@v4` with `Deployment failed, try again later.`
- Rerunning the same workflow succeeded.

## Static Export Build

New script:

```bash
npm run build:pages
```

This runs `node scripts/build.mjs`.

Why the script exists:

- Next static export cannot include API routes, middleware, dynamic runtime entry pages, or DB-only code.
- The app has server-only pieces needed for the dynamic deployment, but GitHub Pages only needs a static shell/artifact.

During `build:pages`, `scripts/build.mjs` temporarily moves these paths into `.static-disabled-for-pages/`:

- `src/app/api`
- `src/app/entry`
- `src/lib/db.ts`
- `src/middleware.ts`

Then it:

- Runs `npx next build` with `GITHUB_PAGES=true` and `NEXT_PUBLIC_BASE_PATH=/blogengine`.
- Copies `out/` to `docs/`.
- Writes `docs/.nojekyll`.
- Restores all disabled paths in `finally`.

Important config:

- `next.config.ts` applies these only when `GITHUB_PAGES=true`:
  - `output: "export"`
  - `basePath: "/blogengine"`
  - `assetPrefix: "/blogengine/"`
  - `images.unoptimized: true`
- `.gitignore` now ignores:
  - `/docs/`
  - `/.static-disabled-for-pages/`
- `eslint.config.mjs` ignores generated/static folders:
  - `.next/**`
  - `out/**`
  - `docs/**`
  - `.static-disabled-for-pages/**`

Verification run locally:

```bash
npm run lint
npm run build:pages
```

Both passed after the fixes.

The generated static export contained these routes:

- `/`
- `/_not-found`
- `/elements`
- `/login`
- `/sources`
- `/personal/day-1` through `/personal/day-6`

Known static export limitation:

- The feed and sources pages still include client fetches to `/api/...`.
- On GitHub Pages those API routes do not exist.
- This means the static shell deploys, but dynamic feed/source data requires a server deployment with the API and database available.

## Public Asset Paths

Fixed `src/app/layout.tsx` so static metadata assets respect `NEXT_PUBLIC_BASE_PATH`.

Verified generated HTML includes:

```html
href="/blogengine/icon.svg"
href="/blogengine/manifest.json"
```

This avoids root-relative `/manifest.json` and `/icon.svg` paths breaking under `https://prx0r.github.io/blogengine/`.

## Elemental Journal

New route:

```text
/elements
```

Files changed:

- `src/app/elements/page.tsx`
- `src/components/sidebar.tsx`
- `src/app/page.tsx`

UI behavior:

- Mobile-style interface for Fire, Air, Water, and Earth.
- Uses Hermetic elemental symbols:
  - Fire: `🜂`
  - Air: `🜁`
  - Water: `🜄`
  - Earth: `🜃`
- Each element has:
  - Element profile
  - Balanced expressions
  - Excess expressions
  - Deficiency expressions
  - Reflection prompts
  - Flip-side note fields

Note fields:

- `+ Manifestations`
- `- Manifestations`
- `Psyche`
- `Life`

Storage:

- Browser `localStorage`
- Key:

```text
blogengine:element-notes:v1
```

Important limitation:

- There is no API persistence for elemental notes yet.
- Notes are browser/device-local.
- This was intentional so `/elements` remains compatible with GitHub Pages static export.

Navigation:

- Added `Elements` to the left sidebar.
- Added `Elements` to the feed page header nav.

## Lint Fixes

Lint initially failed because:

- Generated/temporary static folders were being scanned.
- React 19 lint rule `react-hooks/set-state-in-effect` flagged synchronous setState in effects.
- `src/app/login/page.tsx` imported `useRouter` but did not use it.

Fixes:

- Ignored `docs/**` and `.static-disabled-for-pages/**`.
- Removed unused `useRouter`.
- Deferred effect-loaded state updates with `window.setTimeout(..., 0)` in:
  - `src/app/page.tsx`
  - `src/app/sources/page.tsx`
  - `src/app/elements/page.tsx`

## Stash and Local Working Tree

Before rebasing onto the newer remote history, existing local uncommitted changes were stashed:

```bash
git stash push -u -m pre-rebase-local-changes
```

Those changes included:

- `package.json` local script additions
- `data/`
- `notes2.md`
- `scripts/generate-audio.mjs`

After pushing the deployment and README commits, `git stash pop stash@{0}` was run.

Result:

- `data/`, `notes2.md`, and `scripts/generate-audio.mjs` were restored as untracked files.
- `package.json` conflicted because upstream added `build:pages` while the stash added generation/audio scripts.
- Conflict markers were removed manually so `package.json` now keeps all relevant scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "generate": "node scripts/generate.mjs",
  "generate:audio": "node scripts/generate-audio.mjs",
  "build:pages": "node scripts/build.mjs"
}
```

The `package.json` conflict was marked resolved while keeping the restored local change uncommitted:

```bash
git add package.json
git restore --staged package.json
```

Current expected local status after that restore:

```text
 M package.json
?? data/
?? notes2.md
?? notes4.md
?? scripts/generate-audio.mjs
```

The stash may still exist if Git reported `The stash entry is kept in case you need it again.`

Check with:

```bash
git stash list
```

Only drop the stash once the restored local files are confirmed safe.

## Commands That Passed

Local:

```bash
npm run lint
npm run build:pages
```

GitHub:

```bash
gh run watch 28650645880 --repo prx0r/blogengine
```

The rerun of `28650645880` completed successfully.

## Commands Useful Next Time

Check Pages config:

```bash
gh api repos/prx0r/blogengine/pages
```

Switch Pages back to workflow deploy if it regresses:

```bash
gh api -X PUT repos/prx0r/blogengine/pages -f build_type=workflow
```

List recent deploy runs:

```bash
gh run list --repo prx0r/blogengine --limit 5
```

Rerun a transient failed deploy:

```bash
gh run rerun <run-id> --repo prx0r/blogengine
gh run watch <run-id> --repo prx0r/blogengine
```
