import type { PlanetId, PlanetaryAlignmentProfile } from "./types";

export const PLANET_PROFILES: Record<PlanetId, PlanetaryAlignmentProfile> = {
  sun: {
    planet: "sun",
    name: "Sun",
    daimonic_function: ["leadership", "vitality", "self-expression", "authority", "creative will"],
    qualities: ["vital", "radiant", "authoritative", "creative", "generous"],
    healthy_expression: ["conscious leadership", "authentic self-expression", "generosity", "creative work", "confident action"],
    distorted_expression: ["arrogance", "over-dominance", "vanity", "grandiosity", "burnout"],
    strengthen_when: ["will is depleted", "purpose is unclear", "confidence is low"],
    balance_when: ["ego is dominant", "recognition is sought excessively", "pride blocks connection"],
    music_features: ["bright major tonality", "brass instruments", "steady triumphant rhythm", "golden resonant frequencies"],
    colours: ["gold", "orange", "amber", "saffron"],
    scents_or_symbolic_herbs: ["frankincense", "cinnamon", "bay laurel", "saffron"],
    activities: ["conscious creation", "morning practice", "leadership roles", "expressive arts", "sun salutation"],
    prayers_or_hymn_types: ["Orphic Hymn to the Sun", "solar invocations", "dawn gratitude practice"],
  },
  moon: {
    planet: "moon",
    name: "Moon",
    daimonic_function: ["receptivity", "nurture", "embodiment", "intuition", "rhythm"],
    qualities: ["receptive", "nurturing", "fluid", "intuitive", "cyclical"],
    healthy_expression: ["emotional attunement", "nurturing self and others", "intuitive knowing", "adaptability"],
    distorted_expression: ["moodiness", "over-sensitivity", "emotional flooding", "passivity", "clinging"],
    strengthen_when: ["emotional security is needed", "intuition is blocked", "nurturing is required"],
    balance_when: ["emotions overwhelm reason", "boundaries are absent", "mood rules decision"],
    music_features: ["lyrical flowing melody", "soft strings", "gentle percussion", "water-like resonance"],
    colours: ["silver", "pearl", "pale blue", "white"],
    scents_or_symbolic_herbs: ["jasmine", "lotus", "white rose", "sandalwood"],
    activities: ["dream journaling", "night ritual", "emotional check-in", "water practice", "lunar tracking"],
    prayers_or_hymn_types: ["Orphic Hymn to the Moon", "lunar invocations", "night prayer"],
  },
  mercury: {
    planet: "mercury",
    name: "Mercury",
    daimonic_function: ["articulation", "translation", "symbolic interpretation", "technical craft", "exchange"],
    qualities: ["quick", "subtle", "airy", "discriminating", "changeable"],
    healthy_expression: ["writing", "speech", "classification", "debugging", "teaching", "symbolic analysis"],
    distorted_expression: ["scattering", "overthinking", "trickery", "nervous speech", "fragmented attention"],
    strengthen_when: ["speech is blocked", "study is needed", "translation or system-building is required"],
    balance_when: ["mind is scattered", "speech becomes sharp", "analysis becomes sterile"],
    music_features: ["clear melodic line", "moderate tempo", "light intricate patterns", "not chaotic"],
    colours: ["yellow", "grey", "variegated", "pale blue"],
    scents_or_symbolic_herbs: ["lavender", "fennel", "mint", "dill"],
    activities: ["timed writing", "classification", "language study", "clean speech practice", "debugging"],
    prayers_or_hymn_types: ["Orphic Hymn to Hermes", "Mercury invocation", "prayer for clarity and right speech"],
  },
  venus: {
    planet: "venus",
    name: "Venus",
    daimonic_function: ["harmony", "attraction", "aesthetic judgment", "relationship", "value discernment"],
    qualities: ["warm", "harmonious", "gracious", "sensuous", "refined"],
    healthy_expression: ["artistic creation", "relationship cultivation", "beauty appreciation", "social grace", "value alignment"],
    distorted_expression: ["over-indulgence", "vanity", "codependence", "laziness", "superficiality"],
    strengthen_when: ["beauty is absent from life", "relationships need care", "self-worth needs cultivation"],
    balance_when: ["pleasure becomes excess", "harmony is false", "desire dominates"],
    music_features: ["consonant harmony", "string instruments", "warm slow rhythms", "sweet melodies"],
    colours: ["green", "rose", "pink", "soft turquoise"],
    scents_or_symbolic_herbs: ["rose", "sandalwood", "ylang-ylang", "jasmine"],
    activities: ["art practice", "beauty cultivation", "relationship ritual", "pleasure with presence", "self-care"],
    prayers_or_hymn_types: ["Orphic Hymn to Aphrodite", "Venus invocation", "prayer for harmonious love"],
  },
  mars: {
    planet: "mars",
    name: "Mars",
    daimonic_function: ["initiative", "drive", "courage", "discrimination", "protective force"],
    qualities: ["energetic", "assertive", "courageous", "direct", "passionate"],
    healthy_expression: ["disciplined action", "protective work", "decisive cut", "physical practice", "righteous assertion"],
    distorted_expression: ["aggression", "impatience", "destructive anger", "recklessness", "violence"],
    strengthen_when: ["initiative is needed", "courage is lacking", "decisive action is required"],
    balance_when: ["anger is raw", "action is rushed", "conflict is habitual"],
    music_features: ["strong percussion", "sharp brass", "driving rhythm", "intense dynamics"],
    colours: ["red", "crimson", "rust", "iron grey"],
    scents_or_symbolic_herbs: ["ginger", "basil", "cayenne", "pine"],
    activities: ["physical practice", "disciplined effort", "boundary setting", "strategic action", "martial art"],
    prayers_or_hymn_types: ["Orphic Hymn to Ares", "Mars invocation", "prayer for courageous discipline"],
  },
  jupiter: {
    planet: "jupiter",
    name: "Jupiter",
    daimonic_function: ["expansion", "meaning", "beneficence", "wisdom", "law"],
    qualities: ["expansive", "generous", "optimistic", "wise", "abundant"],
    healthy_expression: ["teaching", "mentoring", "generosity", "growth practice", "meaning-making"],
    distorted_expression: ["overindulgence", "grandiosity", "waste", "dogmatism", "false optimism"],
    strengthen_when: ["perspective is needed", "growth is blocked", "meaning is absent"],
    balance_when: ["excess is unchecked", "optimism is unrealistic", "resources are overextended"],
    music_features: ["full resonant tonality", "lower brass and winds", "triumphant cadences", "spacious arrangements"],
    colours: ["blue", "royal purple", "deep indigo", "sapphire"],
    scents_or_symbolic_herbs: ["saffron", "cedar", "clove", "nutmeg"],
    activities: ["study of philosophy", "generosity practice", "teaching", "travel", "mentorship"],
    prayers_or_hymn_types: ["Orphic Hymn to Zeus", "Jupiter invocation", "prayer for wise expansion"],
  },
  saturn: {
    planet: "saturn",
    name: "Saturn",
    daimonic_function: ["structure", "discipline", "boundary", "endurance", "karmic reckoning"],
    qualities: ["disciplined", "patient", "severe", "enduring", "structured"],
    healthy_expression: ["patient building", "boundary maintenance", "disciplined practice", "long-term craft", "wise restraint"],
    distorted_expression: ["rigidity", "melancholy", "isolation", "depression", "fear of change"],
    strengthen_when: ["structure is needed", "discipline is required", "long-term work demands patience"],
    balance_when: ["melancholy sets in", "rigidity blocks life", "isolation becomes chronic"],
    music_features: ["slow deep tones", "low strings", "measured pace", "minor tonality", "contemplative silence"],
    colours: ["black", "dark grey", "deep brown", "charcoal"],
    scents_or_symbolic_herbs: ["myrrh", "cypress", "patchouli", "vetiver"],
    activities: ["patient craft", "endurance practice", "boundary strengthening", "meditation", "long-term planning"],
    prayers_or_hymn_types: ["Orphic Hymn to Kronos", "Saturn invocation", "prayer for wise structure"],
  },
};

export function getPlanetProfile(id: PlanetId): PlanetaryAlignmentProfile {
  return PLANET_PROFILES[id];
}

export function chooseAlignmentMode(signal: {
  planet: PlanetId;
  pressures: string[];
  condition?: string;
}): "strengthen" | "balance" | "cool" | "discipline" | "stabilize" {
  const p = signal.pressures.join(" ").toLowerCase();
  if (p.includes("agitation") || p.includes("anger") || p.includes("rash")) return "cool";
  if (p.includes("scatter") || p.includes("fragmented") || p.includes("overthink")) return "stabilize";
  if (p.includes("melancholy") || p.includes("depression") || p.includes("rigid")) return "strengthen";
  if (p.includes("excess") || p.includes("overindulge") || p.includes("grandiose")) return "balance";
  if (p.includes("weak") || p.includes("blocked") || p.includes("depleted")) return "strengthen";
  return "discipline";
}
