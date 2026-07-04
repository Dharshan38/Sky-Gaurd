import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Zap, Flame, Gauge, Wrench,
  Fuel, Activity, Droplets, AlertOctagon, CloudLightning, Bird, Wind,
} from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, AnimatedCounter, StatusBadge } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';
import type { FaultType } from '../types';

interface FaultCard {
  fault: NonNullable<FaultType>;
  label: string;
  icon: React.ReactNode;
  color: string;
  accentBg: string;
  description: string;
  severity: 'high' | 'critical';
  expectedEffect: string;
}

const FAULT_CARDS: FaultCard[] = [
  {
    fault: 'high_temperature',
    label: 'Engine Overheating',
    icon: <Flame size={20} />,
    color: '#EF4444', accentBg: 'rgba(239,68,68,0.1)',
    description: 'EGT exceedance above 640°C. Turbine blade thermal stress.',
    severity: 'critical',
    expectedEffect: 'EGT ↑, Health ↓, HPT damage alert',
  },
  {
    fault: 'high_vibration',
    label: 'High Vibration',
    icon: <Activity size={20} />,
    color: '#EF4444', accentBg: 'rgba(239,68,68,0.08)',
    description: 'Fan blade imbalance / FOD. Vibration > 1.2g on all sensors.',
    severity: 'critical',
    expectedEffect: 'Vibration ↑↑, RPM ↓, Bearing stress',
  },
  {
    fault: 'oil_pressure_loss',
    label: 'Oil Pressure Loss',
    icon: <Droplets size={20} />,
    color: '#F97316', accentBg: 'rgba(249,115,22,0.08)',
    description: 'Oil pump failure. Risk of bearing seizure within 30 minutes.',
    severity: 'critical',
    expectedEffect: 'Oil PSI ↓, Temp ↑, Bearing failure risk',
  },
  {
    fault: 'fuel_leakage',
    label: 'Fuel Leakage',
    icon: <Fuel size={20} />,
    color: '#A78BFA', accentBg: 'rgba(167,139,250,0.08)',
    description: 'Fuel system seal failure. Abnormal fuel flow rate detected.',
    severity: 'critical',
    expectedEffect: 'Fuel flow ↑, Pressure ↓, Fire risk',
  },
  {
    fault: 'compressor_damage',
    label: 'Compressor Damage',
    icon: <Wind size={20} />,
    color: '#F59E0B', accentBg: 'rgba(245,158,11,0.08)',
    description: 'HPC blade damage or compressor stall. Surge event detected.',
    severity: 'critical',
    expectedEffect: 'Pressure ↓, RPM ↓, Comp. ratio loss',
  },
  {
    fault: 'pressure_drop',
    label: 'Pressure Drop',
    icon: <Gauge size={20} />,
    color: '#38BDF8', accentBg: 'rgba(56,189,248,0.08)',
    description: 'Compressor pressure ratio loss. Efficiency degradation.',
    severity: 'high',
    expectedEffect: 'Pressure ↓, Comp. ratio ↓, RPM loss',
  },
  {
    fault: 'bearing_wear',
    label: 'Bearing Failure',
    icon: <Wrench size={20} />,
    color: '#F59E0B', accentBg: 'rgba(245,158,11,0.08)',
    description: 'Bearing spalling detected. Metal debris in oil circuit.',
    severity: 'critical',
    expectedEffect: 'Vibration ↑, RPM ↓, Oil metal content ↑',
  },
  {
    fault: 'weather_stress',
    label: 'Weather Stress',
    icon: <CloudLightning size={20} />,
    color: '#64748B', accentBg: 'rgba(100,116,139,0.08)',
    description: 'Severe turbulence / icing / tropical storm stress profile.',
    severity: 'high',
    expectedEffect: 'Temp ↑, Vibration ↑, Pressure variation',
  },
  {
    fault: 'sensor_failure',
    label: 'Sensor Failure',
    icon: <AlertOctagon size={20} />,
    color: '#8B5CF6', accentBg: 'rgba(139,92,246,0.08)',
    description: 'FADEC sensor anomaly. Reading drift and cross-sensor mismatch.',
    severity: 'high',
    expectedEffect: 'Reading noise ↑, Uncertainty ↑',
  },
  {
    fault: 'bird_strike',
    label: 'Bird Strike',
    icon: <Bird size={20} />,
    color: '#EF4444', accentBg: 'rgba(239,68,68,0.12)',
    description: 'FOD event detected. Fan blade damage from avian ingestion.',
    severity: 'critical',
    expectedEffect: 'Vibration ↑↑↑, RPM ↓, Fan damage',
  },
];

