/**
 * Knowledge Graph — typed in-memory graph with shared entity IDs.
 *
 * Every entity across all layers (computation, interpretation, practice)
 * uses the same node IDs:
 *   "planet:mars", "sign:leo", "house:1", "lot:fortune", "angle:asc"
 *   "element:fire", "modality:cardinal", "herb:basil", "metal:iron"
 *
 * This lets us cluster by planet, traverse across layers, and
 * answer queries like "give me everything related to Mars."
 */

import { getAllRules } from "./source_rules";
import { PLANET_PROFILES } from "./planet_profiles";

export type EntityLayer = "computation" | "interpretation" | "static" | "practice" | "correspondence";

export interface GraphNode {
  id: string;
  layer: EntityLayer;
  type: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  data?: Record<string, unknown>;
}

const NODE_PREFIXES = ["planet:", "sign:", "house:", "lot:", "angle:", "element:", "modality:", "herb:", "metal:", "colour:", "stone:", "incense:", "tradition:", "corr:", "spell:", "pgm:", "picatrix:", "rule:", "profile:", "quality:", "activity:", "session:", "condition:", "timing:", "confidence:", "daimon:", "theme:", "score:", "transit:", "sky_aspect:", "timescale:", "date:"] as const;

function isValidNodeId(id: string): boolean {
  return NODE_PREFIXES.some(p => id.startsWith(p));
}

export class KnowledgeGraph {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];
  private edgeIndex = new Map<string, GraphEdge[]>(); // subject → edges

  registerNode(id: string, layer: EntityLayer, type: string, label: string, data?: Record<string, unknown>): void {
    if (!isValidNodeId(id)) {
      console.warn(`KnowledgeGraph: node ID "${id}" doesn't match expected prefix pattern`);
    }
    this.nodes.set(id, { id, layer, type, label, data });
  }

  registerEdge(subject: string, predicate: string, object: string, data?: Record<string, unknown>): void {
    const edgeId = `${subject}--${predicate}-->${object}`;
    const edge: GraphEdge = { id: edgeId, subject, predicate, object, data };
    this.edges.push(edge);
    if (!this.edgeIndex.has(subject)) this.edgeIndex.set(subject, []);
    this.edgeIndex.get(subject)!.push(edge);
  }

  /** Get a node by ID. */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /** Get all nodes. */
  getAllNodes(): GraphNode[] {
    return [...this.nodes.values()];
  }

  /** Get all edges from a subject. */
  getEdges(subject: string): GraphEdge[] {
    return this.edgeIndex.get(subject) || [];
  }

  /**
   * Traverse — get everything connected to an ID across all layers.
   * Returns all nodes and edges that reference this ID.
   */
  traverse(id: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const result: { nodes: GraphNode[]; edges: GraphEdge[] } = { nodes: [], edges: [] };

    // Direct node
    const node = this.nodes.get(id);
    if (node) result.nodes.push(node);

    // Edges where this is the subject
    const outEdges = this.edgeIndex.get(id) || [];
    for (const edge of outEdges) {
      result.edges.push(edge);
      const objNode = this.nodes.get(edge.object);
      if (objNode && !result.nodes.find(n => n.id === objNode.id)) {
        result.nodes.push(objNode);
      }
    }

    // Edges where this is the object
    for (const edge of this.edges) {
      if (edge.object === id && !result.edges.find(e => e.id === edge.id)) {
        result.edges.push(edge);
        const subjNode = this.nodes.get(edge.subject);
        if (subjNode && !result.nodes.find(n => n.id === subjNode.id)) {
          result.nodes.push(subjNode);
        }
      }
    }

    return result;
  }

  /**
   * Cluster by planet — get all nodes and edges connected to a specific planet.
   */
  clusterByPlanet(planet: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const planetId = planet.startsWith("planet:") ? planet : `planet:${planet}`;
    return this.traverse(planetId);
  }

  /**
   * Get all correspondences for a planet (herbs, metals, colours, etc.)
   */
  getCorrespondences(planet: string, domain?: string): GraphEdge[] {
    const planetId = planet.startsWith("planet:") ? planet : `planet:${planet}`;
    const edges = this.edgeIndex.get(planetId) || [];
    if (domain) {
      return edges.filter(e => e.object.startsWith(`${domain}:`));
    }
    return edges.filter(e =>
      ["herb:", "metal:", "colour:", "stone:", "incense:"].some(p => e.object.startsWith(p))
    );
  }

  /** Register standard planetary correspondences (herbs, metals, colours). */
  registerStandardCorrespondences(): void {
    const data: Array<{ planet: string; herb?: string; metal?: string; colour?: string; stone?: string; incense?: string }> = [
      { planet: "planet:sun", herb: "herb:bay_laurel", metal: "metal:gold", colour: "colour:gold", stone: "stone:chrysolite", incense: "incense:frankincense" },
      { planet: "planet:moon", herb: "herb:jasmine", metal: "metal:silver", colour: "colour:silver", stone: "stone:pearl", incense: "incense:sandalwood" },
      { planet: "planet:mercury", herb: "herb:fennel", metal: "metal:mercury", colour: "colour:yellow", stone: "stone:agate", incense: "incense:lavender" },
      { planet: "planet:venus", herb: "herb:rose", metal: "metal:copper", colour: "colour:green", stone: "stone:emerald", incense: "incense:sandalwood" },
      { planet: "planet:mars", herb: "herb:basil", metal: "metal:iron", colour: "colour:red", stone: "stone:ruby", incense: "incense:dragon_blood" },
      { planet: "planet:jupiter", herb: "herb:cedar", metal: "metal:tin", colour: "colour:blue", stone: "stone:sapphire", incense: "incense:saffron" },
      { planet: "planet:saturn", herb: "herb:cypress", metal: "metal:lead", colour: "colour:black", stone: "stone:onyx", incense: "incense:myrrh" },
    ];

    for (const d of data) {
      this.registerNode(d.planet, "correspondence", "planet", d.planet.replace("planet:", ""));
      if (d.herb) { this.registerNode(d.herb, "correspondence", "herb", d.herb.replace("herb:", "")); this.registerEdge(d.planet, "corresponds_to", d.herb); }
      if (d.metal) { this.registerNode(d.metal, "correspondence", "metal", d.metal.replace("metal:", "")); this.registerEdge(d.planet, "corresponds_to", d.metal); }
      if (d.colour) { this.registerNode(d.colour, "correspondence", "colour", d.colour.replace("colour:", "")); this.registerEdge(d.planet, "corresponds_to", d.colour); }
      if (d.stone) { this.registerNode(d.stone, "correspondence", "stone", d.stone.replace("stone:", "")); this.registerEdge(d.planet, "corresponds_to", d.stone); }
      if (d.incense) { this.registerNode(d.incense, "correspondence", "incense", d.incense.replace("incense:", "")); this.registerEdge(d.planet, "corresponds_to", d.incense); }
    }
  }

  /** Get all unique layers registered. */
  getLayers(): EntityLayer[] {
    return [...new Set([...this.nodes.values()].map(n => n.layer))];
  }

  /** Remove dynamic session-scoped nodes without destroying static entities */
  clearSessionData(): void {
    const toRemove: string[] = [];
    for (const [id, node] of this.nodes) {
      if (node.layer === "computation" || node.layer === "interpretation") {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.nodes.delete(id);
    }
    this.edges = this.edges.filter(e =>
      !toRemove.includes(e.subject) && !toRemove.includes(e.object)
    );
    this.edgeIndex.clear();
    for (const e of this.edges) {
      if (!this.edgeIndex.has(e.subject)) this.edgeIndex.set(e.subject, []);
      this.edgeIndex.get(e.subject)!.push(e);
    }
  }
}

