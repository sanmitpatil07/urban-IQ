import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Sparkles, Activity } from 'lucide-react';

export const OptimizingOverlay = ({
  isOptimizing,
  wards = [],
  onComplete
}) => {
  const isSingleWard = wards.length === 1;
  const singleWard = isSingleWard ? wards[0] : null;

  const [evaluatedWardIndex, setEvaluatedWardIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const displayWards = isSingleWard 
    ? [singleWard] 
    : (wards.length > 0 ? wards.slice(0, 10) : [
        { id: 'Z-101', name: 'Kothrud Central' },
        { id: 'Z-104', name: 'Shivajinagar Station' },
        { id: 'Z-109', name: 'Hadapsar Industrial' },
        { id: 'Z-115', name: 'Hinjawadi IT Phase 1' },
        { id: 'Z-122', name: 'Viman Nagar' },
        { id: 'Z-130', name: 'Swargate Bus Terminal' },
        { id: 'Z-142', name: 'Pimpri MIDC' },
        { id: 'Z-156', name: 'Kalyani Nagar' }
      ]);

  useEffect(() => {
    if (!isOptimizing) {
      setEvaluatedWardIndex(0);
      setProgressPct(0);
      return;
    }

    const intervalMs = isSingleWard ? 180 : 130;
    const totalSteps = isSingleWard ? 6 : displayWards.length;
    
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
  }, [isOptimizing, displayWards.length, onComplete, isSingleWard]);

  if (!isOptimizing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-all text-slate-800 select-none">
      <div className="w-full max-w-lg bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-700 animate-pulse" />

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs">
            <Cpu className="w-6 h-6 animate-spin text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {isSingleWard ? 'Targeted Ward Solver' : 'Metropolitan Multi-Ward'}
              </span>
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight">
              {isSingleWard ? `OPTIMIZING: ${singleWard?.name || singleWard?.id}` : 'AI METROPOLITAN COOLING OPTIMIZER'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSingleWard 
                ? `Calibrating localized microclimate physics & budget for ${singleWard?.name}...`
                : 'Evaluating city-wide thermal flux, NDBI/NDVI & Pareto frontier...'}
            </p>
          </div>
        </div>

        {/* Real-time scanning ticker */}
        <div className="bg-white border border-[#EAE6DF] rounded-lg p-3 mb-4 font-sans text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center space-x-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-800" />
              <span>{isSingleWard ? 'Simulating Ward Cooling Solutions:' : 'Scanning City Wards & Zones:'}</span>
            </span>
            <span className="text-emerald-800 font-mono font-bold">{progressPct}%</span>
          </div>

          <div className="text-slate-900 font-bold text-sm truncate flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>
              {isSingleWard 
                ? (progressPct < 30 ? 'Thermal Infrared Boundary Layer' : progressPct < 65 ? 'Cool Roof SRI > 104 Coating' : 'Canopy Evaporative Transpiration')
                : (displayWards[Math.min(evaluatedWardIndex, displayWards.length - 1)]?.name || 'Metropolitan Region')}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              [{isSingleWard ? (singleWard?.id || singleWard?.zone_id) : (displayWards[Math.min(evaluatedWardIndex, displayWards.length - 1)]?.id || 'Z-00')}]
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-700 h-full rounded-full transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Diagnostics checklist */}
        <div className="space-y-1.5 font-sans text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 20 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 20 ? 'text-slate-800 font-semibold' : ''}>
              {isSingleWard ? 'Ward-specific Landsat-9 surface radiometry loaded' : 'Landsat 9 thermal band radiometry ingested'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 50 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 50 ? 'text-slate-800 font-semibold' : ''}>
              {isSingleWard ? 'Local albedo deficit & building envelope modeled' : 'Albedo deficit & vegetative evapotranspiration calculated'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progressPct > 80 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={progressPct > 80 ? 'text-slate-800 font-semibold' : ''}>
              {isSingleWard ? 'Local microclimate ΔT cooling drop synthesized' : 'Knapsack Pareto frontier synthesized'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-[11px] font-sans text-slate-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Physics-Informed HistGradientBoosting</span>
          </span>
          <span className="text-emerald-800 font-mono font-bold">SOLVING...</span>
        </div>
      </div>
    </div>
  );
};
