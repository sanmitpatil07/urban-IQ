// Satellite Passes Timeline (Historical revisits matching actual Pune Landsat-9 & Sentinel-2 acquisitions)
export const MOCK_SATELLITE_PASSES = [
  {
    id: 'PASS-2026-0414-1057',
    satellite: 'Landsat-9',
    sensor: 'TIRS-2 Dual-Band Thermal (Scene LC09_L2SP_147047)',
    timestamp: '2026-04-14 10:57 IST',
    orbitNumber: 'L9-147047',
    resolutionMeters: 30,
    meanCityLst: 36.4,
    maxLstRecorded: 42.1,
    status: 'PROCESSED (LIVE)',
  },
  {
    id: 'PASS-2026-0413-1100',
    satellite: 'Sentinel-2C',
    sensor: 'MSI High-Res Vegetation / NDBI (Scene S2C_MSIL2A)',
    timestamp: '2026-04-13 11:00 IST',
    orbitNumber: 'S2C-T43QCA',
    resolutionMeters: 10,
    meanCityLst: 35.8,
    maxLstRecorded: 41.5,
    status: 'PROCESSED (LIVE)',
  },
  {
    id: 'PASS-2026-0406-1055',
    satellite: 'Landsat-8',
    sensor: 'TIRS Thermal Radiometer',
    timestamp: '2026-04-06 10:55 IST',
    orbitNumber: 'L8-147047',
    resolutionMeters: 100,
    meanCityLst: 35.1,
    maxLstRecorded: 40.2,
    status: 'HISTORICAL',
  },
  {
    id: 'PASS-2026-0329-1057',
    satellite: 'Landsat-9',
    sensor: 'TIRS-2 Dual-Band Thermal',
    timestamp: '2026-03-29 10:57 IST',
    orbitNumber: 'L9-147047',
    resolutionMeters: 100,
    meanCityLst: 34.3,
    maxLstRecorded: 39.4,
    status: 'HISTORICAL',
  },
  {
    id: 'PASS-2026-0324-1100',
    satellite: 'Sentinel-2A',
    sensor: 'MSI High-Res Multispectral',
    timestamp: '2026-03-24 11:00 IST',
    orbitNumber: 'S2A-T43QCA',
    resolutionMeters: 10,
    meanCityLst: 33.7,
    maxLstRecorded: 38.6,
    status: 'HISTORICAL',
  }
];

