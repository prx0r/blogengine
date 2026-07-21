"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

interface Track {
  essayId: string;
  title: string;
  audioUrl: string;
}

interface AudioCtx {
  track: Track | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioCtx>(null!);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("durationchange", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("play", () => setPlaying(true));

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const play = useCallback((t: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track?.essayId === t.essayId) {
      audio.currentTime = 0;
      audio.play();
    } else {
      audio.src = t.audioUrl;
      setTrack(t);
      setCurrentTime(0);
      setDuration(0);
      audio.play();
    }
  }, [track]);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => audioRef.current?.play(), []);
  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setTrack(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  return (
    <AudioContext.Provider value={{ track, playing, currentTime, duration, play, pause, resume, stop, seek }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
