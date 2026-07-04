import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, Zap, MemoryStick, HardDrive, Thermometer, Activity } from 'lucide-react';
import { GlassCard, SectionHeader, StatusBadge, AnimatedCounter } from '../components/ui/index';
import { useSimulation } from '../store/SimulationContext';

// Simulated device metrics
function useDeviceMetrics(running: boolean) {
  const [metrics, setMetrics] = useState({ cpuUsage: 34, ramUsage: 1.1, temp: 52, inferenceMs: 18, fps: 8 });
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.min(98, Math.max(15, prev.cpuUsage + (Math.random() - 0.5) * 6)),
        ramUsage: Math.min(1.9, Math.max(0.8, prev.ramUsage + (Math.random() - 0.5) * 0.08)),
        temp: Math.min(72, Math.max(45, prev.temp + (Math.random() - 0.5) * 2)),
        inferenceMs: Math.min(35, Math.max(12, prev.inferenceMs + (Math.random() - 0.5) * 3)),
        fps: Math.min(12, Math.max(4, prev.fps + (Math.random() - 0.5) * 1)),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, [running]);
  return metrics;
}

// Animated data packet dots flowing into the device
function DataFlowParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        bottom: 0,
        width: 5, height: 5,
        borderRadius: '50%',
        background: '#00D4FF',
        boxShadow: '0 0 8px #00D4FF',
      }}
      animate={{ y: [-0, -120], opacity: [0, 1, 1, 0], scale: [0.5, 1, 0.8, 0.2] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, repeatDelay: Math.random() * 1.5, ease: 'easeOut' }}
    />
  );
}

const SPECS = [
  { label: 'Device Name', value: 'NVIDIA Jetson Nano 2GB' },
  { label: 'GPU', value: '128-core Maxwell' },
  { label: 'CPU', value: 'Quad-core ARM A57 @ 1.43GHz' },
  { label: 'RAM', value: '2 GB LPDDR4' },
  { label: 'Storage', value: '32 GB microSD' },
  { label: 'AI Performance', value: '472 GFLOPS' },
  { label: 'Power Mode', value: '5W (Eco)' },
  { label: 'Communication', value: 'REST API / WebSocket' },
  { label: 'OS', value: 'JetPack 4.6 (Ubuntu 18.04)' },
  { label: 'Model Loaded', value: 'SkyGuard-LSTM-v2.4' },
];

const STATUS_ITEMS = [
  { label: 'Deployment Status', value: 'Prototype Simulation', color: '#38BDF8' },
  { label: 'AI Model', value: 'Loaded & Ready', color: '#22C55E' },
  { label: 'Inference Mode', value: 'Simulated Edge AI', color: '#00D4FF' },
  { label: 'Communication', value: 'REST API Active', color: '#22C55E' },
  { label: 'Status', value: 'Ready for Deployment', color: '#22C55E' },
  { label: 'Edge Compute', value: 'Online', color: '#22C55E' },
];

