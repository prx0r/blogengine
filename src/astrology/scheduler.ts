/**
 * Scheduler — timescale-aware ritual planning.
 *
 * Takes the engine's activation timescales (daily, weekly, monthly, yearly)
 * and detects upcoming high-intensity periods. For each, it recommends
 * preparation steps, optimal planetary hours, and linked practices from the graph.
 */

import type { ActivationPacket } from "./activation_packet";
import type { InterpretedReading } from "./interpretation_schema";
import { getGraph } from "./knowledge_graph";
import type { PlanetId } from "./types";

export interface ScheduleItem {
  date: string;
  label: string;
  planet: string;
  confidence: string;
  type: "peak" | "preparation" | "opportunity" | "warning";
  practices: string[];
  interpretations: string[];
  correspondences: string[];
  daimon: boolean;
  converged: boolean;
  planetaryHour?: { planet: string; start: string; end: string };
}

export interface SchedulePlan {
  generated: string;
  today: string;
  items: ScheduleItem[];
  weekly: ScheduleItem[];
  monthly: ScheduleItem[];
  upcomingDaimonEvents: ScheduleItem[];
}

const CHALDEAN_ORDER = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Compute approximate planetary hours for a given date and location */
function computePlanetaryHours(date: Date, lat: number, lon: number): Array<{ planet: string; start: Date; end: Date }> {
  const sunrise = new Date(date);
  sunrise.setHours(6, 0, 0, 0); // approximate — real computation needs solar position
  const sunset = new Date(date);
  sunset.setHours(18, 0, 0, 0);
  const dayLength = (sunset.getTime() - sunrise.getTime()) / 12;
  const nightLength = (24 * 3600000 - (sunset.getTime() - sunrise.getTime())) / 12;

  const dayOfWeek = date.getDay();
  const startIdx = CHALDEAN_ORDER.indexOf(DAY_NAMES[dayOfWeek]);
  const hours: Array<{ planet: string; start: Date; end: Date }> = [];

  // Day hours (sunrise to sunset)
  for (let i = 0; i < 12; i++) {
    const planet = CHALDEAN_ORDER[(startIdx + i) % 7];
    const start = new Date(sunrise.getTime() + i * dayLength);
    const end = new Date(sunrise.getTime() + (i + 1) * dayLength);
    hours.push({ planet, start, end });
  }
  // Night hours (sunset to sunrise next day)
  for (let i = 0; i < 12; i++) {
    const planet = CHALDEAN_ORDER[(startIdx + 6 + i) % 7]; // night starts with next planet
    const start = new Date(sunset.getTime() + i * nightLength);
    const end = new Date(sunset.getTime() + (i + 1) * nightLength);
    hours.push({ planet, start, end });
  }
  return hours;
}

