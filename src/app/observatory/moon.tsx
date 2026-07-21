"use client";

interface MoonPhaseProps {
  phase: number;
  size?: number;
}

export default function MoonPhase({ phase, size = 64 }: MoonPhaseProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const normalized = ((phase % 360) + 360) % 360;
  const illumination = 0.5 * (1 - Math.cos((normalized * Math.PI) / 180));
  const isWaxing = normalized < 180;

  const litPath = (() => {
    if (illumination < 0.01) return <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />;
    if (illumination > 0.99) return <circle cx={cx} cy={cy} r={r} fill="#e8d8a0" />;

    const arcR = r;
    const flag = isWaxing ? 0 : 1;
    const x1 = cx - r;
    const x2 = cx + r;
    const y1 = cy;
    const y2 = cy;
    const litWidth = (isWaxing ? illumination : 1 - illumination) * 2 * r;
    const litX = isWaxing ? cx - r + litWidth : cx + r - litWidth;

    if (normalized < 180) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />
          <path d={`M ${litX} ${cy - r} A ${r} ${r} 0 0 1 ${litX} ${cy + r} A ${litWidth / 2} ${r} 0 0 0 ${litX} ${cy - r}`} fill="#e8d8a0" />
        </g>
      );
    }
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="#e8d8a0" />
        <path d={`M ${litX} ${cy - r} A ${r} ${r} 0 0 0 ${litX} ${cy + r} A ${Math.abs(r - litWidth / 2)} ${r} 0 0 1 ${litX} ${cy - r}`} fill="#1a1a2e" />
      </g>
    );
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8d8a0" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#e8d8a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 4} fill="url(#moonGlow)" />
      {litPath}
    </svg>
  );
}
