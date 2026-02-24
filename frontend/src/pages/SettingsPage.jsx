import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';

/* ── Password strength util ─── */
function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
function calcAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25));
}

/* ── Toggle Switch ─── */
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

/* ── Section components ──────────────────────────────────────────── */

function EditProfile({ user, updateUser }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '',
    email: user?.email || '', phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '', gender: user?.gender || '',
    address: user?.address || '', emergency_contact: user?.emergency_contact || '',
    blood_group: user?.blood_group || '', special_notes: user?.special_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const age = calcAge(form.date_of_birth);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', form);
      updateUser(form);
      toast.success('Profile updated!');
    } catch { /* interceptor */ } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave}>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Edit Profile</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Update your personal information</p>

      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#fff' }}>
          {(form.first_name[0] || 'U').toUpperCase()}{(form.last_name[0] || '').toUpperCase()}
        </div>
        <div>
          <button type="button" className="btn btn-ghost btn-sm">📷 Change Photo</button>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>JPG, PNG up to 5MB</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[['first_name','First Name','John'],['last_name','Last Name','Doe'],['email','Email','you@example.com'],['phone','Phone','+91 XXXXX']].map(([n,l,ph]) => (
          <div key={n} className="form-group">
            <label className="label">{l}</label>
            <input name={n} className="input-field" placeholder={ph} value={form[n]} onChange={e => setForm(f => ({...f, [e.target.name]: e.target.value}))} />
          </div>
        ))}
        <div className="form-group">
          <label className="label">Date of Birth {age ? <span style={{ color:'var(--accent-primary)', marginLeft:6 }}>Age: {age}</span> : ''}</label>
          <input type="date" name="date_of_birth" className="input-field" value={form.date_of_birth} onChange={e => setForm(f => ({...f, date_of_birth: e.target.value}))} />
        </div>
        <div className="form-group">
          <label className="label">Gender</label>
          <select name="gender" className="input-field" value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Blood Group</label>
          <select name="blood_group" className="input-field" value={form.blood_group} onChange={e => setForm(f => ({...f, blood_group: e.target.value}))}>
            <option value="">Select</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Emergency Contact</label>
          <input name="emergency_contact" className="input-field" placeholder="+91 XXXXX" value={form.emergency_contact} onChange={e => setForm(f => ({...f, emergency_contact: e.target.value}))} />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Address / City</label>
        <input name="address" className="input-field" placeholder="City, State" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
      </div>
      <div className="form-group">
        <label className="label">Special Notes</label>
        <textarea name="special_notes" className="input-field" rows={3} placeholder="Allergies, conditions…" value={form.special_notes} onChange={e => setForm(f => ({...f, special_notes: e.target.value}))} style={{ resize:'vertical' }} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <><span className="spinner" style={{ width:16, height:16 }} /> Saving…</> : '💾 Save Changes'}
      </button>
    </form>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [logoutAll, setLogoutAll] = useState(false);
  const strength = pwdStrength(form.newPwd);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#e05252', '#f0a63a', '#f0d040', '#3dc47e'][strength];

  const handleSave = async e => {
    e.preventDefault();
    if (form.newPwd !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (strength < 2) { toast.error('Password too weak'); return; }
    try {
      await api.put('/auth/change-password', { current_password: form.current, new_password: form.newPwd, logout_all: logoutAll });
      toast.success('Password changed!');
      setForm({ current: '', newPwd: '', confirm: '' });
    } catch {}
  };

  return (
    <form onSubmit={handleSave}>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Change Password</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Keep your account secure</p>

      {['current','newPwd','confirm'].map((field, i) => (
        <div key={field} className="form-group">
          <label className="label">{['Current Password','New Password','Confirm New Password'][i]}</label>
          <div style={{ position:'relative' }}>
            <input type={show ? 'text' : 'password'} className="input-field" placeholder="••••••••"
              value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
              style={{ paddingRight: 44 }} required />
            {i === 0 && (
              <button type="button" onClick={() => setShow(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                {show ? '🙈' : '👁'}
              </button>
            )}
          </div>
          {field === 'newPwd' && form.newPwd && (
            <div>
              <div style={{ background:'var(--border)', borderRadius:2, height:4, marginTop:8 }}>
                <div style={{ height:'100%', borderRadius:2, width:`${strength*25}%`, background:strengthColor, transition:'all 0.3s' }} />
              </div>
              <div style={{ fontSize:'0.78rem', color:strengthColor, marginTop:4 }}>{strengthLabel}</div>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginBottom:12, fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.8 }}>
        <div style={{ fontWeight:600, marginBottom:4 }}>Password Rules:</div>
        {['At least 8 characters','One uppercase letter','One number','One special character'].map(r => (
          <div key={r}>{'✦ ' + r}</div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, background:'var(--bg-secondary)', borderRadius:10, padding:12 }}>
        <Toggle checked={logoutAll} onChange={setLogoutAll} />
        <div>
          <div style={{ fontWeight:600, fontSize:'0.9rem' }}>Logout from all devices</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Revoke all active sessions</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button type="submit" className="btn btn-primary">🔒 Update Password</button>
        <a href="/forgot-password" style={{ display:'flex', alignItems:'center', padding:'10px 16px', fontSize:'0.85rem', color:'var(--accent-primary)' }}>Forgot password?</a>
      </div>
    </form>
  );
}

function LinkedUsers() {
  const [users, setUsers] = useState([
    { id:1, name:'Aryan Sharma', relation:'Son', age:14, blood_group:'O+', allergies:'Peanuts', conditions:'Asthma', tracking:true, priority:'High', emergency:'+91 98765 43210' },
    { id:2, name:'Priya Sharma', relation:'Daughter', age:11, blood_group:'A+', allergies:'', conditions:'', tracking:true, priority:'Medium', emergency:'+91 98765 43210' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', relation:'', age:'', blood_group:'', allergies:'', conditions:'', special_notes:'', tracking:true, priority:'Medium', emergency_contact:'' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = e => {
    e.preventDefault();
    setUsers(u => [...u, { ...newUser, id: Date.now() }]);
    setShowAdd(false);
    setNewUser({ name:'', relation:'', age:'', blood_group:'', allergies:'', conditions:'', special_notes:'', tracking:true, priority:'Medium', emergency_contact:'' });
    toast.success('Linked user added!');
  };

  const handleDelete = (id) => {
    setUsers(u => u.filter(x => x.id !== id));
    setConfirmDelete(null);
    toast.success('Linked user removed.');
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Linked Users</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Manage users you monitor as a guardian</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(s => !s)}>➕ Add User</button>
      </div>

      {users.map(u => (
        <div key={u.id} className="linked-user-card" style={{ marginBottom:12 }}>
          <div className="linked-user-avatar">{u.name[0]}</div>
          <div className="linked-user-info">
            <div className="linked-user-name">{u.name}</div>
            <div className="linked-user-meta">{u.relation} · Age {u.age} · {u.blood_group}</div>
            {u.allergies && <div style={{ fontSize:'0.78rem', color:'var(--accent-warning)', marginTop:2 }}>⚠ {u.allergies}</div>}
          </div>
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            <Toggle checked={u.tracking} onChange={v => setUsers(us => us.map(x => x.id === u.id ? {...x, tracking: v} : x))} />
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', alignSelf:'center' }}>Track</span>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(u.id)}>🗑</button>
          </div>
        </div>
      ))}

      {users.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No linked users. Add one to start monitoring.</div>}

      {showAdd && (
        <form className="card" style={{ marginTop:16, border:'1px solid var(--accent-secondary)' }} onSubmit={handleAdd}>
          <div className="gold-bar" />
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.1rem', marginBottom:16 }}>Add Linked User</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['name','Name','Aryan'],['relation','Relation','Son'],['age','Age','14'],['blood_group','Blood Group','O+'],['allergies','Allergies','Peanuts'],['emergency_contact','Emergency Contact','+91']].map(([n,l,ph]) => (
              <div key={n} className="form-group">
                <label className="label">{l}</label>
                <input name={n} className="input-field" placeholder={ph} value={newUser[n]} onChange={e => setNewUser(u => ({...u, [n]: e.target.value}))} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="label">Medical Conditions</label>
            <input name="conditions" className="input-field" placeholder="Asthma, Diabetes…" value={newUser.conditions} onChange={e => setNewUser(u => ({...u, conditions: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Special Assistance Notes</label>
            <textarea className="input-field" rows={2} placeholder="Wheelchair, visual impairment…" value={newUser.special_notes} onChange={e => setNewUser(u => ({...u, special_notes: e.target.value}))} style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <label className="label" style={{ margin:0 }}>Priority</label>
            <select className="input-field" style={{ width:'auto' }} value={newUser.priority} onChange={e => setNewUser(u => ({...u, priority: e.target.value}))}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <Toggle checked={newUser.tracking} onChange={v => setNewUser(u => ({...u, tracking: v}))} />
            <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Enable Tracking</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="submit" className="btn btn-primary">✅ Add User</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:'Rajdhani,sans-serif', textAlign:'center', marginBottom:8 }}>Remove Linked User?</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.88rem', textAlign:'center', marginBottom:24 }}>This will stop all monitoring for this user. This cannot be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => handleDelete(confirmDelete)}>Remove</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackingSettings() {
  const [settings, setSettings] = useState({ master:true, method:'auto', shareGuardian:true, tripOnly:false, sosOverride:true, updateFreq:10 });
  const set = (k, v) => setSettings(s => ({...s, [k]: v}));

  const handleSave = async () => {
    try {
      await api.put('/user/settings/tracking', settings);
      toast.success('Tracking settings saved!');
    } catch {}
  };

  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Tracking Settings</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Configure how your location is tracked</p>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:600 }}>Master Tracking</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Enable or disable all location tracking</div>
          </div>
          <Toggle checked={settings.master} onChange={v => set('master', v)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:14 }}>Tracking Method</div>
        {[['gps','📡 GPS','High accuracy, updates every 10 seconds'],['cell','📶 Cell Tower','Lower accuracy, updates every 30 seconds'],['auto','⚡ Auto','Automatically selects best method']].map(([id, label, desc]) => (
          <label key={id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
            <input type="radio" name="method" value={id} checked={settings.method === id} onChange={() => set('method', id)} style={{ accentColor:'var(--accent-primary)', width:18, height:18 }} />
            <div>
              <div style={{ fontWeight:500 }}>{label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:14 }}>Location Sharing</div>
        {[['shareGuardian','Share with Guardian','Guardian can see your location'],['tripOnly','Trip-Only Sharing','Only track during active trips'],['sosOverride','SOS Override','Allow location sharing during SOS even if disabled']].map(([key, label, desc]) => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight:500, fontSize:'0.9rem' }}>{label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{desc}</div>
            </div>
            <Toggle checked={settings[key]} onChange={v => set(key, v)} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:600 }}>Location Update Frequency</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Current: every {settings.updateFreq}s</div>
          </div>
          <span className="badge badge-info">{settings.updateFreq}s</span>
        </div>
        <input type="range" min={5} max={60} step={5} value={settings.updateFreq} onChange={e => set('updateFreq', Number(e.target.value))}
          style={{ width:'100%', marginTop:12, accentColor:'var(--accent-primary)' }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}><span>5s</span><span>60s</span></div>
      </div>

      <button className="btn btn-primary" onClick={handleSave}>💾 Save Settings</button>
    </div>
  );
}

function SOSSettings() {
  const [settings, setSettings] = useState({ enabled:true, autoLocation:true, notifyEmergency:true, notifyGuardian:true });
  const set = (k, v) => setSettings(s => ({...s, [k]: v}));
  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>SOS Settings</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Configure emergency SOS behavior</p>
      <div className="alert-box alert-danger" style={{ marginBottom:20 }}>
        ⚠ SOS alerts will remain active until acknowledged by your guardian or emergency contacts.
      </div>
      {[
        ['enabled','Enable SOS','Allow SOS trigger from app or GPS device'],
        ['autoLocation','Auto Location Sharing','Immediately share location when SOS is triggered'],
        ['notifyEmergency','Emergency Contact Alert','Send SMS/call to emergency contact'],
        ['notifyGuardian','Guardian Alert','Push notification to linked guardian'],
      ].map(([key, label, desc]) => (
        <div key={key} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:600 }}>{label}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{desc}</div>
          </div>
          <Toggle checked={settings[key]} onChange={v => set(key, v)} />
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => toast.success('SOS settings saved!')}>💾 Save Settings</button>
    </div>
  );
}

function UsageSummary() {
  const [period, setPeriod] = useState('monthly');
  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Usage Summary</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:20 }}>Your travel statistics and analytics</p>

      <div className="tabs">
        {['weekly','monthly','overall'].map(p => (
          <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[['47','Total Trips','🚌'],['312 km','Distance','📍'],['38 hrs','Travel Time','⏱'],['28','Active Days','📅']].map(([v,l,i]) => (
          <div key={l} className="stat-card">
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
            <span className="stat-icon">{i}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card">
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:12 }}>Transport Breakdown</div>
          {[['🚌 Bus','68%'],['🛺 Auto','22%'],['🚕 Cab','10%']].map(([label, pct]) => (
            <div key={label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:4 }}>
                <span>{label}</span><span style={{ color:'var(--accent-primary)' }}>{pct}</span>
              </div>
              <div style={{ background:'var(--border)', borderRadius:4, height:6 }}>
                <div style={{ height:'100%', borderRadius:4, width:pct, background:'var(--accent-secondary)' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:12 }}>Safety Events</div>
          {[['SOS Triggers','2','#e05252'],['Weather Alerts','8','#f0a63a'],['Peak-Hour Trips','12','#f0d040'],['Distance Alerts','1','#3a5fc8']].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' }}>
              <span style={{ color:'var(--text-secondary)' }}>{l}</span>
              <span style={{ color:c, fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:14 }}>Time Slab Distribution</div>
        {[['Morning Peak','35%','high'],['Afternoon','25%','safe'],['Evening Peak','30%','high'],['Night','10%','moderate']].map(([l,pct,risk]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ width:120, fontSize:'0.85rem', color:'var(--text-secondary)' }}>{l}</span>
            <div style={{ flex:1, background:'var(--border)', borderRadius:4, height:8 }}>
              <div style={{ height:'100%', borderRadius:4, width:pct, background: risk === 'safe' ? 'var(--accent-success)' : risk === 'moderate' ? 'var(--accent-warning)' : 'var(--accent-danger)' }} />
            </div>
            <span style={{ width:36, fontSize:'0.82rem', color:'var(--text-muted)', textAlign:'right' }}>{pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    master:true, travelStart:true, travelEnd:true, routeChange:true, delay:true,
    sos:true, emergencyLoc:true, weather:true, peakHour:true, linkedUser:true,
    push:true, sms:true, email:false, quietHours:false, quietStart:'22:00', quietEnd:'07:00'
  });
  const set = (k, v) => setSettings(s => ({...s, [k]: v}));

  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Notification Settings</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Control how and when you receive alerts</p>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>Master Notifications</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Enable all notifications</div>
          </div>
          <Toggle checked={settings.master} onChange={v => set('master', v)} />
        </div>
      </div>

      {[
        { title:'Travel Alerts', items:[['travelStart','Trip Start'],['travelEnd','Trip End'],['routeChange','Route Change'],['delay','Delay']] },
        { title:'Safety Alerts', items:[['sos','SOS Trigger'],['emergencyLoc','Emergency Location']] },
        { title:'Weather & Traffic', items:[['weather','Weather Alerts'],['peakHour','Peak Hour Warnings']] },
        { title:'Guardian Alerts', items:[['linkedUser','Linked User Updates']] },
      ].map(group => (
        <div key={group.title} className="card" style={{ marginBottom:14 }}>
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:12, color:'var(--accent-primary)' }}>{group.title}</div>
          {group.items.map(([key, label]) => (
            <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'0.9rem' }}>{label}</span>
              <Toggle checked={settings[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>
      ))}

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:12 }}>Delivery Methods</div>
        {[['push','📱 Push Notifications'],['sms','💬 SMS'],['email','📧 Email']].map(([key, label]) => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:'0.9rem' }}>{label}</span>
            <Toggle checked={settings[key]} onChange={v => set(key, v)} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>Quiet Hours</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Silence non-emergency alerts</div>
          </div>
          <Toggle checked={settings.quietHours} onChange={v => set('quietHours', v)} />
        </div>
        {settings.quietHours && (
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label className="label">Start</label>
              <input type="time" className="input-field" value={settings.quietStart} onChange={e => set('quietStart', e.target.value)} />
            </div>
            <div style={{ flex:1 }}>
              <label className="label">End</label>
              <input type="time" className="input-field" value={settings.quietEnd} onChange={e => set('quietEnd', e.target.value)} />
            </div>
          </div>
        )}
        <div className="alert-box alert-warning" style={{ marginTop:12, fontSize:'0.8rem' }}>
          ⚠ SOS and emergency alerts will always be delivered, overriding quiet hours.
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => toast.success('Notification settings saved!')}>💾 Save Settings</button>
    </div>
  );
}

function LanguageSettings() {
  const { i18n } = useTranslation();
  const [fontSize, setFontSize] = useState('medium');
  const [lang, setLang] = useState(i18n.language || 'en');

  const applyLang = () => {
    i18n.changeLanguage(lang);
    document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
    toast.success('Language settings applied!');
  };

  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Language & Display</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Configure app language and text size</p>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:14 }}>Application Language</div>
        {[['en','English','English'],['hi','हिंदी','Hindi']].map(([code, label, eng]) => (
          <label key={code} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
            <input type="radio" name="lang" value={code} checked={lang === code} onChange={() => setLang(code)} style={{ accentColor:'var(--accent-primary)', width:18, height:18 }} />
            <div>
              <div style={{ fontWeight:600 }}>{label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{eng}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:14 }}>Text Size</div>
        {['small','medium','large'].map(size => (
          <label key={size} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
            <input type="radio" name="size" value={size} checked={fontSize === size} onChange={() => setFontSize(size)} style={{ accentColor:'var(--accent-primary)', width:18, height:18 }} />
            <span style={{ fontSize: size === 'small' ? '0.85rem' : size === 'large' ? '1.1rem' : '1rem' }}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </span>
          </label>
        ))}
      </div>
      <button className="btn btn-primary" onClick={applyLang}>✅ Apply Changes</button>
    </div>
  );
}

function LogoutDelete({ logout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div>
      <h2 className="page-title" style={{ fontSize:'1.5rem', marginBottom:4 }}>Account Actions</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:24 }}>Manage account sessions and deletion</p>

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:8 }}>Logout</div>
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:16 }}>Sign out of your account on this device.</p>
        <button className="btn btn-ghost" onClick={() => setConfirmLogout(true)}>🚪 Logout</button>
      </div>

      <div className="card" style={{ border:'1px solid var(--accent-danger)' }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:8, color:'var(--accent-danger)' }}>Delete Account</div>
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:8 }}>Permanently delete your account and all associated data.</p>
        <div className="alert-box alert-danger" style={{ fontSize:'0.82rem', marginBottom:16 }}>
          ⚠ This will permanently delete all trips, linked users, tracking history, and preferences. This action cannot be undone.
        </div>
        <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>🗑 Delete Account</button>
      </div>

      {confirmLogout && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontFamily:'Rajdhani,sans-serif', textAlign:'center', marginBottom:8 }}>Confirm Logout?</h3>
            <p style={{ color:'var(--text-muted)', textAlign:'center', marginBottom:24 }}>You will be redirected to the login page.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={logout}>Logout</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setConfirmLogout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize:'2.5rem', textAlign:'center', marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontFamily:'Rajdhani,sans-serif', textAlign:'center', marginBottom:8, color:'var(--accent-danger)' }}>Delete Account?</h3>
            <p style={{ color:'var(--text-muted)', textAlign:'center', fontSize:'0.88rem', marginBottom:24 }}>All your data will be permanently erased. This CANNOT be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => { toast.error('Account deletion requested. Goodbye!'); setConfirmDelete(false); }}>Delete Permanently</button>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Settings Page ─────────────────────────────────────────── */
