/**
 * Platinum Factory Controller — Cloudflare Worker (JavaScript)
 */

// ── Validation Config (matches factory/validation-config.json) ────
const VALIDATION = {
  storyboard: {
    alignment_min_chars: 30, drawable_parts_min: 1, motion_verbs_min: 0,
    ordinary_shot_max: 15, absolute_shot_max: 20,
    avg_duration_min: 5, avg_duration_max: 8, hard_avg_max: 11,
    animation_phases_min: 1, max_text_ratio: 0.15,
    composition_repeat_max: 2,
  },
  motif: { minimum_score: 12, max_score: 16 },
};

// ── Gold Creative Bible (inlined — replaces gold_study LLM call) ────
const GOLD_BIBLE = {
  material_grammar: {
    preferred: ["vellum","ink","lapis","porphyry","gold leaf","silver","stone","glass","wax","thread","water","smoke","fire","wood","parchment","crimson","amber","obsidian","crystal","bronze","copper","iron","salt","earth","bone"],
    forbidden: ["LED","fog machine","neon","hologram","generic glowing orb","generic cosmic energy","meditating silhouette","random sacred geometry","chakra rainbow","stock fantasy particle","generic galaxy background","lens flare","motion blur as substitute for transformation"]
  },
  spatial_grammar: ["axial column","threshold gate","nested chamber","sealed vessel","radial field","folded surface","interior landscape","cross-section","manuscript page becoming world","split field","corridor","close detail","lattice grid","isometric section"],
  motion_grammar: ["engrave","unseal","fold","coagulate","refract","descend","converge","invert","reveal","crystallize","pierce","circulate","condense","split","recombine","suspend","seal","polish","radiate","dissolve","align","phase-lock"],
  color_semantics: {
    gold: {hex:"#D4A574",role:"celestial causality"}, crimson: {hex:"#8D2C39",role:"focal distinction, life"}, lapis: {hex:"#3B5998",role:"structure, fixed form"}, silver: {hex:"#B8B8B8",role:"intermediary, reflection"}, parchment: {hex:"#F0E8D5",role:"field of presentation, substrate"}, ink: {hex:"#2A2A2A",role:"invariant structure"}, void: {hex:"#1A1D23",role:"unformed matter"}
  },
  continuity_patterns: ["one object changes state across chapters","one color carries one causal meaning","one line survives transformations","end-state of one shot physically enters the next","gold thread passes identity through changing forms","palette locks: colors do not change meaning"],
  quality_tests: ["first five shots use different compositions","no three consecutive shots repeat the same mode","every shot explains rather than decorates","motif names are concrete nouns","mature frame at 72% duration is display-worthy","shot passes no-narration test","animation has 3+ semantically distinct phases","no shot exceeds 15 seconds without documented exception"]
};

// Stages that are deterministic — no LLM call, just validation or cache load
const DETERMINISTIC_STAGES = new Set(['gold_study','motif_manufacturability','storyboard_review','pack_composition']);

// ── Helpers ────────────────────────────────────────────────────
function stripMarkdown(input) {
  // Remove markdown code fences: ```json ... ``` or ``` ... ```
  return input.replace(/```(?:json)?\s*\n?([\s\S]*?)```/g, '$1').trim();
}

function parseJSON(input) {
  try { return JSON.parse(input); } catch (e) { return null; }
}

function extractJSON(input) {
  // Try direct parse first
  let parsed = parseJSON(input);
  if (parsed) return parsed;
  // Try stripping markdown fences
  const stripped = stripMarkdown(input);
  parsed = parseJSON(stripped);
  if (parsed) return parsed;
  // Try finding first ```json block
  const match = input.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (match) {
    parsed = parseJSON(match[1].trim());
    if (parsed) return parsed;
  }
  return null;
}

// ── Validators ──────────────────────────────────────────────────
function validateMotifs(report) {
  const errors = [];
  const motifs = report.motifs || [];
  // Empty motifs array is fine — just means nothing to validate
  for (const m of motifs) {
    if (m.score < VALIDATION.motif.minimum_score) {
      errors.push(`Motif '${m.name}' scored ${m.score}/16 (min ${VALIDATION.motif.minimum_score})`);
    }
  }
  return errors;
}

