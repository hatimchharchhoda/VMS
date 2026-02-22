import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Check } from 'lucide-react';

const DelegateVisitor: React.FC = () => {
  const { visitors, setVisitors, delegationLogs, setDelegationLogs, users, addNotification } = useApp();
  const { user } = useAuth();
  const [selectedVisitor, setSelectedVisitor] = useState('');
  const [selectedHost, setSelectedHost] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');

  const myVisitors = visitors.filter(v => v.hostId === user?.id && (v.status === 'pending' || v.status === 'approved'));
  const otherHosts = users.filter(u => u.role === 'host' && u.id !== user?.id);
  const myDelegations = delegationLogs.filter(d => d.originalHostId === user?.id);

  const handleDelegate = () => {
    if (!selectedVisitor || !selectedHost || !reason.trim()) return;
    const visit = visitors.find(v => v.id === selectedVisitor);
    const newHost = users.find(u => u.id === selectedHost);
    if (!visit || !newHost) return;

    setVisitors(visitors.map(v => v.id === selectedVisitor ? { ...v, hostId: selectedHost, hostName: newHost.name } : v));
    const log = {
      id: `del${Date.now()}`,
      visitorId: selectedVisitor,
      visitorName: visit.visitorName,
      originalHostId: user?.id || '',
      originalHostName: user?.name || '',
      delegatedToHostId: selectedHost,
      delegatedToHostName: newHost.name,
      reason,
      status: 'active' as const,
      approvedByAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setDelegationLogs([...delegationLogs, log]);
    addNotification({ type: 'info', title: 'Visitor Delegated', message: `${visit.visitorName} delegated to ${newHost.name}` });
    setSuccess(`${visit.visitorName} delegated to ${newHost.name}`);
    setSelectedVisitor(''); setSelectedHost(''); setReason('');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Delegate Visitor</h1>
          <p>Transfer visitor responsibilities to a colleague</p>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Delegate a Visitor</div></div>
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-emerald)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={14} /> {success}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Visitor *</label>
              <select className="form-select" value={selectedVisitor} onChange={e => setSelectedVisitor(e.target.value)}>
                <option value="">-- My visitors --</option>
                {myVisitors.map(v => <option key={v.id} value={v.id}>{v.visitorName} · {v.visitDate}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Delegate To *</label>
              <select className="form-select" value={selectedHost} onChange={e => setSelectedHost(e.target.value)}>
                <option value="">-- Select colleague --</option>
                {otherHosts.map(h => <option key={h.id} value={h.id}>{h.name} — {h.department}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why are you delegating? e.g., I have an external meeting..." />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleDelegate} disabled={!selectedVisitor || !selectedHost || !reason}>
              <ArrowRight size={14} /> Delegate Visitor
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">My Delegations</div></div>
          {myDelegations.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">🔄</div><h3>No delegations yet</h3></div>
          ) : myDelegations.reverse().map(log => (
            <div key={log.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{log.visitorName}</span>
                <span className={`badge ${log.status === 'active' ? 'badge-checked-in' : 'badge-checked-out'}`}>{log.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>You</span><ArrowRight size={11} /><span style={{ fontWeight: 600 }}>{log.delegatedToHostName}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>"{log.reason}"</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(log.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DelegateVisitor;
