import type { PlanetId, RitualReference } from "./types";

const RAW_REFERENCES: Array<{
  id: string; source: RitualReference["source"]; planet: PlanetId;
  purpose: string; historical_summary: string; safety_class: RitualReference["safety_class"];
  safe_adaptation: string[];
}> = [
  {
    id: "ficino_sun_001", source: "Ficino", planet: "sun",
    purpose: "vitality, leadership, spiritual radiance",
    historical_summary: "Ficino recommends solar alignment through gold, frankincense, dawn practice, and Orphic singing at sunrise to strengthen the spiritus and vital force.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["dawn meditation facing east", "wear gold or yellow", "recite an Orphic Hymn to the Sun", "sun salutation practice"],
  },
  {
    id: "ficino_moon_001", source: "Ficino", planet: "moon",
    purpose: "receptivity, emotional balance, intuitive attunement",
    historical_summary: "Ficino prescribes silver, pearl, cool scents, and night-time contemplative practice for lunar attunement, especially during the waxing moon.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["evening quiet contemplation", "silver or pearl token", "lunar journaling", "water meditation"],
  },
  {
    id: "ficino_mercury_001", source: "Ficino", planet: "mercury",
    purpose: "speech, writing, study, eloquence",
    historical_summary: "Ficino links Mercury to study, writing, and the cultivation of eloquence. He recommends clear, moderate music and focused intellectual work in the morning hours.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["timed focused writing", "study without distraction", "clear speech practice", "moderate tempo music while working"],
  },
  {
    id: "ficino_venus_001", source: "Ficino", planet: "venus",
    purpose: "love, harmony, beauty, pleasure",
    historical_summary: "Ficino associates Venus with harmonious music, rose scents, green surroundings, and the cultivation of gracious love and aesthetic refinement.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["surround with green and rose", "listen to consonant harmony", "art or beauty practice", "cultivate gracious speech"],
  },
  {
    id: "ficino_mars_001", source: "Ficino", planet: "mars",
    purpose: "disciplined action, courage, protective force",
    historical_summary: "Ficino warns against raw Mars and recommends cooling, disciplining martial energy through measured rhythm, physical practice, and redirection into craft.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["vigorous but disciplined exercise", "martial art with meditative focus", "channel energy into precise craft", "avoid raw aggression"],
  },
  {
    id: "ficino_jupiter_001", source: "Ficino", planet: "jupiter",
    purpose: "expansion, wisdom, generosity, prosperity",
    historical_summary: "Ficino counsels Jupiterian expansion through philosophy, generous acts, blue and purple surroundings, and dignified music.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["study of philosophy or ethics", "generosity practice", "blue or purple visual focus", "teaching or mentoring"],
  },
  {
    id: "ficino_saturn_001", source: "Ficino", planet: "saturn",
    purpose: "discipline, structure, endurance, karmic work",
    historical_summary: "Ficino treats Saturn with caution, recommending warming, solar counterbalances, myrrh, slow deliberate practice, and avoidance of melancholy isolation.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["patient craft work", "meditation on impermanence", "warming practice to counter melancholy", "structuring a long-term project"],
  },
  {
    id: "orphic_sun_001", source: "Orphic Hymn", planet: "sun",
    purpose: "invocation of solar radiance and vital power",
    historical_summary: "Orphic Hymn 8 to the Sun invokes the 'everlasting eye' that governs the cosmos, calling for light, life, and purification.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite the hymn at dawn", "offer a candle as symbolic invocation", "meditate on solar light"],
  },
  {
    id: "orphic_moon_001", source: "Orphic Hymn", planet: "moon",
    purpose: "invocation of lunar grace and nocturnal wisdom",
    historical_summary: "Orphic Hymn 9 to the Moon invokes the 'horned goddess' who brings light in darkness and governs the tides of nature.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite the hymn at night", "water offering", "moon-gazing meditation"],
  },
  {
    id: "orphic_mercury_001", source: "Orphic Hymn", planet: "mercury",
    purpose: "invocation for eloquence, guidance, and craft",
    historical_summary: "Orphic Hymn 28 to Hermes invokes the 'messenger of Zeus' who guides souls, sharpens wit, and blesses speech.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite before writing or study", "offer incense (frankincense)", "speak a clear intention aloud"],
  },
  {
    id: "orphic_venus_001", source: "Orphic Hymn", planet: "venus",
    purpose: "invocation for love, beauty, and harmony",
    historical_summary: "Orphic Hymn 55 to Aphrodite invokes the 'golden goddess' who brings grace, desire, and harmonious union.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite for relationship harmony", "rose offering", "beauty contemplation"],
  },
  {
    id: "orphic_mars_001", source: "Orphic Hymn", planet: "mars",
    purpose: "invocation for courage, strength, and righteous force",
    historical_summary: "Orphic Hymn 65 to Ares invokes the 'strong-hearted' god who brings disciplined might and protects the just.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite for courage before challenge", "vigorous movement", "symbolic red candle"],
  },
  {
    id: "orphic_jupiter_001", source: "Orphic Hymn", planet: "jupiter",
    purpose: "invocation for wisdom, justice, and prosperity",
    historical_summary: "Orphic Hymn 15 to Zeus invokes the 'king of heaven' who governs law, justice, and the order of the cosmos.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite for wisdom before decision", "contemplate justice", "generosity practice"],
  },
  {
    id: "orphic_saturn_001", source: "Orphic Hymn", planet: "saturn",
    purpose: "invocation for time, discipline, and karmic understanding",
    historical_summary: "Orphic Hymn 13 to Kronos invokes the 'titan of time' who governs the cycles of maturity, harvest, and completion.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["recite for patience and endurance", "contemplate time cycles", "patient craft practice"],
  },
  {
    id: "picatrix_mercury_001", source: "Picatrix", planet: "mercury",
    purpose: "knowledge, writing, interpretation, eloquence",
    historical_summary: "Picatrix describes Mercurial operations for knowledge, speech, and subtle skill, performed when Mercury is well-placed and the Moon in appropriate signs.",
    safety_class: "historical_reference",
    safe_adaptation: ["write a clear intention", "recite a Mercury hymn", "perform a timed study block", "use symbolic colour/scent only"],
  },
  {
    id: "picatrix_mars_001", source: "Picatrix", planet: "mars",
    purpose: "courage, protection, overcoming obstacles",
    historical_summary: "Picatrix records Martial operations using iron, red stones, and specific suffumigations when Mars is in its dignities.",
    safety_class: "historical_reference",
    safe_adaptation: ["symbolic red thread or stone", "physical practice for discipline", "meditation on righteous boundary"],
  },
  {
    id: "picatrix_venus_001", source: "Picatrix", planet: "venus",
    purpose: "love, beauty, harmonious relationships",
    historical_summary: "Picatrix details Venusian operations using rose, copper, green silk, and specific prayers for love and beauty.",
    safety_class: "historical_reference",
    safe_adaptation: ["green or rose visual focus", "beauty creation practice", "rose water as symbolic offering"],
  },
  {
    id: "picatrix_jupiter_001", source: "Picatrix", planet: "jupiter",
    purpose: "wisdom, prosperity, magnanimity",
    historical_summary: "Picatrix associates Jupiter with sapphire, cedar, royal purple, and operations for gaining wisdom and favour.",
    safety_class: "historical_reference",
    safe_adaptation: ["study with blue visual focus", "generosity practice", "meditation on abundance"],
  },
  {
    id: "picatrix_saturn_001", source: "Picatrix", planet: "saturn",
    purpose: "structure, binding, long-term stability",
    historical_summary: "Picatrix treats Saturnian operations with great caution, noting their power for binding, long-term works, and confrontation with limitations.",
    safety_class: "restricted",
    safe_adaptation: ["patient craft practice only", "structuring a long-term project", "avoid any binding or coercive practices"],
  },
  {
    id: "picatrix_sun_001", source: "Picatrix", planet: "sun",
    purpose: "vitality, authority, spiritual radiance",
    historical_summary: "Picatrix links the Sun to gold, laurel, heliotrope, and operations for gaining honour, favour, and vital power.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["gold or amber visual focus", "dawn practice", "sunlight meditation"],
  },
  {
    id: "picatrix_moon_001", source: "Picatrix", planet: "moon",
    purpose: "receptivity, travel, emotional attunement",
    historical_summary: "Picatrix prescribes lunar operations using silver, white stones, and night-time hours for matters of travel, dreams, and emotional clarity.",
    safety_class: "safe_symbolic",
    safe_adaptation: ["night-time journal", "silver or white visual focus", "dream recording practice"],
  },
  {
    id: "pgm_mercury_001", source: "PGM", planet: "mercury",
    purpose: "oracular insight, divine communication",
    historical_summary: "The Greek Magical Papyri contain spells invoking Hermes for oracular dreams, communication with spirits, and skill in speech.",
    safety_class: "historical_reference",
    safe_adaptation: ["prayer to Hermes for clarity", "incubation for dream insight", "study of symbolic systems"],
  },
  {
    id: "pgm_moon_001", source: "PGM", planet: "moon",
    purpose: "dream divination, emotional healing, goddess work",
    historical_summary: "PGM lunar spells invoke Hecate and Selene for dream oracles, emotional release, and protection during night travel.",
    safety_class: "historical_reference",
    safe_adaptation: ["moon phase tracking", "dream journal", "night meditation for insight"],
  },
  {
    id: "agrippa_sun_001", source: "Agrippa", planet: "sun",
    purpose: "vital force, spiritual authority, celestial alignment",
    historical_summary: "Agrippa's Three Books of Occult Philosophy correlates the Sun with the sephirah Tiphereth, the lion, gold, and the archangel Michael.",
    safety_class: "historical_reference",
    safe_adaptation: ["study of solar correspondences", "meditation on Tiphereth", "golden visualisation practice"],
  },
  {
    id: "agrippa_venus_001", source: "Agrippa", planet: "venus",
    purpose: "love, beauty, natural harmony",
    historical_summary: "Agrippa correlates Venus with Netzach, the rose, copper, green, and celestial harmonies of love.",
    safety_class: "historical_reference",
    safe_adaptation: ["study of Venusian correspondences", "art or beauty practice", "harmonious music listening"],
  },
  {
    id: "agrippa_mars_001", source: "Agrippa", planet: "mars",
    purpose: "courage, disciplined force, righteous defence",
    historical_summary: "Agrippa correlates Mars with Geburah, iron, red, the basilisk, and the archangel Kamael.",
    safety_class: "historical_reference",
    safe_adaptation: ["study of Martial correspondences", "disciplined physical practice", "red visual focus for courage"],
  },
  {
    id: "agrippa_jupiter_001", source: "Agrippa", planet: "jupiter",
    purpose: "abundance, wisdom, law, magnanimity",
    historical_summary: "Agrippa correlates Jupiter with Chesed, tin, blue, the eagle, and the archangel Zadkiel.",
    safety_class: "historical_reference",
    safe_adaptation: ["study of Jupiterian correspondences", "generosity practice", "blue visual focus for wisdom"],
  },
  {
    id: "agrippa_saturn_001", source: "Agrippa", planet: "saturn",
    purpose: "discipline, structure, wisdom of limits",
    historical_summary: "Agrippa correlates Saturn with Binah, lead, black, the owl, and the archangel Cassiel.",
    safety_class: "historical_reference",
    safe_adaptation: ["study of Saturnian correspondences", "patient craft practice", "contemplation of structure and limit"],
  },
];

const REFERENCES_BY_PLANET = new Map<PlanetId, RitualReference[]>();

for (const raw of RAW_REFERENCES) {
  const ref: RitualReference = { ...raw };
  if (!REFERENCES_BY_PLANET.has(raw.planet)) {
    REFERENCES_BY_PLANET.set(raw.planet, []);
  }
  REFERENCES_BY_PLANET.get(raw.planet)!.push(ref);
}

export function getRitualReferences(planet: PlanetId): RitualReference[] {
  return REFERENCES_BY_PLANET.get(planet) || [];
}

export function getRitualReferencesForPlanets(planets: PlanetId[]): RitualReference[] {
  const seen = new Set<string>();
  const results: RitualReference[] = [];
  for (const p of planets) {
    for (const ref of getRitualReferences(p)) {
      if (!seen.has(ref.id)) {
        seen.add(ref.id);
        results.push(ref);
      }
    }
  }
  return results;
}

export function getAllRitualReferences(): RitualReference[] {
  return RAW_REFERENCES.map(r => ({ ...r }));
}
