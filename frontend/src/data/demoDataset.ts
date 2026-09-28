import {
  Dam,
  DemoDataset,
  Scenario,
  DownstreamLocation,
  TimeStep,
  ImpactData,
  ValidationResult,
  ScenarioComparisonMetric,
  GeoJSONCollection,
  HydrologicalSeries,
} from '@/types';

// ============================================================================
// GENERALIZED INDIAN DAM & RIVER DATASETS (National Dam Safety Authority)
// ============================================================================

export const tehriDam: Dam = {
  id: 'tehri-dam',
  name: 'Tehri Dam',
  state: 'Uttarakhand',
  river: 'Bhagirathi River',
  basin: 'Ganga Basin',
  height: 260.5,
  heightProvenance: 'DATASET VALUE',
  reservoirLevel: 830,
  reservoirLevelProvenance: 'DATASET VALUE',
  maxReservoirLevel: 835,
  maxReservoirLevelProvenance: 'DATASET VALUE',
  reservoirVolume: 3540,
  reservoirVolumeProvenance: 'DATASET VALUE',
  spillwayCapacity: 15300,
  spillwayCapacityProvenance: 'DATASET VALUE',
  lat: 30.3778,
  lng: 78.4806,
};

export const hirakudDam: Dam = {
  id: 'hirakud-dam',
  name: 'Hirakud Dam',
  state: 'Odisha',
  river: 'Mahanadi River',
  basin: 'Mahanadi Basin',
  height: 60.96,
  heightProvenance: 'DATASET VALUE',
  reservoirLevel: 192.0,
  reservoirLevelProvenance: 'DATASET VALUE',
  maxReservoirLevel: 192.02,
  maxReservoirLevelProvenance: 'DATASET VALUE',
  reservoirVolume: 5896,
  reservoirVolumeProvenance: 'DATASET VALUE',
  spillwayCapacity: 42475,
  spillwayCapacityProvenance: 'DATASET VALUE',
  lat: 21.5700,
  lng: 83.8700,
};

export const idukkiDam: Dam = {
  id: 'idukki-dam',
  name: 'Idukki Dam',
  state: 'Kerala',
  river: 'Periyar River',
  basin: 'Periyar Basin',
  height: 168.91,
  heightProvenance: 'DATASET VALUE',
  reservoirLevel: 732.4,
  reservoirLevelProvenance: 'DATASET VALUE',
  maxReservoirLevel: 732.43,
  maxReservoirLevelProvenance: 'DATASET VALUE',
  reservoirVolume: 1996,
  reservoirVolumeProvenance: 'DATASET VALUE',
  spillwayCapacity: 5012,
  spillwayCapacityProvenance: 'DATASET VALUE',
  lat: 9.8428,
  lng: 76.9747,
};

export const sardarSarovarDam: Dam = {
  id: 'sardar-sarovar',
  name: 'Sardar Sarovar Dam',
  state: 'Gujarat',
  river: 'Narmada River',
  basin: 'Narmada Basin',
  height: 163.0,
  heightProvenance: 'DATASET VALUE',
  reservoirLevel: 138.68,
  reservoirLevelProvenance: 'DATASET VALUE',
  maxReservoirLevel: 138.68,
  maxReservoirLevelProvenance: 'DATASET VALUE',
  reservoirVolume: 9500,
  reservoirVolumeProvenance: 'DATASET VALUE',
  spillwayCapacity: 84949,
  spillwayCapacityProvenance: 'DATASET VALUE',
  lat: 21.8301,
  lng: 73.7481,
};

export const bhakraDam: Dam = {
  id: 'bhakra-dam',
  name: 'Bhakra Dam',
  state: 'Himachal Pradesh',
  river: 'Sutlej River',
  basin: 'Indus Basin',
  height: 226,
  heightProvenance: 'DATASET VALUE',
  reservoirLevel: 510,
  reservoirLevelProvenance: 'DATASET VALUE',
  maxReservoirLevel: 513,
  maxReservoirLevelProvenance: 'DATASET VALUE',
  reservoirVolume: 9340,
  reservoirVolumeProvenance: 'DATASET VALUE',
  lat: 31.4109,
  lng: 76.4326,
};

export const dams: Dam[] = [
  tehriDam,
  hirakudDam,
  idukkiDam,
  sardarSarovarDam,
  bhakraDam,
];

// Downstream settlements for Tehri / Bhagirathi
export const downstreamLocations: DownstreamLocation[] = [
  { name: 'Devprayag (Sangam)', distance: 74, population: 3200, lat: 30.1462, lng: 78.5959, arrivalTime: 1.2, maxDepth: 7.8 },
  { name: 'Srinagar (Garhwal)', distance: 105, population: 25000, lat: 30.2231, lng: 78.7830, arrivalTime: 2.1, maxDepth: 5.4 },
  { name: 'Rishikesh City', distance: 150, population: 102000, lat: 30.0869, lng: 78.2676, arrivalTime: 3.4, maxDepth: 3.2 },
  { name: 'Haridwar Junction', distance: 175, population: 228000, lat: 29.9457, lng: 78.1642, arrivalTime: 4.1, maxDepth: 2.1 },
];

