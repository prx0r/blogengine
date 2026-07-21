# LTX 2.3 on Vast.ai — Setup Plan

## Date: 2026-07-19

## Goal
Batch-render video clips using LTX 2.3 on Vast.ai cloud GPUs. Start instance, submit prompts, get video URLs back.

---

## Why Vast.ai (not Salad, not RunPod)

| | Salad | RunPod | Vast.ai |
|---|---|---|---|
| **RTX 3090** | $0.09/hr | $0.22/hr spot | $0.09/hr |
| **RTX 4090** | $0.17/hr | $0.34/hr spot | $0.29/hr |
| **Image size limit** | 35GB | No hard limit | No hard limit |
| **Public IP** | No (private DNS) | Optional | Yes (direct) |
| **SSH access** | No | Optional | Yes (built-in) |
| **Reliability** | Good | Good | Variable (marketplace) |
| **CLI/API** | Basic | Good | Good |

**Vast.ai is the same price as Salad but without the 35GB image limit.** You can bake the full 52GB model into the Docker image. No text encoder download at runtime. No 30-minute first-render penalty.

---

## LTX 2.3 Model Size

| Component | Size |
|-----------|------|
| Transformer (22B FP8) | ~25GB |
| Text encoder (Gemma 3 12B FP8) | ~24GB |
| Video VAE | ~1-2GB |
| Audio VAE | ~1-2GB |
| Vocoder | ~1-2GB |
| **Total** | **~52-55GB** |

Vast.ai instances have 50-200GB disk. The full model fits.

---

## Vast.ai Account

- **API Key:** Get from https://cloud.vast.ai/manage-keys/
- **Auth header:** `Authorization: Bearer $VAST_API_KEY`
- **CLI:** `pip install vastai` → `vastai set api-key <key>`
- **API base:** `https://console.vast.ai/api/v0/`

---

## Architecture

```
GitHub Actions → Build Docker → Push to GHCR
                                      ↓
Vast.ai CLI → Search offers → Create instance (pulls from GHCR)
                                      ↓
                              Onstart script starts uvicorn
                                      ↓
                              POST /render → Video URL back
                                      ↓
                              Destroy instance (stop paying)
```

No VPS proxy needed. Vast.ai instances have public IPs.

---

## Implementation Steps

### 1. Rewrite `worker/Dockerfile`

```dockerfile
FROM pytorch/pytorch:2.7.0-cuda12.8-cudnn9-runtime

RUN apt-get update && apt-get install -y \
    python3-pip ffmpeg git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Pre-download FULL model (~52GB)
# Vast.ai has no image size limit — bake everything
RUN python3 -c "
from huggingface_hub import snapshot_download
snapshot_download(
    'diffusers/LTX-2.3-Distilled-Diffusers',
    local_dir='/models/LTX-2.3-Distilled-Diffusers',
)
"

COPY app/ app/

ENV MODEL_PATH=/models/LTX-2.3-Distilled-Diffusers
ENV PYTHONUNBUFFERED=1
ENV WORKER_MODE=ltx
ENV HOSTNAME=::

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "::", "--port", "8000"]
```

### 2. Rewrite `worker/app/ltx_runner.py`

```python
import os, time, logging, torch
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)
_model = None

def _load_model():
    global _model
    if _model is not None:
        return _model

    from diffusers import LTX2Pipeline

    model_path = os.environ.get("MODEL_PATH", "/models/LTX-2.3-Distilled-Diffusers")
    logger.info(f"Loading LTX2 from {model_path}...")

    _model = LTX2Pipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)
    _model.enable_model_cpu_offload()
    _model.vae.enable_tiling()

    logger.info("LTX2 loaded successfully")
    return _model


def run_ltx_render(prompt, negative_prompt, seed, width, height, duration_sec, output_dir):
    output_path = Path(output_dir) / f"ltx_output_{int(time.time())}.mp4"
    width = (width // 32) * 32
    height = (height // 32) * 32

    pipe = _load_model()

    from diffusers.pipelines.ltx2.export_utils import encode_video
    from diffusers.pipelines.ltx2.utils import DEFAULT_NEGATIVE_PROMPT, DISTILLED_SIGMA_VALUES

    fps = 24
    num_frames = max(9, ((duration_sec * fps) // 8) * 8 + 1)  # Must be 8k+1

    gen = torch.Generator(device="cpu").manual_seed(seed) if seed else None

    logger.info(f"Generating {num_frames} frames at {width}x{height}...")
    with torch.inference_mode():
        video, audio = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt or DEFAULT_NEGATIVE_PROMPT,
            width=width, height=height,
            num_frames=num_frames, frame_rate=fps,
            num_inference_steps=8,
            sigmas=DISTILLED_SIGMA_VALUES,
            guidance_scale=1.0,
            output_type="np", return_dict=False,
            generator=gen,
        )

    encode_video(video[0], fps=fps, audio=audio[0].float().cpu(),
                 audio_sample_rate=pipe.vocoder.config.output_sampling_rate,
                 output_path=str(output_path))
    return str(output_path)
```

