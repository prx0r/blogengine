#!/usr/bin/env node
/**
 * Daily Search Collection — Layer 2, Assumption 4
 *
 * Runs 48 search queries daily (16 queries × 3 regions) and stores raw results.
 * After 14 days, compute week-over-week Spearman rank correlation.
 *
 * Threshold: Spearman r > 0.3 = weekly gap maps stable enough
 * Cost: 48 calls/day within 100/day search quota
 */

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) throw new Error("Set YOUTUBE_API_KEY environment variable");

const REGIONS = ["IN", "US", "GB"];
const MAX_RESULTS = 15;
const TIME_WINDOW_MONTHS = 12;
const QUERIES_PER_REGION = 16;

// Pick the 16 most representative queries spanning all gap scores and topics
const QUERIES = [
  { query: "Kashmir Shaivism consciousness", topic: "philosophy" },
  { query: "tantra philosophy explained", topic: "philosophy" },
  { query: "36 tattvas explained", topic: "philosophy" },
  { query: "Bhairava tantra explained", topic: "deity" },
  { query: "Kali tantra history", topic: "deity" },
  { query: "Chinnamasta goddess meaning", topic: "deity" },
  { query: "Bagalamukhi tantra", topic: "deity" },
  { query: "cremation ground tantra", topic: "practice" },
  { query: "tantric meditation practices", topic: "practice" },
  { query: "kundalini tantra awakening", topic: "practice" },
  { query: "chakra tantra explained", topic: "practice" },
  { query: "tantra sexual rituals history", topic: "taboo" },
  { query: "vamachara left hand path", topic: "taboo" },
  { query: "pancha makara five ms", topic: "taboo" },
  { query: "tantraloka abhinavagupta explained", topic: "historical" },
  { query: "yogini temples history", topic: "historical" },
];

function getPublishedAfter() {
  const d = new Date();
  d.setMonth(d.getMonth() - TIME_WINDOW_MONTHS);
  return d.toISOString();
}

async function search(query, region, publishedAfter) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&regionCode=${region}&relevanceLanguage=en&maxResults=${MAX_RESULTS}&publishedAfter=${encodeURIComponent(publishedAfter)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((item, rank) => ({
    rank: rank + 1,
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
  }));
}

async function main() {
  const date = new Date().toISOString().split("T")[0];
  const publishedAfter = getPublishedAfter();
  
  console.error(`\n=== Daily Search Collection: ${date} ===`);
  console.error(`Queries: ${QUERIES.length} × ${REGIONS.length} regions = ${QUERIES.length * REGIONS.length} calls`);
  
  const allResults = {};
  let totalResults = 0;
  
  for (const region of REGIONS) {
    allResults[region] = {};
    for (const { query, topic } of QUERIES) {
      const results = await search(query, region, publishedAfter);
      allResults[region][query] = { topic, results };
      totalResults += results.length;
      await new Promise(r => setTimeout(r, 150));
    }
    console.error(`  ${region}: ${Object.values(allResults[region]).reduce((s, q) => s + q.results.length, 0)} results`);
  }
  
  // Store raw output
  const outputDir = path.resolve("data/research/layer2/daily-query-results");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const output = {
    date,
    method: {
      regions: REGIONS,
      queries: QUERIES.map(q => ({ query: q.query, topic: q.topic })),
      maxResults: MAX_RESULTS,
      publishedAfter,
      totalCalls: QUERIES.length * REGIONS.length,
    },
    data: allResults,
    summary: {
      totalResults,
      callsUsed: QUERIES.length * REGIONS.length,
      quotaRemaining: 100 - (QUERIES.length * REGIONS.length),
    },
  };
  
  const outputPath = path.join(outputDir, `${date}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.error(`\nSaved: ${outputPath}`);
  console.error(`Total results: ${totalResults}`);
  console.error(`Calls used: ${QUERIES.length * REGIONS.length}/100 daily`);
  
  // Log API usage
  const logPath = path.resolve("data/research/layer2/daily-query-results/api-usage.csv");
  const logLine = `${date},search_collection,search.list,${QUERIES.length * REGIONS.length},search_list\n`;
  fs.appendFileSync(logPath, logLine);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
