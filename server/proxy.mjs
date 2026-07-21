import http from "http";

const OPENCODE_API = "https://opencode.ai/zen/go/v1/chat/completions";
const API_KEY = "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75";
const PORT = process.env.PORT || 3456;
const ALLOWED_ORIGIN = process.env.ORIGIN || "*";

function writeJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.method !== "POST" || req.url !== "/api/chat") {
    res.writeHead(404);
    return res.end();
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const parsed = JSON.parse(body);

    const apiRes = await fetch(OPENCODE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: parsed.model || "deepseek-v4-flash",
        messages: parsed.messages,
        temperature: parsed.temperature ?? 0.4,
        max_tokens: parsed.max_tokens ?? 4096,
      }),
    });

    const data = await apiRes.json();
    writeJson(res, apiRes.status, data);
  } catch (e) {
    writeJson(res, 500, { error: { message: e.message } });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🧙 Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
});