// Pune Municipal Corporation Wards Dataset with GeoJSON Polygons & LST anomalies
// Centered around Pune bounding box [73.75, 18.40, 73.98, 18.62]
export const MOCK_WARDS = [
  {
    id: 'W-084',
    name: 'Hadapsar & Magarpatta Industrial Corridor',
    zone: 'East Industrial Zone',
    city: 'Pune',
    areaSqKm: 7.2,
    population: 178000,
    lstAnomaly: 5.2,
    baselineTemp: 32.8,
    currentLst: 38.0,
    ndviIndex: 0.09,
    gridLoadMw: 92.4,
    vulnerablePopPct: 46,
    topDriver: 'Industrial Metal Roof Albedo & Low Canopy',
    riskNote: 'Transformer overload critical. High industrial worker thermal exposure.',
    riskSeverity: 'critical',
    center: [18.5089, 73.9260],
    polygon: [
      [73.9100, 18.5180],
      [73.9450, 18.5200],
      [73.9420, 18.4950],
      [73.9120, 18.4980],
      [73.9100, 18.5180]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': 5.2,
      'PASS-2026-0413-1100': 4.8,
      'PASS-2026-0406-1055': 4.1,
      'PASS-2026-0329-1057': 3.5,
      'PASS-2026-0324-1100': 2.9,
    }
  },
  {
    id: 'W-112',
    name: 'Shivajinagar & Old City Core (FC Road)',
    zone: 'Central Business District',
    city: 'Pune',
    areaSqKm: 4.6,
    population: 215000,
    lstAnomaly: 4.5,
    baselineTemp: 32.8,
    currentLst: 37.3,
    ndviIndex: 0.12,
    gridLoadMw: 68.0,
    vulnerablePopPct: 52,
    topDriver: 'Dense Concrete Thermal Mass & Traffic Canyons',
    riskNote: 'Severe urban canyon heat trapping across market and transit corridors.',
    riskSeverity: 'critical',
    center: [18.5308, 73.8474],
    polygon: [
      [73.8380, 18.5380],
      [73.8580, 18.5400],
      [73.8560, 18.5220],
      [73.8390, 18.5200],
      [73.8380, 18.5380]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': 4.5,
      'PASS-2026-0413-1100': 4.1,
      'PASS-2026-0406-1055': 3.6,
      'PASS-2026-0329-1057': 3.0,
      'PASS-2026-0324-1100': 2.4,
    }
  },
  {
    id: 'W-150',
    name: 'Kharadi & Viman Nagar IT Corridor',
    zone: 'Northeast IT Park Corridor',
    city: 'Pune',
    areaSqKm: 8.5,
    population: 195000,
    lstAnomaly: 3.8,
    baselineTemp: 32.8,
    currentLst: 36.6,
    ndviIndex: 0.15,
    gridLoadMw: 104.5,
    vulnerablePopPct: 28,
    topDriver: 'Glass Facade Reflection & HVAC Heat Exhaust',
    riskNote: 'High peak AC load strain during 12:00–16:00 solar irradiance window.',
    riskSeverity: 'high',
    center: [18.5520, 73.9350],
    polygon: [
      [73.9200, 18.5650],
      [73.9520, 18.5680],
      [73.9500, 18.5380],
      [73.9220, 18.5360],
      [73.9200, 18.5650]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': 3.8,
      'PASS-2026-0413-1100': 3.4,
      'PASS-2026-0406-1055': 2.9,
      'PASS-2026-0329-1057': 2.5,
      'PASS-2026-0324-1100': 1.9,
    }
  },
  {
    id: 'W-174',
    name: 'Bhosari & PCMC Industrial Belt',
    zone: 'North Manufacturing Zone',
    city: 'Pune',
    areaSqKm: 11.2,
    population: 230000,
    lstAnomaly: 5.6,
    baselineTemp: 32.8,
    currentLst: 38.4,
    ndviIndex: 0.08,
    gridLoadMw: 125.0,
    vulnerablePopPct: 42,
    topDriver: 'Expansive Bituminous Pavements & Metal Sheds',
    riskNote: 'Wide blacktop surfaces elevate local surface heat up to 42°C in summer peak.',
    riskSeverity: 'critical',
    center: [18.6270, 73.8450],
    polygon: [
      [73.8300, 18.6380],
      [73.8620, 18.6400],
      [73.8600, 18.6120],
      [73.8320, 18.6100],
      [73.8300, 18.6380]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': 5.6,
      'PASS-2026-0413-1100': 5.1,
      'PASS-2026-0406-1055': 4.5,
      'PASS-2026-0329-1057': 3.9,
      'PASS-2026-0324-1100': 3.1,
    }
  },
  {
    id: 'W-032',
    name: 'Kothrud & Karve Nagar Residential',
    zone: 'West Residential Zone',
    city: 'Pune',
    areaSqKm: 5.4,
    population: 160000,
    lstAnomaly: 1.9,
    baselineTemp: 32.8,
    currentLst: 34.7,
    ndviIndex: 0.34,
    gridLoadMw: 48.2,
    vulnerablePopPct: 36,
    topDriver: 'Avenue Canopy Buffering & Moderate Density',
    riskNote: 'Mature tree canopy on primary avenues provides ~2.5°C thermal buffer.',
    riskSeverity: 'moderate',
    center: [18.5074, 73.8077],
    polygon: [
      [73.7950, 18.5180],
      [73.8200, 18.5200],
      [73.8180, 18.4950],
      [73.7970, 18.4930],
      [73.7950, 18.5180]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': 1.9,
      'PASS-2026-0413-1100': 1.6,
      'PASS-2026-0406-1055': 1.3,
      'PASS-2026-0329-1057': 1.0,
      'PASS-2026-0324-1100': 0.7,
    }
  },
  {
    id: 'W-008',
    name: 'Vetal Tekdi & ARAI Forest Reserve',
    zone: 'Central Ecological Reserve',
    city: 'Pune',
    areaSqKm: 3.2,
    population: 6200,
    lstAnomaly: -1.2,
    baselineTemp: 32.8,
    currentLst: 31.6,
    ndviIndex: 0.72,
    gridLoadMw: 6.5,
    vulnerablePopPct: 8,
    topDriver: 'Active Transpiration & Microclimate Heat Sink',
    riskNote: 'Vital urban cool island; provides 2.4°C cooling plume to adjacent residential wards.',
    riskSeverity: 'safe',
    center: [18.5180, 73.8180],
    polygon: [
      [73.8100, 18.5280],
      [73.8280, 18.5300],
      [73.8260, 18.5080],
      [73.8120, 18.5060],
      [73.8100, 18.5280]
    ],
    historyByPass: {
      'PASS-2026-0414-1057': -1.2,
      'PASS-2026-0413-1100': -1.3,
      'PASS-2026-0406-1055': -1.5,
      'PASS-2026-0329-1057': -1.6,
      'PASS-2026-0324-1100': -1.8,
    }
  }
];

