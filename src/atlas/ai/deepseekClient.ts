// Uses opencode Go API (deepseek-v4-flash) via OpenAI-compatible endpoint
// Pattern from src/lib/ai.ts and src/app/api/chat/route.ts

const OPENCODE_BASE_URL = "https://opencode.ai/zen/go/v1";
const OPENCODE_MODEL = "deepseek-v4-flash";
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

interface DeepSeekResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function getDeepSeekClient() {
  return new DeepSeekClient();
}

class DeepSeekClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries = 2;

  constructor() {
    this.baseUrl = OPENCODE_BASE_URL;
    this.apiKey = API_KEY;
  }

  async chat(
    messages: DeepSeekMessage[],
    options: DeepSeekOptions = {}
  ): Promise<DeepSeekResponse> {
    const { temperature = 0.3, maxTokens = 1024, jsonMode = false } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((r) => setTimeout(r, delay));
      }

      try {
        return await this.executeChat(messages, temperature, maxTokens, jsonMode);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          // Only retry on transient failures (timeout, empty response, 5xx)
          const msg = lastError.message;
          const isTransient =
            msg.includes("timeout") ||
            msg.includes("Empty response") ||
            msg.includes("Unexpected end of JSON input") ||
            msg.includes("Raw response length: 0");
          if (!isTransient) throw lastError;
        }
      }
    }

    throw lastError ?? new Error("Chat failed after retries");
  }

  private async executeChat(
    messages: DeepSeekMessage[],
    temperature: number,
    maxTokens: number,
    jsonMode: boolean
  ): Promise<DeepSeekResponse> {
    const body: Record<string, unknown> = {
      model: OPENCODE_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const timeoutMs = 90000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        throw new Error(`OpenCode API timeout after ${timeoutMs / 1000}s`);
      }
      throw fetchErr;
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(`OpenCode API error (${res.status}): ${errorText}`);
      throw new Error(`OpenCode API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();

    const content = data.choices?.[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      console.error("OpenCode API response missing content:", JSON.stringify(data).slice(0, 500));
      throw new Error("Empty response from OpenCode API");
    }

    return {
      content,
      model: data.model ?? "unknown",
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  async classifyJson<T>(
    systemPrompt: string,
    userInput: string
  ): Promise<T> {
    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      { jsonMode: true, temperature: 0.1, maxTokens: 2048 }
    );

    const cleaned = response.content.trim();
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const toParse = jsonMatch ? jsonMatch[0] : cleaned;

    try {
      return JSON.parse(toParse) as T;
    } catch (err) {
      const errorInfo = err instanceof Error ? err.message : "Unknown error";
      console.error("JSON parse error on response:", errorInfo);
      console.error("Raw response length:", cleaned.length);
      console.error("Raw response preview:", cleaned.slice(0, 500));
      throw new Error(
        `Failed to parse JSON response (${errorInfo}): ${cleaned.slice(0, 300)}`
      );
    }
  }
}

export { DeepSeekClient };
export type { DeepSeekMessage, DeepSeekOptions, DeepSeekResponse };
