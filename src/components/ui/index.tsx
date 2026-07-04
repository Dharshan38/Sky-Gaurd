import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedCounter({
  value, decimals = 0, suffix = '', prefix = '',
  duration = 600, style, className,
}: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(update);
      else { prevRef.current = end; setDisplayed(end); }
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Health Gauge ─────────────────────────────────────────────────────────────

interface HealthGaugeProps {
  value: number; // 0–100
  size?: number;
  label?: string;
  showValue?: boolean;
}

function getGaugeColor(v: number) {
  if (v > 80) return '#22C55E';
  if (v > 60) return '#F59E0B';
  if (v > 40) return '#F97316';
  return '#EF4444';
}

export function HealthGauge({ value, size = 120, label = 'Health Score', showValue = true }: HealthGaugeProps) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const startAngle = -220; // degrees
  const sweepAngle = 260; // degrees arc
  const offset = circumference - (value / 100) * (circumference * sweepAngle / 360);
  const color = getGaugeColor(value);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-130deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(0,212,255,0.08)"
          strokeWidth={8}
          strokeDasharray={`${circumference * sweepAngle / 360} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${circumference * sweepAngle / 360} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="gauge-circle"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {showValue && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <AnimatedCounter
            value={value}
            suffix="%"
            style={{ fontSize: size * 0.2, fontWeight: 800, color, fontFamily: 'Rajdhani, sans-serif' }}
          />
          <span style={{ fontSize: size * 0.1, color: '#64748B', marginTop: 2 }}>{label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

type Status = 'healthy' | 'warning' | 'critical' | 'maintenance' | 'info';

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; dot?: string }> = {
  healthy: { label: 'Healthy', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', dot: '#22C55E' },
  warning: { label: 'Warning', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', dot: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', dot: '#EF4444' },
  maintenance: { label: 'Maintenance', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', dot: '#38BDF8' },
  info: { label: 'Info', color: '#00D4FF', bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.3)' },
};

interface StatusBadgeProps {
  status: Status | string;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status as Status] ?? STATUS_CONFIG.info;
  const fs = size === 'sm' ? 10 : 11.5;
  const p = size === 'sm' ? '2px 7px' : '4px 10px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, borderRadius: 20,
      fontSize: fs, fontWeight: 700, padding: p, letterSpacing: '0.03em',
    }}>
      {cfg.dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: cfg.dot,
          boxShadow: `0 0 4px ${cfg.dot}`,
          animation: status === 'critical' ? 'blink 1.5s ease-in-out infinite' : 'none',
        }} />
      )}
      {label ?? cfg.label}
    </span>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  active?: boolean;
  padding?: string | number;
}

export function GlassCard({ children, className = '', style, onClick, active, padding = '16px' }: GlassCardProps) {
  return (
    <div
      className={`glass-card${active ? ' glass-card-active' : ''} ${className}`}
      style={{ padding, cursor: onClick ? 'pointer' : undefined, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: '#E2E8F0',
          fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.03em',
        }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | string;
  animated?: boolean;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  decimals?: number;
  critical?: boolean;
  warning?: boolean;
}

export function MetricCard({ label, value, animated, unit, icon, color = '#00D4FF', trend, decimals = 0, critical, warning }: MetricCardProps) {
  const borderColor = critical ? 'rgba(239,68,68,0.3)' : warning ? 'rgba(245,158,11,0.25)' : 'rgba(0,212,255,0.12)';
  const glowClass = critical ? 'glow-critical' : warning ? 'glow-warning' : '';

  return (
    <div className={`glass-card ${glowClass}`} style={{
      padding: '14px 16px',
      borderColor,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {icon && <div style={{ color, opacity: 0.7 }}>{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        {animated && typeof value === 'number' ? (
          <AnimatedCounter
            value={value}
            decimals={decimals}
            style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Rajdhani, sans-serif', lineHeight: 1 }}
          />
        ) : (
          <span style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Rajdhani, sans-serif', lineHeight: 1 }}>
            {value}
          </span>
        )}
        {unit && <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export function Skeleton({ width = '100%', height = 20, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}
