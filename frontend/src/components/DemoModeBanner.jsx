import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, RefreshCw } from 'lucide-react';

export const DemoModeBanner = ({ isMock = true, city = 'Pune', onRetry = null }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 600);
    }
  };

  if (!isMock && !isDismissed) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-xs font-sans text-slate-800 shadow-xs relative z-40 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Mode: FastAPI Connected</span>
            </div>
            <p className="text-slate-600 text-[11px] truncate">
              Live Landsat-9/Sentinel-2 satellite grid & Physics-Informed ML inference active for <span className="text-slate-900 font-semibold">{city}</span>.
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/50 rounded transition-colors flex-shrink-0"
            title="Dismiss status"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isDismissed || !isMock) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 text-xs font-mono text-amber-900 shadow-xs relative z-40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>DEMO MODE ACTIVE</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-[11px] text-amber-950">
              Unable to reach live FastAPI backend for {city}
            </p>
            <p className="text-[10px] text-amber-800 hidden sm:block truncate">
              Displaying municipal baseline sample dataset.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 border border-amber-400 text-amber-950 rounded text-[11px] font-bold flex items-center space-x-1 transition-colors disabled:opacity-50"
              title="Retry connection"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Retry API'}</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
