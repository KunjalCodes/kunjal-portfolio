import React from 'react';

interface PageHeaderProps {
  /** Short label, shown as a terminal path: "work" -> ~/work */
  path: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** Top-of-page header for inner pages, matching the home section headers. */
export const PageHeader: React.FC<PageHeaderProps> = ({ path, title, description, children }) => (
  <header className="relative mb-12 md:mb-16">
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-xs text-accent">~/{path}</span>
      <span className="block h-px w-10 bg-accent" aria-hidden="true" />
    </div>
    <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-primary tracking-tight leading-[1.02]">
      {title}
    </h1>
    {description && <p className="mt-6 text-base md:text-lg text-muted max-w-2xl leading-relaxed">{description}</p>}
    {children && <div className="mt-8">{children}</div>}
  </header>
);
