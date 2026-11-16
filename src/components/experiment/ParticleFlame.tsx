import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 3D Simplex-like Incompressible Curl Noise Generator
// ---------------------------------------------------------------------------

// Fast hash-based pseudo-noise for vector potential
function hash(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 127412617) ^ 0x5bf03635;
  h = (h ^ (h >> 13)) * 127412617;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

// 3D Value noise with cubic Hermite interpolation
function valueNoise3D(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);

  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;

  // Hermite smoothstep weights
  const u = xf * xf * (3.0 - 2.0 * xf);
  const v = yf * yf * (3.0 - 2.0 * yf);
  const w = zf * zf * (3.0 - 2.0 * zf);

  const n000 = hash(xi, yi, zi);
  const n100 = hash(xi + 1, yi, zi);
  const n010 = hash(xi, yi + 1, zi);
  const n110 = hash(xi + 1, yi + 1, zi);
  const n001 = hash(xi, yi, zi + 1);
  const n101 = hash(xi + 1, yi, zi + 1);
  const n011 = hash(xi, yi + 1, zi + 1);
  const n111 = hash(xi + 1, yi + 1, zi + 1);

  const x00 = n000 * (1.0 - u) + n100 * u;
  const x10 = n010 * (1.0 - u) + n110 * u;
  const x01 = n001 * (1.0 - u) + n101 * u;
  const x11 = n011 * (1.0 - u) + n111 * u;

  const y0 = x00 * (1.0 - v) + x10 * v;
  const y1 = x01 * (1.0 - v) + x11 * v;

  return (y0 * (1.0 - w) + y1 * w) * 2.0 - 1.0;
}

// Compute divergence-free curl of vector potential:
// curl(Psi) = (dPsi_z/dy - dPsi_y/dz, dPsi_x/dz - dPsi_z/dx, dPsi_y/dx - dPsi_x/dy)
const EPS = 0.08;
function computeCurl(x: number, y: number, z: number, out: THREE.Vector3): void {
  // Vector potential Psi = (Psi_x, Psi_y, Psi_z) using offset noise fields
  const p1y_plus = valueNoise3D(x, y + EPS, z + 31.41);
  const p1y_minus = valueNoise3D(x, y - EPS, z + 31.41);
  const p1z_plus = valueNoise3D(x, y, z + EPS + 31.41);
  const p1z_minus = valueNoise3D(x, y, z - EPS + 31.41);

  const p2x_plus = valueNoise3D(x + EPS + 67.89, y, z);
  const p2x_minus = valueNoise3D(x - EPS + 67.89, y, z);
  const p2z_plus = valueNoise3D(x + 67.89, y, z + EPS);
  const p2z_minus = valueNoise3D(x + 67.89, y, z - EPS);

  const p3x_plus = valueNoise3D(x + EPS, y + 104.32, z);
  const p3x_minus = valueNoise3D(x - EPS, y + 104.32, z);
  const p3y_plus = valueNoise3D(x, y + EPS + 104.32, z);
  const p3y_minus = valueNoise3D(x, y - EPS + 104.32, z);

  const dPsi_z_dy = (p3y_plus - p3y_minus) / (2.0 * EPS);
  const dPsi_y_dz = (p2z_plus - p2z_minus) / (2.0 * EPS);

  const dPsi_x_dz = (p1z_plus - p1z_minus) / (2.0 * EPS);
  const dPsi_z_dx = (p3x_plus - p3x_minus) / (2.0 * EPS);

  const dPsi_y_dx = (p2x_plus - p2x_minus) / (2.0 * EPS);
  const dPsi_x_dy = (p1y_plus - p1y_minus) / (2.0 * EPS);

  out.set(
    dPsi_z_dy - dPsi_y_dz,
    dPsi_x_dz - dPsi_z_dx,
    dPsi_y_dx - dPsi_x_dy
  );
}

// ---------------------------------------------------------------------------
// GLSL Shaders: Luminous Multi-Thermal Particle Splats
// ---------------------------------------------------------------------------

