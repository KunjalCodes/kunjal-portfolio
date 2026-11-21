import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Terminal as TerminalIcon, Menu, X, ArrowUpRight, Search } from 'lucide-react';
import { profile } from '../../data/profile';

interface NavbarProps {
  onOpenTerminal: () => void;
  onOpenAsk: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTerminal, onOpenAsk }) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Work', path: '/work' },
    { label: 'Playground', path: '/playground' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/85 backdrop-blur-md border-b border-border transition-colors">
      {/* Reading progress (CSS scroll-driven; hidden where unsupported) */}
      <span className="scroll-progress" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 select-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="font-heading font-bold text-lg tracking-tight text-primary group-hover:text-accent transition-colors">
            {profile.brandName}
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-muted border-l border-border pl-2.5 ml-1">
            AI Engineering
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors duration-200 relative py-1 ${
                  isActive
                    ? 'text-accent font-semibold'
                    : 'text-muted hover:text-primary'
                }`
              }
            >
              {link.label}
              {location.pathname === link.path && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action: Terminal Trigger + Resume */}
        <div className="flex items-center gap-3">
          {/* Ask (retrieval over the site) */}
          <button
            onClick={onOpenAsk}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#121212] hover:bg-[#1A1A1A] border border-border hover:border-accent/40 text-muted hover:text-accent transition-colors duration-150 font-mono text-xs cursor-pointer"
            title="Ask about my work"
            aria-label="Ask about my work"
          >
            <Search className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Ask</span>
            <kbd className="hidden lg:inline text-[10px] text-muted-dark bg-black/40 px-1 rounded-sm border border-border">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>

          {/* Terminal Launcher */}
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#121212] hover:bg-[#1A1A1A] border border-border hover:border-accent/40 text-muted hover:text-accent transition-colors duration-150 font-mono text-xs cursor-pointer group"
            title="Open Interactive Terminal (or press ~)"
            aria-label="Open portfolio terminal"
          >
            <TerminalIcon className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline font-mono">Terminal</span>
            <kbd className="hidden lg:inline text-[10px] text-muted-dark bg-black/40 px-1 rounded-sm border border-border">
              ~
            </kbd>
          </button>

          {/* Direct Resume Link */}
          <a
            href={profile.socialLinks.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-primary transition-colors py-1 px-2"
          >
            CV
            <ArrowUpRight className="w-3 h-3 text-muted" />
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-primary focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0B] border-b border-border px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base py-1 font-medium ${
                    isActive ? 'text-accent' : 'text-muted hover:text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerminal();
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#141414] border border-border text-xs font-mono text-accent"
            >
              <TerminalIcon className="w-4 h-4" />
              Open Interactive Terminal
            </button>
            <a
              href={profile.socialLinks.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-transparent border border-border text-xs font-mono text-muted hover:text-primary"
            >
              View Curriculum Vitae (PDF)
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
