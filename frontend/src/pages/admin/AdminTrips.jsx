import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function AdminTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const r = await api.get(`/admin/trips${params}`);
      setTrips(r.data.trips || []);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [filter]);

  return (
    <div className="fade-in-up">
      <div className="page-title">{t('manage_trips')}</div>
      <div className="page-subtitle">View all trips across the platform</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'pending', 'active', 'completed', 'sos'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
            {s === '' ? 'All' : s === 'sos' ? '🆘 SOS' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Type</th><th>Destination</th><th>Status</th><th>Fare</th><th>Time</th><th>Created</th></tr></thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td>{trip.transport_type === 'bus' ? '🚌' : trip.transport_type === 'auto' ? '🛺' : '🚕'} {trip.transport_type}</td>
                  <td style={{ fontWeight: 600 }}>{trip.drop_location || '—'}</td>
                  <td><span className={`badge badge-${trip.status === 'completed' ? 'safe' : trip.status === 'active' ? 'info' : trip.status === 'sos' ? 'danger' : 'purple'}`}>{trip.status}</span></td>
                  <td>₹{trip.actual_fare || trip.estimated_fare || 0}</td>
                  <td style={{ fontSize: '.82rem' }}>{trip.start_time || '—'}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{trip.created_at ? new Date(trip.created_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
              {trips.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No trips</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
