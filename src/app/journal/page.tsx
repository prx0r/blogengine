"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getAllNotes, getNote, addNote, deleteNote, TAGS, getGistToken, setGistToken, syncToGist, loadFromGist } from "@/lib/journal";
import type { Note } from "@/lib/journal";

const ENTRY_KINDS = [
  { value: "journal_entry", label: "Journal Entry" },
  { value: "dream", label: "Dream" },
  { value: "practice_session", label: "Practice Session" },
  { value: "insight", label: "Insight" },
  { value: "question", label: "Question" },
  { value: "symbol", label: "Symbol" },
  { value: "risk_event", label: "Risk Event" },
  { value: "mood_pattern", label: "Mood Pattern" },
  { value: "book_note", label: "Book Note" },
  { value: "ritual_note", label: "Ritual Note" },
  { value: "guidance_hypothesis", label: "Guidance Hypothesis" },
  { value: "progress_marker", label: "Progress Marker" },
];

interface PhaseMapping {
  phaseId: string;
  phaseLabel: string;
}

function getClientId(): string | null {
  if (typeof window === "undefined") return null;
  let cid = localStorage.getItem("client_id");
  if (!cid) {
    cid = crypto.randomUUID();
    localStorage.setItem("client_id", cid);
  }
  return cid;
}

export default function JournalPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("journal_entry");
  const [tag, setTag] = useState("rituals/lbrp");
  const [status, setStatus] = useState("");
  const [showSync, setShowSync] = useState(false);
  const [token, setToken] = useState("");
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [phaseMappings, setPhaseMappings] = useState<PhaseMapping[]>([]);
  const [patterns, setPatterns] = useState<{ currentStreak: number; totalEntries: number; entriesThisWeek: number } | null>(null);

  useEffect(() => {
    setNotes(getAllNotes());
    setToken(getGistToken());
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setViewNote(getNote(id) || null);
    loadPatterns();
  }, []);

  async function loadPatterns() {
    const cid = getClientId();
    if (!cid) return;
    try {
      const res = await fetch("/api/user/patterns", {
        headers: { "x-client-id": cid },
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns(data.summary);
      }
    } catch {}
  }

  async function submitViaApi(kindVal: string, titleVal: string, bodyVal: string) {
    const cid = getClientId();
    if (!cid) {
      // Fallback: store locally
      const t = TAGS.find((t) => t.value === tag)!;
      addNote(titleVal, bodyVal, tag, t.label);
      return [];
    }
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-client-id": cid },
        body: JSON.stringify({ kind: kindVal, title: titleVal, text: bodyVal }),
      });
      if (res.ok) {
        const data = await res.json();
        setPhaseMappings(data.mappings || []);
        loadPatterns();
        return data.mappings || [];
      }
    } catch {}
    return [];
  }

  async function submit() {
    if (!title.trim() || !body.trim()) return;

    // Submit to API (server-side storage + auto-classify)
    const mappings = await submitViaApi(kind, title.trim(), body.trim());

    // Also save locally for offline access
    const t = TAGS.find((t) => t.value === tag)!;
    addNote(title.trim(), body.trim(), tag, t.label);

    setTitle("");
    setBody("");
    setKind("journal_entry");
    setNotes(getAllNotes());

    if (mappings.length > 0) {
      setStatus(`Saved + mapped to ${mappings.map((m: PhaseMapping) => m.phaseLabel).join(", ")}`);
    } else {
      setStatus("Saved");
    }
    setTimeout(() => setStatus(""), 4000);
  }

  function del(id: string) {
    deleteNote(id);
    setNotes(getAllNotes());
    setViewNote(null);
    window.history.replaceState({}, "", "/journal");
  }

  function openNote(n: Note) {
    setViewNote(n);
    window.history.replaceState({}, "", `/journal?id=${n.id}`);
  }

  function closeNote() {
    setViewNote(null);
    window.history.replaceState({}, "", "/journal");
  }

  function setStat(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  }

  async function handleSync() {
    if (!token) { setStat("Enter token"); return; }
    setStat("Syncing...");
    try { await syncToGist(token); setStat("Synced"); }
    catch (e: unknown) { setStat(`Failed: ${e instanceof Error ? e.message : "error"}`); }
  }

  async function handleLoad() {
    setStat("Loading...");
    try { await loadFromGist(token); setNotes(getAllNotes()); setStat("Loaded"); }
    catch (e: unknown) { setStat(`Failed: ${e instanceof Error ? e.message : "error"}`); }
  }

  if (viewNote) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <button onClick={closeNote} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">&larr; Journal</button>
        <article>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-1">{viewNote.tagLabel}</p>
          <h1 className="text-2xl font-bold text-zinc-100 mb-1">{viewNote.title}</h1>
          <p className="text-sm text-zinc-500 mb-6">{viewNote.date}</p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{viewNote.body}</div>
        </article>
        <button onClick={() => del(viewNote.id)} className="mt-8 text-xs text-zinc-600 hover:text-red-400 transition-colors">Delete note</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      {patterns && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 flex gap-4 text-xs text-zinc-400">
          <span>Streak: <strong className="text-zinc-200">{patterns.currentStreak}</strong></span>
          <span>This week: <strong className="text-zinc-200">{patterns.entriesThisWeek}</strong></span>
          <span>Total: <strong className="text-zinc-200">{patterns.totalEntries}</strong></span>
        </div>
      )}

      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">Journal</p>
        <h1 className="text-2xl font-bold mb-2">New Entry</h1>
        <p className="text-xs text-zinc-500 mb-4">{new Date().toISOString().slice(0, 10)}</p>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-600 mb-3" />

        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your entry..." rows={6}
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-600 mb-3" />

        <div className="flex flex-wrap gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600">
            {ENTRY_KINDS.map((k) => (<option key={k.value} value={k.value}>{k.label}</option>))}
          </select>
          <button onClick={submit} disabled={!title.trim() || !body.trim()}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors">Post</button>
          <button onClick={() => setShowSync(!showSync)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors">Sync</button>
        </div>

        {phaseMappings.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {phaseMappings.map((m) => (
              <span key={m.phaseId} className="rounded-full border border-violet-800/40 bg-violet-900/20 px-2.5 py-0.5 text-xs text-violet-300">
                {m.phaseLabel}
              </span>
            ))}
          </div>
        )}

        {status && <p className="mt-2 text-xs text-zinc-500">{status}</p>}

        {showSync && (
          <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
            <input type="password" value={token} onChange={(e) => { setToken(e.target.value); setGistToken(e.target.value); }} placeholder="GitHub token" className="w-full rounded-lg border border-zinc-800 bg-black/30 p-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600" />
            <div className="flex gap-2">
              <button onClick={handleSync} className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">Upload</button>
              <button onClick={handleLoad} className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">Download</button>
            </div>
          </div>
        )}
      </section>

      {notes.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Recent notes</h2>
          <div className="space-y-2">
            {notes.slice(0, 20).map((n) => (
              <button key={n.id} onClick={() => openNote(n)} className="w-full text-left group rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{n.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{n.date} &mdash; {n.tagLabel}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); del(n.id); }} className="shrink-0 text-xs text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity">&times;</button>
                </div>
                <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">{n.body}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
