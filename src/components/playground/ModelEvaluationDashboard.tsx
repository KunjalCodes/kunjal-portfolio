import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  BarChart3, 
  Target, 
  Activity, 
  Filter, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  fullEvaluationDataset, 
  computeEvaluation, 
  computePrecisionRecallCurve, 
  EvalInstance 
} from '../../data/playground/evalData';
import { Badge } from '../common/Badge';

export const ModelEvaluationDashboard: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.50);
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'tp' | 'fp' | 'tn' | 'fn'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically recalculate real metrics based on the active threshold
  const metrics = useMemo(() => {
    return computeEvaluation(fullEvaluationDataset, threshold);
  }, [threshold]);

  // Compute curve points for the interactive SVG Precision-Recall plot
  const curvePoints = useMemo(() => {
    return computePrecisionRecallCurve(fullEvaluationDataset, 30);
  }, []);

  // Filter instances according to prediction outcome and search
  const filteredInstances = useMemo(() => {
    return fullEvaluationDataset.filter((item) => {
      const predicted = item.modelScore >= threshold ? 1 : 0;
      let outcomeType: 'tp' | 'fp' | 'tn' | 'fn';
      if (item.trueLabel === 1 && predicted === 1) outcomeType = 'tp';
      else if (item.trueLabel === 0 && predicted === 1) outcomeType = 'fp';
      else if (item.trueLabel === 0 && predicted === 0) outcomeType = 'tn';
      else outcomeType = 'fn';

      const matchesFilter = outcomeFilter === 'all' || outcomeFilter === outcomeType;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [threshold, outcomeFilter, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Top Banner: Threshold Controller */}
      <div className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              Dynamic Binary Classification Threshold Controller
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-primary">
              Decision Boundary: <span className="text-accent font-mono">{threshold.toFixed(2)}</span>
            </h3>
            <p className="text-xs text-muted mt-1 max-w-xl">
              Adjusting the threshold recalculates every metric in real time from the 100-instance evaluation dataset.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setThreshold(0.35)}
              className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-border text-[11px] font-mono text-muted hover:text-accent transition-colors"
            >
              High Recall (0.35)
            </button>
            <button
              onClick={() => setThreshold(0.50)}
              className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-border text-[11px] font-mono text-muted hover:text-accent transition-colors"
            >
              Balanced (0.50)
            </button>
            <button
              onClick={() => setThreshold(0.75)}
              className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-border text-[11px] font-mono text-muted hover:text-accent transition-colors"
            >
              High Precision (0.75)
            </button>
          </div>
        </div>

        {/* The Threshold Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono text-muted">
            <span>Low Threshold (0.05) → Maximize Recall (Fewer Misses)</span>
            <span className="text-accent font-bold">Current: {threshold.toFixed(2)}</span>
            <span>High Threshold (0.95) → Maximize Precision (Fewer False Alarms)</span>
          </div>

          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#F0A5C8]"
          />
        </div>
      </div>

      {/* 4 Real Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-muted" />
          </div>
          <div className="text-3xl font-heading font-bold text-primary">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] font-mono text-muted-dark">
            (TP + TN) / Total ({metrics.tp + metrics.tn}/{metrics.total})
          </p>
        </div>

        {/* Precision */}
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>Precision</span>
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-heading font-bold text-accent">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] font-mono text-muted-dark">
            TP / (TP + FP) ({metrics.tp}/{metrics.tp + metrics.fp})
          </p>
        </div>

        {/* Recall */}
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>Recall</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-400">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] font-mono text-muted-dark">
            TP / (TP + FN) ({metrics.tp}/{metrics.tp + metrics.fn})
          </p>
        </div>

        {/* F1 Score */}
        <div className="bg-[#0B0B0B] border border-border rounded-lg p-5 space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>F1 Score</span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-heading font-bold text-primary">
            {(metrics.f1 * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] font-mono text-muted-dark">
            Harmonic mean of P & R
          </p>
        </div>
      </div>

      {/* Grid: Confusion Matrix + Precision-Recall Trade-off Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confusion Matrix (5 cols on large) */}
        <div className="lg:col-span-6 bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Confusion Matrix
            </h4>
            <span className="text-xs font-mono text-muted">Total: {metrics.total} Samples</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Positive */}
            <div className="bg-[#080808] border border-emerald-500/40 p-4 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                True Positive (TP)
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {metrics.tp}
              </div>
              <p className="text-[11px] text-muted-dark">
                Critical callouts correctly detected
              </p>
            </div>

            {/* False Positive (Type I) */}
            <div className="bg-[#080808] border border-amber-500/40 p-4 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                False Positive (FP)
              </div>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {metrics.fp}
              </div>
              <p className="text-[11px] text-muted-dark">
                Non-critical flagged as critical
              </p>
            </div>

            {/* False Negative (Type II) */}
            <div className="bg-[#080808] border border-red-500/40 p-4 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-red-400 uppercase font-semibold">
                False Negative (FN)
              </div>
              <div className="text-2xl font-mono font-bold text-red-400">
                {metrics.fn}
              </div>
              <p className="text-[11px] text-muted-dark">
                Missed critical structural entities
              </p>
            </div>

            {/* True Negative */}
            <div className="bg-[#080808] border border-border p-4 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-muted uppercase font-semibold">
                True Negative (TN)
              </div>
              <div className="text-2xl font-mono font-bold text-primary/80">
                {metrics.tn}
              </div>
              <p className="text-[11px] text-muted-dark">
                Background correctly rejected
              </p>
            </div>
          </div>

          {/* Engineering Trade-off Callout */}
          <div className="mt-4 p-3 bg-[#080808] border border-border/80 rounded text-xs font-mono text-muted leading-relaxed">
            <span className="text-accent font-semibold">Engineering Rule: </span>
            In architectural takeoff, <strong className="text-emerald-400">Recall is prioritized</strong> over Precision. A false negative (missing a column C1) leads to under-estimated structural materials, whereas false positives are quickly discarded during engineer review.
          </div>
        </div>

        {/* Precision-Recall Trade-off Curve (6 cols on large) */}
        <div className="lg:col-span-6 bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Precision vs. Recall Curve
            </h4>
            <span className="text-xs font-mono text-accent">Operating Point Marked</span>
          </div>

          {/* Interactive SVG Plot */}
          <div className="relative w-full h-56 bg-[#060606] border border-border rounded-lg p-4 flex items-center justify-center">
            <svg viewBox="0 0 300 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="280" y2="20" stroke="#1F1F1F" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="280" y2="60" stroke="#1F1F1F" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="280" y2="100" stroke="#1F1F1F" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="280" y2="140" stroke="#1F1F1F" strokeDasharray="3 3" />

              {/* Axes */}
              <line x1="30" y1="140" x2="280" y2="140" stroke="#444" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="140" stroke="#444" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x="140" y="165" fill="#888" fontSize="10" textAnchor="middle" fontFamily="monospace">Recall →</text>
              <text x="15" y="80" fill="#888" fontSize="10" textAnchor="middle" transform="rotate(-90, 15, 80)" fontFamily="monospace">Precision →</text>

              {/* Curve Line */}
              <polyline
                fill="none"
                stroke="#F0A5C8"
                strokeWidth="2.5"
                points={curvePoints
                  .map(p => `${30 + (p.recall * 240)},${140 - (p.precision * 120)}`)
                  .join(' ')}
              />

              {/* Current Operating Point Circle */}
              <circle
                cx={30 + (metrics.recall * 240)}
                cy={140 - (metrics.precision * 120)}
                r="6"
                fill="#F0A5C8"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-muted pt-2 border-t border-border/80">
            <span>Operating Point: <strong className="text-primary">R: {(metrics.recall * 100).toFixed(0)}% / P: {(metrics.precision * 100).toFixed(0)}%</strong></span>
            <span className="text-muted-dark">Computed at t={threshold.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Prediction Outcomes Table & Filter */}
      <div className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h4 className="font-heading text-lg font-bold text-primary">
              Prediction Outcomes Inspector
            </h4>
            <p className="text-xs text-muted">
              Inspect how the active threshold classifies each instance in the dataset.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setOutcomeFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${outcomeFilter === 'all' ? 'bg-accent text-black font-semibold' : 'bg-[#141414] text-muted hover:text-primary border border-border'}`}
            >
              All ({fullEvaluationDataset.length})
            </button>
            <button
              onClick={() => setOutcomeFilter('tp')}
              className={`px-2.5 py-1 rounded transition-colors ${outcomeFilter === 'tp' ? 'bg-emerald-500 text-black font-semibold' : 'bg-[#141414] text-emerald-400 hover:text-primary border border-border'}`}
            >
              TP ({metrics.tp})
            </button>
            <button
              onClick={() => setOutcomeFilter('fp')}
              className={`px-2.5 py-1 rounded transition-colors ${outcomeFilter === 'fp' ? 'bg-amber-500 text-black font-semibold' : 'bg-[#141414] text-amber-400 hover:text-primary border border-border'}`}
            >
              FP ({metrics.fp})
            </button>
            <button
              onClick={() => setOutcomeFilter('fn')}
              className={`px-2.5 py-1 rounded transition-colors ${outcomeFilter === 'fn' ? 'bg-red-500 text-black font-semibold' : 'bg-[#141414] text-red-400 hover:text-primary border border-border'}`}
            >
              FN ({metrics.fn})
            </button>
            <button
              onClick={() => setOutcomeFilter('tn')}
              className={`px-2.5 py-1 rounded transition-colors ${outcomeFilter === 'tn' ? 'bg-white/20 text-white font-semibold' : 'bg-[#141414] text-muted hover:text-primary border border-border'}`}
            >
              TN ({metrics.tn})
            </button>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#080808] text-muted border-b border-border sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Sample ID</th>
                <th className="px-4 py-2.5">Entity Name</th>
                <th className="px-4 py-2.5">Discipline</th>
                <th className="px-4 py-2.5">Ground Truth</th>
                <th className="px-4 py-2.5">Model Score</th>
                <th className="px-4 py-2.5">Classification</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-muted-light">
              {filteredInstances.slice(0, 30).map((item) => {
                const predicted = item.modelScore >= threshold ? 1 : 0;
                let outcomeLabel = 'TN';
                let outcomeColor = 'text-muted';

                if (item.trueLabel === 1 && predicted === 1) {
                  outcomeLabel = 'TP';
                  outcomeColor = 'text-emerald-400 font-bold';
                } else if (item.trueLabel === 0 && predicted === 1) {
                  outcomeLabel = 'FP';
                  outcomeColor = 'text-amber-400 font-bold';
                } else if (item.trueLabel === 1 && predicted === 0) {
                  outcomeLabel = 'FN';
                  outcomeColor = 'text-red-400 font-bold';
                }

                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2 text-muted-dark">{item.id}</td>
                    <td className="px-4 py-2 text-primary font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-muted">{item.category}</td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.trueLabel === 1 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-muted'}`}>
                        {item.trueLabel === 1 ? 'Critical (1)' : 'Non-critical (0)'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-primary font-bold">
                      {item.modelScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={predicted === 1 ? 'text-accent font-semibold' : 'text-muted-dark'}>
                        {predicted === 1 ? 'Positive' : 'Negative'}
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-right ${outcomeColor}`}>
                      {outcomeLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
