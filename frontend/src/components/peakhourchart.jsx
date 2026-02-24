import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { time: '6 AM',  risk: 1, label: 'Safe' },
  { time: '7 AM',  risk: 3, label: 'High Risk' },
  { time: '8 AM',  risk: 4, label: 'High Risk' },
  { time: '9 AM',  risk: 3, label: 'High Risk' },
  { time: '10 AM', risk: 2, label: 'Moderate' },
  { time: '11 AM', risk: 1, label: 'Safe' },
  { time: '12 PM', risk: 1, label: 'Safe' },
  { time: '1 PM',  risk: 2, label: 'Moderate' },
  { time: '2 PM',  risk: 1, label: 'Safe' },
  { time: '3 PM',  risk: 2, label: 'Moderate' },
  { time: '4 PM',  risk: 3, label: 'High Risk' },
  { time: '5 PM',  risk: 4, label: 'High Risk' },
  { time: '6 PM',  risk: 4, label: 'High Risk' },
  { time: '7 PM',  risk: 3, label: 'High Risk' },
  { time: '8 PM',  risk: 2, label: 'Moderate' },
  { time: '9 PM',  risk: 1, label: 'Safe' },
];

const COLOR_MAP = { 'Safe': '#3dc47e', 'Moderate': '#f0a63a', 'High Risk': '#e05252' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:'0.85rem' }}>
        <div style={{ fontWeight:700 }}>{label}</div>
        <div style={{ color: COLOR_MAP[item.label], marginTop:4 }}>● {item.label}</div>
      </div>
    );
  }
  return null;
};

export default function PeakHourChart({ compact = false }) {
  return (
    <div>
      {!compact && (
        <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
          {Object.entries(COLOR_MAP).map(([label, color]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem' }}>
              <div style={{ width:10, height:10, borderRadius:2, background:color }} />
              <span style={{ color:'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={compact ? 80 : 200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          {!compact && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />}
          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
            interval={compact ? 3 : 1} />
          {!compact && <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 4]} ticks={[1,2,3,4]} />}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="risk" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLOR_MAP[entry.label]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
