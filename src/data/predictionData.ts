import type { AIPrediction, SensorReading } from '../types';

export const initialPredictions: AIPrediction[] = [
  {
    aircraftId: 'AC-001',
    healthScore: 94,
    failureProbability: 4,
    remainingUsefulLife: 4800,
    riskLevel: 'low',
    confidenceScore: 97.2,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '> 6 months',
    maintenanceRecommendation: 'No immediate action required. Continue routine monitoring per schedule.',
    topContributors: [
      { factor: 'EGT Margin', weight: 0.31 },
      { factor: 'Oil Consumption Rate', weight: 0.24 },
      { factor: 'Vibration Level', weight: 0.19 },
      { factor: 'Compressor Efficiency', weight: 0.15 },
      { factor: 'Fan Blade Erosion', weight: 0.11 },
    ],
  },
  {
    aircraftId: 'AC-002',
    healthScore: 71,
    failureProbability: 28,
    remainingUsefulLife: 1200,
    riskLevel: 'medium',
    confidenceScore: 94.8,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '3–4 weeks',
    maintenanceRecommendation: 'Schedule fan blade inspection within next 200 cycles. Monitor vibration trends.',
    topContributors: [
      { factor: 'Vibration Signature', weight: 0.42 },
      { factor: 'Fan Blade Condition', weight: 0.28 },
      { factor: 'EGT Margin', weight: 0.18 },
      { factor: 'Oil Metal Content', weight: 0.12 },
    ],
  },
  {
    aircraftId: 'AC-003',
    healthScore: 42,
    failureProbability: 71,
    remainingUsefulLife: 180,
    riskLevel: 'critical',
    confidenceScore: 98.1,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '< 48 hours',
    maintenanceRecommendation: 'IMMEDIATE: Ground aircraft. Engine teardown required. Do not dispatch.',
    topContributors: [
      { factor: 'EGT Exceedance', weight: 0.48 },
      { factor: 'HPT Blade Erosion', weight: 0.31 },
      { factor: 'Compressor Surge Margin', weight: 0.13 },
      { factor: 'Oil Metal Debris', weight: 0.08 },
    ],
  },
  {
    aircraftId: 'AC-004',
    healthScore: 97,
    failureProbability: 2,
    remainingUsefulLife: 6200,
    riskLevel: 'low',
    confidenceScore: 96.5,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '> 9 months',
    maintenanceRecommendation: 'Excellent condition. No unscheduled maintenance required.',
    topContributors: [
      { factor: 'EGT Margin', weight: 0.28 },
      { factor: 'Compressor Efficiency', weight: 0.25 },
      { factor: 'Oil Quality', weight: 0.24 },
      { factor: 'Vibration Level', weight: 0.23 },
    ],
  },
  {
    aircraftId: 'AC-005',
    healthScore: 65,
    failureProbability: 38,
    remainingUsefulLife: 820,
    riskLevel: 'high',
    confidenceScore: 93.4,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '10–14 days',
    maintenanceRecommendation: 'Oil system inspection priority HIGH. Reduce cycle utilisation until completed.',
    topContributors: [
      { factor: 'Oil Pressure Trend', weight: 0.39 },
      { factor: 'Oil Metal Content', weight: 0.31 },
      { factor: 'Bearing Temperature', weight: 0.20 },
      { factor: 'Fuel Efficiency Loss', weight: 0.10 },
    ],
  },
  {
    aircraftId: 'AC-006',
    healthScore: 55,
    failureProbability: 45,
    remainingUsefulLife: 600,
    riskLevel: 'high',
    confidenceScore: 95.2,
    predictionTimestamp: Date.now(),
    nextFailureWindow: '1–2 weeks post C-check',
    maintenanceRecommendation: 'Complete C-check per schedule. Post-check re-evaluation required before return to service.',
    topContributors: [
      { factor: 'Accumulated Cycles', weight: 0.34 },
      { factor: 'EGT Deterioration', weight: 0.27 },
      { factor: 'LPC Blade Condition', weight: 0.22 },
      { factor: 'Accessory Gearbox', weight: 0.17 },
    ],
  },
];

export function updatePrediction(pred: AIPrediction, reading: SensorReading): AIPrediction {
  const hs = reading.healthScore;
  const fp = reading.failureProbability;
  const rul = reading.remainingUsefulLife;
  const risk =
    hs > 80 ? 'low' : hs > 65 ? 'medium' : hs > 45 ? 'high' : 'critical';
  const rec =
    risk === 'low'
      ? 'No immediate action required. Continue routine monitoring.'
      : risk === 'medium'
      ? 'Schedule inspection within next 200 flight cycles.'
      : risk === 'high'
      ? 'Priority maintenance required within 10 days. Increase monitoring frequency.'
      : 'IMMEDIATE ACTION: Ground aircraft. Unscheduled maintenance required urgently.';
  const window =
    risk === 'low' ? '> 6 months' : risk === 'medium' ? '3–4 weeks' : risk === 'high' ? '7–14 days' : '< 48 hours';
  return {
    ...pred,
    healthScore: Math.round(hs),
    failureProbability: Math.round(fp * 10) / 10,
    remainingUsefulLife: Math.round(rul),
    riskLevel: risk,
    maintenanceRecommendation: rec,
    nextFailureWindow: window,
    predictionTimestamp: Date.now(),
  };
}
