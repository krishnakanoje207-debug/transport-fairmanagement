import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import MapView from '../components/MapView';
import LanguageToggle from '../components/LanguageToggle';

export default function LinkedUserHome() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTrip, setActiveTrip] = useState(null);
  const [guardian, setGuardian] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const tripRes = await api.get('/trip/active');
        setActiveTrip(tripRes.value?.data?.trip || tripRes.data?.trip);
      } catch {}
    };
    fetch();
  }, []);

  const handleSOS = async () => {
    if (!activeTrip) return;
    try {
      await api.post(`/trip/${activeTrip.id}/sos`);
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <div className="blob-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>

      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <div className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 800 }}>SafeRoute</div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{t('linked_user')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageToggle />
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--accent-danger)' }}>🚪</button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '0 24px 40px', position: 'relative', zIndex: 1 }}>
        {/* User info */}
        <div className="card fade-in-up" style={{ marginBottom: 20, textAlign: 'center', padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800 }}>{user?.first_name} {user?.last_name}</h2>
          <div className="badge badge-purple" style={{ marginTop: 8 }}>🔗 {t('linked_user')}</div>
          {user?.relation && <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 8 }}>{t('relation')}: {user.relation}</div>}
        </div>

        {/* Active trip + map */}
        <div className="card fade-in-up stagger-2" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>📍 {t('active_trip')}</div>
          {activeTrip ? (
            <>
              <MapView vehiclePos={[activeTrip.pickup_lat || 26.2230, activeTrip.pickup_lng || 78.1870]}
                destPos={[activeTrip.drop_lat || 26.2124, activeTrip.drop_lng || 78.1772]} height="250px" />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-info">{activeTrip.status}</span>
                <span style={{ fontWeight: 600 }}>📍 {activeTrip.drop_location}</span>
                <span style={{ color: 'var(--text-muted)' }}>₹{activeTrip.estimated_fare}</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, opacity: .5 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🚶</div>
              <div>{t('no_active_trip')}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Your guardian will book trips for you</div>
            </div>
          )}
        </div>

        {/* SOS */}
        <div className="card fade-in-up stagger-3" style={{ textAlign: 'center', padding: 32 }}>
          <div className="section-title" style={{ justifyContent: 'center', marginBottom: 16 }}>🆘 Emergency SOS</div>
          <button className="sos-btn" onClick={handleSOS}>SOS</button>
          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
            Press for emergency. Your guardian will be notified immediately.
          </div>
        </div>
      </div>
    </div>
  );
}
