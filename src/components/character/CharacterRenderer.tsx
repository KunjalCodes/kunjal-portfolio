import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CharacterPose } from '../../types';

interface CharacterRendererProps {
  pose: CharacterPose;
  assetUrl: string;
  onClick?: () => void;
  className?: string;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  pose,
  assetUrl,
  onClick,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Gentle, restrained animation variants:
  // - Walking: subtle horizontal sway
  // - Thinking / Waving: gentle floating and breathing
  // - Coding: calm breathing
  const motionAnimation = shouldReduceMotion
    ? {}
    : pose === 'walk'
    ? {
        y: [0, -3, 0],
        x: [-2, 2, -2],
        scale: [1, 1.012, 1],
      }
    : pose === 'coding'
    ? {
        y: [0, -2, 0],
        scale: [1, 1.01, 1],
      }
    : {
        y: [0, -3.5, 0],
        scale: [1, 1.015, 1],
      };

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none group focus:outline-none ${className}`}
      title="Chotu Kunjal — AI Engineering Companion (Click to chat!)"
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
          key={pose}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: 1,
            scale: 1,
            ...motionAnimation,
          }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{
            opacity: { duration: 0.35, ease: 'easeInOut' },
            scale: { duration: 0.35, ease: 'easeInOut' },
            y: {
              duration: pose === 'walk' ? 2.2 : 3.2,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
            },
            x: {
              duration: 2.2,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
            },
          }}
          className="relative flex items-center justify-center w-20 h-28 sm:w-24 sm:h-32"
        >
          {/* Subtle soft baby-pink glow aura */}
          <div
            className="absolute inset-2 rounded-full bg-accent/15 blur-lg opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none"
            aria-hidden="true"
          />

          {/* Real Transparent Character Illustration */}
          <img
            src={assetUrl}
            alt={`Chotu Kunjal (${pose} pose)`}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(240,165,200,0.22)] group-hover:drop-shadow-[0_4px_22px_rgba(240,165,200,0.4)] transition-all duration-300 pointer-events-none select-none"
            loading="eager"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
