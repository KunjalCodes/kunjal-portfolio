import React, { useRef, useEffect, useState } from 'react';

export const HeroFlameBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
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
          // Autoplay policy fallback: muted video is allowed, handle any abort silently
        });
      }
    }
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Black backdrop layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Video Container centered with gentle soft baby-pink atmospheric bloom */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Subdued ambient glow behind flame */}
        <div 
          className="absolute w-[320px] md:w-[500px] h-[320px] md:h-[500px] rounded-full bg-accent/5 blur-[120px] -translate-y-6" 
          aria-hidden="true" 
        />

        {/* Real Pink Looping Flame Video */}
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

        {/* Seamless edge blending vignettes into pure black #080808 */}
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#080808] via-[#080808]/70 to-transparent" />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent" />
        
        {/* Radial vignette fade from pure black edges */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(8, 8, 8, 0.5) 60%, #080808 90%)',
          }}
        />
      </div>
    </div>
  );
};
