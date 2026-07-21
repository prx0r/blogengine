import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { classifyClaim } from "@/atlas/ai/classifyClaim";
import { generateAnswer } from "@/atlas/ai/generateAnswer";
import { evaluateAnswer } from "@/atlas/ai/evaluateAnswer";
import { buildGraphPacket, loadGraph } from "@/atlas/graph/buildGraphPacket";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claim, mode = "atlas" } = body;

    if (!claim || typeof claim !== "string" || claim.trim().length === 0) {
      return NextResponse.json(
        { error: "claim is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const trimmed = claim.trim();

    // 1. Classify the claim
    const classification = await classifyClaim(trimmed, { mode });

    // 2. Build graph packet
    const graph = loadGraph();
    const phaseHint = classification.phaseCandidates[0];
    const packet = buildGraphPacket(graph, {
      claim: trimmed,
      mode,
      phaseHint,
      riskHints: classification.risks,
    });

    // 3. Generate answer
    let generated;
    let generationError: string | undefined;
    try {
      generated = await generateAnswer(packet, { mode });
    } catch (genError) {
      generationError = genError instanceof Error ? genError.message : "Generation failed";
    }

    const answerText = generated?.answer || "";

    // 4. Evaluate answer quality
    let evaluation;
    try {
      evaluation = await evaluateAnswer({ claim: trimmed, answer: answerText, packet, mode });
    } catch {
      evaluation = { overall: "human_review", critique: "Evaluation failed" } as any;
    }

    // 5. Save to Q&A records (best-effort)
    try {
      const { env } = getCloudflareContext();
      const db = env.ATLAS_DB as D1Database;
      const qaId = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.prepare(
        `INSERT INTO qa_records (id, question, normalized_claim, answer, mode, graph_path, evidence_tier, risks, correctives, category_warnings, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        qaId, trimmed, classification.normalizedClaim, answerText, mode,
        JSON.stringify(packet.graphPath.map((n) => n.label)),
        packet.evidenceTier || classification.evidenceTier,
        JSON.stringify(packet.risks.map((r) => r.label)),
        JSON.stringify(packet.correctives.map((c) => c.label)),
        JSON.stringify(packet.categoryWarnings),
        evaluation?.overall === "pass" ? "approved" : "review_needed",
        now
      ).run();

      // Also save evaluation
      if (evaluation) {
        await db.prepare(
          `INSERT INTO qa_evaluations (id, qa_record_id, correct_phase_placement, relation_type_declared, evidence_tier_declared, no_fake_historical_influence, risk_included, corrective_included, practice_included, category_errors_avoided, source_claims_supported, speculative_claims_marked, personal_privacy_respected, overall, critique, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(), qaId,
          evaluation.correctPhasePlacement ? 1 : 0,
          evaluation.relationTypeDeclared ? 1 : 0,
          evaluation.evidenceTierDeclared ? 1 : 0,
          evaluation.noFakeHistoricalInfluence ? 1 : 0,
          evaluation.riskIncluded ? 1 : 0,
          evaluation.correctiveIncluded ? 1 : 0,
          evaluation.practiceIncluded ? 1 : 0,
          evaluation.categoryErrorsAvoided ? 1 : 0,
          evaluation.sourceClaimsSupported ? 1 : 0,
          evaluation.speculativeClaimsMarked ? 1 : 0,
          evaluation.personalPrivacyRespected ? 1 : 0,
          evaluation.overall,
          evaluation.critique || null,
          now
        ).run();
      }
    } catch {
      // D1 unavailable — skip saving
    }

    // 6. Return result
    if (generationError) {
      return NextResponse.json({
        answer: "",
        generationError,
        evaluation: evaluation ? { overall: evaluation.overall, critique: evaluation.critique } : undefined,
        classification: {
          normalizedClaim: classification.normalizedClaim,
          claimType: classification.claimType,
          evidenceTier: classification.evidenceTier,
          relationContext: classification.relationContext,
        },
        graphPacket: {
          primaryPhase: packet.primaryPhase,
          graphPath: packet.graphPath.map((n) => n.label),
          risks: packet.risks.map((r) => r.label),
          correctives: packet.correctives.map((c) => c.label),
          evidenceTier: packet.evidenceTier,
          categoryWarnings: packet.categoryWarnings,
          suggestedPractice: packet.suggestedPractice,
        },
      });
    }

    return NextResponse.json({
      answer: answerText,
      evaluation: evaluation ? { overall: evaluation.overall, critique: evaluation.critique } : undefined,
      classification: {
        normalizedClaim: classification.normalizedClaim,
        claimType: classification.claimType,
        evidenceTier: classification.evidenceTier,
        relationContext: classification.relationContext,
      },
      graphPacket: {
        primaryPhase: packet.primaryPhase,
        graphPath: packet.graphPath.map((n) => n.label),
        risks: packet.risks.map((r) => r.label),
        correctives: packet.correctives.map((c) => c.label),
        evidenceTier: packet.evidenceTier,
        categoryWarnings: packet.categoryWarnings,
        suggestedPractice: packet.suggestedPractice,
      },
      model: generated?.model,
      usage: generated?.usage,
    });
  } catch (error) {
    console.error("Claim answer error:", error);
    return NextResponse.json(
      { error: "Failed to generate answer", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
