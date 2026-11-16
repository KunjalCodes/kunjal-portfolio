import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CharacterPose } from '../../types';
import { CompanionBehavior } from './CharacterStateManager';

interface CharacterRendererProps {
  pose: CharacterPose;
  behavior: CompanionBehavior;
  assetUrl: string;
  walkX: number;
  facingDirection: 1 | -1;
  isReacting: boolean;
  onClick?: () => void;
  className?: string;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  pose,
  behavior,
  assetUrl,
  walkX,
  facingDirection,
  isReacting,
  onClick,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Natural kinematic translation and cadence
  const walkTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        x: { duration: 3.5, ease: [0.25, 0.1, 0.25, 1.0] }, // Smooth ease-in ease-out
        rotateY: { duration: 0.35, ease: 'easeInOut' },
      };

  return (
    <motion.div
      onClick={onClick}
      animate={{
        x: shouldReduceMotion ? 0 : walkX,
        rotateY: shouldReduceMotion ? 0 : facingDirection === 1 ? 0 : 180,
      }}
      transition={walkTransition}
      className={`relative cursor-pointer select-none group focus:outline-none ${className}`}
      title="Engineering Companion (Click to interact)"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${pose}-${isReacting ? 'reacting' : 'steady'}`}
          initial={{ opacity: 0.85, scale: 0.95 }}
          animate={
            isReacting
              ? {
                  y: [0, -12, 2, 0],
                  scale: [1, 1.08, 0.98, 1],
                  transition: { duration: 0.45, ease: 'easeOut' },
                }
              : behavior === 'walking' && !shouldReduceMotion
              ? {
                  // Rhythmic footstep cadence bobbing during movement
                  y: [0, -3.5, 0, -3.5, 0],
                  transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                }
              : {}
          }
          exit={{ opacity: 0.6, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`relative flex items-center justify-center w-20 h-28 sm:w-24 sm:h-32 ${
            behavior === 'thinking'
              ? 'animate-companion-float'
              : behavior === 'working'
              ? 'animate-companion-laptop'
              : 'animate-companion-breathe'
          }`}
        >
          {/* Subtle baby-pink atmospheric bloom behind companion */}
          <div
            className="absolute inset-1 rounded-full bg-accent/15 blur-md opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none"
            aria-hidden="true"
          />

          {/* Genuine Approved Character Illustration */}
          <img
            src={assetUrl}
            alt="Engineering Companion"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_14px_rgba(240,165,200,0.22)] group-hover:drop-shadow-[0_4px_20px_rgba(240,165,200,0.4)] transition-all duration-300 pointer-events-none select-none"
            loading="eager"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
