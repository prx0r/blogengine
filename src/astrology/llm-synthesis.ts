/**
 * LLM Synthesis Layer — sits on top of the deterministic engine.
 *
 * Takes the raw ActivationPacket + deterministic synthesis output,
 * formats them into a structured prompt, and calls an LLM to produce
 * a narrative at gold-standard quality.
 *
 * The LLM is constrained to only reference data present in the packet.
 * The deterministic output serves as a reference/fallback.
 *
 * Architecture:
 *   Engine → ActivationPacket + deterministic synthesis
 *     → LLMPromptBuilder
 *       → /api/chat (DeepSeek)
 *         → LLMNarrative
 *           → displays in UI with "LLM" badge
 */

export interface LLMSynthesisInput {
  /** Raw activation data */
  signals: Array<{ planet: string; score: number; confidence: string; timing_sources: string[]; activated_houses: number[]; activated_lots: string[]; timescales: string[] }>;
  planet_conditions: Array<{ planet: string; sign: string; house: number; angularity: string; essential_dignity: string[]; retrograde: boolean; sect_status: string }>;
  /** Birth chart basics */
  birth_data: { year: number; month: number; day: number; hour: number; minute: number; lat: number; lon: number; name: string };
  ascendant_sign: string;
  /** Natal positions */
  natal_planets: Record<string, { sign: string; sign_deg: number; house: number; retrograde: boolean; dignities: string[] }>;
  /** Today's activations */
  daily_activations: Array<{ description: string; source: string }>;
  weekly_activations: Array<{ description: string; source: string }>;
  /** Timescales */
  year_lord: string;
  year_house: number;
  month_lord: string;
  month_house: number;
  /** Daimon */
  oikodespotes?: { planet: string; name: string; score: number; interpretation: string; soul_choice?: string };
  /** Convergence */
  convergence_planets: string[];
  /** Fortune/Spirit */
  dominant_mode: string;
  /** Lot positions for Fortune and Spirit */
  lot_positions?: { fortune?: { sign: string; house: number }; spirit?: { sign: string; house: number } };
  /** Natal promise */
  natal_promise?: {
    strongest_planet?: { planet: string; reason: string };
    most_afflicted?: { planet: string; reason: string };
    element_predominance: Array<{ element: string; percentage: number }>;
  };
  /** Aspect patterns */
  aspect_patterns: Array<{ type: string; planets: string[]; description: string }>;
  /** Valens combinations */
  valens_combinations: Array<{ planets: string[]; themes: string[]; opportunities: string[]; pressures: string[] }>;
  /** Ranked practices from deterministic ranking */
  ranked_practices?: Array<{ label: string; score: number; planet: string }>;
  /** Dieterministic synthesis text */
  deterministic_synthesis: string;
  /** Deterministic action */
  deterministic_action: { what: string; why: string; urgency: string };
}

export interface LLMSynthesisOutput {
  narrative: string;
  action: { what: string; why: string; urgency: string };
  model: string;
}

/**
 * Format the input data into a structured text block for the LLM.
 * Every piece of data is labeled so the LLM can reference it specifically.
 */
