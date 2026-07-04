import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertOctagon, AlertTriangle, Info, CheckCheck, Clock } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, StatusBadge } from '../components/ui/index';

type Filter = 'all' | 'critical' | 'warning' | 'info' | 'unread';

export default function Alerts() {
  const { state, acknowledgeAlert } = useSimulation();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = state.alerts.filter(a => {
    if (filter === 'unread') return !a.acknowledged;
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const counts = {
    all: state.alerts.length,
    critical: state.alerts.filter(a => a.severity === 'critical').length,
    warning: state.alerts.filter(a => a.severity === 'warning').length,
    info: state.alerts.filter(a => a.severity === 'info').length,
    unread: state.alerts.filter(a => !a.acknowledged).length,
  };

  const SEVERITY_ICON: Record<string, React.ReactNode> = {
    critical: <AlertOctagon size={16} color="#EF4444" />,
    warning: <AlertTriangle size={16} color="#F59E0B" />,
    info: <Info size={16} color="#00D4FF" />,
  };

  const SEVERITY_COLOR: Record<string, string> = {
    critical: '#EF4444', warning: '#F59E0B', info: '#00D4FF',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          title="Alert Management"
          subtitle="Fleet-wide alerts & fault notifications"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={14} color="#F59E0B" />
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {counts.unread} unacknowledged
            </span>
          </div>
        </SectionHeader>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['all', 'critical', 'warning', 'info', 'unread'] as Filter[]).map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
              style={{ fontSize: 11.5, padding: '5px 12px', textTransform: 'capitalize' }}
            >
              {f === 'critical' && <AlertOctagon size={11} />}
              {f === 'warning' && <AlertTriangle size={11} />}
              {f === 'info' && <Info size={11} />}
              {f} ({counts[f]})
            </button>
          ))}
          {counts.unread > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => state.alerts.forEach(a => acknowledgeAlert(a.id))}
              style={{ marginLeft: 'auto', fontSize: 11.5, padding: '5px 12px' }}
            >
              <CheckCheck size={12} /> Acknowledge All
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Critical', count: counts.critical, color: '#EF4444', icon: <AlertOctagon size={18} /> },
            { label: 'Warning', count: counts.warning, color: '#F59E0B', icon: <AlertTriangle size={18} /> },
            { label: 'Info', count: counts.info, color: '#00D4FF', icon: <Info size={18} /> },
          ].map(c => (
            <GlassCard key={c.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', marginBottom: 6 }}>{c.label.toUpperCase()}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: c.color, fontFamily: 'Rajdhani' }}>{c.count}</div>
                </div>
                <div style={{ color: c.color, opacity: 0.6 }}>{c.icon}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: 40, color: '#334155' }}>
              <Bell size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
              No alerts in this category
            </GlassCard>
          ) : (
            filtered.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <div
                  className={`glass-card ${!alert.acknowledged && alert.severity === 'critical' ? 'glow-critical' : ''}`}
                  style={{
                    padding: '14px 16px',
                    opacity: alert.acknowledged ? 0.55 : 1,
                    transition: 'opacity 0.3s',
                    borderColor: alert.acknowledged ? 'rgba(0,212,255,0.06)' : `${SEVERITY_COLOR[alert.severity]}30`,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Severity strip */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: SEVERITY_COLOR[alert.severity],
                    boxShadow: `2px 0 10px ${SEVERITY_COLOR[alert.severity]}40`,
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 8 }}>
                    {SEVERITY_ICON[alert.severity]}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0' }}>{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span style={{
                          fontSize: 10.5, color: '#475569', fontFamily: 'JetBrains Mono',
                          background: 'rgba(0,212,255,0.06)', padding: '1px 6px', borderRadius: 4,
                        }}>
                          {alert.aircraftReg}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{alert.message}</p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#475569', marginBottom: 6 }}>
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                      {!alert.acknowledged ? (
                        <button
                          className="btn btn-ghost"
                          onClick={() => acknowledgeAlert(alert.id)}
                          style={{ fontSize: 10.5, padding: '4px 10px' }}
                        >
                          <CheckCheck size={11} /> Acknowledge
                        </button>
                      ) : (
                        <span style={{ fontSize: 10.5, color: '#334155' }}>✓ Acknowledged</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Alert History Note */}
      {state.alerts.length > 0 && (
        <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', paddingTop: 4 }}>
          Showing {filtered.length} of {state.alerts.length} total alerts · Auto-generated from simulation engine
        </div>
      )}
    </div>
  );
}
