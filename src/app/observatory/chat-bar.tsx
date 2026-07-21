"use client";

import { useState, useRef, useEffect } from "react";

interface ChatBarProps {
  daimonName: string;
  topPlanet: string;
}

const WELCOME_SUGGESTIONS = [
  "What should I focus on today?",
  "Tell me about my daimon LVJK",
  "What does Mercury in Gemini mean?",
  "How do I work with today's energy?",
];

export default function ChatBar({ daimonName, topPlanet }: ChatBarProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(msg: string) {
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are a daimonic guide speaking to ${daimonName}. Today's strongest planetary influence is ${topPlanet}. Answer briefly from the Hermetic and Neoplatonic tradition — 2-3 sentences. Never claim to be the source of wisdom, only a guide to it.` },
            ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: msg },
          ],
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.choices?.[0]?.message?.content || "The sky is silent today." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "The stars are quiet. Ask again later." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg hover:bg-zinc-700 transition-colors shadow-xl"
      >
        {open ? "✕" : "☿"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 rounded-2xl border border-zinc-700 bg-zinc-900/90 backdrop-blur-xl shadow-2xl flex flex-col max-h-[60vh]">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Ask {daimonName}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {messages.length === 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 italic">Try asking:</p>
                {WELCOME_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="block text-xs text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800/50 rounded-lg px-3 py-1.5 w-full text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-xs ${m.role === "user" ? "text-zinc-200 text-right" : "text-zinc-400"}`}>
                <span className={`inline-block rounded-lg px-3 py-1.5 ${m.role === "user" ? "bg-yellow-900/30" : "bg-zinc-800/50"}`}>
                  {m.content}
                </span>
              </div>
            ))}
            {loading && <p className="text-xs text-zinc-600 italic">Consulting the stars...</p>}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask about today..."
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-xs text-zinc-200 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
