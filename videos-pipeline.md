# Video Pipeline — Workflows

Data flow: Research Object → Market snapshot → Commission draft → Video Object → Upload → Analytics

---

## 1. Market Research — Scan YouTube for breakout vids

```bash
npm run video:commission -- --ro ro:<id> --market-only
```

What it does:
- Searches YouTube with 4–6 discovery queries derived from the Research Object
- Computes channel baselines (median of last 12 uploads)
- Flags breakout videos (≥3x baseline views or ≥4x baseline velocity)
- Saves `content/video-objects/<slug>/market.json`

Use to understand what's working in a topic space before writing.

---

## 2. Full Commission — Market + LLM Script

```bash
npm run video:commission -- --ro ro:<id> --slug <slug>
```

Pipeline:
1. Market snapshot (YouTube search + breakout detection)
2. LLM generates: 3 packaging candidates (title/thumbnail/hook), beat-by-beat script, shot descriptions
3. Compiler calculates word count, narration duration, exact beat/shot timestamps
4. Validates evidence refs, timeline contiguity, schema
5. Saves `market.json`, `commission-draft.json`, `video.json`

Flags:
- `--market-only` — stop after market snapshot
- `--draft path.json` — skip LLM, use your edited draft
- `--allow-placeholder-ro` — allow prototype from incomplete ROs
- `--wpm 145` — override reading rate
- `--no-query-planner` — use only manual `--query` values

---

## 3. Custom Draft — Human Override

```bash
npm run video:commission -- --ro ro:<id> \
  --draft content/video-objects/<slug>/commission-draft.json \
  --market-snapshot content/video-objects/<slug>/market.json
```

Skips the LLM call. Uses your hand-edited commission draft. Still compiles timing + validates.

---

## 4. Analytics Ingestion — Post-Upload

```bash
npm run video:analytics -- \
  --object content/video-objects/<slug>/video.json \
  --youtube-id VIDEO_ID \
  --start-date YYYY-MM-DD
```

- Pulls private retention data from YouTube Analytics (100 data points)
- Maps retention back to individual beats
- Updates `video.json` with what held vs lost viewers
- Feeds into the next commission as `own_channel_evidence`

---

## 5. OAuth Setup — One-time

```bash
npm run video:auth
```

Required before #4 works. Opens browser, approve YouTube Analytics scopes, save the refresh token.

---

## 6. Tests

```bash
npm run video:test
```

Deterministic tests: timing math, breakout detection, compiler, validator, timeline contiguity, evidence ref integrity.

---

## Object Layout

```
content/video-objects/<slug>/
├── market.json              YouTube evidence (public)
├── commission-draft.json    LLM or human creative judgment
└── video.json               Compiled canonical object
```

## Env Setup

Required:
```
YOUTUBE_API_KEY=             # Google Cloud → YouTube Data API v3
```

LLM (defaults to opencode.ai/zen/go/v1 → deepseek-v4-flash):
```
VIDEO_LLM_API_KEY=           # opencode token
```

Analytics (after upload):
```
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```
