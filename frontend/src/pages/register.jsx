import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LanguageToggle from '../components/LanguageToggle';

function calcAge(dob) {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function pwdStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function Register() {
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', gender: '', address: '', blood_group: '',
    emergency_contact: '', special_notes: '', password: '', confirm_password: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const age = calcAge(form.date_of_birth);
  const strength = pwdStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#e05252', '#f0a63a', '#f0d040', '#3dc47e'][strength];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (strength < 2) { toast.error('Password too weak'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="hex-pattern" />
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#c8a94f,#3a5fc8)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'2.2rem' }}>🚌</div>
          <h1 className="auth-hero-title">SAFEROUTE</h1>
          <p className="auth-hero-sub">Join SafeRoute for smart and safe transport management.</p>
          <div style={{ marginTop:32, background:'rgba(200,169,79,0.05)', borderRadius:12, padding:20, border:'1px solid rgba(200,169,79,0.15)' }}>
            <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize:'1.1rem', color:'#c8a94f', marginBottom:12 }}>Creating your account gives you</div>
            {['✅ Normal User & Guardian Modes','✅ Live Location Tracking','✅ SOS Emergency Alerts','✅ Trip Booking & QR Verification','✅ Weather & Peak-Hour Insights'].map(f => (
              <div key={f} style={{ fontSize:'0.85rem', color:'#8da0c8', padding:'4px 0' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ width:500, overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            {/* Step indicator */}
            <div style={{ display:'flex', gap:8 }}>
              {[1,2].map(s => (
                <div key={s} style={{ width:32, height:4, borderRadius:2, background: step >= s ? 'var(--accent-primary)' : 'var(--border)' }} />
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <LanguageToggle />
              <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
            </div>
          </div>

          <h2 className="auth-form-title">{t('sign_up')}</h2>
          <p className="auth-form-sub">Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Account Security'}</p>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
            {step === 1 && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="label">{t('first_name')}</label>
                    <input name="first_name" className="input-field" placeholder="John" value={form.first_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="label">{t('last_name')}</label>
                    <input name="last_name" className="input-field" placeholder="Doe" value={form.last_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">{t('email')}</label>
                  <input name="email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="label">{t('phone')}</label>
                  <input name="phone" className="input-field" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="label">{t('date_of_birth')} {age ? <span style={{ color:'var(--accent-primary)', marginLeft:6 }}>Age: {age}</span> : ''}</label>
                    <input name="date_of_birth" type="date" className="input-field" value={form.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">{t('gender')}</label>
                    <select name="gender" className="input-field" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="label">{t('blood_group')}</label>
                    <select name="blood_group" className="input-field" value={form.blood_group} onChange={handleChange}>
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">{t('emergency_contact')}</label>
                    <input name="emergency_contact" className="input-field" placeholder="+91 XXXXX" value={form.emergency_contact} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">{t('address')}</label>
                  <input name="address" className="input-field" placeholder="City, State" value={form.address} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop:8 }}>Next →</button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="label">{t('password')}</label>
                  <div style={{ position:'relative' }}>
                    <input name="password" type={showPwd ? 'text' : 'password'} className="input-field"
                      placeholder="Min 8 chars" value={form.password} onChange={handleChange} required style={{ paddingRight:44 }} />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  {form.password && (
                    <div>
                      <div style={{ background:'var(--border)', borderRadius:2, height:4, marginTop:8 }}>
                        <div style={{ height:'100%', borderRadius:2, width:`${strength*25}%`, background:strengthColor, transition:'all 0.3s' }} />
                      </div>
                      <div style={{ fontSize:'0.78rem', color:strengthColor, marginTop:4 }}>{strengthLabel}</div>
                    </div>
                  )}
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8, lineHeight:1.6 }}>
                    Min 8 chars · Uppercase · Number · Special char
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">{t('confirm_password')}</label>
                  <input name="confirm_password" type={showPwd ? 'text' : 'password'} className="input-field"
                    placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} required />
                  {form.confirm_password && form.password !== form.confirm_password && (
                    <div style={{ fontSize:'0.78rem', color:'var(--accent-danger)', marginTop:4 }}>Passwords don't match</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="label">{t('special_notes')}</label>
                  <textarea name="special_notes" className="input-field" rows={3} placeholder="Any medical notes, allergies…" value={form.special_notes} onChange={handleChange} style={{ resize:'vertical' }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width:16, height:16 }} /> Creating…</> : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={{ textAlign:'center', marginTop:24, fontSize:'0.88rem', color:'var(--text-muted)' }}>
            {t('already_have_account')}{' '}
            <Link to="/login" style={{ color:'var(--accent-primary)', fontWeight:600 }}>{t('sign_in')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