/** Clear dynamic (session-scoped) nodes without destroying static entities */
export function clearSession(): void {
  if (!instance) return;
  instance.clearSessionData();
}

/** Register static entity types: signs, elements, modalities, houses */
export function registerStaticEntities(): void {
  const g = getGraph();
  const zodiac = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  const elements = ["fire","earth","air","water"];
  const modalities = ["cardinal","fixed","mutable"];
  const signRulers: Record<string, string> = { aries:"mars", taurus:"venus", gemini:"mercury", cancer:"moon", leo:"sun", virgo:"mercury", libra:"venus", scorpio:"mars", sagittarius:"jupiter", capricorn:"saturn", aquarius:"saturn", pisces:"jupiter" };

  for (let i = 0; i < 12; i++) {
    const sign = zodiac[i];
    g.registerNode(`sign:${sign}`, "static", "sign", sign);
    g.registerNode(`element:${elements[i % 4]}`, "static", "element", elements[i % 4]);
    g.registerNode(`modality:${modalities[i % 3]}`, "static", "modality", modalities[i % 3]);
    g.registerEdge(`sign:${sign}`, "has_element", `element:${elements[i % 4]}`);
    g.registerEdge(`sign:${sign}`, "has_modality", `modality:${modalities[i % 3]}`);
    g.registerEdge(`sign:${sign}`, "ruled_by", `planet:${signRulers[sign]}`);
  }
  for (let i = 1; i <= 12; i++) {
    g.registerNode(`house:${i}`, "static", "house", `House ${i}`);
  }

  // Planetary friend/enemy relationships (Llewellyn Table 24, Agrippa)
  const rels: Array<{ a: string; rel: string; b: string }> = [
    { a:"saturn", rel:"friend", b:"jupiter" }, { a:"saturn", rel:"enemy", b:"sun" }, { a:"saturn", rel:"enemy", b:"mars" }, { a:"saturn", rel:"friend", b:"mercury" }, { a:"saturn", rel:"enemy", b:"moon" },
    { a:"jupiter", rel:"friend", b:"saturn" }, { a:"jupiter", rel:"friend", b:"sun" }, { a:"jupiter", rel:"friend", b:"venus" }, { a:"jupiter", rel:"enemy", b:"mercury" }, { a:"jupiter", rel:"enemy", b:"mars" },
    { a:"mars", rel:"enemy", b:"saturn" }, { a:"mars", rel:"friend", b:"venus" }, { a:"mars", rel:"enemy", b:"jupiter" }, { a:"mars", rel:"enemy", b:"moon" },
    { a:"sun", rel:"enemy", b:"saturn" }, { a:"sun", rel:"friend", b:"jupiter" }, { a:"sun", rel:"friend", b:"venus" }, { a:"sun", rel:"friend", b:"mercury" },
    { a:"venus", rel:"friend", b:"jupiter" }, { a:"venus", rel:"friend", b:"mars" }, { a:"venus", rel:"friend", b:"sun" }, { a:"venus", rel:"enemy", b:"saturn" },
    { a:"mercury", rel:"friend", b:"saturn" }, { a:"mercury", rel:"friend", b:"sun" }, { a:"mercury", rel:"enemy", b:"jupiter" }, { a:"mercury", rel:"friend", b:"moon" },
    { a:"moon", rel:"friend", b:"mercury" }, { a:"moon", rel:"enemy", b:"mars" }, { a:"moon", rel:"enemy", b:"saturn" },
  ];
  for (const r of rels) {
    g.registerEdge(`planet:${r.a}`, `${r.rel}_of`, `planet:${r.b}`);
  }
}

