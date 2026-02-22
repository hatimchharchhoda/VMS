import React, { useState, useEffect } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { MapPin, Cpu, Clock, Lock } from 'lucide-react';

const AccessVisibility: React.FC = () => {
  const { myVisits, activeVisit } = useVisitor();
  const { accessTemplates, zones, devices } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [scanResult, setScanResult] = useState<{ granted: boolean; reason: string } | null>(null);
  const [simDevice, setSimDevice] = useState('');

  const eligibleVisits = myVisits.filter(v => v.status === 'approved' || v.status === 'checked-in');
  const visit = eligibleVisits.find(v => v.id === selectedId) ?? activeVisit ?? eligibleVisits[0];
  const template = visit ? accessTemplates.find(t => t.id === visit.accessTemplateId) : null;
  const allowedZones = template ? zones.filter(z => template.allowedZones.includes(z.id)) : [];
  const restrictedZones = zones.filter(z => !template?.allowedZones.includes(z.id));
  const allowedDevices = template ? devices.filter(d => template.allowedDevices.includes(d.id)) : [];

  const now = new Date();
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!visit) return;
    const tick = () => {
      const target = new Date(`${visit.visitDate}T${visit.endTime}:00`);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visit]);

  const simulateScan = () => {
    if (!simDevice || !visit) return;
    const device = devices.find(d => d.id === simDevice);
    if (!device) return;
    const isAllowed = template?.allowedDevices.includes(simDevice);
    const isActive = device.status === 'active';
    const timeOk = (() => {
      if (!template) return false;
      const t = now.toTimeString().slice(0, 5);
      return t >= template.timeRestrictions.startTime && t <= template.timeRestrictions.endTime;
    })();

    if (!isAllowed) setScanResult({ granted: false, reason: 'This device is not in your allowed device list' });
    else if (!isActive) setScanResult({ granted: false, reason: 'Device is offline' });
    else if (!timeOk) setScanResult({ granted: false, reason: `Access allowed only between ${template?.timeRestrictions.startTime} – ${template?.timeRestrictions.endTime}` });
    else if (visit.isBlacklisted) setScanResult({ granted: false, reason: 'Visitor is blacklisted' });
    else setScanResult({ granted: true, reason: 'All checks passed — Access Granted!' });
  };

  const secLevel = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#f43f5e' };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left"><h1>Access Visibility</h1><p>View your permitted zones, devices, and time windows</p></div>
        {eligibleVisits.length > 1 && (
          <div className="page-header-actions">
            <select className="form-select" value={selectedId || visit?.id || ''} onChange={e => setSelectedId(e.target.value)} style={{ width: 'auto' }}>
              {eligibleVisits.map(v => <option key={v.id} value={v.id}>{v.purpose} — {v.visitDate}</option>)}
            </select>
          </div>
        )}
      </div>

      {!visit ? (
        <div className="empty-state" style={{ padding: '80px' }}><div className="empty-state-icon">🔑</div><h3>No active approved visits</h3><p>Your access permissions will appear here once a visit is approved.</p></div>
      ) : (
        <>
          {/* Access Summary Card */}
          <div className="card" style={{ borderColor: template ? template.color + '55' : undefined }}>
            <div className="card-header">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>{template?.icon ?? '🔑'}</span>
                <div>
                  <div className="card-title">{template?.name ?? 'No Template Assigned'}</div>
                  <div className="card-subtitle">{template?.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="countdown-timer" style={{ color: timeLeft === 'Expired' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{timeLeft}</div>
                <span className={`badge badge-${visit.status}`}>{visit.status}</span>
              </div>
            </div>
            <div className="form-grid">
              <div className="info-row"><span className="info-label">Visit Date</span><span className="info-value">{visit.visitDate}</span></div>
              <div className="info-row"><span className="info-label">Access Window</span><span className="info-value"><Clock size={12} style={{ display: 'inline' }} /> {template?.timeRestrictions.startTime} – {template?.timeRestrictions.endTime}</span></div>
              <div className="info-row"><span className="info-label">Max Duration</span><span className="info-value">{template?.maxDuration} min</span></div>
              <div className="info-row"><span className="info-label">Escort Required</span><span className="info-value">{template?.requiresEscort ? '⚠️ Yes' : 'No'}</span></div>
              <div className="info-row"><span className="info-label">Allowed Days</span><span className="info-value">{template?.timeRestrictions.daysAllowed.join(', ')}</span></div>
              <div className="info-row"><span className="info-label">Auto Expiry</span><span className="info-value">{template?.autoExpiry ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          <div className="grid-2">
            {/* Allowed Zones */}
            <div className="card">
              <div className="card-header"><div className="card-title">✅ Allowed Zones ({allowedZones.length})</div></div>
              {allowedZones.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No zones assigned to this template.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allowedZones.map(z => (
                    <div key={z.id} className="access-zone-card access-zone-allowed">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <MapPin size={14} color="#10b981" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{z.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floor {z.floor} · Building {z.building}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: (secLevel[z.securityLevel] ?? '#64748b') + '22', color: secLevel[z.securityLevel] ?? '#64748b' }}>{z.securityLevel}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Restricted Zones */}
            <div className="card">
              <div className="card-header"><div className="card-title"><Lock size={14} /> Restricted Zones ({restrictedZones.length})</div></div>
              {restrictedZones.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No restricted areas.</p> :
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {restrictedZones.slice(0, 4).map(z => (
                    <div key={z.id} className="access-zone-card access-zone-denied">
                      <Lock size={13} color="var(--accent-rose)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{z.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floor {z.floor} · Access not permitted</div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>

          {/* Allowed Devices */}
          <div className="card">
            <div className="card-header"><div className="card-title"><Cpu size={14} /> Allowed Devices ({allowedDevices.length})</div></div>
            {allowedDevices.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No devices assigned.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {allowedDevices.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: d.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {d.type === 'main-gate' ? '🚪' : d.type === 'server-room' ? '🖥️' : d.type === 'restricted-room' ? '🔒' : '🚪'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.type.replace(/-/g, ' ')}</div>
                    </div>
                    <span className={`badge badge-${d.status}`} style={{ marginLeft: 'auto', fontSize: 10 }}>{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scan Simulator */}
          <div className="card">
            <div className="card-header"><div className="card-title">🔍 Simulate a Door Scan</div></div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Select Device</label>
                <select className="form-select" value={simDevice} onChange={e => setSimDevice(e.target.value)}>
                  <option value="">-- Choose a device --</option>
                  {devices.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={simulateScan} disabled={!simDevice} style={{ marginBottom: 0 }}>Simulate Scan</button>
            </div>
            {scanResult && (
              <div style={{ marginTop: 16 }} className="scan-result">
                <div className={`scan-result-icon ${scanResult.granted ? 'granted' : 'denied'}`}>{scanResult.granted ? '✅' : '🚫'}</div>
                <div className={`scan-result-status ${scanResult.granted ? 'granted' : 'denied'}`}>{scanResult.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</div>
                <div className="scan-result-reason">{scanResult.reason}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AccessVisibility;