export const hirakudDownstream: DownstreamLocation[] = [
  { name: 'Sambalpur City', distance: 15, population: 335000, lat: 21.4669, lng: 83.9812, arrivalTime: 0.8, maxDepth: 4.5 },
  { name: 'Sonepur Town', distance: 85, population: 22000, lat: 20.8407, lng: 83.9142, arrivalTime: 2.5, maxDepth: 3.8 },
  { name: 'Boudh Nagar', distance: 130, population: 21000, lat: 20.8415, lng: 84.3262, arrivalTime: 3.9, maxDepth: 3.1 },
  { name: 'Cuttack Delta', distance: 290, population: 650000, lat: 20.4625, lng: 85.8830, arrivalTime: 7.2, maxDepth: 2.4 },
];

export const idukkiDownstream: DownstreamLocation[] = [
  { name: 'Cheruthoni Township', distance: 3, population: 12000, lat: 9.8517, lng: 76.9632, arrivalTime: 0.2, maxDepth: 8.2 },
  { name: 'Vandiperiyar Valley', distance: 42, population: 38000, lat: 9.5714, lng: 77.0850, arrivalTime: 1.4, maxDepth: 5.1 },
  { name: 'Kalady / Perumbavoor', distance: 95, population: 160000, lat: 10.1667, lng: 76.4333, arrivalTime: 3.8, maxDepth: 3.6 },
  { name: 'Aluva Municipal Zone', distance: 115, population: 285000, lat: 10.1076, lng: 76.3516, arrivalTime: 4.5, maxDepth: 2.9 },
];

export const sardarSarovarDownstream: DownstreamLocation[] = [
  { name: 'Garudeshwar', distance: 12, population: 15000, lat: 21.8753, lng: 73.6622, arrivalTime: 0.6, maxDepth: 6.8 },
  { name: 'Poicha Gateway', distance: 45, population: 28000, lat: 21.9167, lng: 73.4000, arrivalTime: 1.8, maxDepth: 4.9 },
  { name: 'Bharuch City', distance: 110, population: 390000, lat: 21.7051, lng: 72.9959, arrivalTime: 4.2, maxDepth: 3.4 },
  { name: 'Dahej Estuary', distance: 155, population: 45000, lat: 21.7100, lng: 72.5800, arrivalTime: 5.8, maxDepth: 2.2 },
];

export const tehriDemoDataset: DemoDataset = {
  id: 'DATASET-IN-TEHRI',
  datasetId: 'DATASET-IN-TEHRI',
  name: 'Tehri Dam – Bhagirathi River Basin',
  datasetName: 'Tehri Dam – Bhagirathi River Basin',
  dropdownLabel: 'Tehri Dam — Bhagirathi River (Uttarakhand)',
  location: 'Tehri Garhwal',
  state: 'Uttarakhand',
  hazardType: 'DAM_BREAK',
  isDam: true,
  dam: tehriDam,
  elevationRange: '225 m – 7,817 m MSL',
  demResolution: '30m CartoDEM / SRTM 1-Arcsec',
  coverageArea: '12,400 km²',
  riverLength: '185 km (Tehri to Haridwar)',
  sourceCrs: 'EPSG:4326 (WGS 84)',
  modelCrs: 'EPSG:32644 (UTM Zone 44N)',
  crs: 'EPSG:32644 (UTM Zone 44N)',
  layers: {
    dem: true,
    riverNetwork: true,
    damData: true,
    hydrologicalData: true,
    population: true,
    buildings: true,
    roads: true,
    bridges: true,
    criticalInfrastructure: true,
    satelliteData: true,
  },
  isValidated: true,
  loadedAt: new Date().toISOString(),
  isRealDataDemonstration: true,
  citation: 'Central Water Commission (CWC) National Dam Register & Survey of India / ISRO CartoDEM',
  downstreamLocations,
  hydrologicalSeries: {
    timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    inflowDischarge: [1200, 1450, 1850, 2400, 3100, 2200, 1600],
    reservoirLevel: [828.5, 829.1, 829.8, 830.4, 831.2, 831.0, 830.7],
    rainfallIntensity: [12, 18, 42, 65, 38, 14, 5],
  },
};

export const hirakudDataset: DemoDataset = {
  id: 'DATASET-IN-HIRAKUD',
  name: 'Hirakud Dam – Mahanadi River Basin',
  location: 'Sambalpur',
  state: 'Odisha',
  dam: hirakudDam,
  elevationRange: '45 m – 610 m MSL',
  demResolution: '30m CartoDEM / SRTM',
  coverageArea: '83,400 km²',
  riverLength: '310 km (Hirakud to Bay of Bengal)',
  layers: {
    dem: true,
    riverNetwork: true,
    damData: true,
    hydrologicalData: true,
    population: true,
    buildings: true,
    roads: true,
    bridges: true,
    criticalInfrastructure: true,
    satelliteData: true,
  },
  isValidated: true,
  loadedAt: new Date().toISOString(),
  isRealDataDemonstration: true,
  citation: 'Odisha Water Resources Dept & Central Water Commission',
  downstreamLocations: hirakudDownstream,
  hydrologicalSeries: {
    timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    inflowDischarge: [8500, 12400, 18500, 24800, 29000, 22000, 15000],
    reservoirLevel: [189.2, 189.9, 190.8, 191.5, 192.0, 191.8, 191.2],
    rainfallIntensity: [15, 25, 55, 80, 45, 20, 8],
  },
};

