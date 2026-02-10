import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from '../app';
import LanguageToggle from '../components/LanguageToggle';
import { authService } from '../services/auth';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      toast.success(`${t('auth.welcomeBack')}, ${response.user.first_name}!`);
      
      if (authService.isGuardian()) {
        navigate('/guardian');
      } else {
        navigate('/user');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem' }}>
          <LanguageToggle />
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('app.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {t('app.mits')}
          </p>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          {t('auth.welcomeBack')}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
              {t('auth.email')}
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
              {t('auth.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.signIn')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>
              {t('auth.signUp')}
            </Link>
          </p>
        </div>

        <DeveloperInfo />
      </div>
    </div>
  );
};

const DeveloperInfo = () => {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t('developer.title')}
      </p>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.6', textAlign: 'center' }}>
        <p><strong>{t('developer.developedBy')}:</strong> Your Name</p>
        <p style={{ marginTop: '0.25rem' }}><strong>{t('developer.underGuidance')}:</strong> Prof. [Professor Name]</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="mailto:your.email@example.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Email</a>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>GitHub</a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>LinkedIn</a>
        </div>
      </div>
    </div>
  );
};

export default Login;