import { getDeepSeekClient } from "./deepseekClient";
import { ANSWER_EVALUATOR_SYSTEM_PROMPT } from "./prompts/answerEvaluator";
import type { AnswerEvaluation, GraphPacket } from "@/atlas/graph/schema";

export interface EvaluateAnswerInput {
  claim: string;
  answer: string;
  packet: GraphPacket;
  mode: "atlas" | "guide";
}

export async function evaluateAnswer(
  input: EvaluateAnswerInput
): Promise<AnswerEvaluation> {
  const client = getDeepSeekClient();

  const context = buildEvaluationContext(input);

  try {
    const result = await client.classifyJson<AnswerEvaluation>(
      ANSWER_EVALUATOR_SYSTEM_PROMPT,
      `User claim: "${input.claim}"\n\nGenerated answer:\n${input.answer}\n\nGraph packet:\n${context}`
    );

    return normalizeEvaluation(result);
  } catch (error) {
    console.error("Answer evaluation failed:", error);
    return {
      correctPhasePlacement: false,
      relationTypeDeclared: false,
      evidenceTierDeclared: false,
      noFakeHistoricalInfluence: false,
      riskIncluded: false,
      correctiveIncluded: false,
      practiceIncluded: false,
      categoryErrorsAvoided: false,
      sourceClaimsSupported: false,
      speculativeClaimsMarked: false,
      personalPrivacyRespected: true,
      overall: "human_review",
      critique: "Evaluation failed — review required",
    };
  }
}

function buildEvaluationContext(input: EvaluateAnswerInput): string {
  const parts: string[] = [];

  if (input.packet.primaryPhase) {
    parts.push(`Phase: ${input.packet.primaryPhase.label}`);
  }

  if (input.packet.evidenceTier) {
    parts.push(`Evidence tier: ${input.packet.evidenceTier}`);
  }

  if (input.packet.risks.length > 0) {
    parts.push(`Risks: ${input.packet.risks.map((r) => r.label).join(", ")}`);
  }

  if (input.packet.correctives.length > 0) {
    parts.push(`Correctives: ${input.packet.correctives.map((c) => c.label).join(", ")}`);
  }

  if (input.packet.categoryWarnings.length > 0) {
    parts.push(`Warnings: ${input.packet.categoryWarnings.join("; ")}`);
  }

  if (input.packet.sourceCards.length > 0) {
    parts.push(`Sources: ${input.packet.sourceCards.map((s) => `${s.title} (${s.author})`).join("; ")}`);
  }

  return parts.join("\n");
}

function normalizeEvaluation(raw: Partial<AnswerEvaluation>): AnswerEvaluation {
  return {
    correctPhasePlacement: raw.correctPhasePlacement ?? false,
    relationTypeDeclared: raw.relationTypeDeclared ?? false,
    evidenceTierDeclared: raw.evidenceTierDeclared ?? false,
    noFakeHistoricalInfluence: raw.noFakeHistoricalInfluence ?? false,
    riskIncluded: raw.riskIncluded ?? false,
    correctiveIncluded: raw.correctiveIncluded ?? false,
    practiceIncluded: raw.practiceIncluded ?? false,
    categoryErrorsAvoided: raw.categoryErrorsAvoided ?? false,
    sourceClaimsSupported: raw.sourceClaimsSupported ?? false,
    speculativeClaimsMarked: raw.speculativeClaimsMarked ?? false,
    personalPrivacyRespected: raw.personalPrivacyRespected ?? true,
    overall: raw.overall ?? "human_review",
    critique: raw.critique,
  };
}
