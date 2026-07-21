import crypto from "node:crypto";
import http from "node:http";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET first.");
}

const port = Number(process.env.YOUTUBE_OAUTH_PORT ?? 53682);
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
const state = crypto.randomBytes(24).toString("hex");
const scopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];
const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizeUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: scopes.join(" "),
  access_type: "offline",
  prompt: "consent",
  state,
}).toString();

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", redirectUri);
  if (requestUrl.pathname !== "/oauth2callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (requestUrl.searchParams.get("state") !== state) {
    response.writeHead(400).end("State mismatch");
    return;
  }
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    response.writeHead(400).end(requestUrl.searchParams.get("error") ?? "Authorization code missing");
    return;
  }
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
    }),
  });
  const token = (await tokenResponse.json()) as {
    refresh_token?: string;
    access_token?: string;
    error_description?: string;
  };
  if (!tokenResponse.ok) {
    response.writeHead(500).end("Token exchange failed; check the terminal.");
    console.error(token.error_description ?? token);
  } else {
    response.writeHead(200, { "content-type": "text/plain" }).end("Authorization complete. Return to the terminal.");
    console.log("\nStore this securely in the Hermes environment:");
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token ?? "<not returned; revoke access and run again>"}`);
  }
  server.close();
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Open this URL in your browser:\n\n${authorizeUrl.toString()}\n`);
  console.log(`Waiting on ${redirectUri}`);
});
