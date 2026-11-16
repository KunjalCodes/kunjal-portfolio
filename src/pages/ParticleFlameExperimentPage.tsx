import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  User,
  RotateCcw,
  Play,
  CheckCircle2,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import {
  ParticleFlame,
  FlamePreset,
  PRESET_CONFIGS,
} from '../components/experiment/ParticleFlame';
import { HeroFlameBackground } from '../components/hero/HeroFlameBackground';
import { Button } from '../components/common/Button';
import { ScrollIndicator } from '../components/common/ScrollIndicator';
import { profile } from '../data/profile';

type ViewMode = 'particle' | 'original' | 'split';

export const ParticleFlameExperimentPage: React.FC = () => {
  // Prototype configuration state
  const [preset, setPreset] = useState<FlamePreset>('realistic');
  const [viewMode, setViewMode] = useState<ViewMode>('particle');
  const [simulatedCursor, setSimulatedCursor] = useState<{
    x: number;
    y: number;
    active: boolean;
  } | null>(null);

  // Custom Physics overrides
  const [customBuoyancy, setCustomBuoyancy] = useState<number | null>(null);
  const [customCurl, setCustomCurl] = useState<number | null>(null);
  const [customGlow, setCustomGlow] = useState<number | null>(null);
  const [customAirflow, setCustomAirflow] = useState<number | null>(null);

  // Telemetry metrics
  const [telemetry, setTelemetry] = useState({
    fps: 60,
    activeParticles: 18000,
    cursorVelocity: 0,
  });

  const resetCustomSliders = () => {
    setCustomBuoyancy(null);
    setCustomCurl(null);
    setCustomGlow(null);
    setCustomAirflow(null);
    setSimulatedCursor(null);
  };

  const handlePresetSelect = (newPreset: FlamePreset) => {
    setPreset(newPreset);
    resetCustomSliders();
  };

  // Automated Gesture Simulators
  const runSweepGesture = (dir: 'left' | 'right') => {
    setSimulatedCursor({ x: 0.5, y: 0.45, active: true });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      const targetX = dir === 'right' ? 0.5 + progress * 0.4 : 0.5 - progress * 0.4;
      setSimulatedCursor({ x: targetX, y: 0.45 + Math.sin(progress * Math.PI) * 0.15, active: true });
      if (progress >= 1.0) {
        clearInterval(interval);
        setTimeout(() => setSimulatedCursor(null), 600);
      }
    }, 40);
  };

  const runPlungeGesture = () => {
    setSimulatedCursor({ x: 0.5, y: 0.8, active: true });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.06;
      setSimulatedCursor({ x: 0.5, y: 0.8 - progress * 0.45, active: true });
      if (progress >= 1.0) {
        clearInterval(interval);
        setTimeout(() => setSimulatedCursor(null), 800);
      }
    }, 40);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-primary flex flex-col font-sans selection:bg-accent/20 selection:text-accent">
      {/* 
        Top Floating Experiment Navigation & Control Bar 
        Allows preset switching, telemetry monitoring, and comparison toggles
      */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portfolio
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-accent/15 text-accent border border-accent/30 font-medium">
                <Flame className="w-3.5 h-3.5" />
                GPU Particle Flame Experiment
              </span>
              <span className="hidden md:inline text-xs font-mono text-muted-dark">
                (Standalone Prototype)
              </span>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-surface/80 p-1 rounded-lg border border-border">
            <span className="text-[11px] font-mono text-muted px-2 hidden sm:inline">Preset:</span>
            {(['soft', 'realistic', 'expressive'] as FlamePreset[]).map(p => (
              <button
                key={p}
                onClick={() => handlePresetSelect(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-all cursor-pointer ${
                  preset === p && viewMode === 'particle'
                    ? 'bg-accent text-black font-semibold shadow-sm'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Particle vs Original Video */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface/80 p-1 rounded-lg border border-border text-xs font-mono">
              <button
                onClick={() => setViewMode('particle')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'particle'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-muted hover:text-white'
                }`}
              >
                Particle Flame
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'original'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-muted hover:text-white'
                }`}
              >
                Original Video
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-accent/20 text-accent font-medium border border-accent/40'
                    : 'text-muted hover:text-white'
                }`}
              >
                Split View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 
        Hero Integration Canvas:
        Exact replicate of the portfolio hero with typography and buttons over the simulation
      */}
      <div className="relative flex-1 w-full min-h-[90vh] flex flex-col justify-between items-center px-6 pt-16 pb-12 overflow-hidden bg-[#080808]">
        {/* Flame Background Simulation Layer */}
        {viewMode === 'split' ? (
          <div className="absolute inset-0 grid grid-cols-2 pointer-events-none z-0">
            {/* Left Column: Particle Flame */}
            <div className="relative border-r border-border/40 overflow-hidden">
              <span className="absolute top-4 left-4 z-20 text-[11px] font-mono text-accent bg-accent/15 px-2.5 py-1 rounded border border-accent/30 backdrop-blur-sm">
                GPU Particle Simulation ({PRESET_CONFIGS[preset].particleCount.toLocaleString()} pts)
              </span>
              <ParticleFlame
                preset={preset}
                simulatedCursor={simulatedCursor}
                customConfig={{
                  ...(customBuoyancy !== null ? { buoyancy: customBuoyancy } : {}),
                  ...(customCurl !== null ? { curlStrength: customCurl } : {}),
                  ...(customGlow !== null ? { glowIntensity: customGlow } : {}),
                  ...(customAirflow !== null ? { cursorAirflow: customAirflow } : {}),
                }}
                onTelemetry={setTelemetry}
              />
            </div>

            {/* Right Column: Original Video Flame */}
            <div className="relative overflow-hidden">
              <span className="absolute top-4 left-4 z-20 text-[11px] font-mono text-muted bg-surface/90 px-2.5 py-1 rounded border border-border backdrop-blur-sm">
                Original Flame Video (MP4)
              </span>
              <HeroFlameBackground />
            </div>
          </div>
        ) : viewMode === 'particle' ? (
          <div className="absolute inset-0 pointer-events-none z-0">
            <ParticleFlame
              preset={preset}
              simulatedCursor={simulatedCursor}
              customConfig={{
                ...(customBuoyancy !== null ? { buoyancy: customBuoyancy } : {}),
                ...(customCurl !== null ? { curlStrength: customCurl } : {}),
                ...(customGlow !== null ? { glowIntensity: customGlow } : {}),
                ...(customAirflow !== null ? { cursorAirflow: customAirflow } : {}),
              }}
              onTelemetry={setTelemetry}
            />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none z-0">
            <HeroFlameBackground />
          </div>
        )}

        {/* Live Telemetry Floating Pill */}
        {viewMode === 'particle' && (
          <div className="absolute top-6 left-6 z-20 hidden md:flex items-center gap-3 bg-[#0D0D0D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-border/80 text-[11px] font-mono text-muted shadow-lg">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry.fps >= 55 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {telemetry.fps} FPS
            </span>
            <span className="text-border">|</span>
            <span>GPU Particles: {telemetry.activeParticles.toLocaleString()}</span>
            <span className="text-border">|</span>
            <span>Airflow: {telemetry.cursorVelocity > 0.1 ? 'Active' : 'Idle'}</span>
          </div>
        )}

        {/* Interactive Gesture Demonstration Bar */}
        <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-2 bg-[#0D0D0D]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/80 text-[11px] font-mono text-muted shadow-lg">
          <span className="text-muted-dark mr-1">Airflow Demo:</span>
          <button
            onClick={() => runSweepGesture('right')}
            className="px-2 py-0.5 rounded bg-surface hover:bg-white/10 text-primary transition-colors cursor-pointer"
          >
            Sweep Right →
          </button>
          <button
            onClick={() => runSweepGesture('left')}
            className="px-2 py-0.5 rounded bg-surface hover:bg-white/10 text-primary transition-colors cursor-pointer"
          >
            ← Sweep Left
          </button>
          <button
            onClick={runPlungeGesture}
            className="px-2 py-0.5 rounded bg-surface hover:bg-white/10 text-primary transition-colors cursor-pointer"
          >
            Plunge & Part
          </button>
        </div>

        {/* Spacing anchor */}
        <div className="w-full" aria-hidden="true" />

        {/* 
          Foreground Hero Content 
          Matches HomePage Hero Typography and Buttons 100%
        */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center pointer-events-auto">
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-[#0E0E0E] mb-6 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-mono text-xs text-muted-light">
              {profile.shortIntro}
            </span>
          </motion.div>

          {/* Heading Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary uppercase select-none drop-shadow-md"
          >
            {profile.name}
          </motion.h1>

          {/* Headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 md:mt-6 font-heading text-lg sm:text-xl md:text-2xl text-muted-light font-normal max-w-xl text-center tracking-tight"
          >
            <span className="text-primary font-medium">{profile.headline}</span>
            <br className="hidden sm:inline" />
            <span className="text-sm sm:text-base text-muted block mt-1">
              Bridging persistent agent memory, intelligent orchestration, and computer vision.
            </span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              to="/work"
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Work
            </Button>

            <Button
              to="/about"
              variant="secondary"
              size="md"
              icon={<User className="w-4 h-4 text-muted" />}
            >
              About Me
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative z-10 pt-8"
        >
          <ScrollIndicator targetId="prototype-notes" />
        </motion.div>
      </div>

      {/* 
        Bottom Physics & Tuning Control Panel
        Allows live inspection and real-time tweaking of simulation parameters
      */}
      <section id="prototype-notes" className="border-t border-border/80 bg-[#0B0B0B] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-accent" />
                Particle Simulation Tuning & Comparison
              </h2>
              <p className="text-xs font-mono text-muted mt-1">
                Active Preset: <span className="text-accent uppercase">{preset}</span> (
                {PRESET_CONFIGS[preset].name}) — Zero Canvas Boundaries
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetCustomSliders}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Parameters
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
            {/* Buoyancy */}
            <div className="bg-surface/50 border border-border/60 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-muted">
                <span>Thermal Buoyancy:</span>
                <span className="text-accent">
                  {(customBuoyancy ?? PRESET_CONFIGS[preset].buoyancy).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.05"
                value={customBuoyancy ?? PRESET_CONFIGS[preset].buoyancy}
                onChange={e => setCustomBuoyancy(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <span className="text-[10px] text-muted-dark block">Updraft convective speed</span>
            </div>

            {/* Curl Noise Turbulence */}
            <div className="bg-surface/50 border border-border/60 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-muted">
                <span>Curl Turbulence:</span>
                <span className="text-accent">
                  {(customCurl ?? PRESET_CONFIGS[preset].curlStrength).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={customCurl ?? PRESET_CONFIGS[preset].curlStrength}
                onChange={e => setCustomCurl(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <span className="text-[10px] text-muted-dark block">Vortex tongue curling intensity</span>
            </div>

            {/* Core Glow Intensity */}
            <div className="bg-surface/50 border border-border/60 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-muted">
                <span>Photometric Glow:</span>
                <span className="text-accent">
                  {(customGlow ?? PRESET_CONFIGS[preset].glowIntensity).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="2.0"
                step="0.05"
                value={customGlow ?? PRESET_CONFIGS[preset].glowIntensity}
                onChange={e => setCustomGlow(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <span className="text-[10px] text-muted-dark block">Incandescent core brightness</span>
            </div>

            {/* Cursor Airflow */}
            <div className="bg-surface/50 border border-border/60 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-muted">
                <span>Airflow Sensitivity:</span>
                <span className="text-accent">
                  {(customAirflow ?? PRESET_CONFIGS[preset].cursorAirflow).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={customAirflow ?? PRESET_CONFIGS[preset].cursorAirflow}
                onChange={e => setCustomAirflow(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <span className="text-[10px] text-muted-dark block">Pointer velocity drag compliance</span>
            </div>
          </div>

          {/* Technical Acceptance Verification Checklist */}
          <div className="bg-surface/40 border border-border/70 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Experiment Evaluation & Acceptance Criteria (Section 9)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5 text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Identifiable Flame Silhouette:</strong> Procedural narrow base emitter expanding into curling tongues and tapering apex. Not a generic particle box or triangle.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Fluid Fluidity & Core Density:</strong> Overlapping volumetric Gaussian splats merge additively into an unbroken, molten incandescent core. No disconnected dots.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Zero Rectangular Boundary:</strong> Transparent WebGL canvas with soft radial Gaussian particle falloff. 100% boundary-free against #080808.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Incompressible Curl Noise:</strong> 3D divergence-free curl field rolls continuously with updraft time, preventing repetitive looping artifacts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
