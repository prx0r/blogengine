/**
 * SourceRuleEngine — structured rules from ancient sources.
 *
 * Every technical claim the LLM makes must trace to a specific rule ID.
 * This prevents hallucination: if the LLM says "Valens says...", the
 * rule ID must exist in the packet for the rendered output to be valid.
 */
import type { PlanetId, Confidence } from "./types";

export interface AncientSourceRule {
  id: string;
  source_author: "Valens" | "Dorotheus" | "Paulus" | "Rhetorius" | "al-Khayyāt" | "Māshā'allāh";
  work: string;
  technique: string;
  planets?: PlanetId[];
  house?: number;
  sign?: number;
  condition?: string;
  themes: string[];
  delineation?: string;
  citation?: string;
  confidence: "low" | "medium" | "high";
}

// ── Valens Book I.21: 21 planetary pair rules ──

const VALENS_PAIRS: Array<{
  planets: [PlanetId, PlanetId];
  themes: string[];
  delineation: string;
}> = [
  { planets: ["saturn", "jupiter"], themes: ["authority", "structure", "growth", "responsible prosperity"], delineation: "Saturn-Jupiter: authority meets expansion. Responsible prosperity through structured growth." },
  { planets: ["saturn", "mars"], themes: ["disciplined force", "strategic pressure", "endurance"], delineation: "Saturn-Mars: disciplined force under pressure. Strategic endurance through conflict." },
  { planets: ["saturn", "venus"], themes: ["committed love", "artistic discipline", "responsible pleasure"], delineation: "Saturn-Venus: committed love and artistic discipline. Pleasure within structure." },
  { planets: ["saturn", "mercury"], themes: ["disciplined thought", "structured communication", "patient study"], delineation: "Saturn-Mercury: disciplined thought and patient study. Structured communication." },
  { planets: ["saturn", "moon"], themes: ["emotional structure", "mature nurture", "karmic family"], delineation: "Saturn-Moon: emotional structure and karmic family patterns. Mature nurture." },
  { planets: ["saturn", "sun"], themes: ["disciplined will", "responsible authority", "mature self"], delineation: "Saturn-Sun: disciplined will and responsible authority. Mature self-expression." },
  { planets: ["jupiter", "mars"], themes: ["expansive action", "righteous force", "courageous growth"], delineation: "Jupiter-Mars: expansive action and righteous force. Growth through courage." },
  { planets: ["jupiter", "venus"], themes: ["generous love", "abundant beauty", "fortunate harmony"], delineation: "Jupiter-Venus: generous love and abundant beauty. Fortunate harmony." },
  { planets: ["jupiter", "mercury"], themes: ["wise speech", "expansive thought", "teaching"], delineation: "Jupiter-Mercury: wise speech and expansive thought. Teaching and philosophy." },
  { planets: ["jupiter", "moon"], themes: ["nurturing abundance", "emotional growth", "fortunate home"], delineation: "Jupiter-Moon: nurturing abundance and emotional growth. Fortunate home." },
  { planets: ["jupiter", "sun"], themes: ["magnanimous will", "generous authority", "blessed creativity"], delineation: "Jupiter-Sun: magnanimous will and generous authority. Blessed creativity." },
  { planets: ["mars", "venus"], themes: ["passionate love", "creative assertion", "desire in action"], delineation: "Mars-Venus: passionate love and creative assertion. Desire in action." },
  { planets: ["mars", "mercury"], themes: ["sharp speech", "argumentative precision", "technical craft"], delineation: "Mars-Mercury: sharp speech and argumentative precision. Technical craft under pressure." },
  { planets: ["mars", "moon"], themes: ["emotional assertion", "protective nurture", "passionate feeling"], delineation: "Mars-Moon: emotional assertion and protective nurture. Passionate feeling." },
  { planets: ["mars", "sun"], themes: ["focused will", "assertive identity", "courageous expression"], delineation: "Mars-Sun: focused will and assertive identity. Courageous self-expression." },
  { planets: ["venus", "mercury"], themes: ["graceful speech", "artistic communication", "social grace"], delineation: "Venus-Mercury: graceful speech and artistic communication. Social intelligence." },
  { planets: ["venus", "moon"], themes: ["loving nurture", "emotional beauty", "gracious feeling"], delineation: "Venus-Moon: loving nurture and emotional beauty. Gracious feeling." },
  { planets: ["venus", "sun"], themes: ["gracious will", "loving expression", "creative harmony"], delineation: "Venus-Sun: gracious will and loving self-expression. Creative harmony." },
  { planets: ["mercury", "moon"], themes: ["feeling thought", "intelligent nurture", "emotional communication"], delineation: "Mercury-Moon: feeling thought and intelligent nurture. Emotional communication." },
  { planets: ["mercury", "sun"], themes: ["conscious thought", "articulate will", "clear expression"], delineation: "Mercury-Sun: conscious thought and articulate will. Clear expression." },
  { planets: ["moon", "sun"], themes: ["integrated self", "feeling and will united", "whole expression"], delineation: "Moon-Sun: integrated self. Feeling and will united in whole expression." },
];

