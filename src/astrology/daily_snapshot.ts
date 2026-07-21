/**
 * Daily Snapshot — maximally granular record of everything the engine produced.
 * 
 * This is the complete deterministic output for a given day. Stored in D1.
 * The LLM renders from this — it never sees raw caelus data directly.
 * 
 * Fields are NEVER removed. Add new fields as needed, but never delete.
 * This ensures backward compatibility with stored snapshots.
 */

import type { PlanetId, PlanetConditionPacket, Confidence, LotName } from "./types";
import type { MacroTranslation } from "./interpreters/aggregator";
import type { InterpretedReading } from "./interpretation_schema";
import type { SpellEntry } from "./spellbook/types";

export interface DailySnapshot {
  /** ISO date string */
  date: string;
  /** Native identifier */
  native_id: string;
  /** Unix timestamp of computation */
  computed_at: number;
  
  /** ── Engine Layer ── */
  engine: {
    signals: Array<{
      planet: PlanetId;
      score: number;
      confidence: Confidence;
      timing_sources: string[];
      activated_houses: number[];
      activated_lots: LotName[];
      condition: PlanetConditionPacket | null;
    }>;
    dominant_mode: "fortune" | "spirit" | "mixed";
    fortune_score: number;
    spirit_score: number;
    oikodespotes: { planet: PlanetId; score: number; interpretation: string; soul_choice?: string } | null;
    planet_conditions: PlanetConditionPacket[];
    aspect_patterns: Array<{ type: string; planets: PlanetId[]; description: string }>;
    antiscia: Array<{ planet_a: PlanetId; planet_b: PlanetId; orb: number }>;
    bonification: Array<{ type: string; planet_a: PlanetId; planet_b: PlanetId; description: string; beneficial: boolean }>;
    valens_combinations: Array<{ planets: PlanetId[]; type: string; themes: string[] }>;
  };
  
  /** ── Timescape Layer (never text, always structured) ── */
  timescapes: MacroTranslation["timescales"];
  
  /** ── Interpretation Layer (all 5 systems) ── */
  interpretations: InterpretedReading["interpretations"];
  
  /** ── Convergence Layer ── */
  convergence: {
    planets: string[];
    themes: string[];
    advice: string[];
  };
  
  /** ── Practice Layer ── */
  practices: Array<{
    id: string;
    source: string;
    type: string;
    title: string;
    procedure: string[];
    incantation: string | null;
    timing: object | null;
    materials: object | null;
    safety: string;
    source_text: string | null;  // The actual hymn/prayer text from the source
  }>;
  
  /** ── Correspondence Layer ── */
  correspondences: Record<string, Array<{ type: string; label: string; citation: string }>>;
  
  /** ── User Data (optional, added when provided) ── */
  user?: {
    mood?: number;
    energy?: number;
    notes?: string;
    events?: string[];
    tags?: string[];
  };
}
