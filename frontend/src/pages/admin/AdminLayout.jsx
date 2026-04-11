import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LanguageToggle from '../../components/LanguageToggle';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminPartners from './AdminPartners';
import AdminMessages from './AdminMessages';
import AdminTrips from './AdminTrips';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [page, setPage] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: '📊', label: t('dashboard') },
    { id: 'users', icon: '👥', label: t('manage_users') },
    { id: 'partners', icon: '🚌', label: t('manage_partners') },
    { id: 'trips', icon: '🗺', label: t('manage_trips') },
    { id: 'messages', icon: '📧', label: t('messages') },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="app-name">SafeRoute</div>
          <div className="app-subtitle">Admin Panel</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">MANAGEMENT</div>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f87171,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.85rem' }}>A</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '.85rem', color: '#fff' }}>Admin</div><div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)' }}>{user?.email}</div></div>
          </div>
          <button className="nav-item" style={{ color: 'rgba(248,113,113,.8)' }} onClick={logout}><span className="nav-icon">🚪</span>{t('logout')}</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.15rem' }}>
            {navItems.find(n => n.id === page)?.icon} {navItems.find(n => n.id === page)?.label}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageToggle />
            <button className="btn btn-icon btn-ghost" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
          </div>
        </header>
        <div className="page-content">
          {page === 'dashboard' && <AdminDashboard />}
          {page === 'users' && <AdminUsers />}
          {page === 'partners' && <AdminPartners />}
          {page === 'trips' && <AdminTrips />}
          {page === 'messages' && <AdminMessages />}
        </div>
      </main>
    </div>
  );
}
