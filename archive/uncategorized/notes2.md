# Blogengine Notes 2

Date: 2026-07-02

## Current Repo State

- Working directory: `/root/projects/blogengine`
- Repo: `github.com/prx0r/blogengine`
- Live site: `https://prx0r.github.io/blogengine/`
- Current local branch is aligned with `origin/main` before the audio experiment.
- Uncommitted changes currently present:
  - `package.json` modified with a new `generate:audio` npm script.
  - `scripts/generate-audio.mjs` added.
  - `data/tts-cache/af_heart-fff54b8979709f4b4641fd92e267f08bf0eb8c76.mp3` created as a partial cached TTS chunk.
- No final public essay audio file was produced.
- No `content/essays/*.json` metadata was updated by the failed audio run.

## Rendering Fix Already Completed

The Baudrillard essay page was fixed and deployed:

- URL checked: `https://prx0r.github.io/blogengine/essay/baudrillard-simulacra-1/`
- `audioUrl` was `null`, so no audio button appeared.
- Page now shows `Audio not generated yet.` when an essay has no audio.
- Essay body is no longer rendered as one raw HTML blob.
- Essay paragraphs are classified against the source text:
  - Source text: brighter `text-zinc-200`
  - Assistant/connective text: muted `text-zinc-500`
- For `baudrillard-simulacra-1`, classification result was:
  - 23 paragraphs total
  - 22 source paragraphs
  - 1 assistant/connective paragraph
- Deployed commits:
  - `b12897a fix essay source text rendering`
  - `200a91f deploy: update docs/`

## GitHub Pages Notes

GitHub Pages is configured as legacy Pages:

- Source: `main` branch, `/docs`
- Build type: `legacy`

The custom repo workflow regenerates `docs/` and pushes a deploy commit. GitHub's built-in Pages process then publishes from `main:/docs`.

Observed behavior:

- GitHub Pages can get stuck in `deployment_queued`.
- One deploy for `200a91f` stayed queued for about 7 minutes and failed with:
  - `Deployment failed, try again later.`
- Rerunning the failed Pages deployment succeeded.
- Latest successful deployment record seen:
  - Deployment ID: `5289213086`
  - Commit: `200a91f72e137850823bd02410c9c68620155e61`
  - State: `success`
  - Environment URL: `https://prx0r.github.io/blogengine/`
- The Pages status endpoint may still report stale `errored` even after a successful deploy. The actual deployment record and live HTML are more reliable.

## Audiator TTS Infra Findings

User asked to copy the self-hosted Kokoro infra from `/root/projects/audiator`.

Audiator's active TTS setup:

```env
VOICE_TTS_PROVIDER=kokoro
KOKORO_BASE_URL=http://127.0.0.1:8880
VOICE_TTS_VOICE=af_heart
CALLCALLUM_AUDIO_CACHE_DIR=./data/tts-cache
```

Audiator client shape:

```ts
POST ${KOKORO_BASE_URL}/v1/audio/speech
Content-Type: application/json

{
  "model": "kokoro",
  "input": "...",
  "voice": "af_heart",
  "response_format": "mp3"
}
```

Relevant Audiator files:

- `/root/projects/audiator/lib/voice/tts.ts`
- `/root/projects/audiator/lib/voice/types.ts`
- `/root/projects/audiator/scripts/prebuild-tts-cache.mjs`
- `/root/projects/audiator/scripts/benchmark-tts.mjs`
- `/root/projects/audiator/.env.local`

Important distinction:

- The "onyx" reference appears to be ONNX/sherpa tooling in Audiator, used for diarization/STT, not Kokoro TTS.
- Kokoro TTS is just the OpenAI-compatible HTTP endpoint above.

## Stale Kokoro Image Note

Existing docs in both Audiator and Blogengine reference:

```bash
docker run -d -p 8880:80 hwdsl2/kokoro
```

That image did not work:

```text
pull access denied for hwdsl2/kokoro, repository does not exist or may require 'docker login'
```

The replacement image that did pull and start:

```bash
docker run -d --name blogengine-kokoro -p 127.0.0.1:8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
```

It exposes the expected endpoint:

```text
POST http://127.0.0.1:8880/v1/audio/speech
```

The tiny test request returned:

```text
200 15404
```

## Kokoro Container Current State

Container name:

```text
blogengine-kokoro
```

Image:

