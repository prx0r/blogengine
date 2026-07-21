#!/usr/bin/env node
/**
 * youtube-oauth-setup.mjs
 *
 * One-time OAuth setup for YouTube upload + analytics.
 * Run this on your local machine (where you can open a browser).
 * It prints a refresh token to store in ~/.hermes/.env
 *
 * Usage:
 *   GOOGLE_OAUTH_CLIENT_ID=... \
 *   GOOGLE_OAUTH_CLIENT_SECRET=... \
 *   node scripts/youtube-oauth-setup.mjs
 *
 * Scopes:
 *   - youtube.upload  — upload videos, set thumbnails
 *   - youtube.readonly — read video metadata
 *   - yt-analytics.readonly — read retention data
 */

import http from "node:http";
import crypto from "node:crypto";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.");
  console.error("Get these from https://console.cloud.google.com/apis/credentials");
  process.exit(1);
}

const port = 53682;
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
const state = crypto.randomBytes(24).toString("hex");

// 👇 CRITICAL: includes youtube.upload scope
const scopes = [
  "https://www.googleapis.com/auth/youtube.upload",
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
  const url = new URL(request.url ?? "/", redirectUri);
  if (url.pathname !== "/oauth2callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (url.searchParams.get("state") !== state) {
    response.writeHead(400).end("State mismatch");
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400).end(url.searchParams.get("error") ?? "No code");
    return;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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

  const token = await tokenRes.json();
  if (!tokenRes.ok) {
    response.writeHead(500).end("Token exchange failed.");
    console.error(token);
    server.close();
    return;
  }

  response.writeHead(200, { "content-type": "text/plain" }).end("✅ OAuth complete. Return to terminal.");

  console.log("\n✅ YouTube OAuth setup complete!");
  console.log("\nStore this in ~/.hermes/.env or the gateway env:\n");
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}`);
  console.log(`GOOGLE_OAUTH_ACCESS_TOKEN=${token.access_token}`);
  console.log(`\nOr just set YOUTUBE_ACCESS_TOKEN=${token.access_token} for short-term use.`);

  server.close();
});

server.listen(port, "127.0.0.1", () => {
  console.log("Open this URL in your browser:\n");
  console.log(authorizeUrl.toString());
  console.log(`\nWaiting for OAuth callback on http://127.0.0.1:${port}...`);
});
