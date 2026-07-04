import type { FaultType } from '../types';

// ─── Per-component fault impact map ──────────────────────────────────────────
const FAULT_IMPACTS: Record<string, Record<string, number>> = {
  high_temperature:  { fan:-5,  lpc:-10, hpc:-15, combustor:-45, hpt:-38, lpt:-20, bearings:-8,  fuelSystem:-12, oilSystem:-5  },
  pressure_drop:     { fan:-15, lpc:-30, hpc:-42, combustor:-18, hpt:-10, lpt:-8,  bearings:-5,  fuelSystem:-5,  oilSystem:-5  },
  bearing_wear:      { fan:-12, lpc:-8,  hpc:-5,  combustor:-3,  hpt:-8,  lpt:-15, bearings:-55, fuelSystem:-2,  oilSystem:-18 },
  fuel_leakage:      { fan:-3,  lpc:-5,  hpc:-8,  combustor:-30, hpt:-15, lpt:-8,  bearings:-5,  fuelSystem:-50, oilSystem:-5  },
  high_vibration:    { fan:-45, lpc:-25, hpc:-18, combustor:-8,  hpt:-12, lpt:-15, bearings:-38, fuelSystem:-5,  oilSystem:-5  },
  oil_pressure_loss: { fan:-5,  lpc:-5,  hpc:-8,  combustor:-3,  hpt:-20, lpt:-15, bearings:-42, fuelSystem:-3,  oilSystem:-52 },
  compressor_damage: { fan:-10, lpc:-35, hpc:-48, combustor:-12, hpt:-8,  lpt:-5,  bearings:-10, fuelSystem:-3,  oilSystem:-5  },
  sensor_failure:    { fan:-5,  lpc:-5,  hpc:-5,  combustor:-5,  hpt:-5,  lpt:-5,  bearings:-5,  fuelSystem:-5,  oilSystem:-5  },
  weather_stress:    { fan:-22, lpc:-16, hpc:-12, combustor:-8,  hpt:-5,  lpt:-5,  bearings:-10, fuelSystem:-5,  oilSystem:-5  },
  bird_strike:       { fan:-65, lpc:-38, hpc:-16, combustor:-5,  hpt:-3,  lpt:-2,  bearings:-12, fuelSystem:-3,  oilSystem:-2  },
};

export function computeComponentHealth(
  baseHealth: number,
  fault: FaultType,
  componentId: string,
  tick: number
): number {
  const impact = fault ? (FAULT_IMPACTS[fault]?.[componentId] ?? -3) : 0;
  const noise = Math.sin(tick * 0.22 + componentId.charCodeAt(0) * 0.18) * 1.6;
  return Math.max(0, Math.min(100, baseHealth + impact * Math.min(1, tick * 0.05 + 0.2) + noise));
}

export function getHealthColor(health: number): string {
  if (health > 80) return '#00D4FF';
  if (health > 65) return '#38BDF8';
  if (health > 50) return '#F59E0B';
  if (health > 35) return '#F97316';
  return '#EF4444';
}

export function getHealthStatus(health: number): 'healthy' | 'warning' | 'critical' {
  if (health > 80) return 'healthy';
  if (health > 50) return 'warning';
  return 'critical';
}

// ─── Engine Component Definitions ────────────────────────────────────────────
export interface EngineZone {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  // SVG polygon points (viewBox 0 0 870 300)
  poly: string;
  // Label center position
  cx: number;
  cy: number;
  // Sensor mappings for tooltip
  primarySensor: string;
  unit: string;
  // Maintenance history entries
  maintenanceNotes: string[];
}

