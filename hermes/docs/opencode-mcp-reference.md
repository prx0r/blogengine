## MCP Syntax
Tools mcp__[server]__[tool].
Example: `mcp__factory__factory_produce_video with essay_path="..." slug="test"`

## Factory MCP — Architecture

The Factory MCP is the core of the video production pipeline. **One MCP call** can turn an essay into a complete Zeus-scored video, uploaded and registered in the dashboard.

### How It Replaces FableCut

FableCut is a GUI video editor (React + Remotion). The old pipeline was:

```
Essay → voiceover → FableCut project → manual editing → export → upload
```

The Factory MCP bypasses FableCut entirely by generating PIL-based render scripts. Instead of a GUI timeline, it writes Python code that draws frames with PIL, assembles them with ffmpeg, and muxes with audio. This means:

- **No human-in-the-loop editing** — the render script is generated deterministically
- **No GPU needed** — PIL renders on CPU at 6fps (draft) or 10-24fps (final)
- **No project files** — the render script IS the project file (version-controlled, reproducible)
- **No 261-function limit** — the render can call any existing scene function or generate new ones inline

The pipeline goes: essay → narration → shots → voiceover → storyboard.json → render_*.py → frames → MP4 clips → final.mp4. Every step is deterministic code, not a GUI action.

### How MCP Protocol Works

The MCP server is a long-running Python process that communicates via JSON-RPC 2.0 over stdin/stdout:

```
[Client] --stdin--> {"jsonrpc":"2.0","method":"tools/call","params":{"name":"factory_produce_video","arguments":{...}},"id":1}
[Client] <--stdout-- {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"{...}"}]}}
```

1. **Discovery**: Client sends `tools/list` → server returns all 6 tool definitions with input schemas
2. **Call**: Client sends `tools/call` with tool name + arguments → server executes and returns result
3. **Initialization**: Lifecycle starts with `initialize` handshake, server announces capabilities
4. **Lifecycle**: Server stays alive between calls — state persists in process memory

Hermes runs this as a child process (`python3 /root/projects/blog/hermes/plugins/factory-mcp-server.py`). The gateway pipes stdin/stdout and handles JSON-RPC framing. Each tool call is <2s for individual tools, ~5-15 min for the full pipeline (bottleneck: Edge TTS generating 50+ WAVs sequentially).

### 6 Tools

| Tool | What It Does | Called By |
|------|-------------|-----------|
| `factory_produce_video` | Full 9-step pipeline — essay → Zeus-scored MP4 | Agent for full production |
| `factory_search_scenes` | Search 261 scene functions by concept keyword | Agent during visual design |
| `factory_list_gold_files` | List gold animation packs from R2 bucket | Agent for reference |
| `factory_clean_narration` | Strip markdown + integrity check | Agent or pipeline |
| `factory_create_job` | Create D1 record in factory API | Agent or pipeline |
| `factory_register_job` | Mark job as "review" in factory API | Agent or pipeline |

### Cloudflare Integration

Yes — the MCP directly interacts with Cloudflare at 3 points:

