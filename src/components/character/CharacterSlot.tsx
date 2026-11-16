import React from 'react';
import { CharacterPose } from '../../types';

interface CharacterSlotProps {
  pose?: CharacterPose;
  location?: 'hero' | 'terminal' | 'work' | 'footer' | 'floating';
  bubbleMessage?: string;
  className?: string;
  onClick?: () => void;
}

const POSE_ASSETS: Record<string, string> = {
  wave: '/assets/character/chotu-waving.png',
  walk: '/assets/character/chotu-walking.png',
  think: '/assets/character/chotu-thinking.png',
  coding: '/assets/character/chotu-coding.png',
  idle: '/assets/character/chotu-waving.png',
  working: '/assets/character/chotu-coding.png',
};

/**
 * CharacterSlot:
 * Anchor slot for companion character illustrations.
 */
export const CharacterSlot: React.FC<CharacterSlotProps> = ({
  pose = 'wave',
  location = 'floating',
  bubbleMessage,
  className = '',
  onClick,
}) => {
  const assetUrl = POSE_ASSETS[pose] || POSE_ASSETS.wave;

  return (
    <div
      data-character-slot={location}
      data-pose={pose}
      onClick={onClick}
      className={`relative z-20 pointer-events-auto select-none transition-transform ${className}`}
      aria-hidden="true"
    >
      {bubbleMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#121212] border border-accent/40 text-primary text-xs px-2.5 py-1 rounded shadow-lg font-mono">
          {bubbleMessage}
        </div>
      )}
      <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
        <img
          src={assetUrl}
          alt={`Companion (${pose})`}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(240,165,200,0.3)]"
          loading="lazy"
        />
      </div>
    </div>
  );
};
