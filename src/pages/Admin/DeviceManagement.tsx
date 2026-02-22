import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit3, Trash2, Search, Save, X, Zap, ZapOff, RefreshCw } from 'lucide-react';
import type { Device } from '../../types';

const DEVICE_TYPES = ['main-gate', 'floor-door', 'restricted-room', 'server-room'];

const emptyDevice = (): Omit<Device, 'id' | 'installedAt' | 'totalScans'> => ({
  name: '', type: 'floor-door', zoneId: '', locationId: 'loc001', status: 'active',
  model: '', ip: '', batteryLevel: 100, lastPing: new Date().toISOString(),
});

const DeviceManagement: React.FC = () => {
  const { devices, setDevices, scanLogs, zones, locations, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyDevice());

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.model.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const startCreate = () => { setForm(emptyDevice()); setCreating(true); setEditDevice(null); };
  const startEdit = (d: Device) => { setEditDevice(d); setForm({ ...d }); setCreating(false); };

  const handleSave = () => {
    if (!form.name || !form.zoneId) return;
    if (creating) {
      const newD: Device = { ...form, id: `dev${Date.now()}`, installedAt: new Date().toISOString().slice(0, 10), totalScans: 0 };
      setDevices([...devices, newD]);
      addNotification({ type: 'success', title: 'Device Added', message: `${form.name} has been added to the system.` });
    } else if (editDevice) {
      setDevices(devices.map(d => d.id === editDevice.id ? { ...d, ...form } : d));
    }
    setCreating(false); setEditDevice(null);
  };

  const toggleStatus = (id: string) => {
    setDevices(devices.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'offline' : 'active' } : d));
  };

  const deleteDevice = (id: string) => {
    if (confirm('Delete this device?')) setDevices(devices.filter(d => d.id !== id));
  };

  const getZone = (zoneId: string) => zones.find(z => z.id === zoneId);
  const getDeviceScanCount = (deviceId: string) => scanLogs.filter(s => s.deviceId === deviceId).length;

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Devices & Door Management</h1>
          <p>Manage physical access control hardware across all locations</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-approved">{devices.filter(d => d.status === 'active').length} Online</span>
          <span className="badge badge-rejected">{devices.filter(d => d.status === 'offline').length} Offline</span>
          <button className="btn btn-primary" onClick={startCreate}><Plus size={14} /> Add Device</button>
        </div>
      </div>

      {(creating || editDevice) && (
        <div className="modal-overlay" onClick={() => { setCreating(false); setEditDevice(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{creating ? 'Add New Device' : `Edit: ${editDevice?.name}`}</span>
              <button className="modal-close" onClick={() => { setCreating(false); setEditDevice(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Device Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Floor 3 Door A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Device['type'] })}>
                    {DEVICE_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Zone *</label>
                  <select className="form-select" value={form.zoneId} onChange={e => setForm({ ...form, zoneId: e.target.value })}>
                    <option value="">-- Select Zone --</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select className="form-select" value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })}>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g., HID-PRX400" />
                </div>
                <div className="form-group">
                  <label className="form-label">IP Address</label>
                  <input className="form-input" value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} placeholder="192.168.1.x" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Device['status'] })}>
                    <option value="active">Active</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Battery Level (%)</label>
                  <input className="form-input" type="number" min={0} max={100} value={form.batteryLevel} onChange={e => setForm({ ...form, batteryLevel: +e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setCreating(false); setEditDevice(null); }}><X size={13} /> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={13} /> Save Device</button>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-bar" style={{ width: 260 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search devices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {DEVICE_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Online</option>
          <option value="offline">Offline</option>
        </select>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} devices</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Zone / Floor</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Scan Count</th>
                <th>IP</th>
                <th>Last Ping</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dev => {
                const zone = getZone(dev.zoneId);
                const scanCount = getDeviceScanCount(dev.id);
                return (
                  <tr key={dev.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{dev.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.model} · {dev.id}</div>
                    </td>
                    <td><span className="chip">{dev.type.replace('-', ' ')}</span></td>
                    <td>
                      <div style={{ fontSize: 12 }}>{zone?.name || dev.zoneId}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floor {zone?.floor}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`dot ${dev.status === 'active' ? 'dot-green dot-pulse' : 'dot-red'}`}></span>
                        <span className={`badge badge-${dev.status === 'active' ? 'active' : 'offline'}`}>{dev.status}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 80 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${dev.batteryLevel}%`, height: '100%', background: dev.batteryLevel > 50 ? 'var(--accent-emerald)' : dev.batteryLevel > 20 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}></div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.batteryLevel}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(dev.totalScans + scanCount).toLocaleString()}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{dev.ip}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(dev.lastPing).toLocaleTimeString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`btn btn-sm ${dev.status === 'active' ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(dev.id)} title={dev.status === 'active' ? 'Disable' : 'Enable'}>
                          {dev.status === 'active' ? <ZapOff size={12} /> : <Zap size={12} />}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(dev)}><Edit3 size={12} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteDevice(dev.id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-state-icon">📡</div><h3>No devices found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
