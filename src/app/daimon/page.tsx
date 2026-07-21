"use client";
import { useState, useEffect } from "react";

const PRAYERS = [
  { name: "The Oath", text: "Thee I invoke, the Bornless One...", ref: "Liber Samekh §A" },
  { name: "Prayer to the Good Daimon", text: "Hail, Good Daimon, Lord of all things visible and invisible...", ref: "PGM VII.644-651" },
  { name: "The Charge", text: "Hear me, and make all Spirits subject unto Me...", ref: "Liber Samekh §H" },
  { name: "Agathos Daimon Liturgy", text: "Let the earth be still, let the air be still...", ref: "Feliciano" },
];

const CORRESPONDENCES = [
  { label: "Planet", value: "Mercury", icon: "☿" },
  { label: "Day", value: "Wednesday", icon: "📅" },
  { label: "Color", value: "Yellow / Orange", icon: "🎨" },
  { label: "Stone", value: "Opal, Agate, Aventurine", icon: "💎" },
  { label: "Tarot", value: "The Magician (Atu I)", icon: "🃏" },
  { label: "Archangel", value: "Raphael", icon: "👼" },
  { label: "Egyptian", value: "Thoth / Djehuty", icon: "𓀀" },
  { label: "Greek", value: "Hermes", icon: "🏛️" },
  { label: "Metal", value: "Quicksilver", icon: "⚗️" },
];

