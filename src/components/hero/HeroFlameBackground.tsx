import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// Vertex Shader: full-screen quad passing UV coordinates
const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment Shader: Localized UV distortion based on cursor position and velocity
const fragmentShader = `
varying vec2 vUv;

uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_velocity;
uniform vec2 u_resolution;
uniform float u_videoAspect;
uniform float u_time;
uniform float u_radius;
uniform float u_pullStrength;
uniform float u_velocityStrength;
uniform float u_turbulenceStrength;
uniform float u_intensity;

void main() {
    // Current fragment coordinate in canvas pixels (bottom-left origin)
    vec2 fragCoord = vUv * u_resolution;

    // Centered 'contain' box for the flame video preserving its native 720:1280 aspect ratio
    float targetHeight = min(u_resolution.y * 0.86, (u_resolution.x * 0.90) / u_videoAspect);
    float targetWidth = targetHeight * u_videoAspect;
    vec2 boxOrigin = (u_resolution - vec2(targetWidth, targetHeight)) * 0.5;

    // Distance in screen pixels to smoothed cursor position
    float distToMouse = distance(fragCoord, u_mouse);

    // Smooth localized falloff: 1.0 at cursor, 0.0 at u_radius (completely 0 outside radius)
    float rawInfluence = smoothstep(u_radius, 0.0, distToMouse);
    float influence = rawInfluence * rawInfluence * (3.0 - 2.0 * rawInfluence) * u_intensity;

    vec2 displacedCoord = fragCoord;

    // Localized distortion ONLY applies within interaction radius
    if (influence > 0.0001) {
        // 1. Localized directional stretch toward pointer
        vec2 toMouse = u_mouse - fragCoord;
        float len = length(toMouse);
        vec2 toMouseDir = len > 0.001 ? toMouse / len : vec2(0.0);
        vec2 pull = toMouseDir * influence * u_pullStrength;

        // 2. Velocity-driven directional flow (fluid drag)
        vec2 clampedVel = clamp(u_velocity, vec2(-28.0), vec2(28.0));
        vec2 velDisplacement = clampedVel * influence * u_velocityStrength;

        // 3. Subtle convective heat turbulence
        float noise = sin(fragCoord.y * 0.035 + u_time * 3.0) * cos(fragCoord.x * 0.035 - u_time * 2.2);
        vec2 turbulence = vec2(noise * 0.6, -abs(noise) * 0.8) * influence * u_turbulenceStrength;

        // Total pixel displacement
        displacedCoord = fragCoord - (pull + velDisplacement + turbulence);
    }

    // Map displaced pixel back to video box space
    vec2 boxCoord = displacedCoord - boxOrigin;

    // Outside the video box: output transparent black
    if (boxCoord.x < 0.0 || boxCoord.x > targetWidth || 
        boxCoord.y < 0.0 || boxCoord.y > targetHeight) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }

    // Normalized video UV coordinates [0.0, 1.0]
    vec2 videoUv = boxCoord / vec2(targetWidth, targetHeight);

    // Sample real flame video texture
    vec4 color = texture2D(u_texture, videoUv);

    // Subtle localized luminosity flare when cursor approaches fire
    if (influence > 0.0001) {
        float flare = influence * 0.16;
        color.rgb += color.rgb * flare;
    }

    gl_FragColor = color;
}
`;

