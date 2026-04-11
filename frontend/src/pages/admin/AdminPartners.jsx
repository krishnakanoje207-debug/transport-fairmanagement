import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function AdminPartners() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/partners'); setPartners(r.data.partners || []); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete partner?')) return;
    try { await api.delete(`/admin/partners/${id}`); fetch(); } catch {}
  };

  return (
    <div className="fade-in-up">
      <div className="page-title">{t('manage_partners')}</div>
      <div className="page-subtitle">View and manage travel partners</div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Company</th><th>Email</th><th>Phone</th><th>Routes</th><th>Verified</th><th>Actions</th></tr></thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>🚌 {p.company_name || '—'}</td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{p.email || '—'}</td>
                  <td style={{ fontSize: '.82rem' }}>{p.phone || '—'}</td>
                  <td>{p.routes?.length || 0}</td>
                  <td><span className={`badge ${p.is_verified ? 'badge-safe' : 'badge-moderate'}`}>{p.is_verified ? '✓ Verified' : 'Pending'}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)} style={{ color: 'var(--accent-danger)' }}>🗑</button></td>
                </tr>
              ))}
              {partners.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No partners</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
