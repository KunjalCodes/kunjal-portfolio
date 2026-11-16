import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, BookOpen, Clock, Tag, Code2, Terminal } from 'lucide-react';
import { labNotes } from '../data/labNotes';
import { Badge } from '../components/common/Badge';

export const LabPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Collect all unique tags
  const allTags = ['All', ...Array.from(new Set(labNotes.flatMap(n => n.tags)))];

  const filteredNotes = selectedTag === 'All'
    ? labNotes
    : labNotes.filter(n => n.tags.includes(selectedTag));

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="font-mono text-xs text-accent mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Technical Journal
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          Engineering Lab & Research
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          An open technical journal documenting algorithmic benchmarks, computer vision heuristics, OCR performance evaluations, and systems engineering observations.
        </p>
      </div>

      {/* Filter by Tag */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-border">
        <span className="text-xs font-mono text-muted mr-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Topic:
        </span>
        {allTags.map(tag => {
          const isActive = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`font-mono text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                isActive
                  ? 'bg-accent text-[#080808] font-medium'
                  : 'bg-[#121212] text-muted hover:text-primary hover:bg-[#181818] border border-border'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Notes Feed / Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-12 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-primary">
            No lab notes found under tag "#{selectedTag}"
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Explore other engineering topics or view all research notes.
          </p>
          <button
            onClick={() => setSelectedTag('All')}
            className="px-4 py-2 rounded bg-accent text-black font-semibold text-xs font-mono transition-colors cursor-pointer"
          >
            Show All Notes
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredNotes.map((note, idx) => (
            <motion.article
              key={note.id}
              id={note.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-6 hover:border-accent/30 transition-colors"
            >
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-medium">{note.category}</span>
                  <span className="text-muted-dark">·</span>
                  <span>{note.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted" />
                  <span>{note.readTime}</span>
                  <span className="text-muted-dark">·</span>
                  <Badge variant={note.status === 'Published' ? 'default' : 'accent'}>
                    {note.status}
                  </Badge>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                  {note.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  {note.summary}
                </p>
              </div>

              {/* Hypothesis Box */}
              <div className="bg-[#0E0E0E] border-l-2 border-accent p-4 rounded-r-md text-xs sm:text-sm font-sans space-y-1">
                <div className="font-mono text-[11px] text-accent font-medium">
                  Core Hypothesis
                </div>
                <p className="text-muted-light">
                  "{note.hypothesis}"
                </p>
              </div>

              {/* Key Findings */}
              <div className="space-y-2">
                <div className="font-mono text-xs text-primary font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  Empirical Findings
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted">
                  {note.findings.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <span className="text-accent font-mono text-xs mt-0.5">›</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optional Code Snippet */}
              {note.codeSnippet && (
                <div className="bg-[#060606] border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-[#101010] border-b border-border flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-accent" />
                      {note.codeSnippet.caption}
                    </span>
                    <span className="text-muted-dark uppercase">{note.codeSnippet.language}</span>
                  </div>
                  <pre className="p-4 font-mono text-xs text-primary/90 leading-relaxed overflow-x-auto">
                    <code>{note.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Tags Footer */}
              <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-muted hover:text-accent border border-border transition-colors cursor-pointer"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-muted-dark">
                  Ref: {note.id}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