1. **Edge TTS** (network call to Azure's edge speech API) — generates voiceover audio
2. **R2 upload** (via boto3 S3-compatible API) — stores final.mp4 in `factory-assets` bucket
3. **Factory Worker API** (HTTPS to `factory-worker.tradesprior.workers.dev`) — registers jobs and queries gold files

The Cloudflare API MCP (`cloudflare-api`) is NOT used — it requires OAuth browser auth. The factory MCP uses its own hardcoded credentials (R2 S3 keys, factory worker URL) to bypass this limitation.

### Integration with Visual Corpus

Yes — the MEP searches the visual corpus but does NOT automatically use it for rendering:

1. **`factory_search_scenes`** shells out to `search-scenes.py` which reads `scene-index.json` (60 indexed functions across 8 packs) and searches the full 261-function library
2. **Current render loop** ignores search results — it generates a generic `render_scene()` with concentric rings + dots + variant lines
3. **The gap**: the pipeline generates render scripts, Zeus catches the fraud, but the pipeline doesn't yet call scene functions by name

The render script imports both `scripts/renderer` and `visual-library` into `sys.path` — the infrastructure to call any of the 261 existing scene functions is already wired. The missing piece is mapping storyboard motif → scene function at render time.

### What It Makes Possible

**Near-term (wired, just needs tuning):**
- **Deterministic video production** — same essay → same output every time. No randomness in the render pipeline
- **Batch production** — 51 expansion essays can be queued in series, each producing a Zeus-scored video without human attention
- **Automated iteration** — pipeline runs → Zeus scores → if < GOLD, re-enter with modified parameters → loops until GOLD
- **Versioned outputs** — each slug+v{n} is a separate directory with full provenance (storyboard.json, alignment_report.json, render_*.py, script_integrity.json)

**Medium-term (needs 1-2 days of build):**
- **Real scene rendering** — map motif names to actual scene functions from the visual library. Instead of a single `render_scene()` with `variant`, call `scene_inner_lattice()` or `scene_watching_stones()` from the existing corpus
- **Animation pack composition** — build AGENT_KNOWLEDGE_DOSSIER → render at 10fps → catalog → compose into film pack. The two-tier architecture from the gold analysis
- **CLIP-based visual selection** — score each scene function's output against the spoken passage using CLIP. Pick the highest-scoring visual per shot
- **Parallel voiceover generation** — Edge TTS calls are embarrassingly parallel. Wrapping them in ThreadPoolExecutor cuts the bottleneck from ~10min to ~30s
- **Cross-pack motif inheritance** — Zeus Phase 8 already checks that repeated motifs improve. The pipeline could track which motif→function mappings worked in video N and apply them in N+1

**Long-term:**
- **Full film pack pipeline** — animation pack → film pack → final render at 24fps → .srt subtitle generation → YouTube upload
- **Multi-channel factory** — 5 channels (Tantra Files, Ochema, Angeliz, Pramāṇa, Intelligent Others) each with their own visual language, all served by the same pipeline
- **Continuous improvement loop** — produce → Zeus scores → pipeline self-modifies → produce again → score improves. The pipeline learns which motif combinations Zeus rewards
- **Web dashboard** — the factory worker API already has D1 tables for jobs. A dashboard could show pipeline runs, Zeus scores, and trigger re-renders

### Pipeline Data Flow (current)

```
ESSAY.md
  │  factory_clean_narration
  ▼
narration_script.txt + script_integrity.json
  │  factory_produce_video (step 2-3)
  ▼
shots (split, timed) + WAVs per shot + measured durations
  │
  ▼
storyboard.json (shot_id, start/end, chapter, motif, continuity, mechanism)
  │
  ▼
render_{slug}.py (auto-generated PIL code)
  │  executed by pipeline or independently
  ▼
scenes/s001/ -> frames -> s001.mp4 -> concat.txt -> draft.mp4
  │  mux WAVs
  ▼
final.mp4 + alignment_report.json
  │  R2 upload + API register
  ▼
Factory Dashboard (status: review)

ZEUS (on output directory):
  Phase 1: File structure check
  Phase 2: Storyboard field validation
  Phase 3: YES/NO visual test
  Phase 4: PIL code inspection (function count, primitives, variety)
  Phase 5: Visual-only comprehension (template detection, frame diff)
  Phase 6: Gold benchmarking
  Phase 7: Technical (durations, interleaving, audio)
  Phase 8: Cross-pack improvement
```

### Key Architectural Decisions

| Decision | Why |
|----------|-----|
| **Code generation over GUI editing** | Render scripts are deterministic, versionable, and reproducible. FableCut projects are JSON blobs that require a browser to preview |
| **PIL over Remotion** | Remotion requires Node, a browser engine, and GPU. PIL runs on Python-only CPU with zero external dependencies beyond ffmpeg |
| **Edge TTS over local TTS** | Edge TTS has the best natural-sounding voices (en-US-AriaNeural). Local TTS (eSpeak) was used in the original platinum reference but sounds robotic |
| **S3 R2 over Cloudflare API MCP** | Cloudflare API MCP requires OAuth browser auth — impossible headless. S3-compatible API works with env credentials |
| **Zeus-compliant output format** | Storyboard fields, alignment reports, and file structure all match what Zeus checks. This prevents the "passes by accident" problem that the old pipeline had |

### Grading Pipeline

```
factory_produce_video → final.mp4 + storyboard.json + alignment_report.json
         │
         ▼
ZEUS: validate_all(output_dir)
  ┌────────────────────────────────┐
  │ Phase 1: 5 files present?      │  HARD gate
  │ Phase 2: 14 storyboard fields? │  HARD gate
  │ Phase 3: ≥70% YES motifs?      │  30% weight
  │ Phase 4: PIL code checks?      │  20% weight — catches 1-fn-for-60-motifs fraud
  │ Phase 5: Visual distinctness?  │  15% weight — catches template mechanisms + identical frames
  │ Phase 6: Matches gold range?   │  15% weight
  │ Phase 7: Technical quality?    │  10% weight
  │ Phase 8: Cross-pack improves?  │  10% weight
  └────────────────────────────────┘
      │
      ▼
  GOLD ≥85% → publish
  SILVER ≥65% → minor polish
  BRONZE <65% → redesign + re-render
```

The critical checks that caught our fraud:
- **Phase 4**: Function-to-motif ratio >= 0.8 (we had 1 function for 60 motifs = 0.02 → FAIL)
- **Phase 5**: Template ratio <= 30% (100% of mechanisms were identical after stripping motif names → FAIL)
- **Phase 5**: Consecutive-shot distinctness (10/10 consecutive pairs nearly identical → FAIL)

### Config

MCP servers defined in `/root/.hermes/config.yaml`. The factory server runs as `python3 /root/projects/blog/hermes/plugins/factory-mcp-server.py`. Restart with `hermes gateway restart`.
