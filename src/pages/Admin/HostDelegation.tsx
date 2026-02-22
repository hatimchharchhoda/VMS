import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserMinus, ArrowRight, Check } from 'lucide-react';
import type { Visitor } from '../../types';

const HostDelegation: React.FC = () => {
  const { visitors, setVisitors, delegationLogs, setDelegationLogs, users, addNotification } = useApp();
  const { user } = useAuth();
  const [selectedVisitor, setSelectedVisitor] = useState('');
  const [selectedHost, setSelectedHost] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');

  const approvedVisitors = visitors.filter(v => v.status === 'approved' || v.status === 'pending');
  const hosts = users.filter(u => u.role === 'host');

  const handleDelegate = () => {
    if (!selectedVisitor || !selectedHost || !reason) return;
    const visit = visitors.find(v => v.id === selectedVisitor);
    const newHost = users.find(u => u.id === selectedHost);
    if (!visit || !newHost) return;

    setVisitors(visitors.map(v => v.id === selectedVisitor ? { ...v, hostId: selectedHost, hostName: newHost.name } : v));

    const log = {
      id: `del${Date.now()}`,
      visitorId: selectedVisitor,
      visitorName: visit.visitorName,
      originalHostId: visit.hostId,
      originalHostName: visit.hostName,
      delegatedToHostId: selectedHost,
      delegatedToHostName: newHost.name,
      reason,
      status: 'active' as const,
      approvedByAdmin: true,
      createdAt: new Date().toISOString(),
    };
    setDelegationLogs([...delegationLogs, log]);
    addNotification({ type: 'info', title: 'Visitor Delegated', message: `${visit.visitorName} delegated from ${visit.hostName} to ${newHost.name}` });
    setSelectedVisitor('');
    setSelectedHost('');
    setReason('');
    setSuccess(`${visit.visitorName} successfully delegated to ${newHost.name}`);
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Host Delegation Control</h1>
          <p>Transfer visitor handling responsibility between hosts</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Delegation Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Delegate Visitor</div>
          </div>
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-emerald)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={14} /> {success}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Visitor *</label>
              <select className="form-select" value={selectedVisitor} onChange={e => setSelectedVisitor(e.target.value)}>
                <option value="">-- Select Visitor --</option>
                {approvedVisitors.map(v => (
                  <option key={v.id} value={v.id}>{v.visitorName} ({v.visitDate}) — {v.hostName}</option>
                ))}
              </select>
            </div>
            {selectedVisitor && (
              <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {(() => {
                  const v = visitors.find(x => x.id === selectedVisitor);
                  return v ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{v.visitorName.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently with {v.hostName} · {v.visitDate}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Delegate To *</label>
              <select className="form-select" value={selectedHost} onChange={e => setSelectedHost(e.target.value)}>
                <option value="">-- Select New Host --</option>
                {hosts.map(h => <option key={h.id} value={h.id}>{h.name} — {h.department}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Original host in external meeting..." />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleDelegate} disabled={!selectedVisitor || !selectedHost || !reason}>
              <ArrowRight size={14} /> Delegate Visitor
            </button>
          </div>
        </div>

        {/* Delegation Logs */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Delegation History</div>
          </div>
          {delegationLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><UserMinus size={40} opacity={0.3} /></div>
              <h3>No delegations yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...delegationLogs].reverse().map(log => (
                <div key={log.id} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{log.visitorName}</span>
                    <span className={`badge ${log.status === 'active' ? 'badge-approved' : 'badge-checked-out'}`}>{log.status}</span>
                    {log.approvedByAdmin && <span className="badge badge-approved" style={{ fontSize: 9 }}>Admin Approved</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>{log.originalHostName}</span>
                    <ArrowRight size={12} />
                    <span style={{ fontWeight: 600, color: 'var(--accent-blue-light)' }}>{log.delegatedToHostName}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>"{log.reason}"</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDelegation;
