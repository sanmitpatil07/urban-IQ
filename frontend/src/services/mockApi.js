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
    "id": "W-100",
    "name": "Shivajinagar Core Ward",
    "zone": "Central Core",
    "city": "Pune",
    "areaSqKm": 7.44,
    "population": 142000,
    "lstAnomaly": 3.8,
    "baselineTemp": 33.0,
    "currentLst": 36.8,
    "ndviIndex": 0.14,
    "gridLoadMw": 78,
    "vulnerablePopPct": 38,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +3.8\u00b0C with 38% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.5308,
      73.8474
    ],
    "polygon": [
      [
        73.84668,
        18.52211
      ],
      [
        73.82249,
        18.53799
      ],
      [
        73.82706,
        18.54449
      ],
      [
        73.83033,
        18.54567
      ],
      [
        73.85498,
        18.54677
      ],
      [
        73.86103,
        18.53348
      ],
      [
        73.86087,
        18.53166
      ],
      [
        73.84668,
        18.52211
      ]
    ]
  },
  {
    "id": "W-101",
    "name": "FC Road & Deccan Ward",
    "zone": "Commercial Core",
    "city": "Pune",
    "areaSqKm": 4.95,
    "population": 98000,
    "lstAnomaly": 3.2,
    "baselineTemp": 33.0,
    "currentLst": 36.2,
    "ndviIndex": 0.16,
    "gridLoadMw": 65,
    "vulnerablePopPct": 32,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.2\u00b0C with 32% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.518,
      73.839
    ],
    "polygon": [
      [
        73.82197,
        18.52996
      ],
      [
        73.82129,
        18.53706
      ],
      [
        73.82249,
        18.53799
      ],
      [
        73.84668,
        18.52211
      ],
      [
        73.84791,
        18.50907
      ],
      [
        73.84472,
        18.5054
      ],
      [
        73.84115,
        18.50413
      ],
      [
        73.82197,
        18.52996
      ]
    ]
  },
  {
    "id": "W-102",
    "name": "Kasba & Shaniwar Peth Ward",
    "zone": "Heritage Old City",
    "city": "Pune",
    "areaSqKm": 3.84,
    "population": 115000,
    "lstAnomaly": 4.4,
    "baselineTemp": 33.0,
    "currentLst": 37.4,
    "ndviIndex": 0.08,
    "gridLoadMw": 70,
    "vulnerablePopPct": 44,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.4\u00b0C with 44% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.5195,
      73.855
    ],
    "polygon": [
      [
        73.8674,
        18.51787
      ],
      [
        73.8661,
        18.5121
      ],
      [
        73.84791,
        18.50907
      ],
      [
        73.84668,
        18.52211
      ],
      [
        73.86087,
        18.53166
      ],
      [
        73.8674,
        18.51787
      ]
    ]
  },
  {
    "id": "W-103",
    "name": "Kothrud North Ward",
    "zone": "West Residential",
    "city": "Pune",
    "areaSqKm": 8.19,
    "population": 120000,
    "lstAnomaly": 1.2,
    "baselineTemp": 33.0,
    "currentLst": 34.2,
    "ndviIndex": 0.28,
    "gridLoadMw": 52,
    "vulnerablePopPct": 20,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.2\u00b0C with 20% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.515,
      73.8075
    ],
    "polygon": [
      [
        73.82197,
        18.52996
      ],
      [
        73.81678,
        18.50725
      ],
      [
        73.79057,
        18.50494
      ],
      [
        73.78947,
        18.51611
      ],
      [
        73.81512,
        18.53704
      ],
      [
        73.82129,
        18.53706
      ],
      [
        73.82197,
        18.52996
      ]
    ]
  },
  {
    "id": "W-104",
    "name": "Kothrud South Ward",
    "zone": "West Residential",
    "city": "Pune",
    "areaSqKm": 4.7,
    "population": 95000,
    "lstAnomaly": 0.9,
    "baselineTemp": 33.0,
    "currentLst": 33.9,
    "ndviIndex": 0.3,
    "gridLoadMw": 48,
    "vulnerablePopPct": 18,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.9\u00b0C with 18% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.498,
      73.809
    ],
    "polygon": [
      [
        73.80627,
        18.48627
      ],
      [
        73.7892,
        18.5012
      ],
      [
        73.79057,
        18.50494
      ],
      [
        73.81678,
        18.50725
      ],
      [
        73.82081,
        18.50081
      ],
      [
        73.80627,
        18.48627
      ]
    ]
  },
  {
    "id": "W-105",
    "name": "Karve Nagar Ward",
    "zone": "Southwest Core",
    "city": "Pune",
    "areaSqKm": 4.96,
    "population": 82000,
    "lstAnomaly": 1.5,
    "baselineTemp": 33.0,
    "currentLst": 34.5,
    "ndviIndex": 0.24,
    "gridLoadMw": 46,
    "vulnerablePopPct": 22,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.5\u00b0C with 22% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.489,
      73.818
    ],
    "polygon": [
      [
        73.80627,
        18.48627
      ],
      [
        73.82081,
        18.50081
      ],
      [
        73.83266,
        18.49494
      ],
      [
        73.8336,
        18.48548
      ],
      [
        73.80952,
        18.47557
      ],
      [
        73.80627,
        18.48627
      ]
    ]
  },
  {
    "id": "W-106",
    "name": "Erandwane & Law College Ward",
    "zone": "Educational Green",
    "city": "Pune",
    "areaSqKm": 5.38,
    "population": 72000,
    "lstAnomaly": 0.5,
    "baselineTemp": 33.0,
    "currentLst": 33.5,
    "ndviIndex": 0.32,
    "gridLoadMw": 40,
    "vulnerablePopPct": 16,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.5\u00b0C with 16% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.5102,
      73.8285
    ],
    "polygon": [
      [
        73.83266,
        18.49494
      ],
      [
        73.82081,
        18.50081
      ],
      [
        73.81678,
        18.50725
      ],
      [
        73.82197,
        18.52996
      ],
      [
        73.84115,
        18.50413
      ],
      [
        73.83266,
        18.49494
      ]
    ]
  },
  {
    "id": "W-107",
    "name": "Baner Ward",
    "zone": "Northwest Hub",
    "city": "Pune",
    "areaSqKm": 8.97,
    "population": 88000,
    "lstAnomaly": 1.8,
    "baselineTemp": 33.0,
    "currentLst": 34.8,
    "ndviIndex": 0.26,
    "gridLoadMw": 48,
    "vulnerablePopPct": 18,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.8\u00b0C with 18% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.559,
      73.7867
    ],
    "polygon": [
      [
        73.76184,
        18.54067
      ],
      [
        73.75659,
        18.54229
      ],
      [
        73.797,
        18.58177
      ],
      [
        73.797,
        18.54812
      ],
      [
        73.76184,
        18.54067
      ]
    ]
  },
  {
    "id": "W-108",
    "name": "Balewadi High St Ward",
    "zone": "Commercial NW",
    "city": "Pune",
    "areaSqKm": 16.87,
    "population": 76000,
    "lstAnomaly": 2.1,
    "baselineTemp": 33.0,
    "currentLst": 35.1,
    "ndviIndex": 0.21,
    "gridLoadMw": 50,
    "vulnerablePopPct": 20,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.1\u00b0C with 20% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.572,
      73.774
    ],
    "polygon": [
      [
        73.75659,
        18.54229
      ],
      [
        73.74,
        18.54284
      ],
      [
        73.74,
        18.559
      ],
      [
        73.79546,
        18.6006
      ],
      [
        73.7984,
        18.58534
      ],
      [
        73.797,
        18.58177
      ],
      [
        73.75659,
        18.54229
      ]
    ]
  },
  {
    "id": "W-109",
    "name": "Aundh Ward",
    "zone": "Residential North",
    "city": "Pune",
    "areaSqKm": 11.36,
    "population": 98000,
    "lstAnomaly": 1.9,
    "baselineTemp": 33.0,
    "currentLst": 34.9,
    "ndviIndex": 0.24,
    "gridLoadMw": 54,
    "vulnerablePopPct": 19,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.9\u00b0C with 19% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.559,
      73.8073
    ],
    "polygon": [
      [
        73.82129,
        18.53706
      ],
      [
        73.81512,
        18.53704
      ],
      [
        73.797,
        18.54812
      ],
      [
        73.797,
        18.58177
      ],
      [
        73.7984,
        18.58534
      ],
      [
        73.81891,
        18.56866
      ],
      [
        73.82706,
        18.54449
      ],
      [
        73.82129,
        18.53706
      ]
    ]
  },
  {
    "id": "W-110",
    "name": "Pashan & Lake Zone Ward",
    "zone": "Eco Buffer",
    "city": "Pune",
    "areaSqKm": 10.67,
    "population": 62000,
    "lstAnomaly": 0.2,
    "baselineTemp": 33.0,
    "currentLst": 33.2,
    "ndviIndex": 0.36,
    "gridLoadMw": 38,
    "vulnerablePopPct": 15,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.2\u00b0C with 15% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.534,
      73.792
    ],
    "polygon": [
      [
        73.78947,
        18.51611
      ],
      [
        73.76184,
        18.54067
      ],
      [
        73.797,
        18.54812
      ],
      [
        73.81512,
        18.53704
      ],
      [
        73.78947,
        18.51611
      ]
    ]
  },
  {
    "id": "W-111",
    "name": "Bavdhan Ward",
    "zone": "Hilly West",
    "city": "Pune",
    "areaSqKm": 32.04,
    "population": 54000,
    "lstAnomaly": -0.2,
    "baselineTemp": 33.0,
    "currentLst": 32.8,
    "ndviIndex": 0.38,
    "gridLoadMw": 34,
    "vulnerablePopPct": 14,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +-0.2\u00b0C with 14% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.5115,
      73.772
    ],
    "polygon": [
      [
        73.75659,
        18.54229
      ],
      [
        73.76184,
        18.54067
      ],
      [
        73.78947,
        18.51611
      ],
      [
        73.79057,
        18.50494
      ],
      [
        73.7892,
        18.5012
      ],
      [
        73.74,
        18.46283
      ],
      [
        73.74,
        18.54284
      ],
      [
        73.75659,
        18.54229
      ]
    ]
  },
  {
    "id": "W-112",
    "name": "Warje Ward",
    "zone": "Riverfront SW",
    "city": "Pune",
    "areaSqKm": 19.95,
    "population": 85000,
    "lstAnomaly": 1.5,
    "baselineTemp": 33.0,
    "currentLst": 34.5,
    "ndviIndex": 0.22,
    "gridLoadMw": 46,
    "vulnerablePopPct": 22,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.5\u00b0C with 22% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.482,
      73.795
    ],
    "polygon": [
      [
        73.7892,
        18.5012
      ],
      [
        73.80627,
        18.48627
      ],
      [
        73.80952,
        18.47557
      ],
      [
        73.80736,
        18.46907
      ],
      [
        73.74,
        18.45335
      ],
      [
        73.74,
        18.46283
      ],
      [
        73.7892,
        18.5012
      ]
    ]
  },
  {
    "id": "W-113",
    "name": "Dhayari Ward",
    "zone": "Southwest Fringe",
    "city": "Pune",
    "areaSqKm": 39.54,
    "population": 68000,
    "lstAnomaly": 0.6,
    "baselineTemp": 33.0,
    "currentLst": 33.6,
    "ndviIndex": 0.31,
    "gridLoadMw": 38,
    "vulnerablePopPct": 19,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.6\u00b0C with 19% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.452,
      73.802
    ],
    "polygon": [
      [
        73.80736,
        18.46907
      ],
      [
        73.82158,
        18.4527
      ],
      [
        73.8125,
        18.42
      ],
      [
        73.74,
        18.42
      ],
      [
        73.74,
        18.45335
      ],
      [
        73.80736,
        18.46907
      ]
    ]
  },
  {
    "id": "W-114",
    "name": "Sinhagad Road & Hingne Ward",
    "zone": "SW Linear Corridor",
    "city": "Pune",
    "areaSqKm": 8.65,
    "population": 89000,
    "lstAnomaly": 1.8,
    "baselineTemp": 33.0,
    "currentLst": 34.8,
    "ndviIndex": 0.23,
    "gridLoadMw": 50,
    "vulnerablePopPct": 24,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.8\u00b0C with 24% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.472,
      73.825
    ],
    "polygon": [
      [
        73.83712,
        18.45943
      ],
      [
        73.82158,
        18.4527
      ],
      [
        73.80736,
        18.46907
      ],
      [
        73.80952,
        18.47557
      ],
      [
        73.8336,
        18.48548
      ],
      [
        73.83823,
        18.48011
      ],
      [
        73.84113,
        18.46628
      ],
      [
        73.83712,
        18.45943
      ]
    ]
  },
  {
    "id": "W-115",
    "name": "Parvati & Sahakar Nagar Ward",
    "zone": "Central South",
    "city": "Pune",
    "areaSqKm": 5.0,
    "population": 78000,
    "lstAnomaly": 1.2,
    "baselineTemp": 33.0,
    "currentLst": 34.2,
    "ndviIndex": 0.28,
    "gridLoadMw": 44,
    "vulnerablePopPct": 20,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.2\u00b0C with 20% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.492,
      73.8482
    ],
    "polygon": [
      [
        73.83823,
        18.48011
      ],
      [
        73.8336,
        18.48548
      ],
      [
        73.83266,
        18.49494
      ],
      [
        73.84115,
        18.50413
      ],
      [
        73.84472,
        18.5054
      ],
      [
        73.86079,
        18.48882
      ],
      [
        73.83823,
        18.48011
      ]
    ]
  },
  {
    "id": "W-116",
    "name": "Swargate Transit Hub Ward",
    "zone": "High Density Node",
    "city": "Pune",
    "areaSqKm": 5.32,
    "population": 134000,
    "lstAnomaly": 4.6,
    "baselineTemp": 33.0,
    "currentLst": 37.6,
    "ndviIndex": 0.09,
    "gridLoadMw": 84,
    "vulnerablePopPct": 42,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.6\u00b0C with 42% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.5015,
      73.858
    ],
    "polygon": [
      [
        73.86079,
        18.48882
      ],
      [
        73.84472,
        18.5054
      ],
      [
        73.84791,
        18.50907
      ],
      [
        73.8661,
        18.5121
      ],
      [
        73.87467,
        18.4975
      ],
      [
        73.86671,
        18.48771
      ],
      [
        73.86079,
        18.48882
      ]
    ]
  },
  {
    "id": "W-117",
    "name": "Bibwewadi Ward",
    "zone": "South Core",
    "city": "Pune",
    "areaSqKm": 6.72,
    "population": 118000,
    "lstAnomaly": 2.9,
    "baselineTemp": 33.0,
    "currentLst": 35.9,
    "ndviIndex": 0.15,
    "gridLoadMw": 64,
    "vulnerablePopPct": 32,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.9\u00b0C with 32% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.478,
      73.8536
    ],
    "polygon": [
      [
        73.86966,
        18.46678
      ],
      [
        73.84113,
        18.46628
      ],
      [
        73.83823,
        18.48011
      ],
      [
        73.86079,
        18.48882
      ],
      [
        73.86671,
        18.48771
      ],
      [
        73.86966,
        18.46678
      ]
    ]
  },
  {
    "id": "W-118",
    "name": "Dhankawadi Ward",
    "zone": "South Corridor",
    "city": "Pune",
    "areaSqKm": 5.49,
    "population": 102000,
    "lstAnomaly": 2.4,
    "baselineTemp": 33.0,
    "currentLst": 35.4,
    "ndviIndex": 0.17,
    "gridLoadMw": 58,
    "vulnerablePopPct": 30,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.4\u00b0C with 30% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.455,
      73.854
    ],
    "polygon": [
      [
        73.86966,
        18.46678
      ],
      [
        73.85186,
        18.44129
      ],
      [
        73.83712,
        18.45943
      ],
      [
        73.84113,
        18.46628
      ],
      [
        73.86966,
        18.46678
      ]
    ]
  },
  {
    "id": "W-119",
    "name": "Katraj & Zoo Environs Ward",
    "zone": "South Basin",
    "city": "Pune",
    "areaSqKm": 14.61,
    "population": 92000,
    "lstAnomaly": 1.8,
    "baselineTemp": 33.0,
    "currentLst": 34.8,
    "ndviIndex": 0.26,
    "gridLoadMw": 50,
    "vulnerablePopPct": 25,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.8\u00b0C with 25% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.448,
      73.864
    ],
    "polygon": [
      [
        73.8893,
        18.42868
      ],
      [
        73.88984,
        18.42
      ],
      [
        73.85677,
        18.42
      ],
      [
        73.85186,
        18.44129
      ],
      [
        73.86968,
        18.46676
      ],
      [
        73.87582,
        18.46351
      ],
      [
        73.8893,
        18.42868
      ]
    ]
  },
  {
    "id": "W-120",
    "name": "Ambegaon Ward",
    "zone": "South Valley",
    "city": "Pune",
    "areaSqKm": 14.89,
    "population": 58000,
    "lstAnomaly": 0.5,
    "baselineTemp": 33.0,
    "currentLst": 33.5,
    "ndviIndex": 0.33,
    "gridLoadMw": 36,
    "vulnerablePopPct": 18,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.5\u00b0C with 18% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.442,
      73.838
    ],
    "polygon": [
      [
        73.82158,
        18.4527
      ],
      [
        73.83712,
        18.45943
      ],
      [
        73.85186,
        18.44129
      ],
      [
        73.85677,
        18.42
      ],
      [
        73.8125,
        18.42
      ],
      [
        73.82158,
        18.4527
      ]
    ]
  },
  {
    "id": "W-121",
    "name": "Kondhwa Khurd Ward",
    "zone": "Southeast Dense",
    "city": "Pune",
    "areaSqKm": 7.62,
    "population": 128000,
    "lstAnomaly": 3.5,
    "baselineTemp": 33.0,
    "currentLst": 36.5,
    "ndviIndex": 0.12,
    "gridLoadMw": 72,
    "vulnerablePopPct": 38,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.5\u00b0C with 38% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.482,
      73.882
    ],
    "polygon": [
      [
        73.87467,
        18.4975
      ],
      [
        73.88333,
        18.49823
      ],
      [
        73.89369,
        18.47406
      ],
      [
        73.87582,
        18.46351
      ],
      [
        73.86966,
        18.46678
      ],
      [
        73.86671,
        18.48771
      ],
      [
        73.87467,
        18.4975
      ]
    ]
  },
  {
    "id": "W-122",
    "name": "Kondhwa Budruk Ward",
    "zone": "Southeast Fringe",
    "city": "Pune",
    "areaSqKm": 10.12,
    "population": 96000,
    "lstAnomaly": 2.8,
    "baselineTemp": 33.0,
    "currentLst": 35.8,
    "ndviIndex": 0.15,
    "gridLoadMw": 56,
    "vulnerablePopPct": 32,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.8\u00b0C with 32% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.46,
      73.895
    ],
    "polygon": [
      [
        73.89369,
        18.47406
      ],
      [
        73.91296,
        18.47338
      ],
      [
        73.8893,
        18.42868
      ],
      [
        73.87582,
        18.46351
      ],
      [
        73.89369,
        18.47406
      ]
    ]
  },
  {
    "id": "W-123",
    "name": "Undri Ward",
    "zone": "Developing SE",
    "city": "Pune",
    "areaSqKm": 26.96,
    "population": 74000,
    "lstAnomaly": 2.2,
    "baselineTemp": 33.0,
    "currentLst": 35.2,
    "ndviIndex": 0.19,
    "gridLoadMw": 46,
    "vulnerablePopPct": 24,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.2\u00b0C with 24% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.451,
      73.912
    ],
    "polygon": [
      [
        73.91533,
        18.4744
      ],
      [
        73.92259,
        18.47409
      ],
      [
        73.95715,
        18.42
      ],
      [
        73.88984,
        18.42
      ],
      [
        73.8893,
        18.42868
      ],
      [
        73.91296,
        18.47338
      ],
      [
        73.91533,
        18.4744
      ]
    ]
  },
  {
    "id": "W-124",
    "name": "Wanowrie & Salunke Vihar Ward",
    "zone": "South Cantonment",
    "city": "Pune",
    "areaSqKm": 7.16,
    "population": 94000,
    "lstAnomaly": 1.9,
    "baselineTemp": 33.0,
    "currentLst": 34.9,
    "ndviIndex": 0.22,
    "gridLoadMw": 56,
    "vulnerablePopPct": 24,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.9\u00b0C with 24% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.488,
      73.896
    ],
    "polygon": [
      [
        73.89716,
        18.50711
      ],
      [
        73.91533,
        18.4744
      ],
      [
        73.91296,
        18.47338
      ],
      [
        73.89369,
        18.47406
      ],
      [
        73.88333,
        18.49823
      ],
      [
        73.89716,
        18.50711
      ]
    ]
  },
  {
    "id": "W-125",
    "name": "Camp (Pune Cantonment) Ward",
    "zone": "Heritage Grid",
    "city": "Pune",
    "areaSqKm": 7.58,
    "population": 88000,
    "lstAnomaly": 1.1,
    "baselineTemp": 33.0,
    "currentLst": 34.1,
    "ndviIndex": 0.28,
    "gridLoadMw": 55,
    "vulnerablePopPct": 20,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.1\u00b0C with 20% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.514,
      73.8793
    ],
    "polygon": [
      [
        73.88717,
        18.52455
      ],
      [
        73.90114,
        18.51574
      ],
      [
        73.89716,
        18.50711
      ],
      [
        73.88333,
        18.49823
      ],
      [
        73.87467,
        18.4975
      ],
      [
        73.8661,
        18.5121
      ],
      [
        73.8674,
        18.51787
      ],
      [
        73.88717,
        18.52455
      ]
    ]
  },
  {
    "id": "W-126",
    "name": "Pune Railway Station Core Ward",
    "zone": "Transport Core",
    "city": "Pune",
    "areaSqKm": 2.84,
    "population": 112000,
    "lstAnomaly": 4.2,
    "baselineTemp": 33.0,
    "currentLst": 37.2,
    "ndviIndex": 0.09,
    "gridLoadMw": 78,
    "vulnerablePopPct": 40,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.2\u00b0C with 40% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.5285,
      73.874
    ],
    "polygon": [
      [
        73.86103,
        18.53348
      ],
      [
        73.87092,
        18.53494
      ],
      [
        73.88537,
        18.52444
      ],
      [
        73.8674,
        18.51787
      ],
      [
        73.86087,
        18.53166
      ],
      [
        73.86103,
        18.53348
      ]
    ]
  },
  {
    "id": "W-127",
    "name": "Sangamwadi & Bund Garden Ward",
    "zone": "River Confluence",
    "city": "Pune",
    "areaSqKm": 4.62,
    "population": 68000,
    "lstAnomaly": 2.2,
    "baselineTemp": 33.0,
    "currentLst": 35.2,
    "ndviIndex": 0.2,
    "gridLoadMw": 48,
    "vulnerablePopPct": 22,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.2\u00b0C with 22% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.542,
      73.872
    ],
    "polygon": [
      [
        73.85498,
        18.54677
      ],
      [
        73.86447,
        18.55911
      ],
      [
        73.88129,
        18.54271
      ],
      [
        73.87092,
        18.53494
      ],
      [
        73.86103,
        18.53348
      ],
      [
        73.85498,
        18.54677
      ]
    ]
  },
  {
    "id": "W-128",
    "name": "Koregaon Park Ward",
    "zone": "Low Density Green",
    "city": "Pune",
    "areaSqKm": 5.98,
    "population": 54000,
    "lstAnomaly": 0.8,
    "baselineTemp": 33.0,
    "currentLst": 33.8,
    "ndviIndex": 0.34,
    "gridLoadMw": 40,
    "vulnerablePopPct": 15,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.8\u00b0C with 15% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.5362,
      73.8933
    ],
    "polygon": [
      [
        73.90038,
        18.54197
      ],
      [
        73.91036,
        18.52838
      ],
      [
        73.90427,
        18.51744
      ],
      [
        73.90114,
        18.51574
      ],
      [
        73.88717,
        18.52455
      ],
      [
        73.88466,
        18.54196
      ],
      [
        73.89017,
        18.5459
      ],
      [
        73.90038,
        18.54197
      ]
    ]
  },
  {
    "id": "W-129",
    "name": "Boat Club Road Ward",
    "zone": "River Enclave",
    "city": "Pune",
    "areaSqKm": 1.92,
    "population": 42000,
    "lstAnomaly": 0.6,
    "baselineTemp": 33.0,
    "currentLst": 33.6,
    "ndviIndex": 0.33,
    "gridLoadMw": 34,
    "vulnerablePopPct": 14,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.6\u00b0C with 14% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.534,
      73.878
    ],
    "polygon": [
      [
        73.88129,
        18.54271
      ],
      [
        73.88466,
        18.54196
      ],
      [
        73.88717,
        18.52455
      ],
      [
        73.88537,
        18.52444
      ],
      [
        73.87092,
        18.53494
      ],
      [
        73.88129,
        18.54271
      ]
    ]
  },
  {
    "id": "W-130",
    "name": "Yerawada West Ward",
    "zone": "North Dense",
    "city": "Pune",
    "areaSqKm": 4.25,
    "population": 124000,
    "lstAnomaly": 3.9,
    "baselineTemp": 33.0,
    "currentLst": 36.9,
    "ndviIndex": 0.11,
    "gridLoadMw": 70,
    "vulnerablePopPct": 42,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +3.9\u00b0C with 42% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.552,
      73.882
    ],
    "polygon": [
      [
        73.89017,
        18.5459
      ],
      [
        73.88466,
        18.54196
      ],
      [
        73.88129,
        18.54271
      ],
      [
        73.865,
        18.559
      ],
      [
        73.89125,
        18.56425
      ],
      [
        73.89017,
        18.5459
      ]
    ]
  },
  {
    "id": "W-131",
    "name": "Yerawada East Ward",
    "zone": "Industrial Mixed",
    "city": "Pune",
    "areaSqKm": 3.79,
    "population": 98000,
    "lstAnomaly": 3.4,
    "baselineTemp": 33.0,
    "currentLst": 36.4,
    "ndviIndex": 0.13,
    "gridLoadMw": 62,
    "vulnerablePopPct": 34,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.4\u00b0C with 34% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.551,
      73.899
    ],
    "polygon": [
      [
        73.89437,
        18.56737
      ],
      [
        73.90005,
        18.56755
      ],
      [
        73.90723,
        18.55739
      ],
      [
        73.90038,
        18.54197
      ],
      [
        73.89017,
        18.5459
      ],
      [
        73.89125,
        18.56425
      ],
      [
        73.89437,
        18.56737
      ]
    ]
  },
  {
    "id": "W-132",
    "name": "Kalyani Nagar Ward",
    "zone": "Residential East",
    "city": "Pune",
    "areaSqKm": 5.32,
    "population": 68000,
    "lstAnomaly": 1.5,
    "baselineTemp": 33.0,
    "currentLst": 34.5,
    "ndviIndex": 0.25,
    "gridLoadMw": 48,
    "vulnerablePopPct": 18,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.5\u00b0C with 18% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.547,
      73.908
    ],
    "polygon": [
      [
        73.9264,
        18.5478
      ],
      [
        73.9252,
        18.54324
      ],
      [
        73.91763,
        18.53289
      ],
      [
        73.91036,
        18.52838
      ],
      [
        73.90038,
        18.54197
      ],
      [
        73.90723,
        18.55739
      ],
      [
        73.9264,
        18.5478
      ]
    ]
  },
  {
    "id": "W-133",
    "name": "Viman Nagar Ward",
    "zone": "IT & Commercial",
    "city": "Pune",
    "areaSqKm": 7.23,
    "population": 82000,
    "lstAnomaly": 3.1,
    "baselineTemp": 33.0,
    "currentLst": 36.1,
    "ndviIndex": 0.16,
    "gridLoadMw": 58,
    "vulnerablePopPct": 24,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.1\u00b0C with 24% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.563,
      73.916
    ],
    "polygon": [
      [
        73.90705,
        18.57355
      ],
      [
        73.93702,
        18.57039
      ],
      [
        73.92992,
        18.55146
      ],
      [
        73.9264,
        18.5478
      ],
      [
        73.90723,
        18.55739
      ],
      [
        73.90005,
        18.56755
      ],
      [
        73.90705,
        18.57355
      ]
    ]
  },
  {
    "id": "W-134",
    "name": "Lohegaon & Airport Ward",
    "zone": "Airport Zone",
    "city": "Pune",
    "areaSqKm": 17.53,
    "population": 64000,
    "lstAnomaly": 3.0,
    "baselineTemp": 33.0,
    "currentLst": 36.0,
    "ndviIndex": 0.15,
    "gridLoadMw": 48,
    "vulnerablePopPct": 26,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.0\u00b0C with 26% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.582,
      73.918
    ],
    "polygon": [
      [
        73.9107,
        18.61
      ],
      [
        73.94908,
        18.61
      ],
      [
        73.94494,
        18.57806
      ],
      [
        73.93702,
        18.57039
      ],
      [
        73.90705,
        18.57355
      ],
      [
        73.9107,
        18.61
      ]
    ]
  },
  {
    "id": "W-135",
    "name": "Dhanori Ward",
    "zone": "North East",
    "city": "Pune",
    "areaSqKm": 13.91,
    "population": 72000,
    "lstAnomaly": 2.4,
    "baselineTemp": 33.0,
    "currentLst": 35.4,
    "ndviIndex": 0.18,
    "gridLoadMw": 50,
    "vulnerablePopPct": 26,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.4\u00b0C with 26% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.584,
      73.898
    ],
    "polygon": [
      [
        73.8688,
        18.61
      ],
      [
        73.9107,
        18.61
      ],
      [
        73.90705,
        18.57355
      ],
      [
        73.90005,
        18.56755
      ],
      [
        73.89437,
        18.56737
      ],
      [
        73.8688,
        18.61
      ]
    ]
  },
  {
    "id": "W-136",
    "name": "Vishrantwadi Ward",
    "zone": "North Node",
    "city": "Pune",
    "areaSqKm": 14.69,
    "population": 85000,
    "lstAnomaly": 2.5,
    "baselineTemp": 33.0,
    "currentLst": 35.5,
    "ndviIndex": 0.17,
    "gridLoadMw": 54,
    "vulnerablePopPct": 28,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.5\u00b0C with 28% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.572,
      73.878
    ],
    "polygon": [
      [
        73.865,
        18.559
      ],
      [
        73.85462,
        18.59062
      ],
      [
        73.85835,
        18.61
      ],
      [
        73.8688,
        18.61
      ],
      [
        73.89437,
        18.56737
      ],
      [
        73.89125,
        18.56425
      ],
      [
        73.865,
        18.559
      ]
    ]
  },
  {
    "id": "W-137",
    "name": "Khadki Cantonment Ward",
    "zone": "Military Green",
    "city": "Pune",
    "areaSqKm": 9.71,
    "population": 62000,
    "lstAnomaly": 0.9,
    "baselineTemp": 33.0,
    "currentLst": 33.9,
    "ndviIndex": 0.32,
    "gridLoadMw": 42,
    "vulnerablePopPct": 16,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +0.9\u00b0C with 16% vulnerable population.",
    "riskSeverity": "nominal",
    "center": [
      18.562,
      73.846
    ],
    "polygon": [
      [
        73.851,
        18.587
      ],
      [
        73.85462,
        18.59062
      ],
      [
        73.86447,
        18.55911
      ],
      [
        73.85498,
        18.54677
      ],
      [
        73.83033,
        18.54567
      ],
      [
        73.851,
        18.587
      ]
    ]
  },
  {
    "id": "W-138",
    "name": "Bopodi Ward",
    "zone": "North Corridor",
    "city": "Pune",
    "areaSqKm": 6.38,
    "population": 74000,
    "lstAnomaly": 2.8,
    "baselineTemp": 33.0,
    "currentLst": 35.8,
    "ndviIndex": 0.16,
    "gridLoadMw": 52,
    "vulnerablePopPct": 28,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.8\u00b0C with 28% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.568,
      73.834
    ],
    "polygon": [
      [
        73.81891,
        18.56866
      ],
      [
        73.851,
        18.587
      ],
      [
        73.83033,
        18.54567
      ],
      [
        73.82706,
        18.54449
      ],
      [
        73.81891,
        18.56866
      ]
    ]
  },
  {
    "id": "W-139",
    "name": "Dapodi & PCMC Border Ward",
    "zone": "Industrial North",
    "city": "Pune",
    "areaSqKm": 23.01,
    "population": 92000,
    "lstAnomaly": 4.0,
    "baselineTemp": 33.0,
    "currentLst": 37.0,
    "ndviIndex": 0.1,
    "gridLoadMw": 68,
    "vulnerablePopPct": 36,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.0\u00b0C with 36% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.582,
      73.826
    ],
    "polygon": [
      [
        73.79546,
        18.6006
      ],
      [
        73.79634,
        18.61
      ],
      [
        73.85835,
        18.61
      ],
      [
        73.85462,
        18.59062
      ],
      [
        73.851,
        18.587
      ],
      [
        73.81891,
        18.56866
      ],
      [
        73.7984,
        18.58534
      ],
      [
        73.79546,
        18.6006
      ]
    ]
  },
  {
    "id": "W-140",
    "name": "Hadapsar Industrial MIDC Ward",
    "zone": "Manufacturing Core",
    "city": "Pune",
    "areaSqKm": 7.88,
    "population": 168000,
    "lstAnomaly": 5.4,
    "baselineTemp": 33.0,
    "currentLst": 38.4,
    "ndviIndex": 0.07,
    "gridLoadMw": 96,
    "vulnerablePopPct": 48,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +5.4\u00b0C with 48% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.504,
      73.931
    ],
    "polygon": [
      [
        73.95008,
        18.5138
      ],
      [
        73.94904,
        18.4944
      ],
      [
        73.92886,
        18.48297
      ],
      [
        73.92004,
        18.50798
      ],
      [
        73.93991,
        18.51507
      ],
      [
        73.95008,
        18.5138
      ]
    ]
  },
  {
    "id": "W-141",
    "name": "Magarpatta City Ward",
    "zone": "Planned Township",
    "city": "Pune",
    "areaSqKm": 5.76,
    "population": 78000,
    "lstAnomaly": 2.2,
    "baselineTemp": 33.0,
    "currentLst": 35.2,
    "ndviIndex": 0.24,
    "gridLoadMw": 62,
    "vulnerablePopPct": 18,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.2\u00b0C with 18% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.518,
      73.926
    ],
    "polygon": [
      [
        73.91036,
        18.52838
      ],
      [
        73.91763,
        18.53289
      ],
      [
        73.93991,
        18.51507
      ],
      [
        73.92004,
        18.50798
      ],
      [
        73.90427,
        18.51744
      ],
      [
        73.91036,
        18.52838
      ]
    ]
  },
  {
    "id": "W-142",
    "name": "Mundhwa Industrial Ward",
    "zone": "Industrial Corridor",
    "city": "Pune",
    "areaSqKm": 5.63,
    "population": 114000,
    "lstAnomaly": 4.8,
    "baselineTemp": 33.0,
    "currentLst": 37.8,
    "ndviIndex": 0.08,
    "gridLoadMw": 82,
    "vulnerablePopPct": 44,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.8\u00b0C with 44% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.528,
      73.934
    ],
    "polygon": [
      [
        73.9252,
        18.54324
      ],
      [
        73.95461,
        18.51972
      ],
      [
        73.95008,
        18.5138
      ],
      [
        73.93991,
        18.51507
      ],
      [
        73.91763,
        18.53289
      ],
      [
        73.9252,
        18.54324
      ]
    ]
  },
  {
    "id": "W-143",
    "name": "Kharadi IT Park (EON) Ward",
    "zone": "Tech SEZ Corridor",
    "city": "Pune",
    "areaSqKm": 13.98,
    "population": 112000,
    "lstAnomaly": 4.2,
    "baselineTemp": 33.0,
    "currentLst": 37.2,
    "ndviIndex": 0.11,
    "gridLoadMw": 74,
    "vulnerablePopPct": 26,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +4.2\u00b0C with 26% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.551,
      73.948
    ],
    "polygon": [
      [
        73.94494,
        18.57806
      ],
      [
        73.98534,
        18.53766
      ],
      [
        73.9718,
        18.53213
      ],
      [
        73.92992,
        18.55146
      ],
      [
        73.93702,
        18.57039
      ],
      [
        73.94494,
        18.57806
      ]
    ]
  },
  {
    "id": "W-144",
    "name": "Kharadi South Ward",
    "zone": "Residential East",
    "city": "Pune",
    "areaSqKm": 7.5,
    "population": 84000,
    "lstAnomaly": 3.2,
    "baselineTemp": 33.0,
    "currentLst": 36.2,
    "ndviIndex": 0.15,
    "gridLoadMw": 56,
    "vulnerablePopPct": 24,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.2\u00b0C with 24% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.538,
      73.942
    ],
    "polygon": [
      [
        73.92992,
        18.55146
      ],
      [
        73.9718,
        18.53213
      ],
      [
        73.95461,
        18.51972
      ],
      [
        73.9252,
        18.54324
      ],
      [
        73.9264,
        18.5478
      ],
      [
        73.92992,
        18.55146
      ]
    ]
  },
  {
    "id": "W-145",
    "name": "Wagholi West Ward",
    "zone": "East Suburb",
    "city": "Pune",
    "areaSqKm": 29.3,
    "population": 76000,
    "lstAnomaly": 3.6,
    "baselineTemp": 33.0,
    "currentLst": 36.6,
    "ndviIndex": 0.13,
    "gridLoadMw": 52,
    "vulnerablePopPct": 30,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +3.6\u00b0C with 30% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.575,
      73.972
    ],
    "polygon": [
      [
        73.98534,
        18.53766
      ],
      [
        73.94494,
        18.57806
      ],
      [
        73.94908,
        18.61
      ],
      [
        73.99,
        18.61
      ],
      [
        73.99,
        18.5374
      ],
      [
        73.98534,
        18.53766
      ]
    ]
  },
  {
    "id": "W-146",
    "name": "Ramtekdi & Vaiduwadi Ward",
    "zone": "Dense Industrial",
    "city": "Pune",
    "areaSqKm": 9.21,
    "population": 102000,
    "lstAnomaly": 5.0,
    "baselineTemp": 33.0,
    "currentLst": 38.0,
    "ndviIndex": 0.08,
    "gridLoadMw": 84,
    "vulnerablePopPct": 46,
    "topDriver": "Radiative Albedo Deficit & Industrial Roofs",
    "riskNote": "Surface heat anomaly +5.0\u00b0C with 46% vulnerable population.",
    "riskSeverity": "critical",
    "center": [
      18.498,
      73.914
    ],
    "polygon": [
      [
        73.92004,
        18.50798
      ],
      [
        73.92886,
        18.48297
      ],
      [
        73.92259,
        18.47409
      ],
      [
        73.91533,
        18.4744
      ],
      [
        73.89716,
        18.50711
      ],
      [
        73.90114,
        18.51574
      ],
      [
        73.90427,
        18.51744
      ],
      [
        73.92004,
        18.50798
      ]
    ]
  },
  {
    "id": "W-147",
    "name": "Fursungi & Bhekrai Nagar Ward",
    "zone": "Southeast Growth",
    "city": "Pune",
    "areaSqKm": 40.25,
    "population": 82000,
    "lstAnomaly": 3.4,
    "baselineTemp": 33.0,
    "currentLst": 36.4,
    "ndviIndex": 0.14,
    "gridLoadMw": 54,
    "vulnerablePopPct": 32,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +3.4\u00b0C with 32% vulnerable population.",
    "riskSeverity": "high",
    "center": [
      18.474,
      73.948
    ],
    "polygon": [
      [
        73.92259,
        18.47409
      ],
      [
        73.92886,
        18.48297
      ],
      [
        73.94904,
        18.4944
      ],
      [
        73.99,
        18.46514
      ],
      [
        73.99,
        18.42
      ],
      [
        73.95715,
        18.42
      ],
      [
        73.92259,
        18.47409
      ]
    ]
  },
  {
    "id": "W-148",
    "name": "Manjri Green Belt Ward",
    "zone": "Agricultural East",
    "city": "Pune",
    "areaSqKm": 24.66,
    "population": 54000,
    "lstAnomaly": 1.6,
    "baselineTemp": 33.0,
    "currentLst": 34.6,
    "ndviIndex": 0.28,
    "gridLoadMw": 38,
    "vulnerablePopPct": 22,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +1.6\u00b0C with 22% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.502,
      73.968
    ],
    "polygon": [
      [
        73.94904,
        18.4944
      ],
      [
        73.95008,
        18.5138
      ],
      [
        73.95461,
        18.51972
      ],
      [
        73.9718,
        18.53213
      ],
      [
        73.98534,
        18.53766
      ],
      [
        73.99,
        18.5374
      ],
      [
        73.99,
        18.46514
      ],
      [
        73.94904,
        18.4944
      ]
    ]
  },
  {
    "id": "W-149",
    "name": "Wakad & Hinjawadi Link Ward",
    "zone": "NW Tech Fringe",
    "city": "Pune",
    "areaSqKm": 20.69,
    "population": 88000,
    "lstAnomaly": 2.2,
    "baselineTemp": 33.0,
    "currentLst": 35.2,
    "ndviIndex": 0.2,
    "gridLoadMw": 55,
    "vulnerablePopPct": 20,
    "topDriver": "Urban Density & Heat Flux",
    "riskNote": "Surface heat anomaly +2.2\u00b0C with 20% vulnerable population.",
    "riskSeverity": "moderate",
    "center": [
      18.588,
      73.762
    ],
    "polygon": [
      [
        73.79546,
        18.6006
      ],
      [
        73.74,
        18.559
      ],
      [
        73.74,
        18.61
      ],
      [
        73.79634,
        18.61
      ],
      [
        73.79546,
        18.6006
      ]
    ]
  }
];

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
export function runScenarioOptimizer(params, targetWardIds = null) {
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

  let targetWards = MOCK_WARDS;
  if (targetWardIds && targetWardIds.length > 0) {
    const selectedSet = new Set(targetWardIds);
    const matched = MOCK_WARDS.filter(w => selectedSet.has(w.id));
    if (matched.length > 0) targetWards = matched;
  }

  // Sort by highest anomaly to prioritize
  const candidateWards = [...targetWards].sort((a, b) => (b.lstAnomaly || 0) - (a.lstAnomaly || 0)).slice(0, 5);
  const count = candidateWards.length;
  const budgetPerWard = Math.round(budgetInrLakhs / count);

  const optimizedWards = candidateWards.map((w, idx) => {
    const coolingShare = Number((projectedTempReductionDegC * (1 - idx * 0.12)).toFixed(2));
    let rec = 'Cool Roof Coating + Miyawaki Canopy';
    if (w.topDriver && w.topDriver.includes('Vegetation')) rec = 'Urban Forestry & Pocket Parks';
    else if (w.lstAnomaly > 3.5) rec = 'High-Albedo Cool Roofs & Cool Pavements';
    else rec = 'Building Envelope Albedo Retrofit & Mist Canopies';

    return {
      wardId: w.id,
      wardName: w.name,
      allocatedBudgetLakhs: budgetPerWard,
      expectedCoolingDegC: Math.max(0.2, coolingShare),
      recommendedIntervention: rec
    };
  });

  return {
    projectedTempReductionDegC: Math.max(0.1, projectedTempReductionDegC),
    projectedCoolingPerLakhInr: Number(coolingPerLakh.toFixed(3)),
    estimatedCo2ReductionTons: estimatedCo2,
    vulnerablePopProtected: vulnerablePop,
    gridPowerSavedMw: powerSavedMw,
    targetWardCount: targetWards.length,
    optimizedWards
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
