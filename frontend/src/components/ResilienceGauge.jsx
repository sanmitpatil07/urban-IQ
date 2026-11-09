import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const ResilienceGauge = ({ score = 62, city = 'Pune', scenarioParams = {} }) => {
  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGaugeColor = (val) => {
    if (val < 40) return '#b8431e'; // Terracotta critical
    if (val < 65) return '#d97736'; // Amber moderate
    return '#2e5a44'; // Deep forest green resilient
  };

  const color = getGaugeColor(score);

  // Projected score improvement from scenario levers
  const treeGain = Math.round((scenarioParams.treeCanopyIncreasePct || 0) * 0.15);
  const roofGain = Math.round((scenarioParams.coolRoofCoveragePct || 0) * 0.1);
  const projectedBonus = Math.min(25, treeGain + roofGain);

  return (
    <div className="bg-white border border-slate-200 rounded p-3 relative overflow-hidden flex flex-col items-center justify-center text-slate-800 shadow-xs">
      <div className="w-full flex items-center justify-between text-[10px] font-sans text-slate-500 uppercase tracking-wider mb-1 font-bold">
        <span>City Resilience Index</span>
        <span className="font-bold text-slate-900">{city}</span>
      </div>

      <div className="relative flex flex-col items-center justify-center -mb-4 mt-1">
        <svg height={radius * 1.3} width={radius * 2.2} className="rotate-0 overflow-visible">
          {/* Background Track */}
          <path
            d={`M ${radius * 0.2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2.0} ${radius}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Colored Progress Arc */}
          <path
            d={`M ${radius * 0.2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2.0} ${radius}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute top-7 text-center">
          <div className="font-sans text-3xl font-extrabold text-slate-900 leading-none">
            {score}
            <span className="text-xs text-slate-500 font-sans font-normal">/100</span>
          </div>
          <div className="text-[10px] font-sans uppercase tracking-wider mt-1 font-bold" style={{ color }}>
            {score < 40 ? 'HEAT VULNERABLE' : score < 65 ? 'MODERATE SHIELD' : 'HIGHLY RESILIENT'}
          </div>
        </div>
      </div>

      <div className="w-full mt-6 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
          <span>Baseline: {score}/100</span>
        </span>
        <span className="text-emerald-700 font-bold">
          +{projectedBonus} pts projected
        </span>
      </div>
    </div>
  );
};
