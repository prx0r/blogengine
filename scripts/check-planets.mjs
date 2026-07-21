import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";

const eng = new Engine(embeddedData);
const now = new Date();
const jdUt = now.getTime() / 86400000 + 2440587.5;
const signNames = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];
const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

console.log(`Date: ${now.toISOString().split("T")[0]}`);
console.log(`JD: ${jdUt}`);
console.log("");

for (const p of planets) {
  const lon = eng.longitude(p, jdUt);
  const si = Math.floor(lon / 30) % 12;
  const retro = eng.longitude(p, jdUt - 1) > eng.longitude(p, jdUt);
  console.log(`${p}: ${signNames[si]} ${(lon % 30).toFixed(2)}° (${lon.toFixed(2)}°)${retro ? " Rx" : ""}`);
}

console.log("\n--- Current Sky Aspects ---");
const pos = {};
for (const p of planets) pos[p] = eng.longitude(p, jdUt);
function orbDiff(a,b){let d=Math.abs(a-b)%360;if(d>180)d=360-d;return d;}
const ad=[["cnj",0,8],["sxt",60,6],["sqr",90,6],["tri",120,6],["opp",180,8]];
for(let i=0;i<planets.length;i++){for(let j=i+1;j<planets.length;j++){for(const[n,ang,mO]of ad){const o=orbDiff(pos[planets[i]],pos[planets[j]]);const d=Math.abs(o-ang);if(d<=mO)console.log(`${planets[i]} ${n} ${planets[j]} (${d.toFixed(2)}°)`)}}}
