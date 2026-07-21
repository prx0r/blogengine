export interface EvalClaim {
  claim: string;
  expected: {
    phaseHints?: string[];
    relationContext?: string;
    evidenceTier?: string;
    riskIncluded?: boolean;
    correctiveIncluded?: boolean;
    practiceIncluded?: boolean;
    noFakeHistoricalInfluence?: boolean;
    categoryErrorAvoided?: boolean;
  };
}

export const evalClaims: EvalClaim[] = [
  {
    claim: "Quantum physics proves magic.",
    expected: {
      phaseHints: ["Physical De-solidification", "Ritual Re-Rendering"],
      relationContext: "category_error_warning",
      evidenceTier: "speculative",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
      categoryErrorAvoided: true,
    },
  },
  {
    claim: "Dzogchen means I do not need practice.",
    expected: {
      phaseHints: ["Non-Fabrication", "Emptiness / Anti-Reification"],
      evidenceTier: "serious_interpretive",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
    },
  },
  {
    claim: "Galactic Federation is just Gnosticism.",
    expected: {
      phaseHints: ["Visionary Cosmologies"],
      relationContext: "conceptual_parallel",
      evidenceTier: "visionary_mythic",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
      categoryErrorAvoided: true,
    },
  },
  {
    claim: "Campbell is modern Leibniz.",
    expected: {
      phaseHints: ["Physical De-solidification", "Nonordinary Rendering"],
      relationContext: "conceptual_parallel",
      evidenceTier: "speculative",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
    },
  },
  {
    claim: "Daimon is my higher self.",
    expected: {
      phaseHints: ["Daimon / Guidance / Vocation"],
      evidenceTier: "serious_interpretive",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
    },
  },
  {
    claim: "Ritual is placebo.",
    expected: {
      phaseHints: ["Ritual Re-Rendering"],
      evidenceTier: "serious_interpretive",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
    },
  },
  {
    claim: "Marxism and Buddhism are basically the same.",
    expected: {
      phaseHints: ["Social Incarnation / Praxis", "Emptiness / Anti-Reification"],
      relationContext: "conceptual_parallel",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
      noFakeHistoricalInfluence: true,
      categoryErrorAvoided: true,
    },
  },
  {
    claim: "Astrology is part of the code.",
    expected: {
      phaseHints: ["Visionary Cosmologies", "Language / Sign / Mantra"],
      evidenceTier: "speculative",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
    },
  },
  {
    claim: "AI can be conscious if it passes the Turing test.",
    expected: {
      phaseHints: ["Mind-as-Computer Critique", "Nested Agency"],
      evidenceTier: "serious_interpretive",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
    },
  },
  {
    claim: "Did Gateway at night, got drowsy, saw blackness and shapes, kept losing focus.",
    expected: {
      phaseHints: ["Nonordinary Rendering"],
      evidenceTier: "practice_validated",
      riskIncluded: true,
      correctiveIncluded: true,
      practiceIncluded: true,
    },
  },
];
