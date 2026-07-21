import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { toUT } from "caelus-birth";
import { profectionAt, signRuler, SIGNS } from "caelus";
import { zrAt } from "caelus";
import { normalizeChart } from "../src/astrology/caelus_adapter";
import { buildDailySphereReading } from "../src/astrology/daily_sphere_reader";
import { buildActivationPacket } from "../src/astrology/activation_packet";
import { computeFirdaria } from "../src/astrology/activation_engine";
import { readFileSync, writeFileSync, existsSync } from "fs";

const BIRTH = { year: 1999, month: 5, day: 16, hour: 14, minute: 37, lat: 51.41, lon: -0.67 };
const SNAPSHOT_DIR = "/root/.hermes/observatory";
const LOG_FILE = "/root/.hermes/observatory/cron.log";

const PLANET_NAMES = { sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn" };
const PLANET_SYMBOLS = { sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄" };
const SIGN_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const TIMESCALE_LABELS = {
  annual_profection: "Year", zr_spirit: "Spirit", zr_fortune: "Fortune",
  firdaria: "Firdaria", monthly_profection: "Month", transit: "Transit",
  lot_transit: "Lot", angle_transit: "Angle", sky_aspect: "Sky",
  natal_prominence: "Natal", oikodespotes: "Daimon",
};

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { writeFileSync(LOG_FILE, line + "\n", { flag: "a" }); } catch {}
}

function getBangkokNow() {
  const now = new Date();
  const bangkok = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t) => parseInt(bangkok.find(p => p.type === t)?.value || "0", 10);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

async function main() {
  log("Observatory cron started");

  const engine = new Engine(embeddedData);
  const now = getBangkokNow();
  const t = toUT({ ...BIRTH, hour: BIRTH.hour, minute: BIRTH.minute });
  const chart = engine.chart(t.utc.year, t.utc.month, t.utc.day, t.utc.hour, t.utc.minute, 0, BIRTH.lat, BIRTH.lon, "whole_sign");
  const normalized = normalizeChart(chart, "Thomas Prior");
  const jdUt = now.getTime() / 86400000 + 2440587.5;
  const today = new Date();

  const sky = {};
  for (const p of ["sun","moon","mercury","venus","mars","jupiter","saturn"]) {
    const lon = engine.longitude(p, jdUt);
    sky[p] = { lon, sign_index: Math.floor(lon / 30) % 12 };
  }

  const prof = profectionAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon);
  const zr = zrAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon, "spirit");
  const zrFort = zrAt(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon, "fortune");
  const firdaria = computeFirdaria(engine, normalized.natal.jdUt, jdUt, BIRTH.lat, BIRTH.lon);

  const readerInput = {
    chart: normalized, currentSkyPlanets: sky, currentSkyAspects: [], targetDate: today,
    profection: {
      annual: { house: prof.annual.house, sign: prof.annual.sign, lord: prof.annual.lord },
      monthly: { house: prof.monthly.house, sign: prof.monthly.sign, lord: prof.monthly.lord },
    },
    zrSpirit: zr?.l1 ? { lord: signRuler(SIGNS.indexOf(zr.l1)), sign: zr.l1 } : undefined,
    zrFortune: zrFort?.l1 ? { lord: signRuler(SIGNS.indexOf(zrFort.l1)), sign: zrFort.l1 } : undefined,
  };

  const reading = buildDailySphereReading(readerInput);
  const packetInput = { ...readerInput, firdaria: firdaria.lord ? { lord: firdaria.lord } : undefined };
  const packet = buildActivationPacket(packetInput);

  const daimonName = "LVJK";
  const topSignals = packet.signals.slice(0, 3).map(s => ({
    planet: s.planet, score: s.score, confidence: s.confidence,
    sign: SIGN_SYMBOLS[sky[s.planet]?.sign_index ?? 0],
    daimon: s.planet === reading.oikodespotes?.planet,
    timescales: (s.timing_sources || []).map(ts => TIMESCALE_LABELS[ts] || ts),
  }));

  const moonLon = sky.moon?.lon ?? 0;
  const moonPhase = ((moonLon - sky.sun.lon) % 360 + 360) % 360;
  const moonName = moonPhase < 45 ? "🌑 New" : moonPhase < 135 ? "🌓 First Quarter" : moonPhase < 225 ? "🌕 Full" : moonPhase < 315 ? "🌗 Last Quarter" : "🌑 New";

  const snapshot = {
    date: now.toISOString(),
    bangkokDate: now.toLocaleDateString("en-GB", { timeZone: "Asia/Bangkok", weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/,/g, ""),
    daimonName,
    oikodespotes: reading.oikodespotes?.planet || null,
    dominantMode: reading.dominant_mode || packet.dominant_mode || "mixed",
    fortuneScore: packet.fortune_score?.toFixed(1),
    spiritScore: packet.spirit_score?.toFixed(1),
    moon: { phase: moonPhase.toFixed(1), name: moonName, sign: SIGN_SYMBOLS[Math.floor(moonLon / 30) % 12] },
    topSignals,
    signalCount: packet.signals.length,
    allPlanets: Object.fromEntries(Object.entries(sky).map(([k, v]) => [k, { sign: SIGN_SYMBOLS[v.sign_index], lon: v.lon.toFixed(2) }])),
  };

  // Save snapshot
  const dateStr = now.toISOString().slice(0, 10);
  try { writeFileSync(`${SNAPSHOT_DIR}/${dateStr}.json`, JSON.stringify(snapshot, null, 2)); } catch {}
  log(`Snapshot saved: ${SNAPSHOT_DIR}/${dateStr}.json`);

  // Build Telegram message
  const top = topSignals[0];
  let msg = `🌅 *Observatory — ${snapshot.bangkokDate}*\n\n`;
  msg += `✦ *${daimonName}* · ${moonName} in ${snapshot.moon.sign}\n\n`;
  if (top) {
    msg += `★ *Top: ${PLANET_NAMES[top.planet] || top.planet}* (${top.score}) ${PLANET_SYMBOLS[top.planet] || ""}\n`;
    msg += `  ${top.sign} · ${top.confidence}${top.daimon ? " · ✦ Daimon" : ""}\n`;
    msg += `  ${top.timescales.slice(0, 3).join(" · ")}\n\n`;
  }
  if (topSignals[1]) {
    msg += `◈ ${PLANET_NAMES[topSignals[1].planet] || topSignals[1].planet} (${topSignals[1].score})\n`;
  }
  if (topSignals[2]) {
    msg += `◈ ${PLANET_NAMES[topSignals[2].planet] || topSignals[2].planet} (${topSignals[2].score})\n`;
  }
  msg += `\nMode: ${snapshot.dominantMode} · ${snapshot.signalCount} activations\n`;
  msg += `\n🔭 /observatory`;

  // Send Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_HOME_CHANNEL || "8799078300";
  if (botToken) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown", disable_web_page_preview: true }),
      });
      if (res.ok) log("Telegram sent");
      else log(`Telegram error: ${res.status} ${await res.text()}`);
    } catch (e) { log(`Telegram error: ${e.message}`); }
  } else {
    log("No TELEGRAM_BOT_TOKEN set, printing message:");
    console.log(msg);
  }

  log("Observatory cron complete");
}

main().catch(e => { console.error(e); process.exit(1); });
