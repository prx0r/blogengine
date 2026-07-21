export type PlanetName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
export type PlanetId = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

export const PLANET_IDS: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];
export const PLANET_NAMES: PlanetName[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

export function toPlanetId(name: PlanetName): PlanetId {
  return name.toLowerCase() as PlanetId;
}
export function toPlanetName(id: PlanetId): PlanetName {
  return id.charAt(0).toUpperCase() + id.slice(1) as PlanetName;
}

export type LotName = "fortune" | "spirit" | "eros" | "necessity" | "courage" | "victory" | "nemesis";
export type DaimonicHouseTag = "good_fortune" | "bad_fortune" | "good_daimon" | "bad_daimon";

export type ActivationSource =
  | "annual_profection_lord"
  | "monthly_profection_lord"
  | "zr_spirit_lord"
  | "zr_fortune_lord"
  | "transit_to_planet"
  | "transit_to_lot"
  | "transit_to_angle"
  | "natal_prominence"
  | "source_rule_match"
  | "oikodespotes";

export type Timescale = "daily" | "weekly" | "monthly" | "yearly";
export type Confidence = "low" | "medium" | "high";
export type DaimonicMode = "fortune" | "spirit" | "mixed";

export interface ZodiacPosition {
  sign: string;
  sign_index: number;
  degree_absolute: number;
  degree_in_sign: number;
}

export interface PlanetPosition extends ZodiacPosition {
  speed: number;
  retrograde: boolean;
  house: number;
  dignities: string[];
}

export interface HouseData {
  number: number;
  sign: string;
  sign_index: number;
  topics: string[];
  daimonic_tag?: DaimonicHouseTag;
}

export interface AspectData {
  planet_a: PlanetId;
  planet_b: PlanetId;
  aspect: string;
  orb: number;
  strength: number;
  phase: string;
}

export interface NormalizedChart {
  native_id: string;
  birth_data: {
    date: string;
    time: string;
    timezone: string;
    location: { name: string; lat: number; lon: number };
  };
  natal: {
    jdUt: number;
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    planets: Record<PlanetId, PlanetPosition>;
    houses_whole_sign: HouseData[];
    aspects: AspectData[];
    lots: Record<LotName, ZodiacPosition & { house: number }>;
    dignity_scores: Record<PlanetId, DignityScore>;
    day_chart: boolean;
    oikodespotes?: OikodespotesResult;
    antiscia?: AntisciaConnection[];
    fixed_stars?: StarConjunction[];
    bonification?: BonificationCondition[];
  };
}

export interface DignityScore {
  planet: string;
  rulership: number;
  exaltation: number;
  triplicity: number;
  term: number;
  face: number;
  detriment: number;
  fall: number;
  total: number;
  peregrine: boolean;
  term_ruler: string;
  face_ruler: string;
}

export interface PlanetConditionPacket {
  planet: PlanetId;
  sign: string;
  house: number;
  house_topics: string[];
  daimonic_tag?: DaimonicHouseTag;
  sect_status: "in_sect" | "out_of_sect" | "neutral";
  angularity: "angular" | "succedent" | "cadent";
  essential_dignity: string[];
  dignity_total: number;
  peregrine: boolean;
  retrograde: boolean;
  triplicity_rulers: string[];
  term_ruler: string;
  face_ruler: string;
  strength_score: number;
  difficulty_score: number;
}

export interface SignalScore {
  planet: PlanetId;
  name: PlanetName;
  score: number;
  confidence: Confidence;
  repetition_count: number;
  timescales: Timescale[];
  sources: ActivationSource[];
  activated_houses: number[];
  activated_lots: LotName[];
  why: string[];
  condition?: PlanetConditionPacket;
}

export interface TimescaleSlice {
  applicable: boolean;
  description: string;
  activations: Activation[];
}

export interface Activation {
  source: ActivationSource;
  planet: PlanetId;
  house?: number;
  lot?: LotName;
  weight: number;
  timescale: Timescale;
  description: string;
}

export interface PlanetaryAlignmentProfile {
  planet: PlanetId;
  name: PlanetName;
  daimonic_function: string[];
  qualities: string[];
  healthy_expression: string[];
  distorted_expression: string[];
  strengthen_when: string[];
  balance_when: string[];
  music_features: string[];
  colours: string[];
  scents_or_symbolic_herbs: string[];
  activities: string[];
  prayers_or_hymn_types: string[];
}

export interface ValensPairRule {
  id: string;
  planets: [PlanetId, PlanetId];
  themes: string[];
  opportunities: string[];
  pressures: string[];
  confidence: Confidence;
}

export interface ValensTripleRule {
  id: string;
  planets: [PlanetId, PlanetId, PlanetId];
  composed_of: string[];
  themes: string[];
  opportunities: string[];
  pressures: string[];
}

export interface RitualReference {
  id: string;
  source: "Ficino" | "Picatrix" | "Agrippa" | "PGM" | "Orphic Hymn";
  planet: PlanetId;
  purpose: string;
  historical_summary: string;
  safety_class: "safe_symbolic" | "historical_reference" | "restricted";
  safe_adaptation: string[];
}

export interface PlanetCombination {
  planets: PlanetId[];
  combination_type: "pair" | "triple";
  themes: string[];
  opportunities: string[];
  pressures: string[];
  confidence: Confidence;
  source_rule_ids: string[];
}

export interface OikodespotesResult {
  planet: PlanetId;
  name: PlanetName;
  score: number;
  points_considered: string[];
  interpretation: string;
  soul_choice?: string;
}

export interface AntisciaConnection {
  planet_a: PlanetId;
  planet_b: PlanetId;
  antiscion_degree_a: number;
  antiscion_degree_b: number;
  orb: number;
}

export interface StarConjunction {
  body: string;
  star: string;
  orb: number;
  magnitude: number;
}

export interface AspectPattern {
  type: "grand_trine" | "t_square" | "grand_cross" | "yod";
  planets: PlanetId[];
  description: string;
  beneficial: boolean;
}

export interface BonificationCondition {
  type: "overcoming" | "enclosure" | "striking" | "counteraction" | "adherence" | "reception";
  planet_a: PlanetId;
  planet_b: PlanetId;
  description: string;
  beneficial: boolean;
}

export interface DailySphereReading {
  date: string;
  native_id: string;
  atmosphere: {
    daily: TimescaleSlice;
    weekly: TimescaleSlice;
    monthly: TimescaleSlice;
    yearly: TimescaleSlice;
  };
  natal_activation: {
    activated_planets: PlanetId[];
    activated_houses: number[];
    activated_lots: LotName[];
    activated_topics: string[];
    confidence: Confidence;
  };
  daimonic_houses: {
    good_fortune: { house: number; planets: PlanetId[] };
    bad_fortune: { house: number; planets: PlanetId[] };
    good_daimon: { house: number; planets: PlanetId[] };
    bad_daimon: { house: number; planets: PlanetId[] };
  };
  daimonic_interpretation: {
    mode: DaimonicMode;
    life_activity: string[];
    opportunity: string[];
    pressure: string[];
    distortion: string[];
  };
  alignment: {
    planet: PlanetId;
    mode: "strengthen" | "balance" | "cool" | "discipline" | "stabilize";
    ficinian_advice: string[];
    music: string[];
    colour: string[];
    scent_or_symbolic_herb: string[];
    activity: string[];
  }[];
  ritual_references: RitualReference[];
  planet_conditions: PlanetConditionPacket[];
  fortune_layer: {
    active: boolean;
    lot_house: number;
    lot_house_topics: string[];
    confidence: Confidence;
  };
  spirit_layer: {
    active: boolean;
    lot_house: number;
    lot_house_topics: string[];
    confidence: Confidence;
  };
  oikodespotes?: OikodespotesResult;
  antiscia: AntisciaConnection[];
  fixed_stars: StarConjunction[];
  bonification: BonificationCondition[];
  aspect_patterns: AspectPattern[];
  graph_trace: {
    why_this_planet: string[];
    why_this_advice: string[];
    source_edges: string[];
  };
}
