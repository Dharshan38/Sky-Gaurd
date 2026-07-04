import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Cpu, Database, User } from 'lucide-react';
import { GlassCard, SectionHeader } from '../components/ui/index';

export default function Settings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader title="System Settings" subtitle="SkyGuard Edge configuration and preferences" />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            icon: <User size={16} color="#00D4FF" />, title: 'User Preferences',
            items: [
              { label: 'Theme', value: 'Dark Aerospace', type: 'select' },
              { label: 'Language', value: 'English (US)', type: 'select' },
              { label: 'Timezone', value: 'IST (UTC+5:30)', type: 'select' },
            ],
          },
          {
            icon: <Bell size={16} color="#F59E0B" />, title: 'Alert Thresholds',
            items: [
              { label: 'Critical EGT', value: '650°C', type: 'text' },
              { label: 'Min Oil Pressure', value: '30 PSI', type: 'text' },
              { label: 'Max Vibration', value: '1.2 g', type: 'text' },
            ],
          },
          {
            icon: <Cpu size={16} color="#A78BFA" />, title: 'Edge AI Configuration',
            items: [
              { label: 'Device', value: 'Jetson Nano 2GB', type: 'select' },
              { label: 'Model', value: 'SkyGuard-LSTM-v2.4', type: 'select' },
              { label: 'Inference Mode', value: 'Simulated', type: 'select' },
            ],
          },
          {
            icon: <Database size={16} color="#22C55E" />, title: 'Data & Export',
            items: [
              { label: 'Export Format', value: 'CSV + PDF', type: 'select' },
              { label: 'History Retention', value: '90 Days', type: 'text' },
              { label: 'Auto-Backup', value: 'Enabled', type: 'select' },
            ],
          },
        ].map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                {section.icon}
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>{section.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {section.items.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12.5, color: '#64748B' }}>{item.label}</span>
                    <div style={{
                      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,212,255,0.1)',
                      borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#94A3B8',
                      fontFamily: 'JetBrains Mono',
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* About */}
      <GlassCard style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <Shield size={22} color="#00D4FF" />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#E2E8F0', fontFamily: 'Rajdhani', letterSpacing: '0.06em' }}>
            SkyGuard Edge
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#475569' }}>
          Edge AI for Aircraft Predictive Maintenance · Prototype Simulation v2.4.1
        </p>
        <p style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>
          Target Device: NVIDIA Jetson Nano 2GB · Running in Prototype Simulation Mode
        </p>
      </GlassCard>
    </div>
  );
}
