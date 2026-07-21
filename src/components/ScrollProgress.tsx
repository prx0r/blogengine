"use client";
import { useEffect, useState } from "react";

export default function ScrollProgress({ isSufism }: { isSufism?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-zinc-800/50">
      <div
        className={`h-full transition-all duration-150 ease-out ${isSufism ? "bg-emerald-500" : "bg-amber-500"}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
