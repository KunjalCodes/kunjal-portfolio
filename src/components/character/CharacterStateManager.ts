import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CharacterPose } from '../../types';

export type CompanionBehavior = 'idle' | 'walking' | 'thinking' | 'working' | 'reacting';

export const COMPANION_ASSETS: Record<CharacterPose, string> = {
  wave: '/assets/character/chotu-waving.png',
  walk: '/assets/character/chotu-walking.png',
  think: '/assets/character/chotu-thinking.png',
  coding: '/assets/character/chotu-coding.png',
  idle: '/assets/character/chotu-waving.png',
  working: '/assets/character/chotu-coding.png',
};

// Witty, restrained dialogue quotes per specification
const CONTEXTUAL_DIALOGUES: Record<string, string[]> = {
  '/': [
    "Oh, you're exploring?",
    'Building things that think. Literally.',
    'Deterministic rigor meets adaptive AI.',
  ],
  '/work': [
    'This one took some debugging.',
    '10,000 nodes traversed in 0.58s.',
    'I think the architecture is getting interesting.',
  ],
  '/about': [
    'UTU Bhimtal graduate in June 2026.',
    'Agents, memory and retrieval.',
    '100+ LeetCode problems and counting.',
  ],
  '/contact': [
    'Reach out directly or launch the shell with ~.',
    "Don't touch that. Just kidding.",
  ],
};

const CLICK_REACTIONS = [
  "Don't touch that. Just kidding.",
  "Oh, you're exploring?",
  'This one took some debugging.',
  'It worked on my machine.',
  'Currently negotiating with a bug.',
  'I think the architecture is getting interesting.',
];

const LOCAL_STORAGE_KEY = 'portfolio_companion_visible';

export interface UseCharacterStateOptions {
  isTerminalOpen?: boolean;
}

export function useCharacterState({ isTerminalOpen = false }: UseCharacterStateOptions = {}) {
  const location = useLocation();

  // Visibility state with localStorage persistence (defaults to true)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // State machine values
  const [behavior, setBehavior] = useState<CompanionBehavior>('idle');
  const [activePose, setActivePose] = useState<CharacterPose>('wave');
  const [walkX, setWalkX] = useState<number>(0);
  const [facingDirection, setFacingDirection] = useState<1 | -1>(1); // 1 = normal, -1 = flipped
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState<boolean>(false);

  // Position anchors based on route
  const isBottomLeft = location.pathname === '/contact';

  const pacingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle visibility and persist
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  }, []);

  // Update base behavior based on route & terminal state
  useEffect(() => {
    const path = location.pathname;

    // Reset reaction
    setIsReacting(false);

    if (isTerminalOpen) {
      setBehavior('working');
      setActivePose('coding');
      setWalkX(0);
      setFacingDirection(1);
      return;
    }

    if (path === '/') {
      setBehavior('idle');
      setActivePose('wave');
      setWalkX(0);
      setFacingDirection(1);
    } else if (path.startsWith('/work')) {
      // In project section, initiate gentle pacing behavior
      setBehavior('walking');
      setActivePose('walk');
      setWalkX(0);
      setFacingDirection(-1); // Start walking inward toward content edge
    } else if (path === '/about') {
      setBehavior('idle');
      setActivePose('walk');
      setWalkX(0);
      setFacingDirection(1);
    } else if (path === '/contact') {
      setBehavior('idle');
      setActivePose('wave');
      setWalkX(0);
      setFacingDirection(1);
    } else {
      setBehavior('idle');
      setActivePose('think');
      setWalkX(0);
      setFacingDirection(1);
    }

    // Occasional, rare dialogue display on navigation
    const pathQuotes = CONTEXTUAL_DIALOGUES[path] || CONTEXTUAL_DIALOGUES['/'];
    const selectedQuote = pathQuotes[Math.floor(Math.random() * pathQuotes.length)];

    const showTimer = setTimeout(() => {
      setDialogue(selectedQuote);
    }, 1400);

    const hideTimer = setTimeout(() => {
      setDialogue(null);
    }, 6500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, isTerminalOpen]);

  // Autonomous pacing simulation when in walking behavior
  useEffect(() => {
    if (behavior !== 'walking' || isTerminalOpen) {
      if (pacingTimerRef.current) clearInterval(pacingTimerRef.current);
      return;
    }

    // Simulate intentional short walk across an 80px runway
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 4;
      if (step === 0) {
        // Walk left
        setFacingDirection(-1);
        setWalkX(-60);
      } else if (step === 1) {
        // Pause in thinking/standing pose
        setActivePose('think');
      } else if (step === 2) {
        // Walk back right
        setActivePose('walk');
        setFacingDirection(1);
        setWalkX(0);
      } else if (step === 3) {
        // Pause in idle
        setActivePose('walk');
      }
    }, 7000);

    pacingTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [behavior, isTerminalOpen]);

  // Click reaction: hop, pose change, and dialogue
  const handleCharacterClick = useCallback(() => {
    setIsReacting(true);
    const quote = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
    setDialogue(quote);

    setTimeout(() => {
      setIsReacting(false);
    }, 800);

    setTimeout(() => {
      setDialogue(null);
    }, 5500);
  }, []);

  const dismissDialogue = useCallback(() => {
    setDialogue(null);
  }, []);

  return {
    isVisible,
    toggleVisibility,
    behavior,
    activePose,
    walkX,
    facingDirection,
    isBottomLeft,
    currentAsset: COMPANION_ASSETS[activePose] || COMPANION_ASSETS.wave,
    dialogue,
    isReacting,
    handleCharacterClick,
    dismissDialogue,
  };
}