export default function EdgeAIDevice() {
  const { state } = useSimulation();
  const metrics = useDeviceMetrics(state.isRunning && !state.isPaused);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SectionHeader title="Edge AI Device" subtitle="NVIDIA Jetson Nano 2GB · Edge Deployment Target">
          <StatusBadge status="info" label="EDGE READY" />
        </SectionHeader>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18 }}>
        {/* 3D Device Illustration */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <GlassCard style={{ position: 'relative', overflow: 'hidden', padding: '24px', animation: 'device-pulse 3s ease-in-out infinite' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#00D4FF', letterSpacing: '0.1em', marginBottom: 4 }}>
                NVIDIA JETSON NANO 2GB
              </div>
              <div style={{ fontSize: 10.5, color: '#475569' }}>Edge AI Deployment Target</div>
            </div>

            {/* Board Illustration */}
            <div style={{ position: 'relative', margin: '0 auto', width: 200, height: 160 }}>
              {/* PCB Board */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #1a3a2a, #0f2a1a, #1a3a2a)',
                borderRadius: 8, border: '2px solid #2a5a3a',
                boxShadow: '0 0 30px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,100,50,0.1)',
              }}>
                {/* GPU die */}
                <div style={{
                  position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                  width: 70, height: 70, background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  border: '2px solid rgba(0,212,255,0.5)', borderRadius: 4,
                  boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 7, color: '#00D4FF', fontFamily: 'JetBrains Mono', textAlign: 'center', letterSpacing: '0.05em' }}>
                    NVIDIA<br/>MAXWELL<br/>GPU
                  </div>
                </div>

                {/* RAM chips */}
                {[0, 1].map(i => (
                  <div key={i} style={{
                    position: 'absolute', bottom: 12, left: 12 + i * 46, width: 38, height: 18,
                    background: 'linear-gradient(180deg, #2a2a4a, #1a1a3a)',
                    border: '1px solid rgba(56,189,248,0.4)', borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 6, color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>LPDDR4</span>
                  </div>
                ))}

                {/* Connector pins */}
                <div style={{
                  position: 'absolute', right: 10, top: 10, bottom: 10,
                  width: 12, display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} style={{
                      height: 3, background: '#c0a020', borderRadius: 1,
                      boxShadow: '0 0 3px rgba(192,160,32,0.5)',
                    }} />
                  ))}
                </div>

                {/* LED indicators */}
                {[
                  { color: '#22C55E', label: 'PWR', top: 100, left: 14 },
                  { color: '#00D4FF', label: 'AI', top: 100, left: 32 },
                  { color: '#F59E0B', label: 'NET', top: 100, left: 50 },
                ].map(led => (
                  <div key={led.label} style={{ position: 'absolute', top: led.top, left: led.left }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: led.color,
                      boxShadow: `0 0 8px ${led.color}`,
                      animation: 'blink 1.5s ease-in-out infinite',
                    }} />
                  </div>
                ))}

                {/* Traces */}
                <svg style={{ position: 'absolute', inset: 0 }} width="200" height="160">
                  {[
                    'M 100 86 L 100 110', 'M 84 51 L 20 51 L 20 130', 'M 116 51 L 170 51 L 170 110',
                    'M 50 130 L 50 148', 'M 96 130 L 96 148',
                  ].map((d, i) => (
                    <path key={i} d={d} stroke="rgba(0,212,255,0.2)" strokeWidth="1" fill="none" />
                  ))}
                </svg>
              </div>

              {/* Data flow particles */}
              <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                {[20, 50, 80, 110, 140, 170].map((x, i) => (
                  <DataFlowParticle key={x} x={x} delay={i * 0.3} />
                ))}
              </div>
            </div>

            <div style={{
              textAlign: 'center', marginTop: 12, fontSize: 11, color: '#334155',
              fontFamily: 'JetBrains Mono',
            }}>
              ← Data Stream Active →
            </div>

            {/* AI inference indicator */}
            <div style={{
              marginTop: 14, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E', animation: 'blink 1.2s infinite' }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Inference: </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>
                <AnimatedCounter value={metrics.inferenceMs} decimals={1} suffix=" ms" />
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Device Status */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 12, letterSpacing: '0.04em' }}>
              DEVICE STATUS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {STATUS_ITEMS.map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{s.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Live Metrics */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 12, letterSpacing: '0.04em' }}>
              LIVE DEVICE METRICS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'CPU Usage', value: metrics.cpuUsage, unit: '%', icon: <Cpu size={14} />, color: '#00D4FF', dec: 0 },
                { label: 'RAM Used', value: metrics.ramUsage, unit: ' GB', icon: <MemoryStick size={14} />, color: '#38BDF8', dec: 2 },
                { label: 'Board Temp', value: metrics.temp, unit: '°C', icon: <Thermometer size={14} />, color: '#F97316', dec: 0 },
                { label: 'Inference', value: metrics.inferenceMs, unit: ' ms', icon: <Zap size={14} />, color: '#22C55E', dec: 1 },
                { label: 'Network', value: 98.4, unit: '%', icon: <Wifi size={14} />, color: '#A78BFA', dec: 1 },
                { label: 'Infer/sec', value: Math.round(1000 / metrics.inferenceMs), unit: '/s', icon: <Activity size={14} />, color: '#F59E0B', dec: 0 },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px',
                  border: '1px solid rgba(0,212,255,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: m.color, opacity: 0.6 }}>
                    {m.icon}
                    <span style={{ fontSize: 10, color: '#475569' }}>{m.label}</span>
                  </div>
                  <AnimatedCounter
                    value={m.value}
                    decimals={m.dec}
                    suffix={m.unit}
                    style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: 'Rajdhani' }}
                  />
                  {/* Mini bar */}
                  {m.unit === '%' && (
                    <div style={{ height: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 1, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 1, transition: 'width 0.8s ease' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Specs */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 10, letterSpacing: '0.04em' }}>
              HARDWARE SPECIFICATIONS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SPECS.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.15)' }}>
                  <span style={{ fontSize: 10.5, color: '#475569' }}>{s.label}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#94A3B8', fontFamily: 'JetBrains Mono' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