const SETTINGS_NAV = [
  { id:'profile', icon:'👤', label:'Edit Profile' },
  { id:'password', icon:'🔒', label:'Change Password' },
  { id:'linked', icon:'👥', label:'Linked Users' },
  { id:'tracking', icon:'📍', label:'Tracking Settings' },
  { id:'sos', icon:'🆘', label:'SOS Settings' },
  { id:'usage', icon:'📊', label:'Usage Summary' },
  { id:'notifications', icon:'🔔', label:'Notification Settings' },
  { id:'language', icon:'🌐', label:'Language Settings' },
  { id:'account', icon:'⚠️', label:'Logout / Delete' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('profile');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <h1 className="page-title">⚙️ Settings</h1>
      <p className="page-subtitle">Manage your account and preferences</p>

      <div className="settings-layout">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          {SETTINGS_NAV.map(item => (
            <button key={item.id}
              className={`settings-nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content fade-in" key={active}>
          {active === 'profile' && <EditProfile user={user} updateUser={updateUser} />}
          {active === 'password' && <ChangePassword />}
          {active === 'linked' && <LinkedUsers />}
          {active === 'tracking' && <TrackingSettings />}
          {active === 'sos' && <SOSSettings />}
          {active === 'usage' && <UsageSummary />}
          {active === 'notifications' && <NotificationSettings />}
          {active === 'language' && <LanguageSettings />}
          {active === 'account' && <LogoutDelete logout={handleLogout} />}
        </div>
      </div>
    </div>
  );
}

