import { getGlossaryConcepts, getGlossaryArt } from "@/glossary/load";
import Link from "next/link";

export default function GlossaryPage() {
  const concepts = getGlossaryConcepts();
  const art = getGlossaryArt();

  function artByConcept(conceptName: string) {
    return art.filter(a => a.concepts?.includes(conceptName));
  }

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Home
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Concepts</h1>

      {concepts.length > 0 && (
        <div className="space-y-3">
          {concepts.map(c => {
            const conceptArt = artByConcept(c.name);
            return (
              <div key={c.id} className="rounded border border-zinc-800 p-3">
                <div className="text-sm font-medium text-zinc-200">{c.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{c.definition}</div>
                {c.synonyms && c.synonyms.length > 0 && (
                  <div className="text-[11px] text-zinc-600 mt-1">
                    Synonyms: {Array.isArray(c.synonyms) ? c.synonyms.join(", ") : c.synonyms}
                  </div>
                )}
                {c.related_to && c.related_to.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Array.from(new Set(Array.isArray(c.related_to) ? c.related_to : [c.related_to].filter(Boolean))).map(r => (
                      <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{r}</span>
                    ))}
                  </div>
                )}
                {conceptArt.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {conceptArt.map(a => a.local_file && (
                      <img key={a.id} src={a.local_file} alt={a.title}
                        className="h-16 w-16 rounded object-cover shrink-0 border border-zinc-800" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {concepts.length === 0 && (
        <p className="text-sm text-zinc-600">No concepts yet. Process a source to create concepts.</p>
      )}
    </div>
  );
}
