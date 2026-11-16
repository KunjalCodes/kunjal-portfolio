import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Hero Flame 2.0: Full-Scale Fluid Fire Shaders
// ---------------------------------------------------------------------------

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;

uniform sampler2D u_texture;
uniform vec2 u_mouse;        // Normalized cursor coordinates in flame box [0..1]
uniform vec2 u_velocity;     // Smoothed cursor velocity vector
uniform vec2 u_resolution;   // Canvas resolution in pixels
uniform float u_videoAspect; // Native video aspect ratio (720 / 1280 = 0.5625)
uniform float u_time;        // Elapsed time in seconds
uniform float u_expandStrength; // Outward parting / expansion factor
uniform float u_leanStrength;   // Whole-flame directional lean factor
uniform float u_forceStrength;  // Spatial attraction force field factor
uniform float u_turbulence;     // Multi-octave convective wave factor
uniform float u_proximity;      // Continuous distance factor (0: far, 1: near)

void main() {
    vec2 fragCoord = vUv * u_resolution;

    // Calculate aspect-ratio-preserving 'contain' box for the flame video
    float targetHeight = min(u_resolution.y * 0.86, (u_resolution.x * 0.90) / u_videoAspect);
    float targetWidth = targetHeight * u_videoAspect;
    vec2 boxOrigin = (u_resolution - vec2(targetWidth, targetHeight)) * 0.5;

    vec2 boxCoord = fragCoord - boxOrigin;

    // Output transparent black outside the flame box (blends to identity under mix-blend-screen)
    if (boxCoord.x < 0.0 || boxCoord.x > targetWidth || 
        boxCoord.y < 0.0 || boxCoord.y > targetHeight) {
        gl_FragColor = vec4(0.0);
        return;
    }

    // Normalized UV within the flame box [0.0, 1.0]
    vec2 uv = boxCoord / vec2(targetWidth, targetHeight);

    // 1. Height-dependent flexibility:
    // Base of flame (v=0) is rooted to the ground; top tendrils (v=1) whip and bend with maximum fluidity
    float heightFactor = pow(clamp(uv.y, 0.0, 1.0), 1.25);

    // 2. Broad continuous spatial influence field across the visible flame:
    // Uses a broad Gaussian distribution (sigma = 0.44) so the entire flame structure reacts without circular clipping
    vec2 toMouse = u_mouse - uv;
    vec2 aspectVec = vec2(targetWidth / targetHeight, 1.0);
    float d = length(toMouse * aspectVec);
    float localInfluence = exp(-(d * d) / (2.0 * 0.44 * 0.44));

    // 3. Flame 'Opening Up' (Outward Expansion / Parting):
    // As cursor approaches, horizontal coordinates push outward from the central axis (u = 0.5),
    // widening the flame silhouette and revealing the incandescent core
    float centerDistX = uv.x - 0.5;
    float partingDir = sign(centerDistX);
    float partingProfile = pow(clamp(abs(centerDistX) * 2.0, 0.0, 1.0), 0.75);
    vec2 partingOffset = vec2(
        partingDir * partingProfile * u_expandStrength * u_proximity * (0.25 + 0.75 * heightFactor),
        0.0
    );

    // 4. Full-flame Leaning & Directional Drag:
    // When cursor sweeps across, the entire flame column leans in velocity direction with progressive height lag
    vec2 leanOffset = vec2(
        -u_velocity.x * u_leanStrength * heightFactor * 1.8,
        -u_velocity.y * u_leanStrength * heightFactor * 0.8
    );

    // 5. Continuous Gravitational Force Field:
    // Gently pulls nearby and surrounding flame tendrils toward cursor
    vec2 forceDir = d > 0.001 ? normalize(toMouse) : vec2(0.0);
    vec2 fieldOffset = forceDir * localInfluence * heightFactor * u_forceStrength * u_proximity;

    // 6. Multi-Frequency Fluid Convective Turbulence (Licking Fire Harmonics):
    float wave1 = sin(uv.y * 16.0 + uv.x * 8.0 - u_time * 3.2);
    float wave2 = cos(uv.y * 28.0 - uv.x * 14.0 + u_time * 4.0);
    float wave3 = sin((uv.x + uv.y) * 22.0 + u_time * 5.2);
    float totalWave = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
    vec2 turbulenceOffset = vec2(
        totalWave * u_turbulence * heightFactor,
        -abs(totalWave) * u_turbulence * heightFactor * 0.8
    );

    // Compute final displaced UV for video sampling
    vec2 totalDisplacement = partingOffset + leanOffset + fieldOffset + turbulenceOffset;
    vec2 displacedUv = uv - totalDisplacement;

    // Clamp coordinates safely within the black borders of the video texture
    displacedUv = clamp(displacedUv, vec2(0.001), vec2(0.999));
    vec4 color = texture2D(u_texture, displacedUv);

    // Photometric luminosity enhancement as the flame opens toward the cursor
    float brightFactor = (u_proximity * 0.18 + localInfluence * 0.14 + length(u_velocity) * 0.06);
    color.rgb += color.rgb * brightFactor;

    gl_FragColor = color;
}
`;

// Three Interaction Strength Presets
export type InteractionStrength = 'subtle' | 'medium' | 'expressive';

const STRENGTH_CONFIGS = {
  subtle: {
    expandStrength: 0.10,
    leanStrength: 0.09,
    forceStrength: 0.10,
    turbulence: 0.015,
  },
  medium: { // DEFAULT PRESET
    expandStrength: 0.22,
    leanStrength: 0.18,
    forceStrength: 0.20,
    turbulence: 0.028,
  },
  expressive: {
    expandStrength: 0.38,
    leanStrength: 0.30,
    forceStrength: 0.34,
    turbulence: 0.045,
  },
};

export const HeroFlameBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [strength, setStrength] = useState<InteractionStrength>('medium');

  // References for Three.js engine objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Physics state ref (Zero React re-renders during high-frequency animation)
  const physicsRef = useRef({
    currentMouseUvX: 0.5,
    currentMouseUvY: 0.5,
    targetMouseUvX: 0.5,
    targetMouseUvY: 0.5,

    currentVelX: 0,
    currentVelY: 0,
    targetVelX: 0,
    targetVelY: 0,

    currentProximity: 0,
    targetProximity: 0,

    lastUvX: 0.5,
    lastUvY: 0.5,
    lastTime: 0,

    isVisible: true,
    rafId: null as number | null,
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

  // Check WebGL availability
  const checkWebGL = useCallback(() => {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }, []);

  // Update shader uniforms whenever interaction strength preset changes
  useEffect(() => {
    if (materialRef.current) {
      const config = STRENGTH_CONFIGS[strength];
      const u = materialRef.current.uniforms;
      u.u_expandStrength.value = config.expandStrength;
      u.u_leanStrength.value = config.leanStrength;
      u.u_forceStrength.value = config.forceStrength;
      u.u_turbulence.value = config.turbulence;
    }
  }, [strength]);

  // Initialize Three.js scene, video texture, and ShaderMaterial
  useEffect(() => {
    if (!checkWebGL()) {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!container || !canvas || !video) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 1. Scene & Orthographic Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      rendererRef.current = renderer;
    } catch (err) {
      console.warn('WebGL init failed, falling back to native video:', err);
      setWebglSupported(false);
      return;
    }

    // 3. VideoTexture from native HTML5 video element
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.generateMipmaps = false;
    textureRef.current = texture;

    // 4. Custom ShaderMaterial with Broad Force-Field Uniforms
    const config = STRENGTH_CONFIGS[strength];
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        u_texture: { value: texture },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_velocity: { value: new THREE.Vector2(0, 0) },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_videoAspect: { value: 720.0 / 1280.0 }, // Native video ratio
        u_time: { value: 0 },
        u_expandStrength: { value: config.expandStrength },
        u_leanStrength: { value: config.leanStrength },
        u_forceStrength: { value: config.forceStrength },
        u_turbulence: { value: config.turbulence },
        u_proximity: { value: 0.0 },
      },
    });
    materialRef.current = material;

    // 5. Full viewport quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 6. Autoplay Video safely
    video.play().catch(() => {});

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      if (materialRef.current) {
        materialRef.current.dispose();
        materialRef.current = null;
      }
      geometry.dispose();
    };
  }, [checkWebGL, strength]);

  // Main 60fps Animation Loop: Physics Damping + Three.js Render
  useEffect(() => {
    const p = physicsRef.current;

    const renderLoop = () => {
      if (!p.isVisible || reducedMotion) {
        p.rafId = null;
        return;
      }

      // 1. Smooth interpolation of normalized cursor coordinates (lag-free fluid trail)
      const lerp = 0.10;
      p.currentMouseUvX += (p.targetMouseUvX - p.currentMouseUvX) * lerp;
      p.currentMouseUvY += (p.targetMouseUvY - p.currentMouseUvY) * lerp;

      // 2. Smooth velocity with inertia and aerodynamic decay
      p.currentVelX += (p.targetVelX - p.currentVelX) * 0.14;
      p.currentVelY += (p.targetVelY - p.currentVelY) * 0.14;
      p.targetVelX *= 0.90;
      p.targetVelY *= 0.90;

      // 3. Smooth global proximity decay when cursor leaves or pauses
      p.currentProximity += (p.targetProximity - p.currentProximity) * 0.08;

      // 4. Update GLSL shader uniforms
      if (materialRef.current) {
        const u = materialRef.current.uniforms;
        u.u_mouse.value.set(p.currentMouseUvX, p.currentMouseUvY);
        u.u_velocity.value.set(p.currentVelX, p.currentVelY);
        u.u_proximity.value = p.currentProximity;
        u.u_time.value = performance.now() * 0.001;
      }

      // 5. Render Scene to WebGL Canvas
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      p.rafId = requestAnimationFrame(renderLoop);
    };

    const startLoop = () => {
      if (!p.rafId && !reducedMotion && p.isVisible) {
        p.rafId = requestAnimationFrame(renderLoop);
      }
    };

    const stopLoop = () => {
      if (p.rafId) {
        cancelAnimationFrame(p.rafId);
        p.rafId = null;
      }
    };

    // Pause WebGL rendering when hero is off-screen
    const heroEl = document.getElementById('hero-section') || containerRef.current;
    let observer: IntersectionObserver | null = null;

    if (heroEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          p.isVisible = entry.isIntersecting;
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

    // Pause on background tab visibility change
    const handleVisibility = () => {
      if (document.hidden) {
        p.isVisible = false;
        stopLoop();
        if (videoRef.current) videoRef.current.pause();
      } else {
        p.isVisible = true;
        startLoop();
        if (videoRef.current && !reducedMotion) videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
    };
  }, [reducedMotion]);

  // Window Resize & Canvas Resolution Sync
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const renderer = rendererRef.current;
      const material = materialRef.current;
      if (!container || !renderer || !material) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setSize(width, height, false);
      renderer.setPixelRatio(dpr);

      material.uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Broad Spatial Pointer Tracking (Disabled on touch-only devices)
  useEffect(() => {
    if (reducedMotion) return;

    // Check if device is touch-only
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;
    if (isTouchOnly) return;

    const onPointerMove = (e: PointerEvent) => {
      const p = physicsRef.current;
      const container = containerRef.current;
      if (!container || !p.isVisible) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Ignore if cursor is far outside hero section
      if (e.clientY < -150 || e.clientY > rect.bottom + 150) {
        p.targetProximity = 0.0;
        return;
      }

      // Compute geometry of centered flame box
      const videoAspect = 720.0 / 1280.0;
      const targetHeight = Math.min(height * 0.86, (width * 0.90) / videoAspect);
      const targetWidth = targetHeight * videoAspect;
      const boxOriginX = (width - targetWidth) * 0.5;
      const boxOriginY = (height - targetHeight) * 0.5;

      const canvasX = e.clientX - rect.left;
      const canvasY = height - (e.clientY - rect.top); // WebGL inverted Y

      // Normalized cursor coordinates inside the flame box space
      const flameUvX = (canvasX - boxOriginX) / targetWidth;
      const flameUvY = (canvasY - boxOriginY) / targetHeight;

      p.targetMouseUvX = flameUvX;
      p.targetMouseUvY = flameUvY;

      // Compute cursor velocity in normalized UV space
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);
      const rawVx = ((flameUvX - p.lastUvX) / dt) * 16.6;
      const rawVy = ((flameUvY - p.lastUvY) / dt) * 16.6;

      p.lastUvX = flameUvX;
      p.lastUvY = flameUvY;
      p.lastTime = now;

      // Velocity clamping to prevent excessive distortion on fast flicks
      p.targetVelX = Math.max(-2.5, Math.min(2.5, rawVx));
      p.targetVelY = Math.max(-2.5, Math.min(2.5, rawVy));

      // Continuous broad proximity factor to the flame center (u=0.5, v=0.5)
      const distToCenter = Math.hypot(flameUvX - 0.5, flameUvY - 0.5);
      // Continuous falloff across the hero: 1.0 when near, smoothly reaches 0.0 when far away
      p.targetProximity = Math.max(0.0, Math.min(1.0, 1.0 - (distToCenter - 0.2) / 0.95));
    };

    const onPointerLeave = () => {
      const p = physicsRef.current;
      p.targetProximity = 0.0;
      p.targetVelX = 0.0;
      p.targetVelY = 0.0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Black backdrop layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Static Subdued Ambient Glow behind flame */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[520px] h-[340px] md:h-[520px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* HTML5 Video Source for WebGL VideoTexture */}
      <video
        ref={videoRef}
        src="/assets/pink-flame.mp4"
        poster="/assets/flame-poster.jpg"
        autoPlay={!reducedMotion}
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        onLoadedData={() => setIsVideoLoaded(true)}
        className={webglSupported ? "hidden" : `h-[75vh] md:h-[88vh] max-w-[90vw] object-contain mix-blend-screen opacity-70 md:opacity-75 transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-70 md:opacity-75' : 'opacity-40'
        }`}
        aria-hidden="true"
      />

      {/* Hero Flame 2.0 WebGL Canvas (Full-Scale Fluid Deformation) */}
      {webglSupported && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-screen transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-70 md:opacity-75' : 'opacity-40'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Edge blending vignettes into pure black #080808 */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#080808] via-[#080808]/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(8, 8, 8, 0.5) 60%, #080808 90%)',
        }}
      />

      {/* Interaction Strength Presets Control (Subtle / Medium / Expressive) */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-1.5 bg-[#0D0D0D]/90 backdrop-blur-md border border-border/80 px-2.5 py-1.5 rounded-md text-[11px] font-mono pointer-events-auto select-none">
        <span className="text-muted mr-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Flame Physics:
        </span>
        {(['subtle', 'medium', 'expressive'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setStrength(mode)}
            className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors cursor-pointer ${
              strength === mode
                ? 'bg-accent/20 text-accent font-medium border border-accent/40 shadow-sm'
                : 'text-muted-dark hover:text-muted hover:bg-white/[0.03]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};
