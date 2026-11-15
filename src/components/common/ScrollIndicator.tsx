import React from 'react';
import { motion } from 'framer-motion';

export const ScrollIndicator: React.FC<{ targetId?: string }> = ({ targetId = 'featured' }) => {
  const scrollTo = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollTo}
      aria-label="Scroll to content"
      className="group flex flex-col items-center gap-2 text-muted hover:text-accent transition-colors duration-300 focus:outline-none cursor-pointer"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted/80 group-hover:text-accent transition-colors">
        Scroll
      </span>
      <div className="w-[18px] h-[30px] rounded-full border border-border group-hover:border-accent/40 flex justify-center p-1 transition-colors">
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-1 h-1.5 rounded-full bg-accent"
        />
      </div>
    </button>
  );
};
