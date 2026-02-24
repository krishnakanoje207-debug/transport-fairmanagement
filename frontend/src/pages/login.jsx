import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="hex-pattern" />
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#c8a94f,#3a5fc8)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'2.2rem' }}>🚌</div>
          </div>
          <h1 className="auth-hero-title">SAFEROUTE</h1>
          <p className="auth-hero-sub">Transport Route & Fare Management System — Safe, Smart, and Seamless Travel.</p>

          {/* Feature Pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:36 }}>
            {['🛡 Guardian Mode','📍 Live Tracking','🌦 Weather Alerts','🔔 SOS Alerts','📊 Usage Reports','🔐 QR Verification'].map(f => (
              <span key={f} style={{ padding:'6px 14px', background:'rgba(200,169,79,0.1)', border:'1px solid rgba(200,169,79,0.25)', borderRadius:20, fontSize:'0.8rem', color:'#c8a94f' }}>{f}</span>
            ))}
          </div>

          {/* Institute Badge */}
          <div style={{ marginTop:48, padding:'14px 20px', background:'rgba(255,255,255,0.04)', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:'0.72rem', color:'#8da0c8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Developed at</div>
            <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'1rem', fontWeight:700, color:'#c8a94f' }}>MITS-DU, Gwalior</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div style={{ width:'100%', maxWidth:360 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <div />
            <div style={{ display:'flex', gap:8 }}>
              <LanguageToggle />
              <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <h2 className="auth-form-title">{t('sign_in')}</h2>
          <p className="auth-form-sub">Enter your credentials to access SafeRoute</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">{t('email')}</label>
              <input name="email" type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={handleChange} autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="label">{t('password')}</label>
              <div style={{ position:'relative' }}>
                <input name="password" type={showPwd ? 'text' : 'password'} className="input-field"
                  placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password"
                  style={{ paddingRight:44 }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', fontSize:'1rem', cursor:'pointer' }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
              <Link to="/forgot-password" style={{ fontSize:'0.83rem', color:'var(--accent-primary)' }}>{t('forgot_password')}</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width:18, height:18, marginRight:8 }} /> Signing in…</> : t('sign_in')}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:24, fontSize:'0.88rem', color:'var(--text-muted)' }}>
            {t('dont_have_account')}{' '}
            <Link to="/register" style={{ color:'var(--accent-primary)', fontWeight:600 }}>{t('sign_up')}</Link>
          </div>

          {/* Demo hint */}
          <div className="alert-box alert-info" style={{ marginTop:24, fontSize:'0.82rem' }}>
            <strong>Demo:</strong> admin@saferoute.in / Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}
