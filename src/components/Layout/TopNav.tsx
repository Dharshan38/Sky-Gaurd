import { useState } from 'react';
import { Search, Bell, Wifi } from 'lucide-react';
import { useSimulation } from '../../store/SimulationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav() {
  const { state, acknowledgeAlert } = useSimulation();
  const [showNotifs, setShowNotifs] = useState(false);
  const unacked = state.alerts.filter(a => !a.acknowledged);

  return (
    <header className="app-topnav" style={{
      background: 'rgba(7,26,47,0.95)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px',
      backdropFilter: 'blur(12px)',
      zIndex: 50,
    }}>
      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 360,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 8, padding: '6px 12px',
      }}>
        <Search size={14} color="#475569" />
        <input
          placeholder="Search aircraft, alerts, sensors..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#94A3B8', fontSize: 12.5, width: '100%',
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {/* Connectivity status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 6, padding: '4px 8px',
        }}>
          <Wifi size={11} color="#22C55E" />
          <span style={{ fontSize: 10.5, color: '#22C55E', fontWeight: 600 }}>LIVE</span>
        </div>

        {/* Prototype badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(56,189,248,0.1))',
          border: '1px solid rgba(0,212,255,0.35)',
          borderRadius: 6, padding: '4px 10px',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#00D4FF',
        }}>
          PROTOTYPE SIMULATION
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            style={{
              background: unacked.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${unacked.length > 0 ? 'rgba(239,68,68,0.35)' : 'rgba(0,212,255,0.1)'}`,
              borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', position: 'relative',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <Bell size={15} color={unacked.length > 0 ? '#EF4444' : '#64748B'} />
            {unacked.length > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                background: '#EF4444', color: '#fff',
                fontSize: 9, fontWeight: 700,
                width: 15, height: 15, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unacked.length > 9 ? '9+' : unacked.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 340, maxHeight: 400, overflowY: 'auto',
                  background: 'rgba(7,26,47,0.98)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: 10, zIndex: 999,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid rgba(0,212,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                    Alerts ({unacked.length} new)
                  </span>
                  {unacked.length > 0 && (
                    <button
                      onClick={() => unacked.forEach(a => acknowledgeAlert(a.id))}
                      style={{ fontSize: 10.5, color: '#00D4FF', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Acknowledge All
                    </button>
                  )}
                </div>
                {state.alerts.slice(0, 8).length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#475569', fontSize: 12 }}>
                    No alerts
                  </div>
                ) : (
                  state.alerts.slice(0, 8).map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => acknowledgeAlert(alert.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(0,212,255,0.05)',
                        cursor: 'pointer',
                        opacity: alert.acknowledged ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          background: alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#F59E0B' : '#22C55E',
                        }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{alert.title}</span>
                        <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#64748B', marginTop: 3, paddingLeft: 14 }}>
                        {alert.message.slice(0, 80)}…
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>
    </header>
  );
}
