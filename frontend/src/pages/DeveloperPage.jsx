import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DeveloperPage() {
  const { t } = useTranslation();

  const developers = [
    {
      name: 'Krishna Kanoje',
      initials: 'KK',
      role: 'Full-Stack Developer',
      about: 'Passionate about building smart solutions for real-world transport challenges. Specialized in React, FastAPI, and MongoDB.',
      linkedin: 'https://linkedin.com/in/',
      github: 'https://github.com/',
      email: 'krishna@example.com',
    },
    {
      name: 'Developer 2',
      initials: 'D2',
      role: 'Developer',
      about: 'Contributing to the SafeRoute project for safe and modern transport experience.',
      linkedin: 'https://linkedin.com/in/',
      github: 'https://github.com/',
      email: 'dev2@example.com',
    },
  ];

  return (
    <div className="fade-in-up">
      <div className="page-title">{t('developer')}</div>
      <div className="page-subtitle">{t('developer_info')}</div>

      {/* Developer cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        {developers.map((dev, i) => (
          <div key={i} className={`dev-card fade-in-up stagger-${i+1}`}>
            <div className="dev-avatar">{dev.initials}</div>
            <h3 className="dev-name">{dev.name}</h3>
            <div className="dev-role">{dev.role}</div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>{dev.about}</p>
            <div className="dev-links">
              <a href={dev.linkedin} target="_blank" rel="noreferrer" className="dev-link">🔗 LinkedIn</a>
              <a href={dev.github} target="_blank" rel="noreferrer" className="dev-link">💻 GitHub</a>
              <a href={`mailto:${dev.email}`} className="dev-link">✉️ Email</a>
            </div>
          </div>
        ))}
      </div>

      {/* Project Guide */}
      <div className="card fade-in-up stagger-3" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>👨‍🏫 {t('project_guide')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>P</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Prof. Professor Name</div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Faculty Guide, Department of CSE</div>
          </div>
        </div>
      </div>

      {/* Institute */}
      <div className="card fade-in-up stagger-4">
        <div className="section-title" style={{ marginBottom: 14 }}>🏛 {t('institute')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div><strong>Madhya Institute of Technology & Science</strong></div>
          <div style={{ color: 'var(--text-muted)', fontSize: '.88rem' }}>MITS-DU, Gwalior (M.P.) — Devi Ahilya University</div>
          <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>🎓 {t('academic_year')}: 2024-25</div>
          <a href="https://www.mitsgwalior.in" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ width: 'fit-content', marginTop: 8 }}>
            🌐 {t('visit_portal')}
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="card fade-in-up stagger-5" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>✨ {t('features')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['🛡', 'Guardian Monitoring', 'Track linked users in real-time'],
            ['📍', 'Live GPS Tracking', 'OpenStreetMap based vehicle tracking'],
            ['🔗', 'QR Code System', '4 types: payment, tracking, trip start, login'],
            ['📈', 'Peak Hour Analysis', 'Real-time traffic & news data'],
            ['🆘', 'Emergency SOS', 'Instant guardian notification'],
            ['🌤', 'Weather Integration', 'Travel risk assessment'],
            ['🌐', 'Bilingual', 'English & Hindi support'],
            ['🚌', 'Partner Portal', 'Route & time slab management'],
            ['⚙️', 'Admin Panel', 'Complete system management'],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'all .25s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
