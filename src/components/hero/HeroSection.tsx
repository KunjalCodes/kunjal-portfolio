import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { HeroFlameBackground } from './HeroFlameBackground';
import { Button } from '../common/Button';
import { profile } from '../../data/profile';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 pt-20 pb-24 overflow-hidden bg-background">
      {/* Dynamic Pink Flame Background */}
      <HeroFlameBackground />

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Soft halo: dims the flame only where the text sits, so it stays readable */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-24 -inset-y-20 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 55%, rgba(8,8,8,0.62) 0%, rgba(8,8,8,0.38) 45%, rgba(8,8,8,0) 75%)',
          }}
        />

        {/* Intro Subtitle Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-[#0E0E0E] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-xs text-muted-light">
            {profile.shortIntro}
          </span>
        </motion.div>

        {/* Name: KUNJAL JOSHI */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="flame-name font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary uppercase select-none"
        >
          {profile.name}
        </motion.h1>

        {/* Headline: Building things that think. */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-4 md:mt-6 font-heading text-lg sm:text-xl md:text-2xl text-muted-light font-normal max-w-xl text-center tracking-tight"
        >
          <span className="flame-lit text-primary font-medium">{profile.headline}</span>
          <span className="block mt-3 mx-auto max-w-[34rem] font-sans text-[15px] sm:text-[17px] leading-relaxed text-primary-muted text-balance [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]">
            I build agents that remember, retrieve and use tools, and I measure whether they actually work.
          </span>
        </motion.p>

        {/* Clear Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            to="/work"
            variant="primary"
            size="md"
            className="flame-lit-box"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Work
          </Button>

          <Button
            to="/about"
            variant="secondary"
            size="md"
            icon={<User className="w-4 h-4 text-muted" />}
          >
            About Me
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