export default function DaimonPage() {
  const [name, setName] = useState("LVJK");
  const [day, setDay] = useState(1);
  const [moonPhase, setMoonPhase] = useState("");
  const [planetaryHour, setPlanetaryHour] = useState("");
  const [dayName, setDayName] = useState("");
  const [practiceLog, setPracticeLog] = useState("");
  const [dreamLog, setDreamLog] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("genius_name") || "LVJK");
    const startDate = localStorage.getItem("daimon_start");
    if (startDate) {
      setDay(Math.floor((Date.now() - parseInt(startDate)) / 86400000) + 1);
    }
    const savedLog = localStorage.getItem("daimon_practice_log") || "";
    const savedDream = localStorage.getItem("daimon_dream_log") || "";
    setPracticeLog(savedLog);
    setDreamLog(savedDream);

    const d = new Date();
    const lp = 2551443;
    const nm = new Date(2024, 0, 11, 11, 58).getTime();
    const days = (d.getTime() - nm) / lp;
    const frac = days - Math.floor(days);
    if (frac < 0.03) setMoonPhase("🌑 New");
    else if (frac < 0.25) setMoonPhase("🌒 Crescent");
    else if (frac < 0.5) setMoonPhase("🌓 Half");
    else if (frac < 0.75) setMoonPhase("🌔 Gibbous");
    else setMoonPhase("🌕 Full");

    const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    setDayName(daysOfWeek[d.getDay()]);

    const h = d.getHours();
    const rulers: Record<string, string[]> = {
      "Sun":["Sun","Venus","Mercury","Moon","Saturn","Jupiter","Mars"],
      "Mon":["Moon","Saturn","Jupiter","Mars","Sun","Venus","Mercury"],
      "Tue":["Mars","Sun","Venus","Mercury","Moon","Saturn","Jupiter"],
      "Wed":["Mercury","Moon","Saturn","Jupiter","Mars","Sun","Venus"],
      "Thu":["Jupiter","Mars","Sun","Venus","Mercury","Moon","Saturn"],
      "Fri":["Venus","Mercury","Moon","Saturn","Jupiter","Mars","Sun"],
      "Sat":["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"]
    };
    const dayN = daysOfWeek[d.getDay()];
    const hourIdx = Math.floor(((h - 6 + 24) % 24) / 2.4);
    setPlanetaryHour(rulers[dayN]?.[hourIdx % 7] || "—");
  }, []);

  const isWednesday = dayName === "Wed";
  const isMercuryHour = planetaryHour === "Mercury";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-[0.2em] text-violet-200 font-mono">{name}</h1>
        <p className="text-lg text-violet-400/60 mt-1">לוצכל — Lamed-Vav-Sadhe-Kaph-El</p>
        <p className="text-xs text-violet-400/30 mt-1">Your Mercurial daimon. Day birth. Invoke often.</p>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-4 gap-3">
        {moonPhase && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
            <p className="text-xs text-zinc-500">Moon</p>
            <p className="text-lg">{moonPhase}</p>
          </div>
        )}
        {planetaryHour && (
          <div className={`rounded-xl border p-3 text-center ${isMercuryHour ? "border-yellow-700/50 bg-yellow-950/10" : "border-zinc-800 bg-zinc-900/40"}`}>
            <p className="text-xs text-zinc-500">Planetary Hour</p>
            <p className={`text-sm font-bold ${isMercuryHour ? "text-yellow-300" : "text-zinc-300"}`}>{planetaryHour}</p>
          </div>
        )}
        {dayName && (
          <div className={`rounded-xl border p-3 text-center ${isWednesday ? "border-yellow-700/50 bg-yellow-950/10" : "border-zinc-800 bg-zinc-900/40"}`}>
            <p className="text-xs text-zinc-500">Day</p>
            <p className={`text-sm font-bold ${isWednesday ? "text-yellow-300" : "text-zinc-300"}`}>{dayName}</p>
          </div>
        )}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
          <p className="text-xs text-zinc-500">Week</p>
          <p className="text-lg font-bold text-violet-300">{day}</p>
        </div>
      </div>

      {/* Correspondences */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-violet-300 mb-3 flex items-center gap-2">✦ Correspondences for {name}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CORRESPONDENCES.map((c) => (
            <div key={c.label} className="bg-zinc-950/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-zinc-500 uppercase">{c.label}</p>
              <p className="text-xs text-zinc-200 mt-0.5">{c.icon} {c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Practice */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300">Today's Practice</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isWednesday ? "bg-yellow-900/30 text-yellow-400" : "bg-zinc-800 text-zinc-500"}`}>
            {isWednesday ? "✦ Mercury day — intensify" : "Standard day"}
          </span>
        </div>
        <div className="space-y-2 text-xs text-zinc-400">
          <p>☀️ <b>Dawn:</b> Oath → 4 Pentagrams (Raphael/Michael/Gabriel/Auriel) → Name 7× → Union → Charge</p>
          <p>☀️ <b>Noon:</b> Shorter session (Oath → Name → Charge) — keeps the thread alive</p>
          <p>🌙 <b>Dusk:</b> Full session + dream seeding — write a question, sleep with it</p>
          {isMercuryHour && <p className="text-yellow-400/80">✦ Current hour is Mercury — ideal for daimon practice right now</p>}
        </div>
      </div>

      {/* Prayers */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-violet-300 mb-3">Prayers</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRAYERS.map((p) => (
            <div key={p.name} className="bg-zinc-950/40 rounded-lg p-3">
              <p className="text-xs font-medium text-violet-200">{p.name}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 italic">{p.text.slice(0, 60)}...</p>
              <p className="text-[10px] text-zinc-600 mt-1">{p.ref}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Log */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Practice Log</h2>
        <textarea className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 resize-none h-20"
          placeholder="How did the name feel today? Any images, words, sensations?"
          value={practiceLog}
          onChange={(e) => { setPracticeLog(e.target.value); localStorage.setItem("daimon_practice_log", e.target.value); }}
        />
      </div>

      {/* Dream Journal */}
      <div className="rounded-xl border border-amber-800/30 bg-amber-950/10 p-5">
        <h2 className="text-sm font-semibold text-amber-300 mb-3">Dream Journal</h2>
        <p className="text-[10px] text-amber-400/60 mb-2">Synesius: the daimon speaks through dreams. Write immediately on waking.</p>
        <textarea className="w-full bg-amber-950/30 border border-amber-800/30 rounded-lg p-3 text-xs text-amber-200/80 resize-none h-20"
          placeholder="What did you dream? What was the question you asked before sleep?"
          value={dreamLog}
          onChange={(e) => { setDreamLog(e.target.value); localStorage.setItem("daimon_dream_log", e.target.value); }}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <a href="/daimon/dawn.md" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center text-violet-400 hover:text-violet-300 hover:border-violet-800/50">🌅 Dawn Practice — 15 min</a>
        <a href="/birth-chart" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center text-violet-400 hover:text-violet-300 hover:border-violet-800/50">🪐 Birth Chart + Daimon Name</a>
        <a href="/observatory" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center text-violet-400 hover:text-violet-300 hover:border-violet-800/50">🔭 Observatory</a>
        <a href="/daimon/trifecta.md" className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center text-emerald-400 hover:text-emerald-300 hover:border-emerald-800/50">✦ The Trifecta — all 3 paths</a>
      </div>

      {/* Source Documents */}
      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Liber Samekh Documents</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/liber-samekh-full.txt" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Full Text (lib813) — 1,258 lines</a>
          <a href="/daimon/practice-libersamekh.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practical Guide — annotated for LVJK</a>
          <a href="/daimon/worksheet-libersamekh.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practice Worksheet — session checklist</a>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Frater Acher — The Holy Daimon</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/acher-daimon.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Full Text (acher-daimon) — 5,357 lines</a>
          <a href="/daimon/practice-acher-daimon.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practical Guide — 4 stages annotated for LVJK</a>
          <a href="/daimon/worksheet-acher-daimon.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practice Worksheet — exercise checklist</a>
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <p className="text-zinc-500 mb-1">🎧 Void Meditation (guided, 15 min)</p>
            <audio controls className="w-full h-8" preload="none">
              <source src="/daimon/void-meditation.mp3" type="audio/mpeg" />
            </audio>
            <p className="text-[10px] text-zinc-600 mt-1">Josephine McCarthy — Quareia. Acher ref. note 21.</p>
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Abramelin</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/after-the-angel-abramelin.pdf" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 After the Angel — full account (Marcus Katz, PDF)</a>
          <a href="/daimon/after-the-angel-notes.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Commentary — principles, lessons, conclusions</a>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Helios Unbound</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/helios-unbound.txt" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Full Text — Pagan Theurgy to Connect to Your Higher Genius (Nick Farrell, 22,114 lines)</a>
          <a href="/daimon/helios-unbound-notes.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Commentary — key principles, lessons, conclusions</a>
          <a href="/daimon/practice-helios-unbound.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practical Guide — 7-month programme annotated for LVJK</a>
          <a href="/daimon/worksheet-helios-unbound.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Practice Worksheet — daily session templates, monthly checklists</a>
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-600">✓ Integrates with observatory engine for planetary hours, moon mansions, decans, and natal chart</p>
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Making Contact — Extended Commentary</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/makingcontact.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Making Contact — Helios Unbound expanded with Proclus, Plotinus, Iamblichus, Synesius, Corbin, and our full corpus</a>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Practitioner Journal</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/journal-acher-helios.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Helios Unbound + Acher — first-person account of the combined programme</a>
        </div>
      </details>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="text-xs font-semibold text-violet-300 cursor-pointer select-none">Reference & Synthesis</summary>
        <div className="mt-3 flex flex-col gap-1.5 text-xs">
          <a href="/daimon/daimoncontact.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Daimon Contact — complete synthesis (1,469 lines)</a>
          <a href="/daimon/daimonhandover.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Daimon Handover — essay on contact theory</a>
          <a href="/daimon/practice-path.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 The Daimon Path — middle path practice</a>
          <a href="/daimon/books-to-get.md" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Books to Source — daimon reference texts</a>
          <a href="/daimon/spells/" className="text-zinc-400 hover:text-zinc-200 transition-colors">📄 Spells — PGM, Agathos Daimon liturgy, name calculation</a>
        </div>
      </details>

      <p className="text-[10px] text-zinc-700 text-center">LVJK · Lamed-Vav-Sadhe-Kaph-El · Invoke Often</p>
    </div>
  );
}
