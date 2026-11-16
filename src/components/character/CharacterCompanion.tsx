import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterState } from './CharacterStateManager';
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterDialogue } from './CharacterDialogue';
import { CharacterVisibilityControl } from './CharacterVisibilityControl';

interface CharacterCompanionProps {
  isTerminalOpen?: boolean;
}

export const CharacterCompanion: React.FC<CharacterCompanionProps> = ({
  isTerminalOpen = false,
}) => {
  const {
    isVisible,
    toggleVisibility,
    activePose,
    activePosition,
    currentAsset,
    dialogue,
    handleCharacterClick,
    dismissDialogue,
  } = useCharacterState({ isTerminalOpen });

  const positionClasses = {
    'bottom-right': 'bottom-5 right-5 sm:bottom-8 sm:right-8',
    'bottom-left': 'bottom-5 left-5 sm:bottom-8 sm:left-8',
    'floating': 'bottom-20 right-6',
    'docked-terminal': 'bottom-6 right-8',
    'section-anchor': 'bottom-8 right-8',
  };

  return (
    <>
      {/* 1. When Hidden: Subtle restore trigger pill in the corner */}
      {!isVisible && (
        <div className="fixed bottom-5 right-5 z-40 pointer-events-auto select-none">
          <CharacterVisibilityControl
            isVisible={false}
            onToggle={toggleVisibility}
          />
        </div>
      )}

      {/* 2. When Visible: Full Character Companion & Dialogue */}
      <AnimatePresence>
        {isVisible && !isTerminalOpen && (
          <motion.aside
            key="chotu-companion"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed ${positionClasses[activePosition]} z-40 pointer-events-none select-none flex flex-col items-center group`}
            aria-label="Portfolio companion character"
          >
            <div className="relative pointer-events-auto flex flex-col items-center">
              {/* Contextual Dialogue Speech Bubble */}
              <CharacterDialogue
                message={dialogue}
                onDismiss={dismissDialogue}
                position={activePosition}
              />

              {/* Character Illustration Renderer */}
              <CharacterRenderer
                pose={activePose}
                assetUrl={currentAsset}
                onClick={handleCharacterClick}
              />

              {/* Subtle Visibility Toggle Switcher below Chotu */}
              <div className="mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                <CharacterVisibilityControl
                  isVisible={true}
                  onToggle={toggleVisibility}
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
