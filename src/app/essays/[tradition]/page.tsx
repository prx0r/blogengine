// @ts-nocheck
import { getEssays, getEssayTraditionById, type Tradition } from "@/lib/essays";
import Link from "next/link";
import { notFound } from "next/navigation";

const HIDDEN_IDS = new Set(["becoming_an_angel"]);

const TRADITION_META: Record<string, { label: string; symbol: string; color: string }> = {
  sufism: { label: "Sufism", symbol: "☾", color: "emerald" },
  platonism: { label: "Platonism", symbol: "◇", color: "indigo" },
  occult: { label: "Occult", symbol: "△", color: "amber" },
  tantra: { label: "Tantra", symbol: "🜍", color: "emerald" },
  other: { label: "Other", symbol: "○", color: "stone" },
};

const COLOR_MAP: Record<string, { text: string; border: string; bg: string; badge: string }> = {
  emerald: { text: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  indigo: { text: "text-indigo-700", border: "border-indigo-200", bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  amber: { text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  stone: { text: "text-stone-700", border: "border-stone-200", bg: "bg-stone-50", badge: "bg-stone-100 text-stone-700" },
};

export function generateStaticParams() {
  return Object.keys(TRADITION_META).map(tradition => ({ tradition }));
}

export default async function TraditionPage({ params }: { params: Promise<{ tradition: string }> }) {
  const { tradition } = await params;
  const meta = TRADITION_META[tradition];
  if (!meta) notFound();

  const colors = COLOR_MAP[meta.color];
  const allEssays = getEssays();
  const traditionEssays = allEssays
    .filter(e => !HIDDEN_IDS.has(e.id) && getEssayTraditionById(e.id) === meta.label as Tradition)
    .sort((a, b) => a.title.localeCompare(b.title));

  // Group by author, sorted by essay count (descending)
  const groups: Record<string, any[]> = {};
  for (const e of traditionEssays) {
    const author = e.author || "Unknown";
    if (!groups[author]) groups[author] = [];
    groups[author].push(e);
  }
  const authorGroups = Object.entries(groups)
    .sort(([, a], [, b]) => b.length - a.length);

  const isSufism = tradition === "sufism" || tradition === "tantra";

  return (
    <div className={`flex flex-col flex-1 mx-auto w-full max-w-4xl px-6 py-16 ${isSufism ? "bg-stone-50" : ""}`}>
      <nav className="mb-12 text-sm">
        <Link href="/essays" className="text-stone-400 hover:text-stone-600 transition-colors">
          ← All Traditions
        </Link>
      </nav>

      <div className="mb-12">
        <div className={`text-4xl mb-4 ${isSufism ? "text-emerald-600" : meta.color === "indigo" ? "text-indigo-500" : meta.color === "amber" ? "text-amber-500" : "text-stone-500"}`}>
          {meta.symbol}
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isSufism ? "text-stone-900" : "text-zinc-100"}`}>{meta.label}</h1>
        <p className={`text-sm ${isSufism ? "text-stone-500" : "text-zinc-500"}`}>
          {traditionEssays.length} {traditionEssays.length === 1 ? "essay" : "essays"}
        </p>
      </div>

      {/* Author grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authorGroups.map(([author, essays]) => (
          <div
            key={author}
            className={`rounded-xl border p-5 transition-all duration-200 hover:shadow-lg ${
              isSufism
                ? "border-stone-200 bg-white hover:border-stone-300"
                : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className={`font-semibold text-sm ${isSufism ? "text-stone-800" : "text-zinc-200"}`}>
                {author}
              </h2>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isSufism ? "bg-stone-100 text-stone-500" : "bg-zinc-800 text-zinc-500"
              }`}>
                {essays.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {essays.map(essay => (
                <Link
                  key={essay.id}
                  href={`/essay/${essay.id}`}
                  className={`block text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                    isSufism
                      ? "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <span>{essay.title}</span>
                  {essay.audioUrl && (
                    <span className={`ml-1.5 ${isSufism ? "text-emerald-500" : "text-green-500"}`}>▶</span>
                  )}
                  {essay.type === "thesis_essay" && (
                    <span className={`ml-1.5 text-[10px] ${isSufism ? "text-amber-600" : "text-amber-500"}`}>Book</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sufism PDFs section */}
      {tradition === "sufism" && (
        <div className="mt-16 pt-8 border-t border-stone-200">
          <h2 className={`text-sm font-semibold mb-4 ${isSufism ? "text-stone-700" : "text-zinc-200"}`}>
            Source PDFs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { title: "Suhrawardi — The Philosophy of Illumination", file: "/pdfs/suhrawardi-philosophy-of-illumination.pdf" },
              { title: "Suhrawardi — The Book of Radiance", file: "/pdfs/suhrawardi-book-of-radiance.pdf" },
              { title: "Qutb al-Din Shirazi — The Science of Mystic Lights", file: "/pdfs/qutb-al-din-shirazi-science-of-mystic-lights.pdf" },
              { title: "James W. Morris — Ibn Arabi on the Barzakh", file: "/pdfs/morris-ibn-arabi-barzakh.pdf" },
              { title: "Henry Corbin — Mundus Imaginalis", file: "/pdfs/mundus-imaginalis.pdf" },
              { title: "Angela Voss — Becoming an Angel", file: "/pdfs/becoming-an-angel-mundus-imaginalis.pdf" },
            ].map(pdf => (
              <a
                key={pdf.file}
                href={pdf.file}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 rounded-lg border p-3 transition-colors text-sm ${
                  isSufism ? "border-stone-200 bg-white hover:border-stone-400 text-stone-600" : "border-zinc-800 hover:border-zinc-600 text-zinc-300"
                }`}
              >
                <span>📄</span>
                <span className="truncate">{pdf.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
