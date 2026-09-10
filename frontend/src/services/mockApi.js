// Satellite Passes Timeline (Historical revisits)
export const MOCK_SATELLITE_PASSES = [
  {
    id: 'PASS-2026-0728-1410',
    satellite: 'ECOSTRESS (ISS Orbit)',
    sensor: 'Thermal Infrared Radiometer',
    timestamp: '2026-07-28 14:10 IST',
    orbitNumber: 'ORB-84912',
    resolutionMeters: 70,
    meanCityLst: 36.8,
    maxLstRecorded: 42.4,
    status: 'REALTIME',
  },
  {
    id: 'PASS-2026-0726-1030',
    satellite: 'Landsat-9',
    sensor: 'TIRS-2 Dual-Band Thermal',
    timestamp: '2026-07-26 10:30 IST',
    orbitNumber: 'L9-14208',
    resolutionMeters: 100,
    meanCityLst: 35.4,
    maxLstRecorded: 40.1,
    status: 'PROCESSED',
  },
  {
    id: 'PASS-2026-0724-1115',
    satellite: 'Sentinel-2C',
    sensor: 'MSI High-Res Vegetation',
    timestamp: '2026-07-24 11:15 IST',
    orbitNumber: 'S2C-38910',
    resolutionMeters: 10,
    meanCityLst: 34.2,
    maxLstRecorded: 38.9,
    status: 'QUALIFIED',
  },
  {
    id: 'PASS-2026-0720-1405',
    satellite: 'ECOSTRESS (ISS Orbit)',
    sensor: 'Thermal Infrared Radiometer',
    timestamp: '2026-07-20 14:05 IST',
    orbitNumber: 'ORB-84799',
    resolutionMeters: 70,
    meanCityLst: 33.6,
    maxLstRecorded: 37.8,
    status: 'QUALIFIED',
  },
  {
    id: 'PASS-2026-0715-1035',
    satellite: 'Landsat-8',
    sensor: 'TIRS Thermal Sensor',
    timestamp: '2026-07-15 10:35 IST',
    orbitNumber: 'L8-98421',
    resolutionMeters: 100,
    meanCityLst: 32.8,
    maxLstRecorded: 36.5,
    status: 'QUALIFIED',
  }
];

