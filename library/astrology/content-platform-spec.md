# Content Platform Spec — Distillery → Multi-Format Content Engine

## Current State Inventory

### What Already Exists

| Capability | Status | Tech |
|---|---|---|
| Essay JSON format (complete schema) | 1,795 essay JSONs exist | `content/glossary/essays/` |
| Type-A essay generation (original + commentary) | Scripted: `essayglobal/essaygen/` | Claude-generated, 7 algorithm iterations |
| Type-B essay generation (RO → essay + audio) | Pipeline defined | Hermes `/publish` skill |
| Audio generation (TTS via OpenAI) | Works: `scripts/generate-audio.mjs` | OpenAI TTS |
| Cloudflare Pages deployment | Live: workers.dev | OpenNext + Wrangler |
| YouTube-ready audio | 3 Type-B essays have audio files | WAV output |
| Research Object pipeline | 169 ROs, state machine designed | `content/research-objects/` |
| Automated paper acquisition | Cron running, 83+ scholar queries | `scripts/cron-acquire.py` |
| Telegram bot + Hermes agent | Live via systemd gateway | LangGraph + Telegram |
| Astrology engine (caelus) | Live on birth-chart page | 7-layer pipeline |
| Daimon contact system | /daimon page live | Name calc, phases, diary |
| Geometric teaching engine | Parser + policy graph built | `geometricengine/` |
| TetraHermes classifiers | Spec'd, not built | 50-state Mātṛkā classifier |
| Content taxonomy | concepts, works, sources, essays | `content/` |
| Video generation | NOT YET EXISTENT | — |
| YouTube Shorts | NOT YET EXISTENT | — |
| Cross-platform publishing | NOT YET EXISTENT | — |

### Source Material Available

