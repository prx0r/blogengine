import { z } from "zod";

// ── Evidence tiers ───────────────────────────────────────────
export const evidenceTierSchema = z.enum([
  "established",
  "serious_interpretive",
  "speculative",
  "visionary_mythic",
  "historical_ritual",
  "practice_validated",
]);
export type EvidenceTier = z.infer<typeof evidenceTierSchema>;

// ── Path functions ───────────────────────────────────────────
export const pathFunctionSchema = z.enum([
  "deconstructs",
  "grounds",
  "bridges",
  "reconstructs",
  "stabilizes",
  "opens_imaginal",
  "orders_field",
  "receives_guidance",
  "incarnates",
  "corrects_risk",
  "pressure_tests",
]);
export type PathFunction = z.infer<typeof pathFunctionSchema>;

// ── Node kinds ───────────────────────────────────────────────
export const nodeKindSchema = z.enum([
  "phase",
  "assumption",
  "claim",
  "replacement_model",
  "practice",
  "risk",
  "corrective",
  "incarnation",
  "warning",
  "stream",
  "tradition",
  "figure",
  "text",
  "source_card",
  "concept",
]);
export type NodeKind = z.infer<typeof nodeKindSchema>;

// ── Edge kinds ───────────────────────────────────────────────
export const edgeKindSchema = z.enum([
  "historical_influence",
  "reception",
  "translation_transmission",
  "conceptual_parallel",
  "grounds",
  "breaks_assumption",
  "replaces_with",
  "enables_practice",
  "risks",
  "corrects",
  "incarnates_as",
  "evidenced_by",
  "contained_in",
  "bridges",
  "pressure_tests",
  "category_error_warning",
  "maps_to_phase",
  "maps_to_risk",
  "maps_to_practice",
]);
export type EdgeKind = z.infer<typeof edgeKindSchema>;

// ── Relation kinds ───────────────────────────────────────────
export const relationKindSchema = z.enum([
  "historical_influence",
  "reception",
  "translation_transmission",
  "conceptual_parallel",
  "shared_vocabulary",
  "modern_adaptation",
  "appropriation_risk",
  "corrective_relation",
  "practice_resonance",
]);
export type RelationKind = z.infer<typeof relationKindSchema>;

// ── Claim types ──────────────────────────────────────────────
export const claimTypeSchema = z.enum([
  "historical",
  "conceptual_comparison",
  "metaphysical",
  "practice_question",
  "personal_note",
  "risk_signal",
  "source_question",
  "lineage_question",
  "definition_question",
  "truthcore_candidate",
]);
export type ClaimType = z.infer<typeof claimTypeSchema>;

// ── Phase ────────────────────────────────────────────────────
export const phaseSchema = z.object({
  id: z.string(),
  label: z.string(),
  phaseNumber: z.number().int().min(1).max(30),
  entryAssumption: z.string().min(1),
  proofMove: z.string().min(1),
  replacementModel: z.string().min(1),
  practiceMove: z.string().min(1),
  successMarker: z.string().min(1),
  failureMode: z.string().min(1),
  nextPhaseLogic: z.string().min(1),
  evidenceTier: evidenceTierSchema,
  pathFunction: z.array(pathFunctionSchema).min(1),
  stream: z.string().optional(),
  summary: z.string().optional(),
});
export type Phase = z.infer<typeof phaseSchema>;

// ── Assumption ───────────────────────────────────────────────
export const assumptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  statement: z.string().min(1),
  phaseBreak: z.string().optional(),
  replacedBy: z.string().optional(),
  evidenceTier: evidenceTierSchema.optional(),
});
export type Assumption = z.infer<typeof assumptionSchema>;

// ── Claim ────────────────────────────────────────────────────
export const claimSchema = z.object({
  id: z.string(),
  label: z.string(),
  statement: z.string().min(1),
  claimType: claimTypeSchema.optional(),
  phase: z.number().optional(),
  evidenceTier: evidenceTierSchema.optional(),
});
export type Claim = z.infer<typeof claimSchema>;

// ── Practice ─────────────────────────────────────────────────
export const practiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().min(1),
  phase: z.number().optional(),
  enables: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});
export type Practice = z.infer<typeof practiceSchema>;

