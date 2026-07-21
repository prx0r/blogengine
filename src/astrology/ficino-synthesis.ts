/**
 * Ficinian Synthesis — Pass 2 in the pipeline.
 *
 * Receives: raw packet data + deterministic output + Pass 1 (Advanced LLM) output + graph practices
 * Produces: Ficinian depth layer + recommended practices
 *
 * Ficino reads everything that came before and adds:
 * - Descent model: source → instrument → daimon → year → month → day
 * - Diagnosis: excess, deficiency, obstruction, wrong-level, mature
 * - Pair-first interpretation
 * - Three-part prescription (sensory, action, contemplation)
 * - Practice recommendations grounded in all preceding analysis
 */

import type { LLMSynthesisInput } from "./llm-synthesis";

export interface FicinianInput extends LLMSynthesisInput {
  /** Output from Pass 1 (Advanced Forecasting LLM) */
  previous_pass_output: string;
  /** Ranked practices from graph */
  graph_practices?: Array<{ label: string; score: number; planet: string }>;
}

export interface FicinianOutput {
  narrative: string;
  recommended_practices: Array<{ label: string; planet: string; reason: string }>;
  action: { what: string; why: string; urgency: string };
  model: string;
}

function formatInput(input: FicinianInput): string {
  const l: string[] = [];
  const bd = input.birth_data;
  l.push("=== NATAL INSTRUMENT ===");
  l.push(`Born: ${bd.year}-${bd.month}-${bd.day} ${bd.hour}:${bd.minute}`);
  l.push(`Ascendant: ${input.ascendant_sign}`);
  for (const [p, d] of Object.entries(input.natal_planets)) {
    l.push(`${p}: ${d.sign} ${d.sign_deg.toFixed(1)}° H${d.house}${d.retrograde ? " Rx" : ""} [${d.dignities.join(", ") || "peregrine"}]`);
  }

  l.push(`\n=== YEAR/MONTH LORDS ===`);
  l.push(`Year lord: ${input.year_lord} (House ${input.year_house})`);
  l.push(`Month lord: ${input.month_lord || "none"} (House ${input.month_house || "none"})`);

  l.push(`\n=== FORTUNE & SPIRIT ===`);
  if (input.lot_positions?.fortune) l.push(`Lot of Fortune: ${input.lot_positions.fortune.sign} H${input.lot_positions.fortune.house}`);
  if (input.lot_positions?.spirit) l.push(`Lot of Spirit: ${input.lot_positions.spirit.sign} H${input.lot_positions.spirit.house}`);
  if (input.oikodespotes) l.push(`Daimon: ${input.oikodespotes.planet} — ${input.oikodespotes.interpretation.slice(0, 80)}`);

  l.push(`\n=== SIGNALS ===`);
  for (const s of input.signals) l.push(`${s.planet}: score=${s.score} sources=${s.timing_sources.slice(0, 3).join(",")} houses=[${s.activated_houses}]`);

  l.push(`\n=== ACTIVATIONS ===`);
  for (const a of input.daily_activations) l.push(a.description);

  l.push(`\n=== PLANET CONDITIONS ===`);
  for (const c of input.planet_conditions) l.push(`${c.planet}: ${c.sign} H${c.house}, [${c.essential_dignity.join(", ") || "peregrine"}], ${c.sect_status}`);

  if (input.graph_practices && input.graph_practices.length > 0) {
    l.push(`\n=== AVAILABLE PRACTICES (from knowledge graph) ===`);
    for (const pr of input.graph_practices.slice(0, 8)) {
      l.push(`${pr.label} (score ${pr.score}) — supports ${pr.planet}`);
    }
  }

  return l.join("\n");
}

