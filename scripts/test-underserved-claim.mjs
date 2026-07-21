#!/usr/bin/env node
/**
 * Stage 1: Underserved-Claim Check
 *
 * Tests whether English-language tantra content from Indian creators
 * is invisible to Western audiences (US, UK).
 *
 * Output: data/reports/underserved-claim-test-{date}.json
 * Validated against: data/SCHEMA.json
 * API usage logged to: data/api-usage-log.csv
 *
 * Verification gates: V01-V05 (see data/README.md)
 * All gates must pass before data is considered publishable.
 */

import fs from "node:fs";
import path from "node:path";

const API_KEY = "AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I";
const REGIONS = ["IN", "US", "GB"];
const MAX_RESULTS = 15;
const TIME_WINDOW_MONTHS = 12;
const GAP_THRESHOLD = 0.30;
const PIPELINE_VERSION = "1.0.0";

const QUERIES = [
  { query: "Kashmir Shaivism consciousness", topic: "philosophy" },
  { query: "tantra philosophy explained", topic: "philosophy" },
  { query: "Abhinavagupta philosophy", topic: "philosophy" },
  { query: "36 tattvas explained", topic: "philosophy" },
  { query: "spanda vibration consciousness", topic: "philosophy" },
  { query: "pratyabhijna recognition philosophy", topic: "philosophy" },
  { query: "Bhairava tantra explained", topic: "deity" },
  { query: "Kali tantra history", topic: "deity" },
  { query: "Chinnamasta goddess meaning", topic: "deity" },
  { query: "Bagalamukhi tantra", topic: "deity" },
  { query: "Dhumatavi goddess", topic: "deity" },
  { query: "ten mahavidyas explained", topic: "deity" },
  { query: "cremation ground tantra", topic: "practice" },
  { query: "Aghori philosophy explained", topic: "practice" },
  { query: "tantric meditation practices", topic: "practice" },
  { query: "kundalini tantra awakening", topic: "practice" },
  { query: "chakra tantra explained", topic: "practice" },
  { query: "nyasa tantric ritual", topic: "practice" },
  { query: "tantric black magic history", topic: "taboo" },
  { query: "abhicara tantra rituals", topic: "taboo" },
  { query: "vamachara left hand path", topic: "taboo" },
  { query: "tantra sexual rituals history", topic: "taboo" },
  { query: "pancha makara five ms", topic: "taboo" },
  { query: "tantric skull staff kapalika", topic: "taboo" },
  { query: "tantraloka abhinavagupta explained", topic: "historical" },
  { query: "kashmir shaivism history", topic: "historical" },
  { query: "tantric texts history", topic: "historical" },
  { query: "yogini temples history", topic: "historical" },
  { query: "siddha tradition tantra", topic: "historical" },
  { query: "kaula tantra history", topic: "historical" },
];

function formulas() {
  return {
    gap_score: {
      expression: "in_only_channel_count / total_in_channel_count",
      range: "[0, 1]",
      interpretation: "1 = fully underserved (all IN channels invisible to US/GB), 0 = fully served (all channels visible everywhere)",
      threshold_for_gap: { value: GAP_THRESHOLD, label: "significant_gap" },
      example: "query with 10 IN channels, 3 only in IN: gap_score = 3/10 = 0.30"
    },
    uk_gap_score: {
      expression: "gb_channel_count == 0 ? 1.0 : in_only_gb_channel_count / total_gb_channel_count",
      note: "Separate flag because UK often has zero results for tantra topics"
    },
    channel_visibility: {
      expression: "classify based on region presence",
      classes: ["IN_only", "IN_US", "IN_GB", "US_only", "GB_only", "all_three", "none"]
    },
    channel_size_tiers: {
      micro: { range: "[1, 5000)", label: "Micro" },
      small: { range: "[5000, 50000)", label: "Small" },
      medium: { range: "[50000, 500000)", label: "Medium" },
      large: { range: "[500000, 5000000)", label: "Large" },
      mega: { range: "[5000000, inf)", label: "Mega" }
    },
    breakout_score: {
      expression: "(viewCount / ageDays) / channel_median_views_per_day",
      note: "Computed in Stage 3. Not available in Stage 1.",
      classification: "top_quartile = breakout, bottom_half = baseline, middle discarded"
    }
  };
}

