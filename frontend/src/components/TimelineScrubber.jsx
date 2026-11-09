import React, { useState, useEffect } from 'react';

export const TimelineScrubber = ({
  passes = [],
  _selectedPassIndex = 0,
  onSelectPassIndex,
  onSimulateHorizon
}) => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);

  const HORIZON_STEPS = [
    {
      year: 2022,
      title: '2022 • Pre-Mitigation Baseline',
      desc: 'Historical heatwave audit (+3.8°C anomaly)',
      passIndex: 2
    },
    {
      year: 2023,
      title: '2023 • Canopy Deficit Audit',
      desc: 'Sentinel-2 multi-spectral NDVI classification',
      passIndex: 1
    },
    {
      year: 2024,
      title: '2024 • Cool Roof Mandate [ACTIVE]',
      desc: 'Municipal Civic Resolution execution',
      passIndex: 0
    },
    {
      year: 2025,
      title: '2025 • Net Heat Target Impact',
      desc: 'Projected -2.4°C daytime mean cooling',
      passIndex: 0
    }
  ];

  useEffect(() => {
    let timer = null;
    if (isPlaying && passes.length > 0) {
      timer = setInterval(() => {
        if (onSelectPassIndex) {
          onSelectPassIndex((prevIndex) => {
            if (prevIndex === 0) return passes.length - 1;
            return prevIndex - 1;
          });
        }
      }, 2500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, passes.length, onSelectPassIndex]);

  const handleSelectYear = (step) => {
    setSelectedYear(step.year);
    if (onSelectPassIndex && passes.length > step.passIndex) {
      onSelectPassIndex(step.passIndex);
    }
  };

  return (
    <div className="relative z-20 w-full bg-white py-2 px-3 sm:px-4 shadow-md flex flex-col md:flex-row items-center justify-between border-t border-slate-200 gap-2 select-none text-slate-800">
      {/* Timeline Stage Segments */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full md:max-w-4xl overflow-x-auto pb-1 md:pb-0">
        <div className="flex items-center gap-1.5 shrink-0 pr-1 border-r border-slate-200">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded transition-all flex items-center justify-center ${
              isPlaying 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={isPlaying ? 'Pause timeline playback' : 'Play satellite revisit sequence'}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <span className="font-sans text-[11px] text-slate-500 uppercase font-bold hidden sm:inline">
            Horizon:
          </span>
        </div>

        {HORIZON_STEPS.map((step) => {
          const isActive = selectedYear === step.year;
          return (
            <button
              key={step.year}
              onClick={() => handleSelectYear(step)}
              className={`timeline-step flex flex-col text-left px-2.5 py-1 rounded transition-all shrink-0 border ${
                isActive
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className={`font-sans text-xs font-bold leading-tight ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                {step.title}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Quick Trigger */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <button
          onClick={onSimulateHorizon}
          className="px-3 py-1.5 bg-emerald-700 text-white font-sans text-xs font-bold rounded hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-xs"
          title="Simulate Future Cooling Levers"
        >
          <span className="material-symbols-outlined text-[15px]">model_training</span>
          <span>Simulate Horizon</span>
        </button>
      </div>
    </div>
  );
};
