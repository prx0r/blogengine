# Platinum Master — Session 4: Render Security & Smoke Test

## Critical: Rotate Exposed R2 Credentials

R2 access key and secret were hardcoded in the public commit. Now loaded from environment variables. The commit should be purged from Git history.

## The Render Worker Has 6 Serious Issues

1. **Reports success after failed render** — `subprocess.run()` loop doesn't check return codes. Must fail-closed.
2. **`code_review.json` is not a reliable executable** — renders from ad-hoc fields. Need a dedicated `render_pack.py` artifact with known R2 key and hash.
3. **Double-claim vulnerability** — SELECT then UPDATE is not atomic. Use conditional `UPDATE ... WHERE status = 'pending'`.
4. **No authentication on render endpoints** — anyone can claim/complete tasks. Add `Authorization: Bearer` check.
5. **No heartbeats during rendering** — `subprocess.run()` blocks for up to 600s. Use `Popen` + periodic heartbeat.
6. **Arbitrary generated Python runs unsandboxed** — LLM-generated code runs directly on the VPS. Needs container isolation.

## The Smoke Test

Before any LLM-generated code: create a known-good fixture, upload to R2, manually create a render task, verify the worker claims and executes it correctly.

## Priority Order

1. Rotate exposed R2 credentials ✅
2. Make render success fail-closed
3. Separate executable script from review JSON
4. Authenticate render-task endpoints
5. Sandbox generated Python
6. Run deterministic three-shot smoke test
7. Test failure, restart, double claim, and duplicate callback
8. Render one 60-90 second real PIL film
9. Implement shot-local repair
10. Generate one derivative Short
