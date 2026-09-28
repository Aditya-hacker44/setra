import { Scenario, SimulationResult, SimulationStep } from '@/types';
import { simulateFloodScenario as engineSimulate } from './simulationEngine';
import { exportGeoJSON, exportKML, exportCSV, exportPDFReport, downloadBlob } from './exportEngine';

export { downloadBlob };

// Backward-compatible simulation invoker delegating to the separate Simulation Engine
export async function simulateFloodScenario(
  scenario: Scenario,
  onProgress: (step: SimulationStep, stepIndex: number) => void
): Promise<SimulationResult> {
  return engineSimulate(scenario, null, 'demo', 'demo', onProgress);
}

// Backward-compatible report generator delegating to Export Engine
export function generateReport(
  type: string,
  format: string,
  scenario?: Scenario,
  result?: SimulationResult | null
): Blob {
  const sc = scenario || {
    id: 'SCENARIO-UK-001',
    name: 'Tehri Dam — Instantaneous Failure',
    type: 'dam-break' as const,
    dam: {
      id: 'tehri-dam',
      name: 'Tehri Dam',
      state: 'Uttarakhand',
      river: 'Bhagirathi River',
      basin: 'Ganga Basin',
      height: 260,
      reservoirLevel: 830,
      maxReservoirLevel: 835,
      reservoirVolume: 3540,
      lat: 30.3778,
      lng: 78.4806,
    },
    failureType: 'instantaneous' as const,
    reservoirLevel: 830,
    breachWidth: 100,
    breachDepth: 80,
    breachFormationTime: 0.5,
    simulationDuration: 6,
    manningCoefficient: 0.035,
    gridResolution: 30,
    timestep: 10,
    status: 'ready' as const,
    createdAt: new Date().toISOString(),
  };

  const fmt = (format || 'pdf').toLowerCase();

  if (fmt === 'geojson') {
    return exportGeoJSON(sc, result || null);
  }
  if (fmt === 'kml') {
    return exportKML(sc, result || null);
  }
  if (fmt === 'csv') {
    return exportCSV(sc, result || null);
  }
  return exportPDFReport(type, sc, result || null);
}
