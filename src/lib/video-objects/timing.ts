import type { BeatDraft, TimedBeat, TimedShot } from "./types";

export const DEFAULT_READING_RATE_WPM = 145;

export function countWords(text: string): number {
  const normalized = text.trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

export function estimateNarrationSeconds(text: string, wordsPerMinute = DEFAULT_READING_RATE_WPM): number {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new Error("wordsPerMinute must be a positive number");
  }
  return round1((countWords(text) / wordsPerMinute) * 60);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function allocateShots(
  beat: BeatDraft,
  beatStart: number,
  beatDuration: number,
): TimedShot[] {
  const drafts = beat.shots.length > 0
    ? beat.shots
    : [{
        shot_id: `${beat.beat_id}-shot-1`,
        label: beat.label,
        visual: "Hold the beat's primary visual idea.",
        purpose: beat.purpose,
        asset_strategy: "diagram" as const,
        motion: "subtle hold",
        weight: 1,
        concept_ids: [],
      }];
  const totalWeight = drafts.reduce((sum, shot) => sum + Math.max(shot.weight, 0.1), 0);
  let cursor = beatStart;

  return drafts.map((shot, index) => {
    const isLast = index === drafts.length - 1;
    const duration = isLast
      ? round1(beatStart + beatDuration - cursor)
      : round1(beatDuration * (Math.max(shot.weight, 0.1) / totalWeight));
    const start = round1(cursor);
    const end = round1(start + Math.max(duration, 0));
    cursor = end;
    return {
      ...shot,
      start_seconds: start,
      end_seconds: end,
      duration_seconds: round1(end - start),
    };
  });
}

export function timeBeats(beats: BeatDraft[], wordsPerMinute = DEFAULT_READING_RATE_WPM): TimedBeat[] {
  let cursor = 0;
  return beats.map((beat) => {
    const narrationSeconds = estimateNarrationSeconds(beat.script, wordsPerMinute);
    const pause = Math.max(0, beat.pause_after_seconds || 0);
    const duration = round1(narrationSeconds + pause);
    const start = round1(cursor);
    const end = round1(start + duration);
    const shots = allocateShots(beat, start, duration);
    cursor = end;
    return {
      ...beat,
      word_count: countWords(beat.script),
      narration_seconds: narrationSeconds,
      start_seconds: start,
      end_seconds: end,
      duration_seconds: duration,
      shots,
    };
  });
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}
