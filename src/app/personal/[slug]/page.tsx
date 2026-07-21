import { notFound } from "next/navigation";
import Link from "next/link";
import { getDayBySlug, days } from "@/lib/diary";

export function generateStaticParams() {
  return days.map((day) => ({ slug: day.slug }));
}

export default async function DiaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const day = getDayBySlug(slug);
  if (!day) notFound();

  const paragraphs = day.content.split("\n\n").filter(Boolean);

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-8 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Feed
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">{day.title}</h1>

      <div className="prose text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