export const rishiGangaDownstream: DownstreamLocation[] = [
  { name: 'Raini Village (Rishiganga 13.2 MW HEP)', distance: 15, population: 450, lat: 30.4850, lng: 79.6950, arrivalTime: 0.25, maxDepth: 18.5 },
  { name: 'Tapovan Barrage (Tapovan Vishnugad 520 MW NTPC)', distance: 25, population: 1200, lat: 30.4950, lng: 79.6280, arrivalTime: 0.58, maxDepth: 12.4 },
  { name: 'Rini / Lata Valley Settlements', distance: 28, population: 800, lat: 30.5050, lng: 79.6100, arrivalTime: 0.72, maxDepth: 8.5 },
  { name: 'Joshimath / Dhauliganga-Alaknanda Confluence', distance: 38, population: 16700, lat: 30.5520, lng: 79.5630, arrivalTime: 1.15, maxDepth: 6.2 },
  { name: 'Helang / Pipalkoti Reach', distance: 55, population: 8500, lat: 30.4300, lng: 79.4300, arrivalTime: 1.85, maxDepth: 4.1 },
];

export const rishiGangaDataset: DemoDataset = {
  id: 'rishi_ganga_2021',
  datasetId: 'rishi_ganga_2021',
  name: 'Rishi Ganga — Chamoli Flash-Flood Event',
  datasetName: 'Rishi Ganga — Chamoli Flash-Flood Event',
  dropdownLabel: 'Rishi Ganga — Chamoli Flash-Flood Event (Uttarakhand)',
  location: 'Chamoli',
  district: 'Chamoli',
  state: 'Uttarakhand',
  eventDate: '7 February 2021',
  hazardType: 'AVALANCHE_DEBRIS_FLOW',
  hazardTypeDescription: 'Avalanche / Debris Flow / Flash Flood',
  riverSystem: 'Ronti Gad → Rishiganga → Dhauliganga',
  studyArea: 'Nanda Devi Biosphere / Chamoli District (Ronti Gad to Joshimath)',
  isDam: false,
  type: 'Avalanche / Debris Flow / Flash Flood',
  defaultScenarioName: '2021 Chamoli Rishi Ganga Event',
  sourceLocation: {
    name: 'Ronti Peak Rock-Ice Detachment Zone',
    type: 'Hanging Glacier & Wedge Failure',
    lat: 30.3780,
    lng: 79.7320,
    elevationMsl: 5500,
    description: 'Detachment of ~27 million m³ of rock and glacier ice from the north face of Ronti Peak (~5,500m MSL)'
  },
  dam: {
    id: 'source-ronti-peak',
    name: 'Ronti Peak Detachment Zone',
    state: 'Uttarakhand',
    river: 'Ronti Gad → Rishiganga → Dhauliganga',
    basin: 'Alaknanda / Upper Ganga Catchment',
    height: 0,
    heightProvenance: 'DATASET VALUE',
    reservoirLevel: 0,
    reservoirLevelProvenance: 'DATASET VALUE',
    maxReservoirLevel: 0,
    maxReservoirLevelProvenance: 'DATASET VALUE',
    reservoirVolume: 0,
    reservoirVolumeProvenance: 'DATASET VALUE',
    spillwayCapacity: 0,
    spillwayCapacityProvenance: 'DATASET VALUE',
    lat: 30.3780,
    lng: 79.7320,
  },
  elevationRange: '1,350 m – 6,050 m MSL',
  demResolution: '30m CartoDEM / ALOS AW3D30 / SRTM',
  coverageArea: '1,650 km²',
  riverLength: '45 km (Ronti Detachment to Joshimath/Alaknanda)',
  sourceCrs: 'EPSG:4326 (WGS 84)',
  modelCrs: 'EPSG:32644 (UTM Zone 44N)',
  crs: 'EPSG:32644 (UTM Zone 44N)',
  status: 'VALID',
  layers: {
    dem: true,
    riverNetwork: true,
    damData: false,
    hydrologicalData: false,
    population: true,
    buildings: true,
    roads: true,
    bridges: true,
    criticalInfrastructure: true,
    satelliteData: false,
  },
  layerDetails: {
    dem: { available: true, statusText: 'VALID', format: 'GeoTIFF', crs: 'EPSG:32644 (UTM Zone 44N)', source: 'ALOS AW3D30 / CartoDEM 30m', details: '1,350 m – 6,050 m MSL elevation terrain grid' },
    riverLayers: { available: true, statusText: 'VALID', format: 'GeoJSON Polyline', crs: 'EPSG:32644', source: 'Hydro-Enforced Drainage', details: 'Ronti Gad → Rishiganga → Dhauliganga channel network' },
    sourceLocation: { available: true, statusText: 'VALID', format: 'GeoJSON Point', crs: 'EPSG:4326', source: 'WIHG / ISRO Report', details: 'Ronti Peak detachment zone (30.378°N, 79.732°E, 5,500m MSL)' },
    hydrologicalData: { available: false, statusText: 'DATA NOT AVAILABLE', details: 'DATA NOT AVAILABLE — Ungauged high-altitude mountain headwaters prior to 7 Feb 2021 event' },
    roads: { available: true, statusText: 'VALID', format: 'GeoJSON Polyline', crs: 'EPSG:32644', source: 'Survey of India', details: 'Joshimath–Malari border road (NH-107B)' },
    bridges: { available: true, statusText: 'VALID', format: 'GeoJSON Points', crs: 'EPSG:4326', source: 'Disaster Impact Survey', details: 'Raini RCC arch bridge and Tapovan crossing structures' },
    buildings: { available: true, statusText: 'VALID', format: 'GeoJSON Polygons', crs: 'EPSG:4326', source: 'Survey & OpenStreetMap', details: 'Raini village habitations and project colonies' },
    exposureLayers: { available: true, statusText: 'VALID', format: 'GeoJSON / Census Grid', crs: 'EPSG:4326', source: 'Census 2011 & Local Administration', details: 'Raini, Tapovan, Lata, Suraithota, Joshimath habitations' },
    criticalInfrastructure: { available: true, statusText: 'VALID', format: 'GeoJSON Points', crs: 'EPSG:4326', source: 'NDMA / State Disaster Management', details: 'Rishiganga 13.2 MW HEP & Tapovan Vishnugad 520 MW NTPC Barrage' },
    satelliteData: { available: false, statusText: 'DATA NOT AVAILABLE', details: 'DATA NOT AVAILABLE — Pre/post event high-resolution satellite optical/SAR rasters not bundled' },
  },
  isValidated: true,
  loadedAt: new Date().toISOString(),
  isRealDataDemonstration: true,
  citation: 'Wadia Institute of Himalayan Geology (WIHG), ISRO Disaster Management Support & Geological Survey of India (GSI)',
  downstreamLocations: rishiGangaDownstream,
  hydrologicalSeries: undefined, // Explicitly undefined: ungauged event, no fake discharge
};

