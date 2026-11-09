import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Sparkles, Activity } from 'lucide-react';

export const OptimizingOverlay = ({
  isOptimizing,
  wards = [],
  onComplete
}) => {
  const [evaluatedWardIndex, setEvaluatedWardIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const displayWards = wards.length > 0 ? wards.slice(0, 10) : [
    { id: 'Z-101', name: 'Kothrud Central' },
    { id: 'Z-104', name: 'Shivajinagar Station' },
    { id: 'Z-109', name: 'Hadapsar Industrial' },
    { id: 'Z-115', name: 'Hinjawadi IT Phase 1' },
    { id: 'Z-122', name: 'Viman Nagar' },
    { id: 'Z-130', name: 'Swargate Bus Terminal' },
    { id: 'Z-142', name: 'Pimpri MIDC' },
    { id: 'Z-156', name: 'Kalyani Nagar' }
  ];

  useEffect(() => {
    if (!isOptimizing) {
      setEvaluatedWardIndex(0);
      setProgressPct(0);
      return;
    }

    const intervalMs = 140;
    const totalSteps = displayWards.length;
    
    const timer = setInterval(() => {
      setEvaluatedWardIndex((prev) => {
        const next = prev + 1;
        const currentPct = Math.min(100, Math.round((next / totalSteps) * 100));
        setProgressPct(currentPct);

        if (next >= totalSteps) {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 350);
          return totalSteps;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOptimizing, displayWards.length, onComplete]);

  if (!isOptimizing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-all text-slate-800">
      <div className="w-full max-w-lg bg-white border border-slate-300 rounded-lg p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 animate-pulse" />

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Cpu className="w-6 h-6 animate-spin text-emerald-700" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight">
              AI PHYSICS COOLING OPTIMIZER RUNNING
            </h3>
            <p className="text-xs text-slate-500">
              Evaluating thermal flux & marginal cooling ROI per rupee...
            </p>
          </div>
        </div>

        {/* Real-time scanning ticker */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-4 font-sans text-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evaluating Ward Cadastre:</span>
            </span>
            <span className="text-emerald-700 font-mono font-bold">{progressPct}%</span>
          </div>

          <div className="text-slate-900 font-bold text-sm truncate flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>
              {displayWards[Math.min(evaluatedWardIndex, displayWards.length - 1)]?.name || 'Municipal Grid'}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              [{displayWards[Math.min(evaluatedWardIndex, displayWards.length - 1)]?.id || 'Z-00'}]
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Diagnostics checklist */}
        <div className="space-y-1.5 font-sans text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 20 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 20 ? 'text-slate-800 font-medium' : ''}>
              Landsat 9 thermal band radiometry ingested
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 50 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 50 ? 'text-slate-800 font-medium' : ''}>
              Albedo deficit & vegetative evapotranspiration calculated
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 80 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 80 ? 'text-slate-800 font-medium' : ''}>
              Knapsack Pareto frontier synthesized
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans text-slate-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Physics-Informed HistGradientBoosting</span>
          </span>
          <span className="text-emerald-700 font-mono font-bold">SOLVING...</span>
        </div>
      </div>
    </div>
  );
};
