import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// GLSL Shaders: Fluid Fire UV Displacement with Clean Alpha & Luminance Masking
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
uniform vec2 u_mouse;           // [0..1] normalized pointer coordinates in flame box
uniform float u_leanBase;       // Immediate lean angle for lower/mid section
uniform float u_leanTip;        // Lagged elastic lean angle for upper plume
uniform vec2 u_resolution;      // Canvas pixel dimensions
uniform float u_videoAspect;    // Native video aspect ratio (720 / 1280 = 0.5625)
uniform float u_time;           // Elapsed time
uniform float u_expandStrength; // Outward parting factor on pointer approach
uniform float u_leanStrength;   // Directional aerodynamic lean scale
uniform float u_proximity;      // Continuous distance factor [0.0 = far, 1.0 = near]
uniform float u_intensityBoost; // Luminous core boost on interaction
uniform float u_lumThreshold;   // Black floor threshold for luminance mask
uniform int u_debugMode;        // 0: Normal composite, 1: Alpha mask, 2: Edge feather, 3: Flow vectors

void main() {
    vec2 fragCoord = vUv * u_resolution;

    // 1. Maintain video aspect ratio centered within canvas
    float targetHeight = min(u_resolution.y * 0.90, (u_resolution.x * 0.92) / u_videoAspect);
    float targetWidth = targetHeight * u_videoAspect;
    vec2 boxOrigin = (u_resolution - vec2(targetWidth, targetHeight)) * 0.5;
    vec2 boxCoord = fragCoord - boxOrigin;

    // Outside contain box is completely black/transparent
    if (boxCoord.x < 0.0 || boxCoord.x > targetWidth || 
        boxCoord.y < 0.0 || boxCoord.y > targetHeight) {
        gl_FragColor = vec4(0.0);
        return;
    }

    // Normalized UV within flame box [0.0, 1.0]
    // u: 0 (left) to 1 (right)
    // v: 0 (bottom/base of flame) to 1 (top/plume tips)
    vec2 uv = boxCoord / vec2(targetWidth, targetHeight);

    // 2. Physical Height Anchor Factor:
    // Base of flame (v=0) is rooted to the baseline; upper tendrils (v=1) whip and flex
    float heightFactor = pow(clamp(uv.y, 0.0, 1.0), 1.35);

    // 3. Airflow Opening / Outward Parting on Approach:
    // When pointer approaches, air is pushed aside.
    // The flame parts outward away from central axis u = 0.5 without artificial fish wiggles
    float centerDistX = uv.x - 0.5;
    float partingDir = sign(centerDistX);
    float partingShape = exp(-pow(centerDistX * 2.4, 2.0));
    float partingVertical = 0.2 + 0.8 * heightFactor;
    
    vec2 partingOffset = vec2(
        partingDir * partingShape * partingVertical * u_expandStrength * u_proximity * 0.32,
        0.0
    );

    // 4. Directional Aerodynamic Leaning (Wind / Pointer Draft):
    // Blend between base lean and tip lean based on height for natural whip lag
    float effectiveLean = mix(u_leanBase, u_leanTip, heightFactor) * u_leanStrength;
    vec2 leanOffset = vec2(
        -effectiveLean * heightFactor * 0.38,
        -abs(effectiveLean) * heightFactor * 0.10
    );

    // 5. Local Pointer Airflow Wake:
    // When pointer moves through flame, local air displacement curves gently around it
    vec2 toMouse = u_mouse - uv;
    vec2 aspectScale = vec2(targetWidth / targetHeight, 1.0);
    float mouseDist = length(toMouse * aspectScale);
    float localWake = exp(-(mouseDist * mouseDist) / (2.0 * 0.20 * 0.20)) * u_proximity;
    vec2 wakeOffset = (mouseDist > 0.001 ? normalize(toMouse) : vec2(0.0)) * localWake * heightFactor * 0.09;

    // Combine physical airflow displacements
    vec2 totalDisplacement = partingOffset + leanOffset + wakeOffset;
    vec2 displacedUv = uv - totalDisplacement;

    // 6. SOLVE THE RECTANGULAR BACKGROUND PROBLEM:
    // A) Edge Feathering:
    // The original video has a cutoff at row 1279 (bottom) and occasional sparks near borders.
    // Smoothly dissolve all 4 edges to 0 alpha before reaching texture limits:
    float featherBottom = smoothstep(0.00, 0.08, displacedUv.y);
    float featherTop    = 1.0 - smoothstep(0.88, 1.00, displacedUv.y);
    float featherLeft   = smoothstep(0.00, 0.08, displacedUv.x);
    float featherRight  = 1.0 - smoothstep(0.92, 1.00, displacedUv.x);
    float edgeFeather   = featherBottom * featherTop * featherLeft * featherRight;

    // Clamp displaced UV safely within texture bounds
    vec2 safeUv = clamp(displacedUv, vec2(0.001), vec2(0.999));
    vec4 texColor = texture2D(u_texture, safeUv);
    vec3 rgb = texColor.rgb;

    // B) Luminance & Chroma Keying:
    // Flame is light emission; background is compression noise.
    // Cleanly isolate fire tendrils from the black background:
    float maxC = max(rgb.r, max(rgb.g, rgb.b));
    float lumAlpha = smoothstep(u_lumThreshold, u_lumThreshold + 0.10, maxC);

    // Final clean flame alpha
    float flameAlpha = lumAlpha * edgeFeather;

    // C) Interactive Photometric Luminance Boost:
    // Flame core intensifies when interacting, as air feeds combustion:
    float glowBoost = (u_proximity * 0.20 + abs(effectiveLean) * 0.15) * u_intensityBoost;
    vec3 gradedRgb = rgb * (1.0 + glowBoost);

    // 7. Render Modes
    if (u_debugMode == 1) {
        // Alpha mask visualization: white = flame, black = transparent
        gl_FragColor = vec4(vec3(flameAlpha), 1.0);
    } else if (u_debugMode == 2) {
        // Edge feather mask visualization
        gl_FragColor = vec4(vec3(edgeFeather), 1.0);
    } else if (u_debugMode == 3) {
        // Vector displacement field visualization
        gl_FragColor = vec4(abs(totalDisplacement.x) * 6.0, abs(totalDisplacement.y) * 6.0, u_proximity, 1.0);
    } else {
        // Production Composited Mode: Premultiplied flame blending into #080808
        gl_FragColor = vec4(gradedRgb * flameAlpha, flameAlpha);
    }
}
`;

export interface SimulatedCursor {
  x: number; // 0..1 in flame coordinates
  y: number; // 0..1 in flame coordinates
  active: boolean;
}

export interface InteractiveFlameCanvasProps {
  className?: string;
  expandStrength?: number;
  leanStrength?: number;
  intensityBoost?: number;
  lumThreshold?: number;
  debugMode?: number; // 0: Normal, 1: Alpha, 2: Edge Feather, 3: Flow Vectors
  interactive?: boolean;
  simulatedCursor?: SimulatedCursor | null;
  onTelemetry?: (data: { proximity: number; leanBase: number; leanTip: number; fps: number }) => void;
}

export const InteractiveFlameCanvas: React.FC<InteractiveFlameCanvasProps> = ({
  className = '',
  expandStrength = 0.24,
  leanStrength = 0.22,
  intensityBoost = 1.0,
  lumThreshold = 0.035,
  debugMode = 0,
  interactive = true,
  simulatedCursor = null,
  onTelemetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Physics state ref (Zero React re-renders in animation loop)
  const physicsRef = useRef({
    // Pointer positions
    targetUvX: 0.5,
    targetUvY: 0.5,
    currentUvX: 0.5,
    currentUvY: 0.5,

    // Dual-tier lean angles: Base (fast response) vs Tip (lagged elastic response)
    targetLean: 0,
    leanBase: 0,
    leanTip: 0,
    leanTipVel: 0,

    // Proximity
    targetProximity: 0,
    currentProximity: 0,

    // Pointer velocity tracking
    lastClientX: 0,
    lastClientY: 0,
    lastTime: 0,

    // Telemetry & FPS
    frameCount: 0,
    lastFpsTime: 0,
    fps: 60,
    isVisible: true,
    rafId: null as number | null,
  });

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Update uniforms when dynamic props change
  useEffect(() => {
    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.u_expandStrength.value = expandStrength;
      u.u_leanStrength.value = leanStrength;
      u.u_intensityBoost.value = intensityBoost;
      u.u_lumThreshold.value = lumThreshold;
      u.u_debugMode.value = debugMode;
    }
  }, [expandStrength, leanStrength, intensityBoost, lumThreshold, debugMode]);

  // Handle simulated cursor for scripted state tours
  useEffect(() => {
    if (simulatedCursor) {
      const p = physicsRef.current;
      p.targetUvX = simulatedCursor.x;
      p.targetUvY = simulatedCursor.y;
      p.targetProximity = simulatedCursor.active ? 1.0 : 0.0;
    }
  }, [simulatedCursor]);

  // Global Pointer Listener for responsive airflow tracking even when over text/buttons
  useEffect(() => {
    if (!interactive) return;

    const onGlobalPointerMove = (e: PointerEvent) => {
      if (simulatedCursor?.active) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Check if pointer is within or near the container
      if (
        clientX < rect.left - 60 ||
        clientX > rect.right + 60 ||
        clientY < rect.top - 60 ||
        clientY > rect.bottom + 60
      ) {
        physicsRef.current.targetProximity = 0.0;
        physicsRef.current.targetLean = 0.0;
        return;
      }

      const now = performance.now();
      const p = physicsRef.current;
      const dt = Math.max((now - p.lastTime) / 1000, 0.001);

      if (p.lastTime > 0) {
        const vx = (clientX - p.lastClientX) / dt;
        const rawLean = vx / 650.0;
        p.targetLean = Math.max(-1.0, Math.min(1.0, rawLean));
      }

      p.lastClientX = clientX;
      p.lastClientY = clientY;
      p.lastTime = now;

      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const aspect = 720 / 1280;
      const targetHeight = Math.min(rect.height * 0.9, (rect.width * 0.92) / aspect);
      const targetWidth = targetHeight * aspect;
      const boxOriginX = (rect.width - targetWidth) * 0.5;
      const boxOriginY = (rect.height - targetHeight) * 0.5;

      const uvX = (relX - boxOriginX) / targetWidth;
      const uvY = 1.0 - (relY - boxOriginY) / targetHeight;

      p.targetUvX = Math.max(0.0, Math.min(1.0, uvX));
      p.targetUvY = Math.max(0.0, Math.min(1.0, uvY));

      const dx = (p.targetUvX - 0.5) * 1.5;
      const dy = p.targetUvY - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      p.targetProximity = Math.max(0.0, 1.0 - dist / 0.85);
    };

    window.addEventListener('pointermove', onGlobalPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onGlobalPointerMove);
  }, [interactive, simulatedCursor]);

  // Mouse & Touch Interaction Listeners
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || simulatedCursor?.active) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const now = performance.now();
      const p = physicsRef.current;
      const dt = Math.max((now - p.lastTime) / 1000, 0.001);

      // Compute cursor velocity in pixels per second
      if (p.lastTime > 0) {
        const vx = (clientX - p.lastClientX) / dt;
        // Normalize velocity into lean target [-1.0, 1.0]
        const rawLean = vx / 700.0;
        p.targetLean = Math.max(-1.0, Math.min(1.0, rawLean));
      }

      p.lastClientX = clientX;
      p.lastClientY = clientY;
      p.lastTime = now;

      // Compute normalized coordinates inside the flame video box
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const aspect = 720 / 1280;
      const targetHeight = Math.min(rect.height * 0.9, (rect.width * 0.92) / aspect);
      const targetWidth = targetHeight * aspect;
      const boxOriginX = (rect.width - targetWidth) * 0.5;
      const boxOriginY = (rect.height - targetHeight) * 0.5;

      const uvX = (relX - boxOriginX) / targetWidth;
      // In WebGL, v=0 is bottom, v=1 is top. relY=0 is top of DOM, relY=rect.height is bottom.
      const uvY = 1.0 - (relY - boxOriginY) / targetHeight;

      p.targetUvX = Math.max(0.0, Math.min(1.0, uvX));
      p.targetUvY = Math.max(0.0, Math.min(1.0, uvY));

      // Compute distance to flame center (u=0.5, v=0.5)
      const dx = (p.targetUvX - 0.5) * 1.6;
      const dy = p.targetUvY - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Smooth proximity falloff: 1.0 at center, 0.0 when distance > 0.8
      p.targetProximity = Math.max(0.0, 1.0 - dist / 0.8);
    },
    [interactive, simulatedCursor]
  );

  const handlePointerLeave = useCallback(() => {
    if (simulatedCursor?.active) return;
    const p = physicsRef.current;
    p.targetProximity = 0.0;
    p.targetLean = 0.0;
    p.lastTime = 0;
  }, [simulatedCursor]);

  // Initialize Three.js WebGL Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!canvas || !container || !video) return;

    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      rendererRef.current = renderer;

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      textureRef.current = texture;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_texture: { value: texture },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_leanBase: { value: 0.0 },
          u_leanTip: { value: 0.0 },
          u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
          u_videoAspect: { value: 720 / 1280 },
          u_time: { value: 0.0 },
          u_expandStrength: { value: expandStrength },
          u_leanStrength: { value: leanStrength },
          u_proximity: { value: 0.0 },
          u_intensityBoost: { value: intensityBoost },
          u_lumThreshold: { value: lumThreshold },
          u_debugMode: { value: debugMode },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      materialRef.current = material;

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      scene.add(mesh);

      // Handle Resize
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !materialRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        rendererRef.current.setSize(w, h, false);
        materialRef.current.uniforms.u_resolution.value.set(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Intersection Observer to auto-pause when hidden
      const observer = new IntersectionObserver(
        entries => {
          physicsRef.current.isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      observer.observe(container);

      // Animation Loop
      let lastFrameTime = performance.now();
      const animate = (time: number) => {
        physicsRef.current.rafId = requestAnimationFrame(animate);

        const p = physicsRef.current;
        if (!p.isVisible) return;

        const dt = Math.min((time - lastFrameTime) / 1000, 0.1);
        lastFrameTime = time;

        // FPS Calculation
        p.frameCount++;
        if (time - p.lastFpsTime >= 500) {
          p.fps = Math.round((p.frameCount * 1000) / (time - p.lastFpsTime));
          p.frameCount = 0;
          p.lastFpsTime = time;

          if (onTelemetry) {
            onTelemetry({
              proximity: p.currentProximity,
              leanBase: p.leanBase,
              leanTip: p.leanTip,
              fps: p.fps,
            });
          }
        }

        // 1. Smooth Pointer Coordinates with exponential damping
        const posDamp = Math.min(1.0, 10.0 * dt);
        p.currentUvX += (p.targetUvX - p.currentUvX) * posDamp;
        p.currentUvY += (p.targetUvY - p.currentUvY) * posDamp;

        // 2. Smooth Proximity
        const proxDamp = Math.min(1.0, 6.0 * dt);
        p.currentProximity += (p.targetProximity - p.currentProximity) * proxDamp;

        // 3. Dual-Tier Lean Physics (Base responds immediately; Tip has elastic lag)
        // Base lean damping:
        const baseDamp = Math.min(1.0, 8.0 * dt);
        p.leanBase += (p.targetLean - p.leanBase) * baseDamp;
        // Natural lean decay when pointer stops moving:
        p.targetLean *= Math.max(0.0, 1.0 - 4.5 * dt);

        // Tip lean: spring-damper following base lean for whip lag
        const springK = 38.0;
        const dampingC = 8.5;
        const force = (p.leanBase - p.leanTip) * springK;
        p.leanTipVel += (force - p.leanTipVel * dampingC) * dt;
        p.leanTip += p.leanTipVel * dt;

        // Update Shader Uniforms
        if (materialRef.current) {
          const u = materialRef.current.uniforms;
          u.u_time.value = time * 0.001;
          u.u_mouse.value.set(p.currentUvX, p.currentUvY);
          u.u_proximity.value = p.currentProximity;
          u.u_leanBase.value = p.leanBase;
          u.u_leanTip.value = p.leanTip;
        }

        renderer.render(scene, camera);
      };

      physicsRef.current.rafId = requestAnimationFrame(animate);

      return () => {
        if (physicsRef.current.rafId) {
          cancelAnimationFrame(physicsRef.current.rafId);
        }
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      };
    } catch {
      setWebglSupported(false);
    }
  }, [onTelemetry]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      {/* Black backdrop layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Subdued ambient atmospheric bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[520px] h-[340px] md:h-[520px] rounded-full bg-accent/5 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      {/* HTML5 Video Source for WebGL Texture */}
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
        className={
          webglSupported
            ? 'hidden'
            : `h-[75vh] md:h-[88vh] max-w-[90vw] object-contain mix-blend-screen opacity-75 ${
                isVideoLoaded ? 'opacity-75' : 'opacity-40'
              }`
        }
        aria-hidden="true"
      />

      {/* WebGL Canvas with Clean Alpha Blending */}
      {webglSupported && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-screen transition-opacity duration-700 ${
            isVideoLoaded ? 'opacity-90' : 'opacity-30'
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
