import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
    } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); fetchUsers(); } catch {}
  };

  return (
    <div className="fade-in-up">
      <div className="page-title">{t('manage_users')}</div>
      <div className="page-subtitle">View and manage all registered users</div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="input-icon-wrapper">
            <span className="input-icon">🔍</span>
            <input className="input-field" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
          </div>
        </div>
        <select className="input-field" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="guardian">Guardian</option>
          <option value="linked_user">Linked User</option>
          <option value="travel_partner">Travel Partner</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={fetchUsers}>🔍 Search</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.75rem', flexShrink: 0 }}>{u.first_name?.[0]}{u.last_name?.[0]}</div>
                    <span style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
                  </div></td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role === 'guardian' ? 'info' : u.role === 'linked_user' ? 'purple' : 'safe'}`}>{u.role}</span></td>
                  <td style={{ fontSize: '.82rem' }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u.id)} style={{ color: 'var(--accent-danger)' }}>🗑</button></td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
