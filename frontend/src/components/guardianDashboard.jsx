import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MapView from './MapView';
import PeakHourChart from './PeakHourChart';
import TravelTimeline from './TravelTimeline';
import QRDisplay from './QRDisplay';
import LocationAutocomplete from './LocationAutocomplete';

export default function GuardianDashboard() {
  const { t } = useTranslation();
  const { user, dashboardMode } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weather, setWeather] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);

  // Trip planner state
  const [transport, setTransport] = useState('bus');
  const [pickup, setPickup] = useState({ name: '', lat: null, lng: null });
  const [drop, setDrop] = useState({ name: '', lat: null, lng: null });
  const [startTime, setStartTime] = useState('');
  const [selectedLinkedUser, setSelectedLinkedUser] = useState('');
  const [busRoutes, setBusRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSlab, setSelectedSlab] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [booking, setBooking] = useState(false);

  // Linked user creation
  const [showCreateLinked, setShowCreateLinked] = useState(false);
  const [newLinked, setNewLinked] = useState({ first_name: '', last_name: '', relation: 'Child', phone: '', blood_group: '' });
  const [createdCreds, setCreatedCreds] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, notifRes, weatherRes, tripRes] = await Promise.allSettled([
        api.get('/user/stats'),
        api.get('/user/notifications'),
        api.get('/weather/current'),
        api.get('/trip/active'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.notifications || []);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data);
      if (tripRes.status === 'fulfilled') setActiveTrip(tripRes.value.data.trip);

      if (dashboardMode === 'guardian') {
        const luRes = await api.get('/user/linked-users');
        setLinkedUsers(luRes.data.linked_users || []);
      }
    } catch {}
  }, [dashboardMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (transport === 'bus') {
      api.get('/partner/available-routes').then(r => setBusRoutes(r.data.routes || [])).catch(() => {});
    }
  }, [transport]);

  const handleBookTrip = async () => {
    if (!drop.name) { toast.error('Select drop location'); return; }
    if (transport !== 'bus' && !startTime) { toast.error('Select start time'); return; }
    if (transport === 'bus' && !selectedSlab && !startTime) { toast.error('Select a time slab'); return; }

    setBooking(true);
    try {
      const payload = {
        transport_type: transport,
        pickup_location: pickup.name || 'Current Location',
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        drop_location: drop.name,
        drop_lat: drop.lat,
        drop_lng: drop.lng,
        start_time: transport === 'bus' ? (selectedSlab || startTime) : startTime,
        linked_user_id: selectedLinkedUser || undefined,
        partner_id: selectedRoute?.partner_id,
        route_id: selectedRoute?.id,
      };
      const res = await api.post('/trip/create', payload);
      setBookingResult(res.data);
      toast.success(`Trip booked! Fare: ₹${res.data.estimated_fare}`);
      fetchData();
    } catch { /* toast handled by interceptor */ }
    setBooking(false);
  };

  const handleCreateLinkedUser = async () => {
    if (!newLinked.first_name || !newLinked.last_name) { toast.error('Name required'); return; }
    try {
      const res = await api.post('/auth/linked-user/create', newLinked);
      setCreatedCreds(res.data.linked_user);
      toast.success('Linked user created!');
      fetchData();
    } catch {}
  };

  const handleSOS = async () => {
    if (!activeTrip) { toast.error('No active trip for SOS'); return; }
    try {
      await api.post(`/trip/${activeTrip.id}/sos`);
      toast.error('🆘 SOS TRIGGERED! Emergency contacts notified.');
      fetchData();
    } catch {}
  };

  const isGuardianMode = dashboardMode === 'guardian';

  // ─── Nav tabs ───
  const tabs = isGuardianMode
    ? [['overview', '📊', t('overview')], ['tracking', '📍', t('tracking')], ['linked_qr', '🔗', t('linked_qr')], ['peak', '📈', t('peak_analysis')], ['history', '📜', t('trip_history')]]
    : [['overview', '📊', t('overview')], ['plan', '🗺', t('plan_trip')], ['tracking', '📍', t('tracking')], ['peak', '📈', t('peak_analysis')], ['history', '📜', t('trip_history')]];

  return (
    <div className="fade-in">
      {/* Tabs */}
      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {tabs.map(([id, icon, label]) => (
          <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            <span style={{ marginRight: 6 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === 'overview' && (
        <div className="fade-in-up">
          {/* Stats */}
          <div className="stats-grid">
            {[
              ['📊', stats?.total_trips || 0, t('total_trips')],
              ['🗺', `${stats?.total_distance_km || 0} km`, t('total_distance')],
              ['💰', `₹${stats?.total_fare || 0}`, t('est_fare')],
              ['🆘', stats?.sos_count || 0, t('sos')],
            ].map(([icon, val, label], i) => (
              <div key={i} className={`stat-card fade-in-up stagger-${i+1}`}>
                <span className="stat-icon">{icon}</span>
                <div className="stat-value">{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Weather & Active Trip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Weather card */}
            <div className="card fade-in-up stagger-3">
              <div className="section-title" style={{ marginBottom: 12 }}>🌤 {t('weather_analysis')}</div>
              {weather ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ fontSize: '3rem' }}>
                    {weather.description?.toLowerCase().includes('cloud') ? '☁️' : weather.description?.toLowerCase().includes('rain') ? '🌧' : '☀️'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{weather.temperature || 28}°</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{weather.description || 'Partly Cloudy'}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      💧 {weather.humidity || 72}% &nbsp; 💨 {weather.wind_speed || 18} km/h
                    </div>
                  </div>
                </div>
              ) : <div className="shimmer" style={{ height: 80, borderRadius: 8 }} />}
            </div>

            {/* Active trip */}
            <div className="card fade-in-up stagger-4">
              <div className="section-title" style={{ marginBottom: 12 }}>🚌 {t('active_trip')}</div>
              {activeTrip ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="badge badge-info">{activeTrip.status}</span>
                    <span style={{ fontWeight: 600 }}>{activeTrip.drop_location}</span>
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
                    ₹{activeTrip.estimated_fare} • {activeTrip.transport_type}
                  </div>
                  <button className="sos-btn" style={{ width: 50, height: 50, fontSize: '.8rem', marginTop: 10 }} onClick={handleSOS}>SOS</button>
                </div>
              ) : (
                <div style={{ opacity: .5, textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🚶</div>
                  {t('no_active_trip')}
                </div>
              )}
            </div>
          </div>

          {/* Guardian: Linked Users */}
          {isGuardianMode && (
            <div className="card fade-in-up stagger-5" style={{ marginBottom: 20 }}>
              <div className="section-header">
                <div className="section-title">👥 {t('linked_users')}</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreateLinked(true)}>+ {t('add')}</button>
              </div>
              {linkedUsers.length === 0 && <div style={{ opacity: .5, textAlign: 'center', padding: 20 }}>No linked users yet</div>}
              {linkedUsers.map((lu, i) => (
                <div key={lu.id} className="linked-user-card" style={{ marginBottom: 8 }}>
                  <div className="linked-user-avatar">{lu.first_name?.[0]}{lu.last_name?.[0]}</div>
                  <div className="linked-user-info">
                    <div className="linked-user-name">{lu.first_name} {lu.last_name}</div>
                    <div className="linked-user-meta">{lu.relation} • {lu.blood_group || '—'}</div>
                  </div>
                  <span className="badge badge-safe">{t('safe')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          <div className="card fade-in-up stagger-6">
            <div className="section-title" style={{ marginBottom: 12 }}>🔔 {t('notifications')}</div>
            {notifications.length === 0 && <div style={{ opacity: .5, textAlign: 'center', padding: 16 }}>No notifications</div>}
            {notifications.slice(0, 5).map((n, i) => (
              <div key={n.id || i} className="notification-item">
                <div className="notification-dot" style={{ backgroundColor: n.color || '#818cf8', color: n.color || '#818cf8' }} />
                <div>
                  <div style={{ fontSize: '.88rem' }}>{n.message}</div>
                  <div className="notification-time">{n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PLAN TRIP ═══ */}
      {activeTab === 'plan' && (
        <div className="fade-in-up">
          {bookingResult ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Trip Booked!</h3>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Estimated Fare: ₹{bookingResult.estimated_fare}</div>
              <QRDisplay trackingQR={bookingResult.tracking_qr} tripStartQR={bookingResult.trip_start_qr} tripId={bookingResult.trip_id} amount={bookingResult.estimated_fare} />
              <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => { setBookingResult(null); setActiveTab('overview'); }}>↩ Back to Dashboard</button>
            </div>
          ) : (
            <>
              {/* Transport Type */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 14 }}>🚗 {t('select_transport')}</div>
                <div className="transport-selector">
                  {[['bus', '🚌', t('bus')], ['auto', '🛺', t('auto')], ['cab', '🚕', t('cab')]].map(([type, icon, label]) => (
                    <button key={type} className={`transport-btn ${transport === type ? 'selected' : ''}`} onClick={() => { setTransport(type); setSelectedRoute(null); setSelectedSlab(''); }}>
                      <span className="t-icon">{icon}</span>
                      <span className="t-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 14 }}>📍 {t('pickup_location')} & {t('drop_location')}</div>
                <div className="form-group">
                  <label className="label">{t('pickup_location')}</label>
                  <LocationAutocomplete value={pickup.name} onChange={setPickup} placeholder={t('search_location')} icon="📍" />
                </div>
                <div className="form-group">
                  <label className="label">{t('drop_location')}</label>
                  <LocationAutocomplete value={drop.name} onChange={setDrop} placeholder={t('search_location')} icon="🏁" />
                </div>
              </div>

              {/* Time */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 14 }}>⏰ {t('start_time')}</div>
                {transport === 'bus' && busRoutes.length > 0 ? (
                  <>
                    <label className="label">Select Route</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {busRoutes.slice(0, 5).map(route => (
                        <div key={route.id} className={`time-slab-item ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                          onClick={() => { setSelectedRoute(route); setSelectedSlab(''); }}>
                          <div style={{ fontWeight: 600 }}>{route.route_name}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{route.from_location} → {route.to_location} • ₹{route.base_fare}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{route.partner_name} • {route.vehicle_number || '—'}</div>
                        </div>
                      ))}
                    </div>
                    {selectedRoute?.time_slabs?.length > 0 && (
                      <>
                        <label className="label">{t('select_time_slab')}</label>
                        <div className="time-slab-grid">
                          {selectedRoute.time_slabs.map((slab, i) => (
                            <div key={i} className={`time-slab-item ${selectedSlab === slab.departure ? 'selected' : ''}`}
                              onClick={() => setSelectedSlab(slab.departure)}>
                              <div style={{ fontWeight: 600 }}>{slab.departure}</div>
                              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{slab.label}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {(!selectedRoute?.time_slabs?.length) && (
                      <div className="form-group">
                        <label className="label">{t('trip_start_time')}</label>
                        <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="form-group">
                    <label className="label">{t('trip_start_time')}</label>
                    <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Linked User selection (for guardians) */}
              {isGuardianMode && linkedUsers.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <label className="label">Book for Linked User (optional)</label>
                  <select className="input-field" value={selectedLinkedUser} onChange={e => setSelectedLinkedUser(e.target.value)}>
                    <option value="">Self</option>
                    {linkedUsers.map(lu => (
                      <option key={lu.id} value={lu.id}>{lu.first_name} {lu.last_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button className="btn btn-primary btn-full btn-lg" onClick={handleBookTrip} disabled={booking}>
                {booking ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Booking...</> : `🚀 ${t('book_trip')}`}
              </button>
            </>
          )}
        </div>
      )}

      {/* ═══ TRACKING ═══ */}
      {activeTab === 'tracking' && (
        <div className="fade-in-up">
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>📍 {t('live_tracking')}</div>
            <MapView
              vehiclePos={activeTrip ? [activeTrip.pickup_lat || 26.2230, activeTrip.pickup_lng || 78.1870] : [26.2183, 78.1828]}
              destPos={activeTrip ? [activeTrip.drop_lat || 26.2124, activeTrip.drop_lng || 78.1772] : null}
              height="400px"
            />
            {activeTrip ? (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div className="badge badge-info">{activeTrip.status}</div>
                <span style={{ fontSize: '.85rem' }}>📍 {activeTrip.drop_location}</span>
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>₹{activeTrip.estimated_fare}</span>
                <button className="sos-btn" style={{ width: 48, height: 48, fontSize: '.7rem', marginLeft: 'auto' }} onClick={handleSOS}>SOS</button>
              </div>
            ) : (
              <div className="alert-box alert-info" style={{ marginTop: 16 }}>
                {t('no_active_trip')} — Map shows default location (Gwalior)
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ LINKED USER QR ═══ */}
      {activeTab === 'linked_qr' && isGuardianMode && (
        <div className="fade-in-up">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-header">
              <div className="section-title">👥 {t('linked_users')}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowCreateLinked(true); setCreatedCreds(null); }}>+ {t('create_linked_user')}</button>
            </div>
            {linkedUsers.map(lu => (
              <div key={lu.id} className="linked-user-card" style={{ marginBottom: 10 }}>
                <div className="linked-user-avatar">{lu.first_name?.[0]}{lu.last_name?.[0]}</div>
                <div className="linked-user-info">
                  <div className="linked-user-name">{lu.first_name} {lu.last_name}</div>
                  <div className="linked-user-meta">{lu.relation} • {lu.email} • {lu.blood_group || '—'}</div>
                </div>
              </div>
            ))}
            {linkedUsers.length === 0 && <div style={{ opacity: .5, textAlign: 'center', padding: 24 }}>No linked users. Create one to generate QR.</div>}
          </div>
        </div>
      )}

      {/* ═══ PEAK ANALYSIS ═══ */}
      {activeTab === 'peak' && (
        <div className="card fade-in-up">
          <div className="section-title" style={{ marginBottom: 14 }}>📈 {t('peak_analysis')}</div>
          <PeakHourChart />
        </div>
      )}

      {/* ═══ HISTORY ═══ */}
      {activeTab === 'history' && (
        <div className="card fade-in-up">
          <div className="section-title" style={{ marginBottom: 14 }}>📜 {t('trip_history')}</div>
          <TravelTimeline />
        </div>
      )}

      {/* ═══ CREATE LINKED USER MODAL ═══ */}
      {showCreateLinked && (
        <div className="modal-overlay" onClick={() => setShowCreateLinked(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {!createdCreds ? (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">👤 {t('create_linked_user')}</h3>
                  <button className="modal-close" onClick={() => setShowCreateLinked(false)}>✕</button>
                </div>
                <div className="form-group">
                  <label className="label">{t('first_name')}</label>
                  <input className="input-field" value={newLinked.first_name} onChange={e => setNewLinked(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">{t('last_name')}</label>
                  <input className="input-field" value={newLinked.last_name} onChange={e => setNewLinked(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="label">{t('relation')}</label>
                    <select className="input-field" value={newLinked.relation} onChange={e => setNewLinked(p => ({ ...p, relation: e.target.value }))}>
                      {['Child', 'Spouse', 'Parent', 'Sibling', 'Student', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">{t('blood_group')}</label>
                    <select className="input-field" value={newLinked.blood_group} onChange={e => setNewLinked(p => ({ ...p, blood_group: e.target.value }))}>
                      <option value="">—</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">{t('phone')}</label>
                  <input className="input-field" value={newLinked.phone} onChange={e => setNewLinked(p => ({ ...p, phone: e.target.value }))} placeholder="+91..." />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleCreateLinkedUser}>✨ {t('create_linked_user')}</button>
              </>
            ) : (
              <div className="fade-in-up" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, marginBottom: 16 }}>{t('credentials_generated')}</h3>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, textAlign: 'left', marginBottom: 20 }}>
                  <div style={{ marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong>{createdCreds.name}</strong></div>
                  <div style={{ marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong style={{ fontFamily: 'monospace', fontSize: '.85rem' }}>{createdCreds.email}</strong></div>
                  <div style={{ marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Password:</span> <strong style={{ fontFamily: 'monospace', fontSize: '.85rem', color: 'var(--accent-warning)' }}>{createdCreds.password}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Relation:</span> <strong>{createdCreds.relation}</strong></div>
                </div>
                <div className="alert-box alert-warning">⚠️ Save these credentials! The password won't be shown again.</div>
                <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => setShowCreateLinked(false)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
