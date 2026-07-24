# Platinum Master — Session 4: Bridge Integration

## The Diagnosis

> "The reason you still have not made a real film: the integration test was invalid because job creation failed, the run script did not fail fast, and no actual task reached the renderer."

Both halves work independently (creative planning → artifacts, known-good code → MP4). The missing step is making one job move cleanly from the first half into the second.

## Architecture Verdict

**Keep** the current split: Worker (controller) + D1 (state) + R2 (artifacts) + VPS (executor). Do not call VPS directly over SSH.

**Remove** complexity that isn't proven yet: Workflows, Queues, mTLS, multi-worker, per-shot tasks. One task type (`assemble_film`) is enough for v1.

## Fixes Needed

### 1. Hardened Run Script
- `set -Eeuo pipefail`
- Require exact slug match on job creation
- Fail on any non-passing stage
- Use `jq` and `--arg`, not shell interpolation
- Verify job exists after creation

### 2. VPS Auth (urllib works fine)
```python
headers={
    "Authorization": f"Bearer {WORKER_TOKEN}",
    "Accept": "application/json",
}
```
The earlier 403 was likely a malformed header, not a urllib limitation.

### 3. One Assembly Task
Not separate TTS, clip render, concat, mux tasks. The VPS receives one manifest and produces:
- rendered clips
- narration audio
- concatenated MP4
- contact sheet
- motion strips
- output manifest

### 4. Microfilm Benchmark
100-180 words, 5-8 shots, 45-75 seconds. Run twice with fresh slugs.

## Required E2E Tests
1. Job creation (slug match, R2 artifact, D1 record)
2. Creative stages (9/9 pass, validators pass, artifacts exist)
3. Render dispatch (exactly one pending task, correct manifest)
4. Auth (no token=401, wrong token=401, correct=claim)
5. Task execution (pending→claimed→rendering→completed)
6. Media verification (MP4 decodes, correct resolution+duration, audio exists)
7. Job completion (stage passes, status=complete)
8. Failure path (intentional error→task failed→job blocked)
9. Retry (attempt 2 completes, job advances once)
10. Idempotency (duplicate callback is harmless)
