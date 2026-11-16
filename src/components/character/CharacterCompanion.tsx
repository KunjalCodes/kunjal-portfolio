import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { CharacterPose, CharacterPosition, CharacterCompanionConfig } from '../../types';

interface CharacterCompanionProps {
  /**
   * Master activation switch.
   * Kept strictly FALSE by default per project specification until
   * owner provides appearance reference photos and approved chibi illustrations.
   */
  enabled?: boolean;
  overridePose?: CharacterPose;
  overridePosition?: CharacterPosition;
  speechMessage?: string;
  onCharacterClick?: () => void;
}

/**
 * CharacterCompanion:
 * Reusable companion component ready for the planned original chibi character.
 * 
 * Supports:
 * - Poses: 'idle' | 'wave' | 'walk' | 'point' | 'think' | 'working'
 * - Transparent asset mapping per pose
 * - Contextual speech bubbles based on route / user action
 * - Non-obstructive positioning (never blocks navigation, terminal, or CTAs)
 */
export const CharacterCompanion: React.FC<CharacterCompanionProps> = ({
  enabled = false,
  overridePose,
  overridePosition,
  speechMessage,
  onCharacterClick,
}) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [bubbleText, setBubbleText] = useState<string>('');
  const [activePose, setActivePose] = useState<CharacterPose>('idle');
  const [activePosition, setActivePosition] = useState<CharacterPosition>('bottom-right');

  // Asset mapping placeholder: ready to receive custom illustrated transparent PNGs/SVGs
  const characterAssets: Partial<Record<CharacterPose, string>> = {
    idle: undefined,     // e.g. '/assets/character/chibi-idle.png'
    wave: undefined,     // e.g. '/assets/character/chibi-wave.png'
    walk: undefined,     // e.g. '/assets/character/chibi-walk.png'
    point: undefined,    // e.g. '/assets/character/chibi-point.png'
    think: undefined,    // e.g. '/assets/character/chibi-think.png'
    working: undefined,  // e.g. '/assets/character/chibi-working.png'
  };

  // Route-based contextual speech bubble messages
  useEffect(() => {
    if (!enabled) return;

    if (speechMessage) {
      setBubbleText(speechMessage);
      return;
    }

    const path = location.pathname;
    if (path === '/') {
      setActivePose('wave');
      setActivePosition('bottom-right');
      setBubbleText('Welcome to KUNJAL.J! Explore the AI Second Brain and Engineering Lab.');
    } else if (path.startsWith('/work/second-brain')) {
      setActivePose('point');
      setActivePosition('bottom-right');
      setBubbleText('Dual-engine temporal graph + pgvector memory architecture!');
    } else if (path.startsWith('/work/food-lens')) {
      setActivePose('working');
      setActivePosition('bottom-right');
      setBubbleText('Automating YouTube recipes into Swiggy Instamart carts via MCP!');
    } else if (path.startsWith('/work/multi-agent-builder')) {
      setActivePose('working');
      setActivePosition('bottom-right');
      setBubbleText('Sequential 7-agent pipeline from architecture to execution!');
    } else if (path.startsWith('/work/mcp-ai-copilot')) {
      setActivePose('think');
      setActivePosition('bottom-right');
      setBubbleText('Local Ollama agent with custom Model Context Protocol tools!');
    } else if (path.startsWith('/work/rag-ml-textbook-chatbot')) {
      setActivePose('think');
      setActivePosition('bottom-right');
      setBubbleText('Grounding local LLM inference on verified ML textbook embeddings.');
    } else if (path.startsWith('/work/furniture-drawing-extractor')) {
      setActivePose('point');
      setActivePosition('bottom-right');
      setBubbleText('Classical OpenCV morphological filters separate lines before OCR!');
    } else if (path === '/playground') {
      setActivePose('think');
      setActivePosition('bottom-right');
      setBubbleText('Adjust the decision boundary slider to recalculate metrics in real-time!');
    } else if (path === '/lab') {
      setActivePose('working');
      setActivePosition('bottom-right');
      setBubbleText('Empirical research notes and algorithmic benchmarks.');
    } else if (path === '/about') {
      setActivePose('idle');
      setActivePosition('bottom-right');
      setBubbleText('Explore education, Igniters Hub experience, and verified skills.');
    } else if (path === '/contact') {
      setActivePose('idle');
      setActivePosition('bottom-left');
      setBubbleText('Feel free to reach out or launch the terminal shell (~)!');
    } else {
      setActivePose('idle');
      setActivePosition('bottom-right');
      setBubbleText('');
    }
  }, [location.pathname, speechMessage, enabled]);

  // If feature is disabled (default until reference assets supplied), render zero markup
  if (!enabled) {
    return null;
  }

  const effectivePose = overridePose || activePose;
  const effectivePosition = overridePosition || activePosition;
  const currentAsset = characterAssets[effectivePose];

  const positionClasses: Record<CharacterPosition, string> = {
    'bottom-right': 'bottom-6 right-6 sm:bottom-8 sm:right-8',
    'bottom-left': 'bottom-6 left-6 sm:bottom-8 sm:left-8',
    'floating': 'bottom-20 right-8',
    'docked-terminal': 'top-20 right-8',
    'section-anchor': 'bottom-10 right-10',
  };

  return (
    <div
      className={`fixed ${positionClasses[effectivePosition]} z-30 pointer-events-none select-none transition-all duration-300`}
      aria-hidden="true"
    >
      <div className="relative pointer-events-auto cursor-pointer" onClick={onCharacterClick}>
        {/* Contextual Speech Bubble */}
        <AnimatePresence>
          {bubbleText && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -top-14 right-0 max-w-[220px] bg-[#121212] border border-accent/40 text-primary text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-xl"
            >
              <div className="leading-tight">{bubbleText}</div>
              {/* Bubble Arrow */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#121212] border-b border-r border-accent/40 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character Visual / Placeholder Container */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : effectivePose === 'idle'
              ? { y: [0, -4, 0] }
              : effectivePose === 'wave'
              ? { rotate: [0, 8, -8, 8, 0] }
              : effectivePose === 'walk'
              ? { x: [-3, 3, -3] }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center"
        >
          {currentAsset ? (
            <img
              src={currentAsset}
              alt="Kunjal Joshi Companion Character"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(240,165,200,0.3)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-dashed border-accent/40 flex flex-col items-center justify-center p-1 text-center shadow-lg group hover:border-accent">
              <span className="text-[10px] font-mono text-accent font-bold uppercase leading-none">
                {effectivePose}
              </span>
              <span className="text-[8px] font-mono text-muted-dark mt-1">
                Asset Slot
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
