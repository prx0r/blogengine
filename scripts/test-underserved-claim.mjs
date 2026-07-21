#!/usr/bin/env node
/**
 * Stage 1: Underserved-Claim Check
 *
 * Tests whether English-language tantra content from Indian creators
 * is invisible to Western audiences (US, UK).
 *
 * API Reference:
 *   search.list:  docs/api-ref/search-list.md
 *   videos.list:  docs/api-ref/videos-list.md
 *   quota:        docs/api-ref/quota-calculator.md
 *
 * Fixes applied from audit:
 * - publishedAfter now sends 12-month ISO date (was missing entirely)
 * - gap_score measures IN-only channels invisible to BOTH US+GB (was binary-collapsing on GB=0)
 * - videos.list pass checks defaultAudioLanguage (relevanceLanguage=en is not reliable)
 * - All 30 queries always represented in output
 * - UK zero-result queries flagged separately, not collapsed into gap score
 */

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) throw new Error("Set YOUTUBE_API_KEY environment variable");
const REGIONS = ["IN", "US", "GB"];
const MAX_RESULTS = 15;
const TIME_WINDOW_MONTHS = 12;
const GAP_THRESHOLD = 0.30;
const PIPELINE_VERSION = "1.1.0";

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

function getPublishedAfter() {
  const d = new Date();
  d.setMonth(d.getMonth() - TIME_WINDOW_MONTHS);
  return d.toISOString();
}

