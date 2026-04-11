import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import LanguageToggle from '../components/LanguageToggle';

export default function TravelPartnerHome() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [routeForm, setRouteForm] = useState({ route_name: '', from_location: '', to_location: '', base_fare: 10, vehicle_number: '', capacity: 40, time_slabs: [] });
  const [slabInput, setSlabInput] = useState({ departure: '', label: '' });
  const [scanInput, setScanInput] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [sRes, rRes] = await Promise.allSettled([api.get('/partner/stats'), api.get('/partner/routes')]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (rRes.status === 'fulfilled') setRoutes(rRes.value.data.routes || []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addTimeSlab = () => {
    if (!slabInput.departure) return;
    setRouteForm(p => ({ ...p, time_slabs: [...p.time_slabs, { ...slabInput }] }));
    setSlabInput({ departure: '', label: '' });
  };

  const handleAddRoute = async () => {
    try {
      await api.post('/partner/routes', routeForm);
      setShowAddRoute(false);
      setRouteForm({ route_name: '', from_location: '', to_location: '', base_fare: 10, vehicle_number: '', capacity: 40, time_slabs: [] });
      fetchData();
    } catch {}
  };

  const handleDeleteRoute = async (id) => {
    try { await api.delete(`/partner/routes/${id}`); fetchData(); } catch {}
  };

  const handleScanQR = async () => {
    if (!scanInput) return;
    try {
      await api.post(`/partner/scan-trip-qr?token=${encodeURIComponent(scanInput)}`);
      setScanInput('');
      fetchData();
    } catch {}
  };

  const tabs = [
    ['dashboard', '📊', t('dashboard')],
    ['routes', '🗺', t('route_management')],
    ['scan', '📲', t('scan_to_start')],
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 800 }}>SafeRoute Partner</div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{user?.company_name || t('travel_partner')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageToggle />
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--accent-danger)' }}>🚪 {t('logout')}</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: '16px 24px 0' }}>
        <div className="tabs">
          {tabs.map(([id, icon, label]) => (
            <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{icon} {label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        {/* ═══ DASHBOARD ═══ */}
        {tab === 'dashboard' && (
          <div className="fade-in-up">
            <div className="stats-grid" style={{ marginTop: 16 }}>
              {[
                ['🗺', stats?.total_routes || 0, t('route_management')],
                ['📊', stats?.total_trips || 0, t('total_trips')],
                ['▶️', stats?.active_trips || 0, t('active_trip')],
                ['💰', `₹${stats?.total_revenue || 0}`, t('revenue')],
              ].map(([icon, val, label], i) => (
                <div key={i} className={`stat-card fade-in-up stagger-${i+1}`}>
                  <span className="stat-icon">{icon}</span>
                  <div className="stat-value">{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ROUTES ═══ */}
        {tab === 'routes' && (
          <div className="fade-in-up" style={{ marginTop: 16 }}>
            <div className="section-header">
              <div className="section-title">🗺 {t('route_management')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddRoute(true)}>+ {t('add_route')}</button>
            </div>

            {routes.length === 0 && <div style={{ textAlign: 'center', padding: 40, opacity: .5 }}><div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🗺</div>No routes yet. Add your first route.</div>}

            {routes.map((r, i) => (
              <div key={r.id} className="card" style={{ marginBottom: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{r.route_name}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>📍 {r.from_location} → {r.to_location}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '.78rem' }}>
                      <span className="badge badge-info">₹{r.base_fare}</span>
                      {r.vehicle_number && <span className="badge badge-purple">🚌 {r.vehicle_number}</span>}
                      <span className="badge badge-safe">{r.capacity} seats</span>
                    </div>
                    {r.time_slabs?.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.time_slabs.map((s, j) => (
                          <span key={j} style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '.72rem' }}>
                            ⏰ {s.departure} {s.label && `— ${s.label}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteRoute(r.id)} style={{ color: 'var(--accent-danger)' }}>🗑</button>
                </div>
              </div>
            ))}

            {/* Add Route Modal */}
            {showAddRoute && (
              <div className="modal-overlay" onClick={() => setShowAddRoute(false)}>
                <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                  <div className="modal-header">
                    <h3 className="modal-title">🗺 {t('add_route')}</h3>
                    <button className="modal-close" onClick={() => setShowAddRoute(false)}>✕</button>
                  </div>
                  <div className="form-group"><label className="label">{t('route_name')}</label><input className="input-field" value={routeForm.route_name} onChange={e => setRouteForm(p => ({ ...p, route_name: e.target.value }))} placeholder="e.g. MITS Express" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label className="label">{t('from_location')}</label><input className="input-field" value={routeForm.from_location} onChange={e => setRouteForm(p => ({ ...p, from_location: e.target.value }))} /></div>
                    <div className="form-group"><label className="label">{t('to_location')}</label><input className="input-field" value={routeForm.to_location} onChange={e => setRouteForm(p => ({ ...p, to_location: e.target.value }))} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label className="label">{t('base_fare')} (₹)</label><input type="number" className="input-field" value={routeForm.base_fare} onChange={e => setRouteForm(p => ({ ...p, base_fare: +e.target.value }))} /></div>
                    <div className="form-group"><label className="label">{t('vehicle_number')}</label><input className="input-field" value={routeForm.vehicle_number} onChange={e => setRouteForm(p => ({ ...p, vehicle_number: e.target.value }))} /></div>
                    <div className="form-group"><label className="label">{t('capacity')}</label><input type="number" className="input-field" value={routeForm.capacity} onChange={e => setRouteForm(p => ({ ...p, capacity: +e.target.value }))} /></div>
                  </div>
                  {/* Time slabs */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">{t('time_slabs')}</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="time" className="input-field" style={{ flex: 1 }} value={slabInput.departure} onChange={e => setSlabInput(p => ({ ...p, departure: e.target.value }))} />
                      <input className="input-field" style={{ flex: 1 }} value={slabInput.label} onChange={e => setSlabInput(p => ({ ...p, label: e.target.value }))} placeholder="Label (e.g. Morning)" />
                      <button className="btn btn-secondary btn-sm" onClick={addTimeSlab}>+</button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {routeForm.time_slabs.map((s, i) => (
                        <span key={i} className="badge badge-info">⏰ {s.departure} {s.label && `— ${s.label}`}
                          <button onClick={() => setRouteForm(p => ({ ...p, time_slabs: p.time_slabs.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, color: 'var(--accent-danger)' }}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleAddRoute}>✨ {t('add_route')}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ QR SCAN ═══ */}
        {tab === 'scan' && (
          <div className="fade-in-up" style={{ marginTop: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📲</div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>{t('scan_to_start')}</h3>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Paste the trip QR token to start a user's trip</div>
              <div className="form-group">
                <textarea className="input-field" rows={4} value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="Paste QR token here..." style={{ fontFamily: 'monospace', fontSize: '.82rem' }} />
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleScanQR} disabled={!scanInput}>▶️ Start Trip</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