// ── Al-Khayyāt Ch.47: Planets in houses (84 rules) ──

const AL_KHAYYAT_HOUSE_RULES: Array<{
  planet: PlanetId;
  house: number;
  delineation: string;
}> = [
  { planet: "saturn", house: 1, delineation: "Difficulty in all works, death from a catastrophe of the land or on account of debt." },
  { planet: "jupiter", house: 1, delineation: "Honor, reverence, prudence, and a good end." },
  { planet: "mars", house: 1, delineation: "Anger, war, contentions." },
  { planet: "sun", house: 1, delineation: "Dominion, exaltation, power, greatness of works and possessions." },
  { planet: "venus", house: 1, delineation: "Joy, pleasure, love toward women, beauty of the body." },
  { planet: "mercury", house: 1, delineation: "Wisdom, knowledge of writing and numbers." },
  { planet: "moon", house: 1, delineation: "Dominions, foreign travels, fickleness, good will toward the mother." },
  { planet: "saturn", house: 2, delineation: "Wearing out of estate and livelihood, impediment to wealth." },
  { planet: "jupiter", house: 2, delineation: "An abundance of riches and a good intellect." },
  { planet: "mars", house: 2, delineation: "Want, calamity, disturbance from slaves, wounds." },
  { planet: "sun", house: 2, delineation: "Riches through all of life, a splendid status, cheerful eyes." },
  { planet: "venus", house: 2, delineation: "Resources and influence from women." },
  { planet: "mercury", house: 2, delineation: "The increase of riches and honor among kings." },
  { planet: "moon", house: 2, delineation: "Loss and harm to the native's estate, repeated changes of status." },
  { planet: "saturn", house: 3, delineation: "Hatreds between brothers and sisters." },
  { planet: "jupiter", house: 3, delineation: "Luckiness of the brothers and sisters, joy." },
  { planet: "mars", house: 3, delineation: "Hatreds and contentions of brothers and sisters." },
  { planet: "sun", house: 3, delineation: "An office from the king, foreign journeys." },
  { planet: "venus", house: 3, delineation: "Fickleness and misfortunes from bad works, but many friends." },
  { planet: "mercury", house: 3, delineation: "Inclinations toward learning all things, strength of friends." },
  { planet: "moon", house: 3, delineation: "Offices and joys from the rich, from kings, journeys." },
  { planet: "saturn", house: 4, delineation: "Squandering of the inheritance, ruin of the parents." },
  { planet: "jupiter", house: 4, delineation: "Usefulness from the earth, inheritances, treasures, security from terrors." },
  { planet: "mars", house: 4, delineation: "Shedding of blood, murders, a sad exit from life." },
  { planet: "sun", house: 4, delineation: "Treasures, revelation of secret and recondite things, praise." },
  { planet: "venus", house: 4, delineation: "A praiseworthy child, sorrow because of the mother." },
  { planet: "mercury", house: 4, delineation: "A good memory, precision in crafts." },
  { planet: "moon", house: 4, delineation: "Sorrow, but with a good end." },
  { planet: "saturn", house: 5, delineation: "Scattering and death of the children." },
  { planet: "jupiter", house: 5, delineation: "Many honest children, usefulness and praise from them." },
  { planet: "mars", house: 5, delineation: "Many illegitimate children, scarce joy from them." },
  { planet: "sun", house: 5, delineation: "Dignity of the children, praise and glory in commanding." },
  { planet: "venus", house: 5, delineation: "Distress from one child, then joy from the children." },
  { planet: "mercury", house: 5, delineation: "Much business from letters, fortune from one child." },
  { planet: "moon", house: 5, delineation: "Many children." },
  { planet: "saturn", house: 6, delineation: "Diseases and the disobedience of the family." },
  { planet: "jupiter", house: 6, delineation: "Scarce diseases, usefulness from flock-animals, fortune from family." },
  { planet: "mars", house: 6, delineation: "Many hot and dry diseases, a bad family." },
  { planet: "sun", house: 6, delineation: "Diseases, disturbance from slaves and ignoble people." },
  { planet: "venus", house: 6, delineation: "A covetous wife, diseases from women, plundering through slaves." },
  { planet: "mercury", house: 6, delineation: "Deception and plundering through women on account of longing." },
  { planet: "moon", house: 6, delineation: "Wealth from animals." },
  { planet: "saturn", house: 7, delineation: "Sorrow in the marriage-union, separation of the wife, a bad end." },
  { planet: "jupiter", house: 7, delineation: "Joy from wives, victory over enemies." },
  { planet: "mars", house: 7, delineation: "Distress, calamity, labor, war, loss in all matters." },
  { planet: "sun", house: 7, delineation: "Adversity from nobles, the rich, and the powerful." },
  { planet: "venus", house: 7, delineation: "Joy from women, success in things prayed for." },
  { planet: "mercury", house: 7, delineation: "Appetite and great trials because of women, contentions." },
  { planet: "moon", house: 7, delineation: "Goods from women." },
  { planet: "saturn", house: 8, delineation: "Inheritances from the death of relatives, long mourning." },
  { planet: "jupiter", house: 8, delineation: "A loss of resources, but a good and praiseworthy end." },
  { planet: "mars", house: 8, delineation: "A bad death, wounds in the hands and feet, disgrace, loss of resources." },
  { planet: "sun", house: 8, delineation: "Plundering of goods through powerful people, ruin from kings." },
  { planet: "venus", house: 8, delineation: "Adversity toward the mother, a long-lasting life, a good death." },
  { planet: "mercury", house: 8, delineation: "Enmities of neighbors, grief from the dead, growth of substance." },
  { planet: "moon", house: 8, delineation: "Deposed from honor, a fugitive, many diseases." },
  { planet: "saturn", house: 9, delineation: "Grave and terrible dreams, error in faith, diseases on long journeys." },
  { planet: "jupiter", house: 9, delineation: "Joy and fortune on long journeys, good faith, true dreams." },
  { planet: "mars", house: 9, delineation: "Love of horses, wars and wine, unfaithfulness, harmful journeys." },
  { planet: "sun", house: 9, delineation: "A good law, good faith, fear of God, useful foreign journeys." },
  { planet: "venus", house: 9, delineation: "Pleasure and fortune in foreign journeys, religion, true dreams." },
  { planet: "mercury", house: 9, delineation: "Instruction, knowledge, experience of many hidden things." },
  { planet: "moon", house: 9, delineation: "Desire for long foreign journeys, many bad thoughts." },
  { planet: "saturn", house: 10, delineation: "Large losses from kings, long captivity (nocturnal); riches and proficiency (diurnal)." },
  { planet: "jupiter", house: 10, delineation: "Riches, praise and dignity." },
  { planet: "mars", house: 10, delineation: "Sorrow and captivity by powerful people, scarcity, wars, adversities." },
  { planet: "sun", house: 10, delineation: "Great glory, authority, usefulness among kings." },
  { planet: "venus", house: 10, delineation: "Joy from kings and princes, offices and dignities, latter half of life better." },
  { planet: "mercury", house: 10, delineation: "Great knowledge of writing and reckoning, excellent crafts." },
  { planet: "moon", house: 10, delineation: "Great love for beautiful things, riches, offices, honor among kings." },
  { planet: "saturn", house: 11, delineation: "Dread and friends' pain, impediment of things hoped for." },
  { planet: "jupiter", house: 11, delineation: "Riches, praise, dignity because of friends, vanquishing of enemies." },
  { planet: "mars", house: 11, delineation: "Scarcity of progress, enmity of friends, loss of substance." },
  { planet: "sun", house: 11, delineation: "Joy from rich friends, fortune of parents, famous name in foreign regions." },
  { planet: "venus", house: 11, delineation: "Fortune from friends, good faithfulness, many resources at end of life." },
  { planet: "mercury", house: 11, delineation: "Many friends and companions, joy among the wise, courtesy." },
  { planet: "moon", house: 11, delineation: "Joy from friends, fulfillment of every hope." },
  { planet: "saturn", house: 12, delineation: "Dread, captivity, impediments from kings, panic in all things." },
  { planet: "jupiter", house: 12, delineation: "Slavery, poverty, desertion and sorrow from slaves." },
  { planet: "mars", house: 12, delineation: "Diseases and losses from enemies, impediments in all things." },
  { planet: "sun", house: 12, delineation: "Enmities of kings, loss of honors, diseases, calamity from slaves." },
  { planet: "venus", house: 12, delineation: "Annoyances from bad women, a bad marriage." },
  { planet: "mercury", house: 12, delineation: "A wise native and philosopher; if impeded, frenzied and senseless." },
  { planet: "moon", house: 12, delineation: "Impediments from enemies; mitigated in a nocturnal birth." },
];

