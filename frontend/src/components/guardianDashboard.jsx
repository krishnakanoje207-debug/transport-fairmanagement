import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import MapView from './MapView';
import PeakHourChart from './PeakHourChart';
import TravelTimeline from './TravelTimeline';
import QRDisplay from './QRDisplay';
import { toast } from 'react-toastify';

/* Mock data for demo */
const MOCK_LINKED_USERS = [
  { id: 1, name: 'Aryan Sharma', relation: 'Son', age: 14, status: 'active', trackingEnabled: true, bloodGroup: 'O+' },
  { id: 2, name: 'Priya Sharma', relation: 'Daughter', age: 11, status: 'inactive', trackingEnabled: true, bloodGroup: 'A+' },
];

export default function GuardianDashboard({ mode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sosActive, setSosActive] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [tripBooked, setTripBooked] = useState(false);
  const [tripActive, setTripActive] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'qr', msg: 'QR scanned by driver. Trip started.', time: '8:05 AM', color: '#3a5fc8' },
    { id: 2, type: 'weather', msg: 'Light rain expected on route to MITS.', time: '8:02 AM', color: '#f0a63a' },
    { id: 3, type: 'trip_end', msg: 'Trip ended. Aryan arrived safely.', time: '7:45 PM', color: '#3dc47e', date: 'Yesterday' },
  ]);

  const vehicleLoc = tripActive ? { lat: 26.2283, lng: 78.1928 } : null;
  const userLoc = tripActive ? { lat: 26.2200, lng: 78.1850 } : null;

  const handleSOS = () => {
    setSosActive(true);
    toast.error('🆘 SOS ACTIVATED — Emergency contacts notified!', { autoClose: false });
    const newNote = { id: Date.now(), type: 'sos', msg: 'SOS triggered! Last location sent to guardian.', time: new Date().toLocaleTimeString(), color: '#e05252' };
    setNotifications(n => [newNote, ...n]);
  };

  const handleBookTrip = () => {
    if (!selectedTransport) { toast.error('Please select transport'); return; }
    if (selectedTransport !== 'bus' && !pickup) { toast.error('Please enter pickup location'); return; }
    if (!drop) { toast.error('Please enter drop location'); return; }
    setTripBooked(true);
    toast.success('Trip booked! QR codes generated.');
  };

  const handleStartTrip = () => {
    setTripActive(true);
    toast.success('Trip started. Live tracking enabled.');
  };

  const SLABS = [
    { id: 'morning', label: t('morning_peak'), risk: 'high', icon: '🌅' },
    { id: 'afternoon', label: t('afternoon'), risk: 'safe', icon: '☀️' },
    { id: 'evening', label: t('evening_peak'), risk: 'high', icon: '🌆' },
    { id: 'night', label: t('night'), risk: 'moderate', icon: '🌙' },
  ];

  /* ── Guardian Mode ─────────────────────────── */
  if (mode === 'guardian') {
    return (
      <div className="fade-in">
        <div className="stats-grid">
          {MOCK_LINKED_USERS.map(u => (
            <div key={u.id} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div className="stat-value" style={{ fontSize:'1.2rem' }}>{u.name}</div>
                  <div className="stat-label">{u.relation} · Age {u.age}</div>
                  <div style={{ marginTop:8 }}>
                    <span className={`badge ${u.status === 'active' ? 'badge-safe' : 'badge-info'}`}>
                      {u.status === 'active' ? '● Active Trip' : '○ No Trip'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:'1.8rem' }}>👤</div>
              </div>
            </div>
          ))}
          <div className="stat-card">
            <div className="stat-value">1</div>
            <div className="stat-label">Active Trips Today</div>
            <span className="stat-icon">🚌</span>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color:'var(--accent-success)' }}>Safe</div>
            <div className="stat-label">Current Status</div>
            <span className="stat-icon">🛡</span>
          </div>
        </div>

        {/* Active Trip Monitor */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="section-header">
            <div className="section-title">📍 Live Tracking — Aryan Sharma</div>
            <span className="badge badge-safe">● LIVE</span>
          </div>
          <div style={{ position:'relative' }}>
            <MapView vehicleLocation={{ lat:26.2283, lng:78.1928 }} userLocation={{ lat:26.2200, lng:78.1850 }} showDistance height={300} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:16 }}>
            {[['Distance', '8.2 km', '#c8a94f'],['Dist. from vehicle','120 m', '#3dc47e'],['ETA','12 min','#3a5fc8']].map(([l,v,c]) => (
              <div key={l} style={{ textAlign:'center', background:'var(--bg-secondary)', borderRadius:10, padding:'12px 8px' }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.4rem', fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* SOS */}
          <div style={{ display:'flex', justifyContent:'center', marginTop:20 }}>
            <button className={`sos-btn ${sosActive ? 'btn-danger' : ''}`} onClick={handleSOS}
              style={{ animation: sosActive ? 'sos-pulse 1s infinite' : undefined }}>
              {sosActive ? '🆘 ACTIVE' : 'SOS'}
            </button>
          </div>
          {sosActive && <div className="alert-box alert-danger" style={{ marginTop:12, textAlign:'center' }}>SOS is ACTIVE — Waiting for guardian acknowledgment</div>}
        </div>

        {/* Recent Notifications */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="section-header">
            <div className="section-title">🔔 Recent Notifications</div>
            <button className="btn btn-ghost btn-sm">Mark all read</button>
          </div>
          {notifications.map(n => (
            <div key={n.id} className="notification-item">
              <div className="notification-dot" style={{ background: n.color }} />
              <div>
                <div style={{ fontSize:'0.9rem' }}>{n.msg}</div>
                <div className="notification-time">{n.date ? n.date + ' · ' : ''}{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Summary */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">📊 Usage Awareness</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
            {[['Total Trips','47'],['SOS Triggers','2'],['Weather Alerts','8'],['Peak-Hour Trips','12']].map(([l,v]) => (
              <div key={l} style={{ background:'var(--bg-secondary)', borderRadius:10, padding:14 }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.4rem', color:'var(--accent-primary)', fontWeight:700 }}>{v}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Normal User Mode ──────────────────────── */
  return (
    <div className="fade-in">
      {/* Stats row */}
      <div className="stats-grid">
        {[
          { v:'47', l:'Total Trips', icon:'🚌' },
          { v:'312 km', l:'Distance', icon:'📍' },
          { v:'38 hrs', l:'Travel Time', icon:'⏱' },
          { v:'28', l:'Active Days', icon:'📅' },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="stat-value">{s.v}</div>
            <div className="stat-label">{s.l}</div>
            <span className="stat-icon">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="tabs">
        {[['overview','🏠 Overview'],['plan','🗺 Plan Trip'],['tracking','📍 Tracking'],['qr','📲 QR Codes']].map(([id, label]) => (
          <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom:14 }}>⏱ Peak Hour Analysis</div>
              <PeakHourChart />
            </div>
            <div className="card">
              <div className="section-title" style={{ marginBottom:14 }}>🕐 Recent Activity</div>
              <TravelTimeline compact />
            </div>
          </div>
          <div className="card" style={{ marginTop:20 }}>
            <div className="section-header">
              <div className="section-title">🔔 Notifications</div>
            </div>
            {notifications.map(n => (
              <div key={n.id} className="notification-item">
                <div className="notification-dot" style={{ background: n.color }} />
                <div><div style={{ fontSize:'0.9rem' }}>{n.msg}</div><div className="notification-time">{n.time}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Trip */}
      {activeTab === 'plan' && (
        <div>
          {!tripBooked ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* Left: form */}
              <div className="card">
                <div className="section-title" style={{ marginBottom:16 }}>🚌 {t('select_transport')}</div>
                <div className="transport-selector" style={{ marginBottom:20 }}>
                  {[['bus','🚌','Bus'],['auto','🛺','Auto'],['cab','🚕','Cab']].map(([id, icon, label]) => (
                    <button key={id} className={`transport-btn ${selectedTransport === id ? 'selected' : ''}`}
                      onClick={() => setSelectedTransport(id)}>
                      <span className="t-icon">{icon}</span>
                      <span className="t-label">{label}</span>
                    </button>
                  ))}
                </div>

                {selectedTransport && selectedTransport !== 'bus' && (
                  <div className="form-group">
                    <label className="label">📍 {t('pickup_location')}</label>
                    <input className="input-field" placeholder="Enter pickup…" value={pickup} onChange={e => setPickup(e.target.value)} />
                  </div>
                )}
                {selectedTransport && (
                  <div className="form-group">
                    <label className="label">🏁 {t('drop_location')}</label>
                    <input className="input-field" placeholder="Enter drop…" value={drop} onChange={e => setDrop(e.target.value)} />
                  </div>
                )}

                <div className="section-title" style={{ margin:'20px 0 14px' }}>⏰ {t('select_time_slab')}</div>
                <div className="time-slab-grid">
                  {SLABS.map(s => (
                    <div key={s.id} className={`time-slab-item ${selectedSlab === s.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSlab(s.id)}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:600 }} className="slab-name">{s.icon} {s.label}</span>
                        <span className={`badge badge-${s.risk === 'safe' ? 'safe' : s.risk === 'moderate' ? 'moderate' : 'danger'}`}>
                          {s.risk === 'safe' ? t('safe') : s.risk === 'moderate' ? t('moderate') : t('high_risk')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary btn-full" style={{ marginTop:20 }} onClick={handleBookTrip}>
                  📋 {t('book_trip')}
                </button>
              </div>

              {/* Right: weather + peak */}
              <div>
                <div className="card" style={{ marginBottom:16 }}>
                  <div className="section-title" style={{ marginBottom:12 }}>🌦 {t('weather_analysis')}</div>
                  <div style={{ display:'flex', gap:10 }}>
                    <div style={{ flex:1, background:'var(--bg-secondary)', borderRadius:10, padding:14, textAlign:'center' }}>
                      <div style={{ fontSize:'2rem' }}>🌤</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.5rem', color:'var(--accent-primary)', fontWeight:700 }}>28°C</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Partly Cloudy</div>
                    </div>
                    <div style={{ flex:1 }}>
                      {[['Humidity','72%','💧'],['Wind','18 km/h','💨'],['Visibility','Good','👁'],['Rain Risk','Low','🌧']].map(([l,v,i]) => (
                        <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                          <span style={{ color:'var(--text-muted)' }}>{i} {l}</span>
                          <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="section-title" style={{ marginBottom:10 }}>⏱ Traffic Analysis</div>
                  <PeakHourChart compact />
                </div>
              </div>
            </div>
          ) : !tripActive ? (
            /* Booked — show QR */
            <div style={{ maxWidth:500, margin:'0 auto' }}>
              <div className="alert-box alert-success">✅ Trip booked successfully! QR codes are ready.</div>
              <QRDisplay paymentQR={`saferoute://payment/${Date.now()}`} linkedUserQR={`saferoute://verify/${Date.now()}`} />
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:16 }} onClick={handleStartTrip}>
                ▶ Start Trip & Activate Tracking
              </button>
            </div>
          ) : (
            /* Trip active */
            <div>
              <div className="alert-box alert-safe" style={{ background:'rgba(61,196,126,0.1)', borderColor:'#3dc47e', color:'#3dc47e' }}>
                ● Trip is ACTIVE — Live tracking enabled
              </div>
              <div className="card" style={{ marginBottom:16 }}>
                <MapView vehicleLocation={vehicleLoc} userLocation={userLoc} showDistance height={340} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="sos-btn btn-sm" style={{ width:'auto', height:'auto', padding:'10px 20px', borderRadius:8, fontSize:'1rem' }} onClick={handleSOS}>
                  🆘 SOS
                </button>
                <button className="btn btn-danger" style={{ flex:1 }} onClick={() => { setTripActive(false); setTripBooked(false); toast.success('Trip ended.'); }}>
                  ■ End Trip
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div>
          {tripActive ? (
            <>
              <div className="card" style={{ marginBottom:16 }}>
                <div className="section-header">
                  <div className="section-title">📍 Live Location</div>
                  <span className="badge badge-safe">● GPS Active</span>
                </div>
                <MapView vehicleLocation={vehicleLoc} userLocation={userLoc} showDistance height={360} />
                <div style={{ display:'flex', justifyContent:'center', marginTop:16 }}>
                  <button className="sos-btn" onClick={handleSOS}>SOS</button>
                </div>
              </div>
              <div className="card">
                <div className="section-title" style={{ marginBottom:14 }}>📋 Trip Timeline</div>
                <TravelTimeline />
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign:'center', padding:50 }}>
              <div style={{ fontSize:'3rem', marginBottom:16 }}>📍</div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.4rem', color:'var(--text-secondary)' }}>{t('no_active_trip')}</div>
              <p style={{ color:'var(--text-muted)', marginTop:8 }}>Book and start a trip to enable live tracking</p>
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => setActiveTab('plan')}>Plan a Trip →</button>
            </div>
          )}
        </div>
      )}

      {/* QR Tab */}
      {activeTab === 'qr' && (
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          {tripBooked ? (
            <QRDisplay paymentQR={`saferoute://payment/${Date.now()}`} linkedUserQR={`saferoute://verify/${Date.now()}`} />
          ) : (
            <div className="card" style={{ textAlign:'center', padding:50 }}>
              <div style={{ fontSize:'3rem', marginBottom:16 }}>📲</div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.4rem', color:'var(--text-secondary)' }}>No QR Generated</div>
              <p style={{ color:'var(--text-muted)', marginTop:8 }}>QR codes will appear after booking a trip</p>
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => setActiveTab('plan')}>Book a Trip →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
