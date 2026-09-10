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
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1200);
  };

  const getSeverityBadgeColor = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-[#C81E3A] text-[#EDF1F7]';
      case 'high': return 'bg-[#E8632B] text-[#EDF1F7]';
      case 'moderate': return 'bg-[#F2A93B] text-[#0B1220]';
      default: return 'bg-[#2FB8AC] text-[#0B1220]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-2xl bg-[#131B2E] border-l border-[#263349] h-full flex flex-col shadow-panel-raised overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-[#263349] bg-[#0B1220] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${getSeverityBadgeColor(riskSeverity)}`}>
                {riskSeverity} RISK
              </span>
              <span className="font-mono text-xs text-[#8793A8]">ZONE ID: {wardId}</span>
              <span className="font-mono text-xs text-[#2FB8AC]">{zoneName}</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-[#EDF1F7] mt-1">
              {wardName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8793A8] hover:text-[#EDF1F7] hover:bg-[#1B2740] rounded border border-transparent hover:border-[#263349] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Telemetry Header Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0B1220] border border-[#263349] p-3 rounded">
              <div className="text-[10px] font-mono text-[#8793A8] uppercase">LST Anomaly</div>
              <div className="font-mono text-xl font-bold text-[#E8632B] mt-0.5">
                +{anomaly}°C
              </div>
              <div className="text-[9px] font-mono text-[#8793A8]">above baseline</div>
            </div>

            <div className="bg-[#0B1220] border border-[#263349] p-3 rounded">
              <div className="text-[10px] font-mono text-[#8793A8] uppercase">Surface Temp</div>
              <div className="font-mono text-xl font-bold text-[#EDF1F7] mt-0.5">
                {surfaceTemp}°C
              </div>
              <div className="text-[9px] font-mono text-[#8793A8]">Thermal Infrared</div>
            </div>

            <div className="bg-[#0B1220] border border-[#263349] p-3 rounded">
              <div className="text-[10px] font-mono text-[#8793A8] uppercase">Canopy Index</div>
              <div className="font-mono text-xl font-bold text-[#2FB8AC] mt-0.5">
                {ndvi}
              </div>
              <div className="text-[9px] font-mono text-[#8793A8]">NDVI score</div>
            </div>

            <div className="bg-[#0B1220] border border-[#263349] p-3 rounded">
              <div className="text-[10px] font-mono text-[#8793A8] uppercase">Vulnerable Pop</div>
              <div className="font-mono text-xl font-bold text-[#EDF1F7] mt-0.5">
                {vulnerablePopPct}%
              </div>
              <div className="text-[9px] font-mono text-[#8793A8]">{population.toLocaleString()} total</div>
            </div>
          </div>

          {/* Physics-Informed Heat Driver Attribution Breakdown */}
          <div className="bg-[#0B1220] border border-[#263349] rounded p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#263349] pb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#F2A93B]" />
                <h3 className="font-display font-semibold text-sm text-[#EDF1F7] uppercase tracking-wide">
                  Physics-Informed Driver Attribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-2 py-0.5 rounded border border-[#2FB8AC]/30">
                94% MODEL CONFIDENCE
              </span>
            </div>

            <p className="text-xs text-[#8793A8] mb-4">
              Physics breakdown decomposing surface thermal anomaly into sensible heat flux, radiative albedo deficit, and anthropogenic discharges.
            </p>

            <div className="space-y-4">
              {attributions.map((attr) => (
                <div key={attr.id} className="bg-[#131B2E] border border-[#263349] p-3 rounded">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#EDF1F7] flex items-center space-x-2">
                      <span>{attr.driverName}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-[#F2A93B]">
                      {attr.contributionPct}% <span className="text-[10px] font-normal text-[#8793A8]">contribution</span>
                    </span>
                  </div>

                  <div className="relative w-full bg-[#0B1220] h-3 rounded-full overflow-hidden border border-[#263349] my-2">
                    <div 
                      className="bg-gradient-to-r from-[#F2A93B] to-[#E8632B] h-full rounded-full transition-all duration-700" 
                      style={{ width: `${attr.contributionPct}%` }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 border-l-2 border-r-2 border-[#EDF1F7] bg-[#EDF1F7]/10"
                      style={{
                        left: `${attr.confidenceBand[0]}%`,
                        width: `${attr.confidenceBand[1] - attr.confidenceBand[0]}%`
                      }}
                      title={`Confidence interval: ${attr.confidenceBand[0]}% - ${attr.confidenceBand[1]}%`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8793A8] mt-1">
                    <span>{attr.description}</span>
                    <span className="text-[#2FB8AC] bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#263349]">{attr.physicsEq}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked Cooling Interventions */}
          <div className="bg-[#0B1220] border border-[#263349] rounded p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#263349] pb-2">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#2FB8AC]" />
                <h3 className="font-display font-semibold text-sm text-[#EDF1F7] uppercase tracking-wide">
                  Ranked Cooling Interventions (Impact per ₹)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8793A8]">RANKED BY ROI</span>
            </div>

            <div className="space-y-3">
              {interventions.map((int) => (
                <div 
                  key={int.id} 
                  className={`p-3.5 rounded border transition-all ${
                    int.roiRank === 1 
                      ? 'bg-[#131B2E] border-[#2FB8AC] shadow-cyan-glow' 
                      : 'bg-[#131B2E] border-[#263349]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center ${
                        int.roiRank === 1 ? 'bg-[#2FB8AC] text-[#0B1220]' : 'bg-[#1B2740] text-[#EDF1F7] border border-[#263349]'
                      }`}>
                        #{int.roiRank}
                      </span>
                      <div>
                        <h4 className="font-semibold text-xs text-[#EDF1F7]">{int.name}</h4>
                        <div className="text-[10px] font-mono text-[#8793A8] mt-0.5">
                          Est. Cooling: <span className="text-[#2FB8AC] font-bold">-{int.estCoolingImpactDegC}°C</span> | Est. Cost: <span className="text-[#EDF1F7]">₹ {int.costInrLakhs} Lakhs</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-[#2FB8AC]">
                        ₹ {int.costPerDegreeAvertedLakhs} L
                      </div>
                      <div className="text-[9px] text-[#8793A8]">per °C averted</div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#263349]/60 flex flex-wrap gap-1.5">
                    {int.coBenefits.map((cb, i) => (
                      <span key={i} className="text-[10px] font-mono bg-[#0B1220] text-[#8793A8] px-2 py-0.5 rounded border border-[#263349]">
                        + {cb}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#263349] bg-[#0B1220] flex items-center justify-between">
          <div className="text-xs font-mono text-[#8793A8]">
            Report ID: <span className="text-[#EDF1F7]">URB-DSS-{wardId}-2026</span>
          </div>

          <div className="flex items-center space-x-3">
            {exportSuccess && (
              <span className="text-xs font-mono text-[#2FB8AC] flex items-center space-x-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Action Brief Generated!</span>
              </span>
            )}

            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="bg-[#2FB8AC] hover:bg-[#269B91] text-[#0B1220] font-display font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded shadow-cyan-glow flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-[#0B1220]" />
                  <span>Compiling PDF Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Municipal Report</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
