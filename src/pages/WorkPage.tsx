import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Github, ExternalLink, Filter } from 'lucide-react';
import { projects } from '../data/projects';
import { ProjectCategory } from '../types';
import { Badge } from '../components/common/Badge';

export const WorkPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: (ProjectCategory | 'All')[] = [
    'All',
    'AI / Machine Learning',
    'Computer Vision',
    'Software Engineering',
    'Experiments',
  ];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Engineering Portfolio
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          Curated Systems & Research
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          Architectural deep-dives into computer vision engines, spatial canvas tools, and AI infrastructure. Each project includes transparent technical implementations, challenges, and limitations.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-border">
        <span className="text-xs font-mono text-muted mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {categories.map(cat => {
          const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length;
          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-mono text-xs px-3 py-1.5 rounded transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-accent text-[#080808] font-semibold shadow-sm'
                  : 'bg-[#121212] text-muted hover:text-primary hover:bg-[#181818] border border-border'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-black/20 text-[#080808]' : 'bg-white/[0.05] text-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {filteredProjects.map((project, idx) => (
            <motion.article
              layout
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-[#0D0D0D] border border-border hover:border-accent/40 rounded-lg p-6 sm:p-8 flex flex-col justify-between transition-colors group"
            >
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent">
                      {project.category}
                    </span>
                    <span className="text-muted-dark text-xs">·</span>
                    <span className="font-mono text-[11px] text-muted">
                      {project.timeframe}
                    </span>
                  </div>
                  <Badge variant={project.status === 'Active Development' ? 'accent' : 'status'}>
                    {project.status}
                  </Badge>
                </div>

                {/* Title */}
                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary group-hover:text-accent transition-colors">
                  <Link to={`/work/${project.slug}`}>
                    {project.title}
                  </Link>
                </h2>

                {/* Subtitle */}
                <p className="mt-2 text-sm text-muted-light line-clamp-2 leading-relaxed">
                  {project.subtitle}
                </p>

                {/* Short Description */}
                <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                  {project.shortDescription}
                </p>

                {/* Key Metric Preview if exists */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded border border-border/60">
                    {project.metrics.map(m => (
                      <div key={m.label} className="text-left">
                        <div className="text-[10px] font-mono text-muted uppercase">{m.label}</div>
                        <div className="text-xs font-mono font-medium text-primary mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map(t => (
                    <span
                      key={t}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.03] text-muted border border-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary group-hover:text-accent transition-colors"
                  >
                    Dedicated Case Study
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-primary transition-colors"
                        title="GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Code
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:underline transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
