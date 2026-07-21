export const PLANET_COLORS_HEX: Record<string, string> = {
  sun: "#F59E0B",
  moon: "#94A3B8",
  mercury: "#EAB308",
  venus: "#10B981",
  mars: "#EF4444",
  jupiter: "#3B82F6",
  saturn: "#8B5CF6",
};

export const PLANET_COLORS: Record<string, string> = {
  sun: "amber",
  moon: "slate",
  mercury: "yellow",
  venus: "emerald",
  mars: "red",
  jupiter: "blue",
  saturn: "violet",
};

export const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
};

export const PLANET_NAMES: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
};

const FICINIAN_RGB: Record<string, [number, number, number]> = {
  sun: [245, 158, 11],
  moon: [148, 163, 184],
  mercury: [234, 179, 8],
  venus: [16, 185, 129],
  mars: [239, 68, 68],
  jupiter: [59, 130, 246],
  saturn: [139, 92, 246],
};

export function blendPlanetColors(
  signals: { planet: string; score: number }[],
  timeOfDay: string,
): { css: string; topColor: string } {
  const active = signals.filter(s => s.score > 0);
  if (active.length === 0) {
    return { css: "from-indigo-950 via-slate-950 to-black", topColor: "#312e81" };
  }

  const totalScore = active.reduce((sum, s) => sum + s.score, 0);
  const weights = active.map(s => s.score / totalScore);

  let r = 0, g = 0, b = 0;
  for (let i = 0; i < active.length; i++) {
    const rgb = FICINIAN_RGB[active[i].planet] || FICINIAN_RGB.mercury;
    r += rgb[0] * weights[i];
    g += rgb[1] * weights[i];
    b += rgb[2] * weights[i];
  }

  const baseDark = `rgb(${Math.floor(r * 0.15)},${Math.floor(g * 0.12)},${Math.floor(b * 0.18)})`;
  const midTone = `rgb(${Math.floor(r * 0.35)},${Math.floor(g * 0.28)},${Math.floor(b * 0.4)})`;
  const accentLight = `rgb(${Math.floor(r * 0.6)},${Math.floor(g * 0.5)},${Math.floor(b * 0.7)})`;
  const topColor = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;

  const timeLayer = {
    dawn: `,${accentLight} 0%`,
    morning: `,${midTone} 0%`,
    noon: `,${accentLight} 0%`,
    afternoon: `,${midTone} 0%`,
    dusk: `,${accentLight} 0%`,
    night: "",
  }[timeOfDay] || "";

  const css = `radial-gradient(ellipse at 50% 0%, ${baseDark} 0%${timeLayer}), radial-gradient(ellipse at 50% 100%, ${midTone} 0%, transparent 70%), linear-gradient(180deg, ${baseDark} 0%, ${midTone} 50%, ${baseDark} 100%)`;

  return { css, topColor };
}
