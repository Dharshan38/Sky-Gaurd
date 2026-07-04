import { motion } from 'framer-motion';
import { FileText, Download, BarChart2, Clock } from 'lucide-react';
import { GlassCard, SectionHeader, StatusBadge } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';
import { useSimulation } from '../store/SimulationContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Reports() {
  const { state } = useSimulation();

  const fleetData = state.fleet.map(a => ({
    name: a.registration,
    health: a.id === state.selectedAircraftId ? Math.round(state.currentReading.healthScore) : a.healthScore,
    cycles: a.flightCycles,
  }));

  const maintenanceHistory = [
    { month: 'Jan', actions: 3, cost: 42 },
    { month: 'Feb', actions: 5, cost: 87 },
    { month: 'Mar', actions: 2, cost: 28 },
    { month: 'Apr', actions: 7, cost: 115 },
    { month: 'May', actions: 4, cost: 62 },
    { month: 'Jun', actions: 6, cost: 94 },
    { month: 'Jul', actions: 2, cost: 38 },
  ];

  const handleExportCSV = () => {
    const headers = ['Aircraft', 'Model', 'Status', 'Health Score', 'Flight Cycles', 'Flight Hours'];
    const rows = state.fleet.map(a => [
      a.registration, a.model, a.status, a.healthScore, a.flightCycles, a.flightHours,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'skyguard-fleet-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="Reports & Analytics" subtitle="Fleet performance analytics and maintenance history">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleExportCSV} style={{ fontSize: 12 }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="btn btn-ghost" onClick={handleExportPDF} style={{ fontSize: 12 }}>
              <FileText size={13} /> Export PDF
            </button>
          </div>
        </SectionHeader>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Alerts Generated', value: state.alerts.length, color: '#F59E0B' },
            { label: 'Maintenance Tasks', value: state.maintenanceTasks.length, color: '#38BDF8' },
            { label: 'Sim Ticks Elapsed', value: state.tick, color: '#A78BFA' },
            { label: 'Avg Fleet Health', value: `${Math.round(state.fleet.reduce((s, a) => s + a.healthScore, 0) / state.fleet.length)}%`, color: '#22C55E', isStr: true },
          ].map(m => (
            <GlassCard key={m.label}>
              <div style={{ fontSize: 10.5, color: '#64748B', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color, fontFamily: 'Rajdhani' }}>
                {m.isStr ? m.value : (m.value as number).toLocaleString()}
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Fleet Health Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={14} color="#00D4FF" /> FLEET HEALTH ANALYTICS
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fleetData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(0,212,255,0.1)' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(0,212,255,0.1)' }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(7,26,47,0.96)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8 }}
                labelStyle={{ color: '#64748B' }}
                itemStyle={{ color: '#00D4FF' }}
              />
              <Bar dataKey="health" fill="#00D4FF" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Two charts row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Maintenance History */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} color="#F59E0B" /> MAINTENANCE HISTORY (2026)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={maintenanceHistory} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(7,26,47,0.96)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8 }} />
                <Bar dataKey="actions" fill="#F59E0B" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Live Health Trend */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={14} color="#22C55E" /> LIVE HEALTH TREND
            </div>
            <LiveLineChart
              data={state.sensorHistory.slice(-60)}
              dataKey="healthScore"
              color="#22C55E"
              height={180}
              unit="%"
              warningLine={80}
              criticalLine={55}
              domain={[0, 100]}
              filled
            />
          </GlassCard>
        </div>
      </motion.div>

      {/* Report Table */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14 }}>FLEET STATUS REPORT</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                {['Registration', 'Model', 'Status', 'Health', 'Cycles', 'Hours', 'Location', 'Next Maint.'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: 10.5, letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.fleet.map(ac => {
                const health = ac.id === state.selectedAircraftId ? Math.round(state.currentReading.healthScore) : ac.healthScore;
                return (
                  <tr key={ac.id} style={{ borderBottom: '1px solid rgba(0,212,255,0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '9px 10px', color: '#00D4FF', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{ac.registration}</td>
                    <td style={{ padding: '9px 10px', color: '#94A3B8' }}>{ac.model}</td>
                    <td style={{ padding: '9px 10px' }}><StatusBadge status={ac.status} size="sm" /></td>
                    <td style={{ padding: '9px 10px', color: health > 80 ? '#22C55E' : health > 60 ? '#F59E0B' : '#EF4444', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{health}%</td>
                    <td style={{ padding: '9px 10px', color: '#64748B', fontFamily: 'JetBrains Mono' }}>{ac.flightCycles.toLocaleString()}</td>
                    <td style={{ padding: '9px 10px', color: '#64748B', fontFamily: 'JetBrains Mono' }}>{ac.flightHours.toLocaleString()}</td>
                    <td style={{ padding: '9px 10px', color: '#64748B' }}>{ac.location}</td>
                    <td style={{ padding: '9px 10px', color: '#38BDF8', fontFamily: 'JetBrains Mono', fontSize: 11.5 }}>{ac.nextMaintenance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      </motion.div>
    </div>
  );
}
