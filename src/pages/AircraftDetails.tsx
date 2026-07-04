import { motion } from 'framer-motion';
import { Thermometer, Gauge, Zap, Droplets, Wind, Activity, TrendingDown, BarChart3, Plane } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, HealthGauge, AnimatedCounter, StatusBadge, SectionHeader } from '../components/ui/index';

const SENSOR_CARDS = [
  { key: 'temperature' as const, label: 'Exhaust Gas Temp', unit: '°C', icon: <Thermometer size={18} />, color: '#F97316', decimals: 1, warn: 580, crit: 650 },
  { key: 'pressure' as const, label: 'Engine Pressure', unit: ' PSI', icon: <Gauge size={18} />, color: '#38BDF8', decimals: 1, warn: 100, crit: 80 },
  { key: 'rpm' as const, label: 'Fan RPM', unit: ' RPM', icon: <Zap size={18} />, color: '#00D4FF', decimals: 0, warn: 13000, crit: 11000 },
  { key: 'fuelFlow' as const, label: 'Fuel Flow', unit: ' kg/hr', icon: <Droplets size={18} />, color: '#A78BFA', decimals: 0, warn: 2500, crit: 2800 },
  { key: 'oilPressure' as const, label: 'Oil Pressure', unit: ' PSI', icon: <Wind size={18} />, color: '#22C55E', decimals: 1, warn: 45, crit: 30 },
  { key: 'vibration' as const, label: 'Vibration Level', unit: ' g', icon: <Activity size={18} />, color: '#F59E0B', decimals: 3, warn: 0.6, crit: 1.2 },
  { key: 'exhaustGasTemp' as const, label: 'EGT', unit: '°C', icon: <TrendingDown size={18} />, color: '#EF4444', decimals: 1, warn: 600, crit: 680 },
  { key: 'compressorRatio' as const, label: 'Compressor Ratio', unit: ':1', icon: <BarChart3 size={18} />, color: '#8B5CF6', decimals: 2, warn: 20, crit: 15 },
];

