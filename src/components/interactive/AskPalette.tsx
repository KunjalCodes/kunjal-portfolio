import React, { useEffect } from 'react';
import { AskPortfolio } from './AskPortfolio';

interface AskPaletteProps {
  open: boolean;
  onClose: () => void;
}

/** ⌘K / Ctrl+K overlay around the in-browser retrieval search. */
export const AskPalette: React.FC<AskPaletteProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 pt-[12vh]"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Ask about Kunjal's work"
    >
      <div className="w-full max-w-2xl shadow-2xl">
        <AskPortfolio variant="palette" autoFocus onNavigate={onClose} />
      </div>
    </div>
  );
};
