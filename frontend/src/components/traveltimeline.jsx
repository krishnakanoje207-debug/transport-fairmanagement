import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ICONS = { pending: '📋', active: '▶️', completed: '✅', cancelled: '❌', sos: '🆘' };
const COLORS = { pending: '#818cf8', active: '#34d399', completed: '#94a3b8', cancelled: '#475569', sos: '#f87171' };

export default function TravelTimeline() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/trip/history?limit=10');
        setTrips(res.data.trips || []);
      } catch { setTrips([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}><span className="spinner" /></div>;

  if (!trips.length) return (
    <div style={{ textAlign: 'center', padding: 40, opacity: .5 }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🗺</div>
      <div>{t('no_trips')}</div>
      <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('book_first_trip')}</div>
    </div>
  );

  return (
    <div className="fade-in">
      {trips.map((trip, i) => {
        const icon = ICONS[trip.status] || '📌';
        const color = COLORS[trip.status] || '#818cf8';
        const date = trip.created_at ? new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

        return (
          <div key={trip.id || i} className="fade-in-up" style={{
            display: 'flex', gap: 16, padding: '16px 0',
            borderBottom: i < trips.length - 1 ? '1px solid var(--border)' : 'none',
            animationDelay: `${i * .06}s`, opacity: 0,
          }}>
            {/* Timeline dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${color}18`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>{icon}</div>
              {i < trips.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: '.92rem' }}>
                  {trip.transport_type === 'bus' ? '🚌' : trip.transport_type === 'auto' ? '🛺' : '🚕'} {trip.drop_location || 'Trip'}
                </span>
                <span className={`badge badge-${trip.status === 'completed' ? 'safe' : trip.status === 'active' ? 'info' : trip.status === 'sos' ? 'danger' : 'purple'}`}>
                  {trip.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '.78rem', color: 'var(--text-muted)' }}>
                {trip.estimated_fare && <span>₹{trip.actual_fare || trip.estimated_fare}</span>}
                {trip.start_time && <span>⏰ {trip.start_time}</span>}
                <span>{date}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
