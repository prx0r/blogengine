# To the Platinum Master — Final Session Summary

## What We Built This Session

1. **12-stage Worker pipeline** — all stages run, validate, and produce structured artifacts. ~3 min per run, ~$0.002.
2. **First video in R2** — smoke test proved the render chain: PIL code → ffmpeg → MP4 → R2 → Worker video endpoint.
3. **LLM-generated PIL code that compiles and runs** — 2820 chars of generated code executed cleanly, produced PNG output.
4. **Render task system** — create, claim (atomic), heartbeat, complete endpoints with Bearer auth.
5. **3/4 Platinum Master E2E tests passing** — job creation, creative stages, and media upload work. Task execution and completion are the remaining gap.

## The Two Remaining Problems

### Problem 1: Python urllib 403 on Bearer Auth

The claim, heartbeat, and complete endpoints require `Authorization: Bearer <token>`. Curl works fine:

```bash
curl -s -H "Authorization: Bearer dev-token" \
  "https://platinum-factory.tradesprior.workers.dev/render-tasks/claim"
# → returns task successfully
```

But Python urllib gets 403:

```python
req = urllib.request.Request(url, headers={
    "Authorization": "Bearer dev-token",
    "Accept": "application/json",
})
# → HTTP Error 403: Forbidden
```

The Worker's `checkAuth` function:
```javascript
function checkAuth(req) {
  const token = env.RENDER_WORKER_TOKEN || 'dev-token';
  const auth = req.headers.get('Authorization') || '';
  return auth === `Bearer ${token}`;
}
```

**Hypothesis:** Python urllib might be normalizing the header (lowercasing, stripping), or the Worker's `req.headers.get('Authorization')` might not find it if Python sends it differently. But the header string looks identical.

**Fix attempts:**
- Added `Accept: application/json` header — didn't help
- Tried `method="POST"` vs default GET — same 403
- Python `urllib` vs `requests` library — haven't tried requests

**Question:** Is this a known urllib quirk with Bearer tokens on Cloudflare Workers? Should we just have the VPS worker use `curl` subprocess instead of urllib for all API calls?

### Problem 2: Atomic Claim via D1

The claim endpoint needs to atomically select and claim the next pending task. Current implementation:

```javascript
// Find pending
const pending = await env.FACTORY_DB.prepare(
  "SELECT task_id FROM render_tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1"
).first();

// Claim it
const result = await env.FACTORY_DB.prepare(
  "UPDATE render_tasks SET status = 'claimed' WHERE task_id = ? AND status = 'pending'"
).bind(pending.task_id).run();
```

This works in isolation (curl) but the VPS worker's urllib 403 prevents it from ever reaching this code path. The claim race condition (two workers claiming the same task) isn't a real concern with a single VPS worker.

**Question:** Is D1's transactional behavior reliable enough for a two-step claim, or do we need a Durable Object for this? Our understanding is that D1 each query is atomic but there's no multi-query transaction without the D1 beta transactions API.

## What the System Actually Needs to Produce a Film

The creative pipeline works (9/9 stages). The assembly pipeline needs three things:

1. **Fix the VPS auth** (urllib 403) — switch to `curl` subprocess or `requests` library
2. **Fix the code_review prompt** — the LLM generates static image code, not animation frame sequences. The updated prompt was deployed but not tested due to the auth issue blocking the render task.
3. **Run the VPS worker persistently** — systemd service or cron job that polls the claim endpoint

Once those three things are in place, producing a 90-second film is just running `bash scripts/microfilm.sh slug-90s` with the VPS worker active.

## Our Open Questions

1. **urllib vs curl for VPS worker** — is `curl` subprocess acceptable for v1? It's less elegant but guaranteed to work. We'd build a simple wrapper that shells out to curl for Worker API calls.

2. **D1 claim atomicity** — is the two-step SELECT-then-UPDATE safe enough for a single VPS worker, or do we need a Durable Object for task coordination?

3. **Code review prompt** — the prompt now asks for animation code with frame sequences and ffmpeg assembly. But we haven't tested it because the VPS auth blocks task execution. Is there a simpler prompt pattern you'd recommend for getting animation code out of LLMs?

4. **The big picture** — we have 31 gold packs, a working creative pipeline, and proven PIL rendering. Should we stop building infrastructure and start hand-crafting a single gold-quality film using the factory for planning + manual PIL code for rendering? This would produce a reference output that sets the quality bar, rather than trying to get the LLM to generate production-quality animation code from scratch.

## Files for Reference

| File | What It Contains |
|------|-----------------|
| `factory/cloudflare/src/controller.js` | Worker — all 12 stages, render tasks, video serving (586 lines) |
| `scripts/vps-render-worker.py` | VPS worker — polls claim, runs PIL, uploads, reports (fails on auth) |
| `HANDOVER-COMPLETE.md` | Full handover doc — architecture, R2 access, all platinum feedback indexed |
| `factory/progress.md` | 11 bugs fixed this session with specifics |
| `factory/fixtures/pil-smoke/render_pack.py` | Known-good 3-shot deterministic render script |
| `scripts/microfilm.sh` | Run the microfilm benchmark (9 LLM stages + render task) |
