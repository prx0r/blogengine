---
name: audio
description: Generate TTS audio for an essay JSON file
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [essay, audio, tts]
---

# Generate Essay Audio

Generate TTS audio for an existing essay JSON.

## When to Use
- An essay JSON exists but has no audio file
- "Generate audio for {essay-id}"
- Audio regeneration is needed (voice model updated)

## Procedure

### 1. Check the Essay Exists
```bash
ls content/glossary/essays/<essay-id>.json
```

Read the JSON to confirm it has a `body` array with content.

### 2. Generate Audio
```bash
cd /root/projects/blog
node scripts/generate-audio.mjs <essay-id>
```

### 3. Verify
```bash
ls -la public/audio/<essay-id>.mp3
file public/audio/<essay-id>.mp3
```

The file should exist and be non-zero length. If it's empty or missing, retry.

### 4. Update the Essay JSON
Read `content/glossary/essays/<essay-id>.json` and add/update:
```json
"audioUrl": "/audio/<essay-id>.mp3",
"audioDuration": <duration-in-seconds>
```

### 5. Regenerate and Deploy
```bash
node scripts/generate-graph-json.mjs
npm run cf:build
npm run cf:deploy
```

## Pitfalls
- If Kokoro TTS runs out of memory, fall back to edge-tts
- If the essay is very long (> 30 min audio), split into parts
- Always verify the audio plays before deploying

## Verification
- Audio file exists and is playable
- Duration is reasonable for the essay length
- Essay JSON has audioUrl field
