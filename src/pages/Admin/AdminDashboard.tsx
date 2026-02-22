import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import {
  Users, Clock, UserCheck, AlertTriangle, Cpu, ShieldAlert,
  TrendingUp, Eye
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const AdminDashboard: React.FC = () => {
  const { visitors, scanLogs, devices, accessTemplates, emergencyMode, setEmergencyMode, addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayVisitors = visitors.filter(v => v.visitDate === today);
    const weekVisitors = visitors.filter(v => v.visitDate >= weekAgo);
    const pending = visitors.filter(v => v.status === 'pending');
    const active = visitors.filter(v => v.status === 'checked-in');
    const violations = scanLogs.filter(s => s.accessResult === 'denied');
    const offlineDevices = devices.filter(d => d.status === 'offline');
    return { todayVisitors, weekVisitors, pending, active, violations, offlineDevices };
  }, [visitors, scanLogs, devices, today, weekAgo]);

  // Weekly visitor chart data (mock 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const count = visitors.filter(v => v.visitDate === dateStr).length;
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }
    return days;
  }, [visitors]);

  // Visitor status distribution
  const statusData = useMemo(() => {
    const statuses = ['pending', 'approved', 'checked-in', 'checked-out', 'rejected'];
    return statuses.map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: visitors.filter(v => v.status === s).length,
    })).filter(d => d.value > 0);
  }, [visitors]);

  // Template usage
  const templateData = useMemo(() => {
    return accessTemplates.map(t => ({
      name: t.name.length > 15 ? t.name.slice(0, 15) + '…' : t.name,
      count: visitors.filter(v => v.accessTemplateId === t.id).length,
      color: t.color,
    }));
  }, [accessTemplates, visitors]);

  // Heatmap data
  const deviceHeatmap = useMemo(() => {
    return devices.map(d => ({
      ...d,
      scans: scanLogs.filter(s => s.deviceId === d.id).length,
    }));
  }, [devices, scanLogs]);

  const maxScans = Math.max(...deviceHeatmap.map(d => d.scans), 1);
  const getHeatLevel = (scans: number) => Math.min(5, Math.round((scans / maxScans) * 5));

  const handleEmergencyToggle = () => {
    const next = !emergencyMode;
    setEmergencyMode(next);
    addNotification({
      type: next ? 'error' : 'success',
      title: next ? '🚨 Emergency Mode Activated' : '✅ Emergency Mode Deactivated',
      message: next
        ? 'All standard policies overridden. Lockdown in effect.'
        : 'System returned to normal operation.',
    });
  };

  const recentScans = [...scanLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

  const statCards = [
    { label: "Today's Visitors", value: stats.todayVisitors.length, icon: Users, color: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', trend: `${stats.weekVisitors.length} this week` },
    { label: 'Pending Approvals', value: stats.pending.length, icon: Clock, color: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b', trend: 'Needs attention', onClick: () => navigate('/admin/approvals') },
    { label: 'Active On-Premises', value: stats.active.length, icon: UserCheck, color: 'rgba(16,185,129,0.12)', iconColor: '#10b981', trend: 'Currently checked in' },
    { label: 'Access Violations', value: stats.violations.length, icon: ShieldAlert, color: 'rgba(244,63,94,0.12)', iconColor: '#f43f5e', trend: 'Denied events logged', onClick: () => navigate('/admin/audit') },
    { label: 'Devices Online', value: devices.filter(d => d.status === 'active').length, icon: Cpu, color: 'rgba(6,182,212,0.12)', iconColor: '#06b6d4', trend: `${stats.offlineDevices.length} offline`, onClick: () => navigate('/admin/devices') },
    { label: 'Total Visitors', value: visitors.length, icon: TrendingUp, color: 'rgba(139,92,246,0.12)', iconColor: '#8b5cf6', trend: 'All time' },
  ];

  return (
    <div className="section-gap">
      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          className={`btn ${emergencyMode ? 'btn-danger' : 'btn-ghost'}`}
          onClick={handleEmergencyToggle}
          style={emergencyMode ? { animation: 'pulse-emergency 1.5s infinite' } : {}}
        >
          <AlertTriangle size={15} />
          {emergencyMode ? '🔓 Deactivate Emergency' : '🚨 Trigger Emergency'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ cursor: card.onClick ? 'pointer' : 'default' }}
            onClick={card.onClick}
          >
            <div className="stat-card-top">
              <div>
                <div className="stat-label">{card.label}</div>
              </div>
              <div className="stat-icon-wrap" style={{ background: card.color }}>
                <card.icon size={20} color={card.iconColor} />
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-trend">{card.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Weekly Visitor Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Daily Visitor Flow</div>
              <div className="card-subtitle">Last 7 days</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                  cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                />
                <Bar dataKey="count" name="Visitors" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Status Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Visitor Status Distribution</div>
              <div className="card-subtitle">All time breakdown</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                />
                <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Template Usage + Device Heatmap */}
      <div className="grid-2">
        {/* Template Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Access Template Usage</div>
              <div className="card-subtitle">Visitors per template</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={templateData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={110} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" name="Visitors" radius={[0, 4, 4, 0]}>
                  {templateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Scan Heatmap */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Device Usage Heatmap</div>
              <div className="card-subtitle">Scan frequency by device</div>
            </div>
          </div>
          <div className="heatmap-grid">
            {deviceHeatmap.map(dev => {
              const level = getHeatLevel(dev.scans);
              return (
                <div key={dev.id} className={`heatmap-cell heat-${level}`} title={`${dev.name}: ${dev.scans} scans`}>
                  <div className="heatmap-cell-value">{dev.scans}</div>
                  <div className="heatmap-cell-label">{dev.name.split(' ').slice(0, 2).join(' ')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Pending Visitors */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending Approvals</div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/approvals')}>
              <Eye size={13} /> View All
            </button>
          </div>
          {stats.pending.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">✅</div>
              <h3>All caught up!</h3>
            </div>
          ) : (
            <div>
              {stats.pending.slice(0, 5).map(v => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {v.visitorName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.purpose} · {v.visitDate}</div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Scan Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Scan Activity</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/audit')}>
              <Eye size={13} /> View Logs
            </button>
          </div>
          <div className="timeline">
            {recentScans.map(scan => (
              <div key={scan.id} className="timeline-item">
                <div className="timeline-track">
                  <div className="timeline-dot" style={{ background: scan.accessResult === 'granted' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></div>
                  <div className="timeline-line"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    {scan.visitorName}
                    <span className={`badge badge-${scan.accessResult}`} style={{ marginLeft: 8, fontSize: 10 }}>
                      {scan.accessResult}
                    </span>
                  </div>
                  <div className="timeline-desc">{scan.deviceName} · {scan.zoneName}</div>
                  <div className="timeline-time">{new Date(scan.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {recentScans.length === 0 && (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="empty-state-icon">📡</div>
                <p>No scan activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Health */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Device Health Overview</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/devices')}>
            <Cpu size={13} /> Manage Devices
          </button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Zone</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Total Scans</th>
                <th>Last Ping</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(dev => (
                <tr key={dev.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{dev.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.model}</div>
                  </td>
                  <td><span className="chip">{dev.type.replace('-', ' ')}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dev.zoneId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`dot ${dev.status === 'active' ? 'dot-green dot-pulse' : 'dot-red'}`}></span>
                      <span className={`badge badge-${dev.status}`}>{dev.status}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${dev.batteryLevel}%`, height: '100%', background: dev.batteryLevel > 50 ? 'var(--accent-emerald)' : dev.batteryLevel > 20 ? 'var(--accent-amber)' : 'var(--accent-rose)', transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dev.batteryLevel}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{dev.totalScans.toLocaleString()}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(dev.lastPing).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
