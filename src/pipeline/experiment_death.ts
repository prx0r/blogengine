#!/usr/bin/env tsx
/**
 * Experiment 2: Death Date Timing
 * 
 * Null hypothesis: Saturn confidence on death dates is drawn from the same
 * distribution as on control dates. The probability that death-date Saturn
 * ranks in the top 5% of all dates is exactly 5%.
 */
import type { ExperimentResult } from "./types";
import { getSubjectsByDomain, closeDb } from "./store";

export async function runDeathExperiment(limit?: number): Promise<ExperimentResult> {
  const results: ExperimentResult["results"] = [];
  // Implementation would query the activation records from the DB
  // and run the per-person ranking + binomial test

  console.error("Death experiment: querying activation records...");
  // For now, this is a placeholder that documents the test protocol.
  // Full implementation requires activation records to be computed first.

  results.push({
    test: "Saturn confidence on death date ranks in top 5% of all dates",
    n: 0,
    observed: 0,
    expected: 0,
    observedRate: 0,
    expectedRate: 5,
    pValue: 1.0,
    significant: false,
    effectSize: 0,
  });

  return {
    name: "Death Date Timing",
    description: "Tests whether Saturn and 8th house activation are elevated on actual death dates " +
      "compared to random control dates. For each person with a known death date, we compute " +
      "Saturn confidence on the death date and on 10 control dates. We test whether the death date " +
      "ranks in the top 10% more often than the 10% expected by chance.",
    nullHypothesis: "Death-date Saturn confidence ranks are uniformly distributed among all tested dates.",
    significanceThreshold: 0.01,
    correctionsApplied: "Single comparison (Saturn is the only tested planet for death).",
    results,
    conclusions: [
      "Run compute.ts first to populate activation records, then re-run this experiment.",
    ],
    confoundersChecked: [
      "Cause of death not available (sudden vs prolonged may differ)",
      "Control dates from same year of life may have correlated transits",
      "No birth time adds noise to house placement",
    ],
  };
}

if (require.main === module) {
  (async () => {
    const result = await runDeathExperiment();
    console.log(JSON.stringify(result, null, 2));
    await closeDb();
  })().catch(e => { console.error(e); process.exit(1); });
}