export const idukkiDataset: DemoDataset = {
  id: 'DATASET-IN-IDUKKI',
  datasetId: 'DATASET-IN-IDUKKI',
  name: 'Idukki Dam – Periyar River Basin',
  datasetName: 'Idukki Dam – Periyar River Basin',
  dropdownLabel: 'Idukki Dam — Periyar River (Kerala)',
  location: 'Idukki',
  state: 'Kerala',
  hazardType: 'DAM_BREAK',
  isDam: true,
  dam: idukkiDam,
  elevationRange: '10 m – 2,695 m MSL',
  demResolution: '30m CartoDEM / SRTM',
  coverageArea: '5,398 km²',
  riverLength: '140 km (Cheruthoni to Arabian Sea)',
  sourceCrs: 'EPSG:4326 (WGS 84)',
  modelCrs: 'EPSG:32643 (UTM Zone 43N)',
  crs: 'EPSG:32643 (UTM Zone 43N)',
  layers: {
    dem: true,
    riverNetwork: true,
    damData: true,
    hydrologicalData: true,
    population: true,
    buildings: true,
    roads: true,
    bridges: true,
    criticalInfrastructure: true,
    satelliteData: true,
  },
  isValidated: true,
  loadedAt: new Date().toISOString(),
  isRealDataDemonstration: true,
  citation: 'Kerala State Electricity Board (KSEB) & Central Water Commission',
  downstreamLocations: idukkiDownstream,
  hydrologicalSeries: {
    timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    inflowDischarge: [950, 1600, 2400, 3800, 4200, 2800, 1400],
    reservoirLevel: [728.0, 729.2, 730.5, 731.8, 732.4, 732.1, 731.5],
    rainfallIntensity: [30, 45, 95, 120, 60, 25, 10],
  },
};

