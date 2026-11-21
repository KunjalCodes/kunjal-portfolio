import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PortfolioTerminal } from './components/terminal/PortfolioTerminal';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AskPalette } from './components/interactive/AskPalette';
import { CharacterCompanion } from './components/character/CharacterCompanion';
import { projects } from './data/projects';

// Route handler for scroll reset and dynamic SEO title management
const RouteHandler: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Dynamic SEO title
    if (pathname === '/') {
      document.title = 'Kunjal Joshi — AI Engineer';
    } else if (pathname === '/work') {
      document.title = 'Projects — Kunjal Joshi';
    } else if (pathname.startsWith('/work/')) {
      const slug = pathname.replace('/work/', '');
      const proj = projects.find(p => p.slug === slug);
      document.title = proj ? `${proj.title.split(' — ')[0]} — Kunjal Joshi` : 'Project Case Study — Kunjal Joshi';
    } else if (pathname === '/playground') {
      document.title = 'Playground — Kunjal Joshi';
    } else if (pathname === '/about') {
      document.title = 'About — Kunjal Joshi';
    } else if (pathname === '/contact') {
      document.title = 'Contact — Kunjal Joshi';
    } else {
      document.title = 'Kunjal Joshi — AI Engineer';
    }
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);

  // ⌘K / Ctrl+K opens the "Ask about my work" retrieval palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAskOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // One pointer listener drives the cursor spotlight on every .spotlight card
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Global keyboard shortcut to toggle terminal (` or ~)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle on backtick / tilde if not typing in an input
      if (
        (e.key === '`' || e.key === '~') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <Router>
      <RouteHandler />
      <div className="min-h-screen bg-background text-primary selection:bg-accent/20 selection:text-accent flex flex-col justify-between relative font-sans">
        {/* Navigation Bar */}
        <Navbar onOpenTerminal={() => setIsTerminalOpen(true)} onOpenAsk={() => setIsAskOpen(true)} />

        {/* Main Routed Content */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage onOpenTerminal={() => setIsTerminalOpen(true)} />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/work/:slug" element={<ProjectDetailPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage onOpenTerminal={() => setIsTerminalOpen(true)} />} />
            {/* Catch-all redirects to home */}
            <Route path="*" element={<HomePage onOpenTerminal={() => setIsTerminalOpen(true)} />} />
          </Routes>
        </main>

        {/* Interactive Engineering Companion (KJ) */}
        <CharacterCompanion isTerminalOpen={isTerminalOpen} />

        {/* Engineering Footer */}
        <Footer onOpenTerminal={() => setIsTerminalOpen(true)} />

        <AskPalette open={isAskOpen} onClose={() => setIsAskOpen(false)} />

        {/* Interactive Terminal Shell Overlay */}
        <PortfolioTerminal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
