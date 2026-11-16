import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CharacterDialogueProps {
  message: string | null;
  onDismiss: () => void;
  isBottomLeft?: boolean;
}

export const CharacterDialogue: React.FC<CharacterDialogueProps> = ({
  message,
  onDismiss,
  isBottomLeft = false,
}) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`absolute bottom-full mb-3 z-40 max-w-[220px] sm:max-w-[260px] bg-[#101010]/95 border border-accent/40 text-primary px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md pointer-events-auto select-none ${
            isBottomLeft ? 'left-0 sm:left-1' : 'right-0 sm:right-1'
          }`}
          role="status"
          aria-live="polite"
        >
          {/* Header row: subtle indicator + dismiss button */}
          <div className="flex items-center justify-between gap-2 mb-1 border-b border-border/50 pb-1">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Note
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-muted hover:text-accent transition-colors p-0.5 rounded cursor-pointer"
              title="Dismiss note"
              aria-label="Dismiss note"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Dialogue Message Text */}
          <p className="font-mono text-[11px] sm:text-xs text-muted-light leading-relaxed">
            "{message}"
          </p>

          {/* Speech Bubble Arrow */}
          <div
            className={`absolute -bottom-1.5 w-3 h-3 bg-[#101010] border-b border-r border-accent/40 rotate-45 ${
              isBottomLeft ? 'left-6' : 'right-6 sm:right-8'
            }`}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
