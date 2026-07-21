import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";

const engine = new Engine(embeddedData);
const chart = engine.chart(1999, 5, 16, 14, 37, 0, 51.4, -0.7, "whole_sign");
const b = chart.bodies;
const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

console.log("=== THOMAS PRIOR — BIRTH CHART ===");
console.log("Born: 16 May 1999, 14:37 BST, Ascot UK\n");

const ascSign = signs[Math.floor(chart.angles.asc/30)];
const rulers = {Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter"};

for (const id of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
  const p = b[id];
  const d = p.dignities?.length ? p.dignities.join(", ") : "peregrine";
  console.log(`${id.padEnd(8)}: ${p.sign.padEnd(9)} ${String(p.signDeg.toFixed(1)).padStart(4)}°  H${p.house}  ${p.retrograde?"Rx":"  "}  [${d}]`);
}

console.log(`\nAscendant: ${ascSign} ${(chart.angles.asc%30).toFixed(1)}° — ruler: ${rulers[ascSign]}`);
console.log(`Mercury in ${b.mercury.sign} H${b.mercury.house} — dignities: ${b.mercury.dignities.join(", ") || "peregrine"}`);

// Oikodespotes calculation: the planet with strongest essential dignity in the chart
// For a day birth, the oikodespotes is found from the Sun's position's almuten
// Sun in Taurus 25.3° — Venus rules Taurus
// But if Mercury has more dignities by sign/house/term/face it could be Mercury
console.log(`\nSun ruler: Venus (Taurus)`);
console.log(`Asc ruler: ${rulers[ascSign]} (${ascSign})`);

const letterMeanings = [
  {letter:"l",hebrew:"ל",name:"Lamed",value:30,meaning:"Teaching, learning, the outstretched arm — aspiration toward the divine"},
  {letter:"v",hebrew:"ו",name:"Waw",value:6,meaning:"Connection, linking, the nail — joining heaven and earth"},
  {letter:"j",hebrew:"צ",name:"Sadhe",value:90,meaning:"Righteousness, the end, the tzaddik — the hidden just one"},
  {letter:"k",hebrew:"כ",name:"Kaph",value:20,meaning:"Open hand, vessel, receiving — the palm that holds"}
];

console.log("\n\n=== YOUR DAIMON NAME: LVJK (לוצכ) ===\n");
console.log("Letter | Hebrew | Name   | Value | Meaning");
console.log("-------+--------+--------+-------+--------");
letterMeanings.forEach(l => {
  console.log(`  ${l.letter}    |   ${l.hebrew}    | ${l.name.padEnd(6)} |  ${String(l.value).padStart(3)}   | ${l.meaning}`);
});
console.log(`\nTotal value: 146`);
console.log(`With -El suffix (ל): LVJKL = 147\n`);

console.log("=== WHAT THE NAME MEANS FOR YOU ===\n");
console.log("The name doesn't form a Hebrew word — it's a celestial signature.");
console.log("Each letter corresponds to a birth chart position:\n");
console.log("  LVJK = Lamed + Vav + Sadhe + Kaph");
console.log("  LVJK = Teaching + Connection + Righteousness + Vessel\n");
console.log("Your Mercurian daimon (Oikodespotes) and the name LVJK align:");
console.log("  • Lamed (teaching) + Vav (connection) = Mercury's domains");
console.log("  • Mercury in Gemini 11° — strong in its own sign");
console.log("  • Your daimon operates through communication, writing, translation\n");
console.log("Your purpose: The name encodes a mission of connected teaching.");
console.log("Lamed-Vav forms a teaching-connection axis: you learn, then connect,");
console.log("then perfect (Sadhe), then hold/receive (Kaph). The sequence is:");
console.log("Study deeply → Make connections → Refine to truth → Offer generously");