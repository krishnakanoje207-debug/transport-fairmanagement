import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GuardianDashboard from '../components/GuardianDashboard';
import SettingsPage from './SettingsPage';
import DeveloperPage from './DeveloperPage';
import LanguageToggle from '../components/LanguageToggle';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'main' },
  { id: 'settings', icon: '⚙️', label: 'Settings', section: 'main' },
  { id: 'developer', icon: '👨‍💻', label: 'Developer', section: 'main' },
];

export default function UserHome() {
  const { user, dashboardMode, setDashboardMode, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = `${user?.first_name?.[0] || 'U'}${user?.last_name?.[0] || ''}`.toUpperCase();
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

  return (
    <div className="app-layout">
      {/* Overlay for mobile */}
      {sidebarOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="app-name">SAFEROUTE</div>
          <div className="app-subtitle">Transport Management</div>
        </div>

        {/* Mode Toggle */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Mode</div>
          <div className="mode-toggle">
            <button className={`mode-btn ${dashboardMode === 'user' ? 'active' : ''}`} onClick={() => { setDashboardMode('user'); setActivePage('dashboard'); }}>
              👤 {t('normal_user')}
            </button>
            <button className={`mode-btn ${dashboardMode === 'guardian' ? 'active' : ''}`} onClick={() => { setDashboardMode('guardian'); setActivePage('dashboard'); }}>
              🛡 {t('guardian')}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontWeight:700, color:'#fff', flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>🚪 {t('logout')}</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button style={{ background:'none', border:'none', color:'var(--text-secondary)', fontSize:'1.3rem', cursor:'pointer', display:'none' }}
              className="menu-toggle" onClick={() => setSidebarOpen(s => !s)}>☰</button>
            <div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.2rem', fontWeight:700 }}>
                {activePage === 'dashboard' && (dashboardMode === 'guardian' ? '🛡 Guardian Dashboard' : '🏠 Dashboard')}
                {activePage === 'settings' && '⚙️ Settings'}
                {activePage === 'developer' && '👨‍💻 Developer'}
              </div>
              {activePage === 'dashboard' && (
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                  {dashboardMode === 'guardian' ? 'Monitoring linked users' : 'Manage your travel'}
                </div>
              )}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <LanguageToggle />
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            {activePage !== 'dashboard' && dashboardMode !== 'user' && (
              <span className="badge badge-info">🛡 Guardian</span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {activePage === 'dashboard' && (
            <>
              <h1 className="page-title">
                {dashboardMode === 'guardian' ? '🛡 Guardian Dashboard' : `Welcome, ${user?.first_name || 'User'}!`}
              </h1>
              <p className="page-subtitle">
                {dashboardMode === 'guardian' ? 'Monitor your linked users and manage their safety.' : "Here's your travel overview."}
              </p>
              <GuardianDashboard mode={dashboardMode} />
            </>
          )}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'developer' && <DeveloperPage />}
        </main>
      </div>
    </div>
  );
}
