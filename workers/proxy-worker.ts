const OPENCODE_API = "https://opencode.ai/zen/go/v1";
const ALLOWED_ORIGINS = ["*"];

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*") ? "*" : origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const path = url.pathname.replace(/^\/proxy/, "") || "/v1/chat/completions";
    const targetUrl = `${OPENCODE_API}${path}`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const authHeader = request.headers.get("Authorization");
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const init: RequestInit = {
        method: request.method,
        headers,
      };

      if (request.method === "POST" || request.method === "PUT") {
        const body = await request.text();
        init.body = body;
      }

      const response = await fetch(targetUrl, init);
      const responseBody = await response.text();

      return new Response(responseBody, {
        status: response.status,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: { message: error.message } }), {
        status: 500,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json",
        },
      });
    }
  },
};
