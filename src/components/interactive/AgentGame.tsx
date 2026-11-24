import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RotateCcw, X, Zap } from 'lucide-react';

/**
 * "Be the agent": route each request to the right tool before the timer runs out.
 * Every tool comes from one of Kunjal's projects; a correct answer reveals which one.
 */

interface Round {
  request: string;
  tool: string;
  fact: string;
  project: { name: string; slug: string };
}

const ROUNDS: Round[] = [
  {
    request: "What's the weather in Mumbai right now?",
    tool: 'get_weather',
    fact: 'My MCP copilot exposes this as a tool to a local Llama 3. In a real session it answered: 27.5°C, wind 10.7 km/h.',
    project: { name: 'AI Research Copilot', slug: 'mcp-ai-copilot' },
  },
  {
    request: 'What did we switch our vector store to in May?',
    tool: 'search_memory',
    fact: 'AI Second Brain keeps every fact with a validity window, so it knows what changed and when instead of returning both answers.',
    project: { name: 'AI Second Brain', slug: 'second-brain' },
  },
  {
    request: 'Add the ingredients from this recipe video to my cart',
    tool: 'add_to_cart',
    fact: 'FoodLens reads the YouTube transcript, extracts ingredients with Llama 3.3 70B and fills a Swiggy Instamart cart over MCP.',
    project: { name: 'FoodLens', slug: 'food-lens' },
  },
  {
    request: 'Build me a calculator web app',
    tool: 'build_project',
    fact: 'Multi-Agent Builder runs five agents (classify, plan, architect, code, enhance), writes the files and launches the app.',
    project: { name: 'Multi-Agent Builder', slug: 'multi-agent-builder' },
  },
  {
    request: 'Explain overfitting, using the ML textbook',
    tool: 'search_textbook',
    fact: 'My RAG chatbot answers only from the book: the top 3 chunks from ChromaDB, or it says "I don’t know".',
    project: { name: 'ML Textbook Chatbot', slug: 'rag-ml-textbook-chatbot' },
  },
  {
    request: 'Calculate 5 times 8',
    tool: 'calculate',
    fact: 'Small models are bad at arithmetic, so my copilot hands it to a calculate tool over MCP. It returned 40.0.',
    project: { name: 'AI Research Copilot', slug: 'mcp-ai-copilot' },
  },
];

const ALL_TOOLS = ['get_weather', 'search_memory', 'add_to_cart', 'build_project', 'search_textbook', 'calculate', 'wiki_search', 'save_note'];
const ROUND_MS = 10000;

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const optionsFor = (r: Round) => shuffle([r.tool, ...shuffle(ALL_TOOLS.filter(t => t !== r.tool)).slice(0, 3)]);

type Phase = 'intro' | 'playing' | 'answered' | 'done';

