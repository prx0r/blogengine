import type { PlanetId, ValensPairRule, ValensTripleRule, PlanetCombination, Confidence } from "./types";

const SIGN_RULERS: Record<string, PlanetId[]> = {
  aries: ["mars"], taurus: ["venus"], gemini: ["mercury"], cancer: ["moon"],
  leo: ["sun"], virgo: ["mercury"], libra: ["venus"], scorpio: ["mars"],
  sagittarius: ["jupiter"], capricorn: ["saturn"], aquarius: ["saturn"], pisces: ["jupiter"],
};

const PLANET_ORDER: PlanetId[] = ["saturn", "jupiter", "mars", "venus", "mercury", "moon", "sun"];

function sortPlanets(a: PlanetId, b: PlanetId): [PlanetId, PlanetId] {
  const ai = PLANET_ORDER.indexOf(a);
  const bi = PLANET_ORDER.indexOf(b);
  return ai <= bi ? [a, b] : [b, a];
}

const PAIR_RULES: Record<string, ValensPairRule> = {};

const RAW_PAIRS: Array<{
  planets: [PlanetId, PlanetId];
  themes: string[];
  opportunities: string[];
  pressures: string[];
}> = [
  { planets: ["saturn", "jupiter"], themes: ["authority vs expansion", "structure meets growth", "responsible prosperity"], opportunities: ["wise investment", "strategic growth", "institutional building"], pressures: ["conflict between duty and desire", "overcaution", "excessive restriction"] },
  { planets: ["saturn", "mars"], themes: ["disciplined force", "strategic pressure", "endurance through conflict"], opportunities: ["mastered aggression", "breakthrough through persistence"], pressures: ["frustration", "violent reaction to limitation", "suppressed anger"] },
  { planets: ["saturn", "venus"], themes: ["committed love", "artistic discipline", "responsible pleasure"], opportunities: ["mature relationship", "lasting art", "valued craft"], pressures: ["emotional restriction", "fear of intimacy", "austerity"] },
  { planets: ["saturn", "mercury"], themes: ["disciplined thought", "structured communication", "patient study"], opportunities: ["mastery through study", "clear systems", "rigorous analysis"], pressures: ["mental rigidity", "depressive thinking", "over-seriousness"] },
  { planets: ["saturn", "moon"], themes: ["emotional structure", "mature nurture", "karmic family pattern"], opportunities: ["healing lineage wounds", "emotional mastery", "stable home"], pressures: ["emotional coldness", "melancholy", "parental burden"] },
  { planets: ["saturn", "sun"], themes: ["disciplined will", "responsible authority", "mature self-expression"], opportunities: ["rightful leadership", "earned recognition"], pressures: ["authority conflict", "self-doubt", "rigid identity"] },
  { planets: ["jupiter", "mars"], themes: ["expansive action", "righteous force", "growth through courage"], opportunities: ["successful initiative", "just campaign", "generous assertiveness"], pressures: ["overreach", "wasteful aggression", "dogmatic force"] },
  { planets: ["jupiter", "venus"], themes: ["generous love", "abundant beauty", "fortunate relationship"], opportunities: ["happy partnership", "artistic success", "wealth through grace"], pressures: ["excess", "overindulgence", "complacency"] },
  { planets: ["jupiter", "mercury"], themes: ["wise speech", "expansive thought", "teaching"], opportunities: ["philosophical communication", "inspired writing", "beneficial counsel"], pressures: ["overgeneralization", "glibness", "intellectual arrogance"] },
  { planets: ["jupiter", "moon"], themes: ["nurturing abundance", "emotional growth", "fortunate home"], opportunities: ["generous family life", "emotional prosperity", "healing through expansion"], pressures: ["over-nurture", "emotional excess", "dependency"] },
  { planets: ["jupiter", "sun"], themes: ["magnanimous will", "generous authority", "blessed creativity"], opportunities: ["successful leadership", "creative prosperity", "fortunate recognition"], pressures: ["hubris", "overconfidence", "waste of resources"] },
  { planets: ["mars", "venus"], themes: ["passionate love", "creative assertion", "desire in action"], opportunities: ["dynamic relationship", "creative passion", "courageous love"], pressures: ["jealousy", "conflict in love", "desire without discipline"] },
  { planets: ["mars", "mercury"], themes: ["sharp speech", "argumentative precision", "technical craft under pressure"], opportunities: ["writing with edge", "decisive analysis", "strategic communication"], pressures: ["harsh speech", "argument for its own sake", "mental agitation"] },
  { planets: ["mars", "moon"], themes: ["emotional assertion", "protective nurture", "passionate feeling"], opportunities: ["courageous emotional expression", "protective action for loved ones"], pressures: ["reactive emotion", "anger from hurt", "emotional combat"] },
  { planets: ["mars", "sun"], themes: ["focused will", "assertive identity", "courageous self-expression"], opportunities: ["decisive leadership", "breakthrough action", "bold creativity"], pressures: ["ego conflict", "burnout", "aggressive self-assertion"] },
  { planets: ["venus", "mercury"], themes: ["graceful speech", "artistic communication", "social intelligence"], opportunities: ["charming writing", "diplomatic skill", "aesthetic criticism"], pressures: ["superficial charm", "indecisiveness", "vanity in expression"] },
  { planets: ["venus", "moon"], themes: ["loving nurture", "emotional beauty", "gracious feeling"], opportunities: ["tender relationship", "artistic emotional expression", "beautiful home"], pressures: ["over-sensitivity in love", "emotional dependence", "mood-driven relating"] },
  { planets: ["venus", "sun"], themes: ["gracious will", "loving self-expression", "creative harmony"], opportunities: ["attractive leadership", "harmonious creativity", "gracious authority"], pressures: ["vanity", "need for approval", "self-worth tied to others"] },
  { planets: ["mercury", "moon"], themes: ["feeling thought", "intelligent nurture", "emotional communication"], opportunities: ["emotionally intelligent writing", "intuitive communication", "nurturing speech"], pressures: ["overthinking feelings", "nervous nurture", "moody communication"] },
  { planets: ["mercury", "sun"], themes: ["conscious thought", "articulate will", "clear expression"], opportunities: ["clear writing", "authentic speech", "conscious communication"], pressures: ["intellectual arrogance", "over-analysis", "ego-driven argument"] },
  { planets: ["moon", "sun"], themes: ["integrated self", "feeling and will united", "whole expression"], opportunities: ["emotional clarity", "authentic selfhood", "creative integration"], pressures: ["emotional conflict with identity", "mood swings", "unintegrated self"] },
];

