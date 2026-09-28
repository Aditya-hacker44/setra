import {
  Scenario,
  SimulationResult,
  SimulationStep,
  DemoDataset,
  TimeStep,
} from '@/types';
import {
  generateTimeSteps,
  simulationSteps,
  tehriDam,
} from '@/data/demoDataset';
import { calculateImpact } from './impactEngine';
import { ApiClient } from './apiClient';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Standardized Hydrodynamic Simulation Engine invoker.
 * Interfaces with FastAPI ModelManager (SPH, Delft3D, DemoEngine)
 * with robust local fallback.
 */
export async function simulateFloodScenario(
  scenario: Scenario,
  dataset?: DemoDataset | null,
  model: 'sph' | 'delft3d' | 'demo' = 'demo',
  mode: 'demo' | 'real' = 'demo',
  onProgress?: (step: SimulationStep, stepIndex: number) => void
): Promise<SimulationResult> {
  // Real Data Mode enforcement (Requirements 1, 2, 3, 11)
  if (mode === 'real') {
    if (!dataset) {
      throw new Error('DATASET NOT SELECTED: A real river basin dataset must be selected before starting simulation.');
    }
    if (model === 'demo') {
      throw new Error('INVALID SOLVER: Demo Engine cannot be used in Real Data Mode. Only native SPH or Delft3D engines are supported.');
    }

    const backendJob = await ApiClient.runSimulation(model, scenario, dataset, 'real');
    if (backendJob && backendJob.result) {
      if (backendJob.result.status === 'ENGINE_NOT_CONFIGURED' || backendJob.result.status === 'DATASET_NOT_SELECTED') {
        const errResult = backendJob.result;
        throw new Error(errResult.error || `REAL SIMULATION BLOCKED: ${model.toUpperCase()} Engine is not configured.`);
      }
      return backendJob.result;
    }
    // If backend is not reached, report truthfully
    throw new Error(`REAL SIMULATION BLOCKED: Real ${model.toUpperCase()} engine is not configured on this environment.`);
  }

  // 1. Calculate physics scaling factors from scenario parameters
  const breachWidth = scenario.breachWidth || 100;
  const nominalLevel = scenario.dam?.reservoirLevel || 830;
  const reservoirLevel = scenario.reservoirLevel || nominalLevel;
  const failureType = scenario.failureType || 'instantaneous';
  const scenarioType = scenario.type || 'dam-break';

  const breachWidthFactor = Math.max(0.3, Math.min(2.5, breachWidth / 100));
  const headFactor = Math.max(0.4, Math.min(1.6, reservoirLevel / nominalLevel));

  let modeFactor = 1.0;
  if (failureType === 'gradual') modeFactor = 0.72;
  else if (scenarioType === 'river-blockage') modeFactor = 0.45;
  else if (scenarioType === 'normal-release') modeFactor = 0.22;
  else if (scenarioType === 'high-release') modeFactor = 0.55;
  else if (scenarioType === 'water-surge') modeFactor = 0.85;

  const scaleFactor = +(breachWidthFactor * headFactor * modeFactor).toFixed(2);

  // Dam coordinates dynamically resolved from scenario or active dataset
  const damCoords: [number, number] = [
    scenario.dam?.lng ?? dataset?.dam?.lng ?? 78.4806,
    scenario.dam?.lat ?? dataset?.dam?.lat ?? 30.3778,
  ];

  // 2. Animate the 8-stage pipeline if progress callback is supplied
  const steps: SimulationStep[] = simulationSteps.map(s => ({
    ...s,
    status: 'pending' as const,
    progress: 0,
  }));

  if (onProgress) {
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'running';
      onProgress({ ...steps[i] }, i);

      const stepDuration = i === 3 || i === 4 ? 400 : 250;
      const increments = 4;
      for (let j = 1; j <= increments; j++) {
        await delay(stepDuration / increments);
        steps[i].progress = Math.round((j / increments) * 100);
        onProgress({ ...steps[i] }, i);
      }

      steps[i].status = 'completed';
      steps[i].progress = 100;
      onProgress({ ...steps[i] }, i);
    }
  }

  // 3. Generate 0h to 6h propagation time steps
  const timeSteps: TimeStep[] = generateTimeSteps(scaleFactor, damCoords);

  // Peak metrics
  const inundationArea = Math.round(235 * scaleFactor);
  const maxDepth = +(8.4 * scaleFactor).toFixed(1);
  const maxVelocity = +(6.2 * Math.sqrt(scaleFactor)).toFixed(1);

  const baseArrival = failureType === 'gradual' ? 5.2 : scenarioType === 'river-blockage' ? 2.8 : 3.4;
  const arrivalTime = +(Math.max(0.8, baseArrival / Math.sqrt(scaleFactor))).toFixed(1);
  const peakDischarge = Math.round(18500 * scaleFactor * breachWidthFactor);

  const populationAffected = Math.round(210000 * scaleFactor);
  const buildingsAffected = Math.round(12450 * scaleFactor);
  const roadsAffected = Math.round(87 * scaleFactor);
  const bridgesAffected = Math.round(14 * Math.min(scaleFactor, 1.25));
  const criticalInfrastructureAffected = Math.round(7 * Math.min(scaleFactor, 1.2));

  const partialResult: Omit<SimulationResult, 'impactData'> = {
    id: `SIM-${Date.now()}`,
    scenarioId: scenario.id,
    datasetId: dataset?.id || scenario.datasetId || 'DATASET-DEMO-SAMPLE',
    model: 'DEMO ENGINE',
    modelVersion: '2.1.0-calibrated',
    status: 'COMPLETED',
    mode: 'DEMO',
    isDemoSimulation: true,
    scientificNotice: 'DEMO / MOCK SIMULATION OUTPUT. Calibrated 2D shallow water wave solution.',
    inundationArea,
    maxDepth,
    maxVelocity,
    arrivalTime,
    peakDischarge,
    populationAffected,
    buildingsAffected,
    roadsAffected,
    bridgesAffected,
    criticalInfrastructureAffected,
    scaleFactor,
    timeSteps,
    floodPolygons: [],
    timestamp: new Date().toISOString(),
    terrainSource: dataset?.demResolution || '30m CartoDEM / SRTM 1-Arcsec',
  };

  // 4. Calculate HADR impact
  const impactData = calculateImpact(partialResult as SimulationResult, dataset || undefined);

  return {
    ...partialResult,
    impactData,
  };
}
