import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Area, AreaChart,
} from 'recharts';
import type { SensorReading } from '../../types';

interface LiveChartProps {
  data: SensorReading[];
  dataKey: keyof SensorReading;
  color?: string;
  label?: string;
  unit?: string;
  height?: number;
  warningLine?: number;
  criticalLine?: number;
  domain?: [number | 'auto', number | 'auto'];
  filled?: boolean;
  decimals?: number;
}

const CustomTooltip = ({ active, payload, label, unit, decimals = 1 }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(7,26,47,0.96)',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: 8, padding: '8px 12px',
        fontSize: 12,
      }}>
        <p style={{ color: '#64748B', marginBottom: 4 }}>
          {new Date(typeof label === 'number' ? label : Date.now()).toLocaleTimeString()}
        </p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            {p.value.toFixed(decimals)}{unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LiveLineChart({
  data, dataKey, color = '#00D4FF', label, unit = '',
  height = 160, warningLine, criticalLine, domain, filled = false, decimals = 1,
}: LiveChartProps) {
  const ChartComponent = filled ? AreaChart : LineChart;

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => new Date(v).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            tick={{ fill: '#334155', fontSize: 9.5 }}
            axisLine={{ stroke: 'rgba(0,212,255,0.08)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain ?? ['auto', 'auto']}
            tick={{ fill: '#334155', fontSize: 9.5 }}
            axisLine={{ stroke: 'rgba(0,212,255,0.08)' }}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip unit={unit} decimals={decimals} />} />
          {warningLine && (
            <ReferenceLine y={warningLine} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4" />
          )}
          {criticalLine && (
            <ReferenceLine y={criticalLine} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />
          )}
          {filled ? (
            <>
              <defs>
                <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey as string}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${String(dataKey)})`}
                dot={false}
                isAnimationActive={false}
              />
            </>
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
