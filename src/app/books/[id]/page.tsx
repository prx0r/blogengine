import Link from "next/link";
import { notFound } from "next/navigation";
import { albums } from "@/lib/albums";

export function generateStaticParams() {
  return albums.map((a) => ({ id: a.id }));
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = albums.find((a) => a.id === id);
  if (!album) notFound();

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/books" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Books
        </Link>
      </nav>

      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-36 rounded border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0">
          <span className="text-3xl opacity-20">📖</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{album.title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{album.author}</p>
          <p className="text-xs text-zinc-500 mt-2">{album.description}</p>
          <p className="text-xs text-zinc-600 mt-1">{album.essays.length} essays · Two-voice audio</p>
        </div>
      </div>

      <div className="space-y-2">
        {album.essays.map((essay, i) => (
          <Link
            key={essay.id}
            href={`/essay/${essay.id}`}
            className="flex items-center gap-3 rounded border border-zinc-800 px-4 py-3 hover:border-zinc-600 transition-colors group"
          >
            <span className="text-xs text-zinc-600 w-6 shrink-0 text-right">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-200 truncate group-hover:text-zinc-100 transition-colors">
                {essay.title}
              </div>
              <div className="text-xs text-zinc-600">{essay.id}</div>
            </div>
            <span className="text-xs text-zinc-500 shrink-0">
              {essay.audioUrl ? "▶ Audio" : "Read →"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