// Wards Dataset with GeoJSON Polygons & LST anomalies
export const MOCK_WARDS = [
  {
    id: 'W-084',
    name: 'Peenya Industrial Area',
    zone: 'North-West Industrial Zone',
    city: 'Bengaluru',
    areaSqKm: 6.4,
    population: 142000,
    lstAnomaly: 5.6,
    baselineTemp: 33.2,
    currentLst: 38.8,
    ndviIndex: 0.08,
    gridLoadMw: 84.5,
    vulnerablePopPct: 48,
    topDriver: 'Low Canopy & Industrial Waste Heat',
    riskNote: 'Transformer overload critical. High worker exposure.',
    riskSeverity: 'critical',
    center: [13.0315, 77.5185],
    polygon: [
      [13.0450, 77.5050],
      [13.0460, 77.5300],
      [13.0220, 77.5320],
      [13.0180, 77.5100],
      [13.0300, 77.5020]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': 5.6,
      'PASS-2026-0726-1030': 4.8,
      'PASS-2026-0724-1115': 3.9,
      'PASS-2026-0720-1405': 3.5,
      'PASS-2026-0715-1035': 2.9,
    }
  },
  {
    id: 'W-112',
    name: 'Shivajinagar Commercial',
    zone: 'Central Business District',
    city: 'Bengaluru',
    areaSqKm: 3.8,
    population: 185000,
    lstAnomaly: 4.8,
    baselineTemp: 33.2,
    currentLst: 38.0,
    ndviIndex: 0.11,
    gridLoadMw: 62.0,
    vulnerablePopPct: 54,
    topDriver: 'High Concrete Albedo & Traffic Thermal Plume',
    riskNote: 'Severe urban canyon heat trapping in market streets.',
    riskSeverity: 'critical',
    center: [12.9850, 77.6000],
    polygon: [
      [12.9940, 77.5900],
      [12.9960, 77.6100],
      [12.9760, 77.6120],
      [12.9740, 77.5920]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': 4.8,
      'PASS-2026-0726-1030': 4.2,
      'PASS-2026-0724-1115': 3.6,
      'PASS-2026-0720-1405': 3.1,
      'PASS-2026-0715-1035': 2.5,
    }
  },
  {
    id: 'W-150',
    name: 'Bellandur Tech Corridor',
    zone: 'East IT Corridor',
    city: 'Bengaluru',
    areaSqKm: 8.2,
    population: 210000,
    lstAnomaly: 3.9,
    baselineTemp: 33.2,
    currentLst: 37.1,
    ndviIndex: 0.16,
    gridLoadMw: 98.2,
    vulnerablePopPct: 32,
    topDriver: 'Glass Facade Reflection & HVAC Heat Exhaust',
    riskNote: 'High peak AC load strain during 12:00–16:00 peak hours.',
    riskSeverity: 'high',
    center: [12.9300, 77.6750],
    polygon: [
      [12.9450, 77.6550],
      [12.9480, 77.6950],
      [12.9150, 77.6920],
      [12.9120, 77.6600]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': 3.9,
      'PASS-2026-0726-1030': 3.4,
      'PASS-2026-0724-1115': 3.0,
      'PASS-2026-0720-1405': 2.6,
      'PASS-2026-0715-1035': 2.1,
    }
  },
  {
    id: 'W-174',
    name: 'Electronic City Phase 1',
    zone: 'South Electronics Zone',
    city: 'Bengaluru',
    areaSqKm: 9.5,
    population: 165000,
    lstAnomaly: 3.5,
    baselineTemp: 33.2,
    currentLst: 36.7,
    ndviIndex: 0.22,
    gridLoadMw: 110.4,
    vulnerablePopPct: 24,
    topDriver: 'Expansive Bituminous Parking Surface',
    riskNote: 'Expansive blacktop parking lots elevate local microclimate.',
    riskSeverity: 'high',
    center: [12.8450, 77.6650],
    polygon: [
      [12.8600, 77.6450],
      [12.8620, 77.6850],
      [12.8300, 77.6820],
      [12.8280, 77.6500]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': 3.5,
      'PASS-2026-0726-1030': 3.0,
      'PASS-2026-0724-1115': 2.7,
      'PASS-2026-0720-1405': 2.2,
      'PASS-2026-0715-1035': 1.8,
    }
  },
  {
    id: 'W-032',
    name: 'Malleswaram Heritage',
    zone: 'West Residential Zone',
    city: 'Bengaluru',
    areaSqKm: 4.2,
    population: 130000,
    lstAnomaly: 1.8,
    baselineTemp: 33.2,
    currentLst: 35.0,
    ndviIndex: 0.38,
    gridLoadMw: 44.0,
    vulnerablePopPct: 40,
    topDriver: 'Avenue Canopy Buffer Effect',
    riskNote: 'Moderate heat stress; canopy buffer reduces peak heat.',
    riskSeverity: 'moderate',
    center: [13.0050, 77.5700],
    polygon: [
      [13.0180, 77.5600],
      [13.0200, 77.5800],
      [12.9920, 77.5820],
      [12.9900, 77.5620]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': 1.8,
      'PASS-2026-0726-1030': 1.5,
      'PASS-2026-0724-1115': 1.3,
      'PASS-2026-0720-1405': 1.1,
      'PASS-2026-0715-1035': 0.9,
    }
  },
  {
    id: 'W-008',
    name: 'Cubbon Park Ecosystem',
    zone: 'Central Green Reserve',
    city: 'Bengaluru',
    areaSqKm: 1.8,
    population: 4500,
    lstAnomaly: -0.8,
    baselineTemp: 33.2,
    currentLst: 32.4,
    ndviIndex: 0.74,
    gridLoadMw: 8.5,
    vulnerablePopPct: 10,
    topDriver: 'Active Evapotranspiration Oasis',
    riskNote: 'Urban cooling sink; provides 2.2°C cooling buffer to adjacent wards.',
    riskSeverity: 'safe',
    center: [12.9760, 77.5920],
    polygon: [
      [12.9820, 77.5880],
      [12.9840, 77.5980],
      [12.9680, 77.5960],
      [12.9660, 77.5860]
    ],
    historyByPass: {
      'PASS-2026-0728-1410': -0.8,
      'PASS-2026-0726-1030': -0.9,
      'PASS-2026-0724-1115': -1.1,
      'PASS-2026-0720-1405': -1.2,
      'PASS-2026-0715-1035': -1.4,
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
      description: 'Corrugated iron/asbestos industrial roofing absorbing >85% incident solar flux.',
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
      driverName: 'Industrial Heat Exhaust & Diesel Generators',
      contributionPct: 16,
      confidenceBand: [13, 19],
      category: 'anthropogenic',
      description: 'Heavy machinery, smelting, and generator exhausts adding sensible flux.',
      physicsEq: 'QF = Q_industry + Q_generator'
    },
    {
      id: 'drv-4',
      driverName: 'Heavy Commercial Transport Canyon',
      contributionPct: 9,
      confidenceBand: [7, 11],
      category: 'anthropogenic',
      description: 'High truck volume emitting direct thermal convective plumes.',
      physicsEq: 'H = ρ cp (Ts - Ta) / ra'
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
    description: 'Vehicular traffic and building air conditioning heat rejection.',
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

// Live Thermal Alerts Feed
export const MOCK_ALERTS = [
  {
    id: 'alt-01',
    timestamp: '14:12 IST (12m ago)',
    wardId: 'W-084',
    wardName: 'Peenya Industrial Area',
    title: 'CRITICAL LST ANOMALY (+5.6°C)',
    description: 'ECOSTRESS pass detected 42.4°C peak surface temp. DISCOM Substation #4 operating at 94% thermal load rating.',
    severity: 'critical',
    type: 'heatwave',
    actionableText: 'Deploy cool roof intervention & issue grid load shedding advisory.'
  },
  {
    id: 'alt-02',
    timestamp: '13:45 IST (39m ago)',
    wardId: 'W-112',
    wardName: 'Shivajinagar Commercial',
    title: 'Vulnerable Population Exposure Warning',
    description: 'Market street wet-bulb globe temperature (WBGT) crossed 31.8°C threshold. High risk of outdoor heat exhaustion.',
    severity: 'high',
    type: 'heatwave',
    actionableText: 'Activate emergency hydration kiosks & street shade canopies.'
  },
  {
    id: 'alt-03',
    timestamp: '12:30 IST (1h 54m ago)',
    wardId: 'W-150',
    wardName: 'Bellandur Tech Corridor',
    title: 'High Cooling ROI Opportunity Detected',
    description: 'Roof inventory scan identified 120,000 sq.ft dark roof space. Cool roof coating yields high cooling impact per ₹.',
    severity: 'moderate',
    type: 'high_roi',
    actionableText: 'Initiate municipal rebate scheme for commercial building owners.'
  },
  {
    id: 'alt-04',
    timestamp: '11:15 IST (3h 09m ago)',
    title: 'Sentinel-2C Orbit Processing Complete',
    description: 'NDVI vegetation indices re-indexed across all wards. Mean canopy index unchanged at 0.25.',
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
        wardName: 'Peenya Industrial Area',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.45),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.42).toFixed(2)),
        recommendedIntervention: 'Cool Roof Coating + Miyawaki Canopy'
      },
      {
        wardId: 'W-112',
        wardName: 'Shivajinagar Commercial',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.35),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.34).toFixed(2)),
        recommendedIntervention: 'Reflective Pedestrian Pavement'
      },
      {
        wardId: 'W-150',
        wardName: 'Bellandur Tech Corridor',
        allocatedBudgetLakhs: Math.round(budgetInrLakhs * 0.20),
        expectedCoolingDegC: Number((projectedTempReductionDegC * 0.24).toFixed(2)),
        recommendedIntervention: 'Building Envelope Albedo Retrofit'
      }
    ]
  };
}
