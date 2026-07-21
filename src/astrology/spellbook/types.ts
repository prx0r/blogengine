/**
 * Spellbook — structured practice data from Picatrix, Agrippa, PGM, Ficino, Orphic.
 * 
 * Every entry uses shared entity IDs (planet:mars, sign:leo) so the knowledge graph
 * can connect them to the macro translation. This is the PRACTICE LAYER.
 * 
 * Flow: Engine → Macro Translation → Interpreters (convergence) → Spellbook (practice)
 */

export type SpellSource = "Picatrix" | "Agrippa" | "PGM" | "Ficino" | "Orphic" | "GoldenDawn" | "Custom";

export type SafetyClass = "safe_symbolic" | "historical_reference" | "restricted";

export interface SpellTiming {
  /** Planetary day (0=sun, 1=moon, 2=mars, 3=mercury, 4=jupiter, 5=venus, 6=saturn) */
  planetaryDay?: number;
  /** Planetary hour index */
  planetaryHour?: number;
  /** Moon phase: new, waxing, full, waning */
  moonPhase?: string;
  /** Specific astrological condition */
  condition?: string;
}

export interface SpellMaterials {
  herbs?: string[];
  metals?: string[];
  colours?: string[];
  stones?: string[];
  incenses?: string[];
  other?: string[];
}

export interface SpellEntry {
  /** Unique ID: source:type:planet:number e.g. picatrix:ritual:mars:001 */
  id: string;
  /** Source tradition */
  source: SpellSource;
  /** Type of practice */
  type: "ritual" | "prayer" | "meditation" | "talisman" | "music" | "action";
  
  /** Trigger conditions — which engine states activate this practice */
  triggers: string[];
  /** Planets this connects to (shared entity IDs) */
  planets: string[];
  /** Signs this connects to */
  signs?: string[];
  /** Houses this connects to */
  houses?: number[];
  
  /** Purpose keywords */
  purpose: string[];
  
  /** Title */
  title: string;
  /** Short description */
  summary: string;
  /** Step-by-step procedure (universal — works for all types) */
  procedure: string[];
  /** Spoken invocation (prayers, incantations, hymns) */
  incantation?: string;
  
  /** Timing requirements */
  timing?: SpellTiming;
  /** Materials needed */
  materials?: SpellMaterials;
  
  /** Safety classification */
  safety: SafetyClass;
  /** Safe symbolic adaptations (always required) */
  safeAdaptations: string[];
  
  /** Source citation */
  citation?: string;
}

export interface SpellbookQuery {
  /** Trigger conditions to match */
  triggers?: string[];
  /** Planets to match */
  planets?: string[];
  /** Purpose keywords */
  purposes?: string[];
  /** Safety filter */
  safety?: SafetyClass;
  /** Source filter */
  sources?: SpellSource[];
  /** Max results */
  limit?: number;
}

export interface SpellbookQuery {
  /** Planets to look up (from convergence) */
  planets?: string[];
  /** Signs to look up */
  signs?: string[];
  /** Purpose keywords */
  purposes?: string[];
  /** Safety filter */
  safety?: SafetyClass;
  /** Max results */
  limit?: number;
  /** Source filter */
  sources?: SpellSource[];
}
