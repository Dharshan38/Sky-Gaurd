import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Thermometer, Gauge, Wind, Clock, ChevronRight } from 'lucide-react';
import { useSimulation } from '../store/SimulationContext';
import {
  ENGINE_ZONES, SUBSYSTEM_ZONES,
  computeComponentHealth, getHealthColor, getHealthStatus,
  type EngineZone, type SubsystemZone,
} from '../data/engineComponents';
import { GlassCard, SectionHeader, StatusBadge, AnimatedCounter } from '../components/ui/index';
import { LiveLineChart } from '../components/charts/LiveLineChart';

// ─── Particle animation config ────────────────────────────────────────────────
const PARTICLES = [
  { y: 148, r: 3.5, delay: 0,    dur: 2.6 },
  { y: 152, r: 2.5, delay: 0.5,  dur: 2.8 },
  { y: 145, r: 2,   delay: 1.0,  dur: 3.0 },
  { y: 155, r: 2,   delay: 1.5,  dur: 2.4 },
  { y: 150, r: 4,   delay: 2.0,  dur: 3.2 },
  { y: 143, r: 1.5, delay: 0.8,  dur: 2.9 },
  { y: 157, r: 1.5, delay: 1.8,  dur: 2.7 },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Engine Zone Polygon ──────────────────────────────────────────────────────
function ZonePolygon({
  zone, health, isHovered, isSelected, onClick, onHover,
}: {
  zone: EngineZone;
  health: number;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (z: EngineZone | null) => void;
}) {
  const color = getHealthColor(health);
  const fillAlpha = isSelected ? 0.55 : isHovered ? 0.45 : 0.28;
  const fill = hexToRgba(color, fillAlpha);
  const strokeColor = isSelected ? color : isHovered ? hexToRgba(color, 0.9) : hexToRgba(color, 0.45);
  const strokeW = isSelected ? 2.5 : isHovered ? 2 : 1;
  const glow = (isHovered || isSelected) ? `drop-shadow(0 0 8px ${color})` : 'none';

  return (
    <motion.polygon
      points={zone.poly}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeW}
      style={{ cursor: 'pointer', filter: glow, transition: 'fill 0.6s ease, stroke 0.3s ease' }}
      onClick={onClick}
      onMouseEnter={() => onHover(zone)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.01 }}
    />
  );
}

