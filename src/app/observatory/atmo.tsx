"use client";

import { useEffect, useRef } from "react";

interface AtmoProps {
  gradientCss: string;
  accentColor: string;
  planet: string;
}

const PLANET_TEMPOS: Record<string, number> = {
  sun: 15, moon: 20, mercury: 8, venus: 14, mars: 12, jupiter: 18, saturn: 25,
};

export default function AtmoBackground({ gradientCss, accentColor, planet }: AtmoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speed = PLANET_TEMPOS[planet] || 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let frame = 0;
    let animId = 0;

    const stars: { x: number; y: number; r: number; speed: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      frame++;

      const pulse = Math.sin(frame * 0.02 * (speed / 15)) * 0.15 + 0.25;

      for (const s of stars) {
        s.y -= s.speed;
        if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
        const flicker = Math.sin(frame * 0.03 * s.speed + s.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * flicker * pulse * 3})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [speed]);

  return (
    <>
      <div
        className="fixed inset-0 transition-all duration-700 ease-in-out"
        style={{ background: gradientCss }}
      />
      <div
        className="fixed inset-0 opacity-[0.06] transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, ${accentColor} 0%, transparent 60%)`,
          animation: `atmoDrift ${speed * 2}s ease-in-out infinite alternate`,
        }}
      />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" />
      <style jsx>{`
        @keyframes atmoDrift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.06; }
          50% { transform: translate(2%, 1%) scale(1.05); opacity: 0.1; }
          100% { transform: translate(-1%, -0.5%) scale(0.98); opacity: 0.06; }
        }
      `}</style>
    </>
  );
}
