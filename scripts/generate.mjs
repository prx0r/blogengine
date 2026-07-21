import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const deepseek = new OpenAI({
  baseURL: "https://opencode.ai/zen/go/v1",
  apiKey,
});

const ALGORITHMIC_PROMPT = `You are a curator assembling a reading notebook — a collection of essays extracted from source material. Your task is to produce one or more cohesive essays from the source below.

## STEP 1: DEFINE WHAT IS INTERESTING

A passage is "interesting" if it meets ONE OR MORE of these criteria:

- **C1 — Distinct idea**: Contains a non-obvious, non-trivial claim or argument worth preserving. Not filler, not restatement of common knowledge.
- **C2 — Cross-domain connection**: Reveals a link between disparate domains (e.g., neuroscience and Neoplatonism, thermodynamics and consciousness, AI and philosophy of mind).
- **C3 — Challenges assumption**: Directly contradicts a widely held belief, or exposes a hidden assumption underlying a familiar position.
- **C4 — Explanatory power**: A single passage that illuminates more than its immediate subject — it reframes how you see related questions.
- **C5 — Precision of articulation**: Says something with unusual clarity, concision, or beauty. A formulation worth preserving in the author's exact words.
- **C6 — Generative friction**: A tension, paradox, or unresolved question that opens new lines of inquiry rather than closing them.
- **C7 — Concrete specificity**: An example, analogy, or case-study that embodies a general principle in a vivid, memorable way.

## STEP 2: SCAN AND EXTRACT

Read the source carefully. For each interesting passage you find:
- Preserve it VERBATIM (exact wording, including speaker attribution)
- Tag it with the criterion/criteria from STEP 1 that it satisfies
- Note 1–2 sentences of why it matters, what it connects to, what it implies

## STEP 3: GROUP INTO THEMES

Group the tagged passages by thematic affinity. Each group will become a separate essay. Themes might include (but are not limited to):
- Core metaphysical claims (the One, Nous, Soul, Matter)
- Technology and artifacts (LLMs, statues, instruments)
- Consciousness and its varieties
- Freedom, fate, and moral agency
- Embodiment, embryogenesis, and form
- Comparisons with other traditions (Bergson, Whitehead, Buddhism)
- Historical shifts (ancient vs modern cosmology)

## STEP 4: WEAVE EACH ESSAY

For each thematic group, produce an essay that:

1. **Opens** with a framing paragraph that states the theme and why it matters.
2. **Presents** each selected passage as a verbatim blockquote, clearly attributed.
3. **Connects** passages with your own commentary — 1–3 sentences per gap — explaining how the passages relate, what tension they create, or what they jointly imply.
4. **Closes** with a concluding reflection: what this collection of passages reveals that no single passage says alone.

Constraints:
- Do NOT paraphrase or rewrite the source material. The author's words are the content.
- Your commentary is connective tissue only — contextual, not transformative.
- No filler, no padding, no sycophancy.
- The essay is as long as the material demands. If a theme has 20 passages, the essay is long.
- If multiple distinct themes emerge, produce MULTIPLE essays.

## OUTPUT FORMAT

Return a JSON array. Each element is an essay object:
[
  {
    "title": "A short, precise title for this essay",
    "body": "The full essay text with blockquotes and commentary...",
    "category": "one of: complexity, consciousness, cogsci, dhamma, other"
  },
  ...
]

If only one coherent theme emerges, return an array with a single essay.

SOURCE:
`;

async function main() {
  const sourceFile = process.argv[2];
  if (!sourceFile) {
    console.error("Usage: node scripts/generate.mjs <source-text-file>");
    process.exit(1);
  }

  const sourceText = fs.readFileSync(sourceFile, "utf-8");
  const truncated = sourceText.slice(0, 60000);

  console.log(`Generating essays from: ${sourceFile} (${truncated.length} chars)...`);

  const response = await deepseek.chat.completions.create({
    model: "deepseek-v4-flash",
    max_tokens: 64000,
    messages: [
      { role: "user", content: ALGORITHMIC_PROMPT + truncated },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    console.error("No response content");
    console.error("Response:", JSON.stringify(response, null, 2));
    process.exit(1);
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("No JSON array found in response");
    console.log("Raw response:", content.slice(0, 500));
    process.exit(1);
  }

  const essays = JSON.parse(jsonMatch[0]);
  const outDir = path.resolve(__dirname, "../content/essays");
  const sourceName = path.basename(sourceFile, path.extname(sourceFile));

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    const slug = `${sourceName}-${i + 1}`;
    const filePath = path.join(outDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ ...essay, slug }, null, 2));
    console.log(`  ✓ ${essay.title} → content/essays/${slug}.json`);
  }

  console.log(`\nDone. Generated ${essays.length} essay(s).`);
}

main().catch(console.error);
