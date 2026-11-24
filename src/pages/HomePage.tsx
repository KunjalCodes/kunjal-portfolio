import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, FileText, Bot, Database, ScanText } from 'lucide-react';
import { HeroSection } from '../components/hero/HeroSection';
import { SectionHeading } from '../components/common/SectionHeading';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PortfolioTerminal } from '../components/terminal/PortfolioTerminal';
import { AskPortfolio } from '../components/interactive/AskPortfolio';
import { AgentGame } from '../components/interactive/AgentGame';
import { projects } from '../data/projects';
import { profile } from '../data/profile';

interface HomePageProps {
  onOpenTerminal: () => void;
}


const focusAreas = [
  {
    icon: Bot,
    title: 'Agents and tool use',
    body: 'Tool-calling loops, MCP servers and clients, and multi-agent pipelines. I care about what an agent is allowed to do, and about being able to see what it did.',
  },
  {
    icon: Database,
    title: 'Memory and retrieval',
    body: 'RAG, hybrid graph and vector retrieval, and temporal knowledge graphs, so answers come from the right facts, the current ones, with a source.',
  },
  {
    icon: ScanText,
    title: 'Applied AI in production',
    body: 'OCR, computer vision and LLMs working together on real documents, such as extracting structured information from engineering drawings at Igniters Hub.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onOpenTerminal }) => {
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="w-full bg-background min-h-screen">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* Intro */}
        <section id="intro" className="scroll-mt-24">
          <SectionHeading index={1} label="About" title="The model is the easy part" description={profile.oneLiner} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="reveal lg:col-span-8 space-y-4 text-muted text-base md:text-lg leading-relaxed">
              <p>{profile.bio[0]}</p>
              <p>{profile.bio[1]}</p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button to="/about" variant="outline" size="sm">
                  More about me
                </Button>
                <button
                  onClick={onOpenTerminal}
                  className="font-mono text-xs text-muted hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  or press <span className="text-primary font-bold">~</span> anywhere
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ask: real retrieval over this site */}
        <section className="scroll-mt-24">
          <SectionHeading
            index={2}
            label="Ask"
            title="Ask about my work"
            description="Type a question a recruiter might ask. A small retrieval pipeline (chunking and BM25 ranking) searches my projects and experience right in your browser and returns the evidence with links. Open it from any page with ⌘K."
          />
          <div className="reveal">
            <AskPortfolio />
          </div>
        </section>

        {/* Featured work */}
        <section id="featured" className="scroll-mt-24">
          <SectionHeading
            index={3}
            label="Selected work"
            title="Things I have built"
            description="Agent memory, tool use over MCP, and AI that reads engineering drawings."
            action={
              <Button to="/work" variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                All projects
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, idx) => (
              <article
                key={project.id}
                data-idx={idx}
                className="reveal spotlight group relative bg-[#0E0E0E] hover:bg-[#121212] border border-border hover:border-accent/40 rounded-lg p-6 sm:p-8 flex flex-col justify-between transition-[border-color,background-color] duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="font-mono text-xs text-accent">
                      {project.category}
                      {project.organization && <span className="text-muted"> · {project.organization}</span>}
                    </span>
                    <Badge variant={project.status === 'In progress' ? 'accent' : 'status'}>{project.status}</Badge>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-semibold text-primary group-hover:text-accent transition-colors">
                    <Link to={`/work/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
                      {project.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm text-muted-light leading-relaxed">{project.subtitle}</p>

                  {project.metrics && (
                    <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/80 pt-5">
                      {project.metrics.map(m => (
                        <div key={m.label} className="min-w-0">
                          <div className="text-[11px] font-mono text-muted truncate">{m.label}</div>
                          <div className="text-sm text-primary mt-1 leading-snug">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border/80">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.slice(0, 6).map(tag => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.03] text-muted border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary group-hover:text-accent transition-colors">
                      Read case study
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 text-xs font-mono text-muted hover:text-primary transition-colors"
                      >
                        GitHub ↗
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-dark">Company project</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mini game built from the projects above */}
          <div className="mt-16">
            <div className="reveal flex items-center gap-3 mb-5">
              <span className="reveal-line block h-px w-10 bg-accent" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-light">Mini game: be the agent</span>
            </div>
            <div className="reveal">
              <AgentGame />
            </div>
          </div>
        </section>

        {/* Focus areas */}
        <section>
          <SectionHeading index={4} label="Focus" title="What I work on" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {focusAreas.map(f => (
              <div key={f.title} className="reveal spotlight bg-[#0B0B0B] border border-border p-6 rounded-lg space-y-3 hover:border-accent/30 transition-colors">
                <div className="w-9 h-9 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-primary">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Terminal */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="reveal lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs text-accent tabular-nums">05</span>
                <span className="reveal-line block h-px w-10 bg-accent" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-light">Terminal</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight leading-[1.05]">
                Prefer a command line?
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                The whole site is browsable from here. Type <span className="font-mono text-primary">help</span> for
                commands, <span className="font-mono text-primary">projects</span> to list my work or{' '}
                <span className="font-mono text-primary">open second-brain</span> to jump to a case study. Tab completes,
                arrow keys walk your history, and <span className="font-mono text-primary">~</span> opens it full screen
                from any page.
              </p>
            </div>
            <div className="reveal lg:col-span-8">
              <PortfolioTerminal isOpen variant="inline" onClose={() => {}} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="reveal spotlight bg-gradient-to-b from-[#0E0E0E] to-[#090909] border border-border rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-border text-muted-light text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {profile.status}
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Building with agents, memory or retrieval? Let’s talk
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              I am looking for AI engineering roles and interesting problems. Email is the fastest way to reach me.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Button to="/contact" variant="primary" size="md">
                Get in touch
              </Button>
              <Button
                href={profile.socialLinks.resumeUrl}
                external
                variant="secondary"
                size="md"
                icon={<FileText className="w-4 h-4 text-muted" />}
              >
                Resume
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
