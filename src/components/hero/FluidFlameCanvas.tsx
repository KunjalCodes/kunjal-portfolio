import React, { useEffect, useRef } from 'react';

/**
 * FluidFlameCanvas
 * Renders the flame video as a WebGL texture on a full-bleed canvas so there is
 * never a visible video rectangle:
 *  - luminance key removes the video's (compressed, not-quite-black) background
 *  - noise-perturbed edge falloff dissolves any flame tongues cut off by the frame
 *  - cursor drags / curls / leans the flame
 *  - hovering low in the hero "feeds" the fire: taller, brighter, hotter base glow
 */

interface FluidFlameCanvasProps {
  src: string;
  poster?: string;
  /** Video height as a fraction of the canvas height (matches old 75vh / 88vh layout). */
  heightFraction?: number;
  opacity?: number;
  reducedMotion?: boolean;
  onUnsupported?: () => void;
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
uniform float uHover;     // 0..1 cursor is over the hero
uniform float uBoost;     // 0..1 cursor is low in the hero -> feed the fire
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

  // Flame grows upward (and a touch wider) when fed.
  vec2 size = uVidSize * vec2(1.0 + 0.08 * uBoost, 1.0 + 0.24 * uBoost);
  vec2 uv = vec2((p.x - uAnchor.x) / size.x + 0.5, (p.y - uAnchor.y) / size.y);

  // --- cursor interaction ----------------------------------------------------
  vec2 d = p - uMouse;
  float r = 0.24 * uRes.y;
  float fall = exp(-dot(d, d) / (r * r)) * uHover;

  // flame is dragged along with the cursor's motion
  vec2 drag = -uVel * fall * 7.0;
  // gentle curl around the cursor
  vec2 swirl = vec2(-d.y, d.x) / r * fall * (10.0 + 14.0 * length(uVel) / 20.0);
  uv += (drag + swirl) / size;

  // tips lean toward the cursor (bottom stays rooted)
  float lean = clamp((uMouse.x - uAnchor.x) / (0.5 * uRes.x), -1.0, 1.0) * uHover;
  uv.x -= lean * 0.10 * uv.y * uv.y;

  // --- heat shimmer (always on, stronger toward the tips and when fed) ------
  float speed = 1.0 + 0.8 * uBoost;
  vec2 n = vec2(
    fbm(vec3(uv * vec2(3.0, 5.0) - vec2(0.0, t * 1.1 * speed), t * 0.25)),
    fbm(vec3(uv * vec2(3.0, 5.0) + vec2(5.2, -t * 1.3 * speed), t * 0.25 + 3.7))
  ) - 0.5;
  uv += n * (0.010 + 0.018 * uBoost + 0.02 * fall) * (0.35 + uv.y);

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

  // feed the fire: brighter, whiter-hot core
  float heat = 1.0 + 0.40 * uBoost + 0.25 * fall;
  vec3 col = f.rgb * heat;
  float core = smoothstep(0.55, 1.0, f.a * max(f.r, max(f.g, f.b)));
  col = mix(col, vec3(1.0, 0.86, 0.93) * f.a * 1.2, core * (0.12 + 0.22 * uBoost));
  col += g.rgb * (0.22 + 0.30 * uBoost);

  float alpha = clamp(f.a + g.a * (0.22 + 0.30 * uBoost), 0.0, 1.0) * mask;
  col *= mask;

  // soft pink ember glow pooling at the flame's base (grows when fed)
  vec2 bq = (p - uAnchor) / vec2(0.45 * size.x, 0.22 * uRes.y);
  float base = exp(-dot(bq, bq)) * (0.06 + 0.28 * uBoost);
  vec3 baseCol = vec3(1.0, 0.35, 0.62) * base;

  col = col * uOpacity + baseCol;
  alpha = clamp(alpha * uOpacity + base, 0.0, 1.0);
  outColor = vec4(col, alpha); // premultiplied
}
`;

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

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const FluidFlameCanvas: React.FC<FluidFlameCanvasProps> = ({
  src,
  poster,
  heightFraction = 0.88,
  opacity = 0.82,
  reducedMotion = false,
  onUnsupported,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link failed');
    } catch (err) {
      console.warn('[FluidFlameCanvas] falling back:', err);
      onUnsupported?.();
      return;
    }
    gl.useProgram(program);

    // fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    const U = (n: string) => gl.getUniformLocation(program, n);
    const u = {
      res: U('uRes'), vidSize: U('uVidSize'), anchor: U('uAnchor'), mouse: U('uMouse'), vel: U('uVel'),
      hover: U('uHover'), boost: U('uBoost'), time: U('uTime'), opacity: U('uOpacity'),
    };
    gl.uniform1i(U('uVideo'), 0);
    gl.uniform1f(u.opacity, opacity);

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
    const pointer = { x: -1e4, y: -1e4, inside: false, seen: false };
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

    // smoothed values
    const s = { mx: 0, my: 0, vx: 0, vy: 0, hover: 0, boost: 0, lastMx: 0, lastMy: 0, init: false };

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

    const frame = () => {
      if (!onScreen || document.hidden) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);

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

      if (!s.init) { s.mx = s.lastMx = px; s.my = s.lastMy = py; s.init = true; }
      if (inside) {
        s.mx = lerp(s.mx, px, 0.25);
        s.my = lerp(s.my, py, 0.25);
      }
      const rvx = s.mx - s.lastMx;
      const rvy = s.my - s.lastMy;
      s.lastMx = s.mx;
      s.lastMy = s.my;
      const scale = 1 / dpr;
      s.vx = lerp(s.vx, Math.max(-40, Math.min(40, rvx * scale)), 0.18);
      s.vy = lerp(s.vy, Math.max(-40, Math.min(40, rvy * scale)), 0.18);
      s.hover = lerp(s.hover, inside ? 1 : 0, 0.06);

      // boost: cursor in the lower part of the hero, near the flame horizontally
      let boostTarget = 0;
      if (inside) {
        const fromBottom = py / H; // 0 at bottom
        const vertical = 1 - Math.min(1, Math.max(0, (fromBottom - 0.1) / 0.35));
        const dx = Math.abs(px - anchorX) / Math.max(vw, W * 0.25);
        const horizontal = 1 - Math.min(1, Math.max(0, (dx - 0.6) / 0.9));
        boostTarget = vertical * horizontal;
      }
      // rise a bit faster than it dies down, like a real fire
      s.boost = lerp(s.boost, boostTarget, boostTarget > s.boost ? 0.045 : 0.025);

      gl.viewport(0, 0, W, H);
      gl.uniform2f(u.res, W, H);
      gl.uniform2f(u.vidSize, vw, vh);
      gl.uniform2f(u.anchor, anchorX, anchorY);
      gl.uniform2f(u.mouse, s.mx, s.my);
      gl.uniform2f(u.vel, s.vx * dpr, s.vy * dpr);
      gl.uniform1f(u.hover, s.hover);
      gl.uniform1f(u.boost, s.boost);
      gl.uniform1f(u.time, reducedMotion ? 0 : (performance.now() - t0) / 1000);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // reduced motion: draw once the real frame is in, then stop
      if (reducedMotion && hasFrame) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };

    function start() {
      if (running) return;
      running = true;
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
      gl.deleteProgram(program);
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
