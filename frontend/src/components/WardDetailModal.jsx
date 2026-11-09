import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Award, 
  Download, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { MOCK_DRIVER_ATTRIBUTIONS, DEFAULT_DRIVER_ATTRIBUTIONS, MOCK_INTERVENTIONS } from '../services/mockApi';

export const WardDetailModal = ({ ward, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!ward) return null;

  const wardId = ward.id || ward.zone_id || 'Z-01';
  const wardName = ward.name || `Zone ${wardId}`;
  const zoneName = ward.zone || 'Municipal Heat Management Ward';
  const anomaly = ward.lstAnomaly ?? (ward.lst ? (ward.lst - 34.0).toFixed(1) : 2.5);
  const surfaceTemp = ward.currentLst ?? (ward.lst ? ward.lst.toFixed(1) : 36.5);
  const ndvi = ward.ndviIndex ?? (ward.ndvi ? ward.ndvi.toFixed(2) : 0.22);
  const vulnerablePopPct = ward.vulnerablePopPct ?? 38;
  const population = ward.population ?? 85000;
  const riskSeverity = ward.riskSeverity ?? (anomaly >= 4.0 ? 'critical' : anomaly >= 2.5 ? 'high' : 'moderate');

  const attributions = MOCK_DRIVER_ATTRIBUTIONS[wardId] || DEFAULT_DRIVER_ATTRIBUTIONS;
  const interventions = MOCK_INTERVENTIONS;

  const handleExportReport = () => {
    setIsExporting(true);
    const reportContent = [
      'URBAN-IQ — MUNICIPAL ACTION DOSSIER',
      `Report ID: URB-DSS-${wardId}-2026`,
      `Generated: ${new Date().toISOString()}`,
      '========================================',
      `ZONE: ${wardName} (${wardId})`,
      `ZONE TYPE: ${zoneName}`,
      `RISK SEVERITY: ${String(riskSeverity).toUpperCase()}`,
      '',
      'THERMAL TELEMETRY',
      `  LST Anomaly: +${anomaly}°C above baseline`,
      `  Surface Temperature: ${surfaceTemp}°C`,
      `  NDVI Canopy Index: ${ndvi}`,
      `  Vulnerable Population: ${vulnerablePopPct}% (${population.toLocaleString()} total)`,
      '',
      'PHYSICS DRIVER ATTRIBUTION',
      ...attributions.map(a => `  ${a.driverName}: ${a.contributionPct}% — ${a.description}`),
      '',
      'RANKED COOLING INTERVENTIONS',
      ...interventions.map(i => `  #${i.roiRank} ${i.name}: -${i.estCoolingImpactDegC}°C | INR ${i.costInrLakhs}L | ${i.costPerDegreeAvertedLakhs}L/°C`),
      '',
      `Co-benefits: ${interventions.flatMap(i => i.coBenefits).join(', ')}`,
    ].join('\n');
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `URB-DSS-${wardId}-2026.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 300);
  };

  const getSeverityBadgeColor = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'high': return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'moderate': return 'bg-amber-50 text-amber-800 border border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200 text-slate-800">
      <div className="w-full max-w-2xl bg-white border-l border-slate-300 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${getSeverityBadgeColor(riskSeverity)}`}>
                {riskSeverity} RISK
              </span>
              <span className="font-mono text-xs text-slate-500">ZONE: {wardId}</span>
              <span className="font-mono text-xs text-emerald-700 font-semibold">{zoneName}</span>
            </div>
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 mt-1">
              {wardName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded border border-transparent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-white">
          
          {/* Telemetry Header Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">LST Anomaly</div>
              <div className="font-mono text-lg sm:text-xl font-bold text-rose-600 mt-0.5">
                +{anomaly}°C
              </div>
              <div className="text-[9px] font-mono text-slate-400">above baseline</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Surface Temp</div>
              <div className="font-mono text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {surfaceTemp}°C
              </div>
              <div className="text-[9px] font-mono text-slate-400">Thermal Infrared</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Canopy Index</div>
              <div className="font-mono text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
                {ndvi}
              </div>
              <div className="text-[9px] font-mono text-slate-400">NDVI score</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Vulnerable Pop</div>
              <div className="font-mono text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {vulnerablePopPct}%
              </div>
              <div className="text-[9px] font-mono text-slate-400">{population.toLocaleString()} total</div>
            </div>
          </div>

          {/* Physics-Informed Heat Driver Attribution Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Physics Driver Attribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                94% CONFIDENCE
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Physics breakdown decomposing surface thermal anomaly into sensible heat flux, radiative albedo deficit, and anthropogenic discharges.
            </p>

            <div className="space-y-3">
              {attributions.map((attr) => (
                <div key={attr.id} className="bg-white border border-slate-200 p-3 rounded shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{attr.driverName}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-600">
                      {attr.contributionPct}% <span className="text-[10px] font-normal text-slate-400">contribution</span>
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-200 h-2.5 rounded-full overflow-hidden my-2">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${attr.contributionPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {attr.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked Cooling Interventions */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Ranked Mitigation Interventions
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Optimized by ROI
              </span>
            </div>

            <div className="space-y-3">
              {interventions.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-200 p-3.5 rounded shadow-xs hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center">
                        #{item.roiRank}
                      </span>
                      <div>
                        <h4 className="font-sans font-bold text-xs text-slate-900">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          Capex: ₹{item.costInrLakhs}L • Impact: -{item.estCoolingImpactDegC}°C
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      ₹{item.costPerDegreeAvertedLakhs}L / °C
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      <span>Execution: {item.timeframe}</span>
                    </span>
                    <span>Co-benefits: {item.coBenefits.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {exportSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-mono font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dossier Exported!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              Close
            </button>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-mono font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating Brief...' : 'Export Municipal Dossier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