// ── Risk ─────────────────────────────────────────────────────
export const riskSchema = z.object({
  id: z.string(),
  label: z.string(),
  statement: z.string().min(1),
  causedBy: z.array(z.string()).optional(),
  correctives: z.array(z.string()).optional(),
});
export type Risk = z.infer<typeof riskSchema>;

// ── Corrective ───────────────────────────────────────────────
export const correctiveSchema = z.object({
  id: z.string(),
  label: z.string(),
  statement: z.string().min(1),
  practice: z.string().optional(),
  corrects: z.array(z.string()).optional(),
});
export type Corrective = z.infer<typeof correctiveSchema>;

// ── Warning ──────────────────────────────────────────────────
export const warningSchema = z.object({
  id: z.string(),
  label: z.string(),
  statement: z.string().min(1),
});
export type Warning = z.infer<typeof warningSchema>;

// ── Source card ──────────────────────────────────────────────
export const sourceCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  tradition: z.string(),
  phase: z.array(z.number()),
  sourceType: z.enum(["primary_text", "book", "paper", "essay", "talk", "website"]),
  epistemicTier: evidenceTierSchema,
  coreContribution: z.string(),
  breaks: z.array(z.string()).optional(),
  grounds: z.array(z.string()).optional(),
  enables: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  correctives: z.array(z.string()).optional(),
  bestUsedFor: z.string(),
  caution: z.string().optional(),
});
export type SourceCard = z.infer<typeof sourceCardSchema>;

// ── Tradition ────────────────────────────────────────────────
export const traditionSchema = z.object({
  id: z.string(),
  label: z.string(),
  aliases: z.array(z.string()).optional(),
  stream: z.string(),
  period: z.string().optional(),
  geography: z.array(z.string()).optional(),
  definition: z.string().min(1),
  coreClaims: z.array(z.string()),
  corePractices: z.array(z.string()).optional(),
  coreTexts: z.array(z.string()).optional(),
  representativeFigures: z.array(z.string()).optional(),
  evidenceTier: evidenceTierSchema,
  useFor: z.array(z.string()),
  doNotUseFor: z.array(z.string()),
  commonCategoryErrors: z.array(z.string()),
  risks: z.array(z.string()),
  correctives: z.array(z.string()),
  relatedTraditions: z
    .array(
      z.object({
        traditionId: z.string(),
        relation: relationKindSchema,
        note: z.string(),
      })
    )
    .optional(),
  status: z.enum(["draft", "review_needed", "approved", "deprecated"]),
});
export type Tradition = z.infer<typeof traditionSchema>;

// ── Edge ─────────────────────────────────────────────────────
export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: edgeKindSchema,
  label: z.string(),
  strength: z.number().int().min(1).max(3).optional(),
  confidence: evidenceTierSchema.optional(),
  note: z.string().optional(),
});
export type Edge = z.infer<typeof edgeSchema>;

// ── Graph ────────────────────────────────────────────────────
export const graphSchema = z.object({
  phases: z.array(phaseSchema).optional(),
  assumptions: z.array(assumptionSchema).optional(),
  claims: z.array(claimSchema).optional(),
  practices: z.array(practiceSchema).optional(),
  risks: z.array(riskSchema).optional(),
  correctives: z.array(correctiveSchema).optional(),
  warnings: z.array(warningSchema).optional(),
  sourceCards: z.array(sourceCardSchema).optional(),
  traditions: z.array(traditionSchema).optional(),
  edges: z.array(edgeSchema).optional(),
});
export type Graph = z.infer<typeof graphSchema>;

// ── ReRendering node data ────────────────────────────────────
export const reRenderingNodeDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: nodeKindSchema,
  stream: z.string().optional(),
  phase: z.number().optional(),
  period: z.string().optional(),
  evidenceTier: evidenceTierSchema.optional(),
  pathFunction: z.array(pathFunctionSchema).optional(),
  summary: z.string().optional(),
  statement: z.string().optional(),
  status: z.enum(["to_be_deconstructed", "replacement", "corrective", "synthesis"]).optional(),
  phaseNumber: z.number().int().optional(),
  entryAssumption: z.string().optional(),
  proofMove: z.string().optional(),
  replacementModel: z.string().optional(),
  practiceMove: z.string().optional(),
  successMarker: z.string().optional(),
  failureMode: z.string().optional(),
  nextPhaseLogic: z.string().optional(),
  breaks: z.array(z.string()).optional(),
  grounds: z.array(z.string()).optional(),
  enables: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  corrects: z.array(z.string()).optional(),
  incarnatesAs: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  cautions: z.array(z.string()).optional(),
});
export type ReRenderingNodeData = z.infer<typeof reRenderingNodeDataSchema>;

