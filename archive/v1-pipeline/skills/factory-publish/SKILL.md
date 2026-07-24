---
name: publish
description: TYPE B — Take an existing paper's text, format as JSON, generate audio, deploy. NO writing, NO commentary.
version: 1.0.0
author: Thomas Prior
metadata:
  hermes:
    tags: [publishing, paper, audio, deploy, type-b]
    requires_tools: [terminal]
---

# Publish Paper — Type B (Straight Publication)

**This is TYPE B.** Do NOT write anything. Do NOT add commentary. The paper is already written by its author. Your job is purely mechanical: format the existing text as JSON, generate audio of the paper's own words, and deploy.

If the user wants an original essay with your writing + source passages, use `/write-and-publish` (Type A) instead.

## What This Pipeline Does

```
Existing paper text → JSON with correct metadata → audio of paper's text → deploy to Cloudflare
```

That is ALL. No interpretation, no analysis, no framing, no commentary. The paper's text IS the content.

## Orientation

Read these before starting:
1. `/root/projects/blog/hermes/notes/targets.md` — paper inventory and metadata
2. `/root/projects/blog/hermes/notes/publication-notes.md` — pipeline tracking and known issues
3. `/root/projects/blog/hermes/notes/essayprocess.md` — JSON format specification
4. `/root/projects/blog/hermes/skills/devops/deploy-site/SKILL.md` — deploy instructions

## Procedure

### Step 1: Get the Paper

If the paper is already in the library (check `/root/projects/blog/content/works/` and `/root/projects/blog/library/`), use that.

If not:
```
python3 /root/projects/blog/hermes/skills/research/acquisition/scripts/acquisition.py acquire \
  --doi "DOI" --slug "SLUG" --corpus "CORPUS" \
  --authors "AUTHOR" --topics TOPICS
```

### Step 2: Extract Text from PDF

```bash
cd /root/projects/blog
pdftotext "library/{corpus}/{slug}.pdf" "/tmp/{slug}-extracted.txt"
wc -l "/tmp/{slug}-extracted.txt"
```

If text extraction yields almost nothing (e.g., scanned PDF returning only form-feed characters), skip this paper and note it in hermes/notes/publication-notes.md. Do NOT use OCR.

### Step 3: Create Publication JSON

Create the essay JSON at `/root/projects/blog/content/glossary/essays/{slug}.json`.

**Type B format — NO `ai` blocks, NO commentary, NO summary. Only the paper's own text.**

```json
{
  "id": "{slug}",
  "title": "Original Paper Title",
  "author": "Author Name",
  "type": "publication",
  "source_ids": ["{slug}"],
  "concepts": ["concept-1", "concept-2"],
  "prerequisites": [],
  "audioUrl": "/audio/{slug}.mp3",
  "body": [
    {
      "kind": "source",
      "text": "The paper's own words. Every block is kind: source. No ai, no summary."
    }
  ]
}
```

Rules:
- EVERY block must be `kind: "source"` — these are the author's own words
- NO `kind: "ai"` blocks — you are not commenting
- NO `kind: "summary"` blocks — you are not compressing
- The text is the paper's actual content, extracted verbatim
- Add the paper's DOI and metadata to the work JSON at `content/works/`
- Link to existing glossary concepts where appropriate

### Step 4: Generate Audio

```bash
cd /root/projects/blog
node scripts/generate-audio.mjs "{slug}"
```

Voice mapping:
- `source` blocks → `en-GB-RyanNeural` (male, British — paper's text read aloud)

Since every block is `kind: "source"`, the entire paper is read in the male voice. This is intentional — it's the author's text, not commentary.

### Step 5: Deploy

```bash
cd /root/projects/blog
git add -A
git commit -m "publish: {title}"
git push
npm run cf:build
npm run cf:deploy
```

### Step 6: Verify

Check the URL: `https://re-rendering-atlas.tradesprior.workers.dev/essay/{slug}`
Confirm audio plays.

## Verification Checklist

- [ ] Paper text extracted (pdftotext produced readable output)
- [ ] JSON created at content/glossary/essays/{slug}.json
- [ ] All body blocks are `kind: "source"` — NO ai, NO summary
- [ ] Audio generated at public/audio/{slug}.mp3
- [ ] Git committed and pushed
- [ ] Cloudflare deploy succeeded
- [ ] Essay loads at the live URL and audio plays

## Pitfalls

- This is TYPE B. Do NOT write anything. The paper is the content.
- If the user wants an original essay, tell them to use `/write-and-publish` instead
- If the PDF is a scan (no text layer), skip it — no OCR
- Audio generation uses `edge-tts`, not Kokoro (no OOM risk on 4GB RAM)
- The deploy takes ~90 seconds on this hardware
