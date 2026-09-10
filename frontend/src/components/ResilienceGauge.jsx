import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const ResilienceGauge = ({ score = 62, city = 'Pune' }) => {
  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGaugeColor = (val) => {
    if (val < 40) return '#C81E3A';
    if (val < 65) return '#F2A93B';
    if (val < 80) return '#2FB8AC';
    return '#2FB8AC';
  };

  const color = getGaugeColor(score);

  return (
    <div className="bg-[#0B1220] border border-[#263349] rounded p-3 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#8793A8] uppercase mb-1">
        <span>City Resilience Index</span>
        <span className="font-semibold text-[#EDF1F7]">{city}</span>
      </div>

      <div className="relative flex flex-col items-center justify-center -mb-4 mt-1">
        <svg height={radius * 1.3} width={radius * 2.2} className="rotate-0 overflow-visible">
          <path
            d={`M ${radius * 0.2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2.0} ${radius}`}
            fill="none"
            stroke="#1B2740"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${radius * 0.2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2.0} ${radius}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
        </svg>

        <div className="absolute top-7 text-center">
          <div className="font-mono text-2xl font-bold text-[#EDF1F7] leading-none">
            {score}
            <span className="text-xs text-[#8793A8] font-normal">/100</span>
          </div>
          <div className="text-[9px] font-mono uppercase tracking-wider mt-1 font-semibold" style={{ color }}>
            {score < 40 ? 'HEAT RISK EXPOSED' : score < 65 ? 'MODERATE SHIELD' : 'HIGHLY RESILIENT'}
          </div>
        </div>
      </div>

      <div className="w-full mt-6 pt-2 border-t border-[#263349] flex items-center justify-between text-[10px] font-mono text-[#8793A8]">
        <div className="flex items-center space-x-1">
          <ShieldAlert className="w-3 h-3 text-[#F2A93B]" />
          <span>Baseline: 54/100</span>
        </div>
        <span className="text-[#2FB8AC] font-semibold">+8 pts projected</span>
      </div>
    </div>
  );
};