/** Register source rules as graph nodes linked to planets and houses */
export function registerSourceRulesInGraph(): void {
  const g = getGraph();
  const rules = getAllRules();
  for (const rule of rules) {
    const id = `rule:${rule.id}`;
    g.registerNode(id, "interpretation", "source_rule", rule.delineation?.slice(0, 100) || rule.themes.join(", "), {
      author: rule.source_author, work: rule.technique, confidence: rule.confidence,
    });
    if (rule.planets) {
      for (const p of rule.planets) g.registerEdge(`planet:${p}`, "has_rule", id);
    }
    if (rule.house) g.registerEdge(`house:${rule.house}`, "referenced_by", id);
    if (rule.sign !== undefined) g.registerEdge(`sign:${["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"][rule.sign]}`, "referenced_by", id);
  }
}

/** Register planet profile data (qualities, activities) as graph nodes */
export function registerPlanetProfilesInGraph(): void {
  const g = getGraph();
  type PlanetProfile = { name: string; qualities: string[]; activities: string[]; colours: string[]; healthy_expression: string[]; distorted_expression: string[]; strengthen_when: string[]; balance_when: string[]; music_features: string[]; scents_or_symbolic_herbs: string[]; daimonic_function: string[] };
  for (const [planet, raw] of Object.entries(PLANET_PROFILES)) {
    const profile = raw as PlanetProfile;
    g.registerNode(`profile:${planet}`, "static", "profile", profile.name);
    for (const q of profile.qualities.slice(0, 5)) {
      const qId = `quality:${q.toLowerCase().replace(/[\s'()-]/g, "_")}`;
      if (!g.getNode(qId)) g.registerNode(qId, "static", "quality", q);
      g.registerEdge(`planet:${planet}`, "has_quality", qId);
    }
    for (const a of profile.activities.slice(0, 4)) {
      const aId = `activity:${a.toLowerCase().replace(/[\s'()-]/g, "_")}`;
      if (!g.getNode(aId)) g.registerNode(aId, "static", "activity", a);
      g.registerEdge(`planet:${planet}`, "recommends_activity", aId);
    }
    for (const c of profile.colours.slice(0, 3)) {
      g.registerEdge(`planet:${planet}`, "suggested_colour", `colour:${c.toLowerCase().replace(/[\s'()-]/g, "_")}`);
    }
  }
}

