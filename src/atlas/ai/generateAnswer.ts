import { getDeepSeekClient } from "./deepseekClient";
import { ANSWER_GENERATOR_SYSTEM_PROMPT, GUIDE_MODE_SYSTEM_PROMPT } from "./prompts/answerGenerator";
import type { GraphPacket } from "@/atlas/graph/schema";

export interface GenerateAnswerOptions {
  mode?: "atlas" | "guide";
  personalContext?: string;
}

export interface GeneratedAnswer {
  answer: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateAnswer(
  packet: GraphPacket,
  options: GenerateAnswerOptions = {}
): Promise<GeneratedAnswer> {
  const client = getDeepSeekClient();
  const { mode = "atlas", personalContext } = options;

  const systemPrompt = mode === "guide" ? GUIDE_MODE_SYSTEM_PROMPT : ANSWER_GENERATOR_SYSTEM_PROMPT;

  const graphContext = buildGraphContext(packet);

  let userPrompt = `Graph packet:\n${graphContext}\n\nUser claim: "${packet.userClaim}"`;

  if (mode === "guide" && personalContext) {
    userPrompt += `\n\nPersonal notes:\n${personalContext}`;
  }

  userPrompt += `\n\nAnswer using the format specified in the system prompt.`;

  console.error(`[generateAnswer] Calling chat API, systemPrompt length: ${systemPrompt.length}, userPrompt length: ${userPrompt.length}`);

  const response = await client.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 2048 }
  );

  console.error(`[generateAnswer] API response received, content length: ${response.content.length}`);

  if (!response.content) {
    console.error(`[generateAnswer] WARNING: empty content returned, model=${response.model}`);
  }

  return {
    answer: response.content,
    model: response.model,
    usage: response.usage,
  };
}

function buildGraphContext(packet: GraphPacket): string {
  const parts: string[] = [];

  if (packet.primaryPhase) {
    parts.push(`Phase: ${packet.primaryPhase.label} (#${packet.primaryPhase.phaseNumber})`);
  }

  if (packet.assumptions.length > 0) {
    parts.push(`Assumptions: ${packet.assumptions.join("; ")}`);
  }

  if (packet.demolition) {
    parts.push(`Demolition: ${packet.demolition}`);
  }

  if (packet.replacementModel) {
    parts.push(`Replacement: ${packet.replacementModel}`);
  }

  if (packet.graphPath.length > 0) {
    parts.push(`Path: ${packet.graphPath.map((n) => n.label).join(" → ")}`);
  }

  if (packet.sourceCards.length > 0) {
    parts.push(
      `Sources: ${packet.sourceCards.map((s) => `${s.title} (${s.author})`).join("; ")}`
    );
  }

  if (packet.risks.length > 0) {
    parts.push(`Risks: ${packet.risks.map((r) => r.label).join("; ")}`);
  }

  if (packet.correctives.length > 0) {
    parts.push(`Correctives: ${packet.correctives.map((c) => c.label).join("; ")}`);
  }

  if (packet.evidenceTier) {
    parts.push(`Evidence tier: ${packet.evidenceTier.replace(/_/g, " ")}`);
  }

  if (packet.categoryWarnings.length > 0) {
    parts.push(`Warnings: ${packet.categoryWarnings.join("; ")}`);
  }

  if (packet.suggestedPractice) {
    parts.push(`Suggested practice: ${packet.suggestedPractice}`);
  }

  return parts.join("\n");
}