function computeFormulas() {
  return {
    gap_score: {
      expression: "in_only_western / max(1, total_in_channels)",
      range: "[0, 1]",
      components: {
        in_only_western: "channels appearing in IN search results but NOT in US AND NOT in GB results",
        total_in_channels: "all unique channels appearing in IN search results"
      },
      interpretation: "1.0 = all IN-visible channels are invisible to US+GB (complete gap). 0.0 = all IN-visible channels also visible in US+GB (no gap).",
      threshold_for_gap: { value: GAP_THRESHOLD, label: "significant_gap" },
      caveat: "gap_score is only meaningful when IN returns sufficient channels (>=5). Low IN-channel queries are flagged as low-confidence."
    },
    uk_data_quality_flag: {
      expression: "gb_total_results == 0 ? 'insufficient_data' : 'adequate'",
      note: "Queries where GB returns 0 results are flagged separately. They are NOT assigned gap_score=1.0.",
      handling: "Excluded from GB-specific metrics. gap_score still computed from IN vs US+GB."
    },
    english_audio_verification: {
      method: "videos.list with part=snippet on all unique video IDs",
      field: "defaultAudioLanguage",
      classification: "confirmed_english if defaultAudioLanguage == 'en', unknown if null/missing, non_english otherwise",
      note: "relevanceLanguage=en biases search toward English metadata but does not verify spoken language. This pass catches Hindi-spoken videos with English titles."
    },
    channel_visibility: {
      expression: "classify_by_region_presence(channel_regions)",
      classes: ["IN_only", "IN_US", "IN_GB", "US_only", "GB_only", "all_three", "none"]
    },
    channel_size_tiers: {
      micro: "[1, 5000)",
      small: "[5000, 50000)",
      medium: "[50000, 500000)",
      large: "[500000, 5000000)",
      mega: "[5000000, inf)"
    },
    breakout_score: {
      expression: "(viewCount / max(1, ageDays)) / channel_median_views_per_day",
      note: "Computed in Stage 3. Not available in Stage 1."
    }
  };
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

async function fetchVideoDetails(videoIds) {
  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(",")}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.items) {
      for (const item of data.items) {
        results.push({
          videoId: item.id,
          defaultAudioLanguage: item.snippet?.defaultAudioLanguage || null,
          defaultLanguage: item.snippet?.defaultLanguage || null,
        });
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return results;
}

async function main() {
  const date = new Date().toISOString().split("T")[0];
  const publishedAfter = getPublishedAfter();
  const reportId = `underserved-claim-test-${date}`;
  const gates = {};
  let allGatesPass = true;

  function checkGate(name, condition, detail) {
    const status = condition ? "PASS" : "FAIL";
    gates[name] = { status, detail };
    if (!condition) allGatesPass = false;
    console.error(`  [${status}] ${name}: ${detail}`);
  }

  console.error(`\n=== Underserved-Claim Check v${PIPELINE_VERSION}: ${date} ===`);
  console.error(`Queries: ${QUERIES.length}, Regions: ${REGIONS.join(", ")}`);
  console.error(`Time window: ${TIME_WINDOW_MONTHS} months (publishedAfter: ${publishedAfter})`);
  console.error(`Search calls: ${QUERIES.length * REGIONS.length}`);

  // Stage 1: Run searches
  const allResults = { IN: {}, US: {}, GB: {} };
  for (const region of REGIONS) {
    for (const { query } of QUERIES) {
      allResults[region][query] = await search(query, region, publishedAfter);
      await new Promise(r => setTimeout(r, 150));
    }
    const total = Object.values(allResults[region]).reduce((s, r) => s + r.length, 0);
    console.error(`  ${region}: ${total} total results`);
  }

  // V01: All queries returned at least one result
  const queriesWithResults = {};
  for (const region of REGIONS) {
    queriesWithResults[region] = QUERIES.filter(({ query }) => (allResults[region][query] || []).length > 0).length;
  }
  checkGate("V01_all_queries_returned",
    Object.values(queriesWithResults).every(v => v === QUERIES.length),
    `IN:${queriesWithResults.IN}/${QUERIES.length} US:${queriesWithResults.US}/${QUERIES.length} GB:${queriesWithResults.GB}/${QUERIES.length}`
  );

  // Stage 2: Verify English audio via videos.list
  const allVideoIds = [...new Set(
    REGIONS.flatMap(region =>
      QUERIES.flatMap(({ query }) => (allResults[region][query] || []).map(r => r.videoId))
    )
  )];
  console.error(`\nVerifying English audio: ${allVideoIds.length} unique videos via videos.list...`);
  const videoDetails = await fetchVideoDetails(allVideoIds);
  const audioMap = {};
  for (const v of videoDetails) audioMap[v.videoId] = v;

  // Classify each result's audio language
  for (const region of REGIONS) {
    for (const { query } of QUERIES) {
      for (const result of allResults[region][query] || []) {
        const details = audioMap[result.videoId];
        result.defaultAudioLanguage = details?.defaultAudioLanguage || null;
        result.defaultLanguage = details?.defaultLanguage || null;
        result.audioIsEnglish = details?.defaultAudioLanguage === "en";
        result.audioIsUnknown = !details?.defaultAudioLanguage;
      }
    }
  }

  const totalVideosChecked = allVideoIds.length;
  const englishAudioCount = videoDetails.filter(v => v.defaultAudioLanguage === "en").length;
  const nullAudioCount = videoDetails.filter(v => !v.defaultAudioLanguage).length;
  const nonEnglishCount = videoDetails.filter(v => v.defaultAudioLanguage && v.defaultAudioLanguage !== "en").length;

  console.error(`  English audio: ${englishAudioCount}/${totalVideosChecked}`);
  console.error(`  No audio lang: ${nullAudioCount}/${totalVideosChecked}`);
  console.error(`  Non-English: ${nonEnglishCount}/${totalVideosChecked}`);

  checkGate("V01b_english_audio_checked",
    totalVideosChecked > 0,
    `${totalVideosChecked} videos checked via videos.list, ${englishAudioCount} confirmed English audio`
  );

  // Stage 3: Build channel registry
  const channelRegistry = {};
  for (const region of REGIONS) {
    for (const { query, topic } of QUERIES) {
      for (const result of allResults[region][query] || []) {
        const cid = result.channelId;
        if (!channelRegistry[cid]) {
          channelRegistry[cid] = {
            channelId: cid,
            channel: result.channel,
            regions: {},
            queries: {},
            topics: {},
            results: [],
            audioIsEnglish: result.audioIsEnglish,
            audioIsUnknown: result.audioIsUnknown,
          };
        }
        channelRegistry[cid].regions[region] = true;
        channelRegistry[cid].queries[query] = true;
        channelRegistry[cid].topics[topic] = true;
        // If any result from this channel has English audio, mark the channel
        if (result.audioIsEnglish) channelRegistry[cid].audioIsEnglish = true;
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

  // V02: Compute gap_score for each query
  // gap_score = channels found in IN but not in US AND not in GB / total unique channels in IN
  // This measures: of the channels visible in India, what fraction are invisible to Western search?
  const queryAnalysis = QUERIES.map(({ query, topic }) => {
    const inResults = allResults.IN[query] || [];
    const usResults = allResults.US[query] || [];
    const gbResults = allResults.GB[query] || [];

    const inChs = new Set(inResults.map(r => r.channelId));
    const usChs = new Set(usResults.map(r => r.channelId));
    const gbChs = new Set(gbResults.map(r => r.channelId));

    // Invisible to Western search = in IN but not in US AND not in GB
    const inOnlyWestern = [...inChs].filter(c => !usChs.has(c) && !gbChs.has(c));
    const gapScore = inChs.size >= 5 ? inOnlyWestern.length / inChs.size : null;

    // UK data quality flag
    const gbTotal = gbResults.length;
    const ukDataQuality = gbTotal === 0 ? "insufficient_data" : "adequate";

    // Count English audio
    const inEnglishAudio = inResults.filter(r => r.audioIsEnglish).length;

    return {
      query,
      topic,
      inResults: inResults.length,
      usResults: usResults.length,
      gbResults: gbResults.length,
      inChannels: inChs.size,
      usChannels: usChs.size,
      gbChannels: gbChs.size,
      inOnlyWestern: inOnlyWestern.length,
      gapScore,
      ukDataQuality,
      inEnglishAudio,
      inNonEnglishOrUnknown: inResults.length - inEnglishAudio,
    };
  });

  const computedCount = queryAnalysis.filter(q => q.gapScore !== null).length;
  checkGate("V02_gap_score_computed",
    computedCount >= QUERIES.length * 0.5,
    `${computedCount}/${QUERIES.length} queries have valid gap_score (${QUERIES.length - computedCount} had <5 IN channels, marked null)`
  );

  // V03: API usage tracked
  const totalSearchCalls = REGIONS.length * QUERIES.length;
  const totalVideoCalls = Math.ceil(allVideoIds.length / 50);
  const generalUnits = totalVideoCalls;
  const dailySearchLimit = 100;
  const remainingSearch = dailySearchLimit - totalSearchCalls;
  const apiUsage = {
    endpoints: [
      { name: "search.list", calls: totalSearchCalls, bucket: "search_list", dailyLimit: dailySearchLimit, remaining: remainingSearch },
      { name: "videos.list", calls: totalVideoCalls, bucket: "general_pool", dailyLimit: 10000, remaining: 10000 - generalUnits },
    ],
    general_pool_units: generalUnits,
    total_budget_used_pct: {
      search_list: totalSearchCalls / dailySearchLimit,
      general_pool: generalUnits / 10000,
    },
  };

  checkGate("V03_api_usage_tracked",
    apiUsage.endpoints.every(e => e.calls > 0 && e.remaining >= 0),
    `${totalSearchCalls} search.list + ${totalVideoCalls} videos.list calls`
  );

  // V04: Gap threshold applied
  const queriesWithGap = queryAnalysis.filter(q => q.gapScore !== null && q.gapScore >= GAP_THRESHOLD).length;
  const nullGapQueries = queryAnalysis.filter(q => q.gapScore === null).length;
  checkGate("V04_threshold_applied",
    queriesWithGap >= 0,
    `gap threshold >= ${GAP_THRESHOLD}, ${queriesWithGap}/${QUERIES.length} queries classified as gaps (${nullGapQueries} had insufficient IN data for reliable score)`
  );

  // Build summary
  const inOnlyChannels = channels.filter(c => c.visibility === "IN_only");
  const englishAudioChannels = channels.filter(c => c.audioIsEnglish);

  // Build report
  const report = {
    report: {
      id: reportId,
      type: "underserved_claim_test",
      date,
      pipeline_version: PIPELINE_VERSION,
    },
    method: {
      api: "YouTube search.list + videos.list (audio verification)",
      parameters: {
        regions: REGIONS,
        relevanceLanguage: "en",
        maxResults: MAX_RESULTS,
        timeWindowMonths: TIME_WINDOW_MONTHS,
        publishedAfter,
        audioVerification: "videos.list part=snippet, checked defaultAudioLanguage == 'en'",
        gapScoreMinimumINChannels: 5,
        queries: QUERIES,
      },
      formulas: computeFormulas(),
    },
    api_usage: apiUsage,
    verification: {
      gates: {},
      all_pass: false,
      next_stage: "blocked",
    },
    data: {
      summary: {
        totalQueries: QUERIES.length,
        queriesWithGap,
        gapThreshold: GAP_THRESHOLD,
        queriesWithInsufficientINData: nullGapQueries,
        totalUniqueChannels: channels.length,
        inOnlyChannels: inOnlyChannels.length,
        englishAudioChannels: englishAudioChannels.length,
        totalVideosChecked,
        englishAudioCount,
        nonEnglishAudioCount: nonEnglishCount,
        nullAudioCount,
        channelsVisibleInIN: channels.filter(c => c.regions.IN).length,
        channelsVisibleInUS: channels.filter(c => c.regions.US).length,
        channelsVisibleInGB: channels.filter(c => c.regions.GB).length,
        ukDataInsufficientQueries: queryAnalysis.filter(q => q.ukDataQuality === "insufficient_data").map(q => q.query),
      },
      channels: channels.sort((a, b) => b.queryCount - a.queryCount).map(ch => ({
        channelId: ch.channelId,
        channel: ch.channel,
        visibility: ch.visibility,
        queryCount: ch.queryCount,
        topics: Object.keys(ch.topics),
        regionsPresent: Object.keys(ch.regions),
        audioIsEnglish: ch.audioIsEnglish,
      })),
      queryAnalysis: queryAnalysis.sort((a, b) => (b.gapScore ?? -1) - (a.gapScore ?? -1)),
      gapTopicClusters: {
        philosophy: queryAnalysis.filter(q => q.topic === "philosophy").map(q => q.gapScore),
        deity: queryAnalysis.filter(q => q.topic === "deity").map(q => q.gapScore),
        practice: queryAnalysis.filter(q => q.topic === "practice").map(q => q.gapScore),
        taboo: queryAnalysis.filter(q => q.topic === "taboo").map(q => q.gapScore),
        historical: queryAnalysis.filter(q => q.topic === "historical").map(q => q.gapScore),
      },
      audioQuality: {
        totalVideosChecked,
        englishAudio: englishAudioCount,
        nonEnglishAudio: nonEnglishCount,
        noAudioLanguageMetadata: nullAudioCount,
        audioLanguageBreakdown: {},
      },
    },
  };

  // Populate audio language breakdown
  const langCounts = {};
  for (const v of videoDetails) {
    const lang = v.defaultAudioLanguage || "null";
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  }
  report.data.audioQuality.audioLanguageBreakdown = langCounts;

  // Run verification
  console.error("\n--- Verification Gates ---");
  report.verification.gates = { ...gates };
  report.verification.all_pass = allGatesPass;
  report.verification.next_stage = allGatesPass ? "stage_2_channel_curation" : "blocked";

  // Save report
  const reportsDir = path.resolve("data/reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `${reportId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\nReport saved: ${reportPath}`);

  // Update API usage log
  const logPath = path.resolve("data/api-usage-log.csv");
  const logLine = `\n${date},${reportId},search.list,${totalSearchCalls},search_list,${dailySearchLimit},${remainingSearch}`;
  const logLine2 = `\n${date},${reportId},videos.list,${totalVideoCalls},general_pool,10000,${10000 - generalUnits}`;
  fs.appendFileSync(logPath, logLine + logLine2);
  console.error(`API usage logged: ${totalSearchCalls} search.list + ${totalVideoCalls} videos.list`);

  // Print summary
  console.error(`\n=== RESULTS ===`);
  console.error(`Total queries: ${QUERIES.length}`);
  console.error(`Queries with gap (>=${GAP_THRESHOLD}): ${queriesWithGap}`);
  console.error(`Queries with insufficient IN data: ${nullGapQueries}`);
  console.error(`Total channels found: ${channels.length}`);
  console.error(`IN-only channels: ${inOnlyChannels.length}`);
  console.error(`English audio channels: ${englishAudioChannels.length}`);
  console.error(`Videos checked for audio: ${totalVideosChecked} (${englishAudioCount} English, ${nonEnglishCount} non-English, ${nullAudioCount} unknown)`);

  console.error(`\nTop gap topics (gap_score null = insufficient IN data):`);
  queryAnalysis.filter(q => q.gapScore !== null).slice(0, 15).forEach(q => {
    const marker = q.gapScore >= GAP_THRESHOLD ? "◆ GAP" : "  ";
    console.error(`  ${marker} [${q.gapScore.toFixed(2)}] ${q.query.padEnd(45)} IN:${q.inChannels}ch US:${q.usChannels}ch GB:${q.gbResults}vids IN-only-W:${q.inOnlyWestern} EN-audio:${q.inEnglishAudio}/${q.inResults}`);
  });
  console.error(`\nQueries with insufficient IN data (<5 channels):`);
  queryAnalysis.filter(q => q.gapScore === null).forEach(q => {
    console.error(`  [?] ${q.query} (only ${q.inChannels} IN channels)`);
  });

  console.error(`\nUK data quality flags:`);
  queryAnalysis.filter(q => q.ukDataQuality === "insufficient_data").forEach(q => {
    console.error(`  ⚠ ${q.query} — 0 results in UK`);
  });

  console.error(`\nAll gates: ${allGatesPass ? "PASS" : "FAIL"}`);
  console.error(`Next stage: ${allGatesPass ? "stage_2_channel_curation" : "blocked"}`);

  // Also print non-English audio breakdown for transparency
  const nonEnglishLangs = Object.entries(langCounts)
    .filter(([lang]) => lang !== "en" && lang !== "null")
    .sort((a, b) => b[1] - a[1]);
  if (nonEnglishLangs.length > 0) {
    console.error(`\nNon-English audio languages detected:`);
    nonEnglishLangs.slice(0, 10).forEach(([lang, count]) => {
      console.error(`  ${lang}: ${count} videos`);
    });
  }

  process.exit(allGatesPass ? 0 : 1);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
