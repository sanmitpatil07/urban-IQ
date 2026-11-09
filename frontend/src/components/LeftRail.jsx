import React, { useState } from 'react';

export const LeftRail = ({
  isOpen = true,
  onClose,
  activeLayers = {
    lstHeat: true,
    ndviVegetation: true,
    driverAttribution: false,
    populationDensity: false,
    discomGrid: false,
  },
  onToggleLayer,
  onSetAllLayers,
  scenarioParams = {
    treeCanopyIncreasePct: 15,
    coolRoofCoveragePct: 35,
    reflectivePavementAreaPct: 20,
    budgetInrLakhs: 250,
  },
  onChangeScenario,
  onRunOptimizer,
  isOptimizing = false,
  interactionMode = 'select',
  setInteractionMode,
  onClearAll,
  onExportGeoJSON,
  _hasDrawnElements = false,
  selectedZonesCount = 0
}) => {
  const [activeRailTab, setActiveRailTab] = useState('layers'); // 'layers', 'draw', 'sliders', 'ingest'
  const [isLayersAccordionOpen, setIsLayersAccordionOpen] = useState(true);
  const [isDrawingAccordionOpen, setIsDrawingAccordionOpen] = useState(true);
  const [isSlidersAccordionOpen, setIsSlidersAccordionOpen] = useState(true);

  if (!isOpen) return null;

  // Live calculation preview
  const treeCooling = scenarioParams.treeCanopyIncreasePct * 0.06;
  const roofCooling = scenarioParams.coolRoofCoveragePct * 0.035;
  const paveCooling = scenarioParams.reflectivePavementAreaPct * 0.025;
  const rawTotalCooling = treeCooling + roofCooling + paveCooling;
  const budgetFactor = Math.min(1.0, scenarioParams.budgetInrLakhs / 300);
  const liveProjectedCoolingDegC = Number((rawTotalCooling * (0.4 + 0.6 * budgetFactor)).toFixed(2));

  // Count active layers
  const activeCount = Object.values(activeLayers).filter(Boolean).length;
  const totalLayersCount = Object.keys(activeLayers).length;

  const handleToggleAll = () => {
    const shouldEnable = activeCount === 0;
    if (onSetAllLayers) {
      onSetAllLayers(shouldEnable);
    } else {
      Object.keys(activeLayers).forEach(k => {
        if (activeLayers[k] !== shouldEnable) {
          onToggleLayer(k);
        }
      });
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-[380px] max-w-[90vw] lg:relative lg:inset-auto lg:z-20 flex h-[100dvh] lg:h-[calc(100dvh-4rem)] bg-white shadow-lg border-r border-slate-200 select-none transition-all duration-300 shrink-0 text-slate-800 font-sans">
        {/* Micro Icon Rail (56px) */}
        <div className="w-14 bg-slate-50 flex flex-col items-center justify-between py-3 border-r border-slate-200 shrink-0">
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={() => setActiveRailTab('layers')}
              className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                activeRailTab === 'layers' 
                  ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="GIS Layers"
            >
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </button>

            <button
              onClick={() => setActiveRailTab('draw')}
              className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                activeRailTab === 'draw' 
                  ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="Spatial Drawing Tools"
            >
              <span className="material-symbols-outlined text-[20px]">gesture</span>
            </button>

            <button
              onClick={() => setActiveRailTab('sliders')}
              className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                activeRailTab === 'sliders' 
                  ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="Intervention Sliders"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>

            <button
              onClick={() => setActiveRailTab('ingest')}
              className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                activeRailTab === 'ingest' 
                  ? 'bg-emerald-700 text-white font-bold shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="Satellite Telemetry"
            >
              <span className="material-symbols-outlined text-[20px]">sensors</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            {/* Close / Collapse Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              title="Collapse Panel"
            >
              <span className="material-symbols-outlined text-[20px]">first_page</span>
            </button>
          </div>
        </div>

        {/* Expandable Controls Shelf */}
        <div className="flex-1 bg-slate-100 flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Shelf Header */}
          <div className="p-3 bg-white flex flex-col gap-2 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {activeRailTab === 'layers' && 'Spatial Overlays'}
                  {activeRailTab === 'draw' && 'Spatial Action Tools'}
                  {activeRailTab === 'sliders' && 'Mitigation Levers'}
                  {activeRailTab === 'ingest' && 'Sensor Telemetry'}
                </span>
                <h2 className="font-sans text-sm font-bold text-slate-900 leading-tight">
                  {activeRailTab === 'layers' && 'Raster & Vector Controls'}
                  {activeRailTab === 'draw' && 'Drawing & Selection Levers'}
                  {activeRailTab === 'sliders' && 'Microclimate Sliders'}
                  {activeRailTab === 'ingest' && 'Satellite Telemetry Ingestion'}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Landsat-9
                </span>
                <button 
                  onClick={onClose}
                  className="p-1 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                  title="Collapse Shelf"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
              </div>
            </div>

            {/* Shelf Top Tab Switcher Bar */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200 text-xs">
              <button
                onClick={() => setActiveRailTab('layers')}
                className={`py-1 rounded font-bold transition-all text-center ${
                  activeRailTab === 'layers' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setActiveRailTab('draw')}
                className={`py-1 rounded font-bold transition-all text-center ${
                  activeRailTab === 'draw' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveRailTab('sliders')}
                className={`py-1 rounded font-bold transition-all text-center ${
                  activeRailTab === 'sliders' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sliders
              </button>
              <button
                onClick={() => setActiveRailTab('ingest')}
                className={`py-1 rounded font-bold transition-all text-center ${
                  activeRailTab === 'ingest' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sensors
              </button>
            </div>
          </div>

          <div className="p-3.5 flex flex-col gap-3.5 flex-1">
            {/* SECTION 1: MAP LAYERS ACCORDION */}
            {(activeRailTab === 'layers' || activeRailTab === 'all') && (
            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
              <div 
                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => setIsLayersAccordionOpen(!isLayersAccordionOpen)}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[18px] text-emerald-700 transition-transform duration-200 ${isLayersAccordionOpen ? '' : '-rotate-90'}`}>
                    expand_more
                  </span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Layers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-700 font-bold">
                    {activeCount} of {totalLayersCount} Active
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAll();
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {activeCount > 0 ? 'Hide All' : 'Show All'}
                  </button>
                </div>
              </div>

              {isLayersAccordionOpen && (
                <div className="flex flex-col gap-1.5 p-2.5 border-t border-slate-100">
                  {/* Layer 1: LST Heat */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-slate-900 leading-tight">
                          Surface Heat Field (LST)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Landsat 9 TIRS • 30m grid
                        </span>
                      </div>
                    </div>
                    {/* High-contrast smooth toggle switch */}
                    <button
                      onClick={() => onToggleLayer('lstHeat')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
                        activeLayers.lstHeat ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-300 border-slate-300'
                      }`}
                      role="switch"
                      aria-checked={activeLayers.lstHeat}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        activeLayers.lstHeat ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Layer 2: NDVI Vegetation */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-slate-900 leading-tight">
                          Vegetation Canopy (NDVI)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Sentinel-2 Multi-Spectral
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleLayer('ndviVegetation')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
                        activeLayers.ndviVegetation ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-300 border-slate-300'
                      }`}
                      role="switch"
                      aria-checked={activeLayers.ndviVegetation}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        activeLayers.ndviVegetation ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Layer 3: Driver Attribution */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-slate-900 leading-tight">
                          Heat Driver Attribution
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Anomaly magnitude vectors
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleLayer('driverAttribution')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
                        activeLayers.driverAttribution ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-300 border-slate-300'
                      }`}
                      role="switch"
                      aria-checked={activeLayers.driverAttribution}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        activeLayers.driverAttribution ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Layer 4: Population Vulnerability */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-slate-900 leading-tight">
                          Population Heat Vulnerability
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Socio-demographic exposure
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleLayer('populationDensity')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
                        activeLayers.populationDensity ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-300 border-slate-300'
                      }`}
                      role="switch"
                      aria-checked={activeLayers.populationDensity}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        activeLayers.populationDensity ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Layer 5: DISCOM Grid Stress */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-700 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-slate-900 leading-tight">
                          DISCOM Grid Power Draw
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          AC cooling peak electrical load
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleLayer('discomGrid')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out ${
                        activeLayers.discomGrid ? 'bg-emerald-700 border-emerald-700' : 'bg-slate-300 border-slate-300'
                      }`}
                      role="switch"
                      aria-checked={activeLayers.discomGrid}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        activeLayers.discomGrid ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* SECTION 2: SPATIAL DRAWING & SELECTION TOOLS */}
            {(activeRailTab === 'draw' || activeRailTab === 'all') && (
            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
              <div 
                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => setIsDrawingAccordionOpen(!isDrawingAccordionOpen)}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[18px] text-emerald-700 transition-transform duration-200 ${isDrawingAccordionOpen ? '' : '-rotate-90'}`}>
                    expand_more
                  </span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Interactive Drawing Tools
                  </span>
                </div>
                {selectedZonesCount > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {selectedZonesCount} Selected
                  </span>
                )}
              </div>

              {isDrawingAccordionOpen && (
                <div className="p-2.5 border-t border-slate-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Primary Tool: Pan & Navigate Mode */}
                    <button
                      onClick={() => setInteractionMode('navigate')}
                      className={`col-span-2 flex items-center justify-center gap-2 p-2 rounded text-xs font-bold border transition-all ${
                        interactionMode === 'navigate'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Navigate and pan map without accidental ward selection"
                    >
                      <span className="material-symbols-outlined text-[16px]">pan_tool</span>
                      <span>Pan & Navigate Mode {interactionMode === 'navigate' && '✓'}</span>
                    </button>

                    <button
                      onClick={() => setInteractionMode(interactionMode === 'select' ? 'navigate' : 'select')}
                      className={`flex items-center gap-1.5 p-2 rounded text-xs font-bold border transition-all ${
                        interactionMode === 'select'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Click any ward polygon to toggle selection for scenario simulation"
                    >
                      <span className="material-symbols-outlined text-[16px]">touch_app</span>
                      <span>Ward Select {interactionMode === 'select' && '✓'}</span>
                    </button>

                    <button
                      onClick={() => setInteractionMode(interactionMode === 'lasso' ? 'navigate' : 'lasso')}
                      className={`flex items-center gap-1.5 p-2 rounded text-xs font-bold border transition-all ${
                        interactionMode === 'lasso'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Draw a freehand loop on the map to select multiple wards"
                    >
                      <span className="material-symbols-outlined text-[16px]">gesture</span>
                      <span>Multi Lasso {interactionMode === 'lasso' && '✓'}</span>
                    </button>

                    <button
                      onClick={() => setInteractionMode(interactionMode === 'point' ? 'navigate' : 'point')}
                      className={`flex items-center gap-1.5 p-2 rounded text-xs font-bold border transition-all ${
                        interactionMode === 'point'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Click anywhere to plant virtual tree canopy cooling points"
                    >
                      <span className="material-symbols-outlined text-[16px]">park</span>
                      <span>Plant Trees {interactionMode === 'point' && '✓'}</span>
                    </button>

                    <button
                      onClick={() => setInteractionMode(interactionMode === 'polygon' ? 'navigate' : 'polygon')}
                      className={`flex items-center gap-1.5 p-2 rounded text-xs font-bold border transition-all ${
                        interactionMode === 'polygon'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Click points on the map and double-click to close a cool roof polygon"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_paint</span>
                      <span>Cool Parcel {interactionMode === 'polygon' && '✓'}</span>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={onExportGeoJSON}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-300 shadow-xs"
                      title="Export current spatial drawing interventions as GeoJSON"
                    >
                      <span className="material-symbols-outlined text-[15px] text-emerald-700">download</span>
                      <span>Export Plan</span>
                    </button>
                    <button
                      onClick={onClearAll}
                      className="py-1.5 px-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-bold transition-colors flex items-center justify-center border border-rose-200"
                      title="Clear all selections and drawn interventions"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span className="ml-1">Clear</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* SECTION 3: INTERVENTION LEVERS (SLIDERS) */}
            {(activeRailTab === 'sliders' || activeRailTab === 'all') && (
            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
              <div 
                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                onClick={() => setIsSlidersAccordionOpen(!isSlidersAccordionOpen)}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[18px] text-emerald-700 transition-transform duration-200 ${isSlidersAccordionOpen ? '' : '-rotate-90'}`}>
                    expand_more
                  </span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Cooling Sliders
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  -{liveProjectedCoolingDegC}°C
                </span>
              </div>

              {isSlidersAccordionOpen && (
                <div className="p-3 border-t border-slate-100 flex flex-col gap-3">
                  {/* Slider 1: Tree Canopy */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-emerald-700">park</span>
                        <span>Urban Tree Canopy</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{scenarioParams.treeCanopyIncreasePct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="5"
                      value={scenarioParams.treeCanopyIncreasePct}
                      onChange={(e) => onChangeScenario({ ...scenarioParams, treeCanopyIncreasePct: Number(e.target.value) })}
                      className="w-full accent-emerald-700 h-1.5 rounded bg-slate-200 cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Cool Roofs */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-rose-600">roofing</span>
                        <span>Cool Roof Albedo (SRI &gt; 104)</span>
                      </span>
                      <span className="font-mono font-bold text-rose-600">
                        +{scenarioParams.coolRoofCoveragePct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      step="5"
                      value={scenarioParams.coolRoofCoveragePct}
                      onChange={(e) => onChangeScenario({ ...scenarioParams, coolRoofCoveragePct: Number(e.target.value) })}
                      className="w-full accent-rose-600 h-1.5 rounded bg-slate-200 cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Reflective Pavements */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-sky-700">water_drop</span>
                        <span>Permeable Pavement</span>
                      </span>
                      <span className="font-mono font-bold text-sky-700">
                        +{scenarioParams.reflectivePavementAreaPct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={scenarioParams.reflectivePavementAreaPct}
                      onChange={(e) => onChangeScenario({ ...scenarioParams, reflectivePavementAreaPct: Number(e.target.value) })}
                      className="w-full accent-sky-700 h-1.5 rounded bg-slate-200 cursor-pointer"
                    />
                  </div>

                  {/* Slider 4: Municipal CapEx Budget */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">CapEx Allocation</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{scenarioParams.budgetInrLakhs}L
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={scenarioParams.budgetInrLakhs}
                      onChange={(e) => onChangeScenario({ ...scenarioParams, budgetInrLakhs: Number(e.target.value) })}
                      className="w-full accent-emerald-700 h-1.5 rounded bg-slate-200 cursor-pointer"
                    />
                  </div>

                  {/* Action: Run Optimizer Button */}
                  <button
                    onClick={onRunOptimizer}
                    disabled={isOptimizing}
                    className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded hover:bg-emerald-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>{isOptimizing ? 'Optimizing Interventions...' : 'Run Genetic Optimizer'}</span>
                  </button>
                </div>
              )}
            </div>
            )}

            {/* SECTION 4: SENSOR INGESTION SUMMARY */}
            {(activeRailTab === 'ingest' || activeRailTab === 'all') && (
            <div className="p-3.5 bg-white rounded border border-slate-200 flex flex-col gap-3 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900 uppercase">
                  Telemetry Ingestion Grid
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  CALIBRATED
                </span>
              </div>

              <div className="flex flex-col gap-2 font-sans text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col gap-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900">LANDSAT 9 TIRS-2</span>
                    <span className="text-emerald-700 text-[10px] font-mono">OK 200</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Band 10 Thermal Infrared • 30m Grid</span>
                  <span className="text-[9px] font-mono text-slate-400">Radiance: 0.0003342 • LaSRC Processed</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col gap-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900">SENTINEL-2 MSI LEVEL-2A</span>
                    <span className="text-emerald-700 text-[10px] font-mono">OK 200</span>
                  </div>
                  <span className="text-[11px] text-slate-500">10m Multispectral NDVI & NDBI Index</span>
                  <span className="text-[9px] font-mono text-slate-400">Atmospherically Corrected BOA</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col gap-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900">NASA OPEN API GATEWAY</span>
                    <span className="text-emerald-700 text-[10px] font-mono">CONNECTED</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Skin Radiometry & Hourly Ambient 2m Flux</span>
                  <span className="text-[9px] font-mono text-slate-400">Station Sensor Calibrated</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden mt-1">
                <div className="bg-emerald-700 h-full rounded transition-all duration-500" style={{ width: '96%' }} />
              </div>
            </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
