import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, FileText, MapPin } from 'lucide-react';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { Button } from '../components/common/Button';

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-mono text-xs text-accent mb-2 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
    {children}
  </div>
);

/** Technologies worth exploring, in the order they should appear. */
const STACK = [
  'MCP',
  'Python',
  'FastAPI',
  'Neo4j',
  'pgvector',
  'ChromaDB',
  'LangChain',
  'Ollama',
  'Groq',
  'Gemini',
  'OCR',
  'Next.js',
  'TypeScript',
];

const usesTech = (tags: string[], tech: string) =>
  tags.some(t => t.toLowerCase().includes(tech.toLowerCase()));

export const AboutPage: React.FC = () => {
  const [tech, setTech] = useState<string>('MCP');
  const matching = useMemo(() => projects.filter(p => usesTech(p.tags, tech)), [tech]);
  const nowProjects = projects.filter(p => p.status === 'In progress');

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <Eyebrow>About</Eyebrow>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-primary">{profile.name}</h1>
        <p className="mt-3 text-lg text-muted-light">{profile.title}</p>
        <p className="mt-4 text-base text-muted leading-relaxed">{profile.oneLiner}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-muted">
          <MapPin className="w-3.5 h-3.5" />
          {profile.location}
        </div>
      </div>

      {/* Bio + now */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 items-start">
        <div className="lg:col-span-7 bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <div className="space-y-4 text-sm sm:text-base text-muted leading-relaxed">
            {profile.bio.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-muted-light' : ''}>
                {p}
              </p>
            ))}
          </div>
          <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-border/80">
            <Button
              href={profile.socialLinks.resumeUrl}
              external
              variant="primary"
              size="sm"
              icon={<FileText className="w-4 h-4 text-[#080808]" />}
            >
              Resume
            </Button>
            <Button to="/contact" variant="secondary" size="sm">
              Contact
            </Button>
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted hover:text-primary transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted hover:text-primary transition-colors"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0B0B0B] border border-border rounded-lg p-6 flex flex-col">
          <Eyebrow>Right now</Eyebrow>
          <ul className="mt-2 space-y-4">
            {nowProjects.map(p => (
              <li key={p.id}>
                <Link to={`/work/${p.slug}`} className="group block">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="font-heading text-base font-semibold text-primary group-hover:text-accent transition-colors">
                      {p.title.split(' — ')[0]}
                    </span>
                  </div>
                  <p className="mt-1 pl-3.5 text-xs text-muted leading-relaxed">
                    {p.organization ? `At ${p.organization}. ` : ''}
                    {p.title.split(' — ')[1]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <dl className="mt-6 pt-5 border-t border-border/80 grid grid-cols-[96px_1fr] gap-x-4 gap-y-3 text-xs">
            <dt className="font-mono text-muted">Working at</dt>
            <dd className="text-primary/90">Igniters Hub</dd>
            <dt className="font-mono text-muted">Education</dt>
            <dd className="text-primary/90">B.Tech CSE, 2026</dd>
            <dt className="font-mono text-muted">Based in</dt>
            <dd className="text-primary/90">Uttarakhand, India</dd>
            <dt className="font-mono text-muted">Looking for</dt>
            <dd className="text-primary/90 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              AI engineering roles
            </dd>
          </dl>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6 mb-16">
        <Eyebrow>Skills</Eyebrow>
        <h2 className="font-heading text-2xl font-bold text-primary -mt-2">How I work with models</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.skills.map(cat => (
            <div key={cat.category} className="bg-[#0B0B0B] border border-border rounded-lg p-6">
              <h3 className="font-heading font-semibold text-base text-primary mb-4">{cat.category}</h3>
              <ul className="space-y-3">
                {cat.skills.map(skill => (
                  <li key={skill.name}>
                    <div className="text-sm text-primary/90">{skill.name}</div>
                    {skill.note && <div className="text-xs text-muted mt-0.5 leading-relaxed">{skill.note}</div>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stack explorer */}
        <div className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
            <h3 className="font-heading font-semibold text-base text-primary">Where I have used it</h3>
            <span className="text-xs font-mono text-muted">pick a technology</span>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Technologies">
            {STACK.map(t => {
              const count = projects.filter(p => usesTech(p.tags, t)).length;
              const active = t === tech;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTech(t)}
                  className={`font-mono text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    active
                      ? 'bg-accent text-[#080808] border-accent'
                      : 'bg-[#121212] text-muted border-border hover:text-primary'
                  }`}
                >
                  {t}
                  <span className={`ml-1.5 ${active ? 'text-black/60' : 'text-muted-dark'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <ul className="mt-6 divide-y divide-border/80 border-t border-border/80" aria-live="polite">
            {matching.map(p => (
              <li key={p.id}>
                <Link to={`/work/${p.slug}`} className="group flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm text-primary group-hover:text-accent transition-colors truncate">
                      {p.title.split(' — ')[0]}
                    </div>
                    <div className="text-xs text-muted truncate">{p.title.split(' — ')[1]}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent shrink-0 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-6 mb-16">
        <Eyebrow>Experience</Eyebrow>
        <h2 className="font-heading text-2xl font-bold text-primary -mt-2">Where I have worked</h2>

        <ol className="relative border-l border-border ml-1.5 space-y-10">
          {profile.experience.map((exp, i) => (
            <li key={i} className="pl-7 relative">
              <span
                className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-accent' : 'bg-[#2E2E2E]'}`}
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="font-heading text-lg font-semibold text-primary">
                  {exp.role} <span className="text-muted-light font-normal">· {exp.organization}</span>
                </h3>
                <span className="font-mono text-xs text-muted">{exp.period}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
                {exp.description.map((d, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="text-accent font-mono">›</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {exp.technologies.map(t => (
                  <span key={t} className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.03] text-muted border border-border">
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Highlights + education */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8">
          <Eyebrow>Highlights</Eyebrow>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {profile.achievements.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-accent font-mono text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <Eyebrow>Education</Eyebrow>
            {profile.education.map((edu, i) => (
              <div key={i} className="mt-3">
                <h3 className="font-heading text-base font-semibold text-primary">
                  {edu.degree}, {edu.field}
                </h3>
                <p className="text-sm text-muted-light mt-1">{edu.institution}</p>
                <p className="text-xs font-mono text-muted mt-1">{edu.period}</p>
                {edu.details && (
                  <ul className="mt-3 space-y-1 text-xs text-muted">
                    {edu.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-border/80">
            <Eyebrow>Certifications</Eyebrow>
            <ul className="mt-3 space-y-3">
              {profile.certifications.map((c, i) => (
                <li key={i}>
                  <div className="text-sm text-primary">{c.title}</div>
                  {c.issuer && <div className="text-xs text-muted">{c.issuer}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Resume */}
      <section className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-primary">The one-page version</h3>
          <p className="text-sm text-muted mt-1">Experience, projects and skills on a single page.</p>
        </div>
        <Button
          href={profile.socialLinks.resumeUrl}
          external
          variant="primary"
          size="md"
          icon={<ArrowUpRight className="w-4 h-4" />}
        >
          Open resume (PDF)
        </Button>
      </section>
    </div>
  );
};
