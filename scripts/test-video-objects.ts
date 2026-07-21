import assert from "node:assert/strict";
import { attachBreakout, buildBaseline, mapRetentionToBeats } from "../src/lib/video-objects/breakout";
import { compileVideoObject } from "../src/lib/video-objects/compiler";
import { countWords, estimateNarrationSeconds } from "../src/lib/video-objects/timing";
import type { CommissionDraft, MarketSnapshot, ResearchObjectLike } from "../src/lib/video-objects/types";
import { validateVideoObject } from "../src/lib/video-objects/validate";
import { parseIsoDuration } from "../src/lib/video-objects/youtube-data";

const ro: ResearchObjectLike = {
  ro_id: "ro:test-light",
  current_version: "1.0.0",
  title: "Light and Form",
  status: "published",
  body: [{ passage_id: "p_001", text: "A usable evidence passage about the relation between observation and form, long enough to pass source health checks." }],
  coverage: { ontology: { estimated_completeness: 0.8 } },
};

const baseline = buildBaseline({
  channelId: "channel-1",
  subscriberCount: 10000,
  videos: [
    { videoId: "old-1", viewCount: 1000, viewsPerDay: 20 },
    { videoId: "old-2", viewCount: 2000, viewsPerDay: 30 },
    { videoId: "old-3", viewCount: 3000, viewsPerDay: 40 },
  ],
});
const reference = attachBreakout({
  video_id: "reference-1",
  url: "https://www.youtube.com/watch?v=reference-1",
  title: "A Breakout Reference",
  thumbnail_url: "https://example.com/thumb.jpg",
  channel_id: "channel-1",
  channel_title: "Reference channel",
  published_at: "2026-01-01T00:00:00Z",
  duration_seconds: 600,
  age_days: 10,
  view_count: 8000,
  like_count: 500,
  comment_count: 40,
  views_per_day: 800,
  discovery_queries: ["light form"],
  thumbnail_analysis: {
    status: "analyzed",
    focal_subject: "Geometric corridor",
    visible_text: null,
    composition: "Converging lines",
    contrast: "Black on white",
    argument: "The missing observer is implied by perspective.",
    model: "fixture",
  },
  channel_baseline: baseline,
});
const market: MarketSnapshot = {
  provider: "fixture",
  retrieved_at: "2026-07-19T00:00:00.000Z",
  region_code: "US",
  published_after: "2025-01-01T00:00:00.000Z",
  search_queries: ["light form"],
  discovery_lenses: [{ query: "light form", lens: "literal", reason: "Fixture" }],
  search_order: "viewCount",
  references: [reference],
  own_channel_evidence: [],
  notes: [],
};

const thumbnail = {
  concept: "Observer as vanishing point",
  argument: "The observer structures the field but is absent from it.",
  composition: "Three lines converge on an empty foreground vertex.",
  focal_subject: "Tetrahedral corridor",
  background: "White",
  text: null,
  palette: ["white", "black", "gold"],
  avoid: ["generic face"],
  source_asset_ids: [],
  output_path: "content/video-objects/test/thumbnail.png",
  status: "planned" as const,
};
const draft: CommissionDraft = {
  universal_question: "Why can everything be observed except the observer?",
  viewer: "Curious philosophy viewer",
  promise: "Derive the geometry instead of merely describing it.",
  thesis: "Observation gives experience a perspectival form.",
  format: "procedural_derivation",
  decision: "prototype",
  decision_reason: "The visual proof should be tested at short length first.",
  likely_length_minutes: { min: 5, max: 8 },
  packaging_candidates: ["a", "b", "c"].map((id) => ({
    candidate_id: `package-${id}`,
    title: `Test title ${id}`,
    human_question: "Where is the observer?",
    promise: "A visual derivation",
    title_mechanism: "paradox",
    thumbnail,
    hook: "You can observe almost anything, except the point from which observation happens.",
    evidence_refs: ["youtube:reference-1"],
    transfer_logic: "Borrow the paradox structure, not wording or artwork.",
  })),
  selected_candidate_id: "package-a",
  beats: [
    {
      beat_id: "beat-01",
      label: "The paradox",
      rhetorical_role: "hook",
      purpose: "Open the question",
      tension: "The observer is missing",
      script: "You can observe almost anything, except the point from which observation happens.",
      evidence_refs: ["ro:test-light#p_001"],
      pause_after_seconds: 1,
      shots: [{ shot_id: "shot-1", label: "Field", visual: "Empty field", purpose: "Establish absence", asset_strategy: "diagram", motion: "slow draw", weight: 1, concept_ids: ["observer"] }],
    },
    {
      beat_id: "beat-02",
      label: "The derivation",
      rhetorical_role: "reconstruction",
      purpose: "Build the relation",
      tension: "A point becomes a field",
      script: "Now draw three relations from that absent point. Form appears as the shape of relation itself.",
      evidence_refs: ["ro:test-light#p_001"],
      pause_after_seconds: 0,
      shots: [{ shot_id: "shot-2", label: "Lines", visual: "Three lines emerge", purpose: "Derive form", asset_strategy: "diagram", motion: "line reveal", weight: 1, concept_ids: ["form"] }],
    },
  ],
};

const video = compileVideoObject({
  slug: "test-light",
  mode: "canon",
  researchObjects: [{ object: ro, path: "fixture/ro.json" }],
  market,
  draft,
  readingRateWpm: 120,
  generatorModel: "fixture",
  promptVersion: "fixture-v1",
  now: new Date("2026-07-19T00:00:00.000Z"),
});

assert.equal(parseIsoDuration("PT1H2M3S"), 3723);
assert.equal(countWords("one two three"), 3);
assert.equal(estimateNarrationSeconds("one two three four", 120), 2);
assert.equal(reference.breakout.views_ratio, 4);
assert.equal(reference.breakout.is_breakout, true);
assert.equal(video.production.beats[1].start_seconds, video.production.beats[0].end_seconds);
assert.equal(video.production.storyboard.at(-1)?.end_seconds, video.production.estimated_duration_seconds);
assert.deepEqual(validateVideoObject(video).errors, []);

const performance = mapRetentionToBeats([
  { elapsed_ratio: 0.1, elapsed_seconds: 1, audience_watch_ratio: 1, relative_retention_performance: 0.6, started_watching: null, stopped_watching: null, total_segment_impressions: null },
  { elapsed_ratio: 0.2, elapsed_seconds: 3, audience_watch_ratio: 0.8, relative_retention_performance: 0.5, started_watching: null, stopped_watching: null, total_segment_impressions: null },
], video.production.beats);
assert.equal(performance.length, 2);

console.log("Video Object pipeline tests passed.");
