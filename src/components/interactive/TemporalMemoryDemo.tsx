import React, { useState } from 'react';

/**
 * How AI Second Brain treats changing facts, on a small example: a fact is never
 * overwritten, its validity window is closed. Drag through the year to see which
 * relationships are current, and what plain vector search would return instead.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Edge = { target: string; from: number; to: number | null; x: number; y: number; ly: number };

const edges: Edge[] = [
  { target: 'ChromaDB', from: 0, to: 4, x: 80, y: 52, ly: 28 },
  { target: 'pgvector', from: 4, to: null, x: 80, y: 168, ly: 200 },
  { target: 'Llama 3', from: 0, to: null, x: 420, y: 110, ly: 82 },
];

const CENTER = { x: 250, y: 110 };

export const TemporalMemoryDemo: React.FC = () => {
  const [month, setMonth] = useState(2); // March

  const state = (e: Edge) => (month < e.from ? 'future' : e.to !== null && month >= e.to ? 'superseded' : 'active');
  const validity = (e: Edge) => `${MONTHS[e.from]} → ${e.to === null ? 'now' : MONTHS[e.to]}`;
  const ocrNow = edges.filter(e => e.target !== 'Llama 3' && state(e) === 'active').map(e => e.target);

  return (
    <div className="bg-[#0B0B0B] border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-[#0E0E0E]">
        <div className="font-mono text-xs text-muted-light">second-brain · temporal memory</div>
        <div className="font-mono text-[11px] text-muted">
          viewing <span className="text-accent">{MONTHS[month]}</span>
        </div>
      </div>

      <svg viewBox="0 0 500 214" className="w-full h-auto px-2 pt-2" role="img" aria-label={`Memory graph in ${MONTHS[month]}`}>
        {edges.map(e => {
          const st = state(e);
          return (
            <g key={e.target}>
              <line
                x1={CENTER.x}
                y1={CENTER.y}
                x2={e.x}
                y2={e.y}
                stroke={st === 'active' ? '#F0A5C8' : '#3a3a3a'}
                strokeWidth={st === 'active' ? 2 : 1.25}
                strokeDasharray={st === 'superseded' ? '5 5' : st === 'future' ? '2 6' : undefined}
                style={{ transition: 'stroke 200ms, stroke-width 200ms' }}
              />
              <text
                x={e.x}
                y={e.ly}
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                fill={st === 'active' ? '#D4D4D4' : '#5a5a5a'}
              >
                uses · {validity(e)}
              </text>
              <rect
                x={e.x - 46}
                y={e.y - 14}
                width="92"
                height="28"
                rx="6"
                fill="#121212"
                stroke={st === 'active' ? '#F0A5C8' : '#2a2a2a'}
                strokeOpacity={st === 'active' ? 0.6 : 1}
              />
              <text x={e.x} y={e.y + 4} textAnchor="middle" fontSize="11" fill={st === 'active' ? '#F5F5F5' : '#6b6b6b'}>
                {e.target}
              </text>
            </g>
          );
        })}
        <rect x={CENTER.x - 66} y={CENTER.y - 16} width="132" height="32" rx="7" fill="#161616" stroke="#3a3a3a" />
        <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fontSize="11.5" fill="#F5F5F5">
          Study Chatbot
        </text>
      </svg>

      <div className="px-4 pb-1">
        <input
          type="range"
          min={0}
          max={11}
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="w-full accent-[#F0A5C8] cursor-pointer"
          aria-label="Month"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-dark select-none">
          {MONTHS.map((m, i) => (
            <button key={m} onClick={() => setMonth(i)} className={`cursor-pointer ${i === month ? 'text-accent' : 'hover:text-muted-light'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 font-mono text-xs">
        <div className="bg-[#080808] border border-border rounded-md p-3">
          <div className="text-[11px] text-muted mb-1.5">temporal graph answers</div>
          <div className="text-primary">
            In {MONTHS[month]}: <span className="text-accent">{ocrNow.join(', ')}</span>
          </div>
          <div className="text-[11px] text-muted-dark mt-1">old edges are closed, never deleted</div>
        </div>
        <div className="bg-[#080808] border border-border rounded-md p-3">
          <div className="text-[11px] text-muted mb-1.5">plain vector search returns</div>
          <div className="text-muted-light">ChromaDB, pgvector</div>
          <div className="text-[11px] text-muted-dark mt-1">both look relevant; no idea which is current</div>
        </div>
      </div>
    </div>
  );
};
