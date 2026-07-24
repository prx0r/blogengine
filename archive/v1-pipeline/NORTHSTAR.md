# North Star — The Hermes + Zeus Creative Pipeline

## The Two Systems

### HERMES — The Creative Director
Hermes reads an essay, designs the visual thesis, storyboards each shot, and writes the render script. This IS the breakthrough process documented in `creativevideoprocess.md` and `BREAKTHROUGH.md`.

**Hermes does NOT automate or template.** Hermes THINKS:
1. Read the essay for PROCESSES, not nouns
2. Design the visual thesis (material world, spatial world, motion verbs, recurring systems — however many the essay needs)
3. Storyboard each shot through the visual translation ladder
4. Write custom scene functions — each one hand-crafted for that specific concept
5. Output a complete `render_pack.py`

Hermes IS the creative process we discovered. Not a pipeline.

### ZEUS — The Gold Standard Amplifier
Zeus is a SECOND call. It receives:
- The gold standard packs (Kabbalah, karya_karana, etc.) — their AGENT_KNOWLEDGE_DOSSIERs, STYLE_EVOLUTIONs, render scripts, visual programs
- Hermes's new render script + essay

Zeus deeply analyzes:
- What makes the gold standard beautiful
- What story the gold visuals tell
- How they encode complex concepts into geometry

Then Zeus critiques and IMPROVES the new render script:
- Makes scenes more intricate
- Writes more complex art that actually explains the essay's content
- Elevates each scene to gold standard quality

Zeus is NOT a validator. Zeus is an amplifier.

## The Flow

```
ESSAY
  │
  ▼
HERMES (first call)
  ├── Reads essay for processes
  ├── Designs visual thesis (creative, not templated)
  ├── Storyboards each shot (translation ladder)
  └── Writes render_pack.py
  │
  ▼
render_pack.py (first draft)
  │
  ▼
ZEUS (second call)
  ├── Ingests gold standards
  ├── Analyzes the new render script deeply
  ├── Writes creative critique per scene
  └── Rewrites scenes to gold standard
  │
  ▼
render_pack.py (elevated)
  │
  ▼
Pipeline
  ├── Edge TTS audio
  ├── FFmpeg rendering + muxing
  └── Platinum pack files
```

## Key Rules
- Both calls are LLM-powered (deepseek-v4-flash)
- Neither call uses deterministic rules
- Hermes thinks before coding (visual thesis → storyboard → code)
- Zeus thinks before critiquing (gold study → comparison → rewrite)
- The pipeline handles production only (audio, render, pack)
- No MCP servers for creative work — just API calls
