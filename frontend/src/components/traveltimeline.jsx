import React from 'react';

const MOCK_EVENTS = [
  { id: 1, time: '08:02 AM', type: 'booking', label: 'Trip Booked', desc: 'Bus #MH-12-AB-1234 · Gwalior Bus Stand → MITS Campus', color: '#3dc47e' },
  { id: 2, time: '08:05 AM', type: 'qr', label: 'QR Verified', desc: 'Driver scanned linked user QR. Tracking activated.', color: '#3a5fc8' },
  { id: 3, time: '08:07 AM', type: 'trip_start', label: 'Trip Started', desc: 'Live tracking and distance monitoring enabled.', color: '#c8a94f' },
  { id: 4, time: '08:22 AM', type: 'weather', label: 'Weather Update', desc: 'Light rain detected on route. Drive safely.', color: '#f0a63a' },
  { id: 5, time: '08:35 AM', type: 'trip_end', label: 'Trip Ended', desc: 'Arrived at MITS Campus. Distance: 8.3 km.', color: '#3dc47e' },
];

const ICON_MAP = {
  booking: '📋', qr: '📲', trip_start: '🚌', weather: '🌧', trip_end: '✅',
  sos: '🆘', distance: '📍', peak: '⚠️',
};

export default function TravelTimeline({ events = MOCK_EVENTS, compact = false }) {
  return (
    <div style={{ position:'relative' }}>
      {events.map((ev, i) => (
        <div key={ev.id} style={{ display:'flex', gap:14, marginBottom: compact ? 8 : 16, position:'relative' }}>
          {/* Line */}
          {i < events.length - 1 && (
            <div style={{
              position:'absolute', left:17, top:36, bottom:0, width:2,
              background:'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)'
            }} />
          )}
          {/* Icon */}
          <div style={{
            width:34, height:34, borderRadius:'50%', flexShrink:0,
            background:`${ev.color}22`, border:`2px solid ${ev.color}66`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', zIndex:1
          }}>
            {ICON_MAP[ev.type] || '●'}
          </div>
          {/* Content */}
          <div style={{ flex:1, paddingBottom: compact ? 0 : 8, borderBottom: i < events.length - 1 && !compact ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontFamily:'Rajdhani, sans-serif', fontWeight:700, fontSize:'0.95rem', color:ev.color }}>{ev.label}</span>
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{ev.time}</span>
            </div>
            {!compact && <p style={{ fontSize:'0.83rem', color:'var(--text-secondary)', marginTop:3 }}>{ev.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
