import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import '../index.css';

import { Header } from '../components/Header';
import { LeftRail } from '../components/LeftRail';
import { RightRail } from '../components/RightRail';
import { TimelineScrubber } from '../components/TimelineScrubber';
import { WardDetailModal } from '../components/WardDetailModal';
import { OptimizingOverlay } from '../components/OptimizingOverlay';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { LoginModal, INSTITUTIONAL_PERSONAS } from '../components/LoginModal';
import { generateCityHAPPDF } from '../utils/pdfReportGenerator';
import { 
  MOCK_WARDS, 
  MOCK_SATELLITE_PASSES, 
  MOCK_ALERTS, 
  runScenarioOptimizer,
  getMockPuneGeoJSON
} from '../services/mockApi';

// Satellite style: Esri World Imagery + OpenStreetMap road and place labels overlay (Google Maps hybrid style)
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
      attribution: "© Esri, Maxar, Earthstar Geographics, and GIS Community"
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
        "raster-contrast": 0.05
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
  satellite: SATELLITE_STYLE,
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
  const mapRef = useRef(null);
  const [currentCity, setCurrentCity] = useState('Pune');
  const [geoData, setGeoData] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [selectedWardForModal, setSelectedWardForModal] = useState(null);

  // Map tile style ('satellite' default Google Maps hybrid, toggleable to 'light')
  const [mapStyleType, setMapStyleType] = useState('satellite');

  // Dynamic coordinates tracking on map center
  const [mapCenterCoords, setMapCenterCoords] = useState(() => ({
    lng: CITY_COORDINATES['pune'].longitude,
    lat: CITY_COORDINATES['pune'].latitude
  }));

  // Rails state
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  const [isRightRailOpen, setIsRightRailOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1280 : true));
  const [isZenMode, setIsZenMode] = useState(false);

  // Bottom left callout card expanded state
  const [isWardCardExpanded, setIsWardCardExpanded] = useState(true);

  // HUD spatial search query
  const [spatialQuery, setSpatialQuery] = useState('');

  // Institutional Multi-Role Authentication Persona & Modal
  const [currentPersona, setCurrentPersona] = useState(INSTITUTIONAL_PERSONAS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // Tools state: 'navigate' (default pan/explore), 'select' (ward multi-select), 'lasso', 'point', 'polygon', 'measure'
  const [interactionMode, setInteractionMode] = useState('navigate');
  
  // Linear measure tool & compass states
  const [measurePoints, setMeasurePoints] = useState([]);
  const [mapBearing, setMapBearing] = useState(0);

  // Live NASA & Open-Meteo satellite thermal telemetry for active city
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [mapPitch, setMapPitch] = useState(0);
  const [mapZoom, setMapZoom] = useState(11.5);
  const [inspectedWard, setInspectedWard] = useState(null);

  // Live dynamic metric distance scale calculation for map canvas
  const mapScaleInfo = useMemo(() => {
    const lat = mapCenterCoords.lat || 18.55;
    const zoom = mapZoom || 11.5;
    const metersPerPx = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
    
    const niceScales = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
    let chosenMeters = niceScales[0];
    for (const s of niceScales) {
      if (80 * metersPerPx >= s * 0.65) {
        chosenMeters = s;
      }
    }
    
    const barWidthPx = Math.max(35, Math.min(130, Math.round(chosenMeters / metersPerPx)));
    const label = chosenMeters >= 1000 ? `${chosenMeters / 1000} km` : `${chosenMeters} m`;
    
    return { barWidthPx, label };
  }, [mapCenterCoords.lat, mapZoom]);

  // Drawing state
  const [isDrawingLasso, setIsDrawingLasso] = useState(false);
  const [lassoPath, setLassoPath] = useState([]);
  const [lassoPathLngLat, setLassoPathLngLat] = useState([]);
  const [drawnTrees, setDrawnTrees] = useState([]);
  const [drawnPolygons, setDrawnPolygons] = useState([]);
  const [currentPolygonPath, setCurrentPolygonPath] = useState([]);

  // Intervention Scenario Parameters
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

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'http://localhost:8000')).replace(/\/$/, '');
  const demoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';

  // Dynamic city wards derived from live GeoJSON features
  const cityWards = useMemo(() => {
    if (geoData && Array.isArray(geoData.features) && geoData.features.length > 0) {
      return geoData.features.map(f => {
        const p = f.properties || {};
        const id = p.zone_id || 'Z-00';
        let center = null;
        try {
          if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0) {
            center = turf.centroid(f).geometry.coordinates; // [lng, lat]
          }
        } catch {}
        return {
          id,
          zone_id: id,
          name: p.name || `Zone ${id}`,
          zone: p.zone || `${currentCity} Municipal Grid`,
          currentLst: Number(p.display_lst ?? p.lst ?? 35.0),
          lst: Number(p.lst ?? 35.0),
          display_lst: Number(p.display_lst ?? p.lst ?? 35.0),
          lstAnomaly: Number(p.anomaly ?? (p.lst ? (p.lst - 33.0).toFixed(1) : 2.4)),
          anomaly: Number(p.anomaly ?? (p.lst ? (p.lst - 33.0).toFixed(1) : 2.4)),
          ndviIndex: Number(p.ndvi ?? 0.22),
          ndvi: Number(p.ndvi ?? 0.22),
          ndbi: Number(p.ndbi ?? 0.05),
          population: p.population || 95000,
          vulnerablePopPct: p.vulnerable_pop_pct || 35,
          gridLoadMw: p.grid_load_mw || Math.round(40 + (Number(p.lst || 35) - 30) * 12),
          center
        };
      });
    }
    return MOCK_WARDS;
  }, [geoData, currentCity]);

  // Dynamic City Resilience Score derived from live wards
  const cityResilienceScore = useMemo(() => {
    if (!cityWards || cityWards.length === 0) return 65;
    const avgAnomaly = cityWards.reduce((acc, w) => acc + (w.lstAnomaly || 0), 0) / cityWards.length;
    return Math.max(30, Math.min(95, Math.round(72 - avgAnomaly * 3.5)));
  }, [cityWards]);

  // Fly map to selected ward coordinates
  const handleSelectWardAndFly = useCallback((id) => {
    const w = cityWards.find(item => item.id === id || item.zone_id === id);
    if (w) {
      setSelectedZones(new Set([w.id]));
      if (w.center && Array.isArray(w.center) && mapRef.current) {
        const lng = w.center[0] > 60 ? w.center[0] : w.center[1];
        const lat = w.center[0] > 60 ? w.center[1] : w.center[0];
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 12.8,
          duration: 1200
        });
      }
    }
  }, [cityWards]);

  // Spatial search query handler
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && spatialQuery.trim()) {
      const q = spatialQuery.toLowerCase().trim();
      const found = cityWards.find(w => 
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.id && String(w.id).toLowerCase().includes(q)) ||
        (w.zone && String(w.zone).toLowerCase().includes(q))
      );
      if (found) {
        handleSelectWardAndFly(found.id);
      }
    }
  };

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
            setLiveTelemetry(liveTelem);
          } catch {
            // Telemetry optional
          }
        }

        setDataFeedToast({
          type: 'live',
          title: `${currentCity}: NASA Satellite & ML Synced`,
          message: liveTelem
            ? `Radiometry Skin Surface: ${liveTelem.live_surface_temp_c}°C, Air 2m: ${liveTelem.air_temp_2m_c}°C | Anomaly: ${liveTelem.thermal_anomaly_c > 0 ? '+' : ''}${liveTelem.thermal_anomaly_c}°C`
            : `Streaming real satellite telemetry & Physics-Informed ML inference for ${currentCity}.`,
        });
        setTimeout(() => setDataFeedToast(null), 5000);
      } else if (demoModeEnabled) {
        setGeoData(getMockPuneGeoJSON());
        setIsUsingMockData(true);
        setDataFeedToast({
          type: 'mock',
          title: 'Demo Mode: Backend API Offline',
          message: `Unable to reach ${API_BASE_URL}/heatmap/${cityName}. Rendering Pune sample dataset.`,
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
        setDataFeedToast({ type: 'error', title: 'Live data unavailable', message: 'The production API is unreachable.' });
      }
    } finally {
      setLoading(false);
    }
  }, [currentCity, API_BASE_URL, demoModeEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync city center coords and reset ward selection on city switch
  useEffect(() => {
    setSelectedZones(new Set());
    setSelectedWardForModal(null);
    setSimResults(null);
    setDrawnTrees([]);
    setDrawnPolygons([]);
    setCurrentPolygonPath([]);
    const key = currentCity.toLowerCase();
    const coords = CITY_COORDINATES[key] || CITY_COORDINATES['pune'];
    setMapCenterCoords({ lng: coords.longitude, lat: coords.latitude });
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: coords.zoom,
        duration: 1200
      });
    }
  }, [currentCity]);

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
        // Local fallback
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

  // Process features for display
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

  // Centroids for circles
  const pointData = useMemo(() => {
    if (!mapData || !Array.isArray(mapData.features)) return null;
    const features = [];
    mapData.features.forEach(feat => {
      try {
        if (feat && feat.geometry && feat.geometry.coordinates && feat.geometry.coordinates.length > 0) {
          const center = turf.centroid(feat);
          if (center && center.geometry && Array.isArray(center.geometry.coordinates)) {
            features.push({ ...feat, geometry: center.geometry });
          }
        }
      } catch {}
    });
    return { type: "FeatureCollection", features };
  }, [mapData]);

  // Linear measure tool GeoJSON and distance calculation
  const measureGeoJSON = useMemo(() => {
    if (measurePoints.length < 2) return null;
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "LineString", coordinates: measurePoints },
        properties: {}
      }]
    };
  }, [measurePoints]);

  const measurePointsGeoJSON = useMemo(() => {
    if (measurePoints.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: measurePoints.map((pt, idx) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: pt },
        properties: { label: `P${idx + 1}` }
      }))
    };
  }, [measurePoints]);

  const measuredDistance = useMemo(() => {
    if (measurePoints.length < 2) return null;
    try {
      const p1 = turf.point(measurePoints[0]);
      const p2 = turf.point(measurePoints[1]);
      return Number(turf.distance(p1, p2, { units: 'kilometers' }).toFixed(2));
    } catch {
      return null;
    }
  }, [measurePoints]);

  // Drawn feature collections
  const treesGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: drawnTrees.map(c => turf.point(c))
  }), [drawnTrees]);

  const polygonsGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: drawnPolygons
  }), [drawnPolygons]);

  const discomGeoJSON = useMemo(() => {
    const wardsToUse = cityWards.length > 0 ? cityWards : MOCK_WARDS;
    return {
      type: "FeatureCollection",
      features: wardsToUse
        .filter(w => w.center && Array.isArray(w.center) && w.center.length >= 2)
        .map(w => {
          const lng = w.center[0] > 60 ? w.center[0] : w.center[1];
          const lat = w.center[0] > 60 ? w.center[1] : w.center[0];
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: { gridLoadMw: w.gridLoadMw || 50, name: w.name || w.id }
          };
        })
    };
  }, [cityWards]);

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

  // First selected ward, inspected ward, or hovered ward for bottom-left callout card
  const selectedWardInfo = useMemo(() => {
    if (inspectedWard) return inspectedWard;
    if (selectedZones.size > 0 && mapData) {
      const firstId = Array.from(selectedZones)[0];
      const match = mapData.features.find(f => f.properties.zone_id === firstId);
      if (match) return match.properties;
    }
    if (hoverInfo && hoverInfo.feature && hoverInfo.feature.properties) {
      return hoverInfo.feature.properties;
    }
    if (mapData && mapData.features.length > 0) {
      return mapData.features[0].properties;
    }
    return null;
  }, [inspectedWard, selectedZones, mapData, hoverInfo]);

  // Export GeoJSON
  const exportGeoJSON = () => {
    const features = [
      ...drawnTrees.map(c => turf.point(c, { type: 'tree' })),
      ...drawnPolygons.map(p => ({ ...p, properties: { type: 'cool_roof' } }))
    ];
    const fc = turf.featureCollection(features);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCity.toLowerCase()}_cooling_interventions.geojson`;
    a.click();
  };

  // Optimizer trigger & complete
  const handleRunOptimizer = () => {
    setIsOptimizing(true);
  };

  const handleOptimizerComplete = () => {
    const selectedIds = Array.from(selectedZones);
    const result = runScenarioOptimizer(scenarioParams, selectedIds.length > 0 ? selectedIds : null, cityWards);
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  // Map controls
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetCenter = () => {
    const key = currentCity.toLowerCase();
    const coords = CITY_COORDINATES[key] || CITY_COORDINATES['pune'];
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: coords.zoom,
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
  };

  const handleCompassClick = () => {
    if (!mapRef.current) return;
    if (Math.abs(mapBearing) > 2 || Math.abs(mapPitch) > 5) {
      // Reset back to top-down True North
      mapRef.current.flyTo({ bearing: 0, pitch: 0, duration: 800 });
      setMapBearing(0);
      setMapPitch(0);
    } else {
      // Toggle 3D perspective pitch tilt (50 degrees)
      mapRef.current.flyTo({ pitch: 50, bearing: -15, duration: 1000 });
    }
  };

  const handleToggleMeasureMode = () => {
    if (interactionMode === 'measure') {
      setInteractionMode('navigate');
      setMeasurePoints([]);
    } else {
      setInteractionMode('measure');
      setMeasurePoints([]);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleZenMode = () => {
    setIsZenMode(prev => {
      const next = !prev;
      if (next) {
        setIsLeftRailOpen(false);
        setIsRightRailOpen(false);
      } else {
        setIsLeftRailOpen(true);
      }
      return next;
    });
  };

  // Map pointer handlers
  const handleMouseMove = useCallback(event => {
    if (event.lngLat) {
      setMapCenterCoords({ lng: event.lngLat.lng, lat: event.lngLat.lat });
    }
    if (interactionMode === 'lasso' && isDrawingLasso) {
      setLassoPath(prev => [...prev, event.point]);
      setLassoPathLngLat(prev => [...prev, [event.lngLat.lng, event.lngLat.lat]]);
    } else if (interactionMode === 'select' || interactionMode === 'navigate') {
      const { features, lngLat } = event;
      const hoveredFeature = features && features[0];
      setHoverInfo(hoveredFeature ? { feature: hoveredFeature, x: event.point.x, y: event.point.y, lngLat } : null);
    } else {
      setHoverInfo(null);
    }
  }, [interactionMode, isDrawingLasso]);

  // Only start lasso drawing on pointer down
  const onMouseDown = useCallback(event => {
    if (interactionMode === 'lasso') {
      const lngLatArr = [event.lngLat.lng, event.lngLat.lat];
      setIsDrawingLasso(true);
      setLassoPath([event.point]);
      setLassoPathLngLat([lngLatArr]);
    }
  }, [interactionMode]);

  // Click handler that ONLY fires on true click without dragging (never interferes with pan/zoom)
  const handleMapClick = useCallback(event => {
    const lngLatArr = [event.lngLat.lng, event.lngLat.lat];

    if (interactionMode === 'navigate') {
      // In navigate mode: clicking a ward inspects it without altering scenario selection
      const { features } = event;
      if (features && features.length > 0) {
        setInspectedWard(features[0].properties);
      } else {
        setInspectedWard(null);
      }
    } else if (interactionMode === 'select') {
      // In select mode: clicking a ward toggles it for cooling scenario optimization
      const { features } = event;
      if (features && features.length > 0) {
        const id = features[0].properties.zone_id;
        setSelectedZones(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
        setInspectedWard(features[0].properties);
      }
    } else if (interactionMode === 'measure') {
      setMeasurePoints(prev => {
        if (prev.length >= 2) return [lngLatArr];
        return [...prev, lngLatArr];
      });
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
    <div className="h-screen h-[100dvh] max-h-[100dvh] bg-[#FAF9F6] text-slate-800 flex flex-col font-sans overflow-hidden">
      {/* Top Mission Control Header in Light Stitch Theme */}
      <Header
        currentCity={currentCity}
        onSelectCity={setCurrentCity}
        wards={cityWards}
        selectedWardId={selectedWardForModal ? (selectedWardForModal.id || selectedWardForModal.zone_id) : null}
        onSelectWard={handleSelectWardAndFly}
        currentPass={currentPass}
        onToggleLeftRail={() => setIsLeftRailOpen(!isLeftRailOpen)}
        onToggleRightRail={() => setIsRightRailOpen(!isRightRailOpen)}
        isLeftRailOpen={isLeftRailOpen}
        isRightRailOpen={isRightRailOpen}
        isZenMode={isZenMode}
        onToggleZenMode={handleToggleZenMode}
        onExportDSS={() => generateCityHAPPDF(currentCity, cityWards, scenarioParams, liveTelemetry, optimizationResult)}
        onExportHAP={() => generateCityHAPPDF(currentCity, cityWards, scenarioParams, liveTelemetry, optimizationResult)}
        onExportGeoJSON={exportGeoJSON}
        currentPersona={currentPersona}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Demo Mode / Sample Data Banner */}
      <DemoModeBanner isMock={isUsingMockData} city={currentCity} onRetry={fetchData} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative min-h-0 w-full">
        {/* Left Rail Collapsible Panel */}
        <LeftRail
          isOpen={isLeftRailOpen}
          onClose={() => setIsLeftRailOpen(false)}
          activeLayers={activeLayers}
          onToggleLayer={(key) => setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          onSetAllLayers={(enable) => {
            setActiveLayers({
              lstHeat: enable,
              ndviVegetation: enable,
              driverAttribution: enable,
              populationDensity: enable,
              discomGrid: enable
            });
          }}
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
          hasDrawnElements={drawnTrees.length > 0 || drawnPolygons.length > 0}
          selectedZonesCount={selectedZones.size}
        />

        {/* Center Stage: Hero Map + Scrubber */}
        <main className="flex-1 h-full min-h-0 flex flex-col relative overflow-hidden bg-ops-grid">
          
          {/* Data Feed Connection State Toast (Solid Opaque Card) */}
          {dataFeedToast && (
            <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-3 text-xs font-sans border bg-white ${
              dataFeedToast.type === 'live' 
                ? 'border-emerald-300 text-slate-800' 
                : 'border-amber-300 text-slate-800'
            }`}>
              <span className={`material-symbols-outlined text-[20px] ${dataFeedToast.type === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {dataFeedToast.type === 'live' ? 'check_circle' : 'warning'}
              </span>
              <div>
                <div className="font-bold text-slate-900">{dataFeedToast.title}</div>
                <div className="text-[11px] text-slate-600">{dataFeedToast.message}</div>
              </div>
              <button
                onClick={() => setDataFeedToast(null)}
                className="text-slate-400 hover:text-slate-700 ml-2 p-1 rounded hover:bg-slate-100 transition-colors"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Optimization Finished Banner Toast (Solid Opaque Card) */}
          {optimizationResult && !dataFeedToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-[#FAF9F6] border border-emerald-500 text-slate-800 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-sans">
              <span className="material-symbols-outlined text-emerald-700 text-[22px]">auto_awesome</span>
              <div>
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>
                    {optimizationResult.isSingleWard 
                      ? `Ward Optimized: ${optimizationResult.targetWardName}`
                      : `${currentCity}: Metropolitan Grid Optimized (${optimizationResult.targetWardCount} Wards)`}:
                  </span>
                  <span className="text-emerald-800 font-extrabold text-sm">
                    -{optimizationResult.projectedTempReductionDegC}°C cooling
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                  {optimizationResult.isSingleWard ? (
                    <span>
                      Allocated CapEx: <strong>₹{optimizationResult.allocatedBudgetLakhs}L</strong> | Intervention: <strong>{optimizationResult.recommendedIntervention}</strong>
                    </span>
                  ) : (
                    <span>
                      Saved {optimizationResult.gridPowerSavedMw} MW grid draw | Shielded {optimizationResult.vulnerablePopProtected?.toLocaleString()} citizens
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOptimizationResult(null)}
                className="text-slate-400 hover:text-slate-700 ml-2 p-1 rounded hover:bg-slate-200 transition-colors"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Active Interaction Mode Indicator Pill (Centered HUD) */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            {interactionMode === 'navigate' ? (
              <div className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-600">pan_tool</span>
                <span className="font-semibold text-slate-800">Pan & Explore Mode</span>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-slate-500">Click any ward to inspect</span>
                <button
                  onClick={() => setInteractionMode('select')}
                  className="ml-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 transition-colors"
                >
                  Select Wards
                </button>
              </div>
            ) : interactionMode === 'select' ? (
              <div className="bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-500 text-xs text-slate-800 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">touch_app</span>
                <span className="font-bold text-slate-900">Ward Select Active</span>
                <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {selectedZones.size} Selected
                </span>
                <button
                  onClick={() => setInteractionMode('navigate')}
                  className="ml-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-0.5 rounded-full shadow-xs transition-colors flex items-center gap-1"
                >
                  <span>✓ Done (Pan Map)</span>
                </button>
              </div>
            ) : interactionMode === 'measure' ? (
              <div className="bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500 text-xs text-slate-800 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[16px] text-amber-600">straighten</span>
                <span className="font-bold text-slate-900">
                  {measurePoints.length === 0 && "Click 1st point on map to measure"}
                  {measurePoints.length === 1 && "Click 2nd point to finish line"}
                  {measurePoints.length >= 2 && `Distance: ${measuredDistance} km (${(measuredDistance * 1000).toLocaleString()} m)`}
                </span>
                {measurePoints.length >= 2 && (
                  <button
                    onClick={() => setMeasurePoints([])}
                    className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => { setInteractionMode('navigate'); setMeasurePoints([]); }}
                  className="text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-0.5 rounded-full transition-colors"
                >
                  Exit Ruler
                </button>
              </div>
            ) : (
              <div className="bg-white px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">draw</span>
                <span className="font-semibold uppercase text-[11px] text-slate-800">{interactionMode} tool active</span>
                <button
                  onClick={() => setInteractionMode('navigate')}
                  className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                >
                  Back to Pan
                </button>
              </div>
            )}
          </div>

          {/* 1. TOP FLOATING HUD BAR (From Stitch Design) */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
            {/* Dynamic Telemetry & Coordinates Readout Pill (Replaces redundant search) */}
            <div className="pointer-events-auto flex items-center gap-2.5 bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-[#EAE6DF] text-xs text-slate-800">
              <span className="material-symbols-outlined text-[17px] text-emerald-700">satellite_alt</span>
              <span className="font-sans font-bold text-slate-900">{currentCity} Wards & Zones</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-[11px] text-slate-600">
                {mapCenterCoords.lat.toFixed(4)}° N, {mapCenterCoords.lng.toFixed(4)}° E
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {cityWards.length} Zones Synced
              </span>
            </div>

            {/* Live TIRS-2 Pass Telemetry Cluster + Centering Reset */}
            <div className="pointer-events-auto flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded shadow-md border border-slate-200 text-xs text-slate-800">
                <span className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`} />
                <span className="font-mono font-bold text-slate-800 text-[11px]">Live TIRS-2 Pass</span>
                <span className="font-mono text-terracotta font-bold text-[11px]">| ΔT: +3.8°C</span>
              </div>
              <button 
                onClick={handleResetCenter}
                className="bg-white px-2.5 py-1.5 rounded shadow-md hover:bg-slate-50 text-slate-800 text-xs font-mono font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                title="Reset Viewport Centering"
              >
                <span className="material-symbols-outlined text-[17px] text-primary">fit_screen</span>
                <span className="hidden md:inline">Centering</span>
              </button>
            </div>
          </div>

          {/* 2. FLOATING LEFT LATCH (When left panel collapsed) */}
          {!isLeftRailOpen && (
            <button
              onClick={() => setIsLeftRailOpen(true)}
              className="absolute top-16 left-0 z-30 bg-white text-slate-800 px-2.5 py-1.5 rounded-r shadow-md hover:bg-slate-50 flex items-center gap-1 border border-l-0 border-slate-200 font-mono text-xs font-semibold"
              title="Expand GIS Overlays Shelf"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">chevron_right</span>
              <span>GIS Shelf</span>
            </button>
          )}

          {/* 3. FLOATING RIGHT REOPEN PILL (When right panel collapsed) */}
          {!isRightRailOpen && (
            <button
              onClick={() => setIsRightRailOpen(true)}
              className="absolute top-20 right-0 z-30 bg-white text-slate-800 pl-3 pr-2 py-1.5 rounded-l shadow-md hover:bg-slate-50 flex items-center gap-1 border border-r-0 border-slate-200 font-mono text-xs font-semibold"
              title="Expand Diagnostic Analytics Drawer"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">chevron_left</span>
              <span>Analytics</span>
            </button>
          )}

          {/* 4. RIGHT EDGE FLOATING GIS ACTION TOOLS CLUSTER (From Stitch Design) */}
          <div className="absolute right-4 top-16 z-20 flex flex-col gap-2 pointer-events-auto">
            {/* Zoom Controls */}
            <div className="flex flex-col bg-white rounded shadow-md overflow-hidden border border-slate-200">
              <button 
                onClick={handleZoomIn}
                className="p-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <div className="h-px bg-slate-200" />
              <button 
                onClick={handleZoomOut}
                className="p-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
            </div>

            {/* Basemap Switcher & Measure Tools */}
            <div className="flex flex-col bg-white rounded shadow-md overflow-hidden border border-slate-200">
              <button 
                onClick={() => setMapStyleType(prev => prev === 'satellite' ? 'light' : 'satellite')}
                className={`p-2 transition-colors ${mapStyleType === 'satellite' ? 'text-primary bg-primary-fixed' : 'text-slate-700 hover:bg-slate-50'}`}
                title="Toggle Basemap (Satellite Hybrid / Cartographic Light)"
              >
                <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              </button>
              <div className="h-px bg-slate-200" />
              <button 
                onClick={handleToggleMeasureMode}
                className={`p-2 transition-colors ${interactionMode === 'measure' ? 'text-white bg-amber-600 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                title="Measure Linear Distance on Map (Click 2 points)"
              >
                <span className="material-symbols-outlined text-[18px]">straighten</span>
              </button>
              <div className="h-px bg-slate-200" />
              <button 
                onClick={handleCompassClick}
                className={`p-2 transition-all group relative flex items-center justify-center ${
                  Math.abs(mapBearing) > 2 || Math.abs(mapPitch) > 5
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={`Compass: Click to re-orient True North (Bearing: ${Math.round(mapBearing)}°, Pitch: ${Math.round(mapPitch)}°)`}
              >
                <div 
                  className="w-5 h-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ transform: `rotate(${-mapBearing}deg)` }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="overflow-visible">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* North Pointer (Red) */}
                    <polygon points="12,3 15,12 12,10 9,12" fill="#e11d48" />
                    {/* South Pointer (Slate) */}
                    <polygon points="12,21 15,12 12,10 9,12" fill="#64748b" />
                    {/* Center Pivot Dot */}
                    <circle cx="12" cy="12" r="1.5" fill="#0f172a" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Fullscreen Canvas Toggle */}
            <button 
              onClick={handleToggleFullscreen}
              className="p-2 bg-white rounded shadow-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-slate-200"
              title="Expand Fullscreen Canvas"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
          </div>

          {/* Lasso SVG overlay */}
          {isDrawingLasso && (
            <svg style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100}}>
              <path d={svgPath} fill="rgba(184, 67, 30, 0.2)" stroke="#b8431e" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          )}

          {/* Map Stage Container */}
          <div 
            className="flex-1 w-full h-full relative" 
            style={{
              cursor: interactionMode === 'navigate' 
                ? (hoverInfo ? 'pointer' : 'grab') 
                : interactionMode === 'select'
                  ? (hoverInfo ? 'pointer' : 'crosshair')
                  : 'crosshair'
            }}
          >
            <Map
              ref={mapRef}
              key={currentCity}
              initialViewState={cityView}
              mapStyle={MAP_STYLES[mapStyleType]}
              interactiveLayerIds={['zones-fill-interactive']}
              onMouseMove={handleMouseMove}
              onClick={handleMapClick}
              onMouseDown={onMouseDown}
              onMouseUp={onPointerUp}
              onDblClick={onDblClick}
              dragPan={true}
              doubleClickZoom={true}
              onMove={(e) => {
                if (e.viewState) {
                  setMapBearing(e.viewState.bearing || 0);
                  setMapPitch(e.viewState.pitch || 0);
                  setMapZoom(e.viewState.zoom || 11.5);
                }
              }}
            >
              {/* Built-in MapLibre Scale Control */}
              <ScaleControl position="bottom-left" unit="metric" maxWidth={110} />

              {/* Linear Measure Line & Markers */}
              {measureGeoJSON && (
                <Source id="measure-line-src" type="geojson" data={measureGeoJSON}>
                  <Layer
                    id="measure-line-casing"
                    type="line"
                    paint={{
                      'line-color': '#0f172a',
                      'line-width': 4.5,
                      'line-opacity': 0.8
                    }}
                  />
                  <Layer
                    id="measure-line-inner"
                    type="line"
                    paint={{
                      'line-color': '#f59e0b',
                      'line-width': 2.5,
                      'line-dasharray': [2, 2]
                    }}
                  />
                </Source>
              )}

              {measurePointsGeoJSON && (
                <Source id="measure-pts-src" type="geojson" data={measurePointsGeoJSON}>
                  <Layer
                    id="measure-pts-circles"
                    type="circle"
                    paint={{
                      'circle-radius': 6.5,
                      'circle-color': '#f59e0b',
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )}
              {/* Drawn Green Areas (Polygons) */}
              <Source id="drawn-polygons" type="geojson" data={polygonsGeoJSON}>
                <Layer id="drawn-polygons-fill" type="fill" paint={{'fill-color': '#2e7d58', 'fill-opacity': 0.45}} />
                <Layer id="drawn-polygons-line" type="line" paint={{'line-color': '#2e7d58', 'line-width': 2}} />
              </Source>

              {/* Active Drawing Polygon Line */}
              {activePolygonGeoJSON && (
                <Source id="active-polygon" type="geojson" data={activePolygonGeoJSON}>
                  <Layer id="active-polygon-line" type="line" paint={{'line-color': '#b8431e', 'line-width': 2, 'line-dasharray': [2, 2]}} />
                </Source>
              )}

              {/* Drawn Trees (Points) */}
              <Source id="drawn-trees" type="geojson" data={treesGeoJSON}>
                <Layer id="drawn-trees-circle" type="circle" paint={{'circle-color': '#2e7d58', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff'}} />
              </Source>

              {/* Selected Zone Boundaries */}
              {selectedBoundary && (
                <Source id="selected-boundary" type="geojson" data={selectedBoundary}>
                  <Layer id="selected-boundary-line" type="line" paint={{'line-color': '#ffffff', 'line-width': 3, 'line-opacity': 0.95}} />
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
                        '#F97316',
                        activeLayers.lstHeat
                          ? [
                              'interpolate',
                              ['linear'],
                              ['coalesce', ['get', 'display_lst'], 35.0],
                              32.5, '#10B981',  // Emerald Green (<33°C)
                              34.0, '#84CC16',  // Lime (33-34.5°C)
                              35.2, '#FACC15',  // Vibrant Yellow (34.5-36°C)
                              36.5, '#F97316',  // Warm Orange (36-37.5°C)
                              37.8, '#EF4444'   // Crimson Hotspot (>37.8°C)
                            ]
                          : activeLayers.ndviVegetation
                            ? [
                                'interpolate',
                                ['linear'],
                                ['coalesce', ['get', 'ndvi'], 0.22],
                                0.08, '#D97706',
                                0.16, '#FBBF24',
                                0.26, '#84CC16',
                                0.38, '#10B981'
                              ]
                            : '#effcf9'
                      ],
                      'fill-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        0.65,
                        activeLayers.lstHeat ? 0.38 : (activeLayers.ndviVegetation ? 0.32 : 0.05)
                      ]
                    }} 
                  />
                  <Layer
                    id="zones-outline"
                    type="line"
                    paint={{
                      'line-color': '#ffffff',
                      'line-width': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        2.5,
                        1.2
                      ],
                      'line-opacity': [
                        'case',
                        ['==', ['get', 'is_selected'], 1],
                        1.0,
                        0.85
                      ]
                    }}
                  />
                </Source>
              )}

              {/* Driver Attribution Layer */}
              {pointData && activeLayers.driverAttribution && (
                <Source id="driver-attr" type="geojson" data={pointData}>
                  <Layer
                    id="driver-circles"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'anomaly'], 2], 0, 8, 6, 24],
                      'circle-color': ['interpolate', ['linear'], ['coalesce', ['get', 'anomaly'], 2], 0, '#2e7d58', 3, '#d97736', 5, '#b8431e'],
                      'circle-opacity': 0.75,
                      'circle-stroke-width': 1.5,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )}

              {/* Population Density Layer */}
              {pointData && activeLayers.populationDensity && (
                <Source id="pop-circles" type="geojson" data={pointData}>
                  <Layer
                    id="pop-circles-layer"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'vulnerable_pop_pct'], 30], 0, 10, 60, 30],
                      'circle-color': '#9333ea',
                      'circle-opacity': 0.65,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )}

              {/* DISCOM Grid Stress Layer */}
              {activeLayers.discomGrid && (
                <Source id="discom-grid" type="geojson" data={discomGeoJSON}>
                  <Layer
                    id="discom-circles"
                    type="circle"
                    paint={{
                      'circle-radius': ['interpolate', ['linear'], ['get', 'gridLoadMw'], 30, 10, 110, 28],
                      'circle-color': ['interpolate', ['linear'], ['get', 'gridLoadMw'], 50, '#d97736', 90, '#c85a32', 110, '#b8431e'],
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
               hoverInfo.feature && hoverInfo.feature.properties && (interactionMode === 'select' || interactionMode === 'navigate') && (
                <Popup longitude={hoverInfo.lngLat.lng} latitude={hoverInfo.lngLat.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={15}>
                  <div className="min-w-[190px] font-sans text-xs bg-white text-slate-800 p-2.5 rounded-lg shadow-xl border border-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
                      <span className="font-bold text-slate-900">
                        Zone {hoverInfo.feature.properties.zone_id || 'N/A'}
                      </span>
                      <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded font-bold">
                        LST Telemetry
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Surface Temp:</span>
                        <span className="font-bold text-terracotta">
                          {Number(hoverInfo.feature.properties.display_lst ?? 35.0).toFixed(1)}°C
                        </span>
                      </div>

                      {simResults && hoverInfo.feature.properties.zone_id && simResults[hoverInfo.feature.properties.zone_id] && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Simulation Δ:</span>
                          <span className="font-bold text-forest">
                            {((hoverInfo.feature.properties.display_lst ?? 35.0) - (hoverInfo.feature.properties.lst ?? 35.0)).toFixed(2)}°C
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-500">NDVI Canopy:</span>
                        <span className="text-forest font-bold">{Number(hoverInfo.feature.properties.ndvi ?? 0.22).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">NDBI Built-up:</span>
                        <span className="text-slate-800 font-bold">{Number(hoverInfo.feature.properties.ndbi ?? 0.05).toFixed(2)}</span>
                      </div>
                    </div>

                    <div 
                      className="mt-2 pt-1 border-t border-slate-100 text-[10px] font-sans text-emerald-700 text-right cursor-pointer font-bold hover:underline"
                      onClick={() => setSelectedWardForModal(hoverInfo.feature.properties)}
                    >
                      Click to open physics drill-down →
                    </div>
                  </div>
                </Popup>
              )}
            </Map>

            {/* 5. SELECTED WARD LIVE CARTOGRAPHIC CALLOUT CARD (Pinned Bottom-Left) */}
            {selectedWardInfo && (
              <div className="absolute bottom-20 left-4 z-20 bg-white p-3.5 rounded-lg shadow-xl border-l-4 border-emerald-600 max-w-xs transition-all border border-slate-200 text-slate-800 pointer-events-auto">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[9px] text-terracotta uppercase font-bold tracking-wider">
                      ZONE {selectedWardInfo.zone_id || 'ALERT'} • UHI CORE
                    </span>
                    <h3 className="font-sans font-bold text-sm text-slate-900 leading-snug">
                      {selectedWardInfo.name || `Zone ${selectedWardInfo.zone_id}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="bg-terracotta text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {Number(selectedWardInfo.display_lst || selectedWardInfo.lst || 36.8).toFixed(1)}°C
                    </span>
                    <button 
                      onClick={() => setIsWardCardExpanded(!isWardCardExpanded)}
                      className="p-0.5 text-slate-500 hover:text-slate-800"
                      title={isWardCardExpanded ? 'Collapse' : 'Expand'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isWardCardExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {isWardCardExpanded && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs font-sans">
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 uppercase text-[9px] font-semibold">NDVI</span>
                        <div className="font-bold text-forest">{Number(selectedWardInfo.ndvi || 0.22).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[9px] font-semibold">NDBI</span>
                        <div className="font-bold text-terracotta">{Number(selectedWardInfo.ndbi || 0.05).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[9px] font-semibold">Vulnerable</span>
                        <div className="font-bold text-red-600">{selectedWardInfo.vulnerable_pop_pct || 32}%</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedWardForModal(selectedWardInfo)}
                      className="text-right text-[11px] text-primary hover:underline font-bold mt-1"
                    >
                      Open full physics drill-down →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 6. THERMAL GRADIENT SCALE LEGEND BAR (Pinned Bottom-Right) */}
            <div className="absolute bottom-20 right-4 z-20 bg-white px-3.5 py-2.5 rounded shadow-md flex flex-col gap-1.5 pointer-events-auto border border-slate-200 text-slate-800">
              <div className="flex items-center justify-between text-[11px] font-sans font-bold text-slate-800">
                <span>Surface Temp (LST)</span>
                <span className="text-terracotta font-mono font-bold">30°C — 46°C</span>
              </div>
              <div className="w-48 sm:w-52 h-3.5 rounded flex overflow-hidden border border-slate-300 shadow-2xs">
                <div className="h-full w-1/5 bg-[#10B981]" title="< 33°C Cool Green" />
                <div className="h-full w-1/5 bg-[#84CC16]" title="33-34.5°C Mild Lime" />
                <div className="h-full w-1/5 bg-[#FACC15]" title="34.5-36°C Moderate Yellow" />
                <div className="h-full w-1/5 bg-[#F97316]" title="36-37.5°C High Orange" />
                <div className="h-full w-1/5 bg-[#EF4444]" title="> 37.8°C Extreme Thermal Hotspot" />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500 px-0.5">
                <span>&lt;33°</span>
                <span>34°</span>
                <span>35.5°</span>
                <span>36.5°</span>
                <span>&gt;37.8°</span>
              </div>

              {/* Graphic Metric Distance Scale */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] font-mono font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans text-[9px] uppercase font-semibold">Scale:</span>
                  <div className="flex items-center">
                    <span className="h-2 w-0.5 bg-slate-900" />
                    <span 
                      className="h-1 bg-slate-900 inline-block transition-all duration-150"
                      style={{ width: `${mapScaleInfo.barWidthPx}px` }} 
                    />
                    <span className="h-2 w-0.5 bg-slate-900" />
                  </div>
                  <span className="text-slate-900 font-bold">{mapScaleInfo.label}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Zoom: {mapZoom.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          {/* 7. DOCKED HORIZON TIMELINE SCRUBBER (From Stitch Design) */}
          <TimelineScrubber
            passes={MOCK_SATELLITE_PASSES}
            selectedPassIndex={selectedPassIndex}
            onSelectPassIndex={setSelectedPassIndex}
            onSimulateHorizon={() => {
              setIsRightRailOpen(true);
            }}
          />
        </main>

        {/* Right Rail Panel */}
        <RightRail
          alerts={MOCK_ALERTS}
          onSelectWard={handleSelectWardAndFly}
          cityResilienceScore={cityResilienceScore}
          currentCity={currentCity}
          wards={cityWards}
          selectedWard={selectedZones.size > 0 ? selectedWardInfo : null}
          liveTelemetry={liveTelemetry}
          scenarioParams={scenarioParams}
          isOpen={isRightRailOpen}
          onClose={() => setIsRightRailOpen(false)}
          onRunSimulation={handleRunOptimizer}
          optimizationResult={optimizationResult}
          onCommitPlan={() => {
            setDataFeedToast({
              type: 'live',
              title: `${currentCity}: Plan Committed`,
              message: '2026 Cooling Action Plan interventions registered to municipal records.'
            });
            setTimeout(() => setDataFeedToast(null), 4000);
          }}
          onExportHAP={() => generateCityHAPPDF(currentCity, cityWards, scenarioParams, liveTelemetry, optimizationResult)}
        />

        {/* Collapsed Analytics Quick-Reopen Floating Handle */}
        {!isRightRailOpen && (
          <button
            onClick={() => setIsRightRailOpen(true)}
            className="absolute top-1/2 -translate-y-1/2 right-0 z-20 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-800 pl-2 pr-2.5 py-3 rounded-l-xl shadow-md border-y border-l border-[#EAE6DF] font-sans text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
            title="Open Analytics & Heat Action Plan Drawer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">analytics</span>
            <span className="text-[10px] uppercase font-mono tracking-wider rotate-180" style={{ writingMode: 'vertical-rl' }}>
              ANALYTICS
            </span>
          </button>
        )}
      </div>

      {/* Ward Drill-Down Modal with Official Cooling Plan PDF Generator */}
      {selectedWardForModal && (
        <WardDetailModal
          ward={selectedWardForModal}
          currentCity={currentCity}
          liveTelemetry={liveTelemetry}
          scenarioParams={scenarioParams}
          optimizationResult={optimizationResult}
          onClose={() => setSelectedWardForModal(null)}
        />
      )}

      {/* Institutional Multi-Role Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
      />

      {/* Scanner Overlay during Optimizer simulation */}
      <OptimizingOverlay
        isOptimizing={isOptimizing}
        wards={selectedZones.size > 0 ? cityWards.filter(w => selectedZones.has(w.id)) : cityWards}
        onComplete={handleOptimizerComplete}
      />
    </div>
  );
}

export default MapView;