### 3. Update `worker/app/main.py`
- Port 8080 → 8000

### 4. Update `worker/requirements.txt`
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
httpx==0.28.0
diffusers>=0.33.0
transformers>=4.44.0
safetensors>=0.4.0
accelerate>=0.33.0
sentencepiece>=0.2.0
einops>=0.8.0
```

### 5. GitHub Actions workflow

**`.github/workflows/build-worker.yml`**
- Trigger on push to `worker/`
- Use `maximize-build-space` action (~60GB disk for 52GB image)
- Build Docker, push to GHCR

### 6. Vast.ai deployment script

**`deploy.sh`** — Search + create + wait + test
```bash
#!/bin/bash
set -e

IMAGE="ghcr.io/prx0r/ltsex-worker:latest"
DISK=80  # Need room for model + outputs

# Search for cheapest RTX 3090
OFFER_ID=$(vastai search offers \
  'gpu_name=RTX_3090 num_gpus=1 verified=true rentable=true disk_space>=80' \
  -o 'dph' --raw | jq -r '.offers[0].id')

echo "Best offer: $OFFER_ID"

# Create instance
RESULT=$(vastai create instance $OFFER_ID \
  --image $IMAGE \
  --disk $DISK \
  --ssh --direct \
  --onstart-cmd "cd /app && uvicorn app.main:app --host :: --port 8000" \
  --env "-p 8000:8000 -e WORKER_MODE=ltx -e HOSTNAME=::")

INSTANCE_ID=$(echo $RESULT | jq -r '.new_contract')
echo "Instance: $INSTANCE_ID"

# Wait for running
echo "Waiting for instance to boot..."
vastai show instance $INSTANCE_ID --wait

# Get public IP
IP=$(vastai show instance $INSTANCE_ID --raw | jq -r '.direct_ip')
echo "Instance running at $IP:8000"

# Test health
curl http://$IP:8000/health

echo "Ready! Submit renders to http://$IP:8000/render"
echo "Destroy with: vastai destroy instance $INSTANCE_ID"
```

### 7. Batch render script

**`batch_render.sh`** — Submit multiple prompts
```bash
#!/bin/bash
INSTANCE_IP=$1
BEARER_TOKEN="1311c3b0373e1d02c9ecd31cfd0999ba5ef5cb55"

PROMPTS=(
  "Golden tetrahedron rotating slowly in deep void, cinematic lighting"
  "Fractal geometric pattern expanding outward, sacred geometry"
  "Consciousness field visualization, energy waves emanating from center"
)

for i in "${!PROMPTS[@]}"; do
  PROMPT="${PROMPTS[$i]}"
  echo "Submitting render $((i+1)): ${PROMPT:0:50}..."

  curl -s -X POST http://$INSTANCE_IP:8000/render \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"job_id\": \"batch-$((i+1))\",
      \"generation_id\": \"gen-$((i+1))\",
      \"prompt\": \"$PROMPT\",
      \"width\": 768,
      \"height\": 512,
      \"duration_sec\": 5
    }" | jq .

  sleep 1
done

echo "All renders submitted. Poll /status/{job_id} for completion."
```

---

## Cost

- RTX 3090: $0.09/hr
- First render: ~1-2 min (model already baked, just load from local disk)
- Subsequent renders: ~2-5 min each
- One hour of GPU time: ~15-30 clips
- **No cold start penalty** — model is in the image, not downloaded at runtime

## Files to Modify

| File | Change |
|------|--------|
| `worker/Dockerfile` | Rewrite — bake full 52GB model |
| `worker/app/ltx_runner.py` | Rewrite — LTX2Pipeline, CPU offloading |
| `worker/app/main.py` | Port 8080 → 8000 |
| `worker/requirements.txt` | Update deps |
| `.github/workflows/build-worker.yml` | New — CI/CD build |
| `deploy.sh` | New — Vast.ai instance creation |
| `batch_render.sh` | New — batch prompt submission |
