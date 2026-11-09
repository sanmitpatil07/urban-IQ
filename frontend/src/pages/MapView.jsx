import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sparkles, X, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as turf from '@turf/turf';
import '../index.css';

import { Header } from '../components/Header';
import { LeftRail } from '../components/LeftRail';
import { RightRail } from '../components/RightRail';
import { TimelineScrubber } from '../components/TimelineScrubber';
import { WardDetailModal } from '../components/WardDetailModal';
import { OptimizingOverlay } from '../components/OptimizingOverlay';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { 
  MOCK_WARDS, 
  MOCK_SATELLITE_PASSES, 
  MOCK_ALERTS, 
  runScenarioOptimizer,
  getMockPuneGeoJSON
} from '../services/mockApi';

// Satellite style: Esri World Imagery (crisp aerial) + OpenStreetMap road labels overlay (Google Maps hybrid style)
const SATELLITE_STYLE = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sprite: "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© Esri, Maxar, Earthstar Geographics, and the GIS User Community"
    },
    "esri-reference": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 19
    },
    "esri-labels": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 19
    }
  },
  layers: [
    {
      id: "satellite-imagery",
      type: "raster",
      source: "esri-imagery",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "raster-saturation": 0.1,
        "raster-contrast": 0.05,
        "raster-brightness-min": 0.0,
        "raster-brightness-max": 1.0
      }
    },
    {
      id: "satellite-roads",
      type: "raster",
      source: "esri-reference",
      minzoom: 8,
      maxzoom: 22,
      paint: { "raster-opacity": 0.9 }
    },
    {
      id: "satellite-labels",
      type: "raster",
      source: "esri-labels",
      minzoom: 5,
      maxzoom: 22,
      paint: { "raster-opacity": 1.0 }
    }
  ]
};

const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite: SATELLITE_STYLE
};

const CITY_COORDINATES = {
  'pune': { longitude: 73.85, latitude: 18.56, zoom: 10.3 },
  'mumbai': { longitude: 72.96, latitude: 19.16, zoom: 10.0 },
  'delhi ncr': { longitude: 77.21, latitude: 28.58, zoom: 9.8 },
  'delhi': { longitude: 77.21, latitude: 28.58, zoom: 9.8 },
  'bengaluru': { longitude: 77.62, latitude: 12.98, zoom: 10.2 },
  'hyderabad': { longitude: 78.44, latitude: 17.42, zoom: 10.3 },
  'ahmedabad': { longitude: 72.58, latitude: 23.10, zoom: 10.4 },
  'chennai': { longitude: 80.18, latitude: 13.04, zoom: 10.4 },
  'kolkata': { longitude: 88.38, latitude: 22.58, zoom: 10.5 },
  'jaipur': { longitude: 75.80, latitude: 26.88, zoom: 10.6 },
  'lucknow': { longitude: 80.96, latitude: 26.85, zoom: 10.6 }
};

