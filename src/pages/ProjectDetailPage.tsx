import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, AlertCircle, CheckCircle2, Layers, Cpu, Code2, Terminal } from 'lucide-react';
import { projects } from '../data/projects';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TemporalMemoryDemo } from '../components/interactive/TemporalMemoryDemo';
import { AgentTraceDemo } from '../components/interactive/AgentTraceDemo';

/** Interactive demos that belong to a specific project's case study */
const projectDemos: Record<string, { title: string; body: string; Demo: React.FC }> = {
  'second-brain': {
    title: 'Memory that knows what changed',
    body: 'A fact is never overwritten; its validity window is closed. Drag through the year and compare what the temporal graph answers with what plain vector search would return. The example comes from the project README.',
    Demo: TemporalMemoryDemo,
  },
  'mcp-ai-copilot': {
    title: 'Replay a real session',
    body: 'Pick a question to see the tool the model chose, the MCP call and the result. Questions and results are taken from a logged session of the copilot.',
    Demo: AgentTraceDemo,
  },
};
import { ArchitectureFlowDiagram } from '../components/common/ArchitectureFlowDiagram';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);
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
          <Badge variant={project.status === 'In progress' ? 'accent' : 'status'}>
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
              View on GitHub
            </Button>
          )}

          {project.demoUrl && (
            <Button
              href={project.demoUrl}
              external
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Live demo
            </Button>
          )}

          {project.organization && (
            <div className="text-xs font-mono text-muted bg-[#121212] px-3 py-2 rounded border border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-primary">Company project at {project.organization}</span>
              <span className="text-muted-dark">· code and data are private</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-dark ml-auto">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Terminal: <span className="text-muted-light">open {project.slug}</span></span>
          </div>
        </div>

        {/* Dedicated Flagship Benchmark Card for AI Second Brain */}
        {project.id === 'second-brain' && (
          <div className="mt-8 bg-gradient-to-r from-[#141012] via-[#0E0E0E] to-[#121014] border border-accent/40 rounded-lg p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-xs text-accent font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Benchmark: hybrid search on a 10,000-node graph
              </div>
              <span className="text-[11px] font-mono text-muted">eval/graph_scale_benchmark.py</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#080808] p-4 rounded-md border border-border">
                <div className="text-[10px] font-mono text-muted">Before (mean)</div>
                <div className="text-2xl font-mono font-bold text-red-400 mt-1 tabular-nums">~39.5 s</div>
                <div className="text-[11px] text-muted-dark">Each lookup scanned all 219,782 edges</div>
              </div>
              <div className="bg-[#080808] p-4 rounded-md border border-accent/30">
                <div className="text-[10px] font-mono text-accent">After (mean)</div>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">~0.58 s</div>
                <div className="text-[11px] text-muted-dark">Index on RELATES_TO.memory_id</div>
              </div>
              <div className="bg-[#080808] p-4 rounded-md border border-border">
                <div className="text-[10px] font-mono text-muted">Speedup</div>
                <div className="text-2xl font-mono font-bold text-accent mt-1">68× faster</div>
                <div className="text-[11px] text-muted-dark">Same synthetic graph, same machine</div>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed font-sans pt-1">
              Deterministic synthetic graphs at 100, 1,000 and 10,000 nodes with about 1% hub entities. The multi-hop traversal itself stayed fast (43.9 ms to 564.2 ms); the real cost was a missing index, so no fan-out cap was needed. Single machine, Neo4j Community, synthetic data: not a production-scale claim.
            </p>
          </div>
        )}

        {/* Architecture Metrics Quick Bar */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0D0D0D] p-4 rounded-lg border border-border">
            {project.metrics.map(m => (
              <div key={m.label}>
                <div className="text-[11px] font-mono text-muted">{m.label}</div>
                <div className="text-sm font-mono font-semibold text-primary mt-0.5 tabular-nums">{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <div className="space-y-16">
        {/* 1. Problem Statement */}
        <section className="reveal bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            01. The problem
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Why it was worth building
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {project.problemStatement}
          </p>
        </section>

        {/* 2. Project Overview */}
        <section className="reveal space-y-4">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            02. What I built
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            How it works
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

        {/* Interactive demo for this project */}
        {projectDemos[project.id] && (() => {
          const { title, body, Demo } = projectDemos[project.id];
          return (
            <section className="reveal space-y-6">
              <div className="font-mono text-xs text-accent flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Try it
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">{title}</h2>
                <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed max-w-3xl">{body}</p>
              </div>
              <Demo />
            </section>
          );
        })()}

        {/* 3. System Architecture */}
        <section className="reveal space-y-6">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <Layers className="w-4 h-4" />
            03. Architecture
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            From input to output
          </h2>

          <ArchitectureFlowDiagram
            summary={project.architecture.summary}
            diagramDescription={project.architecture.diagramDescription}
            dataFlowSteps={project.dataFlowSteps}
          />

          {/* Architecture Layer Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="font-mono text-xs text-muted font-medium">
              Layers and what they use
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
        <section className="reveal space-y-6">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            04. Implementation
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            Key decisions
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
                      <span>{item.language || 'code'}</span>
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
        <section className="reveal space-y-6">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            05. Challenges
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            What was hard
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

        {/* 6. Screenshots (only real captures from the project) */}
        {project.demonstrations.length > 0 && (
          <section className="reveal space-y-6">
            <div className="font-mono text-xs text-accent flex items-center gap-2">
              <Layers className="w-4 h-4" />
              06. Screenshots
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
              The project running
            </h2>

            <div className={`grid gap-6 ${project.demonstrations.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {project.demonstrations.map((demo, idx) => (
                <figure
                  key={idx}
                  className="bg-[#0B0B0B] border border-border rounded-lg overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(idx)}
                    className="group relative bg-[#080808] border-b border-border flex items-center justify-center overflow-hidden cursor-zoom-in"
                    aria-label={`Enlarge screenshot: ${demo.title}`}
                  >
                    <img
                      src={demo.image}
                      alt={demo.title}
                      loading="lazy"
                      className={`block ${demo.narrow ? 'max-h-[420px] w-auto' : 'w-full h-auto'} transition-opacity duration-200 group-hover:opacity-90`}
                    />
                    <span className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 border border-border text-[11px] font-mono text-muted-light opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to enlarge
                    </span>
                  </button>
                  <figcaption className="p-4 space-y-1">
                    <h4 className="font-heading text-sm font-semibold text-primary">{demo.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{demo.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {lightbox !== null && project.demonstrations[lightbox] && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={project.demonstrations[lightbox].title}
          >
            <img
              src={project.demonstrations[lightbox].image}
              alt={project.demonstrations[lightbox].title}
              className="max-w-full max-h-[85vh] rounded-lg border border-border object-contain"
            />
            <p className="mt-4 text-sm text-muted-light text-center max-w-2xl">
              {project.demonstrations[lightbox].caption}
              <span className="ml-3 font-mono text-[11px] text-muted-dark">Esc to close</span>
            </p>
          </div>
        )}

        {/* 7. Actual Results & Real Limitations */}
        <section className="reveal space-y-6">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            07. Results
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
            What it does, and where it falls short
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Realized Capabilities */}
            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-4">
              <h3 className="font-mono text-xs text-emerald-400 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Results
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
              <h3 className="font-mono text-xs text-amber-400 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4" />
                Limitations
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
          <section className="reveal space-y-6">
            <div className="font-mono text-xs text-accent flex items-center gap-2">
              <Layers className="w-4 h-4" />
              08. Next
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary">
              What I would build next
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
            All projects
          </Link>

          <Link
            to={`/work/${nextProject.slug}`}
            className="group flex flex-col sm:items-end text-right"
          >
            <span className="text-[10px] font-mono text-muted">Next project →</span>
            <span className="font-heading text-base font-semibold text-primary group-hover:text-accent transition-colors">
              {nextProject.title}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};
