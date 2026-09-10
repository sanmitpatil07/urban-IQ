import React from 'react';
import { 
  Layers, 
  ThermometerSun, 
  Trees, 
  Users, 
  Zap, 
  Cpu, 
  TrendingDown, 
  Play, 
  IndianRupee,
  RotateCcw,
  Sparkles,
  MapPin,
  Edit3,
  TreePine,
  Square,
  Download,
  Trash2
} from 'lucide-react';

export const LeftRail = ({
  isOpen = true,
  activeLayers = {
    lstHeat: true,
    ndviVegetation: true,
    driverAttribution: false,
    populationDensity: false,
    discomGrid: false,
  },
  onToggleLayer,
  scenarioParams = {
    treeCanopyIncreasePct: 15,
    coolRoofCoveragePct: 35,
    reflectivePavementAreaPct: 20,
    budgetInrLakhs: 250,
  },
  onChangeScenario,
  onRunOptimizer,
  isOptimizing = false,
  // Spatial drawing tool props
  interactionMode = 'select',
  setInteractionMode,
  onClearAll,
  onExportGeoJSON,
  hasDrawnElements = false,
  selectedZonesCount = 0
}) => {
  if (!isOpen) return null;

  // Live calculation preview
  const treeCooling = scenarioParams.treeCanopyIncreasePct * 0.06;
  const roofCooling = scenarioParams.coolRoofCoveragePct * 0.035;
  const paveCooling = scenarioParams.reflectivePavementAreaPct * 0.025;
  const rawTotalCooling = treeCooling + roofCooling + paveCooling;
  const budgetFactor = Math.min(1.0, scenarioParams.budgetInrLakhs / 300);
  const liveProjectedCoolingDegC = Number((rawTotalCooling * (0.4 + 0.6 * budgetFactor)).toFixed(2));
  
  const liveCoolingPer10L = scenarioParams.budgetInrLakhs > 0
    ? ((liveProjectedCoolingDegC / scenarioParams.budgetInrLakhs) * 10).toFixed(3)
    : '0.000';

  const formatBudgetDisplay = (lakhs) => {
    if (lakhs >= 100) {
      return `₹ ${(lakhs / 100).toFixed(2)} Cr`;
    }
    return `₹ ${lakhs} Lakhs`;
  };

  const resetScenario = () => {
    if (onChangeScenario) {
      onChangeScenario(() => ({
        treeCanopyIncreasePct: 15,
        coolRoofCoveragePct: 35,
        reflectivePavementAreaPct: 20,
        budgetInrLakhs: 250
      }));
    }
  };

  return (
    <aside className="w-80 bg-[#131B2E] border-r border-[#263349] flex flex-col h-[calc(100vh-4rem)] z-20 shadow-panel select-none overflow-y-auto">
      {/* Section 1: Spatial Tools & Intervention Brush */}
      <div className="p-4 border-b border-[#263349]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#8793A8]">
            <MapPin className="w-3.5 h-3.5 text-[#2FB8AC]" />
            <span>Interactive Map Tools</span>
          </div>
          {selectedZonesCount > 0 && (
            <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded border border-[#2FB8AC]/30">
              {selectedZonesCount} SELECTED
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            onClick={() => setInteractionMode && setInteractionMode('select')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-all ${
              interactionMode === 'select'
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#2FB8AC]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <span>Point Select</span>
          </button>

          <button
            onClick={() => setInteractionMode && setInteractionMode('lasso')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-all ${
              interactionMode === 'lasso'
                ? 'bg-[#1B2740] border-[#c084fc] text-[#c084fc]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Lasso Tool</span>
          </button>

          <button
            onClick={() => setInteractionMode && setInteractionMode('point')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-all ${
              interactionMode === 'point'
                ? 'bg-[#1B2740] border-[#4ade80] text-[#4ade80]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>Plant Tree</span>
          </button>

          <button
            onClick={() => setInteractionMode && setInteractionMode('polygon')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-xs font-medium border transition-all ${
              interactionMode === 'polygon'
                ? 'bg-[#1B2740] border-[#4ade80] text-[#4ade80]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Green Area</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onClearAll}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded text-[11px] font-mono bg-[#0B1220] hover:bg-[#1B2740] border border-[#263349] text-[#8793A8] hover:text-[#EDF1F7] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Marks</span>
          </button>

          {hasDrawnElements && (
            <button
              onClick={onExportGeoJSON}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded text-[11px] font-mono bg-[#2FB8AC]/10 hover:bg-[#2FB8AC]/20 border border-[#2FB8AC]/40 text-[#2FB8AC] transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>GeoJSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 2: Satellite GIS Layer Toggles */}
      <div className="p-4 border-b border-[#263349]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#8793A8]">
            <Layers className="w-3.5 h-3.5 text-[#2FB8AC]" />
            <span>Satellite Telemetry Layers</span>
          </div>
          <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded border border-[#2FB8AC]/30">
            5 ACTIVE
          </span>
        </div>

        <div className="space-y-1.5">
          {/* Layer 1: LST Heat Anomaly */}
          <button
            onClick={() => onToggleLayer && onToggleLayer('lstHeat')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all border ${
              activeLayers.lstHeat
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#EDF1F7]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ThermometerSun className={`w-4 h-4 ${activeLayers.lstHeat ? 'text-[#E8632B]' : 'text-[#8793A8]'}`} />
              <span className="font-medium">LST Surface Heat Layer</span>
            </div>
            <div className={`w-3 h-3 rounded-full border ${activeLayers.lstHeat ? 'bg-[#2FB8AC] border-[#2FB8AC]' : 'border-[#8793A8]'}`} />
          </button>

          {/* Layer 2: NDVI Vegetation Index */}
          <button
            onClick={() => onToggleLayer && onToggleLayer('ndviVegetation')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all border ${
              activeLayers.ndviVegetation
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#EDF1F7]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Trees className={`w-4 h-4 ${activeLayers.ndviVegetation ? 'text-[#2FB8AC]' : 'text-[#8793A8]'}`} />
              <span className="font-medium">NDVI Tree Canopy Density</span>
            </div>
            <div className={`w-3 h-3 rounded-full border ${activeLayers.ndviVegetation ? 'bg-[#2FB8AC] border-[#2FB8AC]' : 'border-[#8793A8]'}`} />
          </button>

          {/* Layer 3: Driver Attribution */}
          <button
            onClick={() => onToggleLayer && onToggleLayer('driverAttribution')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all border ${
              activeLayers.driverAttribution
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#EDF1F7]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Cpu className={`w-4 h-4 ${activeLayers.driverAttribution ? 'text-[#F2A93B]' : 'text-[#8793A8]'}`} />
              <span className="font-medium">Physics Heat Drivers</span>
            </div>
            <div className={`w-3 h-3 rounded-full border ${activeLayers.driverAttribution ? 'bg-[#2FB8AC] border-[#2FB8AC]' : 'border-[#8793A8]'}`} />
          </button>

          {/* Layer 4: Vulnerable Population */}
          <button
            onClick={() => onToggleLayer && onToggleLayer('populationDensity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all border ${
              activeLayers.populationDensity
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#EDF1F7]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Users className={`w-4 h-4 ${activeLayers.populationDensity ? 'text-[#EDF1F7]' : 'text-[#8793A8]'}`} />
              <span className="font-medium">Vulnerable Population</span>
            </div>
            <div className={`w-3 h-3 rounded-full border ${activeLayers.populationDensity ? 'bg-[#2FB8AC] border-[#2FB8AC]' : 'border-[#8793A8]'}`} />
          </button>

          {/* Layer 5: DISCOM Grid Stress */}
          <button
            onClick={() => onToggleLayer && onToggleLayer('discomGrid')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all border ${
              activeLayers.discomGrid
                ? 'bg-[#1B2740] border-[#2FB8AC] text-[#EDF1F7]'
                : 'bg-[#0B1220] border-[#263349] text-[#8793A8] hover:border-[#3A4D6E]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Zap className={`w-4 h-4 ${activeLayers.discomGrid ? 'text-[#F2A93B]' : 'text-[#8793A8]'}`} />
              <span className="font-medium">DISCOM Substation Stress</span>
            </div>
            <div className={`w-3 h-3 rounded-full border ${activeLayers.discomGrid ? 'bg-[#2FB8AC] border-[#2FB8AC]' : 'border-[#8793A8]'}`} />
          </button>
        </div>
      </div>

      {/* Section 3: Cooling Scenario Simulator */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#8793A8]">
              <Sparkles className="w-3.5 h-3.5 text-[#2FB8AC]" />
              <span>Cooling Scenario Simulator</span>
            </div>
            <button
              onClick={resetScenario}
              className="text-[10px] font-mono text-[#8793A8] hover:text-[#2FB8AC] flex items-center space-x-1 transition-colors"
              title="Reset parameters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Intervention Sliders */}
          <div className="space-y-3">
            {/* Slider 1: Tree Canopy % */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8793A8] font-medium flex items-center space-x-1.5">
                  <Trees className="w-3.5 h-3.5 text-[#2FB8AC]" />
                  <span>Tree Canopy Target</span>
                </span>
                <span className="font-mono text-[#2FB8AC] font-bold">
                  +{scenarioParams.treeCanopyIncreasePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={scenarioParams.treeCanopyIncreasePct}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onChangeScenario) onChangeScenario(prev => ({ ...prev, treeCanopyIncreasePct: val }));
                }}
                className="w-full"
              />
            </div>

            {/* Slider 2: Cool Roof Coverage % */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8793A8] font-medium flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2FB8AC]" />
                  <span>Cool Roof Coating</span>
                </span>
                <span className="font-mono text-[#2FB8AC] font-bold">
                  {scenarioParams.coolRoofCoveragePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scenarioParams.coolRoofCoveragePct}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onChangeScenario) onChangeScenario(prev => ({ ...prev, coolRoofCoveragePct: val }));
                }}
                className="w-full"
              />
            </div>

            {/* Slider 3: Reflective Pavement Area % */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8793A8] font-medium flex items-center space-x-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-[#2FB8AC]" />
                  <span>Reflective Pavement</span>
                </span>
                <span className="font-mono text-[#2FB8AC] font-bold">
                  {scenarioParams.reflectivePavementAreaPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={scenarioParams.reflectivePavementAreaPct}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onChangeScenario) onChangeScenario(prev => ({ ...prev, reflectivePavementAreaPct: val }));
                }}
                className="w-full"
              />
            </div>

            {/* Budget Input (INR Lakhs) */}
            <div className="pt-2 border-t border-[#263349]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="text-[#8793A8] font-medium flex items-center space-x-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-[#2FB8AC]" />
                  <span>Budget Allocation (₹)</span>
                </label>
                <span className="font-mono text-[#2FB8AC] font-bold">
                  {formatBudgetDisplay(scenarioParams.budgetInrLakhs)}
                </span>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono text-xs text-[#8793A8]">₹ Lakhs</span>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={scenarioParams.budgetInrLakhs}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    if (onChangeScenario) onChangeScenario(prev => ({ ...prev, budgetInrLakhs: val }));
                  }}
                  className="w-full bg-[#0B1220] border border-[#263349] focus:border-[#2FB8AC] text-xs font-mono text-[#EDF1F7] pl-20 pr-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#2FB8AC] transition-all"
                  placeholder="250"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="mt-4 bg-[#0B1220] border border-[#263349] rounded p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#2FB8AC]/5 rounded-bl-full pointer-events-none" />
          
          <div className="text-[10px] font-mono uppercase text-[#8793A8] mb-1 flex items-center justify-between">
            <span>Projected Impact Preview</span>
            <span className="text-[#2FB8AC] animate-pulse">LIVE CALC</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-xl font-bold text-[#EDF1F7] flex items-baseline space-x-1">
                <span>-{liveProjectedCoolingDegC}°C</span>
                <span className="text-xs font-normal text-[#8793A8]">reduction</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs font-semibold text-[#2FB8AC]">
                {liveCoolingPer10L} °C
              </div>
              <div className="text-[9px] font-mono text-[#8793A8]">per ₹10 Lakhs</div>
            </div>
          </div>
        </div>

        {/* Run Optimizer CTA */}
        <button
          onClick={onRunOptimizer}
          disabled={isOptimizing}
          className="mt-4 w-full bg-[#2FB8AC] hover:bg-[#269B91] active:bg-[#1E7D75] text-[#0B1220] font-display font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded shadow-cyan-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-[#0B1220]" />
              <span>Simulating Physics Engine...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Cooling Optimiser</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
