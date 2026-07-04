import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Flame, Gauge, Wrench, Fuel, Activity, Droplets } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, AnimatedCounter, StatusBadge } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';
import type { FaultType } from '../types';

const FAULT_BUTTONS: { fault: NonNullable<FaultType>; label: string; icon: React.ReactNode; color: string; description: string }[] = [
  { fault: 'high_temperature', label: 'High Temperature', icon: <Flame size={14} />, color: '#EF4444', description: 'Inject EGT exceedance above 640°C' },
  { fault: 'pressure_drop', label: 'Pressure Drop', icon: <Gauge size={14} />, color: '#F97316', description: 'Simulate compressor pressure loss' },
  { fault: 'bearing_wear', label: 'Bearing Wear', icon: <Wrench size={14} />, color: '#F59E0B', description: 'Induce bearing spalling vibration' },
  { fault: 'fuel_leakage', label: 'Fuel Leakage', icon: <Fuel size={14} />, color: '#A78BFA', description: 'Simulate fuel system leak' },
  { fault: 'high_vibration', label: 'High Vibration', icon: <Activity size={14} />, color: '#EF4444', description: 'Fan blade imbalance / FOD' },
  { fault: 'oil_pressure_loss', label: 'Oil Pressure Loss', icon: <Droplets size={14} />, color: '#38BDF8', description: 'Oil pump failure simulation' },
];

export default function SimulationControl() {
  const { state, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, injectFault, setSpeed } = useSimulation();
  const { isRunning, isPaused, speed, activeFault, currentReading: r, sensorHistory } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="Simulation Control" subtitle="Manage simulation state, speed, and fault injection">
          <StatusBadge
            status={isRunning && !isPaused ? 'healthy' : isPaused ? 'warning' : 'maintenance'}
            label={isRunning && !isPaused ? 'RUNNING' : isPaused ? 'PAUSED' : 'STOPPED'}
          />
        </SectionHeader>
      </motion.div>

      {/* Control Panel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 14, letterSpacing: '0.06em' }}>
            SIMULATION CONTROLS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {!isRunning ? (
              <button className="btn btn-primary" onClick={startSimulation} style={{ fontSize: 13 }}>
                <Play size={14} /> Start Simulation
              </button>
            ) : isPaused ? (
              <>
                <button className="btn btn-primary" onClick={resumeSimulation} style={{ fontSize: 13 }}>
                  <Play size={14} /> Resume
                </button>
                <button className="btn btn-ghost" onClick={resetSimulation} style={{ fontSize: 13 }}>
                  <RotateCcw size={13} /> Reset
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-warning" onClick={pauseSimulation} style={{ fontSize: 13 }}>
                  <Pause size={14} /> Pause
                </button>
                <button className="btn btn-ghost" onClick={resetSimulation} style={{ fontSize: 13 }}>
                  <RotateCcw size={13} /> Reset
                </button>
              </>
            )}

            {/* Clear fault */}
            {activeFault && (
              <button className="btn btn-ghost" onClick={() => injectFault(null)} style={{ fontSize: 13, color: '#22C55E' }}>
                ✓ Clear Fault
              </button>
            )}

            {/* Speed slider */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap' }}>Sim Speed</span>
              <input
                type="range" min={1} max={5} step={0.5}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                style={{ width: 120, accentColor: '#00D4FF' }}
              />
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#00D4FF',
                fontFamily: 'JetBrains Mono', minWidth: 32,
              }}>
                {speed}×
              </span>
            </div>
          </div>

          {/* Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
            {[
              { label: 'Status', value: isRunning && !isPaused ? 'Running' : isPaused ? 'Paused' : 'Idle', color: isRunning && !isPaused ? '#22C55E' : isPaused ? '#F59E0B' : '#64748B' },
              { label: 'Speed', value: `${speed}×`, color: '#00D4FF' },
              { label: 'Active Fault', value: activeFault ? activeFault.replace(/_/g, ' ') : 'None', color: activeFault ? '#EF4444' : '#22C55E' },
              { label: 'Tick Count', value: state.tick.toString(), color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono', textTransform: 'capitalize' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Fault Injection */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={15} color="#EF4444" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>FAULT INJECTION</span>
            {!isRunning && (
              <span style={{ fontSize: 10.5, color: '#F59E0B', marginLeft: 6 }}>⚠ Start simulation to inject faults</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {FAULT_BUTTONS.map(fb => {
              const isActive = activeFault === fb.fault;
              return (
                <button
                  key={fb.fault}
                  onClick={() => injectFault(isActive ? null : fb.fault)}
                  disabled={!isRunning}
                  style={{
                    background: isActive ? `${fb.color}25` : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${isActive ? fb.color : 'rgba(0,212,255,0.08)'}`,
                    borderRadius: 8, padding: '12px 14px', cursor: isRunning ? 'pointer' : 'not-allowed',
                    opacity: isRunning ? 1 : 0.4,
                    transition: 'all 0.25s',
                    textAlign: 'left',
                    boxShadow: isActive ? `0 0 16px ${fb.color}30, inset 0 0 12px ${fb.color}10` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: isActive ? fb.color : '#64748B', marginBottom: 5 }}>
                    {fb.icon}
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? fb.color : '#94A3B8' }}>{fb.label}</span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: fb.color, animation: 'blink 1s infinite', fontWeight: 700 }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#475569', lineHeight: 1.4 }}>{fb.description}</div>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Live effect preview */}
      {isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <GlassCard>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 12, letterSpacing: '0.06em' }}>
              REAL-TIME EFFECT PREVIEW
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Health Score', value: r.healthScore, unit: '%', color: r.healthScore > 80 ? '#22C55E' : r.healthScore > 55 ? '#F59E0B' : '#EF4444', dec: 0 },
                { label: 'Failure Prob.', value: r.failureProbability, unit: '%', color: r.failureProbability > 60 ? '#EF4444' : '#F59E0B', dec: 1 },
                { label: 'Vibration', value: r.vibration, unit: ' g', color: r.vibration > 1.2 ? '#EF4444' : r.vibration > 0.6 ? '#F59E0B' : '#22C55E', dec: 3 },
                { label: 'EGT', value: r.temperature, unit: '°C', color: r.temperature > 650 ? '#EF4444' : r.temperature > 580 ? '#F59E0B' : '#22C55E', dec: 0 },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 6 }}>{m.label}</div>
                  <AnimatedCounter value={m.value} decimals={m.dec} suffix={m.unit} style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <LiveLineChart data={sensorHistory.slice(-40)} dataKey="healthScore" color="#22C55E" label="Health Score" unit="%" height={100} warningLine={80} criticalLine={55} domain={[0, 100]} filled />
              <LiveLineChart data={sensorHistory.slice(-40)} dataKey="failureProbability" color="#EF4444" label="Failure Probability" unit="%" height={100} warningLine={35} criticalLine={60} domain={[0, 100]} filled />
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
