import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Layers, 
  Cpu, 
  Scan, 
  FileCheck2, 
  Database, 
  Download, 
  Server, 
  Monitor, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { architectureComponents, ArchitectureComponent } from '../../data/playground/architectureData';
import { Badge } from '../common/Badge';

export const ArchitectureExplorer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('multimodal-llm');

  const selectedComponent = architectureComponents.find(c => c.id === selectedId) || architectureComponents[0];

  const getComponentIcon = (id: string) => {
    switch (id) {
      case 'frontend': return Monitor;
      case 'backend-api': return Server;
      case 'image-processing': return Layers;
      case 'ocr-engine': return Scan;
      case 'multimodal-llm': return Cpu;
      case 'validation-layer': return FileCheck2;
      case 'spatial-db': return Database;
      case 'export-engine': return Download;
      default: return Network;
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Section Intro */}
      <div className="bg-[#0D0D0D] border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Interactive System Topology
          </div>
          <h3 className="font-heading text-lg font-bold text-primary">
            End-to-End Multimodal Extraction Architecture
          </h3>
          <p className="text-xs text-muted mt-1 max-w-xl">
            Click on any architectural node to inspect data contracts, algorithmic trade-offs, and failure fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-primary font-medium">Implemented</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span className="text-muted">Conceptual Extension</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Architecture Diagram (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Architecture Diagram Flow (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-muted mb-2 font-semibold">
            System Topology Graph
          </h4>

          {/* Tier 1: Client & Ingestion */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">// Ingestion & Gateway</span>
            <div className="grid grid-cols-2 gap-3">
              {architectureComponents.filter(c => c.tier === 'Client Tier' || c.tier === 'Ingestion & API').map(c => {
                const Icon = getComponentIcon(c.id);
                const isSelected = selectedId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-accent/15 border-accent shadow-[0_0_15px_rgba(240,165,200,0.15)]'
                        : 'bg-[#080808] border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Implemented' ? 'bg-accent' : 'bg-amber-400'}`} />
                    </div>
                    <span className="font-heading font-semibold text-xs text-primary truncate">{c.shortLabel}</span>
                    <span className="font-mono text-[10px] text-muted truncate">{c.tier}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Connector Arrow */}
          <div className="flex justify-center py-0.5 text-muted-dark">
            <span className="font-mono text-xs text-accent/60">↓ Raw Buffers & Candidate Patches ↓</span>
          </div>

          {/* Tier 2: Processing Core */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">// Computer Vision & Multimodal Core</span>
            <div className="grid grid-cols-3 gap-2.5">
              {architectureComponents.filter(c => c.tier === 'Computer Vision Core' || c.tier === 'Multimodal AI').map(c => {
                const Icon = getComponentIcon(c.id);
                const isSelected = selectedId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                      isSelected
                        ? 'bg-accent/15 border-accent shadow-[0_0_15px_rgba(240,165,200,0.15)]'
                        : 'bg-[#080808] border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Implemented' ? 'bg-accent' : 'bg-amber-400'}`} />
                    </div>
                    <span className="font-heading font-semibold text-xs text-primary leading-tight">{c.shortLabel}</span>
                    <span className="font-mono text-[10px] text-muted truncate">{c.technologies[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Connector Arrow */}
          <div className="flex justify-center py-0.5 text-muted-dark">
            <span className="font-mono text-xs text-accent/60">↓ Normalized Entity Graph & Spatial Polygons ↓</span>
          </div>

          {/* Tier 3: Storage & Verification */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">// Verification, Storage & Export</span>
            <div className="grid grid-cols-3 gap-2.5">
              {architectureComponents.filter(c => c.tier === 'Verification & Storage').map(c => {
                const Icon = getComponentIcon(c.id);
                const isSelected = selectedId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                      isSelected
                        ? 'bg-accent/15 border-accent shadow-[0_0_15px_rgba(240,165,200,0.15)]'
                        : 'bg-[#080808] border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Implemented' ? 'bg-accent' : 'bg-amber-400'}`} />
                    </div>
                    <span className="font-heading font-semibold text-xs text-primary leading-tight">{c.shortLabel}</span>
                    <span className="font-mono text-[10px] text-muted truncate">{c.technologies[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Node Deep Inspector Panel (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedComponent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Node Header */}
              <div className="border-b border-border/80 pb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-mono text-xs text-accent">{selectedComponent.tier}</span>
                  <Badge variant={selectedComponent.status === 'Implemented' ? 'accent' : 'status'}>
                    {selectedComponent.status}
                  </Badge>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                  {selectedComponent.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  {selectedComponent.purpose}
                </p>
              </div>

              {/* Technologies Badges */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-muted uppercase">Tech Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedComponent.technologies.map(t => (
                    <span
                      key={t}
                      className="font-mono text-xs px-2.5 py-1 rounded bg-white/[0.03] text-primary/90 border border-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Contracts: Inputs & Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#080808] border border-border p-4 rounded-lg space-y-2">
                  <div className="font-mono text-[10px] text-accent uppercase font-semibold">Inputs Contract</div>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {selectedComponent.inputs.map((inp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-accent">›</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg space-y-2">
                  <div className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">Outputs Contract</div>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {selectedComponent.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Engineering Considerations */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-accent uppercase font-semibold">Engineering Trade-offs & Optimizations</div>
                <ul className="space-y-2 text-xs text-muted leading-relaxed">
                  {selectedComponent.engineeringConsiderations.map((ec, idx) => (
                    <li key={idx} className="bg-[#080808] border border-border/80 p-3 rounded">
                      {ec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Failure Modes & Fallbacks */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-amber-400 uppercase font-semibold">Failure Modes & Resilient Fallback</div>
                {selectedComponent.failureModesAndFallbacks.map((fm, idx) => (
                  <div key={idx} className="bg-[#080808] border border-amber-500/30 p-3.5 rounded text-xs font-mono space-y-1">
                    <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failure: {fm.failure}
                    </div>
                    <div className="text-muted-light pt-1 border-t border-border/60">
                      <strong className="text-accent font-medium">Fallback Strategy: </strong>
                      {fm.fallback}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
