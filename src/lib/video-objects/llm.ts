import OpenAI from "openai";
import { buildCommissionPrompt } from "./prompts";
import type {
  CommissionDraft,
  DiscoveryLens,
  MarketSnapshot,
  ResearchObjectLike,
  VideoMode,
} from "./types";

export interface CommissionModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export type VisionModelConfig = CommissionModelConfig;

const DISCOVERY_LENS_TYPES = new Set<DiscoveryLens["lens"]>([
  "literal",
  "human_question",
  "historical_case",
  "mechanism",
  "adjacent_audience",
  "misconception",
]);

function cloudflareBaseUrl(): string | null {
  const accountId = process.env.CF_ACCOUNT_ID;
  return accountId ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions` : null;
}

function cloudflareApiKey(): string | null {
  return process.env.CF_API_TOKEN ?? null;
}

export function commissionModelConfigFromEnv(): CommissionModelConfig {
  const cfBase = cloudflareBaseUrl();
  const cfKey = cloudflareApiKey();
  const apiKey = process.env.VIDEO_LLM_API_KEY ?? process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY ?? cfKey ?? "";
  if (!apiKey) {
    throw new Error("Set VIDEO_LLM_API_KEY, CF_API_TOKEN, DEEPSEEK_API_KEY, or OPENAI_API_KEY to generate a commission.");
  }
  return {
    apiKey,
    baseURL: process.env.VIDEO_LLM_BASE_URL ?? process.env.OPENAI_BASE_URL ?? cfBase ?? "https://opencode.ai/zen/go/v1",
    model: process.env.VIDEO_LLM_MODEL ?? (cfBase ? "@cf/meta/llama-3.1-8b-instruct-fp8-fast" : "deepseek-v4-flash"),
  };
}

export function visionModelConfigFromEnv(): VisionModelConfig | null {
  const videoVisionKey = process.env.VIDEO_VISION_API_KEY ?? "";
  const cfKey = cloudflareApiKey();
  const apiKey = videoVisionKey || cfKey || "";
  if (!apiKey) return null;
  const cfBase = cloudflareBaseUrl();
  const model = process.env.VIDEO_VISION_MODEL ?? (cfBase ? "@cf/meta/llama-3.2-11b-vision-instruct" : "");
  if (!model) throw new Error("VIDEO_VISION_MODEL is required when VIDEO_VISION_API_KEY is set.");
  return {
    apiKey,
    baseURL: process.env.VIDEO_VISION_BASE_URL ?? process.env.VIDEO_LLM_BASE_URL ?? cfBase ?? "https://api.openai.com/v1",
    model,
  };
}

export function parseJsonObject<T>(raw: string): T {
  const unfenced = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model response did not contain a JSON object.");
  return JSON.parse(unfenced.slice(start, end + 1)) as T;
}

function cleanString(value: unknown, maxLength = 300): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, maxLength) : null;
}

export async function generateDiscoveryLenses(input: {
  ros: ResearchObjectLike[];
  seedQueries: string[];
  config: CommissionModelConfig;
}): Promise<DiscoveryLens[]> {
  const client = new OpenAI({ apiKey: input.config.apiKey, baseURL: input.config.baseURL });
  const research = input.ros.map((ro) => ({
    ro_id: ro.ro_id,
    title: ro.title,
    one_line: ro.summary?.one_line,
    scope: ro.summary?.scope,
    traditions: ro.summary?.traditions ?? [],
    topics: [...new Set((ro.body ?? []).flatMap((passage) => passage.topics ?? []))].slice(0, 12),
  }));
  const response = await client.chat.completions.create({
    model: input.config.model,
    temperature: 0.25,
    max_tokens: 2200,
    messages: [
      {
        role: "system",
        content: "You translate specialist research into rigorous YouTube discovery queries. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Create 4-6 search lenses for finding unusually successful adjacent YouTube videos that could inform how this research is commissioned.

The specialist term itself may have weak discoverability. Translate it into universal human questions, historical cases, mechanisms, adjacent audiences, and common misconceptions. Queries must describe existing viewer interests, not proposed titles for our film. Keep every query concise and meaningfully different. Do not invent facts about the research.

Return exactly:
{"lenses":[{"query":"string","lens":"literal | human_question | historical_case | mechanism | adjacent_audience | misconception","reason":"string"}]}

RESEARCH:
${JSON.stringify(research, null, 2)}

SEED QUERIES (use only when useful):
${JSON.stringify(input.seedQueries, null, 2)}`,
      },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Discovery planner returned no content.");
  const parsed = parseJsonObject<{ lenses?: Array<Partial<DiscoveryLens>> }>(content);
  const lenses: DiscoveryLens[] = [];
  const seen = new Set<string>();
  for (const candidate of parsed.lenses ?? []) {
    const query = cleanString(candidate.query, 120);
    const reason = cleanString(candidate.reason, 300);
    const lens = candidate.lens;
    if (!query || !reason || !lens || !DISCOVERY_LENS_TYPES.has(lens)) continue;
    const key = query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    lenses.push({ query, lens, reason });
    if (lenses.length === 6) break;
  }
  for (const seed of input.seedQueries) {
    const query = cleanString(seed, 120);
    if (!query || seen.has(query.toLowerCase()) || lenses.length >= 4) continue;
    seen.add(query.toLowerCase());
    lenses.push({ query, lens: "literal", reason: "Deterministic or manually supplied fallback query." });
  }
  if (lenses.length === 0) throw new Error("Discovery planner returned no usable search lenses.");
  return lenses;
}

