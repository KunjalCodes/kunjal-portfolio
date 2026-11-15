import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { HeroFlameBackground } from './HeroFlameBackground';
import { ScrollIndicator } from '../common/ScrollIndicator';
import { Button } from '../common/Button';
import { profile } from '../../data/profile';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between items-center px-6 pt-24 pb-10 overflow-hidden bg-background">
      {/* Dynamic Pink Flame Background */}
      <HeroFlameBackground />

      {/* Spacing anchor */}
      <div className="w-full" aria-hidden="true" />

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Intro Subtitle Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-black/60 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs text-muted-light tracking-wide uppercase">
            {profile.shortIntro}
          </span>
        </motion.div>

        {/* Name: KUNJAL JOSHI */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary uppercase select-none"
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
          <span className="text-primary font-medium">{profile.headline}</span>
          <br className="hidden sm:inline" />
          <span className="text-sm sm:text-base text-muted block mt-1">
            Bridging deterministic computer vision and multimodal intelligence.
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

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 pt-8"
      >
        <ScrollIndicator targetId="intro" />
      </motion.div>
    </section>
  );
};
