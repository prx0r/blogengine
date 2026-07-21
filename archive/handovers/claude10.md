# How to Deploy This Site to Cloudflare

## Prerequisites
Swap must be active (2GB+), otherwise the build gets OOM-killed.

```bash
# Enable swap once per session
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

## One-Command Deploy

```bash
# Token is in cloudflare.md at the project root
export CLOUDFLARE_API_TOKEN="<get-this-from-cloudflare.md>"

# This runs: generate graph data → next build → opennext build → opennext deploy
npm run cf:deploy
```

That's it. The deploy URL is printed at the end. If it times out, just run again — the build caches and the second run is faster.

## If Something Goes Wrong

1. **Token not found** — Read `cloudflare.md` in the project root
2. **Build killed** — Forgot to enable swap (check with `swapon --show`)
3. **Push rejected** — Run `git pull origin main --rebase` first
4. **Books tab not showing** — You deployed before adding swap and the build silently failed. Just run `npm run cf:deploy` again with swap active.
