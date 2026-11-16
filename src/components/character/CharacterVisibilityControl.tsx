import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
      className={`font-mono text-[10px] px-2 py-1 rounded-md bg-[#101010]/90 hover:bg-[#181818] border border-border hover:border-accent/40 text-muted hover:text-accent transition-colors duration-150 flex items-center gap-1.5 backdrop-blur-sm cursor-pointer select-none ${className}`}
      title={isVisible ? 'Hide companion' : 'Show companion'}
      aria-label={isVisible ? 'Hide companion' : 'Show companion'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      <span>Companion:</span>
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
