import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, UserCheck, Send, ScanLine } from 'lucide-react';

const HostDashboard: React.FC = () => {
  const { visitors, scanLogs, delegationLogs } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const myVisitors = visitors.filter(v => v.hostId === user?.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayVisitors = myVisitors.filter(v => v.visitDate === today);
  const pending = myVisitors.filter(v => v.status === 'pending');
  const active = myVisitors.filter(v => v.status === 'checked-in');
  const delegated = delegationLogs.filter(d => d.delegatedToHostId === user?.id && d.status === 'active');
  const myScans = scanLogs.filter(s => myVisitors.some(v => v.id === s.visitorId));
  const violations = myScans.filter(s => s.accessResult === 'denied');

  const statCards = [
    { label: 'Today\'s Visitors', value: todayVisitors.length, icon: '📅', color: 'rgba(59,130,246,0.12)', vColor: '#3b82f6', route: '/host/approvals' },
    { label: 'Pending Approvals', value: pending.length, icon: '⏳', color: 'rgba(245,158,11,0.12)', vColor: '#f59e0b', route: '/host/approvals' },
    { label: 'Active Meetings', value: active.length, icon: '✅', color: 'rgba(16,185,129,0.12)', vColor: '#10b981', route: '/host/movement' },
    { label: 'Delegated To Me', value: delegated.length, icon: '🔁', color: 'rgba(139,92,246,0.12)', vColor: '#8b5cf6', route: '/host/delegate' },
    { label: 'Access Violations', value: violations.length, icon: '⚠️', color: 'rgba(244,63,94,0.12)', vColor: '#f43f5e', route: '/host/scan' },
    { label: 'Total Visitors', value: myVisitors.length, icon: '👥', color: 'rgba(6,182,212,0.12)', vColor: '#06b6d4', route: '/host/history' },
  ];

  const recentActivity = [...myScans]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="section-gap">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {user?.department}
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.route)}>
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon-wrap" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.vColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header"><div className="card-title">Quick Actions</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: <UserCheck size={20} />, label: 'Approve Visitors', route: '/host/approvals', color: '#3b82f6' },
            { icon: <Send size={20} />, label: 'Invite Visitor', route: '/host/invite', color: '#8b5cf6' },
            { icon: <ScanLine size={20} />, label: 'Scan Simulator', route: '/host/scan', color: '#10b981' },
            { icon: <Users size={20} />, label: 'Visitor History', route: '/host/history', color: '#f59e0b' },
          ].map((action, i) => (
            <button key={i} onClick={() => navigate(action.route)} style={{ padding: '20px 16px', background: action.color + '11', border: `1px solid ${action.color}33`, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s', color: action.color }}>
              {action.icon}
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Today's Visitors */}
        <div className="card">
          <div className="card-header"><div className="card-title">Today's Visitors</div></div>
          {todayVisitors.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📅</div><h3>No visitors today</h3></div>
          ) : todayVisitors.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.company} · {v.visitTime}</div>
              </div>
              <span className={`badge badge-${v.status}`}>{v.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Scan Activity */}
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Access Activity</div></div>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📡</div><h3>No scan activity</h3></div>
          ) : (
            <div className="timeline">
              {recentActivity.map(scan => (
                <div key={scan.id} className="timeline-item">
                  <div className="timeline-track">
                    <div className="timeline-dot" style={{ background: scan.accessResult === 'granted' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></div>
                    <div className="timeline-line"></div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {scan.visitorName}
                      <span className={`badge badge-${scan.accessResult}`} style={{ marginLeft: 6, fontSize: 10 }}>{scan.accessResult}</span>
                    </div>
                    <div className="timeline-desc">{scan.deviceName}</div>
                    <div className="timeline-time">{new Date(scan.timestamp).toLocaleTimeString()}</div>
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

export default HostDashboard;
