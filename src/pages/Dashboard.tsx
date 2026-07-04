import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  Play, Pause, RotateCcw, Zap, Download,
  Activity, CheckCircle, AlertTriangle, AlertOctagon,
  Wrench, Shield, Clock,
} from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { getFleetStats } from '../data/mockFleet';
import { GlassCard, AnimatedCounter, StatusBadge, SectionHeader } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';
import { api, type AircraftAnalyticsResponse, type DashboardSummaryResponse } from '../lib/api';
import type { SensorReading } from '../types';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

export default function Dashboard() {
  const { state, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, injectFault } = useSimulation();
  const stats = getFleetStats(state.fleet);
  const { currentReading: r, sensorHistory } = state;
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [analytics, setAnalytics] = useState<AircraftAnalyticsResponse | null>(null);
  const fleetCards = [
    { label: 'Total Aircraft', value: stats.total, icon: <Activity size={18} />, color: '#00D4FF' },
    { label: 'Healthy', value: stats.healthy, icon: <CheckCircle size={18} />, color: '#22C55E' },
    { label: 'Warning', value: stats.warning, icon: <AlertTriangle size={18} />, color: '#F59E0B' },
    { label: 'Critical', value: stats.critical, icon: <AlertOctagon size={18} />, color: '#EF4444' },
  ];

  useEffect(() => {
    let alive = true;

    const loadDemoData = async () => {
      try {
        const [summaryResponse, analyticsResponse] = await Promise.all([
          api.get<{ success: boolean; data: DashboardSummaryResponse }>('/fleet/dashboard-summary'),
          api.get<{ success: boolean; data: AircraftAnalyticsResponse }>('/fleet/aircraft/N67890/analytics?limit=24'),
        ]);

        if (!alive) return;

        setSummary(summaryResponse.data.data);
        setAnalytics(analyticsResponse.data.data);
      } catch {
        if (!alive) return;
        setSummary(null);
        setAnalytics(null);
      }
    };

    void loadDemoData();

    return () => {
      alive = false;
    };
  }, []);

  const backendAircraftLabel = analytics?.aircraft.tailNumber ?? 'Demo fleet loaded';
  const backendSensorHistory = useMemo<SensorReading[]>(() => {
    if (!analytics?.series.length) {
      return sensorHistory.slice(-60);
    }

    return analytics.series.map((point, index) => {
      const temperature = Math.round(point.engineTemperature);
      const vibration = Number(point.vibrationLevel.toFixed(2));
      const healthScore = Math.max(0, Math.min(100, Math.round(100 - (temperature - 800) * 0.12 - vibration * 2)));
      const failureProbability = Math.max(0, Math.min(100, Math.round((temperature > 950 ? 35 : 10) + vibration * 4)));

      return {
        timestamp: new Date(point.timestamp).getTime() || Date.now() + index * 1000,
        temperature,
        pressure: Math.round(point.oilPressure),
        rpm: Math.round(12000 + vibration * 900),
        fuelFlow: Math.round(1600 + vibration * 35),
        oilPressure: Number(point.oilPressure.toFixed(1)),
        vibration,
        exhaustGasTemp: temperature + 20,
        compressorRatio: Number((30 + (temperature - 780) / 50).toFixed(1)),
        healthScore,
        failureProbability,
        remainingUsefulLife: Math.max(200, 5000 - failureProbability * 28),
      };
    });
  }, [analytics, sensorHistory]);

  const summaryCards = useMemo(() => {
    if (!summary) return fleetCards;

    return [
      { label: 'Total Aircraft', value: summary.totalPlanes, icon: <Activity size={18} />, color: '#00D4FF' },
      { label: 'Operational', value: summary.operationalCount, icon: <CheckCircle size={18} />, color: '#22C55E' },
      { label: 'Critical Alerts', value: summary.activeCriticalAlerts, icon: <AlertOctagon size={18} />, color: '#EF4444' },
      { label: 'Tracked Engines', value: 8, icon: <Wrench size={18} />, color: '#38BDF8' },
    ];
  }, [summary, stats]);

  const aiMetrics = [
    { label: 'Fleet Health Score', value: stats.avgHealth, unit: '%', color: stats.avgHealth > 80 ? '#22C55E' : stats.avgHealth > 60 ? '#F59E0B' : '#EF4444' },
    { label: 'Active Faults', value: state.activeFault ? 1 : 0, unit: '', color: state.activeFault ? '#EF4444' : '#22C55E' },
    { label: 'Open Alerts', value: state.alerts.filter(a => !a.acknowledged).length, unit: '', color: '#F59E0B' },
    { label: 'Maintenance Due', value: state.maintenanceTasks.filter(t => t.status === 'scheduled' || t.status === 'overdue').length, unit: '', color: '#38BDF8' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, fontFamily: 'Rajdhani, sans-serif',
            color: '#E2E8F0', letterSpacing: '0.04em',
          }}>
            Operations Dashboard
          </h1>
          <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
            SkyGuard Edge · Aircraft Predictive Maintenance · Real-time AI Monitoring
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={state.activeFault ? 'critical' : state.isRunning ? 'healthy' : 'maintenance'} label={state.activeFault ? 'FAULT ACTIVE' : state.isRunning && !state.isPaused ? 'RUNNING' : 'IDLE'} />
          <div style={{ fontSize: 11, color: '#334155' }}>
            {new Date().toLocaleDateString('en', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* Fleet Stats Row */}
      <motion.div {...fadeUp(0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {summaryCards.map((c, i) => (
          <GlassCard key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.label}</span>
              <div style={{ color: c.color, opacity: 0.7 }}>{c.icon}</div>
            </div>
            <AnimatedCounter
              value={c.value}
              style={{ fontSize: 32, fontWeight: 900, color: c.color, fontFamily: 'Rajdhani, sans-serif', lineHeight: 1 }}
            />
            <div style={{ height: 2, background: `linear-gradient(90deg, ${c.color}40, transparent)`, borderRadius: 2 }} />
          </GlassCard>
        ))}
      </motion.div>

      {/* AI Metrics Row */}
      <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {aiMetrics.map((m, i) => (
          <GlassCard key={i}>
            <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <AnimatedCounter
                value={m.value}
                style={{ fontSize: 28, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani, sans-serif', lineHeight: 1 }}
              />
              {m.unit && <span style={{ fontSize: 13, color: '#475569' }}>{m.unit}</span>}
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeUp(0.15)}>
        <GlassCard>
          <SectionHeader title="Quick Actions" subtitle="Simulation & System Controls" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {!state.isRunning ? (
              <button className="btn btn-primary" onClick={startSimulation}>
                <Play size={13} /> Start Simulation
              </button>
            ) : state.isPaused ? (
              <button className="btn btn-primary" onClick={resumeSimulation}>
                <Play size={13} /> Resume
              </button>
            ) : (
              <button className="btn btn-warning" onClick={pauseSimulation}>
                <Pause size={13} /> Pause
              </button>
            )}
            <button className="btn btn-ghost" onClick={resetSimulation}>
              <RotateCcw size={13} /> Reset
            </button>
            <button
              className="btn btn-danger"
              onClick={() => injectFault('high_temperature')}
              disabled={!state.isRunning}
            >
              <Zap size={13} /> Inject Fault
            </button>
            <button className="btn btn-ghost">
              <Download size={13} /> Export Report
            </button>

            {/* Status pills */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '6px 12px', borderRadius: 8,
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                fontSize: 11.5, color: '#64748B',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Shield size={12} color="#00D4FF" />
                <span>AI System: <strong style={{ color: '#00D4FF' }}>Active</strong></span>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 8,
                background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
                fontSize: 11.5, color: '#64748B',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Clock size={12} color="#38BDF8" />
                <span>Mode: <strong style={{ color: '#38BDF8' }}>Prototype Sim</strong></span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Charts + Fleet Summary */}
      <motion.div {...fadeUp(0.2)} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Live health chart */}
        <GlassCard>
          <SectionHeader
            title="Live Health Score"
            subtitle={`Selected: ${state.fleet.find(f => f.id === state.selectedAircraftId)?.registration ?? ''} · Backend: ${backendAircraftLabel}`}
          />
          <LiveLineChart
            data={backendSensorHistory}
            dataKey="healthScore"
            color="#22C55E"
            unit="%"
            height={180}
            warningLine={80}
            criticalLine={55}
            domain={[0, 100]}
            filled
            decimals={0}
          />
        </GlassCard>

        {/* Fleet Summary */}
        <GlassCard>
          <SectionHeader title="Fleet Summary" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.fleet.map(ac => (
              <div key={ac.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,212,255,0.06)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: ac.status === 'healthy' ? '#22C55E' : ac.status === 'warning' ? '#F59E0B' : ac.status === 'critical' ? '#EF4444' : '#38BDF8',
                  boxShadow: `0 0 5px ${ac.status === 'healthy' ? '#22C55E' : ac.status === 'warning' ? '#F59E0B' : '#EF4444'}`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{ac.registration}</div>
                  <div style={{ fontSize: 10.5, color: '#475569' }}>{ac.model}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: ac.healthScore > 80 ? '#22C55E' : ac.healthScore > 60 ? '#F59E0B' : '#EF4444',
                    fontFamily: 'Rajdhani, sans-serif',
                  }}>
                    {ac.id === state.selectedAircraftId
                      ? Math.round(r.healthScore)
                      : ac.healthScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Bottom row: failure probability + maintenance */}
      <motion.div {...fadeUp(0.25)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard>
          <SectionHeader title="Failure Probability" subtitle="Current aircraft" />
          <LiveLineChart
            data={sensorHistory.slice(-60)}
            dataKey="failureProbability"
            color="#EF4444"
            unit="%"
            height={140}
            warningLine={35}
            criticalLine={60}
            domain={[0, 100]}
            filled
          />
        </GlassCard>
        <GlassCard>
          <SectionHeader title="Recent Maintenance Actions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.maintenanceTasks.slice(0, 4).map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'rgba(0,0,0,0.2)',
              }}>
                <Wrench size={13} color={
                  t.priority === 'immediate' ? '#EF4444' :
                  t.priority === 'high' ? '#F59E0B' : '#64748B'
                } />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#C0CCD8' }}>{t.aircraftReg}</div>
                  <div style={{ fontSize: 10.5, color: '#475569', marginTop: 1 }}>{t.action.slice(0, 40)}…</div>
                </div>
                <StatusBadge
                  status={t.priority === 'immediate' ? 'critical' : t.priority === 'high' ? 'warning' : 'info'}
                  label={t.priority.toUpperCase()}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
