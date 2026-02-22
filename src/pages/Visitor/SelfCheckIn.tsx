import React, { useState } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { LogIn, LogOut, Check, AlertCircle } from 'lucide-react';

const SelfCheckIn: React.FC = () => {
  const { myVisits, activeVisit, checkIn, checkOut } = useVisitor();
  const { accessTemplates } = useApp();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const checkInEligible = myVisits.filter(v =>
    v.status === 'approved' && v.visitDate === today
  );

  const handleCheckIn = (visitId: string) => {
    setLoading(visitId);
    setTimeout(() => {
      const r = checkIn(visitId);
      setResult(r);
      setLoading('');
      setTimeout(() => setResult(null), 4000);
    }, 800);
  };

  const handleCheckOut = (visitId: string) => {
    setLoading(visitId);
    setTimeout(() => {
      checkOut(visitId);
      setResult({ success: true, message: 'Checked out successfully. Have a great day!' });
      setLoading('');
      setTimeout(() => setResult(null), 4000);
    }, 600);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Self Check-In / Check-Out</h1>
          <p>Use your approved visit to check in or out of the facility</p>
        </div>
      </div>

      {result && (
        <div style={{ background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, color: result.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: 14, fontWeight: 600 }}>
          {result.success ? <Check size={18} /> : <AlertCircle size={18} />}
          {result.message}
        </div>
      )}

      {/* Currently Inside */}
      {activeVisit && (
        <div className="card" style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.04)' }}>
          <div className="card-header">
            <div className="card-title">🏢 You are Currently Inside</div>
            <span className="badge badge-checked-in">● ACTIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{activeVisit.purpose}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Host: {activeVisit.hostName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checked in at: {activeVisit.checkInTime ? new Date(activeVisit.checkInTime).toLocaleTimeString() : '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Expected exit by: {activeVisit.endTime}</div>
            </div>
            <div>
              <button
                className="btn btn-danger btn-lg"
                onClick={() => handleCheckOut(activeVisit.id)}
                disabled={loading === activeVisit.id}
              >
                {loading === activeVisit.id ? <span className="spinner" /> : <LogOut size={16} />}
                Check Out Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eligible for Check-In */}
      <div className="card">
        <div className="card-header"><div className="card-title">📋 Today's Approved Visits</div></div>
        {checkInEligible.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-state-icon">📅</div>
            <h3>No approved visits for today</h3>
            <p>Only visits approved for today appear here. Pre-register a visit to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {checkInEligible.map(v => {
              const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
              const now = new Date().toTimeString().slice(0, 5);
              const isEarlyOrOnTime = now >= v.visitTime || (v.visitTime <= now) || true; // allow check-in anytime for demo
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ fontSize: 32 }}>{tpl?.icon ?? '📋'}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{v.purpose}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.visitTime} — {v.endTime} · Host: {v.hostName}</div>
                      {v.barcodeId && <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{v.barcodeId}</div>}
                    </div>
                  </div>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => handleCheckIn(v.id)}
                    disabled={!!activeVisit || loading === v.id}
                  >
                    {loading === v.id ? <span className="spinner" /> : <LogIn size={16} />}
                    Check In
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="card">
        <div className="card-header"><div className="card-title">ℹ️ How Self Check-In Works</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: '1️⃣', title: 'Get Approved', desc: 'Your visit request must be approved by the host and admin' },
            { icon: '2️⃣', title: 'Come on Time', desc: 'Arrive within your scheduled visit window' },
            { icon: '3️⃣', title: 'Click Check In', desc: 'Tap the "Check In" button to register your arrival' },
            { icon: '4️⃣', title: 'Check Out', desc: 'Before leaving, tap "Check Out" to close your session' },
          ].map((step, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelfCheckIn;
