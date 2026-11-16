import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Code2, Cpu, Terminal, FileText, Sliders, BarChart3, Network, Layers } from 'lucide-react';
import { HeroSection } from '../components/hero/HeroSection';
import { SectionHeading } from '../components/common/SectionHeading';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { projects } from '../data/projects';
import { labNotes } from '../data/labNotes';
import { profile } from '../data/profile';

interface HomePageProps {
  onOpenTerminal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenTerminal }) => {
  const featuredProjects = projects.filter(p => p.featured);
  const recentNotes = labNotes.slice(0, 2);

  return (
    <div className="w-full bg-background min-h-screen">
      {/* 1. Full-screen Hero Section with Pink Flame */}
      <HeroSection />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* 2. Short Introduction & Engineering Philosophy */}
        <section id="intro" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="font-mono text-xs text-accent mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Engineering Philosophy
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
                Deterministic rigor meets adaptive AI.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-4 text-muted text-base leading-relaxed">
              <p>
                {profile.bio[0]}
              </p>
              <p>
                {profile.bio[1]}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button to="/about" variant="outline" size="sm">
                  Full Background & Skills
                </Button>
                <button
                  onClick={onOpenTerminal}
                  className="font-mono text-xs text-muted hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  Type <span className="text-primary font-bold">about</span> in terminal
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Featured Projects Showcase */}
        <section id="featured" className="scroll-mt-24">
          <SectionHeading
            label="Selected Works"
            title="Featured Engineering Systems"
            description="Architectural case studies across persistent memory engines, agent orchestration, Chrome extensions, and computer vision systems."
            action={
              <Button to="/work" variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Projects
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-[#0E0E0E] hover:bg-[#121212] border border-border hover:border-accent/40 rounded-lg p-6 sm:p-8 flex flex-col justify-between transition-[border-color,background-color] duration-200"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="font-mono text-xs text-accent">
                      {project.category}
                    </span>
                    <Badge variant={project.status === 'Active Development' ? 'accent' : 'status'}>
                      {project.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-xl sm:text-2xl font-semibold text-primary group-hover:text-accent transition-colors">
                    <Link to={`/work/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h3>

                  {/* Subtitle */}
                  <p className="mt-2 text-sm text-muted-light line-clamp-2">
                    {project.subtitle}
                  </p>

                  {/* Short Description */}
                  <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border/80">
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.03] text-muted border border-border group-hover:border-accent/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/work/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary group-hover:text-accent transition-colors"
                    >
                      Read Case Study
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted hover:text-primary transition-colors"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* 4. AI Engineering Playground Feature Preview */}
        <section className="scroll-mt-24">
          <SectionHeading
            label="Interactive Lab"
            title="AI Engineering Playground"
            description="Hands-on explorations of multimodal blueprint parsing, live classification threshold recalculations, prompt engineering, and system topologies."
            action={
              <Button to="/playground" variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch Playground
              </Button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Tool 1 */}
            <Link
              to="/playground?tab=pipeline"
              className="bg-[#0B0B0B] border border-border hover:border-accent/50 p-6 rounded-lg space-y-3 transition-[border-color,background-color] duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                  Pipeline Explorer
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Interactive 6-stage walkthrough from high-DPI raster ingestion to OpenCV morphology, OCR boxes, and structured JSON.
                </p>
              </div>
              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-accent">
                <span>Explore Pipeline</span>
                <span>→</span>
              </div>
            </Link>

            {/* Tool 2 */}
            <Link
              to="/playground?tab=eval"
              className="bg-[#0B0B0B] border border-border hover:border-accent/50 p-6 rounded-lg space-y-3 transition-[border-color,background-color] duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                  Model Evaluation
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Adjustable classification threshold slider dynamically recalculating Confusion Matrix, Precision, Recall, and F1 curve.
                </p>
              </div>
              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-accent">
                <span>Evaluate Metrics</span>
                <span>→</span>
              </div>
            </Link>

            {/* Tool 3 */}
            <Link
              to="/playground?tab=prompt"
              className="bg-[#0B0B0B] border border-border hover:border-accent/50 p-6 rounded-lg space-y-3 transition-[border-color,background-color] duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                  Prompt Lab
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Side-by-side comparison of naive natural language prompts vs. schema-constrained, deterministic few-shot instructions.
                </p>
              </div>
              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-accent">
                <span>Test Prompts</span>
                <span>→</span>
              </div>
            </Link>

            {/* Tool 4 */}
            <Link
              to="/playground?tab=architecture"
              className="bg-[#0B0B0B] border border-border hover:border-accent/50 p-6 rounded-lg space-y-3 transition-[border-color,background-color] duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-primary group-hover:text-accent transition-colors">
                  Architecture Explorer
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Interactive node graph breaking down contracts, engineering trade-offs, and failure fallbacks across every system tier.
                </p>
              </div>
              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs font-mono text-accent">
                <span>Inspect System</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* 5. Expertise & Technical Disciplines Overview */}
        <section>
          <SectionHeading
            label="Capabilities"
            title="Core Technical Focus"
            description="Specialized competencies developed across research prototypes and production-grade software."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-3 hover:border-accent/30 transition-colors">
              <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-primary">
                Persistent Memory & Graph RAG
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Neo4j temporal knowledge graphs with explicit validity windows, dense vector retrieval via pgvector, and hybrid semantic + graph traversals with conflict-aware memory updates.
              </p>
            </div>

            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-3 hover:border-accent/30 transition-colors">
              <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-primary">
                Agent Orchestration & MCP
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Autonomous multi-agent role decomposition (Planner, Architect, Coder), Model Context Protocol (MCP) tool integration, and browser extensions automating real-world consumer actions.
              </p>
            </div>

            <div className="bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-3 hover:border-accent/30 transition-colors">
              <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-primary">
                Computer Vision & Systems
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Classical morphological filtering and line extraction via OpenCV, deep OCR (EasyOCR) on technical schematics at Igniters Hub, and low-latency asynchronous Python/FastAPI backends.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Recent Lab Notes Preview */}
        <section>
          <SectionHeading
            label="Research Log"
            title="Technical Lab Notes"
            description="Empirical observations, benchmarks, and architectural notes from active experiments."
            action={
              <Button to="/lab" variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Notes
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentNotes.map(note => (
              <div
                key={note.id}
                className="bg-[#0B0B0B] border border-border rounded-lg p-6 flex flex-col justify-between hover:border-accent/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-3">
                    <span className="text-accent">{note.category}</span>
                    <span>{note.date} · {note.readTime}</span>
                  </div>
                  <h4 className="font-heading font-medium text-base text-primary mb-2 hover:text-accent transition-colors">
                    <Link to={`/lab#${note.slug}`}>
                      {note.title}
                    </Link>
                  </h4>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {note.summary}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="font-mono text-[10px] text-muted-dark">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/lab#${note.slug}`}
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    Read note →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Contact Invitation Banner */}
        <section className="bg-gradient-to-b from-[#0E0E0E] to-[#090909] border border-border rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-border text-muted-light text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Collaboration & Engineering Opportunities
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Let's build something technically exceptional.
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Interested in AI agent systems, persistent memory architectures, or computer vision engineering? Reach out directly or inspect contact endpoints in the terminal.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Button to="/contact" variant="primary" size="md">
                Get in Touch
              </Button>
              <Button
                href={profile.socialLinks.resumeUrl}
                external
                variant="secondary"
                size="md"
                icon={<FileText className="w-4 h-4 text-muted" />}
              >
                Download Resume
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
