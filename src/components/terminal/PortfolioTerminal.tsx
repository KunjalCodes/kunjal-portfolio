import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon, CornerDownLeft, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import { labNotes } from '../../data/labNotes';

interface TerminalEntry {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: string;
}

interface PortfolioTerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMAND_LIST = [
  'help',
  'about',
  'projects',
  'playground',
  'pipeline',
  'eval',
  'skills',
  'experience',
  'lab',
  'contact',
  'resume',
  'leetcode',
  'github',
  'clear',
  'open second-brain',
  'open food-lens',
  'open multi-agent-builder',
  'open mcp-ai-copilot',
  'open rag-ml-textbook-chatbot',
  'open furniture-drawing-extractor',
  'open playground',
  'theme',
  'whoami',
  'exit'
];

export const PortfolioTerminal: React.FC<PortfolioTerminalProps> = ({ isOpen, onClose }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom on new entry
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Suggestion check
  useEffect(() => {
    if (!inputVal.trim()) {
      setSuggestion('');
      return;
    }
    const match = COMMAND_LIST.find(cmd => cmd.startsWith(inputVal.toLowerCase().trim()));
    if (match && match !== inputVal.toLowerCase().trim()) {
      setSuggestion(match);
    } else {
      setSuggestion('');
    }
  }, [inputVal]);

  const handleClear = () => {
    setHistory([]);
  };

  const executeCommand = useCallback((rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Update command history for Up/Down navigation
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const parts = cmd.toLowerCase().split(' ');
    const action = parts[0];
    const arg = parts.slice(1).join(' ').trim();

    let output: React.ReactNode = null;

    switch (action) {
      case 'help':
        output = (
          <div className="space-y-1 text-xs font-mono text-muted-light">
            <p className="text-accent mb-2">Available System Commands:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-primary font-bold">help</span> - Display this reference</div>
              <div><span className="text-primary font-bold">about</span> - Background & engineering focus</div>
              <div><span className="text-primary font-bold">projects</span> - Index of featured systems</div>
              <div><span className="text-primary font-bold">playground</span> - Interactive AI Engineering Lab</div>
              <div><span className="text-primary font-bold">skills</span> - Categorized technical stack</div>
              <div><span className="text-primary font-bold">experience</span> - Career trajectory & roles</div>
              <div><span className="text-primary font-bold">lab</span> - View technical journal notes</div>
              <div><span className="text-primary font-bold">contact</span> - Communication endpoints</div>
              <div><span className="text-primary font-bold">resume</span> - Download/preview CV</div>
              <div><span className="text-primary font-bold">open &lt;slug&gt;</span> - Jump to project case study</div>
              <div><span className="text-primary font-bold">theme</span> - Design system specs</div>
              <div><span className="text-primary font-bold">whoami</span> - Current terminal session</div>
              <div><span className="text-primary font-bold">clear</span> - Clear terminal buffer</div>
              <div><span className="text-primary font-bold">exit</span> - Dismiss terminal overlay</div>
            </div>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-primary font-semibold">{profile.name} — {profile.title}</p>
            <p className="text-muted leading-relaxed">{profile.bio[0]}</p>
            <p className="text-muted leading-relaxed">{profile.bio[1]}</p>
            <p className="text-accent/80 text-[11px]">Type 'skills' or 'projects' to inspect technical artifacts.</p>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-accent mb-1">Curated Engineering Systems ({projects.length}):</p>
            <div className="space-y-1.5">
              {projects.map((p, idx) => (
                <div key={p.id} className="border-l border-border pl-2.5 py-0.5 hover:border-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-[10px]">[{idx + 1}]</span>
                    <button
                      onClick={() => {
                        navigate(`/work/${p.slug}`);
                        onClose();
                      }}
                      className="text-primary hover:text-accent font-semibold text-left underline decoration-dotted"
                    >
                      {p.title}
                    </button>
                    <span className="text-[10px] text-accent/70 border border-accent/20 px-1 rounded">{p.category}</span>
                  </div>
                  <p className="text-muted text-[11px] line-clamp-1">{p.shortDescription}</p>
                  <p className="text-[10px] text-muted-dark">Run: <span className="text-muted-light">open {p.slug}</span></p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'playground':
      case 'pipeline':
      case 'eval':
        output = (
          <div className="space-y-1 text-xs font-mono text-accent">
            <p>Launching Interactive AI Engineering Playground...</p>
            <p className="text-muted text-[11px]">Direct tools: Pipeline Explorer, Model Evaluation, Prompt Lab, Architecture Topology.</p>
          </div>
        );
        setTimeout(() => {
          navigate('/playground');
          onClose();
        }, 300);
        break;

      case 'open':
        if (!arg) {
          output = <p className="text-amber-400 text-xs font-mono">Usage: open &lt;project-slug&gt; (e.g. open drawing-extractor, open floor-layout-tool)</p>;
        } else {
          const target = projects.find(p => p.slug.toLowerCase() === arg || p.id.toLowerCase() === arg);
          if (target) {
            output = (
              <div className="text-xs font-mono text-accent">
                Navigating to case study: <span className="text-primary font-bold">{target.title}</span>...
              </div>
            );
            setTimeout(() => {
              navigate(`/work/${target.slug}`);
              onClose();
            }, 300);
          } else if (arg === 'work' || arg === 'projects') {
            navigate('/work');
            onClose();
          } else if (arg === 'playground') {
            navigate('/playground');
            onClose();
          } else if (arg === 'pipeline') {
            navigate('/playground?tab=pipeline');
            onClose();
          } else if (arg === 'eval') {
            navigate('/playground?tab=eval');
            onClose();
          } else if (arg === 'lab') {
            navigate('/lab');
            onClose();
          } else if (arg === 'about') {
            navigate('/about');
            onClose();
          } else if (arg === 'contact') {
            navigate('/contact');
            onClose();
          } else {
            output = (
              <p className="text-red-400 text-xs font-mono">
                Project slug '{arg}' not found. Type 'projects' to list valid slugs.
              </p>
            );
          }
        }
        break;

      case 'skills':
        output = (
          <div className="space-y-3 text-xs font-mono">
            {profile.skills.map((cat, idx) => (
              <div key={idx}>
                <p className="text-accent font-semibold mb-1">// {cat.category}</p>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {cat.skills.map(s => (
                    <span key={s.name} className="px-1.5 py-0.5 bg-white/[0.04] border border-border text-primary/80 rounded text-[11px]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        break;

      case 'experience':
        output = (
          <div className="space-y-3 text-xs font-mono">
            <p className="text-accent">// Career Trajectory</p>
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="border-l border-border pl-2.5">
                <p className="text-primary font-semibold">{exp.role} @ <span className="text-muted-light">{exp.organization}</span></p>
                <p className="text-[10px] text-muted mb-1">{exp.period}</p>
                <ul className="list-disc list-inside text-[11px] text-muted space-y-0.5">
                  {exp.description.map((d, dIdx) => (
                    <li key={dIdx}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
        break;

      case 'lab':
        output = (
          <div className="space-y-2 text-xs font-mono">
            <p className="text-accent">// Technical Lab Notes ({labNotes.length}):</p>
            {labNotes.map(note => (
              <div key={note.id} className="border-l border-border pl-2 py-0.5">
                <span className="text-primary font-medium">{note.title}</span>
                <span className="text-muted-dark text-[10px] ml-2">({note.date})</span>
                <p className="text-muted text-[11px] line-clamp-1">{note.summary}</p>
              </div>
            ))}
          </div>
        );
        break;

      case 'contact':
        output = (
          <div className="space-y-1.5 text-xs font-mono">
            <p className="text-accent">// Communication & Engineering Endpoints</p>
            <p className="text-muted">Email: <a href={`mailto:${profile.socialLinks.email}`} className="text-primary hover:text-accent underline">{profile.socialLinks.email}</a></p>
            <p className="text-muted">GitHub: <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="text-primary hover:text-accent underline">{profile.socialLinks.github}</a></p>
            <p className="text-muted">LinkedIn: <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:text-accent underline">{profile.socialLinks.linkedin}</a></p>
            <p className="text-muted">LeetCode: <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer" className="text-primary hover:text-accent underline">{profile.socialLinks.leetcode}</a></p>
          </div>
        );
        break;

      case 'github':
        output = (
          <p className="text-xs font-mono text-accent">
            Opening GitHub profile: <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="underline">{profile.socialLinks.github}</a>
          </p>
        );
        window.open(profile.socialLinks.github, '_blank');
        break;

      case 'leetcode':
        output = (
          <p className="text-xs font-mono text-accent">
            Opening LeetCode profile (100+ solved): <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer" className="underline">{profile.socialLinks.leetcode}</a>
          </p>
        );
        window.open(profile.socialLinks.leetcode, '_blank');
        break;

      case 'resume':
        output = (
          <div className="text-xs font-mono space-y-1">
            <p className="text-accent">// Curriculum Vitae</p>
            <p className="text-primary">Opening resume PDF...</p>
            <p className="text-muted text-[11px]">Direct link: <a href={profile.socialLinks.resumeUrl} target="_blank" rel="noreferrer" className="text-accent underline">{profile.socialLinks.resumeUrl}</a></p>
          </div>
        );
        window.open(profile.socialLinks.resumeUrl, '_blank');
        break;

      case 'theme':
        output = (
          <div className="text-xs font-mono space-y-1 text-muted">
            <p className="text-accent">// Visual Design System</p>
            <p>Background: <span className="text-white font-mono">#080808</span> (almost-black)</p>
            <p>Accent: <span className="text-[#F0A5C8] font-mono">#F0A5C8</span> (soft baby pink)</p>
            <p>Primary Text: <span className="text-[#F5F5F5] font-mono">#F5F5F5</span></p>
            <p>Secondary Text: <span className="text-[#888888] font-mono">#888888</span></p>
            <p>Typography: Space Grotesk (Headings), Inter (Body), JetBrains Mono (Code/Terminal)</p>
          </div>
        );
        break;

      case 'whoami':
        output = (
          <p className="text-xs font-mono text-muted">
            guest@portfolio (Terminal session authorized · Interactive visitor mode)
          </p>
        );
        break;

      case 'clear':
        handleClear();
        return;

      case 'exit':
      case 'close':
      case 'quit':
        onClose();
        return;

      default:
        output = (
          <p className="text-red-400 text-xs font-mono">
            zsh: command not found: {rawCmd}. Type <span className="text-accent font-bold">help</span> to view available commands.
          </p>
        );
        break;
    }

    const newEntry: TerminalEntry = {
      id: Math.random().toString(36).substring(7),
      command: rawCmd,
      output,
      timestamp: new Date().toLocaleTimeString(),
    };

    setHistory(prev => [...prev, newEntry]);
    setInputVal('');
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < commandHistory.length) {
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        setInputVal(suggestion);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-3xl bg-[#0B0B0B] border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
              isExpanded ? 'h-[92vh] max-w-5xl' : 'h-[520px] max-h-[85vh]'
            }`}
          >
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#111111] border-b border-border select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <button
                    onClick={onClose}
                    className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-110 flex items-center justify-center group"
                    title="Close (Esc)"
                    aria-label="Close terminal"
                  >
                    <X className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={handleClear}
                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-110 flex items-center justify-center group"
                    title="Clear buffer"
                    aria-label="Clear terminal"
                  >
                    <Trash2 className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-110 flex items-center justify-center group"
                    title={isExpanded ? "Collapse" : "Expand"}
                    aria-label="Toggle expand"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
                    ) : (
                      <Maximize2 className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
                <TerminalIcon className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-xs text-muted-light font-medium tracking-tight">
                  kunjal@portfolio: ~ (Type 'help' or TAB)
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted text-[11px] font-mono">
                <span className="hidden sm:inline text-muted-dark">ESC to close</span>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-primary transition-colors text-muted"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 bg-[#080808] selection:bg-accent/20 selection:text-accent cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Terminal Welcome Message */}
              <div className="text-muted space-y-1 pb-2 border-b border-border/60">
                <p className="text-primary font-semibold">
                  KUNJAL.J — AI Engineering Shell [Version 1.0.0-PROD]
                </p>
                <p className="text-[11px] text-muted">
                  Type <span className="text-accent font-semibold">help</span> to inspect valid operations, or <span className="text-accent font-semibold">projects</span> to inspect case studies.
                </p>
              </div>

              {/* History output */}
              {history.map(item => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-dark text-[11px]">
                    <span className="text-accent font-semibold">visitor@kunjal.j:~$</span>
                    <span className="text-primary font-mono">{item.command}</span>
                    <span className="ml-auto text-[10px] text-muted-dark">{item.timestamp}</span>
                  </div>
                  <div className="pl-3 border-l border-border/70 py-0.5">
                    {item.output}
                  </div>
                </div>
              ))}

              {/* Prompt Input Line */}
              <div className="flex items-center gap-2 pt-1 relative">
                <span className="text-accent font-semibold whitespace-nowrap">visitor@kunjal.j:~$</span>
                <div className="relative flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-none outline-none text-primary font-mono text-xs focus:ring-0 p-0"
                    placeholder={history.length === 0 ? "type 'help' and press Enter..." : ""}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  {suggestion && (
                    <span className="absolute left-0 pointer-events-none text-muted-dark font-mono text-xs">
                      {inputVal}
                      <span className="text-muted/40">{suggestion.slice(inputVal.length)} [TAB]</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => executeCommand(inputVal)}
                  className="text-muted hover:text-accent p-1 transition-colors"
                  title="Run command"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div ref={bottomRef} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
