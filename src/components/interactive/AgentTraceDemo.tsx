import React, { useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

/**
 * Replays tool calls from a real session of AI Research Copilot
 * (github.com/KunjalCodes/mcp-ai-copilot). Questions and tool results are taken
 * from the session log; the tool request uses the copilot's JSON protocol.
 */
const sessions = [
  {
    question: "What's the weather in Mumbai?",
    tool: 'get_weather',
    args: { location: 'Mumbai' },
    result: 'Mumbai: 27.5°C, Wind 10.7 km/h',
    via: 'Open-Meteo geocoding + forecast',
  },
  {
    question: 'Calculate 5 times 8',
    tool: 'calculate',
    args: { a: 5, b: 8, op: 'multiply' },
    result: '40.0',
    via: 'local function',
  },
  {
    question: 'Save a note that MCP is powerful',
    tool: 'save_note',
    args: { note: 'MCP is powerful' },
    result: 'Note saved!',
    via: 'notes.json',
  },
];

const STEP_MS = 900;

export const AgentTraceDemo: React.FC = () => {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  const reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduced) {
      setStep(4);
      return;
    }
    setStep(0);
    const timers = [1, 2, 3, 4].map(n => window.setTimeout(() => setStep(n), n * STEP_MS));
    return () => timers.forEach(clearTimeout);
  }, [active, run, reduced]);

  const s = sessions[active];
  const rows = [
    {
      label: 'user',
      body: <span className="text-primary">{s.question}</span>,
    },
    {
      label: 'llama3',
      body: (
        <span className="text-muted-light">
          {'{'}
          <span className="text-accent">"tool"</span>: <span className="text-primary">"{s.tool}"</span>,{' '}
          <span className="text-accent">"arguments"</span>: <span className="text-primary">{JSON.stringify(s.args)}</span>
          {'}'}
        </span>
      ),
    },
    {
      label: 'mcp',
      body: (
        <span className="text-muted">
          CallToolRequest → server.py · <span className="text-muted-light">{s.tool}()</span> via {s.via}
        </span>
      ),
    },
    {
      label: 'result',
      body: <span className="text-emerald-400">{s.result}</span>,
    },
  ];

  return (
    <div className="bg-[#0B0B0B] border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-[#0E0E0E]">
        <div className="font-mono text-xs text-muted-light">mcp-ai-copilot · session replay</div>
        <button
          onClick={() => setRun(r => r + 1)}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted hover:text-accent transition-colors cursor-pointer"
          aria-label="Replay this trace"
        >
          {step >= 4 ? <RotateCcw className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          replay
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-wrap gap-2" role="tablist" aria-label="Choose a question">
        {sessions.map((x, i) => (
          <button
            key={x.tool}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              i === active
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border bg-[#121212] text-muted hover:text-primary'
            }`}
          >
            {x.question}
          </button>
        ))}
      </div>

      <ol className="p-4 space-y-2.5 font-mono text-xs min-h-[176px]" aria-live="polite">
        {rows.map((r, i) => (
          <li
            key={r.label}
            className={`grid grid-cols-[64px_1fr] gap-3 transition-[opacity,transform] duration-300 ${
              step > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <span className="text-muted-dark text-right">{r.label}</span>
            <span className="break-words">{r.body}</span>
          </li>
        ))}
      </ol>

      <p className="px-4 pb-4 text-[11px] text-muted-dark leading-relaxed">
        Questions and tool results are from a logged session. The model asks for a tool in JSON, the client calls it over
        MCP, and the result goes back to the model.
      </p>
    </div>
  );
};
