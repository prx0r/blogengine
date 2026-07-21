import type {
  CommissionDraft,
  MarketSnapshot,
  ResearchObjectLike,
  ResearchObjectPin,
  VideoMode,
  VideoObject,
} from "./types";
import { VIDEO_OBJECT_SCHEMA_VERSION } from "./types";
import { countWords, DEFAULT_READING_RATE_WPM, formatDuration, timeBeats } from "./timing";

export function isPlaceholderPassage(text: string): boolean {
  const normalized = text.trim();
  return normalized.startsWith("[") && normalized.endsWith("]");
}

export function pinResearchObject(ro: ResearchObjectLike, path: string): ResearchObjectPin {
  const body = ro.body ?? [];
  const placeholderCount = body.filter((passage) => isPlaceholderPassage(passage.text)).length;
  const usableCount = body.filter(
    (passage) => !isPlaceholderPassage(passage.text) && passage.text.trim().length >= 40,
  ).length;
  const coverageValues = Object.values(ro.coverage ?? {})
    .map((section) => section.estimated_completeness)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const warnings: string[] = [];
  if (ro.status !== "published") warnings.push(`Research Object status is ${ro.status}, not published.`);
  if (placeholderCount > 0) warnings.push(`${placeholderCount} passage(s) are extraction placeholders.`);
  if (usableCount === 0) warnings.push("No usable source passages are available for a grounded script.");

  return {
    ro_id: ro.ro_id,
    version: ro.current_version,
    title: ro.title,
    path,
    passage_ids: body.map((passage) => passage.passage_id),
    source_health: {
      passage_count: body.length,
      usable_passage_count: usableCount,
      placeholder_passage_count: placeholderCount,
      coverage_mean: coverageValues.length > 0
        ? coverageValues.reduce((sum, value) => sum + value, 0) / coverageValues.length
        : null,
      warnings,
    },
  };
}

function cleanQuery(value: string): string {
  return value
    .replace(/[_:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function deriveSearchQueries(ros: ResearchObjectLike[], manualQueries: string[] = []): string[] {
  const queries = [...manualQueries];
  for (const ro of ros) {
    queries.push(cleanQuery(ro.title.replace(/\bon\b/gi, "")));
    const topics = new Map<string, number>();
    for (const passage of ro.body ?? []) {
      for (const topic of passage.topics ?? []) {
        topics.set(topic, (topics.get(topic) ?? 0) + 1);
      }
    }
    const topTopics = [...topics.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([topic]) => cleanQuery(topic));
    for (const topic of topTopics) queries.push(`${cleanQuery(ro.title)} ${topic}`);
    const tradition = ro.summary?.traditions?.[0];
    if (tradition) queries.push(`${cleanQuery(ro.title)} ${cleanQuery(tradition)} philosophy`);
  }
  return [...new Set(queries.map(cleanQuery).filter((query) => query.length >= 3))].slice(0, 6);
}

export interface CompileVideoObjectInput {
  slug: string;
  mode: VideoMode;
  researchObjects: Array<{ object: ResearchObjectLike; path: string }>;
  market: MarketSnapshot;
  draft: CommissionDraft;
  readingRateWpm?: number;
  generatorModel: string;
  promptVersion: string;
  now?: Date;
}

export function compileVideoObject(input: CompileVideoObjectInput): VideoObject {
  const selected = input.draft.packaging_candidates.find(
    (candidate) => candidate.candidate_id === input.draft.selected_candidate_id,
  );
  if (!selected) throw new Error(`Selected packaging candidate ${input.draft.selected_candidate_id} does not exist.`);
  if (input.draft.beats.length === 0) throw new Error("A Video Object requires at least one script beat.");

  const readingRateWpm = input.readingRateWpm ?? DEFAULT_READING_RATE_WPM;
  const beats = timeBeats(input.draft.beats, readingRateWpm);
  const script = beats.map((beat) => beat.script.trim()).join("\n\n");
  const duration = beats.at(-1)?.end_seconds ?? 0;
  const now = (input.now ?? new Date()).toISOString();
  const sourceObjects = input.researchObjects.map(({ object, path }) => pinResearchObject(object, path));

  return {
    vo_id: `video:${input.slug}`,
    schema_version: VIDEO_OBJECT_SCHEMA_VERSION,
    current_version: "0.1.0",
    status: "scripted",
    created_at: now,
    updated_at: now,
    channel: "Light in Form",
    mode: input.mode,
    source_objects: sourceObjects,
    premise: {
      universal_question: input.draft.universal_question,
      viewer: input.draft.viewer,
      promise: input.draft.promise,
      thesis: input.draft.thesis,
      natural_form: input.draft.format,
      decision: input.draft.decision,
      decision_reason: input.draft.decision_reason,
    },
    market: input.market,
    packaging: {
      candidates: input.draft.packaging_candidates,
      selected_candidate_id: selected.candidate_id,
      title: selected.title,
      thumbnail: selected.thumbnail,
      hook: selected.hook,
    },
    production: {
      reading_rate_wpm: readingRateWpm,
      word_count: countWords(script),
      estimated_duration_seconds: duration,
      estimated_duration_display: formatDuration(duration),
      target_length_minutes: input.draft.likely_length_minutes,
      script,
      beats,
      storyboard: beats.flatMap((beat) => beat.shots),
    },
    publication: {
      youtube_video_id: null,
      youtube_url: null,
      published_at: null,
    },
    analytics: {
      last_ingested_at: null,
      window: null,
      summary: null,
      retention_points: [],
      beat_performance: [],
      learnings: [],
    },
    provenance: {
      prompt_version: input.promptVersion,
      generator_model: input.generatorModel,
      market_snapshot_at: input.market.retrieved_at,
    },
  };
}