// Physics-informed Driver Attributions
export const MOCK_DRIVER_ATTRIBUTIONS = {
  'W-084': [
    {
      id: 'drv-1',
      driverName: 'Industrial Metal Roof Albedo Deficit',
      contributionPct: 44,
      confidenceBand: [41, 47],
      category: 'built_environment',
      description: 'Corrugated iron & dark industrial roofs absorbing >85% incident solar flux.',
      physicsEq: 'Rn = (1 - α)S↓ + L↓ - L↑'
    },
    {
      id: 'drv-2',
      driverName: 'Absence of Transpiration (LAI < 0.2)',
      contributionPct: 31,
      confidenceBand: [28, 34],
      category: 'vegetation',
      description: 'Near-zero vegetative fraction suppresses evaporative heat dissipation.',
      physicsEq: 'λE = 0.05 · Rn (Severely suppressed)'
    },
    {
      id: 'drv-3',
      driverName: 'Industrial Heat Exhaust & Manufacturing Activity',
      contributionPct: 16,
      confidenceBand: [13, 19],
      category: 'anthropogenic',
      description: 'Machinery, fabrication sheds, and generator exhausts adding sensible flux.',
      physicsEq: 'QF = Q_industry + Q_generator'
    },
    {
      id: 'drv-4',
      driverName: 'Heavy Freight Transport Thermal Plumes',
      contributionPct: 9,
      confidenceBand: [7, 11],
      category: 'anthropogenic',
      description: 'High truck and freight traffic volume emitting direct heat plumes.',
      physicsEq: 'H = ρ cp (Ts - Ta) / ra'
    }
  ],
  'W-112': [
    {
      id: 'drv-1',
      driverName: 'Concrete & Masonry Thermal Mass',
      contributionPct: 42,
      confidenceBand: [39, 45],
      category: 'built_environment',
      description: 'Dense old-city buildings storing large heat capacity during daytime.',
      physicsEq: 'S = Cv · (dT / dt)'
    },
    {
      id: 'drv-2',
      driverName: 'Narrow Street Canyon Trapping',
      contributionPct: 28,
      confidenceBand: [25, 31],
      category: 'geometry',
      description: 'Low sky view factor impedes nocturnal longwave radiation dissipation.',
      physicsEq: 'L_net = ε σ T⁴ · SVF'
    },
    {
      id: 'drv-3',
      driverName: 'Dense Traffic Emissions (FC Road / Shivaji Rd)',
      contributionPct: 20,
      confidenceBand: [17, 23],
      category: 'anthropogenic',
      description: 'Stop-and-go vehicular convective heat and air-conditioning exhaust.',
      physicsEq: 'Qa = Q_traffic + Q_building'
    },
    {
      id: 'drv-4',
      driverName: 'Low Canopy Shade Fraction',
      contributionPct: 10,
      confidenceBand: [8, 12],
      category: 'vegetation',
      description: 'Limited street tree cover exposes sidewalks directly to solar insolation.',
      physicsEq: 'LE = ρ Lv gs (qs(Ts) - qa)'
    }
  ]
};

