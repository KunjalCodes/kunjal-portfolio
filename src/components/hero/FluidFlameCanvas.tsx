import React, { useEffect, useRef } from 'react';

/**
 * FluidFlameCanvas
 * Renders the flame video as a WebGL texture on a full-bleed canvas so there is
 * never a visible video rectangle:
 *  - luminance key removes the video's (compressed, not-quite-black) background
 *  - noise-perturbed edge falloff dissolves any flame tongues cut off by the frame
 *
 * Interaction:
 *  - WIND: cursor motion near the flame blows it; a spring makes it sway back with a wobble
 *  - GUTTER: a fast swipe through the flame makes it shrink & sputter, then flare back up
 *  - EMBERS: fast swipes throw sparks; the base sheds embers (a lot more when fed)
 *  - FEED: hovering low in the hero makes the fire roar — much taller, wider, rumbling
 *  - LIGHT: reports a flicker-synced glow value so the page can light text with it
 */

export interface FlameLight {
  /** 0..1 how brightly the fire is burning right now (flickers). */
  glow: number;
  /** -1..1 which way the wind is bending the flame. */
  lean: number;
}

interface FluidFlameCanvasProps {
  src: string;
  poster?: string;
  /** Video height as a fraction of the canvas height (matches old 75vh / 88vh layout). */
  heightFraction?: number;
  opacity?: number;
  reducedMotion?: boolean;
  onUnsupported?: () => void;
  onLight?: (light: FlameLight) => void;
}

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uVideo;
uniform vec2  uRes;       // canvas size, px
uniform vec2  uVidSize;   // base video rect size, px
uniform vec2  uAnchor;    // bottom-center of the flame, px (GL coords, y up)
uniform vec2  uMouse;     // px (GL coords)
uniform vec2  uVel;       // smoothed cursor velocity, px/frame
uniform vec2  uWind;      // spring-driven wind displacement at the tips, px
uniform float uHover;     // 0..1 cursor is over the hero
uniform float uBoost;     // 0..1 cursor is low in the hero -> feed the fire
uniform float uGutter;    // 0..1 flame knocked down by a fast swipe
uniform float uFlare;     // 0..1 flare-up while recovering from a gutter
uniform float uTime;
uniform float uOpacity;

out vec4 outColor;

