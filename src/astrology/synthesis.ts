/**
 * Synthesis — uses ALL granular data to build a useful daily reading.
 *
 * The "descent": Source (sky) → Birth Chart (natal positions) → Daimon (personal filter)
 *   → Year (annual question) → Month (monthly filter)
 *     → Day (granular expression) + Yesterday comparison (what changed)
 *       → Practice (concrete action) + Timing (when to act)
 */

import type { NormalizedChart, PlanetId } from "./types";
import type { ActivationPacket } from "./activation_packet";
import type { MacroTranslation } from "./interpreters/aggregator";
import { PLANET_PROFILES, chooseAlignmentMode } from "./planet_profiles";
import { getGraph } from "./knowledge_graph";

const PN: Record<string, string> = { sun:"Sun", moon:"Moon", mercury:"Mercury", venus:"Venus", mars:"Mars", jupiter:"Jupiter", saturn:"Saturn" };
function pn(p: PlanetId): string { return PN[p] || p; }
const SN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const CHALDEAN = ["saturn","jupiter","mars","sun","venus","mercury","moon"] as const;
const DAY_RULERS: Record<string, string> = { sun:"0", moon:"1", mars:"2", mercury:"3", jupiter:"4", venus:"5", saturn:"6" };
const DAY_NAMES = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

const HOUSE_THEMES: Record<number, string> = {
  1:"self, identity", 2:"resources, values", 3:"communication, learning",
  4:"home, family, foundations", 5:"creativity, children, joy",
  6:"health, work, service", 7:"partnership, marriage",
  8:"transformation, shared resources", 9:"philosophy, travel, higher education",
  10:"career, reputation", 11:"friends, community, hopes",
  12:"solitude, healing, unconscious",
};

export interface TraditionSynthesis {
  tradition: string; source: string;
  atmosphere_decoding: string;
  action: { what: string; why: string; urgency: "now" | "today" | "this_week" };
}

export interface DailySynthesis { date: string; native_id: string; traditions: TraditionSynthesis[]; }

function np(chart: NormalizedChart, pid: string): string {
  const p = chart.natal.planets[pid as PlanetId];
  if (!p) return "";
  const d = (p.dignities || []).join("/") || "peregrine";
  return `${pn(pid as PlanetId)} in ${p.sign} H${p.house} (${d})${p.retrograde ? " Rx" : ""}`;
}

function orbQual(orb: number): string {
  return orb < 0.5 ? "partile (exact to the arcminute)" :
    orb < 1 ? "exceptionally tight" : orb < 2 ? "tight" : orb < 3 ? "moderate" : "wide";
}

function orbUrgency(orb: number): string {
  return orb < 0.5 ? "This is operating at maximum intensity." :
    orb < 1 ? "This is fully active now." :
    orb < 2 ? "Active enough to work with today." :
    orb < 3 ? "Present but not pressing." : "Background texture — note it for later.";
}

const colorR: Record<string,string> = { gold:"vitality", orange:"warmth", silver:"receptivity", yellow:"mental clarity", grey:"balance", green:"harmony", rose:"affection", red:"courage", blue:"expansive thinking", "royal purple":"wisdom", indigo:"depth", black:"structure", "dark grey":"containment", charcoal:"focus" };
const scentR: Record<string,string> = { frankincense:"purification", cinnamon:"warming", saffron:"illumination", jasmine:"intuition", lotus:"spiritual opening", sandalwood:"grounding", lavender:"mental calm", fennel:"sharpening", mint:"alertness", rose:"opening the heart", ginger:"activating", basil:"courage", cedar:"strength", clove:"focus", nutmeg:"expansion", myrrh:"deepening", cypress:"endurance", patchouli:"rooting" };

// ─── Yesterday comparison type ───
export interface DayComparison {
  date: string;
  new_transits: string[];          // transits active today that weren't yesterday
  dropped_transits: string[];      // transits active yesterday that aren't today
  stronger_planets: Array<{ planet: string; score_delta: number }>;  // planets with higher score than yesterday
  weaker_planets: Array<{ planet: string; score_delta: number }>;    // planets with lower score
}

