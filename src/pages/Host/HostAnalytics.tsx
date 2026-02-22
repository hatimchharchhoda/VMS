import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

const HostAnalytics: React.FC = () => {
  const { visitors, scanLogs, accessTemplates } = useApp();
  const { user } = useAuth();

  const myVisitors = visitors.filter(v => v.hostId === user?.id);
  const myScans = scanLogs.filter(s => myVisitors.some(v => v.id === s.visitorId));

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    myVisitors.forEach(v => {
      const m = new Date(v.visitDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count })).slice(-6);
  }, [myVisitors]);

  const templateData = useMemo(() => {
    return accessTemplates.map(t => ({
      name: t.name,
      value: myVisitors.filter(v => v.accessTemplateId === t.id).length,
      color: t.color,
    })).filter(d => d.value > 0);
  }, [accessTemplates, myVisitors]);

  const statusData = useMemo(() => {
    return ['pending', 'approved', 'checked-in', 'checked-out', 'rejected'].map(s => ({
      name: s,
      value: myVisitors.filter(v => v.status === s).length,
    })).filter(d => d.value > 0);
  }, [myVisitors]);

  const avgDuration = useMemo(() => {
    const completed = myVisitors.filter(v => v.checkInTime && v.checkOutTime);
    if (!completed.length) return '—';
    const total = completed.reduce((sum, v) => {
      return sum + (new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime!).getTime());
    }, 0);
    const avg = Math.floor(total / completed.length / 60000);
    return `${Math.floor(avg / 60)}h ${avg % 60}m`;
  }, [myVisitors]);

  const uniqueCompanies = new Set(myVisitors.map(v => v.company)).size;
  const accessRate = myScans.length > 0 ? Math.round((myScans.filter(s => s.accessResult === 'granted').length / myScans.length) * 100) : 0;

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Analytics</h1>
          <p>Insights about your visitor interactions and patterns</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Visitors Hosted', value: myVisitors.length, icon: '👥', color: 'rgba(59,130,246,0.12)' },
          { label: 'Average Visit Duration', value: avgDuration, icon: '⏱', color: 'rgba(139,92,246,0.12)' },
          { label: 'Unique Companies', value: uniqueCompanies, icon: '🏢', color: 'rgba(16,185,129,0.12)' },
          { label: 'Access Success Rate', value: `${accessRate}%`, icon: '✅', color: 'rgba(245,158,11,0.12)' },
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

      <div className="grid-2">
        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Visitor Count</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              <Bar dataKey="count" name="Visitors" fill="url(#barGrad2)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Template Usage Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">Access Template Used</div></div>
          {templateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={templateData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                  {templateData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}><p>No approved visitors with templates</p></div>
          )}
        </div>
      </div>

      {/* Most Frequent Visitors */}
      <div className="card">
        <div className="card-header"><div className="card-title">Most Recent Visitors</div></div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Visitor</th><th>Company</th><th>Visits</th><th>Last Visit</th><th>Status</th></tr></thead>
            <tbody>
              {myVisitors.slice(0, 8).map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{v.visitorName.charAt(0)}</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.visitorName}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{v.company}</td>
                  <td style={{ fontWeight: 700 }}>{myVisitors.filter(x => x.email === v.email).length}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.visitDate}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostAnalytics;
