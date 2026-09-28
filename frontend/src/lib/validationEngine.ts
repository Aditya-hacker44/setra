import { SimulationResult, ValidationResult, DemoDataset } from '@/types';

/**
 * Satellite Inundation Cross-Validation Engine.
 * Cross-references hydrodynamic model extent with simulated Sentinel-1 SAR observations.
 * Explicitly designated as DEMO SATELLITE DATA.
 */
export function calculateValidation(
  simResult: Partial<SimulationResult>,
  dataset?: DemoDataset
): ValidationResult {
  const predictedArea = simResult.inundationArea || 235;
  const ratio = Math.max(0.3, predictedArea / 235);

  const observedArea = Math.round(221 * ratio);
  const overlap = Math.round(198 * ratio);
  const falsePositive = Math.max(0, predictedArea - overlap);
  const falseNegative = Math.max(0, observedArea - overlap);
  const trueNegative = 1450;

  const denominator = overlap + falsePositive + falseNegative;
  const agreement = denominator > 0 ? Math.round((overlap / denominator) * 100) : 84;
  const csi = denominator > 0 ? +(overlap / denominator).toFixed(2) : 0.76;
  const hitRate = observedArea > 0 ? +(overlap / observedArea).toFixed(2) : 0.89;

  const status: 'acceptable' | 'marginal' | 'poor' = 
    agreement >= 80 ? 'acceptable' : agreement >= 65 ? 'marginal' : 'poor';

  return {
    predictedArea,
    observedArea,
    overlap,
    falsePositive,
    falseNegative,
    agreement,
    csi,
    hitRate,
    confusionMatrix: {
      truePositive: overlap,
      trueNegative,
      falsePositive,
      falseNegative,
    },
    satelliteAcquisitionTime: '2024-09-15T06:30:00Z',
    simulationTime: '2024-09-15T04:00:00Z',
    cloudCoverage: 12,
    status,
    isDemoSatelliteData: true,
  };
}
