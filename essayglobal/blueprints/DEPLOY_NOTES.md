# Deploy Notes — Lessons Learned the Hard Way

## Before Deploying

1. **Check credentials first.** The Cloudflare API token is in `cloudflare.md` at the project root. Read it before running any deploy command. Don't waste time searching for it.

2. **Add swap before building.** The `opennextjs-cloudflare build` step runs `next build` internally and will OOM-kill with only 4GB RAM. Always add swap first:
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   ```

3. **Pull before pushing.** Remote will have changes. Always:
   ```bash
   git pull origin main --rebase
   ```

4. **Never commit secrets.** The `.env*` pattern is in `.gitignore`, so `.env.local` won't be tracked. But double-check before `git add -A` if you've modified any env file. Use `git diff --cached --name-only` to verify staged files.

## Deploy Sequence

```bash
# 1. Generate glossary data
node scripts/generate-graph-json.mjs

# 2. Build Next.js (test separately)
next build

# 3. Build Cloudflare worker (needs swap!)
npx opennextjs-cloudflare build

# 4. Deploy to Cloudflare Pages (needs token from cloudflare.md)
export CLOUDFLARE_API_TOKEN="..."
npx wrangler pages deploy . --branch main
```

Or use the combined command (with swap active):
```bash
npm run cf:deploy
```

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Process killed with SIGTERM | OOM — no swap | Add 2GB swap |
| `CLOUDFLARE_API_TOKEN` missing | Didn't read cloudflare.md | Export token from there |
| Push rejected | Remote has changes | `git pull --rebase` |
| Books page not showing | .open-next/ build incomplete | Rebuild with swap |
