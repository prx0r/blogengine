# Light in Form — Video Object Pipeline

## Outcome

The pipeline compiles one durable `video.json` from Research Objects and a
time-stamped YouTube market snapshot:

```text
Research Objects
  + translated discovery lenses
  + YouTube breakout references
  + prior Light in Form retention
  -> commission draft (creative judgment)
  -> deterministic compiler (words, duration, beat/shot timings)
  -> Video Object
  -> upload
  -> private YouTube retention
  -> beat-level performance
```

The model is allowed to decide the title, thumbnail argument, hook, format,
beats, script, and visual intentions. It is not allowed to invent view data,
breakout ratios, script length, timestamps, or retention. Those fields are
computed by code.

## Object layout

```text
content/video-objects/<slug>/
  market.json
  commission-draft.json
  video.json
  thumbnail.png
```

`video.json` pins each input RO version and passage ID. This makes drift
detectable: if an RO changes, the film still records exactly what informed its
script.

## Live market logic

Before search, the commissioning model translates specialist RO language into
four to six distinct discovery lenses: literal, universal human question,
historical case, mechanism, adjacent audience, and misconception. This matters
for subjects such as *daimon*, where literal search results do not represent the
larger viewer interest. Add `--no-query-planner` to use only deterministic and
manually supplied queries.

For up to six adjacent queries, the YouTube Data API:

1. searches videos published in the last two years, ordered by view count;
2. hydrates title, thumbnail, duration, publish date, views, likes, and comments;
3. reads each channel's uploads playlist;
4. selects up to 12 prior long-form uploads as the channel baseline;
5. stores median total views and median lifetime views/day;
6. flags a reference when total views are at least 3x baseline or lifetime
   views/day are at least 4x baseline.

Both ratios remain visible. The flag is only a shortlist heuristic, not a
content score or a performance prediction. `market.json` preserves the retrieval
time because all public counts change.

Thumbnail URLs are stored for every reference. If a separate vision-capable
model is configured, it inspects up to eight images and records visible text,
focal subject, composition, contrast, and the apparent visual argument. Without
that configuration, the analysis status stays `not_analyzed`; the commissioning
prompt is forbidden from pretending it saw the image.

When prior Video Objects contain ingested private analytics, up to 12 recent
films are attached to the market snapshot. Their title, thumbnail argument,
hook, natural form, summary metrics, and beat-level retention become context for
the next commission. This closes the learning loop without collapsing the data
into an arbitrary content score.

## Script and storyboard timing

The script exists inside beats. The compiler joins those beats into the full
script, counts words, and estimates narration at 145 WPM by default:

```text
narration_seconds = word_count / reading_rate_wpm * 60
beat_duration = narration_seconds + explicit_pause_after
```

Shot weights divide each beat's measured duration, producing exact contiguous
start/end timestamps. When a real narration sample is available, replace 145
with Thomas's measured WPM using `--wpm`; no prompt changes are needed.

## Research Object gate

The current scholarly ROs are mostly `0.1.0` drafts whose body passages are
bracketed extraction placeholders. A full commission refuses to treat those as
evidence when no usable passage exists. Market research can still run, or an
explicit non-authoritative prototype can bypass the gate.

This is intentional: packaging can be speculative, scholarship cannot.

## Commands

Capture live breakout evidence without writing a script:

```bash
npm run video:commission -- \
  --ro ro:ficino-daimon \
  --query "hidden direction in life philosophy" \
  --query "Socrates inner voice" \
  --slug ficino-daimon \
  --market-only
```

The semantic query planner uses the commissioning model by default. For a
Data-API-only capture, pass `--no-query-planner` and supply strong `--query`
values yourself.

Compile the commission after the RO has real extracted passages:

```bash
npm run video:commission -- \
  --ro ro:ficino-daimon \
  --slug ficino-daimon \
  --market-snapshot content/video-objects/ficino-daimon/market.json \
  --mode canon \
  --wpm 145
```

For a deliberately rough prototype from placeholder ROs, add
`--allow-placeholder-ro`. The resulting warnings remain inside `video.json`.

To use a human-edited commission draft instead of calling the model:

```bash
npm run video:commission -- \
  --ro ro:ficino-daimon \
  --market-snapshot content/video-objects/ficino-daimon/market.json \
  --draft content/video-objects/ficino-daimon/commission-draft.json \
  --slug ficino-daimon
```

After upload, ingest the private channel analytics:

```bash
npm run video:analytics -- \
  --object content/video-objects/ficino-daimon/video.json \
  --youtube-id VIDEO_ID \
  --start-date 2026-08-01
```

Run the deterministic test suite:

```bash
npm run video:test
```

## Cloudflare free-tier alternative

Everything except YouTube Analytics can run on Cloudflare's free tier.

### LLM (replaces OpenAI)

Cloudflare Workers AI provides an OpenAI-compatible endpoint at no cost (10k neurons/day).

