import fs from "node:fs";
import path from "node:path";
import { attachOwnChannelEvidence, collectOwnChannelEvidence } from "../src/lib/video-objects/channel-context";
import { compileVideoObject, deriveSearchQueries, pinResearchObject } from "../src/lib/video-objects/compiler";
import {
  analyzeMarketThumbnails,
  commissionModelConfigFromEnv,
  generateCommissionDraft,
  generateDiscoveryLenses,
  visionModelConfigFromEnv,
} from "../src/lib/video-objects/llm";
import { VIDEO_COMMISSION_PROMPT_VERSION } from "../src/lib/video-objects/prompts";
import type {
  CommissionDraft,
  DiscoveryLens,
  MarketSnapshot,
  ResearchObjectLike,
  VideoMode,
} from "../src/lib/video-objects/types";
import { validateCommissionDraft, validateVideoObject } from "../src/lib/video-objects/validate";
import { YouTubeDataClient } from "../src/lib/video-objects/youtube-data";

interface CliArgs {
  ros: string[];
  queries: string[];
  slug?: string;
  mode: VideoMode;
  marketSnapshot?: string;
  draft?: string;
  marketOnly: boolean;
  noQueryPlanner: boolean;
  allowPlaceholderRo: boolean;
  regionCode: string;
  readingRateWpm: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    ros: [],
    queries: [],
    mode: "canon",
    marketOnly: false,
    noQueryPlanner: false,
    allowPlaceholderRo: false,
    regionCode: "US",
    readingRateWpm: 145,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--ro" && value) { args.ros.push(value); index += 1; }
    else if (flag === "--query" && value) { args.queries.push(value); index += 1; }
    else if (flag === "--slug" && value) { args.slug = value; index += 1; }
    else if (flag === "--mode" && (value === "canon" || value === "field")) { args.mode = value; index += 1; }
    else if (flag === "--market-snapshot" && value) { args.marketSnapshot = value; index += 1; }
    else if (flag === "--draft" && value) { args.draft = value; index += 1; }
    else if (flag === "--region" && value) { args.regionCode = value.toUpperCase(); index += 1; }
    else if (flag === "--wpm" && value) { args.readingRateWpm = Number(value); index += 1; }
    else if (flag === "--market-only") args.marketOnly = true;
    else if (flag === "--no-query-planner") args.noQueryPlanner = true;
    else if (flag === "--allow-placeholder-ro") args.allowPlaceholderRo = true;
    else throw new Error(`Unknown or incomplete argument: ${flag}`);
  }
  if (args.ros.length === 0) throw new Error("Provide at least one --ro ro:id or path/to/ro.json.");
  return args;
}

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function allResearchObjectPaths(): string[] {
  const root = path.resolve("content/research-objects");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name, "ro.json"))
    .filter(fs.existsSync);
}

function loadResearchObject(selector: string): { object: ResearchObjectLike; path: string } {
  const direct = path.resolve(selector);
  const candidates = fs.existsSync(direct) ? [direct] : allResearchObjectPaths();
  for (const candidate of candidates) {
    const object = JSON.parse(fs.readFileSync(candidate, "utf8")) as ResearchObjectLike;
    if (fs.existsSync(direct) || object.ro_id === selector) {
      return { object, path: path.relative(process.cwd(), candidate) };
    }
  }
  throw new Error(`Research Object not found: ${selector}`);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8")) as T;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const researchObjects = args.ros.map(loadResearchObject);
  const pins = researchObjects.map(({ object, path: roPath }) => pinResearchObject(object, roPath));
  const usablePassages = pins.reduce((sum, pin) => sum + pin.source_health.usable_passage_count, 0);
  if (usablePassages === 0 && !args.allowPlaceholderRo && !args.marketOnly) {
    throw new Error(
      "These Research Objects contain no extracted source passages. Run with --market-only, improve the ROs, or explicitly use --allow-placeholder-ro for a non-authoritative prototype.",
    );
  }

  const slug = args.slug ?? slugify(researchObjects.map(({ object }) => object.title).join(" "));
  const outputDir = path.resolve("content/video-objects", slug);
  const ros = researchObjects.map(({ object }) => object);
  const seedQueries = deriveSearchQueries(ros, args.queries);
  let commissionConfig: ReturnType<typeof commissionModelConfigFromEnv> | undefined;
  let market: MarketSnapshot;
  if (args.marketSnapshot) {
    market = readJson<MarketSnapshot>(args.marketSnapshot);
  } else {
    let discoveryLenses: DiscoveryLens[];
    if (args.noQueryPlanner) {
      discoveryLenses = seedQueries.map((query) => ({
        query,
        lens: "literal",
        reason: "Deterministic or manually supplied search query; semantic query planning was disabled.",
      }));
    } else {
      commissionConfig = commissionModelConfigFromEnv();
      discoveryLenses = await generateDiscoveryLenses({ ros, seedQueries, config: commissionConfig });
    }
    market = await new YouTubeDataClient(process.env.YOUTUBE_API_KEY ?? "").discoverMarket(
      discoveryLenses.map((lens) => lens.query),
      { regionCode: args.regionCode, discoveryLenses },
    );
    const visionConfig = visionModelConfigFromEnv();
    if (visionConfig) {
      try {
        market = await analyzeMarketThumbnails(market, visionConfig);
      } catch (error: unknown) {
        console.warn(`Thumbnail analysis skipped: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  if (!Array.isArray(market.own_channel_evidence) || market.own_channel_evidence.length === 0) {
    market = attachOwnChannelEvidence(
      market,
      collectOwnChannelEvidence({ excludeVoId: `video:${slug}` }),
    );
  }
  writeJson(path.join(outputDir, "market.json"), market);
  console.log(`Market snapshot: ${path.relative(process.cwd(), path.join(outputDir, "market.json"))}`);
  console.log(`References: ${market.references.length}; breakouts: ${market.references.filter((ref) => ref.breakout.is_breakout).length}`);
  if (args.marketOnly) return;

  let modelName = "manual-draft";
  let draft: CommissionDraft;
  if (args.draft) {
    draft = readJson<CommissionDraft>(args.draft);
  } else {
    const config = commissionConfig ?? commissionModelConfigFromEnv();
    modelName = config.model;
    draft = await generateCommissionDraft({
      slug,
      mode: args.mode,
      ros: researchObjects.map(({ object }) => object),
      market,
      config,
    });
  }
  const draftValidation = validateCommissionDraft(draft);
  for (const warning of draftValidation.warnings) console.warn(`Draft warning: ${warning}`);
  if (draftValidation.errors.length > 0) {
    throw new Error(`Invalid commission draft:\n- ${draftValidation.errors.join("\n- ")}`);
  }
  writeJson(path.join(outputDir, "commission-draft.json"), draft);

  const videoObject = compileVideoObject({
    slug,
    mode: args.mode,
    researchObjects,
    market,
    draft,
    readingRateWpm: args.readingRateWpm,
    generatorModel: modelName,
    promptVersion: VIDEO_COMMISSION_PROMPT_VERSION,
  });
  const validation = validateVideoObject(videoObject);
  for (const warning of validation.warnings) console.warn(`Video Object warning: ${warning}`);
  if (validation.errors.length > 0) {
    throw new Error(`Invalid Video Object:\n- ${validation.errors.join("\n- ")}`);
  }
  writeJson(path.join(outputDir, "video.json"), videoObject);
  console.log(`Video Object: ${path.relative(process.cwd(), path.join(outputDir, "video.json"))}`);
  console.log(`${videoObject.production.word_count} words · ${videoObject.production.estimated_duration_display} at ${args.readingRateWpm} WPM`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
