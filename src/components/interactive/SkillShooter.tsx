import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';

/**
 * Skill shooter: skills drift down as pills, a ship follows the pointer (or ←/→)
 * and fires automatically. Each hit collects the skill and says where it was used.
 */

const SKILLS: { name: string; where: string }[] = [
  { name: 'Python', where: 'every project, from memory engines to agents' },
  { name: 'MCP', where: 'Research Copilot, FoodLens, Second Brain' },
  { name: 'Neo4j', where: "AI Second Brain's temporal memory graph" },
  { name: 'pgvector', where: "AI Second Brain's embeddings" },
  { name: 'RAG', where: 'ML Textbook Chatbot, AI Second Brain' },
  { name: 'FastAPI', where: 'AI Second Brain, Multi-Agent Builder' },
  { name: 'Ollama', where: 'Research Copilot, Textbook Chatbot (local LLMs)' },
  { name: 'Groq', where: 'FoodLens, Multi-Agent Builder' },
  { name: 'Gemini', where: "AI Second Brain's agent" },
  { name: 'LangChain', where: 'ML Textbook Chatbot' },
  { name: 'ChromaDB', where: 'ML Textbook Chatbot' },
  { name: 'Hugging Face', where: 'NLP and fine-tuning at ACTECAL' },
  { name: 'OCR', where: 'drawing extraction at Igniters Hub' },
  { name: 'OpenCV', where: 'computer vision at Igniters Hub' },
  { name: 'TypeScript', where: 'this site, FoodLens' },
  { name: 'Next.js', where: 'Second Brain explorer, FoodLens server' },
  { name: 'Java', where: 'HackerRank 5 stars' },
  { name: 'C++', where: 'competitive programming' },
];

const ROUND_S = 40;
const HEIGHT = 380;

type Phase = 'intro' | 'playing' | 'done';

interface Pill { name: string; x: number; y: number; w: number; vy: number; phase: number; alive: boolean }
interface Bullet { x: number; y: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number }