/** Push dynamic activation data into the graph for a single chart computation */
export function pushActivationToGraph(
  signals: Array<{
    planet: string; score: number; confidence: string;
    condition?: Record<string, any>; timing_sources: string[];
    activated_houses: number[]; activated_lots: string[]; timescales: string[];
  }>,
  themes: Array<{ planet: string; tags: string[]; system: string }>,
  oikodespotes?: string,
  sessionDate?: string,
): void {
  clearSession();
  const g = getGraph();
  const sessionId = sessionDate ? `session:${sessionDate}` : `session:${Date.now()}`;

  // Register session container
  g.registerNode(sessionId, "computation", "session", `Session ${sessionDate || Date.now()}`);

  for (const sig of signals) {
    const pid = `planet:${sig.planet}`;
    const scoreId = `${pid}_score_${sig.score}`;

    // Register score as a quantifiable node
    g.registerNode(scoreId, "computation", "score", `${sig.planet} score ${sig.score}`, {
      score: sig.score, confidence: sig.confidence,
    });
    g.registerEdge(pid, "has_score", scoreId);
    g.registerEdge(sessionId, "contains", scoreId);

    // Register houses activated
    for (const h of sig.activated_houses || []) {
      const houseId = `house:${h}`;
      g.registerEdge(pid, "activates_house", houseId, { score: sig.score });
      g.registerEdge(scoreId, "activates_house", houseId, { score: sig.score });
    }

    // Register lots activated
    for (const lot of sig.activated_lots || []) {
      const lotId = `lot:${lot}`;
      g.registerEdge(pid, "activates_lot", lotId, { score: sig.score });
    }

    // Register timescales
    for (const ts of sig.timescales || []) {
      g.registerEdge(pid, `falls_on`, `timescale:${ts}`, { score: sig.score });
    }

    // Conditions
    if (sig.condition) {
      for (const d of sig.condition.essential_dignity || []) {
        const condId = `condition:${sig.planet}_${d}`;
        if (!g.getNode(condId)) {
          g.registerNode(condId, "computation", "condition", `${sig.planet} ${d}`, { confidence: sig.confidence });
        }
        g.registerEdge(pid, "has_condition", condId, { score: sig.score });
      }
      if (sig.condition.retrograde) {
        const rxId = `condition:${sig.planet}_retrograde`;
        if (!g.getNode(rxId)) g.registerNode(rxId, "computation", "condition", `${sig.planet} retrograde`, { confidence: sig.confidence });
        g.registerEdge(pid, "has_condition", rxId, { score: sig.score });
      }
      if (sig.condition.angularity) {
        const angId = `condition:${sig.planet}_${sig.condition.angularity}`;
        if (!g.getNode(angId)) g.registerNode(angId, "computation", "condition", `${sig.planet} ${sig.condition.angularity}`, { confidence: sig.confidence });
        g.registerEdge(pid, "has_condition", angId, { score: sig.score });
      }
    }

    // Timing sources
    for (const ts of sig.timing_sources) {
      g.registerEdge(pid, "has_timing", `timing:${ts}`, { score: sig.score });
    }
  }

  // Themes
  for (const t of themes) {
    const id = `theme:${t.planet}_${t.system.toLowerCase().replace(/[\s-]/g, "_")}_${Date.now()}`;
    g.registerNode(id, "interpretation", "interpretation", t.tags.join(", "), { system: t.system, tags: t.tags });
    g.registerEdge(`planet:${t.planet}`, "interpreted_by", id);
    g.registerEdge(sessionId, "contains", id);
  }

  // Daimon
  if (oikodespotes) {
    g.registerEdge(`planet:${oikodespotes}`, "is_daimon", `daimon:${oikodespotes}`);
  }
}

/** Query the graph for practices matching current activation + convergence */
export function graphRecommend(
  planet: string,
  convergencePlanets: string[],
  confidence: string,
): Array<{ practiceId: string; reason: string; planet: string }> {
  const g = getGraph();
  const cluster = g.clusterByPlanet(planet);
  const results: Array<{ practiceId: string; reason: string; planet: string }> = [];

  // Get practices for this planet
  const practiceEdges = cluster.edges.filter(e => e.predicate === "practice_for");
  for (const e of practiceEdges) {
    const node = g.getNode(e.subject);
    if (!node) continue;
    const isConverged = convergencePlanets.includes(planet);
    const confidenceLabel = cluster.edges.find(ce => ce.subject === `planet:${planet}` && ce.predicate === "activated_at")?.data?.confidence || "low";
    results.push({
      practiceId: e.object,
      reason: isConverged ? `Converged at ${confidenceLabel} — ${confidence} confidence` : `Active — ${confidence} confidence`,
      planet,
    });
  }
  return results;
}

/** Singleton instance for the application. */
let instance: KnowledgeGraph | null = null;

export function getGraph(): KnowledgeGraph {
  if (!instance) {
    instance = new KnowledgeGraph();
    instance.registerStandardCorrespondences();
    registerStaticEntities();
  }
  return instance;
}

export function resetGraph(): void {
  instance = null;
}
