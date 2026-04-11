import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GuardianDashboard from '../components/GuardianDashboard';
import LanguageToggle from '../components/LanguageToggle';
import SettingsPage from './SettingsPage';
import DeveloperPage from './DeveloperPage';

export default function UserHome() {
  const { t } = useTranslation();
  const { user, logout, dashboardMode, setDashboardMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: '📊', label: t('dashboard') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
    { id: 'developer', icon: '👨‍💻', label: t('developer') },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="app-name">SafeRoute</div>
          <div className="app-subtitle">Transport Safety System</div>
        </div>

        <nav className="sidebar-nav">
          {/* Mode toggle */}
          <div style={{ padding: '12px 16px' }}>
            <div className="mode-toggle">
              <button className={`mode-btn ${dashboardMode === 'user' ? 'active' : ''}`} onClick={() => setDashboardMode('user')}>
                👤 {t('user_mode')}
              </button>
              <button className={`mode-btn ${dashboardMode === 'guardian' ? 'active' : ''}`} onClick={() => setDashboardMode('guardian')}>
                🛡 {t('guardian_mode')}
              </button>
            </div>
          </div>

          <div className="nav-section-label">{dashboardMode === 'guardian' ? t('monitoring') : t('manage_travel')}</div>

          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.85rem' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)' }}>{user?.email}</div>
            </div>
          </div>
          <button className="nav-item" style={{ color: 'rgba(248,113,113,.8)', marginTop: 4 }} onClick={logout}>
            <span className="nav-icon">🚪</span>{t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-icon btn-ghost" style={{ display: 'none' }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.15rem' }}>
              {page === 'dashboard' && (dashboardMode === 'guardian' ? `🛡 ${t('guardian_mode')}` : `📊 ${t('dashboard')}`)}
              {page === 'settings' && `⚙️ ${t('settings')}`}
              {page === 'developer' && `👨‍💻 ${t('developer')}`}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageToggle />
            <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title={isDark ? t('light_mode') : t('dark_mode')}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="page-content">
          {page === 'dashboard' && <GuardianDashboard />}
          {page === 'settings' && <SettingsPage />}
          {page === 'developer' && <DeveloperPage />}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
