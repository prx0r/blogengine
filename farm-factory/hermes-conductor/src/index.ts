import { WorkflowEntrypoint } from "cloudflare:workers";

// ============================================================
// Hermes Conductor — Routes commands to farm instances
// ============================================================
// This Worker runs as a central API that Hermes calls via fetch().
// It maintains a registry of farms and routes commands to the correct one.

interface FarmRegistry {
  [farmId: string]: {
    name: string;
    baseUrl: string;
    niche: string;
    channelCount: number;
    status: "active" | "paused" | "archived";
    created: string;
  };
}

interface Env {
  // Farm registry stored in KV for persistence
  FARMS: KVNamespace;
  // API tokens for farm-to-farm auth
  API_TOKENS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // ---- Farm management ----
    if (method === "POST" && url.pathname === "/farms/create") {
      return createFarm(request, env);
    }
    if (method === "POST" && url.pathname.startsWith("/farms/")) {
      const farmId = url.pathname.split("/")[2];
      const action = url.pathname.split("/")[3];

      if (action === "deploy") return deployFarm(farmId, env);
      if (action === "pause") return pauseFarm(farmId, env);
      if (action === "resume") return resumeFarm(farmId, env);
      if (action === "archive") return archiveFarm(farmId, env);
    }
    if (method === "GET" && url.pathname === "/farms") {
      return listFarms(env);
    }

    // ---- Command routing ----
    // POST /farms/{farmId}/{command}
    // Commands: daily-research, produce, approve-treatment, approve-publish, gap-map, hypotheses, analytics
    if (method === "POST" && url.pathname.split("/").length === 4) {
      const farmId = url.pathname.split("/")[2];
      const command = url.pathname.split("/")[3];
      return routeCommand(farmId, command, request, env);
    }

    // ---- Cross-farm analytics ----
    if (method === "GET" && url.pathname === "/analytics") {
      return crossFarmAnalytics(env);
    }

    return new Response("Hermes Conductor: command not found", { status: 404 });
  },
};

async function createFarm(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const farmId = body.farmId || `farm-${Date.now()}`;
  const token = crypto.randomUUID();

  // Validate required fields
  if (!body.niche) return new Response("niche required", { status: 400 });
  if (!body.channelIds || !Array.isArray(body.channelIds) || body.channelIds.length < 5) {
    return new Response("At least 5 channelIds required", { status: 400 });
  }
  if (!body.topicClusters || !Array.isArray(body.topicClusters)) {
    return new Response("topicClusters required", { status: 400 });
  }

  const farm: FarmRegistry[string] = {
    name: body.name || farmId,
    baseUrl: body.baseUrl || `https://${farmId}.workers.dev`,
    niche: body.niche,
    channelCount: body.channelIds.length,
    status: "active",
    created: new Date().toISOString(),
  };

  await env.FARMS.put(farmId, JSON.stringify(farm));
  await env.API_TOKENS.put(farmId, token);

  // TODO: Trigger farm-template deployment pipeline
  // 1. cp -r farm-template/ farms/{farmId}/
  // 2. Replace {FARM_ID} with farmId in wrangler.jsonc
  // 3. Create D1 database
  // 4. Create R2 buckets
  // 5. Create Queues
  // 6. Insert channels into DB
  // 7. Insert topic clusters
  // 8. wrangler deploy

  return Response.json({
    farmId,
    token,
    status: "created",
    message: "Farm registered. Run deployment pipeline to activate.",
  });
}

async function deployFarm(farmId: string, env: Env): Promise<Response> {
  // Trigger deployment via Cloudflare API or GitHub Actions
  return Response.json({ farmId, status: "deploying" });
}

async function pauseFarm(farmId: string, env: Env): Promise<Response> {
  const farm = await getFarm(farmId, env);
  farm.status = "paused";
  await env.FARMS.put(farmId, JSON.stringify(farm));
  return Response.json({ farmId, status: "paused" });
}

async function resumeFarm(farmId: string, env: Env): Promise<Response> {
  const farm = await getFarm(farmId, env);
  farm.status = "active";
  await env.FARMS.put(farmId, JSON.stringify(farm));
  return Response.json({ farmId, status: "active" });
}

async function archiveFarm(farmId: string, env: Env): Promise<Response> {
  const farm = await getFarm(farmId, env);
  farm.status = "archived";
  await env.FARMS.put(farmId, JSON.stringify(farm));
  return Response.json({ farmId, status: "archived" });
}

async function listFarms(env: Env): Promise<Response> {
  const farms: FarmRegistry = {};
  const list = await env.FARMS.list();
  for (const key of list.keys) {
    const value = await env.FARMS.get(key.name);
    if (value) farms[key.name] = JSON.parse(value);
  }
  return Response.json(farms);
}

async function getFarm(farmId: string, env: Env): Promise<FarmRegistry[string]> {
  const data = await env.FARMS.get(farmId);
  if (!data) throw new Error(`Farm ${farmId} not found`);
  return JSON.parse(data);
}

async function routeCommand(farmId: string, command: string, request: Request, env: Env): Promise<Response> {
  const farm = await getFarm(farmId, env);
  const token = await env.API_TOKENS.get(farmId);

  if (farm.status === "paused") {
    return new Response(`Farm ${farmId} is paused`, { status: 403 });
  }
  if (farm.status === "archived") {
    return new Response(`Farm ${farmId} is archived`, { status: 410 });
  }

  // Route the command to the farm's Worker
  const farmUrl = `${farm.baseUrl}/api/${command.replace(/-/g, "/")}`;
  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Forward body for POST commands
  if (["produce", "approve-treatment", "approve-publish"].includes(command)) {
    const body = await request.json();
    requestInit.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(farmUrl, requestInit);
    const data = await response.json();
    return Response.json({ farmId, command, status: response.status, data });
  } catch (err: any) {
    return Response.json({ farmId, command, error: err.message }, { status: 502 });
  }
}

async function crossFarmAnalytics(env: Env): Promise<Response> {
  const farms = await env.FARMS.list();
  const results: any = {};

  for (const key of farms.keys) {
    const farm = JSON.parse(await env.FARMS.get(key.name) || "{}");
    try {
      const response = await fetch(`${farm.baseUrl}/api/analytics/metrics`);
      results[key.name] = await response.json();
    } catch {
      results[key.name] = { error: "unreachable" };
    }
  }

  return Response.json(results);
}
