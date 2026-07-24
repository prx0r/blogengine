/**
 * Platinum Factory Controller — Cloudflare Worker (TypeScript)
 */
export interface Env {
  FACTORY_DB: D1Database;
  FACTORY_ASSETS: R2Bucket;
  AI: any;
  ENVIRONMENT?: string;
}

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

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      const result = await env.FACTORY_DB.prepare(
        'SELECT slug, current_stage, status, created_at FROM jobs ORDER BY created_at DESC'
      ).all();
      return json({ jobs: result.results || [] });
    }

    // POST /jobs
    if (method === 'POST' && path === '/jobs') {
      const body: any = await request.json();
      const slug = body.slug;
      const essayPath = body.essay_path || `scripts/expansion-essay-${slug}.md`;

      // Estimate audio duration
      const fs = await import('fs');
      let wordCount = 500;
      try { wordCount = fs.readFileSync(essayPath, 'utf-8').split(/\s+/).length; } catch {}

      const audioDur = (wordCount / 150) * 60;
      const minShots = Math.max(10, Math.round(audioDur / 9.0));
      const maxShots = Math.round(audioDur / 4.0) + 10;

      await env.FACTORY_DB.prepare(
        `INSERT INTO jobs (slug, essay_path, output_dir, production_mode, est_audio_duration,
          recommended_shot_count, minimum_shot_count, maximum_shot_count, current_stage, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pack_setup', 'active')`
      ).bind(
        slug, essayPath, `content/publishing/renders/${slug}/v1`, 'film_pack',
        Math.round(audioDur * 10) / 10, Math.round(audioDur / 6.5),
        minShots, maxShots
      ).run();

      return json({ slug, stage: 'pack_setup', audio_duration: Math.round(audioDur * 10) / 10 });
    }

    // GET /jobs/:slug
    const match = path.match(/^\/jobs\/([^/]+)$/);
    if (match && method === 'GET') {
      const slug = match[1];
      const row = await env.FACTORY_DB.prepare('SELECT * FROM jobs WHERE slug = ?').bind(slug).first();
      if (!row) return json({ error: 'not found' }, 404);
      return json(row);
    }

    return json({ error: 'not found' }, 404);
  },
};