export const HeroFlameBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // References for Three.js instance objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Mouse physics tracking state (No React re-renders during 60fps loop)
  const physicsRef = useRef({
    currentMouseX: 0,
    currentMouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,

    currentVelX: 0,
    currentVelY: 0,
    targetVelX: 0,
    targetVelY: 0,

    currentIntensity: 0,
    targetIntensity: 0,

    lastClientX: 0,
    lastClientY: 0,
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

  // Check WebGL availability helper
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

  // Initialize Three.js scene, video texture, and shader material
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

    // 1. Setup Three.js Scene and Orthographic Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // 2. Setup WebGL Renderer
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
      console.warn('WebGL initialization failed, falling back to standard video element:', err);
      setWebglSupported(false);
      return;
    }

    // 3. Create VideoTexture from existing HTML5 video element
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.generateMipmaps = false;
    textureRef.current = texture;

    // 4. Create Custom ShaderMaterial with Uniforms
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        u_texture: { value: texture },
        u_mouse: { value: new THREE.Vector2(width * 0.5, height * 0.5) },
        u_velocity: { value: new THREE.Vector2(0, 0) },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_videoAspect: { value: 720.0 / 1280.0 }, // Native video aspect ratio (0.5625)
        u_time: { value: 0 },
        u_radius: { value: Math.max(150.0, Math.min(220.0, width * 0.16)) },
        u_pullStrength: { value: 24.0 }, // Restrained local stretch toward pointer
        u_velocityStrength: { value: 0.42 }, // Directional displacement with velocity
        u_turbulenceStrength: { value: 7.0 }, // Subtle convective heat turbulence
        u_intensity: { value: 0.0 }, // Smooth entry and recovery
      },
    });
    materialRef.current = material;

    // 5. Plane geometry covering entire viewport quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 6. Handle Video Autoplay
    video.play().catch(() => {
      // Autoplay silently handled for muted playsInline video
    });

    // Cleanup WebGL resources on unmount
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
  }, [checkWebGL]);

  // Main 60fps Animation Loop: GPU Uniform updates and Three.js Render
  useEffect(() => {
    const p = physicsRef.current;

    const renderLoop = () => {
      if (!p.isVisible || reducedMotion) {
        p.rafId = null;
        return;
      }

      // Smooth interpolation for mouse coordinates and velocity
      const lerpFactor = 0.12;
      p.currentMouseX += (p.targetMouseX - p.currentMouseX) * lerpFactor;
      p.currentMouseY += (p.targetMouseY - p.currentMouseY) * lerpFactor;

      p.currentVelX += (p.targetVelX - p.currentVelX) * 0.16;
      p.currentVelY += (p.targetVelY - p.currentVelY) * 0.16;

      // Natural decay of velocity momentum
      p.targetVelX *= 0.88;
      p.targetVelY *= 0.88;

      // Smooth recovery of distortion intensity
      p.currentIntensity += (p.targetIntensity - p.currentIntensity) * 0.08;

      // Update shader uniforms
      if (materialRef.current) {
        const u = materialRef.current.uniforms;
        u.u_mouse.value.set(p.currentMouseX, p.currentMouseY);
        u.u_velocity.value.set(p.currentVelX, p.currentVelY);
        u.u_intensity.value = p.currentIntensity;
        u.u_time.value = performance.now() * 0.001;
      }

      // Render the scene
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

    // Pause rendering when hero is scrolled out of view
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

    // Pause on tab visibility change
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

  // Window Resize & Resolution Uniform Sync
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
      material.uniforms.u_radius.value = Math.max(150.0, Math.min(220.0, width * 0.16));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Localized Pointer Tracking (Disabled on touch-only devices)
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

      // Check if cursor is roughly within hero section
      if (e.clientY < -100 || e.clientY > rect.bottom + 100) {
        p.targetIntensity = 0.0;
        return;
      }

      // Convert to canvas pixel space with bottom-left origin for WebGL
      const canvasX = e.clientX - rect.left;
      const canvasY = rect.height - (e.clientY - rect.top);

      p.targetMouseX = canvasX;
      p.targetMouseY = canvasY;

      // Compute instantaneous mouse velocity
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);
      const vx = ((canvasX - p.lastClientX) / dt) * 16.6;
      const vy = ((canvasY - p.lastClientY) / dt) * 16.6;

      p.lastClientX = canvasX;
      p.lastClientY = canvasY;
      p.lastTime = now;

      p.targetVelX = vx;
      p.targetVelY = vy;

      // Check if cursor is within interaction distance of the flame
      const flameCenterX = rect.width * 0.5;
      const flameCenterY = rect.height * 0.5;
      const distToCenter = Math.hypot(canvasX - flameCenterX, canvasY - flameCenterY);
      const maxActiveRadius = Math.max(rect.width, rect.height) * 0.55;

      p.targetIntensity = distToCenter < maxActiveRadius ? 1.0 : 0.0;
    };

    const onPointerLeave = () => {
      const p = physicsRef.current;
      p.targetIntensity = 0.0;
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

      {/* HTML5 Video Element used as WebGL VideoTexture Source */}
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

      {/* WebGL Canvas: Localized UV Pixel Distortion Shader */}
      {webglSupported && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-screen transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-70 md:opacity-75' : 'opacity-40'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Seamless edge blending vignettes into pure black #080808 */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#080808] via-[#080808]/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(8, 8, 8, 0.5) 60%, #080808 90%)',
        }}
      />
    </div>
  );
};
