import React from 'react';

export type CharacterPose = 
  | 'wave' 
  | 'idle' 
  | 'point-projects' 
  | 'sitting-laptop' 
  | 'thinking';

interface CharacterSlotProps {
  pose?: CharacterPose;
  location?: 'hero' | 'terminal' | 'work' | 'footer' | 'floating';
  bubbleMessage?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * CharacterSlot:
 * Architectural anchor for the planned custom chibi-style companion character.
 * 
 * Per project specifications:
 * - Kept dormant until personal reference photo and character design assets are provided.
 * - Engineered to mount seamlessly into layout anchors without disrupting content flow or navigation.
 */
export const CharacterSlot: React.FC<CharacterSlotProps> = ({
  pose = 'idle',
  location = 'floating',
  bubbleMessage,
  className = '',
  onClick,
}) => {
  // Flag indicating if custom illustration assets are configured
  // Set to false until user uploads reference assets per specification
  const isCharacterActive = false;

  if (!isCharacterActive) {
    // Renders zero markup so layout remains pristine and completely unobstructed
    return null;
  }

  return (
    <div
      data-character-slot={location}
      data-pose={pose}
      onClick={onClick}
      className={`relative z-20 pointer-events-auto select-none transition-transform ${className}`}
      aria-hidden="true"
    >
      {bubbleMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background-card border border-accent/30 text-primary text-xs px-2.5 py-1 rounded shadow-lg font-mono">
          {bubbleMessage}
        </div>
      )}
      <div className="w-16 h-16 rounded-full border border-dashed border-accent/30 flex items-center justify-center text-accent text-xs">
        [Companion Slot]
      </div>
    </div>
  );
};
