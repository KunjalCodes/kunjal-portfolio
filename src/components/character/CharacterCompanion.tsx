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
    behavior,
    activePose,
    walkX,
    facingDirection,
    isBottomLeft,
    currentAsset,
    dialogue,
    isReacting,
    handleCharacterClick,
    dismissDialogue,
  } = useCharacterState({ isTerminalOpen });

  return (
    <>
      {/* 1. When Hidden: Minimal restore toggle button in the corner */}
      {!isVisible && (
        <div className="fixed bottom-5 right-5 z-40 pointer-events-auto select-none">
          <CharacterVisibilityControl
            isVisible={false}
            onToggle={toggleVisibility}
          />
        </div>
      )}

      {/* 2. When Visible: Animated Companion with Intentional Movement */}
      <AnimatePresence>
        {isVisible && !isTerminalOpen && (
          <motion.aside
            key="kj-companion-container"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`fixed ${
              isBottomLeft
                ? 'bottom-5 left-5 sm:bottom-7 sm:left-7'
                : 'bottom-5 right-5 sm:bottom-7 sm:right-7'
            } z-40 pointer-events-none select-none flex flex-col items-center group`}
            aria-label="Interactive portfolio companion"
          >
            <div className="relative pointer-events-auto flex flex-col items-center">
              {/* Contextual Dialogue Speech Bubble */}
              <CharacterDialogue
                message={dialogue}
                onDismiss={dismissDialogue}
                isBottomLeft={isBottomLeft}
              />

              {/* Character Illustration Renderer with Kinematic Movement & Directional Turning */}
              <CharacterRenderer
                pose={activePose}
                behavior={behavior}
                assetUrl={currentAsset}
                walkX={walkX}
                facingDirection={facingDirection}
                isReacting={isReacting}
                onClick={handleCharacterClick}
              />

              {/* Subtle Visibility Toggle Switcher below Companion */}
              <div className="mt-1 opacity-0 group-hover:opacity-85 focus-within:opacity-100 transition-opacity duration-200">
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
