import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch {}
    setLoading(false);
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${8 + Math.random() * 12}s`,
    animationDelay: `${Math.random() * 8}s`,
    width: `${2 + Math.random() * 3}px`,
    height: `${2 + Math.random() * 3}px`,
  }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="particle-bg">
          {particles.map((p, i) => <div key={i} className="particle" style={p} />)}
        </div>
        <div className="blob-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="auth-hero-title fade-in-up">SafeRoute</div>
        <p className="auth-hero-sub fade-in-up" style={{ animationDelay: '.15s', opacity: 0 }}>
          {t('tagline')} — Smart transport safety system for real-time tracking, guardian monitoring, and intelligent route management.
        </p>
        <div className="fade-in-up" style={{ animationDelay: '.3s', opacity: 0, marginTop: 32, display: 'flex', gap: 20 }}>
          {['🛡 Safety First', '📍 Live Tracking', '🔔 Smart Alerts'].map((f, i) => (
            <div key={i} style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', fontSize: '.82rem', color: 'rgba(255,255,255,.6)' }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1 className="auth-form-title fade-in-up">{t('welcome_back')} 👋</h1>
          <p className="auth-form-sub fade-in-up" style={{ animationDelay: '.08s', opacity: 0 }}>{t('enter_credentials')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group fade-in-up" style={{ animationDelay: '.12s', opacity: 0 }}>
              <label className="label">{t('email')}</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoFocus />
              </div>
            </div>

            <div className="form-group fade-in-up" style={{ animationDelay: '.18s', opacity: 0 }}>
              <label className="label">{t('password')}</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input type={showPwd ? 'text' : 'password'} className="input-field" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.9rem', color: 'var(--text-muted)' }}>
                  {showPwd ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg fade-in-up" style={{ animationDelay: '.24s', opacity: 0, marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Logging in...</> : `✨ ${t('sign_in')}`}
            </button>
          </form>

          <div className="fade-in-up" style={{ animationDelay: '.3s', opacity: 0, textAlign: 'center', marginTop: 28, fontSize: '.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('dont_have_account')} </span>
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{t('sign_up')}</Link>
          </div>

          {/* Quick login info */}
          <div className="fade-in-up" style={{ animationDelay: '.35s', opacity: 0, marginTop: 20, padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '.78rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, fontSize: '.7rem', letterSpacing: '.08em' }}>DEMO CREDENTIALS</div>
            <div style={{ color: 'var(--text-muted)' }}>Admin: <strong>admin@saferoute.in</strong> / <strong>Admin@123</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