```text
ghcr.io/remsky/kokoro-fastapi-cpu:latest
```

Current status after the attempted long essay generation:

```text
Exited (137)
```

Exit code `137` usually means the process was killed by the host, often due to memory pressure.

The container successfully started before that:

```text
Application startup complete.
Uvicorn running on http://0.0.0.0:8880
Model warmed up on cpu: kokoro_v1
Running on CPU
67 voice packs loaded
```

## Audio Generation Attempt

Goal:

Generate audio for:

```text
baudrillard-simulacra-1
```

Essay size:

- Body length: about 19,874 characters
- Paragraphs: 23

Added script:

```text
scripts/generate-audio.mjs
```

Added npm command:

```json
"generate:audio": "node scripts/generate-audio.mjs"
```

Intended usage:

```bash
npm run generate:audio -- baudrillard-simulacra-1
```

Script behavior:

- Reads `content/essays/{essayId}.json`
- Splits essay body into chunks
- Calls Kokoro for each chunk
- Caches chunk MP3s in `data/tts-cache`
- Concatenates chunks with `ffmpeg`
- Writes final MP3 to `public/audio/{essayId}.mp3`
- Sets `audioUrl` to `/audio/{essayId}.mp3`
- Rebuilds `public/essays-index.json`

The run started:

```text
Essay: The Deterrence of the Real: Simulation as the Final Strategy of Power
Kokoro: http://127.0.0.1:8880/v1/audio/speech
Voice: af_heart
Chunks: 32
1/32 generating (865 chars)
2/32 generating (720 chars)
```

Then Node failed with:

```text
TypeError: terminated
SocketError: other side closed
```

After that, Docker showed the Kokoro container had exited:

```text
blogengine-kokoro ghcr.io/remsky/kokoro-fastapi-cpu:latest Exited (137)
```

Only one cached chunk remains:

```text
data/tts-cache/af_heart-fff54b8979709f4b4641fd92e267f08bf0eb8c76.mp3 845228
```

## Why The Audio Attempt Failed

Likely causes:

- The CPU Kokoro container was killed during long synthesis.
- The essay chunks sent by the blog script were still too large for reliable CPU generation on this host.
- Kokoro FastAPI internally split the first request into multiple generated segments, so the outer "865 char" chunk still became a large job.

This was not a frontend or metadata problem.

## Recommended Next Audio Approach

Do not try to generate a full 20k-character essay in one long run on this CPU container.

Better path:

1. Use much smaller chunks:

```bash
TTS_CHUNK_CHARS=300 npm run generate:audio -- baudrillard-simulacra-1
```

2. Add retry logic around each Kokoro request before using the script seriously.

3. Consider restarting Kokoro between batches if memory keeps climbing.

4. Consider a hosted/GPU Kokoro endpoint for long essays.

5. Once audio succeeds:

```bash
npm run build
npm run build:pages
git add package.json scripts/generate-audio.mjs content/essays/baudrillard-simulacra-1.json public/essays-index.json public/audio/baudrillard-simulacra-1.mp3 docs
git commit -m "add audio for baudrillard essay"
git push
```

## Cleanup Options

If abandoning the current audio experiment, remove the uncommitted additions:

```bash
rm -rf data scripts/generate-audio.mjs
```

Then remove the `generate:audio` line from `package.json`.

If keeping the audio tooling, leave:

- `package.json`
- `scripts/generate-audio.mjs`

But decide whether `data/tts-cache` should be gitignored or deleted. It should probably not be committed.

## Useful Commands

Start Kokoro FastAPI:

```bash
docker run -d --name blogengine-kokoro -p 127.0.0.1:8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
```

Check Kokoro:

```bash
curl -s -o /tmp/kokoro-test.mp3 -w '%{http_code} %{size_download}\n' \
  -H 'Content-Type: application/json' \
  -d '{"model":"kokoro","input":"test","voice":"af_heart","response_format":"mp3"}' \
  http://127.0.0.1:8880/v1/audio/speech
```

Check container:

```bash
docker ps -a --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep kokoro
```

Logs:

```bash
docker logs --tail 120 blogengine-kokoro
```

Generate audio with smaller chunks:

```bash
TTS_CHUNK_CHARS=300 npm run generate:audio -- baudrillard-simulacra-1
```

Build static site:

```bash
npm run build
npm run build:pages
```