export const DEFAULT_DRIVER_ATTRIBUTIONS = [
  {
    id: 'drv-def-1',
    driverName: 'Impervious Surface Thermal Inertia',
    contributionPct: 38,
    confidenceBand: [35, 41],
    category: 'built_environment',
    description: 'High fraction of asphalt roads and concrete structures storing daytime heat.',
    physicsEq: 'S = Cv · (dT / dt)'
  },
  {
    id: 'drv-def-2',
    driverName: 'Vegetation Canopy Deficit',
    contributionPct: 32,
    confidenceBand: [29, 35],
    category: 'vegetation',
    description: 'Low leaf area index (LAI) limiting latent heat flux cooling.',
    physicsEq: 'LE = ρ Lv gs (qs(Ts) - qa)'
  },
  {
    id: 'drv-def-3',
    driverName: 'Anthropogenic Heat Releases',
    contributionPct: 18,
    confidenceBand: [15, 21],
    category: 'anthropogenic',
    description: 'Vehicular traffic and commercial air conditioning heat rejection.',
    physicsEq: 'Qa = Q_traffic + Q_building'
  },
  {
    id: 'drv-def-4',
    driverName: 'Radiative Canyon Trapping',
    contributionPct: 12,
    confidenceBand: [10, 14],
    category: 'geometry',
    description: 'Reduced sky view factor impeding nocturnal longwave radiation release.',
    physicsEq: 'L_net = ε σ T⁴ · SVF'
  }
];

// Ranked Cooling Interventions (Cooling Impact per Rupee)
export const MOCK_INTERVENTIONS = [
  {
    id: 'int-1',
    name: 'High-Albedo Cool Roof Coating (SRI > 82)',
    category: 'cool_roof',
    estCoolingImpactDegC: 1.8,
    costInrLakhs: 14.5,
    costPerDegreeAvertedLakhs: 8.06,
    coBenefits: ['Reduces indoor top-floor temp by 3.4°C', 'Immediate 18% AC power reduction'],
    implementationTimeDays: 14,
    roiRank: 1
  },
  {
    id: 'int-2',
    name: 'Dense Urban Miyawaki Canopy Pocket (200 Trees)',
    category: 'tree_canopy',
    estCoolingImpactDegC: 2.6,
    costInrLakhs: 28.0,
    costPerDegreeAvertedLakhs: 10.77,
    coBenefits: ['Groundwater recharge', 'Air particulate PM2.5 filtration (12%)'],
    implementationTimeDays: 45,
    roiRank: 2
  },
  {
    id: 'int-3',
    name: 'Permeable & Reflective Pavement Retrofit',
    category: 'reflective_pavement',
    estCoolingImpactDegC: 1.2,
    costInrLakhs: 22.0,
    costPerDegreeAvertedLakhs: 18.33,
    coBenefits: ['Stormwater runoff mitigation', 'Nighttime surface radiation drop'],
    implementationTimeDays: 30,
    roiRank: 3
  },
  {
    id: 'int-4',
    name: 'High-Pressure Micro-Misting Transit Shelters',
    category: 'micro_misting',
    estCoolingImpactDegC: 3.2,
    costInrLakhs: 65.0,
    costPerDegreeAvertedLakhs: 20.31,
    coBenefits: ['Instant relief for outdoor bus commuters', 'Dust suppression'],
    implementationTimeDays: 20,
    roiRank: 4
  }
];