const vertexShader = `
attribute vec2 aLife;       // x: current age, y: max lifetime
attribute vec4 aProperties; // x: particle type (0=core, 1=tendril, 2=ember), y: base size, z: seed, w: brightness
attribute vec3 aVelocity;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_sizeScale;

varying float vLifeRatio;
varying float vType;
varying float vBrightness;
varying float vSeed;

void main() {
  vLifeRatio = clamp(aLife.x / aLife.y, 0.0, 1.0);
  vType = aProperties.x;
  vBrightness = aProperties.w;
  vSeed = aProperties.z;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Dynamic particle size based on type and convective age
  float size = aProperties.y * u_sizeScale;
  
  if (vType < 0.5) {
    // 0: Core Volumetric Puffs (broad incandescent body)
    float growth = sin(vLifeRatio * 3.14159);
    size *= (0.7 + 0.9 * growth);
  } else if (vType < 1.5) {
    // 1: Tendril Tongues (stretch and flutter)
    float growth = sin(pow(vLifeRatio, 0.8) * 3.14159);
    size *= (0.65 + 0.85 * growth);
  } else {
    // 2: Embers & Sparks (tiny flickering specks)
    float flicker = sin(u_time * 24.0 + vSeed * 50.0) * 0.35 + 0.65;
    size *= (1.0 - vLifeRatio * 0.65) * flicker;
  }

  // Resolution and pixel ratio scaling for crisp rendering across all displays
  gl_PointSize = max(1.0, size * (u_resolution.y / 760.0) * u_pixelRatio);
}
`;

