/// <reference types="@cloudflare/workers-types" />

interface Env {
  YOUTUBE_API_KEY: string;
  KV: KVNamespace;
}

const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";
const DEFAULT_TTL = 3600;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" },
      });
    }

    const videoIds = url.searchParams.get("id");
    const part = url.searchParams.get("part") ?? "snippet,contentDetails,statistics";
    const cacheKey = videoIds ? `yt:videos:${videoIds}:${part}` : null;

    if (cacheKey) {
      const cached = await env.KV.get(cacheKey, "json");
      if (cached) {
        return Response.json(cached, { headers: { "CF-Cache-Status": "HIT", "Access-Control-Allow-Origin": "*" } });
      }
    }

    const apiUrl = new URL(`${YOUTUBE_API_ROOT}/videos`);
    apiUrl.searchParams.set("part", part);
    apiUrl.searchParams.set("key", env.YOUTUBE_API_KEY);
    if (videoIds) apiUrl.searchParams.set("id", videoIds);
    for (const [key, value] of url.searchParams) {
      if (!["key"].includes(key)) apiUrl.searchParams.set(key, value);
    }

    const response = await fetch(apiUrl);
    const data = await response.json() as Record<string, unknown>;

    if (response.ok && cacheKey) {
      await env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: DEFAULT_TTL });
    }

    return Response.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "CF-Cache-Status": response.ok ? "MISS" : "ERROR",
        "X-YouTube-Quota-Saved": response.ok && cacheKey ? "1" : "0",
      },
    });
  },
};
