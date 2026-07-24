# Cloudflare Workers AI — Models & Pricing Reference

Budget: 10,000 free neurons/day (~$0.011/1,000 neurons overage)

---

## Image Generation — For storyboarding, historical images, technical diagrams

| Model | Price (per 512x512 tile) | Quality | Use Case |
|-------|--------------------------|---------|----------|
| flux-1-schnell | $0.0000528/tile + $0.0001056/step | Good | Fast iteration, storyboard concepts |
| flux-2-dev | $0.00021/input tile/step | High | Production images, multi-reference |
| flux-2-klein-4b | $0.000059/input tile, $0.000287/output tile | Ultra fast | Real-time previews, high volume |
| flux-2-klein-9b | $0.015/MP (1024x1024) | Premium | Highest quality, typography |
| lucid-origin | $0.006996/tile | Best adherence | Art-directed, specific prompts |
| phoenix-1.0 | $0.005830/tile | Good text | Text rendering in images |
| dreamshaper-8-lcm | Free (Workers AI) | Good | Photorealism fine-tuned |
| stable-diffusion-xl-base-1.0 | Free | Good | Classic, reliable |
| stable-diffusion-xl-lightning | Free | Good | Fast steps |

## Video Generation — For motion sequences, animated diagrams

| Model | Price | Quality | Duration |
|-------|-------|---------|----------|
| hh1.1-t2v (Alibaba) | Third-party | Good | 3-15s, 720P/1080P |
| hh1.1-i2v (image→video) | Third-party | Good | Animate reference image |
| seedance-2.0 (ByteDance) | Third-party | High | With synced audio, up to 9 images |
| seedance-2.0-mini | Third-party | Good | Cheap, high-volume |
| veo-3.1 (Google) | Third-party | Premium | Best quality, audio support |
| hailuo-2.3 (MiniMax) | Third-party | High | Realistic human motion, cinematic |
| hailuo-2.3-fast | Third-party | Good | Lower latency |
| pixverse v6 | Third-party | Good | Up to 15s, audio support |

## Vision / Image Understanding — For storyboard QC, no-narration test

| Model | Price (per M input tokens) | Capabilities |
|-------|---------------------------|--------------|
| llama-3.2-11b-vision-instruct | $0.049 | Visual recognition, image reasoning |
| llama-4-scout-17b-16e-instruct | $0.270 | Native multimodal, text+image |
| gemma-4-26b-a4b-it | $0.100 | Vision + text, 128k context |
| mistral-small-3.1-24b-instruct | $0.351 | Vision understanding, 128k context |
| moondream3.1-9B-A2B | $0.300 | Fast visual reasoning, object detection |

## Text-to-Speech — For voiceover

| Model | Price | Quality | Notes |
|-------|-------|---------|-------|
| melotts | $0.0002/min | Good | INSANELY cheap, multi-lingual |
| aura-2-en | $0.030/1k chars | High | Context-aware, natural pacing |
| aura-1 | $0.015/1k chars | High | Original aura model |
| eleven-turbo-v2-5 | Third-party | Premium | 32 languages |
| inworld tts-2 | Third-party | Premium | Emotion control, 15 languages |
| gemini-3.1-flash-tts | Third-party | Good | Integrated with Gemini |

## Speech-to-Text — For narration processing

| Model | Price | Notes |
|-------|-------|-------|
| whisper | $0.0005/min | General purpose |
| whisper-large-v3-turbo | $0.0005/min | Faster, better accuracy |
| nova-3 (Deepgram) | $0.0052/min | Real-time capable |

## Embeddings — For similarity, plagiarism detection

| Model | Price (per M input tokens) | Dimensions |
|-------|---------------------------|------------|
| bge-small-en-v1.5 | $0.020 | 384 |
| bge-base-en-v1.5 | $0.067 | 768 |
| bge-m3 | $0.012 | Multi-lingual, multi-granularity |
| qwen3-embedding-0.6b | $0.012 | Newest, efficient |

## Budget Calculations (free tier: 10,000 neurons/day)

| Operation | Cost | Daily capacity |
|-----------|------|----------------|
| 1 flux-1-schnell image (512x512, 4 steps) | ~$0.0003 | ~33,000 images |
| 1 min melotts TTS | ~$0.0002 | ~50,000 minutes |
| skim bge-base (1M tokens) | $0.067 | ~150 passes |
| 1 llama-3.2-11b vision call (1K tokens) | ~$0.00005 | ~200,000 calls |

The free tier is extremely generous for our pipeline's needs.
