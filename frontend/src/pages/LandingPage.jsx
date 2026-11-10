import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Layers,
  ThermometerSun,
  Trees,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-x-hidden">
      {/* Light Institutional Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-12 flex items-center justify-between shadow-xs z-30">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[19px]">layers</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-slate-900">
                URBAN-<span className="text-emerald-700 font-bold">IQ</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                v2.4
              </span>
            </div>
            <p className="hidden xs:block text-[9px] font-mono text-slate-500 uppercase tracking-wider -mt-0.5">
              Geo-Spatial Decision Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#metrics" className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline-block">
            Scientific Framework
          </a>
          <button
            onClick={() => navigate('/map')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs uppercase tracking-wider py-2 px-4 rounded shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Launch Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 lg:px-16 pt-12 pb-16 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono text-emerald-800 mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Evidence-Based Urban Heat Island Mitigation</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-slate-900 leading-tight tracking-tight mb-6"
            >
              Institutional Decision Support for <br />
              <span className="text-emerald-700">
                Urban Heat Island
              </span> Resilience
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 max-w-xl"
            >
              Calibrated remote sensing (Landsat 9 TIRS-2, Sentinel-2 MSI) paired with Physics-Informed ML simulations. Design cool roofs, Miyawaki urban forestry, and heat action plans across 10 Indian metropolitan regions.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-3.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 px-6 rounded shadow-xs flex items-center gap-2 transition-all"
                onClick={() => navigate('/map')}
              >
                <Layers className="w-4 h-4" />
                <span>Launch Spatial Workbench</span>
              </button>

              <a 
                href="#metrics"
                className="bg-white hover:bg-slate-50 text-slate-800 font-mono text-xs py-3 px-5 rounded border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>View National Grid</span>
                <Compass className="w-4 h-4 text-emerald-700" />
              </a>
            </motion.div>
          </div>

          {/* Hero Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-800 uppercase">Live Satellite Radiometry Feed</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                NASA OPEN API
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Metropolitan Scope</span>
                  <div className="font-bold text-slate-900 text-sm">10 Indian Metro Hubs</div>
                </div>
                <span className="text-emerald-700 font-bold">190+ Wards</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Model Architecture</span>
                  <div className="font-bold text-slate-900 text-sm">Physics-Informed HistGradientBoosting</div>
                </div>
                <span className="text-emerald-700 font-bold">R² = 0.94</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Thermal Sensor Grid</span>
                  <div className="font-bold text-slate-900 text-sm">Landsat-9 TIRS-2 + Sentinel-2 MSI</div>
                </div>
                <span className="text-slate-500">Ward Satellite Grid</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>National Heat Hazard Audit 2024-2026</span>
              <span className="text-emerald-700 font-bold">PMC / NDMA Standard</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Feature Section */}
      <section id="metrics" className="px-6 lg:px-16 py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-bold">
              Municipal Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 mt-1">
              End-to-End Decision Support Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <ThermometerSun className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">
                Calibrated Thermal Telemetry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingest surface skin temperature anomalies from NASA Open API & Open-Meteo radiometry sensors across all 10 major Indian metropolitan zones.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Trees className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">
                Physics-Informed Simulation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulate urban afforestation, reflective pavements, and cool roofs with real-time temperature delta calculations and budget constraints.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">
                Heat Action Plans & PDF Reports
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate official NDMA-compliant municipal heat resilience reports, actionable cooling guidelines, and ROI-ranked intervention schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 lg:px-12 bg-white border-t border-slate-200 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-slate-900">Urban-IQ v2.4</span>
          <span>• Institutional Municipal Decision Support</span>
        </div>
        <div>
          <span>National Thermal Radiometry Grid • Powered by NASA & ISRO Open Science</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
