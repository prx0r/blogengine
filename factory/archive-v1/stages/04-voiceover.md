# Stage 4: Voiceover

**Script:** `04-generate-voiceover.mjs` (symlink → `scripts/generate-voiceover.mjs`)

## Purpose

Generate natural-sounding narration MP3s for each storyboard segment using Edge TTS.

## How It Works

- Female voice: `en-US-AriaNeural` (primary narrator)
- Male voice: `en-US-RyanNeural` (quotations, alternate voice)
- Splits narration by segment, generates one MP3 per segment
- Output: `content/publishing/voiceover/{slug}/seg-*.mp3`

## Usage

```bash
cd /root/projects/blog/factory

# Generate voiceover from storyboard
node 04-generate-voiceover.mjs --storyboard <name>

# With specific voice
node 04-generate-voiceover.mjs --storyboard <name> --voice female

# Generate for a single segment (quotes)
node 04-generate-voiceover.mjs --storyboard <name> --segments seg-03,seg-07
```

## Edge TTS Voices Available

- `en-US-AriaNeural` — warm, natural female (default)
- `en-US-RyanNeural` — calm, authoritative male (quote voice)
- `en-GB-SoniaNeural` — British female (alternate)
- `en-US-JennyNeural` — bright female

## Output Structure

```
content/publishing/voiceover/{slug}/
├── seg-01.mp3
├── seg-02.mp3
├── seg-03.mp3
└── ...
```

## What to Check

- Each segment has a corresponding MP3
- Audio length roughly matches the segment duration
- Proper nouns are pronounced correctly (Sanskrit terms may need manual check)
- Quotes are distinguishable from narration (different voice helps)
