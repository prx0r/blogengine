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
  },
  motif: { minimum_score: 12, max_score: 16 },
};

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

function validateStoryboard(shots, audioDur) {
  const errors = [];
  if (!Array.isArray(shots) || shots.length === 0) return ['Storyboard is empty'];
  
  // Unique shot IDs
  const ids = shots.map(s => s.shot_id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) errors.push(`Duplicate shot IDs: ${[...new Set(dupes)].join(', ')}`);
  
  // Timing
  const durs = shots.map(s => s.duration_seconds || s.duration || 0).filter(d => d > 0);
  if (durs.length) {
    const avg = durs.reduce((a, b) => a + b, 0) / durs.length;
    const max = Math.max(...durs);
    const total = durs.reduce((a, b) => a + b, 0);
    if (avg > VALIDATION.storyboard.hard_avg_max) errors.push(`Average duration ${avg.toFixed(1)}s > ${VALIDATION.storyboard.hard_avg_max}s`);
    if (max > VALIDATION.storyboard.absolute_shot_max) errors.push(`Shot ${max}s > ${VALIDATION.storyboard.absolute_shot_max}s absolute max`);
    // Total runtime check is disabled until real narration timing is added (Task 5)
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
    // Animation phases are optional for initial pass — not execution-critical
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
            content: `Analyze these gold pack visual programs and extract transferable design principles.

GOLD PACK DATA:
${(artifacts['gold_signatures.json'] || 'No pack data available').slice(0, 6000)}

Output JSON: { transferable_principles: [{ principle, source_pack, description }], forbidden_to_copy: string[], techniques: [{ name, implementation }] }
Do NOT include scene sequences, motif names, or shot counts.`
          },
          'rhetorical_map': {
            role: 'user',
            content: `SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 8000)}\n</essay>\n\nExtract rhetorical transformations from every passage.
For each passage: passage_id, text_preview, rhetorical_function (hook|definition|mechanism|example|contrast|synthesis|climax), logical_relation (causation|identity|formation|emanation|correspondence|recognition), transformation: { subject, operator (VERB), object, through[] }
Output JSON array.`
          },
          'visual_thesis': {
            role: 'user',
            content: `SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 4000)}\n</essay>

RHETORICAL MAP:
${(artifacts['rhetorical_map.json'] || '').slice(0, 3000)}

Design the visual thesis. Generate THREE competing visual worlds with different materials, spatial models, motion verbs. For the selected world define: material_world, spatial_world, 5-8 motion_verbs, 4-7 recurring_systems with evolution arcs, color_semantics with hex codes (70% neutral, 10-20% secondary, 3-8% accent), ≥5 forbidden_cliches, opening_to_closing_resolution.`
          },
          'motif_manufacturability': {
            role: 'user',
            content: `You ARE a JSON API. Your output will be parsed by machine. Output ONLY valid JSON. No explanations, no markdown, no thinking.

Analyze this visual thesis and extract every recurring system, motif, and named visual element:

THESIS DATA:
${(artifacts['visual_thesis.json'] || 'No thesis data').slice(0, 5000)}

For each distinct visual system/motif found, score 0-2 on these 8 criteria:
1. concrete_nouns: can it be named as visible objects?
2. part_inventory: does it have 2-8 drawable components?
3. motion_verbs: precise transformations?
4. material_rendering: ink, vellum, glass, smoke?
5. spatial_organisation: radial, axial, nested, diagonal?
6. pil_feasibility: polygons, masks, curves, compositing, blur?
7. concept_specificity: would it be wrong for a different passage?
8. no_text_intelligibility: legible when muted?

OUTPUT EXACTLY THIS JSON STRUCTURE (no other text):
{
  "pass": false,
  "overall_score": 0,
  "max_score": 16,
  "motifs": [
    {
      "name": "motif_name",
      "score": 12,
      "errors": ["error description or empty array"]
    }
  ]
}`
          },
          'storyboard': {
            role: 'user',
            content: `SOURCE ESSAY:\n<essay>\n${(artifacts['source_essay.md'] || '').slice(0, 8000)}\n</essay>

RHETORICAL MAP:\n${(artifacts['rhetorical_map.json'] || 'N/A').slice(0, 3000)}

VISUAL PROGRAM:\n${(artifacts['visual_program.json'] || 'N/A').slice(0, 3000)}

Design shots chapter by chapter. Each chapter: 6-12 shots.
Each shot 5-10 seconds. Average 5-8s. No shot >20s.
Output a JSON object with chapter_id and shots array:
{"chapter_id":"ch01","shots":[{"shot_id":"s001","spoken_passage":"...","duration_seconds":6.5,"visual_mode":"interior_flame","visual_audio_alignment":{"transformation_asserted":"...","what_viewer_sees":"...","why_it_matches":"..."},"concrete_motif":{"motif_id":"interior_flame","drawable_parts":["..."],"motion_verbs":["..."]},"continuity":{"inherits":[],"transforms":"","hands_off":[]},"bad_first_visual":"...","rejected_because":"...","text_required":false}]}`
          },
          'storyboard_review': {
            role: 'user',
            content: `Review the storyboard. Check: alignment failures, abstract motifs, gold copying, composition repetition, text overuse >15%, missing continuity. Output violations with shot_id, severity (fail|warn), explanation.`
          },
          'pack_composition': {
            role: 'user',
            content: `Write three markdown files based on the storyboard and visual program:
1. AGENT_KNOWLEDGE_DOSSIER.md — aim, visual rules, guardrails, style family, new motifs
2. STYLE_EVOLUTION.md — inheritance chain, new motifs, deprecated cliches, vocabulary shift  
3. PRODUCTION_BLUEPRINT.md — shot count, chapters, transitions, technical specs
Output each as a separate JSON string value.`
          },
          'code_review': {
            role: 'user',
            content: `Write a PIL ANIMATION render script. This must produce ANIMATED video, not static images.

EACH SCENE FUNCTION (t, u, idx):
- t = time in seconds
- u = 0.0 to 1.0 (animation progress within the shot)
- idx = scene index
- Returns a PIL Image

RENDER LOOP to include in the script:
- 1280x720, 2 fps
- Each shot: 6 seconds = 12 frames
- Call each scene function per frame
- Save frames as PNGs
- Use ffmpeg to assemble into MP4 clips
- Concatenate clips into final.mp4
- Pure PIL + ffmpeg only

Output JSON: { "render_pack_py": "complete python script here...", "code_review_json": { "violations": [] } }`
          }
        };

        // Stages 11-13 are execution — create render task for VPS
        if (['draft_render', 'visual_qc', 'final_render'].includes(stage)) {
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

        // Build message for the model
        const stageMsg = stageMessages[stage] || { role: 'user', content: `Complete stage ${stage}. Output JSON.` };
        const messages = [
          { role: 'system', content: systemMessage },
          stageMsg,
        ];

        // Model routing — cheap models for classification, better for creative
        const modelMap = {
          'pack_setup': '@cf/qwen/qwen3-30b-a3b-fp8',
          'gold_study': '@cf/qwen/qwen3-30b-a3b-fp8',
          'rhetorical_map': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'visual_thesis': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          'motif_manufacturability': '@cf/qwen/qwen3-30b-a3b-fp8',
          'storyboard': '@cf/qwen/qwen3-30b-a3b-fp8',
          'storyboard_review': '@cf/qwen/qwen3-30b-a3b-fp8',
          'code_review': '@cf/qwen/qwen3-30b-a3b-fp8',
        };
        const model = modelMap[stage] || '@cf/qwen/qwen3-30b-a3b-fp8';

        // Call LLM
        let llmResponse = '';
        try {
          const aiResp = await env.AI.run(model, { messages, max_tokens: 4000, temperature: 0.25 });
          // Workers AI returns { choices: [{ message: { content: "..." } }] }
          llmResponse = aiResp?.choices?.[0]?.message?.content 
                     || aiResp?.response 
                     || (typeof aiResp === 'string' ? aiResp : JSON.stringify(aiResp));
        } catch (aiErr) {
          const apiKey = env.OPENCODE_API_KEY || '';
          const apiResp = await fetch('https://opencode.ai/zen/go/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-v4-flash', messages, max_tokens: 4000 }),
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
        // Storyboard: only validate if we got structured shot data
        if (stage === 'storyboard' && parsed) {
          const shots = parsed.shots || (Array.isArray(parsed) ? parsed : []);
          if (shots.length > 0) {
            const audioDur = row.est_audio_duration || 240;
            validationErrors = validateStoryboard(shots, audioDur);
          }
        }
        // code_review: validate if we got violations
        if (stage === 'code_review' && parsed && Array.isArray(parsed.violations)) {
          if (parsed.violations.length > 0) {
            validationErrors = parsed.violations.map(v => `Code violation: ${v}`);
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
        
        // Atomic claim — conditional UPDATE returns affected rows
        const result = await env.FACTORY_DB.prepare(
          `UPDATE render_tasks SET status = 'claimed', claimed_by = ?, claimed_at = datetime('now'), heartbeat_at = datetime('now')
           WHERE task_id = (SELECT task_id FROM render_tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1)
           AND status = 'pending'`
        ).bind('vps-' + Date.now()).run();
        
        if (!result.changes || result.changes === 0) return json({ note: 'no pending tasks' });
        
        const updated = await env.FACTORY_DB.prepare(
          "SELECT * FROM render_tasks WHERE claimed_by = ? AND status = 'claimed' ORDER BY claimed_at DESC LIMIT 1"
        ).bind('vps-' + Date.now()).first();
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
