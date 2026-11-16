import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface CharacterDialogueProps {
  message: string | null;
  onDismiss: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'floating' | 'docked-terminal' | 'section-anchor';
}

export const CharacterDialogue: React.FC<CharacterDialogueProps> = ({
  message,
  onDismiss,
  position = 'bottom-right',
}) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`absolute bottom-full mb-3 z-40 max-w-[240px] sm:max-w-[280px] bg-[#121212]/95 border border-accent/40 text-primary px-3.5 py-2.5 rounded-lg shadow-2xl backdrop-blur-md pointer-events-auto select-none ${
            position === 'bottom-left'
              ? 'left-0 sm:left-2'
              : 'right-0 sm:right-2'
          }`}
          role="status"
          aria-live="polite"
        >
          {/* Header with mini flame icon & dismiss button */}
          <div className="flex items-center justify-between gap-2 mb-1 border-b border-border/60 pb-1">
            <span className="flex items-center gap-1 text-[10px] font-mono text-accent font-semibold tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5" />
              Chotu Kunjal
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-muted hover:text-accent transition-colors p-0.5 rounded cursor-pointer"
              title="Dismiss message"
              aria-label="Dismiss dialogue"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Dialogue Message Text */}
          <p className="font-mono text-[11px] sm:text-xs text-muted-light leading-relaxed">
            "{message}"
          </p>

          {/* Speech Bubble Arrow pointing toward Chotu */}
          <div
            className={`absolute -bottom-1.5 w-3 h-3 bg-[#121212] border-b border-r border-accent/40 rotate-45 ${
              position === 'bottom-left' ? 'left-6' : 'right-6 sm:right-8'
            }`}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