export default function AircraftDetails() {
  const { state } = useSimulation();
  const aircraft = state.fleet.find(a => a.id === state.selectedAircraftId)!;
  const r = state.currentReading;

  function getSensorStatus(value: number, key: string) {
    const s = SENSOR_CARDS.find(sc => sc.key === key);
    if (!s) return 'healthy';
    // For sensors where lower is bad (pressure, oilPressure)
    const lowerIsBad = ['pressure', 'oilPressure', 'rpm'].includes(key);
    if (lowerIsBad) {
      if (value <= s.crit) return 'critical';
      if (value <= s.warn) return 'warning';
    } else {
      if (value >= s.crit) return 'critical';
      if (value >= s.warn) return 'warning';
    }
    return 'healthy';
  }

  if (!aircraft) return <div style={{ color: '#64748B' }}>No aircraft selected</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(56,189,248,0.1))',
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plane size={22} color="#00D4FF" style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', fontFamily: 'Rajdhani', letterSpacing: '0.06em' }}>
                {aircraft.registration}
              </h1>
              <StatusBadge status={aircraft.status} />
            </div>
            <p style={{ fontSize: 12.5, color: '#64748B' }}>{aircraft.model} · {aircraft.airline} · {aircraft.location}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>Flight Cycles / Hours</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>
              {aircraft.flightCycles.toLocaleString()} / {aircraft.flightHours.toLocaleString()}h
            </div>
          </div>
        </div>
      </motion.div>

      {/* Digital Twin + Health */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}
      >
        {/* Aircraft Silhouette */}
        <GlassCard style={{ position: 'relative', overflow: 'hidden', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, transparent 70%)',
          }} />
          {/* SVG Aircraft Top View */}
          <svg viewBox="0 0 600 200" width="520" height="160" style={{ opacity: 0.85 }}>
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#071A2F" />
                <stop offset="50%" stopColor="#0F3156" />
                <stop offset="100%" stopColor="#071A2F" />
              </linearGradient>
              <linearGradient id="wingGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F3156" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="wingGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F3156" stopOpacity="0.75" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Left Wing (Top half) */}
            <polygon points="220,84 380,15 398,15 310,84" fill="url(#wingGradLeft)" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.6" />
            
            {/* Right Wing (Bottom half) */}
            <polygon points="220,116 380,185 398,185 310,116" fill="url(#wingGradRight)" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.6" />

            {/* Left Tail Stabilizer */}
            <polygon points="480,84 540,45 548,45 525,84" fill="#071A2F" stroke="#00D4FF" strokeWidth="0.6" strokeOpacity="0.5" />
            
            {/* Right Tail Stabilizer */}
            <polygon points="480,116 540,155 548,155 525,116" fill="#071A2F" stroke="#00D4FF" strokeWidth="0.6" strokeOpacity="0.5" />

            {/* Engine Nacelles */}
            <rect x="256" y="50" width="48" height="22" rx="8" fill="#071A2F" stroke="#F97316" strokeWidth="1.2" strokeOpacity="0.9" filter="url(#glow)" />
            <rect x="256" y="128" width="48" height="22" rx="8" fill="#071A2F" stroke="#F97316" strokeWidth="1.2" strokeOpacity="0.9" filter="url(#glow)" />

            {/* Engine Glow */}
            <ellipse cx="304" cy="61" rx="10" ry="4" fill="#F97316" opacity="0.4" />
            <ellipse cx="304" cy="139" rx="10" ry="4" fill="#F97316" opacity="0.4" />

            {/* Sensor Callout lines */}
            <path d="M 280,50 L 280,24 L 230,24" fill="none" stroke="#F97316" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
            <path d="M 280,150 L 280,176 L 230,176" fill="none" stroke="#F97316" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />

            {/* Fuselage */}
            <path d="M 50,100 C 65,84 100,84 200,84 L 480,84 C 520,84 540,92 560,100 C 540,108 520,116 480,116 L 200,116 C 100,116 65,116 50,100 Z"
              fill="url(#bodyGrad)" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.75" />

            {/* Nose Cap */}
            <path d="M 50,100 C 53,92 70,88 80,88 L 80,112 C 70,112 53,108 50,100 Z" fill="#0F3156" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.5" />

            {/* Vertical Stabilizer center line shadow */}
            <line x1="460" y1="100" x2="555" y2="100" stroke="#00D4FF" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* Windows strip */}
            {Array.from({ length: 18 }, (_, i) => (
              <rect key={i} x={120 + i * 20} y="98" width="6" height="4" rx="1"
                fill="#00D4FF" opacity="0.6" />
            ))}

            {/* Reg text */}
            <text x="290" y="93" textAnchor="middle" fill="#00D4FF" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="600" opacity="0.8">
              {aircraft.registration}
            </text>
          </svg>

          {/* Status labels */}
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
            <div style={{ color: '#64748B' }}>Route: <span style={{ color: '#94A3B8' }}>{aircraft.route}</span></div>
            <div style={{ color: '#64748B' }}>Next Maint: <span style={{ color: '#38BDF8' }}>{aircraft.nextMaintenance}</span></div>
            <div style={{ color: '#64748B' }}>Engines: <span style={{ color: '#94A3B8' }}>{aircraft.engines.length}x {aircraft.engines[0]?.type}</span></div>
          </div>
        </GlassCard>

        {/* Health Gauge */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
          <HealthGauge value={Math.round(r.healthScore)} size={150} label="Health Score" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>FAILURE PROBABILITY</div>
            <AnimatedCounter
              value={r.failureProbability}
              decimals={1}
              suffix="%"
              style={{ fontSize: 22, fontWeight: 800, color: r.failureProbability > 60 ? '#EF4444' : r.failureProbability > 35 ? '#F59E0B' : '#22C55E', fontFamily: 'Rajdhani' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>RUL</div>
            <AnimatedCounter
              value={r.remainingUsefulLife}
              decimals={0}
              suffix=" hrs"
              style={{ fontSize: 16, fontWeight: 700, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Engine Cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <SectionHeader title="Engine Status" subtitle="Real-time engine health indicators" />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${aircraft.engines.length}, 1fr)`, gap: 12 }}>
          {aircraft.engines.map(eng => (
            <GlassCard key={eng.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{eng.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{eng.type}</div>
                </div>
                <StatusBadge status={eng.status} size="sm" />
              </div>
              <div style={{ height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <motion.div
                  style={{
                    height: '100%', borderRadius: 3,
                    background: eng.healthScore > 80 ? 'linear-gradient(90deg,#16A34A,#22C55E)' : eng.healthScore > 60 ? 'linear-gradient(90deg,#D97706,#F59E0B)' : 'linear-gradient(90deg,#DC2626,#EF4444)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${eng.healthScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                <span>Health: <strong style={{ color: eng.healthScore > 80 ? '#22C55E' : eng.healthScore > 60 ? '#F59E0B' : '#EF4444' }}>{eng.healthScore}%</strong></span>
                <span>{eng.hoursRemaining}h rem.</span>
              </div>
              <div style={{ fontSize: 10.5, color: '#334155', marginTop: 6 }}>
                Last inspection: {eng.lastInspection}
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Live Sensor Grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        <SectionHeader title="Live Sensor Readings" subtitle="Updating in real-time from AI inference engine" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {SENSOR_CARDS.map(sc => {
            const value = r[sc.key] as number;
            const status = getSensorStatus(value, sc.key);
            const borderCol = status === 'critical' ? 'rgba(239,68,68,0.35)' : status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(0,212,255,0.1)';
            return (
              <div
                key={sc.key}
                className={status === 'critical' ? 'glass-card glow-critical' : status === 'warning' ? 'glass-card glow-warning' : 'glass-card'}
                style={{ padding: '12px 14px', borderColor: borderCol }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, letterSpacing: '0.04em' }}>{sc.label}</span>
                  <div style={{ color: sc.color, opacity: 0.7 }}>{sc.icon}</div>
                </div>
                <AnimatedCounter
                  value={value}
                  decimals={sc.decimals}
                  suffix={sc.unit}
                  style={{ fontSize: 20, fontWeight: 800, color: sc.color, fontFamily: 'Rajdhani', display: 'block' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <StatusBadge status={status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
