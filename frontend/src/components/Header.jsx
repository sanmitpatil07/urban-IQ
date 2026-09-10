import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Satellite, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  SlidersHorizontal,
  Home
} from 'lucide-react';

export const Header = ({
  currentCity = 'Pune',
  onSelectCity,
  wards = [],
  selectedWardId,
  onSelectWard,
  currentPass,
  onToggleLeftRail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const CITIES = [
    { name: 'Pune', state: 'Maharashtra', wardsCount: 165, activeWards: '1,000+ Zones', isLiveML: true },
    { name: 'Bengaluru', state: 'Karnataka', wardsCount: 225, activeWards: 12, isLiveML: false },
    { name: 'Ahmedabad', state: 'Gujarat', wardsCount: 192, activeWards: 14, isLiveML: false },
    { name: 'Delhi NCR', state: 'Delhi', wardsCount: 250, activeWards: 18, isLiveML: false },
    { name: 'Mumbai', state: 'Maharashtra', wardsCount: 227, activeWards: 16, isLiveML: false },
    { name: 'Hyderabad', state: 'Telangana', wardsCount: 150, activeWards: 10, isLiveML: false }
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
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleLeftRail}
          className="p-2 text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] rounded border border-transparent hover:border-[#263349] transition-colors"
          title="Toggle Control Panel"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-[#0B1220] border border-[#263349]">
            <Satellite className="w-5 h-5 text-[#2FB8AC]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2FB8AC] animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-[#EDF1F7]">
                URBAN<span className="text-[#2FB8AC]">IQ</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B2740] text-[#2FB8AC] border border-[#263349]">
                v2.4 OPS
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8793A8] tracking-wider uppercase -mt-0.5">
              Heat Mitigation DSS
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="relative ml-4 hidden md:block">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#0B1220] border border-[#263349] hover:border-[#3A4D6E] text-xs font-mono text-[#EDF1F7] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-[#2FB8AC]" />
            <span className="font-semibold">{currentCity}</span>
            {currentCity.toLowerCase() === 'pune' && (
              <span className="text-[9px] font-bold text-[#2FB8AC] bg-[#2FB8AC]/10 px-1 rounded">LIVE AI</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-[#8793A8]" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#131B2E] border border-[#263349] rounded shadow-panel-raised py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-[#8793A8] border-b border-[#263349]">
                Select Municipal Jurisdiction
              </div>
              {CITIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    if (onSelectCity) onSelectCity(c.name);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1B2740] transition-colors ${
                    c.name === currentCity ? 'text-[#2FB8AC] bg-[#1B2740]/50 font-semibold' : 'text-[#EDF1F7]'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span>{c.name}</span>
                      {c.isLiveML && <span className="text-[9px] font-bold text-[#2FB8AC] bg-[#2FB8AC]/20 px-1 rounded">AI ENGINE</span>}
                    </div>
                    <div className="text-[10px] text-[#8793A8]">{c.state}</div>
                  </div>
                  <span className="font-mono text-[10px] text-[#8793A8] bg-[#0B1220] px-1.5 py-0.5 rounded">
                    {c.activeWards}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Ward Autocomplete Search */}
      <div className="relative flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-[#8793A8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search ward or zone ID (e.g. Zone 42, Peenya)..."
            className="w-full bg-[#0B1220] border border-[#263349] focus:border-[#2FB8AC] text-xs font-sans text-[#EDF1F7] placeholder-[#8793A8] pl-9 pr-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#2FB8AC] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} 
              className="absolute right-3 text-xs text-[#8793A8] hover:text-[#EDF1F7]"
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
      <div className="flex items-center space-x-3">
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

          <div className="flex items-center space-x-1 text-[10px] text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded border border-[#2FB8AC]/30">
            <ShieldCheck className="w-3 h-3" />
            <span>AI SYNC OK</span>
          </div>
        </div>

        {/* Home Navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1.5 bg-[#1B2740] hover:bg-[#263349] border border-[#263349] text-[#EDF1F7] px-3 py-1.5 rounded text-xs font-mono transition-colors"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-[#2FB8AC]" />
          <span>Home</span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#263349]">
          <div className="w-8 h-8 rounded-full bg-[#1B2740] border border-[#263349] flex items-center justify-center text-[#2FB8AC]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
