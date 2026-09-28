// User Authentication
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  agency: string;
  department: string;
  designation: string;
  state?: string;
  govId?: string;
  registeredAt?: string;
}

// Parameter Provenance for Scientific Transparency
export type ParameterProvenance = 'DATASET VALUE' | 'SCENARIO ASSUMPTION' | 'USER SUPPLIED' | 'NOT AVAILABLE';

// Dam data with engineering parameter provenance
export interface Dam {
  id: string;
  name: string;
  state: string;
  river: string;
  basin: string;
  height: number; // meters
  heightProvenance?: ParameterProvenance;
  reservoirLevel: number; // meters MSL
  reservoirLevelProvenance?: ParameterProvenance;
  maxReservoirLevel: number; // FRL
  maxReservoirLevelProvenance?: ParameterProvenance;
  reservoirVolume: number; // MCM
  reservoirVolumeProvenance?: ParameterProvenance;
  spillwayCapacity?: number; // m3/s
  spillwayCapacityProvenance?: ParameterProvenance;
  maxWaterLevel?: number;
  normalWaterLevel?: number;
  lat: number;
  lng: number;
}

// Dataset definitions
export interface DatasetLayerStatus {
  dem: boolean;
  riverNetwork: boolean;
  damData: boolean;
  hydrologicalData: boolean;
  population: boolean;
  buildings: boolean;
  roads: boolean;
  bridges: boolean;
  criticalInfrastructure: boolean;
  satelliteData: boolean;
}

export interface HydrologicalSeries {
  timestamps: string[];
  inflowDischarge: number[];
  reservoirLevel: number[];
  rainfallIntensity?: number[];
}

export type HazardType = 
  | 'DAM_BREAK'
  | 'RIVER_BLOCKAGE'
  | 'AVALANCHE_DEBRIS_FLOW'
  | 'FLASH_FLOOD';

export interface SourceLocation {
  name: string;
  type: string;
  lat: number;
  lng: number;
  elevationMsl?: number;
  description?: string;
}

export interface LayerMetadata {
  available: boolean;
  statusText?: 'AVAILABLE' | 'DATA NOT AVAILABLE' | 'VALID' | 'PENDING' | 'ERROR';
  format?: string;
  crs?: string;
  source?: string;
  details?: string;
}

export interface DemoDataset {
  id: string;
  datasetId?: string;
  name: string;
  datasetName?: string;
  dropdownLabel?: string;
  location: string;
  district?: string;
  state: string;
  eventDate?: string;
  hazardType?: HazardType | string;
  hazardTypeDescription?: string;
  riverSystem?: string;
  studyArea?: string;
  isDam?: boolean;
  dam: Dam;
  sourceLocation?: SourceLocation;
  elevationRange: string;
  demResolution: string;
  coverageArea: string;
  riverLength: string;
  layers: DatasetLayerStatus;
  layerDetails?: Record<string, LayerMetadata>;
  isValidated: boolean;
  status?: string;
  loadedAt?: string;
  isRealDataDemonstration?: boolean;
  citation?: string;
  sourceMetadata?: Record<string, any>;
  crs?: string;
  sourceCrs?: string;
  modelCrs?: string;
  river?: { name: string; basin: string };
  downstreamLocations?: DownstreamLocation[];
  downstreamSettlements?: DownstreamLocation[];
  hydrologicalSeries?: HydrologicalSeries;
  defaultScenarioName?: string;
  type?: string;
}

// Scenario types
export type FailureType = 'instantaneous' | 'gradual' | 'partial' | 'overtopping' | 'piping';
export type ScenarioType = 'dam-break' | 'river-blockage' | 'normal-release' | 'high-release' | 'water-surge' | 'avalanche-debris-flow';
export type SimulationStatus = 'idle' | 'configuring' | 'ready' | 'running' | 'completed' | 'failed' | 'ENGINE_NOT_CONFIGURED';
export type ModelType = 'sph' | 'delft3d' | 'demo' | 'comparison';

export interface NaturalLakeParams {
  lakeAreaKm2: number;
  estimatedStorageMCM: number;
  breachLocation: string;
  releaseCondition: string;
  provenance: ParameterProvenance;
}

export interface ControlledReleaseParams {
  gateCount: number;
  dischargeCusecs: number;
  downstreamChannelCapacity: number;
  isSpillwayOvertopping: boolean;
}

export interface AvalancheDebrisParams {
  detachmentVolumeMCM: number;
  rockIceRatio: string;
  initialVelocityMs: number;
  valleyEntrainmentFactor: number;
  triggerMechanism: string;
}

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  hazardType?: HazardType | string;
  dam: Dam;
  failureType: FailureType;
  failureTrigger?: string;
  failureTriggerProvenance?: ParameterProvenance;
  reservoirLevel: number;
  reservoirLevelProvenance?: ParameterProvenance;
  breachWidth: number;
  breachWidthProvenance?: ParameterProvenance;
  breachDepth: number;
  breachFormationTime: number; // hours
  breachFormationTimeProvenance?: ParameterProvenance;
  simulationDuration: number; // hours
  manningCoefficient: number;
  gridResolution: number; // meters
  timestep: number; // seconds
  status: SimulationStatus;
  createdAt: string;
  naturalLake?: NaturalLakeParams;
  controlledRelease?: ControlledReleaseParams;
  avalancheDebris?: AvalancheDebrisParams;
  datasetId?: string;
}

// River blockage params
export interface RiverBlockageParams {
  blockageLocation: [number, number];
  blockageLength: number;
  blockageHeight: number;
  blockedFlowPercentage: number;
}

// Job Logging Entry
export interface JobLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}