function formatPacketForPrompt(input: LLMSynthesisInput): string {
  const lines: string[] = [];
  lines.push("=== BIRTH DATA ===");
  const bd = input.birth_data;
  lines.push(`Born: ${bd.year}-${bd.month}-${bd.day} ${bd.hour}:${bd.minute}, ${bd.lat}°N ${bd.lon}°W`);
  lines.push(`Ascendant: ${input.ascendant_sign}`);

  lines.push(`\n=== NATAL PLANETS ===`);
  for (const [p, data] of Object.entries(input.natal_planets)) {
    const d = data.dignities.length ? data.dignities.join(", ") : "peregrine";
    lines.push(`${p}: ${data.sign} ${data.sign_deg.toFixed(1)}° H${data.house}${data.retrograde ? " Rx" : ""} [${d}]`);
  }

  lines.push(`\n=== TODAY'S SIGNALS (sorted by strength) ===`);
  for (const sig of input.signals) {
    lines.push(`${sig.planet}: score=${sig.score} confidence=${sig.confidence} sources=${sig.timing_sources.join(",")} houses=[${sig.activated_houses}] lots=[${sig.activated_lots}]`);
  }

  lines.push(`\n=== TODAY'S ACTIVATIONS ===`);
  for (const act of input.daily_activations) {
    lines.push(`${act.description} (${act.source})`);
  }

  if (input.weekly_activations.length > 0) {
    lines.push(`\n=== WEEKLY BUILDING ===`);
    for (const act of input.weekly_activations) {
      lines.push(`${act.description} (${act.source})`);
    }
  }

  lines.push(`\n=== TIMING LORDS ===`);
  lines.push(`Year lord: ${input.year_lord} (House ${input.year_house})`);
  lines.push(`Month lord: ${input.month_lord} (House ${input.month_house})`);

  lines.push(`\n=== PLANET CONDITIONS ===`);
  for (const c of input.planet_conditions) {
    lines.push(`${c.planet}: ${c.sign} H${c.house}, ${c.angularity}, dignities: [${c.essential_dignity.join(", ") || "peregrine"}], ${c.retrograde ? "Rx" : ""}, ${c.sect_status}`);
  }

  if (input.oikodespotes) {
    lines.push(`\n=== DAIMON (OIKODESPOTES) ===`);
    lines.push(`Planet: ${input.oikodespotes.planet}`);
    lines.push(`Score: ${input.oikodespotes.score}`);
    lines.push(`Interpretation: ${input.oikodespotes.interpretation}`);
    if (input.oikodespotes.soul_choice) lines.push(`Soul choice: ${input.oikodespotes.soul_choice}`);
  }

  lines.push(`\n=== FORTUNE/SPIRIT ===`);
  lines.push(`Mode: ${input.dominant_mode}`);
  if (input.lot_positions?.fortune) {
    lines.push(`Lot of Fortune: ${input.lot_positions.fortune.sign} H${input.lot_positions.fortune.house}`);
  }
  if (input.lot_positions?.spirit) {
    lines.push(`Lot of Spirit: ${input.lot_positions.spirit.sign} H${input.lot_positions.spirit.house}`);
  }

  lines.push(`\n=== CONVERGENCE ===`);
  lines.push(`Planets flagged by 3+ interpreters: ${input.convergence_planets.join(", ") || "none"}`);

  if (input.natal_promise) {
    lines.push(`\n=== NATAL PROMISE ===`);
    if (input.natal_promise.strongest_planet) lines.push(`Strongest: ${input.natal_promise.strongest_planet.planet} (${input.natal_promise.strongest_planet.reason})`);
    if (input.natal_promise.most_afflicted) lines.push(`Most afflicted: ${input.natal_promise.most_afflicted.planet} (${input.natal_promise.most_afflicted.reason})`);
    lines.push(`Elements: ${input.natal_promise.element_predominance.map(e => `${e.element} ${e.percentage}%`).join(", ")}`);
  }

  if (input.aspect_patterns.length > 0) {
    lines.push(`\n=== NATAL ASPECT PATTERNS ===`);
    for (const ap of input.aspect_patterns) {
      lines.push(`${ap.type}: ${ap.planets.join(", ")} — ${ap.description}`);
    }
  }

  if (input.valens_combinations.length > 0) {
    lines.push(`\n=== VALENS PAIRS ===`);
    for (const vc of input.valens_combinations.slice(0, 5)) {
      lines.push(`${vc.planets.join(" + ")}: ${vc.themes.slice(0, 2).join("; ")}`);
    }
  }

  if (input.ranked_practices && input.ranked_practices.length > 0) {
    lines.push(`\n=== RANKED PRACTICES ===`);
    for (const pr of input.ranked_practices.slice(0, 5)) {
      lines.push(`${pr.label} (score ${pr.score}) — supports ${pr.planet}`);
    }
  }

  return lines.join("\n");
}

/**
 * Build the system prompt — adapted from "Advanced Astrological Forecasting Guide"
 * and Hellenistic technique sources.
 */
