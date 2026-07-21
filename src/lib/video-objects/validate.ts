import { countWords } from "./timing";
import type { CommissionDraft, VideoObject } from "./types";

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const VALID_FORMATS = new Set([
  "adventure", "archival_essay", "procedural_derivation", "talking_head", "slideshow", "interview", "hybrid",
]);

export function validateCommissionDraft(draft: CommissionDraft): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!draft.universal_question?.trim()) errors.push("universal_question is required.");
  if (!VALID_FORMATS.has(draft.format)) errors.push(`Unknown format: ${draft.format}`);
  if (draft.packaging_candidates?.length !== 3) errors.push("Exactly three packaging candidates are required.");
  if (!draft.packaging_candidates?.some((candidate) => candidate.candidate_id === draft.selected_candidate_id)) {
    errors.push("selected_candidate_id does not match a packaging candidate.");
  }
  if (!draft.beats?.length) errors.push("At least one beat is required.");
  for (const beat of draft.beats ?? []) {
    if (!beat.script?.trim()) errors.push(`${beat.beat_id}: script is empty.`);
    if (!beat.shots?.length) warnings.push(`${beat.beat_id}: no shots supplied; compiler will create a fallback shot.`);
    if ((beat.pause_after_seconds ?? 0) < 0) errors.push(`${beat.beat_id}: pause_after_seconds cannot be negative.`);
  }
  return { errors, warnings };
}

export function validateVideoObject(video: VideoObject): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const selected = video.packaging.candidates.find(
    (candidate) => candidate.candidate_id === video.packaging.selected_candidate_id,
  );
  if (!selected) errors.push("Selected packaging candidate is missing.");
  if (selected && selected.title !== video.packaging.title) errors.push("Selected candidate title and packaging.title diverge.");
  if (selected && selected.hook !== video.packaging.hook) errors.push("Selected candidate hook and packaging.hook diverge.");

  const derivedScript = video.production.beats.map((beat) => beat.script.trim()).join("\n\n");
  if (derivedScript !== video.production.script) errors.push("Top-level script diverges from beat scripts.");
  if (countWords(video.production.script) !== video.production.word_count) errors.push("Stored word count is stale.");

  const knownEvidence = new Set<string>();
  for (const source of video.source_objects) {
    for (const passageId of source.passage_ids) knownEvidence.add(`${source.ro_id}#${passageId}`);
    for (const warning of source.source_health.warnings) warnings.push(`${source.ro_id}: ${warning}`);
  }
  for (const reference of video.market.references) knownEvidence.add(`youtube:${reference.video_id}`);

  let cursor = 0;
  for (const beat of video.production.beats) {
    if (Math.abs(beat.start_seconds - cursor) > 0.11) errors.push(`${beat.beat_id}: beat timeline is not contiguous.`);
    if (beat.end_seconds <= beat.start_seconds) errors.push(`${beat.beat_id}: beat duration must be positive.`);
    if (beat.shots.length === 0) errors.push(`${beat.beat_id}: timed storyboard is empty.`);
    let shotCursor = beat.start_seconds;
    for (const shot of beat.shots) {
      if (Math.abs(shot.start_seconds - shotCursor) > 0.11) errors.push(`${shot.shot_id}: shot timeline is not contiguous.`);
      if (shot.duration_seconds > 25) warnings.push(`${shot.shot_id}: visual holds for more than 25 seconds.`);
      shotCursor = shot.end_seconds;
    }
    if (Math.abs(shotCursor - beat.end_seconds) > 0.11) errors.push(`${beat.beat_id}: shots do not fill the beat.`);
    for (const evidenceRef of beat.evidence_refs) {
      if (!knownEvidence.has(evidenceRef)) errors.push(`${beat.beat_id}: unknown evidence ref ${evidenceRef}.`);
    }
    cursor = beat.end_seconds;
  }
  if (Math.abs(cursor - video.production.estimated_duration_seconds) > 0.11) {
    errors.push("Stored total duration is stale.");
  }
  for (const candidate of video.packaging.candidates) {
    for (const evidenceRef of candidate.evidence_refs) {
      if (!knownEvidence.has(evidenceRef)) errors.push(`${candidate.candidate_id}: unknown evidence ref ${evidenceRef}.`);
    }
  }
  if (video.market.references.length < 5) warnings.push("Market snapshot has fewer than five adjacent references.");
  return { errors, warnings };
}
