import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Check } from 'lucide-react';

const InviteVisitor: React.FC = () => {
  const { visitors, setVisitors, accessTemplates, addNotification } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState({ visitorName: '', email: '', phone: '', company: '', purpose: '', visitDate: '', visitTime: '09:00', endTime: '10:00', accessTemplateId: '', notes: '' });
  const [success, setSuccess] = useState('');

  const handleSubmit = () => {
    if (!form.visitorName || !form.email || !form.visitDate) return;
    const newVisitor = {
      id: `vis${Date.now()}`,
      ...form,
      hostId: user?.id || '',
      hostName: user?.name || '',
      locationId: 'loc001',
      status: 'pending' as const,
      accessTemplateId: form.accessTemplateId || null,
      policyId: null,
      barcodeId: null,
      checkInTime: null,
      checkOutTime: null,
      isBlacklisted: false,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      category: 'general',
    };
    setVisitors([...visitors, newVisitor]);
    addNotification({ type: 'info', title: 'Visitor Invited', message: `${form.visitorName} has been invited and is pending approval.` });
    setSuccess(`Invite sent to ${form.visitorName}! Request is now pending admin approval.`);
    setForm({ visitorName: '', email: '', phone: '', company: '', purpose: '', visitDate: '', visitTime: '09:00', endTime: '10:00', accessTemplateId: '', notes: '' });
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Invite Visitor</h1>
          <p>Pre-register and invite visitors to the enterprise</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Visitor Information</div></div>
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--accent-emerald)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={14} /> {success}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Purpose of Visit *</label>
              <input className="form-input" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="e.g., Business Meeting, Interview..." />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Visit Date *</label>
                <input className="form-input" type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="time" value={form.visitTime} onChange={e => setForm({ ...form, visitTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Suggested Template</label>
                <select className="form-select" value={form.accessTemplateId} onChange={e => setForm({ ...form, accessTemplateId: e.target.value })}>
                  <option value="">-- No preference --</option>
                  {accessTemplates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes for security..." />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!form.visitorName || !form.email || !form.visitDate}>
              <Send size={14} /> Send Invitation
            </button>
          </div>
        </div>

        {/* My Upcoming Invitees */}
        <div className="card">
          <div className="card-header"><div className="card-title">My Upcoming Invitees</div></div>
          {visitors.filter(v => v.hostId === user?.id && new Date(v.visitDate) >= new Date(new Date().toDateString())).length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">📨</div><h3>No upcoming visitors</h3></div>
          ) : visitors.filter(v => v.hostId === user?.id && new Date(v.visitDate) >= new Date(new Date().toDateString())).slice(0, 8).map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.visitDate} · {v.visitTime}</div>
              </div>
              <span className={`badge badge-${v.status}`}>{v.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteVisitor;
