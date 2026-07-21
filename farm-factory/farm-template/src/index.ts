import { WorkflowEntrypoint } from "cloudflare:workers";

// ============================================================
// Environment bindings for a farm instance
// ============================================================
export interface Env {
  // Config
  FARM_ID: string;
  YOUTUBE_API_KEY: string;
  AI_GATEWAY_ID: string;
  DEEPGRAM_API_KEY: string;

  // D1
  DB: D1Database;

  // R2
  SOURCES: R2Bucket;
  ASSETS: R2Bucket;
  OUTPUTS: R2Bucket;

  // Queues
  PIPELINE_QUEUE: Queue;
  RENDER_QUEUE: Queue;

  // AI
  AI: any;

  // Workflows
  PRODUCE_VIDEO: Workflow;
  BACKFILL_ROS: Workflow;
  VALIDATE_ALL: Workflow;
}

// ============================================================
// Request Router
// ============================================================
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // ---- Object CRUD endpoints ----
    if (url.pathname.startsWith("/api/objects/")) {
      return handleObjectRequest(request, env);
    }

    // ---- Research endpoints ----
    if (url.pathname === "/api/research/daily-scan") {
      return handleDailyScan(request, env);
    }
    if (url.pathname === "/api/research/gap-map") {
      return handleGapMap(request, env);
    }
    if (url.pathname === "/api/research/hypothesis") {
      return handleHypothesis(request, env);
    }

    // ---- Factory endpoints ----
    if (url.pathname === "/api/factory/produce") {
      return handleProduce(request, env);
    }
    if (url.pathname === "/api/factory/approve-treatment") {
      return handleApproveTreatment(request, env);
    }
    if (url.pathname === "/api/factory/approve-publish") {
      return handleApprovePublish(request, env);
    }
    if (url.pathname === "/api/factory/status") {
      return handleWorkflowStatus(request, env);
    }

    // ---- Analytics endpoints ----
    if (url.pathname === "/api/analytics/hypotheses") {
      return handleHypothesisResults(request, env);
    }
    if (url.pathname === "/api/analytics/metrics") {
      return handleMetrics(request, env);
    }

    // ---- Cron triggers ----
    if (url.pathname === "/__cron/daily-research") {
      return handleCronDailyResearch(env);
    }
    if (url.pathname === "/__cron/weekly-gap") {
      return handleCronWeeklyGap(env);
    }
    if (url.pathname === "/__cron/monthly-rebuild") {
      return handleCronMonthlyRebuild(env);
    }

    return new Response("Not found", { status: 404 });
  },

  // Cron handlers
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    switch (event.cron) {
      case "0 6 * * *":
        await handleCronDailyResearch(env);
        break;
      case "0 12 * * 1":
        await handleCronWeeklyGap(env);
        break;
      case "0 0 1 * *":
        await handleCronMonthlyRebuild(env);
        break;
    }
  },
};

