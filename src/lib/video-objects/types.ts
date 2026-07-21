export const VIDEO_OBJECT_SCHEMA_VERSION = 1 as const;

export type VideoMode = "field" | "canon";
export type CommissionDecision = "make_now" | "prototype" | "hold_for_canon" | "reject";
export type NaturalForm =
  | "adventure"
  | "archival_essay"
  | "procedural_derivation"
  | "talking_head"
  | "slideshow"
  | "interview"
  | "hybrid";

export type RhetoricalRole =
  | "hook"
  | "question"
  | "thesis"
  | "context"
  | "evidence"
  | "example"
  | "contrast"
  | "reconstruction"
  | "implication"
  | "synthesis"
  | "closing";

export interface ResearchObjectPin {
  ro_id: string;
  version: string;
  title: string;
  path: string;
  passage_ids: string[];
  source_health: {
    passage_count: number;
    usable_passage_count: number;
    placeholder_passage_count: number;
    coverage_mean: number | null;
    warnings: string[];
  };
}

export interface ChannelBaseline {
  channel_id: string;
  subscriber_count: number | null;
  sample_size: number;
  sample_video_ids: string[];
  median_views: number | null;
  median_views_per_day: number | null;
  method: "prior_longform_uploads";
  window_size: number;
  unavailable_reason?: string;
}

export interface BreakoutReference {
  video_id: string;
  url: string;
  title: string;
  thumbnail_url: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  duration_seconds: number;
  age_days: number;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  views_per_day: number;
  discovery_queries: string[];
  thumbnail_analysis: {
    status: "not_analyzed" | "analyzed";
    focal_subject: string | null;
    visible_text: string | null;
    composition: string | null;
    contrast: string | null;
    argument: string | null;
    model: string | null;
  };
  channel_baseline: ChannelBaseline;
  breakout: {
    views_ratio: number | null;
    velocity_ratio: number | null;
    is_breakout: boolean;
    rule: "views>=3x_baseline_or_velocity>=4x_baseline";
  };
}

export interface DiscoveryLens {
  query: string;
  lens: "literal" | "human_question" | "historical_case" | "mechanism" | "adjacent_audience" | "misconception" | "channel";
  reason: string;
}

export interface OwnChannelVideoEvidence {
  vo_id: string;
  youtube_video_id: string;
  published_at: string | null;
  analytics_ingested_at: string;
  title: string;
  thumbnail_argument: string;
  hook: string;
  mode: VideoMode;
  natural_form: NaturalForm;
  word_count: number;
  duration_seconds: number;
  summary: Record<string, number>;
  beats: Array<{
    beat_id: string;
    label: string;
    rhetorical_role: RhetoricalRole;
    average_audience_watch_ratio: number | null;
    retention_delta: number | null;
    average_relative_retention: number | null;
  }>;
}

export interface MarketSnapshot {
  provider: "youtube_data_api_v3" | "fixture";
  retrieved_at: string;
  region_code: string;
  published_after: string;
  search_queries: string[];
  discovery_lenses: DiscoveryLens[];
  search_order: "viewCount" | "relevance" | "date";
  references: BreakoutReference[];
  own_channel_evidence: OwnChannelVideoEvidence[];
  notes: string[];
}

export interface ThumbnailPlan {
  concept: string;
  argument: string;
  composition: string;
  focal_subject: string;
  background: string;
  text: string | null;
  palette: string[];
  avoid: string[];
  source_asset_ids: string[];
  output_path: string;
  status: "planned" | "draft" | "approved" | "published";
}

export interface PackagingCandidate {
  candidate_id: string;
  title: string;
  human_question: string;
  promise: string;
  title_mechanism: string;
  thumbnail: ThumbnailPlan;
  hook: string;
  evidence_refs: string[];
  transfer_logic: string;
}

export interface ShotDraft {
  shot_id: string;
  label: string;
  visual: string;
  purpose: string;
  asset_strategy: "archive" | "diagram" | "location" | "object" | "talking_head" | "generated";
  motion: string;
  weight: number;
  concept_ids: string[];
}

export interface BeatDraft {
  beat_id: string;
  label: string;
  rhetorical_role: RhetoricalRole;
  purpose: string;
  tension: string;
  script: string;
  evidence_refs: string[];
  pause_after_seconds: number;
  shots: ShotDraft[];
}

export interface CommissionDraft {
  universal_question: string;
  viewer: string;
  promise: string;
  thesis: string;
  format: NaturalForm;
  decision: CommissionDecision;
  decision_reason: string;
  likely_length_minutes: { min: number; max: number };
  packaging_candidates: PackagingCandidate[];
  selected_candidate_id: string;
  beats: BeatDraft[];
}

export interface TimedShot extends ShotDraft {
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
}

export interface TimedBeat extends Omit<BeatDraft, "shots"> {
  word_count: number;
  narration_seconds: number;
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  shots: TimedShot[];
}

export interface RetentionPoint {
  elapsed_ratio: number;
  elapsed_seconds: number;
  audience_watch_ratio: number;
  relative_retention_performance: number | null;
  started_watching: number | null;
  stopped_watching: number | null;
  total_segment_impressions: number | null;
}

export interface BeatPerformance {
  beat_id: string;
  average_audience_watch_ratio: number | null;
  retention_start: number | null;
  retention_end: number | null;
  retention_delta: number | null;
  average_relative_retention: number | null;
  point_count: number;
}

export interface VideoObject {
  vo_id: string;
  schema_version: typeof VIDEO_OBJECT_SCHEMA_VERSION;
  current_version: string;
  status: "commission" | "scripted" | "in_production" | "published" | "archived";
  created_at: string;
  updated_at: string;
  channel: "Light in Form";
  mode: VideoMode;
  source_objects: ResearchObjectPin[];
  premise: {
    universal_question: string;
    viewer: string;
    promise: string;
    thesis: string;
    natural_form: NaturalForm;
    decision: CommissionDecision;
    decision_reason: string;
  };
  market: MarketSnapshot;
  packaging: {
    candidates: PackagingCandidate[];
    selected_candidate_id: string;
    title: string;
    thumbnail: ThumbnailPlan;
    hook: string;
  };
  production: {
    reading_rate_wpm: number;
    word_count: number;
    estimated_duration_seconds: number;
    estimated_duration_display: string;
    target_length_minutes: { min: number; max: number };
    script: string;
    beats: TimedBeat[];
    storyboard: TimedShot[];
  };
  publication: {
    youtube_video_id: string | null;
    youtube_url: string | null;
    published_at: string | null;
  };
  analytics: {
    last_ingested_at: string | null;
    window: { start_date: string; end_date: string } | null;
    summary: Record<string, number> | null;
    retention_points: RetentionPoint[];
    beat_performance: BeatPerformance[];
    learnings: string[];
  };
  provenance: {
    prompt_version: string;
    generator_model: string;
    market_snapshot_at: string;
  };
}

export interface ResearchObjectLike {
  ro_id: string;
  current_version: string;
  title: string;
  status: string;
  summary?: {
    one_line?: string;
    scope?: string;
    traditions?: string[];
  };
  body?: Array<{
    passage_id: string;
    text: string;
    topics?: string[];
    source_id?: string;
    page_ref?: string | null;
  }>;
  coverage?: Record<string, { estimated_completeness?: number }>;
}
