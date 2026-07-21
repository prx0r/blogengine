import Link from "next/link";

const practices = [
  {
    slug: "ajahn-lee-method-1",
    title: "Ajahn Lee: Method 1",
    subtitle: "Breath meditation — the bases of the breath",
    description: "A step-by-step method for centering the mind through refined awareness of the breath, giving rise to nimitta and knowledge.",
  },
];

export default function MeditationLanding() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">
          Practice
        </p>
        <h1 className="text-2xl font-bold mb-2">Meditation</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Breath meditation methods from the Thai Forest Tradition.
        </p>
      </section>

      <div className="grid gap-4">
        {practices.map((p) => (
          <Link
            key={p.slug}
            href={`/meditation/${p.slug}`}
            className="group block rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-5 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl"
          >
            <h2 className="text-lg font-bold text-zinc-100 group-hover:text-accent transition-colors">
              {p.title}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">{p.subtitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {p.description}
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
