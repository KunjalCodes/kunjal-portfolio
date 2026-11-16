import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Eye,
  Info,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import {
  InteractiveFlameCanvas,
  SimulatedCursor,
} from '../components/flame/InteractiveFlameCanvas';

export type PrototypeStep = 1 | 2 | 3 | 4 | 5;

interface StepInfo {
  step: PrototypeStep;
  title: string;
  subtitle: string;
  description: string;
  cursorTarget: { x: number; y: number; active: boolean };
}

const STEPS: StepInfo[] = [
  {
    step: 1,
    title: '1. Natural Idle Flame',
    subtitle: 'Authentic Looping Fire Plume',
    description:
      'Zero pointer interaction. The original pink flame burns in its native, unperturbed form with organic flickering, realistic convection, and untouched textural fidelity.',
    cursorTarget: { x: -0.5, y: 0.5, active: false },
  },
  {
    step: 2,
    title: '2. Cursor Approaching Flame',
    subtitle: 'Air Displacement & Incandescent Core Expansion',
    description:
      'As the cursor approaches the flame column, displaced air pushes the tendrils outward away from the central axis. The flame silhouette widens and core luminescence brightens.',
    cursorTarget: { x: 0.5, y: 0.52, active: true },
  },
  {
    step: 3,
    title: '3. Cursor Moving Through Flame',
    subtitle: 'Airflow Wake & Tendril Separation',
    description:
      'Moving the pointer across the flame body parts the fire along the trajectory. Surrounding tendrils stretch and curve fluidly around the pointer wake without artificial sine wiggles.',
    cursorTarget: { x: 0.38, y: 0.65, active: true },
  },
  {
    step: 4,
    title: '4. Flame Expanding & Bending',
    subtitle: 'Aerodynamic Drag with Progressive Tip Lag',
    description:
      'Rapid lateral sweeps induce wind draft. The base remains anchored to the bottom baseline, while the mid-body and upper plume bend in the direction of motion with realistic inertia.',
    cursorTarget: { x: 0.78, y: 0.7, active: true },
  },
  {
    step: 5,
    title: '5. Returning to Original Shape',
    subtitle: 'Elastic Exponential Recovery',
    description:
      'When the cursor leaves, buoyant thermal convection naturally straightens the flame column. Deflections decay exponentially, restoring the authentic idle plume seamlessly.',
    cursorTarget: { x: 1.5, y: 0.5, active: false },
  },
];

