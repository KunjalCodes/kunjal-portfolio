import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Layers, 
  Scan, 
  Cpu, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Maximize2
} from 'lucide-react';
import { sampleDrawings, DrawingSample, BoundingBox } from '../../data/playground/pipelineData';
import { Badge } from '../common/Badge';

export const PipelineExplorer: React.FC = () => {
  const [selectedDrawingIndex, setSelectedDrawingIndex] = useState(0);
  const [activeStage, setActiveStage] = useState(1);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const drawing = sampleDrawings[selectedDrawingIndex];

  const stages = [
    { number: 1, name: 'Image Input', icon: FileText, category: 'Ingestion' },
    { number: 2, name: 'Preprocessing', icon: Layers, category: 'OpenCV' },
    { number: 3, name: 'OCR Extraction', icon: Scan, category: 'EasyOCR' },
    { number: 4, name: 'AI Interpretation', icon: Cpu, category: 'Gemini Multimodal' },
    { number: 5, name: 'Data Validation', icon: CheckCircle2, category: 'Pydantic Rules' },
    { number: 6, name: 'Structured JSON', icon: Code2, category: 'Export' },
  ];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(drawing.stages.output.jsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls: Drawing Selector & Status Badge */}
      <div className="bg-[#0D0D0D] border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-accent mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Active Test Drawing Sample
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-lg font-bold text-primary">
              {drawing.drawingNumber}: {drawing.name}
            </h3>
            <Badge variant="accent">{drawing.discipline}</Badge>
            <span className="text-xs font-mono text-muted">{drawing.dpi} DPI · {drawing.dimensions}</span>
          </div>
        </div>

        {/* Drawing Switcher Buttons */}
        <div className="flex items-center gap-2">
          {sampleDrawings.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDrawingIndex(idx);
                setHoveredBox(null);
              }}
              className={`font-mono text-xs px-3 py-1.5 rounded-md transition-colors duration-150 cursor-pointer ${
                selectedDrawingIndex === idx
                  ? 'bg-accent text-[#080808] font-medium'
                  : 'bg-[#141414] text-muted hover:text-primary border border-border'
              }`}
            >
              {d.drawingNumber} ({d.discipline})
            </button>
          ))}
        </div>
      </div>

      {/* Visual Pipeline Stage Navigation Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] bg-[#090909] border border-border rounded-lg p-2 gap-1.5">
          {stages.map((s) => {
            const Icon = s.icon;
            const isActive = activeStage === s.number;
            const isCompleted = activeStage > s.number;

            return (
              <button
                key={s.number}
                onClick={() => setActiveStage(s.number)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-md transition-colors duration-150 cursor-pointer select-none text-center relative ${
                  isActive
                    ? 'bg-[#181818] border border-accent/40 shadow-sm'
                    : isCompleted
                    ? 'text-primary/90 hover:bg-white/[0.03]'
                    : 'text-muted hover:text-primary hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center ${
                    isActive ? 'bg-accent text-black font-bold' : isCompleted ? 'bg-white/10 text-accent' : 'bg-white/5 text-muted'
                  }`}>
                    {s.number}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-muted'}`} />
                </div>
                <span className={`text-xs font-heading font-medium truncate max-w-full ${
                  isActive ? 'text-primary font-semibold' : 'text-muted'
                }`}>
                  {s.name}
                </span>
                <span className="text-[10px] font-mono text-muted-dark truncate">
                  {s.category}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activePipelineIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail & Intermediate Output Card */}
      <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-6">
        {/* Stage Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <div className="font-mono text-xs text-accent mb-1">
              Stage 0{activeStage} of 06 · {stages[activeStage - 1].category}
            </div>
            <h4 className="font-heading text-xl sm:text-2xl font-bold text-primary">
              {stages[activeStage - 1].name}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              disabled={activeStage === 1}
              onClick={() => setActiveStage(prev => Math.max(1, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#1A1A1A] border border-border text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              disabled={activeStage === 6}
              onClick={() => setActiveStage(prev => Math.min(6, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Stage Render View */}
        <AnimatePresence mode="wait">
          {activeStage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted leading-relaxed">
                Raw drawing files (multi-page PDF vector files or scanned TIFFs) are ingested and converted into standardized high-DPI raster representations for spatial pixel operations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Metadata Inspector */}
                <div className="bg-[#080808] border border-border p-5 rounded-lg space-y-3 font-mono text-xs">
                  <div className="text-accent font-medium">// Ingestion specifications</div>
                  <div className="space-y-2 text-muted">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span>Source File:</span>
                      <span className="text-primary">{drawing.originalFileName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span>Input Format:</span>
                      <span className="text-primary">{drawing.stages.input.rawFormat}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span>Raster Canvas:</span>
                      <span className="text-primary">{drawing.dimensions}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span>Color Depth:</span>
                      <span className="text-primary">{drawing.stages.input.colorDepth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Buffer Size:</span>
                      <span className="text-primary">{drawing.stages.input.fileSizeBytes}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Blueprint Ingestion Viewport */}
                <div className="bg-[#060606] border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px]">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #F0A5C8 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  <FileText className="w-10 h-10 text-accent/60 mb-2" />
                  <span className="font-mono text-xs text-primary font-semibold">
                    {drawing.stages.input.previewDescription}
                  </span>
                  <span className="mt-2 text-[11px] font-mono text-muted-dark">
                    PyMuPDF Render Engine: 300 DPI Sub-pixel Matrix
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeStage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted leading-relaxed">
                Applies bilateral filtering to smooth scanner paper grain while preserving sharp boundary edges, followed by Gaussian adaptive thresholding and directional morphological open/close passes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Adaptive Block Size</span>
                  <div className="text-lg font-mono font-bold text-accent mt-1">
                    {drawing.stages.preprocessing.blockSize} px
                  </div>
                  <span className="text-[11px] text-muted-dark">Gaussian Kernel Window</span>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Constant C Offset</span>
                  <div className="text-lg font-mono font-bold text-accent mt-1">
                    {drawing.stages.preprocessing.adaptiveThresholdC}
                  </div>
                  <span className="text-[11px] text-muted-dark">Threshold Subtraction</span>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">H & V Morphology</span>
                  <div className="text-sm font-mono font-bold text-accent mt-1 truncate">
                    {drawing.stages.preprocessing.hKernelSize}
                  </div>
                  <span className="text-[11px] text-muted-dark">Linear Grid Separation</span>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Grain Noise Reduction</span>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {drawing.stages.preprocessing.noiseReductionRatio}
                  </div>
                  <span className="text-[11px] text-muted-dark">Bilateral Filter Preserved</span>
                </div>
              </div>

              {/* Visual Preprocessing Decomposition Diagram */}
              <div className="bg-[#080808] border border-border p-5 rounded-lg space-y-3 font-mono text-xs">
                <div className="text-accent font-medium">// OpenCV morphological kernel flow</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="bg-[#121212] p-3 rounded border border-border">
                    <div className="text-[11px] text-muted mb-1">1. Bilateral Denoise</div>
                    <code className="text-primary text-[10px]">d=9, sigmaColor=75</code>
                  </div>
                  <div className="bg-[#121212] p-3 rounded border border-border">
                    <div className="text-[11px] text-muted mb-1">2. Adaptive Binary Mask</div>
                    <code className="text-primary text-[10px]">cv2.THRESH_BINARY_INV</code>
                  </div>
                  <div className="bg-[#121212] p-3 rounded border border-border">
                    <div className="text-[11px] text-muted mb-1">3. Line Isolation</div>
                    <code className="text-primary text-[10px]">{drawing.stages.preprocessing.linesIsolatedCount} Rectilinear Segments</code>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeStage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-muted">
                <p>
                  EasyOCR local text detection locates alphanumeric tokens. <span className="text-accent">Hover over any bounding box proposal below to inspect text & confidence.</span>
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <span>Detected: <strong className="text-primary">{drawing.stages.ocr.totalTokensDetected}</strong></span>
                  <span>Avg Conf: <strong className="text-emerald-400">{(drawing.stages.ocr.averageConfidence * 100).toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Interactive Bounding Box Canvas Viewport */}
              <div className="relative w-full h-[320px] sm:h-[380px] bg-[#070707] border border-border rounded-lg overflow-hidden flex items-center justify-center p-4">
                {/* Drawing Blueprint Background Grid Mock */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Center Blueprint Plan Line Graphic */}
                <div className="absolute inset-8 border border-white/10 rounded-md flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-white/15 flex items-center justify-center">
                    <span className="font-mono text-xs text-muted-dark">
                      {drawing.drawingNumber} Plan viewport grid
                    </span>
                  </div>
                </div>

                {/* Interactive Bounding Boxes */}
                {drawing.stages.ocr.boxes.map((box) => {
                  const isHovered = hoveredBox?.id === box.id;
                  const isWarning = box.status === 'warning';

                  return (
                    <div
                      key={box.id}
                      onMouseEnter={() => setHoveredBox(box)}
                      onMouseLeave={() => setHoveredBox(null)}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                      }}
                      className={`absolute rounded cursor-pointer transition-[border-color,background-color] duration-150 flex items-center justify-center select-none text-[10px] font-mono ${
                        isHovered
                          ? 'bg-accent/25 border-2 border-accent text-primary z-30'
                          : isWarning
                          ? 'bg-amber-500/15 border border-amber-500/80 text-amber-300 z-10'
                          : 'bg-accent/10 border border-accent/40 text-primary/80 hover:border-accent z-20'
                      }`}
                    >
                      <span className="truncate px-1 font-semibold">{box.text}</span>
                    </div>
                  );
                })}

                {/* Floating Tooltip Inspector */}
                {hoveredBox && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-[#121212]/95 border border-accent/50 p-3 rounded-lg shadow-2xl backdrop-blur-md z-40 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-accent font-bold">Box ID: {hoveredBox.id}</span>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-light uppercase">{hoveredBox.type}</span>
                    </div>
                    <div className="text-primary font-semibold">"{hoveredBox.text}"</div>
                    <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border/80">
                      <span>OCR Confidence:</span>
                      <span className="text-emerald-400 font-bold">{(hoveredBox.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {hoveredBox.validationMessage && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 pt-1 border-t border-border/60">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{hoveredBox.validationMessage}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeStage === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted leading-relaxed">
                Raw bounding crops and schedule regions are passed to Google Gemini 1.5 Flash/Pro with structured few-shot instructions to classify symbols, associate dimensions with parent elements, and normalize engineering units.
              </p>

              {/* Normalized Entity Table */}
              <div className="bg-[#080808] border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-3 bg-[#111] border-b border-border flex items-center justify-between text-xs font-mono">
                  <span className="text-accent font-semibold">// Semantic Classification Table</span>
                  <span className="text-muted">Target Units: {drawing.stages.aiInterpretation.normalizedUnits}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0E0E0E] text-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Entity Name</th>
                        <th className="px-4 py-2.5 font-medium">Discipline Category</th>
                        <th className="px-4 py-2.5 font-medium">Raw OCR</th>
                        <th className="px-4 py-2.5 font-medium">Normalized Value</th>
                        <th className="px-4 py-2.5 font-medium text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-muted-light">
                      {drawing.stages.aiInterpretation.extractedEntities.map((ent, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-primary">{ent.entity}</td>
                          <td className="px-4 py-2.5 text-accent">{ent.category}</td>
                          <td className="px-4 py-2.5 text-muted">{ent.rawOcr}</td>
                          <td className="px-4 py-2.5 text-primary/90 font-mono text-[11px]">{ent.normalizedValue}</td>
                          <td className="px-4 py-2.5 text-right text-emerald-400">{(ent.confidence * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeStage === 5 && (
            <motion.div
              key="stage-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted leading-relaxed">
                Applies deterministic engineering heuristics to cross-reference drawing callouts against schedule tables, validating dimensional continuity, minimum clearances, and flagging missing attributes.
              </p>

              {/* Validation Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Rules Evaluated</span>
                  <div className="text-2xl font-mono font-bold text-primary mt-1">
                    {drawing.stages.validation.rulesApplied}
                  </div>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Rules Passed</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {drawing.stages.validation.passedCount}
                  </div>
                </div>

                <div className="bg-[#080808] border border-border p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-muted uppercase">Warning Flags</span>
                  <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {drawing.stages.validation.warningCount}
                  </div>
                </div>
              </div>

              {/* Issues Feed */}
              <div className="space-y-3">
                <h5 className="font-mono text-xs text-accent font-medium">
                  Rule Evaluation Audit Log
                </h5>
                {drawing.stages.validation.issues.map((issue) => (
                  <div
                    key={issue.code}
                    className="bg-[#080808] border border-amber-500/40 rounded-lg p-4 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {issue.code} ({issue.severity.toUpperCase()})
                      </span>
                      <span className="text-muted-dark">{issue.target}</span>
                    </div>
                    <p className="text-muted-light">{issue.description}</p>
                    <div className="pt-2 border-t border-border/80 text-[11px] text-muted">
                      <span className="text-accent font-semibold">Remediation: </span>
                      {issue.remediation}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeStage === 6 && (
            <motion.div
              key="stage-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-muted">
                <p>
                  Final verified extraction payload formatted according to <span className="text-accent">{drawing.stages.output.schemaVersion}</span> for immediate CAD, BIM, or ERP consumption.
                </p>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161616] hover:bg-[#202020] border border-border text-primary hover:text-accent transition-colors cursor-pointer shrink-0"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Structured JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Syntax Highlighted JSON Preview */}
              <div className="bg-[#060606] border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-[#101010] border-b border-border flex items-center justify-between text-[11px] font-mono text-muted">
                  <span>payload.json</span>
                  <span>{JSON.stringify(drawing.stages.output.jsonPayload).length} bytes</span>
                </div>
                <pre className="p-4 font-mono text-xs text-primary/90 leading-relaxed overflow-x-auto max-h-[400px]">
                  <code>{JSON.stringify(drawing.stages.output.jsonPayload, null, 2)}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="bg-[#090909] border border-border/80 rounded-lg p-4 flex items-start gap-3 text-xs font-mono text-muted">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-primary">Engineering Transparency Note:</strong> Intermediate stage outputs, bounding boxes, and extracted schemas are derived from genuine test benchmarks of the AI Drawing Extraction Engine. No live GPU inference is triggered in this static demonstration client.
        </p>
      </div>
    </div>
  );
};
