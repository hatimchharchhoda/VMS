import React, { useState, useMemo } from 'react';
import { useVisitor } from '../../context/VisitorContext';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

const VisitHistory: React.FC = () => {
  const { myVisits, visitorProfile } = useVisitor();
  const { accessTemplates, locations } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => myVisits.filter(v => {
    const ms = !search || v.purpose.toLowerCase().includes(search.toLowerCase()) || v.hostName.toLowerCase().includes(search.toLowerCase());
    const mstat = statusFilter === 'all' || v.status === statusFilter;
    return ms && mstat;
  }).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()), [myVisits, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const getDuration = (v: typeof myVisits[0]) => {
    if (v.checkInTime && v.checkOutTime) {
      const diff = new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime();
      const m = Math.floor(diff / 60000);
      return `${Math.floor(m / 60)}h ${m % 60}m`;
    }
    return '—';
  };

  // Summary stats
  const completed = myVisits.filter(v => v.status === 'checked-out');
  const avgMs = completed.length > 0 ? completed.reduce((sum, v) => {
    if (!v.checkInTime || !v.checkOutTime) return sum;
    return sum + (new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime());
  }, 0) / completed.length : 0;
  const avgDur = avgMs ? `${Math.floor(avgMs / 3600000)}h ${Math.floor((avgMs % 3600000) / 60000)}m` : '—';
  const locationFreq = myVisits.reduce((acc, v) => { acc[v.locationId] = (acc[v.locationId] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topLocId = Object.entries(locationFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLoc = locations.find(l => l.id === topLocId);
  const violations = myVisits.reduce((s, v) => s + (v.violations ?? 0), 0);

  return (
    <div className="section-gap">
      <div className="page-header">
        <div className="page-header-left"><h1>Visit History</h1><p>All your past and present visits</p></div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Visits', value: myVisits.length, icon: '🗓️', color: 'rgba(59,130,246,0.12)', vColor: '#3b82f6' },
          { label: 'Completed', value: completed.length, icon: '✅', color: 'rgba(16,185,129,0.12)', vColor: '#10b981' },
          { label: 'Avg Duration', value: avgDur, icon: '⏱️', color: 'rgba(139,92,246,0.12)', vColor: '#8b5cf6' },
          { label: 'Most Visited', value: topLoc?.name ?? '—', icon: '📍', color: 'rgba(245,158,11,0.12)', vColor: '#f59e0b' },
          { label: 'Violations', value: violations, icon: '⚠️', color: 'rgba(244,63,94,0.12)', vColor: '#f43f5e' },
          { label: 'Reputation', value: `${visitorProfile?.reputationScore ?? 0}/100`, icon: '🏆', color: 'rgba(16,185,129,0.12)', vColor: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon-wrap" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.vColor, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search purpose, host…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="toolbar-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} records</div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Purpose</th><th>Host</th><th>Date & Time</th><th>Duration</th><th>Template</th><th>Violations</th><th>Status</th></tr></thead>
            <tbody>
              {paged.map(v => {
                const tpl = accessTemplates.find(t => t.id === v.accessTemplateId);
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.purpose}</div>
                      {v.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{v.notes.slice(0, 40)}…</div>}
                    </td>
                    <td style={{ fontSize: 12 }}>{v.hostName}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{v.visitDate}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.visitTime}–{v.endTime}</div>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{getDuration(v)}</td>
                    <td>{tpl ? <span className="chip" style={{ background: tpl.color + '22', color: tpl.color }}>{tpl.icon} {tpl.name}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}</td>
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 700, color: (v.violations ?? 0) > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>{v.violations ?? 0}</span>
                    </td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  </tr>
                );
              })}
              {paged.length === 0 && <tr><td colSpan={7}><div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">📋</div><h3>No records match</h3></div></td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitHistory;
