export interface SceneEntry {
  title: string;
  incident: string;
  expression?: string;
  bodyFeel?: string;
  result?: string;
  purifiedQuality?: string;
  hiddenNeed?: string;
  purifiedCounterpart?: string;
  actionAvoided?: string;
  replacedFire?: string;
  cost?: string;
  fireCorrection?: string;
}

export interface Archetype {
  name: string;
  description: string;
  symbol?: string;
}

export interface ArchetypeProfile {
  relateTo?: string;
  fear?: string;
  distortion?: string;
  cultivate?: string;
}

export interface Vow {
  text: string;
}

export interface CompoundElement {
  name: string;
  positive: string;
  negative: string;
  note?: string;
}

export interface TabContent {
  overview: string;
  keyQuestions?: string[];
  entries?: SceneEntry[];
  archetypes?: Archetype[];
  archetypeProfiles?: ArchetypeProfile[];
  vows?: Vow[];
  compoundElements?: CompoundElement[];
}

export interface ElementTab {
  id: string;
  label: string;
  content: TabContent;
}

export interface ElementData {
  id: string;
  name: string;
  symbol: string;
  symbolSvg: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  tagline: string;
  description: string;
  tabs: ElementTab[];
}

export type ElementId = 'fire' | 'water' | 'air' | 'earth' | 'spirit';
