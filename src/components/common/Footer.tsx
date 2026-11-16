import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, FileText, Terminal as TerminalIcon, Code2 } from 'lucide-react';
import { profile } from '../../data/profile';

interface FooterProps {
  onOpenTerminal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerminal }) => {
  return (
    <footer className="w-full bg-[#060606] border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-heading font-bold text-lg text-primary">{profile.brandName}</span>
            </div>
            <p className="text-muted text-sm max-w-sm leading-relaxed">
              {profile.headline} Building persistent memory systems, multi-agent architectures, and intelligent software systems.
            </p>
            <div className="pt-2 flex items-center justify-between max-w-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-muted-light">{profile.status}</span>
              </div>
              <div className="hidden sm:flex items-center shrink-0 pl-4" title="Engineering companion...">
                <img
                  src="/assets/character/chotu-thinking.png"
                  alt="Companion thinking"
                  className="w-10 h-14 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-secondary font-medium">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-muted font-sans">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/work" className="hover:text-primary transition-colors">Work & Projects</Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-primary transition-colors text-accent">AI Playground</Link>
              </li>
              <li>
                <Link to="/lab" className="hover:text-primary transition-colors">Lab Notes & Research</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About & Experience</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Connect & System */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-secondary font-medium">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-muted font-mono">
              <li>
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={profile.socialLinks.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  LeetCode
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${profile.socialLinks.email}`}
                  className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              </li>
              <li>
                <a
                  href={profile.socialLinks.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Resume (PDF)
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenTerminal}
                  className="inline-flex items-center gap-2 text-accent/80 hover:text-accent font-mono text-xs cursor-pointer"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  Launch Terminal Shell
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-dark">
          <div>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Dark Theme</span>
            <span>·</span>
            <span className="text-[#F0A5C8]">Pink Accent (#F0A5C8)</span>
            <span>·</span>
            <span>Space Grotesk & JetBrains Mono</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
