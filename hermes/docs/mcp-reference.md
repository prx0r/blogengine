# MCP Reference — Factory + Cloudflare Toolkit

## Overview

Four MCP servers are configured for Hermes. Together they provide tools for video production, Cloudflare documentation search, and video editing.

| Server | Transport | Tools | Auth | Purpose |
|--------|-----------|-------|------|---------|
| `factory` | stdio (python3) | 10 | None | Video production pipeline |
| `cloudflare-docs` | HTTPS (remote) | 4 | Public | Cloudflare documentation search |
| `cloudflare-api` | HTTPS (remote) | — | OAuth | Cloudflare API management |
| `fablecut` | stdio (node) | 7 | None | FableCut video editor |

---

## Factory MCP (10 Tools)

The factory MCP server runs as a local Python process. It wraps the existing factory scripts and API into Hermes-callable tools.

### Tool Reference

#### 1. `factory_clean_narration`
**What it does:** Strips markdown from an essay. Preserves the title text (converts `# Title` to `Title`). Removes blockquote markers, emphasis markers, and section separators. Returns an integrity report with sentence counts.

**When to use:** Before any video production. Every essay must be cleaned first.

**Input:** `essay_path` (string), `output_dir` (string)
**Output:** Integrity report with `source_sentences`, `spoken_sentences`, `sentence_match` (PASS/FAIL), `title_preserved`

**Example:**
```
call factory_clean_narration with:
  essay_path = "/root/projects/blog/scripts/expansion-essay46.md"
  output_dir = "/root/projects/blog/content/publishing/renders/my-project/v1/"
```

**Validation:** If `sentence_match` is FAIL, do not proceed. Find the missing sentence and re-run.

---

#### 2. `factory_split_shots`
**What it does:** Splits a cleaned narration script into timed shots for storyboard construction. Estimates each shot's duration from word count at 2.8 words/second. Returns total shot count, total duration, and a sample of the first 5 shots.

**When to use:** After clean_narration passes. Before building the storyboard.

**Input:** `output_dir` (string — must contain `narration_script.txt`)
**Output:** `shots` (count), `total_duration` (seconds), `shot_list` (sample)

**Note:** Durations are estimates. Generate actual audio with `factory_generate_voiceover` to get real durations.

---

#### 3. `factory_generate_voiceover`
**What it does:** Generates per-shot WAV files via Edge TTS (en-US-AriaNeural voice). Measures actual durations using FFprobe. Returns shot count, WAVs generated, total duration, and per-shot timing.

**When to use:** After split_shots. The durations from this tool are authoritative — storyboard shot durations should match these values.

**Input:** `output_dir` (string — must contain `narration_script.txt`)
**Output:** `shots` (count), `wavs_generated` (count), `total_duration_seconds`, `avg_duration`, `durations` (sample)

**Important:** Edge TTS saves as MP3 format despite `.wav` extension. FFprobe reads it correctly.

---

#### 4. `factory_search_scenes`
**What it does:** Searches 261 scene functions across 28 packs (renderer + visual-library) by concept keyword. Returns matching function names with relevance scores.

**When to use:** When designing the visual for a shot. Search for the concept before writing new render code.

**Input:** `concept` (string), `top_k` (number, default 5)
**Output:** Formatted text table with `Score`, `Function`, `Pack`, `Description`

**Example queries:**
- `"eye opening closing perception"` → `s_perception` (score 75%)
- `"wheel spokes hub"` → `s_wheel` (score 83%)
- `"light emergence radiance"` → `scene_light_darkness` (score 75%)

**Validation:** If score ≥50%, USE the existing function. Only write new code when nothing matches.

---

#### 5. `factory_render_scenes`
**What it does:** Renders scenes from a `storyboard.json` using the PIL engine. Creates frame sequences and MP4 clips.

**When to use:** After the storyboard is built and validated.

**Input:** `output_dir` (string — must contain `storyboard.json`), `fps` (number, default 6)
**Output:** `shots_rendered` (count), `total_duration_seconds`, `fps`, `resolution`, `output_dir`

---

#### 6. `factory_analyze_output`
**What it does:** Scores the rendered output against the platinum rubric. Generates `analysis_report.json` with a grade (BRONZE/SILVER/GOLD) and per-metric scores.

**When to use:** After rendering. The grade determines whether to iterate (BRONZE/SILVER) or publish (GOLD).

**Input:** `output_dir` (string)
**Output:** `grade` (BRONZE/SILVER/GOLD), `total_score`, per-metric notes

**Validation gates:**
- GOLD (≥85): publish
- SILVER (≥65): acceptable, may need minor polish
- BRONZE (<65): redesign and re-render

---

#### 7. `factory_register_job`
**What it does:** Registers a completed video in the factory worker API (D1 database). Sets status to `review` so it appears in the dashboard.

**When to use:** After the video passes analysis.

**Input:** `slug` (string), `mp4_key` (string), `duration` (number)

---

#### 8. `factory_create_job`
**What it does:** Creates a new production job in the factory worker API. Registers the essay and initial shot list in the D1 database.

**When to use:** Before starting a new video project.

