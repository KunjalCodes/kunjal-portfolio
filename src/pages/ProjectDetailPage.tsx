import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, AlertCircle, CheckCircle2, Layers, Cpu, Code2, Terminal, Sparkles } from 'lucide-react';
import { projects } from '../data/projects';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArchitectureFlowDiagram } from '../components/common/ArchitectureFlowDiagram';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  // Find next project for bottom navigation
  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <article className="pt-28 pb-24 max-w-5xl mx-auto px-6 min-h-screen">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border text-xs font-mono">
        <Link
          to="/work"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex items-center gap-2 text-muted">
          <span>{project.category}</span>
          <span>/</span>
          <span className="text-primary font-medium">{project.slug}</span>
        </div>
      </div>

      {/* Case Study Header */}
      <header className="space-y-4 mb-12">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{project.category}</Badge>
          <Badge variant={project.status === 'Active Development' ? 'accent' : 'status'}>
            {project.status}
          </Badge>
          <span className="font-mono text-xs text-muted ml-1">
            {project.timeframe}
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          {project.title}
        </h1>

        <p className="text-lg text-muted-light font-normal leading-relaxed max-w-3xl">
          {project.subtitle}
        </p>

        {/* Action Toolbar */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          {project.githubUrl && (
            <Button
              href={project.githubUrl}
              external
              variant="secondary"
              size="sm"
              icon={<Github className="w-4 h-4" />}
            >
              GitHub Repository
            </Button>
          )}

          {project.demoUrl ? (
            <Button
              href={project.demoUrl}
              external
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Live Demonstration
            </Button>
          ) : (
            <div className="text-xs font-mono text-muted bg-[#121212] px-3 py-2 rounded border border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500/70" />
              <span>Showcased via repository & recorded demos</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-dark ml-auto">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Terminal: <span className="text-muted-light">open {project.slug}</span></span>
          </div>
        </div>

        {/* Architecture Metrics Quick Bar */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0D0D0D] p-4 rounded-lg border border-border">
            {project.metrics.map(m => (
              <div key={m.label}>
                <div className="text-[11px] font-mono text-muted uppercase tracking-wider">{m.label}</div>
                <div className="text-sm font-mono font-semibold text-primary mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <div className="space-y-16">
        {/* 1. Problem Statement */}
        <section className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            01. Problem Statement
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            The Engineering Challenge
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {project.problemStatement}
          </p>
        </section>

        {/* 2. Project Overview */}
        <section className="space-y-4">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            02. Project Overview
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Solution & Methodology
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {project.projectOverview}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map(t => (
              <span
                key={t}
                className="font-mono text-xs px-2.5 py-1 rounded bg-[#141414] text-muted-light border border-border"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* 3. System Architecture */}
        <section className="space-y-6">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            03. System Architecture
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Staged Processing Pipeline & Data Flow
          </h2>

          <ArchitectureFlowDiagram
            summary={project.architecture.summary}
            diagramDescription={project.architecture.diagramDescription}
            dataFlowSteps={project.dataFlowSteps}
          />

          {/* Architecture Layer Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
              Layer Responsibilities & Tech Stack
            </h3>
            {project.architecture.layers.map((layer, idx) => (
              <div
                key={layer.name}
                className="bg-[#0B0B0B] border border-border p-5 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent">{idx + 1}.</span>
                    <h4 className="font-heading font-medium text-base text-primary">
                      {layer.name}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {layer.description}
                  </p>
                </div>
                <div className="sm:w-56 shrink-0 flex flex-wrap gap-1 sm:justify-end">
                  {layer.technologies.map(tech => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-muted border border-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Technical Implementation */}
        <section className="space-y-6">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            04. Technical Implementation
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Core Algorithmic Logic
          </h2>

          <div className="space-y-6">
            {project.technicalImplementation.map(item => (
              <div
                key={item.aspect}
                className="bg-[#0B0B0B] border border-border rounded-lg overflow-hidden"
              >
                <div className="p-5 border-b border-border bg-[#0E0E0E]">
                  <h3 className="font-heading font-medium text-base text-primary">
                    {item.aspect}
                  </h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.codeSnippet && (
                  <div className="p-4 bg-[#060606] overflow-x-auto">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-dark pb-2 mb-2 border-b border-border/40">
                      <span>Source: {item.language || 'code'}</span>
                      <span className="text-accent/60">Strictly typed</span>
                    </div>
                    <pre className="font-mono text-xs text-primary/90 leading-relaxed overflow-x-auto">
                      <code>{item.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. Engineering Challenges & Trade-offs */}
        <section className="space-y-6">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            05. Engineering Challenges
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Bottlenecks & Solved Trade-offs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.engineeringChallenges.map((ec, idx) => (
              <div
                key={idx}
                className="bg-[#0D0D0D] border border-border p-6 rounded-lg space-y-3"
              >
                <div className="font-mono text-xs text-amber-400/90 font-medium">
                  Challenge #{idx + 1}
                </div>
                <h3 className="font-heading text-base font-semibold text-primary">
                  {ec.challenge}
                </h3>
                <div className="space-y-2 pt-2 border-t border-border/80">
                  <p className="text-xs text-muted leading-relaxed">
                    <span className="text-primary font-medium font-mono">Solution: </span>
                    {ec.solution}
                  </p>
                  {ec.outcome && (
                    <p className="text-xs text-accent leading-relaxed">
                      <span className="text-primary font-medium font-mono">Outcome: </span>
                      {ec.outcome}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Demonstrations & Visual Schematics */}
        <section className="space-y-6">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            06. Demonstrations & Layout Previews
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            System Visualizations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {project.demonstrations.map((demo, idx) => (
              <div
                key={idx}
                className="bg-[#0B0B0B] border border-border rounded-lg overflow-hidden flex flex-col justify-between"
              >
                {/* Visual schematic container */}
                <div className="h-48 sm:h-56 bg-[#080808] border-b border-border flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                  {/* Subtle technical background grid */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #F0A5C8 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative z-10 space-y-2 max-w-sm">
                    <span className="inline-block px-2 py-0.5 rounded bg-white/[0.04] border border-border text-[10px] font-mono text-accent">
                      {demo.type.toUpperCase()} PREVIEW
                    </span>
                    <p className="text-xs font-mono text-muted-light">
                      {demo.placeholderText || `[${demo.title} Demonstration Viewport]`}
                    </p>
                    <span className="text-[10px] font-mono text-muted-dark block">
                      (Accurate non-fabricated demonstration layout)
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-heading text-sm font-semibold text-primary">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {demo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Actual Results & Real Limitations */}
        <section className="space-y-6">
          <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            07. Actual Results & Limitations
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Engineering Verification & Known Constraints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Realized Capabilities */}
            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Verified Results
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
                {project.actualResults.map((res, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Known Limitations */}
            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4" />
                Current Limitations
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
                {project.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold">—</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 08. Future Improvements & Roadmap */}
        {project.futureImprovements && project.futureImprovements.length > 0 && (
          <section className="space-y-6">
            <div className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              08. Future Improvements & Planned Roadmap
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
              Next Technical Milestones
            </h2>

            <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-3">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-muted">
                {project.futureImprovements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#080808] p-3.5 rounded border border-border/70">
                    <span className="text-accent font-mono font-bold">0{idx + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Next Project Footer Bar */}
        <div className="pt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            to="/work"
            className="text-xs font-mono text-muted hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Projects
          </Link>

          <Link
            to={`/work/${nextProject.slug}`}
            className="group flex flex-col sm:items-end text-right"
          >
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Next Case Study →</span>
            <span className="font-heading text-base font-semibold text-primary group-hover:text-accent transition-colors">
              {nextProject.title}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};
