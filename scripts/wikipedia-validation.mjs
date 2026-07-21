#!/usr/bin/env node
/**
 * Task 5: Wikipedia Z-Score Validation
 *
 * Pulls Wikipedia pageview velocity for 20 tantra-related terms,
 * computes week-over-week z-scores, and correlates against gap scores
 * from the Stage 1 underserved test.
 *
 * Assumption 5: Wikipedia pageview velocity correlates with YouTube gap scores
 * Threshold: Spearman r > 0.2
 * Cost: Free (Wikipedia API, no auth)
 */

import fs from "node:fs";
import path from "node:path";

const TANTRIC_TERMS = [
  "Kali",
  "Bhairava",
  "Chinnamasta",
  "Kaula",
  "Tantra",
  "Abhinavagupta",
  "Kashmir_Shaivism",
  "Kundalini",
  "Chakra",
  "Aghori",
  "Mahavidya",
  "Bagalamukhi",
  "Dhumavati",
  "Tantraloka",
  "Nyasa",
  "Vamachara",
  "Panchamakara",
  "Kapalika",
  "Yogini",
  "Siddha",
];

const WIKI_API = "https://en.wikipedia.org/w/api.php";

/**
 * Fetch pageview data for a title over the last 90 days
 * Returns daily pageview counts
 */
async function fetchPageviews(title) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const endStr = endDate.toISOString().split("T")[0].replace(/-/g, "");
  const startStr = startDate.toISOString().split("T")[0].replace(/-/g, "");

  const url = `${WIKI_API}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=pageviews&pvipdays=90`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null; // page doesn't exist
    
    const pageviews = pages[pageId]?.pageviews;
    if (!pageviews) return null;
    
    return pageviews;
  } catch (e) {
    console.error(`  Error fetching ${title}: ${e.message}`);
    return null;
  }
}

/**
 * Compute weekly z-scores from daily pageview data
 * velocity = (this_week_avg - last_week_avg) / last_week_std
 */
function computeWeeklyZScores(dailyData) {
  const dates = Object.keys(dailyData).sort();
  if (dates.length < 14) return null;
  
  // Group into weeks (most recent 4 weeks)
  const now = new Date();
  const weeks = [];
  
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    
    const weekData = dates
      .filter(d => {
        const dt = new Date(d);
        return dt >= weekStart && dt < weekEnd;
      })
      .map(d => dailyData[d])
      .filter(v => v !== null && v !== undefined);
    
    if (weekData.length >= 3) {
      const avg = weekData.reduce((a, b) => a + b, 0) / weekData.length;
      weeks.push({ week: w, avg, data: weekData });
    }
  }
  
  if (weeks.length < 2) return null;
  
  // Z-score = (current_week_avg - previous_week_avg) / previous_week_std
  const zScores = [];
  for (let i = 1; i < weeks.length; i++) {
    const prev = weeks[i];
    const curr = weeks[i - 1];
    const std = Math.sqrt(
      prev.data.reduce((sum, v) => sum + (v - prev.avg) ** 2, 0) / prev.data.length
    );
    const z = std > 0 ? (curr.avg - prev.avg) / std : 0;
    zScores.push(z);
  }
  
  // Return mean z-score across all pairwise comparisons
  return zScores.reduce((a, b) => a + b, 0) / zScores.length;
}

/**
 * Compute Spearman rank correlation
 */
function spearmanCorrelation(x, y) {
  const n = x.length;
  if (n < 3) return null;
  
  // Rank both arrays
  const rank = (arr) => {
    const indexed = arr.map((v, i) => [v, i]);
    indexed.sort((a, b) => a[0] - b[0]);
    const ranks = new Array(n);
    indexed.forEach(([, i], rank) => { ranks[i] = rank + 1; });
    return ranks;
  };
  
  const rx = rank(x);
  const ry = rank(y);
  
  const dSq = rx.reduce((sum, _, i) => sum + (rx[i] - ry[i]) ** 2, 0);
  return 1 - (6 * dSq) / (n * (n * n - 1));
}

