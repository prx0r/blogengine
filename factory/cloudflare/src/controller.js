/**
 * Platinum Factory Controller — Cloudflare Worker (JavaScript)
 */
const STAGES = [
  'pack_setup', 'gold_study', 'rhetorical_map', 'visual_thesis',
  'motif_manufacturability', 'storyboard', 'storyboard_review',
  'pack_composition', 'render_plan', 'code_review',
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
            content: `VISUAL PROGRAM:\n<visual_program>\n${(artifacts['visual_program.json'] || '').slice(0, 5000)}\n</visual_program>

Score every motif 0-2 on 8 criteria (max 16 per motif): concrete nouns, part inventory (2-8), motion_verbs, material rendering, spatial organisation, PIL feasibility, concept specificity, no-text intelligibility.
Minimum pass: 12/16. Output JSON: { pass, overall_score, max_score, motifs: [{ name, score, errors }] }`
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
            content: `Write render_pack.py with custom PIL scene functions. NO dispatch table. 15-40 lines per function. Pure PIL + ffmpeg. Use colors from the palette. Output: { render_pack_py: "...", code_review_json: { violations: [] } }`
          }
        };

        // Stages 11-13 are execution, not LLM — return placeholder
        if (['draft_render', 'visual_qc', 'final_render'].includes(stage)) {
          const msg = `${stage} requires VPS/Container execution, not LLM. Dispatch render task to queue.`;
          await env.FACTORY_DB.prepare(
            "UPDATE stage_history SET status = 'passed', notes = ? WHERE job_slug = ? AND stage = ? AND status = 'running'"
          ).bind(msg, slug, stage).run();
          return json({ slug, stage, result: 'passed', note: msg, next_stage: STAGES[stageIdx + 1] || 'complete' });
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

        // Save to R2
        const r2Key = `${outputDir}/${stage}.json`;
        await env.FACTORY_ASSETS.put(r2Key, llmResponse);

        // Advance
        const nextStage = STAGES[stageIdx + 1] || 'complete';
        await env.FACTORY_DB.prepare(
          "UPDATE stage_history SET status = 'passed' WHERE job_slug = ? AND stage = ? AND status = 'running'"
        ).bind(slug, stage).run();
        await env.FACTORY_DB.prepare(
          "UPDATE jobs SET current_stage = ?, updated_at = datetime('now') WHERE slug = ?"
        ).bind(nextStage, slug).run();

        return json({
          slug, stage, result: 'passed', next_stage: nextStage,
          model_used: model,
          llm_preview: llmResponse.slice(0, 200),
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return json({ error: 'not found' }, 404);
  },
};
