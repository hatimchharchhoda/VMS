import React, { useState } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Check } from 'lucide-react';

const VisitorRegister: React.FC = () => {
  const { visitorProfile, createVisit } = useVisitor();
  const { users, accessTemplates, locations } = useApp();
  const navigate = useNavigate();

  const hosts = users.filter(u => u.role === 'host');

  const [form, setForm] = useState({
    phone: visitorProfile?.phone || '',
    company: visitorProfile?.company || '',
    purpose: '',
    hostId: '',
    hostName: '',
    locationId: 'loc001',
    visitDate: '',
    visitTime: '09:00',
    endTime: '10:00',
    category: 'general',
    notes: '',
    idProof: '',
  });
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setHost = (hId: string) => {
    const host = hosts.find(h => h.id === hId);
    setForm(f => ({ ...f, hostId: hId, hostName: host?.name || '' }));
  };

  const handleSubmit = () => {
    if (!form.purpose || !form.hostId || !form.visitDate) return;
    setSubmitting(true);
    setTimeout(() => {
      const visit = createVisit({ ...form });
      setSuccess(`Visit request submitted! ID: ${visit.id}`);
      setForm(f => ({ ...f, purpose: '', hostId: '', hostName: '', visitDate: '', notes: '', idProof: '' }));
      setSubmitting(false);
      setTimeout(() => navigate('/visitor/visits'), 2000);
    }, 600);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Register a Visit</h1>
          <p>Pre-register your visit request — it will be reviewed by the host and admin</p>
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-emerald)', fontSize: 14, fontWeight: 600 }}>
          <Check size={18} /> {success} — Redirecting…
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Your Details</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Auto-filled */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: 'var(--accent-emerald)' }}>●</span></label>
                <input className="form-input" value={visitorProfile?.name || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: 'var(--accent-emerald)' }}>●</span></label>
                <input className="form-input" value={visitorProfile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Visit Details</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Purpose of Visit *</label>
              <input className="form-input" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g., Business Meeting, Interview, Vendor delivery…" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Select Host *</label>
                <select className="form-select" value={form.hostId} onChange={e => setHost(e.target.value)}>
                  <option value="">-- Choose a host --</option>
                  {hosts.map(h => <option key={h.id} value={h.id}>{h.name} — {h.department}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Visit Date *</label>
                <input className="form-input" type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="time" value={form.visitTime} onChange={e => setForm(f => ({ ...f, visitTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-input" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Visitor Type</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="general">General</option>
                  <option value="vendor">Vendor / Supplier</option>
                  <option value="candidate">Interview Candidate</option>
                  <option value="vip">VIP Guest</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Special Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requirements or notes for security…" />
            </div>
            <div className="form-group">
              <label className="form-label">ID Proof (filename only)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={form.idProof} onChange={e => setForm(f => ({ ...f, idProof: e.target.value }))} placeholder="e.g., passport_john_doe.pdf" />
                <button className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}><Upload size={13} /> Attach</button>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={!form.purpose || !form.hostId || !form.visitDate || submitting}>
              {submitting ? <><span className="spinner"></span> Submitting…</> : <><Send size={15} /> Submit Visit Request</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegister;
