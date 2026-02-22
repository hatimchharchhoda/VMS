import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit3, Trash2, Search, Save, X } from 'lucide-react';
import type { AccessTemplate } from '../../types';

const ICONS = ['🔧', '🤝', '📦', '⭐', '👤', '🏭', '🔬', '💼', '🎯', '🛡️'];
const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4', '#ef4444', '#f97316'];
const DAYS_ALL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const emptyTemplate = (): Omit<AccessTemplate, 'id' | 'createdAt'> => ({
  name: '', color: '#3b82f6', icon: '🔧', description: '',
  allowedZones: [], allowedDevices: [],
  timeRestrictions: { startTime: '08:00', endTime: '18:00', daysAllowed: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  maxDuration: 480, autoExpiry: true, visitorCategory: 'general', requiresEscort: false,
});

const AccessTemplates: React.FC = () => {
  const { accessTemplates, setAccessTemplates, zones, devices } = useApp();
  const [search, setSearch] = useState('');
  const [editTpl, setEditTpl] = useState<AccessTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyTemplate());

  const filtered = accessTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const startCreate = () => { setForm(emptyTemplate()); setCreating(true); setEditTpl(null); };
  const startEdit = (t: AccessTemplate) => { setEditTpl(t); setForm({ ...t }); setCreating(false); };

  const handleSave = () => {
    if (!form.name) return;
    if (creating) {
      const newT: AccessTemplate = { ...form, id: `tpl${Date.now()}`, createdAt: new Date().toISOString() };
      setAccessTemplates([...accessTemplates, newT]);
    } else if (editTpl) {
      setAccessTemplates(accessTemplates.map(t => t.id === editTpl.id ? { ...t, ...form } : t));
    }
    setCreating(false); setEditTpl(null);
  };

  const toggleZone = (id: string) => setForm(f => ({ ...f, allowedZones: f.allowedZones.includes(id) ? f.allowedZones.filter(z => z !== id) : [...f.allowedZones, id] }));
  const toggleDevice = (id: string) => setForm(f => ({ ...f, allowedDevices: f.allowedDevices.includes(id) ? f.allowedDevices.filter(d => d !== id) : [...f.allowedDevices, id] }));
  const toggleDay = (day: string) => setForm(f => ({ ...f, timeRestrictions: { ...f.timeRestrictions, daysAllowed: f.timeRestrictions.daysAllowed.includes(day) ? f.timeRestrictions.daysAllowed.filter(d => d !== day) : [...f.timeRestrictions.daysAllowed, day] } }));

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Access Templates</h1>
          <p>Predefined access configurations assigned to visitors upon approval</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={startCreate}><Plus size={14} /> New Template</button>
        </div>
      </div>

      {(creating || editTpl) && (
        <div className="modal-overlay" onClick={() => { setCreating(false); setEditTpl(null); }}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{creating ? 'Create Access Template' : `Edit: ${editTpl?.name}`}</span>
              <button className="modal-close" onClick={() => { setCreating(false); setEditTpl(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Contractor Access" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.visitorCategory} onChange={e => setForm({ ...form, visitorCategory: e.target.value })}>
                    {['general', 'contractor', 'vendor', 'candidate', 'vip'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {ICONS.map(ic => <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })} style={{ width: 36, height: 36, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', border: form.icon === ic ? '2px solid var(--accent-blue)' : '1.5px solid var(--border-color)', background: form.icon === ic ? 'rgba(59,130,246,0.1)' : 'transparent' }}>{ic}</button>)}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {COLORS.map(c => <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />)}
                </div>
              </div>
              <div className="sep"></div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" value={form.timeRestrictions.startTime} onChange={e => setForm({ ...form, timeRestrictions: { ...form.timeRestrictions, startTime: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time" value={form.timeRestrictions.endTime} onChange={e => setForm({ ...form, timeRestrictions: { ...form.timeRestrictions, endTime: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Duration (min)</label>
                  <input className="form-input" type="number" value={form.maxDuration} onChange={e => setForm({ ...form, maxDuration: +e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Allowed Days</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {DAYS_ALL.map(d => <button key={d} type="button" onClick={() => toggleDay(d)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: form.timeRestrictions.daysAllowed.includes(d) ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border-color)', background: form.timeRestrictions.daysAllowed.includes(d) ? 'rgba(59,130,246,0.12)' : 'transparent', color: form.timeRestrictions.daysAllowed.includes(d) ? 'var(--accent-blue-light)' : 'var(--text-muted)' }}>{d}</button>)}
                </div>
              </div>
              <div className="sep"></div>
              <div className="form-group">
                <label className="form-label">Allowed Zones</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {zones.map(z => <button key={z.id} type="button" onClick={() => toggleZone(z.id)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.allowedZones.includes(z.id) ? '1.5px solid var(--accent-emerald)' : '1.5px solid var(--border-color)', background: form.allowedZones.includes(z.id) ? 'rgba(16,185,129,0.1)' : 'transparent', color: form.allowedZones.includes(z.id) ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>{z.name}</button>)}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Allowed Devices</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {devices.map(d => <button key={d.id} type="button" onClick={() => toggleDevice(d.id)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.allowedDevices.includes(d.id) ? '1.5px solid var(--accent-purple)' : '1.5px solid var(--border-color)', background: form.allowedDevices.includes(d.id) ? 'rgba(139,92,246,0.1)' : 'transparent', color: form.allowedDevices.includes(d.id) ? 'var(--accent-purple-light)' : 'var(--text-muted)' }}>{d.name}</button>)}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.requiresEscort} onChange={e => setForm({ ...form, requiresEscort: e.target.checked })} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Requires Escort</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setCreating(false); setEditTpl(null); }}><X size={13} /> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={13} /> Save Template</button>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} templates</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map(t => (
          <div key={t.id} className="card" style={{ borderTop: `3px solid ${t.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: t.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.description}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              <span className="chip">⏰ {t.timeRestrictions.startTime}–{t.timeRestrictions.endTime}</span>
              <span className="chip">⌚ {t.maxDuration}min</span>
              <span className="chip">{t.timeRestrictions.daysAllowed.length} days</span>
              <span className="chip">🗺 {t.allowedZones.length} zones</span>
              {t.requiresEscort && <span className="chip">👤 Escort</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(t)}><Edit3 size={12} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete template?')) setAccessTemplates(accessTemplates.filter(a => a.id !== t.id)); }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessTemplates;
