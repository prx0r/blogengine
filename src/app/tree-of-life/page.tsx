"use client";

import { useState } from "react";
import TreeOfLifeSVG from "@/components/TreeOfLifeSVG";
import SephirahPanel from "@/components/SephirahPanel";
import { SEPHIROTH, getSephirahByNumber } from "@/lib/tree-of-life";
import Link from "next/link";

export default function TreeOfLifePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const selectedSephirah = selected ? getSephirahByNumber(selected) ?? null : null;

  const previewSephirah = hovered
    ? getSephirahByNumber(hovered) ?? null
    : selectedSephirah;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        &larr; Feed
      </Link>

      <section className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-600 mb-2">
          Hermetic Qabalah
        </p>
        <h1 className="text-2xl font-bold mb-2">Tree of Life</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Click a sephirah to view its correspondences and add notes. Hover paths to see the Hebrew letter, Tarot card, and element. The Tree represents the ten emanations through which the Divine manifests creation.
        </p>
      </section>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
            <TreeOfLifeSVG
              selected={selected}
              onSelect={setSelected}
              hovered={hovered}
              onHover={setHovered}
            />
          </div>

          {previewSephirah && !selected && (
            <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full border border-zinc-600" style={{ backgroundColor: previewSephirah.color }} />
                <span className="text-sm font-semibold text-zinc-200">{previewSephirah.name}</span>
                <span className="text-xs text-zinc-600">{previewSephirah.hebrew}</span>
              </div>
              <p className="text-xs text-zinc-500">{previewSephirah.description}</p>
            </div>
          )}
        </div>

        <SephirahPanel sephirah={selectedSephirah} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
