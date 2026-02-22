import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import type { Location } from '../../types';

const MasterData: React.FC = () => {
  const { locations, setLocations, zones } = useApp();
  const [activeTab, setActiveTab] = useState<'locations' | 'zones' | 'employees'>('locations');
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [locForm, setLocForm] = useState<Partial<Location>>({});

  const startEditLoc = (loc: Location) => { setEditLoc(loc); setLocForm({ ...loc }); };
  const saveLoc = () => {
    if (!editLoc || !locForm.name) return;
    setLocations(locations.map(l => l.id === editLoc.id ? { ...l, ...locForm } : l));
    setEditLoc(null);
  };

  const SECURITY_COLORS: Record<string, string> = { low: 'var(--accent-emerald)', medium: 'var(--accent-amber)', high: '#ef4444', critical: 'var(--accent-rose)' };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Master Data Configuration</h1>
          <p>Manage core entity data: locations, zones, employees</p>
        </div>
      </div>

      <div className="tabs">
        {([['locations', '📍 Locations'], ['zones', '🗺 Zones'], ['employees', '👥 Employees']] as const).map(([key, label]) => (
          <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      {/* Locations */}
      {activeTab === 'locations' && (
        <div>
          {editLoc && (
            <div className="modal-overlay" onClick={() => setEditLoc(null)}>
              <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <span className="modal-title">Edit Location</span>
                  <button className="modal-close" onClick={() => setEditLoc(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={locForm.name || ''} onChange={e => setLocForm({ ...locForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input className="form-input" value={locForm.address || ''} onChange={e => setLocForm({ ...locForm, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Admin Notes</label>
                      <textarea className="form-textarea" value={locForm.adminNotes || ''} onChange={e => setLocForm({ ...locForm, adminNotes: e.target.value })} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={locForm.active ?? true} onChange={e => setLocForm({ ...locForm, active: e.target.checked })} style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Active</span>
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setEditLoc(null)}><X size={12} /> Cancel</button>
                  <button className="btn btn-primary" onClick={saveLoc}><Save size={12} /> Save</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {locations.map(loc => (
              <div key={loc.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{loc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{loc.code}</div>
                  </div>
                  <span className={`badge ${loc.active ? 'badge-approved' : 'badge-rejected'}`}>{loc.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>📍 {loc.address}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>🏢 {loc.buildings?.length || 0} buildings</div>
                {loc.adminNotes && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>"{loc.adminNotes}"</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEditLoc(loc)}><Edit3 size={12} /> Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zones */}
      {activeTab === 'zones' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Zone</th><th>Code</th><th>Floor</th><th>Security Level</th><th>Location</th><th>Description</th></tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id}>
                    <td style={{ fontWeight: 600 }}>{z.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{z.code}</td>
                    <td style={{ fontSize: 12 }}>Floor {z.floor}</td>
                    <td>
                      <span className="badge" style={{ background: SECURITY_COLORS[z.securityLevel] + '20', color: SECURITY_COLORS[z.securityLevel], border: `1px solid ${SECURITY_COLORS[z.securityLevel]}40` }}>
                        {z.securityLevel}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{z.locationId}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{z.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employees */}
      {activeTab === 'employees' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Phone</th></tr>
              </thead>
              <tbody>
                {useApp().users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{u.avatar}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-rejected' : 'badge-approved'}`}>{u.role}</span></td>
                    <td style={{ fontSize: 12 }}>{u.department}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
