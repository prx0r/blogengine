'use client';

import { useState, useEffect, useRef } from 'react';

export default function FlipCard({
  children,
  storageKey,
}: {
  children: React.ReactNode;
  storageKey: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const [notes, setNotes] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`notes-${storageKey}`);
    if (saved) setNotes(saved);
  }, [storageKey]);

  function handleNotesChange(value: string) {
    setNotes(value);
    localStorage.setItem(`notes-${storageKey}`, value);
  }

  return (
    <div className="perspective-1000 w-full">
      <div
        className={`relative min-h-[50vh] w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-5 shadow-lg shadow-black/20 [backface-visibility:hidden] sm:p-6">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {children}
            </div>
            <button
              onClick={() => setFlipped(true)}
              className="mt-4 self-end rounded-lg border border-zinc-700/60 bg-zinc-800/30 px-4 py-2 text-sm text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200 active:scale-95"
            >
              <span className="flex items-center gap-2">
                Personal Notes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-black/80 p-5 shadow-lg shadow-black/30 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6">
          <div className="flex h-full flex-col">
            <button
              onClick={() => setFlipped(false)}
              className="mb-3 self-start rounded-lg border border-zinc-700/60 bg-zinc-800/30 px-4 py-2 text-sm text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Content
              </span>
            </button>
            <label className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Personal Notes
            </label>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Your reflections here..."
              className="flex-1 resize-none rounded-lg border border-zinc-800 bg-black/40 p-4 text-sm leading-relaxed text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-600 focus:bg-black/60"
            />
            <p className="mt-2 text-xs text-zinc-600">
              Saved automatically to browser storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