export const sardarSarovarDataset: DemoDataset = {
  id: 'DATASET-IN-SARDAR-SAROVAR',
  datasetId: 'DATASET-IN-SARDAR-SAROVAR',
  name: 'Sardar Sarovar Dam – Narmada River Basin',
  datasetName: 'Sardar Sarovar Dam – Narmada River Basin',
  dropdownLabel: 'Sardar Sarovar Dam — Narmada River (Gujarat)',
  location: 'Kevadia',
  state: 'Gujarat',
  hazardType: 'DAM_BREAK',
  isDam: true,
  dam: sardarSarovarDam,
  elevationRange: '5 m – 1,350 m MSL',
  demResolution: '30m CartoDEM / SRTM',
  coverageArea: '98,796 km²',
  riverLength: '160 km (Kevadia to Gulf of Khambhat)',
  sourceCrs: 'EPSG:4326 (WGS 84)',
  modelCrs: 'EPSG:32643 (UTM Zone 43N)',
  crs: 'EPSG:32643 (UTM Zone 43N)',
  layers: {
    dem: true,
    riverNetwork: true,
    damData: true,
    hydrologicalData: true,
    population: true,
    buildings: true,
    roads: true,
    bridges: true,
    criticalInfrastructure: true,
    satelliteData: true,
  },
  isValidated: true,
  loadedAt: new Date().toISOString(),
  isRealDataDemonstration: true,
  citation: 'Sardar Sarovar Narmada Nigam Limited (SSNNL) & CWC',
  downstreamLocations: sardarSarovarDownstream,
  hydrologicalSeries: {
    timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    inflowDischarge: [12000, 18500, 28000, 42000, 48000, 31000, 19000],
    reservoirLevel: [134.5, 135.8, 137.2, 138.4, 138.68, 138.5, 137.9],
    rainfallIntensity: [20, 35, 60, 75, 40, 15, 5],
  },
};

export const indianDatasets: DemoDataset[] = [
  idukkiDataset,
  tehriDemoDataset,
  rishiGangaDataset,
  hirakudDataset,
  sardarSarovarDataset,
];

// River Courses
export const riverGeoJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { name: 'Bhagirathi - Ganga River Course', basin: 'Ganga Basin', status: 'Monitored' },
    geometry: {
      type: 'LineString',
      coordinates: [
        [78.92, 30.92],
        [78.75, 30.72],
        [78.60, 30.55],
        [78.4806, 30.3778],
        [78.45, 30.30],
        [78.50, 30.22],
        [78.59, 30.15],
        [78.65, 30.10],
        [78.55, 30.05],
        [78.40, 29.98],
        [78.27, 30.09],
        [78.16, 29.95],
        [78.05, 29.85],
      ]
    }
  }]
};

export const roadsGeoJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'NH-94 (Chamba-Tehri)', type: 'National Highway', lanes: 2 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.50, 30.40], [78.48, 30.35], [78.45, 30.28], [78.50, 30.20], [78.55, 30.15],
          [78.50, 30.05], [78.35, 30.00], [78.27, 30.09], [78.16, 29.95],
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'NH-58 (Badrinath Highway)', type: 'National Highway', lanes: 2 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.40, 30.50], [78.35, 30.40], [78.30, 30.30], [78.25, 30.20], [78.20, 30.10], [78.16, 29.95],
        ]
      }
    }
  ]
};

export const buildingsGeoJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Tehri Old Town Area', type: 'town', buildings: 2100 }, geometry: { type: 'Point', coordinates: [78.48, 30.39] } },
    { type: 'Feature', properties: { name: 'New Tehri Town', type: 'town', buildings: 3200 }, geometry: { type: 'Point', coordinates: [78.43, 30.38] } },
    { type: 'Feature', properties: { name: 'Devprayag Settlement', type: 'town', buildings: 1500 }, geometry: { type: 'Point', coordinates: [78.5959, 30.1462] } },
    { type: 'Feature', properties: { name: 'Srinagar Municipality', type: 'town', buildings: 2800 }, geometry: { type: 'Point', coordinates: [78.783, 30.223] } },
    { type: 'Feature', properties: { name: 'Rishikesh Urban Area', type: 'city', buildings: 1800 }, geometry: { type: 'Point', coordinates: [78.2676, 30.0869] } },
    { type: 'Feature', properties: { name: 'Haridwar Floodplain Zone', type: 'city', buildings: 2500 }, geometry: { type: 'Point', coordinates: [78.1642, 29.9457] } },
  ]
};

export const criticalInfraGeoJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'District Hospital Tehri', type: 'hospital' }, geometry: { type: 'Point', coordinates: [78.44, 30.38] } },
    { type: 'Feature', properties: { name: 'AIIMS Rishikesh', type: 'hospital' }, geometry: { type: 'Point', coordinates: [78.28, 30.07] } },
    { type: 'Feature', properties: { name: 'Tehri Police HQ', type: 'police' }, geometry: { type: 'Point', coordinates: [78.43, 30.37] } },
    { type: 'Feature', properties: { name: 'Tehri Hydro Power Plant Complex', type: 'power' }, geometry: { type: 'Point', coordinates: [78.48, 30.38] } },
    { type: 'Feature', properties: { name: 'IIT Roorkee Disaster Lab', type: 'school' }, geometry: { type: 'Point', coordinates: [77.90, 29.87] } },
    { type: 'Feature', properties: { name: 'Govt. College Srinagar', type: 'school' }, geometry: { type: 'Point', coordinates: [78.78, 30.22] } },
    { type: 'Feature', properties: { name: 'State PWD Emergency Office', type: 'government' }, geometry: { type: 'Point', coordinates: [78.44, 30.37] } },
  ]
};