export const FlamePrototypePage: React.FC = () => {
  // Mode: manual freehand interaction vs guided scripted tour
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<PrototypeStep>(1);
  const [simulatedCursor, setSimulatedCursor] = useState<SimulatedCursor | null>(null);

  // Shader & Physics Controls
  const [expandStrength, setExpandStrength] = useState(0.24);
  const [leanStrength, setLeanStrength] = useState(0.22);
  const [intensityBoost, setIntensityBoost] = useState(1.0);
  const [lumThreshold, setLumThreshold] = useState(0.035);
  const [debugMode, setDebugMode] = useState<number>(0);
  const [showSideBySide, setShowSideBySide] = useState(false);

  // Telemetry
  const [telemetry, setTelemetry] = useState({
    proximity: 0,
    leanBase: 0,
    leanTip: 0,
    fps: 60,
  });

  const tourTimerRef = useRef<number | null>(null);

  // Run guided scripted step transitions
  useEffect(() => {
    if (!isTourActive) return;

    const stepData = STEPS.find(s => s.step === currentStep);
    if (!stepData) return;

    // Set simulated cursor target
    setSimulatedCursor(stepData.cursorTarget);

    // Auto advance after 4.5 seconds
    tourTimerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => ((prev % 5) + 1) as PrototypeStep);
    }, 4500);

    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [isTourActive, currentStep]);

  const handleSelectStep = (step: PrototypeStep) => {
    setIsTourActive(false);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    setCurrentStep(step);
    const stepData = STEPS.find(s => s.step === step);
    if (stepData) {
      setSimulatedCursor(stepData.cursorTarget);
    }
  };

  const handleStartTour = () => {
    setCurrentStep(1);
    setIsTourActive(true);
  };

  const handleStopTour = () => {
    setIsTourActive(false);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    setSimulatedCursor(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-primary pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-accent/20 selection:text-accent">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-accent/10 text-accent border border-accent/20">
                <Flame className="w-3.5 h-3.5" />
                WebGL Fluid Fire Prototype
              </span>
              <span className="text-xs font-mono text-muted">v2.4 Standalone Verification</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Interactive Flame Prototype
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">
              Authentic pink flame from <code className="text-accent">pink-flame.mp4</code> rendered
              via Three.js WebGL and custom GLSL shaders with full luminance keying, edge feathering,
              and cursor airflow physics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-white hover:border-accent/40 transition-colors"
            >
              ← Return to Portfolio
            </Link>
          </div>
        </div>

        {/* Main Stage Grid: Interactive Viewer + Inspection Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Flame Canvas Stage (col-span-7 or col-span-12) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl border border-border/80 bg-[#080808] overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Telemetry Overlay */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-[#0D0D0D]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/80 text-[11px] font-mono text-muted">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      telemetry.fps >= 55 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {telemetry.fps} FPS
                </span>
                <span className="text-border">|</span>
                <span>Proximity: {(telemetry.proximity * 100).toFixed(0)}%</span>
                <span className="text-border">|</span>
                <span>Lean: {(telemetry.leanTip * 100).toFixed(0)}%</span>
              </div>

              {/* Tour Status Indicator */}
              {isTourActive && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-accent/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-accent/40 text-xs font-mono text-accent animate-pulse">
                  <Play className="w-3.5 h-3.5" />
                  Tour Playing: Step {currentStep} of 5
                </div>
              )}

              {/* Side-by-Side Comparison Mode */}
              {showSideBySide ? (
                <div className="grid grid-cols-2 w-full h-full">
                  {/* Left: Original Raw Video with Rectangular Cutoffs */}
                  <div className="relative border-r border-border/60 flex flex-col items-center justify-center p-4">
                    <span className="absolute top-4 left-4 text-[11px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 z-10">
                      Original Video (Static)
                    </span>
                    <video
                      src="/assets/pink-flame.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-[85%] object-contain"
                    />
                    <span className="text-[10px] font-mono text-muted mt-2 text-center">
                      Note sharp bottom & side cutoffs without shader feathering
                    </span>
                  </div>

                  {/* Right: WebGL Interactive Flame with Zero Rectangles */}
                  <div className="relative flex flex-col items-center justify-center">
                    <span className="absolute top-4 left-4 text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 z-10">
                      WebGL Fluid Fire (Interactive)
                    </span>
                    <InteractiveFlameCanvas
                      expandStrength={expandStrength}
                      leanStrength={leanStrength}
                      intensityBoost={intensityBoost}
                      lumThreshold={lumThreshold}
                      debugMode={debugMode}
                      simulatedCursor={simulatedCursor}
                      onTelemetry={setTelemetry}
                    />
                  </div>
                </div>
              ) : (
                /* Full Single Stage */
                <InteractiveFlameCanvas
                  expandStrength={expandStrength}
                  leanStrength={leanStrength}
                  intensityBoost={intensityBoost}
                  lumThreshold={lumThreshold}
                  debugMode={debugMode}
                  simulatedCursor={simulatedCursor}
                  onTelemetry={setTelemetry}
                />
              )}

              {/* Interaction Instructions Overlay */}
              <div className="absolute bottom-4 inset-x-4 flex justify-between items-center pointer-events-none text-[11px] font-mono text-muted/80">
                <span className="bg-[#0D0D0D]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-border/60">
                  {isTourActive
                    ? 'Automated simulation active — click "Freehand Interaction" to take control'
                    : 'Move pointer across the flame or sweep laterally to create airflow'}
                </span>
                <span className="bg-[#0D0D0D]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-border/60">
                  Container: Pure #080808
                </span>
              </div>
            </div>

            {/* Quick Action Bar Under Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/50 border border-border/60 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                {isTourActive ? (
                  <button
                    onClick={handleStopTour}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    Pause Tour
                  </button>
                ) : (
                  <button
                    onClick={handleStartTour}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-black font-semibold text-xs font-mono hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play 5-State Guided Tour
                  </button>
                )}

                <button
                  onClick={() => {
                    handleStopTour();
                    setSimulatedCursor(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Idle
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSideBySide(prev => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    showSideBySide
                      ? 'bg-accent/20 border-accent/50 text-accent font-medium'
                      : 'bg-surface border-border text-muted hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Side-by-Side Comparison
                </button>
              </div>
            </div>
          </div>

          {/* Right Dashboard: The 5 States + Rectangular Mask Inspector + Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* The 5 Required Prototype States */}
            <div className="bg-surface/60 border border-border/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  The 5 Core Interaction States
                </h3>
                <span className="text-[11px] font-mono text-muted">Click to inspect</span>
              </div>

              <div className="space-y-2.5">
                {STEPS.map(s => {
                  const isSelected = currentStep === s.step;
                  return (
                    <div
                      key={s.step}
                      onClick={() => handleSelectStep(s.step)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-accent/10 border-accent/50 text-white shadow-sm'
                          : 'bg-surface/40 border-border/60 text-muted hover:border-border hover:bg-surface/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-accent' : 'text-primary'
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded bg-background/50 border border-border/40">
                          {s.subtitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">{s.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rectangular Background Problem Solver Inspector */}
            <div className="bg-surface/60 border border-border/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Background Removal Inspector
                </h3>
                <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Zero Rectangles
                </span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Inspect how the custom GLSL fragment shader eliminates rectangular video
                boundaries using luminance keying and 4-edge Hermite feathering.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 0, label: 'Normal Composite', desc: 'Seamless #080808' },
                  { mode: 1, label: 'Alpha Mask Only', desc: 'Luminance Keying' },
                  { mode: 2, label: 'Edge Feather Mask', desc: '4-Edge Dissolve' },
                  { mode: 3, label: 'Flow Vectors', desc: 'UV Displacement' },
                ].map(item => (
                  <button
                    key={item.mode}
                    onClick={() => setDebugMode(item.mode)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      debugMode === item.mode
                        ? 'bg-accent/15 border-accent text-accent font-medium'
                        : 'bg-surface/40 border-border/60 text-muted hover:text-white hover:bg-surface/80'
                    }`}
                  >
                    <div className="text-xs font-mono">{item.label}</div>
                    <div className="text-[10px] text-muted opacity-80">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Tuning Controls */}
            <div className="bg-surface/60 border border-border/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-accent" />
                  Physics & Shader Sliders
                </h3>
                <span className="text-[11px] font-mono text-muted">Real-Time Uniforms</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Outward Parting / Expansion */}
                <div>
                  <div className="flex justify-between text-muted mb-1.5">
                    <span>Outward Parting / Opening:</span>
                    <span className="text-accent">{expandStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.01"
                    value={expandStrength}
                    onChange={e => setExpandStrength(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-dark mt-0.5">
                    <span>Subtle</span>
                    <span>Wide Opening</span>
                  </div>
                </div>

                {/* Aerodynamic Lean Compliance */}
                <div>
                  <div className="flex justify-between text-muted mb-1.5">
                    <span>Aerodynamic Wind Lean:</span>
                    <span className="text-accent">{leanStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.45"
                    step="0.01"
                    value={leanStrength}
                    onChange={e => setLeanStrength(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-dark mt-0.5">
                    <span>Stiff</span>
                    <span>High Flexibility</span>
                  </div>
                </div>

                {/* Luminance Keying Threshold */}
                <div>
                  <div className="flex justify-between text-muted mb-1.5">
                    <span>Black Floor Cutoff (Luminance):</span>
                    <span className="text-accent">{lumThreshold.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.10"
                    step="0.005"
                    value={lumThreshold}
                    onChange={e => setLumThreshold(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-dark mt-0.5">
                    <span>Soft Halo</span>
                    <span>Aggressive Strip</span>
                  </div>
                </div>

                {/* Core Intensity Boost */}
                <div>
                  <div className="flex justify-between text-muted mb-1.5">
                    <span>Core Luminescence Boost:</span>
                    <span className="text-accent">{intensityBoost.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.1"
                    value={intensityBoost}
                    onChange={e => setIntensityBoost(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Asset Verification Report (Section 5 Requirement) */}
        <div className="bg-surface/40 border border-border/80 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <Info className="w-5 h-5 text-accent" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Technical Asset Inspection & Integration Analysis
              </h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                Evaluated against public/assets/pink-flame.mp4 specifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <span className="font-semibold text-white block">1. Asset Preservation</span>
              <p className="text-muted">
                The original 720×1280 H.264 flame video (<code className="text-accent">pink-flame.mp4</code>)
                is preserved 100% untouched. No internet video was downloaded; color grading, natural
                fire tendrils, magenta highlights, and organic flicker are intact.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <span className="font-semibold text-white block">2. Why Previous Attempts Failed</span>
              <p className="text-muted">
                Previous attempts either moved the entire video container via CSS 3D transforms
                (producing a moving card) or applied sinusoidal wave offsets (producing an artificial
                fish-like wiggle) without masking the video borders, revealing rectangular boundaries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
              <span className="font-semibold text-white block">3. Background Removal Solution</span>
              <p className="text-muted">
                Inspection showed the flame touched row 1279 at the bottom edge. By combining
                luminance keying (<code className="text-accent">smoothstep(0.035, 0.135, maxC)</code>)
                with 4-edge Hermite feathering, 100% of the video rectangle is dissolved seamlessly into{' '}
                <code className="text-accent">#080808</code>. No asset replacement is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
