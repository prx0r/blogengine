"use client";

import { useState } from "react";
import { SEPHIROTH, PATHS, DAATH, getConnectedSephirahNumbers } from "@/lib/tree-of-life";

interface Props {
  selected: number | null;
  onSelect: (n: number | null) => void;
  hovered: number | null;
  onHover: (n: number | null) => void;
}

const RADIUS = 26;
const FONT_SIZE = 10;
const SYMBOL_SIZE = 20;
const SMALL_SIZE = 8;

export default function TreeOfLifeSVG({ selected, onSelect, hovered, onHover }: Props) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const connectedToSelected = selected ? new Set(getConnectedSephirahNumbers(selected)) : new Set<number>();
  const connectedToHovered = hovered ? new Set(getConnectedSephirahNumbers(hovered)) : new Set<number>();

  function isPathActive(path: { from: number; to: number }) {
    if (!hovered && !selected) return false;
    return (path.from === hovered || path.to === hovered || path.from === selected || path.to === selected);
  }

  function pathOpacity(path: { from: number; to: number }) {
    if (!hovered && !selected) return 0.15;
    if (hovered && (path.from === hovered || path.to === hovered)) return 0.6;
    if (selected && (path.from === selected || path.to === selected)) return 0.5;
    return 0.08;
  }

  function sephirahOpacity(seph: { number: number }) {
    if (!hovered && !selected) return 1;
    if (selected && selected === seph.number) return 1;
    if (selected && connectedToSelected.has(seph.number)) return 0.85;
    if (hovered && hovered === seph.number) return 1;
    if (hovered && connectedToHovered.has(seph.number)) return 0.8;
    return 0.3;
  }

  return (
    <svg viewBox="0 0 400 680" className="w-full h-auto max-h-[90vh]">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {PATHS.map((path) => {
        const from = SEPHIROTH[path.from - 1];
        const to = SEPHIROTH[path.to - 1];
        return (
          <g key={`${path.from}-${path.to}`}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isPathActive(path) ? "#ffcc00" : "#555"}
              strokeWidth={isPathActive(path) ? 2 : 1.2}
              opacity={pathOpacity(path)}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredPath(`${path.from}-${path.to}`)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => onSelect(path.from)}
            />
            {(hoveredPath === `${path.from}-${path.to}`) && (
              <g>
                <rect
                  x={(from.x + to.x) / 2 - 50}
                  y={(from.y + to.y) / 2 - 28}
                  width="100"
                  height="56"
                  rx="4"
                  fill="#18181b"
                  stroke="#ffcc00"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 10}
                  textAnchor="middle"
                  fill="#ffcc00"
                  fontSize={FONT_SIZE}
                  className="font-semibold"
                >
                  {path.letter} {path.letterName}
                </text>
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 + 6}
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize={SMALL_SIZE}
                >
                  {path.tarot}
                </text>
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 + 20}
                  textAnchor="middle"
                  fill="#888"
                  fontSize={SMALL_SIZE}
                >
                  {path.element}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {[DAATH].map((seph) => (
        <g key="daath" opacity={0.3}>
          <circle
            cx={seph.x} cy={seph.y} r={RADIUS}
            fill="none" stroke="#666" strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text x={seph.x} y={seph.y + 3} textAnchor="middle" fill="#666" fontSize={SMALL_SIZE} className="font-semibold">
            Da&apos;ath
          </text>
        </g>
      ))}

      {SEPHIROTH.map((seph) => {
        const isSelected = selected === seph.number;
        const isConnected = selected ? connectedToSelected.has(seph.number) : false;
        return (
          <g
            key={seph.number}
            opacity={sephirahOpacity(seph)}
            className="transition-all duration-300"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(seph.number)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(isSelected ? null : seph.number)}
          >
            <circle
              cx={seph.x} cy={seph.y} r={RADIUS}
              fill={isSelected || isConnected ? seph.color : "#1a1a2e"}
              stroke={isSelected ? "#ffcc00" : isConnected ? "#ffcc00" : "#555"}
              strokeWidth={isSelected ? 3 : isConnected ? 2 : 1.5}
              filter={isSelected ? "url(#glow)" : undefined}
            />
            <text
              x={seph.x} y={seph.y - RADIUS - 4}
              textAnchor="middle"
              fill={isSelected ? "#ffcc00" : "#888"}
              fontSize={FONT_SIZE}
              fontWeight="bold"
              className="pointer-events-none"
            >
              {seph.number}
            </text>
            <text
              x={seph.x} y={seph.y + 1}
              textAnchor="middle"
              dy="7"
              fill={seph.color === "#ffffff" ? "#fff" : isSelected || isConnected ? "#fff" : "#999"}
              fontSize={SYMBOL_SIZE}
              className="pointer-events-none"
            >
              {seph.symbol}
            </text>
            <text
              x={seph.x}
              y={seph.y + RADIUS + FONT_SIZE + 2}
              textAnchor="middle"
              fill={isSelected ? "#ffcc00" : isConnected ? "#ccc" : "#888"}
              fontSize={FONT_SIZE}
              fontWeight={isSelected ? "bold" : "normal"}
              className="pointer-events-none transition-colors duration-300"
            >
              {seph.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
