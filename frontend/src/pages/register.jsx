import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('guardian');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '',
    date_of_birth: '', gender: '', address: '', blood_group: '', emergency_contact: '',
    company_name: '', company_registration: '',
  });

  const u = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const pwdStrength = form.password.length >= 10 ? 3 : form.password.length >= 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const pwdColor = ['transparent', '#f87171', '#fbbf24', '#34d399'][pwdStrength];

  const handleSubmit = async () => {
    if (form.password !== form.confirm) { alert('Passwords don\'t match'); return; }
    setLoading(true);
    try {
      await register({ ...form, role, confirm: undefined });
      navigate('/login');
    } catch {}
    setLoading(false);
  };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${8 + Math.random() * 12}s`,
    animationDelay: `${Math.random() * 8}s`,
  }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="particle-bg">{particles.map((p, i) => <div key={i} className="particle" style={p} />)}</div>
        <div className="blob-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
        <div className="auth-hero-title fade-in-up">SafeRoute</div>
        <p className="auth-hero-sub fade-in-up" style={{ animationDelay: '.15s', opacity: 0 }}>
          Create your account and start managing safe transport routes.
        </p>
      </div>

      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 className="auth-form-title fade-in-up">{t('create_account')} ✨</h1>
          <p className="auth-form-sub fade-in-up" style={{ animationDelay: '.08s', opacity: 0 }}>{t('step')} {step}/3</p>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--accent-primary)' : 'var(--border)', transition: 'background .3s' }} />
            ))}
          </div>

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="fade-in-up">
              <div className="section-title" style={{ marginBottom: 14 }}>{t('select_role')}</div>
              <div className="role-selector" style={{ flexDirection: 'column' }}>
                {[
                  ['guardian', '🛡', t('guardian'), t('guardian_desc')],
                  ['travel_partner', '🚌', t('travel_partner'), t('partner_desc')],
                ].map(([r, icon, label, desc]) => (
                  <div key={r} className={`role-btn ${role === r ? 'selected' : ''}`} onClick={() => setRole(r)} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', padding: 18 }}>
                    <span style={{ fontSize: '2rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{label}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={() => setStep(2)}>
                {t('next')} →
              </button>
            </div>
          )}

          {/* Step 2: Personal info */}
          {step === 2 && (
            <div className="fade-in-up">
              <div className="section-title" style={{ marginBottom: 14 }}>👤 {t('personal_info')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="label">{t('first_name')}</label><input className="input-field" value={form.first_name} onChange={e => u('first_name', e.target.value)} required /></div>
                <div className="form-group"><label className="label">{t('last_name')}</label><input className="input-field" value={form.last_name} onChange={e => u('last_name', e.target.value)} required /></div>
              </div>
              <div className="form-group"><label className="label">{t('email')}</label><input type="email" className="input-field" value={form.email} onChange={e => u('email', e.target.value)} required /></div>
              <div className="form-group"><label className="label">{t('phone')}</label><input className="input-field" value={form.phone} onChange={e => u('phone', e.target.value)} placeholder="+91..." required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="label">{t('gender')}</label>
                  <select className="input-field" value={form.gender} onChange={e => u('gender', e.target.value)}>
                    <option value="">—</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="label">{t('blood_group')}</label>
                  <select className="input-field" value={form.blood_group} onChange={e => u('blood_group', e.target.value)}>
                    <option value="">—</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              {role === 'travel_partner' && (
                <>
                  <div className="form-group"><label className="label">{t('company_name')}</label><input className="input-field" value={form.company_name} onChange={e => u('company_name', e.target.value)} /></div>
                  <div className="form-group"><label className="label">{t('registration_number')}</label><input className="input-field" value={form.company_registration} onChange={e => u('company_registration', e.target.value)} /></div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost btn-lg" style={{ flex: '0 0 auto' }} onClick={() => setStep(1)}>← {t('back')}</button>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(3)}>{t('next')} →</button>
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {step === 3 && (
            <div className="fade-in-up">
              <div className="section-title" style={{ marginBottom: 14 }}>🔒 {t('account_security')}</div>
              <div className="form-group">
                <label className="label">{t('password')}</label>
                <input type="password" className="input-field" value={form.password} onChange={e => u('password', e.target.value)} placeholder="Min 6 characters" required />
                <div className="pwd-strength-bar" style={{ background: pwdColor, width: `${pwdStrength * 33.3}%` }} />
              </div>
              <div className="form-group">
                <label className="label">{t('confirm_password')}</label>
                <input type="password" className="input-field" value={form.confirm} onChange={e => u('confirm', e.target.value)} required />
                {form.confirm && form.confirm !== form.password && <div style={{ color: 'var(--accent-danger)', fontSize: '.78rem', marginTop: 4 }}>Passwords don't match</div>}
              </div>
              <div className="form-group"><label className="label">{t('emergency_contact')}</label><input className="input-field" value={form.emergency_contact} onChange={e => u('emergency_contact', e.target.value)} placeholder="+91..." /></div>
              <div className="form-group"><label className="label">{t('address')}</label><input className="input-field" value={form.address} onChange={e => u('address', e.target.value)} /></div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost btn-lg" style={{ flex: '0 0 auto' }} onClick={() => setStep(2)}>← {t('back')}</button>
                <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating...</> : `🚀 ${t('sign_up')}`}
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('already_have_account')} </span>
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{t('sign_in')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
