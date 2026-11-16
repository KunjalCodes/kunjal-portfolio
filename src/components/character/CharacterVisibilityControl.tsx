import React from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface CharacterVisibilityControlProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export const CharacterVisibilityControl: React.FC<CharacterVisibilityControlProps> = ({
  isVisible,
  onToggle,
  className = '',
}) => {
  return (
    <button
      onClick={onToggle}
      className={`font-mono text-[10px] px-2 py-1 rounded-md bg-[#121212]/90 hover:bg-[#1A1A1A] border border-border hover:border-accent/40 text-muted hover:text-accent transition-all duration-200 flex items-center gap-1.5 shadow-md backdrop-blur-sm cursor-pointer select-none ${className}`}
      title={isVisible ? 'Hide companion Chotu' : 'Show companion Chotu'}
      aria-label={isVisible ? 'Hide companion Chotu' : 'Show companion Chotu'}
    >
      <Sparkles className="w-2.5 h-2.5 text-accent" />
      <span>Chotu:</span>
      <span className={isVisible ? 'text-accent font-semibold' : 'text-muted-dark'}>
        {isVisible ? 'ON' : 'OFF'}
      </span>
      {isVisible ? (
        <EyeOff className="w-3 h-3 text-muted ml-0.5" />
      ) : (
        <Eye className="w-3 h-3 text-accent ml-0.5" />
      )}
    </button>
  );
};
