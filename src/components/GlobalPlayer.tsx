"use client";

import { useAudio } from "@/lib/audio-context";

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GlobalPlayer() {
  const { track, playing, currentTime, duration, play, pause, resume, stop, seek } = useAudio();

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-3">
      <div className="mx-auto max-w-[640px] flex items-center gap-3">
        <button
          onClick={() => (playing ? pause() : resume())}
          className="shrink-0 rounded bg-zinc-800 hover:bg-zinc-700 w-8 h-8 flex items-center justify-center text-sm transition-colors"
        >
          {playing ? "⏸" : "▶"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-400 truncate mb-1">{track.title}</div>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 accent-zinc-400 cursor-pointer"
          />
        </div>

        <span className="shrink-0 text-xs text-zinc-500 w-16 text-right tabular-nums">
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        <button
          onClick={stop}
          className="shrink-0 text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
