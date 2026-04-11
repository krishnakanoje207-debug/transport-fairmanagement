import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const COLORS_MAP = { safe: '#34d399', moderate: '#fbbf24', high_risk: '#f87171' };

export default function PeakHourChart() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [view, setView] = useState('bar');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/peak-hour/analysis');
        setData(res.data);
      } catch {
        // Use demo data if API unavailable
        setData({
          hourly_data: Array.from({length: 24}, (_, h) => ({
            hour: h, traffic_score: [5,3,2,2,5,15,30,65,85,90,60,45,50,45,40,45,60,80,85,70,50,35,20,10][h],
            risk_level: [5,3,2,2,5,15,30,65,85,90,60,45,50,45,40,45,60,80,85,70,50,35,20,10][h] > 75 ? 'high_risk' : [5,3,2,2,5,15,30,65,85,90,60,45,50,45,40,45,60,80,85,70,50,35,20,10][h] > 40 ? 'moderate' : 'safe',
          })),
          current_hour: new Date().getHours(),
          current_risk: 'moderate',
          recommendation: 'Moderate traffic. Allow extra travel time.',
          news_headlines: [
            { title: 'Gwalior traffic advisory: Road work on Highway 3', source: 'Local News' },
            { title: 'New bus route: MITS to Railway Station', source: 'Transport Dept' },
          ],
          best_time: '10:00 AM - 3:00 PM',
        });
      }
    };
    fetch();
  }, []);

  if (!data) return <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>;

  const chartData = data.hourly_data.map(d => ({
    name: `${d.hour.toString().padStart(2,'0')}:00`,
    score: d.traffic_score,
    risk: d.risk_level,
    hour: d.hour,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
        <div>Traffic: <strong>{d.score}%</strong></div>
        <div className={`badge badge-${d.risk === 'high_risk' ? 'danger' : d.risk === 'moderate' ? 'moderate' : 'safe'}`} style={{ marginTop: 4 }}>
          {d.risk === 'high_risk' ? '🔴 ' : d.risk === 'moderate' ? '🟡 ' : '🟢 '}{t(d.risk)}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className={`badge badge-${data.current_risk === 'high_risk' ? 'danger' : data.current_risk === 'moderate' ? 'moderate' : 'safe'}`}>
          {data.current_risk === 'high_risk' ? '🔴' : data.current_risk === 'moderate' ? '🟡' : '🟢'} {t(data.current_risk)}
        </div>
        <span style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Best: {data.best_time}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button className={`btn btn-sm ${view === 'bar' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('bar')}>📊</button>
          <button className={`btn btn-sm ${view === 'line' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('line')}>📈</button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        {view === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={2} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[4,4,0,0]} animationDuration={800}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={COLORS_MAP[d.risk]} opacity={d.hour === data.current_hour ? 1 : 0.6}
                  stroke={d.hour === data.current_hour ? '#fff' : 'none'} strokeWidth={d.hour === data.current_hour ? 2 : 0} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={.3} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={2} axisLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5} dot={false} animationDuration={1000} />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Recommendation */}
      <div className="alert-box alert-info" style={{ marginTop: 16 }}>
        💡 {data.recommendation}
      </div>

      {/* News */}
      {data.news_headlines?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '.06em' }}>📰 TRAFFIC NEWS</div>
          {data.news_headlines.slice(0, 3).map((n, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem', display: 'flex', gap: 8 }}>
              <span style={{ opacity: .4 }}>•</span>
              <div>
                <div>{n.title}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{n.source}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