// ─── Fault Log Item ───────────────────────────────────────────────────────────
interface FaultLogEntry {
  fault: NonNullable<FaultType>;
  label: string;
  injectedAt: number;
  color: string;
}

export default function SimulationLab() {
  const { state, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, injectFault, setSpeed } = useSimulation();
  const { isRunning, isPaused, speed, activeFault, currentReading: r, sensorHistory } = state;
  const [faultLog, setFaultLog] = useState<FaultLogEntry[]>([]);

  const handleInjectFault = (fault: NonNullable<FaultType>) => {
    const card = FAULT_CARDS.find(f => f.fault === fault)!;
    if (fault === activeFault) {
      injectFault(null);
    } else {
      injectFault(fault);
      setFaultLog(prev => [{ fault, label: card.label, injectedAt: Date.now(), color: card.color }, ...prev].slice(0, 20));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="Simulation Lab" subtitle="Fault injection, real-time AI response, and scenario testing">
          <StatusBadge
            status={isRunning && !isPaused ? (activeFault ? 'critical' : 'healthy') : isPaused ? 'warning' : 'maintenance'}
            label={isRunning && !isPaused ? (activeFault ? 'FAULT ACTIVE' : 'RUNNING') : isPaused ? 'PAUSED' : 'STOPPED'}
          />
        </SectionHeader>
      </motion.div>

      {/* Control Panel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Control buttons */}
            {!isRunning ? (
              <button className="btn btn-primary" onClick={startSimulation}><Play size={14} /> Start Simulation</button>
            ) : isPaused ? (
              <button className="btn btn-primary" onClick={resumeSimulation}><Play size={14} /> Resume</button>
            ) : (
              <button className="btn btn-warning" onClick={pauseSimulation}><Pause size={14} /> Pause</button>
            )}
            <button className="btn btn-ghost" onClick={() => { resetSimulation(); setFaultLog([]); }}>
              <RotateCcw size={13} /> Reset
            </button>
            {activeFault && (
              <button className="btn btn-ghost" onClick={() => injectFault(null)} style={{ color: '#22C55E' }}>
                ✓ Clear Fault
              </button>
            )}

            {/* Speed control */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: '#64748B' }}>Speed</span>
              {[1, 2, 3, 5].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`btn ${speed === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '4px 10px' }}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Status strip */}
          {isRunning && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 14 }}>
              {[
                { label: 'Health', value: r.healthScore, unit: '%', color: r.healthScore > 80 ? '#22C55E' : r.healthScore > 55 ? '#F59E0B' : '#EF4444', dec: 0 },
                { label: 'Failure Prob.', value: r.failureProbability, unit: '%', color: r.failureProbability > 60 ? '#EF4444' : '#F59E0B', dec: 1 },
                { label: 'EGT', value: r.temperature, unit: '°C', color: r.temperature > 650 ? '#EF4444' : r.temperature > 580 ? '#F59E0B' : '#22C55E', dec: 0 },
                { label: 'Vibration', value: r.vibration, unit: ' g', color: r.vibration > 1.2 ? '#EF4444' : r.vibration > 0.6 ? '#F59E0B' : '#22C55E', dec: 3 },
                { label: 'RUL', value: r.remainingUsefulLife, unit: 'h', color: '#38BDF8', dec: 0 },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9.5, color: '#475569', marginBottom: 3 }}>{m.label}</div>
                  <AnimatedCounter value={m.value} decimals={m.dec} suffix={m.unit} style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Fault Cards Grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Zap size={14} color="#EF4444" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>FAULT INJECTION SCENARIOS</span>
          {!isRunning && <span style={{ fontSize: 10.5, color: '#F59E0B' }}>⚠ Start simulation first</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {FAULT_CARDS.map((fc, i) => {
            const isActive = activeFault === fc.fault;
            return (
              <motion.div
                key={fc.fault}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  onClick={() => isRunning && handleInjectFault(fc.fault)}
                  disabled={!isRunning}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: isActive ? fc.accentBg : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${isActive ? fc.color : 'rgba(0,212,255,0.08)'}`,
                    borderRadius: 10, padding: '12px',
                    cursor: isRunning ? 'pointer' : 'not-allowed',
                    opacity: isRunning ? 1 : 0.45,
                    transition: 'all 0.25s',
                    boxShadow: isActive ? `0 0 20px ${fc.color}25, inset 0 0 12px ${fc.color}10` : 'none',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: isActive ? fc.color : '#64748B' }}>{fc.icon}</div>
                    {isActive && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, color: fc.color,
                        background: `${fc.color}20`, border: `1px solid ${fc.color}40`,
                        borderRadius: 4, padding: '1px 5px', animation: 'blink 1s infinite',
                      }}>ACTIVE</span>
                    )}
                    {!isActive && (
                      <span style={{
                        fontSize: 8, color: fc.severity === 'critical' ? '#EF4444' : '#F59E0B',
                        background: fc.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        borderRadius: 4, padding: '1px 5px', fontWeight: 600,
                      }}>
                        {fc.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? fc.color : '#94A3B8', marginBottom: 6, lineHeight: 1.3 }}>
                    {fc.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>
                    {fc.description}
                  </div>
                  <div style={{
                    fontSize: 9.5, color: fc.color, opacity: isActive ? 1 : 0.6,
                    background: `${fc.color}0A`, borderRadius: 4, padding: '3px 6px',
                  }}>
                    {fc.expectedEffect}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Live charts + fault log */}
      {isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 240px', gap: 12 }}>
            {[
              { key: 'healthScore' as const, label: 'Health Score', color: '#22C55E', unit: '%', domain: [0, 100] as [number, number], warn: 80, crit: 55 },
              { key: 'failureProbability' as const, label: 'Failure Prob.', color: '#EF4444', unit: '%', domain: [0, 100] as [number, number], warn: 35, crit: 60 },
              { key: 'vibration' as const, label: 'Vibration', color: '#F59E0B', unit: 'g', warn: 0.6, crit: 1.2 },
            ].map(chart => (
              <GlassCard key={chart.key} padding="12px">
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>{chart.label}</div>
                <LiveLineChart data={sensorHistory.slice(-40)} dataKey={chart.key} color={chart.color}
                  unit={chart.unit} height={100} warningLine={chart.warn} criticalLine={chart.crit}
                  domain={chart.domain} filled />
              </GlassCard>
            ))}

            {/* Fault Log */}
            <GlassCard padding="12px">
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 10 }}>FAULT LOG</div>
              <div style={{ overflowY: 'auto', maxHeight: 140 }}>
                <AnimatePresence>
                  {faultLog.length === 0 ? (
                    <div style={{ color: '#334155', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>No faults injected</div>
                  ) : (
                    faultLog.map((entry, i) => (
                      <motion.div key={entry.injectedAt} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                          <div style={{ fontSize: 10, color: '#94A3B8', flex: 1 }}>{entry.label}</div>
                          <div style={{ fontSize: 9, color: '#334155', fontFamily: 'JetBrains Mono' }}>
                            {new Date(entry.injectedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </div>
  );
}
