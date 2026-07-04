import { motion } from 'framer-motion';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, StatusBadge, AnimatedCounter } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';

const CHARTS = [
  { key: 'temperature' as const, label: 'Exhaust Gas Temperature', unit: '°C', color: '#F97316', warn: 580, crit: 650 },
  { key: 'pressure' as const, label: 'Engine Pressure', unit: ' PSI', color: '#38BDF8', warn: 100, crit: 80 },
  { key: 'rpm' as const, label: 'Fan RPM', unit: ' RPM', color: '#00D4FF', warn: 13000, crit: 11000 },
  { key: 'fuelFlow' as const, label: 'Fuel Flow Rate', unit: ' kg/hr', color: '#A78BFA', warn: 2500, crit: 2800 },
  { key: 'oilPressure' as const, label: 'Oil Pressure', unit: ' PSI', color: '#22C55E', warn: 45, crit: 30 },
  { key: 'vibration' as const, label: 'Vibration Level', unit: ' g', color: '#F59E0B', warn: 0.6, crit: 1.2 },
  { key: 'healthScore' as const, label: 'Health Score', unit: '%', color: '#22C55E', warn: 80, crit: 55, domain: [0, 100] as [number, number] },
  { key: 'failureProbability' as const, label: 'Failure Probability', unit: '%', color: '#EF4444', warn: 35, crit: 60, domain: [0, 100] as [number, number] },
  { key: 'remainingUsefulLife' as const, label: 'Remaining Useful Life', unit: ' hrs', color: '#8B5CF6', warn: 2000, crit: 500 },
];

export default function LiveMonitoring() {
  const { state } = useSimulation();
  const { sensorHistory, currentReading: r, isRunning } = state;
  const ac = state.fleet.find(f => f.id === state.selectedAircraftId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SectionHeader
          title="Live Monitoring"
          subtitle={`Real-time sensor telemetry · ${ac?.registration} · ${ac?.model}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isRunning && !state.isPaused ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#22C55E',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, padding: '4px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'blink 1s infinite' }} />
                LIVE FEED ACTIVE
              </div>
            ) : (
              <StatusBadge status="warning" label="SIMULATION PAUSED" />
            )}
          </div>
        </SectionHeader>

        {/* Current values quick strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 4 }}>
          {[
            { label: 'Temp', value: r.temperature, unit: '°C', color: '#F97316', dec: 0 },
            { label: 'Pressure', value: r.pressure, unit: ' PSI', color: '#38BDF8', dec: 0 },
            { label: 'RPM', value: r.rpm, unit: '', color: '#00D4FF', dec: 0 },
            { label: 'Vibration', value: r.vibration, unit: ' g', color: '#F59E0B', dec: 3 },
            { label: 'Health', value: r.healthScore, unit: '%', color: '#22C55E', dec: 0 },
          ].map(m => (
            <div key={m.label} className="glass-card" style={{ padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, letterSpacing: '0.06em' }}>{m.label}</div>
              <AnimatedCounter
                value={m.value}
                decimals={m.dec}
                suffix={m.unit}
                style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {CHARTS.map((chart, i) => (
          <motion.div
            key={chart.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <GlassCard padding="14px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8' }}>{chart.label}</span>
                <AnimatedCounter
                  value={(r[chart.key] as number)}
                  decimals={chart.key === 'vibration' ? 3 : chart.key === 'compressorRatio' ? 2 : 1}
                  suffix={chart.unit}
                  style={{ fontSize: 14, fontWeight: 700, color: chart.color, fontFamily: 'JetBrains Mono' }}
                />
              </div>
              <LiveLineChart
                data={sensorHistory.slice(-50)}
                dataKey={chart.key}
                color={chart.color}
                unit={chart.unit}
                height={110}
                warningLine={chart.warn}
                criticalLine={chart.crit}
                domain={chart.domain as any}
                filled
                decimals={chart.key === 'vibration' ? 3 : 1}
              />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
