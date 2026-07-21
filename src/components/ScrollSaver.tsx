"use client";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "essay-progress";

interface EssayProgress {
  [essayId: string]: {
    scrollPct: number;
    updatedAt: number;
    title: string;
  };
}

export function useScrollSave(essayId: string, title: string) {
  const saved = useRef(false);

  useEffect(() => {
    // Restore position
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: EssayProgress = JSON.parse(raw);
        const entry = data[essayId];
        if (entry && entry.scrollPct > 0) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const target = (entry.scrollPct / 100) * docHeight;
          // Small delay to let content render
          setTimeout(() => window.scrollTo(0, target), 100);
        }
      }
    } catch {}

    // Save position on scroll
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const data: EssayProgress = raw ? JSON.parse(raw) : {};
          data[essayId] = { scrollPct: pct, updatedAt: Date.now(), title };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }, 300);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [essayId, title]);
}

export function getRecentEssays(): { id: string; title: string; scrollPct: number; updatedAt: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: EssayProgress = JSON.parse(raw);
    return Object.entries(data)
      .filter(([_, v]) => v.scrollPct > 0 && v.scrollPct < 99)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  } catch {
    return [];
  }
}
