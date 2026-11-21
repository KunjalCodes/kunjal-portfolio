import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Real, sourced numbers from the projects. Values render in their final state;
 * when the band scrolls into view they count up once. If the observer never
 * fires, the final numbers are already on screen.
 */
const stats = [
  { value: 68, suffix: '×', decimals: 0, label: 'faster hybrid search on a 10,000-node memory graph', href: '/work/second-brain' },
  { value: 100, suffix: '%', decimals: 0, label: 'mean precision of the Gemini-driven memory agent across 9 eval tasks', href: '/work/second-brain' },
  { value: 49, suffix: '/49', decimals: 0, label: 'memory-quality cases passing, up from 21', href: '/work/second-brain' },
  { value: 6, suffix: '', decimals: 0, label: 'tools exposed over MCP to a local Llama 3 agent', href: '/work/mcp-ai-copilot' },
];

const useCountUp = (target: number, run: boolean, ms = 1100) => {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, ms]);
  return v;
};

const Stat: React.FC<{ s: (typeof stats)[number]; run: boolean; i: number }> = ({ s, run, i }) => {
  const v = useCountUp(s.value, run);
  return (
    <Link
      to={s.href}
      className={`spotlight group block p-6 sm:p-8 hover:bg-white/[0.02] transition-colors border-border ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
    >
      <div className="font-heading text-5xl sm:text-6xl font-bold text-primary tracking-tight tabular-nums">
        {v.toFixed(s.decimals)}
        <span className="text-accent">{s.suffix}</span>
      </div>
      <p className="mt-3 text-sm text-muted leading-relaxed max-w-[16rem] group-hover:text-muted-light transition-colors">
        {s.label}
      </p>
    </Link>
  );
};

export const StatsBand: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="reveal grid grid-cols-2 lg:grid-cols-4 border border-border rounded-xl bg-[#0B0B0B] overflow-hidden"
    >
      {stats.map((s, i) => (
        <Stat key={s.label} s={s} run={run} i={i} />
      ))}
    </div>
  );
};