| Task | Recommended model | Cost |
|---|---|---|
| Query planning | `@cf/meta/llama-3.1-8b-instruct-fp8-fast` | Free |
| Commission drafting | `@cf/meta/llama-3.1-8b-instruct-fp8-fast` | Free |
| Thumbnail vision analysis | `@cf/meta/llama-3.2-11b-vision-instruct` | Free |

Set these in your environment:

```text
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN=your-api-token
```

The code auto-detects `CF_ACCOUNT_ID` and constructs the correct base URL, so you
can omit `VIDEO_LLM_BASE_URL`, `VIDEO_LLM_API_KEY`, and `VIDEO_LLM_MODEL` unless
you want to override.

### YouTube API caching (reduces quota by ~95%)

Deploy the worker at `workers/youtube-proxy.ts` to cache YouTube Data API responses
in KV. This dramatically cuts your Google API quota usage since repeated lookups
(of the same video ID during title iteration, for example) hit KV instead.

```bash
# Create KV namespace
npx wrangler kv:namespace create KV --config workers/youtube-wrangler.toml

# Set your YouTube API key as a secret
npx wrangler secret put YOUTUBE_API_KEY --config workers/youtube-wrangler.toml

# Update the namespace ID in youtube-wrangler.toml, then deploy
npx wrangler deploy --config workers/youtube-wrangler.toml
```

The worker caches responses for one hour. Set `YOUTUBE_API_KEY` to the deployed
worker URL instead of the Google API URL if you want to use the cache:

```text
# Optional: route YouTube calls through your Cloudflare Worker cache
YOUTUBE_API_KEY=skipped-when-using-proxy
YT_DATA_PROXY=https://youtube-proxy.your-subdomain.workers.dev
```

## Google Cloud setup

### Required APIs

Enable these in one Google Cloud project:

1. **YouTube Data API v3** — public search results, thumbnails, video statistics,
   channel statistics, and uploads playlists.
2. **YouTube Analytics API** — private performance and audience-retention data
   for the Light in Form channel.

The **YouTube Reporting API** is not required initially. It is for scheduled bulk
reports and becomes useful only when the channel has enough uploads to justify a
warehouse-style ingestion job.

The official Google Trends API is still limited-access alpha. It should be an
optional future signal, not a dependency. The initial system treats recent
YouTube search results and channel-relative breakouts as its live trend layer.

### Public discovery credential

Create an API key and restrict it to the YouTube Data API v3. Store it as:

```text
YOUTUBE_API_KEY=...
```

The script uses at most six search queries per run and stores the result so the
same snapshot can be reused during title and script iteration.

### Model credentials

The query planner and commission writer use the existing OpenAI-compatible
provider configured by `VIDEO_LLM_*`. These are not Google Cloud credentials.

Semantic thumbnail inspection is optional and deliberately separate. Configure
a vision-capable OpenAI-compatible model with:

```text
VIDEO_VISION_BASE_URL=...
VIDEO_VISION_API_KEY=...
VIDEO_VISION_MODEL=...
```

Google Cloud Vision is not required. Its generic labels and OCR are not the same
as understanding the title/thumbnail argument; a multimodal language model is
the more useful tool for this stage.

### Private analytics credential

1. Configure the OAuth consent screen. While the app is in testing, add the
   Google account that owns the YouTube channel as a test user.
2. Create an OAuth client of type **Desktop app**.
3. Store its client ID and client secret.
4. Run the local authorization helper:

```bash
GOOGLE_OAUTH_CLIENT_ID=... \
GOOGLE_OAUTH_CLIENT_SECRET=... \
npm run video:auth
```

Open the printed URL and approve the two read-only scopes. The helper prints a
refresh token once; store it in `~/.hermes/.env` rather than committing it:

```text
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REFRESH_TOKEN=...
```

The requested scopes are:

```text
https://www.googleapis.com/auth/youtube.readonly
https://www.googleapis.com/auth/yt-analytics.readonly
```

YouTube Analytics does not support ordinary service-account access to a channel,
so an OAuth user refresh token is required. Monetary scope is unnecessary until
revenue analysis is deliberately added.

If authorization runs on the VPS, forward port `53682` to the VPS or run the
helper on the local machine and copy only the refresh token into Hermes's secret
environment.

## What analytics can actually teach

The Analytics API supplies 100 equally spaced retention points for a video.
The ingester maps each point back to the compiled beat timestamps and stores:

- audience-watch ratio;
- relative retention versus YouTube videos of similar length;
- starts, stops, and segment impressions;
- average retention and retention delta per beat;
- video-level views, watch time, average view duration/percentage, engagement,
  and subscribers gained/lost.

This lets the system gradually learn whether hooks, rhetorical roles, concept
families, and visual strategies retain viewers. It does not claim causal proof;
each upload is an observation with many confounds. On the next commission,
those ingested observations are automatically included as private channel
evidence.

## Next integration boundary

The next code should read the compiled `production.storyboard` and resolve each
shot against the art glossary, diagrams, footage, and motion assets described in
`videos.md`. Rendering is deliberately downstream of commissioning: a weak idea
should be rejected before asset generation begins.
