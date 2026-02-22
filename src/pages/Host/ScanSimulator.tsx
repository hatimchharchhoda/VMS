import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { processScan } from '../../utils/accessEngine';
import { ScanLine, QrCode } from 'lucide-react';
import type { ScanLog } from '../../types';

const ScanSimulator: React.FC = () => {
  const { visitors, devices, accessTemplates, zones, scanLogs, setScanLogs, setVisitors, addNotification } = useApp();
  const { user } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{ decision: { granted: boolean; reason: string }; visitor: typeof visitors[0] | null; device: typeof devices[0] | null } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [scanning, setScanning] = useState(false);

  const activeDevices = devices.filter(d => d.status === 'active');
  const myVisitors = visitors.filter(v => v.hostId === user?.id);
  const recentScans = [...scanLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  const handleScan = () => {
    if (!selectedDevice || !barcodeInput.trim()) return;
    setScanning(true);

    setTimeout(() => {
      const result = processScan(barcodeInput.trim(), selectedDevice, visitors, accessTemplates, devices, zones);
      setScanResult(result);
      setShowResult(true);
      setScanning(false);

      // Log the scan
      const device = devices.find(d => d.id === selectedDevice);
      const zone = zones.find(z => z.id === device?.zoneId);
      
      if (result.visitor) {
        const newLog: ScanLog = {
          id: `scan${Date.now()}`,
          visitorId: result.visitor.id,
          visitorName: result.visitor.visitorName,
          barcodeId: barcodeInput.trim(),
          deviceId: selectedDevice,
          deviceName: device?.name || selectedDevice,
          zoneId: device?.zoneId || '',
          zoneName: zone?.name || '',
          accessResult: result.decision.granted ? 'granted' : 'denied',
          timestamp: new Date().toISOString(),
          reason: result.decision.reason,
        };
        setScanLogs([newLog, ...scanLogs]);

        // Auto check-in if first scan and granted
        if (result.decision.granted && result.visitor.status === 'approved' && !result.visitor.checkInTime) {
          setVisitors(visitors.map(v => v.id === result.visitor!.id ? { ...v, status: 'checked-in', checkInTime: new Date().toISOString() } : v));
        }

        addNotification({
          type: result.decision.granted ? 'success' : 'warning',
          title: result.decision.granted ? '✅ Access Granted' : '🚫 Access Denied',
          message: `${result.visitor.visitorName} — ${result.decision.reason}`,
        });
      }
    }, 800);
  };

  const fillDemo = (v: typeof visitors[0]) => {
    if (v.barcodeId) setBarcodeInput(v.barcodeId);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Barcode Scan Simulator</h1>
          <p>Simulate visitor barcode scans against access control devices</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Scanner Panel */}
        <div className="card">
          <div className="card-header"><div className="card-title">🔍 Simulate Scan</div></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Device / Door *</label>
              <select className="form-select" value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}>
                <option value="">-- Select a device --</option>
                {activeDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type.replace('-', ' ')})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Barcode / QR ID *</label>
              <div className="search-bar">
                <QrCode size={14} color="var(--text-muted)" />
                <input
                  placeholder="Enter or paste barcode ID..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleScan} disabled={!selectedDevice || !barcodeInput || scanning}>
              {scanning ? <><span className="spinner"></span> Scanning...</> : <><ScanLine size={16} /> {`Simulate Scan`}</>}
            </button>

            {/* Quick fill from approved visitors */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quick Fill (Approved Visitors)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visitors.filter(v => v.barcodeId).slice(0, 5).map(v => (
                  <button key={v.id} onClick={() => fillDemo(v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{v.barcodeId}</div>
                    </div>
                    <span className={`badge badge-${v.status}`}>{v.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result + Recent Scans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Scan Result */}
          {showResult && scanResult && (
            <div className="card" style={{ borderColor: scanResult.decision.granted ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)' }}>
              <div className="scan-result">
                <div className={`scan-result-icon ${scanResult.decision.granted ? 'granted' : 'denied'}`}>
                  {scanResult.decision.granted ? '✅' : '🚫'}
                </div>
                <div className={`scan-result-status ${scanResult.decision.granted ? 'granted' : 'denied'}`}>
                  {scanResult.decision.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </div>
                <div className="scan-result-reason">{scanResult.decision.reason}</div>
                {scanResult.visitor && (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 20px', width: '100%', marginTop: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{scanResult.visitor.visitorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{scanResult.visitor.company} · {scanResult.visitor.purpose}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Scans Log */}
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Scan Log</div></div>
            {recentScans.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}><div className="empty-state-icon">📡</div><p>No scans yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentScans.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 16 }}>{s.accessResult === 'granted' ? '✅' : '🚫'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.visitorName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.deviceName}</div>
                    </div>
                    <span className={`badge badge-${s.accessResult}`} style={{ fontSize: 10 }}>{s.accessResult}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(s.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanSimulator;