// ─── Blade indicators helper ──────────────────────────────────────────────────
function BladeLines({ x, yTop, yBot, count = 4, color }: { x: number; yTop: number; yBot: number; count?: number; color: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const xPos = x + i * 8;
        return <line key={i} x1={xPos} y1={yTop} x2={xPos} y2={yBot} stroke={hexToRgba(color, 0.18)} strokeWidth={1} />;
      })}
    </>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({
  zone, health, onClose, sensorHistory, currentReading,
}: {
  zone: EngineZone | SubsystemZone;
  health: number;
  onClose: () => void;
  sensorHistory: any[];
  currentReading: any;
}) {
  const color = getHealthColor(health);
  const status = getHealthStatus(health);
  const isEngine = 'poly' in zone;

  const sensorKey = isEngine
    ? (zone as EngineZone).primarySensor === 'RPM' ? 'rpm' as const
      : (zone as EngineZone).primarySensor === 'Pressure' ? 'pressure' as const
      : (zone as EngineZone).primarySensor === 'Compressor Ratio' ? 'compressorRatio' as const
      : (zone as EngineZone).primarySensor === 'EGT' ? 'exhaustGasTemp' as const
      : (zone as EngineZone).primarySensor === 'Vibration' ? 'vibration' as const
      : 'temperature' as const
    : (zone as SubsystemZone).primarySensor === 'Oil Pressure' ? 'oilPressure' as const
      : (zone as SubsystemZone).primarySensor === 'Fuel Flow' ? 'fuelFlow' as const
      : 'vibration' as const;

  return (
    <motion.div
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: 320, flexShrink: 0,
        background: 'rgba(7,26,47,0.98)',
        border: `1px solid ${hexToRgba(color, 0.4)}`,
        borderRadius: 12,
        overflowY: 'auto',
        maxHeight: '100%',
        boxShadow: `0 0 30px ${hexToRgba(color, 0.15)}`,
      }}
    >
      {/* Panel Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${hexToRgba(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#E2E8F0', fontFamily: 'Rajdhani', letterSpacing: '0.04em' }}>
              {zone.label}
            </span>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Health */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>COMPONENT HEALTH</div>
          <div style={{ fontSize: 42, fontWeight: 900, color, fontFamily: 'Rajdhani', lineHeight: 1 }}>
            <AnimatedCounter value={health} decimals={0} suffix="%" />
          </div>
          <div style={{ height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}` }}
              animate={{ width: `${health}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.6 }}>{zone.description}</p>

        {/* Live Chart */}
        <div>
          <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 6, fontWeight: 600 }}>LIVE SENSOR TREND</div>
          <LiveLineChart data={sensorHistory.slice(-40)} dataKey={sensorKey} color={color} unit={isEngine ? (zone as EngineZone).unit : (zone as SubsystemZone).unit} height={110} filled />
        </div>

        {/* Quick metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Temperature', value: currentReading.temperature.toFixed(0), unit: '°C', icon: <Thermometer size={11} /> },
            { label: 'Vibration', value: currentReading.vibration.toFixed(3), unit: ' g', icon: <Activity size={11} /> },
            { label: 'Pressure', value: currentReading.pressure.toFixed(0), unit: ' PSI', icon: <Gauge size={11} /> },
            { label: 'Oil Pressure', value: currentReading.oilPressure.toFixed(0), unit: ' PSI', icon: <Wind size={11} /> },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 9.5, marginBottom: 4 }}>
                {m.icon} {m.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>
                {m.value}{m.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance History */}
        <div>
          <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} /> MAINTENANCE HISTORY
          </div>
          {zone.maintenanceNotes.map((note, i) => (
            <div key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${hexToRgba(color, 0.3)}`, fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
              {note}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DigitalTwin() {
  const { state } = useSimulation();
  const { currentReading: r, activeFault, tick, sensorHistory } = state;
  const ac = state.fleet.find(f => f.id === state.selectedAircraftId);
  const [hoveredZone, setHoveredZone] = useState<EngineZone | SubsystemZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<EngineZone | SubsystemZone | null>(null);
  const [particlePhase, setParticlePhase] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  // Animate particles
  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      setParticlePhase(((ts - startRef.current) / 1000) % 10);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute per-component health
  const componentHealth = useMemo(() => {
    const map: Record<string, number> = {};
    [...ENGINE_ZONES, ...SUBSYSTEM_ZONES].forEach(z => {
      map[z.id] = computeComponentHealth(r.healthScore, activeFault, z.id, tick);
    });
    return map;
  }, [r.healthScore, activeFault, tick]);

  const handleZoneClick = (zone: EngineZone | SubsystemZone) => {
    setSelectedZone(prev => prev?.id === zone.id ? null : zone);
  };

  // Worst-health component for alerts
  const worstComponent = [...ENGINE_ZONES, ...SUBSYSTEM_ZONES]
    .map(z => ({ id: z.id, label: z.label, health: componentHealth[z.id] }))
    .sort((a, b) => a.health - b.health)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          title="Digital Twin Engine"
          subtitle={`Interactive 3D Engine Model · ${ac?.registration ?? ''} · ${ac?.model ?? ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeFault && (
              <div style={{ fontSize: 11, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 10px', animation: 'blink 1.5s infinite' }}>
                ⚡ FAULT ACTIVE: {activeFault.replace(/_/g, ' ').toUpperCase()}
              </div>
            )}
            <StatusBadge status={getHealthStatus(r.healthScore)} label={`ENGINE ${Math.round(r.healthScore)}%`} />
          </div>
        </SectionHeader>
      </motion.div>

      {/* Worst component alert */}
      <AnimatePresence>
        {worstComponent && componentHealth[worstComponent.id] < 60 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 12.5, color: '#E2E8F0',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'blink 1s infinite' }} />
            <strong style={{ color: '#EF4444' }}>Critical Component:</strong>
            {worstComponent.label} — Health {componentHealth[worstComponent.id].toFixed(0)}% — Immediate inspection recommended
            <ChevronRight size={14} color="#EF4444" style={{ marginLeft: 'auto' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content: component list + engine + detail panel */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

        {/* Left: Component Health List */}
        <div style={{ width: 186, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9.5, color: '#334155', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>COMPONENT HEALTH</div>
          {[...ENGINE_ZONES, ...SUBSYSTEM_ZONES].map(zone => {
            const h = componentHealth[zone.id];
            const color = getHealthColor(h);
            const isActive = hoveredZone?.id === zone.id || selectedZone?.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                  background: isActive ? hexToRgba(color, 0.12) : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${isActive ? hexToRgba(color, 0.4) : 'rgba(0,212,255,0.06)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
                  boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                  animation: h < 50 ? 'blink 1.2s infinite' : 'none',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#E2E8F0' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {'shortLabel' in zone ? zone.shortLabel : zone.id}
                  </div>
                  <div style={{ height: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 1, marginTop: 3, overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', borderRadius: 1, background: color }} animate={{ width: `${h}%` }} transition={{ duration: 0.7 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
                  {h.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Engine SVG */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GlassCard style={{ padding: 0, overflow: 'hidden', position: 'relative', flex: 1 }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* SVG Engine */}
            <svg
              viewBox="0 0 870 300"
              width="100%"
              style={{ display: 'block' }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="zone-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="particle-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Engine outer casing */}
              <polygon
                points="20,10 120,48 290,72 440,92 545,84 645,92 790,72 870,88 870,212 790,228 645,208 545,216 440,208 290,228 120,252 20,290"
                fill="none"
                stroke="rgba(0,212,255,0.18)"
                strokeWidth="1.5"
              />

              {/* Engine zone polygons */}
              {ENGINE_ZONES.map(zone => (
                <ZonePolygon
                  key={zone.id}
                  zone={zone}
                  health={componentHealth[zone.id] ?? 90}
                  isHovered={hoveredZone?.id === zone.id}
                  isSelected={selectedZone?.id === zone.id}
                  onClick={() => handleZoneClick(zone)}
                  onHover={(z) => setHoveredZone(z)}
                />
              ))}

              {/* Centerline shaft */}
              <line x1="120" y1="150" x2="790" y2="150" stroke="rgba(0,212,255,0.25)" strokeWidth="2" strokeDasharray="6 4" />

              {/* Bearing indicators on shaft */}
              {[200, 440, 640].map((bx, i) => {
                const bHealth = componentHealth['bearings'] ?? 90;
                const bColor = getHealthColor(bHealth);
                return (
                  <g key={i}
                    onClick={() => handleZoneClick(SUBSYSTEM_ZONES[0])}
                    onMouseEnter={() => setHoveredZone(SUBSYSTEM_ZONES[0])}
                    onMouseLeave={() => setHoveredZone(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={bx} cy={150} r={8} fill={hexToRgba(bColor, 0.2)} stroke={bColor} strokeWidth={1.5} />
                    <circle cx={bx} cy={150} r={3} fill={bColor} opacity={0.9} filter="url(#zone-glow)" />
                  </g>
                );
              })}

              {/* Fan blade lines */}
              {[-100, -65, -30, 5, 40, 75, 110].map((offset, i) => (
                <line key={`fan-blade-${i}`}
                  x1={72} y1={150}
                  x2={28} y2={150 + offset}
                  stroke="rgba(255,255,255,0.1)" strokeWidth={1.5}
                />
              ))}

              {/* LPC stage lines */}
              {[145, 175, 210, 248].map((xPos, i) => {
                const t = (xPos - 120) / 170;
                const yT = 48 + t * 24;
                const yB = 252 - t * 24;
                return <line key={`lpc-stage-${i}`} x1={xPos} y1={yT} x2={xPos} y2={yB} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
              })}

              {/* HPC stage lines */}
              {[310, 340, 375, 410, 432].map((xPos, i) => {
                const t = (xPos - 290) / 150;
                const yT = 72 + t * 20;
                const yB = 228 - t * 20;
                return <line key={`hpc-stage-${i}`} x1={xPos} y1={yT} x2={xPos} y2={yB} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
              })}

              {/* Combustor flame indicator */}
              <ellipse cx={492} cy={150} rx={28} ry={22} fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.3)" strokeWidth={1} />
              <ellipse cx={492} cy={150} rx={12} ry={10} fill="rgba(249,115,22,0.2)" />

              {/* HPT blade lines */}
              {[565, 600, 632].map((xPos, i) => {
                const t = (xPos - 545) / 100;
                const yT = 84 + t * 8;
                const yB = 216 - t * 8;
                return <line key={`hpt-blade-${i}`} x1={xPos} y1={yT} x2={xPos} y2={yB} stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} />;
              })}

              {/* LPT blade lines */}
              {[668, 710, 755, 785].map((xPos, i) => {
                const t = (xPos - 645) / 145;
                const yT = 92 - t * 20;
                const yB = 208 + t * 20;
                return <line key={`lpt-blade-${i}`} x1={xPos} y1={yT} x2={xPos} y2={yB} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
              })}

              {/* Zone Labels */}
              {ENGINE_ZONES.map(zone => {
                const color = getHealthColor(componentHealth[zone.id] ?? 90);
                return (
                  <g key={`label-${zone.id}`} style={{ pointerEvents: 'none' }}>
                    <text x={zone.cx} y={zone.cy - 10} textAnchor="middle"
                      fill={color} fontSize="8.5" fontFamily="JetBrains Mono, monospace"
                      fontWeight="600" letterSpacing="0.08em" opacity={0.9}
                    >
                      {zone.shortLabel}
                    </text>
                    <text x={zone.cx} y={zone.cy + 6} textAnchor="middle"
                      fill={color} fontSize="11" fontFamily="Rajdhani, sans-serif"
                      fontWeight="700" opacity={0.85}
                    >
                      {(componentHealth[zone.id] ?? 90).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Animated data particles */}
              {PARTICLES.map((p, i) => {
                const totalDur = p.dur;
                const phase = ((particlePhase + p.delay) % totalDur) / totalDur;
                const cx = 20 + phase * 850;
                const color = componentHealth['fan'] > 80 ? '#00D4FF' : componentHealth['fan'] > 60 ? '#F59E0B' : '#EF4444';
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={p.y}
                    r={p.r}
                    fill={color}
                    opacity={0.75}
                    filter="url(#particle-glow)"
                  />
                );
              })}

              {/* Entry arrow */}
              <path d="M 5,150 L 18,143 L 18,157 Z" fill="rgba(0,212,255,0.5)" />
              {/* Exit arrow */}
              <path d="M 865,150 L 852,143 L 852,157 Z" fill="rgba(0,212,255,0.4)" />
            </svg>

            {/* Hover tooltip overlay */}
            <AnimatePresence>
              {hoveredZone && !selectedZone && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  style={{
                    position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(7,26,47,0.97)',
                    border: `1px solid ${hexToRgba(getHealthColor(componentHealth[hoveredZone.id] ?? 90), 0.5)}`,
                    borderRadius: 8, padding: '10px 16px',
                    display: 'flex', gap: 16, alignItems: 'center',
                    pointerEvents: 'none', zIndex: 10,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
                    minWidth: 420,
                  }}
                >
                  {[
                    { label: 'Component', value: hoveredZone.label, color: getHealthColor(componentHealth[hoveredZone.id] ?? 90) },
                    { label: 'Health', value: `${(componentHealth[hoveredZone.id] ?? 90).toFixed(0)}%`, color: getHealthColor(componentHealth[hoveredZone.id] ?? 90) },
                    { label: 'EGT', value: `${r.temperature.toFixed(0)}°C`, color: '#F97316' },
                    { label: 'Vibration', value: `${r.vibration.toFixed(3)}g`, color: '#F59E0B' },
                    { label: 'Failure Prob.', value: `${r.failureProbability.toFixed(1)}%`, color: '#EF4444' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono' }}>{item.value}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: 'auto', fontSize: 9.5, color: '#334155' }}>Click for details →</div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Subsystem row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {SUBSYSTEM_ZONES.map(sz => {
              const h = componentHealth[sz.id] ?? 90;
              const color = getHealthColor(h);
              const isActive = hoveredZone?.id === sz.id || selectedZone?.id === sz.id;
              return (
                <div
                  key={sz.id}
                  onClick={() => handleZoneClick(sz)}
                  onMouseEnter={() => setHoveredZone(sz)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`glass-card ${h < 50 ? 'glow-critical' : h < 70 ? 'glow-warning' : ''}`}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderColor: isActive ? hexToRgba(color, 0.5) : hexToRgba(color, 0.15),
                    transition: 'all 0.25s',
                    background: isActive ? hexToRgba(color, 0.08) : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{sz.icon}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8' }}>{sz.label}</span>
                    <div style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color, fontFamily: 'Rajdhani' }}>
                      <AnimatedCounter value={h} decimals={0} suffix="%" />
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}40` }}
                      animate={{ width: `${h}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#334155', marginTop: 5 }}>{sz.description.slice(0, 60)}…</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedZone && (
            <DetailPanel
              key={selectedZone.id}
              zone={selectedZone}
              health={componentHealth[selectedZone.id] ?? 90}
              onClose={() => setSelectedZone(null)}
              sensorHistory={sensorHistory}
              currentReading={r}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
