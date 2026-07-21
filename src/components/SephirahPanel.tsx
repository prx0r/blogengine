"use client";

import { useState, useEffect } from "react";
import { Sephirah, getPathsForSephirah, getSephirahByNumber } from "@/lib/tree-of-life";
import { getNotesByTag, addNote, Note } from "@/lib/journal";

interface Props {
  sephirah: Sephirah | null;
  onClose: () => void;
}

export default function SephirahPanel({ sephirah, onClose }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (sephirah) {
      setNotes(getNotesByTag(sephirah.tag));
      setNewNote("");
    }
  }, [sephirah]);

  if (!sephirah) return null;

  const paths = getPathsForSephirah(sephirah.number);

  function handleAddNote() {
    if (!newNote.trim() || !sephirah) return;
    addNote(
      newNote.split("\n")[0].slice(0, 60),
      newNote,
      sephirah.tag,
      sephirah.name,
    );
    setNotes(getNotesByTag(sephirah.tag));
    setNewNote("");
  }

  return (
    <div className="w-80 shrink-0 border-l border-zinc-800 bg-zinc-900/80 p-5 overflow-y-auto max-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border border-zinc-600"
            style={{ backgroundColor: sephirah.color || "#333" }}
          />
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{sephirah.name}</h2>
            <p className="text-xs text-zinc-500">{sephirah.hebrew} · {sephirah.meaning}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">&times;</button>
      </div>

      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{sephirah.description}</p>

      <div className="space-y-1.5 text-xs mb-4">
        <Row label="Number" value={sephirah.number.toString()} />
        <Row label="Pillar" value={sephirah.pillar} />
        <Row label="Plane" value={sephirah.plane} />
        <Row label="Divine Name" value={sephirah.divineName} />
        <Row label="Archangel" value={sephirah.archangel} />
        <Row label="Angelic Order" value={sephirah.angelicOrder} />
        <Row label="Planet" value={sephirah.planet} />
        <Row label="Magical Image" value={sephirah.magicalImage} />
      </div>

      {paths.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Connecting Paths</h3>
          <div className="space-y-1">
            {paths.map((p) => {
              const otherNum = p.from === sephirah.number ? p.to : p.from;
              const other = getSephirahByNumber(otherNum);
              return (
                <div key={`${p.from}-${p.to}`} className="text-xs text-zinc-400 bg-zinc-800/50 rounded p-1.5">
                  <span className="text-zinc-300">{p.letter} {p.letterName}</span>
                  {" → "}
                  <span className="text-zinc-500">{p.tarot}</span>
                  {" · "}
                  {other && <span className="text-zinc-300">{other.name}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-zinc-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Notes</h3>
        <div className="space-y-2 mb-3">
          {notes.length === 0 && (
            <p className="text-xs text-zinc-600 italic">No notes yet for {sephirah.name}.</p>
          )}
          {notes.map((n) => (
            <div key={n.id} className="bg-zinc-800/50 rounded p-2 text-xs">
              <div className="text-zinc-400 mb-1">{n.date}</div>
              <div className="text-zinc-300 whitespace-pre-wrap">{n.body}</div>
            </div>
          ))}
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500"
        />
        <button
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className="mt-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 px-3 py-1.5 rounded transition-colors"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className="text-zinc-300 text-right">{value}</span>
    </div>
  );
}
