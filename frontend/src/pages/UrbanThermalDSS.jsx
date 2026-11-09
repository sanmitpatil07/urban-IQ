import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const WARD_DATA = {
  kasba: {
    code: "WARD 23 • URBAN HEAT ISLAND CORE",
    name: "Kasba Peth Dense Quarter",
    temp: "42.8°C",
    desc: "Extremely compact historic fabric with 84% impervious surface, minimal canopy cover (4.2%), and severe nocturnal heat trapping. Priority candidate for albedo coating.",
    albedo: "0.12 (Low)",
    canopy: "-72.4%",
    pop: "84,200",
    pctRes: "54%",
    pctCom: "27%",
    pctInd: "12%",
    pctGrn: "7%",
    dashResidential: "128.93 238.76",
    dashCommercial: "64.46 238.76",
    dashIndustrial: "28.65 238.76",
    dashCanopy: "16.71 238.76"
  },
  hadapsar: {
    code: "WARD 48 • INDUSTRIAL CANOPY DEFICIT",
    name: "Hadapsar Industrial Belt",
    temp: "44.5°C",
    desc: "Corrugated metal roofing on manufacturing units acts as a thermal radiator. Microclimate ambient exceeds surrounding rural benchmark by +5.4°C.",
    albedo: "0.09 (Extreme Low)",
    canopy: "-81.0%",
    pop: "112,600",
    pctRes: "28%",
    pctCom: "19%",
    pctInd: "48%",
    pctGrn: "5%",
    dashResidential: "66.85 238.76",
    dashCommercial: "45.36 238.76",
    dashIndustrial: "114.6 238.76",
    dashCanopy: "11.94 238.76"
  },
  swargate: {
    code: "WARD 31 • MULTI-MODAL TARMAC ISLAND",
    name: "Swargate Transit Junction",
    temp: "41.2°C",
    desc: "High vehicular congestion combined with massive blacktop bus depot tarmac stores extreme latent heat radiating into pedestrian waiting bays.",
    albedo: "0.14 (Low)",
    canopy: "-64.2%",
    pop: "62,900",
    pctRes: "35%",
    pctCom: "45%",
    pctInd: "10%",
    pctGrn: "10%",
    dashResidential: "83.56 238.76",
    dashCommercial: "107.44 238.76",
    dashIndustrial: "23.88 238.76",
    dashCanopy: "23.88 238.76"
  },
  kothrud: {
    code: "WARD 12 • VEGETATED SUBURBAN CORRIDOR",
    name: "Kothrud Green Hill Foothills",
    temp: "34.0°C",
    desc: "Optimal urban canopy benchmark ward benefiting from katabatic wind flow off NDA / ARAI hills and strict tree preservation zoning.",
    albedo: "0.22 (Moderate)",
    canopy: "+38.5%",
    pop: "96,400",
    pctRes: "42%",
    pctCom: "18%",
    pctInd: "5%",
    pctGrn: "35%",
    dashResidential: "100.27 238.76",
    dashCommercial: "42.97 238.76",
    dashIndustrial: "11.94 238.76",
    dashCanopy: "83.56 238.76"
  }
};