export function MapView() {
  const [currentCity, setCurrentCity] = useState('Pune');
  const [geoData, setGeoData] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [selectedWardForModal, setSelectedWardForModal] = useState(null);

  // Map tile style ('dark' | 'satellite')
  const [mapStyleType, setMapStyleType] = useState('dark');

  // Rails state (responsive defaults: open on desktop, drawers on mobile)
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  const [isRightRailOpen, setIsRightRailOpen] = useState(false);

  // Satellite pass timeline
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);

  // Telemetry GIS Layer toggles
  const [activeLayers, setActiveLayers] = useState({
    lstHeat: true,
    ndviVegetation: true,
    driverAttribution: false,
    populationDensity: false,
    discomGrid: false,
  });

  // Tools state: 'select', 'lasso', 'point', 'polygon'
  const [interactionMode, setInteractionMode] = useState('select');
  
  // Drawing state
  const [isDrawingLasso, setIsDrawingLasso] = useState(false);
  const [lassoPath, setLassoPath] = useState([]);
  const [lassoPathLngLat, setLassoPathLngLat] = useState([]);
  const [drawnTrees, setDrawnTrees] = useState([]);
  const [drawnPolygons, setDrawnPolygons] = useState([]);
  const [currentPolygonPath, setCurrentPolygonPath] = useState([]);

  // Scenario Simulator parameters
  const [scenarioParams, setScenarioParams] = useState({
    treeCanopyIncreasePct: 15,
    coolRoofCoveragePct: 35,
    reflectivePavementAreaPct: 20,
    budgetInrLakhs: 250,
  });

  // Simulation states
  const [_isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  // Optimizer states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [dataFeedToast, setDataFeedToast] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
  const demoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

  // Fetch real city heatmap GeoJSON and NASA satellite telemetry from FastAPI backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cityName = currentCity.toLowerCase().replace(' ncr', '').replace(' ', '_');
      const [heatmapRes, telemetryRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/heatmap/${cityName}`),
        fetch(`${API_BASE_URL}/telemetry/live/${cityName}`)
      ]);

      if (heatmapRes.status === 'fulfilled' && heatmapRes.value.ok) {
        const data = await heatmapRes.value.json();
        setGeoData(data);
        setIsUsingMockData(false);

        let liveTelem = null;
        if (telemetryRes.status === 'fulfilled' && telemetryRes.value.ok) {
          try {
            liveTelem = await telemetryRes.value.json();
          } catch {
            // Telemetry optional
          }
        }

        setDataFeedToast({
          type: 'live',
          title: `${currentCity}: Live Satellite & AI Synced`,
          message: liveTelem
            ? `NASA & Satellite Skin Radiometry: ${liveTelem.live_surface_temp_c}°C surface, ${liveTelem.air_temp_2m_c}°C air | ${liveTelem.thermal_anomaly_c > 0 ? '+' : ''}${liveTelem.thermal_anomaly_c}°C anomaly.`
            : `Streaming real satellite telemetry & Physics-Informed ML inference for ${currentCity}.`,
        });
        setTimeout(() => setDataFeedToast(null), 5000);
      } else if (demoModeEnabled) {
        setGeoData(getMockPuneGeoJSON());
        setIsUsingMockData(true);
        setDataFeedToast({
          type: 'mock',
          title: 'Demo Mode: Backend API Offline',
          message: `Unable to reach ${API_BASE_URL}/heatmap/${cityName}. Rendering Pune municipal sample dataset.`,
        });
      } else {
        setGeoData(null);
        setIsUsingMockData(false);
        setDataFeedToast({ type: 'error', title: 'Live data unavailable', message: `The API could not load ${currentCity}.` });
      }
    } catch {
      if (demoModeEnabled) {
        setGeoData(getMockPuneGeoJSON());
        setIsUsingMockData(true);
        setDataFeedToast({
          type: 'mock',
          title: 'Demo Mode: Sample Data Active',
          message: `FastAPI server (${API_BASE_URL}) not responding. Switched to sample baseline dataset.`,
        });
      } else {
        setGeoData(null);
        setIsUsingMockData(false);
        setDataFeedToast({ type: 'error', title: 'Live data unavailable', message: 'The production API is unreachable. No sample data is shown.' });
      }
    } finally {
      setLoading(false);
    }
  }, [currentCity, API_BASE_URL, demoModeEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute precise zone deltas based on drawn tools
  const zoneDeltas = useMemo(() => {
    if (!geoData || selectedZones.size === 0) return {};
    const deltas = {};
    
    const treeFeatures = drawnTrees.length > 0 
      ? turf.featureCollection(drawnTrees.map(c => turf.point(c))) 
      : null;

    geoData.features.forEach(zone => {
      const id = zone.properties.zone_id;
      if (!selectedZones.has(id)) return;
      
      let z_ndvi = (scenarioParams.treeCanopyIncreasePct / 100);
      let z_ndbi = -(scenarioParams.coolRoofCoveragePct / 100) * 0.5 - (scenarioParams.reflectivePavementAreaPct / 100) * 0.5;
      
      if (treeFeatures) {
        try {
          const ptsWithin = turf.pointsWithinPolygon(treeFeatures, zone);
          z_ndvi += (ptsWithin.features.length * 0.03);
        } catch {}
      }
      
      if (drawnPolygons.length > 0) {
        let intersects = false;
        for (const poly of drawnPolygons) {
          try {
            if (turf.booleanIntersects(poly, zone)) {
              intersects = true;
              break;
            }
          } catch {}
        }
        if (intersects) {
          z_ndvi += 0.15;
          z_ndbi -= 0.15;
        }
      }
      
      deltas[id] = { delta_ndvi: z_ndvi, delta_ndbi: z_ndbi };
    });
    return deltas;
  }, [geoData, selectedZones, drawnTrees, drawnPolygons, scenarioParams]);

  // Run backend ML simulation whenever selection or sliders change
  useEffect(() => {
    if (selectedZones.size === 0) {
      setSimResults(null);
      return;
    }

    const runSimulation = async () => {
      setIsSimulating(true);
      try {
        const payload = {
          city: currentCity.toLowerCase().replace(' ncr', '').replace(' ', '_'),
          zone_ids: Array.from(selectedZones),
          delta_ndvi: scenarioParams.treeCanopyIncreasePct / 100,
          delta_ndbi: -((scenarioParams.coolRoofCoveragePct + scenarioParams.reflectivePavementAreaPct) / 200),
          zone_deltas: zoneDeltas
        };
        const response = await fetch(`${API_BASE_URL}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          const resultsMap = {};
          data.results.forEach(res => {
            resultsMap[res.zone_id] = res;
          });
          setSimResults(resultsMap);
        }
      } catch (error) {
        console.warn("Backend ML simulation query error:", error);
        // Local mock fallback when backend unreachable
        if (geoData && Array.isArray(geoData.features)) {
          const mockResults = {};
          Array.from(selectedZones).forEach(zoneId => {
            const feat = geoData.features.find(f => f.properties && f.properties.zone_id === zoneId);
            if (feat) {
              const baseLst = Number(feat.properties.lst) || 35;
              const delta = -(
                (scenarioParams.treeCanopyIncreasePct || 0) * 0.04 +
                (scenarioParams.coolRoofCoveragePct || 0) * 0.02 +
                (scenarioParams.reflectivePavementAreaPct || 0) * 0.01
              );
              mockResults[zoneId] = {
                zone_id: zoneId,
                original_lst: baseLst,
                new_lst: baseLst + delta,
                lst_change: delta,
                new_ndvi: Number(feat.properties.ndvi) || 0.22,
                new_ndbi: Number(feat.properties.ndbi) || 0.05
              };
            }
          });
          if (Object.keys(mockResults).length > 0) setSimResults(mockResults);
        }
      } finally {
        setIsSimulating(false);
      }
    };

    const timer = setTimeout(runSimulation, 400);
    return () => clearTimeout(timer);
  }, [selectedZones, scenarioParams, zoneDeltas, currentCity, API_BASE_URL, geoData]);

  // Process features for display with robust numeric validation
  const mapData = useMemo(() => {
    if (!geoData || !Array.isArray(geoData.features)) return null;
    const newFeatures = geoData.features
      .filter(feat => feat && feat.geometry && feat.geometry.coordinates)
      .map(feat => {
        const props = feat.properties || {};
        const id = props.zone_id || 'Z-unknown';
        const isSelected = selectedZones.has(id);
        
        const rawLst = Number(props.lst);
        const validLst = !isNaN(rawLst) && rawLst !== null ? rawLst : 35.0;
        
        let displayLST = validLst;
        if (simResults && simResults[id] && typeof simResults[id].new_lst === 'number' && !isNaN(simResults[id].new_lst)) {
          displayLST = simResults[id].new_lst;
        }

        const rawNdvi = Number(props.ndvi);
        const validNdvi = !isNaN(rawNdvi) && rawNdvi !== null ? rawNdvi : 0.22;

        const rawNdbi = Number(props.ndbi);
        const validNdbi = !isNaN(rawNdbi) && rawNdbi !== null ? rawNdbi : 0.05;

        return {
          ...feat,
          properties: {
            ...props,
            lst: validLst,
            ndvi: validNdvi,
            ndbi: validNdbi,
            display_lst: displayLST,
            is_selected: isSelected ? 1 : 0
          }
        };
      });
    return { type: "FeatureCollection", features: newFeatures };
  }, [geoData, simResults, selectedZones]);

  // Centroids for heat gradient layer with geometry safety checks
  const pointData = useMemo(() => {
    if (!mapData || !Array.isArray(mapData.features)) return null;
    const features = [];
    mapData.features.forEach(feat => {
      try {
        if (feat && feat.geometry && feat.geometry.coordinates && feat.geometry.coordinates.length > 0) {
          const center = turf.centroid(feat);
          if (center && center.geometry && Array.isArray(center.geometry.coordinates) && 
              typeof center.geometry.coordinates[0] === 'number' && !isNaN(center.geometry.coordinates[0]) &&
              typeof center.geometry.coordinates[1] === 'number' && !isNaN(center.geometry.coordinates[1])) {
            features.push({ ...feat, geometry: center.geometry });
          }
        }
      } catch {
        // Skip malformed geometry safely
      }
    });
    return { type: "FeatureCollection", features };
  }, [mapData]);

  // Drawn feature collections with coordinate validation
  const treesGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: drawnTrees
      .filter(c => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1]))
      .map(c => turf.point(c))
  }), [drawnTrees]);

  const polygonsGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: drawnPolygons
  }), [drawnPolygons]);

  // GeoJSON source for DISCOM grid stress layer (built from MOCK_WARDS)
  const discomGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: MOCK_WARDS
      .filter(w => w.center && Array.isArray(w.center) && w.center.length === 2)
      .map(w => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [w.center[1], w.center[0]] },
        properties: { gridLoadMw: w.gridLoadMw || 50, name: w.name || w.id }
      }))
  }), []);

  const activePolygonGeoJSON = useMemo(() => {
    if (currentPolygonPath.length < 2) return null;
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "LineString", coordinates: currentPolygonPath }
      }]
    };
  }, [currentPolygonPath]);

  const selectedBoundary = useMemo(() => {
    if (!geoData || selectedZones.size === 0) return null;
    const selectedFeatures = geoData.features.filter(f => selectedZones.has(f.properties.zone_id));
    if (selectedFeatures.length === 0) return null;
    try {
      return turf.dissolve(turf.featureCollection(selectedFeatures));
    } catch { return null; }
  }, [geoData, selectedZones]);

  // Export GeoJSON of drawn interventions
  const exportGeoJSON = () => {
    const features = [
      ...drawnTrees.map(c => turf.point(c, { type: 'tree' })),
      ...drawnPolygons.map(p => ({ ...p, properties: { type: 'green_area' } }))
    ];
    const fc = turf.featureCollection(features);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urban_heat_mitigation_plan.geojson';
    a.click();
  };

  // Optimizer trigger & complete
  const handleRunOptimizer = () => {
    setIsOptimizing(true);
  };

  const handleOptimizerComplete = () => {
    const selectedIds = Array.from(selectedZones);
    const result = runScenarioOptimizer(scenarioParams, selectedIds.length > 0 ? selectedIds : null);
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  // Map pointer handlers
  const handleMouseMove = useCallback(event => {
    if (interactionMode === 'lasso' && isDrawingLasso) {
      setLassoPath(prev => [...prev, event.point]);
      setLassoPathLngLat(prev => [...prev, [event.lngLat.lng, event.lngLat.lat]]);
    } else if (interactionMode === 'select') {
      const { features, lngLat } = event;
      const hoveredFeature = features && features[0];
      setHoverInfo(hoveredFeature ? { feature: hoveredFeature, x: event.point.x, y: event.point.y, lngLat } : null);
    } else {
      setHoverInfo(null);
    }
  }, [interactionMode, isDrawingLasso]);

  const onPointerDown = useCallback(event => {
    const lngLatArr = [event.lngLat.lng, event.lngLat.lat];

    if (interactionMode === 'select') {
      const { features } = event;
      if (features && features.length > 0) {
        const id = features[0].properties.zone_id;
        setSelectedZones(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
      }
    } else if (interactionMode === 'lasso') {
      setIsDrawingLasso(true);
      setLassoPath([event.point]);
      setLassoPathLngLat([lngLatArr]);
    } else if (interactionMode === 'point') {
      setDrawnTrees(prev => [...prev, lngLatArr]);
    } else if (interactionMode === 'polygon') {
      setCurrentPolygonPath(prev => [...prev, lngLatArr]);
    }
  }, [interactionMode]);

  const onPointerUp = useCallback(() => {
    if (interactionMode === 'lasso' && isDrawingLasso) {
      setIsDrawingLasso(false);
      if (lassoPathLngLat.length > 2 && pointData) {
        const coords = [...lassoPathLngLat, lassoPathLngLat[0]];
        try {
          const searchPoly = turf.polygon([coords]);
          const newSelection = new Set(selectedZones);
          pointData.features.forEach(feat => {
            if (turf.booleanPointInPolygon(feat.geometry, searchPoly)) {
              newSelection.add(feat.properties.zone_id);
            }
          });
          setSelectedZones(newSelection);
        } catch {}
      }
      setLassoPath([]);
      setLassoPathLngLat([]);
    }
  }, [interactionMode, isDrawingLasso, lassoPathLngLat, pointData, selectedZones]);

  const onDblClick = useCallback(event => {
    if (interactionMode === 'polygon' && currentPolygonPath.length >= 3) {
      event.preventDefault();
      try {
        const coords = [...currentPolygonPath, currentPolygonPath[0]];
        const poly = turf.polygon([coords]);
        setDrawnPolygons(prev => [...prev, poly]);
      } catch { console.error("Invalid polygon"); }
      setCurrentPolygonPath([]);
    }
  }, [interactionMode, currentPolygonPath]);

  const svgPath = useMemo(() => {
    if (lassoPath.length === 0) return '';
    return lassoPath.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }, [lassoPath]);

  const currentPass = MOCK_SATELLITE_PASSES[selectedPassIndex] || MOCK_SATELLITE_PASSES[0];
  const cityView = CITY_COORDINATES[currentCity.toLowerCase()] || CITY_COORDINATES['pune'];

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#EDF1F7] flex flex-col font-sans overflow-hidden">
      {/* Top Mission Control Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={setCurrentCity}
        wards={MOCK_WARDS}
        selectedWardId={selectedWardForModal ? (selectedWardForModal.id || selectedWardForModal.zone_id) : null}
        onSelectWard={(id) => {
          const w = MOCK_WARDS.find(item => item.id === id);
          if (w) setSelectedWardForModal(w);
        }}
        currentPass={currentPass}
        onToggleLeftRail={() => setIsLeftRailOpen(!isLeftRailOpen)}
        onToggleRightRail={() => setIsRightRailOpen(!isRightRailOpen)}
        isLeftRailOpen={isLeftRailOpen}
        isRightRailOpen={isRightRailOpen}
      />

      {/* Demo Mode / Sample Data Banner */}
      <DemoModeBanner isMock={isUsingMockData} city={currentCity} onRetry={fetchData} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail Collapsible Panel */}
        <LeftRail
          isOpen={isLeftRailOpen}
          onClose={() => setIsLeftRailOpen(false)}
          activeLayers={activeLayers}
          onToggleLayer={(key) => setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          scenarioParams={scenarioParams}
          onChangeScenario={setScenarioParams}
          onRunOptimizer={handleRunOptimizer}
          isOptimizing={isOptimizing}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          onClearAll={() => {
            setSelectedZones(new Set());
            setDrawnTrees([]);
            setDrawnPolygons([]);
            setCurrentPolygonPath([]);
          }}
          onExportGeoJSON={exportGeoJSON}
          hasDrawnElements={drawnTrees.length > 0 || drawnPolygons.length > 0}
          selectedZonesCount={selectedZones.size}
        />

        {/* Center Stage: Hero Map + Scrubber */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] h-[calc(100dvh-4rem)] relative overflow-hidden bg-ops-grid">
          
          {/* Data Feed Connection State Toast */}
          {dataFeedToast && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-lg shadow-panel-raised flex items-center space-x-3 text-xs font-mono backdrop-blur-md animate-in fade-in slide-in-from-top duration-300 border ${
              dataFeedToast.type === 'live' 
                ? 'bg-[#0F222B]/95 border-[#2FB8AC] text-[#EDF1F7]' 
                : 'bg-[#2B1D12]/95 border-[#F2A93B] text-[#EDF1F7]'
            }`}>
              {dataFeedToast.type === 'live' ? (
                <CheckCircle2 className="w-4 h-4 text-[#2FB8AC] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#F2A93B] flex-shrink-0" />
              )}
              <div>
                <div className="font-bold flex items-center space-x-1.5">
                  <span className={dataFeedToast.type === 'live' ? 'text-[#2FB8AC]' : 'text-[#F2A93B]'}>
                    {dataFeedToast.title}
                  </span>
                </div>
                <div className="text-[10px] text-[#8793A8]">
                  {dataFeedToast.message}
                </div>
              </div>
              <button
                onClick={() => setDataFeedToast(null)}
                className="text-[#8793A8] hover:text-[#EDF1F7] ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Optimization Finished Banner Toast */}
          {optimizationResult && !dataFeedToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#131B2E] border border-[#2FB8AC] text-[#EDF1F7] px-4 py-2.5 rounded-lg shadow-cyan-glow flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-top duration-300">
              <Sparkles className="w-4 h-4 text-[#2FB8AC] flex-shrink-0" />
              <div>
                <div className="font-semibold flex items-center space-x-1.5">
                  <span>Scenario Optimized {selectedZones.size > 0 ? `(${selectedZones.size} Selected Ward${selectedZones.size > 1 ? 's' : ''})` : '(City-Wide)'}:</span>
                  <span className="text-[#2FB8AC] font-bold">-{optimizationResult.projectedTempReductionDegC}°C cooling</span>
                </div>
                <div className="text-[10px] font-mono text-[#8793A8]">
                  Efficiency: {optimizationResult.projectedCoolingPerLakhInr}°C / ₹10L | Saved {optimizationResult.gridPowerSavedMw} MW grid draw | Shielded {optimizationResult.vulnerablePopProtected.toLocaleString()} citizens
                </div>
              </div>
              <button
                onClick={() => setOptimizationResult(null)}
                className="text-[#8793A8] hover:text-[#EDF1F7] ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Left Telemetry Badge with Live/Mock Indicator */}
          <div className="absolute top-4 left-4 z-20 bg-[#131B2E]/90 backdrop-blur-md border border-[#263349] rounded p-2.5 shadow-panel text-xs select-none">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-[#F2A93B]' : 'bg-[#2FB8AC]'} animate-ping`} />
                <span className="font-mono font-bold text-[#EDF1F7] text-xs">THERMAL FIELD (LST ANOMALY)</span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                isUsingMockData
                  ? 'bg-[#F2A93B]/20 text-[#F2A93B] border-[#F2A93B]/50'
                  : 'bg-[#2FB8AC]/20 text-[#2FB8AC] border-[#2FB8AC]/50'
              }`}>
                {isUsingMockData ? '● DEMO DATA' : '● LIVE ML API'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#8793A8] mt-1">
              CITY: <span className="text-[#2FB8AC] font-semibold">{currentCity}</span> | ACTIVE PASS: <span className="text-[#2FB8AC]">{currentPass.satellite}</span> ({currentPass.resolutionMeters}m)
            </div>
          </div>

          {/* Top Right Map Style Switcher */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
            <div className="bg-[#131B2E]/90 backdrop-blur-md border border-[#263349] rounded p-1 flex items-center space-x-1 shadow-panel text-xs font-mono">
              <button
                onClick={() => setMapStyleType('dark')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mapStyleType === 'dark' ? 'bg-[#1B2740] text-[#2FB8AC] font-semibold border border-[#2FB8AC]/40' : 'text-[#8793A8] hover:text-[#EDF1F7]'
                }`}
              >
                Mission Dark
              </button>
              <button
                onClick={() => setMapStyleType('satellite')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mapStyleType === 'satellite' ? 'bg-[#1B2740] text-[#2FB8AC] font-semibold border border-[#2FB8AC]/40' : 'text-[#8793A8] hover:text-[#EDF1F7]'
                }`}
              >
                🛰️ Satellite
              </button>
            </div>
          </div>

          {/* Lasso SVG overlay */}
          {isDrawingLasso && (
            <svg style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100}}>
              <path d={svgPath} fill="rgba(47, 184, 172, 0.2)" stroke="#2FB8AC" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          )}

          {/* Map Stage Container */}
          <div className="flex-1 w-full h-full relative" style={{cursor: interactionMode === 'select' ? (hoverInfo ? 'pointer' : 'grab') : 'crosshair'}}>
            <Map
              key={currentCity}
              initialViewState={cityView}
              mapStyle={MAP_STYLES[mapStyleType]}
              interactiveLayerIds={['zones-fill-interactive']}
              onMouseMove={handleMouseMove}
              onMouseDown={onPointerDown}
              onMouseUp={onPointerUp}
              onDblClick={onDblClick}
              dragPan={interactionMode === 'select'}
              doubleClickZoom={interactionMode === 'select'}
            >
              {/* Drawn Green Areas (Polygons) */}
              <Source id="drawn-polygons" type="geojson" data={polygonsGeoJSON}>
                <Layer id="drawn-polygons-fill" type="fill" paint={{'fill-color': '#2FB8AC', 'fill-opacity': 0.45}} />
                <Layer id="drawn-polygons-line" type="line" paint={{'line-color': '#2FB8AC', 'line-width': 2}} />
              </Source>

              {/* Active Drawing Polygon Line */}
              {activePolygonGeoJSON && (
                <Source id="active-polygon" type="geojson" data={activePolygonGeoJSON}>
                  <Layer id="active-polygon-line" type="line" paint={{'line-color': '#2FB8AC', 'line-width': 2, 'line-dasharray': [2, 2]}} />
                </Source>
              )}

              {/* Drawn Trees (Points) */}
              <Source id="drawn-trees" type="geojson" data={treesGeoJSON}>
                <Layer id="drawn-trees-circle" type="circle" paint={{'circle-color': '#2FB8AC', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff'}} />
              </Source>

              {/* Selected Zone Boundaries */}
              {selectedBoundary && (
                <Source id="selected-boundary" type="geojson" data={selectedBoundary}>
                  <Layer id="selected-boundary-line" type="line" paint={{'line-color': '#ffffff', 'line-width': 3, 'line-opacity': 0.9}} />
                </Source>
              )}

              {/* Microclimate Zone Polygons (Clickable & GIS Heat Colored) */}
              {mapData && (
                <Source id="zones-poly" type="geojson" data={mapData}>
                  <Layer 
                    id="zones-fill-interactive" 
                    type="fill" 
                    paint={{ 
                      'fill-color': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        '#00FFF0',
                        activeLayers.lstHeat
                          ? [
                              'interpolate',
                              ['linear'],
                              ['coalesce', ['get', 'display_lst'], 35.0],
                              33.0, '#34D399',  // light emerald pastel
                              34.2, '#A3E635',  // soft lime pastel
                              35.5, '#FDE047',  // soft yellow pastel
                              36.6, '#FB923C',  // soft orange pastel
                              37.8, '#F87171'   // soft coral pastel
                            ]
                          : activeLayers.ndviVegetation
                            ? [
                                'interpolate',
                                ['linear'],
                                ['coalesce', ['get', 'ndvi'], 0.22],
                                0.08, '#D97706',
                                0.16, '#FBBF24',
                                0.26, '#A3E635',
                                0.38, '#34D399'
                              ]
                            : '#1B2740'
                      ],
                      'fill-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        0.32,
                        activeLayers.lstHeat || activeLayers.ndviVegetation ? 0.16 : 0.05
                      ]
                    }} 
                  />
                  <Layer
                    id="zones-outline"
                    type="line"
                    paint={{
                      'line-color': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        '#00FFF0',
                        activeLayers.lstHeat
                          ? [
                              'interpolate',
                              ['linear'],
                              ['coalesce', ['get', 'display_lst'], 35.0],
                              33.0, '#34D399',
                              34.2, '#A3E635',
                              35.5, '#FDE047',
                              36.6, '#FB923C',
                              37.8, '#F87171'
                            ]
                          : '#263349'
                      ],
                      'line-width': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        2.5,
                        1.0
                      ],
                      'line-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        0.9,
                        0.65
                      ]
                    }}
                  />
                </Source>
              )}

              {/* Driver Attribution Layer — anomaly intensity circles */}
              {pointData && activeLayers.driverAttribution && (
                <Source id="driver-attr" type="geojson" data={pointData}>
                  <Layer
                    id="driver-circles"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'anomaly'], 2], 0, 8, 6, 24],
                      'circle-color': ['interpolate', ['linear'], ['coalesce', ['get', 'anomaly'], 2], 0, '#2FB8AC', 3, '#F2A93B', 5, '#C81E3A'],
                      'circle-opacity': 0.75,
                      'circle-stroke-width': 1.5,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )}

              {/* Population Density Layer — vulnerable pop circles */}
              {pointData && activeLayers.populationDensity && (
                <Source id="pop-density" type="geojson" data={pointData}>
                  <Layer
                    id="pop-circles"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'vulnerable_pop_pct'], 30], 0, 10, 60, 30],
                      'circle-color': '#a855f7',
                      'circle-opacity': 0.65,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#d8b4fe'
                    }}
                  />
                </Source>
              )}

              {/* DISCOM Grid Stress Layer — grid load circles */}
              {activeLayers.discomGrid && (
                <Source id="discom-grid" type="geojson" data={discomGeoJSON}>
                  <Layer
                    id="discom-circles"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['get', 'gridLoadMw'], 30, 10, 110, 28],
                      'circle-color': ['interpolate', ['linear'], ['get', 'gridLoadMw'], 50, '#F2A93B', 90, '#E8632B', 110, '#C81E3A'],
                      'circle-opacity': 0.7,
                      'circle-stroke-width': 1.5,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )}

              {/* Hover Tooltip */}
              {hoverInfo && hoverInfo.lngLat && 
               typeof hoverInfo.lngLat.lng === 'number' && !isNaN(hoverInfo.lngLat.lng) &&
               typeof hoverInfo.lngLat.lat === 'number' && !isNaN(hoverInfo.lngLat.lat) &&
               hoverInfo.feature && hoverInfo.feature.properties && interactionMode === 'select' && (
                <Popup longitude={hoverInfo.lngLat.lng} latitude={hoverInfo.lngLat.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={15}>
                  <div className="min-w-[190px] font-sans text-xs">
                    <div className="flex items-center justify-between border-b border-[#263349] pb-1 mb-2">
                      <span className="font-bold text-[#EDF1F7]">
                        Zone {hoverInfo.feature.properties.zone_id || 'N/A'}
                      </span>
                      <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded">
                        LST Telemetry
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">Surface Temp:</span>
                        <span className="font-bold text-[#E8632B]">
                          {Number(hoverInfo.feature.properties.display_lst ?? 35.0).toFixed(1)}°C
                        </span>
                      </div>

                      {simResults && hoverInfo.feature.properties.zone_id && simResults[hoverInfo.feature.properties.zone_id] && (
                        <div className="flex justify-between">
                          <span className="text-[#8793A8]">Simulation Δ:</span>
                          <span className="font-bold text-[#2FB8AC]">
                            {((hoverInfo.feature.properties.display_lst ?? 35.0) - (hoverInfo.feature.properties.lst ?? 35.0)).toFixed(2)}°C
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">NDVI Canopy:</span>
                        <span className="text-[#2FB8AC]">{Number(hoverInfo.feature.properties.ndvi ?? 0.22).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">NDBI Built-up:</span>
                        <span className="text-[#EDF1F7]">{Number(hoverInfo.feature.properties.ndbi ?? 0.05).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-[#263349]/60 text-[9px] font-mono text-[#2FB8AC] text-right cursor-pointer"
                      onClick={() => setSelectedWardForModal(hoverInfo.feature.properties)}
                    >
                      Click to open physics drill-down →
                    </div>
                  </div>
                </Popup>
              )}
            </Map>

            {/* LST Thermal Heat Legend & Compass Badge */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2 bg-[#131B2E]/95 backdrop-blur-md border border-[#263349] px-3 py-1.5 rounded shadow-panel text-[10px] font-mono text-[#8793A8]">
                <Compass className="w-4 h-4 text-[#2FB8AC]" />
                <span>JURISDICTION: {currentCity.toUpperCase()} MUNICIPAL GRID</span>
              </div>

              {activeLayers.lstHeat && (
                <div className="bg-[#131B2E]/95 backdrop-blur-md border border-[#263349] px-3 py-1.5 rounded shadow-panel text-[10px] font-mono text-[#EDF1F7] flex items-center space-x-2.5">
                  <span className="text-[#8793A8] uppercase tracking-wider font-semibold">LST Heat Scale:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#34D399] inline-block"></span><span className="text-[#8793A8]">&lt;33°C (Cool)</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] inline-block"></span><span className="text-[#8793A8]">34°C (Lime)</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FDE047] inline-block"></span><span className="text-[#8793A8]">35.5°C</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FB923C] inline-block"></span><span className="text-[#8793A8]">36.5°C</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F87171] inline-block"></span><span className="text-[#F87171] font-bold">&gt;37.8°C (Critical)</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Docked Satellite Pass Scrubber */}
          <TimelineScrubber
            passes={MOCK_SATELLITE_PASSES}
            selectedPassIndex={selectedPassIndex}
            onSelectPassIndex={setSelectedPassIndex}
          />
        </main>

        {/* Right Rail Panel */}
        <RightRail
          alerts={MOCK_ALERTS}
          onSelectWard={(id) => {
            const w = MOCK_WARDS.find(item => item.id === id);
            if (w) setSelectedWardForModal(w);
          }}
          cityResilienceScore={Math.round(70 - (MOCK_WARDS.reduce((acc, w) => acc + (w.lstAnomaly || 0), 0) / Math.max(1, MOCK_WARDS.length)) * 3)}
          currentCity={currentCity}
          wards={MOCK_WARDS}
          scenarioParams={scenarioParams}
          isOpen={isRightRailOpen}
          onClose={() => setIsRightRailOpen(false)}
        />
      </div>

      {/* Ward Drill-Down Modal */}
      {selectedWardForModal && (
        <WardDetailModal
          ward={selectedWardForModal}
          onClose={() => setSelectedWardForModal(null)}
        />
      )}

      {/* Scanner Overlay during Optimizer simulation */}
      <OptimizingOverlay
        isOptimizing={isOptimizing}
        wards={selectedZones.size > 0 ? MOCK_WARDS.filter(w => selectedZones.has(w.id)) : MOCK_WARDS}
        onComplete={handleOptimizerComplete}
      />
    </div>
  );
}

export default MapView;
