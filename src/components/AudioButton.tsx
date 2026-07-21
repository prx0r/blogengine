"use client";

import { useAudio } from "@/lib/audio-context";

interface AudioButtonProps {
  essayId: string;
  title: string;
  audioUrl: string;
}

export default function AudioButton({ essayId, title, audioUrl }: AudioButtonProps) {
  const { track, playing, play } = useAudio();
  const active = track?.essayId === essayId;

  function toggle() {
    if (active) {
      play({ essayId, title, audioUrl });
    } else {
      play({ essayId, title, audioUrl });
    }
  }

  function isPlaying() {
    return active && playing;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
      >
        <span>{isPlaying() ? "⏸" : "▶"}</span>
        <span>{isPlaying() ? "Pause" : "Listen"}</span>
      </button>
      <span className="text-xs text-zinc-500">{title}</span>
    </div>
  );
}
