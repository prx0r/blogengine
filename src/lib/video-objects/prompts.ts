import type { MarketSnapshot, ResearchObjectLike, VideoMode } from "./types";

export const VIDEO_COMMISSION_PROMPT_VERSION = "light-in-form-commission-v1";

function researchPacket(ros: ResearchObjectLike[]): unknown {
  return ros.map((ro) => ({
    ro_id: ro.ro_id,
    version: ro.current_version,
    title: ro.title,
    status: ro.status,
    summary: ro.summary,
    coverage: ro.coverage,
    passages: (ro.body ?? []).map((passage) => ({
      evidence_ref: `${ro.ro_id}#${passage.passage_id}`,
      text: passage.text,
      topics: passage.topics,
      source_id: passage.source_id,
      page_ref: passage.page_ref,
    })),
  }));
}

function marketPacket(market: MarketSnapshot): unknown {
  return market.references.map((reference) => ({
    evidence_ref: `youtube:${reference.video_id}`,
    url: reference.url,
    title: reference.title,
    thumbnail_url: reference.thumbnail_url,
    channel: reference.channel_title,
    published_at: reference.published_at,
    duration_seconds: reference.duration_seconds,
    view_count: reference.view_count,
    views_per_day: reference.views_per_day,
    thumbnail_analysis: reference.thumbnail_analysis,
    baseline: reference.channel_baseline,
    breakout: reference.breakout,
  }));
}

export function buildCommissionPrompt(input: {
  mode: VideoMode;
  slug: string;
  ros: ResearchObjectLike[];
  market: MarketSnapshot;
}): string {
  const modeInstruction = input.mode === "canon"
    ? "This is a Light in Form canon film: authored, durable, evidence-led, and visually native to its argument."
    : "This is a field film: a concrete mission with uncertain social consequences, a simple Hindi kit, and a payoff even if the mission fails.";

  return `You are the commissioning editor for Light in Form.

${modeInstruction}

Your task is to turn versioned Research Objects and current YouTube market evidence into one commission draft. Market evidence informs packaging and format; it does not determine truth. Research Objects ground factual claims; never invent scholarship or metrics.

Editorial rules:
1. Begin with the universal human question, not specialist terminology.
2. Produce exactly 3 genuinely different packaging candidates.
3. A title and thumbnail form one argument. Thumbnail text is optional and should usually be 0-4 words.
4. Borrow structural patterns from reference videos, never their wording or distinctive artwork.
5. Every packaging candidate cites one or more youtube:<id> evidence refs.
6. Every factual beat cites one or more ro:<id>#<passage_id> evidence refs. Use YouTube refs only for packaging/format observations.
7. Write the complete spoken script inside the beats. Spoken prose must be original synthesis; do not reproduce long source passages.
8. The first beat is the selected hook verbatim or expands it without delaying the promise.
9. Structure the script as question → inadequate or failed answer → evidence/reconstruction → implication → payoff.
10. Shots describe what the viewer must see and why. Use weight as a relative positive number; code will calculate exact timestamps.
11. Do not output timestamps, word counts, breakout scores, or invented analytics. Code calculates them.
12. Choose the natural form demanded by the idea: adventure, archival_essay, procedural_derivation, talking_head, slideshow, interview, or hybrid.
13. Only make visual claims about a reference thumbnail when thumbnail_analysis.status is analyzed. A URL is not evidence that you saw an image.
14. Treat prior Light in Form analytics as observations, not causal proof. Prefer repeated patterns across comparable films; never let packaging data override Research Object evidence.

Return valid JSON only with this exact top-level shape:
{
  "universal_question": "string",
  "viewer": "string",
  "promise": "string",
  "thesis": "string",
  "format": "adventure | archival_essay | procedural_derivation | talking_head | slideshow | interview | hybrid",
  "decision": "make_now | prototype | hold_for_canon | reject",
  "decision_reason": "string",
  "likely_length_minutes": { "min": 8, "max": 20 },
  "packaging_candidates": [{
    "candidate_id": "package-a",
    "title": "string",
    "human_question": "string",
    "promise": "string",
    "title_mechanism": "string",
    "thumbnail": {
      "concept": "string",
      "argument": "string",
      "composition": "string",
      "focal_subject": "string",
      "background": "string",
      "text": null,
      "palette": ["string"],
      "avoid": ["string"],
      "source_asset_ids": [],
      "output_path": "content/video-objects/${input.slug}/thumbnail.png",
      "status": "planned"
    },
    "hook": "string",
    "evidence_refs": ["youtube:VIDEO_ID"],
    "transfer_logic": "what is borrowed structurally and what must not be copied"
  }],
  "selected_candidate_id": "package-a",
  "beats": [{
    "beat_id": "beat-01",
    "label": "string",
    "rhetorical_role": "hook | question | thesis | context | evidence | example | contrast | reconstruction | implication | synthesis | closing",
    "purpose": "string",
    "tension": "string",
    "script": "complete spoken prose for this beat",
    "evidence_refs": ["ro:object#passage_id"],
    "pause_after_seconds": 0.5,
    "shots": [{
      "shot_id": "beat-01-shot-01",
      "label": "string",
      "visual": "string",
      "purpose": "string",
      "asset_strategy": "archive | diagram | location | object | talking_head | generated",
      "motion": "string",
      "weight": 1,
      "concept_ids": ["string"]
    }]
  }]
}

RESEARCH OBJECTS:
${JSON.stringify(researchPacket(input.ros), null, 2)}

CURRENT MARKET SNAPSHOT (${input.market.retrieved_at}):
DISCOVERY LENSES:
${JSON.stringify(input.market.discovery_lenses, null, 2)}

${JSON.stringify(marketPacket(input.market), null, 2)}

PRIOR LIGHT IN FORM PERFORMANCE (private, already ingested):
${JSON.stringify(input.market.own_channel_evidence, null, 2)}
`;
}
