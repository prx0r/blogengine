// farm-template/src/index.ts
// Agnostic farm Worker. Parameterized by FARM_ID. No niche-specific logic.

import { WorkflowEntrypoint } from "cloudflare:workers";

export interface Env {
  FARM_ID: string;
  YOUTUBE_API_KEY: string;
  AI_GATEWAY_ID: string;
  DEEPGRAM_API_KEY: string;
  AUDIENCE_PROMISE: string;
  EVIDENCE_STANDARDS: string;
  FORBIDDEN_FRAMINGS: string;
  DB: D1Database;
  ASSETS: R2Bucket;
  GLOBAL_LIBRARY: R2Bucket;
  PIPELINE_QUEUE: Queue;
  RENDER_QUEUE: Queue;
  AI: any;
  PRODUCE_VIDEO: Workflow;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // ---- Research endpoints ----
    if (url.pathname === "/api/research/gap-map") return handleGapMap(env);
    if (url.pathname === "/api/research/opportunities") return handleOpportunities(env);

    // ---- Factory endpoints ----
    if (method === "POST" && url.pathname === "/api/factory/produce") return handleProduce(request, env);
    if (method === "POST" && url.pathname.startsWith("/api/factory/approve/")) return handleApprove(request, url, env);

    // ---- Cron endpoints (protected from public by Cloudflare Access or token) ----
    if (url.pathname === "/__cron/daily-research") return handleCronDailyResearch(env);
    if (url.pathname === "/__cron/weekly-gap") return handleCronWeeklyGap(env);
    if (url.pathname === "/__cron/monthly-maintenance") return handleCronMonthly(env);

