import { getGlossaryArt } from "@/glossary/load";
import Link from "next/link";

export default function ArtPage() {
  const art = getGlossaryArt();
  const withImages = art.filter(a => a.local_file);
  const withoutImages = art.filter(a => !a.local_file);

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[900px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Home
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-2">Art Library</h1>
      <p className="text-sm text-zinc-500 mb-6">{art.length} items · Symbolically indexed visual corpus</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {withImages.map(a => (
          <div key={a.id} className="rounded border border-zinc-800 overflow-hidden bg-zinc-900/50 group hover:border-zinc-600 transition-colors">
            <div className="aspect-square overflow-hidden bg-zinc-950">
              <img src={a.local_file} alt={a.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 space-y-2">
              <div className="text-sm font-medium text-zinc-200 leading-tight">{a.title}</div>
              {a.artist && <div className="text-xs text-zinc-500">{a.artist}{a.date ? ` · ${a.date}` : ""}</div>}
              {a.description && (
                <div className="text-xs text-zinc-500 line-clamp-2">{a.description}</div>
              )}
              {a.concepts && a.concepts.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {a.concepts.map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">{c}</span>
                  ))}
                </div>
              )}
              {a.visual_motifs && a.visual_motifs.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {a.visual_motifs.map(m => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-600 italic">{m}</span>
                  ))}
                </div>
              )}
              {a.license && (
                <div className="text-[10px] text-zinc-600">{a.license}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {withoutImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Needs Images ({withoutImages.length})
          </h2>
          <p className="text-xs text-zinc-600 mb-3">These entries have metadata but no image file yet.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {withoutImages.map(a => (
              <div key={a.id} className="rounded border border-zinc-800 overflow-hidden bg-zinc-900/50">
                <div className="aspect-square bg-zinc-950 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2 opacity-20">🖼</div>
                    <div className="text-[10px] text-zinc-700">{a.id}</div>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-sm font-medium text-zinc-300 leading-tight">{a.title}</div>
                  {a.concepts && (
                    <div className="flex gap-1 flex-wrap">
                      {a.concepts.map(c => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase tracking-wider">{c}</span>
                      ))}
                    </div>
                  )}
                  {a.source_url && (
                    <a href={a.source_url} target="_blank"
                      className="text-[10px] text-zinc-600 hover:text-zinc-400 block truncate">
                      Source ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
