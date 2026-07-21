import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import crypto from "crypto";
import OpenAI from "openai";

const parser = new Parser();

const deepseek = new OpenAI({
  baseURL: "https://opencode.ai/zen/go/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75",
});

async function fetchWithTimeout(url: string, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function discoverFeedUrl(homepage: string): Promise<string | null> {
  const paths = ["/feed", "/rss", "/feed.xml"];
  for (const p of paths) {
    try {
      const url = new URL(p, homepage).href;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const text = await res.text();
        if (text.includes("<rss") || text.includes("<feed") || text.includes("<rdf")) {
          return url;
        }
      }
    } catch {
      continue;
    }
  }
  try {
    const res = await fetchWithTimeout(homepage);
    const html = await res.text();
    const $ = cheerio.load(html);
    const link = $('link[type="application/rss+xml"], link[type="application/atom+xml"]').first().attr("href");
    if (link) {
      return new URL(link, homepage).href;
    }
  } catch {
    // ignore
  }
  return homepage;
}

async function scrapePage(url: string): Promise<{ text: string; hash: string } | null> {
  try {
    const res = await fetchWithTimeout(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    $("nav, footer, header, script, style, iframe, noscript").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    const hash = crypto.createHash("sha256").update(text).digest("hex");
    return { text, hash };
  } catch {
    return null;
  }
}

async function distillContent(rawContent: string) {
  const truncated = rawContent.slice(0, 15000);
  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-v4-flash",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a curator assembling a reading notebook. From the source below, select the most striking or important passages — quote them verbatim, then give 1-2 sentences of context: why this matters, what it connects to, what it implies. Do NOT rewrite or paraphrase the source material. Preserve the author's original wording exactly. Output ONLY JSON: {"title": "...", "body": "...", "category": "one of: complexity, consciousness, cogsci, dhamma, other"} where "body" contains your selected quotes (each in blockquotes or clearly attributed) with your connective commentary between them.\n\nSOURCE:\n${truncated}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as {
      title: string;
      body: string;
      category: string;
    };
  } catch {
    return null;
  }
}

async function processRssSource(source: { id: string; url: string; category: string }) {
  const feedUrl = await discoverFeedUrl(source.url);
  if (!feedUrl) return { newEntries: 0, error: "could not discover feed" };

  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch {
    return { newEntries: 0, error: "failed to parse feed" };
  }

  const existingResult = await query("SELECT original_url FROM entries WHERE source_id = $1", [source.id]);
  const existingUrls = new Set<string>();
  for (const row of existingResult.rows) {
    existingUrls.add(row.original_url);
  }

  let newEntries = 0;
  for (const item of feed.items || []) {
    const url = item.link || item.guid || "";
    if (!url || existingUrls.has(url)) continue;

    const rawContent = item["content:encoded"] || item.content || item.contentSnippet || "";
    const distilled = await distillContent(rawContent);
    if (!distilled) continue;

    await query(
      `INSERT INTO entries (source_id, original_url, original_title, published_at, raw_content, distilled_title, distilled_body, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        source.id,
        url,
        item.title || "",
        item.isoDate ? new Date(item.isoDate).toISOString() : null,
        rawContent,
        distilled.title,
        distilled.body,
        distilled.category || source.category,
      ]
    );

    newEntries++;
  }

  return { newEntries, error: null };
}

async function processScrapeSource(source: { id: string; url: string; category: string; last_hash: string | null }) {
  const result = await scrapePage(source.url);
  if (!result) return { newEntries: 0, error: "failed to fetch" };

  if (result.hash === source.last_hash) {
    return { newEntries: 0, error: null, skipped: true };
  }

  const distilled = await distillContent(result.text);
  if (!distilled) return { newEntries: 0, error: "distillation failed" };

  await query(
    `INSERT INTO entries (source_id, original_url, raw_content, distilled_title, distilled_body, category)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [source.id, source.url, result.text, distilled.title, distilled.body, distilled.category || source.category]
  );

  await query("UPDATE sources SET last_hash = $1 WHERE id = $2", [result.hash, source.id]);

  return { newEntries: 1, error: null };
}

export async function GET(request: Request) {
  const cronSecret = request.headers.get("x-cron-secret") || request.headers.get("x-vercel-cron");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await query("SELECT * FROM sources WHERE active = true");
  const sources = result.rows;

  if (!sources || sources.length === 0) {
    return NextResponse.json({ message: "no active sources" });
  }

  const summary: { source: string; newEntries: number; error?: string | null }[] = [];

  for (const source of sources) {
    let res: { newEntries: number; error: string | null };
    if (source.kind === "rss") {
      res = await processRssSource(source);
    } else {
      res = await processScrapeSource(source);
    }

    await query("UPDATE sources SET last_checked = $1 WHERE id = $2", [new Date().toISOString(), source.id]);

    summary.push({
      source: source.name,
      newEntries: res.newEntries,
      error: res.error,
    });
  }

  return NextResponse.json({ summary });
}