export const ENGINE_ZONES: EngineZone[] = [
  {
    id: 'fan',
    label: 'Fan Assembly',
    shortLabel: 'FAN',
    description: 'Low-pressure fan stage. Generates bypass thrust and feeds core airflow at compression ratio ≈2.0.',
    poly: '20,10 120,48 120,252 20,290',
    cx: 70, cy: 150,
    primarySensor: 'RPM',
    unit: 'RPM',
    maintenanceNotes: [
      '2026-03-12 – Fan blade eddy-current inspection. All blades serviceable.',
      '2025-11-20 – Fan balance check. 2g correction weight added at 270°.',
      '2025-06-08 – Borescope inspection. No FOD damage found.',
    ],
  },
  {
    id: 'lpc',
    label: 'Low Pressure Compressor',
    shortLabel: 'LPC',
    description: 'Provides initial compression (≈4:1 ratio). Feeds HPC. Susceptible to erosion at leading edges.',
    poly: '120,48 290,72 290,228 120,252',
    cx: 205, cy: 150,
    primarySensor: 'Pressure',
    unit: 'PSI',
    maintenanceNotes: [
      '2026-01-18 – LPC stator vane inspection. Stage 3 erosion noted, within limits.',
      '2025-08-05 – Tip clearance check. Clearances serviceable.',
    ],
  },
  {
    id: 'hpc',
    label: 'High Pressure Compressor',
    shortLabel: 'HPC',
    description: 'Multi-stage axial compressor. Delivers air at ≈30:1 pressure ratio to combustor. High EGT sensitivity.',
    poly: '290,72 440,92 440,208 290,228',
    cx: 365, cy: 150,
    primarySensor: 'Compressor Ratio',
    unit: ':1',
    maintenanceNotes: [
      '2026-04-20 – HPC performance recovery wash performed. EGT margin +8°C recovered.',
      '2025-12-10 – Stage 9 blisk inspection. No cracks found.',
    ],
  },
  {
    id: 'combustor',
    label: 'Combustion Chamber',
    shortLabel: 'COMB',
    description: 'Annular combustor. Fuel burns at ≈1600°C. Liner tiles and dilution holes are life-limited items.',
    poly: '440,92 545,84 545,216 440,208',
    cx: 493, cy: 150,
    primarySensor: 'EGT',
    unit: '°C',
    maintenanceNotes: [
      '2026-02-14 – Combustor liner inspection. 2 cracked tiles replaced. Cleared for service.',
      '2025-09-30 – Fuel nozzle flow-check. All nozzles within tolerance.',
    ],
  },
  {
    id: 'hpt',
    label: 'High Pressure Turbine',
    shortLabel: 'HPT',
    description: 'Extracts energy from hot combustion gases to drive HPC. Blade temperatures exceed 1000°C.',
    poly: '545,84 645,92 645,208 545,216',
    cx: 595, cy: 150,
    primarySensor: 'Temperature',
    unit: '°C',
    maintenanceNotes: [
      '2026-05-02 – HPT blade tip refurbishment. Abrasive tip restore applied.',
      '2025-10-15 – TBC (thermal barrier coating) integrity check. 3 blades re-coated.',
    ],
  },
  {
    id: 'lpt',
    label: 'Low Pressure Turbine',
    shortLabel: 'LPT',
    description: 'Drives LP fan via central shaft. Operates at lower temperature but high mechanical stress.',
    poly: '645,92 790,72 790,228 645,208',
    cx: 718, cy: 150,
    primarySensor: 'Vibration',
    unit: ' g',
    maintenanceNotes: [
      '2026-03-28 – LPT stage 5 blade inspection. No cracking. All blades serviceable.',
      '2025-07-20 – Rotor balance check post-reassembly. Q3 vibration within limits.',
    ],
  },
];

export interface SubsystemZone {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  primarySensor: string;
  unit: string;
  maintenanceNotes: string[];
}

export const SUBSYSTEM_ZONES: SubsystemZone[] = [
  {
    id: 'bearings',
    label: 'Bearing Assembly',
    shortLabel: 'BEARINGS',
    description: 'Front, mid, and rear rolling-element bearings. Oil-cooled. Critical for rotor support.',
    icon: '⚙',
    primarySensor: 'Vibration',
    unit: ' g',
    maintenanceNotes: [
      '2026-04-10 – Oil spectrometric analysis. Iron content elevated. Monitoring increased.',
      '2025-11-01 – Magnetic chip detector check. Fines present, within limits.',
    ],
  },
  {
    id: 'fuelSystem',
    label: 'Fuel System',
    shortLabel: 'FUEL SYS',
    description: 'High-pressure fuel manifold, flow divider, and fuel control unit. Delivers metered fuel to combustor.',
    icon: '⛽',
    primarySensor: 'Fuel Flow',
    unit: ' kg/hr',
    maintenanceNotes: [
      '2026-01-05 – Fuel filter P1 replaced. Differential pressure was 18 PSI.',
      '2025-08-22 – Fuel nozzle cleaning and flow-test. All within ±5% tolerance.',
    ],
  },
  {
    id: 'oilSystem',
    label: 'Oil System',
    shortLabel: 'OIL SYS',
    description: 'Pressure and scavenge system lubricating all bearings, gearbox, and accessory drives.',
    icon: '🛢',
    primarySensor: 'Oil Pressure',
    unit: ' PSI',
    maintenanceNotes: [
      '2026-05-18 – Oil sample analysis. Viscosity nominal. No metal contamination.',
      '2025-12-30 – Oil pressure regulating valve bench-test. Relief pressure 75 PSI, within spec.',
    ],
  },
];
