import type { SensorReading, FaultType } from '../types';

// ─── Baseline "healthy" sensor ranges ────────────────────────────────────────
const BASELINE = {
  temperature: 485,       // °C EGT nominal
  pressure: 142,          // PSI
  rpm: 14200,             // RPM
  fuelFlow: 1840,         // kg/hr
  oilPressure: 62,        // PSI
  vibration: 0.18,        // g
  exhaustGasTemp: 485,    // °C
  compressorRatio: 31.5,  // ratio
  healthScore: 92,
  failureProbability: 4,
  remainingUsefulLife: 4800,
};

// ─── Fault deltas (applied on top of baseline) ────────────────────────────────
const FAULT_DELTAS: Record<NonNullable<FaultType>, Partial<typeof BASELINE>> = {
  high_temperature: {
    temperature: 160,
    exhaustGasTemp: 175,
    healthScore: -38,
    failureProbability: 52,
    remainingUsefulLife: -1800,
  },
  pressure_drop: {
    pressure: -58,
    compressorRatio: -8,
    healthScore: -30,
    failureProbability: 44,
    remainingUsefulLife: -1400,
  },
  bearing_wear: {
    vibration: 0.94,
    rpm: -620,
    healthScore: -35,
    failureProbability: 61,
    remainingUsefulLife: -2100,
  },
  fuel_leakage: {
    fuelFlow: 420,
    pressure: -22,
    healthScore: -28,
    failureProbability: 49,
    remainingUsefulLife: -1200,
  },
  high_vibration: {
    vibration: 1.42,
    rpm: -380,
    healthScore: -42,
    failureProbability: 68,
    remainingUsefulLife: -2400,
  },
  oil_pressure_loss: {
    oilPressure: -38,
    temperature: 48,
    healthScore: -33,
    failureProbability: 57,
    remainingUsefulLife: -1600,
  },
  compressor_damage: {
    pressure: -46,
    rpm: -820,
    compressorRatio: -10,
    healthScore: -36,
    failureProbability: 62,
    remainingUsefulLife: -2200,
  },
  sensor_failure: {
    healthScore: -12,
    failureProbability: 22,
    remainingUsefulLife: -450,
  },
  weather_stress: {
    temperature: 52,
    vibration: 0.48,
    pressure: -20,
    healthScore: -24,
    failureProbability: 38,
    remainingUsefulLife: -950,
  },
  bird_strike: {
    vibration: 1.85,
    rpm: -1350,
    pressure: -38,
    temperature: 85,
    healthScore: -58,
    failureProbability: 82,
    remainingUsefulLife: -3600,
  },
};

function noise(range: number) {
  return (Math.random() - 0.5) * range * 2;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

let transitionProgress = 0; // 0..1 — smooth lerp towards fault state

export function generateReading(
  activeFault: FaultType,
  previous: SensorReading | null,
  tick: number
): SensorReading {
  // Advance transition progress
  if (activeFault) {
    transitionProgress = Math.min(1, transitionProgress + 0.06);
  } else {
    transitionProgress = Math.max(0, transitionProgress - 0.04);
  }

  const t = transitionProgress;
  const delta = activeFault ? FAULT_DELTAS[activeFault] : {};

  const lerp = (base: number, d: number | undefined) =>
    d !== undefined ? base + d * t : base;

  const base = {
    temperature: lerp(BASELINE.temperature, delta.temperature),
    pressure: lerp(BASELINE.pressure, delta.pressure),
    rpm: lerp(BASELINE.rpm, delta.rpm),
    fuelFlow: lerp(BASELINE.fuelFlow, delta.fuelFlow),
    oilPressure: lerp(BASELINE.oilPressure, delta.oilPressure),
    vibration: lerp(BASELINE.vibration, delta.vibration),
    exhaustGasTemp: lerp(BASELINE.exhaustGasTemp, delta.exhaustGasTemp),
    compressorRatio: lerp(BASELINE.compressorRatio, delta.compressorRatio),
    healthScore: lerp(BASELINE.healthScore, delta.healthScore),
    failureProbability: lerp(BASELINE.failureProbability, delta.failureProbability),
    remainingUsefulLife: lerp(BASELINE.remainingUsefulLife, delta.remainingUsefulLife),
  };

  // Apply small oscillating noise for realism
  const wave = Math.sin(tick * 0.15) * 0.4 + Math.cos(tick * 0.07) * 0.3;

  return {
    timestamp: Date.now(),
    temperature: clamp(base.temperature + noise(4) + wave * 3, 300, 750),
    pressure: clamp(base.pressure + noise(2) + wave * 1.5, 40, 200),
    rpm: clamp(base.rpm + noise(80) + wave * 40, 8000, 18000),
    fuelFlow: clamp(base.fuelFlow + noise(30) + wave * 20, 800, 3000),
    oilPressure: clamp(base.oilPressure + noise(1.5) + wave * 1, 5, 120),
    vibration: clamp(base.vibration + noise(0.02) + Math.abs(wave) * 0.01, 0.01, 3.0),
    exhaustGasTemp: clamp(base.exhaustGasTemp + noise(5) + wave * 4, 300, 800),
    compressorRatio: clamp(base.compressorRatio + noise(0.3) + wave * 0.2, 10, 50),
    healthScore: clamp(base.healthScore + noise(0.8), 0, 100),
    failureProbability: clamp(base.failureProbability + noise(1), 0, 100),
    remainingUsefulLife: clamp(base.remainingUsefulLife + noise(20), 0, 10000),
  };
}

export function resetTransition() {
  transitionProgress = 0;
}

export const SENSOR_LIMITS = {
  temperature: { warning: 580, critical: 650 },
  pressure: { warning: 100, critical: 80 },
  rpm: { warning: 13000, critical: 11000 },
  oilPressure: { warning: 45, critical: 30 },
  vibration: { warning: 0.6, critical: 1.2 },
  failureProbability: { warning: 35, critical: 60 },
};
