import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type {
  SimulationState,
  SimulationContextType,
  FaultType,
  Alert,
  SensorReading,
} from '../types';
import { initialFleet } from '../data/mockFleet';
import { generateReading, resetTransition } from '../data/sensorGenerator';
import { initialMaintenanceTasks, getFaultMaintenance } from '../data/maintenanceData';
import { initialPredictions, updatePrediction } from '../data/predictionData';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialReading: SensorReading = {
  timestamp: Date.now(),
  temperature: 485,
  pressure: 142,
  rpm: 14200,
  fuelFlow: 1840,
  oilPressure: 62,
  vibration: 0.18,
  exhaustGasTemp: 485,
  compressorRatio: 31.5,
  healthScore: 92,
  failureProbability: 4,
  remainingUsefulLife: 4800,
};

const INIT_STATE: SimulationState = {
  isRunning: false,
  isPaused: false,
  speed: 1,
  activeFault: null,
  selectedAircraftId: 'AC-001',
  sensorHistory: Array.from({ length: 30 }, (_, i) => ({
    ...initialReading,
    timestamp: Date.now() - (30 - i) * 1000,
  })),
  currentReading: initialReading,
  fleet: initialFleet,
  alerts: [],
  maintenanceTasks: initialMaintenanceTasks,
  predictions: initialPredictions,
  tick: 0,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'INJECT_FAULT'; fault: FaultType }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_AIRCRAFT'; id: string }
  | { type: 'TICK'; reading: SensorReading }
  | { type: 'ADD_ALERT'; alert: Alert }
  | { type: 'ACK_ALERT'; id: string };

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true, isPaused: false };
    case 'PAUSE':
      return { ...state, isPaused: true };
    case 'RESUME':
      return { ...state, isPaused: false };
    case 'RESET': {
      resetTransition();
      return {
        ...INIT_STATE,
        sensorHistory: Array.from({ length: 30 }, (_, i) => ({
          ...initialReading,
          timestamp: Date.now() - (30 - i) * 1000,
        })),
        fleet: initialFleet,
        alerts: [],
        maintenanceTasks: initialMaintenanceTasks,
        predictions: initialPredictions,
      };
    }
    case 'INJECT_FAULT':
      return { ...state, activeFault: action.fault };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_AIRCRAFT':
      return { ...state, selectedAircraftId: action.id };
    case 'TICK': {
      const r = action.reading;
      const history = [...state.sensorHistory, r].slice(-120);
      // Update fleet health for selected aircraft
      const fleet = state.fleet.map(a =>
        a.id === state.selectedAircraftId
          ? {
              ...a,
              healthScore: Math.round(r.healthScore),
              status:
                r.healthScore > 80
                  ? 'healthy'
                  : r.healthScore > 55
                  ? 'warning'
                  : 'critical',
              lastUpdate: new Date().toISOString(),
            }
          : a
      );
      // Update predictions
      const predictions = state.predictions.map(p =>
        p.aircraftId === state.selectedAircraftId
          ? updatePrediction(p, r)
          : p
      );
      return {
        ...state,
        currentReading: r,
        sensorHistory: history,
        fleet,
        predictions,
        tick: state.tick + 1,
      };
    }
    case 'ADD_ALERT':
      return { ...state, alerts: [action.alert, ...state.alerts].slice(0, 100) };
    case 'ACK_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a => (a.id === action.id ? { ...a, acknowledged: true } : a)),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const SimulationContext = createContext<SimulationContextType | null>(null);

let alertCooldown = 0;

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isRunning || s.isPaused) return;
    const reading = generateReading(s.activeFault, s.currentReading, s.tick);
    dispatch({ type: 'TICK', reading });

    // Auto-alert logic
    alertCooldown--;
    if (alertCooldown <= 0 && s.activeFault) {
      alertCooldown = 8 + Math.floor(Math.random() * 10);
      const ac = s.fleet.find(f => f.id === s.selectedAircraftId);
      const faultLabels: Record<NonNullable<FaultType>, { title: string; message: string; severity: 'critical' | 'warning' | 'info' }> = {
        high_temperature: {
          title: 'High EGT Detected',
          message: `Exhaust gas temperature exceeded 640°C on ${ac?.registration}. Immediate inspection required.`,
          severity: 'critical',
        },
        pressure_drop: {
          title: 'Pressure Anomaly',
          message: `Engine pressure ratio dropped below threshold on ${ac?.registration}. Performance degraded.`,
          severity: 'warning',
        },
        bearing_wear: {
          title: 'Bearing Wear Detected',
          message: `Unusual vibration signature indicates bearing wear on ${ac?.registration}.`,
          severity: 'critical',
        },
        fuel_leakage: {
          title: 'Fuel Flow Irregularity',
          message: `Abnormal fuel flow rate detected on ${ac?.registration}. Possible fuel system leak.`,
          severity: 'critical',
        },
        high_vibration: {
          title: 'Excessive Vibration',
          message: `Vibration levels critical on ${ac?.registration}. Fan blade imbalance suspected.`,
          severity: 'critical',
        },
        oil_pressure_loss: {
          title: 'Oil Pressure Low',
          message: `Engine oil pressure below minimum on ${ac?.registration}. Risk of bearing failure.`,
          severity: 'critical',
        },
        compressor_damage: {
          title: 'Compressor Stage Damage',
          message: `HPC blade damage detected on ${ac?.registration}. Compressor stall risk. Reduce power immediately.`,
          severity: 'critical',
        },
        sensor_failure: {
          title: 'Sensor Signal Anomaly',
          message: `FADEC sensor drift detected on ${ac?.registration}. Cross-sensor validation failed. Increased monitoring active.`,
          severity: 'warning',
        },
        weather_stress: {
          title: 'Environmental Stress Event',
          message: `Severe turbulence stress profile detected on ${ac?.registration}. Enhanced post-flight inspection required.`,
          severity: 'warning',
        },
        bird_strike: {
          title: '⚠ Bird Strike Detected',
          message: `FOD event confirmed on ${ac?.registration}. Fan blades compromised. Immediate ground inspection mandatory.`,
          severity: 'critical',
        },
      };
      const info = faultLabels[s.activeFault];
      dispatch({
        type: 'ADD_ALERT',
        alert: {
          id: `ALT-${Date.now()}`,
          severity: info.severity,
          title: info.title,
          message: info.message,
          aircraftId: s.selectedAircraftId,
          aircraftReg: ac?.registration ?? '',
          timestamp: Date.now(),
          acknowledged: false,
          faultType: s.activeFault,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      const interval = Math.max(200, 1000 / state.speed);
      intervalRef.current = setInterval(tick, interval);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.isPaused, state.speed, tick]);

  const ctx: SimulationContextType = {
    state,
    startSimulation: () => dispatch({ type: 'START' }),
    pauseSimulation: () => dispatch({ type: 'PAUSE' }),
    resumeSimulation: () => dispatch({ type: 'RESUME' }),
    resetSimulation: () => dispatch({ type: 'RESET' }),
    injectFault: (fault) => dispatch({ type: 'INJECT_FAULT', fault }),
    setSpeed: (speed) => dispatch({ type: 'SET_SPEED', speed }),
    setSelectedAircraft: (id) => dispatch({ type: 'SET_AIRCRAFT', id }),
    acknowledgeAlert: (id) => dispatch({ type: 'ACK_ALERT', id }),
  };

  return (
    <SimulationContext.Provider value={ctx}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
