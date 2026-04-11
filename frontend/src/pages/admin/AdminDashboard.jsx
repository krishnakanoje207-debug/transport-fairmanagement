import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => setStats({
      total_users: 0, total_guardians: 0, total_linked_users: 0, total_partners: 0,
      total_trips: 0, active_trips: 0, total_sos: 0, total_messages: 0,
    }));
  }, []);

  if (!stats) return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>;

  const cards = [
    ['👥', stats.total_users, 'Total Users', 'var(--accent-primary)'],
    ['🛡', stats.total_guardians, 'Guardians', 'var(--accent-secondary)'],
    ['🔗', stats.total_linked_users, 'Linked Users', 'var(--accent-tertiary)'],
    ['🚌', stats.total_partners, 'Partners', '#34d399'],
    ['🗺', stats.total_trips, t('total_trips'), 'var(--accent-primary)'],
    ['▶️', stats.active_trips, 'Active Trips', '#38bdf8'],
    ['🆘', stats.total_sos, 'SOS Alerts', '#f87171'],
    ['📧', stats.total_messages, t('messages'), '#fbbf24'],
  ];

  return (
    <div className="fade-in-up">
      <div className="page-title">Admin Dashboard</div>
      <div className="page-subtitle">System overview and statistics</div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {cards.map(([icon, val, label, color], i) => (
          <div key={i} className={`stat-card fade-in-up stagger-${Math.min(i+1,6)}`}>
            <span className="stat-icon">{icon}</span>
            <div className="stat-value" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card fade-in-up" style={{ marginTop: 24, padding: 24 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>🔑 Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Default Admin Login</div>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '.8rem' }}>admin@saferoute.in / Admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
