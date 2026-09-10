import React from 'react';
import { motion } from 'framer-motion';
import { 
  ThermometerSun, 
  Map as MapIcon, 
  Activity, 
  Leaf, 
  Sun, 
  Satellite, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  TrendingDown,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#EDF1F7] font-sans flex flex-col overflow-x-hidden bg-ops-grid">
      {/* Navbar */}
      <nav className="h-16 bg-[#131B2E] border-b border-[#263349] px-6 lg:px-12 flex items-center justify-between shadow-panel z-30">
        <div className="flex items-center space-x-3">
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
              Urban Heat Decision Support System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a href="#story" className="text-xs font-mono text-[#8793A8] hover:text-[#EDF1F7] transition-colors hidden sm:inline-block">
            Scientific Framework
          </a>
          <button
            onClick={() => navigate('/map')}
            className="bg-[#2FB8AC] hover:bg-[#269B91] text-[#0B1220] font-display font-bold text-xs uppercase tracking-wider py-2 px-4 rounded shadow-cyan-glow flex items-center space-x-1.5 transition-all"
          >
            <span>Launch Mission Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 lg:px-16 pt-12 pb-16 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#131B2E] border border-[#263349] px-3 py-1 rounded-full text-xs font-mono text-[#2FB8AC] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2FB8AC] animate-ping" />
              <span>Evidence-Based Heat Mitigation Engine</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#EDF1F7] leading-tight tracking-tight mb-6"
            >
              Urban Heat <br />
              <span className="bg-gradient-to-r from-[#2FB8AC] via-[#F2A93B] to-[#E8632B] bg-clip-text text-transparent">
                Decision Support
              </span> System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-sm sm:text-base text-[#8793A8] leading-relaxed mb-8 max-w-xl"
            >
              Visualize urban heat island microclimates with real satellite infrared telemetry. Simulate nature-based tree canopies, cool roofs, and budget allocations backed by physics and machine learning.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-3.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button 
                className="bg-[#2FB8AC] hover:bg-[#269B91] text-[#0B1220] font-display font-bold text-xs uppercase tracking-wider py-3 px-6 rounded shadow-cyan-glow flex items-center space-x-2 transition-all"
                onClick={() => navigate('/map')}
              >
                <MapIcon className="w-4 h-4" />
                <span>Explore Thermal Map</span>
              </button>

              <button 
                className="bg-[#131B2E] hover:bg-[#1B2740] border border-[#263349] text-[#EDF1F7] font-display font-medium text-xs uppercase tracking-wider py-3 px-6 rounded flex items-center space-x-2 transition-all"
                onClick={() => navigate('/map')}
              >
                <Activity className="w-4 h-4 text-[#F2A93B]" />
                <span>Run What-If Simulation</span>
              </button>
            </motion.div>
          </div>

          {/* Interactive Preview Card */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div 
              onClick={() => navigate('/map')}
              className="bg-[#131B2E] border border-[#263349] rounded-xl p-4 shadow-panel-raised hover:border-[#2FB8AC] transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Header preview bar */}
              <div className="flex items-center justify-between border-b border-[#263349] pb-3 mb-3">
                <div className="flex items-center space-x-2 font-mono text-xs text-[#8793A8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E8632B]" />
                  <span>PUNE MUNICIPAL HEAT MAP</span>
                </div>
                <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-2 py-0.5 rounded border border-[#2FB8AC]/30">
                  LANDSAT-9 THERMAL
                </span>
              </div>

              {/* Graphic container */}
              <div className="relative aspect-video rounded-lg bg-[#0B1220] border border-[#263349] overflow-hidden flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-transparent to-[#2FB8AC]/10" />
                
                {/* Simulated Heat Glow Elements */}
                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#C81E3A]/30 rounded-full filter blur-2xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-[#F2A93B]/25 rounded-full filter blur-2xl" />
                <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-[#2FB8AC]/20 rounded-full filter blur-xl" />

                <div className="relative z-10 text-center flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#131B2E] border border-[#2FB8AC] flex items-center justify-center text-[#2FB8AC] shadow-cyan-glow group-hover:scale-110 transition-transform">
                    <ThermometerSun className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-[#EDF1F7]">Launch Interactive Workspace</div>
                    <div className="text-[11px] font-mono text-[#8793A8] mt-0.5">Click to simulate microclimates & interventions</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#8793A8]">
                <span>1,000+ Analyzed Micro-Zones</span>
                <span className="text-[#2FB8AC] font-semibold flex items-center space-x-1">
                  <span>Enter Ops Control</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Telemetry Key Metric Badges */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-[#263349]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <div className="bg-[#131B2E] border border-[#263349] p-4 rounded-lg flex items-center space-x-4">
            <div className="w-10 h-10 rounded bg-[#C81E3A]/10 border border-[#C81E3A]/30 flex items-center justify-center text-[#C81E3A]">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8793A8] uppercase">Peak Hotspot LST</div>
              <div className="font-mono text-2xl font-bold text-[#E8632B]">46.2°C</div>
            </div>
          </div>

          <div className="bg-[#131B2E] border border-[#263349] p-4 rounded-lg flex items-center space-x-4">
            <div className="w-10 h-10 rounded bg-[#F2A93B]/10 border border-[#F2A93B]/30 flex items-center justify-center text-[#F2A93B]">
              <ThermometerSun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8793A8] uppercase">City Mean LST</div>
              <div className="font-mono text-2xl font-bold text-[#EDF1F7]">38.4°C</div>
            </div>
          </div>

          <div className="bg-[#131B2E] border border-[#263349] p-4 rounded-lg flex items-center space-x-4">
            <div className="w-10 h-10 rounded bg-[#2FB8AC]/10 border border-[#2FB8AC]/30 flex items-center justify-center text-[#2FB8AC]">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8793A8] uppercase">Mitigation Potential</div>
              <div className="font-mono text-2xl font-bold text-[#2FB8AC]">-2.4°C</div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Scientific Framework Section */}
      <section id="story" className="px-6 lg:px-16 py-16 bg-[#131B2E]/60 border-t border-[#263349]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono uppercase text-[#2FB8AC] tracking-wider mb-2">
              Decision Support Architecture
            </div>
            <h2 className="text-3xl font-display font-bold text-[#EDF1F7]">
              Understanding & Mitigating Urban Heat
            </h2>
            <p className="text-xs font-mono text-[#8793A8] mt-2">
              A 3-tier framework combining remote sensing, physics attribution, and economic optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B1220] border border-[#263349] p-6 rounded-lg">
              <div className="w-10 h-10 rounded bg-[#C81E3A]/10 border border-[#C81E3A]/30 flex items-center justify-center text-[#C81E3A] mb-4">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-[#EDF1F7] mb-2">1. Hotspot Identification</h3>
              <p className="text-xs text-[#8793A8] leading-relaxed">
                Detect microclimate thermal anomalies using high-resolution Landsat 8/9, Sentinel-2, and ECOSTRESS infrared radiometric sensors.
              </p>
            </div>

            <div className="bg-[#0B1220] border border-[#263349] p-6 rounded-lg">
              <div className="w-10 h-10 rounded bg-[#F2A93B]/10 border border-[#F2A93B]/30 flex items-center justify-center text-[#F2A93B] mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-[#EDF1F7] mb-2">2. Physics-Informed Attribution</h3>
              <p className="text-xs text-[#8793A8] leading-relaxed">
                Decompose heat anomalies into albedo deficit, latent evapotranspiration loss, sensible flux, and anthropogenic discharges ($Q_F$).
              </p>
            </div>

            <div className="bg-[#0B1220] border border-[#263349] p-6 rounded-lg">
              <div className="w-10 h-10 rounded bg-[#2FB8AC]/10 border border-[#2FB8AC]/30 flex items-center justify-center text-[#2FB8AC] mb-4">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-[#EDF1F7] mb-2">3. ROI & Budget Simulation</h3>
              <p className="text-xs text-[#8793A8] leading-relaxed">
                Simulate targeted tree planting, cool roofs, and reflective pavements to maximize cooling averted per rupee (₹ Lakhs/°C).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-14 border-t border-[#263349] px-6 flex items-center justify-between text-xs font-mono text-[#8793A8] bg-[#0B1220]">
        <div>URBAN-IQ DSS © 2026 | Built for Municipal Heat Management</div>
        <div className="text-[#2FB8AC]">FastAPI • Random Forest ML • MapLibre</div>
      </footer>
    </div>
  );
};

export default LandingPage;