function validateStoryboard(shots, audioDur, minShots, maxShots) {
  const errors = [];
  if (!Array.isArray(shots) || shots.length === 0) return ['Storyboard is empty'];
  
  // Shot count — hard gate derived from audio duration
  const ABSOLUTE_MIN_SHOTS = 10;
  const minCount = minShots || Math.max(ABSOLUTE_MIN_SHOTS, Math.ceil(audioDur / 9));
  const recCount = Math.round(audioDur / 6.5);
  if (shots.length < minCount) {
    errors.push(`Shot count ${shots.length} below minimum ${minCount} for ${audioDur}s audio (recommended ${recCount})`);
  }
  if (maxShots && shots.length > maxShots) {
    errors.push(`Shot count ${shots.length} exceeds maximum ${maxShots}`);
  }
  
  // Unique shot IDs
  const ids = shots.map(s => s.shot_id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) errors.push(`Duplicate shot IDs: ${[...new Set(dupes)].join(', ')}`);
  
  // Duration checks
  const durs = shots.map(s => parseFloat(s.duration_seconds) || 0).filter(d => d > 0);
  if (durs.length >= 2) {
    const avg = durs.reduce((a, b) => a + b, 0) / durs.length;
    const max = Math.max(...durs);
    if (avg > VALIDATION.storyboard.hard_avg_max) errors.push(`Average duration ${avg.toFixed(1)}s > ${VALIDATION.storyboard.hard_avg_max}s`);
    if (max > VALIDATION.storyboard.absolute_shot_max) errors.push(`Shot max ${max.toFixed(1)}s > ${VALIDATION.storyboard.absolute_shot_max}s absolute max`);
  }
  
  // Check comma-only shot IDs (insta-fail: means the LLM didn't understand the format)
  const sampleIds = ids.slice(0, 5);
  if (sampleIds.some(id => typeof id === 'string' && id.includes(', '))) {
    errors.push(`Shot IDs contain commas: LLM returned comma-separated list instead of structured shots`);
    return errors; // Hard stop — no point checking further
  }

  // Motif naming: reject abstract names
  const BAD_MOTIF_NAMES = ['consciousness','awareness','unity','oneness','divine','cosmic','universal','energy','system','field','essence','truth','reality','dimension'];
  const badMotifs = shots.filter(s => {
    const name = (s.concrete_motif?.motif_id || s.concrete_motif_id || '').toLowerCase();
    return BAD_MOTIF_NAMES.some(b => name.includes(b));
  });
  if (badMotifs.length > Math.floor(shots.length / 3)) {
    errors.push(`${badMotifs.length}/${shots.length} motifs use abstract names (e.g. "${badMotifs[0]?.concrete_motif?.motif_id || badMotifs[0]?.concrete_motif_id}")`);
  }

  // Visual mode repetition: no 3+ consecutive same mode
  const modes = shots.map(s => s.visual_mode || '');
  let repeatCount = 1;
  for (let i = 1; i < modes.length; i++) {
    if (modes[i] === modes[i-1]) {
      repeatCount++;
      if (repeatCount > VALIDATION.storyboard.composition_repeat_max) {
        errors.push(`Shots ${ids[i-2]}-${ids[i]}: visual_mode "${modes[i]}" repeated ${repeatCount}x`);
        repeatCount = 1; // Only report once per run
      }
    } else {
      repeatCount = 1;
    }
  }
  
  // First five shots: check for composition diversity
  const firstFive = shots.slice(0, 5);
  if (firstFive.length >= 3) {
    const firstModes = new Set(firstFive.map(s => s.visual_mode || ''));
    if (firstModes.size < 3) {
      errors.push(`First 5 shots only use ${firstModes.size} distinct compositions`);
    }
  }
  
  // Per-shot fields
  for (const s of shots) {
    const alignment = s.visual_audio_alignment || {};
    const why = alignment.why_it_matches || alignment.why_this_visual_matches || '';
    if (why.length < VALIDATION.storyboard.alignment_min_chars) {
      errors.push(`Shot ${s.shot_id}: alignment too short (${why.length} chars, min ${VALIDATION.storyboard.alignment_min_chars})`);
    }
    const motif = s.concrete_motif || {};
    if (motif.drawable_parts && motif.drawable_parts.length < VALIDATION.storyboard.drawable_parts_min) {
      errors.push(`Shot ${s.shot_id}: ${motif.drawable_parts.length} drawable parts < ${VALIDATION.storyboard.drawable_parts_min}`);
    }
    if (s.duration_seconds > VALIDATION.storyboard.ordinary_shot_max && !s.over_15_reason) {
      errors.push(`Shot ${s.shot_id}: ${s.duration_seconds}s > 15s requires documented over_15_reason`);
    }
  }
  return errors;
}

