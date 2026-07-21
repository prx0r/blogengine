import Link from "next/link";
import { getVisibleElements, getElement } from "@/lib/data";

export default function ElementsLanding() {
  const elements = getVisibleElements();
  const spirit = getElement("spirit");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">
          Soul Mirror
        </p>
        <h1 className="text-2xl font-bold mb-2">Elemental Inventory</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          A Bardon-inspired soul mirror classified through the four elements,
          with Jungian archetypes. Each element has its own page with scenes,
          themes, archetypes, and vows.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {elements.map((element) => (
          <Link
            key={element.id}
            href={`/elements/${element.id}`}
            className={`group block rounded-xl border ${element.borderColor} bg-gradient-to-br ${element.bgGradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-start gap-4">
              <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                <img src={element.symbolSvg} alt={element.name} className="h-10 w-10 sm:h-12 sm:w-12" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">{element.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {element.tagline}
                </p>
                <span className="mt-3 inline-block rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/50 transition-colors group-hover:border-white/40 group-hover:text-white/70">
                  Explore &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {spirit && (
        <Link
          href={`/elements/${spirit.id}`}
          className={`group block rounded-xl border ${spirit.borderColor} bg-gradient-to-br ${spirit.bgGradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
        >
          <div className="flex items-start gap-4">
            <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <img src={spirit.symbolSvg} alt={spirit.name} className="h-10 w-10 sm:h-12 sm:w-12" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">{spirit.name}</h2>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                {spirit.tagline}
              </p>
              <span className="mt-3 inline-block rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/50 transition-colors group-hover:border-white/40 group-hover:text-white/70">
                Explore &rarr;
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-8 border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-600 leading-relaxed">
          Method: Scenes first, themes second, archetypes third, vows fourth.
          Click an element to explore its profile, then flip the card to write
          personal notes.
        </p>
      </div>
    </div>
  );
}
