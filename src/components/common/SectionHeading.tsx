import React from 'react';

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Section number shown as "01" with a large outlined numeral behind the title */
  index?: number;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  title,
  description,
  action,
  className = '',
  index,
}) => {
  const num = index !== undefined ? String(index).padStart(2, '0') : undefined;

  return (
    <div className={`relative mb-12 ${className}`}>
      {num && (
        <span
          aria-hidden="true"
          className="reveal-numeral numeral-outline pointer-events-none select-none absolute -top-10 right-0 font-heading font-bold leading-none text-[96px] md:text-[160px] tracking-tighter"
        >
          {num}
        </span>
      )}

      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="reveal max-w-3xl">
          {label && (
            <div className="flex items-center gap-3 mb-5">
              {num && <span className="font-mono text-xs text-accent tabular-nums">{num}</span>}
              <span className="reveal-line block h-px w-10 bg-accent" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-light">{label}</span>
            </div>
          )}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] font-bold text-primary tracking-tight leading-[1.05]">
            {title}
          </h2>
          {description && (
            <p className="mt-5 text-base md:text-lg text-muted max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="reveal shrink-0">{action}</div>}
      </div>
    </div>
  );
};