// ─── Planetary hours ───
function planetaryHours(date: Date, lat: number): Array<{ hour: number; ruler: string }> {
  // Approximate: day hours = sunrise to sunset / 12, night hours = sunset to sunrise / 12
  // Simple version: return all 24 hours with Chaldean order starting from day ruler
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, etc.
  const dayRuler = CHALDEAN[dayOfWeek % 7]; // Sunday→Sun, Monday→Moon, etc.
  const startIdx = CHALDEAN.indexOf(dayRuler);
  const hours: Array<{ hour: number; ruler: string }> = [];
  for (let i = 0; i < 24; i++) {
    hours.push({ hour: i, ruler: CHALDEAN[(startIdx + i) % 7] });
  }
  return hours;
}

// Map practice type to planetary mode for daimon alignment
const modePurposeMap: Record<string, string[]> = {
  strengthen: ["structure","discipline","patience","endurance","build","strength","ground","contain","protect","karmic","limit","patient","craft"],
  balance: ["expand","growth","meaning","wisdom","generosity","teach","philosophy","travel","abundance","mentor","ethic","law","faith"],
  discipline: ["harmony","beauty","love","grace","art","refine","cultivate","relationship","pleasure","aesthetic","social","kind"],
  stabilize: ["writing","study","communication","speech","focus","clarity","exchange","learn","translate","compose","interpret","code"],
  cool: ["action","courage","drive","force","assert","physical","boundary","protect","warrior","initiate","cut","breakthrough"],
};

