import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, List, Clock, DollarSign, Users, Wrench,
  AlertTriangle, Brain, ChevronRight, ChevronDown, CheckCircle,
} from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, SectionHeader, StatusBadge, AnimatedCounter } from '../components/ui/index';
import type { MaintenanceTask } from '../types';

// ─── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ tasks }: { tasks: MaintenanceTask[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const tasksByDay: Record<number, MaintenanceTask[]> = {};
  tasks.forEach(t => {
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const priorityColor: Record<string, string> = {
    immediate: '#EF4444', high: '#F59E0B', medium: '#38BDF8', low: '#22C55E',
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>{monthName}</div>
        <Calendar size={14} color="#00D4FF" />
      </div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9.5, color: '#475569', padding: '4px 0', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayTasks = tasksByDay[day] ?? [];
          const isToday = day === now.getDate();
          const highestPriority = dayTasks.sort((a, b) =>
            ['immediate', 'high', 'medium', 'low'].indexOf(a.priority) - ['immediate', 'high', 'medium', 'low'].indexOf(b.priority)
          )[0];
          return (
            <div key={day} style={{
              textAlign: 'center', padding: '5px 2px', borderRadius: 6,
              background: isToday ? 'rgba(0,212,255,0.15)' : dayTasks.length > 0 ? `${priorityColor[highestPriority?.priority ?? 'low']}12` : 'transparent',
              border: isToday ? '1px solid rgba(0,212,255,0.4)' : dayTasks.length > 0 ? `1px solid ${priorityColor[highestPriority?.priority ?? 'low']}30` : '1px solid transparent',
              cursor: dayTasks.length > 0 ? 'pointer' : 'default',
            }}>
              <div style={{ fontSize: 11, color: isToday ? '#00D4FF' : dayTasks.length > 0 ? '#94A3B8' : '#475569', fontWeight: isToday ? 700 : 400 }}>
                {day}
              </div>
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                  {dayTasks.slice(0, 3).map((t, j) => (
                    <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: priorityColor[t.priority] }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(priorityColor).map(([p, c]) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
            <span style={{ fontSize: 9.5, color: '#475569', textTransform: 'capitalize' }}>{p}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Timeline View ─────────────────────────────────────────────────────────────
function TimelineView({ tasks }: { tasks: MaintenanceTask[] }) {
  const sorted = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const priorityColor: Record<string, string> = {
    immediate: '#EF4444', high: '#F59E0B', medium: '#38BDF8', low: '#22C55E',
  };

  return (
    <GlassCard>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={14} color="#00D4FF" /> MAINTENANCE TIMELINE
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 90, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg,rgba(0,212,255,0.2),transparent)' }} />
        {sorted.map((task, i) => {
          const color = priorityColor[task.priority];
          return (
            <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}
            >
              <div style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'JetBrains Mono' }}>{task.dueDate}</div>
                <StatusBadge status={task.priority === 'immediate' ? 'critical' : task.priority === 'high' ? 'warning' : 'info'} label={task.priority.toUpperCase()} size="sm" />
              </div>
              {/* Timeline dot */}
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 8px ${color}40` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0', marginBottom: 2 }}>{task.action}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: '#64748B' }}>
                  <span>{task.aircraftReg}</span>
                  <span>·</span>
                  <span>{task.estimatedRepairHours}h downtime</span>
                  {task.technician && <><span>·</span><span>{task.technician}</span></>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── AI Recommendation Panel ──────────────────────────────────────────────────
function AIRecommendationPanel({ tasks }: { tasks: MaintenanceTask[] }) {
  const immediate = tasks.filter(t => t.priority === 'immediate');
  const high = tasks.filter(t => t.priority === 'high');

  const recs = [
    ...immediate.map(t => ({
      aircraft: t.aircraftReg,
      action: t.action,
      reason: t.notes ?? 'Immediate maintenance required based on AI prediction model.',
      urgency: 'Immediate',
      rul: '< 48 hours',
      color: '#EF4444',
    })),
    ...high.map(t => ({
      aircraft: t.aircraftReg,
      action: t.action,
      reason: t.notes ?? 'High priority maintenance identified by trend analysis.',
      urgency: 'High',
      rul: '7–14 days',
      color: '#F59E0B',
    })),
  ].slice(0, 4);

  return (
    <GlassCard>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Brain size={14} color="#A78BFA" /> AI RECOMMENDATIONS
      </div>
      {recs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#334155', fontSize: 12 }}>
          <CheckCircle size={22} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
          No urgent recommendations
        </div>
      ) : (
        recs.map((rec, i) => (
          <div key={i} style={{
            marginBottom: 12, padding: '12px 14px', borderRadius: 8,
            background: 'rgba(0,0,0,0.2)',
            borderLeft: `3px solid ${rec.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: rec.color, background: `${rec.color}18`, border: `1px solid ${rec.color}30`, borderRadius: 4, padding: '1px 6px' }}>
                {rec.urgency.toUpperCase()}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>{rec.aircraft}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>{rec.action}</div>
            <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 6 }}>{rec.reason}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10.5 }}>
              <span style={{ color: '#475569' }}>RUL Window: <strong style={{ color: rec.color }}>{rec.rul}</strong></span>
            </div>
          </div>
        ))
      )}
    </GlassCard>
  );
}