// ── Al-Khayyāt Ch.49: Lot of Fortune in houses (12 rules) ──

const FORTUNE_HOUSE_RULES: Array<{
  house: number;
  delineation: string;
}> = [
  { house: 1, delineation: "Greatest fortune in acquiring resources, prosperous successes in all business." },
  { house: 2, delineation: "Fortune in acquiring resources, but not as completely as in the 1st." },
  { house: 3, delineation: "Fortune with brothers, sisters, relatives, and religious men." },
  { house: 4, delineation: "Favorable for buying farms and houses, working in mines, seeking treasures." },
  { house: 5, delineation: "Good for involving with children, writing letters, frequenting banquets, seeking pleasure." },
  { house: 6, delineation: "Good for employing slaves and buying animals; do not get angry with them." },
  { house: 7, delineation: "Good for doing things with women, changing status, moving to linger in a new place." },
  { house: 8, delineation: "Loss. The opposition of Fortune signifies the greatest misfortune. Buy nothing, sell nothing." },
  { house: 9, delineation: "Auspicious for long journeys, business in foreign lands, religious matters." },
  { house: 10, delineation: "Most fortunate for doing things with kings and princes, beginning any art or craft." },
  { house: 11, delineation: "Double fortune in all matters, particularly seeking resources from princes." },
  { house: 12, delineation: "Good for buying horses and oxen; all other business brings loss." },
];

