#!/usr/bin/env tsx
/**
 * Experiment 1: Daimon Validation
 * 
 * Null hypothesis: Oikodespotes distribution is uniform (1/7 per planet) within each domain.
 * 
 * If the daimon concept is valid, eminent people in a field should have
 * the planet ruling that field as their oikodespotes more often than chance.
 *
 * Predicted mappings:
 *   Athletes → Mars, Artists → Venus, Writers → Mercury,
 *   Musicians → Venus, Scientists → Jupiter, Leaders → Sun,
 *   Philosophers → Jupiter/Saturn
 */
import type { PipelineSubject, ExperimentResult } from "./types";
import { getSubjectsByDomain, closeDb } from "./store";
import { computeOikodespotes } from "@/astrology/oikodespotes";
import { normalizeChart } from "@/astrology/caelus_adapter";
import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";

const PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;

const DOMAIN_PREDICTIONS: Record<string, string> = {
  athlete: "mars",
  artist: "venus",
  writer: "mercury",
  musician: "venus",
  scientist: "jupiter",
  leader: "sun",
  philosopher: "jupiter",
};

const engine = new Engine(embeddedData);

function getDefaultJd(birthDate: string): number {
  const d = new Date(birthDate + "T12:00:00Z");
  return d.getTime() / 86400000 + 2440587.5;
}

function binomialPValue(observed: number, total: number, expectedProb: number): number {
  // Two-tailed binomial test using normal approximation
  const expected = total * expectedProb;
  if (total === 0) return 1.0;

  const p = observed / total;
  const se = Math.sqrt(expectedProb * (1 - expectedProb) / total);
  if (se === 0) return 1.0;

  const z = (p - expectedProb) / se;
  // Normal CDF approximation
  const absZ = Math.abs(z);
  const cdf = 1 - 0.5 * Math.exp(-absZ * absZ / 2) * 
    (1 + 0.04986735 * absZ + 0.02114101 * absZ ** 2 +
     0.00327763 * absZ ** 3 + 0.0000380036 * absZ ** 4 +
     0.0000488906 * absZ ** 5 + 0.000005383 * absZ ** 6) ** -16;
  
  return 2 * (1 - cdf); // two-tailed
}

