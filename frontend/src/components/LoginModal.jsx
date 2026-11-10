import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Stethoscope, 
  Zap, 
  Users, 
  Check, 
  X, 
  KeyRound,
  FileCheck2,
  Lock
} from 'lucide-react';

export const INSTITUTIONAL_PERSONAS = [
  {
    id: 'commissioner',
    name: 'Dr. V. Rao, IAS',
    role: 'Taskforce Chief & Municipal Commissioner',
    agency: 'Urban Heat Resilience Mission, MoHUA',
    badgeId: 'IAS-MH-9402',
    color: 'emerald',
    icon: Building2,
    authority: 'Executive Clearance: Emergency Heatwave Declarations, HAP Commit, Fiscal Allocations',
    scope: 'Metropolitan Strategic Command'
  },
  {
    id: 'planner',
    name: 'Ar. Sunita Deshmukh',
    role: 'Chief Urban Planner',
    agency: 'Town Planning & Cadastral Authority',
    badgeId: 'TPA-URB-2140',
    color: 'sky',
    icon: ShieldCheck,
    authority: 'Technical Clearance: Zoning Variances, Cool Roof Bylaws, Urban Canopy Reforestation',
    scope: 'Cadastral Infrastructure & Levers'
  },
  {
    id: 'health',
    name: 'Dr. Rajiv Menon, MD',
    role: 'Chief Medical & Public Health Officer',
    agency: 'Directorate of Health Services (DHS)',
    badgeId: 'DHS-EPID-8812',
    color: 'rose',
    icon: Stethoscope,
    authority: 'Vulnerability Clearance: Cooling Centers, Heatstroke Surge Beds, Vulnerable Alert SMS',
    scope: 'Epidemiological Thermal Shield'
  },
  {
    id: 'discom',
    name: 'Er. Amit Patel',
    role: 'Chief DISCOM Distribution Engineer',
    agency: 'State Electricity Distribution Co. (DISCOM)',
    badgeId: 'DIS-GRID-4491',
    color: 'amber',
    icon: Zap,
    authority: 'Grid Clearance: Substation Peak Shaving, Transformer Thermal Stress Mitigation',
    scope: 'Critical Energy Infrastructure'
  },
  {
    id: 'citizen',
    name: 'Priya Sharma',
    role: 'Ward Resilience Coordinator & Citizen',
    agency: 'Urban Community Heatwatch Volunteer',
    badgeId: 'CIT-COMM-0042',
    color: 'teal',
    icon: Users,
    authority: 'Public Access: Microclimate Sensor Reporting, Pocket Shade Mapping, Community Alert',
    scope: 'Neighborhood Civil Defense'
  }
];

export const LoginModal = ({ 
  isOpen, 
  onClose, 
  currentPersona, 
  onSelectPersona 
}) => {
  const [selectedId, setSelectedId] = useState(currentPersona?.id || 'commissioner');
  const [sessionSuccess, setSessionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = (persona) => {
    setSelectedId(persona.id);
    onSelectPersona(persona);
    setSessionSuccess(true);
    setTimeout(() => {
      setSessionSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div 
        className="bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Institutional Header */}
        <div className="p-4 bg-white border-b border-[#EAE6DF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Government of India • MoHUA
                </span>
                <span className="text-[10px] font-mono text-slate-500">v2.4-SEC</span>
              </div>
              <h2 className="font-sans font-bold text-base text-slate-900 tracking-tight">
                Institutional Access & Role Switching
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Subtitle */}
        <div className="px-4 py-2 bg-[#F7F5F0] border-b border-[#EAE6DF] text-xs text-slate-600 flex items-center justify-between shrink-0">
          <span>Select an authenticated institutional profile to adapt permissions & decision scopes:</span>
          {sessionSuccess && (
            <span className="text-emerald-700 font-bold font-mono text-[11px] flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Session Active
            </span>
          )}
        </div>

        {/* Persona Roster */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5 min-h-0 bg-[#FAF9F6]">
          {INSTITUTIONAL_PERSONAS.map((p) => {
            const isCurrent = currentPersona?.id === p.id;
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => handleApply(p)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 relative ${
                  isCurrent 
                    ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-500' 
                    : 'bg-white/80 hover:bg-white border-[#EAE6DF] hover:border-slate-300'
                }`}
              >
                {/* Persona Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                  p.id === 'commissioner' ? 'bg-emerald-700 text-white' :
                  p.id === 'planner' ? 'bg-sky-700 text-white' :
                  p.id === 'health' ? 'bg-rose-700 text-white' :
                  p.id === 'discom' ? 'bg-amber-600 text-white' :
                  'bg-teal-700 text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Identity Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {p.badgeId}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800">
                    {p.role}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p.agency}
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-600 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.authority}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                {isCurrent && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#EAE6DF] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Active: <strong className="text-slate-800">{currentPersona?.name || 'Dr. V. Rao, IAS'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded transition-colors shadow-xs"
          >
            Confirm & Return
          </button>
        </div>
      </div>
    </div>
  );
};