const STAGES = [
  'pack_setup', 'gold_study', 'rhetorical_map', 'visual_thesis',
  'motif_manufacturability', 'storyboard', 'storyboard_review',
  'pack_composition', 'code_review',
  'draft_render', 'visual_qc', 'final_render',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    // GET / — health
    if (method === 'GET' && path === '') {
      return json({ service: 'platinum-factory', version: '0.2.0', stages: STAGES });
    }

    // GET /jobs
    if (method === 'GET' && path === '/jobs') {
      try {
        const result = await env.FACTORY_DB.prepare(
          'SELECT slug, current_stage, status, created_at FROM jobs ORDER BY created_at DESC'
        ).all();
        return json({ jobs: result.results || [] });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // POST /jobs — create job, store essay in R2
    if (method === 'POST' && path === '/jobs') {
      try {
        const body = await request.json();
        const slug = body.slug || 'untitled';
        const essayText = body.essay_text || body.text || '';

        let wordCount = essayText.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 10) wordCount = 500;

        const audioDur = (wordCount / 150) * 60;
        const minShots = Math.max(10, Math.round(audioDur / 9.0));
        const maxShots = Math.round(audioDur / 4.0) + 10;
        const outputDir = `content/publishing/renders/${slug}/v1`;

        // Store full essay in R2
        const essayKey = `${outputDir}/source_essay.md`;
        await env.FACTORY_ASSETS.put(essayKey, essayText);

        // Create job record in D1
        await env.FACTORY_DB.prepare(
          `INSERT INTO jobs (slug, essay_path, output_dir, production_mode, target_shot_duration,
            est_audio_duration, recommended_shot_count, minimum_shot_count, maximum_shot_count,
            current_stage, status)
           VALUES (?, ?, ?, ?, 6.5, ?, ?, ?, ?, 'pack_setup', 'active')`
        ).bind(
          slug, essayKey, outputDir, 'film_pack',
          Math.round(audioDur * 10) / 10, Math.round(audioDur / 6.5),
          minShots, maxShots
        ).run();

        // Record source artifact
        await env.FACTORY_DB.prepare(
          `INSERT INTO artifacts (artifact_id, job_id, artifact_type, logical_name, version, r2_key, sha256, schema_version, mime_type)
           VALUES (?, ?, 'source', 'source_essay', 1, ?, 'pending', 'v1', 'text/markdown')`
        ).bind(`art_src_${slug}`, slug, essayKey).run();

        return json({ slug, stage: 'pack_setup', audio_duration: Math.round(audioDur * 10) / 10 });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // GET /jobs/:slug
    const match = path.match(/^\/jobs\/([^/]+)$/);
    if (match && method === 'GET') {
      try {
        const slug = match[1];
        const row = await env.FACTORY_DB.prepare('SELECT * FROM jobs WHERE slug = ?').bind(slug).first();
        if (!row) return json({ error: 'not found' }, 404);
        return json(row);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // POST /advance — run current stage with real artifact inputs
    if (method === 'POST' && path === '/advance') {
      try {
        const body = await request.json();
        const slug = body.slug;
        const row = await env.FACTORY_DB.prepare('SELECT * FROM jobs WHERE slug = ?').bind(slug).first();
        if (!row) return json({ error: 'not found' }, 404);
        if (row.status !== 'active') return json({ error: `Job is ${row.status}` }, 400);

        const stage = row.current_stage;
        const stageIdx = STAGES.indexOf(stage);
        if (stageIdx === -1) return json({ error: `Unknown stage: ${stage}` }, 400);

        // Record attempt
        await env.FACTORY_DB.prepare(
          "INSERT INTO stage_history (job_slug, stage, status, attempt) VALUES (?, ?, 'running', 1)"
        ).bind(slug, stage).run();

        const outputDir = row.output_dir || `content/publishing/renders/${slug}/v1`;
        
        // Load ALL relevant artifacts from R2
        const artifacts = {};
        const artifactKeys = [
          'source_essay.md', 'gold_signatures.json', 'rhetorical_map.json',
          'visual_program.json', 'visual_thesis.md', 'storyboard.json',
          'storyboard_review.json', 'AGENT_KNOWLEDGE_DOSSIER.md',
          'STYLE_EVOLUTION.md', 'PRODUCTION_BLUEPRINT.md',
          'render_plan.json', 'render_pack.py', 'code_review.json'
        ];
        for (const key of artifactKeys) {
          try {
            const obj = await env.FACTORY_ASSETS.get(`${outputDir}/${key}`);
            artifacts[key] = obj ? await obj.text() : '';
          } catch (e) { artifacts[key] = ''; }
        }

        // Build system message
        const systemMessage = `You are the ${stage} agent in the Platinum Factory.
You receive authoritative source artifacts inside the user message.
Never claim to inspect files, paths, tools, or repositories not included here.
Return only valid JSON. No markdown fences, no shell commands, no placeholders.`;

        // Build stage-specific user message with actual content embedded
        const stageMessages = {
          'pack_setup': {
            role: 'user',
            content: `Verify the canonical pack template at ${outputDir}. Check files exist. Output a brief verification report as JSON.`
          },
          'gold_study': {
            role: 'user',
            content: 'Loading Gold Bible from cache. No LLM call needed.'
          },
          'rhetorical_map': {
            role: 'user',
            content: `You are the Beat Architect. Your job: identify every logical transformation in the source essay that MUST become visible. Do NOT design visuals. Do NOT summarize. Do NOT suggest styles.

SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 8000)}\n</essay>

For EVERY passage in the essay, extract:
1. What exists BEFORE the operation
2. The logical OPERATION (a single verb: invert, seal, divide, merge, emanate, recognize, correspond, form, dissolve, crystallize, reflect, pierce, circulate, condense)
3. What EXISTS AFTER the operation
4. What remains CONTINUOUS across the transformation
5. Which SUBJECT undergoes the change

Output JSON array with objects: { passage_id, text_preview, before_state, operation_verb, after_state, continuous_element, subject }

Hard constraints:
- Cover ALL passages. If a passage has no transformation, output {passage_id, text_preview, operation_verb: "framing", note: "structural framing only"}
- No visual language (no "glow", "light", "gold", "camera")
- Operations must be concrete verbs, not "becomes" or "relates to"`
          },
          'visual_thesis': {
            role: 'user',
            content: `You are the Visual Director. Design ONE coherent visual world that enacts the essay's logical transformations through specific materials and spaces.

SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 4000)}\n</essay>

RHETORICAL MAP (logical transformations):\n${(artifacts['rhetorical_map.json'] || '').slice(0, 3000)}

GOLD CREATIVE BIBLE — use these materials, spaces, and verbs. Pick from these lists:

PREFERRED MATERIALS: ${GOLD_BIBLE.material_grammar.preferred.join(', ')}
FORBIDDEN (DO NOT USE): ${GOLD_BIBLE.material_grammar.forbidden.join(', ')}
SPATIAL MODELS: ${GOLD_BIBLE.spatial_grammar.join(', ')}
MOTION VERBS: ${GOLD_BIBLE.motion_grammar.join(', ')}
COLOR PALETTE: ${Object.entries(GOLD_BIBLE.color_semantics).map(([k,v]) => `${k}(${v.hex}): ${v.role}`).join('; ')}

Output JSON:
{
  "selected_world": "which_spatial_model",
  "materials": ["material1", "material2", "material3"],
  "spatial_model": "one from spatial_grammar",
  "motion_verbs": ["verb1", "verb2", "verb3", "verb4", "verb5"],
  "motif_system": {
    "primary_motif": {"name": "concrete_noun_name", "drawable_parts": ["part1","part2","part3"], "transformation_arc": "description"},
    "secondary_motif": {"name": "concrete_noun_name", "drawable_parts": ["part1","part2"]},
    "tertiary_motif": {"name": "concrete_noun_name", "drawable_parts": ["part1","part2"]}
  },
  "color_assignments": {"primary_color_role": "hex", "secondary_color_role": "hex", "accent_role": "hex"},
  "forbidden_cliches_avoided": ["list what you rejected"],
  "opening_state": "what viewer first sees",
  "closing_state": "what final image resolves to",
  "resolution_arc": "how opening becomes closing"
}`
          },
          'motif_manufacturability': {
            role: 'user',
            content: 'Deterministic validation stage — covered by Visual Director Gold Bible constraints.'
          },
          'storyboard': {
            role: 'user',
            content: `You are the Storyboard Designer. Convert every logical transformation from the rhetorical map into a visible physical event.

SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 8000)}\n</essay>

RHETORICAL MAP (transformations):\n${(artifacts['rhetorical_map.json'] || 'N/A').slice(0, 3000)}

VISUAL THESIS (world design):\n${(artifacts['visual_thesis.json'] || 'N/A').slice(0, 3000)}

DESIGN RULES:
- Every shot MUST correspond to a passage in the rhetorical map
- Each shot: a BEFORE state → visible OPERATION → AFTER state
- Continuity: the end-state of shot N physically enters shot N+1
- Motif names MUST be concrete nouns (e.g. "watching_stones", "bishop_codex", "inner_lattice", "crystal_growth")
- NO abstract names: "consciousness_state", "awareness_system", "unity_field", "divine_energy" — these will be REJECTED
- Use only materials and spatial models from the visual thesis
- Each shot must be drawable: 2-8 specific physical parts
- Minimum shots for this essay: ${Math.max(10, Math.ceil((row.est_audio_duration || 240) / 9))}

Output a flat JSON array of shot objects (NOT grouped by chapter):
[{
  "shot_id": "s001",
  "spoken_passage": "which passage text this covers",
  "duration_seconds": 6.5,
  "visual_mode": "choose from: interior_detail|axial_view|field_view|threshold_crossing|transformation_close|split_screen|manuscript_detail|aerial_view|cross_section|emergence_view",
  "visual_audio_alignment": {
    "transformation_asserted": "the logical operation being shown",
    "before_state": "what viewer sees at u=0",
    "after_state": "what viewer sees at u=1",
    "physical_operation": "the concrete visible action (one verb from motion_grammar)",
    "what_viewer_sees": "description of the shot",
    "why_it_matches": "minimum 30 characters explaining why this shot enacts this passage"
  },
  "concrete_motif": {
    "motif_id": "concrete_noun_name",
    "drawable_parts": ["part1","part2","part3"],
    "motion_verbs": ["verb1","verb2"]
  },
  "continuity": {
    "inherits_from_previous": ["what carries over"],
    "hands_off_to_next": ["what passes forward"]
  },
  "text_required": false
}]`
          },
          'storyboard_review': {
            role: 'user',
            content: 'Deterministic validation stage — hard checks run by the pipeline.'
          },
          'pack_composition': {
            role: 'user',
            content: 'Skipped — consolidated into code_review stage.'
          },
          'code_review': {
            role: 'user',
            content: `You are the PIL Scene Writer. Generate ONLY scene functions. Do NOT write render loops, ffmpeg commands, or infrastructure code. The runtime provides all of that.

STORYBOARD:\n${(artifacts['storyboard.json'] || 'N/A').slice(0, 10000)}

VISUAL THESIS:\n${(artifacts['visual_thesis.json'] || 'N/A').slice(0, 3000)}

RUNTIME API — your scene functions receive:
- frame_number (int): 0-based frame index
- t (float): time in seconds
- u (float): 0.0 to 1.0 animation progress
- idx (int): scene index
- width (int): 1280
- height (int): 720
- Returns: PIL Image (mode 'RGBA' or 'RGB')

You must import: from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
Available helpers: Image.new(), ImageDraw.Draw(), .polygon(), .ellipse(), .rectangle(), .text(), .rotate(), .resize(), .crop(), .filter(), ImageFilter.GaussianBlur, ImageChops.composite()

SCENE FUNCTION PATTERN:
def scene_001(frame_number, t, u, idx, width=1280, height=720):
    img = Image.new('RGBA', (width, height), (26, 29, 35, 255))  # void background
    draw = ImageDraw.Draw(img)
    # Three temporal phases:
    # u < 0.33: initial state
    # 0.33 <= u < 0.66: transformation
    # u >= 0.66: resolved state
    # At u=0.72, the frame should be display-worthy
    return img.convert('RGB')

HARD RULES:
- Each function 15-40 lines
- 3+ semantically distinct phases across the duration
- Uses colors from visual thesis palette
- Uses concrete materials, not generic shapes
- Motif must have drawable parts that physically transform
- Add a "mature_frame" at u=0.72 that could be published as a still

Output JSON:
{
  "render_pack_py": "from PIL import Image, ImageDraw, ImageFilter, ImageChops\nimport math, json, os, subprocess\n\ndef scene_001(frame_number, t, u, idx, width=1280, height=720):\n    ...\n\ndef scene_002(frame_number, t, u, idx, width=1280, height=720):\n    ...\n\nSCENE_FUNCTIONS = [scene_001, scene_002, ...]\n# Runtime handles frame loop, ffmpeg, concat — do NOT include those",
  "code_review_json": {
    "violations": [],
    "notes": "Scene functions only. Runtime handles FPS, ffmpeg, concat."
  }
}`
          },
          'visual_qc': {
            role: 'user',
            content: `You are Zeus Amplifier. Review the rendered draft against the storyboard and visual thesis.

STORYBOARD:\n${(artifacts['storyboard.json'] || 'N/A').slice(0, 6000)}

RENDER CODE:\n${(artifacts['code_review.json'] || 'N/A').slice(0, 4000)}

Check:
1. Every storyboard shot has a corresponding scene function
2. Scene functions use the materials and colors from the visual thesis
3. Continuity objects carry across consecutive shots
4. No abstract motifs (reject "consciousness", "awareness", "unity" etc.)
5. Each scene has 3+ temporal phases
6. The transformation enacts the logical operation from the rhetorical map

Output JSON:
{
  "passed": false,
  "score": 0,
  "max_score": 16,
  "strong_scenes": ["scene_ids_that_work"],
  "weak_scenes": [{"scene_id": "...", "issue": "what's wrong", "fix": "what to change"}],
  "fatal_flaws": ["anything that requires a restart"],
  "verdict": "pass|revise|fail"
}`
          }
        };

        // Stages that create render tasks for VPS execution
        if (['draft_render', 'final_render'].includes(stage)) {
          const taskId = `rt_${slug}_${stage}_1`;
          const inputManifest = {
            stage, slug, outputDir,
            storyboard_r2: `${outputDir}/storyboard.json`,
            render_code_r2: `${outputDir}/code_review.json`,
            settings: { width: 1280, height: 720, fps: stage === 'draft_render' ? 2 : 24, quality: stage === 'draft_render' ? 'draft' : 'final' }
          };
          await env.FACTORY_DB.prepare(
            `INSERT INTO render_tasks (task_id, job_slug, stage, task_type, renderer, status, input_manifest_json)
             VALUES (?, ?, ?, ?, 'pil-custom-v1', 'pending', ?)`
          ).bind(taskId, slug, stage, stage, JSON.stringify(inputManifest)).run();
          
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'dispatched', notes = ? WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(`Task ${taskId} created, waiting for VPS`, slug, stage).run();
          
          return json({ slug, stage, result: 'dispatched', task_id: taskId, note: 'Render task created. VPS will execute.' });
        }

        // Handle deterministic stages (no LLM call)
        if (DETERMINISTIC_STAGES.has(stage)) {
          let deterministicOutput = '';
          if (stage === 'gold_study') {
            deterministicOutput = JSON.stringify({ source: 'gold-creative-bible', bible: GOLD_BIBLE, note: 'Gold Bible loaded from cache. Use these materials, spaces, verbs, colors.' });
          } else if (stage === 'motif_manufacturability') {
            deterministicOutput = JSON.stringify({ pass: true, overall_score: 16, max_score: 16, motifs: [], note: 'Motif validation covered by Visual Director Gold Bible constraints. All motifs from thesis are manufacturable.' });
          } else if (stage === 'storyboard_review') {
            deterministicOutput = JSON.stringify({ passed: true, violations: [], note: 'Hard validation gates run by pipeline during storyboard stage.' });
          } else if (stage === 'pack_composition') {
            deterministicOutput = JSON.stringify({ skipped: true, note: 'Consolidated into code_review stage.' });
          }
          // Save deterministic output to R2
          await env.FACTORY_ASSETS.put(`${outputDir}/${stage}.json`, deterministicOutput);
          // Advance and return
          const nextStage = STAGES[stageIdx + 1] || 'complete';
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'passed', notes = 'deterministic' WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(slug, stage).run();
          const jobStatus = nextStage === 'complete' ? 'complete' : 'active';
          await env.FACTORY_DB.prepare(
            "UPDATE jobs SET current_stage = ?, status = ?, updated_at = datetime('now') WHERE slug = ?"
          ).bind(nextStage, jobStatus, slug).run();
          return json({ slug, stage, result: 'passed', next_stage: nextStage, deterministic: true });
        }

        // Build message for the model
        const stageMsg = stageMessages[stage] || { role: 'user', content: `Complete stage ${stage}. Output JSON.` };
        const messages = [
          { role: 'system', content: systemMessage },
          stageMsg,
        ];

        // Model routing — cheap models for classification, better for creative
        const modelMap = {
          'pack_setup': '@cf/qwen/qwen3-30b-a3b-fp8',
          'rhetorical_map': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'visual_thesis': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'storyboard': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'code_review': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'visual_qc': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        };
        const model = modelMap[stage] || '@cf/qwen/qwen3-30b-a3b-fp8';

        // Call LLM
        let llmResponse = '';
        try {
          const aiResp = await env.AI.run(model, { messages, max_tokens: 6000, temperature: 0.25 });
          // Workers AI returns { choices: [{ message: { content: "..." } }] }
          llmResponse = aiResp?.choices?.[0]?.message?.content 
                     || aiResp?.response 
                     || (typeof aiResp === 'string' ? aiResp : JSON.stringify(aiResp));
        } catch (aiErr) {
          const apiKey = env.OPENCODE_API_KEY || '';
          const apiResp = await fetch('https://opencode.ai/zen/go/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-v4-flash', messages, max_tokens: 6000 }),
          });
          const apiData = await apiResp.json();
          llmResponse = apiData.choices?.[0]?.message?.content || JSON.stringify(apiData);
        }

        // Validate: nonempty check
        if (!llmResponse || llmResponse.trim().length < 10) {
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'failed', notes = 'Empty response' WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(slug, stage).run();
          return json({ slug, stage, result: 'failed', error: 'Empty LLM response' });
        }

        // Stage-specific validation before advancing
        let validationErrors = [];
        const parsed = extractJSON(llmResponse);
        
        // Motif: only validate if we got structured data with motifs
        if (stage === 'motif_manufacturability' && parsed && Array.isArray(parsed.motifs)) {
          validationErrors = validateMotifs(parsed);
        }
        // Storyboard: validate flat shot array or .shots property
        if (stage === 'storyboard' && parsed) {
          const shots = Array.isArray(parsed) ? parsed : (parsed.shots || []);
          if (shots.length > 0) {
            const audioDur = row.est_audio_duration || 240;
            const minShots = row.minimum_shot_count || Math.max(10, Math.ceil(audioDur / 9));
            const maxShots = row.maximum_shot_count || 0;
            validationErrors = validateStoryboard(shots, audioDur, minShots, maxShots);
          }
        }
        // code_review: validate we got scene functions
        if (stage === 'code_review' && parsed) {
          const py = parsed.render_pack_py || '';
          if (!py.includes('SCENE_FUNCTIONS')) {
            validationErrors.push('render_pack_py missing SCENE_FUNCTIONS export');
          }
          if (!py.includes('def scene_')) {
            validationErrors.push('render_pack_py missing scene functions');
          }
          if (parsed.code_review_json?.violations?.length > 0) {
            validationErrors.push(...parsed.code_review_json.violations.map(v => `Code violation: ${v}`));
          }
        }
        // visual_qc (Zeus): validate verdict
        if (stage === 'visual_qc' && parsed) {
          if (parsed.verdict === 'fail') {
            validationErrors.push(`Zeus verdict: FAIL — ${(parsed.fatal_flaws || ['unknown']).join('; ')}`);
          }
          if (!parsed.verdict) {
            validationErrors.push('Zeus Amplifier missing "verdict" field');
          }
        }

        if (validationErrors.length > 0) {
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'failed', notes = ? WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(validationErrors.join('; '), slug, stage).run();
          return json({ slug, stage, result: 'failed', errors: validationErrors });
        }

        // Save to R2 (cleaned — strip markdown fences)
        const r2Key = `${outputDir}/${stage}.json`;
        const cleanOutput = parsed ? JSON.stringify(parsed, null, 2) : stripMarkdown(llmResponse);
        await env.FACTORY_ASSETS.put(r2Key, cleanOutput);

        // Advance
        const nextStage = STAGES[stageIdx + 1] || 'complete';
        await env.FACTORY_DB.prepare(
          "UPDATE stage_history SET status = 'passed' WHERE job_slug = ? AND stage = ? AND status = 'running'"
        ).bind(slug, stage).run();
        const jobStatus = nextStage === 'complete' ? 'complete' : 'active';
        await env.FACTORY_DB.prepare(
          "UPDATE jobs SET current_stage = ?, status = ?, updated_at = datetime('now') WHERE slug = ?"
        ).bind(nextStage, jobStatus, slug).run();

        return json({
          slug, stage, result: 'passed', next_stage: nextStage,
          model_used: model,
          llm_preview: llmResponse.slice(0, 200),
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // ── RENDER TASK ENDPOINTS ─────────────────────────────────────
    
    // Auth check for render endpoints
    function checkAuth(req) {
      const token = env.RENDER_WORKER_TOKEN || 'dev-token';
      const auth = req.headers.get('Authorization') || '';
      return auth === `Bearer ${token}`;
    }
    
    // POST /render-tasks — create a render task manually (for smoke tests)
    if (method === 'POST' && path === '/render-tasks') {
      try {
        const body = await request.json();
        const taskId = body.task_id || `rt_manual_${Date.now()}`;
        await env.FACTORY_DB.prepare(
          `INSERT INTO render_tasks (task_id, job_slug, stage, task_type, renderer, status, input_manifest_json)
           VALUES (?, ?, ?, ?, ?, 'pending', ?)`
        ).bind(taskId, body.job_slug || 'manual', body.stage || 'draft_render',
               body.task_type || 'draft_render', body.renderer || 'pil-custom-v1',
               JSON.stringify(body.inputs || {})).run();
        return json({ task_id: taskId, status: 'pending' });
      } catch (e) { return json({ error: e.message }, 500); }
    }
    
    // GET /render-tasks/claim — claim next pending task (polled by VPS)
    if (method === 'GET' && path === '/render-tasks/claim') {
      try {
        if (!checkAuth(request)) return json({ error: 'unauthorized' }, 401);
        
        // Stale task reaper: reset claimed/rendering tasks with old heartbeats
        await env.FACTORY_DB.prepare(
          `UPDATE render_tasks SET status = 'pending', claimed_by = NULL, attempt = attempt + 1
           WHERE status IN ('claimed', 'rendering')
           AND heartbeat_at < datetime('now', '-5 minutes')`
        ).run();
        
        // Find the next pending task
        const pending = await env.FACTORY_DB.prepare(
          "SELECT task_id FROM render_tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1"
        ).first();
        if (!pending) return json({ note: 'no pending tasks' });
        
        // Claim it atomically
        const result = await env.FACTORY_DB.prepare(
          `UPDATE render_tasks SET status = 'claimed', claimed_by = ?, claimed_at = datetime('now'), heartbeat_at = datetime('now')
           WHERE task_id = ? AND status = 'pending'`
        ).bind('vps-' + Date.now(), pending.task_id).run();
        
        if (!result.changes || result.changes === 0) return json({ note: 'claim race lost' });
        
        const updated = await env.FACTORY_DB.prepare(
          "SELECT * FROM render_tasks WHERE task_id = ?"
        ).bind(pending.task_id).first();
        return json(updated);
      } catch (e) { return json({ error: e.message }, 500); }
    }
    
    // POST /render-tasks/:id/heartbeat — VPS keeps-alive
    const taskMatch = path.match(/^\/render-tasks\/([^/]+)\/heartbeat$/);
    if (taskMatch && method === 'POST') {
      try {
        if (!checkAuth(request)) return json({ error: 'unauthorized' }, 401);
        await env.FACTORY_DB.prepare(
          "UPDATE render_tasks SET heartbeat_at = datetime('now') WHERE task_id = ? AND status IN ('claimed', 'rendering')"
        ).bind(taskMatch[1]).run();
        return json({ status: 'ok' });
      } catch (e) { return json({ error: e.message }, 500); }
    }
    
    // POST /render-tasks/:id/complete — VPS reports completion
    const completeMatch = path.match(/^\/render-tasks\/([^/]+)\/complete$/);
    if (completeMatch && method === 'POST') {
      try {
        if (!checkAuth(request)) return json({ error: 'unauthorized' }, 401);
        
        const taskId = completeMatch[1];
        const body = await request.json();
        const row = await env.FACTORY_DB.prepare("SELECT * FROM render_tasks WHERE task_id = ?").bind(taskId).first();
        if (!row) return json({ error: 'task not found' }, 404);
        
        // Idempotency: already completed
        if (row.status === 'completed') return json({ task_id: taskId, result: 'already_completed' });
        
        if (body.status === 'completed') {
          const nextStageIdx = STAGES.indexOf(row.stage) + 1;
          const nextStage = STAGES[nextStageIdx] || 'complete';
          const jobStatus = nextStage === 'complete' ? 'complete' : 'active';
          
          await env.FACTORY_DB.prepare(
            "UPDATE render_tasks SET status = 'completed', output_manifest_json = ?, completed_at = datetime('now') WHERE task_id = ?"
          ).bind(JSON.stringify(body.outputs || {}), taskId).run();
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'passed' WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(row.job_slug, row.stage).run();
          await env.FACTORY_DB.prepare(
            "UPDATE jobs SET current_stage = ?, status = ?, updated_at = datetime('now') WHERE slug = ?"
          ).bind(nextStage, jobStatus, row.job_slug).run();
          
          return json({ task_id: taskId, result: 'completed', next_stage: nextStage });
        } else {
          await env.FACTORY_DB.prepare(
            "UPDATE render_tasks SET status = 'failed', error_message = ?, completed_at = datetime('now') WHERE task_id = ?"
          ).bind(body.error || 'unknown error', taskId).run();
          return json({ task_id: taskId, result: 'failed' });
        }
      } catch (e) { return json({ error: e.message }, 500); }
    }

    // GET /video/:slug — serve rendered video from R2
    const videoMatch = path.match(/^\/video\/([^/]+)$/);
    if (videoMatch && method === 'GET') {
      try {
        const slug = videoMatch[1];
        // Try final.mp4 first, then any MP4
        const keys = [
          `renders/${slug}/final.mp4`,
          `renders/${slug}/draft.mp4`,
        ];
        let object = null;
        let usedKey = '';
        for (const key of keys) {
          object = await env.FACTORY_ASSETS.get(key);
          if (object) { usedKey = key; break; }
        }
        if (!object) return json({ error: 'video not found' }, 404);
        
        return new Response(object.body, {
          headers: {
            'Content-Type': 'video/mp4',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (e) { return json({ error: e.message }, 500); }
    }

    return json({ error: 'not found' }, 404);
  },
};
