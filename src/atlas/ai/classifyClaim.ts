import { getDeepSeekClient } from "./deepseekClient";
import { CLAIM_CLASSIFIER_SYSTEM_PROMPT } from "./prompts/claimClassifier";
import type { EvidenceTier, ClaimType } from "@/atlas/graph/schema";

export interface ClaimClassification {
  normalizedClaim: string;
  claimType: ClaimType;
  phaseCandidates: string[];
  assumptions: string[];
  concepts: string[];
  risks: string[];
  correctives: string[];
  evidenceTier: EvidenceTier;
  relationContext: "historical_influence" | "conceptual_parallel" | "practice_question" | "metaphysical_claim" | "personal_note";
  graphQuery: {
    seeds: string[];
    depth: number;
  };
}

export interface ClassifyClaimOptions {
  mode?: "atlas" | "guide";
}

export async function classifyClaim(
  claim: string,
  options: ClassifyClaimOptions = {}
): Promise<ClaimClassification> {
  const client = getDeepSeekClient();

  const modeContext =
    options.mode === "guide"
      ? " (user is in Guide mode — this may be a personal practice note)"
      : "";

  try {
    const result = await client.classifyJson<ClaimClassification>(
      CLAIM_CLASSIFIER_SYSTEM_PROMPT,
      `Classify this claim: "${claim}"${modeContext}`
    );

    return normalizeClassification(result);
  } catch (error) {
    console.error("Claim classification failed:", error);
    return getFallbackClassification(claim);
  }
}

function normalizeClassification(
  raw: Partial<ClaimClassification>
): ClaimClassification {
  return {
    normalizedClaim: raw.normalizedClaim ?? raw.normalizedClaim ?? "",
    claimType: raw.claimType ?? "definition_question",
    phaseCandidates: raw.phaseCandidates ?? [],
    assumptions: raw.assumptions ?? [],
    concepts: raw.concepts ?? [],
    risks: raw.risks ?? [],
    correctives: raw.correctives ?? [],
    evidenceTier: raw.evidenceTier ?? "speculative",
    relationContext: raw.relationContext ?? "metaphysical_claim",
    graphQuery: {
      seeds: raw.graphQuery?.seeds ?? [],
      depth: raw.graphQuery?.depth ?? 2,
    },
  };
}

function getFallbackClassification(claim: string): ClaimClassification {
  return {
    normalizedClaim: claim,
    claimType: "definition_question",
    phaseCandidates: ["Dashboard Diagnosis"],
    assumptions: [],
    concepts: [claim.split(" ").slice(0, 3).join(" ")],
    risks: [],
    correctives: [],
    evidenceTier: "speculative",
    relationContext: "metaphysical_claim",
    graphQuery: {
      seeds: [],
      depth: 1,
    },
  };
}
