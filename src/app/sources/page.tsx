"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Source {
  id: string;
  url: string;
  name: string;
  kind: string;
  category: string;
  active: boolean;
  last_checked: string | null;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"rss" | "scrape">("rss");
  const [newCategory, setNewCategory] = useState("unsorted");

  async function loadSources() {
    const res = await fetch("/api/sources");
    setSources(await res.json());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSources();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function toggleActive(source: Source) {
    await fetch("/api/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: source.id, active: !source.active }),
    });
    setSources((prev) =>
      prev.map((s) => (s.id === source.id ? { ...s, active: !s.active } : s))
    );
  }

  async function removeSource(id: string) {
    await fetch(`/api/sources?id=${id}`, { method: "DELETE" });
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  async function addSource(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl || !newName) return;
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl, name: newName, kind: newKind, category: newCategory }),
    });
    const data = await res.json();
    setSources((prev) => [...prev, data]);
    setNewUrl("");
    setNewName("");
  }

  return (
    <div className="flex flex-col flex-1 mx-auto w-full max-w-[640px] px-4 py-8">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Feed
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Sources</h1>

      <form onSubmit={addSource} className="flex flex-wrap gap-2 mb-8">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL"
          className="flex-1 min-w-[200px] rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none focus:border-zinc-500"
          required
        />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name"
          className="w-32 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none focus:border-zinc-500"
          required
        />
        <select
          value={newKind}
          onChange={(e) => setNewKind(e.target.value as "rss" | "scrape")}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
        >
          <option value="rss">RSS</option>
          <option value="scrape">Scrape</option>
        </select>
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
        >
          <option value="unsorted">Unsorted</option>
          <option value="complexity">Complexity</option>
          <option value="consciousness">Consciousness</option>
          <option value="cogsci">CogSci</option>
          <option value="dhamma">Dhamma</option>
        </select>
        <button
          type="submit"
          className="rounded bg-zinc-100 text-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 transition-colors"
        >
          Add
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500 border-b border-zinc-800">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Kind</th>
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 font-medium">Active</th>
            <th className="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b border-zinc-800/50">
              <td className="py-2 pr-2">
                <span className="text-zinc-300">{source.name}</span>
                <span className="block text-xs text-zinc-600 truncate max-w-[200px]">
                  {source.url}
                </span>
              </td>
              <td className="py-2 pr-2 text-zinc-500">{source.kind}</td>
              <td className="py-2 pr-2 text-zinc-500">{source.category}</td>
              <td className="py-2 pr-2">
                <button
                  onClick={() => toggleActive(source)}
                  className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                    source.active
                      ? "bg-green-900/50 text-green-400"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {source.active ? "On" : "Off"}
                </button>
              </td>
              <td className="py-2">
                <button
                  onClick={() => removeSource(source.id)}
                  className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
