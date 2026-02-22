import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit3, Trash2, Search, Save, X } from 'lucide-react';
import type { Policy } from '../../types';

const emptyPolicy = (): Omit<Policy, 'id' | 'createdAt'> => ({
  name: '', description: '', allowedTimeWindow: { start: '08:00', end: '18:00' }, maxVisitDuration: 480,
  antiPassback: true, autoExpiry: true, reEntryAllowed: false, blacklistCheck: true,
  escortRequired: false, applicableZones: [], active: true,
});

const PolicyManagement: React.FC = () => {
  const { policies, setPolicies, zones } = useApp();
  const [search, setSearch] = useState('');
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyPolicy());

  const filtered = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const startCreate = () => { setForm(emptyPolicy()); setCreating(true); setEditPolicy(null); };
  const startEdit = (p: Policy) => { setEditPolicy(p); setForm({ ...p }); setCreating(false); };

  const handleSave = () => {
    if (!form.name) return;
    if (creating) {
      const newP: Policy = { ...form, id: `pol${Date.now()}`, createdAt: new Date().toISOString() };
      setPolicies([...policies, newP]);
    } else if (editPolicy) {
      setPolicies(policies.map(p => p.id === editPolicy.id ? { ...p, ...form } : p));
    }
    setCreating(false); setEditPolicy(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this policy?')) setPolicies(policies.filter(p => p.id !== id));
  };

  const toggleZone = (zoneId: string) => {
    setForm(f => ({
      ...f,
      applicableZones: f.applicableZones.includes(zoneId)
        ? f.applicableZones.filter(z => z !== zoneId)
        : [...f.applicableZones, zoneId],
    }));
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Policy Management</h1>
          <p>Configure visitor access time, duration, and security rules</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={startCreate}><Plus size={14} /> New Policy</button>
        </div>
      </div>

      {/* Form Modal */}
      {(creating || editPolicy) && (
        <div className="modal-overlay" onClick={() => { setCreating(false); setEditPolicy(null); }}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{creating ? 'Create New Policy' : `Edit: ${editPolicy?.name}`}</span>
              <button className="modal-close" onClick={() => { setCreating(false); setEditPolicy(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Policy Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Standard Business Hours Policy" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Allowed Time Window (Start)</label>
                  <input className="form-input" type="time" value={form.allowedTimeWindow.start} onChange={e => setForm({ ...form, allowedTimeWindow: { ...form.allowedTimeWindow, start: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Allowed Time Window (End)</label>
                  <input className="form-input" type="time" value={form.allowedTimeWindow.end} onChange={e => setForm({ ...form, allowedTimeWindow: { ...form.allowedTimeWindow, end: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Visit Duration (minutes)</label>
                  <input className="form-input" type="number" value={form.maxVisitDuration} onChange={e => setForm({ ...form, maxVisitDuration: +e.target.value })} />
                </div>
              </div>
              <div className="sep"></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'antiPassback', label: 'Anti-Passback' },
                  { key: 'autoExpiry', label: 'Auto Badge Expiry' },
                  { key: 'reEntryAllowed', label: 'Re-entry Allowed' },
                  { key: 'blacklistCheck', label: 'Blacklist Check' },
                  { key: 'escortRequired', label: 'Escort Required' },
                  { key: 'active', label: 'Policy Active' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => setForm({ ...form, [key]: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div className="sep"></div>
              <div className="form-group">
                <label className="form-label">Applicable Zones</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {zones.map(z => (
                    <button key={z.id} type="button" onClick={() => toggleZone(z.id)}
                      style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.applicableZones.includes(z.id) ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border-color)', background: form.applicableZones.includes(z.id) ? 'rgba(59,130,246,0.1)' : 'transparent', color: form.applicableZones.includes(z.id) ? 'var(--accent-blue-light)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      {z.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setCreating(false); setEditPolicy(null); }}><X size={13} /> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={13} /> Save Policy</button>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} policies</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ borderLeft: `3px solid ${p.active ? 'var(--accent-blue)' : 'var(--border-color)'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description}</div>
              </div>
              <span className={`badge ${p.active ? 'badge-approved' : 'badge-rejected'}`}>{p.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <span className="chip">⏰ {p.allowedTimeWindow.start}–{p.allowedTimeWindow.end}</span>
              <span className="chip">⌚ Max {p.maxVisitDuration}min</span>
              {p.antiPassback && <span className="chip">🔒 Anti-Passback</span>}
              {p.escortRequired && <span className="chip">👤 Escort Req.</span>}
              {p.autoExpiry && <span className="chip">⏱ Auto-Expiry</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}><Edit3 size={12} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-icon">🛡️</div>
            <h3>No policies found</h3>
            <button className="btn btn-primary" onClick={startCreate}><Plus size={14} /> Create First Policy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;
