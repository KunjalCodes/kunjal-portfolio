import React, { useRef, useEffect, useState } from 'react';

export const HeroFlameBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (reducedMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Muted autoplay policy fallback
        });
      }
    }
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 
        Hero Background: Pure #080808 across the entire screen
        Ensures the underlying destination layer for screen blending is uniform black.
      */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Centered Video Viewport */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Soft, non-intrusive atmospheric baby-pink ambient glow behind the flame core */}
        <div
          className="absolute w-[320px] md:w-[500px] h-[320px] md:h-[500px] rounded-full bg-accent/[0.04] blur-[120px] -translate-y-6 pointer-events-none"
          aria-hidden="true"
        />

        {/* 
          Multi-Tier Soft Edge Masking Pipeline:
          Eliminates all rectangular video boundaries, edge compression noise, and bottom cutoffs
          by applying progressive Hermite falloff directly to the video layer.
          No dark overlay patches or visible oval masks are cast onto the screen.
        */}
        {/* Tier 1: Horizontal Linear Feather (dissolves left & right vertical cuts to 0 alpha) */}
        <div
          className="inline-flex items-center justify-center"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          }}
        >
          {/* Tier 2: Vertical Linear Feather (dissolves top edge & bottom cutoff row to 0 alpha) */}
          <div
            className="inline-flex items-center justify-center"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 10%, black 86%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 10%, black 86%, transparent 100%)',
            }}
          >
            {/* Tier 3: Elliptical Softness on the video (rounds rectangular corners seamlessly) */}
            <video
              ref={videoRef}
              src="/assets/pink-flame.mp4"
              poster="/assets/flame-poster.jpg"
              autoPlay={!reducedMotion}
              loop
              muted
              playsInline
              className="h-[75vh] md:h-[88vh] max-w-[90vw] object-contain block select-none pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                WebkitMaskImage:
                  'radial-gradient(ellipse 92% 90% at 50% 50%, black 60%, rgba(0, 0, 0, 0.7) 80%, transparent 98%)',
                maskImage:
                  'radial-gradient(ellipse 92% 90% at 50% 50%, black 60%, rgba(0, 0, 0, 0.7) 80%, transparent 98%)',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
