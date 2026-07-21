"use client";

const CHALDEAN_ORDER = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"] as const;
const DAY_RULERS: Record<string, string> = {
  sun: "sun", mon: "moon", tue: "mars", wed: "mercury", thu: "jupiter", fri: "venus", sat: "saturn",
};

export const PLANET_NAMES_SHORT: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Merc", venus: "Venus", mars: "Mars", jupiter: "Jup", saturn: "Sat",
};

export const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄",
};

export function getPlanetaryHours(bkNow: Date): {
  dawn: string; hourPlanets: { hour: number; planet: string; symbol: string; name: string }[];
  currentPlanet: string; currentSymbol: string;
} {
  const h = bkNow.getHours();
  const dow = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][bkNow.getDay()];
  const ruler = DAY_RULERS[dow] || "sun";

  const sunrise = 6;
  const sunset = 18;
  const dayLength = sunset - sunrise;
  const nightLength = 24 - dayLength;
  const dayHourMins = dayLength * 60 / 12;
  const nightHourMins = nightLength * 60 / 12;

  const allHours: { hour: number; planet: string; symbol: string; name: string }[] = [];

  // Day hours
  let idx = CHALDEAN_ORDER.indexOf(ruler as any);
  for (let i = 0; i < 12; i++) {
    const planet = CHALDEAN_ORDER[(idx + i) % 7];
    allHours.push({ hour: sunrise + i, planet, symbol: PLANET_SYMBOLS[planet], name: PLANET_NAMES_SHORT[planet] });
  }

  // Night hours
  idx = (idx + 12) % 7;
  for (let i = 0; i < 12; i++) {
    const planet = CHALDEAN_ORDER[(idx + i) % 7];
    allHours.push({ hour: (sunset + i) % 24, planet, symbol: PLANET_SYMBOLS[planet], name: PLANET_NAMES_SHORT[planet] });
  }

  const current = allHours.find(a => a.hour === h) || allHours[0];
  return {
    dawn: dow === "wed" ? "mercury" : ruler,
    hourPlanets: allHours,
    currentPlanet: current.planet,
    currentSymbol: current.symbol,
  };
}
