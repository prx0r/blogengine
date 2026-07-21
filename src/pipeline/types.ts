/**
 * Pipeline types — separate from engine types to keep isolation.
 * The pipeline imports from the engine but the engine never imports from pipeline.
 */
export interface PipelineSubject {
  id: string;                // Wikidata Q ID
  label: string;             // Display name
  birthDate: string;         // ISO 8601
  birthLat?: number;         // From geocoding
  birthLon?: number;         // From geocoding
  birthPlaceName?: string;
  deathDate?: string;        // ISO 8601
  occupations: string[];     // Occupation labels
  domain: string;            // "athlete" | "artist" | "writer" | "musician" | "scientist" | "leader" | "philosopher" | "control"
}

export interface TrainingRecord {
  subjectId: string;
  domain: string;
  chartJson?: string;        // Cached NormalizedChart
  oikodespotes?: string;
  oikodespotesScore?: number;
  oikodespotesPoints?: string[];
  activationRecords?: ActivationRecord[];
}

export interface ActivationRecord {
  targetDate: string;
  dateType: "death" | "control" | "natal";
  saturnConfidence: string;
  saturnScore: number;
  marsConfidence: string;
  marsScore: number;
  house8Active: boolean;
  annualProfectionLord: string;
  zrSpiritLord?: string;
  zrFortuneLord?: string;
  firdariaLord?: string;
  packetJson?: string;
}

export interface ExperimentResult {
  name: string;
  description: string;
  nullHypothesis: string;
  significanceThreshold: number;
  correctionsApplied: string;
  results: Array<{
    test: string;
    n: number;
    observed: number;
    expected: number;
    observedRate: number;
    expectedRate: number;
    pValue: number;
    significant: boolean;
    effectSize: number;
  }>;
  conclusions: string[];
  confoundersChecked: string[];
}
