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

    return json({ error: 'not found' }, 404);
  },
};
