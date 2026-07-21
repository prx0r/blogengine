import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";

const eng = new Engine(embeddedData);
const now = new Date();

// Check Mercury retrograde period
function mercuryLon(d) {
  const jd = d.getTime() / 86400000 + 2440587.5;
  return eng.longitude("mercury", jd);
}

// Scan back/forward to find stations
let prevSpeed = mercuryLon(now) - mercuryLon(new Date(now.getTime() - 86400000));
for (let i = -10; i <= 10; i++) {
  const d = new Date(now);
  d.setDate(d.getDate() + i);
  const lon = mercuryLon(d);
  const nextLon = mercuryLon(new Date(d.getTime() + 86400000));
  const speed = nextLon - lon;
  const station = Math.abs(speed) < 0.05 ? " STATION" : speed < 0 ? " Rx" : "  ";
  console.log(`Mercury ${d.toISOString().split("T")[0]}: ${(lon % 30).toFixed(2)}° Cancer${station}`);
}

// Quick table
console.log("\n--- All Planets July 10, 2026 ---");
const signNames = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];
const planets = ["sun","moon","mercury","venus","mars","jupiter","saturn"];
for (const p of planets) {
  const lon = eng.longitude(p, now.getTime() / 86400000 + 2440587.5);
  const si = Math.floor(lon / 30) % 12;
  const yLon = eng.longitude(p, (now.getTime() - 86400000) / 86400000 + 2440587.5);
  const rx = yLon > lon;
  console.log(`${p.padEnd(8)} ${signNames[si]} ${(lon % 30).toFixed(2)}°${rx ? " Rx" : ""} (${Math.floor(lon)}° total)`);
}
