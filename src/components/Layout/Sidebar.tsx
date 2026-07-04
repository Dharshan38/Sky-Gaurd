import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Plane, Radio, Activity, Cpu,
  Brain, Bell, Wrench, FlaskConical, Layers, Microscope,
  CalendarClock, Shield, ChevronRight
} from 'lucide-react';
import { useSimulation } from '../../store/SimulationContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/fleet', label: 'Fleet', icon: Plane },
  { to: '/aircraft', label: 'Aircraft', icon: Radio },
  { to: '/twin', label: 'Digital Twin', icon: Layers },
  { to: '/live', label: 'Live Monitoring', icon: Activity },
  { to: '/edge', label: 'Edge AI Device', icon: Cpu },
  { to: '/prediction', label: 'AI Prediction', icon: Brain },
  { to: '/explain', label: 'AI Explainability', icon: Microscope },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/scheduler', label: 'Maint. Scheduler', icon: CalendarClock },
  { to: '/simulation', label: 'Simulation Lab', icon: FlaskConical },
];

export default function Sidebar() {
  const { state } = useSimulation();
  const location = useLocation();
  const unacknowledgedAlerts = state.alerts.filter(a => !a.acknowledged).length;

  return (
    <aside className="app-sidebar" style={{
      background: 'linear-gradient(180deg, #071A2F 0%, #060F1E 100%)',
      borderRight: '1px solid rgba(0,212,255,0.1)',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #00D4FF, #0098B8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,212,255,0.4)',
          }}>
            <Shield size={18} color="#071A2F" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 800, letterSpacing: '0.04em',
              fontFamily: 'Rajdhani, sans-serif', color: '#00D4FF',
              lineHeight: 1.1,
            }}>
              SkyGuard
            </div>
            <div style={{ fontSize: 9.5, color: '#475569', letterSpacing: '0.12em', fontWeight: 600 }}>
              EDGE AI SYSTEM
            </div>
          </div>
        </div>

        {/* Simulation status pill */}
        <div style={{
          marginTop: 10,
          padding: '4px 10px',
          borderRadius: 20,
          background: state.isRunning && !state.isPaused
            ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${state.isRunning && !state.isPaused ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: state.isRunning && !state.isPaused ? '#22C55E' : '#F59E0B',
            boxShadow: `0 0 6px ${state.isRunning && !state.isPaused ? '#22C55E' : '#F59E0B'}`,
            animation: state.isRunning && !state.isPaused ? 'blink 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: state.isRunning && !state.isPaused ? '#22C55E' : '#F59E0B' }}>
            {state.isRunning && !state.isPaused ? 'SIM RUNNING' : state.isPaused ? 'SIM PAUSED' : 'SIM IDLE'}
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '10px 10px' }}>
        <div style={{ fontSize: 9.5, color: '#334155', letterSpacing: '0.12em', fontWeight: 700, padding: '6px 8px 4px', marginBottom: 2 }}>
          NAVIGATION
        </div>
        {navItems.map(({ to, label, icon: Icon, end }) => {
          const isAlerts = to === '/alerts';
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 2, position: 'relative' }}
            >
              <Icon className="nav-icon" />
              <span style={{ flex: 1 }}>{label}</span>
              {isAlerts && unacknowledgedAlerts > 0 && (
                <span style={{
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 10,
                  lineHeight: 1.6,
                }}>
                  {unacknowledgedAlerts}
                </span>
              )}
              {location.pathname === to && (
                <ChevronRight size={12} style={{ color: 'var(--cyan)', opacity: 0.6 }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 14px 14px',
        borderTop: '1px solid rgba(0,212,255,0.08)',
        background: 'rgba(7,26,47,0.5)',
      }}>
        <div style={{ fontSize: 10, color: '#334155', letterSpacing: '0.05em' }}>
          JETSON NANO 2GB
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: '#00D4FF',
            boxShadow: '0 0 6px #00D4FF', animation: 'blink 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 10.5, color: '#64748B' }}>Edge Device Ready</span>
        </div>
        <div style={{ fontSize: 9.5, color: '#1E3A5F', marginTop: 4 }}>
          Prototype Simulation v2.4.1
        </div>
      </div>
    </aside>
  );
}