export const bridgesGeoJSON: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Devprayag Sangam Bridge', type: 'road-bridge' }, geometry: { type: 'Point', coordinates: [78.597, 30.145] } },
    { type: 'Feature', properties: { name: 'Srinagar Valley Bridge', type: 'road-bridge' }, geometry: { type: 'Point', coordinates: [78.783, 30.224] } },
    { type: 'Feature', properties: { name: 'Lakshman Jhula Suspension Bridge', type: 'pedestrian' }, geometry: { type: 'Point', coordinates: [78.322, 30.121] } },
    { type: 'Feature', properties: { name: 'Ram Jhula Suspension Bridge', type: 'pedestrian' }, geometry: { type: 'Point', coordinates: [78.314, 30.114] } },
    { type: 'Feature', properties: { name: 'Rishikesh-Haridwar Bypass Bridge', type: 'road-bridge' }, geometry: { type: 'Point', coordinates: [78.20, 30.02] } },
  ]
};

// ============================================================================
// PRE-CONFIGURED SCENARIOS (Problem Statement 26161 Requirements 1-5)
// ============================================================================

export const defaultScenario: Scenario = {
  id: 'SCENARIO-UK-001',
  name: 'Tehri Dam — Instantaneous Dam Break',
  type: 'dam-break',
  dam: tehriDam,
  failureType: 'instantaneous',
  failureTrigger: 'Extreme Inflow PMF',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 830,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 100,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 80,
  breachFormationTime: 0.5,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 6,
  manningCoefficient: 0.035,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
};

export const gradualScenario: Scenario = {
  id: 'SCENARIO-UK-002',
  name: 'Tehri Dam — Gradual Piping Failure',
  type: 'dam-break',
  dam: tehriDam,
  failureType: 'gradual',
  failureTrigger: 'Internal Embankment Piping',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 830,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 80,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 60,
  breachFormationTime: 2.0,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 8,
  manningCoefficient: 0.035,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
};

export const blockageScenario: Scenario = {
  id: 'SCENARIO-UK-003',
  name: 'Bhagirathi Valley — Landslide Lake Outburst (GLOF/LLOF)',
  type: 'river-blockage',
  dam: tehriDam,
  failureType: 'instantaneous',
  failureTrigger: 'Debris Dam Overtopping',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 830,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 120,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 40,
  breachFormationTime: 0.2,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 6,
  manningCoefficient: 0.040,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
  naturalLake: {
    lakeAreaKm2: 14.5,
    estimatedStorageMCM: 185.0,
    breachLocation: 'Rishikesh Valley Narrows',
    releaseCondition: 'Erosive Overtopping Breach',
    provenance: 'SCENARIO ASSUMPTION'
  }
};

export const normalReleaseScenario: Scenario = {
  id: 'SCENARIO-UK-004',
  name: 'Tehri Dam — Normal Controlled Water Release',
  type: 'normal-release',
  dam: tehriDam,
  failureType: 'partial',
  failureTrigger: 'Scheduled Spillway Gate Operation',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 825,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 40,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 20,
  breachFormationTime: 1.0,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 6,
  manningCoefficient: 0.035,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
  controlledRelease: {
    gateCount: 4,
    dischargeCusecs: 1450,
    downstreamChannelCapacity: 4500,
    isSpillwayOvertopping: false
  }
};

export const highReleaseScenario: Scenario = {
  id: 'SCENARIO-UK-005',
  name: 'Tehri Dam — Emergency High Water Release',
  type: 'high-release',
  dam: tehriDam,
  failureType: 'partial',
  failureTrigger: 'Full Spillway Emergency Gate Discharge',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 834,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 80,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 35,
  breachFormationTime: 0.8,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 6,
  manningCoefficient: 0.035,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
  controlledRelease: {
    gateCount: 8,
    dischargeCusecs: 15300,
    downstreamChannelCapacity: 4500,
    isSpillwayOvertopping: true
  }
};

export const surgeScenario: Scenario = {
  id: 'SCENARIO-UK-006',
  name: 'Bhagirathi Catchment — Sudden Flash Flood Surge',
  type: 'water-surge',
  dam: tehriDam,
  failureType: 'instantaneous',
  failureTrigger: 'Cloudburst Upstream Runoff Pulse',
  failureTriggerProvenance: 'SCENARIO ASSUMPTION',
  reservoirLevel: 832,
  reservoirLevelProvenance: 'DATASET VALUE',
  breachWidth: 110,
  breachWidthProvenance: 'SCENARIO ASSUMPTION',
  breachDepth: 55,
  breachFormationTime: 0.3,
  breachFormationTimeProvenance: 'SCENARIO ASSUMPTION',
  simulationDuration: 6,
  manningCoefficient: 0.038,
  gridResolution: 30,
  timestep: 10,
  status: 'ready',
  createdAt: new Date().toISOString(),
};

// ============================================================================
// HADR IMPACT & VALIDATION DATASETS
// ============================================================================

