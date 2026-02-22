import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin } from 'lucide-react';

const MovementTracking: React.FC = () => {
  const { visitors, scanLogs, accessTemplates, zones, devices } = useApp();
  const { user } = useAuth();

  const myVisitors = visitors.filter(v => v.hostId === user?.id && v.status === 'checked-in');

  const getVisitorScans = (visitorId: string) => {
    return [...scanLogs.filter(s => s.visitorId === visitorId)].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getZone = (zoneId: string) => zones.find(z => z.id === zoneId);

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Visitor Movement Tracking</h1>
          <p>Real-time location and movement history of active visitors</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-checked-in">{myVisitors.length} Active</span>
        </div>
      </div>

      {myVisitors.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px' }}>
          <div className="empty-state-icon">🗺️</div>
          <h3>No active visitors</h3>
          <p>Visitor movement will be tracked here when they check in</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {myVisitors.map(v => {
            const scans = getVisitorScans(v.id);
            const lastScan = scans[scans.length - 1];
            const currentZone = lastScan ? getZone(lastScan.zoneId) : null;
            const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);

            return (
              <div key={v.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.company} · {v.purpose}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {currentZone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 4 }}>
                        <MapPin size={13} color="var(--accent-emerald)" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-emerald)' }}>{currentZone.name}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check-in: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '—'}</div>
                    {tpl && <div style={{ fontSize: 11, color: tpl.color, marginTop: 4 }}>{tpl.icon} {tpl.name}</div>}
                  </div>
                </div>

                {scans.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Movement History</div>
                    <div className="timeline">
                      {scans.map(scan => (
                        <div key={scan.id} className="timeline-item">
                          <div className="timeline-track">
                            <div className="timeline-dot" style={{ background: scan.accessResult === 'granted' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></div>
                            <div className="timeline-line"></div>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title">
                              {scan.zoneName}
                              <span className={`badge badge-${scan.accessResult}`} style={{ marginLeft: 8, fontSize: 10 }}>{scan.accessResult}</span>
                            </div>
                            <div className="timeline-desc">{scan.deviceName} · {scan.reason}</div>
                            <div className="timeline-time">{new Date(scan.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px' }}>No scan events recorded yet</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MovementTracking;