const fragmentShader = `
precision highp float;

uniform vec3 u_coreColor;     // Hot white-pink: #FFF0F6
uniform vec3 u_innerColor;    // Luminous baby pink: #F0A5C8
uniform vec3 u_bodyColor;     // Vibrant neon magenta: #FF1493
uniform vec3 u_flameColor;    // Deep rose / crimson: #C20062
uniform vec3 u_smokeColor;    // Dark smoky violet: #240019
uniform float u_glowIntensity;

varying float vLifeRatio;
varying float vType;
varying float vBrightness;
varying float vSeed;

void main() {
  // Distance from center of point sprite [0.0 at center, 0.5 at boundary]
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  // Ultra-soft radial Gaussian falloff: no hard edges anywhere
  float r = dist * 2.0; // [0..1]
  float shape = exp(-r * r * 4.2);

  // Incandescent specular core in center of each puff
  float coreSpot = exp(-r * r * 18.0);

  // Thermal cooling progression (1.0 = hot birth, 0.0 = cold death)
  float temp = 1.0 - pow(vLifeRatio, 0.82);

  vec3 color;
  float alpha;

  if (vType < 0.5) {
    // 1. Incandescent Core (Molten continuous fluid body)
    if (temp > 0.68) {
      color = mix(u_innerColor, u_coreColor, (temp - 0.68) / 0.32);
    } else if (temp > 0.35) {
      color = mix(u_bodyColor, u_innerColor, (temp - 0.35) / 0.33);
    } else {
      color = mix(u_flameColor, u_bodyColor, temp / 0.35);
    }
    // High overlap density, soft silky edges
    alpha = shape * (0.32 + 0.40 * coreSpot) * sin(vLifeRatio * 3.14159) * vBrightness;

  } else if (vType < 1.5) {
    // 2. Flowing Plume & Curling Tongues
    if (temp > 0.50) {
      color = mix(u_innerColor, u_bodyColor, (1.0 - temp) / 0.50);
    } else if (temp > 0.20) {
      color = mix(u_bodyColor, u_flameColor, (0.50 - temp) / 0.30);
    } else {
      color = mix(u_flameColor, u_smokeColor, (0.20 - temp) / 0.20);
    }
    alpha = shape * (0.24 + 0.30 * coreSpot) * pow(1.0 - vLifeRatio, 0.75) * vBrightness;

  } else {
    // 3. Glowing Embers & Sparks
    color = mix(u_bodyColor, u_coreColor, temp);
    alpha = shape * (0.60 + 0.40 * coreSpot) * (1.0 - vLifeRatio) * vBrightness;
  }

  // Photometric luminosity enhancement
  color += u_coreColor * (coreSpot * 0.45);
  color *= u_glowIntensity;

  // Additive / Premultiplied blending against pure black background
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

// ---------------------------------------------------------------------------
// Particle Simulation Types & Preset Configurations
// ---------------------------------------------------------------------------

export type FlamePreset = 'soft' | 'realistic' | 'expressive';

export interface PresetConfig {
  name: string;
  particleCount: number;
  buoyancy: number;
  curlFrequency: number;
  curlStrength: number;
  corePuffRatio: number;
  tendrilRatio: number;
  emberRatio: number;
  sizeScale: number;
  glowIntensity: number;
  cursorAirflow: number;
  cursorRepulsion: number;
  dragDamping: number;
}

export const PRESET_CONFIGS: Record<FlamePreset, PresetConfig> = {
  soft: {
    name: 'Soft Flame',
    particleCount: 12000,
    buoyancy: 1.4,
    curlFrequency: 0.9,
    curlStrength: 0.38,
    corePuffRatio: 0.65,
    tendrilRatio: 0.28,
    emberRatio: 0.07,
    sizeScale: 1.25,
    glowIntensity: 1.05,
    cursorAirflow: 0.25,
    cursorRepulsion: 0.35,
    dragDamping: 1.2,
  },
  realistic: {
    name: 'Realistic Flame (Default)',
    particleCount: 18000,
    buoyancy: 1.75,
    curlFrequency: 1.35,
    curlStrength: 0.58,
    corePuffRatio: 0.50,
    tendrilRatio: 0.40,
    emberRatio: 0.10,
    sizeScale: 1.0,
    glowIntensity: 1.22,
    cursorAirflow: 0.45,
    cursorRepulsion: 0.55,
    dragDamping: 1.0,
  },
  expressive: {
    name: 'Expressive Flame',
    particleCount: 22000,
    buoyancy: 2.1,
    curlFrequency: 1.75,
    curlStrength: 0.85,
    corePuffRatio: 0.40,
    tendrilRatio: 0.45,
    emberRatio: 0.15,
    sizeScale: 0.92,
    glowIntensity: 1.40,
    cursorAirflow: 0.70,
    cursorRepulsion: 0.80,
    dragDamping: 0.85,
  },
};

export interface ParticleFlameProps {
  preset?: FlamePreset;
  className?: string;
  interactive?: boolean;
  simulatedCursor?: { x: number; y: number; active: boolean } | null;
  customConfig?: Partial<PresetConfig>;
  onTelemetry?: (data: { fps: number; activeParticles: number; cursorVelocity: number }) => void;
}

export const ParticleFlame: React.FC<ParticleFlameProps> = ({
  preset = 'realistic',
  className = '',
  interactive = true,
  simulatedCursor = null,
  customConfig = {},
  onTelemetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeConfig = {
    ...PRESET_CONFIGS[preset],
    ...customConfig,
  };

  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Physics state ref (Zero React re-renders during high-frequency 60 FPS animation)
  const physicsRef = useRef({
    // Pointer positions in world simulation coordinates [-1.5 .. 1.5]
    mouseWorldX: 0,
    mouseWorldY: -2.0, // Start below flame
    prevMouseWorldX: 0,
    prevMouseWorldY: -2.0,
    mouseVelX: 0,
    mouseVelY: 0,
    isHovered: false,

    // Temporal metrics
    lastTime: 0,
    frameCount: 0,
    lastFpsTime: 0,
    fps: 60,
    isVisible: true,
    rafId: null as number | null,
  });

  // Handle pointer movement across viewport / hero
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || simulatedCursor?.active) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const p = physicsRef.current;

      // Convert DOM pixel coordinates to normalized simulation coordinates
      // Flame origin sits centered horizontally, base at y = -1.2, top at y = +1.6
      const relX = (e.clientX - (rect.left + rect.width * 0.5)) / (rect.height * 0.5);
      // Invert Y for WebGL: bottom is negative, top is positive
      const relY = -(e.clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.5);

      const now = performance.now();
      const dt = Math.max((now - p.lastTime) / 1000, 0.001);

      if (p.isHovered && p.lastTime > 0) {
        p.mouseVelX = (relX - p.prevMouseWorldX) / dt;
        p.mouseVelY = (relY - p.prevMouseWorldY) / dt;
      }

      p.prevMouseWorldX = p.mouseWorldX;
      p.prevMouseWorldY = p.mouseWorldY;
      p.mouseWorldX = relX;
      p.mouseWorldY = relY;
      p.isHovered = true;
      p.lastTime = now;
    },
    [interactive, simulatedCursor]
  );

  const handlePointerLeave = useCallback(() => {
    if (simulatedCursor?.active) return;
    const p = physicsRef.current;
    p.isHovered = false;
    p.mouseWorldY = -2.0;
    p.mouseVelX = 0;
    p.mouseVelY = 0;
  }, [simulatedCursor]);

  // Global window pointer listener so text and buttons do not block flame airflow tracking
  useEffect(() => {
    if (!interactive) return;

    const onGlobalPointerMove = (e: PointerEvent) => {
      if (simulatedCursor?.active) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX < rect.left - 80 ||
        clientX > rect.right + 80 ||
        clientY < rect.top - 80 ||
        clientY > rect.bottom + 80
      ) {
        physicsRef.current.isHovered = false;
        physicsRef.current.mouseWorldY = -2.0;
        return;
      }

      const p = physicsRef.current;
      const relX = (clientX - (rect.left + rect.width * 0.5)) / (rect.height * 0.5);
      const relY = -(clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.5);

      const now = performance.now();
      const dt = Math.max((now - p.lastTime) / 1000, 0.001);

      if (p.lastTime > 0) {
        p.mouseVelX = (relX - p.prevMouseWorldX) / dt;
        p.mouseVelY = (relY - p.prevMouseWorldY) / dt;
      }

      p.prevMouseWorldX = p.mouseWorldX;
      p.prevMouseWorldY = p.mouseWorldY;
      p.mouseWorldX = relX;
      p.mouseWorldY = relY;
      p.isHovered = true;
      p.lastTime = now;
    };

    window.addEventListener('pointermove', onGlobalPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onGlobalPointerMove);
  }, [interactive, simulatedCursor]);

  // Update simulated cursor target when scripted tour runs
  useEffect(() => {
    if (simulatedCursor) {
      const p = physicsRef.current;
      p.isHovered = simulatedCursor.active;
      // Convert normalized [0..1] flame coordinates to simulation units
      p.mouseWorldX = (simulatedCursor.x - 0.5) * 1.8;
      p.mouseWorldY = (simulatedCursor.y - 0.5) * 2.4;
      p.mouseVelX = simulatedCursor.active ? 0.35 : 0;
      p.mouseVelY = 0;
    }
  }, [simulatedCursor]);

  // Three.js Simulation Lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Detect device performance scale
    const isMobile = window.innerWidth < 768;
    const count = isMobile
      ? Math.floor(activeConfig.particleCount * 0.45)
      : activeConfig.particleCount;

    // 1. Initialize Three.js Scene & Orthographic Camera
    let renderer: THREE.WebGLRenderer;
    let geometry: THREE.BufferGeometry;
    let material: THREE.ShaderMaterial;
    let observer: IntersectionObserver;
    let handleResize: () => void;

    try {
      const scene = new THREE.Scene();
      const aspect = container.clientWidth / container.clientHeight;
      // World coordinates: Y spans [-1.5, 1.5]
      const viewHeight = 3.0;
      const viewWidth = viewHeight * aspect;

      const camera = new THREE.OrthographicCamera(
        -viewWidth / 2,
        viewWidth / 2,
        viewHeight / 2,
        -viewHeight / 2,
        0.1,
        100
      );
      camera.position.z = 10;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight, false);

      // 2. Allocate Typed Particle Buffers
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      const lives = new Float32Array(count * 2); // [currentAge, maxLife]
      const properties = new Float32Array(count * 4); // [type, baseSize, seed, brightness]

      // Particle spawning parameters
      const baseW = 0.28;
      const baseH = 0.18;
      const baseY = -1.25;

      // Helper to initialize or respawn a single particle
      const spawnParticle = (i: number, initialSpread = false) => {
        const i3 = i * 3;
        const i2 = i * 2;
        const i4 = i * 4;

        const rand = Math.random();
        let pType = 0; // 0 = core, 1 = tendril, 2 = ember
        let baseSize = 48.0;
        let maxLife = 1.6 + Math.random() * 0.8; // 1.6s - 2.4s

        if (rand < activeConfig.corePuffRatio) {
          pType = 0; // Dense inner incandescent core
          baseSize = 75.0 + Math.random() * 35.0; // Large overlapping soft puffs
          maxLife = 1.3 + Math.random() * 0.7;
        } else if (rand < activeConfig.corePuffRatio + activeConfig.tendrilRatio) {
          pType = 1; // Curling flowing tendril
          baseSize = 42.0 + Math.random() * 28.0;
          maxLife = 1.7 + Math.random() * 0.9;
        } else {
          pType = 2; // Sparkling ember
          baseSize = 10.0 + Math.random() * 10.0;
          maxLife = 1.9 + Math.random() * 1.1;
        }

        // Procedural narrow flame-base emission distribution
        const theta = Math.random() * Math.PI * 2.0;
        const radius = Math.sqrt(Math.random()) * baseW * (pType === 0 ? 0.65 : 1.0);
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius * 0.5;
        const y = baseY + (Math.random() - 0.5) * baseH;

        // If initial spread, distribute across natural flame height to prevent empty start
        const startAge = initialSpread ? Math.random() * maxLife : 0;
        const startY = initialSpread ? y + (startAge / maxLife) * 2.2 : y;

        positions[i3] = x;
        positions[i3 + 1] = startY;
        positions[i3 + 2] = z;

        // Initial convective velocity
        velocities[i3] = (Math.random() - 0.5) * 0.15;
        velocities[i3 + 1] = 0.85 + Math.random() * 0.6;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

        lives[i2] = startAge;
        lives[i2 + 1] = maxLife;

        properties[i4] = pType;
        properties[i4 + 1] = baseSize;
        properties[i4 + 2] = Math.random();
        properties[i4 + 3] = 0.85 + Math.random() * 0.3;
      };

      // Populate initial particle array
      for (let i = 0; i < count; i++) {
        spawnParticle(i, true);
      }

      // 3. Create GPU Geometry & Buffer Attributes
      geometry = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(positions, 3);
      const lifeAttr = new THREE.BufferAttribute(lives, 2);
      const propAttr = new THREE.BufferAttribute(properties, 4);

      geometry.setAttribute('position', posAttr);
      geometry.setAttribute('aLife', lifeAttr);
      geometry.setAttribute('aProperties', propAttr);

      // 4. Create Custom Photometric Flame ShaderMaterial
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_time: { value: 0.0 },
          u_resolution: {
            value: new THREE.Vector2(container.clientWidth, container.clientHeight),
          },
          u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          u_sizeScale: { value: activeConfig.sizeScale },
          u_glowIntensity: { value: activeConfig.glowIntensity },
          // Authentic Pink Flame Palette
          u_coreColor: { value: new THREE.Color('#FFF5FA') },   // Incandescent White-Pink
          u_innerColor: { value: new THREE.Color('#F0A5C8') },  // Baby Rose Pink
          u_bodyColor: { value: new THREE.Color('#FF2E93') },   // Vibrant Luminous Magenta
          u_flameColor: { value: new THREE.Color('#C20062') },  // Deep Crimson / Rose
          u_smokeColor: { value: new THREE.Color('#2A001E') },  // Smoky Violet Dissipation
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // 5. Handle Resize
      handleResize = () => {
        if (!containerRef.current || !renderer) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const newAspect = w / h;
        const newWidth = viewHeight * newAspect;

        camera.left = -newWidth / 2;
        camera.right = newWidth / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h, false);
        material.uniforms.u_resolution.value.set(w, h);
      };
      window.addEventListener('resize', handleResize);

      // 6. Visibility Observer to Auto-Pause Rendering
      observer = new IntersectionObserver(
        entries => {
          physicsRef.current.isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      observer.observe(container);

      // 7. High-Performance Particle Simulation Loop
      const tempCurl = new THREE.Vector3();
      let lastTime = performance.now();

      const animate = (time: number) => {
        physicsRef.current.rafId = requestAnimationFrame(animate);

        const p = physicsRef.current;
        if (!p.isVisible) return;

        const dt = Math.min((time - lastTime) / 1000, 0.04);
        lastTime = time;
        const simTime = time * 0.001;

        // Update shader uniforms
        material.uniforms.u_time.value = simTime;

        // Performance Telemetry calculation
        p.frameCount++;
        if (time - p.lastFpsTime >= 500) {
          p.fps = Math.round((p.frameCount * 1000) / (time - p.lastFpsTime));
          p.frameCount = 0;
          p.lastFpsTime = time;

          if (onTelemetry) {
            const curVel = Math.sqrt(p.mouseVelX * p.mouseVelX + p.mouseVelY * p.mouseVelY);
            onTelemetry({
              fps: p.fps,
              activeParticles: count,
              cursorVelocity: Math.min(curVel, 10.0),
            });
          }
        }

        // Airflow velocity natural decay
        p.mouseVelX *= Math.max(0.0, 1.0 - 5.0 * dt);
        p.mouseVelY *= Math.max(0.0, 1.0 - 5.0 * dt);

        // Simulation parameters from active config
        const buoyancy = activeConfig.buoyancy;
        const curlFreq = activeConfig.curlFrequency;
        const curlStr = activeConfig.curlStrength;
        const airflowStr = activeConfig.cursorAirflow;
        const repelStr = activeConfig.cursorRepulsion;
        const damping = activeConfig.dragDamping;

        const mouseX = p.mouseWorldX;
        const mouseY = p.mouseWorldY;
        const isInteracting = p.isHovered;

        // Update particle physics in typed arrays
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const i2 = i * 2;

          lives[i2] += dt;
          if (lives[i2] >= lives[i2 + 1]) {
            spawnParticle(i, false);
            continue;
          }

          const lifeRatio = lives[i2] / lives[i2 + 1];
          const px = positions[i3];
          const py = positions[i3 + 1];
          const pz = positions[i3 + 2];

          // 1. Buoyancy & Thermal Convection
          const temp = 1.0 - lifeRatio * 0.75;
          velocities[i3 + 1] += buoyancy * temp * dt;

          // 2. Chimney Inward Constriction at Base
          const heightFromBase = Math.max(0.0, py - baseY);
          if (heightFromBase < 0.6) {
            const pullInward = (1.0 - heightFromBase / 0.6) * 1.8;
            velocities[i3] -= px * pullInward * dt;
          }

          // 3. 3D Incompressible Divergence-Free Curl Noise
          const noiseScale = curlFreq;
          computeCurl(
            px * noiseScale,
            (py - simTime * 0.9) * noiseScale,
            pz * noiseScale,
            tempCurl
          );

          const heightWhip = Math.pow(Math.min(heightFromBase / 1.8, 1.0), 1.25);
          velocities[i3] += tempCurl.x * curlStr * heightWhip * dt;
          velocities[i3 + 1] += tempCurl.y * (curlStr * 0.4) * dt;
          velocities[i3 + 2] += tempCurl.z * curlStr * heightWhip * dt;

          // 4. Cursor Airflow Force Field
          if (isInteracting) {
            const dx = px - mouseX;
            const dy = py - mouseY;
            const distSq = dx * dx + dy * dy;

            // A) Bow Shock / Opening Repulsion
            const repelRadiusSq = 0.35 * 0.35;
            if (distSq < repelRadiusSq && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const repelFactor = (1.0 - dist / 0.35) * repelStr * heightWhip;
              velocities[i3] += (dx / dist) * repelFactor * dt * 4.5;
              velocities[i3 + 1] += (dy / dist) * repelFactor * dt * 3.0;
            }

            // B) Aerodynamic Draft & Velocity Wake
            const dragRadiusSq = 0.75 * 0.75;
            if (distSq < dragRadiusSq) {
              const dragFactor = (1.0 - Math.sqrt(distSq) / 0.75) * airflowStr * heightWhip;
              velocities[i3] += p.mouseVelX * dragFactor * dt * 2.2;
              velocities[i3 + 1] += p.mouseVelY * dragFactor * dt * 1.5;
            }
          }

          // 5. Viscous Fluid Drag & Position Integration
          velocities[i3] *= Math.max(0.0, 1.0 - damping * 1.8 * dt);
          velocities[i3 + 1] *= Math.max(0.0, 1.0 - damping * 0.7 * dt);
          velocities[i3 + 2] *= Math.max(0.0, 1.0 - damping * 1.8 * dt);

          positions[i3] += velocities[i3] * dt;
          positions[i3 + 1] += velocities[i3 + 1] * dt;
          positions[i3 + 2] += velocities[i3 + 2] * dt;
        }

        // Mark buffer attributes for GPU upload
        posAttr.needsUpdate = true;
        lifeAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      physicsRef.current.rafId = requestAnimationFrame(animate);

      return () => {
        if (physicsRef.current.rafId) {
          cancelAnimationFrame(physicsRef.current.rafId);
        }
        if (handleResize) window.removeEventListener('resize', handleResize);
        if (observer) observer.disconnect();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (renderer) renderer.dispose();
      };
    } catch {
      setWebglSupported(false);
    }
  }, [preset, activeConfig, onTelemetry, reducedMotion]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      {/* Underlying pure black background */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Atmospheric deep rose ambient bloom centered with flame */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[540px] h-[340px] md:h-[540px] rounded-full bg-accent/[0.04] blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* GPU WebGL Particle Canvas or Graceful Fallback */}
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center p-6 bg-surface/90 border border-border/80 rounded-xl max-w-sm pointer-events-auto shadow-2xl">
            <span className="text-accent text-xs font-mono block mb-1">
              WebGL Hardware Acceleration Disabled
            </span>
            <p className="text-muted text-xs leading-relaxed">
              Your browser session currently has hardware graphics acceleration disabled. Enable WebGL in browser settings to run this GPU simulation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
