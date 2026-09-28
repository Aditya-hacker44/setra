'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PageId,
  User,
  DemoDataset,
  Scenario,
  SimulationResult,
  SimulationStatus,
  ImpactData,
  ValidationResult,
  ScenarioComparisonMetric,
  JobLogEntry,
  AllEnginesStatus,
} from '@/types';
import {
  defaultScenario,
  tehriDemoDataset,
  hirakudDataset,
  idukkiDataset,
  sardarSarovarDataset,
  indianDatasets,
  scenarioComparison,
  defaultImpactData,
  defaultValidation,
  tehriDam,
} from '@/data/demoDataset';
import { ApiClient } from './apiClient';

export interface AppState {
  // Authentication
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  login: (email: string, pass: string) => boolean;
  registerGovernmentUser: (userData: {
    name: string;
    email: string;
    password: string;
    agency: string;
    department: string;
    designation: string;
    state?: string;
    govId?: string;
  }) => { success: boolean; message: string };
  registeredUsers: User[];
  loginAsDemo: () => void;
  logout: () => void;

  // Navigation
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;

  // Operating Mode: DEMO MODE vs REAL DATA MODE (Requirement 30)
  activeMode: 'demo' | 'real';
  setActiveMode: (mode: 'demo' | 'real') => void;
  demoMode: boolean; // backwards compatibility alias
  setDemoMode: (d: boolean) => void;

  // Central Dataset & Generalization (Requirement 4, 6, 32)
  currentDataset: DemoDataset | null;
  setCurrentDataset: (d: DemoDataset | null) => void;
  activeDataset: DemoDataset | null; // null in Real Data Mode when none selected
  availableDatasets: DemoDataset[];
  allDatasets: DemoDataset[]; // alias
  selectDatasetById: (id: string) => void;
  setActiveDatasetId: (id: string) => void; // alias
  addCustomDataset: (dataset: DemoDataset) => void;
  loadDemoDataset: () => void;
  dataValidated: boolean;
  setDataValidated: (v: boolean) => void;
  validationReport: any | null;
  setValidationReport: (r: any | null) => void;
  qualityReport: any | null; // alias

  // Scenario Management (Requirement 7-9)
  currentScenario: Scenario;
  setCurrentScenario: (s: Scenario) => void;
  scenario: Scenario; // alias
  setScenario: (s: Scenario) => void;

  // Hydrodynamic Model Selection (Requirement 12-14)
  selectedModel: 'sph' | 'delft3d' | 'demo';
  setSelectedModel: (m: 'sph' | 'delft3d' | 'demo') => void;
  engineStatuses: AllEnginesStatus | null;
  refreshEngineStatuses: () => Promise<void>;

  // Simulation Job System & Logging (Requirement 26)
  simulationStatus: SimulationStatus;
  setSimulationStatus: (s: SimulationStatus) => void;
  simulationProgress: number;
  setSimulationProgress: (p: number) => void;
  simulationLogs: JobLogEntry[];
  addSimulationLog: (log: JobLogEntry) => void;
  clearSimulationLogs: () => void;
  simulationResults: SimulationResult | null;
  setSimulationResults: (r: SimulationResult | null) => void;
  simulationResult: SimulationResult | null; // alias
  setSimulationResult: (r: SimulationResult | null) => void;

  // Flood Time Animation & GIS (Requirement 17-18)
  currentSimulationTime: number; // 0 to 6 hours
  setCurrentSimulationTime: (t: number) => void;
  currentTimeStep: number; // alias
  setCurrentTimeStep: (t: number) => void;
  timeSliderIndex: number; // alias
  setTimeSliderIndex: (t: number | ((prev: number) => number)) => void; // alias
  activeMapLayer: string;
  setActiveMapLayer: (l: string) => void;

  // Downstream Analytics & Impact (Requirement 19-23)
  impactResults: ImpactData | null;
  setImpactResults: (i: ImpactData | null) => void;
  comparisonResults: ScenarioComparisonMetric[];
  setComparisonResults: (c: ScenarioComparisonMetric[]) => void;
  validationResults: ValidationResult | null;
  setValidationResults: (v: ValidationResult | null) => void;

  // Reset
  resetDemo: () => void;
}

const AppContext = createContext<AppState | null>(null);

interface StoredAccount {
  email: string;
  pass: string;
  user: User;
}

const DEFAULT_DEMO_USER: User = {
  id: 'USER-NDSA-01',
  name: 'Dr. R. Sharma',
  email: 'director.flood@cwc.gov.in',
  role: 'Chief Hydrologist & Disaster Analyst',
  agency: 'Central Water Commission (CWC)',
  department: 'Ministry of Jal Shakti, Govt. of India',
  designation: 'Director (Flood Forecasting)',
  state: 'National HQ (New Delhi)',
  govId: 'CWC-DEL-8942',
  registeredAt: '2024-01-15T00:00:00Z',
};

