// @ts-nocheck
import { getEssayWithTradition, getSource } from "@/lib/essays";

import { getGlossaryArtById } from "@/glossary/load";
import Link from "next/link";
import { notFound } from "next/navigation";
import AudioButton from "@/components/AudioButton";
import EssayReader from "@/components/EssayReader";

const label: Record<string, string> = {
  source: "Source Text",
  ai: "Commentary",
  summary: "Summary",
};

function ArtBlock({ art_id, caption }: { art_id?: string; caption?: string }) {
  if (!art_id) return null;
  const a = getGlossaryArtById(art_id);
  if (!a || !a.local_file) return null;
  return (
    <div className="float-right ml-6 mb-4 w-56 rounded-lg overflow-hidden clear-both shadow-lg">
      <img src={a.local_file} alt={a.title} className="w-full object-cover" />
      {(caption || a.title) && (
        <div className="px-3 py-2 text-[11px] text-stone-500 bg-stone-100 leading-relaxed">
          {caption || a.title}
        </div>
      )}
    </div>
  );
}

// Extract chapter markers from blocks for navigation
function extractChapters(blocks: any[]) {
  const chapters: { label: string; index: number }[] = [];
  blocks.forEach((b, i) => {
    const t = b.text;
    if (t.startsWith("◆")) {
      chapters.push({ label: t.replace("◆", "").trim(), index: i });
    }
  });
  return chapters;
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getEssayWithTradition(slug);
  if (!essay) notFound();

  const source = getSource(essay.sourceId || essay.source_ids?.[0]);
  const blocks = Array.isArray(essay.body) ? essay.body as { kind: string; text: string; art_id?: string; caption?: string }[] : null;
  const essayArt = essay.art || [];
  const isSufism = essay.tradition === "Sufism";
  const chapters = blocks ? extractChapters(blocks) : [];

  const styles = isSufism ? {
    page: "bg-stone-50 text-stone-800",
    nav: "text-stone-400 hover:text-stone-600",
    title: "text-stone-900",
    meta: "text-stone-400",
    sourceBlock: "text-stone-700 leading-[1.9] text-base",
    aiBlock: "text-stone-600 leading-[1.9] text-base",
    summaryBlock: "text-stone-400 text-sm leading-relaxed",
    sectionHeader: "text-emerald-800 font-semibold text-lg mt-10 mb-6",
    prayer: "text-emerald-700 italic leading-[2] text-base",
    sourceLabel: "text-stone-400 text-[10px] uppercase tracking-[0.15em]",
    tag: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    divider: "border-stone-200",
  } : {
    page: "",
    nav: "text-zinc-500 hover:text-zinc-300",
    title: "",
    meta: "text-zinc-500",
    sourceBlock: "text-zinc-300 leading-[1.9] text-base",
    aiBlock: "text-zinc-100 leading-[1.9] text-base",
    summaryBlock: "text-zinc-500 text-sm leading-relaxed",
    sectionHeader: "text-amber-400 font-semibold text-lg mt-10 mb-6",
    prayer: "text-amber-300 italic leading-[2] text-base",
    sourceLabel: "text-zinc-500 text-[10px] uppercase tracking-[0.15em]",
    tag: "bg-zinc-800 text-zinc-400",
    divider: "border-zinc-800",
  };

  function renderBlock(block: any, i: number) {
    const t = block.text;

    // Section headers (◆ markers)
    if (t.startsWith("◆")) {
      return (
        <div key={i} id={`ch-${i}`} className={styles.sectionHeader}>
          {t}
        </div>
      );
    }

    // Prayer / supplication detection (O Allah, O God, etc.)
    const isPrayer = /^(O Allah|O God|In the name of God|Blessings|Enable us|Know, my brethren)/.test(t.trim());

    const blockClass = block.kind === "source"
      ? styles.sourceBlock
      : block.kind === "ai"
      ? styles.aiBlock
      : styles.summaryBlock;

    const finalClass = isPrayer ? `${styles.prayer} mt-6 mb-6` : blockClass;

    return (
      <div key={i} className={finalClass}>
        {block.kind !== "ai" && !isPrayer && (
          <div className={styles.sourceLabel}>{label[block.kind] || block.kind}</div>
        )}
        <p>{t}</p>
      </div>
    );
  }

  return (
    <EssayReader essayId={slug} title={essay.title} isSufism={isSufism}>
      <div className={`flex flex-col flex-1 mx-auto w-full max-w-3xl px-6 py-12 ${isSufism ? styles.page : ""}`}>
        <nav className="mb-10 text-sm">
          <Link href="/essays" className={styles.nav}>← Essays</Link>
        </nav>

        <article className={isSufism ? "font-serif" : ""}>
          <header className="mb-12">
            <h1 className={`text-3xl font-bold mb-3 leading-tight ${styles.title}`}>
              {essay.title}
            </h1>
            <div className={`text-sm ${styles.meta} space-x-2`}>
              <span className="uppercase tracking-wider text-[11px]">
                {(essay.type || essay.category || "").replace("_", " ")}
              </span>
              {source && <><span className="text-stone-300">·</span><span>{source.title}</span></>}
              {essay.author && <><span className="text-stone-300">·</span><span>{essay.author}</span></>}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {(essay.concepts || essay.tags || []).map((t: string) => (
                <span key={t} className={`text-[11px] px-2.5 py-1 rounded-full ${styles.tag}`}>{t}</span>
              ))}
            </div>
          </header>

          {essay.audioUrl && (
            <div className="mb-10">
              <AudioButton essayId={essay.id} title={essay.title} audioUrl={essay.audioUrl} />
            </div>
          )}

          {/* Chapter navigation */}
          {chapters.length > 0 && (
            <nav className="mb-12 p-5 rounded-xl bg-stone-100/80 border border-stone-200">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 mb-3">Contents</h2>
              <div className="space-y-1.5">
                {chapters.map((ch, i) => (
                  <a
                    key={i}
                    href={`#ch-${ch.index}`}
                    className="block text-sm text-stone-600 hover:text-emerald-700 transition-colors"
                  >
                    {ch.label}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {/* Body */}
          <div className="space-y-5">
            {blocks ? blocks.map((block, i) => renderBlock(block, i)) : (
              <div
                className={isSufism ? "prose prose-stone prose-lg" : "prose prose-invert prose-lg"}
                dangerouslySetInnerHTML={{
                  __html: (essay.body as string)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\n\n/g, "</p><p>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            )}
          </div>

          {essayArt.length > 0 && (
            <div className={`mt-12 pt-8 border-t ${styles.divider}`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 mb-4">Related Art</h2>
              <div className="grid grid-cols-2 gap-4">
                {essayArt.map((aid: string) => {
                  const a = getGlossaryArtById(aid);
                  if (!a || !a.local_file) return null;
                  return (
                    <Link key={aid} href="/art" className="rounded-lg border border-stone-200 overflow-hidden hover:border-stone-400 transition-all duration-200 hover:shadow-lg">
                      <div className="aspect-square overflow-hidden bg-stone-100">
                        <img src={a.local_file} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 bg-white">
                        <div className="text-sm text-stone-700">{a.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </div>
    </EssayReader>
  );
}
