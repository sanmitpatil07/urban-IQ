import React from 'react';
import { 
  Bell, 
  Trees, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Activity,
  Info
} from 'lucide-react';
import { ResilienceGauge } from './ResilienceGauge';

export const RightRail = ({
  alerts = [],
  onSelectWard,
  cityResilienceScore = 62,
  currentCity = 'Pune',
  wards = []
}) => {
  // Compute aggregated stats
  const meanNdvi = wards.length > 0
    ? Number((wards.reduce((acc, w) => acc + (w.ndviIndex || w.ndvi || 0.2), 0) / wards.length).toFixed(2))
    : 0.24;

  const totalGridLoadMw = wards.length > 0
    ? Math.round(wards.reduce((acc, w) => acc + (w.gridLoadMw || 45), 0))
    : 620;

  const totalVulnerablePop = wards.length > 0
    ? Math.round(wards.reduce((acc, w) => acc + ((w.population || 80000) * ((w.vulnerablePopPct || 35) / 100)), 0))
    : 480000;

  const getSeverityBorder = (sev) => {
    switch (sev) {
      case 'critical': return 'border-l-[#C81E3A] bg-[#C81E3A]/5';
      case 'high': return 'border-l-[#E8632B] bg-[#E8632B]/5';
      case 'moderate': return 'border-l-[#F2A93B] bg-[#F2A93B]/5';
      default: return 'border-l-[#2FB8AC] bg-[#2FB8AC]/5';
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical': return { text: 'CRITICAL', bg: '#C81E3A' };
      case 'high': return { text: 'HIGH RISK', bg: '#E8632B' };
      case 'moderate': return { text: 'MODERATE', bg: '#F2A93B' };
      default: return { text: 'NOMINAL', bg: '#2FB8AC' };
    }
  };

  return (
    <aside className="w-80 bg-[#131B2E] border-l border-[#263349] flex flex-col h-[calc(100vh-4rem)] z-20 shadow-panel select-none overflow-y-auto">
      {/* Top: City Resilience Gauge */}
      <div className="p-4 border-b border-[#263349]">
        <ResilienceGauge score={cityResilienceScore} city={currentCity} />
      </div>

      {/* Center: 3 Telemetry Metric Bars */}
      <div className="p-4 border-b border-[#263349] space-y-3.5">
        <div className="text-xs font-mono uppercase tracking-wider text-[#8793A8] flex items-center justify-between">
          <span>City Key Telemetry</span>
          <Activity className="w-3.5 h-3.5 text-[#2FB8AC]" />
        </div>

        {/* Metric Bar 1: Vegetation Cover (NDVI) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#EDF1F7] font-medium flex items-center space-x-1.5">
              <Trees className="w-3.5 h-3.5 text-[#2FB8AC]" />
              <span>Vegetation Canopy Index</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#EDF1F7]">{meanNdvi} <span className="text-[#8793A8] font-normal">NDVI</span></span>
          </div>
          <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-[#263349]">
            <div 
              className="bg-[#2FB8AC] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.min(100, meanNdvi * 200)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#8793A8] mt-1">
            <span>Critical: 0.15</span>
            <span>Target: 0.40</span>
          </div>
        </div>

        {/* Metric Bar 2: DISCOM Grid Cooling Load */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#EDF1F7] font-medium flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-[#F2A93B]" />
              <span>Grid Cooling Load Stress</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#F2A93B]">{totalGridLoadMw} <span className="text-[#8793A8] font-normal">MW</span></span>
          </div>
          <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-[#263349]">
            <div 
              className="bg-[#F2A93B] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.min(100, (totalGridLoadMw / 900) * 100)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#8793A8] mt-1">
            <span>Baseline: 420 MW</span>
            <span className="text-[#E8632B]">Transformer Cap: 850 MW</span>
          </div>
        </div>

        {/* Metric Bar 3: Vulnerable Population Covered */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#EDF1F7] font-medium flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2FB8AC]" />
              <span>Vulnerable Heat Exposure</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#EDF1F7]">{totalVulnerablePop.toLocaleString()} <span className="text-[#8793A8] font-normal">citizens</span></span>
          </div>
          <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-[#263349]">
            <div 
              className="bg-gradient-to-r from-[#2FB8AC] to-[#E8632B] h-full transition-all duration-500 rounded-full" 
              style={{ width: '68%' }} 
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#8793A8] mt-1">
            <span>Elderly & Low-Income Areas</span>
            <span>68% Covered</span>
          </div>
        </div>
      </div>

      {/* Bottom: Live Satellite & Thermal Alerts Feed */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#8793A8]">
            <Bell className="w-3.5 h-3.5 text-[#2FB8AC]" />
            <span>Thermal Alerts & Ops Feed</span>
          </div>
          <span className="text-[10px] font-mono text-[#E8632B] bg-[#E8632B]/10 px-1.5 py-0.5 rounded border border-[#E8632B]/30">
            {alerts.length} ALERTS
          </span>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {alerts.map(alert => {
            const badge = getSeverityBadge(alert.severity);
            return (
              <div
                key={alert.id}
                onClick={() => alert.wardId && onSelectWard && onSelectWard(alert.wardId)}
                className={`p-3 rounded border-l-4 border border-t-[#263349] border-r-[#263349] border-b-[#263349] hover:bg-[#1B2740] cursor-pointer transition-all ${getSeverityBorder(alert.severity)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-[#0B1220]"
                    style={{ backgroundColor: badge.bg }}
                  >
                    {badge.text}
                  </span>
                  <span className="text-[10px] font-mono text-[#8793A8]">{alert.timestamp}</span>
                </div>

                <div className="font-semibold text-xs text-[#EDF1F7] mb-1 flex items-center justify-between">
                  <span>{alert.title}</span>
                  {alert.wardId && <ChevronRight className="w-3.5 h-3.5 text-[#8793A8]" />}
                </div>

                <p className="text-[11px] text-[#8793A8] leading-tight mb-2">
                  {alert.description}
                </p>

                {alert.actionableText && (
                  <div className="text-[10px] font-mono text-[#2FB8AC] bg-[#0B1220] p-1.5 rounded border border-[#263349] flex items-start space-x-1.5">
                    <Info className="w-3 h-3 text-[#2FB8AC] flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{alert.actionableText}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