export default function UrbanThermalDSS() {
  const navigate = useNavigate();

  // Navigation & View States
  const [activeWardKey, setActiveWardKey] = useState('kasba');
  const [currentCity, setCurrentCity] = useState('pune');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(true);
  const [isTooltipMinimized, setIsTooltipMinimized] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(null);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);

  // Tabs
  const [activeRailTab, setActiveRailTab] = useState('layers');
  const [activeRightTab, setActiveRightTab] = useState('overview');
  const [activeNav, setActiveNav] = useState('workbench');

  // Accordions
  const [accordions, setAccordions] = useState({
    layers: true,
    filters: true,
    sensorIngest: true,
    donut: true,
    barChart: true,
    permits: true
  });

  const toggleAccordion = (key) => {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Map GIS Layers
  const [layers, setLayers] = useState({
    residential: true,
    commercial: true,
    canopy: true,
    hotspots: true,
    water: true,
    coolroof: true
  });

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const toggleAllLayers = () => {
    const allActive = Object.values(layers).every(v => v);
    const nextVal = !allActive;
    setLayers({
      residential: nextVal,
      commercial: nextVal,
      canopy: nextVal,
      hotspots: nextVal,
      water: nextVal,
      coolroof: nextVal
    });
  };

  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  // Filters
  const [landFilter, setLandFilter] = useState('All Zones');
  const [complianceFilters, setComplianceFilters] = useState({
    mandated: true,
    inreview: true,
    exempted: true
  });

  const toggleCompliance = (type) => {
    setComplianceFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Map Navigation & Display Controls
  const [mapZoom, setMapZoom] = useState(1);
  const [mapInverted, setMapInverted] = useState(false);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [searchQuery, setSearchQuery] = useState('');

  const adjustZoom = (delta) => {
    setMapZoom(prev => Math.min(Math.max(Number((prev * delta).toFixed(2)), 0.7), 2.2));
  };

  const resetMap = () => {
    setMapZoom(1);
  };

  // Simulation Levers
  const [simulation, setSimulation] = useState({
    coolRoof: 35,
    forestry: 15,
    permeable: 20
  });

  const calculatedImpact = useMemo(() => {
    const tempDrop = (simulation.coolRoof * 0.042 + simulation.forestry * 0.065 + simulation.permeable * 0.024).toFixed(1);
    const avoidedHours = Math.round(tempDrop * 54);
    const budgetEstimate = (simulation.coolRoof * 0.035 + simulation.forestry * 0.058 + simulation.permeable * 0.02).toFixed(2);
    return { tempDrop, avoidedHours, budgetEstimate };
  }, [simulation]);

  const activeWard = WARD_DATA[activeWardKey] || WARD_DATA.kasba;

  // Action Handlers
  const handleCommitPlan = () => {
    setShowNotificationToast({
      title: "Action Plan Committed",
      message: `2024 Heat Action Dossier for ${activeWard.name} successfully committed to Pune Municipal Corporation central registry.`,
      type: "success"
    });
    setTimeout(() => setShowNotificationToast(null), 4500);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const q = query.toLowerCase().trim();
    if (q.includes('kasba') || q.includes('23')) {
      setActiveWardKey('kasba');
    } else if (q.includes('hadapsar') || q.includes('48') || q.includes('industr')) {
      setActiveWardKey('hadapsar');
    } else if (q.includes('swargate') || q.includes('31') || q.includes('transit')) {
      setActiveWardKey('swargate');
    } else if (q.includes('kothrud') || q.includes('12') || q.includes('green')) {
      setActiveWardKey('kothrud');
    }
  };

  const handleExportHap = () => {
    setShowNotificationToast({
      title: "Generating Heat Action Dossier",
      message: "Opening printable ISO-19115 Heat Action Plan Dossier for " + activeWard.name,
      type: "info"
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pune Municipal Corporation - Heat Action Plan Dossier</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #121e1c; background: #fff; line-height: 1.5; }
          .header { border-bottom: 3px solid #b8431e; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { color: #972c06; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; color: #58423b; font-family: monospace; }
          h2 { color: #2e5a44; font-size: 15px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #ded9cc; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ded9cc; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background: #f7f5ef; font-weight: 600; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #ffe5de; color: #972c06; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
          .stat-box { border: 1px solid #ded9cc; background: #f7f5ef; padding: 10px; border-radius: 4px; }
          .stat-label { font-size: 10px; text-transform: uppercase; color: #58423b; font-family: monospace; }
          .stat-val { font-size: 18px; font-weight: bold; color: #972c06; }
          .footer { margin-top: 40px; border-top: 1px solid #ded9cc; padding-top: 12px; font-size: 11px; color: #697572; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PUNE MUNICIPAL CORPORATION — HEAT ACTION PLAN</h1>
            <div class="subtitle">GEO-SPATIAL DECISION SUPPORT SYSTEM • URBAN-IQ v2.4 OPS</div>
          </div>
          <span class="badge">NDMA 2024 / ISO-19115</span>
        </div>

        <p style="font-size: 12px;"><strong>Jurisdiction:</strong> Pune PMC (Maharashtra) • <strong>Sensor Telemetry:</strong> USGS Landsat-9 TIRS-2 + Sentinel-2 MSI • <strong>Scene ID:</strong> LC09_L1TP_147047_20240502</p>

        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-label">Observed Peak LST</div>
            <div class="stat-val">${activeWard.temp}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Albedo Deficit</div>
            <div class="stat-val" style="color:#121e1c;">${activeWard.albedo}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Canopy Deficit</div>
            <div class="stat-val">${activeWard.canopy}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Vulnerable Pop.</div>
            <div class="stat-val" style="color:#121e1c;">${activeWard.pop}</div>
          </div>
        </div>

        <h2>1. Target Ward Profile</h2>
        <table>
          <tr><th>Ward Identification</th><td>${activeWard.code}</td></tr>
          <tr><th>Ward Designation</th><td><strong>${activeWard.name}</strong></td></tr>
          <tr><th>Diagnostic Attribution</th><td>${activeWard.desc}</td></tr>
        </table>

        <h2>2. Cadastral Land Use Distribution</h2>
        <table>
          <tr><th>Residential Dense</th><td>${activeWard.pctRes}</td><th>Commercial Tarmac</th><td>${activeWard.pctCom}</td></tr>
          <tr><th>Industrial Sheds</th><td>${activeWard.pctInd}</td><th>Green Canopy / Reserves</th><td>${activeWard.pctGrn}</td></tr>
        </table>

        <h2>3. Physics-Informed ML Simulation &amp; Budget Allocation</h2>
        <table>
          <tr><th>High-Albedo Cool Roof Mandate (SRI &gt; 104)</th><td>${simulation.coolRoof}% Coverage</td></tr>
          <tr><th>Miyawaki Urban Forestry Buffer</th><td>${simulation.forestry}% Area Infill</td></tr>
          <tr><th>Permeable Pavements &amp; Bioswales</th><td>${simulation.permeable}% Drainage Infiltration</td></tr>
          <tr style="background:#eef7f2;"><th>Projected Microclimate Cooling</th><td><strong style="color:#2e5a44; font-size: 14px;">-${calculatedImpact.tempDrop}°C</strong></td></tr>
          <tr style="background:#eef7f2;"><th>Avoided Heatwave Hours</th><td><strong style="color:#2e5a44;">${calculatedImpact.avoidedHours} Hours / Summer Season</strong></td></tr>
          <tr style="background:#eef7f2;"><th>Estimated Municipal CapEx Budget</th><td><strong>₹${calculatedImpact.budgetEstimate} Crores</strong></td></tr>
        </table>

        <div class="footer">
          <span>Signed: Taskforce Chief Planner (Dr. V. Rao, IAS)</span>
          <span>Municipal Heat Vulnerability Core • PMC Heat Action Cell</span>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 350);
    }
  };

  const handleStandardLegend = () => {
    setIsLegendModalOpen(true);
  };

  // Timeline year hotspots opacity
  const hotspotOpacity = useMemo(() => {
    if (!layers.hotspots) return 0;
    if (timelineYear === 2025) return 0.25;
    if (timelineYear === 2024) return 0.7;
    if (timelineYear === 2026) return 0.15;
    if (timelineYear === 2030) return 0.05;
    return 1;
  }, [layers.hotspots, timelineYear]);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col select-none">
      {/* Toast Notification Banner */}
      {showNotificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-lowest border-l-4 border-primary shadow-xl rounded p-3 max-w-md animate-bounce border border-outline-variant/30 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
          <div className="flex-1">
            <h4 className="font-title-sm text-body-sm font-bold text-on-surface">{showNotificationToast.title}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{showNotificationToast.message}</p>
          </div>
          <button onClick={() => setShowNotificationToast(null)} className="text-on-surface-variant hover:text-on-surface text-sm">✕</button>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-low/95 backdrop-blur-md z-50 flex items-center justify-between px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-on-primary text-[20px]">layers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-title-sm text-on-surface tracking-tight font-bold">URBAN THERMAL DSS</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Geo-Spatial Decision Support</span>
            </div>
          </div>
          <div className="h-6 w-px bg-surface-container-high mx-space-xs"></div>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">location_city</span>
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="bg-transparent font-title-sm text-body-sm text-on-surface focus:outline-none cursor-pointer pr-space-xs"
            >
              <option value="pune">Pune PMC (Maharashtra)</option>
              <option value="ahmedabad">Ahmedabad AMC (Gujarat)</option>
              <option value="bengaluru">Bengaluru BBMP (Karnataka)</option>
              <option value="hyderabad">Hyderabad GHMC (Telangana)</option>
            </select>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="flex-1 max-w-xl mx-space-lg hidden md:block">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wards, plots, thermal anomalies, or policy interventions..."
              className="w-full bg-surface-container-lowest pl-10 pr-4 py-1.5 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary shadow-none border border-outline-variant/20"
            />
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center gap-space-sm">
          {/* Zen Mode / Focus Viewport Toggle Button */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-title-sm font-semibold border border-outline-variant/40 ${
              isZenMode 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
            title="Toggle Zen / Fullscreen Map Mode (collapses all sidebars)"
          >
            <span className="material-symbols-outlined text-[16px]">{isZenMode ? 'fullscreen_exit' : 'center_focus_strong'}</span>
            <span>{isZenMode ? 'Exit Focus' : 'Focus Mode'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isZenMode ? 'bg-secondary-fixed animate-ping' : 'bg-surface-variant'}`}></span>
          </button>

          {/* Mission Map Link */}
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-space-xs px-2.5 py-1.5 bg-secondary/15 text-secondary border border-secondary/30 rounded hover:bg-secondary/25 transition-colors font-title-sm text-body-sm"
            title="Switch to MapLibre GL Mission Map"
          >
            <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
            <span className="hidden sm:inline">Mission Map</span>
          </button>

          {/* Export DSS Button */}
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-space-xs px-space-sm py-1.5 bg-surface-container rounded text-on-surface hover:bg-surface-container-high transition-colors font-title-sm text-body-sm"
            title="Export GeoJSON Layer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Export DSS</span>
          </button>

          {/* Notifications */}
          <button 
            onClick={() => {
              setShowNotificationToast({
                title: "3 Active Alerts Ingested",
                message: "Thermal exceedance >42°C in Kasba Peth, Hadapsar belt, and Swargate depot corridor.",
                type: "alert"
              });
            }}
            className="relative p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </button>

          <div className="h-6 w-px bg-surface-container-high mx-space-xs"></div>

          {/* User Profile */}
          <div className="flex items-center gap-space-sm pl-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-title-sm text-label-md text-on-surface leading-tight">Dr. V. Rao, IAS</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Taskforce Chief Planner</span>
            </div>
          </div>
        </div>
      </header>

      {/* FIXED LEFT WORKSTATION NAVIGATION (64px width) */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col justify-between py-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out border-r border-outline-variant/20 ${
          isZenMode ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-space-sm">
          <div className="px-space-md pb-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Spatial Workstation
            </span>
          </div>
          <nav className="flex flex-col gap-space-xs px-space-sm">
            <button
              onClick={() => { setActiveNav('workbench'); setActiveRailTab('layers'); }}
              className={`flex items-center gap-space-sm px-space-sm py-2 transition-colors rounded text-left ${
                activeNav === 'workbench'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              <span className="font-title-sm text-body-sm">Spatial Workbench</span>
            </button>
            <button
              onClick={() => { setActiveNav('dossier'); setActiveRightTab('overview'); }}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors text-left ${
                activeNav === 'dossier'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span className="font-title-sm text-body-sm">Ward Dossier</span>
            </button>
            <button
              onClick={() => { setActiveNav('simulation'); setActiveRightTab('analytics'); }}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors text-left ${
                activeNav === 'simulation'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">model_training</span>
              <span className="font-title-sm text-body-sm">Thermal Simulation</span>
            </button>
            <button
              onClick={() => { setActiveNav('mitigation'); setActiveRightTab('permits'); }}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors text-left ${
                activeNav === 'mitigation'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">nature_people</span>
              <span className="font-title-sm text-body-sm">Mitigation Plans</span>
            </button>
            <button
              onClick={() => { setActiveNav('satellite'); setActiveRightTab('history'); }}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors text-left ${
                activeNav === 'satellite'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
              <span className="font-title-sm text-body-sm">Satellite Ingestion</span>
            </button>
          </nav>
        </div>

        {/* LST Ingestion Status Badge */}
        <div className="px-space-md pt-space-sm">
          <div className="bg-surface-container-lowest p-space-sm rounded mb-space-sm border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">LST Ingestion</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface font-title-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary">satellite</span>
              <span>Landsat 9 TIRS-2</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mt-0.5">Cycle: 2024-Q2 Pass (0.5m)</span>
          </div>

          <button
            onClick={() => {
              setShowNotificationToast({
                title: "DSS Governance Settings",
                message: "Radiometric calibration: L1TP Radiance 0.0003342. Model: Physics-Informed ML + NDMA 2024 Guidelines.",
                type: "info"
              });
            }}
            className="flex items-center gap-space-sm px-space-sm py-2 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-title-sm text-body-sm">DSS Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="relative pt-16 w-full min-h-screen bg-surface">
        <div className={`flex flex-col w-full h-[calc(100vh-4rem)] overflow-hidden transition-all duration-300 ${
          isZenMode ? 'pl-0' : 'pl-64'
        }`}>
          {/* PRIMARY DSS WORKSPACE CONTAINER */}
          <div className="flex flex-1 w-full h-full relative overflow-hidden bg-surface-container-low">

            {/* 1. LEFT GIS DOCK (Consolidated Navigation Rail + Secondary Layer Drawer) */}
            <div 
              className={`relative z-30 flex h-full transition-all duration-300 ease-in-out shrink-0 ${
                isZenMode ? 'hidden' : ''
              }`}
              style={{ width: isLeftDrawerOpen ? '380px' : '56px' }}
            >
              {/* Micro Icon Rail (Far Left, 56px) */}
              <div className="w-14 bg-surface-container-lowest flex flex-col items-center justify-between py-space-md shadow-sm z-20 border-r border-outline-variant/20 shrink-0">
                <div className="flex flex-col items-center gap-space-sm w-full">
                  <button
                    onClick={() => { setActiveRailTab('layers'); if (!isLeftDrawerOpen) setIsLeftDrawerOpen(true); }}
                    className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                      activeRailTab === 'layers' && isLeftDrawerOpen
                        ? 'text-primary bg-primary-fixed/60 font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    title="GIS Layers"
                  >
                    <span className="material-symbols-outlined text-[20px]">layers</span>
                  </button>
                  <button
                    onClick={() => { setActiveRailTab('filters'); if (!isLeftDrawerOpen) setIsLeftDrawerOpen(true); }}
                    className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                      activeRailTab === 'filters' && isLeftDrawerOpen
                        ? 'text-primary bg-primary-fixed/60 font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    title="Attribute Filters"
                  >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                  </button>
                  <button
                    onClick={() => { setActiveRailTab('sensors'); if (!isLeftDrawerOpen) setIsLeftDrawerOpen(true); }}
                    className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                      activeRailTab === 'sensors' && isLeftDrawerOpen
                        ? 'text-primary bg-primary-fixed/60 font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    title="Sensor Feeds"
                  >
                    <span className="material-symbols-outlined text-[20px]">sensors</span>
                  </button>
                  <button
                    onClick={() => { setActiveRailTab('scenarios'); setActiveRightTab('analytics'); }}
                    className="w-10 h-10 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    title="Simulations"
                  >
                    <span className="material-symbols-outlined text-[20px]">counter_1</span>
                  </button>
                  <button
                    onClick={() => { setActiveRailTab('reports'); handleExportHap(); }}
                    className="w-10 h-10 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    title="Executive Reports"
                  >
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </button>
                </div>

                {/* Rail Collapse/Expand toggle button */}
                <div className="w-full flex justify-center">
                  <button
                    onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
                    className="w-10 h-10 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
                    title={isLeftDrawerOpen ? "Collapse Overlays Shelf" : "Expand Overlays Shelf"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isLeftDrawerOpen ? 'first_page' : 'last_page'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Expandable Controls Shelf */}
              {isLeftDrawerOpen && (
                <div className="flex-1 bg-surface-container flex flex-col h-full overflow-y-auto overflow-x-hidden shadow-sm">
                  {/* Shelf Header */}
                  <div className="p-space-md bg-surface-container-lowest flex items-center justify-between shadow-sm border-b border-outline-variant/20 sticky top-0 z-10">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Spatial Overlays</span>
                      <h2 className="font-title-md text-title-sm text-on-surface font-bold leading-tight">Raster &amp; Vector Feeds</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-title-sm font-semibold px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Landsat-9
                      </span>
                      <button
                        onClick={() => setIsLeftDrawerOpen(false)}
                        className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                        title="Collapse Panel"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                    </div>
                  </div>

                  {/* Shelf Dynamic Content Area */}
                  <div className="p-space-md flex flex-col gap-space-md flex-1">
                    {/* Section 1: Core Layers */}
                    <div className="bg-surface-container-lowest rounded border border-outline-variant/30 overflow-hidden shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('layers')}
                        className="flex items-center justify-between p-2.5 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${
                              accordions.layers ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Map Layers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-[11px] text-primary font-semibold">
                            {activeLayersCount} of 6 Active
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleAllLayers(); }}
                            className="px-2 py-0.5 rounded text-[10px] font-title-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                            title="Toggle All / Hide All Layers"
                          >
                            {Object.values(layers).every(Boolean) ? 'Hide All' : 'Show All'}
                          </button>
                        </div>
                      </div>

                      {/* Layer Switches Accordion Body */}
                      {accordions.layers && (
                        <div className="flex flex-col gap-1 p-2 border-t border-outline-variant/20">
                          {/* Layer Switch 1: Residential */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-primary transition-colors leading-tight">High Density Residential</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">Built footprint • 0.5m grid</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('residential')}
                              aria-checked={layers.residential}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.residential ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.residential ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>

                          {/* Layer Switch 2: Commercial */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-primary transition-colors leading-tight">Commercial &amp; Industrial</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">Asphalt &amp; metallic roofs</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('commercial')}
                              aria-checked={layers.commercial}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.commercial ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.commercial ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>

                          {/* Layer Switch 3: Canopy Cover */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-secondary shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-secondary transition-colors leading-tight">Canopy Cover (NDVI &gt; 0.35)</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">Urban forestry &amp; parklands</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('canopy')}
                              aria-checked={layers.canopy}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.canopy ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.canopy ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>

                          {/* Layer Switch 4: Critical Heat Hotspots */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-primary animate-pulse shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-primary transition-colors leading-tight">Critical Heat Hotspots (&gt;42°C)</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">TIRS Band 10 surface anomaly</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('hotspots')}
                              aria-checked={layers.hotspots}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.hotspots ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.hotspots ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>

                          {/* Layer Switch 5: Riparian Buffer */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-tertiary shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-tertiary transition-colors leading-tight">Mula-Mutha Riparian Buffer</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">Hydrological cooling corridor</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('water')}
                              aria-checked={layers.water}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.water ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.water ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>

                          {/* Layer Switch 6: Cool Roof Sites */}
                          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-cyan-600 shrink-0"></span>
                              <div className="flex flex-col">
                                <span className="font-title-sm text-body-sm text-on-surface group-hover:text-cyan-700 transition-colors leading-tight">High-Albedo Cool Roof Sites</span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant">Mandate verified installations</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLayer('coolroof')}
                              aria-checked={layers.coolroof}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                layers.coolroof ? 'bg-secondary' : 'bg-surface-variant'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                layers.coolroof ? 'translate-x-4' : 'translate-x-0'
                              }`}></span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Spatial Filter Matrix */}
                    <div className="bg-surface-container-lowest rounded border border-outline-variant/30 overflow-hidden shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('filters')}
                        className="flex items-center justify-between p-2.5 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${
                              accordions.filters ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Spatial Query Filters</span>
                        </div>
                        <span className="text-[10px] font-title-sm font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface">Active</span>
                      </div>

                      {accordions.filters && (
                        <div className="p-2.5 flex flex-col gap-3 border-t border-outline-variant/20">
                          {/* Land Type Filter Chips */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-[11px] text-on-surface font-semibold">Land Type Classification</span>
                              <button 
                                onClick={() => setLandFilter('All Zones')}
                                className="text-[10px] text-primary hover:underline font-title-sm"
                              >
                                Reset
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {['All Zones', 'Vacant (Brownfield)', 'Developed', 'Protected Ecology'].map(zone => (
                                <button
                                  key={zone}
                                  onClick={() => setLandFilter(zone)}
                                  className={`px-2.5 py-1 text-xs font-title-sm rounded transition-all ${
                                    landFilter === zone
                                      ? 'bg-primary text-on-primary shadow-xs'
                                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                  }`}
                                >
                                  {zone}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Compliance Status Chips */}
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="font-label-sm text-[11px] text-on-surface font-semibold">Cooling Compliance Status</span>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                onClick={() => toggleCompliance('mandated')}
                                className={`px-2 py-1 text-xs font-title-sm rounded transition-all text-center ${
                                  complianceFilters.mandated
                                    ? 'bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25'
                                    : 'bg-surface-container text-on-surface-variant border border-transparent opacity-60 line-through'
                                }`}
                              >
                                Mandated
                              </button>
                              <button
                                onClick={() => toggleCompliance('inreview')}
                                className={`px-2 py-1 text-xs font-title-sm rounded transition-all text-center ${
                                  complianceFilters.inreview
                                    ? 'bg-amber-500/15 text-amber-800 border border-amber-600/30 hover:bg-amber-500/25'
                                    : 'bg-surface-container text-on-surface-variant border border-transparent opacity-60 line-through'
                                }`}
                              >
                                In Review
                              </button>
                              <button
                                onClick={() => toggleCompliance('exempted')}
                                className={`px-2 py-1 text-xs font-title-sm rounded transition-all text-center ${
                                  complianceFilters.exempted
                                    ? 'bg-primary-fixed text-primary border border-primary/30 hover:bg-primary-fixed-dim'
                                    : 'bg-surface-container text-on-surface-variant border border-transparent opacity-60 line-through'
                                }`}
                              >
                                Exempted
                              </button>
                            </div>
                          </div>

                          {/* Ward Focus Dropdown */}
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="font-label-sm text-[11px] text-on-surface font-semibold">Priority Ward Focus</span>
                            <select
                              value={activeWardKey}
                              onChange={(e) => setActiveWardKey(e.target.value)}
                              className="w-full bg-surface-container-low py-2 px-2.5 rounded font-title-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                            >
                              <option value="kasba">Kasba Peth [W-23] • 42.8°C Extreme</option>
                              <option value="hadapsar">Hadapsar Industrial [W-48] • 44.5°C</option>
                              <option value="swargate">Swargate Junction [W-31] • 41.2°C</option>
                              <option value="kothrud">Kothrud Green [W-12] • 34.0°C</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Sensor Ingestion Card */}
                    <div className="p-space-sm bg-surface-container-lowest rounded border border-outline-variant/30 flex flex-col gap-1.5 shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('sensorIngest')}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">thermostat</span>
                          <span className="font-title-sm text-body-sm text-on-surface font-semibold">Surface Thermal Ingestion</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] text-secondary font-bold px-1.5 py-0.5 rounded bg-secondary-fixed">CALIBRATED</span>
                          <span 
                            className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform ${
                              accordions.sensorIngest ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                        </div>
                      </div>

                      {accordions.sensorIngest && (
                        <div className="flex flex-col gap-1 text-[11px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/20">
                          <div className="flex justify-between">
                            <span>Scene ID:</span>
                            <span className="text-on-surface font-semibold">LC09_L1TP_147047_20240502</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Radiance Multiplier:</span>
                            <span className="text-on-surface font-semibold">0.0003342</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cloud Cover:</span>
                            <span className="text-secondary font-bold">0.02%</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-primary h-full w-[88%]" title="88% Radiometric Confidence"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Toggle Latch for Left Sidebar (when collapsed) */}
              {!isLeftDrawerOpen && (
                <button
                  onClick={() => setIsLeftDrawerOpen(true)}
                  className="absolute top-4 left-16 z-40 bg-surface-container-lowest text-on-surface px-2.5 py-1.5 rounded-r shadow-md hover:bg-surface-container-high transition-transform flex items-center gap-1 border border-outline-variant/30 font-title-sm text-xs"
                  title="Expand Overlays Drawer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">chevron_right</span>
                  <span>GIS Shelf</span>
                </button>
              )}
            </div>

            {/* 2. CENTER INTERACTIVE GIS CARTOGRAPHIC WORKSPACE */}
            <div 
              className={`relative flex-1 h-full bg-[#f4f7f6] overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                mapInverted ? 'invert' : ''
              }`}
            >
              {/* Top Cartographic HUD Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
                <div className="pointer-events-auto flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded shadow-sm max-w-xl w-full border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">travel_explore</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cadastral plots, heat anomalies, survey coords..."
                    className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container shrink-0">
                    18.5204° N, 73.8567° E
                  </span>
                </div>

                <div className="pointer-events-auto flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded shadow-sm text-on-surface border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="font-title-sm text-body-sm font-semibold">Live TIRS-2 Pass</span>
                    <span className="text-on-surface-variant text-[11px]">| ΔT: +4.6°C</span>
                  </div>
                  <button
                    onClick={() => setIsZenMode(!isZenMode)}
                    className="bg-surface-container-lowest/95 backdrop-blur-md p-2 rounded shadow-sm text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/20"
                    title="Fullscreen Map Canvas"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                  </button>
                </div>
              </div>

              {/* INTERACTIVE VECTOR MAP CANVAS (SVG OF URBAN MORPHOLOGY) */}
              <div className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center">
                <svg
                  className="w-full h-full object-cover transition-transform duration-300 origin-center select-none"
                  style={{ transform: `scale(${mapZoom})` }}
                  viewBox="0 0 1440 900"
                >
                  <defs>
                    {/* Thermal Gradient Shaders */}
                    <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="heatCritical" r="50%">
                      <stop offset="0%" stopColor="#b8431e" stopOpacity="0.85" />
                      <stop offset="60%" stopColor="#e06f47" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f4f7f6" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient cx="50%" cy="50%" id="heatSevere" r="50%">
                      <stop offset="0%" stopColor="#c94d22" stopOpacity="0.75" />
                      <stop offset="70%" stopColor="#ea906e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f4f7f6" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient cx="50%" cy="50%" id="canopyCool" r="50%">
                      <stop offset="0%" stopColor="#2e7d58" stopOpacity="0.65" />
                      <stop offset="80%" stopColor="#64a989" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f4f7f6" stopOpacity="0" />
                    </radialGradient>
                    {/* Grid Pattern */}
                    <pattern height="60" id="cadastralGrid" patternUnits="userSpaceOnUse" width="60">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d5e4df" strokeDasharray="2,3" strokeWidth="0.7" />
                    </pattern>
                  </defs>

                  {/* Cadastral Base Tile Fill */}
                  <rect fill="#f1f5f3" height="900" width="1440" />
                  <rect fill="url(#cadastralGrid)" height="900" width="1440" />

                  {/* River System: Mula-Mutha Confluence Ribbon */}
                  <g className="transition-opacity duration-300" style={{ opacity: layers.water ? 1 : 0 }}>
                    <path
                      d="M -50,380 C 220,360 410,480 620,440 C 820,400 1020,490 1200,430 C 1340,390 1480,410 1520,410 L 1520,480 C 1480,480 1340,460 1200,500 C 1020,560 820,470 620,510 C 410,550 220,430 -50,450 Z"
                      fill="#9dcde7"
                      opacity="0.75"
                    />
                    <text fill="#25586e" fontFamily="Newsreader" fontSize="12" fontStyle="italic" letterSpacing="3" opacity="0.8" x="730" y="475">
                      MULA-MUTHA FLUVIAL COOLING CORRIDOR
                    </text>
                  </g>

                  {/* Major Street Grid Network (Pune Civic Topology) */}
                  <g fill="none" stroke="#cbd8d4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
                    <path d="M 120,50 L 380,850" />
                    <path d="M 300,100 L 1380,300" />
                    <path d="M 100,680 L 1350,620" />
                    <path d="M 980,80 L 1150,860" />
                    <path d="M 450,150 L 520,780" stroke="#b4c6c1" strokeWidth="12" />
                    <path d="M 640,160 L 710,790" stroke="#b4c6c1" strokeWidth="14" />
                    <path d="M 780,180 L 860,820" stroke="#b4c6c1" strokeWidth="11" />
                    <path d="M 320,380 L 1180,360" stroke="#b4c6c1" strokeWidth="12" />
                    <path d="M 350,560 L 1260,540" stroke="#b4c6c1" strokeWidth="12" />
                  </g>

                  {/* Street Names Architectural Drafting Notations */}
                  <g fill="#60736e" fontFamily="IBM Plex Sans" fontSize="9" fontWeight="600" letterSpacing="1">
                    <text transform="rotate(82, 535, 270)" x="535" y="270">JANGALI MAHARAJ ROAD</text>
                    <text transform="rotate(82, 690, 250)" x="690" y="250">SHIVAJI ROAD</text>
                    <text transform="rotate(82, 760, 280)" x="760" y="280">BAJIRAO ROAD</text>
                    <text x="440" y="372">TILAK ARTERIAL [CORRIDOR 4]</text>
                    <text x="920" y="532">SOLAPUR HIGHWAY TRUNK</text>
                  </g>

                  {/* Residential Built Footprint Layer */}
                  <g className="transition-opacity duration-300" style={{ opacity: layers.residential ? 1 : 0 }}>
                    <rect fill="#d97706" height="35" opacity="0.35" stroke="#b45309" strokeWidth="1" width="55" x="660" y="335" />
                    <rect fill="#d97706" height="42" opacity="0.35" stroke="#b45309" strokeWidth="1" width="60" x="725" y="340" />
                    <rect fill="#d97706" height="38" opacity="0.35" stroke="#b45309" strokeWidth="1" width="48" x="670" y="380" />
                    <rect fill="#d97706" height="30" opacity="0.35" stroke="#b45309" strokeWidth="1" width="65" x="730" y="390" />
                  </g>

                  {/* Commercial & Industrial Footprint Layer */}
                  <g className="transition-opacity duration-300" style={{ opacity: layers.commercial ? 1 : 0 }}>
                    <rect fill="#334155" height="70" opacity="0.4" stroke="#1e293b" strokeWidth="1.5" width="85" x="1120" y="580" />
                    <rect fill="#334155" height="55" opacity="0.4" stroke="#1e293b" strokeWidth="1.5" width="110" x="1215" y="630" />
                    <rect fill="#334155" height="45" opacity="0.4" stroke="#1e293b" strokeWidth="1.5" width="75" x="1140" y="660" />
                  </g>

                  {/* Urban Vegetation & Park Canopy Layer (NDVI Hotspots) */}
                  <g className="transition-opacity duration-300" style={{ opacity: layers.canopy ? 1 : 0 }}>
                    <circle cx="1080" cy="580" fill="url(#canopyCool)" r="140" />
                    <polygon fill="#a2d1b5" opacity="0.6" points="1020,530 1140,510 1170,620 1060,650" stroke="#3b6750" strokeWidth="1.5" />
                    <text fill="#1b4632" fontFamily="IBM Plex Sans" fontSize="11" fontWeight="600" x="1050" y="585">Empress Garden Reserve</text>
                    <text fill="#2e5a44" fontFamily="IBM Plex Sans" fontSize="9" x="1050" y="600">NDVI: 0.68 | 29.8°C</text>
                    <circle cx="580" cy="720" fill="url(#canopyCool)" r="95" />
                    <ellipse cx="580" cy="720" fill="#bdeed0" opacity="0.65" rx="80" ry="50" stroke="#3b6750" strokeWidth="1.5" />
                    <text fill="#1b4632" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="600" x="535" y="725">Parvati Green Buffer</text>
                    <circle cx="360" cy="220" fill="url(#canopyCool)" r="120" />
                    <polygon fill="#bdeed0" opacity="0.6" points="310,180 430,170 410,270 320,260" stroke="#3b6750" strokeWidth="1.5" />
                    <text fill="#1b4632" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="600" x="330" y="225">Univ. Canopy Buffer</text>
                  </g>

                  {/* Thermal Radiance Footprints (Simulated Landsat-9 LST Raster Overlay) */}
                  <g className="transition-opacity duration-300" style={{ opacity: hotspotOpacity }}>
                    <circle cx="720" cy="390" fill="url(#heatCritical)" r="130" />
                    <circle cx="1190" cy="650" fill="url(#heatCritical)" r="160" />
                    <circle cx="680" cy="610" fill="url(#heatSevere)" r="115" />
                    <circle cx="850" cy="310" fill="url(#heatSevere)" r="90" />
                  </g>

                  {/* Ward Cadastral Polygons (Interactive Choropleths) */}
                  <g>
                    {/* Kasba Peth */}
                    <polygon
                      id="poly-kasba"
                      onClick={() => setActiveWardKey('kasba')}
                      points="650,330 790,320 810,430 670,445"
                      className={`cursor-pointer transition-all duration-200 stroke-[2.5] ${
                        activeWardKey === 'kasba'
                          ? 'fill-primary/50 stroke-primary stroke-[3]'
                          : 'fill-primary/25 stroke-primary hover:fill-primary/45'
                      }`}
                    />
                    {/* Hadapsar */}
                    <polygon
                      id="poly-hadapsar"
                      onClick={() => setActiveWardKey('hadapsar')}
                      points="1100,560 1280,540 1310,730 1120,750"
                      className={`cursor-pointer transition-all duration-200 stroke-[2] ${
                        activeWardKey === 'hadapsar'
                          ? 'fill-primary-container/50 stroke-primary-container stroke-[3]'
                          : 'fill-primary-container/25 stroke-primary-container hover:fill-primary-container/45'
                      }`}
                    />
                    {/* Swargate */}
                    <polygon
                      id="poly-swargate"
                      onClick={() => setActiveWardKey('swargate')}
                      points="620,550 760,540 750,670 630,660"
                      className={`cursor-pointer transition-all duration-200 stroke-[2] ${
                        activeWardKey === 'swargate'
                          ? 'fill-amber-500/50 stroke-amber-600 stroke-[3]'
                          : 'fill-amber-500/20 stroke-amber-600 hover:fill-amber-500/40'
                      }`}
                    />
                    {/* Kothrud */}
                    <polygon
                      id="poly-kothrud"
                      onClick={() => setActiveWardKey('kothrud')}
                      points="240,460 380,440 400,610 260,630"
                      className={`cursor-pointer transition-all duration-200 stroke-[2] ${
                        activeWardKey === 'kothrud'
                          ? 'fill-secondary/50 stroke-secondary stroke-[3]'
                          : 'fill-secondary/20 stroke-secondary hover:fill-secondary/40'
                      }`}
                    />
                  </g>

                  {/* Cool Roof Permitted Parcels (Cyan polygons) */}
                  <g className="transition-opacity duration-300" style={{ opacity: layers.coolroof ? 1 : 0 }}>
                    <rect fill="#06b6d4" height="18" stroke="#0891b2" strokeWidth="1.5" width="22" x="680" y="355" />
                    <rect fill="#06b6d4" height="20" stroke="#0891b2" strokeWidth="1.5" width="26" x="710" y="375" />
                    <rect fill="#06b6d4" height="24" stroke="#0891b2" strokeWidth="1.5" width="18" x="745" y="360" />
                    <rect fill="#06b6d4" height="30" stroke="#0891b2" strokeWidth="1.5" width="40" x="1150" y="620" />
                    <rect fill="#06b6d4" height="35" stroke="#0891b2" strokeWidth="1.5" width="34" x="1210" y="640" />
                  </g>

                  {/* Interactive Ward Pins / Marker Flags */}
                  <g>
                    {/* Kasba Pin */}
                    <g 
                      onClick={() => setActiveWardKey('kasba')}
                      className="cursor-pointer group transform hover:scale-105 transition-transform" 
                      transform="translate(730, 370)"
                    >
                      <rect className="shadow-sm" fill="#ffffff" height="30" rx="3" stroke="#b8431e" strokeWidth="2" width="120" x="-60" y="-35" />
                      <circle className="animate-pulse" cx="-42" cy="-20" fill="#b8431e" r="5" />
                      <text fill="#121e1c" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="700" x="-30" y="-23">Kasba Peth [W-23]</text>
                      <text fill="#972c06" fontFamily="IBM Plex Sans" fontSize="9" fontWeight="800" x="-30" y="-11">42.8°C • EXTREME</text>
                      <polygon fill="#b8431e" points="0,-5 -5,-12 5,-12" />
                    </g>

                    {/* Hadapsar Pin */}
                    <g 
                      onClick={() => setActiveWardKey('hadapsar')}
                      className="cursor-pointer group transform hover:scale-105 transition-transform" 
                      transform="translate(1200, 640)"
                    >
                      <rect className="shadow-sm" fill="#ffffff" height="30" rx="3" stroke="#b8431e" strokeWidth="2" width="120" x="-60" y="-35" />
                      <circle className="animate-pulse" cx="-42" cy="-20" fill="#b8431e" r="5" />
                      <text fill="#121e1c" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="700" x="-30" y="-23">Hadapsar [W-48]</text>
                      <text fill="#972c06" fontFamily="IBM Plex Sans" fontSize="9" fontWeight="800" x="-30" y="-11">44.5°C • CRITICAL</text>
                      <polygon fill="#b8431e" points="0,-5 -5,-12 5,-12" />
                    </g>

                    {/* Swargate Pin */}
                    <g 
                      onClick={() => setActiveWardKey('swargate')}
                      className="cursor-pointer group transform hover:scale-105 transition-transform" 
                      transform="translate(680, 600)"
                    >
                      <rect className="shadow-sm" fill="#ffffff" height="30" rx="3" stroke="#d97706" strokeWidth="2" width="120" x="-60" y="-35" />
                      <circle cx="-42" cy="-20" fill="#d97706" r="5" />
                      <text fill="#121e1c" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="700" x="-30" y="-23">Swargate [W-31]</text>
                      <text fill="#b45309" fontFamily="IBM Plex Sans" fontSize="9" fontWeight="700" x="-30" y="-11">41.2°C • HIGH UHI</text>
                      <polygon fill="#d97706" points="0,-5 -5,-12 5,-12" />
                    </g>

                    {/* Kothrud Pin */}
                    <g 
                      onClick={() => setActiveWardKey('kothrud')}
                      className="cursor-pointer group transform hover:scale-105 transition-transform" 
                      transform="translate(320, 520)"
                    >
                      <rect className="shadow-sm" fill="#ffffff" height="30" rx="3" stroke="#3b6750" strokeWidth="2" width="120" x="-60" y="-35" />
                      <circle cx="-42" cy="-20" fill="#3b6750" r="5" />
                      <text fill="#121e1c" fontFamily="IBM Plex Sans" fontSize="10" fontWeight="700" x="-30" y="-23">Kothrud [W-12]</text>
                      <text fill="#2e5a44" fontFamily="IBM Plex Sans" fontSize="9" fontWeight="700" x="-30" y="-11">34.0°C • BENCHMARK</text>
                      <polygon fill="#3b6750" points="0,-5 -5,-12 5,-12" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* Selected Ward Live Cartographic Callout Box */}
              <div 
                className={`absolute bottom-24 left-8 z-20 bg-surface-container-lowest p-space-md rounded shadow-md border-l-4 border-primary max-w-sm transition-all duration-300 border border-outline-variant/30 ${
                  isTooltipMinimized ? 'max-h-16 overflow-hidden' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-label-sm text-[11px] text-primary uppercase font-bold tracking-wider">
                      {activeWard.code}
                    </span>
                    <h3 className="font-headline-sm text-title-md text-on-surface">
                      {activeWard.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-body-sm font-bold bg-primary text-on-primary px-2 py-0.5 rounded">
                      {activeWard.temp}
                    </span>
                    <button
                      onClick={() => setIsTooltipMinimized(!isTooltipMinimized)}
                      className="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                      title={isTooltipMinimized ? "Expand Dossier Card" : "Minimize Dossier Card"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isTooltipMinimized ? 'expand_more' : 'expand_less'}
                      </span>
                    </button>
                  </div>
                </div>

                {!isTooltipMinimized && (
                  <div className="transition-all duration-300 overflow-hidden">
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-1.5 leading-snug">
                      {activeWard.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-2 bg-surface-container-high/40 p-2 rounded border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">ALBEDO</span>
                        <span className="font-mono text-[12px] font-bold text-on-surface">{activeWard.albedo}</span>
                      </div>
                      <div className="w-px h-6 bg-surface-container-highest"></div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">CANOPY DEFICIT</span>
                        <span className="font-mono text-[12px] font-bold text-primary">{activeWard.canopy}</span>
                      </div>
                      <div className="w-px h-6 bg-surface-container-highest"></div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">POPULATION</span>
                        <span className="font-mono text-[12px] font-bold text-on-surface">{activeWard.pop}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating GIS Action Tools (Right Edge of Map Viewport) */}
              <div className="absolute right-6 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
                <div className="flex flex-col bg-surface-container-lowest rounded shadow-sm overflow-hidden border border-outline-variant/20">
                  <button
                    onClick={() => adjustZoom(1.15)}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <div className="h-px bg-surface-container-high"></div>
                  <button
                    onClick={() => adjustZoom(0.85)}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <div className="h-px bg-surface-container-high"></div>
                  <button
                    onClick={resetMap}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors text-[10px] font-mono font-bold"
                    title="Reset Zoom"
                  >
                    1:1
                  </button>
                </div>

                <div className="flex flex-col bg-surface-container-lowest rounded shadow-sm overflow-hidden border border-outline-variant/20">
                  <button
                    onClick={handleMeasureDistance}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Measure Thermal Gradient / Distance"
                  >
                    <span className="material-symbols-outlined text-[20px]">straighten</span>
                  </button>
                  <div className="h-px bg-surface-container-high"></div>
                  <button
                    onClick={() => setMapInverted(!mapInverted)}
                    className={`p-2 hover:bg-surface-container-high transition-colors ${
                      mapInverted ? 'text-primary' : 'text-on-surface'
                    }`}
                    title="Invert Basemap Mode"
                  >
                    <span className="material-symbols-outlined text-[20px]">layers_clear</span>
                  </button>
                  <div className="h-px bg-surface-container-high"></div>
                  <button
                    onClick={resetMap}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Reset Compass North"
                  >
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                  </button>
                  <div className="h-px bg-surface-container-high"></div>
                  <button
                    onClick={handleStandardLegend}
                    className="p-2 text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Cartographic Standards"
                  >
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </button>
                </div>
              </div>

              {/* Thermal Gradient Legend Bar (Pinned to Map Canvas) */}
              <div className="absolute bottom-20 right-6 z-20 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-2 rounded shadow-sm flex flex-col gap-1 pointer-events-auto border border-outline-variant/20">
                <div className="flex items-center justify-between text-[11px] font-title-sm font-semibold text-on-surface">
                  <span>Surface Temp (LST)</span>
                  <span className="text-primary font-bold">30°C — 46°C</span>
                </div>
                <div className="w-48 h-3 rounded flex overflow-hidden">
                  <div className="h-full w-1/5 bg-[#2e7d58]" title="< 32°C Safe"></div>
                  <div className="h-full w-1/5 bg-[#82af8d]" title="32 - 35°C Baseline"></div>
                  <div className="h-full w-1/5 bg-[#ea906e]" title="35 - 38°C Moderate"></div>
                  <div className="h-full w-1/5 bg-[#e06f47]" title="38 - 42°C High"></div>
                  <div className="h-full w-1/5 bg-[#b8431e]" title="> 42°C Extreme Hotspot"></div>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-on-surface-variant">
                  <span>30°C</span>
                  <span>34°C</span>
                  <span>38°C</span>
                  <span>42°C</span>
                  <span>46°C+</span>
                </div>
              </div>

              {/* Bottom Map Horizon Timeline Bar */}
              <div className="relative z-20 w-full bg-surface-container-lowest/95 backdrop-blur-md py-2.5 px-space-md shadow-[0_-2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between border-t border-outline-variant/20">
                <div className="flex items-center gap-3 w-full max-w-4xl overflow-x-auto pb-1 md:pb-0">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold shrink-0">
                    Temporal DSS Horizon:
                  </span>
                  {[
                    { year: 2022, label: "Pre-Mitigation Baseline" },
                    { year: 2023, label: "Thermal Audit Pass" },
                    { year: 2024, label: "In-Flight Telemetry" },
                    { year: 2025, label: "Cool Roof Mandate" },
                    { year: 2026, label: "Full Canopy Target" },
                    { year: 2030, label: "Net-Zero Urban Heat" }
                  ].map(item => (
                    <button
                      key={item.year}
                      onClick={() => setTimelineYear(item.year)}
                      className={`timeline-step flex flex-col text-left px-3 py-1 rounded transition-colors shrink-0 ${
                        timelineYear === item.year
                          ? 'bg-primary-fixed/80 border-b-2 border-primary text-primary'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <span className={`font-title-sm text-body-sm font-bold ${timelineYear === item.year ? 'text-primary' : 'text-on-surface'}`}>
                        {item.year} • {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={() => { setActiveRightTab('analytics'); }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-title-sm text-body-sm rounded hover:bg-primary-container transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Simulate Horizon</span>
                  </button>
                </div>
              </div>

              {/* Floating Reopen Pill Button on right edge of map (when right panel collapsed) */}
              {!isRightDrawerOpen && (
                <button
                  onClick={() => setIsRightDrawerOpen(true)}
                  className="absolute top-24 right-0 z-40 bg-surface-container-lowest text-on-surface pl-3 pr-2 py-2 rounded-l-lg shadow-lg hover:bg-surface-container-high hover:text-primary transition-all flex items-center gap-1.5 border-y border-l border-outline-variant/40 font-title-sm text-xs"
                  title="Expand Diagnostic Analytics Drawer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">chevron_left</span>
                  <span className="font-semibold">Show Analytics</span>
                </button>
              )}
            </div>

            {/* 3. RIGHT ANALYTICS & SIMULATION DRAWER */}
            {isRightDrawerOpen && (
              <div className="relative z-30 w-96 lg:w-[420px] bg-surface-container-lowest flex flex-col h-full shadow-sm shrink-0 transition-all duration-300 border-l border-outline-variant/20">
                {/* Top Tab Switchers */}
                <div className="p-space-sm bg-surface-container-low flex items-center justify-between shadow-xs border-b border-outline-variant/20">
                  <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded">
                    {[
                      { key: 'overview', label: 'Overview' },
                      { key: 'permits', label: 'Permits' },
                      { key: 'analytics', label: 'Simulation' },
                      { key: 'history', label: 'Audit Trail' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveRightTab(tab.key)}
                        className={`px-3 py-1 rounded text-xs font-title-sm font-semibold transition-all ${
                          activeRightTab === tab.key
                            ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Collapse Drawer Toggle Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsRightDrawerOpen(false)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-title-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                      title="Collapse Right Drawer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      <span className="hidden sm:inline">Hide</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeRightTab === 'overview' && (
                  <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
                    {/* Land Use & Heat Vulnerability Circular Gauge */}
                    <div className="bg-surface-container-low rounded border border-outline-variant/30 overflow-hidden shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('donut')}
                        className="flex items-center justify-between p-3 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high/30 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${
                              accordions.donut ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                          <span className="font-title-sm text-body-sm font-bold text-on-surface">Land Use &amp; Heat Vulnerability</span>
                        </div>
                        <span className="font-label-sm text-[11px] text-on-surface-variant font-mono uppercase">
                          {activeWardKey.toUpperCase()}
                        </span>
                      </div>

                      {accordions.donut && (
                        <div className="p-3 border-t border-outline-variant/20 flex items-center gap-4">
                          {/* SVG Donut Chart */}
                          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" fill="none" r="38" stroke="#d5e4df" strokeWidth="12" />
                              <circle 
                                className="transition-all duration-700" 
                                cx="50" 
                                cy="50" 
                                fill="none" 
                                r="38" 
                                stroke="#b8431e" 
                                strokeDasharray={activeWard.dashResidential} 
                                strokeDashoffset="0" 
                                strokeWidth="12" 
                              />
                              <circle 
                                className="transition-all duration-700" 
                                cx="50" 
                                cy="50" 
                                fill="none" 
                                r="38" 
                                stroke="#3d6d84" 
                                strokeDasharray={activeWard.dashCommercial} 
                                strokeDashoffset="-128.93" 
                                strokeWidth="12" 
                              />
                              <circle 
                                className="transition-all duration-700" 
                                cx="50" 
                                cy="50" 
                                fill="none" 
                                r="38" 
                                stroke="#e06f47" 
                                strokeDasharray={activeWard.dashIndustrial} 
                                strokeDashoffset="-193.39" 
                                strokeWidth="12" 
                              />
                              <circle 
                                className="transition-all duration-700" 
                                cx="50" 
                                cy="50" 
                                fill="none" 
                                r="38" 
                                stroke="#2e7d58" 
                                strokeDasharray={activeWard.dashCanopy} 
                                strokeDashoffset="-222.04" 
                                strokeWidth="12" 
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                              <span className="font-mono text-title-sm font-bold text-on-surface">100%</span>
                              <span className="font-label-sm text-[9px] text-on-surface-variant uppercase">CADASTRE</span>
                            </div>
                          </div>

                          {/* Legend Columns */}
                          <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-center justify-between text-body-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                                <span className="font-title-sm text-[12px] text-on-surface">Residential Dense</span>
                              </div>
                              <span className="font-mono text-[12px] font-bold text-on-surface">{activeWard.pctRes}</span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                                <span className="font-title-sm text-[12px] text-on-surface">Commercial Tarmac</span>
                              </div>
                              <span className="font-mono text-[12px] font-bold text-on-surface">{activeWard.pctCom}</span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                                <span className="font-title-sm text-[12px] text-on-surface">Industrial Sheds</span>
                              </div>
                              <span className="font-mono text-[12px] font-bold text-on-surface">{activeWard.pctInd}</span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                                <span className="font-title-sm text-[12px] text-on-surface">Green Canopy / Parks</span>
                              </div>
                              <span className="font-mono text-[12px] font-bold text-secondary">{activeWard.pctGrn}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Development & Thermal Trends Bar Chart */}
                    <div className="bg-surface-container-low rounded border border-outline-variant/30 overflow-hidden shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('barChart')}
                        className="flex items-center justify-between p-3 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high/30 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${
                              accordions.barChart ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                          <span className="font-title-sm text-body-sm font-bold text-on-surface">Thermal Anomaly &amp; Cooling Trends</span>
                        </div>
                        <span className="font-label-sm text-[11px] text-on-surface-variant">LST vs Target</span>
                      </div>

                      {accordions.barChart && (
                        <div className="p-3 flex flex-col gap-2 border-t border-outline-variant/20">
                          <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/20 flex flex-col gap-2">
                            <div className="h-28 w-full flex items-end justify-between gap-2 px-1 pt-4">
                              {[
                                { month: 'Jan', peak: '38%', target: '25%', peakVal: '31.2°C', targetVal: '29.0°C' },
                                { month: 'Feb', peak: '48%', target: '30%', peakVal: '34.5°C', targetVal: '30.0°C' },
                                { month: 'Mar', peak: '72%', target: '42%', peakVal: '39.8°C', targetVal: '33.5°C' },
                                { month: 'Apr', peak: '94%', target: '52%', peakVal: '43.1°C Peak', targetVal: '35.0°C', highlight: true },
                                { month: 'May', peak: '98%', target: '58%', peakVal: '44.5°C Peak', targetVal: '36.0°C', highlight: true },
                                { month: 'Jun', peak: '55%', target: '40%', peakVal: '36.2°C', targetVal: '32.0°C' },
                              ].map(m => (
                                <div key={m.month} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                                    <div 
                                      className={`w-2.5 rounded-t ${m.highlight ? 'bg-primary' : 'bg-primary/70'}`} 
                                      style={{ height: m.peak }} 
                                      title={`Mean: ${m.peakVal}`}
                                    ></div>
                                    <div 
                                      className="w-2.5 bg-secondary/80 rounded-t" 
                                      style={{ height: m.target }} 
                                      title={`Target: ${m.targetVal}`}
                                    ></div>
                                  </div>
                                  <span className={`font-mono text-[10px] ${m.highlight ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                                    {m.month}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10 text-[10px] font-title-sm text-on-surface-variant">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <span>Observed Peak LST</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                <span>NDMA Cooling Target Threshold</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent Permits / Mitigation Interventions */}
                    <div className="bg-surface-container-low rounded border border-outline-variant/30 overflow-hidden shadow-xs">
                      <div 
                        onClick={() => toggleAccordion('permits')}
                        className="flex items-center justify-between p-3 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high/30 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${
                              accordions.permits ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            expand_more
                          </span>
                          <span className="font-title-sm text-body-sm font-bold text-on-surface">Recent Permits &amp; Sanctions</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveRightTab('permits'); }}
                          className="font-label-sm text-[11px] text-primary font-semibold hover:underline"
                        >
                          View All (18)
                        </button>
                      </div>

                      {accordions.permits && (
                        <div className="p-3 flex flex-col gap-2 border-t border-outline-variant/20">
                          <div 
                            onClick={() => setActiveWardKey('kasba')}
                            className="flex items-center justify-between p-2.5 bg-surface-container-lowest rounded border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-title-sm text-body-sm font-semibold text-on-surface">Kasba Peth High-Albedo Cluster</span>
                              <span className="font-label-sm text-[10px] text-on-surface-variant">Commercial / Rooftop Coating • 14,200 m²</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-title-sm font-bold bg-secondary-fixed text-on-secondary-fixed">
                              Approved
                            </span>
                          </div>

                          <div 
                            onClick={() => setActiveWardKey('swargate')}
                            className="flex items-center justify-between p-2.5 bg-surface-container-lowest rounded border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-title-sm text-body-sm font-semibold text-on-surface">Swargate Transit Canopy Expansion</span>
                              <span className="font-label-sm text-[10px] text-on-surface-variant">Public Concourse Green Pergola • 8,500 m²</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-title-sm font-bold bg-amber-100 text-amber-800">
                              Pending PMC
                            </span>
                          </div>

                          <div 
                            onClick={() => setActiveWardKey('hadapsar')}
                            className="flex items-center justify-between p-2.5 bg-surface-container-lowest rounded border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-title-sm text-body-sm font-semibold text-on-surface">Hadapsar Shed Ceramic Paint Mandate</span>
                              <span className="font-label-sm text-[10px] text-on-surface-variant">Industrial Zone • 32,000 m² Metal Deck</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-title-sm font-bold bg-primary-fixed text-primary">
                              Under Mandate
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Executive Quick Action CTA */}
                    <div className="pt-1 flex flex-col gap-2">
                      <button
                        onClick={handleCommitPlan}
                        className="w-full py-2.5 bg-primary text-on-primary font-title-sm text-body-sm rounded font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Commit 2024 Ward Cooling Plan</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleExportHap}
                          className="flex-1 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-title-sm font-semibold flex items-center justify-center gap-1 border border-outline-variant/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          <span>HAP PDF</span>
                        </button>
                        <button
                          onClick={handleExportGeoJson}
                          className="flex-1 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-title-sm font-semibold flex items-center justify-center gap-1 border border-outline-variant/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                          <span>GeoJSON</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PERMITS EXTENDED LIST */}
                {activeRightTab === 'permits' && (
                  <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title-md text-title-sm text-on-surface font-bold">Cooling Permits &amp; Mandates</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Total: 46 Dossiers</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[
                        { id: '#PMC-HAP-2024-089', status: 'APPROVED', statusClass: 'bg-secondary-fixed text-on-secondary-fixed', title: 'Kasba Peth Slum Resettlement Cool Coating', area: '14,200 m² high-albedo elastomeric SRI >104', date: 'Sanctioned: 14 Apr 2024' },
                        { id: '#PMC-HAP-2024-094', status: 'CIVIC REVIEW', statusClass: 'bg-amber-100 text-amber-800', title: 'Hadapsar Logistics Hub Albedo Mandate', area: '32,000 m² metal deck heat-reflective ceramic paint', date: 'Filing: 28 Apr 2024' },
                        { id: '#PMC-HAP-2024-102', status: 'COMMISSIONED', statusClass: 'bg-secondary-fixed text-on-secondary-fixed', title: 'Swargate Metro Concourse Bioswale Buffer', area: '8,500 m² concourse green pergola & permeable pavers', date: 'Operational: 02 May 2024' },
                        { id: '#PMC-HAP-2024-118', status: 'INSPECTION', statusClass: 'bg-primary-fixed text-primary', title: 'Shivajinagar Bus Stand Cool Roof Overlay', area: '6,200 m² solar reflective polyurethane membrane', date: 'Audit Due: 18 May 2024' },
                      ].map(p => (
                        <div key={p.id} className="p-3 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-title-sm text-body-sm font-bold text-on-surface">{p.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-title-sm font-bold ${p.statusClass}`}>
                              {p.status}
                            </span>
                          </div>
                          <span className="text-xs text-on-surface font-semibold">{p.title}</span>
                          <span className="text-[11px] text-on-surface-variant">{p.area}</span>
                          <span className="text-[10px] font-mono text-on-surface-variant border-t border-outline-variant/10 pt-1 mt-0.5">
                            {p.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: SIMULATION LEVERS (Physics-Informed Neural Network) */}
                {activeRightTab === 'analytics' && (
                  <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-lg">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold">Physics-Informed Neural Network</span>
                      <h3 className="font-headline-sm text-title-md text-on-surface">Thermal Mitigation Levers</h3>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                        Simulate real-time urban microclimate boundary cooling by toggling geo-spatial intervention percentages.
                      </p>
                    </div>

                    {/* Sliders */}
                    <div className="flex flex-col gap-3">
                      {/* Slider 1: Cool Roofs */}
                      <div className="p-3 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-primary">roofing</span>
                            <span className="font-title-sm text-body-sm font-semibold text-on-surface">High-Albedo Cool Roofs (SRI &gt; 104)</span>
                          </div>
                          <span className="font-mono text-body-sm font-bold text-primary">{simulation.coolRoof}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={simulation.coolRoof}
                          onChange={(e) => setSimulation(prev => ({ ...prev, coolRoof: Number(e.target.value) }))}
                          className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                          <span>0% Baseline</span>
                          <span>Target: 35%</span>
                          <span>100% Full Cap</span>
                        </div>
                      </div>

                      {/* Slider 2: Miyawaki Urban Forestry */}
                      <div className="p-3 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-secondary">park</span>
                            <span className="font-title-sm text-body-sm font-semibold text-on-surface">Urban Miyawaki Forests &amp; Pocket Parks</span>
                          </div>
                          <span className="font-mono text-body-sm font-bold text-secondary">{simulation.forestry}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={simulation.forestry}
                          onChange={(e) => setSimulation(prev => ({ ...prev, forestry: Number(e.target.value) }))}
                          className="w-full accent-secondary h-1.5 bg-surface-container-high rounded cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                          <span>0% Sparse</span>
                          <span>Target: 15%</span>
                          <span>50% Max Infill</span>
                        </div>
                      </div>

                      {/* Slider 3: Permeable Pavements */}
                      <div className="p-3 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-tertiary">water_drop</span>
                            <span className="font-title-sm text-body-sm font-semibold text-on-surface">Permeable Pavement &amp; Riparian Swales</span>
                          </div>
                          <span className="font-mono text-body-sm font-bold text-tertiary">{simulation.permeable}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={simulation.permeable}
                          onChange={(e) => setSimulation(prev => ({ ...prev, permeable: Number(e.target.value) }))}
                          className="w-full accent-tertiary h-1.5 bg-surface-container-high rounded cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                          <span>0% Impervious</span>
                          <span>Target: 20%</span>
                          <span>60% Bioswale</span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Live Dynamic Impact Panel */}
                    <div className="p-space-md bg-secondary-fixed/30 rounded flex flex-col gap-2 shadow-xs border-l-4 border-secondary border-y border-r border-secondary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[11px] text-secondary font-bold uppercase tracking-wider">PROJECTED COOLING EFFECT</span>
                        <span className="text-xs font-mono bg-surface-container-lowest px-2 py-0.5 rounded text-secondary font-bold shadow-xs">PINN RMSE: ±0.3°C</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-headline-lg text-headline-md font-bold text-secondary">
                          -{calculatedImpact.tempDrop}°C
                        </span>
                        <span className="font-title-sm text-body-sm text-on-surface font-semibold">
                          Microclimate Reduction
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 pt-2 border-t border-secondary/20 text-xs font-body-sm text-on-surface">
                        <div className="flex justify-between">
                          <span>Avoided Extreme Heatwave Hours:</span>
                          <span className="font-mono font-bold text-secondary">{calculatedImpact.avoidedHours} Hours / Season</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Municipal CapEx Budget:</span>
                          <span className="font-mono font-bold text-on-surface">₹{calculatedImpact.budgetEstimate} Crores</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowNotificationToast({
                          title: "PINN Equilibrium Converged",
                          message: `Simulated microclimate delta T: -${calculatedImpact.tempDrop}°C across ${activeWard.name}. Convergence in 14 iterations.`,
                          type: "success"
                        });
                      }}
                      className="w-full py-2.5 bg-secondary text-on-secondary font-title-sm text-body-sm rounded font-semibold hover:bg-secondary/90 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">cached</span>
                      <span>Recalculate PINN Equilibrium</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: AUDIT TRAIL / SATELLITE HISTORY */}
                {activeRightTab === 'history' && (
                  <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
                    <h3 className="font-title-md text-title-sm text-on-surface font-bold">Ingestion &amp; Telemetry Audit Log</h3>
                    <div className="flex flex-col gap-3 font-mono text-[11px]">
                      <div className="p-2.5 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-1">
                        <div className="flex justify-between text-on-surface font-bold">
                          <span>LANDSAT-9 TIRS-2 SCENE</span>
                          <span className="text-secondary">OK 200</span>
                        </div>
                        <span className="text-on-surface-variant">LC09_L1TP_147047_20240502_20240502_02_T1</span>
                        <span className="text-[10px] text-on-surface-variant">Radiometric QA: 99.4% Valid Pixels • TIRS Band 10</span>
                      </div>

                      <div className="p-2.5 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-1">
                        <div className="flex justify-between text-on-surface font-bold">
                          <span>SENTINEL-2 MSI ATMOSPHERIC</span>
                          <span className="text-secondary">OK 200</span>
                        </div>
                        <span className="text-on-surface-variant">S2B_MSIL2A_20240428T053649_N0510_R105</span>
                        <span className="text-[10px] text-on-surface-variant">Surface Reflectance BOA Processed • NDVI/NDBI Sync</span>
                      </div>

                      <div className="p-2.5 bg-surface-container rounded border border-outline-variant/20 flex flex-col gap-1">
                        <div className="flex justify-between text-on-surface font-bold">
                          <span>NASA ECOSTRESS THERMAL PASS</span>
                          <span className="text-tertiary">INGESTED</span>
                        </div>
                        <span className="text-on-surface-variant">ECOSTRESS_L2_LSTE_32481_007_20240419T084122</span>
                        <span className="text-[10px] text-on-surface-variant">Diurnal Evapotranspiration Flux Attributed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