    return new Response(`Farm ${env.FARM_ID}: endpoint not found`, { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    switch (event.cron) {
      case "0 6 * * *": await handleCronDailyResearch(env); break;
      case "0 12 * * 1": await handleCronWeeklyGap(env); break;
      case "0 0 1 * *": await handleCronMonthly(env); break;
    }
  },
};

// ── Research Pipeline ───────────────────────────────────────────

async function handleCronDailyResearch(env: Env): Promise<Response> {
  console.log(`[${env.FARM_ID}] Daily research started`);

  // 1. Fetch new uploads from all tracked channels
  const { results: channels } = await env.DB.prepare(
    `SELECT channel_id FROM channels WHERE farm_id = ?`
  ).bind(env.FARM_ID).all<any>();

  for (const ch of channels) {
    await harvestChannelUploads(ch.channel_id, env);
  }

  // 2. Compute breakout scores (OLS residual per channel)
  await computeBreakoutScores(env);

  // 3. Classify thumbnails (cheap features on all, LLaVA on stratified sample)
  await classifyThumbnails(env);

  // 4. Update gap map scores from collected search data
  await updateGapMap(env);

  // 5. Push high-opportunity topics to pipeline queue
  await pushOpportunities(env);

  console.log(`[${env.FARM_ID}] Daily research complete`);
  return Response.json({ status: "ok", farm: env.FARM_ID });
}

async function handleCronWeeklyGap(env: Env): Promise<Response> {
  // Full gap map recomputation from rolling 7-day window
  // Wikipedia pageview velocity for top topics
  // Hypothesis testing against historical corpus
  return Response.json({ status: "ok" });
}

async function handleCronMonthly(env: Env): Promise<Response> {
  // Recompute all breakout scores from scratch
  // Re-cluster topics
  // Fact-check audit on published content
  return Response.json({ status: "ok" });
}

// ── Factory Pipeline ────────────────────────────────────────────

export class ProduceVideoWorkflow extends WorkflowEntrypoint<Env> {
  async run(event: any, step: any) {
    const { topic, cluster } = event.payload;

    const workflowId = crypto.randomUUID();

    // Step 1: Build research pack with sourced claims
    const researchPack = await step.do("build_research_pack", async () => {
      return await buildResearchPack(topic, this.env);
    }, { retries: { limit: 2 } });

    // Step 2: Fact-check (every claim needs a source)
    await step.do("fact_check", async () => {
      const gates = await runFactCheck(researchPack, this.env);
      if (!gates.allPass) throw new Error(`Fact-check failed: ${gates.failures.join(", ")}`);
    });

    // Step 3: Human approval
    await step.do("wait_for_approval", async () => {
      await reportStatus(this.env, workflowId, "waiting_approval", "treatment");
      return await step.waitForApproval({
        email: `producer@farm-${this.env.FARM_ID}`,
        message: `Review research pack for: ${topic}`,
        data: researchPack,
      });
    });

    // Step 4: Generate script (HOST/AI-COHOST format)
    const script = await step.do("write_script", async () => {
      return await generateScript(topic, researchPack, this.env);
    }, { retries: { limit: 3 } });

    // Step 5: Voiceover (human records HOST lines)
    await step.do("wait_for_voiceover", async () => {
      await reportStatus(this.env, workflowId, "waiting_voiceover", "script");
      return await step.waitForApproval({
        email: `producer@farm-${this.env.FARM_ID}`,
        message: `Record HOST lines for: ${topic}`,
        data: script,
      });
    });

    // Step 6: Generate AI-COHOST audio via TTS
    await step.do("generate_audio", async () => {
      return await generateAIAudio(script, this.env);
    });

    // Step 7: Compile and render
    await step.do("render", async () => {
      return await compileVideo(script, this.env);
    });

    // Step 8: Publish (requires human approval)
    await step.do("wait_for_publish", async () => {
      return await step.waitForApproval({
        email: `producer@farm-${this.env.FARM_ID}`,
        message: `Approve publish for: ${topic}`,
      });
    });

    // Publish to YouTube
    await step.do("publish", async () => {
      return await publishToYouTube(topic, this.env);
    });

    return { workflowId, status: "published" };
  }
}

// ── Helper Stubs — ALL EMPTY. Must be implemented before farm can run. ──
// The YouTube API client, research pipeline, and content generation functions
// don't exist yet. This is a scaffold, not a working system.
//
// Implementation order:
// 1. lib/youtube.ts — YouTube Data API client (search, videos, channels, playlistItems)
// 2. lib/trends.ts — Google Trends client (western_demand signal)
// 3. research/daily.ts — channel harvest → breakout scores → thumbnails → gap map
// 4. content/treatment.ts — research pack → treatment → script (HOST/AI-COHOST)
// 5. content/audio.ts — Deepgram Aura 2 TTS for AI-COHOST lines
// 6. content/publish.ts — YouTube upload via API
// See farm-template/docs/01-SETUP.md for full build order.
//
// The WorkflowEntrypoint and step.waitForApproval() below ARE real
// Cloudflare Workflows APIs (docs.api-ref/cloudflare.md). The stubs
// above are what they call — replace them with real implementations.

async function harvestChannelUploads(channelId: string, env: Env) { throw new Error("Not implemented: lib/youtube.ts needed"); }
async function computeBreakoutScores(env: Env) { throw new Error("Not implemented: research/daily.ts needed"); }
async function classifyThumbnails(env: Env) { /* TODO */ }
async function updateGapMap(env: Env) { /* TODO */ }
async function pushOpportunities(env: Env) { /* TODO */ }
async function buildResearchPack(topic: string, env: Env) { return { claims: [] }; }
async function runFactCheck(pack: any, env: Env) { return { allPass: true, failures: [] }; }
async function generateScript(topic: string, pack: any, env: Env) { return { body: [] }; }
async function generateAIAudio(script: any, env: Env) { return "url"; }
async function compileVideo(script: any, env: Env) { return "url"; }
async function publishToYouTube(topic: string, env: Env) { return "youtube_id"; }
async function reportStatus(env: Env, workflowId: string, stage: string, item: string) {
  await env.DB.prepare(
    `INSERT INTO pipeline_stages (farm_id, workflow_id, stage, status) VALUES (?, ?, ?, 'running')`
  ).bind(env.FARM_ID, workflowId, stage).run();
}

// ── API Handlers ────────────────────────────────────────────────

async function handleGapMap(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM gap_map WHERE farm_id = ? ORDER BY opportunity_score DESC LIMIT 20`
  ).bind(env.FARM_ID).all();
  return Response.json(results);
}

async function handleOpportunities(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT query, topic_cluster, gap_score, opportunity_score, in_channel_count, us_channel_count
     FROM gap_map WHERE farm_id = ? AND opportunity_score >= 0.5
     ORDER BY opportunity_score DESC LIMIT 10`
  ).bind(env.FARM_ID).all();
  return Response.json(results);
}

async function handleProduce(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const instance = await env.PRODUCE_VIDEO.create({ payload: { topic: body.topic, cluster: body.cluster } });
  return Response.json({ workflowId: instance.id, status: "started" });
}

async function handleApprove(request: Request, url: URL, env: Env): Promise<Response> {
  // Called by dashboard: approve/reject a gate
  return Response.json({ status: "approved" });
}
