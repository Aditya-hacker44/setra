import { AllEnginesStatus, DemoDataset, Scenario, SimulationResult, ValidationResult } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export class ApiClient {
  static async getEngineStatuses(): Promise<AllEnginesStatus | null> {
    try {
      const res = await fetch(`${API_BASE}/models/status`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async getDatasets(): Promise<DemoDataset[] | null> {
    try {
      const res = await fetch(`${API_BASE}/datasets`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async validateDataset(dataset: Partial<DemoDataset>): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/datasets/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataset),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async runSimulation(
    model: string,
    scenario: Scenario,
    dataset?: DemoDataset | null,
    mode: 'demo' | 'real' = 'demo'
  ): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, scenario, dataset, mode }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Simulation API error');
      }
      return await res.json();
    } catch (e) {
      console.warn('Backend API run error, falling back to local client solver:', e);
      return null;
    }
  }

  static async getJobStatus(jobId: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/simulations/${jobId}/status`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async getJobResults(jobId: string): Promise<SimulationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/simulations/${jobId}/results`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async getSatelliteValidation(
    simResult: Partial<SimulationResult>,
    dataset?: DemoDataset | null,
    forceDemo = false
  ): Promise<ValidationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/validation/satellite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationResult: simResult, dataset, forceDemo }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static getExportUrl(simulationId: string, format: 'shp' | 'kml' | 'geojson' | 'csv'): string {
    return `${API_BASE}/export/${simulationId}/${format}`;
  }
}

export const apiClient = {
  getModelStatus: ApiClient.getEngineStatuses,
  getEngineStatuses: ApiClient.getEngineStatuses,
  getDatasets: ApiClient.getDatasets,
  validateDataset: ApiClient.validateDataset,
  runSimulation: ApiClient.runSimulation,
  getJobStatus: ApiClient.getJobStatus,
  getJobResults: ApiClient.getJobResults,
  getSatelliteValidation: ApiClient.getSatelliteValidation,
  getExportUrl: ApiClient.getExportUrl,
};