export const defaultImpactData: ImpactData = {
  population: {
    totalExposed: 210000,
    affectedVillages: 37,
    majorTowns: 4,
    highRisk: 62000,
    byDepth: [
      { range: '0–0.5 m', count: 45000, color: '#3B82F6' },
      { range: '0.5–1 m', count: 52000, color: '#20C4D9' },
      { range: '1–2 m', count: 58000, color: '#EAB308' },
      { range: '2–5 m', count: 38000, color: '#F97316' },
      { range: '> 5 m', count: 17000, color: '#EF4444' },
    ],
    riskClassification: [
      { level: 'LOW', count: 45000, color: '#22C55E' },
      { level: 'MEDIUM', count: 52000, color: '#EAB308' },
      { level: 'HIGH', count: 51000, color: '#F97316' },
      { level: 'CRITICAL', count: 62000, color: '#EF4444' },
    ],
  },
  buildings: {
    totalExposed: 12450,
    severelyAffected: 2130,
    byType: [
      { type: 'Residential', count: 8900 },
      { type: 'Commercial', count: 1800 },
      { type: 'Industrial', count: 450 },
      { type: 'Government', count: 320 },
      { type: 'Religious', count: 580 },
      { type: 'Educational', count: 400 },
    ],
  },
  roads: {
    totalLengthAffected: 87,
    majorHighways: 2,
    localRoads: 34,
  },
  bridges: {
    totalAffected: 14,
    destroyed: 4,
    damaged: 10,
  },
  criticalInfrastructure: {
    hospitals: 6,
    schools: 23,
    policeStations: 8,
    governmentBuildings: 12,
    powerStations: 3,
  },
};

export const gradualImpactData: ImpactData = {
  population: {
    totalExposed: 142000,
    affectedVillages: 28,
    majorTowns: 3,
    highRisk: 35000,
    byDepth: [
      { range: '0–0.5 m', count: 38000, color: '#3B82F6' },
      { range: '0.5–1 m', count: 42000, color: '#20C4D9' },
      { range: '1–2 m', count: 35000, color: '#EAB308' },
      { range: '2–5 m', count: 20000, color: '#F97316' },
      { range: '> 5 m', count: 7000, color: '#EF4444' },
    ],
    riskClassification: [
      { level: 'LOW', count: 38000, color: '#22C55E' },
      { level: 'MEDIUM', count: 42000, color: '#EAB308' },
      { level: 'HIGH', count: 27000, color: '#F97316' },
      { level: 'CRITICAL', count: 35000, color: '#EF4444' },
    ],
  },
  buildings: {
    totalExposed: 8200,
    severelyAffected: 1200,
    byType: [
      { type: 'Residential', count: 5800 },
      { type: 'Commercial', count: 1200 },
      { type: 'Industrial', count: 300 },
      { type: 'Government', count: 200 },
      { type: 'Religious', count: 380 },
      { type: 'Educational', count: 320 },
    ],
  },
  roads: { totalLengthAffected: 62, majorHighways: 2, localRoads: 24 },
  bridges: { totalAffected: 9, destroyed: 2, damaged: 7 },
  criticalInfrastructure: { hospitals: 4, schools: 15, policeStations: 5, governmentBuildings: 8, powerStations: 2 },
};

export const blockageImpactData: ImpactData = {
  population: {
    totalExposed: 85000,
    affectedVillages: 15,
    majorTowns: 2,
    highRisk: 18000,
    byDepth: [
      { range: '0–0.5 m', count: 22000, color: '#3B82F6' },
      { range: '0.5–1 m', count: 25000, color: '#20C4D9' },
      { range: '1–2 m', count: 20000, color: '#EAB308' },
      { range: '2–5 m', count: 12000, color: '#F97316' },
      { range: '> 5 m', count: 6000, color: '#EF4444' },
    ],
    riskClassification: [
      { level: 'LOW', count: 22000, color: '#22C55E' },
      { level: 'MEDIUM', count: 25000, color: '#EAB308' },
      { level: 'HIGH', count: 20000, color: '#F97316' },
      { level: 'CRITICAL', count: 18000, color: '#EF4444' },
    ],
  },
  buildings: {
    totalExposed: 4800,
    severelyAffected: 720,
    byType: [
      { type: 'Residential', count: 3400 },
      { type: 'Commercial', count: 700 },
      { type: 'Industrial', count: 180 },
      { type: 'Government', count: 120 },
      { type: 'Religious', count: 220 },
      { type: 'Educational', count: 180 },
    ],
  },
  roads: { totalLengthAffected: 35, majorHighways: 1, localRoads: 14 },
  bridges: { totalAffected: 5, destroyed: 1, damaged: 4 },
  criticalInfrastructure: { hospitals: 2, schools: 8, policeStations: 3, governmentBuildings: 4, powerStations: 1 },
};