// Live Thermal Alerts Feed for Pune
export const MOCK_ALERTS = [
  {
    id: 'alt-01',
    timestamp: '11:05 IST (15m ago)',
    wardId: 'W-084',
    wardName: 'Hadapsar & Magarpatta Industrial Corridor',
    title: 'CRITICAL LST ANOMALY (+5.2°C)',
    description: 'Landsat-9 thermal pass detected 38.0°C mean surface temp. MSEDCL Hadapsar Substation operating at 91% thermal load rating.',
    severity: 'critical',
    type: 'heatwave',
    actionableText: 'Deploy cool roof intervention & issue grid load shedding advisory.'
  },
  {
    id: 'alt-02',
    timestamp: '10:45 IST (35m ago)',
    wardId: 'W-112',
    wardName: 'Shivajinagar & Old City Core (FC Road)',
    title: 'Vulnerable Population Exposure Warning',
    description: 'Market street wet-bulb globe temperature (WBGT) crossed 31.5°C threshold. High outdoor heat exhaustion risk.',
    severity: 'high',
    type: 'heatwave',
    actionableText: 'Activate emergency hydration kiosks & street shade canopies.'
  },
  {
    id: 'alt-03',
    timestamp: '09:30 IST (1h 50m ago)',
    wardId: 'W-150',
    wardName: 'Kharadi & Viman Nagar IT Corridor',
    title: 'High Cooling ROI Opportunity Detected',
    description: 'Roof inventory scan identified 115,000 sq.ft dark roof space. Cool roof coating yields high cooling impact per ₹.',
    severity: 'moderate',
    type: 'high_roi',
    actionableText: 'Initiate municipal rebate scheme for commercial building owners.'
  },
  {
    id: 'alt-04',
    timestamp: '08:15 IST (3h 05m ago)',
    title: 'Sentinel-2C Orbit Processing Complete',
    description: 'NDVI vegetation indices re-indexed across Pune municipal area. Mean city canopy index measured at 0.24.',
    severity: 'safe',
    type: 'telemetry',
    actionableText: 'Telemetry nominal.'
  }
];

// Scenario Optimizer Calculation Engine
export function runScenarioOptimizer(params) {
  const { treeCanopyIncreasePct = 15, coolRoofCoveragePct = 35, reflectivePavementAreaPct = 20, budgetInrLakhs = 250 } = params;

  const rawCoolingDegC = 
    (treeCanopyIncreasePct * 0.06) +
    (coolRoofCoveragePct * 0.035) +
    (reflectivePavementAreaPct * 0.025);

  const budgetFactor = Math.min(1.0, budgetInrLakhs / 300);
  const projectedTempReductionDegC = Number((rawCoolingDegC * (0.4 + 0.6 * budgetFactor)).toFixed(2));
  const coolingPerLakh = budgetInrLakhs > 0 ? (projectedTempReductionDegC / (budgetInrLakhs / 10)) : 0;

  const estimatedCo2 = Math.round(projectedTempReductionDegC * 420);
  const vulnerablePop = Math.round(projectedTempReductionDegC * 18500);
  const powerSavedMw = Number((projectedTempReductionDegC * 6.4).toFixed(1));

  return {
    projectedTempReductionDegC: Math.max(0.1, projectedTempReductionDegC),
    projectedCoolingPerLakhInr: Number(coolingPerLakh.toFixed(3)),
    estimatedCo2ReductionTons: estimatedCo2,
    vulnerablePopProtected: vulnerablePop,
    gridPowerSavedMw: powerSavedMw,
    optimizedWards: [
      {
        wardId: 'W-084',
        wardName: 'Hadapsar & Magarpatta Industrial Corridor',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.45),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.42).toFixed(2)),
        recommendedIntervention: 'Cool Roof Coating + Miyawaki Canopy'
      },
      {
        wardId: 'W-112',
        wardName: 'Shivajinagar & Old City Core (FC Road)',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.35),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.34).toFixed(2)),
        recommendedIntervention: 'Reflective Pedestrian Pavement'
      },
      {
        wardId: 'W-150',
        wardName: 'Kharadi & Viman Nagar IT Corridor',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.20),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.24).toFixed(2)),
        recommendedIntervention: 'Building Envelope Albedo Retrofit'
      }
    ]
  };
}

// Generate fallback GeoJSON FeatureCollection for Pune when backend API is offline
export function getMockPuneGeoJSON() {
  return {
    type: "FeatureCollection",
    features: MOCK_WARDS.map((ward, idx) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ward.polygon]
      },
      properties: {
        zone_id: ward.id,
        name: ward.name,
        zone: ward.zone,
        lst: ward.currentLst,
        ndvi: ward.ndviIndex,
        ndbi: Number((0.4 - ward.ndviIndex * 0.5).toFixed(2)),
        population: ward.population,
        vulnerable_pop_pct: ward.vulnerablePopPct,
        anomaly: ward.lstAnomaly,
        risk_severity: ward.riskSeverity
      }
    }))
  };
}