interface ThumbnailAnalysisResponse {
  analyses?: Array<{
    video_id?: unknown;
    focal_subject?: unknown;
    visible_text?: unknown;
    composition?: unknown;
    contrast?: unknown;
    argument?: unknown;
  }>;
}

export async function analyzeMarketThumbnails(
  market: MarketSnapshot,
  config: VisionModelConfig,
): Promise<MarketSnapshot> {
  const references = market.references.filter((reference) => reference.thumbnail_url).slice(0, 8);
  if (references.length === 0) return market;
  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "low" } }
  > = [{
    type: "text",
    text: `Analyze these YouTube thumbnails as packaging evidence. Describe only what is visibly present. "argument" means the visual promise or tension created by the image, not whether the video is true. Do not infer success from the image; performance data is handled separately. Return valid JSON only:
{"analyses":[{"video_id":"string","focal_subject":"string or null","visible_text":"string or null","composition":"string or null","contrast":"string or null","argument":"string or null"}]}`,
  }];
  for (const reference of references) {
    content.push({ type: "text", text: `video_id: ${reference.video_id}; title: ${reference.title}` });
    content.push({ type: "image_url", image_url: { url: reference.thumbnail_url, detail: "low" } });
  }

  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
  const response = await client.chat.completions.create({
    model: config.model,
    temperature: 0.1,
    max_tokens: 3000,
    messages: [
      { role: "system", content: "You are a precise visual packaging analyst. Return valid JSON only." },
      { role: "user", content },
    ],
  });
  const responseContent = response.choices[0]?.message?.content;
  if (!responseContent) throw new Error("Thumbnail vision model returned no content.");
  const parsed = parseJsonObject<ThumbnailAnalysisResponse>(responseContent);
  const byVideo = new Map(
    (parsed.analyses ?? []).flatMap((analysis) => {
      const videoId = cleanString(analysis.video_id, 64);
      return videoId ? [[videoId, analysis] as const] : [];
    }),
  );
  const analyzedIds = new Set<string>();
  const updatedReferences = market.references.map((reference) => {
    const analysis = byVideo.get(reference.video_id);
    if (!analysis) return reference;
    analyzedIds.add(reference.video_id);
    return {
      ...reference,
      thumbnail_analysis: {
        status: "analyzed" as const,
        focal_subject: cleanString(analysis.focal_subject),
        visible_text: cleanString(analysis.visible_text),
        composition: cleanString(analysis.composition),
        contrast: cleanString(analysis.contrast),
        argument: cleanString(analysis.argument),
        model: config.model,
      },
    };
  });
  return {
    ...market,
    references: updatedReferences,
    notes: [
      ...market.notes,
      `A vision model inspected ${analyzedIds.size} of ${references.length} supplied thumbnails; references marked not_analyzed were not visually interpreted.`,
    ],
  };
}

export async function generateCommissionDraft(input: {
  slug: string;
  mode: VideoMode;
  ros: ResearchObjectLike[];
  market: MarketSnapshot;
  config: CommissionModelConfig;
}): Promise<CommissionDraft> {
  const client = new OpenAI({ apiKey: input.config.apiKey, baseURL: input.config.baseURL });
  const response = await client.chat.completions.create({
    model: input.config.model,
    temperature: 0.35,
    max_tokens: 32000,
    messages: [
      {
        role: "system",
        content: "You are a rigorous commissioning editor. Return valid JSON only and never invent evidence or analytics.",
      },
      {
        role: "user",
        content: buildCommissionPrompt({ slug: input.slug, mode: input.mode, ros: input.ros, market: input.market }),
      },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Commission model returned no content.");
  return parseJsonObject<CommissionDraft>(content);
}
