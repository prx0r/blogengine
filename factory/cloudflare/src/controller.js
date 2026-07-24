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

    // POST /jobs
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

        await env.FACTORY_DB.prepare(
          `INSERT INTO jobs (slug, essay_path, output_dir, production_mode, target_shot_duration,
            est_audio_duration, recommended_shot_count, minimum_shot_count, maximum_shot_count,
            current_stage, status)
           VALUES (?, ?, ?, ?, 6.5, ?, ?, ?, ?, 'pack_setup', 'active')`
        ).bind(
          slug, essayText.slice(0, 200), `content/publishing/renders/${slug}/v1`, 'film_pack',
          Math.round(audioDur * 10) / 10, Math.round(audioDur / 6.5),
          minShots, maxShots
        ).run();

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

    // POST /advance — run current stage
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

        // Build stage-specific prompt
        const outputDir = row.output_dir || `content/publishing/renders/${slug}/v1`;
        let prompt = `You are in ${stage} stage for job ${slug}.\n\n`;
        
        const prompts = {
          'pack_setup': `Verify the canonical pack template in ${outputDir}. Check that README.md, storyboard.json, visual_program.json exist. Output a brief verification report.`,
          
          'gold_study': `Study 4 gold packs (stones, kabbalah, malas, dvadasanta) and extract transferable principles.
Output gold_signatures.json with: transferable_principles[], forbidden_to_copy[], techniques[].
Do NOT include scene sequences, motif names, or shot counts.
Packs at: content/publishing/renders/gold-analysis/stones_analysis/stones_are_watching_film_pack/
content/publishing/imports/packs/unpacked/kabbalah_tree_of_life/
content/publishing/renders/gold-analysis/malas_three_veils_pack/
content/publishing/renders/gold-analysis/dvadasanta_axis_pack/`,
          
          'rhetorical_map': `Read the essay and extract transformations from each passage.
For each: passage_id, text_preview, rhetorical_function, logical_relation.
transformation: { subject, operator (VERB), object, through[] }
Key question: what transformation does this passage assert?`,

          'visual_thesis': `Design the visual thesis. Generate THREE competing visual worlds with different materials, spatial models, motion verbs. For the selected world define: material_world, spatial_world, 5-8 motion_verbs, 4-7 recurring_systems with evolution arcs, color_semantics with hex codes (70% neutral, 10-20% secondary, 3-8% accent), ≥5 forbidden_cliches, opening_to_closing_resolution.`,

          'motif_manufacturability': `Score every motif 0-2 on 8 criteria (max 16): concrete nouns, part inventory (2-8), motion_verbs, material rendering, spatial organisation, PIL feasibility, concept specificity, no-text intelligibility.
Minimum pass: 12/16. Output JSON: { pass, overall_score, max_score, motifs: [{ name, score, errors }] }`,

          'storyboard': `CRITICAL: Output in JSONL format — one JSON object per line, no markdown.
Each shot 5-10 seconds. Average 5-8s. No shot >20s.
Design shots chapter by chapter (6-12 per chapter).
Each line: {"shot_id":"s001","spoken_passage":"...","chapter":"1","duration_seconds":6.5,"visual_mode":"interior_flame","visual_audio_alignment":{"transformation_asserted":"...","what_viewer_sees":"...","why_it_matches":"..."},"concrete_motif":{"motif_id":"interior_flame","display_name":"...","drawable_parts":["..."],"motion_verbs":["..."]},"continuity":{"inherits":[],"transforms":"","hands_off":[]},"bad_first_visual":"...","rejected_because":"...","no_narration_test":"PASS","text_required":false}`,

          'storyboard_review': `Adversarially review the storyboard. Check for: alignment failures, abstract motifs, gold copying, composition repetition, text overuse (>15%), missing continuity. Output violations with shot_id, severity (fail/warn), explanation.`,

          'pack_composition': `Write three files: AGENT_KNOWLEDGE_DOSSIER.md (aim, visual rules, guardrails, style family, new motifs), STYLE_EVOLUTION.md (inheritance chain, new motifs, deprecated cliches, vocabulary shift), PRODUCTION_BLUEPRINT.md (shot count, chapters, transitions, technical specs).`,

          'render_plan': `Plan each shot's PIL implementation. For each: function_name, estimated_lines (15-40), primitives[], layers[], 3+ animation_phases with different easings, text_elements[], semantic_risk.`,

          'code_review': `Write render_pack.py with custom scene functions. NO dispatch table. 15-40 lines per function. Pure PIL + ffmpeg. Colors from palette. In code_review.json, self-report violations.`,

          'draft_render': `Run the render script at low resolution. Generate scenes/*.mp4 and draft_report.json with shots_rendered, errors, total_duration.`,

          'visual_qc': `Run visual QC: silent-film test (can you infer the concept without audio?), similarity check (adjacent shots distinct?), motion check (meaningful motion?). Output: { pass, summary, failures, warnings }`,

          'final_render': `Generate per-shot audio with Edge TTS, render at full resolution, mux audio with video, produce final.mp4, alignment_report.json (AV drift <0.10s), contact_sheet.jpg.`
        };
        
        prompt += prompts[stage] || `Complete stage ${stage}. Output to ${outputDir}/.`;
        prompt += `\n\nOutput format: valid JSON. No markdown, no shell commands, no explanations outside the JSON.`;

        // Call LLM via Workers AI or opencode proxy
        let llmResponse = '';
        
        try {
          // Try Workers AI first
          const aiResp = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000,
          });
          llmResponse = aiResp.response || JSON.stringify(aiResp);
        } catch (aiErr) {
          // Fallback to opencode API
          const apiKey = 'sk-SDjjQ8NtTdpM2OmWl3GXDrPlhcQiLvZln60mSVVcJQ3rkg7trYHQoLKshcKSeg0Y';
          const apiResp = await fetch('https://opencode.ai/zen/go/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-v4-flash', messages: [{ role: 'user', content: prompt }], max_tokens: 4000 }),
          });
          const apiData = await apiResp.json();
          llmResponse = apiData.choices?.[0]?.message?.content || JSON.stringify(apiData);
        }

        // Save response to R2 (if available) and D1
        const outputDir = row.output_dir || `content/publishing/renders/${slug}/v1`;
        const r2Key = `${outputDir}/${stage}.json`;
        try {
          await env.FACTORY_ASSETS.put(r2Key, llmResponse);
        } catch (r2Err) {
          // R2 may not be available
        }

        // Mark stage as passed and advance
        const nextStage = STAGES[stageIdx + 1] || 'complete';
        await env.FACTORY_DB.prepare(
          "UPDATE stage_history SET status = 'passed' WHERE job_slug = ? AND stage = ? AND status = 'running'"
        ).bind(slug, stage).run();
        await env.FACTORY_DB.prepare(
          "UPDATE jobs SET current_stage = ?, updated_at = datetime('now') WHERE slug = ?"
        ).bind(nextStage, slug).run();

        return json({
          slug,
          stage,
          result: 'passed',
          next_stage: nextStage,
          llm_preview: llmResponse.slice(0, 200),
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return json({ error: 'not found' }, 404);
  },
};
