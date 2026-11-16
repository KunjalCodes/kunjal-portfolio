import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { CharacterPose, CharacterPosition } from '../../types';

export const CHOTU_ASSETS: Record<CharacterPose, string> = {
  wave: '/assets/character/chotu-waving.png',
  walk: '/assets/character/chotu-walking.png',
  think: '/assets/character/chotu-thinking.png',
  coding: '/assets/character/chotu-coding.png',
  idle: '/assets/character/chotu-waving.png',
  working: '/assets/character/chotu-coding.png',
};

// Curated contextual quotes per specification
const CONTEXTUAL_DIALOGUES: Record<string, string[]> = {
  '/': [
    'Building things that think. Literally.',
    "Hey there! I'm Chotu.",
    'Another AI project? Of course.',
  ],
  '/work': [
    'Another AI project? Of course.',
    'Exploring the engineering archives...',
    '10,000 nodes traversed in 0.58s!',
  ],
  '/playground': [
    'Adjust the slider to balance Precision & Recall!',
    'Currently negotiating with a bug.',
    'No GPUs were harmed in this demonstration.',
  ],
  '/about': [
    'UTU Bhimtal graduate in June 2026!',
    'Building computer vision at Igniters Hub.',
    '100+ LeetCode problems and counting.',
  ],
  '/lab': [
    'Empirical benchmarks > assumptions.',
    'Currently testing morphological kernels.',
    'It worked on my machine.',
  ],
  '/contact': [
    'Feel free to reach out directly!',
    'Or press ~ to open the terminal shell.',
  ],
};

const RANDOM_CLICK_QUOTES = [
  'You found me!',
  'Currently negotiating with a bug.',
  'It worked on my machine.',
  'Another AI project? Of course.',
  'Building things that think. Literally.',
  'Deterministic rigor meets adaptive AI.',
];

const LOCAL_STORAGE_KEY = 'kunjal_chotu_visible';

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

  const [activePose, setActivePose] = useState<CharacterPose>('wave');
  const [activePosition, setActivePosition] = useState<CharacterPosition>('bottom-right');
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [dialogueDismissed, setDialogueDismissed] = useState<boolean>(false);

  // Toggle visibility and persist
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(next));
      } catch {
        // Ignore localStorage restrictions
      }
      return next;
    });
  }, []);

  // Update pose and positioning based on route and terminal state
  useEffect(() => {
    const path = location.pathname;

    // Terminal active overrides to coding pose
    if (isTerminalOpen) {
      setActivePose('coding');
      setActivePosition('docked-terminal');
      return;
    }

    // Route-specific pose and position assignment per specification:
    // - Homepage: waving pose
    // - About: walking or thinking pose
    // - Projects: walking pose
    // - AI Playground: thinking pose
    // - Terminal: coding pose
    // - Footer: thinking pose
    if (path === '/') {
      setActivePose('wave');
      setActivePosition('bottom-right');
    } else if (path.startsWith('/work')) {
      setActivePose('walk');
      setActivePosition('bottom-right');
    } else if (path === '/playground') {
      setActivePose('think');
      setActivePosition('bottom-right');
    } else if (path === '/about') {
      setActivePose('walk');
      setActivePosition('bottom-right');
    } else if (path === '/lab') {
      setActivePose('think');
      setActivePosition('bottom-right');
    } else if (path === '/contact') {
      setActivePose('wave');
      setActivePosition('bottom-left');
    } else {
      setActivePose('think');
      setActivePosition('bottom-right');
    }

    // Set contextual dialogue occasionally on route change
    setDialogueDismissed(false);
    const pathQuotes = CONTEXTUAL_DIALOGUES[path] || CONTEXTUAL_DIALOGUES['/'];
    const chosenQuote = pathQuotes[Math.floor(Math.random() * pathQuotes.length)];

    // Show dialogue after gentle 1.2s delay
    const showTimer = setTimeout(() => {
      setDialogue(chosenQuote);
    }, 1200);

    // Auto-dismiss dialogue after 6 seconds so it never annoys visitors
    const hideTimer = setTimeout(() => {
      setDialogue(null);
    }, 7200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, isTerminalOpen]);

  // Click on Chotu cycles a playful dialogue
  const handleCharacterClick = useCallback(() => {
    const quote = RANDOM_CLICK_QUOTES[Math.floor(Math.random() * RANDOM_CLICK_QUOTES.length)];
    setDialogue(quote);
    setDialogueDismissed(false);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setDialogue(null);
    }, 5000);
  }, []);

  const dismissDialogue = useCallback(() => {
    setDialogue(null);
    setDialogueDismissed(true);
  }, []);

  return {
    isVisible,
    toggleVisibility,
    activePose,
    activePosition,
    currentAsset: CHOTU_ASSETS[activePose] || CHOTU_ASSETS.wave,
    dialogue: dialogueDismissed ? null : dialogue,
    handleCharacterClick,
    dismissDialogue,
  };
}
