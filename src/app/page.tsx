"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Entry {
  id: string;
  distilled_title: string;
  distilled_body: string;
  category: string;
  created_at: string;
  original_url: string;
}

const categories = ["all", "complexity", "consciousness", "cogsci", "dhamma"] as const;
const PAGE_SIZE = 20;

export default function FeedPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchEntries = useCallback(async (pageNum: number, category: string) => {
    const params = new URLSearchParams();
    params.set("offset", String(pageNum * PAGE_SIZE));
    params.set("limit", String(PAGE_SIZE));
    if (category !== "all") params.set("category", category);

    const res = await fetch(`/api/entries?${params}`);
    if (!res.ok) return [];
    return res.json() as Promise<Entry[]>;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEntries([]);
      setPage(0);
      setHasMore(true);
      fetchEntries(0, activeCategory).then((data) => {
        setEntries(data);
        if (data.length < PAGE_SIZE) setHasMore(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeCategory, fetchEntries]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          fetchEntries(nextPage, activeCategory).then((data) => {
            if (data.length > 0) {
              setEntries((prev) => [...prev, ...data]);
              setPage(nextPage);
            } else {
              setHasMore(false);
            }
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, activeCategory, fetchEntries]);

  const truncated = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`} alt="" className="h-7 inline-block align-text-bottom" />
        </h1>
        <nav className="flex gap-4 mt-4 text-sm">
          <Link href="/sources" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Sources
          </Link>
          <Link href="/elements" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Elements
          </Link>
        </nav>
      </header>

      <div className="sticky top-0 z-10 pb-4 bg-background flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/entry/${entry.id}`}
            className="block group"
          >
            <article className="border-b border-zinc-800 pb-6">
              <span className="text-xs text-zinc-600 uppercase tracking-wider">
                {entry.category}
              </span>
              <h2 className="text-lg font-semibold mt-1 group-hover:text-accent transition-colors">
                {entry.distilled_title}
              </h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {truncated(entry.distilled_body, 280)}
              </p>
              <time className="text-xs text-zinc-600 mt-2 block">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </article>
          </Link>
        ))}
      </div>

      <div ref={loaderRef} className="py-8 text-center text-sm text-zinc-600">
        {hasMore ? "Loading…" : "No more entries"}
      </div>
    </div>
  );
}
