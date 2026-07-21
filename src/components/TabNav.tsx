'use client';

export default function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex gap-1 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1.5 shadow-sm min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
              activeTab === tab.id
                ? 'bg-zinc-700/60 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
