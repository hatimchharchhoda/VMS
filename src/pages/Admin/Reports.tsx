import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const Reports: React.FC = () => {
  const { visitors, scanLogs, accessTemplates, users, devices } = useApp();
  const [activeTab, setActiveTab] = useState<'daily' | 'violations' | 'host' | 'template' | 'movement'>('daily');

  const today = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter(v => v.visitDate === today);

  // Daily Visit Chart (last 14 days)
  const dailyChartData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const count = visitors.filter(v => v.visitDate === dateStr).length;
      const violations = scanLogs.filter(s => s.timestamp.startsWith(dateStr) && s.accessResult === 'denied').length;
      days.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count, violations });
    }
    return days;
  }, [visitors, scanLogs]);

  // Host-wise summary
  const hostData = useMemo(() => {
    const hosts = users.filter(u => u.role === 'host');
    return hosts.map(h => ({
      name: h.name,
      count: visitors.filter(v => v.hostId === h.id).length,
      approved: visitors.filter(v => v.hostId === h.id && v.status === 'approved').length,
    }));
  }, [users, visitors]);

  // Template usage
  const templateData = useMemo(() => {
    return accessTemplates.map(t => ({
      name: t.name,
      value: visitors.filter(v => v.accessTemplateId === t.id).length,
      color: t.color,
    }));
  }, [accessTemplates, visitors]);

  // Violations
  const violations = scanLogs.filter(s => s.accessResult === 'denied');
  const violationByDevice = useMemo(() => {
    const map: Record<string, number> = {};
    scanLogs.filter(s => s.accessResult === 'denied').forEach(s => {
      map[s.deviceName] = (map[s.deviceName] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [scanLogs]);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports & Analytics</h1>
          <p>Comprehensive visitor and access analytics</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={() => exportCSV(visitors.map(v => ({ ID: v.id, Name: v.visitorName, Company: v.company, Status: v.status, Date: v.visitDate, Host: v.hostName })), 'visitors_report')}>
            <Download size={14} /> Export All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        {[
          { label: "Today's Visits", value: todayVisitors.length, icon: '📅', color: 'rgba(59,130,246,0.12)' },
          { label: 'Total Visits (All Time)', value: visitors.length, icon: '📊', color: 'rgba(139,92,246,0.12)' },
          { label: 'Access Violations', value: violations.length, icon: '⚠️', color: 'rgba(244,63,94,0.12)' },
          { label: 'Approval Rate', value: `${visitors.length > 0 ? Math.round((visitors.filter(v => v.status !== 'rejected').length / visitors.length) * 100) : 0}%`, icon: '✅', color: 'rgba(16,185,129,0.12)' },
          { label: 'Active Devices', value: devices.filter(d => d.status === 'active').length, icon: '📡', color: 'rgba(6,182,212,0.12)' },
          { label: 'Unique Companies', value: new Set(visitors.map(v => v.company)).size, icon: '🏢', color: 'rgba(245,158,11,0.12)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon-wrap" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="tabs">
        {([['daily', '📅 Daily Report'], ['violations', '⚠️ Violations'], ['host', '👥 Host Summary'], ['template', '🎫 Template Usage'], ['movement', '🚶 Movement']] as const).map(([key, label]) => (
          <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      {/* Daily Report */}
      {activeTab === 'daily' && (
        <div className="section-gap">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Visitor Flow — Last 14 Days</div>
              <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(dailyChartData, 'daily_visitor_report')}><Download size={12} /> CSV</button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Visitors" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                <Line type="monotone" dataKey="violations" name="Violations" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <div className="card-title">Today's Visitor Log</div>
              <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(todayVisitors.map(v => ({ Name: v.visitorName, Company: v.company, Host: v.hostName, Status: v.status, Time: v.visitTime })), 'todays_visits')}><Download size={12} /> CSV</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Visitor</th><th>Company</th><th>Host</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {todayVisitors.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.visitorName}</td>
                      <td>{v.company}</td>
                      <td>{v.hostName}</td>
                      <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                      <td style={{ fontSize: 12 }}>{v.visitTime}</td>
                    </tr>
                  ))}
                  {!todayVisitors.length && <tr><td colSpan={5}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📅</div><h3>No visits today</h3></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Violations */}
      {activeTab === 'violations' && (
        <div className="section-gap">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Violations by Device</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={violationByDevice} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="count" name="Violations" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <div className="card-title">All Access Violations</div>
              <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(violations as unknown as Record<string, unknown>[], 'violations')}><Download size={12} /> CSV</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Visitor</th><th>Device</th><th>Zone</th><th>Reason</th><th>Time</th></tr></thead>
                <tbody>
                  {violations.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.visitorName}</td>
                      <td>{s.deviceName}</td>
                      <td>{s.zoneName}</td>
                      <td style={{ fontSize: 12, color: 'var(--accent-rose)' }}>{s.reason}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!violations.length && <tr><td colSpan={5}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">✅</div><h3>No violations!</h3></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Host Summary */}
      {activeTab === 'host' && (
        <div className="section-gap">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Host-wise Visitor Count</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hostData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="count" name="Total Visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Template Usage */}
      {activeTab === 'template' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Template Usage Distribution</div>
          </div>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            <ResponsiveContainer width={300} height={280}>
              <PieChart>
                <Pie data={templateData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" paddingAngle={3}>
                  {templateData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templateData.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color, flexShrink: 0 }}></div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{t.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Movement History */}
      {activeTab === 'movement' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '18px 20px 0' }}>
            <div className="card-title">Visitor Movement History</div>
            <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(scanLogs as unknown as Record<string, unknown>[], 'movement_logs')}><Download size={12} /> CSV</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Visitor</th><th>Device</th><th>Zone</th><th>Result</th><th>Reason</th><th>Timestamp</th></tr></thead>
              <tbody>
                {[...scanLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.visitorName}</td>
                    <td>{s.deviceName}</td>
                    <td>{s.zoneName}</td>
                    <td><span className={`badge badge-${s.accessResult}`}>{s.accessResult}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.reason}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
