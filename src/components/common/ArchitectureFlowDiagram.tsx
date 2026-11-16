import React, { useState } from 'react';
import { ArrowRight, Layers, Database, Cpu, CheckCircle2, Info } from 'lucide-react';

interface DataFlowStep {
  stepNumber: number;
  title: string;
  input: string;
  output: string;
  detail: string;
}

interface ArchitectureFlowDiagramProps {
  summary: string;
  diagramDescription?: string;
  dataFlowSteps?: DataFlowStep[];
}

export const ArchitectureFlowDiagram: React.FC<ArchitectureFlowDiagramProps> = ({
  summary,
  diagramDescription,
  dataFlowSteps = [],
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Interactive Data-Flow Architecture
          </span>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-primary mt-1">
            System Pipeline & Stage Transitions
          </h3>
        </div>
        <span className="text-xs font-mono text-muted">
          {dataFlowSteps.length} Processing Stages
        </span>
      </div>

      <p className="text-xs sm:text-sm text-muted leading-relaxed">
        {summary}
      </p>

      {/* Visual Pipeline Flow Step Cards */}
      {dataFlowSteps.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {dataFlowSteps.map((step) => {
              const isActive = activeStep === step.stepNumber;
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStep(step.stepNumber)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isActive
                      ? 'bg-accent/15 border-accent shadow-[0_0_15px_rgba(240,165,200,0.15)]'
                      : 'bg-[#080808] border-border hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-accent text-black font-bold' : 'bg-white/5 text-muted'
                    }`}>
                      0{step.stepNumber}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </div>
                  <span className={`font-heading text-xs font-semibold leading-tight line-clamp-2 ${
                    isActive ? 'text-primary' : 'text-muted'
                  }`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep Inspector */}
          {(() => {
            const current = dataFlowSteps.find(s => s.stepNumber === activeStep) || dataFlowSteps[0];
            return (
              <div className="bg-[#080808] border border-accent/30 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent">Stage 0{current.stepNumber}:</span>
                    <h4 className="font-heading text-base font-bold text-primary">
                      {current.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted uppercase">Contract Transformation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#101010] p-3.5 rounded border border-border space-y-1">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Input Contract</span>
                    <div className="font-mono text-xs text-primary/90 font-medium">
                      {current.input}
                    </div>
                  </div>

                  <div className="bg-[#101010] p-3.5 rounded border border-accent/25 space-y-1">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Output Artifact</span>
                    <div className="font-mono text-xs text-accent font-medium">
                      {current.output}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed font-sans pt-1">
                  <strong className="text-primary font-medium">Implementation Mechanism: </strong>
                  {current.detail}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Fallback or raw flow trace */}
      {diagramDescription && (
        <div className="bg-[#060606] border border-border/80 rounded p-4 font-mono text-xs text-muted-light overflow-x-auto">
          <div className="text-[10px] text-muted uppercase tracking-widest mb-1.5">// Linear Topology Trace</div>
          <div className="whitespace-pre-wrap leading-relaxed text-primary/80">
            {diagramDescription}
          </div>
        </div>
      )}
    </div>
  );
};
