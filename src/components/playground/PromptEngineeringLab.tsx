import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Terminal, 
  Play, 
  Check, 
  AlertTriangle, 
  Copy, 
  Info, 
  SplitSquareVertical, 
  ArrowRight,
  Code2
} from 'lucide-react';
import { promptScenarios, PromptScenario } from '../../data/playground/promptLabData';
import { Badge } from '../common/Badge';

export const PromptEngineeringLab: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = promptScenarios[selectedScenarioIndex];

  // Editable states for Config A
  const [systemPromptA, setSystemPromptA] = useState(scenario.systemPromptA);
  const [userPromptA, setUserPromptA] = useState(scenario.userPromptA);
  const [isExecutingA, setIsExecutingA] = useState(false);

  // Editable states for Config B
  const [systemPromptB, setSystemPromptB] = useState(scenario.systemPromptB);
  const [userPromptB, setUserPromptB] = useState(scenario.userPromptB);
  const [isExecutingB, setIsExecutingB] = useState(false);

  const [copiedB, setCopiedB] = useState(false);

  // Switch scenario updates prompts
  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setSystemPromptA(promptScenarios[idx].systemPromptA);
    setUserPromptA(promptScenarios[idx].userPromptA);
    setSystemPromptB(promptScenarios[idx].systemPromptB);
    setUserPromptB(promptScenarios[idx].userPromptB);
  };

  const handleRunConfigA = () => {
    setIsExecutingA(true);
    setTimeout(() => setIsExecutingA(false), 500);
  };

  const handleRunConfigB = () => {
    setIsExecutingB(true);
    setTimeout(() => setIsExecutingB(false), 500);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scenario.demonstrationOutputB.jsonOutput, null, 2));
    setCopiedB(true);
    setTimeout(() => setCopiedB(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Scenario Selector Banner */}
      <div className="bg-[#0D0D0D] border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Prompt Evaluation Scenario
          </div>
          <h3 className="font-heading text-lg font-bold text-primary">
            {scenario.title}
          </h3>
          <p className="text-xs text-muted mt-1 max-w-xl">
            {scenario.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {promptScenarios.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(idx)}
              className={`font-mono text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${
                selectedScenarioIndex === idx
                  ? 'bg-accent text-[#080808] font-semibold'
                  : 'bg-[#141414] text-muted hover:text-primary border border-border'
              }`}
            >
              Scenario {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CONFIG A: Naive & Unconstrained Prompt */}
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Configuration A</span>
                <h4 className="font-heading text-base font-bold text-primary">
                  Naive / Conversational Prompt
                </h4>
              </div>
              <Badge variant="outline">Unconstrained</Badge>
            </div>

            {/* Editable System Instruction A */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span>System Instruction</span>
                <span className="text-muted-dark">Editable</span>
              </label>
              <textarea
                rows={3}
                value={systemPromptA}
                onChange={(e) => setSystemPromptA(e.target.value)}
                className="w-full bg-[#121212] border border-border rounded p-2.5 font-mono text-xs text-primary/90 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Editable User Query A */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span>User Input Prompt</span>
                <span className="text-muted-dark">Editable</span>
              </label>
              <textarea
                rows={4}
                value={userPromptA}
                onChange={(e) => setUserPromptA(e.target.value)}
                className="w-full bg-[#121212] border border-border rounded p-2.5 font-mono text-xs text-primary/90 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              onClick={handleRunConfigA}
              className="w-full py-2 rounded bg-[#161616] hover:bg-[#202020] border border-border text-xs font-mono text-muted-light hover:text-primary flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecutingA ? 'Simulating Evaluation...' : 'Simulate Response'}</span>
            </button>

            {/* Demonstration Output A */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Output Response</span>
                  <span className="text-[10px] text-muted-dark bg-white/5 px-1.5 py-0.5 rounded border border-border">Deterministic Sample</span>
                </span>
                <span className="text-amber-400 font-semibold">0% Schema Compliance</span>
              </div>
              <div className="bg-[#060606] border border-border rounded p-3 font-mono text-xs text-muted leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {scenario.demonstrationOutputA.rawText}
              </div>
            </div>
          </div>

          {/* Analysis Card A */}
          <div className="pt-4 border-t border-border/80 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">Estimated Latency:</span>
              <span className="text-amber-400">{scenario.demonstrationOutputA.analysis.latencyEstimate}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">Hallucination Risk:</span>
              <span className="text-red-400 font-semibold">{scenario.demonstrationOutputA.analysis.hallucinationRisk}</span>
            </div>
            <ul className="pt-1 space-y-1 text-[11px] text-muted">
              {scenario.demonstrationOutputA.analysis.notes.map((note, nIdx) => (
                <li key={nIdx} className="flex items-start gap-1.5 text-amber-300/80">
                  <span className="text-red-400">×</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CONFIG B: Production Schema-Constrained & Few-Shot Prompt */}
        <div className="bg-[#0B0B0B] border border-accent/40 rounded-lg p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase font-semibold">Configuration B</span>
                <h4 className="font-heading text-base font-bold text-primary">
                  Engineered / Schema-Constrained Prompt
                </h4>
              </div>
              <Badge variant="accent">Production Grade</Badge>
            </div>

            {/* Editable System Instruction B */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span>System Constraints & JSON Schema</span>
                <span className="text-muted-dark">Editable</span>
              </label>
              <textarea
                rows={5}
                value={systemPromptB}
                onChange={(e) => setSystemPromptB(e.target.value)}
                className="w-full bg-[#121212] border border-accent/30 rounded p-2.5 font-mono text-xs text-primary/90 focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Editable User Query B */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span>Structured User Ingestion Context</span>
                <span className="text-muted-dark">Editable</span>
              </label>
              <textarea
                rows={3}
                value={userPromptB}
                onChange={(e) => setUserPromptB(e.target.value)}
                className="w-full bg-[#121212] border border-accent/30 rounded p-2.5 font-mono text-xs text-primary/90 focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <button
              onClick={handleRunConfigB}
              className="w-full py-2 rounded bg-accent text-[#080808] font-semibold text-xs font-mono flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isExecutingB ? 'Evaluating Schema...' : 'Evaluate Constrained Output'}</span>
            </button>

            {/* Demonstration Output B */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono text-muted flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Structured JSON Output</span>
                  <span className="text-[10px] text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/30 font-semibold">Deterministic Sample</span>
                </span>
                <button
                  onClick={handleCopyJson}
                  className="text-accent hover:underline flex items-center gap-1"
                >
                  {copiedB ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedB ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <div className="bg-[#060606] border border-accent/30 rounded p-3 font-mono text-xs text-primary/90 leading-relaxed overflow-x-auto max-h-48">
                <code>{JSON.stringify(scenario.demonstrationOutputB.jsonOutput, null, 2)}</code>
              </div>
            </div>
          </div>

          {/* Analysis Card B */}
          <div className="pt-4 border-t border-border/80 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">Estimated Latency:</span>
              <span className="text-emerald-400 font-semibold">{scenario.demonstrationOutputB.analysis.latencyEstimate}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">Hallucination Risk:</span>
              <span className="text-emerald-400 font-semibold">{scenario.demonstrationOutputB.analysis.hallucinationRisk}</span>
            </div>
            <ul className="pt-1 space-y-1 text-[11px] text-muted">
              {scenario.demonstrationOutputB.analysis.notes.map((note, nIdx) => (
                <li key={nIdx} className="flex items-start gap-1.5 text-emerald-300/90">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Architecture Extensibility Callout & Transparency Note */}
      <div className="bg-[#090909] border border-border/80 rounded-lg p-4 flex items-start gap-3 text-xs font-mono text-muted">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-primary">Demonstration & Extensibility Note:</strong> Output responses shown above are prepared deterministic samples illustrating the failure modes of naive prompts versus strict JSON schema constraints. No live LLM inference API is called in this demonstration client. The component's state dispatchers are decoupled and ready for drop-in local model inference integration.
        </p>
      </div>
    </div>
  );
};
