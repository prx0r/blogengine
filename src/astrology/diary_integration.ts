/**
 * Diary Integration — daily snapshot + personal journal.
 * 
 * Store: ActivationPacket + user notes for every day.
 * Query: "What happened when Mercury was active?" 
 * Learn: "When Saturn is lord of the year, I tend to feel X."
 * 
 * This is the personal growth loop that makes the engine useful
 * to one person over time, without needing external validation.
 */

export interface DailyDiaryEntry {
  date: string;
  nativeId: string;
  
  // Engine output
  packet: {
    dominant_mode: "fortune" | "spirit" | "mixed";
    primary_planet: string;
    primary_confidence: string;
    activated_houses: number[];
    activated_lots: string[];
    oikodespotes_planet?: string;
    oikodespotes_active: boolean;  // is the daimon planet activated?
    profection_house: number;
    profection_lord: string;
    firdaria_lord?: string;
    sky_aspects: string[];  // e.g. ["sun square saturn"]
  };
  
  // User input
  notes: string;
  mood: number;  // 1-5
  energy: number;  // 1-5
  events: string[];  // what happened today
  
  // Optional: user tags
  tags: string[];
}

export interface DiaryQuery {
  /** Find entries where a planet was the primary signal */
  planetActive(planet: string): Promise<DailyDiaryEntry[]>;
  /** Find entries where daimon was active */
  daimonActive(): Promise<DailyDiaryEntry[]>;
  /** Find entries matching mood/energy patterns */
  moodPattern(moodThreshold: number): Promise<DailyDiaryEntry[]>;
  /** Group entries by profection house — which house years were most productive? */
  byProfectionHouse(): Promise<Record<number, DailyDiaryEntry[]>>;
  /** Group entries by daimonic mode */
  byMode(): Promise<Record<string, DailyDiaryEntry[]>>;
}