const INITIAL_GOV_ACCOUNTS: StoredAccount[] = [
  {
    email: 'director.flood@cwc.gov.in',
    pass: 'cwc@2026',
    user: DEFAULT_DEMO_USER,
  },
  {
    email: 'ndsa.inspector@nic.in',
    pass: 'ndsa@2026',
    user: {
      id: 'USER-NDSA-02',
      name: 'Er. Sunita Verma',
      email: 'ndsa.inspector@nic.in',
      role: 'Dam Safety Inspector',
      agency: 'National Dam Safety Authority (NDSA)',
      department: 'Ministry of Jal Shakti',
      designation: 'Superintending Engineer (Safety Audits)',
      state: 'Uttarakhand Basin',
      govId: 'NDSA-UK-5510',
      registeredAt: '2024-02-01T00:00:00Z',
    },
  },
  {
    email: 'demo@setra.in',
    pass: 'demo123',
    user: DEFAULT_DEMO_USER,
  },
];

const DEFAULT_ENGINE_STATUSES: AllEnginesStatus = {
  sph: {
    model: 'SPH',
    name: 'SPH (Smoothed Particle Hydrodynamics)',
    version: '2.4.0-adapter',
    status: 'ENGINE_NOT_CONFIGURED',
    isAvailable: false,
    diagnosticMessage: 'SPH Solver is NOT CONFIGURED. To run actual SPH simulations, install PySPH or DualSPHysics.',
  },
  delft3d: {
    model: 'DELFT3D',
    name: 'Delft3D Flexible Mesh (D-Flow FM)',
    version: '2024.03-adapter',
    status: 'ENGINE_NOT_CONFIGURED',
    isAvailable: false,
    diagnosticMessage: 'Delft3D-FM is NOT CONFIGURED. Install Deltares Delft3D-FM and configure DELFT3D_PATH.',
  },
  demo: {
    model: 'DEMO',
    name: 'SETRA Calibrated Hydrodynamic Engine',
    version: '2.1.0-calibrated',
    status: 'AVAILABLE',
    isAvailable: true,
    diagnosticMessage: 'Demo Engine operational with 2D shallow water physics.',
  },
  gis: {
    name: 'SETRA Geospatial Processing Engine',
    status: 'CONNECTED',
    libraries: ['GeoPandas 1.1.4', 'Rasterio 1.5.1', 'Shapely 2.1.2', 'PyProj 3.8.0', 'PyShp 3.1.6'],
    isAvailable: true,
  },
  gee: {
    status: 'GEE_NOT_CONFIGURED',
    isConfigured: false,
    message: 'GEE NOT CONFIGURED. Set GEE_PROJECT_ID and GEE_SERVICE_ACCOUNT in backend/.env for live Sentinel-1 SAR ingestion.',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Mode: Real Data Mode vs Demo Mode
  const [activeMode, _setActiveMode] = useState<'demo' | 'real'>('demo');
  const [hasUserSelectedDataset, setHasUserSelectedDataset] = useState<boolean>(false);

  // Dataset
  const [currentDataset, setCurrentDataset] = useState<DemoDataset | null>(tehriDemoDataset);
  const [availableDatasets, setAvailableDatasets] = useState<DemoDataset[]>(indianDatasets);
  const [dataValidated, setDataValidated] = useState<boolean>(true);
  const [validationReport, setValidationReport] = useState<any | null>(null);

  // Scenario
  const [currentScenario, setCurrentScenario] = useState<Scenario>(defaultScenario);

  // Models
  const [selectedModel, _setSelectedModel] = useState<'sph' | 'delft3d' | 'demo'>('demo');
  const [engineStatuses, setEngineStatuses] = useState<AllEnginesStatus | null>(DEFAULT_ENGINE_STATUSES);

  const setSelectedModel = (m: 'sph' | 'delft3d' | 'demo') => {
    if (activeMode === 'real' && m === 'demo') {
      console.warn('Demo Engine cannot be selected in Real Data Mode');
      return;
    }
    _setSelectedModel(m);
  };

  // Custom mode switcher enforcing scientific honesty
  const setActiveMode = (mode: 'demo' | 'real') => {
    _setActiveMode(mode);
    if (mode === 'real') {
      // In Real Data Mode, Demo Engine is strictly prohibited
      if (selectedModel === 'demo') {
        _setSelectedModel('delft3d');
      }
      // If user has not explicitly selected a dataset, do NOT auto-assign Tehri
      if (!hasUserSelectedDataset) {
        setCurrentDataset(null);
        setCurrentScenario((prev) => ({
          ...prev,
          id: 'SCENARIO-REAL-PENDING',
          name: 'Real Basin Simulation Scenario',
          dam: {
            id: 'unselected-dam',
            name: 'No Dam Selected',
            state: '—',
            river: '—',
            basin: '—',
            height: 0,
            reservoirLevel: 0,
            maxReservoirLevel: 0,
            reservoirVolume: 0,
            spillwayCapacity: 0,
            lat: 20.5937,
            lng: 78.9629,
          },
          datasetId: '',
        }));
      }
    } else {
      // In Demo Mode, load Tehri as sample demonstration dataset and select Demo Engine
      if (!currentDataset) {
        setCurrentDataset(tehriDemoDataset);
      }
      _setSelectedModel('demo');
      setCurrentScenario(defaultScenario);
    }
  };

  // Simulation Job
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('idle');
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<JobLogEntry[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);

  // Time & Layer
  const [currentSimulationTime, setCurrentSimulationTime] = useState<number>(0);
  const [activeMapLayer, setActiveMapLayer] = useState<string>('depth');

  // Impact & Validation
  const [impactResults, setImpactResults] = useState<ImpactData | null>(defaultImpactData);
  const [comparisonResults, setComparisonResults] = useState<ScenarioComparisonMetric[]>(scenarioComparison.metrics);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(defaultValidation);

  // Check backend engine statuses on mount
  useEffect(() => {
    refreshEngineStatuses();
  }, []);

  const refreshEngineStatuses = async () => {
    const statuses = await ApiClient.getEngineStatuses();
    if (statuses) {
      setEngineStatuses(statuses);
    }
  };

  // Registered Government Accounts & Authentication
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('setra_gov_officials');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // fallback to defaults
      }
    }
    return INITIAL_GOV_ACCOUNTS;
  });

  const registerGovernmentUser = (userData: {
    name: string;
    email: string;
    password: string;
    agency: string;
    department: string;
    designation: string;
    state?: string;
    govId?: string;
  }) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'This official government email is already registered.' };
    }

    const newUser: User = {
      id: `GOV-${Date.now().toString().slice(-4)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      role: 'Authorized Government Official',
      agency: userData.agency.trim() || 'Central Water Commission (CWC)',
      department: userData.department.trim() || 'Ministry of Jal Shakti, Govt. of India',
      designation: userData.designation.trim() || 'Executive Hydrologist',
      state: userData.state?.trim() || 'National HQ',
      govId: userData.govId?.trim() || `GOV-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      registeredAt: new Date().toISOString(),
    };

    const newAccount: StoredAccount = {
      email: cleanEmail,
      pass: userData.password,
      user: newUser,
    };

    const updated = [newAccount, ...accounts];
    setAccounts(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('setra_gov_officials', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      message: `Official account registered successfully for ${userData.name}. You may now sign in using your official email.`,
    };
  };

  // Login handlers
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.pass === cleanPass
    );
    if (found) {
      setCurrentUser(found.user);
      setCurrentPage('dashboard');
      return true;
    }
    return false;
  };

  const loginAsDemo = () => {
    setCurrentUser(DEFAULT_DEMO_USER);
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  // Generalized Dataset Selection
  const selectDatasetById = (id: string) => {
    const found = availableDatasets.find((d) => d.id === id || (d as any).datasetId === id);
    if (!found) {
      console.warn(`Dataset ${id} not found in availableDatasets`);
      return;
    }
    setHasUserSelectedDataset(true);
    setCurrentDataset(found);
    setDataValidated(true);
    
    // Automatically update active scenario structure
    if (found.isDam === false || found.hazardType === 'AVALANCHE_DEBRIS_FLOW') {
      setCurrentScenario((prev) => ({
        ...prev,
        id: `SCENARIO-${found.id}`,
        name: found.defaultScenarioName || '2021 Chamoli Rishi Ganga Event',
        type: 'avalanche-debris-flow',
        hazardType: 'AVALANCHE_DEBRIS_FLOW',
        dam: found.dam || {
          id: 'source-ronti-peak',
          name: 'Ronti Peak Detachment Zone',
          state: found.state,
          river: found.riverSystem || 'Ronti Gad → Rishiganga → Dhauliganga',
          basin: 'Alaknanda / Upper Ganga Catchment',
          height: 0,
          reservoirLevel: 0,
          maxReservoirLevel: 0,
          reservoirVolume: 0,
          spillwayCapacity: 0,
          lat: found.sourceLocation?.lat || 30.3780,
          lng: found.sourceLocation?.lng || 79.7320,
        },
        datasetId: found.id,
        reservoirLevel: 0,
        failureType: 'instantaneous',
        failureTrigger: 'Rock-Ice Avalanche Detachment (~27M m³)',
      }));
    } else {
      setCurrentScenario((prev) => ({
        ...prev,
        id: `SCENARIO-${found.id}`,
        dam: found.dam,
        datasetId: found.id,
        name: `${found.dam.name} — ${prev?.failureType ? (prev.failureType.charAt(0).toUpperCase() + prev.failureType.slice(1)) : 'Instantaneous'} Failure`,
        reservoirLevel: found.dam.reservoirLevel,
      }));
    }
  };

  // Add custom uploaded dataset
  const addCustomDataset = (dataset: DemoDataset) => {
    setAvailableDatasets((prev) => [dataset, ...prev]);
    setHasUserSelectedDataset(true);
    setCurrentDataset(dataset);
    setDataValidated(true);
    setCurrentScenario((prev) => ({
      ...prev,
      id: `SCENARIO-${dataset.id}`,
      dam: dataset.dam,
      datasetId: dataset.id,
      name: dataset.isDam === false ? (dataset.defaultScenarioName || dataset.name) : `${dataset.dam.name} — Instantaneous Failure`,
      reservoirLevel: dataset.dam?.reservoirLevel || 0,
    }));
  };

  // Load demo dataset (strictly for Demo Mode)
  const loadDemoDataset = () => {
    setHasUserSelectedDataset(true);
    selectDatasetById('DATASET-IN-TEHRI');
    setActiveMode('demo');
    setDataValidated(true);
  };

  // Reset entire state
  const resetDemo = () => {
    setHasUserSelectedDataset(false);
    setCurrentDataset(tehriDemoDataset);
    setDataValidated(false);
    setValidationReport(null);
    setCurrentScenario(defaultScenario);
    _setSelectedModel('demo');
    setSimulationStatus('idle');
    setSimulationProgress(0);
    setSimulationLogs([]);
    setSimulationResults(null);
    setCurrentSimulationTime(0);
    setActiveMapLayer('depth');
    setImpactResults(defaultImpactData);
    setComparisonResults(scenarioComparison.metrics);
    setValidationResults(defaultValidation);
    _setActiveMode('demo');
  };

  const addSimulationLog = (log: JobLogEntry) => {
    setSimulationLogs((prev) => [...prev, log]);
  };

  const clearSimulationLogs = () => {
    setSimulationLogs([]);
  };

  // Synchronize aliases
  const demoMode = activeMode === 'demo';
  const setDemoMode = (d: boolean) => setActiveMode(d ? 'demo' : 'real');
  const setScenario = (s: Scenario) => setCurrentScenario(s);
  const setSimulationResult = (r: SimulationResult | null) => {
    setSimulationResults(r);
    if (r?.impactData) {
      setImpactResults(r.impactData);
    }
  };
  const setCurrentTimeStep = (t: number) => setCurrentSimulationTime(t);

  // Active dataset: strictly null in Real Data Mode if none selected; sample dataset in Demo Mode
  const activeDataset = activeMode === 'demo' ? (currentDataset || tehriDemoDataset) : currentDataset;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        registerGovernmentUser,
        registeredUsers: accounts.map((a) => a.user),
        loginAsDemo,
        logout,

        currentPage,
        setCurrentPage,

        activeMode,
        setActiveMode,
        demoMode,
        setDemoMode,

        currentDataset,
        setCurrentDataset,
        activeDataset,
        availableDatasets,
        allDatasets: availableDatasets,
        selectDatasetById,
        setActiveDatasetId: selectDatasetById,
        addCustomDataset,
        loadDemoDataset,
        dataValidated,
        setDataValidated,
        validationReport,
        setValidationReport,
        qualityReport: validationReport,

        currentScenario,
        setCurrentScenario,
        scenario: currentScenario,
        setScenario,

        selectedModel,
        setSelectedModel,
        engineStatuses,
        refreshEngineStatuses,

        simulationStatus,
        setSimulationStatus,
        simulationProgress,
        setSimulationProgress,
        simulationLogs,
        addSimulationLog,
        clearSimulationLogs,
        simulationResults,
        setSimulationResults,
        simulationResult: simulationResults,
        setSimulationResult,

        currentSimulationTime,
        setCurrentSimulationTime,
        currentTimeStep: currentSimulationTime,
        setCurrentTimeStep,
        timeSliderIndex: currentSimulationTime,
        setTimeSliderIndex: (val: number | ((prev: number) => number)) => {
          if (typeof val === 'function') {
            setCurrentSimulationTime(prev => (val as (p: number) => number)(prev));
          } else {
            setCurrentSimulationTime(val);
          }
        },
        activeMapLayer,
        setActiveMapLayer,

        impactResults,
        setImpactResults,
        comparisonResults,
        setComparisonResults,
        validationResults,
        setValidationResults,

        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return ctx;
}
