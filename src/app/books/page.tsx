import Link from "next/link";
import { albums } from "@/lib/albums";

export default function BooksPage() {
  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[900px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Home
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-2">Books</h1>
      <p className="text-sm text-zinc-500 mb-6">Thesis companions — complete audio essay sequences</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/books/${album.id}`}
            className="group rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-600 transition-colors"
          >
            <div className="aspect-[2/3] bg-zinc-950 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-30">📖</div>
                <div className="text-xs text-zinc-600 uppercase tracking-wider">{album.author}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{album.title}</div>
              <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{album.description}</div>
              <div className="text-xs text-zinc-600 mt-2">{album.essays.length} essays</div>
            </div>
          </Link>
        ))}
      </div>

      {albums.length === 0 && (
        <p className="text-sm text-zinc-600">No books yet.</p>
      )}
    </div>
  );
}
