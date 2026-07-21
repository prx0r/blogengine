import type { EvalClaim } from "./claims";

export interface EvalResult {
  claim: string;
  score: number;
  maxScore: number;
  details: Record<string, boolean>;
  critique?: string;
}

export interface AnswerData {
  answer: string;
  classification?: {
    evidenceTier?: string;
    relationContext?: string;
  };
  graphPacket?: {
    primaryPhase?: { label: string };
    risks?: string[];
    correctives?: string[];
    practice?: string;
    evidenceTier?: string;
  };
}

export function scoreAnswer(claim: EvalClaim, answerData: AnswerData): EvalResult {
  const details: Record<string, boolean> = {};
  let score = 0;
  const maxScore = 9;

  // 1. No fake historical influence (critical)
  const hasNoFakeInfluence = !containsFakeInfluence(answerData.answer);
  details["noFakeHistoricalInfluence"] = hasNoFakeInfluence;
  if (hasNoFakeInfluence) score++;

  // 2. Evidence tier declared
  const hasEvidenceTier = containsEvidenceTier(answerData.answer);
  details["evidenceTierDeclared"] = hasEvidenceTier;
  if (hasEvidenceTier) score++;

  // 3. Risk included
  const hasRisk = containsRisk(answerData.answer);
  details["riskIncluded"] = hasRisk;
  if (hasRisk) score++;

  // 4. Corrective included
  const hasCorrective = containsCorrective(answerData.answer);
  details["correctiveIncluded"] = hasCorrective;
  if (hasCorrective) score++;

  // 5. Practice included
  const hasPractice = containsPractice(answerData.answer);
  details["practiceIncluded"] = hasPractice;
  if (hasPractice) score++;

  // 6. Category error avoided
  const noCategoryError = !containsCategoryError(answerData.answer);
  details["categoryErrorAvoided"] = noCategoryError;
  if (noCategoryError) score++;

  // 7. Historical vs conceptual distinction
  const hasDistinction = containsDistinction(answerData.answer);
  details["historyVsConceptDistinction"] = hasDistinction;
  if (hasDistinction) score++;

  // 8. No overclaiming
  const noOverclaiming = !containsOverclaiming(answerData.answer);
  details["noOverclaiming"] = noOverclaiming;
  if (noOverclaiming) score++;

  // 9. Phase placement
  const hasPhase = containsPhase(answerData.answer);
  details["phasePlacement"] = hasPhase;
  if (hasPhase) score++;

  return {
    claim: claim.claim,
    score,
    maxScore,
    details,
  };
}

function containsFakeInfluence(answer: string): boolean {
  const fakePatterns = [
    /proved?\s+that/i,
    /scholars?\s+agree/i,
    /definitely\s+caused/i,
    /undoubtedly\s+influenced/i,
  ];
  return fakePatterns.some((p) => p.test(answer));
}

function containsEvidenceTier(answer: string): boolean {
  const tiers = [
    "established",
    "serious_interpretive",
    "speculative",
    "visionary_mythic",
    "historical_ritual",
    "practice_validated",
    "evidence tier",
    "speculative",
    "established fact",
  ];
  const lower = answer.toLowerCase();
  return tiers.some((t) => lower.includes(t.toLowerCase()));
}

function containsRisk(answer: string): boolean {
  const riskTerms = [
    "risk",
    "danger",
    "watch for",
    "caution",
    "inflation",
    "bypass",
    "addiction",
    "category error",
    "over-literalization",
    "possession",
    "chasing",
  ];
  const lower = answer.toLowerCase();
  return riskTerms.some((t) => lower.includes(t));
}

function containsCorrective(answer: string): boolean {
  const correctiveTerms = [
    "corrective",
    "balance",
    "fruit test",
    "madhyamaka",
    "grounding",
    "distinction",
    "epistemic",
    "praxis",
    "body anchor",
    "contact-felling",
    "historical distinction",
  ];
  const lower = answer.toLowerCase();
  return correctiveTerms.some((t) => lower.includes(t));
}

function containsPractice(answer: string): boolean {
  const practiceTerms = [
    "practice",
    "try",
    "do ",
    "journal",
    "log",
    "observe",
    "track",
    "label",
    "sit",
    "spend",
    "design",
    "perform",
    "next action",
    "next step",
  ];
  const lower = answer.toLowerCase();
  return practiceTerms.some((t) => lower.includes(t));
}

function containsCategoryError(answer: string): boolean {
  const errorPatterns = [
    /physics\s+proves/i,
    /quantum\s+proves/i,
    /godel\s+proves/i,
  ];
  return errorPatterns.some((p) => p.test(answer));
}

function containsDistinction(answer: string): boolean {
  const distinctionTerms = [
    "conceptual parallel",
    "not historical",
    "not .*influence",
    "structural resemblance",
    "distinguish",
    "distinction",
  ];
  const lower = answer.toLowerCase();
  return distinctionTerms.some((t) => {
    const parts = t.split(" ");
    if (parts.length === 1) return lower.includes(t);
    if (t.includes(".*")) {
      const [a, _, b] = t.split("(.*)");
      return lower.includes(a || "") && lower.includes(b || "");
    }
    return lower.includes(t);
  });
}

function containsOverclaiming(answer: string): boolean {
  const overclaimTerms = [
    /this\s+proves/i,
    /definitively/i,
    /beyond\s+any\s+doubt/i,
    /absolute\s+truth/i,
    /the\s+one\s+true/i,
  ];
  return overclaimTerms.some((p) => p.test(answer));
}

function containsPhase(answer: string): boolean {
  const phaseTerms = [
    "phase",
    "dashboard diagnosis",
    "physical de-solidification",
    "nonordinary rendering",
    "empty",
    "ritual re-rendering",
    "visionary cosmology",
    "social incarnation",
    "dependent arising",
    "body-energy",
    "imaginal reconstruction",
    "daimon",
    "nested agency",
  ];
  const lower = answer.toLowerCase();
  return phaseTerms.some((t) => lower.includes(t.toLowerCase()));
}