// ─── Maintenance Queue ─────────────────────────────────────────────────────────
function MaintenanceQueue({ tasks }: { tasks: MaintenanceTask[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const priorityColor: Record<string, string> = {
    immediate: '#EF4444', high: '#F59E0B', medium: '#38BDF8', low: '#22C55E',
  };
  const statusLabel: Record<string, string> = {
    scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue',
  };

  // Mock cost and resource estimates
  const costEstimate = (t: MaintenanceTask) => {
    const base = t.priority === 'immediate' ? 85000 : t.priority === 'high' ? 45000 : t.priority === 'medium' ? 18000 : 6000;
    return `$${(base + t.estimatedRepairHours * 800).toLocaleString()}`;
  };
  const engineersRequired = (t: MaintenanceTask) => t.priority === 'immediate' ? 6 : t.priority === 'high' ? 4 : 2;

  return (
    <GlassCard>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <List size={14} color="#00D4FF" /> MAINTENANCE QUEUE ({tasks.length} tasks)
      </div>
      {tasks.map((task, i) => {
        const isOpen = expanded === task.id;
        const color = priorityColor[task.priority];
        return (
          <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div
              onClick={() => setExpanded(isOpen ? null : task.id)}
              style={{
                marginBottom: 8, borderRadius: 8, overflow: 'hidden',
                border: `1px solid ${isOpen ? color + '50' : 'rgba(0,212,255,0.08)'}`,
                background: isOpen ? `${color}08` : 'rgba(0,0,0,0.2)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 4, padding: '1px 6px' }}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#64748B', fontFamily: 'JetBrains Mono' }}>{task.aircraftReg}</span>
                    <span style={{ fontSize: 10, color: '#334155' }}>·</span>
                    <span style={{ fontSize: 10, color: statusLabel[task.status] === 'In Progress' ? '#F59E0B' : statusLabel[task.status] === 'Completed' ? '#22C55E' : '#64748B' }}>
                      {statusLabel[task.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#C0CCD8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.action}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9.5, color: '#475569' }}>Due</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>{task.dueDate}</div>
                  </div>
                  <div style={{ color: isOpen ? color : '#475569', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden', borderTop: `1px solid ${color}20` }}
                  >
                    <div style={{ padding: '12px 14px 12px 30px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                        {[
                          { icon: <Clock size={11} />, label: 'Repair Time', value: `${task.estimatedRepairHours}h` },
                          { icon: <DollarSign size={11} />, label: 'Est. Cost', value: costEstimate(task) },
                          { icon: <Users size={11} />, label: 'Engineers', value: `${engineersRequired(task)} req.` },
                          { icon: <Wrench size={11} />, label: 'Rem. Cycles', value: task.estimatedCycles === 0 ? 'Immediate' : `${task.estimatedCycles}` },
                        ].map(item => (
                          <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 9.5, marginBottom: 3 }}>{item.icon} {item.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {task.notes && (
                        <div style={{ fontSize: 11.5, color: '#64748B', padding: '6px 10px', borderLeft: `2px solid ${color}40`, borderRadius: 4 }}>
                          📋 {task.notes}
                        </div>
                      )}
                      {task.technician && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#475569' }}>
                          Assigned to: <strong style={{ color: '#94A3B8' }}>{task.technician}</strong>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </GlassCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type ViewMode = 'queue' | 'calendar' | 'timeline';

export default function MaintenanceScheduler() {
  const { state } = useSimulation();
  const [view, setView] = useState<ViewMode>('queue');

  // Summary stats
  const tasks = state.maintenanceTasks;
  const immediate = tasks.filter(t => t.priority === 'immediate').length;
  const totalHours = tasks.reduce((s, t) => s + t.estimatedRepairHours, 0);
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="Maintenance Scheduler" subtitle="AI-powered maintenance planning, scheduling, and resource management">
          {immediate > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 11, color: '#EF4444', fontWeight: 700, animation: 'blink 2s infinite' }}>
              <AlertTriangle size={12} /> {immediate} IMMEDIATE ACTION REQUIRED
            </div>
          )}
        </SectionHeader>
      </motion.div>

      {/* Summary row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 4 }}>
          {[
            { label: 'Total Tasks', value: tasks.length, color: '#00D4FF' },
            { label: 'Immediate', value: immediate, color: '#EF4444' },
            { label: 'In Progress', value: inProgress, color: '#F59E0B' },
            { label: 'Total Downtime', value: totalHours + 'h', color: '#A78BFA', isStr: true },
          ].map(s => (
            <GlassCard key={s.label} style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 10.5, color: '#64748B', marginBottom: 6 }}>{s.label}</div>
              {s.isStr ? (
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'Rajdhani' }}>{s.value}</div>
              ) : (
                <AnimatedCounter value={s.value as number} decimals={0} style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'Rajdhani', display: 'block' }} />
              )}
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {([
          { mode: 'queue' as const, icon: <List size={13} />, label: 'Maintenance Queue' },
          { mode: 'calendar' as const, icon: <Calendar size={13} />, label: 'Calendar' },
          { mode: 'timeline' as const, icon: <Clock size={13} />, label: 'Timeline' },
        ] as const).map(v => (
          <button key={v.mode} className={`btn ${view === v.mode ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView(v.mode)} style={{ fontSize: 12 }}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        <AnimatePresence mode="wait">
          {view === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <MaintenanceQueue tasks={tasks} />
            </motion.div>
          )}
          {view === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <CalendarView tasks={tasks} />
            </motion.div>
          )}
          {view === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <TimelineView tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>

        <AIRecommendationPanel tasks={tasks} />
      </div>
    </div>
  );
}
