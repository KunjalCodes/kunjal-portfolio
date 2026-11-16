import React from 'react';

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-border ${className}`}>
      <div>
        {label && (
          <div className="font-mono text-xs text-accent mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {label}
          </div>
        )}
        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm md:text-base text-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="self-start md:self-end shrink-0">{action}</div>}
    </div>
  );
};
