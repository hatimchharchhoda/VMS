import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { QrCode, MapPin, FilePlus, AlertTriangle, ChevronRight } from 'lucide-react';

// Journey step tracker
const JOURNEY_STEPS = ['Registered', 'Pending Review', 'Approved', 'Badge Generated', 'Checked In', 'Completed'];

const getJourneyStep = (status: string) => {
  if (!status) return 0;
  if (status === 'pending') return 1;
  if (status === 'approved') return 2;
  if (status === 'approved') return 3;
  if (status === 'checked-in') return 4;
  if (status === 'checked-out') return 5;
  return 0;
};

// Countdown component
const Countdown: React.FC<{ visitDate: string; endTime: string }> = ({ visitDate, endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const target = new Date(`${visitDate}T${endTime}:00`);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visitDate, endTime]);
  return <span className="countdown-timer">{timeLeft}</span>;
};

const VisitorDashboard: React.FC = () => {
  const { myVisits, activeVisit, pendingVisits, upcomingVisits, pastVisits, visitorProfile } = useVisitor();
  const { accessTemplates, zones, emergencyMode } = useApp();
  const navigate = useNavigate();

  const approved = myVisits.filter(v => v.status === 'approved');
  const rejected = myVisits.filter(v => v.status === 'rejected');
  const upcoming = [...upcomingVisits].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  const nextVisit = upcoming[0];

  const activeTemplate = activeVisit ? accessTemplates.find(t => t.id === activeVisit.accessTemplateId) : null;
  const activeZones = activeTemplate ? zones.filter(z => activeTemplate.allowedZones.includes(z.id)) : [];

  const recentActivity = [...myVisits]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const journeyVisit = activeVisit ?? nextVisit ?? (pastVisits[0] ?? null);
  const journeyStep = journeyVisit ? (
    journeyVisit.barcodeId && journeyVisit.status === 'approved' ? 3
    : getJourneyStep(journeyVisit.status)
  ) : 0;

  return (
    <div className="section-gap">
      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="visitor-emergency-hero" onClick={() => navigate('/visitor/emergency')}>
          <AlertTriangle size={22} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>🚨 Emergency Mode Active</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>Click here for evacuation instructions and nearest exits</div>
          </div>
          <ChevronRight size={18} />
        </div>
      )}

      {/* Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Hello, {visitorProfile?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {visitorProfile?.company}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{visitorProfile?.reputationScore ?? 0}<span style={{ fontSize: 12 }}>/100</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Reputation</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: (visitorProfile?.riskScore ?? 0) > 50 ? 'var(--accent-rose)' : '#f59e0b' }}>{visitorProfile?.riskScore ?? 0}<span style={{ fontSize: 12 }}>/100</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Risk Score</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { label: 'Upcoming Visits', value: upcomingVisits.length, icon: '📅', color: 'rgba(59,130,246,0.12)', vColor: '#3b82f6', route: '/visitor/visits' },
          { label: 'Pending Approval', value: pendingVisits.length, icon: '⏳', color: 'rgba(245,158,11,0.12)', vColor: '#f59e0b', route: '/visitor/visits' },
          { label: 'Approved Visits', value: approved.length, icon: '✅', color: 'rgba(16,185,129,0.12)', vColor: '#10b981', route: '/visitor/visits' },
          { label: 'Rejected Visits', value: rejected.length, icon: '❌', color: 'rgba(244,63,94,0.12)', vColor: '#f43f5e', route: '/visitor/visits' },
          { label: 'Inside Now', value: activeVisit ? 1 : 0, icon: '🏢', color: 'rgba(139,92,246,0.12)', vColor: '#8b5cf6', route: '/visitor/checkin' },
          { label: 'Total Visits', value: myVisits.length, icon: '🗓️', color: 'rgba(6,182,212,0.12)', vColor: '#06b6d4', route: '/visitor/history' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.route)}>
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon-wrap" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.vColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active Visit */}
      {activeVisit && (
        <div className="card" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), transparent)' }}>
          <div className="card-header">
            <div className="card-title">🏢 Currently Inside</div>
            <span className="badge badge-checked-in">● Active</span>
          </div>
          <div className="grid-2">
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{activeVisit.purpose}</div>
              <div className="info-row"><span className="info-label">Host</span><span className="info-value">{activeVisit.hostName}</span></div>
              <div className="info-row"><span className="info-label">Check-In</span><span className="info-value">{activeVisit.checkInTime ? new Date(activeVisit.checkInTime).toLocaleTimeString() : '—'}</span></div>
              <div className="info-row"><span className="info-label">Exit Deadline</span><span className="info-value">{activeVisit.endTime}</span></div>
              {activeTemplate && <div className="info-row"><span className="info-label">Template</span><span className="info-value" style={{ color: activeTemplate.color }}>{activeTemplate.icon} {activeTemplate.name}</span></div>}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Time Until Exit</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'monospace', marginBottom: 16 }}>
                <Countdown visitDate={activeVisit.visitDate} endTime={activeVisit.endTime} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Allowed Zones</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeZones.map(z => <span key={z.id} className="chip" style={{ fontSize: 11 }}><MapPin size={10} /> {z.name}</span>)}
                {activeZones.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No zones assigned</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate('/visitor/badge')}><QrCode size={14} /> Show Badge</button>
            <button className="btn btn-ghost" onClick={() => navigate('/visitor/access')}><MapPin size={14} /> View Access</button>
          </div>
        </div>
      )}

      {/* Journey Tracker */}
      {journeyVisit && (
        <div className="card">
          <div className="card-header"><div className="card-title">🗺️ Visit Journey</div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{journeyVisit.purpose}</span></div>
          <div className="journey-tracker">
            {JOURNEY_STEPS.map((step, idx) => (
              <div key={idx} className={`journey-step${idx <= journeyStep ? ' done' : idx === journeyStep + 1 ? ' active' : ''}`}>
                <div className="journey-dot">{idx < journeyStep ? '✓' : idx + 1}</div>
                <div className="journey-label">{step}</div>
                {idx < JOURNEY_STEPS.length - 1 && <div className="journey-line" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Next Visit */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Visits</div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/visitor/register')}><FilePlus size={13} /> New</button>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📅</div><p>No upcoming visits</p></div>
          ) : upcoming.slice(0, 4).map(v => {
            const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
            return (
              <div key={v.id} onClick={() => navigate('/visitor/visits')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <div style={{ fontSize: 28 }}>{tpl?.icon ?? '📋'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.purpose}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.visitDate} · {v.visitTime} — {v.hostName}</div>
                </div>
                <span className={`badge badge-${v.status}`}>{v.status}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Activity</div></div>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📋</div><p>No activity yet</p></div>
          ) : (
            <div className="timeline">
              {recentActivity.map(v => (
                <div key={v.id} className="timeline-item">
                  <div className="timeline-track">
                    <div className="timeline-dot" style={{ background: v.status === 'approved' || v.status === 'checked-in' ? 'var(--accent-emerald)' : v.status === 'pending' ? 'var(--accent-amber)' : 'var(--accent-rose)' }}></div>
                    <div className="timeline-line"></div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {v.purpose}
                      <span className={`badge badge-${v.status}`} style={{ marginLeft: 8, fontSize: 10 }}>{v.status}</span>
                    </div>
                    <div className="timeline-desc">Host: {v.hostName}</div>
                    <div className="timeline-time">{new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