// ── Assemble all rules ──

function buildValensRules(): AncientSourceRule[] {
  return VALENS_PAIRS.map((p, i) => ({
    id: `valens:pair:${p.planets[0]}+${p.planets[1]}`,
    source_author: "Valens" as const,
    work: "Anthologiae Book I.21",
    technique: "planetary_pair",
    planets: p.planets,
    themes: p.themes,
    delineation: p.delineation,
    citation: "Valens, Anth. I.21",
    confidence: "high" as Confidence,
  }));
}

function buildAlKhayyatRules(): AncientSourceRule[] {
  return AL_KHAYYAT_HOUSE_RULES.map((r, i) => ({
    id: `al-khayyāt:house:${r.planet}_in_${r.house}`,
    source_author: "al-Khayyāt" as const,
    work: "On the Judgments of Nativities Ch.47",
    technique: "planet_in_house",
    planets: [r.planet],
    house: r.house,
    themes: r.delineation.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 3).slice(0, 3),
    delineation: r.delineation,
    citation: "al-Khayyāt, Judgments Ch.47",
    confidence: "high" as Confidence,
  }));
}

function buildFortuneHouseRules(): AncientSourceRule[] {
  return FORTUNE_HOUSE_RULES.map((r, i) => ({
    id: `al-khayyāt:fortune_in_${r.house}`,
    source_author: "al-Khayyāt" as const,
    work: "On the Judgments of Nativities Ch.49",
    technique: "lot_in_house",
    house: r.house,
    themes: r.delineation.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 3).slice(0, 3),
    delineation: r.delineation,
    citation: "al-Khayyāt, Judgments Ch.49",
    confidence: "high" as Confidence,
  }));
}

// ── Exported rule database ──

let ruleDb: AncientSourceRule[] | null = null;

function buildRuleDb(): AncientSourceRule[] {
  return [
    ...buildValensRules(),
    ...buildAlKhayyatRules(),
    ...buildFortuneHouseRules(),
  ];
}

/** Get all rules. */
export function getAllRules(): AncientSourceRule[] {
  if (!ruleDb) ruleDb = buildRuleDb();
  return ruleDb;
}

/** Get rules filtered by planet. */
export function getRulesByPlanet(planet: PlanetId): AncientSourceRule[] {
  return getAllRules().filter(r => r.planets?.includes(planet));
}

/** Get rules filtered by house. */
export function getRulesByHouse(house: number): AncientSourceRule[] {
  return getAllRules().filter(r => r.house === house);
}

/** Get rules filtered by source author. */
export function getRulesByAuthor(author: string): AncientSourceRule[] {
  return getAllRules().filter(r => r.source_author.toLowerCase() === author.toLowerCase());
}

/** Look up a single rule by ID. */
export function getRuleById(id: string): AncientSourceRule | undefined {
  return getAllRules().find(r => r.id === id);
}

/** Get all rule IDs (for LLM containment validation). */
export function getAllRuleIds(): string[] {
  return getAllRules().map(r => r.id);
}