// --- value noise / fbm -----------------------------------------------------
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Keyed flame sample: rgb premultiplied by key alpha.
vec4 flame(vec2 uv) {
  vec3 c = texture(uVideo, vec2(uv.x, 1.0 - uv.y)).rgb;
  float l = max(c.r, max(c.g, c.b));
  float a = smoothstep(0.075, 0.33, l);
  return vec4(c * a, a);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float t = uTime;

  // Feeding makes it roar: much taller, wider, with a low rumble.
  float rumble = uBoost * (0.5 + 0.5 * sin(t * 5.3) * sin(t * 2.1 + 1.3)) * 0.05;
  vec2 grow = vec2(
    1.0 + 0.22 * uBoost + 0.05 * uFlare,
    1.0 + 0.48 * uBoost + rumble - 0.20 * uGutter + 0.16 * uFlare
  );
  vec2 size = uVidSize * grow;
  vec2 uv = vec2((p.x - uAnchor.x) / size.x + 0.5, (p.y - uAnchor.y) / size.y);

  // --- wind: base stays rooted, tips bend the most ---------------------------
  float yb = clamp(uv.y, 0.0, 1.3);
  float bend = pow(yb, 1.6);
  uv.x -= (uWind.x / size.x) * bend;
  uv.y -= (uWind.y / size.y) * 0.35 * yb;

  // --- local cursor interaction ---------------------------------------------
  vec2 d = p - uMouse;
  float r = 0.22 * uRes.y;
  float fall = exp(-dot(d, d) / (r * r)) * uHover;
  vec2 drag = -uVel * fall * 3.0;
  vec2 swirl = vec2(-d.y, d.x) / r * fall * (5.0 + 7.0 * length(uVel) / 20.0);
  uv += (drag + swirl) / size;

  // tips lean slightly toward a resting cursor
  float lean = clamp((uMouse.x - uAnchor.x) / (0.5 * uRes.x), -1.0, 1.0) * uHover;
  uv.x -= lean * 0.04 * uv.y * uv.y;

  // --- heat shimmer: stronger toward the tips, when fed, and in wind ---------
  float windAmt = clamp(length(uWind) / 80.0, 0.0, 1.0);
  float speed = 1.0 + 0.9 * uBoost + 0.8 * uGutter;
  vec2 n = vec2(
    fbm(vec3(uv * vec2(3.0, 5.0) - vec2(0.0, t * 1.1 * speed), t * 0.25)),
    fbm(vec3(uv * vec2(3.0, 5.0) + vec2(5.2, -t * 1.3 * speed), t * 0.25 + 3.7))
  ) - 0.5;
  uv += n * (0.010 + 0.020 * uBoost + 0.02 * fall + 0.015 * windAmt + 0.03 * uGutter) * (0.35 + uv.y);

  // --- organic edge dissolve (kills any frame boundary) ----------------------
  float e = fbm(vec3(uv * vec2(3.0, 4.0) + vec2(0.0, -t * 0.4), t * 0.15));
  float sideW = 0.16 + 0.12 * e;
  float mask =
      smoothstep(0.0, sideW, uv.x) *
      smoothstep(0.0, sideW, 1.0 - uv.x) *
      smoothstep(0.0, 0.10 + 0.06 * e, uv.y) *
      smoothstep(0.0, 0.16 + 0.14 * e, 1.0 - uv.y);

  vec4 f = flame(uv);

  // cheap bloom: ring of wider samples
  vec4 g = vec4(0.0);
  float br = 0.022 + 0.02 * uBoost;
  for (int i = 0; i < 6; i++) {
    float ang = float(i) * 1.0471976 + 0.5;
    g += flame(uv + vec2(cos(ang), sin(ang)) * br * vec2(1.0, size.x / size.y));
  }
  g /= 6.0;

  // brightness: fed / flaring burns hotter; guttering sputters
  float sputter = 1.0 - uGutter * (0.35 + 0.25 * noise(vec3(t * 18.0, 0.0, 0.0)));
  float heat = (1.0 + 0.40 * uBoost + 0.25 * fall + 0.35 * uFlare) * sputter;
  vec3 col = f.rgb * heat;
  float core = smoothstep(0.55, 1.0, f.a * max(f.r, max(f.g, f.b)));
  col = mix(col, vec3(1.0, 0.86, 0.93) * f.a * 1.2, core * (0.12 + 0.22 * uBoost + 0.2 * uFlare));
  col += g.rgb * (0.22 + 0.32 * uBoost + 0.3 * uFlare);

  float alpha = clamp(f.a + g.a * (0.22 + 0.32 * uBoost), 0.0, 1.0) * mask * sputter;
  col *= mask;

  // pink ember bed pooling at the base — spreads wide when fed
  vec2 bq = (p - uAnchor) / vec2(0.45 * size.x * (1.0 + 0.7 * uBoost), 0.20 * uRes.y * (1.0 + 0.9 * uBoost));
  float base = exp(-dot(bq, bq)) * (0.06 + 0.40 * uBoost + 0.1 * uFlare) * (0.9 + 0.1 * sin(t * 9.0));
  vec3 baseCol = vec3(1.0, 0.35, 0.62) * base;

  col = col * uOpacity + baseCol;
  alpha = clamp(alpha * uOpacity + base, 0.0, 1.0);
  outColor = vec4(col, alpha); // premultiplied
}
`;

// --- embers ------------------------------------------------------------------
const EMBER_VERT = `#version 300 es
in vec2 aP;
in float aSize;
in vec4 aCol;
uniform vec2 uRes;
out vec4 vCol;
void main() {
  gl_Position = vec4(aP / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = aSize;
  vCol = aCol;
}
`;

const EMBER_FRAG = `#version 300 es
precision mediump float;
in vec4 vCol;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  float a = exp(-d * 3.5) * vCol.a;
  o = vec4(vCol.rgb * a, a);
}
`;

const MAX_EMBERS = 450;
const EMBER_STRIDE = 7; // x, y, size, r, g, b, a

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log || 'shader compile failed');
  }
  return s;
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
  return prog;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const FluidFlameCanvas: React.FC<FluidFlameCanvasProps> = ({
  src,
  poster,
  heightFraction = 0.88,
  opacity = 0.82,
  reducedMotion = false,
  onUnsupported,
  onLight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onLightRef = useRef(onLight);
  onLightRef.current = onLight;

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) {
      onUnsupported?.();
      return;
    }

    let program: WebGLProgram;
    let emberProgram: WebGLProgram;
    try {
      program = link(gl, VERT, FRAG);
      emberProgram = link(gl, EMBER_VERT, EMBER_FRAG);
    } catch (err) {
      console.warn('[FluidFlameCanvas] falling back:', err);
      onUnsupported?.();
      return;
    }

    // --- flame pass: fullscreen triangle ---------------------------------------
    const flameVao = gl.createVertexArray();
    gl.bindVertexArray(flameVao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // --- ember pass: dynamic point buffer -------------------------------------
    const emberVao = gl.createVertexArray();
    gl.bindVertexArray(emberVao);
    const emberData = new Float32Array(MAX_EMBERS * EMBER_STRIDE);
    const emberBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, emberBuf);
    gl.bufferData(gl.ARRAY_BUFFER, emberData.byteLength, gl.DYNAMIC_DRAW);
    const F = 4;
    const eAttr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(emberProgram, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, EMBER_STRIDE * F, offset * F);
    };
    eAttr('aP', 2, 0);
    eAttr('aSize', 1, 2);
    eAttr('aCol', 4, 3);
    gl.bindVertexArray(null);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    gl.useProgram(program);
    const U = (n: string) => gl.getUniformLocation(program, n);
    const u = {
      res: U('uRes'), vidSize: U('uVidSize'), anchor: U('uAnchor'), mouse: U('uMouse'), vel: U('uVel'),
      wind: U('uWind'), hover: U('uHover'), boost: U('uBoost'), gutter: U('uGutter'), flare: U('uFlare'),
      time: U('uTime'), opacity: U('uOpacity'),
    };
    gl.uniform1i(U('uVideo'), 0);
    gl.uniform1f(u.opacity, opacity);
    const uEmberRes = gl.getUniformLocation(emberProgram, 'uRes');

    // Video aspect (w/h); updated once metadata is known.
    let aspect = 9 / 16;
    let hasFrame = false;
    let disposed = false;

    // Poster as the first texture so something shows before video decodes.
    if (poster) {
      const img = new Image();
      img.onload = () => {
        if (hasFrame || disposed) return;
        aspect = img.naturalWidth / img.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      };
      img.src = poster;
    }
    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) aspect = video.videoWidth / video.videoHeight;
    };
    video.addEventListener('loadedmetadata', onMeta);
    onMeta();

    // --- sizing ---------------------------------------------------------------
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // --- pointer state (listen on window: the hero bg is pointer-events:none) --
    const pointer = { x: -1e4, y: -1e4, seen: false };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.seen = true;
    };
    const onLeave = () => { pointer.seen = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    // smoothed / simulated state (wind in CSS px)
    const s = {
      mx: 0, my: 0, vx: 0, vy: 0, lastMx: 0, lastMy: 0, init: false,
      hover: 0, boost: 0,
      windX: 0, windY: 0, windVX: 0, windVY: 0,
      gutter: 0, flare: 0,
      near: 0, glow: 0.15,
      emberAcc: 0,
      trailAcc: 0,
    };

    // ember pool (canvas px, GL y-up)
    const E = {
      x: new Float32Array(MAX_EMBERS), y: new Float32Array(MAX_EMBERS),
      vx: new Float32Array(MAX_EMBERS), vy: new Float32Array(MAX_EMBERS),
      life: new Float32Array(MAX_EMBERS), max: new Float32Array(MAX_EMBERS),
      size: new Float32Array(MAX_EMBERS), seed: new Float32Array(MAX_EMBERS),
      trail: new Uint8Array(MAX_EMBERS), // 1 = cursor-trail dot (pink, floaty)
    };
    let emberCursor = 0;
    const spawn = (x: number, y: number, vx: number, vy: number, life: number, size: number, trail = 0) => {
      const i = emberCursor;
      emberCursor = (emberCursor + 1) % MAX_EMBERS;
      E.x[i] = x; E.y[i] = y; E.vx[i] = vx; E.vy[i] = vy;
      E.life[i] = life; E.max[i] = life; E.size[i] = size; E.seed[i] = Math.random() * 100;
      E.trail[i] = trail;
    };

    // --- visibility: only render when on screen and tab visible --------------
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
    });
    io.observe(canvas);
    const onVis = () => { if (!document.hidden) start(); };
    document.addEventListener('visibilitychange', onVis);

    let raf = 0;
    let running = false;
    const t0 = performance.now();
    let lastT = t0;

    const frame = () => {
      if (!onScreen || document.hidden) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);

      const now = performance.now();
      // normalise to 60fps "frames" so behaviour is the same on 120Hz screens
      const dt = clamp((now - lastT) / 16.667, 0.25, 3);
      lastT = now;
      const time = (now - t0) / 1000;

      const W = canvas.width;
      const H = canvas.height;
      const rect = canvas.getBoundingClientRect();

      // video texture upload
      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        hasFrame = true;
      }

      // layout: same footprint as the old <video> (centered, heightFraction of hero)
      let vh = H * heightFraction;
      let vw = vh * aspect;
      const maxW = W * 0.9;
      if (vw > maxW) { vw = maxW; vh = vw / aspect; }
      const anchorX = W / 2;
      const anchorY = (H - vh) / 2; // bottom edge of the flame, GL y-up

      // pointer -> canvas px (GL coords)
      const px = (pointer.x - rect.left) * dpr;
      const py = (rect.bottom - pointer.y) * dpr;
      const inside = pointer.seen && px >= 0 && px <= W && py >= 0 && py <= H && !reducedMotion;

      // snap (no smoothing) the first time the pointer is actually over the hero,
      // otherwise it would sweep in from the off-screen placeholder position
      if (inside && !s.init) { s.mx = s.lastMx = px; s.my = s.lastMy = py; s.init = true; }
      if (!pointer.seen) s.init = false;
      if (inside) {
        s.mx = lerp(s.mx, px, 0.2);
        s.my = lerp(s.my, py, 0.2);
      }
      const prevMx = s.lastMx;
      const prevMy = s.lastMy;
      const rvx = (s.mx - s.lastMx) / dpr / dt;
      const rvy = (s.my - s.lastMy) / dpr / dt;
      s.lastMx = s.mx;
      s.lastMy = s.my;
      s.vx = lerp(s.vx, clamp(rvx, -60, 60), 0.15);
      s.vy = lerp(s.vy, clamp(rvy, -60, 60), 0.15);
      s.hover = lerp(s.hover, inside ? 1 : 0, 0.06);
      const speed = Math.hypot(s.vx, s.vy); // CSS px / frame

      // how close the cursor is to the flame body (0..1)
      const fdx = (s.mx - anchorX) / (vw * 0.75);
      const fdy = (s.my - (anchorY + vh * 0.5)) / (vh * 0.65);
      const proximity = inside ? Math.exp(-(fdx * fdx + fdy * fdy)) : 0;

      // --- WIND: cursor motion pushes a damped spring (sways back with wobble) ---
      const push = proximity * 0.28;
      s.windVX += (s.vx * push - 0.035 * s.windX - 0.09 * s.windVX) * dt;
      s.windVY += (s.vy * push * 0.4 - 0.035 * s.windY - 0.09 * s.windVY) * dt;
      s.windX = clamp(s.windX + s.windVX * dt, -90, 90);
      s.windY = clamp(s.windY + s.windVY * dt, -45, 45);

      // --- GUTTER: a fast swipe through the core knocks it down, then it flares ---
      const prevGutter = s.gutter;
      const gutterTarget = clamp((speed * proximity - 28) / 26, 0, 1);
      s.gutter = lerp(s.gutter, gutterTarget, (gutterTarget > s.gutter ? 0.3 : 0.035) * dt);
      s.flare = clamp(s.flare * Math.pow(0.965, dt) + Math.max(0, prevGutter - s.gutter) * 2.4, 0, 1);

      // --- FEED: cursor low in the hero near the flame ---------------------------
      let boostTarget = 0;
      if (inside) {
        const fromBottom = py / H; // 0 at bottom
        const vertical = 1 - clamp((fromBottom - 0.1) / 0.35, 0, 1);
        const dx = Math.abs(px - anchorX) / Math.max(vw, W * 0.25);
        const horizontal = 1 - clamp((dx - 0.6) / 0.9, 0, 1);
        boostTarget = vertical * horizontal;
      }
      // rise a bit faster than it dies down, like a real fire
      s.boost = lerp(s.boost, boostTarget, (boostTarget > s.boost ? 0.045 : 0.022) * dt);

      // --- EMBERS -----------------------------------------------------------------
      if (!reducedMotion) {
        // swipe sparks
        if (speed > 12 && proximity > 0.25) {
          const n = Math.min(4, Math.floor((speed - 10) / 7) + 1);
          for (let k = 0; k < n; k++) {
            spawn(
              s.mx + (Math.random() - 0.5) * 24 * dpr,
              s.my + (Math.random() - 0.5) * 24 * dpr,
              (s.vx * 0.45 + (Math.random() - 0.5) * 3) * dpr,
              (s.vy * 0.45 + 1 + Math.random() * 2.5) * dpr,
              40 + Math.random() * 50,
              (2.2 + Math.random() * 3) * dpr,
            );
          }
        }
        // pink dotted trail following the cursor through empty space
        if (inside && proximity < 0.85) {
          const segX = s.mx - prevMx;
          const segY = s.my - prevMy;
          const segLen = Math.hypot(segX, segY) / dpr; // CSS px moved this frame
          const fadeNearFlame = 1 - clamp((proximity - 0.45) / 0.4, 0, 1);
          s.trailAcc = Math.min(s.trailAcc + segLen * fadeNearFlame, 9 * 6);
          let placed = 0;
          const SPACING = 9; // CSS px between dots
          while (s.trailAcc >= SPACING && placed < 8) {
            s.trailAcc -= SPACING;
            const k = segLen > 0 ? 1 - (s.trailAcc / Math.max(segLen, 1e-3)) : 1;
            spawn(
              prevMx + segX * clamp(k, 0, 1) + (Math.random() - 0.5) * 3 * dpr,
              prevMy + segY * clamp(k, 0, 1) + (Math.random() - 0.5) * 3 * dpr,
              (Math.random() - 0.5) * 0.4 * dpr,
              (0.15 + Math.random() * 0.35) * dpr,
              45 + Math.random() * 25,
              (3.2 + Math.random() * 1.8) * dpr,
              1,
            );
            placed++;
          }
        } else {
          s.trailAcc = 0;
        }

        // the bed sheds embers; a lot more when fed, a burst when flaring
        s.emberAcc += (0.12 + s.boost * 2.2 + s.flare * 2.5) * dt;
        while (s.emberAcc >= 1) {
          s.emberAcc -= 1;
          const spread = vw * (0.28 + 0.3 * s.boost);
          spawn(
            anchorX + (Math.random() - 0.5) * spread,
            anchorY + vh * (0.04 + Math.random() * 0.25),
            (Math.random() - 0.5) * 1.2 * dpr,
            (0.8 + Math.random() * (1.8 + 2.5 * s.boost)) * dpr,
            70 + Math.random() * 110,
            (1.8 + Math.random() * (2.5 + 1.5 * s.boost)) * dpr,
          );
        }
      }

      let emberCount = 0;
      const windForce = (s.windVX * 0.03 + s.windX * 0.0015) * dpr;
      for (let i = 0; i < MAX_EMBERS; i++) {
        if (E.life[i] <= 0) continue;
        E.life[i] -= dt;
        if (E.life[i] <= 0) continue;
        const sd = E.seed[i];
        const isTrail = E.trail[i] === 1;
        E.vx[i] += (Math.sin(sd + time * 3.1) * (isTrail ? 0.015 : 0.06) * dpr + (isTrail ? 0 : windForce)) * dt;
        E.vy[i] += (isTrail ? 0.006 : 0.035) * dpr * dt; // buoyancy
        const damp = Math.pow(0.982, dt);
        E.vx[i] *= damp;
        E.vy[i] *= damp;
        E.x[i] += E.vx[i] * dt;
        E.y[i] += E.vy[i] * dt;

        const lifeT = E.life[i] / E.max[i]; // 1 -> 0
        const fadeIn = clamp((1 - lifeT) * 8, 0, 1);
        const twinkle = 0.75 + 0.25 * Math.sin(sd * 7 + time * 14);
        // white-hot -> pink -> deep rose
        // embers: white-hot -> pink -> deep rose; trail dots: soft accent pink
        const r = 1;
        const g = isTrail ? 0.42 + 0.2 * lifeT : 0.25 + 0.65 * lifeT * lifeT;
        const b = isTrail ? 0.7 + 0.1 * lifeT : 0.5 + 0.4 * lifeT;
        const o = emberCount * EMBER_STRIDE;
        emberData[o] = E.x[i];
        emberData[o + 1] = E.y[i];
        emberData[o + 2] = E.size[i] * (0.5 + 0.5 * lifeT);
        emberData[o + 3] = r;
        emberData[o + 4] = g;
        emberData[o + 5] = b;
        emberData[o + 6] = isTrail
          ? fadeIn * Math.min(1, lifeT * 1.6)
          : fadeIn * Math.min(1, lifeT * 2.5) * twinkle * 0.9;
        emberCount++;
      }

      // --- draw flame -----------------------------------------------------------
      gl.viewport(0, 0, W, H);
      gl.disable(gl.BLEND);
      gl.useProgram(program);
      gl.bindVertexArray(flameVao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform2f(u.res, W, H);
      gl.uniform2f(u.vidSize, vw, vh);
      gl.uniform2f(u.anchor, anchorX, anchorY);
      gl.uniform2f(u.mouse, s.mx, s.my);
      gl.uniform2f(u.vel, s.vx * dpr, s.vy * dpr);
      gl.uniform2f(u.wind, s.windX * dpr, s.windY * dpr);
      gl.uniform1f(u.hover, s.hover);
      gl.uniform1f(u.boost, s.boost);
      gl.uniform1f(u.gutter, s.gutter);
      gl.uniform1f(u.flare, s.flare);
      gl.uniform1f(u.time, reducedMotion ? 0 : time);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // --- draw embers (additive) ------------------------------------------------
      if (emberCount > 0) {
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(emberProgram);
        gl.uniform2f(uEmberRes, W, H);
        gl.bindVertexArray(emberVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, emberBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, emberData, 0, emberCount * EMBER_STRIDE);
        gl.drawArrays(gl.POINTS, 0, emberCount);
      }
      gl.bindVertexArray(null);

      // --- LIGHT: tell the page how bright the fire is ----------------------------
      if (onLightRef.current) {
        // how close the cursor is to the flame body (eased so the glow breathes, not jitters)
        s.near = lerp(s.near, proximity, (proximity > s.near ? 0.12 : 0.05) * dt);
        const intensity = 0.55 * s.near + 0.5 * s.boost + 0.35 * s.flare - 0.25 * s.gutter;
        const flicker = reducedMotion
          ? 0
          : (0.05 + 0.10 * Math.min(1, intensity)) *
            (Math.sin(time * 11.0) * Math.sin(time * 7.3 + 1.0) + 0.4 * Math.sin(time * 23.0));
        const target = clamp(0.12 + intensity + flicker, 0, 1);
        s.glow = lerp(s.glow, target, 0.25 * dt);
        onLightRef.current({
          glow: s.glow,
          lean: clamp(s.windX / 70, -1, 1),
        });
      }

      // reduced motion: draw once the real frame is in, then stop
      if (reducedMotion && hasFrame) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };

    function start() {
      if (running) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }

    if (reducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => { /* muted autoplay blocked: poster stays */ });
    }
    video.addEventListener('loadeddata', start);
    start();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      running = false;
      ro.disconnect();
      io.disconnect();
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', start);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteBuffer(emberBuf);
      gl.deleteVertexArray(flameVao);
      gl.deleteVertexArray(emberVao);
      gl.deleteProgram(program);
      gl.deleteProgram(emberProgram);
    };
  }, [src, poster, heightFraction, opacity, reducedMotion, onUnsupported]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />
      {/* Decoding source only — never shown directly, so no rectangle can appear. */}
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        autoPlay={!reducedMotion}
        preload="auto"
        className="absolute w-px h-px opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
};
