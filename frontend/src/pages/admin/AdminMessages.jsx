import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AdminMessages() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('send');
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ recipient_id: '', subject: '', body: '' });
  const [templateForm, setTemplateForm] = useState({ template_name: '', subject: '', body_html: '', body_text: '', category: 'general' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/admin/templates').then(r => setTemplates(r.data.templates || [])).catch(() => {});
    api.get('/admin/messages').then(r => setMessages(r.data.messages || [])).catch(() => {});
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!form.subject || !form.body) { toast.error('Subject and body required'); return; }
    setSending(true);
    try {
      await api.post('/admin/send-message', form);
      toast.success('Message sent!');
      setForm({ recipient_id: '', subject: '', body: '' });
      api.get('/admin/messages').then(r => setMessages(r.data.messages || []));
    } catch {}
    setSending(false);
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.template_name || !templateForm.subject) return;
    try {
      await api.post('/admin/templates', templateForm);
      toast.success('Template created!');
      setTemplateForm({ template_name: '', subject: '', body_html: '', body_text: '', category: 'general' });
      api.get('/admin/templates').then(r => setTemplates(r.data.templates || []));
    } catch {}
  };

  return (
    <div className="fade-in-up">
      <div className="page-title">{t('messages')}</div>
      <div className="page-subtitle">Send messages and manage templates</div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['send', '📧', t('send_message')], ['templates', '📋', t('message_templates')], ['history', '📜', 'History']].map(([id, icon, label]) => (
          <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{icon} {label}</button>
        ))}
      </div>

      {/* ═══ SEND ═══ */}
      {tab === 'send' && (
        <div className="card">
          <div className="form-group">
            <label className="label">Recipient</label>
            <select className="input-field" value={form.recipient_id} onChange={e => setForm(p => ({ ...p, recipient_id: e.target.value }))}>
              <option value="">All Users (broadcast)</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">{t('subject')}</label><input className="input-field" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
          <div className="form-group"><label className="label">{t('body')}</label><textarea className="input-field" rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} /></div>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Sending...</> : `📧 ${t('send')}`}
          </button>
        </div>
      )}

      {/* ═══ TEMPLATES ═══ */}
      {tab === 'templates' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>+ {t('create_template')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="label">Template Name</label><input className="input-field" value={templateForm.template_name} onChange={e => setTemplateForm(p => ({ ...p, template_name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label>
                <select className="input-field" value={templateForm.category} onChange={e => setTemplateForm(p => ({ ...p, category: e.target.value }))}>
                  {['general', 'sos', 'trip', 'welcome', 'alert'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="label">{t('subject')}</label><input className="input-field" value={templateForm.subject} onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Body (HTML)</label><textarea className="input-field" rows={5} value={templateForm.body_html} onChange={e => setTemplateForm(p => ({ ...p, body_html: e.target.value, body_text: e.target.value.replace(/<[^>]*>/g, '') }))} /></div>
            <button className="btn btn-primary" onClick={handleCreateTemplate}>✨ Create</button>
          </div>

          {templates.map(tmpl => (
            <div key={tmpl.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{tmpl.template_name}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{tmpl.subject}</div>
                </div>
                <span className="badge badge-info">{tmpl.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ HISTORY ═══ */}
      {tab === 'history' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Subject</th><th>Recipient</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.subject}</td>
                  <td style={{ fontSize: '.82rem' }}>{m.recipient_email || m.recipient_id || 'Broadcast'}</td>
                  <td><span className="badge badge-safe">{m.status || 'sent'}</span></td>
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
              {messages.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No messages sent</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
