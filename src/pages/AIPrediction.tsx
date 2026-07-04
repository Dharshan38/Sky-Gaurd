import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, ShieldAlert, Target } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, StatusBadge, HealthGauge, AnimatedCounter } from '../components/ui/index';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

export default function AIPrediction() {
  const { state } = useSimulation();
  const r = state.currentReading;
  const pred = state.predictions.find(p => p.aircraftId === state.selectedAircraftId);
  const ac = state.fleet.find(f => f.id === state.selectedAircraftId);

  if (!pred || !ac) return null;

  const riskColors: Record<string, string> = {
    low: '#22C55E', medium: '#F59E0B', high: '#F97316', critical: '#EF4444',
  };
  const riskColor = riskColors[pred.riskLevel] ?? '#22C55E';

  const radarData = pred.topContributors.map(c => ({
    factor: c.factor.split(' ')[0],
    value: Math.round(c.weight * 100),
    fullMark: 100,
  }));

  // Timeline items (mock prediction timeline)
  const timelineItems = [
    { time: 'Now', event: 'Baseline Assessment Complete', type: 'info' },
    { time: '+24h', event: pred.riskLevel === 'critical' ? 'Critical failure window begins' : 'Continued monitoring', type: pred.riskLevel === 'critical' ? 'critical' : 'info' },
    { time: '+72h', event: 'Scheduled sensor recalibration', type: 'info' },
    { time: '+7d', event: pred.riskLevel !== 'low' ? 'Mandatory inspection checkpoint' : 'Routine check', type: pred.riskLevel !== 'low' ? 'warning' : 'info' },
    { time: pred.nextFailureWindow, event: 'Predicted failure window', type: pred.riskLevel === 'critical' ? 'critical' : 'warning' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SectionHeader
          title="AI Prediction Engine"
          subtitle={`LSTM Neural Network · ${ac.registration} · ${ac.model}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color="#A78BFA" />
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'JetBrains Mono' }}>
              Model: SkyGuard-LSTM-v2.4
            </span>
          </div>
        </SectionHeader>
      </motion.div>

      {/* Top metrics row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}
      >
        {[
          { label: 'Health Score', value: r.healthScore, unit: '%', color: r.healthScore > 80 ? '#22C55E' : r.healthScore > 60 ? '#F59E0B' : '#EF4444', decimals: 0 },
          { label: 'Failure Prob.', value: r.failureProbability, unit: '%', color: r.failureProbability > 60 ? '#EF4444' : r.failureProbability > 35 ? '#F59E0B' : '#22C55E', decimals: 1 },
          { label: 'RUL', value: r.remainingUsefulLife, unit: ' hrs', color: '#38BDF8', decimals: 0 },
          { label: 'Risk Level', value: pred.riskLevel.toUpperCase(), unit: '', color: riskColor, decimals: 0, isString: true },
          { label: 'Confidence', value: pred.confidenceScore, unit: '%', color: '#A78BFA', decimals: 1 },
        ].map((m, i) => (
          <GlassCard key={i} style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 10.5, color: '#64748B', marginBottom: 8, letterSpacing: '0.06em' }}>{m.label}</div>
            {m.isString ? (
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }}>{m.value}</div>
            ) : (
              <AnimatedCounter
                value={m.value as number}
                decimals={m.decimals}
                suffix={m.unit}
                style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani', display: 'block' }}
              />
            )}
          </GlassCard>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Health gauge + recommendation */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            <GlassCard style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <HealthGauge value={Math.round(r.healthScore)} size={140} label="Health Score" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <ShieldAlert size={16} color={riskColor} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', fontFamily: 'Rajdhani' }}>
                    Maintenance Recommendation
                  </span>
                </div>
                <div style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: `rgba(${pred.riskLevel === 'critical' ? '239,68,68' : pred.riskLevel === 'high' ? '249,115,22' : pred.riskLevel === 'medium' ? '245,158,11' : '34,197,94'},0.08)`,
                  border: `1px solid ${riskColor}40`,
                  fontSize: 13, color: '#C0CCD8', lineHeight: 1.6,
                }}>
                  {pred.maintenanceRecommendation}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> Failure Window
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: riskColor }}>{pred.nextFailureWindow}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Target size={11} /> Confidence
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#A78BFA' }}>{pred.confidenceScore.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Prediction Timeline */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
            <GlassCard>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={14} color="#00D4FF" /> PREDICTION TIMELINE
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: 0, bottom: 0, width: 1,
                  background: 'linear-gradient(180deg, rgba(0,212,255,0.3), transparent)',
                }} />
                {timelineItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14, paddingLeft: 4 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: item.type === 'critical' ? '#EF4444' : item.type === 'warning' ? '#F59E0B' : 'rgba(0,212,255,0.2)',
                      border: `2px solid ${item.type === 'critical' ? '#EF4444' : item.type === 'warning' ? '#F59E0B' : '#00D4FF'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 8px ${item.type === 'critical' ? '#EF4444' : item.type === 'warning' ? '#F59E0B' : '#00D4FF'}40`,
                      marginLeft: 5,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', fontFamily: 'JetBrains Mono' }}>{item.time}</div>
                      <div style={{ fontSize: 12.5, color: item.type === 'critical' ? '#EF4444' : item.type === 'warning' ? '#F59E0B' : '#94A3B8' }}>
                        {item.event}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right: Radar + Contributors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GlassCard>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 10 }}>FAILURE FACTOR RADAR</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(0,212,255,0.1)" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#475569', fontSize: 9.5 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#334155', fontSize: 8 }} />
                <Radar name="Weight" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 12 }}>TOP CONTRIBUTORS</div>
            {pred.topContributors.map((c, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: '#94A3B8' }}>{c.factor}</span>
                  <span style={{ color: '#EF4444', fontFamily: 'JetBrains Mono' }}>{(c.weight * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, #EF4444, #F97316)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.weight * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
