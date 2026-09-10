import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sparkles, X, Compass, Layers } from 'lucide-react';
import * as turf from '@turf/turf';
import '../index.css';

import { Header } from '../components/Header';
import { LeftRail } from '../components/LeftRail';
import { RightRail } from '../components/RightRail';
import { TimelineScrubber } from '../components/TimelineScrubber';
import { WardDetailModal } from '../components/WardDetailModal';
import { OptimizingOverlay } from '../components/OptimizingOverlay';
import { 
  MOCK_WARDS, 
  MOCK_SATELLITE_PASSES, 
  MOCK_ALERTS, 
  runScenarioOptimizer 
} from '../services/mockApi';

const MAP_STYLES = {
  dark: {
    version: 8,
    sources: {
      cartoDark: {
        type: "raster",
        tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "carto-dark-layer",
        type: "raster",
        source: "cartoDark",
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  satellite: {
    version: 8,
    sources: {
      esri: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256
      },
      labels: {
        type: "raster",
        tiles: ["https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"],
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
        id: "carto-labels",
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

  // Fetch real Pune heatmap GeoJSON from FastAPI backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/heatmap/pune');
        if (response.ok) {
          const data = await response.json();
          setGeoData(data);
        } else {
          console.warn("Backend heatmap response not ok, falling back to mock");
        }
      } catch (error) {
        console.warn("FastAPI backend heatmap not reachable, using offline dataset:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      } finally {
        setIsSimulating(false);
      }
    };

    const timer = setTimeout(runSimulation, 400);
    return () => clearTimeout(timer);
  }, [selectedZones, scenarioParams, zoneDeltas]);

  // Process features for display
  const mapData = useMemo(() => {
    if (!geoData) return null;
    const newFeatures = geoData.features.map(feat => {
      const id = feat.properties.zone_id;
      const isSelected = selectedZones.has(id);
      let displayLST = feat.properties.lst;

      if (simResults && simResults[id]) {
        displayLST = simResults[id].new_lst;
      }

      return {
        ...feat,
        properties: {
          ...feat.properties,
          display_lst: displayLST,
          is_selected: isSelected ? 1 : 0
        }
      };
    });
    return { type: "FeatureCollection", features: newFeatures };
  }, [geoData, simResults, selectedZones]);

  // Centroids for heat gradient layer
  const pointData = useMemo(() => {
    if (!mapData) return null;
    const features = mapData.features.map(feat => {
      const center = turf.centroid(feat);
      return { ...feat, geometry: center.geometry };
    });
    return { type: "FeatureCollection", features };
  }, [mapData]);

  // Drawn feature collections
  const treesGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: drawnTrees.map(c => turf.point(c))
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
          
          {/* Optimization Finished Banner Toast */}
          {optimizationResult && (
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

          {/* Top Left Telemetry Badge */}
          <div className="absolute top-4 left-4 z-20 bg-[#131B2E]/90 backdrop-blur-md border border-[#263349] rounded p-2.5 shadow-panel text-xs select-none">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2FB8AC] animate-ping" />
              <span className="font-mono font-bold text-[#EDF1F7] text-xs">THERMAL FIELD (LST ANOMALY)</span>
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
              {/* Thermal Heatmap Gradient */}
              {pointData && activeLayers.lstHeat && (
                <Source id="zones-points" type="geojson" data={pointData}>
                  <Layer 
                    id="zones-heatmap" 
                    type="heatmap"
                    paint={{
                      'heatmap-weight': ['interpolate', ['linear'], ['get', 'display_lst'], 30, 0.1, 55, 1],
                      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 1, 15, 3],
                      'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0,0,0,0)',
                        0.2, '#2FB8AC',
                        0.4, '#32cd32',
                        0.6, '#F2A93B',
                        0.8, '#E8632B',
                        1, '#C81E3A'
                      ],
                      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 15, 15, 60],
                      'heatmap-opacity': 0.75
                    }}
                  />
                </Source>
              )}

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

              {/* Microclimate Zone Polygons (Clickable) */}
              {mapData && (
                <Source id="zones-poly" type="geojson" data={mapData}>
                  <Layer 
                    id="zones-fill-interactive" 
                    type="fill" 
                    paint={{ 
                      'fill-color': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        '#2FB8AC',
                        '#000000'
                      ],
                      'fill-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        0.25,
                        0.02
                      ]
                    }} 
                  />
                  <Layer
                    id="zones-outline"
                    type="line"
                    paint={{
                      'line-color': '#263349',
                      'line-width': 0.8,
                      'line-opacity': 0.6
                    }}
                  />
                </Source>
              )}

              {/* Hover Tooltip */}
              {hoverInfo && interactionMode === 'select' && (
                <Popup longitude={hoverInfo.lngLat.lng} latitude={hoverInfo.lngLat.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={15}>
                  <div className="min-w-[190px] font-sans text-xs">
                    <div className="flex items-center justify-between border-b border-[#263349] pb-1 mb-2">
                      <span className="font-bold text-[#EDF1F7]">
                        Zone {hoverInfo.feature.properties.zone_id}
                      </span>
                      <span className="text-[10px] font-mono text-[#2FB8AC] bg-[#2FB8AC]/10 px-1.5 py-0.5 rounded">
                        LST Telemetry
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">Surface Temp:</span>
                        <span className="font-bold text-[#E8632B]">{Number(hoverInfo.feature.properties.display_lst).toFixed(1)}°C</span>
                      </div>

                      {simResults && simResults[hoverInfo.feature.properties.zone_id] && (
                        <div className="flex justify-between">
                          <span className="text-[#8793A8]">Simulation Δ:</span>
                          <span className="font-bold text-[#2FB8AC]">
                            {(hoverInfo.feature.properties.display_lst - hoverInfo.feature.properties.lst).toFixed(2)}°C
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">NDVI Canopy:</span>
                        <span className="text-[#2FB8AC]">{Number(hoverInfo.feature.properties.ndvi).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#8793A8]">NDBI Built-up:</span>
                        <span className="text-[#EDF1F7]">{Number(hoverInfo.feature.properties.ndbi).toFixed(2)}</span>
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
