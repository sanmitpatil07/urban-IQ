import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header = ({
  currentCity = 'Pune',
  onSelectCity,
  wards = [],
  _selectedWardId,
  onSelectWard,
  currentPass,
  onToggleLeftRail,
  onToggleRightRail,
  isLeftRailOpen = false,
  isRightRailOpen = false,
  isZenMode = false,
  onToggleZenMode,
  onExportDSS
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const CITIES = [
    { name: 'Mumbai', state: 'Maharashtra', wardsCount: 43, activeWards: '43 Zones (MMR)' },
    { name: 'Pune', state: 'Maharashtra', wardsCount: 31, activeWards: '31 Zones (PMRDA)' },
    { name: 'Delhi NCR', state: 'Delhi-NCR', wardsCount: 26, activeWards: '26 Zones (NCR)' },
    { name: 'Bengaluru', state: 'Karnataka', wardsCount: 18, activeWards: '18 Zones (BMRDA)' },
    { name: 'Hyderabad', state: 'Telangana', wardsCount: 15, activeWards: '15 Zones (HMDA)' },
    { name: 'Ahmedabad', state: 'Gujarat', wardsCount: 14, activeWards: '14 Zones (AUDA)' },
    { name: 'Chennai', state: 'Tamil Nadu', wardsCount: 12, activeWards: '12 Zones (CMDA)' },
    { name: 'Kolkata', state: 'West Bengal', wardsCount: 10, activeWards: '10 Zones (KMDA)' },
    { name: 'Jaipur', state: 'Rajasthan', wardsCount: 8, activeWards: '8 Zones (JDA)' },
    { name: 'Lucknow', state: 'Uttar Pradesh', wardsCount: 9, activeWards: '9 Zones (LDA)' },
  ];

  const filteredWards = searchQuery.trim() === '' ? [] : wards.filter(w => 
    (w.name && w.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.id && String(w.id).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.zone && String(w.zone).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.zone_id && String(w.zone_id).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shadow-xs z-30 select-none relative text-slate-900 font-sans">
      {/* Left: Brand & City Selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button 
          onClick={onToggleLeftRail}
          className={`p-1.5 sm:p-2 rounded border transition-colors flex items-center justify-center ${
            isLeftRailOpen 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-300' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
          }`}
          title="Toggle Tools & Overlays Rail"
          aria-label="Toggle Tools"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                URBAN-<span className="text-emerald-700">IQ</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                v2.4
              </span>
            </div>
            <span className="hidden sm:inline text-[9px] font-sans text-slate-500 uppercase tracking-wider font-semibold -mt-0.5">
              Geo-Spatial Decision Support
            </span>
          </div>
        </div>

        {/* City Selector Dropdown */}
        <div className="relative ml-1 sm:ml-2">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs font-sans text-slate-800 transition-all shadow-xs"
            title="Switch City"
          >
            <span className="material-symbols-outlined text-emerald-700 text-[16px]">location_city</span>
            <span className="font-bold text-xs">{currentCity}</span>
            <span className="material-symbols-outlined text-slate-500 text-[16px]">expand_more</span>
          </button>

          {isCityDropdownOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsCityDropdownOpen(false)}
            />
          )}

          {isCityDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-2xl z-50 py-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-sans text-slate-500 uppercase tracking-wider font-bold bg-slate-50">
                Select Indian Metro Region:
              </div>
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    onSelectCity(c.name);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors border-l-2 ${
                    currentCity.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'border-transparent text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-slate-900">
                      <span>{c.name}</span>
                      <span className="text-[10px] font-normal text-slate-500">({c.state})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{c.activeWards}</div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    LIVE
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 relative hidden md:block">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={`Search ${currentCity} cadastral wards, plots, anomalies...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-slate-50 pl-9 pr-3 py-1.5 rounded font-sans text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 border border-slate-300 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {isSearchOpen && searchQuery.trim() !== '' && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsSearchOpen(false)}
          />
        )}

        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
            {filteredWards.length === 0 ? (
              <div className="p-3 text-xs text-slate-500 text-center">
                No matching wards found in {currentCity}.
              </div>
            ) : (
              filteredWards.map(ward => {
                const wardId = ward.id || ward.zone_id;
                const anomaly = ward.lstAnomaly ? Number(ward.lstAnomaly).toFixed(1) : (ward.anomaly ? Number(ward.anomaly).toFixed(1) : '2.4');
                return (
                  <button
                    key={wardId}
                    onClick={() => {
                      if (onSelectWard) onSelectWard(wardId);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{ward.name || `Zone ${wardId}`}</span>
                        <span className="text-[10px] text-slate-500">({wardId})</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{ward.zone || `${currentCity} Municipal Grid`}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-rose-600">
                        +{anomaly}°C LST
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        NDVI {ward.ndviIndex || (ward.ndvi ? ward.ndvi.toFixed(2) : '0.24')}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Focus Mode, Telemetry & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Focus / Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
            isZenMode 
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
          }`}
          title="Toggle Focus / Full Map Viewport"
        >
          <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
          <span className="hidden sm:inline">{isZenMode ? 'Exit Focus' : 'Focus Mode'}</span>
        </button>

        {/* Export DSS Button */}
        <button
          onClick={onExportDSS}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold border border-slate-300 shadow-xs"
          title="Export GeoJSON / DSS Dossier"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-700">download</span>
          <span className="hidden md:inline">Export DSS</span>
        </button>

        {/* Toggle Right Rail Button */}
        <button
          onClick={onToggleRightRail}
          className={`p-1.5 sm:p-2 rounded border transition-colors flex items-center gap-1 ${
            isRightRailOpen 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-300' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
          }`}
          title="Toggle Analytics Drawer"
          aria-label="Toggle Analytics"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span className="text-[10px] font-sans font-bold hidden sm:inline">ANALYTICS</span>
        </button>

        {/* NASA Live Telemetry Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Sensor:</span>
            <span className="font-bold text-slate-800 text-[11px]">{currentPass ? currentPass.satellite : 'Landsat 9 TIRS-2'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            NASA OK
          </span>
        </div>

        {/* Return to Home Landing Page */}
        <button
          onClick={() => navigate('/')}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-sans font-semibold transition-colors flex items-center gap-1 shadow-xs"
          title="Return to Landing Overview"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-600">home</span>
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Chief Planner Profile Badge */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-sans font-bold text-[11px] text-slate-800 leading-tight">Dr. V. Rao, IAS</span>
            <span className="text-[9px] text-slate-500">Taskforce Chief</span>
          </div>
        </div>
      </div>
    </header>
  );
};
