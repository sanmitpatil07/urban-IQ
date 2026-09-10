import React, { useState } from 'react';
import { AlertTriangle, Database, Info, X, CheckCircle2, Server, RefreshCw } from 'lucide-react';

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
      <div className="bg-[#131B2E]/95 border-b border-[#2FB8AC]/40 px-4 py-1.5 text-xs font-mono text-[#EDF1F7] shadow-panel relative z-40 backdrop-blur-md animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#2FB8AC]/15 border border-[#2FB8AC]/40 text-[#2FB8AC] font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FB8AC] animate-ping" />
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2FB8AC]" />
              <span>Live Mode: FastAPI Connected</span>
            </div>
            <p className="text-[#8793A8] text-[11px] truncate">
              Live Landsat-9/Sentinel-2 satellite grid & Physics-Informed ML inference active for <span className="text-[#EDF1F7] font-semibold">{city}</span>.
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] rounded transition-colors flex-shrink-0"
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
    <div className="bg-[#1E1711]/95 border-b border-[#F2A93B]/60 px-4 py-2 text-xs font-mono text-[#EDF1F7] shadow-panel relative z-40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Status Badge + Explanation */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#F2A93B]/20 border border-[#F2A93B]/50 text-[#F2A93B] font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B] animate-ping" />
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Demo Mode: Fallback Sample Data</span>
          </div>

          <p className="text-[#D1D5DB] text-[11px] truncate">
            Backend API endpoint unreachable for <code className="text-[#F2A93B] bg-[#0B1220] px-1 py-0.5 rounded border border-[#263349]">{city}</code>. Currently rendering offline municipal baseline sample dataset.
          </p>
        </div>

        {/* Right Action & Dismiss */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center space-x-1 text-[10px] font-bold text-[#F2A93B] bg-[#F2A93B]/10 hover:bg-[#F2A93B]/20 border border-[#F2A93B]/40 px-2 py-1 rounded transition-all"
              title="Retry connection to backend"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Connecting...' : 'Retry API'}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1 text-[10px] text-[#8793A8] bg-[#0B1220] px-2 py-1 rounded border border-[#263349]">
            <Server className="w-3 h-3 text-[#F2A93B]" />
            <span>Mock Dataset Active</span>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] rounded transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModeBanner;
