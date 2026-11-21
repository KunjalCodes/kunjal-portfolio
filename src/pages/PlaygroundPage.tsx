import { PageHeader } from '../components/common/PageHeader';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    { id: 'pipeline', label: 'Drawing pipeline', icon: Layers, description: '6-Stage Blueprint Extraction' },
    { id: 'eval', label: 'Model Evaluation', icon: BarChart3, description: 'Real Dynamic ML Metrics & Trade-offs' },
    { id: 'prompt', label: 'Prompt Lab', icon: Terminal, description: 'Schema Constrained Prompting' },
    { id: 'architecture', label: 'Architecture', icon: Network, description: 'Interactive Topology & Fallbacks' },
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 min-h-screen">
      <PageHeader
        path="playground"
        title="Hands-on AI engineering"
        description="Four small interactive tools for ideas I use every day: how a document pipeline turns a drawing into structured data, how a classification threshold trades precision for recall, why structured prompts beat loose ones, and how an AI system is split into layers. Everything runs in your browser on prepared data; no model is called live."
      />

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md transition-colors duration-150 cursor-pointer font-mono text-xs select-none ${
                isActive
                  ? 'bg-accent text-[#080808] font-medium shadow-sm'
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
      {/* Rendered directly: no enter/exit animation that could leave a tab invisible */}
      <div key={activeTab}>
        {activeTab === 'pipeline' && <PipelineExplorer />}
        {activeTab === 'eval' && <ModelEvaluationDashboard />}
        {activeTab === 'prompt' && <PromptEngineeringLab />}
        {activeTab === 'architecture' && <ArchitectureExplorer />}
      </div>
    </div>
  );
};