async function main() {
  const date = new Date().toISOString().split("T")[0];
  console.error(`\n=== Wikipedia Z-Score Validation: ${date} ===`);
  console.error(`Terms: ${TANTRIC_TERMS.length}`);
  
  // Load gap scores from Stage 1 report
  const reportPath = path.resolve(`data/reports/underserved-claim-test-${date}.json`);
  let gapScores = {};
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    for (const qa of report.data.queryAnalysis) {
      if (qa.gapScore !== null) {
        gapScores[qa.query] = qa.gapScore;
      }
    }
    console.error(`Loaded ${Object.keys(gapScores).length} gap scores from report`);
  } catch (e) {
    console.error(`Warning: Could not load gap scores: ${e.message}`);
    console.error(`Will store pageview data for later correlation`);
  }
  
  // Fetch pageviews for each term
  const results = [];
  for (const term of TANTRIC_TERMS) {
    process.stderr.write(`  Fetching ${term}... `);
    const data = await fetchPageviews(term);
    
    if (!data) {
      console.error(`no data (page may not exist)`);
      results.push({ term, exists: false, pageviews: null, zScore: null });
      continue;
    }
    
    const zScore = computeWeeklyZScores(data);
    const totalViews = Object.values(data).reduce((s, v) => s + (v || 0), 0);
    
    console.error(`z=${zScore?.toFixed(3) ?? "null"}, total=${totalViews}`);
    results.push({
      term,
      exists: true,
      totalPageviews: totalViews,
      zScore,
      dailyData: data,
    });
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Correlate with gap scores
  const validResults = results.filter(r => r.exists && r.zScore !== null);
  const matchedTerms = [];
  
  for (const r of validResults) {
    // Match Wikipedia term to gap score queries
    const termLower = r.term.toLowerCase().replace(/_/g, " ");
    for (const [query, gap] of Object.entries(gapScores)) {
      if (query.toLowerCase().includes(termLower) || termLower.includes(query.toLowerCase().split(" ")[0])) {
        matchedTerms.push({ term: r.term, zScore: r.zScore, gapScore: gap, query });
        break;
      }
    }
  }
  
  let spearmanR = null;
  let correlationNote = "";
  
  if (matchedTerms.length >= 3) {
    const zVals = matchedTerms.map(m => m.zScore);
    const gVals = matchedTerms.map(m => m.gapScore);
    spearmanR = spearmanCorrelation(zVals, gVals);
    correlationNote = `Spearman r = ${spearmanR?.toFixed(3)} (n=${matchedTerms.length})`;
    console.error(`\n${correlationNote}`);
    console.error(`Threshold: r > 0.2`);
    console.error(`Result: ${spearmanR !== null && spearmanR > 0.2 ? "PASS — Wikipedia signal is valid" : "FAIL — Wikipedia signal does not correlate"}`);
  } else {
    console.error(`\nNot enough matched terms for correlation (${matchedTerms.length} < 3)`);
  }
  
  // Build output
  const output = {
    experiment: "wikipedia-z-score-validation",
    date,
    method: {
      api: "Wikipedia Pageview API (free, no auth)",
      terms: TANTRIC_TERMS,
      zScoreFormula: "weekly_z = (current_week_avg - previous_week_avg) / previous_week_std",
      correlationMethod: "Spearman rank correlation",
      threshold: { value: 0.2, label: "valid_independent_signal" },
    },
    summary: {
      termsChecked: results.length,
      termsWithData: validResults.length,
      matchedForCorrelation: matchedTerms.length,
      spearmanR,
      threshold: 0.2,
      result: spearmanR !== null && spearmanR > 0.2 ? "PASS" : "FAIL",
      note: correlationNote,
    },
    terms: results.map(r => ({
      term: r.term,
      exists: r.exists,
      totalPageviews: r.totalPageviews,
      zScore: r.zScore,
    })),
    correlation: matchedTerms.map(m => ({
      term: m.term,
      wikipediaZScore: m.zScore,
      youtubeGapScore: m.gapScore,
      matchedQuery: m.query,
    })),
  };
  
  // Save
  const outputDir = path.resolve("data/research/layer2");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "wikipedia-validation.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.error(`\nReport saved: ${outputPath}`);
  
  // Print summary
  console.error(`\n=== RESULTS ===`);
  console.error(`Terms with pageview data: ${validResults.length}/${TANTRIC_TERMS.length}`);
  console.error(`Terms matched to gap scores: ${matchedTerms.length}`);
  if (spearmanR !== null) {
    console.error(`Spearman r: ${spearmanR.toFixed(3)} (threshold: 0.2)`);
    console.error(`Conclusion: ${spearmanR > 0.2 ? "Wikipedia velocity is a valid independent signal" : "Wikipedia velocity does not correlate with gap scores"}`);
  }
  
  console.error(`\nTop pageview velocities:`);
  validResults.sort((a, b) => (b.zScore ?? -Infinity) - (a.zScore ?? -Infinity));
  validResults.slice(0, 10).forEach(r => {
    console.error(`  ${r.term.padEnd(25)} z=${r.zScore?.toFixed(3) ?? "null"} views=${r.totalPageviews}`);
  });
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