const PROMPT = `You are Marsilio Ficino, reading a person's daily astrological configuration. You have been given:

1. RAW DATA — the computed planetary positions, aspects, and conditions
2. DETERMINISTIC ANALYSIS — the engine's structured interpretation
3. PREVIOUS LLM ANALYSIS — an astrologer's reading using modern forecasting technique
4. AVAILABLE PRACTICES — ranked practices from the knowledge graph

Your task is to write the FINAL layer — the Ficinian depth reading.

## YOUR METHOD (from the Ficinian Operating System)

### The Descent
Interpret in this order — each layer modifies the one below:
1. Natal instrument: what is this person's dominant planetary mixture?
2. Daimon: what is the guiding power (oikodespotes)?
3. Annual chapter: what virtue is being built this year?
4. Monthly embodiment: what form does it take this month?
5. Daily trigger: where does it become concrete today?
6. Medicine: what restores proportion?

### Diagnosis
For the dominant configuration, diagnose: deficiency, excess, obstruction, mixture, wrong-level expression, or mature expression.
Then choose: more of the same planet (elevated), a balancing planet, or a complementary practice.

### The Three-Part Prescription
1. Sensory/environmental: one specific color, scent, or sound
2. Concrete action: one real-world act that serves the annual virtue
3. Contemplative return: what this builds toward

### Practice Recommendation
After your reading, recommend 1-3 practices from the AVAILABLE PRACTICES list that align with your diagnosis. For each, state WHY it fits — which planetary power it strengthens, which faculty it serves.

## RULES
- Reference specific data: name houses, orbs, signs, dignities.
- Name the planetary pair before the house.
- Do NOT contradict the deterministic or previous LLM analysis — deepen it.
- You may agree or disagree with the previous LLM, but if you disagree, say why using specific data.
- End with recommended practices from the available list.`;

export async function generateFicinianSynthesis(input: FicinianInput): Promise<FicinianOutput> {
  try {
    const dataBlock = formatInput(input);
    const userPrompt = `RAW ASTROLOGICAL DATA:\n${dataBlock}\n\nPREVIOUS LLM ANALYSIS:\n${input.previous_pass_output}\n\nDETERMINISTIC ANALYSIS:\n${input.deterministic_synthesis}\n\nWrite the Ficinian depth layer. End by recommending 1-3 practices from the AVAILABLE PRACTICES list.`;

    const payload = { model: "deepseek-v4-flash", messages: [{ role: "system", content: PROMPT }, { role: "user", content: userPrompt }], temperature: 0.35, max_tokens: 30000 };
    const body = JSON.stringify(payload);

    const apiKey = typeof localStorage !== "undefined" ? localStorage.getItem("deepseek_api_key") || "" : "";
    const workerUrl = typeof localStorage !== "undefined" ? localStorage.getItem("worker_url") || "" : "";
    const endpoints: { url: string; headers: Record<string, string> }[] = [];
    if (apiKey && workerUrl) {
      const h: Record<string, string> = { "Content-Type": "application/json" };
      h["Authorization"] = `Bearer ${apiKey}`;
      endpoints.push({ url: workerUrl, headers: h });
    }
    endpoints.push({ url: "/api/chat", headers: { "Content-Type": "application/json" } });

    let response: Response | null = null;
    for (const ep of endpoints) {
      try { response = await fetch(ep.url, { method: "POST", headers: ep.headers, body }); if (response.ok) break; } catch { continue; }
    }
    if (!response) throw new Error("All endpoints failed");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract practice recommendations from the content
    const practiceLines: Array<{ label: string; planet: string; reason: string }> = [];
    const practiceSection = content.match(/recommend[^]*?(?:$)/i);
    if (practiceSection) {
      const lines = practiceSection[0].split("\n");
      for (const line of lines) {
        const match = line.match(/["""]?([^""""]+)["""]?\s*(?:\(score \d+\))?\s*(?:—|–|-|supports|for)\s*(\w+)/i);
        if (match && input.graph_practices) {
          const matched = input.graph_practices.find(p => p.label.toLowerCase().includes(match[1].toLowerCase().slice(0, 20)));
          if (matched) practiceLines.push({ label: matched.label, planet: matched.planet, reason: line });
        }
      }
    }

    const actionMatch = content.match(/(?:action|do this|practice):\s*(.+?)(?:\.|$)/i);

    return {
      narrative: content,
      recommended_practices: practiceLines.length > 0 ? practiceLines : [],
      action: { what: actionMatch?.[1]?.trim() || input.deterministic_action.what, why: "Ficinian synthesis.", urgency: input.deterministic_action.urgency },
      model: data.model || "deepseek-v4-flash",
    };
  } catch (e) {
    console.error("Ficinian synthesis failed:", e);
    return { narrative: "", recommended_practices: [], action: input.deterministic_action, model: "deterministic-fallback" };
  }
}
