import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles } from 'lucide-react';
import { InteractiveFlameCanvas } from '../flame/InteractiveFlameCanvas';

export const HeroFlameBackground: React.FC = () => {
  const [useInteractive, setUseInteractive] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setUseInteractive(false);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setUseInteractive(false);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden select-none z-0">
      {/* Black backdrop layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {useInteractive && !reducedMotion ? (
        /* Full-Scale WebGL Interactive Fluid Fire with Clean Alpha & Luminance Masking */
        <InteractiveFlameCanvas
          className="absolute inset-0 pointer-events-none"
          expandStrength={0.24}
          leanStrength={0.22}
          intensityBoost={1.0}
          lumThreshold={0.035}
        />
      ) : (
        /* Fallback Static Video */
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[320px] md:w-[500px] h-[320px] md:h-[500px] rounded-full bg-accent/5 blur-[120px] -translate-y-6"
            aria-hidden="true"
          />
          <video
            ref={videoRef}
            src="/assets/pink-flame.mp4"
            poster="/assets/flame-poster.jpg"
            autoPlay={!reducedMotion}
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`h-[75vh] md:h-[88vh] max-w-[90vw] object-contain mix-blend-screen opacity-70 md:opacity-75 transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-70 md:opacity-75' : 'opacity-40'
            }`}
            style={{
              filter: 'contrast(1.08) brightness(0.98)',
            }}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#080808] via-[#080808]/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(8, 8, 8, 0.5) 60%, #080808 90%)',
            }}
          />
        </div>
      )}

      {/* Discrete Mode Switcher & Prototype Tour Link */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-2 bg-[#0D0D0D]/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-lg text-[11px] font-mono pointer-events-auto select-none shadow-lg">
        <span className="flex items-center gap-1.5 text-muted">
          <Flame className="w-3.5 h-3.5 text-accent" />
          Flame:
        </span>
        <button
          onClick={() => setUseInteractive(true)}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
            useInteractive
              ? 'bg-accent/20 text-accent font-medium border border-accent/40'
              : 'text-muted-dark hover:text-muted'
          }`}
        >
          Interactive
        </button>
        <button
          onClick={() => setUseInteractive(false)}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
            !useInteractive
              ? 'bg-white/10 text-white font-medium border border-white/20'
              : 'text-muted-dark hover:text-muted'
          }`}
        >
          Static
        </button>
        <span className="text-border">|</span>
        <Link
          to="/flame-prototype"
          className="text-muted hover:text-accent flex items-center gap-1 transition-colors text-[10px]"
        >
          <Sparkles className="w-3 h-3" />
          Prototype Lab →
        </Link>
      </div>
    </div>
  );
};