function buildSystemPrompt(): string {
  return `You are an astrologer writing a daily reading. You combine Hellenistic timing techniques with the forecasting framework from the Advanced Astrological Forecasting Guide.

## THE FORECASTING STACK (hierarchy)
Interpret in layers: Year (the chapter) → Month (the focus) → Week (the arc) → Day (the trigger). A daily aspect cannot be interpreted until you know the larger chapter it serves. The master equation: "This is a year of [theme] because [technique]. This month [filter]. This week [arc]. Today [trigger]. That action advances the year's goal."

## THREE FILTERS for every factor
1. **Activation**: Is this planet/house/topic emphasized by yearly or monthly timing?
2. **Intensity**: How tight, repeated, or multiply-confirmed is the configuration?
3. **Relevance**: Does it connect to the person's actual commitments and choices?

## HELLENISTIC TECHNIQUES (computed in the data)
- **SECT**: Day chart = Sun, Jupiter, Saturn "in sect" (favored). Moon, Venus, Mars work against grain.
- **LOT RULERSHIP**: Lot of Fortune is ruled by its domicile lord. The lord's condition qualifies the Lot.
- **ORBS**: Under 1° = partile (active event). Under 3° = tight (clearly felt). Under 6° = moderate.
- **PROFECTION**: Ascendant moves one sign per year. Lord of that sign rules the year. Monthly sub-profection nests inside.
- **CONVERGENCE**: When multiple techniques point at the same planet, say so explicitly.

## ASPECT GRAMMAR — the five-part aspect sentence
Every interpretation is a sentence where both planets remain alive. Use the pattern:
[Transiting planet] [action verb] [natal planet/house] [quality] [context].
Example: "Saturn presses Mercury into a more rigorous form — structure meeting the mind."
- **Sextile**: available connection that benefits from participation. Advice begins with a verb: contact, submit, coordinate, learn.
- **Trine**: lower-friction flow or reinforcement. Advice: leverage, consolidate, create.
- **Square**: generates work through incompatible demands. Mature response: construction.
- **Opposition**: externalizes through others. Mature response: relationship and perspective.

## PLANETARY VERBS (use verbs before nouns)
- Sun: present, lead, express, clarify, center
- Moon: respond, nurture, attune, feel, protect
- Mercury: communicate, write, revise, question, connect
- Venus: relate, beautify, harmonize, value, choose
- Mars: initiate, assert, cut, pursue, defend
- Jupiter: expand, teach, grow, publish, advise
- Saturn: structure, commit, delay, limit, master

## CONDITION modifies capacity
Translate dignity into plain language: supported, pressured, hidden, delayed, unstable, resourced, conflicted.

## DAILY READING TEMPLATE
Structure your reading as:
1. **Year frame**: "This is a year of X because [technique]. Today's transits serve this."
2. **Month filter**: How the monthly profection/lord focuses the year.
3. **Today's landscape**: The top configurations by intensity, using aspect grammar.
   - Separate PERSONAL transits (hit natal planets) from COLLECTIVE (sky aspects).
   - Name specific orbs, natal targets, dignities.
4. **What this means for YOU**: Connect to the person's natal chart specifically.
5. **Daimon/purpose thread**: How the personal daimon (oikodespotes) is involved.
6. **Recommended action**: Specific, actionable. Uses a verb. References data.

## RULES
- ONLY reference data explicitly present in the packet below.
- EVERY claim must trace to a specific data point (orb, house, sign, dignity, source).
- Do NOT add generic planet descriptions.
- Do NOT mention Zodiacal Releasing, bounds, or techniques NOT in the data.
- Name specific orbs, degrees, houses, signs.
- End with a specific recommended action referencing the data.`;  
}

/**
 * Call the LLM to produce the synthesis.
 * Uses multi-endpoint strategy matching spells tab pattern:
 * 1. opencode-proxy worker (primary, with API key from localStorage)
 * 2. /api/chat (fallback, server-side)
 * Falls back to deterministic if all fail.
 */
export async function generateLLMSynthesis(input: LLMSynthesisInput): Promise<LLMSynthesisOutput> {
  try {
    const dataBlock = formatPacketForPrompt(input);
    const systemPrompt = buildSystemPrompt();
    const userPrompt = `Here is the computed astrological data for a daily reading.\n\n${dataBlock}\n\nWrite a cohesive daily reading using the Hellenistic techniques described. Ground every claim in specific data from the packet. End with a recommended action.`;

    const payload = {
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 30000,
    };
    const body = JSON.stringify(payload);

    // Multi-endpoint: try proxy first (requires API key), then /api/chat (server-side)
    const apiKey = typeof localStorage !== "undefined" ? localStorage.getItem("deepseek_api_key") || "" : "";
    const workerUrl = typeof localStorage !== "undefined"
      ? localStorage.getItem("worker_url") || ""
      : "";

    const endpoints: { url: string; headers: Record<string, string> }[] = [];
    // Only try proxy if API key is set
    if (apiKey && workerUrl) {
      endpoints.push({ url: workerUrl, headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` } });
    }
    // /api/chat is always available (same-origin, hardcoded fallback key)
    endpoints.push({ url: "/api/chat", headers: { "Content-Type": "application/json" } });

    let response: Response | null = null;
    for (const ep of endpoints) {
      try {
        response = await fetch(ep.url, { method: "POST", headers: ep.headers, body });
        if (response.ok) break;
      } catch { continue; }
    }

    if (!response) throw new Error("All endpoints failed");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const actionMatch = content.match(/(?:action|recommend|do this?):\s*(.+?)(?:\.|$)/i);

    return {
      narrative: content,
      action: { what: actionMatch?.[1]?.trim() || input.deterministic_action.what, why: "LLM synthesis of full packet data.", urgency: input.deterministic_action.urgency },
      model: data.model || "deepseek-v4-flash",
    };
  } catch (e) {
    console.error("LLM synthesis failed, using deterministic fallback:", e);
    return { narrative: input.deterministic_synthesis, action: input.deterministic_action, model: "deterministic-fallback" };
  }
}