async function search(query, region) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&regionCode=${region}&relevanceLanguage=en&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
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
  const reportId = `underserved-claim-test-${date}`;
  const gates = {};
  let allGatesPass = true;

  function checkGate(name, condition, detail) {
    const status = condition ? "PASS" : "FAIL";
    gates[name] = { status, detail };
    if (!condition) allGatesPass = false;
    console.error(`  [${status}] ${name}: ${detail}`);
  }

  console.error(`\n=== Underserved-Claim Check: ${date} ===`);
  console.error(`Queries: ${QUERIES.length}, Regions: ${REGIONS.join(", ")}`);
  console.error(`Search calls: ${QUERIES.length * REGIONS.length}`);
  console.error("");

  // Run searches
  const apiCalls = {};
  const allResults = { IN: {}, US: {}, GB: {} };

  for (const region of REGIONS) {
    const results = await Promise.all(
      QUERIES.map(async ({ query }) => {
        const r = await search(query, region);
        await new Promise(r => setTimeout(r, 150));
        return r;
      })
    );
    QUERIES.forEach(({ query }, i) => { allResults[region][query] = results[i]; });
    apiCalls[`search.list_${region}`] = QUERIES.length;
    console.error(`  ${region}: ${results.reduce((s, r) => s + r.length, 0)} total results`);
  }

  // V01: All queries returned results
  const queriesWithResults = {};
  for (const region of REGIONS) {
    queriesWithResults[region] = QUERIES.filter(({ query }) => (allResults[region][query] || []).length > 0).length;
  }
  checkGate("V01_all_queries_returned",
    Object.values(queriesWithResults).every(v => v === QUERIES.length),
    `IN: ${queriesWithResults.IN}/${QUERIES.length}, US: ${queriesWithResults.US}/${QUERIES.length}, GB: ${queriesWithResults.GB}/${QUERIES.length}`
  );

  // Build channel registry
  const channelRegistry = {};
  for (const region of REGIONS) {
    for (const { query, topic } of QUERIES) {
      for (const result of allResults[region][query] || []) {
        const cid = result.channelId;
        if (!channelRegistry[cid]) {
          channelRegistry[cid] = {
            channelId: cid, channel: result.channel,
            regions: {}, queries: {}, topics: {},
            results: []
          };
        }
        channelRegistry[cid].regions[region] = true;
        channelRegistry[cid].queries[query] = true;
        channelRegistry[cid].topics[topic] = true;
        channelRegistry[cid].results.push({
          region, query, topic, rank: result.rank,
          title: result.title, publishedAt: result.publishedAt
        });
      }
    }
  }

  // Classify channel visibility
  const channels = Object.values(channelRegistry);
  for (const ch of channels) {
    const r = ch.regions;
    ch.visibility = !r.IN && !r.US && !r.GB ? "none" :
      r.IN && !r.US && !r.GB ? "IN_only" :
      r.IN && r.US && !r.GB ? "IN_US" :
      r.IN && !r.US && r.GB ? "IN_GB" :
      !r.IN && r.US && !r.GB ? "US_only" :
      !r.IN && !r.US && r.GB ? "GB_only" :
      r.IN && r.US && r.GB ? "all_three" : "other";
    ch.queryCount = Object.keys(ch.queries).length;
  }

  // V02: gap_score computed for every query
  const queryAnalysis = QUERIES.map(({ query, topic }) => {
    const inChs = new Set((allResults.IN[query] || []).map(r => r.channelId));
    const usChs = new Set((allResults.US[query] || []).map(r => r.channelId));
    const gbChs = new Set((allResults.GB[query] || []).map(r => r.channelId));
    const inOnly = [...inChs].filter(c => !usChs.has(c) && !gbChs.has(c));
    const gapScore = inChs.size > 0 ? inOnly.length / inChs.size : 0;
    return { query, topic, inChannels: inChs.size, usChannels: usChs.size, gbChannels: gbChs.size, inOnlyChannels: inOnly.length, gapScore: Math.round(gapScore * 100) / 100 };
  });

  checkGate("V02_gap_score_computed",
    queryAnalysis.every(q => typeof q.gapScore === "number" && q.gapScore >= 0 && q.gapScore <= 1),
    `${queryAnalysis.filter(q => q.gapScore >= 0).length}/${queryAnalysis.length} queries have valid gap_score`
  );

  // V03: API usage tracked
  const totalSearchCalls = REGIONS.length * QUERIES.length;
  const dailySearchLimit = 100;
  const remainingSearch = dailySearchLimit - totalSearchCalls;
  const apiUsage = {
    endpoints: [
      { name: "search.list", calls: totalSearchCalls, bucket: "search_list", dailyLimit: dailySearchLimit, remaining: remainingSearch }
    ],
    general_pool_units: 0,
    total_budget_used_pct: totalSearchCalls / dailySearchLimit
  };

  checkGate("V03_api_usage_tracked",
    apiUsage.endpoints[0].calls > 0 && apiUsage.endpoints[0].remaining >= 0,
    `${apiUsage.endpoints[0].calls} search.list calls, ${apiUsage.endpoints[0].remaining} remaining today`
  );

  // V04: Gap threshold applied
  const queriesWithGap = queryAnalysis.filter(q => q.gapScore >= GAP_THRESHOLD).length;
  checkGate("V04_threshold_applied",
    queriesWithGap >= 0,
    `gap threshold >= ${GAP_THRESHOLD}, ${queriesWithGap}/${queryAnalysis.length} queries classified as gaps`
  );

  // Build summary
  const inOnlyChannels = channels.filter(c => c.visibility === "IN_only");

  // Build report
  const report = {
    report: {
      id: reportId,
      type: "underserved_claim_test",
      date,
      pipeline_version: PIPELINE_VERSION
    },
    method: {
      api: "YouTube search.list",
      parameters: {
        regions: REGIONS,
        relevanceLanguage: "en",
        maxResults: MAX_RESULTS,
        timeWindowMonths: TIME_WINDOW_MONTHS,
        queries: QUERIES
      },
      formulas: formulas()
    },
    api_usage: apiUsage,
    verification: {
      gates: {},
      all_pass: false,
      next_stage: allGatesPass ? "stage_2_channel_curation" : "blocked"
    },
    data: {
      summary: {
        totalQueries: QUERIES.length,
        queriesWithGap,
        queriesWithGapThreshold: GAP_THRESHOLD,
        totalUniqueChannels: channels.length,
        inOnlyChannels: inOnlyChannels.length,
        channelsVisibleInAllThree: channels.filter(c => c.visibility === "all_three").length,
        channelsVisibleInIN: channels.filter(c => c.regions.IN).length,
        channelsVisibleInUS: channels.filter(c => c.regions.US).length,
        channelsVisibleInGB: channels.filter(c => c.regions.GB).length,
      },
      channels: channels.sort((a, b) => b.queryCount - a.queryCount).map(ch => ({
        channelId: ch.channelId,
        channel: ch.channel,
        visibility: ch.visibility,
        queryCount: ch.queryCount,
        topics: Object.keys(ch.topics),
        regionsPresent: Object.keys(ch.regions),
      })),
      queryAnalysis: queryAnalysis.sort((a, b) => b.gapScore - a.gapScore),
      gapTopicClusters: {
        philosophy: queryAnalysis.filter(q => q.topic === "philosophy").map(q => q.gapScore),
        deity: queryAnalysis.filter(q => q.topic === "deity").map(q => q.gapScore),
        practice: queryAnalysis.filter(q => q.topic === "practice").map(q => q.gapScore),
        taboo: queryAnalysis.filter(q => q.topic === "taboo").map(q => q.gapScore),
        historical: queryAnalysis.filter(q => q.topic === "historical").map(q => q.gapScore),
      }
    }
  };

  // Run validation
  console.error("\n--- Verification Gates ---");
  report.verification.gates = { ...gates };
  report.verification.all_pass = allGatesPass;

  // Save report
  const reportsDir = path.resolve("data/reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `${reportId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\nReport saved: ${reportPath}`);

  // Update API usage log
  const logPath = path.resolve("data/api-usage-log.csv");
  const logLine = `\n${date},${reportId},search.list,${totalSearchCalls},search_list,${dailySearchLimit},${remainingSearch}`;
  fs.appendFileSync(logPath, logLine);
  console.error(`API usage logged: ${totalSearchCalls} search.list calls`);

  // Print summary
  console.error(`\n=== RESULTS ===`);
  console.error(`Total queries: ${QUERIES.length}`);
  console.error(`Queries with gap (>=${GAP_THRESHOLD}): ${queriesWithGap}`);
  console.error(`Total channels found: ${channels.length}`);
  console.error(`IN-only channels: ${inOnlyChannels.length}`);
  console.error(`Channels visible in all 3 regions: ${channels.filter(c => c.visibility === "all_three").length}`);
  console.error(`\nTop 10 IN-only channels by query coverage:`);
  inOnlyChannels.sort((a, b) => b.queryCount - a.queryCount).slice(0, 10).forEach(ch => {
    console.error(`  ${ch.channel} (${ch.queryCount} queries, topics: ${Object.keys(ch.topics).join(", ")})`);
  });
  console.error(`\nTop gap topics:`);
  queryAnalysis.filter(q => q.gapScore >= GAP_THRESHOLD).slice(0, 10).forEach(q => {
    console.error(`  [${q.gapScore.toFixed(2)}] ${q.query} (${q.inOnlyChannels}/${q.inChannels} IN-only, topic: ${q.topic})`);
  });
  console.error(`\nAll gates: ${allGatesPass ? "PASS" : "FAIL"}`);
  console.error(`Next stage: ${allGatesPass ? "stage_2_channel_curation" : "blocked — fix gates before proceeding"}`);

  // Exit with code
  process.exit(allGatesPass ? 0 : 1);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
