import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline' | 'status';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'sm'
}) => {
  const base = "inline-flex items-center gap-1.5 font-mono text-xs font-medium rounded-md transition-colors";
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs"
  };

  const variants = {
    default: "bg-white/[0.04] text-muted-light border border-border",
    accent: "bg-accent/10 text-accent border border-accent/25",
    outline: "bg-transparent text-primary/80 border border-border hover:border-accent/30",
    status: "bg-white/[0.03] text-primary/90 border border-border"
  };

  return (
    <span className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
