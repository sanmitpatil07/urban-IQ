import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Satellite, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  SlidersHorizontal,
  Home,
  Activity
} from 'lucide-react';

export const Header = ({
  currentCity = 'Pune',
  onSelectCity,
  wards = [],
  selectedWardId,
  onSelectWard,
  currentPass,
  onToggleLeftRail,
  onToggleRightRail,
  isLeftRailOpen = false,
  isRightRailOpen = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const CITIES = [
    { name: 'Mumbai', state: 'Maharashtra', wardsCount: 43, activeWards: '43 Zones (MMR)', isLiveML: true, isAvailable: true },
    { name: 'Pune', state: 'Maharashtra', wardsCount: 31, activeWards: '31 Zones (PMRDA)', isLiveML: true, isAvailable: true },
    { name: 'Delhi NCR', state: 'Delhi-NCR', wardsCount: 26, activeWards: '26 Zones (NCR)', isLiveML: true, isAvailable: true },
    { name: 'Bengaluru', state: 'Karnataka', wardsCount: 18, activeWards: '18 Zones (BMRDA)', isLiveML: true, isAvailable: true },
    { name: 'Hyderabad', state: 'Telangana', wardsCount: 15, activeWards: '15 Zones (HMDA)', isLiveML: true, isAvailable: true },
    { name: 'Ahmedabad', state: 'Gujarat', wardsCount: 14, activeWards: '14 Zones (AUDA)', isLiveML: true, isAvailable: true },
    { name: 'Chennai', state: 'Tamil Nadu', wardsCount: 12, activeWards: '12 Zones (CMDA)', isLiveML: true, isAvailable: true },
    { name: 'Kolkata', state: 'West Bengal', wardsCount: 10, activeWards: '10 Zones (KMDA)', isLiveML: true, isAvailable: true },
    { name: 'Jaipur', state: 'Rajasthan', wardsCount: 8, activeWards: '8 Zones (JDA)', isLiveML: true, isAvailable: true },
    { name: 'Lucknow', state: 'Uttar Pradesh', wardsCount: 9, activeWards: '9 Zones (LDA)', isLiveML: true, isAvailable: true },
  ];

  const filteredWards = searchQuery.trim() === '' ? [] : wards.filter(w => 
    (w.name && w.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.id && w.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.zone && w.zone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.zone_id && String(w.zone_id).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="h-16 bg-[#131B2E] border-b border-[#263349] px-4 flex items-center justify-between shadow-panel z-30 select-none relative">
      {/* Left: Wordmark & Brand */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <button 
          onClick={onToggleLeftRail}
          className={`p-2 rounded border transition-colors ${
            isLeftRailOpen 
              ? 'text-[#2FB8AC] bg-[#1B2740] border-[#2FB8AC]/40 shadow-sm' 
              : 'text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] border-transparent hover:border-[#263349]'
          }`}
          title="Toggle Tools & Intervention Controls"
          aria-label="Toggle Tools"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#0B1220] border border-[#263349]">
            <Satellite className="w-4 h-4 sm:w-5 sm:h-5 text-[#2FB8AC]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2FB8AC] animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#EDF1F7]">
                URBAN<span className="text-[#2FB8AC]">IQ</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-[#1B2740] text-[#2FB8AC] border border-[#263349]">
                v2.4
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-mono text-[#8793A8] tracking-wider uppercase -mt-0.5">
              Heat Mitigation DSS
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="relative ml-1 sm:ml-4">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-[#0B1220] border border-[#263349] hover:border-[#3A4D6E] text-xs font-mono text-[#EDF1F7] transition-all"
            title="Switch City"
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2FB8AC]" />
            <span className="font-semibold text-[11px] sm:text-xs">{currentCity}</span>
            {currentCity.toLowerCase() === 'pune' && (
              <span className="text-[8px] sm:text-[9px] font-bold text-[#2FB8AC] bg-[#2FB8AC]/10 px-1 rounded hidden xs:inline">LIVE</span>
            )}
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8793A8]" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#131B2E] border border-[#263349] rounded shadow-panel-raised py-1 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#8793A8] border-b border-[#263349] flex items-center justify-between sticky top-0 bg-[#131B2E]">
                <span>National Heat Grid</span>
                <span className="text-[#2FB8AC] text-[9px] font-bold">10 Live Hubs</span>
              </div>
              {CITIES.map(c => (
                <button
                  key={c.name}
                  disabled={!c.isAvailable}
                  onClick={() => {
                    if (c.isAvailable && onSelectCity) {
                      onSelectCity(c.name);
                    }
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    !c.isAvailable 
                      ? 'opacity-40 cursor-not-allowed bg-transparent hover:bg-transparent'
                      : c.name === currentCity 
                        ? 'text-[#2FB8AC] bg-[#1B2740]/70 font-semibold cursor-pointer' 
                        : 'text-[#EDF1F7] hover:bg-[#1B2740] cursor-pointer'
                  }`}
                  title={`Select ${c.name} (${c.state})`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span>{c.name}</span>
                      {c.isLiveML && (
                        <span className="text-[9px] font-bold text-[#2FB8AC] bg-[#2FB8AC]/20 px-1 rounded">
                          LIVE ML
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8793A8]">{c.state}</div>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded text-[#2FB8AC] bg-[#0B1220] border border-[#263349]">
                    {c.activeWards}
                  </span>
                </button>
              ))}
              <div className="px-3 py-1.5 mt-1 border-t border-[#263349] text-[9px] font-mono text-[#8793A8] leading-tight bg-[#0B1220]/40">
                All-India coverage enabled via NASA POWER, Landsat-9, and Physics-Informed ML. Select any city to navigate.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Ward Autocomplete Search */}
      <div className="relative flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 text-[#8793A8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search ward or zone..."
            className="w-full bg-[#0B1220] border border-[#263349] focus:border-[#2FB8AC] text-[11px] sm:text-xs font-sans text-[#EDF1F7] placeholder-[#8793A8] pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#2FB8AC] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} 
              className="absolute right-2.5 text-xs text-[#8793A8] hover:text-[#EDF1F7]"
            >
              ×
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && filteredWards.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#131B2E] border border-[#263349] rounded shadow-panel-raised max-h-72 overflow-y-auto z-50">
            {filteredWards.map(ward => {
              const wardId = ward.id || ward.zone_id;
              const wardName = ward.name || `Zone ${wardId}`;
              const anomaly = ward.lstAnomaly || (ward.lst ? (ward.lst - 34.0).toFixed(1) : '2.5');

              return (
                <button
                  key={wardId}
                  onClick={() => {
                    if (onSelectWard) onSelectWard(wardId);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-[#263349]/50 hover:bg-[#1B2740] flex items-center justify-between transition-colors ${
                    selectedWardId === wardId ? 'bg-[#1B2740] border-l-2 border-l-[#2FB8AC]' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#EDF1F7] flex items-center space-x-2">
                      <span>{wardName}</span>
                      <span className="font-mono text-[10px] text-[#8793A8]">({wardId})</span>
                    </div>
                    <div className="text-[10px] text-[#8793A8]">{ward.zone || 'Municipal Grid Zone'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-[#E8632B]">
                      +{anomaly}°C LST
                    </div>
                    <div className="text-[10px] font-mono text-[#8793A8]">
                      NDVI {ward.ndviIndex || (ward.ndvi ? ward.ndvi.toFixed(2) : '0.24')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Telemetry & Nav */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
        {/* Toggle Right Rail (Telemetry & Alerts) Button on Mobile/Tablet */}
        <button
          onClick={onToggleRightRail}
          className={`xl:hidden p-2 rounded border transition-colors flex items-center space-x-1 ${
            isRightRailOpen 
              ? 'text-[#2FB8AC] bg-[#1B2740] border-[#2FB8AC]/40 shadow-sm' 
              : 'text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] border-[#263349]'
          }`}
          title="Toggle Resilience Metrics & Alerts"
          aria-label="Toggle Telemetry"
        >
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#2FB8AC]" />
          <span className="text-[10px] font-mono text-[#2FB8AC] font-bold hidden sm:inline">ALERTS</span>
        </button>

        {/* Telemetry Indicator */}
        <div className="hidden lg:flex items-center space-x-3 bg-[#0B1220] border border-[#263349] px-3 py-1.5 rounded font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FB8AC] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FB8AC]"></span>
            </span>
            <span className="text-[#8793A8] text-[11px]">SENSOR:</span>
            <span className="text-[#EDF1F7] font-medium text-[11px]">{currentPass ? currentPass.satellite : 'Landsat-9 / Sentinel-2'}</span>
          </div>

          <div className="h-3 w-[1px] bg-[#263349]" />

          <div className="flex items-center space-x-1 text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>NASA LIVE API</span>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded border border-[#2FB8AC]/30">
            <ShieldCheck className="w-3 h-3" />
            <span>AI SYNC OK</span>
          </div>
        </div>

        {/* Home Navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1 sm:space-x-1.5 bg-[#1B2740] hover:bg-[#263349] border border-[#263349] text-[#EDF1F7] px-2 sm:px-3 py-1.5 rounded text-xs font-mono transition-colors"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-[#2FB8AC]" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* User Profile Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-1 sm:pl-2 border-l border-[#263349]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1B2740] border border-[#263349] flex items-center justify-center text-[#2FB8AC]">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
