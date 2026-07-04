import { motion } from 'framer-motion';
import { Wrench, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, StatusBadge } from '../components/ui/index';
import type { MaintenanceTask } from '../types';

const PRIORITY_COLOR: Record<string, string> = {
  immediate: '#EF4444', high: '#F59E0B', medium: '#38BDF8', low: '#22C55E',
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: '#38BDF8' },
  in_progress: { label: 'In Progress', color: '#F59E0B' },
  completed: { label: 'Completed', color: '#22C55E' },
  overdue: { label: 'Overdue', color: '#EF4444' },
};

function TaskCard({ task, i }: { task: MaintenanceTask; i: number }) {
  const pc = PRIORITY_COLOR[task.priority];
  const sc = STATUS_LABEL[task.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.4 }}
    >
      <div className="glass-card" style={{
        padding: '14px 16px',
        borderColor: task.priority === 'immediate' ? 'rgba(239,68,68,0.3)' :
          task.priority === 'high' ? 'rgba(245,158,11,0.25)' : 'rgba(0,212,255,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Priority strip */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: pc, boxShadow: `2px 0 8px ${pc}40`,
        }} />

        <div style={{ paddingLeft: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, color: pc,
                  background: `${pc}18`, border: `1px solid ${pc}40`,
                  padding: '1px 7px', borderRadius: 4, letterSpacing: '0.08em',
                }}>
                  {task.priority.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, color: '#64748B',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {task.aircraftReg}
                </span>
                <span style={{ fontSize: 10, color: '#334155' }}>{task.id}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>{task.action}</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: sc.color,
              background: `${sc.color}15`, border: `1px solid ${sc.color}35`,
              padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap',
            }}>
              {sc.label}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
            {[
              { icon: <Calendar size={11} />, label: 'Due Date', value: task.dueDate },
              { icon: <Clock size={11} />, label: 'Est. Repair', value: `${task.estimatedRepairHours}h` },
              { icon: <AlertTriangle size={11} />, label: 'Rem. Cycles', value: task.estimatedCycles === 0 ? 'Immediate' : `${task.estimatedCycles}` },
              { icon: <CheckCircle size={11} />, label: 'Technician', value: task.technician ?? 'Unassigned' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 10, marginBottom: 3 }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {task.notes && (
            <div style={{
              fontSize: 11.5, color: '#64748B', padding: '6px 10px', borderRadius: 6,
              background: 'rgba(0,0,0,0.15)', borderLeft: `2px solid ${pc}40`,
            }}>
              📝 {task.notes}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Maintenance() {
  const { state } = useSimulation();
  const tasks = state.maintenanceTasks;

  const byPriority = {
    immediate: tasks.filter(t => t.priority === 'immediate'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="Maintenance Schedule" subtitle="AI-recommended maintenance actions and schedule tracker">
          <StatusBadge status={byPriority.immediate.length > 0 ? 'critical' : 'info'} label={`${tasks.length} TASKS`} />
        </SectionHeader>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Immediate', count: byPriority.immediate.length, color: '#EF4444' },
            { label: 'High Priority', count: byPriority.high.length, color: '#F59E0B' },
            { label: 'Medium', count: byPriority.medium.length, color: '#38BDF8' },
            { label: 'Low Priority', count: byPriority.low.length, color: '#22C55E' },
          ].map(c => (
            <GlassCard key={c.label} style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 10.5, color: '#64748B', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: c.color, fontFamily: 'Rajdhani' }}>{c.count}</div>
              <div style={{ height: 2, background: `linear-gradient(90deg, ${c.color}60, transparent)`, borderRadius: 2, marginTop: 6 }} />
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Tasks grouped by priority */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {byPriority.immediate.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', animation: 'blink 1s infinite' }} />
              IMMEDIATE ACTION REQUIRED
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byPriority.immediate.map((t, i) => <TaskCard key={t.id} task={t} i={i} />)}
            </div>
          </div>
        )}

        {byPriority.high.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', letterSpacing: '0.1em', marginBottom: 8, marginTop: 8 }}>
              HIGH PRIORITY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byPriority.high.map((t, i) => <TaskCard key={t.id} task={t} i={i} />)}
            </div>
          </div>
        )}

        {[...byPriority.medium, ...byPriority.low].length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', marginBottom: 8, marginTop: 8 }}>
              SCHEDULED MAINTENANCE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...byPriority.medium, ...byPriority.low].map((t, i) => <TaskCard key={t.id} task={t} i={i} />)}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <GlassCard style={{ textAlign: 'center', padding: 40, color: '#334155' }}>
            <Wrench size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            No maintenance tasks
          </GlassCard>
        )}
      </div>
    </div>
  );
}
