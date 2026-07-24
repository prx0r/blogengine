import { D1Database, R2Bucket, Queue, Ai } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  SOURCES: R2Bucket;
  GOLDS: R2Bucket;
  UPLOADS: R2Bucket;
  RENDER_QUEUE: Queue;
  AI: Ai;
  ENVIRONMENT: string;
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function cors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }
  return null;
}

// ── JOBS ─────────────────────────────────────────────────────

async function listJobs(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT id, title, status, version, channel, duration_seconds, essay_id, mp4_key, created_at, updated_at FROM jobs ORDER BY updated_at DESC").all();
  return json(results);
}

async function createJob(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const id = body.id || `job-${Date.now()}`;
  await env.DB.prepare(
    "INSERT INTO jobs (id, essay_id, title, channel, essay_path) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, body.essay_id, body.title, body.channel || "Tantra Files", body.essay_path || "").run();
  if (body.shots) {
    for (let i = 0; i < body.shots.length; i++) {
      const s = body.shots[i];
      await env.DB.prepare(
        "INSERT INTO shots (id, job_id, sort_order, label, rhetorical_function, visual_treatment, duration_seconds, narration_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(`${id}-${i}`, id, i, s.label, s.rhetorical_function || "", s.visual_treatment || "", s.duration_seconds || 0, s.narration_text || "").run();
    }
  }
  return json({ ok: true, id }, 201);
}

async function getJob(id: string, env: Env): Promise<Response> {
  const job: any = await env.DB.prepare("SELECT * FROM jobs WHERE id = ?").bind(id).first();
  if (!job) return json({ error: "not found" }, 404);
  const { results: shots } = await env.DB.prepare("SELECT * FROM shots WHERE job_id = ? ORDER BY sort_order").bind(id).all();
  const { results: feedback } = await env.DB.prepare("SELECT * FROM feedback WHERE job_id = ? ORDER BY created_at DESC").bind(id).all();
  return json({ ...job, shots, feedback });
}

async function updateJob(id: string, req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const updates: string[] = [];
  const values: any[] = [];
  for (const [key, val] of Object.entries(body)) {
    if (["status", "version", "mp4_key", "duration_seconds", "title"].includes(key)) {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (!updates.length) return json({ error: "no valid fields" }, 400);
  updates.push("updated_at = datetime('now')");
  values.push(id);
  await env.DB.prepare(`UPDATE jobs SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

async function enqueueRender(id: string, env: Env): Promise<Response> {
  await env.RENDER_QUEUE.send({ jobId: id, action: "render" });
  await env.DB.prepare("UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?").bind("rendering", id).run();
  return json({ ok: true, queued: id });
}

// ── SHOTS ────────────────────────────────────────────────────

async function updateShot(jobId: string, shotId: string, req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const sid = `${jobId}-${shotId}`;
  const updates: string[] = [];
  const values: any[] = [];
  for (const [key, val] of Object.entries(body)) {
    if (["status", "mp4_key", "duration_seconds"].includes(key)) {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (!updates.length) return json({ error: "no valid fields" }, 400);
  values.push(sid);
  await env.DB.prepare(`UPDATE shots SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

// ── FEEDBACK ─────────────────────────────────────────────────

async function submitFeedback(jobId: string, req: Request, env: Env, shotId?: string): Promise<Response> {
  const body: any = await req.json();
  await env.DB.prepare(
    "INSERT INTO feedback (job_id, shot_id, author, rating, dimension, comment) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(jobId, shotId || null, body.author || "Thomas", body.rating || null, body.dimension || "", body.comment).run();
  return json({ ok: true }, 201);
}

// ── SCENES ───────────────────────────────────────────────────

async function listScenes(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM scenes ORDER BY pack, title LIMIT 100").all();
  return json(results);
}

async function searchScenes(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const { results } = await env.DB.prepare(
    "SELECT * FROM scenes WHERE title LIKE ? OR concepts LIKE ? LIMIT 30"
  ).bind(`%${q}%`, `%${q}%`).all();
  return json(results);
}

// ── ASSETS ───────────────────────────────────────────────────

async function serveAsset(key: string, env: Env): Promise<Response> {
  const obj = await env.ASSETS.get(key);
  if (!obj) return json({ error: "not found" }, 404);
  const ct = key.endsWith(".mp4") ? "video/mp4" : key.endsWith(".mp3") ? "audio/mpeg" : key.endsWith(".json") ? "application/json" : key.endsWith(".png") ? "image/png" : "application/octet-stream";
  return new Response(obj.body, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" } });
}

// ── GOLD ─────────────────────────────────────────────────────

async function registerGold(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  await env.DB.prepare(
    "INSERT INTO gold_standards (id, name, source_job_id, shot_count, avg_shot_duration, bpm) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(body.id, body.name, body.source_job_id, body.shot_count, body.avg_shot_duration, body.bpm).run();
  return json({ ok: true }, 201);
}

async function listGolds(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM gold_standards ORDER BY created_at DESC").all();
  return json(results);
}

async function listGoldFiles(env: Env): Promise<Response> {
  const objects = await env.UPLOADS.list({ prefix: "goldfiles/" });
  return json(objects.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded })));
}

async function listAssets(env: Env): Promise<Response> {
  const objects = await env.ASSETS.list();
  return json(objects.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded })));
}

// ── RENDER WEBHOOK ────────────────────────────────────────────

async function renderCallback(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const { jobId, status, mp4Key, duration } = body;
  if (status === "done") {
    await env.DB.prepare("UPDATE jobs SET status = ?, mp4_key = ?, duration_seconds = ?, updated_at = datetime('now') WHERE id = ?").bind("review", mp4Key || "", duration || 0, jobId).run();
  } else if (status === "failed") {
    await env.DB.prepare("UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?").bind("failed", jobId).run();
  }
  return json({ ok: true });
}

// ── ROUTER ────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsRes = cors(request);
    if (corsRes) return corsRes;

    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    try {
      if (path === "/api/factory/jobs" && method === "GET") return listJobs(env);
      if (path === "/api/factory/jobs" && method === "POST") return createJob(request, env);
      const jm = path.match(/^\/api\/factory\/jobs\/([^\/]+)$/);
      if (jm && method === "GET") return getJob(jm[1], env);
      if (jm && method === "PUT") return updateJob(jm[1], request, env);
      if (path.match(/^\/api\/factory\/jobs\/([^\/]+)\/render$/) && method === "POST") return enqueueRender(path.split("/")[4], env);

      const sm = path.match(/^\/api\/factory\/jobs\/([^\/]+)\/shots\/([^\/]+)$/);
      if (sm && method === "PUT") return updateShot(sm[1], sm[2], request, env);

      if (path.match(/^\/api\/factory\/jobs\/([^\/]+)\/feedback$/) && method === "POST") return submitFeedback(path.split("/")[4], request, env);
      const sfm = path.match(/^\/api\/factory\/jobs\/([^\/]+)\/shots\/([^\/]+)\/feedback$/);
      if (sfm && method === "POST") return submitFeedback(sfm[1], request, env, sfm[2]);

      if (path === "/api/factory/scenes" && method === "GET") return listScenes(env);
      if (path === "/api/factory/scenes/search" && method === "GET") return searchScenes(request, env);

      const am = path.match(/^\/api\/factory\/assets\/(.+)$/);
      if (am) return serveAsset(am[1], env);

      if (path === "/api/factory/gold" && method === "GET") return listGolds(env);
      if (path === "/api/factory/gold" && method === "POST") return registerGold(request, env);
      if (path === "/api/factory/gold/files" && method === "GET") return listGoldFiles(env);
      if (path === "/api/factory/render/callback" && method === "POST") return renderCallback(request, env);

      // Health check
      if (path === "/health" || path === "/") return json({ status: "ok", env: env.ENVIRONMENT });

      return json({ error: "not found" }, 404);
    } catch (e: any) {
      return json({ error: e.message || "internal error" }, 500);
    }
  },

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      const { jobId } = msg.body as any;
      await env.DB.prepare("UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?").bind("processing", jobId).run();
      msg.ack();
    }
  },
};