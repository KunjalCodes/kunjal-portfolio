import React, { useState } from 'react';
import { Mail, Github, Linkedin, FileText, Copy, Check, Send, Terminal, Code2 } from 'lucide-react';
import { profile } from '../data/profile';
import { Button } from '../components/common/Button';

interface ContactPageProps {
  onOpenTerminal: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenTerminal }) => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.socialLinks.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${profile.socialLinks.email}?subject=${encodeURIComponent(
      subject || 'AI Engineering Inquiry'
    )}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-6 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Get In Touch
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          Contact & Collaboration
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed max-w-2xl">
          Whether discussing AI agent architectures, persistent memory graphs, computer vision pipelines, or engineering opportunities, feel free to reach out directly through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Direct Endpoints */}
        <div className="md:col-span-5 space-y-4">
          {/* Email Card */}
          <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-accent">
              <Mail className="w-4 h-4" />
              Direct Email
            </div>
            <div className="text-sm font-mono text-primary break-all">
              {profile.socialLinks.email}
            </div>
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy email address</span>
                </>
              )}
            </button>
          </div>

          {/* Social Profiles */}
          <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-3">
            <div className="text-xs font-mono text-accent uppercase tracking-wider">
              Network Profiles
            </div>
            <div className="space-y-2 font-mono text-xs">
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-border text-muted hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-accent" />
                  LinkedIn
                </span>
                <span className="text-[10px] text-muted-dark">View Profile ↗</span>
              </a>

              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-border text-muted hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-accent" />
                  GitHub
                </span>
                <span className="text-[10px] text-muted-dark">Explore Code ↗</span>
              </a>

              <a
                href={profile.socialLinks.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-border text-muted hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-accent" />
                  LeetCode
                </span>
                <span className="text-[10px] text-muted-dark">100+ Solved ↗</span>
              </a>

              <a
                href={profile.socialLinks.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-border text-muted hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Resume (PDF)
                </span>
                <span className="text-[10px] text-muted-dark">Download ↗</span>
              </a>
            </div>
          </div>

          {/* Terminal Command Hint */}
          <div className="bg-[#080808] border border-border/80 rounded-lg p-4 font-mono text-xs text-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span>Shell command: <span className="text-primary font-bold">contact</span></span>
            </span>
            <button
              onClick={onOpenTerminal}
              className="text-accent hover:underline text-[11px] cursor-pointer"
            >
              Launch ~
            </button>
          </div>
        </div>

        {/* Right Column: Message Composer */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSendMail}
            className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-5"
          >
            <div>
              <h2 className="font-heading text-lg font-bold text-primary">
                Send Direct Dispatch
              </h2>
              <p className="text-xs text-muted mt-1">
                Formats a message and launches your configured mail client.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="block text-xs font-mono text-muted">
                Subject line
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. AI Engineering Opportunity / CV Discussion"
                className="w-full bg-[#121212] border border-border rounded px-3 py-2 text-xs font-mono text-primary placeholder:text-muted-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-xs font-mono text-muted">
                Message details
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your note, question, or project inquiry..."
                className="w-full bg-[#121212] border border-border rounded px-3 py-2 text-xs font-mono text-primary placeholder:text-muted-dark focus:outline-none focus:border-accent resize-none"
                required
              />
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<Send className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Compose in Email Client
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
