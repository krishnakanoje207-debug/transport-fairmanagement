import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const [section, setSection] = useState('profile');
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', address: '', emergency_contact: '', blood_group: '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [settings, setSettings] = useState({ tracking_enabled: true, sos_enabled: true, notifications_enabled: true, distance_alert_meters: 300, language: 'en' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', address: user.address || '', emergency_contact: user.emergency_contact || '', blood_group: user.blood_group || '' });
      setSettings(user.settings || settings);
    }
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/user/profile', profile);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch {}
    setSaving(false);
  };

  const changePassword = async () => {
    if (pwd.new_password !== pwd.confirm) { toast.error('Passwords don\'t match'); return; }
    try {
      await api.post('/auth/change-password', { current_password: pwd.current_password, new_password: pwd.new_password });
      toast.success('Password changed!');
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch {}
  };

  const saveSettings = async () => {
    try {
      await api.put('/user/settings', settings);
      toast.success('Settings saved!');
    } catch {}
  };

  const navItems = [
    { id: 'profile', icon: '👤', label: t('edit_profile') },
    { id: 'password', icon: '🔒', label: t('change_password') },
    { id: 'tracking', icon: '📍', label: t('tracking_settings') },
    { id: 'language', icon: '🌐', label: t('language_settings') },
  ];

  return (
    <div className="settings-layout fade-in-up">
      {/* Settings nav */}
      <div className="settings-sidebar">
        {navItems.map(item => (
          <button key={item.id} className={`settings-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* ═══ PROFILE ═══ */}
        {section === 'profile' && (
          <div className="fade-in">
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>👤 {t('edit_profile')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 24 }}>Update your personal information</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group"><label className="label">{t('first_name')}</label><input className="input-field" value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">{t('last_name')}</label><input className="input-field" value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="label">{t('phone')}</label><input className="input-field" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="form-group"><label className="label">{t('address')}</label><input className="input-field" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group"><label className="label">{t('emergency_contact')}</label><input className="input-field" value={profile.emergency_contact} onChange={e => setProfile(p => ({ ...p, emergency_contact: e.target.value }))} /></div>
              <div className="form-group"><label className="label">{t('blood_group')}</label>
                <select className="input-field" value={profile.blood_group} onChange={e => setProfile(p => ({ ...p, blood_group: e.target.value }))}>
                  <option value="">—</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : `💾 ${t('save')}`}
            </button>
          </div>
        )}

        {/* ═══ PASSWORD ═══ */}
        {section === 'password' && (
          <div className="fade-in">
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>🔒 {t('change_password')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 24 }}>Update your password</p>
            <div className="form-group"><label className="label">Current Password</label><input type="password" className="input-field" value={pwd.current_password} onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))} /></div>
            <div className="form-group"><label className="label">New Password</label><input type="password" className="input-field" value={pwd.new_password} onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Confirm New Password</label><input type="password" className="input-field" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
            <button className="btn btn-primary" onClick={changePassword}>🔒 Change Password</button>
          </div>
        )}

        {/* ═══ TRACKING ═══ */}
        {section === 'tracking' && (
          <div className="fade-in">
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>📍 {t('tracking_settings')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 24 }}>Configure tracking and safety features</p>
            {[
              ['tracking_enabled', '📍', 'GPS Tracking', 'Enable real-time location tracking'],
              ['sos_enabled', '🆘', 'SOS Button', 'Enable emergency SOS feature'],
              ['notifications_enabled', '🔔', 'Notifications', 'Receive trip and safety notifications'],
            ].map(([key, icon, title, desc]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <div><div style={{ fontWeight: 600, fontSize: '.92rem' }}>{title}</div><div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{desc}</div></div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings[key]} onChange={e => setSettings(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="label">{t('distance_alert')} (meters)</label>
              <input type="number" className="input-field" style={{ width: 160 }} value={settings.distance_alert_meters} onChange={e => setSettings(p => ({ ...p, distance_alert_meters: +e.target.value }))} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={saveSettings}>💾 {t('save')}</button>
          </div>
        )}

        {/* ═══ LANGUAGE ═══ */}
        {section === 'language' && (
          <div className="fade-in">
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>🌐 {t('language_settings')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 24 }}>Choose your preferred language</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['en', '🇬🇧', 'English'], ['hi', '🇮🇳', 'हिन्दी']].map(([code, flag, label]) => (
                <button key={code} className={`role-btn ${i18n.language?.startsWith(code) ? 'selected' : ''}`}
                  onClick={() => { i18n.changeLanguage(code); setSettings(p => ({ ...p, language: code })); }}
                  style={{ padding: '18px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '2rem' }}>{flag}</span>
                  <span className="role-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
