import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Satellite, 
  Clock, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export const TimelineScrubber = ({
  passes = [],
  selectedPassIndex = 0,
  onSelectPassIndex
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isPlaying && passes.length > 0) {
      timer = setInterval(() => {
        if (onSelectPassIndex) {
          onSelectPassIndex((prevIndex) => {
            if (prevIndex === 0) {
              return passes.length - 1;
            }
            return prevIndex - 1;
          });
        }
      }, 2400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, passes.length, onSelectPassIndex]);

  const activePass = passes[selectedPassIndex] || passes[0] || {
    id: 'LIVE',
    satellite: 'Landsat-9 / Sentinel-2',
    sensor: 'Thermal & Multispectral',
    timestamp: '2026-04-14 10:57 IST',
    meanCityLst: 36.4,
    maxLstRecorded: 42.1
  };

  return (
    <div className="bg-[#131B2E] border-t border-[#263349] p-3 shadow-panel z-20 select-none relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Telemetry & Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                isPlaying 
                  ? 'bg-[#E8632B] text-[#EDF1F7] shadow-lg' 
                  : 'bg-[#2FB8AC] hover:bg-[#269B91] text-[#0B1220] shadow-cyan-glow'
              }`}
              title={isPlaying ? 'Pause timeline playback' : 'Play satellite revisit sequence'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">Pause Orbit</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">Play Orbit</span>
                </>
              )}
            </button>

            {/* Stepper Buttons */}
            <div className="flex items-center space-x-1 bg-[#0B1220] border border-[#263349] rounded p-1">
              <button
                onClick={() => onSelectPassIndex && onSelectPassIndex(Math.min(passes.length - 1, selectedPassIndex + 1))}
                disabled={selectedPassIndex === passes.length - 1}
                className="p-1 text-[#8793A8] hover:text-[#EDF1F7] disabled:opacity-30"
                title="Previous older satellite pass"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectPassIndex && onSelectPassIndex(Math.max(0, selectedPassIndex - 1))}
                disabled={selectedPassIndex === 0}
                className="p-1 text-[#8793A8] hover:text-[#EDF1F7] disabled:opacity-30"
                title="Next newer satellite pass"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Satellite Telemetry Tag */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono bg-[#0B1220] border border-[#263349] px-3 py-1.5 rounded">
            <Satellite className="w-4 h-4 text-[#2FB8AC]" />
            <span className="text-[#8793A8]">Sensor:</span>
            <span className="text-[#EDF1F7] font-semibold">{activePass.satellite}</span>
            <span className="text-[#2FB8AC] font-bold ml-2">Mean LST: {activePass.meanCityLst}°C</span>
          </div>
        </div>

        {/* Center: Horizontal Scrubber Bar */}
        <div className="flex-1 w-full px-2">
          <div className="relative flex items-center justify-between mb-1.5 text-[10px] font-mono text-[#8793A8]">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#2FB8AC]" />
              <span>SATELLITE REVISIT TIMELINE (ECOSTRESS / LANDSAT / SENTINEL)</span>
            </span>
            <span className="text-[#2FB8AC] font-bold">
              {activePass.timestamp}
            </span>
          </div>

          <div className="relative w-full h-8 flex items-center">
            <div className="absolute left-0 right-0 h-2 bg-[#0B1220] border border-[#263349] rounded-full" />
            
            <div 
              className="absolute left-0 h-2 bg-[#2FB8AC] rounded-full transition-all duration-300"
              style={{
                width: passes.length > 1 
                  ? `${((passes.length - 1 - selectedPassIndex) / (passes.length - 1)) * 100}%`
                  : '100%'
              }}
            />

            <div className="relative w-full flex items-center justify-between z-10 px-1">
              {passes.slice().reverse().map((pass, idx) => {
                const realIndex = passes.length - 1 - idx;
                const isSelected = selectedPassIndex === realIndex;

                return (
                  <button
                    key={pass.id}
                    onClick={() => {
                      setIsPlaying(false);
                      if (onSelectPassIndex) onSelectPassIndex(realIndex);
                    }}
                    className="group relative flex flex-col items-center focus:outline-none"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#2FB8AC] border-[#EDF1F7] shadow-cyan-glow scale-125'
                        : 'bg-[#131B2E] border-[#263349] hover:border-[#2FB8AC]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0B1220]' : 'bg-[#8793A8]'}`} />
                    </div>

                    <div className="absolute bottom-7 hidden group-hover:flex flex-col items-center z-30">
                      <div className="bg-[#0B1220] border border-[#263349] text-[#EDF1F7] text-[10px] font-mono px-2 py-1 rounded shadow-panel-raised whitespace-nowrap">
                        <div className="font-semibold text-[#2FB8AC]">{pass.satellite}</div>
                        <div>{pass.timestamp}</div>
                        <div>Max LST: {pass.maxLstRecorded}°C</div>
                      </div>
                      <div className="w-2 h-2 bg-[#0B1220] border-r border-b border-[#263349] rotate-45 -mt-1" />
                    </div>

                    <span className={`text-[9px] font-mono mt-1 transition-colors ${
                      isSelected ? 'text-[#2FB8AC] font-bold' : 'text-[#8793A8]'
                    }`}>
                      {pass.timestamp.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Legend */}
        <div className="hidden xl:flex items-center space-x-2 text-[10px] font-mono bg-[#0B1220] border border-[#263349] px-2.5 py-1.5 rounded">
          <span className="text-[#8793A8]">HEAT:</span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2FB8AC]" />
            <span className="text-[#2FB8AC]">Cool</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2A93B]" />
            <span className="text-[#F2A93B]">Mod</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8632B]" />
            <span className="text-[#E8632B]">High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C81E3A]" />
            <span className="text-[#C81E3A]">Crit</span>
          </span>
        </div>

      </div>
    </div>
  );
};
