import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  maxLife: number;
  maxAlpha: number;
}

export const HeroFlameBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flameWrapperRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Animation & Physics Tracking Ref (Zero React re-renders during 60fps loop)
  const stateRef = useRef({
    // Interactive mouse targets and smoothed current values
    currentLeanX: 0,
    targetLeanX: 0,
    currentStretchY: 0,
    targetStretchY: 0,
    currentSpreadX: 0,
    targetSpreadX: 0,
    currentWindX: 0,
    targetWindX: 0,
    currentProximity: 0,
    targetProximity: 0,

    // Coordinates in canvas space
    canvasMouseX: 0,
    canvasMouseY: 0,
    targetCanvasMouseX: 0,
    targetCanvasMouseY: 0,

    // Velocity computation
    lastClientX: 0,
    lastClientY: 0,
    lastTime: 0,

    // Animation status
    isHovered: false,
    isVisible: true,
    rafId: null as number | null,
    sparks: [] as Spark[],
    frameCounter: 0,
  });

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync canvas size with display dimensions
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Main RAF Animation Loop: Organic Idle Motion + Damped Cursor Reaction + Particle Sparks
  const animate = useCallback(() => {
    const s = stateRef.current;
    if (!s.isVisible || reducedMotion) {
      s.rafId = null;
      return;
    }

    s.frameCounter++;
    const time = performance.now() * 0.001;

    // 1. Natural Organic Idle Flickering (Multi-frequency harmonic oscillation)
    // Fire naturally wavers, breathes, and flickers even with no mouse interaction
    const idleSway = Math.sin(time * 1.35) * 0.85 + Math.sin(time * 2.7 + 0.6) * 0.4;
    const idleBreathe = 1 + Math.sin(time * 2.1) * 0.014 + Math.cos(time * 4.2) * 0.007;
    const idleFlicker = Math.sin(time * 8.5) * 0.012 + Math.cos(time * 14.0) * 0.008;

    // 2. Smooth Damped Interpolation (Easing back to equilibrium)
    const lerp = 0.075;
    s.currentLeanX += (s.targetLeanX - s.currentLeanX) * lerp;
    s.currentStretchY += (s.targetStretchY - s.currentStretchY) * lerp;
    s.currentSpreadX += (s.targetSpreadX - s.currentSpreadX) * lerp;
    s.currentWindX += (s.targetWindX - s.currentWindX) * 0.12;
    // Aerodynamic wind drag decays rapidly
    s.targetWindX *= 0.88;
    s.currentProximity += (s.targetProximity - s.currentProximity) * lerp;

    s.canvasMouseX += (s.targetCanvasMouseX - s.canvasMouseX) * 0.15;
    s.canvasMouseY += (s.targetCanvasMouseY - s.canvasMouseY) * 0.15;

    // 3. Hardware-Accelerated 3D Transform on Flame Wrapper
    if (flameWrapperRef.current) {
      const totalRotateZ = idleSway + s.currentLeanX * 6.0 + s.currentWindX * 3.6;
      const totalRotateY = s.currentLeanX * 3.8;
      const totalSkewX = s.currentLeanX * 2.8 + s.currentWindX * 1.6;
      const totalScaleX = (1 + s.currentSpreadX * 0.08) * (1 - Math.abs(s.currentLeanX) * 0.02);
      const totalScaleY = (1 + s.currentStretchY * 0.075) * idleBreathe;
      const totalTranslateX = s.currentLeanX * 18 + s.currentWindX * 12;
      const totalTranslateY = -s.currentStretchY * 10;

      flameWrapperRef.current.style.transform = `perspective(1000px) translate3d(${totalTranslateX.toFixed(2)}px, ${totalTranslateY.toFixed(2)}px, 0) rotateZ(${totalRotateZ.toFixed(2)}deg) rotateY(${totalRotateY.toFixed(2)}deg) skewX(${totalSkewX.toFixed(2)}deg) scale3d(${totalScaleX.toFixed(3)}, ${totalScaleY.toFixed(3)}, 1)`;
    }

    // 4. Photometric Reaction: Increased Fire Luminescence near Pointer
    if (videoRef.current) {
      const brightness = (0.98 + s.currentProximity * 0.16 + idleFlicker).toFixed(3);
      const contrast = (1.08 + s.currentProximity * 0.05).toFixed(3);
      videoRef.current.style.filter = `contrast(${contrast}) brightness(${brightness})`;
    }

    // 5. Subdued Atmospheric Ambient Glow Displacement
    if (ambientGlowRef.current) {
      const glowX = s.currentLeanX * 32;
      const glowY = -24 + s.currentStretchY * 14;
      const glowScale = (1 + s.currentProximity * 0.28).toFixed(3);
      const glowOpacity = (0.05 + s.currentProximity * 0.06).toFixed(3);
      ambientGlowRef.current.style.transform = `translate3d(${glowX.toFixed(1)}px, ${glowY.toFixed(1)}px, 0) scale(${glowScale})`;
      ambientGlowRef.current.style.opacity = glowOpacity;
    }

    // 6. Canvas Rendering: Subtle Pink Light Diffusion & Organic Micro-Embers
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, rect.width, rect.height);

        // A. Subtle Pink Light Diffusion Aura around pointer
        if (s.currentProximity > 0.04) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const auraRadius = 110 + s.currentProximity * 90;
          const auraGrad = ctx.createRadialGradient(
            s.canvasMouseX, s.canvasMouseY, 0,
            s.canvasMouseX, s.canvasMouseY, auraRadius
          );
          const alpha = 0.08 * s.currentProximity;
          auraGrad.addColorStop(0, `rgba(240, 165, 200, ${alpha.toFixed(3)})`);
          auraGrad.addColorStop(0.45, `rgba(240, 165, 200, ${(alpha * 0.4).toFixed(3)})`);
          auraGrad.addColorStop(1, 'rgba(240, 165, 200, 0)');

          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(s.canvasMouseX, s.canvasMouseY, auraRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // B. Micro-Ember Sparks Physics & Rendering
        if (s.sparks.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          for (let i = s.sparks.length - 1; i >= 0; i--) {
            const sp = s.sparks[i];
            sp.age++;

            if (sp.age >= sp.maxLife) {
              s.sparks.splice(i, 1);
              continue;
            }

            // Upward buoyant thermal draft + gentle lateral drift
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vx *= 0.95;
            sp.vy *= 0.98;
            sp.vx += Math.sin(sp.age * 0.12) * 0.05;

            const progress = sp.age / sp.maxLife;
            const alpha = Math.pow(1 - progress, 1.4) * sp.maxAlpha;
            const radius = sp.size * (1 - progress * 0.35);

            // Tiny incandescent core with delicate baby-pink dispersion
            const sparkGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, radius * 2.5);
            sparkGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(2)})`);
            sparkGrad.addColorStop(0.35, `rgba(240, 165, 200, ${(alpha * 0.85).toFixed(2)})`);
            sparkGrad.addColorStop(1, 'rgba(240, 165, 200, 0)');

            ctx.fillStyle = sparkGrad;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, radius * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }
    }

    s.rafId = requestAnimationFrame(animate);
  }, [reducedMotion]);

  // Pointer Movement Tracking with Distance-Based Dynamics
  useEffect(() => {
    if (reducedMotion) return;

    const onPointerMove = (e: PointerEvent) => {
      const s = stateRef.current;
      const container = containerRef.current;
      if (!container || !s.isVisible) return;

      const rect = container.getBoundingClientRect();

      // Only track if pointer is roughly within the hero viewport area
      if (e.clientY < -100 || e.clientY > rect.bottom + 150) {
        if (s.isHovered) {
          s.isHovered = false;
          s.targetProximity = 0;
          s.targetLeanX = 0;
          s.targetStretchY = 0;
          s.targetSpreadX = 0;
          s.targetWindX = 0;
        }
        return;
      }

      s.isHovered = true;

      // Coordinates relative to canvas
      s.targetCanvasMouseX = e.clientX - rect.left;
      s.targetCanvasMouseY = e.clientY - rect.top;

      // Core flame center coordinates in viewport space
      const flameCenterX = rect.left + rect.width / 2;
      const flameCenterY = rect.top + rect.height * 0.48; // Heart of the rising fire

      const dx = e.clientX - flameCenterX;
      const dy = e.clientY - flameCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Max interaction influence zone: 440px to 600px based on screen size
      const maxRadius = Math.max(380, Math.min(600, rect.width * 0.45));

      // Calculate instantaneous mouse velocity for dynamic aerodynamic drag
      const now = performance.now();
      const dt = Math.max(1, now - s.lastTime);
      const vx = ((e.clientX - s.lastClientX) / dt) * 16.6;
      const vy = ((e.clientY - s.lastClientY) / dt) * 16.6;
      s.lastClientX = e.clientX;
      s.lastClientY = e.clientY;
      s.lastTime = now;

      const speed = Math.hypot(vx, vy);
      const clampedVx = Math.max(-16, Math.min(16, vx));

      if (dist < maxRadius) {
        const normDist = dist / maxRadius; // 0 (dead center) to 1 (outer edge)
        const rawInfluence = 1 - normDist;
        const influence = Math.pow(rawInfluence, 1.35); // Smooth non-linear curve
        s.targetProximity = influence;

        // Aerodynamic wind pushes flame in swipe direction
        s.targetWindX = clampedVx * 0.08 * influence;

        // Dual-zone organic physical reaction:
        // A. Outer zone (normDist >= 0.28): Flame is pulled gently TOWARDS the cursor
        if (normDist >= 0.28) {
          const dirX = dx / (dist || 1);
          s.targetLeanX = dirX * influence;
          s.targetStretchY = Math.max(0, -dy / (dist || 1)) * influence * 0.75;
          s.targetSpreadX = 0;
        } 
        // B. Core zone (normDist < 0.28): Flame PARTS and FLOWS AWAY from pointer
        else {
          const coreFactor = (0.28 - normDist) / 0.28; // 0 to 1 as it reaches heart
          const dirX = dx / (dist || 1);
          s.targetLeanX = -dirX * coreFactor * 0.55; // Pushed aside
          s.targetSpreadX = coreFactor * 0.85; // Flame body expands outwards
          s.targetStretchY = coreFactor * 0.45;
        }

        // Spawn delicate micro-ember sparks when moving through the flame field
        if (speed > 2.2 && normDist < 0.65 && s.sparks.length < 22 && s.frameCounter % 2 === 0) {
          const angle = Math.random() * Math.PI * 2;
          const offset = Math.random() * 10;
          s.sparks.push({
            x: s.targetCanvasMouseX + Math.cos(angle) * offset,
            y: s.targetCanvasMouseY + Math.sin(angle) * offset,
            vx: clampedVx * 0.12 + (Math.random() - 0.5) * 1.5,
            vy: -1.8 - Math.random() * 2.2, // Rising thermal draft
            size: 1.2 + Math.random() * 1.3,
            age: 0,
            maxLife: 35 + Math.floor(Math.random() * 30), // ~0.6s to 1.1s
            maxAlpha: 0.75 + Math.random() * 0.25,
          });
        }
      } else {
        // Outside interaction zone: smoothly decay to resting idle
        s.targetProximity = 0;
        s.targetLeanX = 0;
        s.targetStretchY = 0;
        s.targetSpreadX = 0;
        s.targetWindX = 0;
      }
    };

    const onPointerLeave = () => {
      const s = stateRef.current;
      s.isHovered = false;
      s.targetProximity = 0;
      s.targetLeanX = 0;
      s.targetStretchY = 0;
      s.targetSpreadX = 0;
      s.targetWindX = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  // Touch Support: subtle touch interaction without blocking scrolling
  useEffect(() => {
    if (reducedMotion) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const s = stateRef.current;
        const container = containerRef.current;
        if (!container || !s.isVisible) return;

        const rect = container.getBoundingClientRect();
        s.targetCanvasMouseX = touch.clientX - rect.left;
        s.targetCanvasMouseY = touch.clientY - rect.top;

        const flameCenterX = rect.left + rect.width / 2;
        const flameCenterY = rect.top + rect.height * 0.48;

        const dx = touch.clientX - flameCenterX;
        const dy = touch.clientY - flameCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxRadius = Math.max(340, rect.width * 0.42);

        if (dist < maxRadius) {
          const normDist = dist / maxRadius;
          const influence = Math.pow(1 - normDist, 1.4);
          s.targetProximity = influence * 0.75;
          s.targetLeanX = (dx / (dist || 1)) * influence * 0.6;
          s.targetStretchY = Math.max(0, -dy / (dist || 1)) * influence * 0.5;
        }
      }
    };

    const onTouchEnd = () => {
      const s = stateRef.current;
      s.targetProximity = 0;
      s.targetLeanX = 0;
      s.targetStretchY = 0;
      s.targetSpreadX = 0;
      s.targetWindX = 0;
    };

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [reducedMotion]);

  // Resize Listener & Canvas DPR Sync
  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Viewport Intersection & Tab Visibility Management (Zero CPU when off-screen)
  useEffect(() => {
    const s = stateRef.current;

    const startLoop = () => {
      if (!s.rafId && !reducedMotion && s.isVisible) {
        s.rafId = requestAnimationFrame(animate);
      }
    };

    const stopLoop = () => {
      if (s.rafId) {
        cancelAnimationFrame(s.rafId);
        s.rafId = null;
      }
    };

    // 1. Intersection Observer for Hero Section
    const heroEl = document.getElementById('hero-section') || containerRef.current;
    let observer: IntersectionObserver | null = null;

    if (heroEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          s.isVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            startLoop();
            if (videoRef.current && !reducedMotion) {
              videoRef.current.play().catch(() => {});
            }
          } else {
            stopLoop();
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(heroEl);
    }

    // 2. Tab Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        s.isVisible = false;
        stopLoop();
        if (videoRef.current) videoRef.current.pause();
      } else {
        s.isVisible = true;
        startLoop();
        if (videoRef.current && !reducedMotion) videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, [animate, reducedMotion]);

  // Reduced-motion Video Autoplay handling
  useEffect(() => {
    if (videoRef.current) {
      if (reducedMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Black backdrop layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Video Container centered with interactive fire dynamics */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Dynamic Atmospheric Ambient Glow behind flame */}
        <div 
          ref={ambientGlowRef}
          className="absolute w-[340px] md:w-[520px] h-[340px] md:h-[520px] rounded-full bg-accent/5 blur-[120px] -translate-y-6 pointer-events-none will-change-transform" 
          aria-hidden="true" 
        />

        {/* Reactive Flame Video Wrapper (Anchored at flame base for natural organic bending) */}
        <div
          ref={flameWrapperRef}
          className="relative flex items-center justify-center will-change-transform"
          style={{
            transformOrigin: '50% 92%',
          }}
        >
          {/* Real Pink Looping Flame Video Asset */}
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
        </div>

        {/* Interactive Canvas Layer for Pink Light Diffusion & Micro-Embers */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Seamless edge blending vignettes into pure black #080808 */}
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#080808] via-[#080808]/70 to-transparent pointer-events-none" />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent pointer-events-none" />
        
        {/* Radial vignette fade from pure black edges */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(8, 8, 8, 0.5) 60%, #080808 90%)',
          }}
        />
      </div>
    </div>
  );
};