for (const raw of RAW_PAIRS) {
  const [a, b] = sortPlanets(raw.planets[0], raw.planets[1]);
  const id = `valens:pair:${a}+${b}`;
  PAIR_RULES[id] = {
    id,
    planets: [a, b],
    themes: raw.themes,
    opportunities: raw.opportunities,
    pressures: raw.pressures,
    confidence: "high",
  };
}

export function getPairRule(a: PlanetId, b: PlanetId): ValensPairRule | null {
  const [sortedA, sortedB] = sortPlanets(a, b);
  return PAIR_RULES[`valens:pair:${sortedA}+${sortedB}`] || null;
}

export function getAllPairRules(): ValensPairRule[] {
  return Object.values(PAIR_RULES);
}

export function generateTriple(a: PlanetId, b: PlanetId, c: PlanetId): ValensTripleRule | null {
  const ids = [a, b, c].sort((x, y) => PLANET_ORDER.indexOf(x) - PLANET_ORDER.indexOf(y)) as [PlanetId, PlanetId, PlanetId];
  const pairs: [PlanetId, PlanetId][] = [
    [ids[0], ids[1]], [ids[0], ids[2]], [ids[1], ids[2]],
  ];
  const rules = pairs.map(p => getPairRule(p[0], p[1])).filter(Boolean) as ValensPairRule[];
  if (rules.length < 3) return null;

  const themes = [...new Set(rules.flatMap(r => r.themes))];
  const opportunities = [...new Set(rules.flatMap(r => r.opportunities))];
  const pressures = [...new Set(rules.flatMap(r => r.pressures))];

  return {
    id: `valens:triple:${ids[0]}+${ids[1]}+${ids[2]}`,
    planets: ids,
    composed_of: rules.map(r => r.id),
    themes,
    opportunities,
    pressures,
  };
}

export function matchCombinations(activatedPlanets: PlanetId[]): PlanetCombination[] {
  const results: PlanetCombination[] = [];
  const unique = [...new Set(activatedPlanets)];

  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const rule = getPairRule(unique[i], unique[j]);
      if (rule) {
        results.push({
          planets: [unique[i], unique[j]],
          combination_type: "pair",
          themes: rule.themes,
          opportunities: rule.opportunities,
          pressures: rule.pressures,
          confidence: rule.confidence,
          source_rule_ids: [rule.id],
        });
      }
    }
  }

  if (unique.length >= 3) {
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        for (let k = j + 1; k < unique.length; k++) {
          const triple = generateTriple(unique[i], unique[j], unique[k]);
          if (triple) {
            results.push({
              planets: triple.planets,
              combination_type: "triple",
              themes: triple.themes,
              opportunities: triple.opportunities,
              pressures: triple.pressures,
              confidence: "medium",
              source_rule_ids: triple.composed_of,
            });
          }
        }
      }
    }
  }

  return results;
}

export function getHouseTopics(houseNumber: number): string[] {
  const map: Record<number, string[]> = {
    1: ["life", "vitality", "body", "character", "beginning"],
    2: ["wealth", "resources", "livelihood", "possessions"],
    3: ["siblings", "communication", "short travel", "local community"],
    4: ["home", "family", "roots", "inheritance", "end of life"],
    5: ["children", "pleasures", "creativity", "romance", "speculation"],
    6: ["health", "illness", "servitude", "daily work", "service"],
    7: ["marriage", "partnership", "open enemies", "contracts"],
    8: ["death", "inheritance", "transformation", "shared resources"],
    9: ["religion", "philosophy", "foreign travel", "higher education", "divination"],
    10: ["profession", "reputation", "authority", "career", "actions"],
    11: ["friends", "alliances", "hopes", "social networks", "benefits"],
    12: ["enemies", "suffering", "danger", "confinement", "hidden matters"],
  };
  return map[houseNumber] || [];
}

export { PAIR_RULES };