export function synthesizeDaily(
  packet: ActivationPacket,
  chart: NormalizedChart,
  macro: MacroTranslation,
  yesterday?: DayComparison,
): DailySynthesis {
  const signals = packet.signals;
  const conds = packet.planet_conditions;
  const g = getGraph();
  const yearlySig = signals.find(s => s.timing_sources.includes("annual_profection_lord"));
  const monthlySig = signals.find(s => s.timing_sources.includes("monthly_profection_lord"));
  const daimonPlanet = packet.oikodespotes?.planet;
  const domEl = macro.integrated.dominant_element || "mixed";
  const domMo = macro.integrated.dominant_modality || "mixed";

  // ── Parse ALL activations ──
  const allTransits: Array<{ desc: string; planets: PlanetId[]; orb: number; aspect: string; natalTarget?: string; isLot: boolean; isSky: boolean; source: string }> = [];
  for (const act of packet.atmosphere.daily.activations) {
    const m = act.description.match(/orb (\d+\.?\d*)°/);
    if (!m) continue;
    const orb = parseFloat(m[1]);
    if (orb > 8) continue;
    const ps = ["sun","moon","mercury","venus","mars","jupiter","saturn"].filter(p => act.description.toLowerCase().includes(p)) as PlanetId[];
    const nm = act.description.match(/natal (\w+)/);
    const isSky = act.description.includes("in the sky");
    const isLot = act.description.includes("Lot of");
    const asp = act.description.includes("square") ? "square" : act.description.includes("opposition") ? "opposition" : act.description.includes("trine") ? "trine" : act.description.includes("sextile") ? "sextile" : "conjunction";
    allTransits.push({ desc: act.description, planets: ps, orb, aspect: asp, natalTarget: nm?.[1], isLot, isSky, source: act.source });
  }
  allTransits.sort((a, b) => a.orb - b.orb);

  // Separate sky aspects from natal transits
  const skyAspects = allTransits.filter(t => t.isSky);
  const natalTransits = allTransits.filter(t => !t.isSky && !t.isLot);
  const lotTransits = allTransits.filter(t => t.isLot);

  // Group transits by target planet for multiple-hit awareness
  const hitsByTarget = new Map<string, typeof allTransits>();
  for (const t of allTransits) {
    if (t.natalTarget) {
      if (!hitsByTarget.has(t.natalTarget)) hitsByTarget.set(t.natalTarget, []);
      hitsByTarget.get(t.natalTarget)!.push(t);
    }
  }
  const mostHitPlanet = [...hitsByTarget.entries()].sort((a, b) => b[1].length - a[1].length)[0];

  // House activation from transits
  const houseHits = new Map<number, number>();
  for (const t of allTransits.slice(0, 10)) {
    for (const p of t.planets) {
      const cond = conds.find(c => c.planet === p);
      if (cond?.house) houseHits.set(cond.house, (houseHits.get(cond.house) || 0) + 1);
    }
  }
  const topHouse = [...houseHits.entries()].sort((a, b) => b[1] - a[1])[0];

  // Sky aspect landscape
  const skyTensions = skyAspects.filter(s => s.aspect === "square" || s.aspect === "opposition");
  const skyEases = skyAspects.filter(s => s.aspect === "trine" || s.aspect === "sextile");

  // Alignments
  const aligns: Array<{ planet: PlanetId; mode: string; cond: typeof conds[0] }> = [];
  for (const sig of signals) {
    const cond = conds.find(c => c.planet === sig.planet);
    if (!cond) continue;
    const prof = PLANET_PROFILES[sig.planet];
    if (!prof) continue;
    aligns.push({ planet: sig.planet, mode: chooseAlignmentMode({ planet: sig.planet, pressures: prof.distorted_expression, condition: cond.retrograde ? "retrograde" : undefined }), cond });
  }

  // Practice ranking — multi-axis differentiation
  const orbCounts = new Map<string, number>();
  for (const t of allTransits) if (t.orb < 3) for (const p of t.planets) orbCounts.set(p, (orbCounts.get(p)||0)+1);
  const dominantAspect = natalTransits[0]?.aspect || "conjunction";

  // Source prestige: Ficino is user's preferred, then Orphic, then others
  const sourcePrestige: Record<string, number> = { Ficino: 1, Orphic: 1, Agrippa: 0.95, PGM: 0.9, Picatrix: 0.85 };
  // Safety: safe_symbolic > historical_reference > restricted
  const safetyPrestige: Record<string, number> = { safe_symbolic: 1.1, historical_reference: 1, restricted: 0.7 };

  // Count how many practices share each purpose (rarer = more distinctive)
  const purposeFrequency = new Map<string, number>();
  const allPracticeNodes: Array<{ id: string; purposes: string[]; source: string; safety: string; type: string }> = [];
  for (const sig of signals) {
    try {
      const cluster = g.clusterByPlanet(sig.planet);
      for (const e of cluster.edges.filter(e => e.predicate === "practice_for")) {
        const node = g.getNode(e.subject);
        if (!node) continue;
        const purposes: string[] = (node.data?.purpose as string[]) || [];
        allPracticeNodes.push({ id: node.id, purposes, source: (node.data?.source as string) || "", safety: (node.data?.safety as string) || "historical_reference", type: (node.data?.type as string) || "" });
        for (const p of purposes) purposeFrequency.set(p, (purposeFrequency.get(p) || 0) + 1);
      }
    } catch {}
  }

  const pracRecs: Array<{ label: string; score: number; planet: string; isDaimon: boolean }> = [];
  const daimonPracRecs: Array<{ label: string; score: number; planet: string }> = [];

  for (const sig of signals) {
    const planetMode = aligns.find(a => a.planet === sig.planet)?.mode || "balance";
    const modeKeywords = modePurposeMap[planetMode] || [];
    const de = sig.planet === daimonPlanet;
    const to = orbCounts.get(sig.planet) || 0;

    try {
      const cluster = g.clusterByPlanet(sig.planet);
      for (const e of cluster.edges.filter(e => e.predicate === "practice_for")) {
        const node = g.getNode(e.subject);
        if (!node) continue;
        const purposes: string[] = (node.data?.purpose as string[]) || [];
        const type: string = (node.data?.type as string) || "";
        const source: string = (node.data?.source as string) || "";
        const safety: string = (node.data?.safety as string) || "historical_reference";

        // Base: signal strength
        let ds = sig.score * (1 + to*0.15 + (de?0.25:0));

        // Axis 1: Safety (safe_symbolic > historical > restricted)
        ds *= (safetyPrestige[safety] || 1);

        // Axis 2: Source prestige (Ficino preferred)
        ds *= (sourcePrestige[source] || 0.9);

        // Axis 3: Purpose-mode match
        if (purposes.some(p => modeKeywords.some(k => p.toLowerCase().includes(k)))) ds *= 1.2;

        // Axis 4: Purpose rarity — unique purposes get a bonus
        let rarityBonus = 0;
        for (const p of purposes) {
          const freq = purposeFrequency.get(p) || 1;
          if (freq <= 1) rarityBonus += 0.15; // unique purpose
          else if (freq <= 2) rarityBonus += 0.08; // shared by 2 practices
        }
        ds *= (1 + rarityBonus);

        // Axis 5: Type matching aspect quality
        const isHard = dominantAspect === "square" || dominantAspect === "opposition";
        const isSoft = dominantAspect === "trine" || dominantAspect === "sextile";
        if ((isHard && (type === "ritual" || type === "talisman" || type === "action")) ||
            (isSoft && (type === "meditation" || type === "music" || type === "prayer"))) ds *= 1.15;

        const rec = { label: node?.label || e.subject, score: Math.round(ds * 10) / 10, planet: sig.planet, isDaimon: de };
        pracRecs.push(rec);
        if (de) daimonPracRecs.push(rec);
      }
    } catch {}
  }
  pracRecs.sort((a, b) => b.score - a.score);
  daimonPracRecs.sort((a, b) => b.score - a.score);

  // Weekly
  const weekly = packet.atmosphere.weekly.activations.map(a => a.description);

  // ── The year's theme (use profection house theme, not generic) ──
  const yrTheme = yearlySig ? HOUSE_THEMES[yearlySig.activated_houses[0] || 0] || "" : "";
  const moTheme = monthlySig ? HOUSE_THEMES[monthlySig.activated_houses[0] || 0] || "" : "";

  // ── BUILD THE READING ──
  const t: string[] = [];

  // 1. THE FRAME — year + temperament
  if (yearlySig) {
    t.push(`Your year is shaped by ${np(chart, yearlySig.planet)}, governing ${yrTheme}. This is the long arc you're working inside. The prevailing texture today is ${domEl} ${domMo}.`);
  } else {
    t.push(`The atmosphere today is ${domEl} ${domMo}.`);
  }

  // 2. MONTHLY FILTER
  if (monthlySig) {
    t.push(`\nThis month, ${np(chart, monthlySig.planet)} governs ${moTheme}. This filters the yearly ${yrTheme} question through the monthly lens of ${moTheme} — the annual arc is being worked out through this domain right now.`);
  }

  // 3. THE CONFIGURATION LANDSCAPE — use top 3 transits, not just tightest
  if (natalTransits.length > 0) {
    t.push(`\nToday's transit landscape (sorted by intensity):`);
    const topNatal = natalTransits.slice(0, 3);
    for (const nt of topNatal) {
      const target = nt.natalTarget ? np(chart, nt.natalTarget) : nt.planets.map(pn).join(" and ");
      const multiple = nt.natalTarget && (hitsByTarget.get(nt.natalTarget)?.length || 0) > 1 ? ` (${hitsByTarget.get(nt.natalTarget)!.length} transits total to this planet)` : "";
      t.push(`\n· ${nt.desc} — ${orbQual(nt.orb)}. ${orbUrgency(nt.orb)} This activates ${target}${multiple}.`);
    }

    // If there are sky aspects, mention them as the ambient atmosphere
    if (skyAspects.length > 0) {
      t.push(`\nIn the wider sky: ${skyAspects.map(s => s.desc).join("; ")}. This is the collective atmosphere you're breathing — the background weather of the day.${skyTensions.length > 0 ? ` ${skyTensions.length} tension point${skyTensions.length > 1 ? "s" : ""} in the collective sky.` : ""}`);
    }

    // Lot transits as material anchors
    if (lotTransits.length > 0) {
      t.push(`\nMaterial anchors: ${lotTransits.slice(0, 2).map(l => l.desc).join("; ")}. These point to concrete circumstances, not inner states (Valens Anth. II.16).`);
    }
  }

  // 4. THE MOST ACTIVATED PLANET + HOUSE
  if (mostHitPlanet) {
    const [planet, transits] = mostHitPlanet;
    t.push(`\n${np(chart, planet)} is the most aspected planet today (${transits.length} transit${transits.length > 1 ? "s" : ""}). This is where the sky is concentrating its attention — and where yours should be too.`);
  }
  if (topHouse) {
    t.push(`House ${topHouse[0]} (${HOUSE_THEMES[topHouse[0]] || ""}) receives the most transit activity. This is the domain where the yearly ${yrTheme}, the monthly ${moTheme}, and today's transits converge.`);
  }

  // 5. WHAT EACH PLANET NEEDS — aligned with the full picture
  if (aligns.length > 0) {
    t.push(`\nPlanetary alignment guide:`);
    for (const al of aligns.slice(0, 4)) {
      const prof = PLANET_PROFILES[al.planet];
      if (!prof) continue;
      const col = prof.colours.slice(0, 2).join(" or ").split(" or ").map(c => `${c} (${colorR[c.toLowerCase()] || "align"})`).join(" or ");
      const scent = prof.scents_or_symbolic_herbs.slice(0, 2).join(" or ").split(" or ").map(s => `${s} (${scentR[s.toLowerCase()] || "align"})`).join(" or ");
      const acts = prof.activities.slice(0, 2).join(" or ");
      const hits = allTransits.filter(t => t.planets.includes(al.planet) && t.orb < 3);
      const hitNote = hits.length > 0 ? ` — ${hits[0].aspect} at ${hits[0].orb.toFixed(1)}°${hits[0].natalTarget ? ` to ${np(chart, hits[0].natalTarget)}` : ""}` : "";
      const dm = al.planet === daimonPlanet ? " ★ your daimon" : "";
      t.push(`\n· ${pn(al.planet)} [${al.mode}]${dm}: ${al.cond.sign} H${al.cond.house}. ${col} for sight, ${scent} for smell. Best activity: ${acts}.${hitNote}`);
    }
  }

  // 6. FORTUNE/SPIRIT MODE
  t.push(`\nMode: ${packet.dominant_mode === "spirit" ? "Spirit-led — today is about what you DO with circumstance. Your choices carry more weight than your conditions." : packet.dominant_mode === "fortune" ? "Fortune-led — today is about what happens TO you through incarnation. Pay attention to what arrives, not just what you initiate." : "Mixed — both circumstance and intention are active. Some things land on you; others you must initiate."}`);

  // 7. TENSIONS — actionable
  if (macro.integrated.tensions.length > 0) {
    t.push(`\nEdges worth working:`);
    for (const tn of macro.integrated.tensions.slice(0, 3)) {
      const hit = tn.planets.map(p => { const mt = allTransits.find(r => r.planets.some(rp => rp === p) && Math.abs(r.orb - tn.orb) < 0.3); return mt?.natalTarget ? np(chart, mt.natalTarget) : pn(p); }).filter((v, i, a) => a.indexOf(v) === i).join(" and ");
      const urgency = tn.orb < 1 ? "Act now" : tn.orb < 2 ? "Work today" : "Note for the week";
      t.push(`\n· ${tn.description} — presses on ${hit}. ${urgency}.`);
      const remedy = tn.planets.map(p => aligns.find(a => a.planet === p)).filter(Boolean)[0];
      if (remedy) { const ra = PLANET_PROFILES[remedy.planet]?.activities[0]; if (ra) t.push(`  → Respond through ${ra}.`); }
    }
  }

  // 8. WEEKLY ARC
  if (weekly.length > 0) {
    t.push(`\nBuilding this week:`);
    for (const w of weekly.slice(0, 3)) {
      const wp = ["sun","moon","mercury","venus","mars","jupiter","saturn"].filter(p => w.toLowerCase().includes(p));
      const wn = wp.map(p => { const n = chart.natal.planets[p as PlanetId]; return n ? `${pn(p as PlanetId)} (${n.sign} H${n.house})` : pn(p as PlanetId); }).join(", ");
      const kind = w.includes("square") || w.includes("opposition") ? "tension" : "opening";
      t.push(`\n· ${w}. This ${kind} involving ${wn} is approaching. Today's transits are the seed; this develops through midweek.`);
    }
  }

  // 9. YESTERDAY COMPARISON
  if (yesterday && yesterday.new_transits.length > 0) {
    t.push(`\nNew since yesterday:`);
    for (const nt of yesterday.new_transits.slice(0, 3)) t.push(`\n· + ${nt}`);
    if (yesterday.dropped_transits.length > 0) {
      t.push(`\nNo longer active:`);
      for (const dt of yesterday.dropped_transits.slice(0, 2)) t.push(`\n· - ${dt}`);
    }
    if (yesterday.stronger_planets.length > 0) {
      const sp = yesterday.stronger_planets[0];
      t.push(`\n${pn(sp.planet as PlanetId)} is stronger today (+${sp.score_delta.toFixed(1)}) than yesterday.`);
    }
    if (yesterday.weaker_planets.length > 0) {
      const wp = yesterday.weaker_planets[0];
      t.push(`\n${pn(wp.planet as PlanetId)} is weaker today (${wp.score_delta.toFixed(1)}) — energy receding.`);
    }
  }

  // 10. PRACTICES — daimon first, then general
  if (daimonPracRecs.length > 0) {
    const dp = daimonPracRecs[0];
    t.push(`\nPractice for your daimon (${pn(dp.planet as PlanetId)}): ${dp.label} (score ${dp.score.toFixed(0)}).`);
  }
  if (pracRecs.length > 0) {
    t.push(`\nStrongest overall:`);
    for (const pr of pracRecs.slice(0, 2)) {
      const dm = pr.isDaimon ? " ★ daimon" : "";
      t.push(`\n· ${pr.label} (${pr.score.toFixed(0)}) — supports ${pn(pr.planet as PlanetId)}${dm}`);
    }
  }

  // 11. PLANETARY HOURS — best times for daimon practices
  if (daimonPlanet) {
    try {
      const hours = planetaryHours(new Date(), 0);
      const daimonHours = hours.filter(h => h.ruler === daimonPlanet);
      if (daimonHours.length > 0) {
        const best = daimonHours[0];
        t.push(`\nBest time for ${pn(daimonPlanet)} practice: hour ${best.hour} (${best.hour}:00-${best.hour+1}:00), ruled by ${pn(daimonPlanet as PlanetId)}.`);
      }
    } catch {}
  }

  // ── ACTION ──
  const daimonAl = aligns.find(a => a.planet === daimonPlanet);
  let actionWhat = "", actionWhy = "", urgency: "now" | "today" | "this_week" = "today";

  if (daimonAl && daimonPlanet) {
    const dp = PLANET_PROFILES[daimonPlanet];
    actionWhat = dp?.activities[0] || "attend to the daimon";
    const dt = allTransits.find(r => r.planets.includes(daimonPlanet) && r.orb < 3);
    if (dt) {
      const daimonPrac = daimonPracRecs[0];
      actionWhy = `Your daimon ${np(chart, daimonPlanet)} receives a ${dt.aspect} at ${dt.orb.toFixed(1)}°. It needs ${daimonAl.mode}. ${dp?.activities[0] || ""}.${daimonPrac ? ` Best daimon practice: ${daimonPrac.label}.` : ""}`;
      if (dt.orb < 1.5) urgency = "now";
    } else {
      actionWhy = `Your daimon ${np(chart, daimonPlanet)} needs ${daimonAl.mode} today as background practice. ${dp?.activities[0] || ""}.`;
    }
  } else if (natalTransits.length > 0) {
    actionWhat = `Work the ${natalTransits[0].aspect} involving ${natalTransits[0].planets.map(pn).join(" and ")}`;
    actionWhy = `Tightest configuration at ${natalTransits[0].orb.toFixed(1)}°. ${natalTransits[0].natalTarget ? `Activates ${np(chart, natalTransits[0].natalTarget)}.` : ""}`;
  }

  return {
    date: packet.date, native_id: packet.native_id,
    traditions: [{
      tradition: "Daily Atmosphere", source: "Valens · Ptolemy · Brennan",
      atmosphere_decoding: t.join(""),
      action: { what: actionWhat, why: actionWhy, urgency },
    }],
  };
}