// ── Edge data ────────────────────────────────────────────────
export const reRenderingEdgeDataSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: edgeKindSchema,
  label: z.string(),
  strength: z.number().int().min(1).max(3).optional(),
  confidence: evidenceTierSchema.optional(),
  note: z.string().optional(),
});
export type ReRenderingEdgeData = z.infer<typeof reRenderingEdgeDataSchema>;

// ── Graph packet (for LLM context) ───────────────────────────
export const graphPacketSchema = z.object({
  userClaim: z.string(),
  mode: z.enum(["atlas", "guide"]),
  primaryPhase: z.object({
    id: z.string(),
    label: z.string(),
    phaseNumber: z.number(),
  }).optional(),
  assumptions: z.array(z.string()),
  demolition: z.string().optional(),
  replacementModel: z.string().optional(),
  graphPath: z.array(
    z.object({
      nodeId: z.string(),
      label: z.string(),
      kind: nodeKindSchema,
    })
  ),
  sourceCards: z.array(sourceCardSchema),
  risks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      causedBy: z.array(z.string()).optional(),
    })
  ),
  correctives: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      practice: z.string().optional(),
    })
  ),
  evidenceTier: evidenceTierSchema.optional(),
  categoryWarnings: z.array(z.string()),
  suggestedPractice: z.string().optional(),
});
export type GraphPacket = z.infer<typeof graphPacketSchema>;

// ── Reasoning trace ──────────────────────────────────────────
export const reasoningTraceSchema = z.object({
  userInput: z.string(),
  normalizedClaim: z.string(),
  claimType: claimTypeSchema,
  primaryPhase: z.string(),
  secondaryPhases: z.array(z.string()).optional(),
  detectedAssumptions: z.array(z.string()),
  graphSeeds: z.array(z.string()),
  retrievedNodes: z.array(z.string()),
  graphPath: z.array(z.string()),
  relationTypesUsed: z.array(relationKindSchema),
  evidenceTier: evidenceTierSchema,
  sourceCardsUsed: z.array(z.string()),
  risksDetected: z.array(z.string()),
  correctivesSuggested: z.array(z.string()),
  categoryWarnings: z.array(z.string()),
  answerFrame: z.enum([
    "yes_but",
    "no_but",
    "partial_parallel",
    "historical_distinction",
    "practice_instruction",
    "risk_correction",
    "source_grounded_summary",
  ]),
  finalPracticeOrInquiry: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]),
  needsHumanReview: z.boolean(),
});
export type ReasoningTrace = z.infer<typeof reasoningTraceSchema>;

// ── Answer evaluation ────────────────────────────────────────
export const answerEvaluationSchema = z.object({
  correctPhasePlacement: z.boolean(),
  relationTypeDeclared: z.boolean(),
  evidenceTierDeclared: z.boolean(),
  noFakeHistoricalInfluence: z.boolean(),
  riskIncluded: z.boolean(),
  correctiveIncluded: z.boolean(),
  practiceIncluded: z.boolean(),
  categoryErrorsAvoided: z.boolean(),
  sourceClaimsSupported: z.boolean(),
  speculativeClaimsMarked: z.boolean(),
  personalPrivacyRespected: z.boolean(),
  overall: z.enum(["pass", "needs_rewrite", "human_review"]),
  critique: z.string().optional(),
});
export type AnswerEvaluation = z.infer<typeof answerEvaluationSchema>;

// ── Q&A record ───────────────────────────────────────────────
export const qaRecordSchema = z.object({
  id: z.string(),
  question: z.string(),
  normalizedClaim: z.string().optional(),
  answer: z.string(),
  mode: z.enum(["atlas", "guide"]),
  graphPath: z.array(z.string()),
  sourceCards: z.array(z.string()),
  evidenceTier: evidenceTierSchema.optional(),
  risks: z.array(z.string()),
  correctives: z.array(z.string()),
  status: z.enum(["generated", "user_liked", "review_needed", "approved", "deprecated", "contradicted"]),
  feedbackScore: z.number().optional(),
  createdAt: z.string(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
});
export type QARecord = z.infer<typeof qaRecordSchema>;
