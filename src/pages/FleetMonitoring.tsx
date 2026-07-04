import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plane, Clock, Activity } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import { GlassCard, StatusBadge, SectionHeader, HealthGauge } from '../components/ui/index';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['all', 'healthy', 'warning', 'critical', 'maintenance'];

export default function FleetMonitoring() {
  const { state, setSelectedAircraft } = useSimulation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const filtered = state.fleet.filter(ac => {
    const matchSearch = search === '' ||
      ac.registration.toLowerCase().includes(search.toLowerCase()) ||
      ac.model.toLowerCase().includes(search.toLowerCase()) ||
      ac.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || ac.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSelect = (id: string) => {
    setSelectedAircraft(id);
    navigate('/aircraft');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SectionHeader
          title="Fleet Monitoring"
          subtitle={`${state.fleet.length} aircraft registered · ${state.fleet.filter(f => f.status === 'healthy').length} operational`}
        >
          <StatusBadge status="info" label="LIVE OVERVIEW" />
        </SectionHeader>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,212,255,0.12)',
            borderRadius: 8, padding: '8px 14px',
          }}>
            <Search size={14} color="#475569" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by registration, model, location..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#94A3B8', fontSize: 13, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterStatus(s)}
                style={{ fontSize: 11, padding: '6px 12px', textTransform: 'capitalize' }}
              >
                {s === 'all' ? <Filter size={11} /> : null}
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Aircraft Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {filtered.map((ac, i) => {
          const isSelected = ac.id === state.selectedAircraftId;
          const displayHealth = isSelected ? Math.round(state.currentReading.healthScore) : ac.healthScore;

          return (
            <motion.div
              key={ac.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <GlassCard
                active={isSelected}
                onClick={() => handleSelect(ac.id)}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {/* Glow strip */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: ac.status === 'healthy'
                    ? 'linear-gradient(90deg, transparent, #22C55E, transparent)'
                    : ac.status === 'warning'
                    ? 'linear-gradient(90deg, transparent, #F59E0B, transparent)'
                    : ac.status === 'critical'
                    ? 'linear-gradient(90deg, transparent, #EF4444, transparent)'
                    : 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
                }} />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Plane size={16} color="#00D4FF" style={{ transform: 'rotate(-45deg)' }} />
                      <span style={{
                        fontSize: 18, fontWeight: 800, color: '#E2E8F0',
                        fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em',
                      }}>
                        {ac.registration}
                      </span>
                      {isSelected && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: '#00D4FF',
                          background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)',
                          borderRadius: 4, padding: '1px 6px', letterSpacing: '0.08em',
                        }}>SELECTED</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{ac.model}</div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 1 }}>{ac.airline}</div>
                  </div>
                  <StatusBadge status={ac.status} />
                </div>

                {/* Body */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <HealthGauge value={displayHealth} size={90} label="Health" />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Flight Cycles', value: ac.flightCycles.toLocaleString(), icon: <Activity size={11} /> },
                        { label: 'Flight Hours', value: ac.flightHours.toLocaleString() + 'h', icon: <Clock size={11} /> },
                        { label: 'Engines', value: `${ac.engines.length}x ${ac.engines[0]?.type.split('-')[0]}`, icon: null },
                        { label: 'Next Maint.', value: ac.nextMaintenance, icon: null },
                      ].map((item, j) => (
                        <div key={j} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px' }}>
                          <div style={{ fontSize: 9.5, color: '#475569', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {item.icon}
                            {item.label}
                          </div>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Engine health bars */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ac.engines.map(eng => (
                        <div key={eng.id} style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#475569', marginBottom: 3 }}>
                            <span>{eng.name}</span>
                            <span style={{ color: eng.healthScore > 80 ? '#22C55E' : eng.healthScore > 60 ? '#F59E0B' : '#EF4444' }}>
                              {eng.healthScore}%
                            </span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${eng.healthScore}%`,
                              background: eng.healthScore > 80 ? '#22C55E' : eng.healthScore > 60 ? '#F59E0B' : '#EF4444',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,212,255,0.07)',
                  fontSize: 11, color: '#334155',
                }}>
                  <span>📍 {ac.location}</span>
                  <span>{ac.route}</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#334155' }}>
            No aircraft match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
