#!/usr/bin/env tsx
/**
 * Generate a markdown report from all experiment results.
 * Usage: npx tsx src/pipeline/report.ts
 */
import { runDaimonExperiment } from "./experiment_daimon";
import { runDeathExperiment } from "./experiment_death";
import { getSubjectCount, closeDb } from "./store";
import { writeFileSync } from "fs";

export async function generateReport(): Promise<string> {
  const subjectCount = await getSubjectCount();
  const daimon = await runDaimonExperiment();
  const death = await runDeathExperiment();

  const report = `# Training Pipeline Report

Generated: ${new Date().toISOString().split("T")[0]}
Subjects in database: ${subjectCount}

---

## Experiment 1: Daimon Validation

**Null hypothesis**: ${daimon.nullHypothesis}

**Threshold**: ${daimon.significanceThreshold} (${daimon.correctionsApplied})

| Test | N | Observed | Expected | Observed % | Expected % | p-value | Significant |
|---|---|---|---|---|---|---|---|
${daimon.results.map(r => `| ${r.test} | ${r.n} | ${r.observed} | ${r.expected} | ${r.observedRate}% | ${r.expectedRate}% | ${r.pValue} | ${r.significant ? '✅' : '❌'} |`).join("\n")}

**Conclusions**:
${daimon.conclusions.map(c => `- ${c}`).join("\n")}

**Confounders checked**:
${daimon.confoundersChecked.map(c => `- ${c}`).join("\n")}

---

## Experiment 2: Death Date Timing

**Null hypothesis**: ${death.nullHypothesis}

**Threshold**: ${death.significanceThreshold}

| Test | N | Observed | Expected | p-value | Significant |
|---|---|---|---|---|---|
${death.results.map(r => `| ${r.test} | ${r.n} | ${r.observed} | ${r.expected} | ${r.pValue} | ${r.significant ? '✅' : '❌'} |`).join("\n")}

**Conclusions**:
${death.conclusions.map(c => `- ${c}`).join("\n")}

---

## Data Summary

| Metric | Value |
|---|---|
| Total subjects | ${subjectCount} |
| Domains tested | ${daimon.results.length} |
| Significant results (daimon) | ${daimon.results.filter(r => r.significant).length} |
| Significant results (death) | ${death.results.filter(r => r.significant).length} |
`;

  return report;
}

if (require.main === module) {
  (async () => {
    console.error("Generating report...");
    const report = await generateReport();
    writeFileSync("pipeline_report.md", report, "utf-8");
    console.log("Report written to pipeline_report.md");
    await closeDb();
  })().catch(e => { console.error(e); process.exit(1); });
}