// Simulation results
export interface SimulationResult {
  id: string;
  scenarioId: string;
  datasetId?: string;
  model?: string;
  modelVersion?: string;
  status?: string;
  mode?: 'REAL DATA' | 'DEMO';
  isDemoSimulation?: boolean;
  scientificNotice?: string;
  inundationArea: number; // km²
  maxDepth: number; // m
  maxVelocity: number; // m/s
  arrivalTime: number; // hours
  peakDischarge?: number; // m³/s
  populationAffected: number;
  buildingsAffected: number;
  roadsAffected: number; // km
  bridgesAffected: number;
  criticalInfrastructureAffected?: number;
  scaleFactor?: number;
  timeSteps: TimeStep[];
  floodPolygons?: FloodPolygon[];
  impactData: ImpactData;
  validationData?: ValidationResult;
  timestamp?: string;
  terrainSource?: string;
}

export interface TimeStep {
  time: number; // hours (0, 1, 2, 3, 4, 5, 6)
  inundationArea: number;
  maxDepth: number;
  maxVelocity: number;
  populationExposed: number;
  floodExtentGeoJSON: GeoJSONFeature;
}

export interface FloodPolygon {
  depthRange: [number, number];
  color: string;
  area: number;
  coordinates: number[][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Impact analysis
export interface AffectedSettlementDetail {
  name: string;
  distanceKm: number;
  population: number;
  depthM: number;
  arrivalTimeH: number;
  evacuationPriority: 'P1 - Immediate' | 'P2 - Urgent' | 'P3 - Moderate';
  isIntersects: boolean;
}

export interface CropImpact {
  available?: boolean;
  message?: string;
  totalSubmergedHectares: number;
  byCropType: { type: string; hectares: number; estLossCr: number }[];
}

export interface EvacuationRouteDetail {
  corridorName: string;
  status: 'CUT OFF' | 'AT RISK' | 'CLEAR / PRIMARY EVACUATION';
  submergedSegmentKm: number;
  safeHavenLocation: string;
}

export interface ImpactData {
  population: PopulationImpact;
  buildings: BuildingImpact;
  roads: RoadImpact;
  bridges: BridgeImpact;
  criticalInfrastructure: CriticalInfraImpact;
  crops?: CropImpact;
  affectedSettlements?: AffectedSettlementDetail[];
  evacuationCorridors?: EvacuationRouteDetail[];
}

export interface PopulationImpact {
  available?: boolean;
  message?: string;
  totalExposed: number;
  affectedVillages: number;
  majorTowns: number;
  highRisk: number;
  byDepth: { range: string; count: number; color: string }[];
  riskClassification: { level: string; count: number; color: string }[];
}

export interface BuildingImpact {
  available?: boolean;
  message?: string;
  totalExposed: number;
  severelyAffected: number;
  byType: { type: string; count: number }[];
}

export interface RoadImpact {
  available?: boolean;
  message?: string;
  totalLengthAffected: number; // km
  majorHighways: number;
  localRoads: number;
}

export interface BridgeImpact {
  available?: boolean;
  message?: string;
  totalAffected: number;
  destroyed: number;
  damaged: number;
}

export interface CriticalInfraImpact {
  available?: boolean;
  message?: string;
  hospitals: number;
  schools: number;
  policeStations: number;
  powerStations: number;
  governmentBuildings: number;
  totalFacilitiesAtRisk?: number;
}

// Satellite validation
export interface ValidationResult {
  predictedArea: number;
  observedArea: number;
  overlap: number;
  falsePositive: number;
  falseNegative: number;
  agreement: number;
  csi?: number;
  iou?: number;
  hitRate?: number;
  precision?: number;
  confusionMatrix: {
    truePositive: number;
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
  };
  satelliteAcquisitionTime?: string;
  acquisitionTimestamp?: string;
  simulationTime?: string;
  simulationTimestamp?: string;
  cloudCoverage?: number;
  status: 'acceptable' | 'marginal' | 'poor';
  isDemoSatelliteData?: boolean;
  mode?: string;
  geeStatus?: string;
  geeDiagnostic?: string;
  satelliteSensor?: string;
  scientificNotice?: string;
}

// Scenario comparison metric
export interface ScenarioComparisonMetric {
  metric: string;
  scenarioA: number | string;
  scenarioB: number | string;
  scenarioC: number | string;
  unit?: string;
}

// Navigation
export type PageId = 'dashboard' | 'data-input' | 'scenario-setup' | 'run-simulation' | 'results' | 'impact' | 'comparison' | 'validation' | 'reports' | 'about';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

// Downstream location
export interface DownstreamLocation {
  name: string;
  distance: number; // km from dam
  population: number;
  lat: number;
  lng: number;
  arrivalTime: number; // hours
  maxDepth: number;
}

// Simulation step for progress
export interface SimulationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  description: string;
}

// Chart data
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Engine Status
export interface EngineStatusInfo {
  model: string;
  name: string;
  version?: string;
  status: 'CONNECTED' | 'ENGINE_NOT_CONFIGURED' | 'AVAILABLE';
  isAvailable: boolean;
  diagnosticMessage?: string;
  executablePath?: string;
  libraries?: string[];
  message?: string;
}

export interface AllEnginesStatus {
  sph: EngineStatusInfo;
  delft3d: EngineStatusInfo;
  demo: EngineStatusInfo;
  gis: {
    name: string;
    status: string;
    libraries: string[];
    isAvailable: boolean;
  };
  gee: {
    status: string;
    isConfigured: boolean;
    projectId?: string;
    serviceAccount?: string;
    message: string;
  };
}

// Export
export type ExportFormat = 'pdf' | 'geojson' | 'shp' | 'kml' | 'csv';
export type ReportType = 'flood-inundation' | 'scenario-comparison' | 'hadr-impact' | 'satellite-validation';
