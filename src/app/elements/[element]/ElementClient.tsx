'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { getElement, getVisibleElements } from '@/lib/data';
import TabNav from '@/components/TabNav';
import FlipCard from '@/components/FlipCard';
import SceneEntry from '@/components/SceneEntry';

export default function ElementClient() {
  const params = useParams();
  const element = getElement(params.element as string);

  if (!element) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-5xl">?</p>
        <h1 className="text-xl font-bold text-zinc-100">Element not found</h1>
        <Link
          href="/elements"
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          &larr; All Elements
        </Link>
      </div>
    );
  }

  const allElements = getVisibleElements();
  const [activeTab, setActiveTab] = useState(element.tabs[0].id);
  const tab = element.tabs.find((t) => t.id === activeTab);
  if (!tab) return null;

  return (
    <div className="flex flex-col flex-1">
      {/* Element header */}
      <div className={`bg-gradient-to-b ${element.bgGradient} border-b border-zinc-800`}>
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
          <Link
            href="/elements"
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            &larr; All Elements
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <span className="symbol-glow">
              <img src={element.symbolSvg} alt={element.name} className="h-14 w-14 sm:h-16 sm:w-16" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {element.name}
              </h1>
              <p className="mt-1 text-sm text-white/50">{element.tagline}</p>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/30">
            {element.description}
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            {allElements.filter(e => e.id !== element.id).map((e) => (
              <Link
                key={e.id}
                href={`/elements/${e.id}`}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition-colors hover:border-white/30 hover:text-white/60"
              >
                {e.symbol} {e.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <TabNav
            tabs={element.tabs.map((t) => ({ id: t.id, label: t.label }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl px-4 py-6 flex-1">
        <FlipCard storageKey={`${element.id}-${activeTab}`}>
          {/* Overview */}
          <div className="mb-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {tab.content.overview}
            </p>
          </div>

          {/* Key Questions */}
          {tab.content.keyQuestions && tab.content.keyQuestions.length > 0 && (
            <details className="group mb-5">
              <summary className="cursor-pointer text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300">
                Key Questions &darr;
              </summary>
              <ul className="mt-3 space-y-2 pl-4">
                {tab.content.keyQuestions.map((q, i) => (
                  <li key={i} className="list-disc text-sm leading-relaxed text-zinc-400">
                    {q}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Scene Entries */}
          {tab.content.entries && tab.content.entries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Scenes
              </h3>
              {tab.content.entries.map((entry, i) => (
                <SceneEntry key={i} entry={entry} />
              ))}
            </div>
          )}

          {/* Archetypes */}
          {tab.content.archetypes && tab.content.archetypes.length > 0 && (
            <div className="mt-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Archetypes
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {tab.content.archetypes.map((arch, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div className="mb-2 text-2xl">{arch.symbol || element.symbol}</div>
                    <h4 className="font-semibold text-zinc-100">{arch.name}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {arch.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archetype Profiles */}
          {tab.content.archetypeProfiles && tab.content.archetypeProfiles.length > 0 && (
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                My Profile
              </h3>
              {tab.content.archetypeProfiles.map((profile, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 space-y-1.5">
                  {profile.relateTo && (
                    <p className="text-sm text-zinc-300">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Relate to: </span>
                      {profile.relateTo}
                    </p>
                  )}
                  {profile.fear && (
                    <p className="text-sm text-zinc-300">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Fear: </span>
                      {profile.fear}
                    </p>
                  )}
                  {profile.distortion && (
                    <p className="text-sm text-zinc-300">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Distortion: </span>
                      {profile.distortion}
                    </p>
                  )}
                  {profile.cultivate && (
                    <p className="text-sm text-zinc-300">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Cultivate: </span>
                      {profile.cultivate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vows */}
          {tab.content.vows && tab.content.vows.length > 0 && (
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Vows
              </h3>
              {tab.content.vows.map((vow, i) => (
                <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    &ldquo;{vow.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Compound Elements */}
          {tab.content.compoundElements && tab.content.compoundElements.length > 0 && (
            <div className="mt-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Compound Elements
              </h3>
              {tab.content.compoundElements.map((ce, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                  <h4 className="font-semibold text-zinc-100">{ce.name}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-green-400/60">+</p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-300">{ce.positive}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-red-400/60">&minus;</p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-300">{ce.negative}</p>
                    </div>
                  </div>
                  {ce.note && (
                    <p className="mt-3 border-t border-zinc-800 pt-3 text-xs italic leading-relaxed text-zinc-500">
                      {ce.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </FlipCard>
      </div>
    </div>
  );
}
