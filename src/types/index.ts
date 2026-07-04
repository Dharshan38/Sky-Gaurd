// ─── Core Types ─────────────────────────────────────────────────────────────

export type AircraftStatus = 'healthy' | 'warning' | 'critical' | 'maintenance';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type FaultType =
  | 'high_temperature'
  | 'pressure_drop'
  | 'bearing_wear'
  | 'fuel_leakage'
  | 'high_vibration'
  | 'oil_pressure_loss'
  | 'compressor_damage'
  | 'sensor_failure'
  | 'weather_stress'
  | 'bird_strike'
  | null;

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ─── Sensor Readings ─────────────────────────────────────────────────────────

export interface SensorReading {
  timestamp: number;
  temperature: number;       // °C
  pressure: number;          // PSI
  rpm: number;               // RPM
  fuelFlow: number;          // kg/hr
  oilPressure: number;       // PSI
  vibration: number;         // g
  exhaustGasTemp: number;    // °C
  compressorRatio: number;   // ratio
  healthScore: number;       // 0–100
  failureProbability: number; // 0–100
  remainingUsefulLife: number; // flight hours
}

// ─── Aircraft ─────────────────────────────────────────────────────────────────

export interface Engine {
  id: string;
  name: string;
  type: string;
  healthScore: number;
  status: AircraftStatus;
  lastInspection: string;
  hoursRemaining: number;
}

export interface Aircraft {
  id: string;
  registration: string;
  model: string;
  airline: string;
  status: AircraftStatus;
  flightCycles: number;
  flightHours: number;
  healthScore: number;
  engines: Engine[];
  route: string;
  nextMaintenance: string;
  location: string;
  lastUpdate: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  aircraftId: string;
  aircraftReg: string;
  timestamp: number;
  acknowledged: boolean;
  faultType?: FaultType;
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  aircraftId: string;
  aircraftReg: string;
  action: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedCycles: number;
  estimatedRepairHours: number;
  dueDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  technician?: string;
  notes?: string;
}

// ─── AI Prediction ───────────────────────────────────────────────────────────

export interface AIPrediction {
  aircraftId: string;
  healthScore: number;
  failureProbability: number;
  remainingUsefulLife: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  predictionTimestamp: number;
  nextFailureWindow: string;
  maintenanceRecommendation: string;
  topContributors: { factor: string; weight: number }[];
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  activeFault: FaultType;
  selectedAircraftId: string;
  sensorHistory: SensorReading[];
  currentReading: SensorReading;
  fleet: Aircraft[];
  alerts: Alert[];
  maintenanceTasks: MaintenanceTask[];
  predictions: AIPrediction[];
  tick: number;
}

export interface SimulationContextType {
  state: SimulationState;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  injectFault: (fault: FaultType) => void;
  setSpeed: (speed: number) => void;
  setSelectedAircraft: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
}
