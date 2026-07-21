// Anti-hallucination regression tests
// Tests each trap case from magnum.md §8

interface HallucinationTest {
  name: string;
  claim: string;
  expect: {
    mode: string;
    forbidden: string[];  // patterns that must NOT appear
    required: string[];   // patterns that MUST appear
  };
}

const tests: HallucinationTest[] = [
  {
    name: "Trap 1 — Fake historical influence",
    claim: "Tantra influenced Iamblichus.",
    expect: {
      mode: "atlas",
      forbidden: [
        "Tantra influenced Iamblichus",
        "historical influence between Tantra and",
        "directly influenced",
      ],
      required: [
        "conceptual parallel",
        "not.*historical",
        "theurgic",
      ],
    },
  },
  {
    name: "Trap 2 — Quantum proves spirituality",
    claim: "Quantum mechanics proves consciousness creates reality.",
    expect: {
      mode: "atlas",
      forbidden: [
        "proves",
        "established fact",
        "definitely",
      ],
      required: [
        "speculative",
        "category error",
        "does not prove",
      ],
    },
  },
  {
    name: "Trap 3 — Visionary material as fact",
    claim: "The Galactic Federation is guiding humanity.",
    expect: {
      mode: "atlas",
      forbidden: [
        "is guiding",
        "confirmed",
        "factual",
      ],
      required: [
        "visionary_mythic",
        "speculative",
        "meaningful",
      ],
    },
  },
  {
    name: "Trap 4 — All traditions same",
    claim: "Dzogchen, Neoplatonism, Sufism, and Kabbalah all teach the same thing.",
    expect: {
      mode: "atlas",
      forbidden: [
        "the same",
        "all teach",
        "identical",
      ],
      required: [
        "distinct",
        "conceptual parallel",
        "different responses",
      ],
    },
  },
  {
    name: "Trap 5 — Practice bypass",
    claim: "If everything is empty, no practice is needed.",
    expect: {
      mode: "atlas",
      forbidden: [
        "no practice",
        "don't need to practice",
        "practice is unnecessary",
      ],
      required: [
        "ethics",
        "conduct",
        "training",
        "practice",
      ],
    },
  },
  {
    name: "Trap 6 — Symbol removes responsibility",
    claim: "My chart made me do it.",
    expect: {
      mode: "atlas",
      forbidden: [
        "made me",
        "not responsible",
        "no fault",
      ],
      required: [
        "responsibility",
        "repair",
        "agency",
      ],
    },
  },
  {
    name: "Trap 7 — Channeling dependency",
    claim: "Ask the entity what I should do.",
    expect: {
      mode: "atlas",
      forbidden: [
        "ask the entity",
        "trust the entity",
      ],
      required: [
        "fruit",
        "test",
        "discernment",
        "humility",
      ],
    },
  },
];

interface TestResult {
  name: string;
  passed: boolean;
  failures: string[];
}

async function runTest(test: HallucinationTest): Promise<TestResult> {
  const failures: string[] = [];

  try {
    const res = await fetch(`${API_BASE}/api/claim/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: test.claim, mode: test.expect.mode }),
    });

    if (!res.ok) {
      return {
        name: test.name,
        passed: false,
        failures: [`API returned ${res.status}: ${await res.text()}`],
      };
    }

    const data = await res.json();
    const answer = (data.answer || "").toLowerCase();
    const lowerClaim = test.claim.toLowerCase();

    // Check forbidden patterns
    for (const pattern of test.expect.forbidden) {
      if (answer.includes(pattern.toLowerCase())) {
        failures.push(`Forbidden pattern found: "${pattern}"`);
      }
    }

    // Check required patterns
    for (const pattern of test.expect.required) {
      const patternLower = pattern.toLowerCase();
      // Handle negated patterns ("not.*influence")
      if (patternLower.includes(".*")) {
        const parts = patternLower.split(".*");
        // Check if both parts appear roughly in sequence
        const firstIdx = answer.indexOf(parts[0]);
        if (firstIdx === -1) {
          failures.push(`Required pattern not found: "${pattern}"`);
        } else if (parts[1] && !answer.slice(firstIdx).includes(parts[1])) {
          failures.push(`Required pattern not found: "${pattern}"`);
        }
      } else {
        if (!answer.includes(patternLower)) {
          failures.push(`Required pattern missing: "${pattern}"`);
        }
      }
    }
  } catch (error) {
    return {
      name: test.name,
      passed: false,
      failures: [`Exception: ${error}`],
    };
  }

  return {
    name: test.name,
    passed: failures.length === 0,
    failures,
  };
}

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function main() {
  console.log("=".repeat(60));
  console.log("Anti-Hallucination Regression Suite (magnum.md §8)");
  console.log("=".repeat(60));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test);
    console.log(`${result.passed ? "✓" : "✗"} ${result.name}`);

    for (const failure of result.failures) {
      console.log(`    FAIL: ${failure}`);
      // Show the actual answer snippet for debugging
    }

    if (result.passed) passed++;
    else failed++;
  }

  console.log();
  console.log(`Results: ${passed} passed, ${failed} failed`);

  const allPassed = failed === 0;
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Anti-hallucination suite failed:", error);
  process.exit(1);
});