| Category | Count | Location |
|---|---|---|
| Research Objects (ROs) | 169 | `content/research-objects/` |
| Essay JSONs | 1,795 | `content/glossary/essays/` |
| Tier 1 works (primary sources) | 71 | `content/works/` |
| Tier 2 works (commentaries) | 113 | `content/works/` |
| Concepts (glossary) | 76 | `content/glossary/concepts/` |
| Art/images | 60 + 430 emblems | `content/glossary/art/` + alchemy archive |
| Science papers | ~100 PDFs | `library/science/`, `science/` |
| Source texts (Anna's Archive) | 32 books | `source-texts/` |
| Channeled texts extracted | 80K lines | Law of One, Seth, Cassiopaean, PKD |
| Tradition sources | 12 traditions | `content/sources/` |
| Synthesis essays | 146 | `synthesis-essays/` |
| Root-level research docs | ~80 .md | root directory |
| UNO teaching blocks | 738 | `geometricengine/uno.txt` |
| Alchemical texts | 147 | alchemy archive |
| Audio files | 3 essays | audio output dir |
| Cloudflare Pages site | 27 routes | `src/app/` |

---

## Platform Design

### Layer 0: Content Foundation (Already Built)
The 169 ROs + 1,795 essays + 80 research docs are the **source of truth**. Everything downstream reads from this.

### Layer 1: Content Pipeline (Partly Built, Needs Wiring)

```
RO (versioned, source-tracked)
    │
    ├──→ Essay JSON (Type A: original + commentary, Type B: RO compilation)
    │       │
    │       ├──→ Audio (OpenAI TTS) → Podcast feed
    │       ├──→ Blog post (Cloudflare Pages) → Website
    │       └──→ Email newsletter (not yet)
    │
    ├──→ Long-form Essay (5,000-10,000 words)
    │       │
    │       ├──→ YouTube video (visual essay + audio)
    │       └──→ Substack / publication
    │
    ├──→ Short-form clips (from long-form)
    │       │
    │       ├──→ YouTube Shorts (≤60s)
    │       ├──→ TikTok (≤3min)
    │       └──→ Instagram Reels (≤90s)
    │
    └──→ Thread (Twitter/X, Bluesky)
```

### Layer 2: Content Types & Formats

#### 2.1 Essay → Audio → Podcast

**Pipeline:**
1. Select an RO or concept
2. Hermes compile step: RO passages → essay JSON
3. `generate-audio.mjs`: essay JSON → WAV via OpenAI TTS
4. Publish to site: `/essay/[slug]`
5. RSS feed for podcast distribution (Apple, Spotify, etc.)

**RSS Feed Spec:**
```xml
<!-- /audio/feed.xml or /api/podcast/rss -->
<rss xmlns:itunes="...">
  <channel>
    <title>Distillery Podcast</title>
    <itunes:author>...</itunes:author>
    <item>
      <title>Essay title</title>
      <enclosure url="https://site.com/audio/essay-slug.wav" type="audio/wav"/>
      <itunes:duration>...</itunes:duration>
      <itunes:summary>Essay description</itunes:summary>
    </item>
  </channel>
</rss>
```

**Production cadence:** 1-2 essays/week from RO pipeline.

#### 2.2 Long-form Essay → YouTube Video

**Script format (reuse existing essay JSON schema):**
- `title` → video title
- `sections[]` → video chapters
- `commentary` → narration script
- `source_quotes[]` → on-screen citations

**Visual approach options (ascending complexity):**

**Option A: Static Visual Essay (Day 1)**
- Background: art from `content/glossary/art/` + alchemy emblems
- Text overlays: key quotes, section headers
- Audio: TTS narration
- Tools: FFmpeg to composite images + audio into video
- Time to first video: ~hours

**Option B: Semi-Animated (Week 2)**
- Slide-based: each section = 1-3 slides
- Transitions between slides (zoom, pan via FFmpeg filters)
- Quote overlays fade in/out
- Background music (ambient, low volume)
- Tools: FFmpeg with `overlay`, `fade`, `drawtext`, `zoompan` filters

**Option C: Full Animated (Month 2+)**
- Manim or Motion Canvas for animated diagrams
- Tetrahedron geometry animations
- Map-of-content visualizations
- Tools: Manim (Python), Motion Canvas (TS), Remotion (React)

**Recommended build order:**
1. FFmpeg-based video builder script (Option A → B)
2. Template system for different content types (theory, practice, synthesis)
3. YouTube/Shorts export integration

#### 2.3 YouTube Shorts / TikTok / Reels

**Extraction method:**
From each long-form essay JSON:
1. Identify the most quotable sections (`highlight_quotes[]` or by keyword)
2. Extract 1-3 key passages (30-60s read time)
3. Generate visual: art + single quote + source citation
4. FFmpeg: vertical format (1080x1920), text overlay, fade in/out

**Short-form script spec:**
```json
{
  "source_essay": "essay-slug",
  "shorts": [
    {
      "id": "short-1",
      "quote": "The tetrahedron is not a metaphor...",
      "source": "tractatusfinalis.md §4",
      "duration_ms": 45000,
      "visual": "art/tetrahedron-gold.png",
      "transition": "fade"
    }
  ]
}
```

**Production cadence:** 3-5 shorts per essay → daily posting buffer.

#### 2.4 Social Threads (Twitter/X, Bluesky)

From each essay:
1. Extract 5-10 key claims
2. Each claim → 1 tweet (with source)
3. Thread preamble: essay title + link
4. Last tweet: CTA to full essay/site

**Automation:** Hermes `/write` skill → thread JSON → scheduled posting.

---

## Phase 0: The Video Builder (This Build)

### `scripts/build-video.mjs`

**Input:** An essay JSON from `content/glossary/essays/{slug}.json`

**Output:** MP4 video file at `public/videos/{slug}.mp4`

**Dependencies:** FFmpeg (already on system), Node.js

**Architecture:**

```
build-video.mjs
├── read essay JSON → extract sections, quotes, art references
├── for each section:
│   ├── generate TTS audio clip (section text)
│   ├── prepare visual frame (art image + text overlay as PNG)
│   ├── determine duration from audio length
│   └── concat frame + audio → section clip
├── concat all section clips → full video
├── add intro/outro cards
└── output MP4
```

**Minimal first version (same-day deliverable):**
1. Single art image as background
2. Essay title + author text overlay
3. Full TTS audio
4. Fade in/out at start/end
5. `ffmpeg -loop 1 -i art.png -i audio.wav -c:v libx264 -tune stillimage -shortest output.mp4`

**Next iteration:**
- Per-section art switching
- Quote card overlays
- Chapter markers
- Background ambient audio

### `scripts/build-short.mjs`

**Input:** Shorts manifest JSON (generated from essay)

**Output:** Vertical MP4 (1080x1920) at `public/shorts/{short-id}.mp4`

**Pipeline:**
```
for each short in manifest:
  1. Resize/crop art to 1080x1920 (center crop)
  2. Add quote text overlay (centered, large font)
  3. TTS audio for quote
  4. FFmpeg composite → short MP4
  5. Add channel watermark
```

---

## Phase 1: Publishing Pipeline

### Content Calendar Database

**New table:** `content/publishing/calendar.json`

```json
{
  "entries": [
    {
      "date": "2026-07-20",
      "type": "essay",
      "slug": "ficino-on-the-daimon",
      "platforms": ["site", "podcast", "twitter"],
      "status": "published",
      "video_slug": null,
      "shorts_generated": false
    }
  ]
}
```

### Platform Integration

| Platform | Posting Method | API |
|---|---|---|
| Cloudflare Pages | `npm run cf:deploy` | Wrangler |
| Podcast RSS | Static XML generation | Build-time |
| YouTube | YouTube Data API v3 | `googleapis` npm |
| Twitter/X | Twitter API v2 | `twitter-api-v2` |
| Bluesky | AT Protocol | `@atproto/api` |
| Substack | REST API + cross-post | Email digest |

### Publish Flow

```
hermes /publish {slug}
  │
  ├──→ [site]     essay page deployed to Cloudflare (already working)
  ├──→ [audio]    TTS generated, added to podcast RSS (already working)
  ├──→ [video]    build-video.mjs → MP4 → YouTube upload (new)
  ├──→ [shorts]   build-short.mjs → 3-5 clips → YouTube/TikTok (new)
  └──→ [social]   thread JSON → Twitter + Bluesky (new)
```

---

## Phase 2: Automation & Scaling

### Weekly Content Cadence

| Day | Output | Format |
|---|---|---|
| Monday | Long-form essay | Site + podcast + YouTube |
| Tuesday | Short #1 | YT Shorts + TikTok + Reels |
| Wednesday | Twitter/Bluesky thread | Text |
| Thursday | Short #2 | YT Shorts + TikTok + Reels |
| Friday | Short #3 | YT Shorts + TikTok + Reels |
| Saturday | Community post | Poll, question, discussion |
| Sunday | Newsletter digest | Substack + email |

### AI-Driven Content Selection

The Hermes agent can prioritize ROs for publication based on:

1. **Coverage score:** higher = more ready to publish
2. **Timeliness:** tie to current astrology (Oikodespotes, planetary hours)
3. **Theme:** daimon, Ficino, Corbin, tantra, science bridges
4. **RO state:** `published` or `review` → ready for output generation

### Auto-Generation Triggers

- RO reaches state `published` → auto-generate essay JSON + schedule video
- New paper acquired → check impact, propose update to affected ROs
- Weekly cron: generate 3 shorts from last week's essay
- Monthly cron: collect top essays → digest newsletter

---

## Phase 3: YouTube Studio Integration

### Video Format Spec

**Standard video (long-form):**
- Resolution: 1920x1080
- Aspect ratio: 16:9
- Duration: 8-25 minutes (essay-length)
- Chapters: from essay JSON `sections[]`
- Thumbnail: auto-generated from art + title text
- Description: essay summary + links to site + sources

**Short (vertical):**
- Resolution: 1080x1920
- Aspect ratio: 9:16
- Duration: 15-60 seconds
- Captions: burned-in from TTS
- Hashtags: auto-extracted from concept tags

### Thumbnail Generator

```js
// scripts/build-thumbnail.mjs
// Input: art image + title text
// Output: 1280x720 thumbnail PNG
// Composite: art background (blurred) + title text + logo
```

### YouTube API Upload

```js
// scripts/upload-youtube.mjs
import { google } from 'googleapis';

// OAuth2 flow: one-time auth, store refresh token
// Upload video with metadata:
//   title, description, tags, category, privacyStatus
// Set thumbnail
// Add to playlist
```

---

## Technical Implementation Plan

### Files to Create

| File | Purpose | Priority |
|---|---|---|
| `scripts/build-video.mjs` | Essay JSON → MP4 video | P0 |
| `scripts/build-short.mjs` | Shorts manifest → vertical MP4 | P0 |
| `scripts/build-thumbnail.mjs` | Art + title → thumbnail PNG | P1 |
| `scripts/upload-youtube.mjs` | MP4 → YouTube upload | P1 |
| `scripts/generate-shorts-manifest.mjs` | Essay JSON → shorts JSON | P1 |
| `scripts/publish-social.mjs` | Thread JSON → Twitter + Bluesky | P2 |
| `content/publishing/calendar.json` | Content calendar | P1 |
| `src/app/api/podcast/rss/route.ts` | Podcast RSS endpoint | P1 |
| `src/app/videos/page.tsx` | Video library page | P2 |
| `src/app/shorts/page.tsx` | Shorts gallery page | P2 |
| `hermes/skills/video/publish-video.md` | Hermes skill: publish video | P1 |
| `hermes/skills/social/publish-thread.md` | Hermes skill: publish thread | P2 |

### npm Dependencies to Add

```json
{
  "googleapis": "^...",           // YouTube Data API
  "twitter-api-v2": "^...",       // Twitter/X API
  "@atproto/api": "^..."          // Bluesky AT Protocol
}
```

### Environment Variables

```
# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...

# Social
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

BLUESKY_IDENTIFIER=...
BLUESKY_APP_PASSWORD=...
```

---

## What We Build Now (MVP)

### Phase 0a: Video Builder (Session 1)

1. **`scripts/build-video.mjs`** — minimal version
   - Read essay JSON
   - One background image + TTS audio → MP4
   - Title overlay
   - Output: `public/videos/{slug}.mp4`

2. **`scripts/build-short.mjs`** — minimal version
   - Read a shorts manifest
   - Vertical format, quote overlay
   - Output: `public/shorts/{short-id}.mp4`

### Phase 0b: Podcast Feed (Session 1)

3. **`src/app/api/podcast/rss/route.ts`** — RSS feed
   - Read all essays with audio
   - Generate iTunes-compatible RSS XML
   - Endpoint: `/api/podcast/rss`

### Phase 0c: Publishing Command (Session 2)

4. **`hermes/skills/video/publish-video.md`** — unified publish skill
   - Takes essay slug
   - Generates video + shorts + thumbnail
   - Updates content calendar

### Verification

```bash
# Test video build
node scripts/build-video.mjs --slug ficino-on-the-daimon
ls -la public/videos/ficino-on-the-daimon.mp4

# Test short build
node scripts/build-short.mjs --manifest content/publishing/shorts-manifest.json
ls -la public/shorts/

# Test podcast feed
curl http://localhost:3000/api/podcast/rss
```

---

## Content Strategy: What to Publish First

### Tier 1: Already-High-Quality Essays (Ready to Convert)
From the 1,795 existing essay JSONs:
- Ficino essays (self-contained, accessible): Ficino on daimon, spiritus, theurgy, melancholy
- Corbin essays: Mundus Imaginalis, Creative Imagination, Sophiology
- Iamblichus essays: Theurgy, daimon, epiphany
- Science bridge essays: Levin, first-person neuroscience, EEG/mantra studies

### Tier 2: Framework Documents (Need Adaptation)
From the 80 root-level .md research docs:
- `consciousness.md` → 5-minute intro video
- `why.md` → philosophical short
- `tractatusfinalis.md` → multi-part series
- `monument.md` → the convergence story
- Tetrahedron docs → animated explainers

### Tier 3: ROs → New Essays (Pipeline Output)
- `ro:ficino-daimon` → essay + video
- `ro:law-of-one` → multi-part series
- `ro:parzival-grail` → the Grail decoded
- `ro:proclus-elements` → Proclus for moderns

### Channel Structure

**Main channel:** 2-3 long-form essays/week
- Philosophy + mysticism decoded
- Science bridges
- Practice guides

**Shorts channel:** 1-2/day
- Key quotes
- Quick insights
- Visual tetrahedron moments

**Playlists:**
1. "The Tetrahedron — Complete Series"
2. "Ficino Decoded"
3. "Daimon Path"
4. "Science & Mysticism"
5. "The Grail Decoded"
6. "Practice Guides"

---

## Appendix: Existing Assets Ready for Video

### Art/Visuals Available
- 60 glossary art assets (`content/glossary/art/`)
- 430 alchemy emblems (from alchemywebsite.com) 
- 320 alchemical emblem images with metadata
- Astrology chart visualizations (birth chart page, already renders)
- Tetrahedron diagrams (from tetrahermes docs)
- TOL.png (Tree of Life diagram)

### Audio
- 3 Type-B essays have audio
- TTS pipeline working (`scripts/generate-audio.mjs`)
- OpenAI TTS: multiple voices available

### Narration
- Hermes can write narration scripts from ROs
- Existing essay JSON format has `commentary` field (narration-ready)
- Essay generation algorithms (v1-v7) in `essayglobal/essaygen/`

### Citations & Source Tracking
- Every RO paragraph is `kind: "source"` with provenance
- Works have full metadata + PDF paths
- Concepts link to essays + ROs + sources
- Error Book for corrections

---

## Open Questions

1. **TTS voice:** OpenAI has multiple voices. Which one for the channel? Need to test and pick one for brand consistency.

2. **Music:** Royalty-free background music for videos? Ambient/chill to match the contemplative tone.

3. **Channel identity:** Single channel (Distillery) or multiple channels by theme?

4. **Face vs faceless:** Narration with art only, or talking-head segments?

5. **Scripting:** Hermes writes the essay/narration. Should a human review before publish? How does the WiCER compile→test→refine loop apply to video scripts?

6. **Monetization:** Under 1K subscribers on YouTube? Strategy for growth first.

7. **Short-form platforms:** YouTube Shorts + TikTok + Instagram Reels — same content cross-posted, or platform-specific edits?

8. **Posting schedule:** Weekly (essay + audio) + daily (shorts). Sustainable with current pipeline?
