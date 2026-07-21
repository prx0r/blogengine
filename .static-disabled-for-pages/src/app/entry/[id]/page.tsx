"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Entry {
  id: string;
  original_url: string;
  original_title: string;
  distilled_title: string;
  distilled_body: string;
  category: string;
  created_at: string;
}

export default function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    fetch(`/api/entries/${id}`)
      .then((res) => res.json())
      .then((data) => setEntry(data));
  }, [id]);

  useEffect(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 && !voice) {
      setVoice(voices[0].name);
    }
    speechSynthesis.onvoiceschanged = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
  }, [voice]);

  function handleSpeak() {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!entry) return;
    const utterance = new SpeechSynthesisUtterance(entry.distilled_body);
    const voices = speechSynthesis.getVoices();
    const selected = voices.find((v) => v.name === voice);
    if (selected) utterance.voice = selected;
    utterance.rate = rate;
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  if (!entry) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Feed
        </Link>
      </nav>

      <article>
        <span className="text-xs text-zinc-600 uppercase tracking-wider">
          {entry.category}
        </span>
        <h1 className="text-2xl font-bold mt-2 leading-snug">
          {entry.distilled_title}
        </h1>
        <time className="text-xs text-zinc-600 mt-2 block">
          {new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSpeak}
            className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            {speaking ? "Stop" : "Listen"}
          </button>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="rounded bg-zinc-800 px-2 py-1.5 text-xs border border-zinc-700"
          >
            {speechSynthesis.getVoices().map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
          <label className="text-xs text-zinc-500">
            Rate:{" "}
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-20 align-middle"
            />
          </label>
        </div>

        <div className="prose mt-8 text-sm leading-relaxed text-zinc-300">
          {entry.distilled_body.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <a
          href={entry.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 text-sm text-accent hover:underline"
        >
          Read original →
        </a>
      </article>
    </div>
  );
}
