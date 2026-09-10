import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sparkles, X, Compass, Layers, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
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

const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite: {
    version: 8,
    sources: {
      esri: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256,
        attribution: "Esri, Maxar, Earthstar Geographics"
      },
      labels: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "esri-satellite",
        type: "raster",
        source: "esri",
        minzoom: 0,
        maxzoom: 22
      },
      {
        id: "esri-labels",
        type: "raster",
        source: "labels",
        minzoom: 0,
        maxzoom: 22
      }
    ]
  }
};

const CITY_COORDINATES = {
  'pune': { longitude: 73.8567, latitude: 18.5204, zoom: 11.5 },
  'bengaluru': { longitude: 77.5946, latitude: 12.9716, zoom: 11.5 },
  'ahmedabad': { longitude: 72.5714, latitude: 23.0225, zoom: 11.5 },
  'delhi ncr': { longitude: 77.2090, latitude: 28.6139, zoom: 11.0 },
  'mumbai': { longitude: 72.8777, latitude: 19.0760, zoom: 11.0 },
  'hyderabad': { longitude: 78.4867, latitude: 17.3850, zoom: 11.5 }
};

export function MapView() {
  const [currentCity, setCurrentCity] = useState('Pune');
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [selectedWardForModal, setSelectedWardForModal] = useState(null);

  // Map tile style ('dark' | 'satellite')
  const [mapStyleType, setMapStyleType] = useState('dark');

  // Left rail collapse
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);

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
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  // Optimizer states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [dataFeedToast, setDataFeedToast] = useState(null);

  // Fetch real Pune heatmap GeoJSON from FastAPI backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cityName = currentCity.toLowerCase();
      const response = await fetch(`http://localhost:8000/heatmap/${cityName}`);
      if (response.ok) {
        const data = await response.json();
        setGeoData(data);
        setIsUsingMockData(false);
        setDataFeedToast({
          type: 'live',
          title: 'Live Backend Connected',
          message: `Streaming real satellite telemetry & Physics-Informed ML inference for ${currentCity}.`,
        });
        setTimeout(() => setDataFeedToast(null), 4000);
      } else {
        console.warn("Backend heatmap response not ok, falling back to mock dataset");
        setGeoData(getMockPuneGeoJSON());
        setIsUsingMockData(true);
        setDataFeedToast({
          type: 'mock',
          title: 'Demo Mode: Backend API Offline',
          message: `Unable to reach http://localhost:8000/heatmap/${cityName}. Rendering Pune municipal sample dataset.`,
        });
      }
    } catch (error) {
      console.warn("FastAPI backend heatmap not reachable, using offline sample dataset:", error);
      setGeoData(getMockPuneGeoJSON());
      setIsUsingMockData(true);
      setDataFeedToast({
        type: 'mock',
        title: 'Demo Mode: Sample Data Active',
        message: `FastAPI server (localhost:8000) not responding. Switched to Pune sample baseline dataset.`,
      });
    } finally {
      setLoading(false);
    }
  }, [currentCity]);

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
        } catch(e){}
      }
      
      if (drawnPolygons.length > 0) {
        let intersects = false;
        for (const poly of drawnPolygons) {
          try {
            if (turf.booleanIntersects(poly, zone)) {
              intersects = true;
              break;
            }
          } catch(e){}
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
          city: "pune",
          zone_ids: Array.from(selectedZones),
          delta_ndvi: scenarioParams.treeCanopyIncreasePct / 100,
          delta_ndbi: -((scenarioParams.coolRoofCoveragePct + scenarioParams.reflectivePavementAreaPct) / 200),
          zone_deltas: zoneDeltas
        };
        const response = await fetch('http://localhost:8000/simulate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': 'urban-heat-dev-key-2026'
          },
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
      } finally {
        setIsSimulating(false);
      }
    };

    const timer = setTimeout(runSimulation, 400);
    return () => clearTimeout(timer);
  }, [selectedZones, scenarioParams, zoneDeltas]);

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
      } catch (e) {
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
    } catch (e) { return null; }
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
    const result = runScenarioOptimizer(scenarioParams);
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

  const onPointerUp = useCallback(event => {
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
        } catch (err) {}
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
      } catch (err) { console.error("Invalid polygon"); }
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
      />

      {/* Demo Mode / Sample Data Banner */}
      <DemoModeBanner isMock={isUsingMockData} city={currentCity} onRetry={fetchData} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail Collapsible Panel */}
        <LeftRail
          isOpen={isLeftRailOpen}
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
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-ops-grid">
          
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
                  <span>Scenario Optimized:</span>
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
                True Satellite
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
                              32, '#2FB8AC',
                              36, '#7CB342',
                              40, '#FDD835',
                              44, '#FB8C00',
                              48, '#E53935'
                            ]
                          : activeLayers.ndviVegetation
                            ? [
                                'interpolate',
                                ['linear'],
                                ['coalesce', ['get', 'ndvi'], 0.22],
                                0.05, '#3E2723',
                                0.15, '#8D6E63',
                                0.30, '#8BC34A',
                                0.50, '#2E7D32'
                              ]
                            : '#1B2740'
                      ],
                      'fill-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        0.75,
                        activeLayers.lstHeat || activeLayers.ndviVegetation ? 0.55 : 0.15
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
                        '#FFFFFF',
                        '#263349'
                      ],
                      'line-width': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        2.0,
                        0.5
                      ],
                      'line-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        1.0,
                        0.4
                      ]
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

            {/* Compass badge */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex items-center space-x-2 bg-[#131B2E]/90 border border-[#263349] px-3 py-1.5 rounded text-[10px] font-mono text-[#8793A8]">
              <Compass className="w-4 h-4 text-[#2FB8AC]" />
              <span>JURISDICTION: {currentCity.toUpperCase()} MUNICIPAL GRID</span>
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
          cityResilienceScore={currentCity.toLowerCase() === 'pune' ? 64 : 58}
          currentCity={currentCity}
          wards={MOCK_WARDS}
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
        wards={MOCK_WARDS}
        onComplete={handleOptimizerComplete}
      />
    </div>
  );
}

export default MapView;