// ============================================================
// Object CRUD
// ============================================================
async function handleObjectRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  // /api/objects/{type}/{id}
  const objectType = segments[2]; // ro, po, ho, work, essay, storyboard, video
  const objectId = segments[3];

  if (!objectType || !["ro", "po", "ho", "work", "essay", "storyboard", "video"].includes(objectType)) {
    return new Response("Invalid object type", { status: 400 });
  }

  const tableMap: Record<string, string> = {
    ro: "research_objects",
    po: "philosopher_objects",
    ho: "hypothesis_objects",
    work: "works",
    essay: "essays",
    storyboard: "storyboards",
    video: "video_objects",
  };

  const idField: Record<string, string> = {
    ro: "ro_id",
    po: "po_id",
    ho: "ho_id",
    work: "work_id",
    essay: "essay_id",
    storyboard: "storyboard_id",
    video: "video_id",
  };

  const table = tableMap[objectType];
  const idCol = idField[objectType];

  if (request.method === "GET" && objectId) {
    const result = await env.DB.prepare(
      `SELECT * FROM ${table} WHERE ${idCol} = ? AND farm_id = ?`
    ).bind(objectId, env.FARM_ID).first();
    if (!result) return new Response("Not found", { status: 404 });
    return Response.json(result);
  }

  if (request.method === "GET" && !objectId) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM ${table} WHERE farm_id = ? ORDER BY created_at DESC LIMIT 50`
    ).bind(env.FARM_ID).all();
    return Response.json(results);
  }

  if (request.method === "POST") {
    const body = await request.json() as any;
    const id = body[idCol] || crypto.randomUUID();
    body.farm_id = env.FARM_ID;
    body[idCol] = id;
    body.created_at = new Date().toISOString();
    body.updated_at = new Date().toISOString();

    const columns = Object.keys(body).join(", ");
    const placeholders = Object.keys(body).map(() => "?").join(", ");
    const values = Object.values(body);

    await env.DB.prepare(
      `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`
    ).bind(...values).run();

    return Response.json({ id, status: "created" });
  }

  if (request.method === "PATCH" && objectId) {
    const body = await request.json() as any;
    delete body[idCol];
    delete body.farm_id;
    delete body.created_at;
    body.updated_at = new Date().toISOString();

    const setClause = Object.keys(body).map(k => `${k} = ?`).join(", ");
    const values = Object.values(body);

    await env.DB.prepare(
      `UPDATE ${table} SET ${setClause} WHERE ${idCol} = ? AND farm_id = ?`
    ).bind(...values, objectId, env.FARM_ID).run();

    return Response.json({ status: "updated" });
  }

  if (request.method === "DELETE" && objectId) {
    await env.DB.prepare(
      `DELETE FROM ${table} WHERE ${idCol} = ? AND farm_id = ?`
    ).bind(objectId, env.FARM_ID).run();

    // Also delete associated R2 objects
    if (objectType === "ro") {
      await env.SOURCES.delete(`ros/${objectId}/passages.json`);
    }
    if (objectType === "essay") {
      const essay = await env.DB.prepare(
        `SELECT body_key FROM essays WHERE essay_id = ?`
      ).bind(objectId).first<any>();
      if (essay?.body_key) await env.ASSETS.delete(essay.body_key);
    }

    return Response.json({ status: "deleted" });
  }

  return new Response("Method not allowed", { status: 405 });
}

// ============================================================
// Research: Daily Scan
// ============================================================
async function handleCronDailyResearch(env: Env): Promise<Response> {
  // 1. Fetch new uploads from all tracked channels
  const { results: channels } = await env.DB.prepare(
    `SELECT channel_id FROM channels WHERE farm_id = ?`
  ).bind(env.FARM_ID).all<any>();

  for (const channel of channels) {
    await harvestChannelUploads(channel.channel_id, env);
  }

  // 2. Compute breakout scores (OLS residual)
  await computeBreakoutScores(env);

  // 3. Thumbnail cascade
  await runThumbnailCascade(env);

  // 4. Hook classification on top breakouts
  await classifyHooks(env);

  // 5. Update gap map
  await updateGapMap(env);

  // 6. Compute opportunity scores
  await computeOpportunityScores(env);

  // 7. Push high-opportunity topics to pipeline queue
  const { results: opportunities } = await env.DB.prepare(
    `SELECT query, topic_cluster, opportunity_score
     FROM gap_map
     WHERE farm_id = ? AND snapshot_date = date('now')
     AND opportunity_score >= 0.5
     ORDER BY opportunity_score DESC
     LIMIT 5`
  ).bind(env.FARM_ID).all();

  for (const opp of opportunities) {
    await env.PIPELINE_QUEUE.send({
      type: "new_topic",
      query: opp.query,
      cluster: opp.topic_cluster,
      score: opp.opportunity_score,
    });
  }

  // Log API usage
  await logAPIUsage("daily_research", 60, "search_list", env);

  return Response.json({ status: "done", channels: channels.length, opportunities: opportunities.length });
}

async function harvestChannelUploads(channelId: string, env: Env): Promise<void> {
  // Uses YouTube Data API playlistItems.list + videos.list
  // Stored in feature_store table
  // Implementation depends on YouTube API client
}

async function computeBreakoutScores(env: Env): Promise<void> {
  // For each channel with >=20 videos: fit OLS log(views) ~ log(age_days)
  // Residual = breakout score
  // Then regress residual against calendar time to strip momentum
  // Store in feature_store
}

async function runThumbnailCascade(env: Env): Promise<void> {
  // All thumbnails: DETR for face/object count (cheap)
  // Top 20% of recent breakouts: LLaVA for full analysis
}

async function classifyHooks(env: Env): Promise<void> {
  // Top 5 daily breakouts: fetch transcript, classify first 150 words
  // Update hook_library
}

async function updateGapMap(env: Env): Promise<void> {
  // 48 searches (12 themes x 4, alternating IN/US)
  // 12 velocity searches
  // Store results in gap_map table
}

async function computeOpportunityScores(env: Env): Promise<void> {
  // topic_opportunity = 0.30*clamp(gap) + 0.25*clamp(lag) + 0.20*clamp(breakout) + 0.15*clamp(demand) + 0.10*clamp(pageviews)
  // UPDATE gap_map SET opportunity_score = ...
}

// ============================================================
// Weekly Gap Map
// ============================================================
async function handleCronWeeklyGap(env: Env): Promise<Response> {
  // Full gap map rebuild
  // Wikipedia pageview velocity for top topics
  // Google Trends for western_demand
  // Academic signal update (if applicable)
  // Hypothesis testing against historical corpus

  // Test hypotheses against feature_store
  await testHistoricalHypotheses(env);

  return Response.json({ status: "weekly_gap_done" });
}

async function testHistoricalHypotheses(env: Env): Promise<void> {
  // For each pending hypothesis in hypothesis_results where test_source = 'historical_corpus':
  // Query feature_store for relevant videos
  // Compute effect size and significance
  // Mark as strong_prior, weak_prior, or rejected
}

// ============================================================
// Monthly Rebuild
// ============================================================
async function handleCronMonthlyRebuild(env: Env): Promise<Response> {
  // Full re-computation of all breakout scores
  // Re-cluster topics
  // Rebuild gap map from scratch
  // Fact-check audit on all published content
  return Response.json({ status: "monthly_rebuild_done" });
}

// ============================================================
// Factory: Produce Video Workflow
// ============================================================
export class ProduceVideoWorkflow extends WorkflowEntrypoint<Env> {
  async run(event: any, step: any) {
    const { query, cluster, score } = event.payload;

    // Step 1: Research gap
    const gapData = await step.do("research_gap", async () => {
      const result = await this.env.DB.prepare(
        `SELECT * FROM gap_map WHERE query = ? AND farm_id = ? ORDER BY snapshot_date DESC LIMIT 1`
      ).bind(query, this.env.FARM_ID).first();
      return result;
    }, { retries: { limit: 2 } });

    // Step 2: Build Research Pack (sourced claims, not prose)
    const researchPack = await step.do("build_research_pack", async () => {
      return await buildResearchPack(query, gapData, this.env);
    }, { retries: { limit: 2 } });

    // Step 3: Fact-check gate on research pack (every claim must have a source)
    await step.do("fact_check", async () => {
      const gates = await runFactCheck(researchPack);
      if (!gates.allPass) throw new Error(`Fact check failed: ${gates.failures.join(", ")}`);
      return gates;
    }, { retries: { limit: 2 } });

    // Step 4: Wait for human approval (research pack + sources)
    await step.do("wait_for_approval", async () => {
      return await step.waitForApproval({
        email: `producer@farm-${this.env.FARM_ID}`,
        message: `Review research pack for: ${query}`,
        data: researchPack,
      });
    });

    // Step 5: Generate treatment (from approved research pack)
    const treatment = await step.do("generate_treatment", async () => {
      return await generateTreatment(query, gapData, researchPack, this.env);
    }, { retries: { limit: 2 } });

    // Step 6: Save as Hypothesis Object
    const hoId = await step.do("create_hypothesis", async () => {
      const ho = {
        ho_id: `HO-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).slice(2, 5)}`,
        farm_id: this.env.FARM_ID,
        created: new Date().toISOString(),
        hypothesis: treatment.hypothesis,
        content_spec: treatment.contentSpec,
        status: "in_production",
      };
      const columns = Object.keys(ho).join(", ");
      const placeholders = Object.keys(ho).map(() => "?").join(", ");
      await this.env.DB.prepare(
        `INSERT OR REPLACE INTO hypothesis_objects (${columns}) VALUES (${placeholders})`
      ).bind(...Object.values(ho)).run();
      return ho.ho_id;
    });

    // Step 6: Write script
    const script = await step.do("write_script", async () => {
      const result = await generateScript(treatment, this.env);
      const gates = checkScriptGates(result);
      if (!gates.allPass) throw new Error(`Script gates failed: ${gates.failures}`);
      return result;
    }, { retries: { limit: 3, backoff: "exponential" } });

    // Step 7: Generate audio
    const audioUrl = await step.do("generate_audio", async () => {
      return await generateAudio(script, this.env);
    }, { timeout: "5 minutes" });

    // Step 8: Create thumbnail
    const thumbnailUrls = await step.do("create_thumbnail", async () => {
      return await composeThumbnail(treatment, this.env);
    });

    // Step 9: Push render job
    const jobId = await step.do("push_render", async () => {
      const job = {
        type: "render_video",
        script,
        audioUrl,
        thumbnailUrls,
        farmId: this.env.FARM_ID,
      };
      await this.env.RENDER_QUEUE.send(job);
      return crypto.randomUUID();
    });

    // Step 10: Wait for render completion
    await step.do("wait_for_render", async () => {
      // Poll render queue or wait for webhook
      // For now, assume render takes ~30 min
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { status: "rendered" };
    });

    // Step 11: Publish (requires approval)
    await step.do("wait_for_publish_approval", async () => {
      return await step.waitForApproval({
        email: `producer@farm-${this.env.FARM_ID}`,
        message: `Approve publish for: ${treatment.title}`,
        data: { title: treatment.title, hoId },
      });
    });

    // Step 12: Upload to YouTube
    const youtubeId = await step.do("publish_to_youtube", async () => {
      return await publishToYouTube(treatment, audioUrl, thumbnailUrls, this.env);
    });

    // Step 13: Save video object
    await step.do("save_video", async () => {
      const video = {
        video_id: youtubeId,
        farm_id: this.env.FARM_ID,
        youtube_id: youtubeId,
        title: treatment.title,
        hypothesis_ids: JSON.stringify([hoId]),
        published_at: new Date().toISOString(),
      };
      const columns = Object.keys(video).join(", ");
      const placeholders = Object.keys(video).map(() => "?").join(", ");
      await this.env.DB.prepare(
        `INSERT OR REPLACE INTO video_objects (${columns}) VALUES (${placeholders})`
      ).bind(...Object.values(video)).run();
    });

    // Step 14: Start hypothesis monitoring
    await step.do("start_monitoring", async () => {
      await this.env.DB.prepare(
        `UPDATE hypothesis_objects SET status = 'monitoring', published_date = ? WHERE ho_id = ?`
      ).bind(new Date().toISOString(), hoId).run();
    });

    return { hoId, youtubeId, status: "published" };
  }
}

// ============================================================
// Helper functions (stubs — real implementations in lib/)
// ============================================================
async function buildResearchPack(query: string, gapData: any, env: Env): Promise<any> {
  // Build a research pack with sourced claims and exact locators
  // Each claim must have a source before any prose is written
  // Returns { claims: [{ claim, certainty, sources: [{ source_id, locator }] }], fact_check: {} }
  return { claims: [], fact_check: { all_claims_sourced: true } };
}

async function generateTreatment(query: string, gapData: any, researchPack: any, env: Env): Promise<any> {
  // Call AI Gateway → DeepSeek with gap data + research pack
  // Research pack ensures all claims are sourced before treatment is written
  // Returns { title, hypothesis, contentSpec, claims[], sources[] }
  return { title: "Sample", hypothesis: "H", contentSpec: {}, claims: [], sources: [] };
}

async function runFactCheck(researchPack: any): Promise<any> {
  // Gate F01: Every claim has a source
  // Gate F02: Sources verified against Crossref / Semantic Scholar / Wikipedia
  // Gate F03: Claims marked with certainty level
  // Gate F04: No core factual claim lacks a source
  const failures = [];
  for (const claim of researchPack.claims || []) {
    if (!claim.sources || claim.sources.length === 0) {
      failures.push(`Claim lacks source: ${claim.claim?.substring(0, 80)}`);
    }
    if (!claim.certainty) {
      failures.push(`Claim lacks certainty level: ${claim.claim?.substring(0, 80)}`);
    }
  }
  return { allPass: failures.length === 0, failures };
}

async function generateScript(treatment: any, env: Env): Promise<any> {
  // 3-pass essay writing with validation gates
  return { body: [], gates: { allPass: true } };
}

function checkScriptGates(script: any): any {
  // P1_A–P1_F, P2_A–P2_F, P3_A–P3_H
  return { allPass: true, failures: [] };
}

async function generateAudio(script: any, env: Env): Promise<string> {
  // Deepgram Aura 2 TTS via Workers AI
  return "r2://audio/script-123.mp3";
}

async function composeThumbnail(treatment: any, env: Env): Promise<string[]> {
  // Deterministic composition from public domain art
  return ["r2://thumbnails/variant-1.jpg"];
}

async function publishToYouTube(treatment: any, audioUrl: string, thumbnails: string[], env: Env): Promise<string> {
  // YouTube Data API videos.insert (1,600 quota)
  return "youtube-id-123";
}

async function logAPIUsage(endpoint: string, calls: number, bucket: string, env: Env): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  await env.DB.prepare(
    `INSERT INTO api_usage (date, farm_id, endpoint, calls, bucket)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date, endpoint) DO UPDATE SET calls = calls + ?`
  ).bind(date, env.FARM_ID, endpoint, calls, bucket, calls).run();
}

// ============================================================
// Stub handlers (routed above)
// ============================================================
async function handleDailyScan(req: Request, env: Env): Promise<Response> { return handleCronDailyResearch(env); }
async function handleGapMap(req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM gap_map WHERE farm_id = ? ORDER BY opportunity_score DESC LIMIT 20`
  ).bind(env.FARM_ID).all();
  return Response.json(results);
}
async function handleHypothesis(req: Request, env: Env): Promise<Response> { return Response.json({}); }
async function handleProduce(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as any;
  const instance = await env.PRODUCE_VIDEO.create({ payload: body });
  return Response.json({ id: instance.id, status: "started" });
}
async function handleApproveTreatment(req: Request, env: Env): Promise<Response> { return Response.json({}); }
async function handleApprovePublish(req: Request, env: Env): Promise<Response> { return Response.json({}); }
async function handleWorkflowStatus(req: Request, env: Env): Promise<Response> { return Response.json({}); }
async function handleHypothesisResults(req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM hypothesis_results WHERE farm_id = ? ORDER BY tested_date DESC`
  ).bind(env.FARM_ID).all();
  return Response.json(results);
}
async function handleMetrics(req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT status, COUNT(*) as count FROM hypothesis_objects WHERE farm_id = ? GROUP BY status`
  ).bind(env.FARM_ID).all();
  return Response.json(results);
}
