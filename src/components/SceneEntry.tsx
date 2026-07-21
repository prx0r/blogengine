import { SceneEntry as SceneEntryType } from '@/lib/types';

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <p className="mt-0.5 text-sm leading-relaxed text-zinc-300">{value}</p>
    </div>
  );
}

export default function SceneEntry({ entry }: { entry: SceneEntryType }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 space-y-2.5 shadow-sm transition-colors hover:border-zinc-700/60">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/50" />
        <h4 className="font-medium text-zinc-100">{entry.title}</h4>
      </div>
      <Row label="Incident" value={entry.incident} />
      <Row label="Expression" value={entry.expression} />
      <Row label="Body-feel" value={entry.bodyFeel} />
      <Row label="Result" value={entry.result} />
      <Row label="Purified quality" value={entry.purifiedQuality} />
      <Row label="Hidden need" value={entry.hiddenNeed} />
      <Row label="Purified counterpart" value={entry.purifiedCounterpart} />
      <Row label="Action avoided" value={entry.actionAvoided} />
      <Row label="Replaced by" value={entry.replacedFire} />
      <Row label="Cost" value={entry.cost} />
      <Row label="Correction" value={entry.fireCorrection} />
    </div>
  );
}
