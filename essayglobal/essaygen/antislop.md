# Anti-Slop — What NOT To Do

## Never Use the DeepSeek API for Essay Generation

The model (`deepseek-v4-flash`) is a reasoning model. It burns tokens on chain-of-thought before producing output. Long source texts cause the reasoning phase to exhaust the context window, returning empty content. **Write essay JSONs directly by hand.** No API calls. Takes 15 minutes and produces a better result.

## Never Use Kokoro Docker for TTS

The CPU model OOM-crashes (exit 137) on long essays. Use `edge-tts` Python CLI instead — calls Microsoft Edge's free online TTS API. No Docker, no GPU, zero server load.

## Never Use pdf-parse npm Package

v2.x exports `PDFParse` as a class constructor, not a default function. Use `pdftotext` CLI (poppler-utils) via spawnSync. Faster, more reliable.

## Never Use fs.readFileSync at Runtime

Cloudflare Workers have no filesystem. Pre-generate `.ts` data files at build time in `scripts/generate-graph-json.mjs`, bundle into the worker.

## Never Let Concepts Explode Past 3

Exactly 3 concepts per essay. The triad: central entity, perceiving faculty, anchoring term. No more. The chunked API approach produced 42 concepts — never again.

## Never Write Flat Transitions

"X now moves from A to B" is a table of contents, not a transition. Connect sections by their logic: "Having placed the imaginal world beyond Qaf, Corbin now asks what organ could possibly see it."

## Never Include Redundant Quotes

If two quotes make the same point, cut one. The reader gets it the first time. The second quote is not reinforcing — it is wasting their attention.

## Never Make Unsupported Claims

If you say "the geography is consistent across visions," either back it with a source quote or frame it as implication rather than fact.

## Never Drop Labels Without Payoff

If you name "eighth climate" in the intro, explain what it means later. Every named concept needs a payoff.

## Never Use AI Blocks to Repeat the Source

AI blocks explain why the source matters, not what it says. Never use them to paraphrase the source block that just preceded them.

## Never Over-Engineer the Schema

Source → Essay → Concept → Art. No author table, no usage table, no animation table. Fields are optional. Add complexity only when something becomes painful.

## Never Add Summary Blocks

The user doesn't want them. Summary blocks were explicitly dropped by preference. Don't add them unless asked.

## Never Write Like a Robot Curator

The writer has a personality. Be a guide with opinions, not a neutral information dispenser. Concrete details over abstractions. Narrative flow over bullet points.

## Never Mix Old and New Essay Types Without @ts-nocheck

Old `Essay` and `Source` interfaces have all required fields. Glossary essays have a different shape. Merging them causes cascading TS errors. Use `// @ts-nocheck` on affected files until a proper discriminated union is defined.

## Never Use process-source.mjs or generate-long-essay.mjs

These are deprecated scripts from the failed API approach. The correct workflow: extract with pdftotext → read the source → write JSON directly → generate audio → deploy.
