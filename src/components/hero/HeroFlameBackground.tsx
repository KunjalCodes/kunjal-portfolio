import React, { useCallback, useEffect, useState } from 'react';
import { FluidFlameCanvas } from './FluidFlameCanvas';

const FLAME_SRC = '/assets/pink-flame.mp4';
const FLAME_POSTER = '/assets/flame-poster.jpg';

export const HeroFlameBackground: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const md = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      setReducedMotion(rm.matches);
      setIsDesktop(md.matches);
    };
    sync();
    rm.addEventListener('change', sync);
    md.addEventListener('change', sync);
    return () => {
      rm.removeEventListener('change', sync);
      md.removeEventListener('change', sync);
    };
  }, []);

  const handleUnsupported = useCallback(() => setWebglFailed(true), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Subdued ambient glow behind flame */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="w-[320px] md:w-[500px] h-[320px] md:h-[500px] rounded-full bg-accent/5 blur-[120px] -translate-y-6" />
      </div>

      {!webglFailed ? (
        <FluidFlameCanvas
          src={FLAME_SRC}
          poster={FLAME_POSTER}
          heightFraction={isDesktop ? 0.88 : 0.75}
          opacity={isDesktop ? 0.82 : 0.76}
          reducedMotion={reducedMotion}
          onUnsupported={handleUnsupported}
        />
      ) : (
        // Fallback (no WebGL2): plain video with soft masking.
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            src={FLAME_SRC}
            poster={FLAME_POSTER}
            autoPlay={!reducedMotion}
            loop
            muted
            playsInline
            className="h-[75vh] md:h-[88vh] max-w-[90vw] object-contain opacity-75"
            style={{
              mixBlendMode: 'screen',
              WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Gentle fade into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080808] to-transparent" />
    </div>
  );
};