export const AgentGame: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [order, setOrder] = useState<Round[]>(ROUNDS);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const roundStart = useRef(0);

  const round = order[index];

  const startRound = useCallback((r: Round) => {
    setOptions(optionsFor(r));
    setPicked(null);
    setTimeLeft(ROUND_MS);
    roundStart.current = performance.now();
    setPhase('playing');
  }, []);

  const start = () => {
    const o = shuffle(ROUNDS);
    setOrder(o);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    startRound(o[0]);
    boxRef.current?.focus({ preventScroll: true });
  };

  const answer = useCallback(
    (tool: string | null) => {
      if (phase !== 'playing' || !round) return;
      setPicked(tool ?? '');
      if (tool === round.tool) {
        const left = Math.max(0, ROUND_MS - (performance.now() - roundStart.current));
        const gain = 100 + Math.round(left / 100) + streak * 25;
        setScore(s => s + gain);
        setLastGain(gain);
        setCorrect(c => c + 1);
        setStreak(s => {
          const n = s + 1;
          setBestStreak(b => Math.max(b, n));
          return n;
        });
      } else {
        setLastGain(0);
        setStreak(0);
      }
      setPhase('answered');
    },
    [phase, round, streak],
  );

  const next = useCallback(() => {
    if (index + 1 >= order.length) {
      setPhase('done');
      return;
    }
    setIndex(i => i + 1);
    startRound(order[index + 1]);
  }, [index, order, startRound]);

  // keep keyboard focus where it is useful: the game while playing, Next after answering
  useEffect(() => {
    if (phase === 'playing') boxRef.current?.focus({ preventScroll: true });
    if (phase === 'answered') nextRef.current?.focus({ preventScroll: true });
  }, [phase, index]);

  // round timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      const left = ROUND_MS - (performance.now() - roundStart.current);
      if (left <= 0) {
        setTimeLeft(0);
        answer(null);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, answer]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase === 'playing') {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) {
        e.preventDefault();
        answer(options[n - 1]);
      }
    }
  };

  const pct = (timeLeft / ROUND_MS) * 100;
  const wasRight = phase === 'answered' && picked === round?.tool;
  const timedOut = phase === 'answered' && picked === '';

  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="spotlight relative bg-[#0B0B0B] border border-border rounded-xl overflow-hidden outline-none"
      aria-label="Mini game: be the agent"
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-b border-border bg-[#0E0E0E] font-mono text-xs">
        <span className="text-muted-light">be-the-agent</span>
        <div className="flex items-center gap-5 text-muted">
          {phase !== 'intro' && phase !== 'done' && (
            <span>
              round <span className="text-primary">{index + 1}</span>/{order.length}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent" />
            streak <span className="text-primary tabular-nums">{streak}</span>
          </span>
          <span>
            score <span className="text-accent tabular-nums">{score}</span>
          </span>
        </div>
      </div>

      {/* timer */}
      <div className="h-[2px] bg-white/[0.04]" aria-hidden="true">
        {phase === 'playing' && (
          <div
            className={`h-full transition-[width] duration-100 ease-linear ${pct < 30 ? 'bg-red-400' : 'bg-accent'}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      <div className="p-5 sm:p-8 min-h-[340px] flex flex-col">
        {phase === 'intro' && (
          <div className="flex-1 flex flex-col items-start justify-center gap-5 max-w-2xl">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-primary tracking-tight">You are the agent.</h3>
            <p className="text-muted leading-relaxed">
              A request comes in. You have 10 seconds to call the right tool, the same decision every agent I build makes
              before it answers. Six rounds, points for speed, bonus for streaks. Each tool comes from one of my projects.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-[#080808] font-mono text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
              >
                Start
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="hidden sm:inline font-mono text-xs text-muted-dark">keys 1–4 to answer · Enter for next</span>
            </div>
          </div>
        )}

        {(phase === 'playing' || phase === 'answered') && round && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-muted-dark pt-1.5 shrink-0">user ›</span>
              <p className="font-heading text-xl sm:text-2xl text-primary leading-snug">{round.request}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Pick a tool">
              {options.map((t, i) => {
                const isAnswer = phase === 'answered' && t === round.tool;
                const isWrongPick = phase === 'answered' && t === picked && t !== round.tool;
                return (
                  <button
                    key={t}
                    onClick={() => answer(t)}
                    disabled={phase !== 'playing'}
                    className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left font-mono text-sm transition-colors cursor-pointer disabled:cursor-default ${
                      isAnswer
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                        : isWrongPick
                        ? 'border-red-400/60 bg-red-400/10 text-red-300'
                        : phase === 'answered'
                        ? 'border-border text-muted-dark'
                        : 'border-border bg-[#121212] text-primary hover:border-accent/50 hover:bg-[#161616]'
                    }`}
                  >
                    <span>
                      <span className="text-muted-dark mr-2">{i + 1}</span>
                      {t}()
                    </span>
                    {isAnswer && <Check className="w-4 h-4" />}
                    {isWrongPick && <X className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {phase === 'answered' && (
              <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-5 border-t border-border" aria-live="polite">
                <div className="max-w-2xl">
                  <div className={`font-mono text-xs mb-1.5 ${wasRight ? 'text-emerald-400' : 'text-red-400'}`}>
                    {wasRight ? `correct · +${lastGain}` : timedOut ? 'too slow · the agent timed out' : `wrong tool · it was ${round.tool}()`}
                  </div>
                  <p className="text-sm text-muted-light leading-relaxed">
                    {round.fact}{' '}
                    <Link to={`/work/${round.project.slug}`} className="text-accent hover:underline whitespace-nowrap">
                      {round.project.name} →
                    </Link>
                  </p>
                </div>
                <button
                  ref={nextRef}
                  onClick={next}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-[#121212] hover:border-accent/50 font-mono text-sm text-primary transition-colors cursor-pointer"
                >
                  {index + 1 >= order.length ? 'See score' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div className="flex-1 flex flex-col justify-center gap-5 max-w-2xl" aria-live="polite">
            <div className="font-mono text-xs text-muted">run complete</div>
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <span className="font-heading text-5xl font-bold text-primary tabular-nums">
                {score}
                <span className="text-accent text-2xl ml-1">pts</span>
              </span>
              <span className="font-mono text-sm text-muted-light">
                {correct}/{order.length} tools right · best streak {bestStreak}
              </span>
            </div>
            <p className="text-muted leading-relaxed">
              {correct === order.length
                ? 'Perfect routing. Read the request, pick the tool, use the result: that loop is the core of every agent I build.'
                : correct >= order.length - 2
                ? 'Solid agent. Read the request, pick the tool, use the result: that loop is the core of every agent I build.'
                : 'Picking the right tool is harder than it looks, which is exactly why I spend so much time on it.'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-[#121212] hover:border-accent/50 font-mono text-sm text-primary transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play again
              </button>
              <Link
                to="/work"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-[#080808] font-mono text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                See the projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