**Input:** `slug` (string), `essay_id` (string), `title` (string), `channel` (string, default "Tantra Files")

---

#### 9. `factory_list_gold_files`
**What it does:** Lists gold animation packs from the uploads R2 bucket. Returns file names and sizes for all 12 packs.

**When to use:** When looking for reference animations or studying platinum-quality output.

**Input:** None
**Output:** List of gold files with names, sizes, and upload dates

**Current packs (12):** Amrtasiddhi, Khecarividya (3 variants), Iamblichus (3 variants), Kabbalah, Kalicakra, Laya Yoga, Matrika, Proclus

---

#### 10. `factory_export_to_r2`
**What it does:** Uploads a local file to the factory-assets R2 bucket using S3-compatible credentials.

**When to use:** After rendering, to make the video accessible via the factory worker API.

**Input:** `local_path` (string), `r2_key` (string)
**Output:** `uploaded` (boolean), `key` (string)

---

## Cloudflare MCP (4 Tools — Docs)

The Cloudflare documentation MCP server is public and requires no authentication.

### Tools

#### `mcp__cloudflare_docs__search_cloudflare_documentation`
Search Cloudflare docs via semantic query. Use when configuring Workers, D1, R2, KV, Queues, or other Cloudflare products.

**Example queries:**
- `"D1 database create table"` → returns SQL schema docs
- `"R2 bucket public access"` → returns bucket configuration docs
- `"Workers AI text generation"` → returns model usage docs

#### `mcp__cloudflare_docs__get_prompt`
Get a specific prompt by name. Used for agent setup templates.

#### `mcp__cloudflare_docs__list_prompts`
List all available prompts.

#### `mcp__cloudflare_docs__migrate_pages_to_workers_guide`
Guide for migrating Cloudflare Pages to Workers.

---

## FableCut MCP (7 Tools)

The FableCut MCP server provides video editor integration.

### Key Tools

| Tool | Purpose |
|------|---------|
| `fablecut_status` | Check server status, get editor URL |
| `fablecut_get_project` | Get the project timeline document |
| `fablecut_set_project` | Replace the full project JSON |
| `fablecut_patch_project` | Apply targeted edits without round-tripping |
| `fablecut_import_media` | Copy local media into library |
| `fablecut_analyze_reference` | Analyze a reference video into an EDIT BLUEPRINT |
| `fablecut_validate` | Validate timeline against blueprint/storyboard specs |

---

## Cloudflare API MCP (Requires OAuth)

The Cloudflare API MCP (`cloudflare-api`) requires OAuth authentication which needs a browser. It cannot be set up in a headless environment.

**To set up from an interactive terminal:**
```bash
hermes mcp remove cloudflare-api
hermes mcp add cloudflare-api --url https://mcp.cloudflare.com/mcp --auth oauth
# Follow the browser prompt to authenticate
```

When authenticated, it provides tools for managing Cloudflare resources directly:
- Workers (deploy, configure)
- R2 (buckets, objects)
- D1 (databases, queries)
- KV (namespaces, keys)
- DNS (zones, records)

Note: All Cloudflare operations we need (R2 uploads, D1 queries) are already available through the factory MCP tools which use our existing credentials.

---

## Typical Production Pipeline

```
1. factory_clean_narration    →  clean essay, verify integrity
2. factory_split_shots        →  estimate timing
3. factory_generate_voiceover →  real audio durations
4. factory_search_scenes      →  find existing functions per concept
5. Manual: build storyboard.json with motifs, continuity, timing
6. factory_render_scenes      →  render all shots
7. factory_analyze_output     →  score against platinum rubric
8. factory_export_to_r2       →  upload final MP4
9. factory_register_job       →  mark complete in dashboard
```

---

## Config Reference

MCP servers are defined in `/root/.hermes/config.yaml`:

```yaml
mcp_servers:
  factory:
    command: python3
    args:
      - /root/projects/blog/hermes/plugins/factory-mcp-server.py
    enabled: true
  cloudflare-docs:
    url: https://docs.mcp.cloudflare.com/mcp
    enabled: true
  fablecut:
    command: node
    args:
      - /root/projects/FableCut/mcp-server.js
    enabled: true
```

To add a new MCP server:
```bash
# stdio (local process)
hermes mcp add <name> --command <cmd> --args <arg1> <arg2>

# HTTP (remote URL)
hermes mcp add <name> --url <https://...>
```

---

## Troubleshooting

**Tool returns 403 Forbidden:** The factory worker API may be blocking Python's default User-Agent. The MCP server sets `User-Agent: Hermes-Factory-MCP/1.0` — if still failing, verify the API endpoint is accessible: `curl -s https://factory-worker.tradesprior.workers.dev/api/factory/jobs`

**MCP server won't connect:** Check the gateway log: `journalctl -u hermes-gateway -n 20 --output=cat`. The factory MCP server runs as a watchdog child process under the gateway.

**Tools not appearing:** Restart the gateway: `hermes gateway restart`. Wait 3 seconds, then check: `hermes mcp test <server-name>`.

**OAuth needed:** Cloudflare API MCP requires browser auth. Use from an interactive terminal, not headless. All necessary Cloudflare operations are handled by factory MCP tools instead.
