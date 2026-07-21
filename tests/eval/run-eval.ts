import { evalClaims } from "./claims";
import { scoreAnswer, type EvalResult } from "./scoring";

const API_BASE = process.env.API_BASE || "http://localhost:3000";

// Parse CLI args: --skip-api, --api-base=http://localhost:3458
const CLI_SKIP = process.argv.includes("--skip-api");
const CLI_API_BASE = process.argv.find((a) => a.startsWith("--api-base="))?.split("=")[1];

interface RunOptions {
  apiBase?: string;
  skipApi?: boolean;
}

async function main(options: RunOptions = {}) {
  const apiBase = options.apiBase || CLI_API_BASE || API_BASE;
  const skipApi = options.skipApi || CLI_SKIP;

  console.log("=".repeat(60));
  console.log("Re-Rendering Atlas — Eval Suite");
  console.log(`API: ${skipApi ? "SKIP (local scoring only)" : apiBase}`);
  console.log("=".repeat(60));
  console.log();

  const results: EvalResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const claim of evalClaims) {
    console.log(`\n--- Testing: "${claim.claim.slice(0, 60)}..."`);

    let answerData;

    if (skipApi) {
      // Use mock/scoring only
      answerData = { answer: "" };
    } else {
      try {
        const res = await fetch(`${apiBase}/api/claim/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim: claim.claim, mode: "atlas" }),
        });
        answerData = await res.json();
      } catch (error) {
        console.error(`  API call failed: ${error}`);
        answerData = { answer: "" };
      }
    }

    const result = scoreAnswer(claim, answerData);
    results.push(result);

    const passThreshold = 7;
    const isPass = result.score >= passThreshold;

    console.log(`  Score: ${result.score}/${result.maxScore} ${isPass ? "✓" : "✗"}`);
    for (const [key, val] of Object.entries(result.details)) {
      console.log(`    ${key}: ${val ? "✓" : "✗"}`);
    }

    if (isPass) passed++;
    else failed++;
  }

  console.log();
  console.log("=".repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${results.length}`);
  console.log("=".repeat(60));

  const allPassed = failed === 0;
  process.exit(allPassed ? 0 : 1);
}

main({ skipApi: CLI_SKIP, apiBase: CLI_API_BASE }).catch((error) => {
  console.error("Eval suite failed:", error);
  process.exit(1);
});
