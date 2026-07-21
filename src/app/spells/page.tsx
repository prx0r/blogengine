"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import picatrixData from "@/data/picatrix.json";

interface Chunk {
  book: number;
  chapter: number;
  title: string;
  content: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHUNKS = picatrixData as Chunk[];

const SYNONYM_MAP: Record<string, string[]> = {
  money: ["money", "wealth", "riches", "fortune", "prosperity", "gold", "treasure", "gain", "affluence"],
  love: ["love", "desire", "lust", "attraction", "affection", "beauty", "romance", "marriage", "sex"],
  protection: ["protection", "defense", "shield", "safety", "guard", "ward", "banish", "bind"],
  health: ["health", "heal", "cure", "sickness", "disease", "body", "medicine", "life"],
  wisdom: ["wisdom", "knowledge", "truth", "vision", "insight", "prophecy", "dream", "divination"],
  power: ["power", "strength", "authority", "victory", "honor", "glory", "dominion", "influence"],
};

function findRelevantChunks(query: string, topK: number = 3): Chunk[] {
  const queryLower = query.toLowerCase();
  const rawTerms = queryLower.split(/\s+/).filter((t) => t.length > 3);
  const terms = new Set(rawTerms);

  for (const [, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.some((s) => queryLower.includes(s))) {
      synonyms.forEach((s) => terms.add(s));
    }
  }

  const scored = CHUNKS.map((chunk) => {
    const lower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const countInContent = (lower.match(new RegExp(term, "g")) || []).length;
      const countInTitle = (titleLower.match(new RegExp(term, "g")) || []).length;
      score += countInContent * 1 + countInTitle * 5;
    }
    score += chunk.chapter > 0 ? 0.1 : 0;
    return { chunk, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

function buildPrompt(query: string, chunks: Chunk[]): string {
  const context = chunks
    .map(
      (c) =>
        `[Book ${c.book}, Chapter ${c.chapter}] ${c.title}\n${c.content.slice(0, 1000)}`,
    )
    .join("\n\n---\n\n");

  return `You are a master of astrological magic trained in the Picatrix. A user desires the following outcome:

"${query}"

Search the following passages from the Picatrix (Liber Atratus, tr. Greer & Warnock) and find any relevant spells, rituals, or magical operations.

${context}

If you find relevant material, format your response with these sections:

**Spell Name** — A title for the operation

**Desired Outcome** — Restate what this spell accomplishes

**Source** — Book and chapter reference

**Planet & Astrological Timing** — Planetary ruler, day/hour, or astrological conditions required

**Materials Needed** — Suffumigations, images, metals, herbs, etc.

**Procedure** — Step-by-step instructions

**Incantation / Prayer** — Any words to be spoken (if present)

**Warnings** — Any cautions from the text

If you find NO relevant material in the provided passages, say so honestly and suggest which chapter might contain what they need. Do NOT invent spells that are not in the text.`;
}

export default function SpellsPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I have the Picatrix (Liber Atratus, Books I–IV, tr. Greer & Warnock). Describe the outcome you desire — love, protection, insight, prosperity, or anything else — and I'll search for relevant spells and operations.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("sk-7dtUVBKJrJcglO9WzdLQZJXwNuz1MucUrDQCZxJjJaH29Q8CqT357DSeFyHV4B75");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("deepseek_api_key");
    if (stored) setApiKey(stored);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const chunks = findRelevantChunks(userMsg);
      const prompt = buildPrompt(userMsg, chunks);

      const payload = {
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable occult scholar specializing in the Picatrix and astrological magic. Respond with precision and depth. Answer directly — the user doesn't need to see your reasoning process.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 8192,
      };
      const body = JSON.stringify(payload);

      const workerUrl = localStorage.getItem("worker_url") || "https://opencode-proxy.tradesprior.workers.dev/chat/completions";
      const proxyUrl = localStorage.getItem("proxy_url");
      const endpoints: { url: string; headers: Record<string, string> }[] = [
        { url: workerUrl, headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` } },
        { url: "/api/chat", headers: { "Content-Type": "application/json" } },
      ];
      if (proxyUrl) endpoints.unshift({ url: proxyUrl, headers: { "Content-Type": "application/json" } });

      let response = null;
      for (const { url, headers } of endpoints) {
        try {
          response = await fetch(url, {
            method: "POST",
            headers,
            body,
          });
          if (response.ok) break;
        } catch {}
      }

      if (!response) throw new Error("NetworkError");
      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.error?.message || `API error ${response.status}`;
        throw new Error(errMsg);
      }
      const content = data.choices?.[0]?.message?.content || "";
      const reply = content || "The oracle is thinking deeply... try again with a more specific question.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const isCors = err.message?.includes("NetworkError") || err.message?.includes("Failed to fetch");
      const msg = isCors
        ? "Need a proxy. Pick one:\n\n**Cloudflare Worker (live):** `localStorage.setItem(\"worker_url\", \"https://opencode-proxy.tradesprior.workers.dev/chat/completions\")`\n\n**Run locally:** `npm run proxy` then set:\n`localStorage.setItem(\"proxy_url\", \"http://YOUR_SERVER_IP:3456/api/chat\")`\n\n**Deploy to Vercel:** `npx vercel --prod`"
        : `Error: ${err.message || "Failed to consult the Picatrix."}`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: msg },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function saveKey() {
    localStorage.setItem("deepseek_api_key", apiKey);
    setShowKeyInput(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 flex flex-col min-h-screen">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">Grimoire</p>
        <h1 className="text-2xl font-bold mb-2">Spells</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Consult the Picatrix (Liber Atratus, Books I–IV). Describe your desired outcome and
          the grimoire will search for relevant operations.
        </p>
      </section>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-zinc-700 text-zinc-200"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-300"
              }`}
            >
              {renderMessage(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl px-4 py-3 bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-sm">
              Consulting the Picatrix...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showKeyInput && (
        <div className="mb-4 p-4 rounded-xl border border-zinc-700 bg-zinc-900/80">
          <p className="text-xs text-zinc-400 mb-2">Set your DeepSeek API key to search the Picatrix:</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              onClick={saveKey}
              disabled={!apiKey.trim()}
              className="text-sm bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your desired outcome..."
          disabled={loading}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 px-5 py-3 rounded-xl text-sm transition-colors font-medium"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}

function renderMessage(content: string) {
  const sections = content.split(/(?=\*\*)/);
  return sections.map((section, i) => {
    if (section.startsWith("**") && section.includes("**")) {
      const endIdx = section.indexOf("**", 2);
      const label = section.slice(2, endIdx);
      const rest = section.slice(endIdx + 2);
      return (
        <div key={i} className="mb-2">
          <strong className="text-zinc-200 text-xs uppercase tracking-wider">{label}</strong>
          <span className="text-zinc-400">{rest}</span>
        </div>
      );
    }
    return <span key={i} className="text-zinc-400">{section}</span>;
  });
}
