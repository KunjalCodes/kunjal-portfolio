import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { search, tokenize, corpusSize } from '../../lib/retrieval';

const SUGGESTIONS = [
  'Has Kunjal used Neo4j?',
  'What was built with MCP?',
  'How did retrieval get 68× faster?',
  'What happens at Igniters Hub?',
  'Which projects run a local LLM?',
];

/** Crop a passage around its first matching word so the evidence is visible. */
const snippet = (text: string, matched: Set<string>, max = 260) => {
  if (text.length <= max) return text;
  const words = text.split(/(\s+)/);
  let pos = 0;
  let first = -1;
  for (const w of words) {
    const t = tokenize(w)[0];
    if (t && matched.has(t)) {
      first = pos;
      break;
    }
    pos += w.length;
  }
  const start = Math.max(0, Math.min(first - 60, text.length - max));
  return `${start > 0 ? '…' : ''}${text.slice(start, start + max).trim()}${start + max < text.length ? '…' : ''}`;
};

const Highlight: React.FC<{ text: string; matched: Set<string> }> = ({ text, matched }) => (
  <>
    {text.split(/(\s+)/).map((w, i) => {
      const t = tokenize(w)[0];
      return t && matched.has(t) ? (
        <mark key={i} className="bg-accent/20 text-primary rounded-sm px-0.5">
          {w}
        </mark>
      ) : (
        <React.Fragment key={i}>{w}</React.Fragment>
      );
    })}
  </>
);

interface AskPortfolioProps {
  variant?: 'inline' | 'palette';
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export const AskPortfolio: React.FC<AskPortfolioProps> = ({ variant = 'inline', onNavigate, autoFocus }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const palette = variant === 'palette';

  const result = useMemo(() => (query.trim().length > 1 ? search(query, palette ? 5 : 4) : null), [query, palette]);
  const top = result?.hits[0]?.score ?? 1;

  useEffect(() => setSelected(0), [query]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const go = (href: string) => {
    onNavigate?.();
    navigate(href);
    window.scrollTo({ top: 0 });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!result?.hits.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, result.hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(result.hits[selected].chunk.href);
    }
  };

  return (
    <div className="bg-[#0B0B0B] border border-border rounded-xl overflow-hidden">
      {/* Input */}
      <div className="flex items-center gap-3 px-4 sm:px-5 h-14 border-b border-border">
        <Search className="w-4 h-4 text-accent shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about my work, e.g. has Kunjal used Neo4j?"
          className="flex-1 bg-transparent outline-none text-[15px] text-primary placeholder:text-muted-dark"
          aria-label="Ask about Kunjal's work"
          spellCheck={false}
          autoComplete="off"
        />
        {palette && <kbd className="hidden sm:inline font-mono text-[10px] text-muted border border-border rounded px-1.5 py-0.5">esc</kbd>}
      </div>

      {/* Suggestions or results */}
      {!result ? (
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-mono text-muted mb-3">try one</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  inputRef.current?.focus();
                }}
                className="font-mono text-xs px-3 py-1.5 rounded-md border border-border bg-[#121212] text-muted-light hover:text-primary hover:border-accent/40 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : result.hits.length === 0 ? (
        <div className="p-5 text-sm text-muted">
          Nothing in my projects or experience matches that. Try a technology, a project or a skill.
        </div>
      ) : (
        <ol className={`divide-y divide-border/70 ${palette ? 'max-h-[52vh] overflow-y-auto' : ''}`} role="listbox">
          {result.hits.map((h, i) => {
            const matched = new Set(h.matched);
            return (
              <li key={h.chunk.id} role="option" aria-selected={i === selected}>
                <button
                  onClick={() => go(h.chunk.href)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full text-left px-4 sm:px-5 py-4 transition-colors cursor-pointer ${
                    i === selected ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-muted-dark">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-primary truncate">{h.chunk.source}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                        <span className="block h-full bg-accent" style={{ width: `${Math.max(8, (h.score / top) * 100)}%` }} />
                      </span>
                      <span className="font-mono text-[11px] text-muted tabular-nums w-10 text-right">{h.score.toFixed(2)}</span>
                      {i === selected ? (
                        <CornerDownLeft className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-dark" />
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted leading-relaxed">
                    <Highlight text={snippet(h.chunk.text, matched)} matched={matched} />
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* Retrieval trace */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-border bg-[#080808] font-mono text-[11px] text-muted-dark flex flex-wrap gap-x-4 gap-y-1">
        <span>BM25 over {corpusSize} chunks of this site</span>
        {result && (
          <>
            <span>
              terms: <span className="text-muted-light">{result.queryTerms.slice(0, 6).join(' ') || '—'}</span>
            </span>
            <span>
              {result.hits.length} hits in <span className="text-accent">{result.ms.toFixed(1)} ms</span>
            </span>
          </>
        )}
        <span className="sm:ml-auto">in-browser · no LLM · sources linked</span>
      </div>
    </div>
  );
};
