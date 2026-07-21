import Link from "next/link";

const rituals = [
  {
    slug: "kabbalistic-cross",
    title: "Kabbalistic Cross",
    subtitle: "The Opening",
    description: "The foundational centering ritual that establishes the sphere of light around the practitioner.",
  },
  {
    slug: "lbrp",
    title: "Lesser Ritual of the Pentagram",
    subtitle: "LBRP",
    description: "The primary banishing and invoking ritual of the Hermetic tradition. Establishes a purified temple space.",
  },
];

export default function RitualsLanding() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">
          Practice
        </p>
        <h1 className="text-2xl font-bold mb-2">Rituals</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Core ceremonial forms of the Western Hermetic tradition.
        </p>
      </section>

      <div className="grid gap-4">
        {rituals.map((ritual) => (
          <Link
            key={ritual.slug}
            href={`/rituals/${ritual.slug}`}
            className="group block rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-5 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl"
          >
            <h2 className="text-lg font-bold text-zinc-100 group-hover:text-accent transition-colors">
              {ritual.title}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">{ritual.subtitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {ritual.description}
            </p>
            <span className="mt-3 inline-block rounded-full border border-zinc-700 px-3 py-0.5 text-xs text-zinc-500 transition-colors group-hover:border-zinc-500 group-hover:text-zinc-300">
              Read &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