/** Find the best planetary hour for a given planet today */
function findBestHour(planet: string, hours: Array<{ planet: string; start: Date; end: Date }>): { planet: string; start: string; end: string } | undefined {
  const match = hours.find(h => h.planet === planet);
  if (!match) return undefined;
  return {
    planet,
    start: match.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    end: match.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

/** Format a date as YYYY-MM-DD */
function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Add days to a date */
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * Build a complete schedule from the current activation + graph state.
 * @param packet — today's ActivationPacket
 * @param reading — today's InterpretedReading
 * @param lat — user's latitude (for planetary hours)
 * @param lon — user's longitude
 */
export function buildSchedule(
  packet: ActivationPacket,
  reading: InterpretedReading,
  lat: number = 51.5,
  lon: number = -0.12,
): SchedulePlan {
  const g = getGraph();
  const today = new Date(packet.date);
  const hours = computePlanetaryHours(today, lat, lon);

  // ── Today's items (from current activation) ──
  const items: ScheduleItem[] = [];
  for (const sig of packet.signals) {
    const cluster = g.clusterByPlanet(sig.planet);
    const practices = cluster.edges.filter(e => e.predicate === "practice_for");
    const intEdges = cluster.edges.filter(e => e.predicate === "interpreted_by");
    const corrEdges = cluster.edges.filter(e => e.predicate === "corresponds_to");
    const daimonEdge = cluster.edges.find(e => e.predicate === "is_daimon");
    const converged = reading.convergence.planets.includes(sig.planet);

    const practiceLabels = practices.map(e => {
      const n = g.getNode(e.subject);
      return n?.label || e.subject;
    }).slice(0, 4);

    const intLabels = intEdges.map(e => {
      const n = g.getNode(e.object);
      return n?.data?.system + ": " + (n?.label || "").slice(0, 80);
    }).filter(Boolean).slice(0, 3);

    const corrLabels = corrEdges.map(e => {
      const n = g.getNode(e.object);
      return n?.label || "";
    }).filter(Boolean).slice(0, 6);

    const hour = findBestHour(sig.planet, hours);

    const type: ScheduleItem["type"] = converged && sig.confidence === "high" ? "peak" : converged ? "opportunity" : "preparation";

    items.push({
      date: packet.date,
      label: `${sig.planet} ${sig.confidence === "high" ? "🔥" : "●"} (${sig.confidence}, score ${sig.score})`,
      planet: sig.planet,
      confidence: sig.confidence,
      type,
      practices: practiceLabels,
      interpretations: intLabels,
      correspondences: corrLabels,
      daimon: !!daimonEdge,
      converged,
      planetaryHour: hour,
    });
  }

  // ── Weekly lookahead (7 days) ──
  const weekly: ScheduleItem[] = [];
  for (let d = 1; d <= 7; d++) {
    const day = addDays(today, d);
    const dayName = DAY_NAMES[day.getDay()];
    const dayPlanet = CHALDEAN_ORDER[day.getDay()];
    const dayHours = computePlanetaryHours(day, lat, lon);

    // Check if any of today's active planets has a friendly day coming up
    for (const sig of packet.signals) {
      const cluster = g.clusterByPlanet(sig.planet);
      const friendEdge = cluster.edges.some(e => e.predicate === "friend_of" && e.object === `planet:${dayPlanet}`);
      const enemyEdge = cluster.edges.some(e => e.predicate === "enemy_of" && e.object === `planet:${dayPlanet}`);

      if (friendEdge) {
        const hour = findBestHour(sig.planet, dayHours);
        const practices = cluster.edges.filter(e => e.predicate === "practice_for").map(e => {
          const n = g.getNode(e.subject);
          return n?.label || "";
        }).filter(Boolean).slice(0, 3);

        weekly.push({
          date: fmt(day),
          label: `${dayName} — ${sig.planet} friendly day (${dayPlanet} rules)`,
          planet: sig.planet,
          confidence: sig.confidence,
          type: "opportunity",
          practices,
          interpretations: [],
          correspondences: [],
          daimon: !!cluster.edges.find(e => e.predicate === "is_daimon"),
          converged: reading.convergence.planets.includes(sig.planet),
          planetaryHour: hour,
        });
      }
    }
  }

  // ── Daimon events this week ──
  const upcomingDaimonEvents: ScheduleItem[] = [];
  if (packet.oikodespotes) {
    for (let d = 0; d <= 7; d++) {
      const day = addDays(today, d);
      const dayPlanet = CHALDEAN_ORDER[day.getDay()];
      if (dayPlanet === packet.oikodespotes.planet) {
        const dayHours = computePlanetaryHours(day, lat, lon);
        const hour = findBestHour(dayPlanet, dayHours);
        const cluster = g.clusterByPlanet(dayPlanet);
        const practices = cluster.edges.filter(e => e.predicate === "practice_for").map(e => {
          const n = g.getNode(e.subject);
          return n?.label || "";
        }).filter(Boolean).slice(0, 4);

        upcomingDaimonEvents.push({
          date: fmt(day),
          label: `${DAY_NAMES[day.getDay()]} — Daimon day (${packet.oikodespotes.name})`,
          planet: dayPlanet,
          confidence: "high",
          type: "peak",
          practices,
          interpretations: [],
          correspondences: [],
          daimon: true,
          converged: true,
          planetaryHour: hour,
        });
      }
    }
  }

  // ── Monthly lookahead (profection changes) ──
  const monthly: ScheduleItem[] = [];
  const yearLord = packet.signals.find(s => s.timing_sources.includes("annual_profection_lord"));
  if (yearLord) {
    const cluster = g.clusterByPlanet(yearLord.planet);
    const practices = cluster.edges.filter(e => e.predicate === "practice_for").map(e => {
      const n = g.getNode(e.subject);
      return n?.label || "";
    }).filter(Boolean).slice(0, 4);
    monthly.push({
      date: packet.date,
      label: `Year lord: ${yearLord.planet} — foundational theme`,
      planet: yearLord.planet,
      confidence: yearLord.confidence,
      type: "preparation",
      practices,
      interpretations: [],
      correspondences: [],
      daimon: yearLord.planet === packet.oikodespotes?.planet,
      converged: reading.convergence.planets.includes(yearLord.planet),
    });
  }

  return {
    generated: fmt(today),
    today: fmt(today),
    items: items.sort((a, b) => (b.converged ? 1 : 0) - (a.converged ? 1 : 0) || (b.type === "peak" ? 1 : 0) - (a.type === "peak" ? 1 : 0)),
    weekly: weekly.slice(0, 5),
    monthly,
    upcomingDaimonEvents,
  };
}