export const SkillShooter: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [collected, setCollected] = useState<string[]>([]);
  const [lastHit, setLastHit] = useState<{ name: string; where: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_S);
  const [score, setScore] = useState(0);

  const start = useCallback(() => {
    setCollected([]);
    setLastHit(null);
    setScore(0);
    setTimeLeft(ROUND_S);
    setPhase('playing');
    wrapRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    const resize = () => {
      W = canvas.clientWidth;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(HEIGHT * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    ctx.font = '500 13px "JetBrains Mono", monospace';
    document.fonts?.load('500 13px "JetBrains Mono"').catch(() => {});
    const pills: Pill[] = [];
    const bullets: Bullet[] = [];
    const sparks: Spark[] = [];
    const got = new Set<string>();
    let shipX = W / 2;
    let targetX = W / 2;
    const keys = { left: false, right: false };
    let spawnT = 0;
    let fireT = 0;
    let pool = [...SKILLS].sort(() => Math.random() - 0.5);
    let poolI = 0;
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    let visible = true;
    let pts = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      targetX = Math.max(16, Math.min(W - 16, e.clientX - r.left));
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { keys.left = down; e.preventDefault(); }
      if (e.key === 'ArrowRight') { keys.right = down; e.preventDefault(); }
    };
    const kd = onKey(true);
    const ku = onKey(false);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onMove);
    wrap.addEventListener('keydown', kd);
    wrap.addEventListener('keyup', ku);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);

    const spawn = () => {
      if (poolI >= pool.length) {
        pool = [...SKILLS].sort(() => Math.random() - 0.5);
        poolI = 0;
      }
      const s = pool[poolI++];
      const w = ctx.measureText(s.name).width + 24;
      pills.push({ name: s.name, x: 12 + Math.random() * Math.max(1, W - w - 24), y: -30, w, vy: 38 + Math.random() * 30, phase: Math.random() * 6.28, alive: true });
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      const elapsed = (now - t0) / 1000;
      const left = Math.max(0, ROUND_S - elapsed);
      setTimeLeft(prev => (Math.ceil(left) !== Math.ceil(prev) ? left : prev));
      if (left <= 0) {
        cancelAnimationFrame(raf);
        setPhase('done');
        return;
      }

      // ship
      if (keys.left) targetX = Math.max(16, targetX - 420 * dt);
      if (keys.right) targetX = Math.min(W - 16, targetX + 420 * dt);
      shipX += (targetX - shipX) * Math.min(1, dt * 14);

      // fire + spawn
      fireT -= dt;
      if (fireT <= 0) { bullets.push({ x: shipX, y: HEIGHT - 34 }); fireT = 0.16; }
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = 0.75 + Math.random() * 0.5; }

      for (const b of bullets) b.y -= 520 * dt;
      for (const p of pills) { p.y += p.vy * dt; p.phase += dt * 2; }

      // collisions
      for (const p of pills) {
        if (!p.alive) continue;
        const px = Math.min(p.x, W - p.w - 4) + Math.sin(p.phase) * 6;
        for (const b of bullets) {
          if (b.y < -10) continue;
          if (b.x > px && b.x < px + p.w && b.y > p.y && b.y < p.y + 26) {
            p.alive = false;
            b.y = -100;
            pts += got.has(p.name) ? 5 : 20;
            for (let i = 0; i < 14; i++) {
              const a = Math.random() * Math.PI * 2;
              const v = 60 + Math.random() * 140;
              sparks.push({ x: px + p.w / 2, y: p.y + 13, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.3 });
            }
            if (!got.has(p.name)) {
              got.add(p.name);
              setCollected([...got]);
            }
            setLastHit(SKILLS.find(s => s.name === p.name) ?? null);
            setScore(pts);
            break;
          }
        }
      }
      for (let i = bullets.length - 1; i >= 0; i--) if (bullets[i].y < -10) bullets.splice(i, 1);
      for (let i = pills.length - 1; i >= 0; i--) if (!pills[i].alive || pills[i].y > HEIGHT + 10) pills.splice(i, 1);
      for (const s of sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.94; s.vy *= 0.94; s.life -= dt; }
      for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);

      // draw
      ctx.clearRect(0, 0, W, HEIGHT);
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      for (const p of pills) {
        p.w = ctx.measureText(p.name).width + 24; // re-measure: the web font may load after spawn
        const px = Math.min(p.x, W - p.w - 4) + Math.sin(p.phase) * 6;
        const seen = got.has(p.name);
        ctx.beginPath();
        ctx.roundRect(px, p.y, p.w, 26, 13);
        ctx.fillStyle = seen ? 'rgba(240,165,200,0.08)' : '#121212';
        ctx.fill();
        ctx.strokeStyle = seen ? 'rgba(240,165,200,0.35)' : 'rgba(240,165,200,0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = seen ? '#A3A3A3' : '#F5F5F5';
        ctx.fillText(p.name, px + 12, p.y + 13.5);
      }
      ctx.fillStyle = '#F0A5C8';
      for (const b of bullets) ctx.fillRect(b.x - 1, b.y - 8, 2, 10);
      for (const s of sparks) {
        ctx.globalAlpha = Math.max(0, s.life * 1.6);
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
      // ship: a small chevron
      ctx.beginPath();
      ctx.moveTo(shipX, HEIGHT - 40);
      ctx.lineTo(shipX + 12, HEIGHT - 18);
      ctx.lineTo(shipX, HEIGHT - 24);
      ctx.lineTo(shipX - 12, HEIGHT - 18);
      ctx.closePath();
      ctx.fillStyle = '#F0A5C8';
      ctx.fill();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      wrap.removeEventListener('keydown', kd);
      wrap.removeEventListener('keyup', ku);
    };
  }, [phase]);

  return (
    <div
      ref={wrapRef}
      tabIndex={-1}
      className="relative bg-[#0B0B0B] border border-border rounded-lg overflow-hidden outline-none"
      aria-label="Mini game: skill shooter"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-[#0E0E0E] font-mono text-xs">
        <span className="text-muted-light">skill-shooter</span>
        <div className="flex items-center gap-5 text-muted">
          <span>
            skills <span className="text-primary tabular-nums">{collected.length}</span>/{SKILLS.length}
          </span>
          <span>
            score <span className="text-accent tabular-nums">{score}</span>
          </span>
          {phase === 'playing' && (
            <>
              <span>
                time <span className="text-primary tabular-nums">{Math.ceil(timeLeft)}s</span>
              </span>
              <button
                onClick={() => setPhase('done')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border text-muted-light hover:text-primary hover:border-accent/50 transition-colors cursor-pointer"
                aria-label="Stop the game"
              >
                <Square className="w-2.5 h-2.5" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative" style={{ height: HEIGHT }}>
        <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full touch-none ${phase === 'playing' ? 'cursor-none' : ''}`} />

        {phase === 'playing' && (
          <div className="absolute left-4 right-4 top-3 font-mono text-xs pointer-events-none" aria-live="polite">
            {lastHit ? (
              <span className="text-muted-light">
                <span className="text-accent">+ {lastHit.name}</span> · {lastHit.where}
              </span>
            ) : (
              <span className="text-muted-dark">move with the mouse or ← → · the ship fires on its own</span>
            )}
          </div>
        )}

        {phase === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent text-[#080808] font-mono text-xs font-medium hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Start
            </button>
            <span className="font-mono text-[11px] text-muted-dark">shoot my skills · mouse or ← → · 40s</span>
          </div>
        )}

        {phase === 'done' && (
          <div className="absolute inset-0 overflow-y-auto p-6 sm:p-8 flex flex-col gap-4 bg-[#0B0B0B]" aria-live="polite">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <span className="font-heading text-4xl font-bold text-primary tabular-nums">{score}</span>
              <span className="font-mono text-sm text-muted-light">
                {collected.length}/{SKILLS.length} skills collected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => {
                const ok = collected.includes(s.name);
                return (
                  <span
                    key={s.name}
                    title={s.where}
                    className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
                      ok ? 'border-accent/60 bg-accent/10 text-primary' : 'border-border text-muted-dark'
                    }`}
                  >
                    {s.name}
                  </span>
                );
              })}
            </div>
            <div>
              <button
                onClick={start}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-border bg-[#121212] hover:border-accent/50 font-mono text-xs text-primary transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
