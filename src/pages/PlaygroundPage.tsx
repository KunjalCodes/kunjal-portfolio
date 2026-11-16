import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, BarChart3, Terminal, Cpu, Network, CheckCircle } from 'lucide-react';
import { PipelineExplorer } from '../components/playground/PipelineExplorer';
import { ModelEvaluationDashboard } from '../components/playground/ModelEvaluationDashboard';
import { PromptEngineeringLab } from '../components/playground/PromptEngineeringLab';
import { ArchitectureExplorer } from '../components/playground/ArchitectureExplorer';
import { Badge } from '../components/common/Badge';

export const PlaygroundPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'pipeline';
  const [activeTab, setActiveTab] = useState<'pipeline' | 'eval' | 'prompt' | 'architecture'>(
    (initialTab as any) || 'pipeline'
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['pipeline', 'eval', 'prompt', 'architecture'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'pipeline' | 'eval' | 'prompt' | 'architecture') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'pipeline', label: 'Pipeline Explorer', icon: Layers, description: '6-Stage Blueprint Extraction' },
    { id: 'eval', label: 'Model Evaluation', icon: BarChart3, description: 'Real Dynamic ML Metrics & Trade-offs' },
    { id: 'prompt', label: 'Prompt Lab', icon: Terminal, description: 'Schema Constrained Prompting' },
    { id: 'architecture', label: 'System Architecture', icon: Network, description: 'Interactive Topology & Fallbacks' },
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 min-h-screen">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Interactive AI Engineering
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          AI Engineering Playground
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          Interactive engineering demonstrations of real-world computer vision pipelines, mathematical ML evaluation metrics, prompt optimization, and multimodal system architecture.
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded transition-all cursor-pointer font-mono text-xs select-none ${
                isActive
                  ? 'bg-accent text-[#080808] font-semibold shadow-md'
                  : 'bg-[#121212] text-muted hover:text-primary hover:bg-[#181818] border border-border'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-accent'}`} />
              <div className="text-left">
                <div className="leading-tight font-medium">{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'pipeline' && <PipelineExplorer />}
          {activeTab === 'eval' && <ModelEvaluationDashboard />}
          {activeTab === 'prompt' && <PromptEngineeringLab />}
          {activeTab === 'architecture' && <ArchitectureExplorer />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
