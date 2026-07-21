import OpenAI from "openai";

const OPENCODE_BASE_URL = "https://opencode.ai/zen/go/v1";
const OPENCODE_MODEL = "deepseek-v4-flash";

const HARDCODED_KEY = "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("ai_base_url");
    if (customUrl) return customUrl;
    return "/go/v1";
  }
  return OPENCODE_BASE_URL;
}

function getApiKey(): string {
  if (typeof process !== "undefined" && process.env?.DEEPSEEK_API_KEY) {
    return process.env.DEEPSEEK_API_KEY;
  }
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("deepseek_api_key");
    if (stored) return stored;
  }
  return HARDCODED_KEY;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "API key not set. Set DEEPSEEK_API_KEY env var " +
      "or store it in localStorage as 'deepseek_api_key'.",
    );
  }
  client = new OpenAI({
    baseURL: getBaseUrl(),
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  return client;
}

export function resetClient() {
  client = null;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_SYSTEM = "You are a knowledgeable occult scholar well-versed in Hermetic Qabalah, ceremonial magick, alchemy, and the Western esoteric tradition. Respond with depth, precision, and a touch of wonder.";

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
) {
  const c = getClient();
  const msgs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (options.system) {
    msgs.push({ role: "system", content: options.system });
  } else {
    msgs.push({ role: "system", content: DEFAULT_SYSTEM });
  }
  msgs.push(...messages);

  const res = await c.chat.completions.create({
    model: OPENCODE_MODEL,
    messages: msgs,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  });

  return res.choices[0]?.message?.content ?? "";
}

export async function ask(
  prompt: string,
  options: ChatOptions = {},
) {
  return chat([{ role: "user", content: prompt }], options);
}

export async function streamChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
) {
  const c = getClient();
  const msgs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (options.system) {
    msgs.push({ role: "system", content: options.system });
  } else {
    msgs.push({ role: "system", content: DEFAULT_SYSTEM });
  }
  msgs.push(...messages);

  const stream = await c.chat.completions.create({
    model: OPENCODE_MODEL,
    messages: msgs,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    stream: true,
  });

  return stream;
}
