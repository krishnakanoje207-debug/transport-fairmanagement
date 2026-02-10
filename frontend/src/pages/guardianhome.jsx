import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { ThemeContext } from '../app';
import { authService } from '../services/auth';
import LanguageToggle from '../components/LanguageToggle';
import GuardianDashboard from '../components/GuardianDashboard';

const GuardianHome = () => {
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const user = authService.getCurrentUser();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {t('app.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {t('dashboard.welcome')}, {user?.first_name}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageToggle />
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button onClick={authService.logout} className="btn-secondary">
            <FiLogOut style={{ marginRight: '0.5rem' }} />
            {t('nav.logout')}
          </button>
        </div>
      </header>
      <GuardianDashboard />
    </div>
  );
};

export default GuardianHome;