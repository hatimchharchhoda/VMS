import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Lock, Users, FileText, Activity } from 'lucide-react';

const EmergencyControl: React.FC = () => {
  const { visitors, emergencyMode, setEmergencyMode, devices, setDevices, scanLogs, addNotification } = useApp();

  const activeVisitors = visitors.filter(v => v.status === 'checked-in');

  const handleToggleEmergency = () => {
    const next = !emergencyMode;
    setEmergencyMode(next);
    if (next) {
      // Lock all devices
      setDevices(devices.map(d => ({ ...d, status: 'offline' as const })));
      addNotification({ type: 'error', title: '🚨 EMERGENCY MODE ACTIVATED', message: 'All doors locked. Access policies overridden. Evacuation protocol initiated.' });
    } else {
      setDevices(devices.map(d => ({ ...d, status: 'active' as const })));
      addNotification({ type: 'success', title: '✅ Emergency Mode Deactivated', message: 'System returned to normal operation. All devices re-enabled.' });
    }
  };

  const exportEvacuationReport = () => {
    const rows = ['Name,Email,Company,Host,Check-In Time,Zone'];
    activeVisitors.forEach(v => {
      const checkIn = v.checkInTime ? new Date(v.checkInTime).toLocaleString() : 'Unknown';
      rows.push(`"${v.visitorName}","${v.email}","${v.company}","${v.hostName}","${checkIn}","${v.locationId}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'evacuation_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const violationCount = scanLogs.filter(s => s.accessResult === 'denied').length;

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Emergency Control Center</h1>
          <p>Manage emergency situations, lockdowns, and evacuations</p>
        </div>
        <div className="page-header-actions">
          {emergencyMode && <span className="badge badge-rejected" style={{ animation: 'pulse-emergency 1.5s infinite' }}>🚨 EMERGENCY ACTIVE</span>}
        </div>
      </div>

      {/* Emergency Status */}
      <div className="card" style={{ borderColor: emergencyMode ? '#f43f5e' : 'var(--border-color)', background: emergencyMode ? 'rgba(244,63,94,0.05)' : 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: emergencyMode ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {emergencyMode ? '🚨' : '🟢'}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: emergencyMode ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {emergencyMode ? 'EMERGENCY MODE — ACTIVE' : 'SYSTEM NORMAL'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {emergencyMode ? 'All doors locked. Access policies overridden. Evacuation in effect.' : 'All systems operating normally. No active emergencies.'}
              </div>
            </div>
          </div>
          <button
            className={`btn btn-lg ${emergencyMode ? 'btn-success' : 'btn-danger'}`}
            onClick={handleToggleEmergency}
            style={{ minWidth: 200 }}
          >
            <AlertTriangle size={16} />
            {emergencyMode ? '🔓 Deactivate Emergency' : '🚨 Trigger Emergency Mode'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[
          { label: 'Visitors On-Premises', value: activeVisitors.length, icon: '👥', color: 'rgba(59,130,246,0.12)', valueColor: '#3b82f6' },
          { label: 'Locked Devices', value: emergencyMode ? devices.length : 0, icon: '🔒', color: 'rgba(244,63,94,0.12)', valueColor: '#f43f5e' },
          { label: 'Access Violations', value: violationCount, icon: '⚠️', color: 'rgba(245,158,11,0.12)', valueColor: '#f59e0b' },
          { label: 'Total Devices', value: devices.length, icon: '📡', color: 'rgba(16,185,129,0.12)', valueColor: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon-wrap" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.valueColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* People On Premises */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Visitors Currently Inside</div>
            <div className="card-subtitle">These visitors need to be accounted for in evacuation</div>
          </div>
          <button className="btn btn-primary" onClick={exportEvacuationReport}>
            <FileText size={13} /> Export Evacuation Report
          </button>
        </div>
        {activeVisitors.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-state-icon">🏃</div>
            <h3>No visitors currently on premises</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Company</th>
                  <th>Host</th>
                  <th>Check-in Time</th>
                  <th>Access Template</th>
                </tr>
              </thead>
              <tbody>
                {activeVisitors.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{v.company}</td>
                    <td>{v.hostName}</td>
                    <td>{v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '—'}</td>
                    <td>{v.accessTemplateId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Device Lockdown Status */}
      {emergencyMode && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Door Lockdown Status</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {devices.map(dev => (
              <div key={dev.id} style={{ padding: '12px 16px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={16} color="var(--accent-rose)" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{dev.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--accent-rose)', fontWeight: 700 }}>LOCKED</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyControl;