export const defaultValidation: ValidationResult = {
  predictedArea: 235,
  observedArea: 221,
  overlap: 198,
  falsePositive: 37,
  falseNegative: 23,
  agreement: 84,
  csi: 0.76,
  iou: 0.76,
  hitRate: 0.89,
  precision: 0.84,
  confusionMatrix: {
    truePositive: 198,
    trueNegative: 1450,
    falsePositive: 37,
    falseNegative: 23,
  },
  satelliteAcquisitionTime: '2024-09-15T06:30:00Z',
  simulationTime: '2024-09-15T04:00:00Z',
  cloudCoverage: 12,
  status: 'acceptable',
  isDemoSatelliteData: true,
  geeStatus: 'GEE_NOT_CONFIGURED',
  geeDiagnostic: 'To connect live Google Earth Engine Sentinel-1 SAR ingestion, configure GEE credentials.',
  satelliteSensor: 'Sentinel-1 SAR C-Band',
  scientificNotice: 'DEMO SATELLITE DATA: Calibrated Sentinel-1 SAR reference observation.'
};

export const simulationSteps = [
  { id: 'mesh', label: '1. Mesh Generation', description: 'Generating computational shallow water mesh and metric projected UTM grid...' },
  { id: 'boundary', label: '2. Boundary Condition Setup', description: 'Configuring inflow hydrograph, dynamic dam breach weir, and stage-discharge curves...' },
  { id: 'hydro', label: '3. Hydrodynamic Propagation', description: 'Solving 2D depth-averaged shallow water equations and shock-capturing flood wave...' },
  { id: 'wse', label: '4. Water Surface Elevation Solver', description: 'Computing dynamic water surface elevations, inundation depth envelope, and velocity field...' },
  { id: 'hazard', label: '5. Hazard Calculation', description: 'Computing hazard intensity rating (depth × velocity) and downstream critical infrastructure exposure...' },
  { id: 'results', label: '6. Result Post-Processing', description: 'Compiling standardized GeoJSON polygons, arrival contours, and export packages...' },
];

export const scenarioComparison: { metrics: ScenarioComparisonMetric[] } = {
  metrics: [
    { metric: 'Inundation Area (km²)', scenarioA: 235, scenarioB: 168, scenarioC: 95 },
    { metric: 'Max Depth (m)', scenarioA: 8.4, scenarioB: 5.8, scenarioC: 4.2 },
    { metric: 'Max Velocity (m/s)', scenarioA: 6.2, scenarioB: 4.1, scenarioC: 3.5 },
    { metric: 'Arrival Time (hrs)', scenarioA: 3.4, scenarioB: 5.2, scenarioC: 2.8 },
    { metric: 'Peak Outflow Discharge (m³/s)', scenarioA: 18500, scenarioB: 9200, scenarioC: 6800 },
    { metric: 'Population Exposed', scenarioA: 210000, scenarioB: 142000, scenarioC: 85000 },
    { metric: 'Buildings Exposed', scenarioA: 12450, scenarioB: 8200, scenarioC: 4800 },
    { metric: 'Roads Affected (km)', scenarioA: 87, scenarioB: 62, scenarioC: 35 },
    { metric: 'Bridges Affected', scenarioA: 14, scenarioB: 9, scenarioC: 5 },
    { metric: 'Critical Facilities at Risk', scenarioA: 12, scenarioB: 7, scenarioC: 4 },
  ],
};

export function generateFloodPolygon(time: number, scale = 1, [cx, cy]: [number, number] = [78.4806, 30.3778]): number[][] {
  const spread = (0.025 + time * 0.055) * Math.sqrt(scale);
  const downstreamBias = (time * 0.09) * Math.sqrt(scale);
  const points: number[][] = [];
  const numPoints = 32;
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const dx = spread * Math.cos(angle) * (1 + 0.45 * Math.cos(angle - Math.PI * 0.7));
    const dy = spread * Math.sin(angle) * (1 + 0.45 * Math.sin(angle - Math.PI * 0.7)) - downstreamBias * 0.35;
    points.push([+(cx + dx).toFixed(5), +(cy + dy).toFixed(5)]);
  }
  points.push(points[0]);
  return points;
}

export function generateTimeSteps(scaleFactor = 1, damCoords: [number, number] = [78.4806, 30.3778]): TimeStep[] {
  const steps: TimeStep[] = [];
  const baseArea = 235 * scaleFactor;
  const baseDepth = 8.4 * scaleFactor;
  const baseVel = 6.2 * scaleFactor;
  const basePop = 210000 * scaleFactor;

  const hours = [0, 1, 2, 3, 4, 5, 6];

  for (const t of hours) {
    const growthFactor = t === 0 ? 0.05 : 1 - Math.exp(-0.8 * t);
    steps.push({
      time: t,
      inundationArea: Math.round(baseArea * growthFactor),
      maxDepth: +(baseDepth * Math.min(growthFactor * 1.2, 1)).toFixed(1),
      maxVelocity: +(t === 0 ? 0.5 : t <= 2 ? baseVel * (t / 2) : baseVel * Math.exp(-0.25 * (t - 2))).toFixed(1),
      populationExposed: Math.round(basePop * growthFactor),
      floodExtentGeoJSON: {
        type: 'Feature',
        properties: { time: t, depth: 'varies', unit: 'm', label: `T+ ${t}h Inundation Extent` },
        geometry: {
          type: 'Polygon',
          coordinates: [generateFloodPolygon(t, scaleFactor, damCoords)]
        }
      }
    });
  }
  return steps;
}