export async function runDaimonExperiment(domains?: string[]): Promise<ExperimentResult> {
  const testDomains = domains || Object.keys(DOMAIN_PREDICTIONS).filter(d => d !== "control");
  const results: ExperimentResult["results"] = [];

  // 7×7 contingency table: domains × planets
  const contingency: Record<string, Record<string, number>> = {};
  for (const d of testDomains) {
    contingency[d] = {};
    for (const p of PLANETS) contingency[d][p] = 0;
  }

  // Also track overall distribution to detect base-rate bias
  const overallDist: Record<string, number> = {};
  for (const p of PLANETS) overallDist[p] = 0;
  let totalWithOikodespotes = 0;

  for (const domain of testDomains) {
    const subjects: PipelineSubject[] = await getSubjectsByDomain(domain);
    console.error(`Testing ${domain} (${subjects.length} subjects)...`);

    for (const subject of subjects) {
      if (!subject.birthLat || !subject.birthLon) continue;

      try {
        const birthParts = subject.birthDate.split("-").map(Number);
        if (birthParts.length < 3) continue;
        const chart = engine.chart(birthParts[0], birthParts[1], birthParts[2], 12, 0, 0,
          subject.birthLat, subject.birthLon, "whole_sign");
        const normalized = normalizeChart(chart, subject.id);
        const oikodespotes = computeOikodespotes(normalized);

        if (oikodespotes) {
          contingency[domain][oikodespotes.planet]++;
          overallDist[oikodespotes.planet]++;
          totalWithOikodespotes++;
        }
      } catch {}
    }
  }

  // Chi-square test on the contingency table
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const d of testDomains) {
    rowTotals[d] = Object.values(contingency[d]).reduce((a, b) => a + b, 0);
    grandTotal += rowTotals[d];
  }
  for (const p of PLANETS) colTotals[p] = overallDist[p];

  let chiSquare = 0;
  let cellCount = 0;
  const perPlanetResults: Record<string, { domain: string; observed: number; expected: number }[]> = {};

  for (const d of testDomains) {
    for (const p of PLANETS) {
      if (rowTotals[d] === 0 || colTotals[p] === 0) continue;
      const expected = (rowTotals[d] * colTotals[p]) / grandTotal;
      if (expected > 0) {
        chiSquare += (contingency[d][p] - expected) ** 2 / expected;
        cellCount++;
      }
      if (!perPlanetResults[p]) perPlanetResults[p] = [];
      perPlanetResults[p].push({ domain: d, observed: contingency[d][p], expected });
    }
  }

  const degreesOfFreedom = (testDomains.length - 1) * (PLANETS.length - 1);
  const chiPValue = 1 - chiSquareCDF(chiSquare, degreesOfFreedom);

  console.error(`Chi-square: ${chiSquare.toFixed(2)} (df=${degreesOfFreedom}, p≈${chiPValue.toFixed(4)})`);

  // Per-planet enrichment: for each predicted pairing, compare domain rate vs other domains
  for (const [domain, expectedPlanet] of Object.entries(DOMAIN_PREDICTIONS)) {
    if (!testDomains.includes(domain)) continue;
    const domainN = rowTotals[domain] || 0;
    const domainObserved = contingency[domain]?.[expectedPlanet] || 0;
    const otherN = grandTotal - domainN;
    const otherObserved = colTotals[expectedPlanet] - domainObserved;

    // z-test for proportions: domain vs all others
    if (domainN > 0 && otherN > 0) {
      const p1 = domainObserved / domainN;
      const p2 = otherN > 0 ? otherObserved / otherN : 0;
      const pPool = (domainObserved + otherObserved) / grandTotal;
      const se = Math.sqrt(pPool * (1 - pPool) * (1 / domainN + 1 / otherN));
      const z = se > 0 ? (p1 - p2) / se : 0;
      const pValue = 2 * (1 - normalCDF(Math.abs(z)));

      results.push({
        test: `${expectedPlanet} enrichment in ${domain}`,
        n: domainN,
        observed: domainObserved,
        expected: Math.round(domainN * (colTotals[expectedPlanet] / grandTotal)),
        observedRate: Math.round(p1 * 10000) / 100,
        expectedRate: Math.round((colTotals[expectedPlanet] / grandTotal) * 10000) / 100,
        pValue: Math.round(pValue * 100000) / 100000,
        significant: pValue < 0.01,
        effectSize: Math.round((p1 - p2) * 10000) / 100,
      });
    }
  }

  // Sort results by p-value
  results.sort((a, b) => a.pValue - b.pValue);

  // Interpret
  const anySignificant = results.some(r => r.significant && r.effectSize > 0);
  const anyNegative = results.some(r => r.significant && r.effectSize < 0);
  const chiSignificant = chiPValue < 0.05;

  const conclusions = [];
  if (chiSignificant) {
    conclusions.push(`Chi-square test: χ²=${chiSquare.toFixed(1)}, df=${degreesOfFreedom}, p=${chiPValue.toFixed(4)} — the distribution of oikodespotes planets DIFFERS across domains. Domain and daimon are associated.`);
  } else {
    conclusions.push(`Chi-square test: χ²=${chiSquare.toFixed(1)}, df=${degreesOfFreedom}, p=${chiPValue.toFixed(4)} — no significant association detected between domain and oikodespotes.`);
  }
  if (anySignificant) {
    const sigList = results.filter(r => r.significant && r.effectSize > 0).map(r => r.test).join(", ");
    conclusions.push(`Significant enrichment found: ${sigList}. These domains show higher-than-expected rates of their predicted planet.`);
  }
  if (anyNegative) {
    conclusions.push("Some domains show SIGNIFICANTLY LOWER than expected rates — these predictions may be wrong.");
  }
  conclusions.push(`Overall oikodespotes distribution: ${PLANETS.map(p => p + "=" + Math.round(overallDist[p] / totalWithOikodespotes * 100) + "%").join(", ")}`);

  return {
    name: "Daimon Validation",
    description: "Tests whether the oikodespotes (personal daimon) predicts vocation using a chi-square test of independence. " +
      "The null hypothesis is that the 7×7 contingency table (domain × oikodespotes) has no structure — writers and athletes " +
      "draw from the same oikodespotes distribution. The alternative is that some planets are enriched in some domains.",
    nullHypothesis: "The 7×7 contingency table (domain × oikodespotes planet) has no structure — distribution is independent of domain.",
    significanceThreshold: 0.01,
    correctionsApplied: "Single chi-square test (primary). Secondary z-tests for per-planet enrichment (not Bonferroni-corrected — exploratory).",
    results,
    conclusions,
    confoundersChecked: [
      "One planet → multiple vocations (Mercury → writer OR philosopher). Chi-square handles this naturally.",
      "Multiple planets → one vocation. The test doesn't penalize legitimate alternative planet-domain mappings.",
      "Birth time noise (noon assumed — may shift oikodespotes calculation)",
      "Domain misclassification (subjects with multiple occupations)",
      "Base rate bias (some planets consistently win almuten more often)",
    ],
  };
}

// Normal CDF approximation (Abramowitz and Stegun)
function normalCDF(x: number): number {
  if (x < 0) return 1 - normalCDF(-x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  return 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
}

// Chi-square CDF approximation (for df > 1)
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  const z = (x / df) ** (1 / 3) - (1 - 2 / (9 * df));
  const sigma = Math.sqrt(2 / (9 * df));
  return normalCDF(z / sigma);
}

if (require.main === module) {
  (async () => {
    const result = await runDaimonExperiment();
    console.log("\n=== DAIMON VALIDATION ===\n");
    console.log("Chi-square test of independence: domain × oikodespotes");
    console.log(result.conclusions[0]);
    console.log("\nPer-planet enrichment:");
    for (const r of result.results) {
      console.log(`  ${r.test}: ${r.observed}/${r.n}=${r.observedRate}% vs expected ${r.expected} (p=${r.pValue}) ${r.significant ? (r.effectSize > 0 ? '✅' : '❌') : ''}`);
    }
    console.log(result.conclusions.slice(1).join("\n"));
  })().catch(e => { console.error(e); process.exit(1); });
}

// CLI
if (require.main === module) {
  (async () => {
    const result = await runDaimonExperiment();

    console.log("\n=== DAIMON VALIDATION RESULTS ===\n");
    console.log(result.description);
    console.log(`\nNull hypothesis: ${result.nullHypothesis}`);
    console.log(`Significance threshold: ${result.significanceThreshold}`);
    console.log(`\nResults:`);
    for (const r of result.results) {
      console.log(`  ${r.test}: ${r.observed}/${r.n} = ${r.observedRate}% vs ${r.expectedRate}% expected (p=${r.pValue}) ${r.significant ? '✅' : '❌'}`);
    }
    console.log(`\nConclusions:`);
    for (const c of result.conclusions) console.log(`  • ${c}`);
    console.log(`\nConfounders:`);
    for (const c of result.confoundersChecked) console.log(`  • ${c}`);

    await closeDb();
  })().catch(e => { console.error(e); process.exit(1); });
}
