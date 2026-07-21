# LTX API — ComfyUI Wrapper

**Base URL:** `http://198.53.64.194:35219`
**Local port:** 18288 / **External:** 35219
**Type:** ComfyUI API wrapper with built-in LTX 2.3 workflow

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/process` | Submit a render job |
| GET | `/result/{request_id}` | Check status & get result |
| POST | `/cancel/{request_id}` | Cancel a running job |
| GET | `/queue-info` | Check queue status |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger docs |

## Submit a Render

```json
POST /process
{
  "input": {
    "modifier": "Video Ltx2 3 T2v",
    "modifications": {
      "267:266": {"value": "Your prompt here"}
    }
  }
}
```

**modifier field** selects the built-in template:
- `"Video Ltx2 3 T2v"` — text-to-video
- Other modifiers may be available for image-to-video

**modifications** overrides specific node values in the ComfyUI workflow:
- `"267:266"` — the prompt node
- Other node IDs can be discovered via the workflow

## Default Workflow Settings

| Setting | Value |
|---------|-------|
| Resolution | 1280×720 |
| Duration | 5 sec (126 frames @ 25fps) |
| Model | `ltx-2.3-22b-dev-fp8.safetensors` with distilled LoRA |
| Prompt Enhancement | ON (Gemma 3 generates detailed prompt from input) |

## Quick Test

```bash
curl -X POST http://198.53.64.194:35219/process \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "modifier": "Video Ltx2 3 T2v",
      "modifications": {
        "267:266": {"value": "A golden tetrahedron rotating in space, cinematic lighting"}
      }
    }
  }'
```

## Check Result

```bash
curl http://198.53.64.194:35219/result/{request_id}
```

## Notes

- The API has prompt enhancement ON by default — Gemma 3 rewrites your prompt to be more detailed
- For our precise stop-motion/clay-texture prompts, this may need to be disabled or we need to account for it
- Duration is 5s default — we may need to find the node ID for duration override
- The API is on a remote server (198.53.64.194) — likely the user's vast.ai instance
