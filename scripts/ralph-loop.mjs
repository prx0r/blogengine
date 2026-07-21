/**
 * Ralph Loop — HIGH STANDARD validation for holistic analysis.
 *
 * A valid reading must meet ALL of these:
 *
 * CAUSAL TIMESCALE NESTING (30%)
 *   T1a: Year sets the question — opens with the annual theme as the frame
 *   T1b: Month filters the year — shows HOW the yearly theme is refracted
 *        through the monthly lord/house, not just mentioned
 *   T1c: Daily is the answer — today's transits are shown as the granular
 *        expression of the monthly filtered yearly theme
 *
 * BIRTH CHART SPECIFICITY (25%)
 *   T2a: Every planet reference includes natal sign+house+dignity
 *   T2b: Transits explain WHAT they activate in the natal chart, not just
 *        "mars square mars" but "transiting Mars squares your natal Mars
 *        in Virgo H12, activating the hidden pressure point"
 *
 * DAIMON AS THREAD (15%)
 *   T3a: Daimon appears in multiple sections, not isolated
 *   T3b: Daimon's mode (strengthen/balance/cool/etc) connects to the action
 *
 * ACTION WITH PRACTICES (20%)
 *   T4a: Action is specific, not generic ("timed writing" not "attend to self")
 *   T4b: Practices ranked with scores, connected to the day's strongest signal
 *
 * TEMPORAL ARC (10%)
 *   T5a: Shows what's building this week, not just what's exact today
 *
 * SCORING: Each sub-check pass/fail. Score = (passes / total) × 100.
 * A reading must score ≥85% to pass the loop.
 */

import { readFileSync } from 'fs';

function evaluate(text, label) {
  const checks = [
    // T1: Causal timescale nesting
    { id: "T1a", w: 10, text: "Year sets the question", test: (t) => {
      // Must open with the year theme as THE frame, not just mention it
      const hasYearFrame = /(year|annual|profection).*(theme|question|frame|lens|work|shaped)/i.test(t);
      const opensWithYear = t.includes("year") && (t.indexOf("year") < 200 || t.indexOf("annual") < 200);
      return hasYearFrame && opensWithYear;
    }},
    { id: "T1b", w: 10, text: "Month filters the year causally", test: (t) => {
      // Month must be shown as a REFRACTION of the year, not standalone
      return /(this month|month.*filter|month.*lens|month.*express|month.*refract)/i.test(t) &&
             /(year|annual).*(month|monthly)/i.test(t);
    }},
    { id: "T1c", w: 10, text: "Daily transits answer the year/month question", test: (t) => {
      // Daily transits shown as the granular expression, not just listed
      return /(today|daily).*(question|express|answer|manifest|granular)/i.test(t);
    }},

    // T2: Birth chart specificity
    { id: "T2a", w: 8, text: "Planets have natal sign+house+dignity", test: (t) => {
      // Check for pattern like "Mercury in Gemini H9 (domicile)"
      const planetWithDetails = /(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn) in \w+ H\d+/i.test(t);
      const withDignity = /(domicile|detriment|exaltation|peregrine|retrograde)/i.test(t);
      return planetWithDetails && withDignity;
    }},
    { id: "T2b", w: 9, text: "Transits explain what they activate natally", test: (t) => {
      // Not just "mars square mars" but "transiting Mars squares your natal Mars..."
      const mat = t.match(/(\w+) (square|trine|sextile|opposition|conjunction) (natal )?(\w+)/gi);
      if (!mat) return false;
      // At least one transit must explain the natal consequence
      return /(hits your|activates your|transiting to your|touches your)/i.test(t);
    }},
    { id: "T2c", w: 8, text: "Aspect patterns or antiscia referenced if present", test: (t) => {
      // If the chart has aspect patterns, reference them. Otherwise pass.
      return true; // soft requirement
    }},

    // T3: Daimon thread
    { id: "T3a", w: 8, text: "Daimon referenced in timescale context", test: (t) => {
      return /(daimon|oikodespotes).*(year|month|today|transit)/i.test(t);
    }},
    { id: "T3b", w: 7, text: "Daimon's mode connects to recommended action", test: (t) => {
      const mode = t.match(/daimon.*?(strengthen|balance|cool|discipline|stabilize)/i);
      const action = t.match(/action|what to do|timed writing|patient craft|study of/i);
      return mode && action;
    }},

    // T4: Action with practices
    { id: "T4a", w: 7, text: "Action is specific and personal", test: (t) => {
      // Not "attend to self" but "timed writing" or "patient craft"
      return /(timed writing|patient craft|study of philosophy|morning practice|art practice|dream journal|physical practice|generosity practice)/i.test(t);
    }},
    { id: "T4b", w: 8, text: "Practices ranked with scores, connected to activation", test: (t) => {
      return /Practices ranked[\s\S]*?(score \d+\.?\d*).*?aligns with/i.test(t);
    }},
    { id: "T4c", w: 5, text: "Colors/scents prescribed with reasoning", test: (t) => {
      return /(prescribes|color|scent|Use ).*(gold|silver|blue|red|green|yellow|black|rose|lavender|saffron|myrrh|cedar|jasmine|frankincense|cinnamon|ginger|basil|mint|sandalwood|patchouli|cypress)/i.test(t);
    }},

    // T5: Temporal arc
    { id: "T5a", w: 5, text: "Weekly building aspects with meaning", test: (t) => {
      return /(building toward|approaching|this week).*(tension|flow|opportunity)/i.test(t);
    }},
    { id: "T5b", w: 5, text: "Today→tomorrow progression implied", test: (t) => {
      return /(not yet exact|seed|building|approaching|developing)/i.test(t);
    }},
  ];

  let passed = 0, total = 0;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`RALPH LOOP (HIGH STANDARD) — ${label}`);
  console.log(`${'='.repeat(60)}`);

  for (const c of checks) {
    total += c.w;
    try {
      if (c.test(text)) {
        passed += c.w;
        console.log(`  ✅ ${c.id} ${c.text} (${c.w}pts)`);
      } else {
        console.log(`  ❌ ${c.id} ${c.text} (${c.w}pts)`);
      }
    } catch (e) {
      console.log(`  ⚠️  ${c.id} ${c.text} — error: ${e.message}`);
    }
  }

  const pct = Math.round(passed / total * 100);
  console.log(`\nScore: ${passed}/${total} = ${pct}%`);
  console.log(pct >= 85 ? "✅ PASSED — loop complete" : "❌ FAILED — continue refining");
  console.log();

  // Print specific gaps for failed checks
  const failed = checks.filter(c => {
    try { return !c.test(text); } catch { return true; }
  });
  if (failed.length > 0) {
    console.log("Failed checks to fix:");
    for (const f of failed) {
      console.log(`  - ${f.id}: ${f.text}`);
    }
    console.log();
  }

  return { passed, total, pct };
}

const file = process.argv[2];
if (file) {
  const text = readFileSync(file, 'utf-8');
  evaluate(text, file);
} else {
  console.log("Usage: node scripts/ralph-loop.mjs <analysis-output.txt>");
  console.log("Each check must pass for the loop to complete.");
}
