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
  onExportDSS,
  onExportHAP,
  currentPersona = {
    name: 'Dr. V. Rao, IAS',
    role: 'Taskforce Chief & Municipal Commissioner',
    badgeId: 'IAS-MH-9402',
    color: 'emerald'
  },
  onOpenLoginModal
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
    <header className="h-16 bg-[#FAF9F6] border-b border-[#EAE6DF] px-3 sm:px-4 flex items-center justify-between shadow-xs z-30 select-none relative text-slate-900 font-sans">
      {/* Left: Brand & City Selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button 
          onClick={onToggleLeftRail}
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors flex items-center justify-center ${
            isLeftRailOpen 
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300' 
              : 'text-slate-700 hover:text-slate-900 hover:bg-white border-[#EAE6DF]'
          }`}
          title="Toggle Tools & Overlays Rail"
          aria-label="Toggle Tools"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                URBAN-<span className="text-emerald-700">IQ</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-[#EAE6DF] text-slate-700">
                v2.4
              </span>
            </div>
            <span className="hidden sm:inline text-[9px] font-sans text-slate-500 uppercase tracking-wider font-semibold -mt-0.5">
              Heat Resilience DSS
            </span>
          </div>
        </div>

        {/* City Selector Dropdown */}
        <div className="relative ml-1 sm:ml-2">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white border border-[#EAE6DF] hover:bg-slate-50 text-xs font-sans text-slate-800 transition-all shadow-xs"
            title="Switch Metro Region"
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
            <div className="absolute left-0 mt-1 w-64 bg-white border border-[#EAE6DF] rounded-xl shadow-2xl z-50 py-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 border-b border-[#EAE6DF] text-[10px] font-sans text-slate-500 uppercase tracking-wider font-bold bg-[#FAF9F6]">
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
                      : 'border-transparent text-slate-700 hover:bg-[#FAF9F6]'
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
            className="w-full bg-white border border-[#EAE6DF] rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-xs"
            placeholder={`Search ${currentCity} zones, wards, hotspots...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {isSearchOpen && filteredWards.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#EAE6DF] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-[#FAF9F6]">
              Matching Zones ({filteredWards.length})
            </div>
            {filteredWards.map(w => (
              <button
                key={w.id || w.zone_id}
                onClick={() => {
                  if (onSelectWard) onSelectWard(w.id || w.zone_id);
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 flex items-center justify-between text-xs border-b border-slate-50 last:border-b-0"
              >
                <div>
                  <span className="font-bold text-slate-900">{w.name || `Zone ${w.id}`}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{w.zone || 'Ward'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-rose-600">
                    {Number(w.currentLst || w.lst || 36.5).toFixed(1)}°C
                  </span>
                  <span className="text-[9px] font-mono px-1 rounded bg-slate-100 text-slate-600">
                    +{Number(w.lstAnomaly || 2.4).toFixed(1)}°
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions, Exports, Focus, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Focus / Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isZenMode 
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border-[#EAE6DF]'
          }`}
          title="Toggle Focus Mode"
        >
          <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
          <span className="hidden sm:inline">{isZenMode ? 'Exit Focus' : 'Focus'}</span>
        </button>

        {/* Export DSS Button - Downloads Complete City Intervention Plan PDF on click */}
        <button
          onClick={() => {
            if (onExportHAP) onExportHAP();
            else if (onExportDSS) onExportDSS();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors text-xs font-semibold shadow-xs"
          title="Download Complete City Intervention Plan (PDF)"
        >
          <span className="material-symbols-outlined text-[16px] text-white">picture_as_pdf</span>
          <span className="font-bold">Export DSS (PDF)</span>
        </button>

        {/* Toggle Right Rail Button */}
        <button
          onClick={onToggleRightRail}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
            isRightRailOpen 
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold' 
              : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-[#EAE6DF]'
          }`}
          title="Toggle Analytics & Optimization Panel"
          aria-label="Toggle Analytics"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-700">analytics</span>
          <span className="text-[11px] font-sans font-bold hidden sm:inline">ANALYTICS</span>
        </button>

        {/* Return to Home Landing Page */}
        <button
          onClick={() => navigate('/')}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-[#EAE6DF] text-slate-700 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-1 shadow-xs"
          title="Return to Landing Overview"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-600">home</span>
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Interactive Persona / Login Switcher Badge */}
        <div 
          onClick={onOpenLoginModal}
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[#EAE6DF] cursor-pointer hover:opacity-90 transition-opacity"
          title="Click to Switch Institutional Role / Login"
        >
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs ${
            currentPersona?.id === 'commissioner' ? 'bg-emerald-800' :
            currentPersona?.id === 'planner' ? 'bg-sky-800' :
            currentPersona?.id === 'health' ? 'bg-rose-800' :
            currentPersona?.id === 'discom' ? 'bg-amber-700' :
            'bg-teal-800'
          }`}>
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-sans font-bold text-[11px] text-slate-900 leading-tight">
              {currentPersona?.name || 'Dr. V. Rao, IAS'}
            </span>
            <span className="text-[9px] text-emerald-800 font-semibold truncate max-w-[120px]">
              {currentPersona?.role?.split('&')[0]?.trim() || 'Taskforce Chief'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
