import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, Clock, Zap, BarChart2 } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, AnimatedCounter, StatusBadge } from '../components/ui/index';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

// ─── Confidence Gauge ─────────────────────────────────────────────────────────
function ConfidenceGauge({ value, label }: { value: number; label: string }) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  const sweep = 260;
  const arcLen = circumference * sweep / 360;
  const offset = arcLen - (value / 100) * arcLen;
  const color = value > 90 ? '#22C55E' : value > 75 ? '#00D4FF' : '#F59E0B';

  return (
    <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
      <svg width="170" height="170" style={{ transform: 'rotate(-130deg)' }}>
        <circle cx={85} cy={85} r={r} fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth={10}
          strokeDasharray={`${arcLen} ${circumference}`} strokeLinecap="round" />
        <motion.circle cx={85} cy={85} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${arcLen} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimatedCounter value={value} decimals={1} suffix="%" style={{ fontSize: 26, fontWeight: 900, color, fontFamily: 'Rajdhani', lineHeight: 1 }} />
        <span style={{ fontSize: 10, color: '#64748B', marginTop: 3 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Horizontal Feature Bar ───────────────────────────────────────────────────
function FeatureBar({ label, value, color, positive }: { label: string; value: number; color: string; positive?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}>
          {positive
            ? <CheckCircle size={13} color="#22C55E" />
            : <AlertTriangle size={13} color="#EF4444" />}
          <span style={{ color: '#C0CCD8', fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'JetBrains Mono' }}>
          {value.toFixed(0)}%
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 3, background: color, boxShadow: `0 0 6px ${color}50` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Decision Card ─────────────────────────────────────────────────────────────
function DecisionCard({ title, icon, children, borderColor = 'rgba(0,212,255,0.2)' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; borderColor?: string;
}) {
  return (
    <GlassCard style={{ borderColor }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {children}
    </GlassCard>
  );
}

// ─── AI Reasoning Timeline ────────────────────────────────────────────────────
function ReasoningTimeline({ steps }: { steps: { time: string; event: string; type: 'info' | 'warning' | 'critical' }[] }) {
  const colors = { info: '#00D4FF', warning: '#F59E0B', critical: '#EF4444' };
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg,rgba(0,212,255,0.3),transparent)' }} />
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, paddingLeft: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginLeft: 5,
            background: `${colors[s.type]}20`, border: `2px solid ${colors[s.type]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 8px ${colors[s.type]}40`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: colors[s.type] }} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', fontFamily: 'JetBrains Mono', marginBottom: 2 }}>{s.time}</div>
            <div style={{ fontSize: 12.5, color: s.type === 'info' ? '#94A3B8' : s.type === 'warning' ? '#F59E0B' : '#EF4444' }}>{s.event}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIExplainability() {
  const { state } = useSimulation();
  const { currentReading: r, activeFault, sensorHistory } = state;
  const pred = state.predictions.find(p => p.aircraftId === state.selectedAircraftId);
  const ac = state.fleet.find(f => f.id === state.selectedAircraftId);

  if (!pred || !ac) return null;

  // Dynamic prediction label based on fault/health
  const prediction = activeFault
    ? activeFault.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Risk Detected'
    : r.failureProbability > 60
    ? 'Engine Failure – High Probability'
    : r.failureProbability > 35
    ? 'Performance Degradation Warning'
    : 'Nominal Operation – Low Risk';

  const confidence = pred.confidenceScore;

  // Dynamic contributing factors
  const factors = activeFault ? {
    high_temperature:  [{ l:'EGT Exceedance', v:88, pos:false },{ l:'Turbine Blade Stress', v:74, pos:false },{ l:'Thermal Fatigue Trend', v:68, pos:false },{ l:'Normal Oil Temp', v:22, pos:true }],
    pressure_drop:     [{ l:'Compressor Pressure Loss', v:82, pos:false },{ l:'HPC Efficiency Drop', v:71, pos:false },{ l:'Reduced Air Mass Flow', v:65, pos:false },{ l:'Fan Speed Normal', v:18, pos:true }],
    bearing_wear:      [{ l:'High Vibration Signature', v:91, pos:false },{ l:'Bearing Metal in Oil', v:79, pos:false },{ l:'Increasing Temperature', v:61, pos:false },{ l:'Fuel Flow Nominal', v:15, pos:true }],
    fuel_leakage:      [{ l:'Abnormal Fuel Flow Rate', v:85, pos:false },{ l:'Pressure Drop Downstream', v:72, pos:false },{ l:'Combustor Instability', v:58, pos:false },{ l:'RPM Stable', v:20, pos:true }],
    high_vibration:    [{ l:'Fan Blade Imbalance', v:94, pos:false },{ l:'Rotor Unbalance Pattern', v:82, pos:false },{ l:'LPT Vane Resonance', v:67, pos:false },{ l:'Temperatures Normal', v:12, pos:true }],
    oil_pressure_loss: [{ l:'Oil Pump Failure Signature', v:89, pos:false },{ l:'Bearing Dry Run Risk', v:76, pos:false },{ l:'Metal Debris in Oil', v:63, pos:false },{ l:'EGT Stable', v:17, pos:true }],
    compressor_damage: [{ l:'Stage Stall Pattern', v:87, pos:false },{ l:'HPC Blade Damage', v:73, pos:false },{ l:'Pressure Ratio Loss', v:68, pos:false },{ l:'Oil System Normal', v:14, pos:true }],
    sensor_failure:    [{ l:'Signal Noise Detected', v:75, pos:false },{ l:'Reading Drift Pattern', v:62, pos:false },{ l:'Cross-Sensor Mismatch', v:54, pos:false },{ l:'Physical Parameters OK', v:28, pos:true }],
    weather_stress:    [{ l:'Environmental Stress Factor', v:72, pos:false },{ l:'Fan Inlet Turbulence', v:60, pos:false },{ l:'Cyclic Thermal Load', v:52, pos:false },{ l:'Engine Mounts OK', v:22, pos:true }],
    bird_strike:       [{ l:'Fan Blade FOD Damage', v:96, pos:false },{ l:'Vibration Spike Pattern', v:88, pos:false },{ l:'RPM Asymmetry', v:74, pos:false },{ l:'No Fire Warning', v:11, pos:true }],
  }[activeFault] ?? pred.topContributors.map((c, i) => ({ l: c.factor, v: c.weight * 100, pos: i === pred.topContributors.length - 1 }))
  : pred.topContributors.map((c, i) => ({ l: c.factor, v: c.weight * 100, pos: i === pred.topContributors.length - 1 }));

  // Reasoning timeline
  const timeline = [
    { time: 'T-120s', event: 'Sensor data ingested from engine telemetry (64 parameters @ 10Hz)', type: 'info' as const },
    { time: 'T-90s',  event: 'Feature extraction: vibration FFT, EGT trend, pressure deltas computed', type: 'info' as const },
    { time: 'T-60s',  event: activeFault ? `Anomaly detected: ${activeFault.replace(/_/g, ' ')} signature` : 'No anomaly patterns detected in feature space', type: activeFault ? 'warning' as const : 'info' as const },
    { time: 'T-30s',  event: 'LSTM model inference run on Jetson Nano (18.4ms). Confidence evaluated.', type: 'info' as const },
    { time: 'T-0s',   event: `Prediction: "${prediction}" — Confidence ${confidence.toFixed(1)}%`, type: r.failureProbability > 60 ? 'critical' as const : r.failureProbability > 35 ? 'warning' as const : 'info' as const },
  ];

  // Waterfall/SHAP bar data
  const shapData = [
    { name: 'Baseline', value: 50, type: 'base' },
    ...factors.slice(0, 4).map(f => ({
      name: f.l.split(' ')[0],
      value: f.pos ? +(f.v * 0.3).toFixed(1) : -(f.v * 0.4).toFixed(1),
      type: f.pos ? 'positive' : 'negative',
    })),
    { name: 'Final', value: r.failureProbability, type: 'final' },
  ];

  const riskColor = pred.riskLevel === 'critical' ? '#EF4444' : pred.riskLevel === 'high' ? '#F97316' : pred.riskLevel === 'medium' ? '#F59E0B' : '#22C55E';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="AI Explainability" subtitle={`Decision transparency engine · ${ac.registration} · Jetson Nano 2GB inference`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={14} color="#A78BFA" />
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'JetBrains Mono' }}>SkyGuard-LSTM-v2.4</span>
          </div>
        </SectionHeader>
      </motion.div>

      {/* Top row: Decision + Confidence + Risk */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'start' }}
      >
        {/* Main AI Decision Card */}
        <DecisionCard
          title="AI Decision"
          icon={<Brain size={15} color="#A78BFA" />}
          borderColor={r.failureProbability > 60 ? 'rgba(239,68,68,0.35)' : 'rgba(0,212,255,0.25)'}
        >
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>PREDICTION</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: riskColor, fontFamily: 'Rajdhani', lineHeight: 1.3 }}>
              {prediction}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Failure Prob.', value: `${r.failureProbability.toFixed(1)}%`, color: r.failureProbability > 60 ? '#EF4444' : '#F59E0B' },
              { label: 'Risk Level', value: pred.riskLevel.toUpperCase(), color: riskColor },
              { label: 'RUL', value: `${Math.round(r.remainingUsefulLife)}h`, color: '#38BDF8' },
            ].map(m => (
              <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, color: '#475569', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 8,
            background: `${riskColor}0A`, border: `1px solid ${riskColor}30`,
            fontSize: 12.5, color: '#C0CCD8', lineHeight: 1.6,
          }}>
            {pred.maintenanceRecommendation}
          </div>
        </DecisionCard>

        {/* Confidence Gauge */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px' }}>
          <div style={{ fontSize: 10.5, color: '#64748B', letterSpacing: '0.06em' }}>CONFIDENCE SCORE</div>
          <ConfidenceGauge value={confidence} label="AI Confidence" />
          <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>
            Model certainty based on<br />64-parameter feature vector
          </div>
        </GlassCard>

        {/* Health Gauge mini */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px' }}>
          <div style={{ fontSize: 10.5, color: '#64748B', letterSpacing: '0.06em' }}>HEALTH SCORE</div>
          <ConfidenceGauge value={r.healthScore} label="Engine Health" />
          <StatusBadge status={pred.riskLevel === 'critical' ? 'critical' : pred.riskLevel === 'high' ? 'warning' : pred.riskLevel === 'medium' ? 'warning' : 'healthy'} />
        </GlassCard>
      </motion.div>

      {/* Middle row: Feature importance + SHAP chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
      >
        {/* Feature Importance */}
        <DecisionCard title="Feature Importance" icon={<BarChart2 size={14} color="#00D4FF" />}>
          {factors.map((f, i) => (
            <FeatureBar
              key={i}
              label={f.l}
              value={f.v}
              color={f.pos ? '#22C55E' : i === 0 ? '#EF4444' : i === 1 ? '#F97316' : '#F59E0B'}
              positive={f.pos}
            />
          ))}
          <div style={{ fontSize: 10.5, color: '#334155', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,212,255,0.06)' }}>
            ↑ Based on SHAP (SHapley Additive exPlanations) values from the LSTM model
          </div>
        </DecisionCard>

        {/* Failure Probability Contribution Chart */}
        <DecisionCard title="Failure Probability Decomposition" icon={<Zap size={14} color="#EF4444" />}>
          <div style={{ marginBottom: 10 }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={shapData} margin={{ top: 4, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(7,26,47,0.96)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 6, fontSize: 11 }}
                  formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Contribution']}
                />
                <ReferenceLine y={35} stroke="rgba(245,158,11,0.5)" strokeDasharray="3 3" />
                <ReferenceLine y={60} stroke="rgba(239,68,68,0.5)" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {shapData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.type === 'base' ? '#334155' : entry.type === 'positive' ? '#22C55E' : entry.type === 'final' ? '#EF4444' : '#F59E0B'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
            {[{ color: '#334155', label: 'Baseline' }, { color: '#22C55E', label: 'Protective' }, { color: '#F59E0B', label: 'Risk Factor' }, { color: '#EF4444', label: 'Final Score' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ color: '#475569' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </DecisionCard>
      </motion.div>

      {/* AI Reasoning Timeline */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <DecisionCard title="AI Reasoning Pipeline" icon={<Clock size={14} color="#38BDF8" />}>
          <ReasoningTimeline steps={timeline} />
        </DecisionCard>
      </motion.div>
    </div>
  );
}
